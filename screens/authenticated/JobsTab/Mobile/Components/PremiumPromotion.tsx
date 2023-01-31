import React from 'react';
import router from 'routes';
import { Col, Row, Button } from 'antd';
import { pushClevertapEvent } from 'utils/clevertap';
import CustomImage from 'components/Wrappers/CustomImage';
import { upgradeJob } from 'service/job-service';
import { IJobsTabDispatch } from '../../Common/JobsTabUtils';

type PropsType = {
  id: string;
  plan:string;
  remainingJPCredits:number;
  remainingFreeCredits:number;
  refresh:any;
  // setRefresh:any;
  dispatch: (data: IJobsTabDispatch) =>void;
  planId:any;
}

const PremiumPromotion = ({
  id, plan, remainingFreeCredits, remainingJPCredits, refresh, dispatch, planId,
}: PropsType): JSX.Element => {
  const handleRequestForRenewal = async (): Promise<void> => {
    pushClevertapEvent('General Click', { Type: 'Upgrade', value: 'Job card' });
    if (plan === 'FR') {
      if (remainingJPCredits) {
        if (remainingFreeCredits) {
          const planIdN = planId;
          const featureApiCall = await upgradeJob({ job_ids: [id], plan_id: planIdN });
          if ([200, 201, 202].includes(featureApiCall.status)) {
            // setTimeout(() => {
            // setRefresh(!refresh);
            dispatch({
              type: 'UPDATEJOBSTABSTATE',
              payload: {
                refresh: !refresh,
              },
            });
            // }, 800);
          }
        } else {
          router.Router.pushRoute('PricingPlans');
        }
      } else {
        router.Router.pushRoute('PricingPlans');
      }
    }
  };

  return (
    <Col span={24}>
      <Row className="m-jt-upgrade-banner" align="middle">
        <Col span={3}><CustomImage src="/images/jobs-tab/upgrade-banner-icon.svg" width={40} height={40} alt="Upgrade" /></Col>
        <Col span={13} style={{ margin: 'auto 0' }}>
          <span className="banner-label">Want 3x more applications? </span>
        </Col>
        <Col span={5}>
          <Button
            size="small"
            className="banner-button flex-all-center"
            onClick={handleRequestForRenewal}
          >
            <CustomImage
              src="/images/jobs-tab/trending-up-icon.svg"
              alt="upgrade banner icon"
              className="m-feature-job-trend"
              width={17}
              height={10}
            />
            <div>Promote this job</div>

          </Button>
        </Col>
      </Row>
    </Col>
  );
};

export default PremiumPromotion;
