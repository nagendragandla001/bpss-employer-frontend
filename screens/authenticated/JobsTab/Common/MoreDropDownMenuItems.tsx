import {
  Button, Col, Menu, Row,
} from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';
import React from 'react';
import { pushClevertapEvent } from 'utils/clevertap';
import { JobType } from './JobsTabUtils';

interface IDesktopProps{
  id: string;
  pricingPlanType: string;
  setCloseJobModalFlag:(value) => void;
  setCloseJobId:(value) => void;
  currentTab: string;
  setDuplicateJobModalFlag:(value) =>void;
  setDuplicateJobId:(value)=> void;
}

export const DesktopMoreDropDownMenuItems = (props:IDesktopProps): JSX.Element => {
  const {
    pricingPlanType, id, setCloseJobModalFlag, setCloseJobId, currentTab,
    setDuplicateJobModalFlag, setDuplicateJobId,
  } = props;
  return (
    <Menu className="more-dropdown-menu-container">
      <Menu.Item key="1">
        <Button
          type="text"
          className="link-btn full-width dropdown-btn p-all-0"
          onClick={():void => {
            pushClevertapEvent('Special Click',
              {
                Type: 'Close Job',
                'Job Type': pricingPlanType,
                'Job State': currentTab,
              });
            setCloseJobModalFlag(true);
            setCloseJobId(id);
          }}
        >
          <CustomImage
            src="/images/jobs-tab/close-job-icon-24x24.svg"
            height={24}
            width={24}
            alt="share Icon"
            className="p-right-2"
          />
          Close job
        </Button>
      </Menu.Item>
      <Row>
        <Col span={24} className="dropdown-line" />
      </Row>
      <Menu.Item key="3">
        <Button
          type="text"
          className="link-btn full-width dropdown-btn p-all-0"
          onClick={():void => {
            pushClevertapEvent('Special Click',
              {
                Type: 'Duplicate Job',
                'Job Type': pricingPlanType,
                'Job State': currentTab,
              });
            setDuplicateJobModalFlag(true);
            setDuplicateJobId(id);
          }}
        >
          <CustomImage
            src="/images/jobs-tab/duplicate-job-icon-24x24.svg"
            height={15}
            width={16}
            alt="share Icon"
            className="p-right-2"
          />
          &nbsp;
          Duplicate job
        </Button>
      </Menu.Item>
    </Menu>
  );
};

interface IMobileProps{
  job: JobType;
  currentTab: string;
  setCloseJobModalFlag:(value) => void;
  setCloseJobId:(value) => void;
  setDuplicateJobModalFlag:(value) => void;
  setDuplicateJobId:(value)=> void;
}

export const MobileMoreDropDownMenuItems = (props: IMobileProps) : JSX.Element => {
  const {
    job, currentTab, setCloseJobModalFlag,
    setCloseJobId, setDuplicateJobModalFlag, setDuplicateJobId,
  } = props;
  return (
    <Row>
      <Col>
        <Button
          className="link-btn full-width dropdown-btn"
          type="text"
          size="small"
          icon={(
            <CustomImage
              src="/images/jobs-tab/close-job-icon-24x24.svg"
              height={24}
              width={24}
              alt="share Icon"
              className="p-right-2"
            />
          )}
          onClick={():void => {
            pushClevertapEvent('Special Click',
              {
                Type: 'Close Job',
                'Job Type': job.pricingPlanType,
                'Job State': currentTab,
              });
            setCloseJobModalFlag(true);
            setCloseJobId(job.id);
          }}
        >
          Close job
        </Button>
      </Col>
      <Col span={24} className="dropdown-line" />
      <Col>
        <Button
          className="link-btn full-width dropdown-btn"
          type="text"
          size="small"
          icon={(
            <CustomImage
              src="/images/jobs-tab/duplicate-job-icon-24x24.svg"
              height={15}
              width={15}
              alt="share Icon"
              className="p-right-2"
            />
          )}
          onClick={():void => {
            pushClevertapEvent('Special Click',
              {
                Type: 'Duplicate Job',
                'Job Type': job.pricingPlanType,
                'Job State': currentTab,
              });
            setDuplicateJobModalFlag(true);
            setDuplicateJobId(job.id);
          }}
        >
          Duplicate job
        </Button>

      </Col>
    </Row>
  );
};

export default DesktopMoreDropDownMenuItems;
