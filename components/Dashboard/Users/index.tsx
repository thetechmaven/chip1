'use client';

import React from 'react';
import Layout from '../Layout';
import { gql, useQuery } from 'urql';
import Loading from '@/components/Elements/Loading';

const GET_USERS = gql`
  query Users {
    users {
      categoryPreference
      chatId
      cover
      citizenship
      dob
      experience
      gender
      group
      hp
      id
      isAdmin
      isStaff
      locationPreference
      name
      phone
      qualification
      race
      typePreference
      username
    }
  }
`;

function Users() {
  const [{ fetching, data }] = useQuery({ query: GET_USERS });

  return (
    <Layout heading="Users">
      {fetching ? (
        <div className="flex justify-center items-center min-h-screen">
          <Loading />
        </div>
      ) : (
        <div></div>
      )}
    </Layout>
  );
}

export default Users;
