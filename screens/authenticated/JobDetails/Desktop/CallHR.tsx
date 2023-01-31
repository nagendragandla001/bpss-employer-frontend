import { ExclamationCircleFilled, PhoneFilled } from '@ant-design/icons';
import {
  Button,
  Card, Col, FormInstance, Row, Space, Switch, Tooltip, Typography,
} from 'antd';
import { IJobPost } from 'common/jobpost.interface';
import POCReviewModal from 'components/JobDetails/PocReviewModal';
import CustomImage from 'components/Wrappers/CustomImage';
import { UserDetailsType } from 'lib/authenticationHOC';
import React, { useEffect, useState } from 'react';
import { getLoggedInUser } from 'service/accounts-settings-service';
import { getPOCManagers } from 'service/organization-service';

const { Text } = Typography;

interface IWhatsappSubscribed {
  state: boolean;
  loading: boolean;
}
interface CallHRProps {
  userDetails: UserDetailsType | null;
  job: IJobPost;
  name: string;
  mobile: string;
  enabled: boolean;
  updateCallHRHandler: (data) => void;
  whatsappSubscribed: IWhatsappSubscribed;
  updatedCallHRWhatsappStatus: (data: boolean) => void;
  updatePOCHandler: (data) => void;
  form: FormInstance
}

interface IManagerList{
  managerId: string;
  name: string;
  mobile: string;
}

const CallHR = (props: CallHRProps): JSX.Element => {
  const {
    userDetails,
    name,
    mobile,
    enabled, updateCallHRHandler, whatsappSubscribed, updatedCallHRWhatsappStatus, updatePOCHandler,
    job, form,
  } = props;
  const [state, setState] = useState({
    visible: false,
    editButtonVisible: false,
  });
  const [managers, setManagers] = useState<Array<IManagerList>>([]);
  const [loggedInManagerType, setLoggedInManagerType] = useState('');
  const [userId, setUserId] = useState(userDetails?.userId);

  const updateVisbleHandler = (): void => {
    setState((prev) => ({
      ...prev,
      visible: false,
    }));
  };

  const pocSubmitHandler = (formData): void => {
    if (formData?.POCDetails !== job?.pointOfContacts?.managerId) {
      updatePOCHandler(formData);
    }
    updateVisbleHandler();
  };

  const getManagers = async (orgId: string) : Promise<void> => {
    if (orgId) {
      const response = await getPOCManagers(orgId);
      if ([200, 201, 202].includes(response.status)) {
        const managerList = response?.data?.map((manager) => {
          if (manager?.user_id === userId) {
            setLoggedInManagerType(manager?.type);
          }
          return {
            name: `${manager?.user?.first_name} ${manager?.user?.last_name}`,
            mobile: manager?.user?.mobile,
            managerId: manager?.id,
          };
        });
        setManagers(managerList);
      }
    }
  };

  const setUpCallHRDetails = async ():Promise<void> => {
    if (!userId) {
      const userResponse = await getLoggedInUser();
      setUserId(userResponse?.data?.objects?.[0].id);
    }
    if (job) {
      await getManagers(job?.orgId);
    }
  };

  useEffect(() => {
    setUpCallHRDetails();
  }, [job, userId]);

  return (
    <Card
      className="jd-side-layout-card"
    >
      {enabled ? (
        <Row gutter={[0, 8]}>
          <Col span={24}>
            <Space align="center">
              <Row align="middle" justify="center" gutter={[0, 16]}>
                <Col span={22}>
                  <Space align="center">
                    <Text className="text-medium text-bold">
                      Call HR Enabled
                    </Text>
                    <CustomImage
                      src="/images/job-details/jd-callhr-tick.svg"
                      width={24}
                      height={24}
                      alt="call-hr"
                    />
                  </Space>
                  <Row>
                    <Col span={22}>
                      <Row>
                        <Col span={24}>
                          <Text className="sub-title">{`${name} ${mobile ? `(${mobile})` : ''}`}</Text>
                        </Col>
                        <Col span={24}>
                          <Text className="sub-title">Jobseekers can call you directly</Text>
                        </Col>
                      </Row>
                    </Col>
                    <Col span={2}>
                      <Button
                        type="link"
                        icon={<CustomImage src="/images/job-details/jd-edit.svg" width={18} height={18} alt="edit" />}
                        onClick={
                          ():void => setState((prevState) => ({ ...prevState, visible: true }))
                        }
                        className="ct-edit-btn"
                      />
                    </Col>

                  </Row>
                </Col>

                <Col span={24}>

                  <Button
                    type="primary"
                    className="br-4"
                    style={{ width: '100%' }}
                    onClick={():void => {
                      updateCallHRHandler(false);
                    }}
                  >
                    <Text style={{ color: 'white' }}>
                      <PhoneFilled rotate={90} />
                      &nbsp;
                      Turn off Call HR on this job
                    </Text>
                  </Button>
                </Col>
                <Col span={24}>
                  <Row justify="space-around">
                    <Col>
                      <Text className="text-small">
                        Allow candidates to send message on Whatsapp
                        {' '}
                        <Tooltip title="After selecting this option, candidates
                          will be able to connect to you via
                          Whatsapp"
                        >
                          <ExclamationCircleFilled style={{ color: '#FF9518' }} />
                        </Tooltip>
                      </Text>
                    </Col>
                    <Col>
                      <Switch
                        size="small"
                        checked={whatsappSubscribed.state}
                        onChange={updatedCallHRWhatsappStatus}
                        loading={whatsappSubscribed.loading}
                      />
                    </Col>
                  </Row>

                </Col>
              </Row>

            </Space>
          </Col>

        </Row>
      ) : (
        <Row justify="center" gutter={[0, 8]}>
          <Col span={24}>
            <Row>
              <Col span={4}>
                <CustomImage
                  src="/images/job-details/jd-call-hr.svg"
                  width={48}
                  height={48}
                  alt="call-hr"
                />
              </Col>
              <Col span={20}>
                <Row>
                  <Col span={24}>
                    <Text strong className="text-medium">Enable Call HR</Text>
                  </Col>
                  <Col span={24}>
                    <Text type="secondary">
                      Get direct calls from jobseekers
                    </Text>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <Button
              type="primary"
              className="br-4"
              style={{ width: '100%' }}
              onClick={():void => {
                if (!job?.pointOfContacts?.id) {
                  setState((prevState) => ({
                    ...prevState,
                    visible: true,
                  }));
                } else {
                  updateCallHRHandler(true);
                }
              }}
            >
              <Text style={{ color: 'white' }}>
                <PhoneFilled rotate={90} />
                &nbsp;
                Enable Call HR on this job
              </Text>
            </Button>
          </Col>

        </Row>
      )}
      {
        state.visible && (
          <POCReviewModal
            isPrimaryManager={loggedInManagerType === 'P'}
            visible={state.visible}
            form={form}
            job={job}
            onClose={updateVisbleHandler}
            onSubmitForm={pocSubmitHandler}
            managersList={managers}
          />
        )
      }

    </Card>
  );
};

export default CallHR;
