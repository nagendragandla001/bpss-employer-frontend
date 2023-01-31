import React, { useState } from 'react';
import { Modal, Button } from 'antd';
import { isMobile } from 'mobile-device-detect';
import LinksConstants from 'constants/links-constants';

const ModalContent = (): JSX.Element => (
  <>
    <div className="modal-content">
      <p className="text-gray text-semibold">  How can I get relevant candidates for my job?</p>
      <ul>
        <li className="text-gray-light"> To get the most relevant candidates for your job, please fill all the necessary details. More details you provide, better the candidate recommendation you will get.</li>
      </ul>
      <p className="text-gray text-semibold"> Can I edit my job later?</p>
      <ul>
        <li className="text-gray-light"> Yes. Editing a job is very easy. You can edit your job after logging in to your account. </li>
      </ul>
      <p className="text-gray text-semibold"> What will be the validity period of my job?</p>
      <ul>
        <li className="text-gray-light">{`Your job will be valid for 30 days on the ${LinksConstants.APP_NAME} platform. However, you can extend the validity of your job to continue receiving applications.`}</li>
      </ul>
      <p className="text-gray text-semibold"> What is a premium job posting?</p>
      <ul>
        <li className="text-gray-light"> The premium job posting feature allows you to attract more candidates within a short span of time. You can select a pricing plan according to your needs during Job Posting.</li>
      </ul>
      <p className="text-gray text-semibold"> I want to post a walk-in Job. What should I do?</p>
      <ul>
        <li className="text-gray-light">{`Posting a walk-in Job on ${String(LinksConstants.APP_NAME).toLowerCase()} is very easy. Just select “I want candidates to Walk-in Directly” option during Job Posting and Provide the walk-in Slots and Interview Address.`}</li>
      </ul>
      <p className="text-gray text-semibold"> How many Cities can be added in a Job?</p>
      <ul>
        <li className="text-gray-light"> You can add only 1 City and 5 Localities in a Job posting. In Case you have the same requirements in Multiple Cities, Please post new jobs for the same.</li>
        <li className="text-gray-light"> You can use “Duplicate Jobs” feature to Duplicate the Job details of the existing Job Posting.</li>
      </ul>
    </div>
    <div className="second-title">
      <h4 className="text-gray text-semibold">Job Posting Guidelines</h4>
    </div>
    <div className="modal-content">
      <p className="text-gray text-semibold"> Your Job and Account may be deleted in case we find that your Job Posting violates below guidelines: </p>
      <ul>
        <li className="text-gray-light"> Your job post should not express discrimination based on religion, race, gender, caste, nationality and it should not be defamatory or disrespectful towards any third party.</li>
        <li className="text-gray-light"> fraudulent jobs is strictly prohibited. Indulging in fraudulent activities will result in the permanent deletion of your account.</li>
      </ul>
    </div>
  </>
);

const JobPostingGuidelines = (): JSX.Element => {
  const [visible, setvisible] = useState(false);
  return (
    <>
      <Button type="link" className="p-all-0" onClick={(): void => setvisible(true)}>
        Job Posting Queries and Guidelines
      </Button>
      <Modal
        visible={visible}
        title={<h4 className="text-gray text-semibold">Job Posting Queries</h4>}
        width={isMobile ? 700 : '50%'}
        onCancel={(): void => setvisible(false)}
        className={isMobile ? 'full-screen-modal job-posting-guidelines-modal' : 'job-posting-guidelines-modal'}
        footer={[
          <Button
            key="submit"
            type="primary"
            onClick={(): void => setvisible(false)}
          >
            Cancel
          </Button>,
        ]}
        bodyStyle={{ height: isMobile ? '82%' : '60vh', overflow: 'auto' }}
      >
        <ModalContent />
      </Modal>
    </>
  );
};
export default JobPostingGuidelines;
