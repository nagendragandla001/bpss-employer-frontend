import {
  CaretDownOutlined,
  CheckOutlined, CloseOutlined,
} from '@ant-design/icons';
import {
  Button, Dropdown, Menu,
} from 'antd';
import snackBar from 'components/Notifications';
import React from 'react';
import { dismissCandidate, shortlistCandidate } from 'service/application-card-service';
import { pushClevertapEvent } from 'utils/clevertap';
import { CMSInterface } from '../Common/ApplicationTabUtils';

interface PropsI{
  contactUnlocked:boolean,
  candidateId:string,
  jobId:string,
  jobTitle:string,
  updateDismissedCandidate: (id) => void;
  cms: CMSInterface;
}

const DatabaseApplicationActions = (props:PropsI):JSX.Element => {
  const {
    contactUnlocked, candidateId, jobId, jobTitle, updateDismissedCandidate, cms,
  } = props;

  const showSnackbar = (title:string, description:string,
    iconName:string, notificationType: string) :void => {
    snackBar({
      title,
      description,
      iconName,
      notificationType,
      placement: 'bottomRight',
      duration: 5,
    });
  };
  const dismissHandler = async ():Promise<void> => {
    const apiResponse = await dismissCandidate(candidateId, jobId);
    if ([200, 201, 202].indexOf(apiResponse.status)) {
      updateDismissedCandidate(candidateId);
      pushClevertapEvent('Dismiss', {
        Page: 'Database (Candidates Tab)',
        Status: 'S',
        cms_match: cms?.score,
      });
    } else {
      pushClevertapEvent('Dismiss', {
        Page: 'Database (Candidates Tab)',
        Status: 'F',
        cms_match: cms?.score,
      });
    }
  };
  const shortlistHandler = async ():Promise<void> => {
    const apiCall = await shortlistCandidate(candidateId, jobId);
    if ([200, 201, 202].indexOf(apiCall.status)) {
      showSnackbar(`Candidate shortlisted for ${jobTitle} job. Waiting for candidate confirmation.`, '', 'congratsIcon.svg',
        'info');
      pushClevertapEvent('Shortlist', {
        Page: 'Database (Candidates Tab)',
        Status: 'S',
        cms_match: cms?.score,
      });
      updateDismissedCandidate(candidateId);
    } else {
      pushClevertapEvent('Shortlist', {
        Page: 'Database (Candidates Tab)',
        Status: 'F',
        cms_match: cms?.score,
      });
    }
  };

  const handleMenuClick = (item): void => {
    if (item.key === 'dismiss') {
      dismissHandler();
    } else if (item.key === 'shortlist') {
      shortlistHandler();
    }
  };

  const getMenuItems = contactUnlocked ? (
    <Menu onClick={handleMenuClick}>
      <Menu.Item
        style={{ color: '#596685' }}
        key="dismiss"
        icon={<CloseOutlined style={{ color: '#a51616', fontSize: '10px', fontWeight: 'bold' }} />}
      >
        Dismiss
      </Menu.Item>
      <Menu.Item key="shortlist" icon={<CheckOutlined style={{ color: '#36992e' }} />}>
        Shortlist
      </Menu.Item>
    </Menu>
  ) : (
    <Menu onClick={handleMenuClick}>
      <Menu.Item
        style={{ color: '#596685' }}
        key="dismiss"
        icon={<CloseOutlined style={{ color: '#a51616', fontSize: '10px', fontWeight: 'bold' }} />}
      >
        Dismiss
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown
      className="ac-dropdown-button"
      overlay={getMenuItems}
      trigger={['click']}
    >
      <Button shape="circle" style={{ borderColor: '#abb2c1' }} icon={<CaretDownOutlined style={{ color: '#596685' }} />} />
    </Dropdown>
  );
};

export default DatabaseApplicationActions;
