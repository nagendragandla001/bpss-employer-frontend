/* eslint-disable camelcase */
/* eslint-disable prefer-promise-reject-errors */
import {
  AutoComplete, Col, Form, Row, Spin, Typography,
} from 'antd';
import JobPostingGuidelines from 'components/Guidelines/JobPostingGuide';
import React, { useState } from 'react';
import { titleSuggAPI } from 'service/job-posting-service';
import { validatetitleAPI } from 'service/login-service';
import { JobTitlePattern } from 'utils/constants';

// interface PropsInterface{
//   store?: JobPost;
// }

const { Text } = Typography;
const { Option } = AutoComplete;

const JobSuggInput = (): JSX.Element => {
  // const { store } = props;
  const [profainword, setprofainword] = useState(false);
  const [state, setState] = useState({
    jobData: [],
    value: '',
    fetching: false,
  });

  const fetchJobs = (text: string): void => {
    if (text) {
      setState((prevState) => ({
        ...prevState,
        jobData: [],
        fetching: false,
      }));
      const titleSugg = titleSuggAPI(text);
      titleSugg.then((body) => {
        const obj = body
              && body.objects
              && body.objects.map((job: { job_designation: string }) => ({
                text: job.job_designation,
              }));
        setState((prevState) => ({
          ...prevState,
          jobData: obj,
          fetching: false,
        }));
      });
    }
  };

  const checktitle = async (_rule, value): Promise<void> => {
    const check = await validatetitleAPI(value);
    if (check.restricted_words) {
      setprofainword(true);
    } else { setprofainword(false); }
  };

  const handleChange = (text: string): void => {
    setState((prevState) => ({
      ...prevState,
      value: text,
      jobData: [],
      fetching: false,
    }));
    // if (store) {
    //   store.aboutJob.basicInfo.updateTitle(text);
    //   store.aboutJob.basicInfo.updatetitlecheck(text);
    // }
  };

  return (
    <>
      <Form.Item
        name="title"
        label="Job Title"
        extra={
          profainword ? (
            <div style={{

              display: 'flex',
            }}
            >
              <div style={{ width: '70%', marginTop: '6px', color: 'red' }}>
                {'Your Job posting doesn\'t meet our job posting rules Click here  '}
              </div>
              <div style={{
                width: '30%',
                marginTop: '-4px',
                marginLeft: '-31px',
              }}
              >
                <JobPostingGuidelines />
              </div>
            </div>
          ) : null
        }
        rules={[
          {
            required: true,
            message: 'Please input Job title!',
          },
          {
            min: 5,
            message: 'Job title cannot be less than 5 characters',
          },
          {
            max: 66,
            message: 'Job title cannot be more than 66 characters',
          },
          {
            pattern: JobTitlePattern,
            message: 'Special characters are not allowed.',
          },
          {
            whitespace: true,
            message: 'The job title cannot be empty!',
          },
          { validator: checktitle },
        ]}
        style={{ marginBottom: 32 }}
      >
        <AutoComplete
          notFoundContent={state.fetching ? <Spin size="small" /> : null}
          onSearch={fetchJobs}
          onChange={handleChange}
          placeholder="e.g. Marketing Manager"
          className="text-base material-select"
          showSearch
          showArrow={false}
          size="large"
        >
          {state.jobData
            && state.jobData.map((d: { text: string }) => (
              <Option value={d.text} key={d.text} className="full-width">
                <Row align="middle" justify="start">
                  <Col xs={{ span: 24 }}>
                    <Text style={{ width: '100%' }} ellipsis>
                      {d.text}
                    </Text>
                  </Col>
                </Row>
              </Option>
            ))}
        </AutoComplete>

      </Form.Item>
      <Text style={{
        position: 'absolute', zIndex: 300, left: '0px', top: '90px', fontSize: '13px', color: 'blue',
      }}
      />
    </>
  );
};

export default JobSuggInput;
