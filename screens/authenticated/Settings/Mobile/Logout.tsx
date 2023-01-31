import {
  Button, Space,
} from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';
import Link from 'next/link';
import React from 'react';
import { pushClevertapEvent } from 'utils/clevertap';

const Logout = (): JSX.Element => (
  <Space align="center">
    <div className="display-flex">
      <CustomImage
        src="/images/settings/logoutIcon.svg"
        width={24}
        height={24}
        alt="logout"
      />
    </div>
    <Button
      type="link"
      className="alert p-all-0"
      onClick={(): void => {
        pushClevertapEvent('Special Click',
          {
            Type: 'Profile',
            value: 'Logout',
          });
      }}
    >
      <Link href="/logout/">Logout</Link>
    </Button>
  </Space>
);

export default Logout;
