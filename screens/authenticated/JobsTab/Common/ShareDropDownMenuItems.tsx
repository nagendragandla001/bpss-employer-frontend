import { Menu } from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';
import config from 'config';
import AppConstants from 'constants/constants';
import React from 'react';
import { pushClevertapEvent } from 'utils/clevertap';
import { JobType, sharingPlatforms } from 'screens/authenticated/JobsTab/Common/JobsTabUtils';

interface IDesktopProps{
  jobId: string,
  jobSlug: string,
  jobLocation: string,
  jobTitle: string,
  orgName: string,
  orgPopularName: string,
  currentTab:string
}

interface IMobileProps{
  job:JobType,
}

export const DesktopShareDropDownMenuItems = (props: IDesktopProps) : JSX.Element => {
  const {
    jobId, jobSlug, jobLocation, jobTitle, orgName, orgPopularName, currentTab,
  } = props;
  const getShareableLink = (type: string) : string => {
    switch (type) {
      case 'facebook':
        return `https://www.facebook.com/sharer.php?u=${config.BASE_URL}/job/${jobSlug}/${jobId}/`;
      case 'linkedIn':
        return `https://www.linkedin.com/sharing/share-offsite/?url=${config.BASE_URL}/job/${jobSlug}/${jobId}/&title=${encodeURI(`Apply for ${jobTitle} Jobs in ${orgPopularName || orgName} | ${jobLocation} - ${AppConstants.APP_NAME}.com`)}`;
      case 'twitter':
        return `https://twitter.com/intent/tweet?url=${config.BASE_URL}/job/${jobSlug}/${jobId}/&text=${encodeURI(`Apply for ${jobTitle} Jobs in ${orgPopularName || orgName} | ${jobLocation} - ${AppConstants.APP_NAME}.com`)}`;
      case 'email':
        return `mailto: ?&subject=Apply for ${jobTitle} in ${orgPopularName || orgName} | ${jobLocation} - ${AppConstants.APP_NAME}.com&body= Apply for ${jobTitle} Jobs in ${orgPopularName || orgName} | ${jobLocation} - ${AppConstants.APP_NAME}.com ${config.BASE_URL}/job/${jobSlug}/${jobId}`;
      default: return '';
    }
  };
  return (
    <Menu className="share-dropdown-menu-container">
      {sharingPlatforms.map((item) => (
        <Menu.Item key={item.label}>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={getShareableLink(item.value)}
            onClick={():void => pushClevertapEvent('Share Job',
              {
                Type: `${item.label}`,
                'Job State': currentTab,
              })}
          >
            <CustomImage
              src={`/images/jobs-tab/${item.value}-icon-24x24.svg`}
              alt={`${item.value} icon`}
              width={24}
              height={24}
            />
            {item.label}
          </a>
        </Menu.Item>
      ))}
    </Menu>
  );
};

export const MobileShareDropDownMenuItems = (props: IMobileProps): JSX.Element => {
  const { job } = props;
  const getShareableLink = (type: string) : string => {
    switch (type) {
      case 'facebook':
        return `https://www.facebook.com/sharer.php?u=${config.BASE_URL}/job/${job.slug}/${job.id}/`;
      case 'linkedIn':
        return `https://www.linkedin.com/sharing/share-offsite/?url=${config.BASE_URL}/job/${job.slug}/${job.id}/&title=Apply for ${job.title} Jobs in ${job.orgPopularName || job.orgName} | ${job.location} - ${AppConstants.APP_NAME}.com`;
      case 'twitter':
        return `https://twitter.com/intent/tweet?url=${config.BASE_URL}/job/${job.slug}/${job.id}/&text=Apply for ${job.title} Jobs in ${job.orgPopularName || job.orgName} ${job.location} - ${AppConstants.APP_NAME}.com`;
      case 'email':
        return `mailto: ?&subject=Apply for ${job.title} in ${job.orgPopularName || job.orgName} | ${job.location} - ${AppConstants.APP_NAME}.com&body= Apply for ${job.title} Jobs in ${job.orgPopularName || job.orgName} | ${job.location} - ${AppConstants.APP_NAME}.com${config.BASE_URL}/job/${job.slug}/${job.id}`;
      default: return '';
    }
  };
  return (
    <Menu className="share-dropdown-menu-container">
      {sharingPlatforms.map((item) => (
        <Menu.Item key={item.label}>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={getShareableLink(item.value)}
            onClick={(): void => pushClevertapEvent('General Click', { Type: 'Share Job', value: item.label })}
          >
            <CustomImage
              src={`/images/jobs-tab/${item.value}-icon-24x24.svg`}
              alt={`${item.value} icon`}
              width={24}
              height={24}
            />
            {item.label}
          </a>
        </Menu.Item>
      ))}
    </Menu>
  );
};
