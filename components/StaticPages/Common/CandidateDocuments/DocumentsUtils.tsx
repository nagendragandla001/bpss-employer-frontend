import { gql } from '@apollo/client';

export const documentQuery = gql`
query documents($limit: Int, $offset:Int){
  documents(limit:$limit, offset:$offset){
    id
    name
  }
}
`;

export const assetQuery = gql`
query documents($limit: Int, $offset:Int){
  vehicles(limit:$limit, offset:$offset){
    id
    name
  }
  mobiles(limit:$limit, offset:$offset){
    id
    name
    priority
  }
}
`;
