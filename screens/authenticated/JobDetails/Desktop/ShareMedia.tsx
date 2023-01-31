import {
  Button, Card, Space, Typography,
} from 'antd';
import { IJobPost } from 'common/jobpost.interface';
import CustomImage from 'components/Wrappers/CustomImage';
import React from 'react';
import { pushClevertapEvent } from 'utils/clevertap';
import config from 'config';
import { ApiConstants, AppConstants } from 'constants/index';

const { Text } = Typography;

interface IShareMedia {
  job: IJobPost;
}

const ShareMedia = (props: IShareMedia): JSX.Element => {
  const { job } = props;

  return (
    <Card className="jd-score-card">
      <Space align="center" size={0}>
        <Text className="score-info text-base">Share on:</Text>
        <Button
          type="link"
          target="_blank"
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${config.BASE_URL}/job/${job?.slug}/${job?.id}/&title=${encodeURI(`Apply for ${job.title} Jobs in ${job.organizationPopularName || job.hiringOrgName} | ${job.cityName} - ${AppConstants.APP_NAME}.com`)}`}
          onClick={():void => {
            pushClevertapEvent('Share Job',
              { Type: 'Facebook', JobState: `${job.state}` });
          }}
          icon={(
            <CustomImage
              src="/images/job-details/jd-linkedin.svg"
              alt="fb"
              width={24}
              height={24}
            />
          )}
        />
        <Button
          type="link"
          target="_blank"
          href={`${ApiConstants.FACEBOOK_SHARE_LINK}job/${job?.slug}/${job?.id}`}
          style={{ paddingTop: '8px' }}
          onClick={():void => {
            pushClevertapEvent('Share Job',
              { Type: 'Linkedin', JobState: `${job.state}` });
          }}
          icon={(
            <CustomImage
              src="/images/job-details/jd-fb.svg"
              alt="linkedin"
              width={24}
              height={24}
            />
          )}
        />
        <Button
          type="link"
          target="_blank"
          href={`https://twitter.com/intent/tweet?url=${config.BASE_URL}/job/${job?.slug}/${job?.id}/&text=${encodeURI(`Apply for ${job.title} Jobs in ${job.organizationPopularName || job.hiringOrgName} | ${job.cityName} - ${AppConstants.APP_NAME}.com`)}`}
          onClick={():void => {
            pushClevertapEvent('Share Job',
              { Type: 'Twitter', JobState: `${job.state}` });
          }}
          icon={(
            <CustomImage
              src="/images/job-details/jd-tw-ic.svg"
              alt="twitter"
              width={24}
              height={24}
            />
          )}
        />
        <Button
          type="link"
          target="_blank"
          href={`mailto: ?&subject=Apply for ${job?.title} in ${job.organizationPopularName || job.hiringOrgName} || ${job.cityName} - ${AppConstants.APP_NAME}.com&body=Apply for ${job.title} Jobs in ${job.organizationPopularName || job.hiringOrgName}  | ${job.cityName} - ${AppConstants.APP_NAME}.com${config.BASE_URL}/job/${job?.slug}/${job?.id}`}
          onClick={():void => {
            pushClevertapEvent('Share Job',
              { Type: 'Mail', JobState: `${job.state}` });
          }}
          icon={(
            <CustomImage
              src="/images/job-details/jd-mail.svg"
              alt="email"
              width={24}
              height={24}
            />
          )}
        />
      </Space>
    </Card>
  );
};

export default ShareMedia;
