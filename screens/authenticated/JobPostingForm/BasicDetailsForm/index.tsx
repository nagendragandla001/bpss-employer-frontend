/* eslint-disable camelcase */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
import { useLazyQuery } from '@apollo/client';
import {
  Alert, Checkbox,
  Col, Form, Input, Radio, Row, Space, TimePicker, Typography,
} from 'antd';
import { FormInstance } from 'antd/lib/form';
import { IDefaultJobInfo, IJobPost } from 'common/jobpost.interface';
import JobPostingGuidelines from 'components/Guidelines/JobPostingGuide';
import HiringCompany from 'components/JobPosting/HiringCompany';
import JobCategory from 'components/JobPosting/JobCategory';
import JobCity from 'components/JobPosting/JobCity';
import JobOpenings from 'components/JobPosting/JobOpenings';
import JobRole from 'components/JobPosting/JobRole';
import JobType from 'components/JobPosting/JobType';
import Locality from 'components/JobPosting/Locality';
import OrgDetails from 'components/JobPosting/OrgDetails';
import TextEditor from 'components/JobPosting/TextEditor';
import WorkDay from 'components/JobPosting/WorkDay';
import Container from 'components/Layout/Container';
// import UnifiedEmailModal from 'components/UnverifiedEmailNotification/UnverifiedEmailModal';
import UnverifiedModal from 'components/UnverifiedEmailNotification/UnverifiedModal';
// import UnverifiedEmailModal from 'components/UnverifiedEmailNotification/UnverifiedModal';
import CustomImage from 'components/Wrappers/CustomImage';
import { AppConstants, JobPostingConfig } from 'constants/index';
import Salary from 'constants/salary-constats';
import { ADD, notificationContext } from 'contexts/notificationContext';
import moment from 'moment';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import router from 'routes';
import PushFormCleverTapEvents from 'screens/authenticated/JobPostingForm/BasicDetailsForm/PushFormClevertapEvents.util';
import {
  functionalAreaDescriptionAPI, getJobDetailsData,
  newJobAPI, onValidateDescription, patchJobAPI,
} from 'service/job-posting-service';
import { registerOrgAPI } from 'service/login-service';
import { logEvent, logGtagEvent } from 'utils/analytics';
import { getMarketingSource } from 'utils/browser-utils';
import { pushClevertapEvent } from 'utils/clevertap';
import {
  defaultApiGraphqlQuery,
  locationDiff,
  prepareDefaultJobDataRequest, prepareDuplicateJobDataRequest, prepareJobDetailsPatchObj,
} from 'utils/index';
import {
  functionalAreaElasticFilter, getFlatDefaultJobData, getFlatJobData,
} from 'utils/job-posting-utils';

require('screens/authenticated/JobPostingForm/BasicDetailsForm/BasicDetailsForm.less');

const { Text } = Typography;
interface PropsInterface {
  form: FormInstance;
  isNewUser: boolean;
  setIsNewUser: (state: boolean) => void;
  userDetails: any;
  orgStore: any;
  jpCredits: any;
}

const GuideLinesMessage = (
  <>
    Your job posting does not meet our rules. Please check
    {' '}
    <JobPostingGuidelines />
    {' '}
  </>
);

const JobPostJobDetailsComponent = (props: PropsInterface): JSX.Element => {
  const {
    form, isNewUser, setIsNewUser, userDetails, orgStore, jpCredits,
  } = props;
  const { dispatchNotification } = useContext(notificationContext);
  const nextRouter = useRouter();

  const [geometry, setGeometry] = useState({});
  const [isFormFilled, setIsFormFilled] = useState(true);
  const [visibleCompany, setVisibleCompany] = useState(false);
  const [emailNotFound, setEmailNotFound] = useState(false);

  const [duplicateJob, setDuplicateJob] = useState({
    id: '',
    city: '',
    locality: { value: '', label: '' },
    title: '',
    categoryName: '',
  });
  const [cleverTapElements, setCleverTapElements] = useState({
    jobTitle: true,
    functionalArea: true,
    ownCompany: true,
    hiringOrgName: true,
    cityName: true,
    employmentType: true,
    salaryFormat: true,
    minOfferedSalary: true,
    maxOfferedSalary: true,
    openings: true,
    shiftTimings: true,
    description: true,
  });
  const [workDaysInteract, setworkDays] = useState(false);
  const [state, setState] = useState<IJobPost>({
    disableFA: false,
    disableFields: false,
  } as IJobPost);

  const [defaultJobInfo, setDefaultJobInfo] = useState<IDefaultJobInfo>({} as IDefaultJobInfo);

  const [fetchGraphqlData, {
    error, data: defaultData,
  }] = useLazyQuery(defaultApiGraphqlQuery, {
    fetchPolicy: 'network-only',
  });

  // const handleCompanyChange = (e): void => {
  //   pushClevertapEvent('Job posting for', {
  //     Type: (e.target.checked ? 'yes' : 'no') || 'NA',
  //   });
  //   setVisibleCompany(e.target.checked);
  //   if (e.target.checked === false) {
  //     setState((prev) => ({
  //       ...prev,
  //       hiringOrgName: '',
  //     }));
  //   }
  //   form.setFieldsValue({ hiringOrgName: '' });
  // };

  const createOrgPostObj = (obj): unknown => {
    const formObj = obj;
    const marketing_source = getMarketingSource();
    const postObj = {
      managers: [{
        user_id: userDetails.id,
        first_name: formObj?.firstName || null,
        last_name: formObj?.lastName || null,
        marketing_source: marketing_source || null,
        type: 'P',
      }],
      company_id: formObj?.company_id || null,
      name: formObj?.companyName || null,
      type: formObj?.type || null,
    };
    return postObj;
  };

  const onSubmitError = ({ errorFields }): void => {
    const formErrors = props.form.getFieldsError();
    const firstErr = errorFields.some((el) => el.name[0] === 'title' || el.name[0] === 'functionalArea');
    if (firstErr) {
      window.scrollTo(0, 0);
    } else {
      const secondErr = errorFields.some((el) => el.name[0] === 'cityName' || el.name[0] === 'locality');
      if (secondErr) {
        window.scrollTo(120, 120);
      }
    }
    const errors = formErrors && formErrors
      .filter((t) => t.errors.length)
      .map((x) => x.name && x.name[0]);
  };

  const onSubmit = async (formData): Promise<void> => {
    if (!visibleCompany) {
      formData.hiringOrgName = '';
      formData.ownCompany = false;
    }

    if (window?.localStorage?.getItem('new_user') === '1') {
      const orgPostObj = createOrgPostObj(formData);
      const res = await registerOrgAPI(orgPostObj);
      if ([200, 201, 202].includes(res.status)) {
        window?.localStorage?.setItem('new_user', '0');
      }
    }
    const trackObjSubmit = {
      category: 'job_post',
      action: 'basic_info_submit',
      label: 'basic_info',
      nonInteraction: false,
    };
    logEvent(trackObjSubmit);

    formData.shiftStartTime = moment(formData.shiftStartTime).format('HH:mm:ss').toString();
    formData.shiftEndTime = moment(formData.shiftEndTime).format('HH:mm:ss').toString();
    formData.workDays = state?.workDays?.length || 5;

    // New Job Posting
    if (!state.id && !duplicateJob.id) {
      const obj = prepareDefaultJobDataRequest(formData, defaultJobInfo);
      const response = await newJobAPI(obj);
      if ([200, 201, 202].includes(response?.status)) {
        if (response?.data?._id) {
          // replacing the /add/new url, to handle the case when user
          // presses on browser back button
          if (window && window.history) {
            window.history.replaceState({
              url: `/jobPostFormStep1a?id=${response.data._id}`,
              as: `/employer-zone/job-posting/edit/${response.data._id}/job-specs/`,
            }, '', `/employer-zone/job-posting/edit/${response.data._id}/job-specs/`);
          }

          const trackObjDraft = {
            category: 'job_post',
            action: 'basic_info_draft',
            label: 'basic_info',
            nonInteraction: false,
          };
          logEvent(trackObjDraft);
          logGtagEvent('job_post_draft');

          // pushClevertapEvent('job_specs_submit', { Type: 'Job Posting' });
          if (isNewUser) {
            pushClevertapEvent('First Job Post', {
              Type: 'First Job Post Continue',
              FA: state?.functionalArea?.name,
              city: state?.cityName,
              locality: state?.locality?.label,
              vacancies: state?.vacancies,
              jobRole: state?.title,
              callHR: formData?.callHR === true,
            });
          } else {
            pushClevertapEvent('New Job Post', {
              Type: 'New Job Post Continue',
              FA: state?.functionalArea?.name,
              city: state?.cityName,
              locality: state?.locality?.label,
              vacancies: state?.vacancies,
              jobRole: state?.title,
              callHR: formData?.callHR === true,
              'JP Credits': jpCredits,
            });
          }
          router.Router.pushRoute('CandidateSpecs', { id: response.data._id });
        }
      } else if (response.response.status === 403) {
        setEmailNotFound(true);
      } else {
        // Error Notification
        dispatchNotification({
          type: ADD,
          payload: {
            title: 'Job Posting Form - Job Details',
            description: 'Not able to save job right now please try again later ',
            iconName: '',
            notificationType: 'error',
            placement: 'topRight',
            duration: 4,
          },
        });
      }
    } else if (duplicateJob.id) {
      if (!locationDiff(
        formData.cityName, formData.locality, duplicateJob.city, duplicateJob.locality,
      )) {
        dispatchNotification({
          type: ADD,
          payload: {
            title: 'Job Posting Form - Job Details',
            description: 'Localities cannot be the same',
            iconName: '',
            notificationType: 'error',
            placement: 'topRight',
            duration: 4,
          },
        });
        return;
      }
      const postObj = prepareDuplicateJobDataRequest(formData, state);

      const response = await newJobAPI(postObj);
      if ([200, 201, 202].includes(response?.status)) {
        if (response?.data?._id) {
          router.Router.pushRoute('CandidateSpecs', { id: response.data._id });
        }
      } else if (response.response.status === 403) {
        setEmailNotFound(true);
      } else {
        // Error Notification
        dispatchNotification({
          type: ADD,
          payload: {
            title: 'Job Posting Form - Job Details',
            description: 'Not able to save job right now please try again later ',
            iconName: '',
            notificationType: 'error',
            placement: 'topRight',
            duration: 4,
          },
        });
      }
    } else {
      // Existing Job Posting
      const postObj = prepareJobDetailsPatchObj(formData);
      const response = await patchJobAPI(postObj, state.id);
      if ([200, 201, 202].includes(response?.status)) {
        const trackObjSuccess = {
          category: 'job_post',
          action: 'basic_info_success',
          label: 'basic_info',
          nonInteraction: false,
        };
        logEvent(trackObjSuccess);
        const step1ClevertapObj = {
          Type: 'Success',
          'Company Name': formData?.hiringOrgName || 'NA',
          'Approval Type': (formData?.clientApprovalRequired ? 'ncar' : 'car') || 'NA',
        };
        // pushClevertapEvent('job_specs_submit', step1ClevertapObj);
        router.Router.pushRoute('CandidateSpecs', { id: state.id });
      } else {
        // Error Notification
        dispatchNotification({
          type: ADD,
          payload: {
            title: 'Job Posting Form - Job Details',
            description: 'Not able to save job right now please try again later ',
            iconName: '',
            notificationType: 'error',
            placement: 'topRight',
            duration: 4,
          },
        });
      }
    }
  };

  const getGeometry = (geoData): void => {
    setGeometry(geoData);
  };

  const onValuesChanged = (formData): void => {
    if (isFormFilled) {
      const trackObj = {
        category: 'job_post',
        action: 'basic_info_start',
        label: 'basic_info',
        nonInteraction: false,
      };
      logEvent(trackObj);
      if (isNewUser) {
        pushClevertapEvent('First Job Post', {
          Type: 'First Job Post Start',
        });
      } else if (!state.id) {
        pushClevertapEvent('New Job Post', {
          Type: 'New Job Post Start',
          'JP Credits': jpCredits,
        });
      }
      setIsFormFilled(false);
    }

    // PushFormCleverTapEvents(formData, cleverTapElements, setCleverTapElements, isNewUser);

    // Need to figure this out, a new debounced function is getting created
    // each time the function is called
    // const debounceCall = debounce(
    //   () => PushFormCleverTapEvents(
    //     formData, cleverTapElements, setCleverTapElements, isNewUser,
    //   ), 3000,
    // );
    // debounceCall();
  };

  const salaryValidations = (_rule, value): Promise<void> => {
    let minVal = form.getFieldValue('minOfferedSalary');
    let maxVal = form.getFieldValue('maxOfferedSalary');

    const val = !Number.isNaN(Number(value)) ? parseInt(value, 10) : null;
    if (_rule.field === 'minOfferedSalary') {
      minVal = val;
    } else if (_rule.field === 'maxOfferedSalary') {
      maxVal = val;
    }

    if (minVal !== null && maxVal !== null) {
      if (_rule.field === 'minOfferedSalary' && minVal !== null) {
        if (state.employmentType === 'FT' && minVal < Salary.MONTHLY_MIN_FT) {
          return Promise.reject(new Error(Salary.MONTHLY_MIN_FT_MESSAGE));
        }
        if (minVal < Salary.MONTHLY_MIN_NON_FT) {
          return Promise.reject(new Error(Salary.MONTHLY_MIN_NON_FT_MESSAGE));
        }
        if (minVal > Salary.MONTHLY_MIN_MAX) {
          return Promise.reject(new Error(Salary.MONTHLY_MIN_MAX_MESSAGE));
        }
        // }
      } else if (_rule.field === 'maxOfferedSalary' && maxVal !== null) {
        if (maxVal < minVal) {
          return Promise.reject(new Error('The minimum salary cannot be greater than maximum salary'));
        }

        if (state.employmentType === 'FT' && maxVal < Salary.MONTHLY_MIN_FT) {
          return Promise.reject(new Error(Salary.MAX_MONTHLY_MIN_FT_MESSAGE));
        }
        if (maxVal < Salary.MONTHLY_MIN_NON_FT) {
          return Promise.reject(new Error(Salary.MAX_MONTHLY_MIN_NON_FT_MESSAGE));
        }
        if (maxVal > Salary.MONTHLY_MAX) {
          return Promise.reject(new Error(Salary.MAX_MONTHLY_MAX_MESSAGE));
        }
        // }
      }
    }
    return Promise.resolve();
  };

  const jobCategoryHandler = async (category): Promise<void> => {
    setState((prev) => ({
      ...prev,
      functionalArea: { id: category.value, name: category.label },
    }));

    if (category?.value) {
      fetchGraphqlData({
        variables: {
          functional_area_id: category.value,
        },
      });
    }

    const filters = functionalAreaElasticFilter(category.value);
    const response = await functionalAreaDescriptionAPI(filters);

    const description = response?.objects[0]?.jobs_fa_description
    || 'Require highly motivated people, good learning opportunities';

    setState((prev) => ({
      ...prev,
      description,
    }));
    form.setFieldsValue({
      description,
    });
  };

  const jobRoleHandler = (jobRole): void => {
    if (jobRole?.functional_areas) {
      form.setFieldsValue({
        functionalArea: jobRole?.functional_areas,
      });
      setState((prev) => ({
        ...prev,
        disableFA: !!jobRole.functional_areas,
        functionalArea: { id: jobRole?.functional_areas, name: '' },
      }));
      // jobCategoryHandler({ value: jobRole?.functional_areas, name: '' });
    } else {
      form.setFieldsValue({
        functionalArea: '',
      });
      setState((prev) => ({
        ...prev,
        disableFA: false,
      }));
    }
    setState((prevState) => ({
      ...prevState,
      title: jobRole?.job_designation,
    }));
  };

  const hiringCompanyHandler = (value): void => {
    setState((prev) => ({
      ...prev,
      hiringOrgName: value,
    }));
  };

  const employmentTypeHandler = (value): void => {
    setState((prev) => ({
      ...prev,
      employmentType: value,
    }));
  };

  const vacanciesHandler = (value: number | null): void => {
    setState((prev) => ({
      ...prev,
      vacancies: value || 0,
    }));
  };

  const cityChangeHandler = (value): void => {
    setState((prev) => ({
      ...prev,
      cityName: value,
    }));
  };

  const localityHandler = (locality): void => {
    setState((prev) => ({
      ...prev,
      locality: { value: locality.place_id, label: locality.description },
    }));
  };

  const workingDayChangeHandler = (tag, checked): void => {
    if (!workDaysInteract) {
      // pushClevertapEvent('Workdays', {
      //   Type: 'Job Posting',
      // });

      setworkDays(true);
    }
    const nextSelectedTags = checked ? [...state?.workDays, tag]
      : state.workDays.filter((t) => t !== tag);
    setState((prev) => ({
      ...prev,
      workDays: nextSelectedTags,
    }));
  };

  const shiftTypeHandler = (value): void => {
    // pushClevertapEvent('Shift timing type', {
    //   Type: 'Job Posting',
    // });
    setState((prev) => ({
      ...prev,
      shiftType: value,
    }));
    if (value.target.value === 'DAY') {
      form.setFieldsValue({ shiftStartTime: moment('09:00 AM', 'HH:mm') });
      form.setFieldsValue({ shiftEndTime: moment('18:00 PM', 'HH:mm') });
    } else {
      form.setFieldsValue({ shiftStartTime: moment('22:00 PM', 'HH:mm') });
      form.setFieldsValue({ shiftEndTime: moment('07:00 AM', 'HH:mm') });
    }
  };

  const shiftStartTimeChangeHandler = (value): void => {
    if (cleverTapElements.shiftTimings) {
      pushClevertapEvent('Shift timing', {
        Type: 'Job Posting',
      });
      setCleverTapElements((prev) => ({
        ...prev,
        shiftTimings: false,
      }));
    }
    setState((prev) => ({
      ...prev,
      shiftStartTime: value,
    }));
  };

  const shiftEndTimeChangeHandler = (value): void => {
    if (cleverTapElements.shiftTimings) {
      pushClevertapEvent('Shift timing', {
        Type: 'Job Posting',
      });
      setCleverTapElements((prev) => ({
        ...prev,
        shiftTimings: false,
      }));
    }
    setState((prev) => ({
      ...prev,
      shiftStartTime: value,
    }));
  };

  const minSalaryChangeHandler = (value): void => {
    setState((prevState) => ({
      ...prevState,
      minOfferedSalary: value,
    }));
  };

  const maxSalaryChangeHandler = (value): void => {
    setState((prevState) => ({
      ...prevState,
      maxOfferedSalary: value,
    }));
  };

  const handleTextEditorChange = (content): void => {
    setState((prev) => ({
      ...prev,
      description: content,
    }));
  };

  const validateDescription = async (_rule, value): Promise<void> => {
    const data = await onValidateDescription(_rule, value);

    switch (data) {
      case 'required': {
        return Promise.reject(new Error('Please enter about job description'));
      }
      case 'special_characters': {
        return Promise.reject(new Error('Only alphabets numbers and . / - ‘ ( )  are allowed'));
      }
      case 'minLength': {
        return Promise.reject(new Error('Min length of 30 is required in job description'));
      }
      case 'maxLength': {
        return Promise.reject(new Error('Please use job description with less than 500 charachters'));
      }
      case 'profane_words': {
        return Promise.reject(GuideLinesMessage);
      }
      default: {
        return Promise.resolve();
      }
    }
  };

  const fetchJobDetails = async (): Promise<void> => {
    if (nextRouter?.query?.id) {
      const response = await getJobDetailsData(nextRouter.query.id as string);
      setState((prev) => ({
        ...prev,
        ...response,
        disableFA: true,
        disableFields: ['J_D', 'J_O'].includes(response.state) && response.stage !== 'J_UA',
      }));
      form.setFieldsValue({
        title: response.title,
        functionalArea: response.functionalArea.id,
        ownCompany: response.hiringOrgName !== '',
        hiringOrgName: response.hiringOrgName,
        clientApprovalRequired: response.clientApprovalRequired,
        callHR: response.shareContact,
        employmentType: response.employmentType,
        vacancies: response.vacancies,
        cityName: response.cityName,
        locality: response.locality,
        workDays: response.workDays,
        shiftStartTime: moment(response.shiftStartTime, 'HH:mm'),
        shiftEndTime: moment(response.shiftEndTime, 'HH:mm'),
        shiftType: response.shiftType,
        minOfferedSalary: response.minOfferedSalary,
        maxOfferedSalary: response.maxOfferedSalary,
        description: response.description,
      });
      setVisibleCompany(response.hiringOrgName !== '');
    } else if (nextRouter?.query?.duplicateId) {
      const response = await getJobDetailsData(nextRouter.query.duplicateId as string);
      setState((prev) => ({
        ...prev,
        ...response,
        disableFA: false,
        disableFields: false,
      }));
      setDuplicateJob({
        id: response.id,
        title: response.title,
        city: response.cityName,
        locality: response.locality,
        categoryName: response.functionalArea.name,
      });
      form.setFieldsValue({
        title: response.title,
        functionalArea: response.functionalArea.id,
        ownCompany: response.hiringOrgName !== '',
        hiringOrgName: response.hiringOrgName,
        clientApprovalRequired: response.clientApprovalRequired,
        callHR: response.shareContact,
        employmentType: response.employmentType,
        vacancies: response.vacancies,
        workDays: response.workDays,
        shiftStartTime: moment(response.shiftStartTime, 'HH:mm'),
        shiftEndTime: moment(response.shiftEndTime, 'HH:mm'),
        shiftType: response.shiftType,
        minOfferedSalary: response.minOfferedSalary,
        maxOfferedSalary: response.maxOfferedSalary,
        description: response.description,
      });
      setVisibleCompany(response.hiringOrgName !== '');
    } else {
      const emptyJobData = getFlatJobData();
      setState({ ...emptyJobData, disableFA: true });
    }
    setVisibleCompany(['HR', 'IND'].includes(orgStore?.type));
  };

  useEffect(() => {
    fetchJobDetails();
  }, []);

  useEffect(() => {
    if (defaultData) {
      if (defaultData?.jobFADefaults?.length > 0) {
        setDefaultJobInfo(getFlatDefaultJobData(defaultData.jobFADefaults[0]));
        form.setFieldsValue({
          employmentType: defaultData.jobFADefaults[0]?.employment_type,
          shiftStartTime: moment(defaultData.jobFADefaults[0]?.shift[0]?.work_start_time, 'HH:mm'),
          shiftEndTime: moment(defaultData.jobFADefaults[0]?.shift[0]?.work_end_time, 'HH:mm'),
          shiftType: defaultData.jobFADefaults[0]?.shift[0]?.type,
          minOfferedSalary: defaultData.jobFADefaults[0]?.salary_details?.min_salary,
          maxOfferedSalary: defaultData.jobFADefaults[0]?.salary_details?.max_salary,
        });
      }
    }
  }, [error, defaultData]);

  const orgTypeChangeHandler = (type: string): void => {
    setVisibleCompany(['HR', 'IND'].includes(type));
  };

  return (
    <Container>
      {/* SEO Stuff Start */}
      <Head>
        <title>
          {`Add Job Details | ${AppConstants.APP_NAME}`}
        </title>
        <meta
          name="description"
          content={`Add Job Details | ${AppConstants.APP_NAME}`}
          key="description"
        />
      </Head>
      {/* SEO Stuff Ends */}
      <Row gutter={[32, 32]}>
        {emailNotFound && <UnverifiedModal isEmailModalVisible />}
        {duplicateJob.id ? (
          <Col span={24}>
            <Alert
              message={(
                <Space size={20}>
                  <Text strong>
                    {`${duplicateJob.title} job Duplicated`}
                    {'    '}
                  </Text>
                  <Text type="secondary">
                    {`Details from your job ${duplicateJob.categoryName} have been copied. Add city and locality to Continue`}
                  </Text>
                </Space>
              )}
              type="info"
              closable
              className="duplicate-job-banner"
            />
          </Col>
        ) : null}

        <Col span={24}>
          <Form
            name="Job-Posting-Step1a"
            form={form}
            onFinish={onSubmit}
            onFinishFailed={onSubmitError}
            scrollToFirstError
            layout="vertical"
            hideRequiredMark
            size="large"
            onValuesChange={onValuesChanged}
            initialValues={{
              employmentType: 'FT',
              vacancies: 1,
              shiftType: 'DAY',
              shiftStartTime: moment('09:00 AM', 'HH:mm'),
              shiftEndTime: moment('18:00 PM', 'HH:mm'),
              minOfferedSalary: 15000,
              maxOfferedSalary: 25000,
            }}
          >
            {window?.localStorage?.getItem('new_user') === '1' && (
              <OrgDetails
                onChange={orgTypeChangeHandler}
                isNewUser={isNewUser}
              />
            )}
            {
              (visibleCompany) && (
                <Row gutter={{ xs: 40, lg: 60 }}>
                  <Col xs={{ span: 22 }} lg={{ span: 12 }}>
                    <HiringCompany
                      form={form}
                      selectHandler={hiringCompanyHandler}
                      visible={visibleCompany}
                    />
                  </Col>
                </Row>
              )
            }
            <Row gutter={{ xs: 40, lg: 60 }}>
              <Col xs={{ span: 22 }} lg={{ span: 12 }}>
                <JobRole updateJobRole={jobRoleHandler} disabled={state.disableFields} />
              </Col>
              <Col xs={{ span: 22 }} lg={{ span: 12 }}>
                <JobCategory
                  name="functionalArea"
                  label="Job Category"
                  selectHandler={jobCategoryHandler}
                  disabled={state.disableFA}
                  showArrow={false}
                  faId={state?.functionalArea?.id}
                />
              </Col>
            </Row>

            <Row gutter={{ xs: 40, lg: 60 }}>
              <Col xs={{ span: 22 }} lg={{ span: 12 }} className="m-v-auto">
                <Row align="middle">
                  {/* Hiring Organisation */}
                  {/* <Col xs={{ span: 22 }} lg={{ span: 24 }}>
                    <Form.Item
                      name="ownCompany"
                      valuePropName="checked"
                      style={{ marginBottom: visibleCompany ? 0 : 0 }}
                    >
                      <Checkbox onChange={handleCompanyChange}>
                        {JobPostingConfig.ownCompany.label}
                      </Checkbox>
                    </Form.Item>
                  </Col> */}
                  {/* Call HR */}
                  <Col xs={{ span: 22 }} lg={{ span: 24 }}>
                    <Form.Item
                      name={JobPostingConfig.callHR.name}
                      valuePropName="checked"
                      style={{ marginBottom: 0 }}
                    >
                      <Checkbox>
                        {JobPostingConfig.callHR.label}
                      </Checkbox>
                    </Form.Item>
                  </Col>
                  {/* Allow Direct Interviews */}
                  <Col xs={{ span: 22 }} lg={{ span: 24 }} className="m-b-16">
                    <Form.Item
                      name={JobPostingConfig.clientApprovalRequired.name}
                      valuePropName="checked"
                      style={{ marginBottom: 0 }}
                    >
                      <Checkbox
                        // onChange={handleDirectInterviews}
                        disabled={['J_D', 'J_O'].includes(state.state) && state.stage !== 'J_UA' && !duplicateJob.id}
                      >
                        {JobPostingConfig.clientApprovalRequired.label}
                      </Checkbox>
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
            </Row>

            <Row gutter={{ xs: 40, lg: 60 }}>
              <Col xs={{ span: 24 }} lg={{ span: 12 }}>
                <JobType updateJobType={employmentTypeHandler} />
              </Col>
              <Col xs={{ span: 22 }} lg={{ span: 8 }}>
                <JobOpenings updateJobOpenings={vacanciesHandler} />
              </Col>
            </Row>

            <Row gutter={{ xs: 40, lg: 60 }}>
              <Col xs={{ span: 22 }} lg={{ span: 12 }}>
                <JobCity
                  city={state.cityName}
                  callback={getGeometry}
                  disabled={state.disableFields}
                  selectHandler={cityChangeHandler}
                />
              </Col>
              <Col xs={{ span: 22 }} lg={{ span: 12 }}>
                <Locality
                  city={state.cityName}
                  geometry={geometry}
                  selectedLocality={localityHandler}
                  disabled={state.disableFields}
                />
              </Col>
            </Row>

            <Row gutter={{ xs: 40, lg: 60 }}>
              <Col xs={{ span: 24 }} lg={{ span: 12 }}>
                <WorkDay workDays={state?.workDays} updateWorkDay={workingDayChangeHandler} />
              </Col>
              <Col xs={{ span: 24 }} lg={{ span: 12 }}>
                <Row gutter={{ xs: 40, lg: 60 }}>
                  <Col xs={{ span: 24 }} lg={{ span: 0 }}>
                    <Form.Item
                      name={JobPostingConfig.shiftType.name}
                      label={JobPostingConfig.shiftType.label}
                    >
                      <Radio.Group
                        size="large"
                        className="radio-buttons text-base"
                        onChange={shiftTypeHandler}
                      >
                        <Radio.Button value="DAY" style={{ width: '120px' }} className=" selected-values">
                          <Space align="center">
                            {/* Need to work to CustomImage Component to fix alignments */}
                            <img src="/images/job-posting/sun.png" alt="education" />
                            Day
                          </Space>
                        </Radio.Button>
                        <Radio.Button value="NIGHT" style={{ width: '120px', marginLeft: '3rem' }} className=" selected-values">
                          <Space align="center">
                            {/* Need to work to CustomImage Component to fix alignments */}
                            <img src="/images/job-posting/night.svg" alt="education" />
                            Night
                          </Space>
                        </Radio.Button>
                      </Radio.Group>
                    </Form.Item>

                  </Col>
                  <Col xs={{ span: 0 }} lg={{ span: 12 }}>

                    <Form.Item
                      name={JobPostingConfig.shiftType.name}
                      label={JobPostingConfig.shiftType.label}
                    >
                      <Radio.Group
                        size="small"
                        className="radio-buttons text-base"
                        onChange={shiftTypeHandler}
                      >
                        <Radio.Button
                          value="DAY"
                          className="selected-values"
                        >
                          <Space align="center">
                            {/* Need to work to CustomImage Component to fix alignments */}
                            <img src="/images/job-posting/sun.png" alt="education" />
                            Day
                          </Space>
                        </Radio.Button>
                        <Radio.Button
                          value="NIGHT"
                          className=" selected-values"
                        >
                          <Space align="center">
                            <img src="/images/job-posting/night.svg" alt="education" />
                            Night
                          </Space>
                        </Radio.Button>
                      </Radio.Group>
                    </Form.Item>
                  </Col>

                  <Col xs={{ span: 24 }} lg={{ span: 12 }}>
                    <Row justify="space-between" align="middle">
                      <Col xs={{ span: 9 }} lg={{ span: 10 }}>
                        <Form.Item
                          name={JobPostingConfig.shiftStartTime.name}
                          label={JobPostingConfig.shiftStartTime.label}
                          className="selected-values shift-timing"
                        >
                          <TimePicker
                            minuteStep={30}
                            size="middle"
                            format="HH:mm"
                            suffixIcon={null}
                            allowClear={false}
                            className="text-base shift-timing"
                            inputReadOnly
                            placeholder="From"
                            showNow={false}
                            onChange={shiftStartTimeChangeHandler}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={2}>
                        <CustomImage
                          src="/images/common/two-sided-arrow.svg"
                          alt="seperator"
                          height={48}
                          width={48}
                        />
                      </Col>
                      <Col xs={{ span: 9 }} lg={{ span: 10 }}>
                        <Form.Item
                          name={JobPostingConfig.shiftEndTime.name}
                          label={JobPostingConfig.shiftEndTime.label}
                          className="selected-values"
                        >
                          <TimePicker
                            minuteStep={30}
                            size="middle"
                            format="HH:mm"
                            suffixIcon={null}
                            allowClear={false}
                            className="text-base shift-timing"
                            inputReadOnly
                            placeholder="To"
                            showNow={false}
                            onChange={shiftEndTimeChangeHandler}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row gutter={{ xs: 40, lg: 60 }}>
              <Col xs={{ span: 24 }} lg={{ span: 12 }}>
                <Form.Item label="Monthly Salary Range">
                  <Row gutter={12} align="top">
                    <Col xs={{ span: 10 }} lg={{ span: 8 }}>
                      <Form.Item
                        name="minOfferedSalary"
                        validateFirst
                        rules={[
                          {
                            required: true,
                            message: 'Please input minimum salary!',
                          },
                          {
                            validator: salaryValidations,
                          },
                        ]}
                        dependencies={['maxOfferedSalary']}
                        style={{ marginBottom: 8 }}
                        className="selected-values"
                        // extra={minSalaryWarnings()}
                      >
                        <Input
                          type="number"
                          min={1}
                          className="text-base"
                          onChange={minSalaryChangeHandler}
                          prefix="₹"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={{ span: 3 }} lg={{ span: 2 }} style={{ paddingTop: '12px' }}>
                      <CustomImage
                        src="/images/common/two-sided-arrow.svg"
                        alt="seperator"
                        height={48}
                        width={48}
                      />
                    </Col>
                    <Col xs={{ span: 10 }} lg={{ span: 8 }}>
                      <Form.Item
                        name="maxOfferedSalary"
                        rules={[
                          {
                            required: true,
                            message: 'Please input maximum salary!',
                          },
                          { validator: salaryValidations },
                        ]}
                        dependencies={['minOfferedSalary']}
                        style={{ marginBottom: 8 }}
                        className="selected-values"
                        // extra={maxSalaryWarnings()}
                      >
                        <Input
                          type="number"
                          min={1}
                          className="text-base"
                          onChange={maxSalaryChangeHandler}
                          prefix="₹"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col xs={{ span: 22 }} lg={{ span: 18 }}>
                <Form.Item
                  name="description"
                  label="Job Description"
                  validateFirst
                  rules={[
                    {
                      validator: validateDescription,
                    },
                  ]}
                  extra={(
                    <Space>
                      <CustomImage
                        className="form-help-text"
                        src="/icons/tooltip.svg"
                        height={10}
                        width={9}
                        alt="icon"
                      />
                      <Text className="form-help-text">Maximum 500 characters allowed.</Text>
                    </Space>
                  )}
                >
                  <TextEditor
                    value={state.description || ''}
                    onChange={handleTextEditorChange}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default JobPostJobDetailsComponent;
