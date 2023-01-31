/* eslint-disable import/prefer-default-export */

interface IReturnType{
  [key:string]: {
    [key:string]:{
      [key:string]:number
    }
  }
}
export const functionalarealasticfilter = (filtersValue: number | undefined): IReturnType => {
  const filters = { and: {} };

  if (filtersValue) {
    // eslint-disable-next-line dot-notation
    filters.and['functional_area.id'] = {
      eq: filtersValue,
    };
  }

  return filters;
};
