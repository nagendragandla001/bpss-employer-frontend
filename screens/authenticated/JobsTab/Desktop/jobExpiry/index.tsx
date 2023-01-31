/* eslint-disable react/require-default-props */
/* eslint-disable no-nested-ternary */

import {
  CloseOutlined, RightOutlined,
} from '@ant-design/icons';
import {
  Button, Col, Modal, Row, Space, Typography,
} from 'antd';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import router from 'routes';
import { renewJob, upgradeJob } from 'service/job-service';
import { pushClevertapEvent } from 'utils/clevertap';
import CustomImage from 'components/Wrappers/CustomImage';
import { getOrgPricingStats } from 'service/organization-service';

require('screens/authenticated/JobsTab/Desktop/jobExpiry/jobExpiry.less');

const { Text, Paragraph } = Typography;

type PropsInterface= {
  isPaused: boolean,
  pricingPlanType: string,
  validTill: string,
  remainingFreeCredits: number,
  remainingJPCredits: number,
  loggedInUserId: string,
  jobId: string,
  postedOn: string,
  jobTitle: string,
  pausedOn: string,
  page?: boolean,
  updateJobsData: (validTill: string, jobId: string) => void,
  orgId: string,
  button?: boolean,
}

const JobExpiryModal = (props: PropsInterface): JSX.Element => {
  const {
    isPaused, pricingPlanType,
    validTill, remainingFreeCredits,
    remainingJPCredits, loggedInUserId,
    jobId, postedOn, updateJobsData, jobTitle,
    pausedOn, page, orgId, button,
  } = props;
  const [currentScreen, setCurrentScreen] = useState<''|'renewScreen'|'renewSuccess'>('');
  const [response, setResponse] = useState({
    validTill: '',
  });
  const [renewJobRIP, setRenewJobRIP] = useState(false);
  const [renewFeature, setRenewFeature] = useState(false);

  const renewJobHandler = async (renewType):Promise<void> => {
    if (renewType === 'Feature') {
      setRenewFeature(true);
    } else {
      setRenewJobRIP(true);
    }

    if (isPaused) {
      let remainingDaysToClose = -1;
      if (pausedOn) {
        const closeDate = dayjs(pausedOn).add(15, 'day');
        remainingDaysToClose = closeDate.diff(dayjs(), 'd');
      }
      pushClevertapEvent('Renew Job',
        {
          Type: 'Renew/ Upgrade to premium',
          'Pricing Plan': pricingPlanType,
          'Close Remaining days': remainingDaysToClose >= 0 ? remainingDaysToClose : 'NA',
        });
    } else {
      let remainingDaysToPause = -1;
      if (validTill) {
        remainingDaysToPause = dayjs(validTill).diff(dayjs(), 'd');
      }
      pushClevertapEvent('Renew Job',
        {
          Type: 'Renew as free/ Renew as premium',
          'Pricing Plan': pricingPlanType,
          'Pause remaining days': remainingDaysToPause >= 0 ? remainingDaysToPause : 'NA',
        });
    }

    if ((pricingPlanType === 'FR'
    && ((renewType === 'Feature' && (remainingFreeCredits > 0 && remainingJPCredits > 0))
    || (renewType === 'Regular' && (remainingFreeCredits > 0))))
    || (pricingPlanType === 'JP' && remainingJPCredits > 0)) {
      if (renewType === 'Feature' && pricingPlanType === 'FR') {
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
        if (apiResponse && Object.keys(apiResponse).length) {
          setResponse({ validTill: apiResponse.valid_till });
          if (renewType === 'Feature') {
            setRenewFeature(false);
          } else {
            setRenewJobRIP(false);
          }
          setCurrentScreen('renewSuccess');
        }
      } else if (renewType === 'Feature') {
        setRenewFeature(false);
      } else {
        setRenewJobRIP(false);
      }
    } else {
      if (renewType === 'Feature') {
        setRenewFeature(false);
      } else {
        setRenewJobRIP(false);
      }
      router.Router.pushRoute(
        'pricingPlans',
      );
    }
  };

  const getModalButtons = ():JSX.Element|null => {
    if (pricingPlanType === 'FR') {
      return (
        <>
          <Col span={24} className="footer-actions">
            <Space direction="vertical" align="center" size="middle">
              <Button
                type="primary"
                className="text-medium full-width"
                onClick={():Promise<void> => renewJobHandler('Feature')}
                loading={renewFeature}
              >
                Renew Job as Promoted Job
              </Button>
              <Button
                type={remainingFreeCredits > 0 ? 'primary' : 'text'}
                className="text-medium full-width"
                disabled={remainingFreeCredits <= 0}
                ghost={remainingFreeCredits > 0}
                onClick={():Promise<void> => renewJobHandler('Regular')}
                loading={remainingFreeCredits > 0 ? renewJobRIP : false}
              >
                {remainingFreeCredits > 0
                  ? 'Renew Job as Regular Job'
                  : 'No FREE Job Credits left'}
              </Button>
            </Space>
          </Col>
        </>
      );
    }
    if (pricingPlanType === 'JP') {
      return (
        <>
          <Col span={24}>
            <Button
              type="primary"
              className="text-medium"
              onClick={():Promise<void> => renewJobHandler('Feature')}
              loading={renewFeature}
            >
              Renew Job as Promoted Job
            </Button>
          </Col>
        </>
      );
    }
    return null;
  };
  const getScreen = (): JSX.Element | null => {
    const modalInfo = ():JSX.Element => {
      if (isPaused) {
        return (
          <Row className="expiry-details" justify="center">
            <Col span={24}>
              <Text className="font-bold text-medium flex-justify-center">
                1 Job Posting required to Renew the job
              </Text>
            </Col>
            <Col span={24} className="text-center flex-justify-center">
              <Text className="text-small color-charcoal-6 p-top-4">
                {`This Job was paused on ${pausedOn}`}
              </Text>
            </Col>
          </Row>
        );
      }
      return (
        <Row className="expiry-details">
          <Col span={24}>
            <Text className="font-bold text-medium flex-justify-center">
              A
              {`${pricingPlanType === 'FR' ? ' Regular ' : ' Promoted '}`}
              Job posting expires in 1 month
            </Text>
          </Col>
          <Col span={24}>
            <Text className="font-bold text-medium flex-justify-center">
              But you can renew it using Job credits!
            </Text>
          </Col>
        </Row>
      );
    };

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
                Job expiry date:
              </Text>
            </Col>
            <Col>
              <Text className="text-small color-charcoal-6">
                {dayjs(validTill).format('DD MMM YYYY')}
              </Text>
            </Col>
          </Row>
        </Col>
      </Row>
    );

    if (currentScreen === 'renewSuccess') {
      return (
        <>
          <Row>
            <Col span={24} className="renew-success-content">
              <Text className="text-base">
                Great! Now you need not worry, the job is renewed
              </Text>
            </Col>
          </Row>
          <Row>
            <Col span={24} className="renew-success-btn-container">
              <Button
                type="primary"
                className="font-bold"
                onClick={():void => {
                  updateJobsData(response.validTill, jobId);
                  setCurrentScreen('');
                }}
              >
                OK
              </Button>
            </Col>
          </Row>
        </>
      );
    }

    return (
      <>
        <Row>
          <Col span={24} className="renew-job-modal-img-container">
            <CustomImage
              src="/images/common/icon-renew-job-modal.svg"
              height={136}
              width={165}
              alt="Renew Job Modal"
            />
          </Col>
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

  const getModalTitle = ():string => {
    if (currentScreen === 'renewSuccess') { return 'Job Renewed!'; }
    return isPaused ? 'Renew Job' : 'Job Expiry';
  };

  const getModalImage = ():string => {
    if (currentScreen === 'renewSuccess') return 'renew-success';
    if (isPaused) return 'renew-paused-job';
    if (pricingPlanType === 'FR') return 'renew-free-job';
    return 'renew-premium-job';
  };

  return (
    <Row className="job-expiry-modal-container">
      <Col span={24}>
        <Button
          type={page ? 'primary' : 'link'}
          onClick={(): void => {
            setCurrentScreen('renewScreen');
            if (isPaused) {
              pushClevertapEvent('Special Click', { Type: 'Renew Job', 'Pricing Plan': pricingPlanType });
            } else {
              pushClevertapEvent('Special Click', { Type: 'Know More - Job Pause Reminder', 'Job Type': pricingPlanType });
            }
          }}
          className={!button ? (page ? 'br-4' : 'link-btn') : 'renew-job-btn'}
          block={page}
        >
          {!button ? (
            <>
              <Text>{isPaused ? 'Renew Job' : 'Know More'}</Text>
              {!page && (
                <RightOutlined
                  style={{ fontSize: '12px', fontWeight: 'bold' }}
                />
              )}
            </>
          ) : (
            <>
              <CustomImage
                src="/images/jobs-tab/renew-job-icon.png"
                alt="renew-job-icon"
                width={14}
                height={14}
              />
              &nbsp;
              Renew Job
            </>
          )}

        </Button>

        {currentScreen
          ? (
            <Modal
              visible={!!currentScreen}
              title={<Text className="modal-title">{getModalTitle()}</Text>}
              onCancel={(): void => setCurrentScreen('')}
              footer={null}
              width={400}
              destroyOnClose
              closeIcon={<CloseOutlined style={{ color: '#284e52', fontSize: '1.5rem' }} />}
              className="job-expiry-modal"
              maskStyle={{ background: 'rgba(0, 20, 67, 0.8)' }}
            >
              <Row>
                <Col span={24} className="flex-justify-center">
                  <CustomImage src={`/images/job-renew-modal/${getModalImage()}.svg`} alt="modal-illustration" layout />
                </Col>
              </Row>
              {getScreen()}
            </Modal>
          ) : null}
      </Col>
    </Row>
  );
};

export default JobExpiryModal;
