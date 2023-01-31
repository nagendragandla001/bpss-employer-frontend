/* eslint-disable no-underscore-dangle */
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import {
  Drawer, Typography,
} from 'antd';
import React, { useEffect, useState } from 'react';
import router from 'routes';
import { PricingPlanType } from 'screens/authenticated/jobPostingStep4/commonTypes';
import { getPassbookDetails, transactionDetails } from 'screens/authenticated/Settings/Common/settingsPageUtils';
import { getOrgDetails, getOrgPricingStats } from 'service/organization-service';
import MobileMyPlanHelper from 'screens/authenticated/Passbook/mobile/mobileMyPlansHelper';

require('screens/authenticated/Passbook/mobile/mobileMyPlan.less');

const { Text } = Typography;

export interface MyPlanType {
  orgId: string;
  plans: Array<PricingPlanType>;
  dataLoading: boolean,
  transactions:Array<transactionDetails>;
  totalTransactions: number;
  showPlans: boolean;
  showTransactions: boolean;
  offset: number;
}
interface PropsType {
  visible: boolean;
}

const MobileMyPlan = (props: PropsType): JSX.Element => {
  const { visible } = props;
  const [showDrawer, setShowDrawer] = useState(visible || false);
  const [requestInProgress, setRequestInProgress] = useState(false);

  const [state, setState] = useState<MyPlanType>({
    orgId: '',
    plans: [],
    dataLoading: false,
    transactions: [],
    totalTransactions: 0,
    showPlans: true,
    showTransactions: false,
    offset: 0,
  });

  const initData = async ():Promise<void> => {
    const apiCall = await getOrgDetails();
    if (apiCall && [200, 201, 202].indexOf(apiCall.status) !== -1) {
      const response = await apiCall.data;
      if (response && response.objects
        && Array.isArray(response.objects) && response.objects.length
        && response.objects[0]._id) {
        const pricingApiCall = await getOrgPricingStats(response.objects[0]._id);
        const pricingApiResponse = await pricingApiCall.data;
        const passbookData = await getPassbookDetails(response.objects[0]._id, 20, 0);

        setState((prevState) => ({
          ...prevState,
          plans: pricingApiResponse.pricing_stats.plan_wise_pricing_stats,
          transactions: passbookData.transactions,
          orgId: response.objects[0]._id,
          totalTransactions: passbookData.noOfTransactions,
        }));
      }
    }
    setState((prevState) => ({
      ...prevState,
      dataLoading: false,
    }));
  };

  const getMoreData = async ():Promise<void> => {
    if (requestInProgress || (state.totalTransactions <= state.transactions.length)) return;
    setRequestInProgress(true);
    const passbookData = await getPassbookDetails(state.orgId, 20, state.offset + 20);
    if (passbookData && passbookData.transactions
      && passbookData.transactions.length) {
      const newPassbookDetails = [...state.transactions, ...passbookData.transactions];
      setState((prevState) => ({
        ...prevState,
        dataLoading: false,
        passbookDetails: newPassbookDetails,
        offset: prevState.offset + 20,
      }));
    }
    setRequestInProgress(false);
  };

  useEffect(() => {
    initData();
  }, []);

  return (
    <Drawer
      title={<Text className="myplan-modal-title">My Plan</Text>}
      visible={showDrawer}
      placement="bottom"
      onClose={():void => {
        router.Router.pushRoute('MyJobs');
        setShowDrawer(false);
      }}
      destroyOnClose
      closeIcon={<CloseOutlined style={{ color: '#284e52', fontSize: '1.5rem' }} />}
      className="myplan-drawer-container padding-all-0"
      maskStyle={{ background: 'rgb(0, 47, 52,0.8)' }}
      footer={null}
      height="100%"
    >
      <MobileMyPlanHelper
        plans={state.plans}
        transactions={state.transactions}
        dataLoading={state.dataLoading}
        getMoreData={getMoreData}
      />
    </Drawer>
  );
};

export default MobileMyPlan;
