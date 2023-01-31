import React from 'react';
import { Result, Button } from 'antd';

const InMaintainance = ():JSX.Element => (

  <Result
    status="500"
    title="The site is under maintenance."
    subTitle="Our engineers are working to get it back online, Your patience is required"
    extra={(
      <Button
        type="primary"
        href=""
      >
        Reload

      </Button>
    )}
  />

);

export default InMaintainance;
