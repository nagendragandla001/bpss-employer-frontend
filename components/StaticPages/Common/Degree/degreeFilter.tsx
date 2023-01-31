/* eslint-disable import/prefer-default-export */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type

interface IReturnType{
  [key:string]: {
    [key:string]:{
      [key:string]:number
    }
  }
}
export const degreeElasticFilter = (filtersValue: number): IReturnType => {
  const filters = { and: {} };
  if (filtersValue) {
    // eslint-disable-next-line dot-notation
    filters.and['proficiency_level'] = {
      eq: filtersValue,
    };
  }
  return filters;
};
