/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-restricted-syntax */
import dayjs from 'dayjs';
import router from 'routes';
import isEmpty from 'lodash/isEmpty';
import qs from 'query-string';

const today = `interview_date:${dayjs().format('YYYY-MM-DD')}--to--${dayjs().format('YYYY-MM-DD')}`;
const tomorrow = `interview_date:${dayjs().add(1, 'day').format('YYYY-MM-DD')}--to--${dayjs().add(1, 'day').format('YYYY-MM-DD')}`;

const getQueryString = (params = []): any => {
  const query = {} as any;

  // eslint-disable-next-line no-param-reassign
  for (const param of params) {
    Object.assign(query, param);
  }

  if (query.interviewtoday) {
    query.interview_date = today;
    delete query.interviewtoday;
  }
  if (query.interviewtomorrow) {
    query.interview_date = tomorrow;
    delete query.interviewtomorrow;
  }
  if (query.Database) {
    delete query.Database;
  }
  return query;
};
interface UrlParams {
  filter?: string[],
}

export const setUrlParams = (params: any): void => {
  // console.log('params', params);
  const tabParam = params.find((p) => p.tab);
  const pageNum = params.find((p) => p.page);
  const query = getQueryString(params);
  const options = {
    scroll: false,
  };

  // if (pageNum) { delete query.page; }
  if (!isEmpty(query)) {
    if (tabParam) {
      delete query.tab;
      if (pageNum) delete query.page;

      router.Router.pushRoute('Candidates', {
        tab: tabParam.tab,
        filter: qs.stringify(query),
        page: pageNum?.page,
      }, options);
    } else {
      router.Router.pushRoute('Candidates', {
        tab: 'applications',
        filter: qs.stringify(query),
        page: pageNum?.page,
      }, options);
    }
  } else {
    router.Router.pushRoute('Candidates', { tab: 'applications' });
  }
};

export const getUrlParams = (queryParams): UrlParams | null => {
  // const params = router.Router.query && router.Router.query.filter;
  const params = (queryParams && queryParams.filter) || '';
  if (params) {
    const keys = Object.keys(qs.parse(params));
    return {
      filter: keys,
    };
  }
  return null;
};
