/* eslint-disable no-nested-ternary */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Loading3QuartersOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button, Card, Col, Row, Spin, Typography,
} from 'antd';
import Container from 'components/Layout/Container';
import MobileFilterComponent from 'components/StaticPages/Common/MobileFilter/MobileFilterComponent';
import UnverifiedEmailNotification from 'components/UnverifiedEmailNotification/UnverifiedEmailNotification';
import AppConstants from 'constants/constants';
import snackBar from 'components/Notifications';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import router from 'routes';
import { ApplicationDataInterface, getApplicationData, getFilterSpecificApplicaticationData } from 'screens/authenticated/ApplicationsTab/Common/ApplicationTabUtils';
import MAddonExhaustedModal from 'screens/authenticated/ApplicationsTab/Mobile/MAddonExhausted';
import MobileApplicationCard from 'screens/authenticated/ApplicationsTab/Mobile/mobileApplicationCard';
import { unlockContactAPI } from 'service/application-card-service';
import { pushClevertapEvent } from 'utils/clevertap';
import { ContextType } from 'screens/authenticated/ApplicationsTab/Common/Candidates.type';

require('screens/authenticated/ApplicationsTab/Mobile/applicationsTabMobile.less');

const EmptyApplicationCard = dynamic(() => import('screens/authenticated/ApplicationsTab/Common/ApplicationCard/emptyApplicationCard'), { ssr: false });
const EmptyMessage = dynamic(() => import('screens/authenticated/ApplicationsTab/Common/ApplicationCard/emptyMessage'), { ssr: false });
const QuickFilters = dynamic(() => import('components/Candidates/QuickFilters'), { ssr: false });

const { Text } = Typography;

interface StateInterface {
  applicationData: Array<ApplicationDataInterface>;
  totalApplications: number;
  loading: boolean,
  offset: number,
  isEmpty?: boolean,
}
interface PropsI {
  selectedTab: string;
  context: ContextType;
  orgName: string;
}

const ApplicationsMobileScreen = (props:PropsI): JSX.Element => {
  const { selectedTab, context, orgName } = props;

  const { contactUnlocksLeft, totalContactUnlocks } = context;

  const [state, setState] = useState<StateInterface>({
    applicationData: [],
    totalApplications: 0,
    loading: false,
    offset: 0,
    isEmpty: false,
  });

  const [mainLoader, setmainLoader] = useState(true);
  const [jobId, setJobId] = useState() as any;
  const [filter, setFilter] = useState() as any;
  const [enableModal, setEnableModal] = useState(false);

  const getMoreApplicationData = async (): Promise<void> => {
    if (!state.loading && selectedTab === 'applications'
    && state.applicationData.length < state.totalApplications) {
      // Only if more applications exits we will make an api call
      setState((prevState) => ({
        ...prevState,
        loading: true,
      }));

      const data = (filter || jobId)
        ? await getFilterSpecificApplicaticationData(state.offset + 10, 10, filter, jobId, 'recent_slots')
        : await getApplicationData(state.offset + 10, 10, 'recent_slots');

      if (data.applicationData.length) {
        const newApplicationData = [...state.applicationData, ...data.applicationData];

        setState((prevState) => ({
          ...prevState,
          applicationData: newApplicationData,
          totalApplications: data.applicationsCount,
          loading: false,
          offset: prevState.offset + 10,
        }));
      } else {
        setState((prevState) => ({
          ...prevState,
          loading: false,
          offset: 0,
        }));
      }
    }
  };

  const setApplicationData = async (): Promise<void> => {
    if (filter || jobId) {
      const data = await getFilterSpecificApplicaticationData(0, 10, filter, jobId, 'recent_slots');
      if (data.applicationData) {
        setState((prevState) => ({
          ...prevState,
          applicationData: data.applicationData,
          totalApplications: data.applicationsCount,
          isEmpty: data.applicationsCount === 0,
        }));
      } else {
        setState((prevState) => ({
          ...prevState,
          isEmpty: true,
        }));
      }
      setmainLoader(false);
    } else {
      const data = await getApplicationData(state.offset, 10, 'recent_slots');
      if (data.applicationData) {
        setState((prevState) => ({
          ...prevState,
          applicationData: data.applicationData,
          totalApplications: data.applicationsCount,
          isEmpty: false,
        }));
        setmainLoader(false);
      }
    }
  };

  const handleChange = (data):void => {
    if (data && data.length > 0) { setJobId(data); } else setJobId(undefined);
  };

  const showSnackbar = (description:string,
    iconName:string, notificationType: string) :void => {
    snackBar({
      title: '',
      description,
      iconName,
      notificationType,
      placement: 'bottomRight',
      duration: 5,
    });
  };

  const handleFilter = (data):void => {
    if (data && data.length > 0) { setFilter(data); } else setFilter(undefined);
  };

  const updateUnlockContactHandler = async (id): Promise<void> => {
    if (context.contactUnlocksLeft > 0) {
      const apiRespone = await unlockContactAPI(id);
      const response = await apiRespone.data;
      if ([200, 201, 202].includes(apiRespone.status)) {
        const currentCandidate = state.applicationData.find((app) => app.applicationId === id);
        if (currentCandidate && currentCandidate.applicationCreatedDate) {
          const appCreatedDate = dayjs(currentCandidate.applicationCreatedDate);
          const currentDate = dayjs(new Date());
          const dateTillFree = appCreatedDate.add(24, 'h');
          const diff = dayjs(dateTillFree).diff(currentDate, 'm');
          const diffh = dayjs(dateTillFree).diff(currentDate, 'h');
          if (!(diffh <= 24 && diff > 0)) {
            context.setcontactUnlocksLeft(
              context.contactUnlocksLeft - 1,
            );
          }
        }

        setState((prevState) => ({
          ...prevState,
          applicationData: [...prevState.applicationData].map((app) => {
            if (app.applicationId === id) {
              return {
                ...app,
                candidateContactUnblocked: true,
                candidateMobileNo: response?.unlocked_user?.mobile,
                candidateEmail: response?.unlocked_user?.email,
              };
            }
            return app;
          }),
        }));
        showSnackbar('Contact Unlocked', 'congratsIcon.svg', 'info');
      } else if (apiRespone.response.status === 400 && apiRespone.response.data.type === 'UnlockContactLimitReachedError') {
        setEnableModal(true);
      }
    } else {
      setEnableModal(true);
    }
  };

  useEffect(() => {
    if (selectedTab === 'applications') {
      setApplicationData();
    }
  }, [jobId, filter, selectedTab]);

  return (
    <>
      {/* SEO Stuff Start */}
      <Head>
        <title>
          {`Applications | ${AppConstants.APP_NAME}`}
        </title>
        <meta
          name="description"
          content={`Applications | ${AppConstants.APP_NAME}`}
          key="description"
        />
      </Head>
      {/* SEO Stuff Ends */}
      <Container>
        <UnverifiedEmailNotification />
        <MobileFilterComponent
          filter={filter}
          callback={handleChange}
          callbackfilter={handleFilter}
          count={state.totalApplications ? state.totalApplications : 0}
          context={context}
          orgName={orgName}
        />
        <QuickFilters filter={filter} callbackfilter={handleFilter} selectedTab={selectedTab} />
        <Row className="at-mobile-background-charcoal-3">
          <Col xs={{ span: 24 }} className="at-mobile-total-applications">
            {`${state.totalApplications} Applications`}
          </Col>
        </Row>
        <Row className="at-mobile-background-charcoal-3">
          <Col xs={{ span: 24 }}>
            {mainLoader ? (
              <Col className="m-main-spinner">
                <Spin />
              </Col>
            )
              : state.totalApplications > 0 ? (
                <MobileApplicationCard
                  applications={state.applicationData}
                  getMoreApplicationData={getMoreApplicationData}
                  setApplicationData={setState}
                  selectedTab={selectedTab}
                  // eslint-disable-next-line @typescript-eslint/no-empty-function
                  updateDismissedCandidate={(): void => {}}
                  updateUnlockContact={updateUnlockContactHandler}
                  orgName={orgName}
                />
              ) : state.isEmpty ? <EmptyApplicationCard />
                : <EmptyMessage selectedTab={selectedTab} />}

            {/* Loading State */}
            {state.loading
              ? <Spin className="at-mobile-spinner" indicator={<Loading3QuartersOutlined style={{ fontSize: '2rem' }} spin />} />
              : null}
          </Col>
        </Row>
        <Row>
          <Card className="m-app-account-summary">
            <Row gutter={8} align="middle">
              <Col span={18}>
                <Row>
                  <Col span={6}>
                    <Text className="ftext-small">
                      {totalContactUnlocks - contactUnlocksLeft}
                      /
                    </Text>
                    <Text className="text-small text-disabled">
                      {totalContactUnlocks}
                    </Text>
                  </Col>
                  <Col span={18}>
                    <Text className="font-bold font-size-14">Application Unlocks Used</Text>
                  </Col>
                </Row>
              </Col>
              <Col span={6}>
                <Button
                  type="primary"
                  shape="round"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={(): void => {
                    pushClevertapEvent('Special click', {
                      Type: 'Add contact unlocks',
                      Source: 'Account Summary',
                    });
                    router.Router.pushRoute('PricingPlans');
                  }}
                >
                  ADD
                </Button>
              </Col>
            </Row>
          </Card>
        </Row>
        {
          enableModal ? (
            <MAddonExhaustedModal
              visible
              title="Application Unlocks Exhausted"
              handleCancel={():void => { setEnableModal(false); }}
            />
          ) : null
        }
      </Container>
    </>
  );
};

export default ApplicationsMobileScreen;
