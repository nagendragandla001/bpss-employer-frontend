import CloseOutlined from '@ant-design/icons/CloseOutlined';
import notification from 'antd/lib/notification';
import CustomImage from 'components/Wrappers/CustomImage';
import { isMobile } from 'mobile-device-detect';
import React from 'react';

require('components/Notifications/notification.less');

type PropsType={
  title:string;
  description:string;
  iconName:string;
  notificationType: string;
  placement: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
  duration: number
}

const snackBar = (props: PropsType) :void => {
  notification[props.notificationType]({
    message: props.title,
    description: props.description,
    duration: props.duration,
    placement: isMobile ? 'bottomRight' : props.placement,
    className: `custom-snack-bar-${isMobile ? 'mobile' : 'desktop'} ${props.notificationType}-snack-bar ${props.iconName ? 'with-icon' : ''}`,
    closeIcon: <CloseOutlined />,
    icon: props.iconName
      ? (
        <CustomImage
          src={`/icons/notification-icons/${props.iconName}`}
          alt="icon"
          width={48}
          height={48}
          className="width-height-48"
        />
      ) : null,
  });
};

export default snackBar;
