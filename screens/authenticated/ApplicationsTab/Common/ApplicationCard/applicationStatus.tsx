/* eslint-disable react/no-unused-prop-types */
import React from 'react';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import isTomorrow from 'dayjs/plugin/isTomorrow';
import Typography from 'antd/lib/typography';

require('screens/authenticated/ApplicationsTab/Common/ApplicationCard/applicationStatus.less');

const { Text } = Typography;

dayjs.extend(isToday);
dayjs.extend(isTomorrow);

type PropsType={
  applicationStage: string;
  interviewStartTime: string;
  interviewEndTime: string;
  interviewAttendance: string;
  appliedJobType: string;
  applicationOnHold: boolean;
}
const ApplicationStatus = (props: PropsType):JSX.Element => {
  const { applicationOnHold, applicationStage } = props;
  const getStatus = (): string|JSX.Element => {
    switch (applicationStage) {
      case 'ES':
        return (<Text className="app-status app-status-yellow-text">Shortlisted by you</Text>);
      case 'TBSI':
        return (
          <Text className="app-status app-status-yellow-text">
            {props.appliedJobType === 'CAR' ? 'shortlisted' : 'Walk-in'}
          </Text>
        );
      case 'SFI':
        if (!props.interviewAttendance) {
          const interviewEndTime = dayjs(props.interviewEndTime);
          const currentTime = dayjs(new Date());
          const diff = currentTime.diff(interviewEndTime, 'm');
          if (diff >= 0) {
            return <Text className="app-status app-status-green">Interview Done</Text>;
          }
          if (diff < 0) {
            if (dayjs(props.interviewEndTime).isToday()) {
              return <Text className="app-status app-status-green">Interview Today</Text>;
            }
            if (dayjs(props.interviewEndTime).isTomorrow()) {
              return <Text className="app-status app-status-green">Interview Tomorrow</Text>;
            }
          }
          return <Text className="app-status app-status-green">Interview</Text>;
        }
        if (props.interviewAttendance === 'A') return <Text className="app-status app-status-red-text">Absent for Interview</Text>;
        break;
      case 'SEL':
        return <Text className="app-status app-status-white-text-green-bg">Selected</Text>;
      case 'RJ':
        return <Text className="app-status app-status-red-text">Rejected</Text>;
      case 'ATJ':
        return <Text className="app-status app-status-white-text-green-bg">Offer Accepted</Text>;
      case 'DNATJ':
        return <Text className="app-status app-status-red-text">Offer Declined</Text>;
      case 'J':
        return <Text className="app-status app-status-white-text-yellow-bg">Joined</Text>;
      case 'DNJ':
        return <Text className="app-status app-status-red-text">Did Not Join</Text>;
      case 'LJ':
        return <Text className="app-status app-status-red-text">Left Job</Text>;
      case 'NI':
        return <Text className="app-status app-status-charcoal-text">Candidate Not Interested</Text>;
      default:
        return '';
    }
    return '';
  };
  return (
    <div>
      {getStatus()}
    </div>
  );
};

export default ApplicationStatus;
