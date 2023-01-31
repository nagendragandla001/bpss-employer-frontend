/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable camelcase */
import { gql } from '@apollo/client';

interface CandidateFilter {
  public_resume : string,
  last_active_on__gte : any,
  unlocked_organizations__match: string,
}

export const findRecommendedCandidatesForEmployer = gql`
query findRecommendedCandidatesForEmployer($job_id:ID!,$filter: CandidateFilter,$query: String, $first:Int,$after:Int, $cmsSort: Boolean, $preSkilled: Boolean){
  findRecommendedCandidatesForEmployer(jobId: $job_id, filter: $filter, query: $query, first:$first, after:$after, cmsSort: $cmsSort, preSkilled: $preSkilled) {
    totalCount
    edges {
      ...on Candidate{
      id
      functional_areas{
        id
        name
        image
        full_image
      }
      referral_code
      created
      modified
      total_experience
      salary{
        id
        current_salary
        current_salary_format
        expected_salary
        expected_salary_format
        normalized_current_salary
      }
      work_experience{
        id
        functional_area
        {
          id
          name
        }
        company_name
        job_title
        worked_till
        till_now
        work_description
      }
      educations{
        id
        institute
        proficiency_level
      }
      tags
      resume
      public_resume
      user{
        first_name
        last_name
        age
        gender
      }
      expectation{
        notice_period
        preferred_cities{
          id
          name
        }
      }
      address{
        id
        place{
          place_id
          location
          short_formatted_address
        }
      }
      is_unlocked
      pre_skilled
      cms{
        score
        documents_and_assets{
          name
          type
          status
        }
        required_criteria{
          name
          type
          status
          value
        }
      }
    }
  }
}
}
`;

export const findRecommendedCandidatesForEmployerCount = gql`
query findRecommendedCandidatesForEmployer($job_id:ID!, $first:Int,$after:Int){
  findRecommendedCandidatesForEmployer(jobId: $job_id, first:$first,after:$after) {
    totalCount
  }
}`;
