/* eslint-disable import/prefer-default-export */
/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiConstants from 'constants/api-constants';
import {
  get,
} from 'service/api-method';

export const getFAQ = async (limit = 1000):Promise<any> => {
  const apiResponse = await get(`${ApiConstants.FAQ}?limit=${limit}`);
  const data = await apiResponse.data;
  return data;
};

export const getKnowledgeBases = async (limit = 1000):Promise<any> => {
  const apiResponse = await get(`${ApiConstants.KNOWLEDGE_BASE}?limit=${limit}`);
  const data = await apiResponse.data;
  return data;
};
