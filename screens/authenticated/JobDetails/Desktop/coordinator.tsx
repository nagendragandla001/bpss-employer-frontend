import React, { useState } from 'react';
import {
  Form, Button, Col, Row, Card, Typography, Divider,
} from 'antd';
import {
  JobDetailsType,
} from 'screens/authenticated/JobDetails/Common/JobDetails.utils';
import { pushClevertapEvent } from 'utils/clevertap';
import CustomImage from 'components/Wrappers/CustomImage';
import { patchJobChanges } from 'screens/authenticated/JobDetails/Common/JobDetails.service';

const { Paragraph } = Typography;
interface coordinatorI{
  jobdata: JobDetailsType,
  patchrequest:(string)=>void,
}
const Coordinator = (props:coordinatorI):JSX.Element => {
  const { jobdata, patchrequest } = props;
  const [pocData, setpocData] = useState(jobdata.pocList);
  const [removeInprogress, setremoveInProgress] = useState(false);
  const ids = (data):Array<number> => {
    if (data.length > 0) {
      return data.map((d) => (
        d.id
      ));
    }
    return [];
  };
  const patchRequestHandler = async (remPoc):Promise<void> => {
    setremoveInProgress(true);
    const obj = {
      id: jobdata.id,
      point_of_contact_ids: ids(remPoc),
    };
    // console.log(obj);
    const apiCall = await patchJobChanges(jobdata.id, obj);
    if ([200, 201, 202].indexOf(apiCall.status) > -1) {
      setremoveInProgress(false);
      patchrequest('success');
    } else {
      setremoveInProgress(false);
    }
  };
  const remPocList = (index):void => {
    const remPoc = [...pocData];
    remPoc.splice(index, 1);
    setpocData(remPoc);

    patchRequestHandler(remPoc);
  };
  return (
    <Form
      layout="vertical"
      initialValues={{
        poc: jobdata.pocList,
      }}

    >
      <Form.List name="poc">
        {(fields, { remove }): JSX.Element => (
          <>
            {
              fields.map((field) => (
                <Col span={24} key={Math.random()}>
                  <Form.Item
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...field}
                    key={`type${field.name}`}
                    name={field.name}

                  >
                    <Row key={Math.random()}>

                      <Col key={Math.random()} span={20}>
                        <Card className="jd-coordinator">

                          <Col key={Math.random()}>
                            {`${pocData[field.name].user.first_name}   ${pocData[field.name].user.last_name}`}
                            <Row key={Math.random()} style={{ marginTop: '0.5rem' }}>
                              <CustomImage
                                src="/svgs/mail-icon.svg"
                                alt="mail icon"
                                height={20}
                                width={20}
                              />
                              <Paragraph className="jd-subheading" style={{ paddingLeft: '0.5rem' }}>

                                {pocData[field.name].user.email}
                              </Paragraph>
                            </Row>
                            {pocData[field.name].user.mobile
                              ? (
                                <Row key={Math.random()} style={{ marginTop: '0.5rem' }}>
                                  <CustomImage src="/svgs/callbutton.svg" height={20} width={20} alt="call button icon" />
                                  <Paragraph className="jd-subheading" style={{ paddingLeft: '0.5rem' }}>

                                    91-
                                    {pocData[field.name].user.mobile}
                                  </Paragraph>
                                </Row>
                              ) : null}

                          </Col>

                        </Card>
                        {jobdata.pocList.length > 1 ? <Divider /> : null}
                      </Col>

                      <Col xs={{ span: 3 }} md={{ span: 2 }} key={Math.random()} className={jobdata.jobState === 'J_C' ? 'jd-edit-cancel text-center' : 'hide'}>
                        {
                          fields.length > 1 && (
                            <Button
                              type="link"
                              className="p-all-0"
                              icon={<CustomImage src="/images/job-details/jd-delete.svg" height={20} width={20} alt="Row Delete" />}
                              onClick={(): void => {
                                // store.removeOtherField(field.name);
                                remove(field.name);
                                remPocList(field.name);
                                pushClevertapEvent('Job Coordinator', { Type: 'Delete' });
                              }}
                              loading={removeInprogress}
                            />
                          )
                        }
                      </Col>

                    </Row>
                  </Form.Item>
                </Col>
              ))
            }
          </>
        )}
      </Form.List>
    </Form>
  );
};
export default Coordinator;
