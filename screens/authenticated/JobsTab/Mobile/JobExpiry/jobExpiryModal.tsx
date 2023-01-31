import {
  Button, Col, Modal, Row, Typography,
} from 'antd';
import React, { useState } from 'react';
import { renewJob, upgradeJob } from 'service/job-service';
import router from 'routes';
import CustomImage from 'components/Wrappers/CustomImage';
import { getOrgPricingStats } from 'service/organization-service';
import { getPausedDate } from '../../Common/JobsTabUtils';

const { Text, Paragraph } = Typography;
// image is of different size
type PropsModel= {
  isPaused: boolean,
  pricingPlanType: string,
  validTill: string | null,
  jobTitle: string,
  postedOn: string,
  jobId: string,
  remainingFreeCredits: number,
  remainingJPCredits: number,
  loggedInUserId: string,
  updateJobsData: (validTill: string, jobId: string) => void,
  onCancel: () => void
  orgId: string
}

const JobExpiryModal = (props: PropsModel): JSX.Element => {
  const {
    isPaused, validTill, pricingPlanType, jobTitle,
    postedOn, jobId, remainingFreeCredits, remainingJPCredits,
    loggedInUserId, updateJobsData, onCancel, orgId,
  } = props;
  const [response, setResponse] = useState({
    validTill: '',
  });
  const [renewInProgress, setrenewInProgress] = useState(false);
  const success = ():void => {
    Modal.success({
      icon: false,
      centered: true,
      className: 'm-success-modal',
      okButtonProps: {
        type: 'link',
        className: 'text-right text-semibold',
      },
      content: (
        <div>
          <Paragraph className="text-medium text-bold">Job Renewed!</Paragraph>
          <Paragraph className="content">
            Great! Now you need not worry, the job of
            {' '}
            <span className="text-bold">{`"${jobTitle}"`}</span>
            {' '}
            will be
            automatically renewed on
            {' '}
            <span className="text-bold">{validTill}</span>
          </Paragraph>
        </div>),
      onOk() {
        updateJobsData(response.validTill, jobId);
        onCancel();
      },
    });
  };

  const renewJobHandler = async (renewType):Promise<void> => {
    setrenewInProgress(true);
    if ((pricingPlanType === 'FR'
    && ((renewType === 'Feature' && (remainingFreeCredits > 0 && remainingJPCredits > 0))
    || (renewType === 'Regular' && (remainingFreeCredits > 0))))
    || (pricingPlanType === 'JP' && remainingJPCredits > 0)) {
      if (renewType === 'Feature') {
        let currentPlan;
        const apiRes = await getOrgPricingStats(orgId);
        if (apiRes) {
          currentPlan = apiRes.data?.pricing_stats?.plan_wise_pricing_stats[0];
        }
        const featureApiCall = await upgradeJob({ job_ids: [jobId], plan_id: currentPlan?.id });
        if (![200, 201, 202].includes(featureApiCall.status)) {
          return;
        }
      }
      const patchObject = {
        modified_by_id: loggedInUserId,
        id: jobId,
      };
      const apiCall = await renewJob(jobId, patchObject);
      if (apiCall && apiCall.status
        && [200, 201, 202].indexOf(apiCall.status) !== -1) {
        const apiResponse = await apiCall.data;
        setrenewInProgress(false);
        if (apiResponse && Object.keys(apiResponse).length) {
          setResponse({ validTill: apiResponse.valid_till });
          success();
        }
      }
    } else {
      setrenewInProgress(false);
      router.Router.pushRoute(
        'PricingSelection',
        { id: jobId },
      );
    }
  };
  const getModalTitle = ():string => (isPaused ? 'Re-open Job' : 'Job Expiry');

  const getIllustration = (): JSX.Element => (
    <Col span={24} className="m-illustration">
      {
        isPaused ? (
          <CustomImage
            src="/images/jobs-tab/m-reopen-credits.svg"
            width={444}
            height={250}
            alt={getModalTitle()}
          />
        ) : (
          <>
            {
              pricingPlanType === 'FR' && (
                <CustomImage
                  src={`/images/jobs-tab/${remainingFreeCredits > 0 ? 'm-free-credits' : 'm-no-free-credits'}.svg`}
                  alt={getModalTitle()}
                />
              )
            }
            {
              pricingPlanType === 'JP' && (
                <CustomImage
                  src="/images/jobs-tab/m-premium-credits.svg"
                  width={161}
                  height={129}
                  alt={getModalTitle()}
                />
              )
            }
          </>
        )
      }

    </Col>
  );

  const getModalButtons = ():JSX.Element|null => {
    if (pricingPlanType === 'FR') {
      return (
        <>
          <Col span={24}>
            <Button
              type="primary"
              className={`${remainingFreeCredits > 0 ? 'white-btn' : 'charcoal-btn'}`}
              disabled={remainingFreeCredits <= 0}
              onClick={():Promise<void> => renewJobHandler('Regular')}
              loading={renewInProgress}
            >
              {remainingFreeCredits > 0 ? 'Renew as FREE Job' : 'No FREE Job Credits left'}
            </Button>
          </Col>
          {remainingFreeCredits > 0 ? null : (
            <Col span={24}>
              <Button
                type="primary"
                className="yellow-btn m-top-12"
                onClick={():Promise<void> => renewJobHandler('Feature')}
                loading={renewInProgress}
                style={{ display: 'flex' }}
              >
                <span style={{ marginLeft: '2.5rem' }}> Renew Job as Promoted Job</span>
                <CustomImage
                  src="/images/jobs-tab/upgrade-icon-white-24x24.svg"
                  width={24}
                  height={24}
                  alt="upgrade banner icon"
                />
              </Button>
            </Col>
          )}
        </>
      );
    }
    if (pricingPlanType === 'JP') {
      return (
        <>
          <Col span={24}>
            <Button
              type="primary"
              block
              className="yellow-btn"
              onClick={():Promise<void> => renewJobHandler('Feature')}
              loading={renewInProgress}
              style={{ display: 'flex' }}
            >
              <span style={{ marginLeft: '2.5rem' }}> Renew Job as Promoted Job</span>

              <CustomImage
                src="/images/jobs-tab/upgrade-icon-white-24x24.svg"
                alt="upgrade banner icon"
                width={24}
                height={24}
              />
            </Button>
          </Col>
        </>
      );
    }
    return null;
  };

  const getScreen = (): JSX.Element => {
    const modalInfo = ():JSX.Element => (
      <Row className="expiry-details" justify="center">
        <Col span={24} className="text-center">
          {getIllustration()}
        </Col>
        {
          isPaused ? (
            <>
              <Col span={24} className="text-center flex-justify-center m-top-24">
                <Text className="font-bold text-medium">
                  1 Job Posting required to Renew the job
                </Text>
              </Col>
              <Col span={24} className="text-center flex-justify-center">
                <Text className="text-small color-charcoal-6 p-top-4">
                  {`This Job was paused on ${validTill}`}
                </Text>
              </Col>
            </>
          ) : (
            <>
              <Col span={24} className="text-center m-top-24">
                <Text className="font-bold text-medium flex-justify-center">
                  A
                  {`${pricingPlanType === 'FR' ? ' Regular ' : ' Promoted '}`}
                  Job posting expires in 1 month
                </Text>
              </Col>
              <Col span={24} className="text-center">
                <Text className="font-bold text-medium flex-justify-center">
                  But you can renew it using Job credits!
                </Text>
              </Col>
            </>
          )
        }
      </Row>
    );
    const jobExpiryTableInfo = ():JSX.Element => (
      <Row className="expiry-details-container">
        <Col span={24}>
          <Paragraph className="font-bold text-base" ellipsis>
            {jobTitle}
          </Paragraph>
        </Col>
        <Col span={24}>
          <Row align="middle" justify="space-between">
            <Col>
              <Text className="text-small color-charcoal-6">
                Job posted on:
              </Text>
            </Col>
            <Col>
              <Text className="text-small color-charcoal-6">
                {postedOn}
              </Text>
            </Col>
          </Row>
        </Col>
        <Col span={24}>
          <Row align="middle" justify="space-between">
            <Col>
              <Text className="text-small color-charcoal-6">
                Job Expiry date
              </Text>
            </Col>
            <Col>
              <Text className="text-small color-charcoal-6">
                {validTill}
              </Text>
            </Col>
          </Row>
        </Col>
      </Row>
    );

    return (
      <>
        <Row>
          <Col span={24} className="modal-content">
            {modalInfo()}
          </Col>
        </Row>
        {isPaused ? null : jobExpiryTableInfo()}
        <Row className="buttons-container">
          {getModalButtons()}
        </Row>
      </>
    );
  };

  return (
    <Modal
      visible
      key="m-model"
      className="full-screen-modal m-job-expiry-model"
      title={[
        <Row key={Math.random()}>
          <Col span={2} onClick={onCancel}><CustomImage src="/svgs/m-close.svg" width={24} height={24} alt="Close" /></Col>
          <Col span={20} className="m-modal-title">{getModalTitle()}</Col>
        </Row>,
      ]}
      footer={null}
      onCancel={onCancel}
      closable={false}
      bodyStyle={{ top: 0 }}
    >
      {getScreen()}
    </Modal>
  );
};

export default JobExpiryModal;
