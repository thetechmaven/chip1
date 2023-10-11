'use client';

import React from 'react';
import Layout from '../Layout';
import { gql, useQuery } from 'urql';
import Loading from '@/components/Elements/Loading';
import Table, { Td, Th, Tr } from '@/components/Elements/Table';

export interface IUser {
  chatId?: number;
  cover?: string;
  citizenship?: string;
  dob?: string;
  experience?: number;
  gender?: string;
  group?: string;
  hp?: string;
  id?: string;
  isAdmin?: boolean;
  isStaff?: boolean;
  locationPreference?: string;
  name?: string;
  phone?: string;
  qualification?: string;
  race?: string;
  typePreference?: string[];
  categoryPreference?: string[];
  username?: string;
  email?: string;
}

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
      email
    }
  }
`;

function TuitorBadge() {
  return (
    <span className="mx-0.5 bg-gray-600 text-white p-1 px-2 text-xs font-medium rounded-lg cursor-default">
      T
    </span>
  );
}

function AdminBadge() {
  return (
    <span className="mx-0.5 bg-zinc-600 text-white p-1 px-2 text-xs font-medium rounded-lg cursor-default">
      A
    </span>
  );
}

function StaffBadge() {
  return (
    <span className="mx-0.5 bg-blue-600 text-white p-1 px-2 text-xs font-medium rounded-lg cursor-default">
      S
    </span>
  );
}

function Users() {
  const [{ fetching, data }] = useQuery({ query: GET_USERS });

  return (
    <Layout heading="Users">
      {fetching ? (
        <div className="flex justify-center items-center min-h-screen">
          <Loading />
        </div>
      ) : (
        <div>
          <Table className="!text-sm">
            <Tr>
              <Th>Name</Th>
              <Th>Username</Th>
              <Th>Email</Th>
              <Th>Year</Th>
              <Th>Gender</Th>
              <Th>Group</Th>
              <Th>Phone</Th>
              <Th>{null}</Th>
            </Tr>
            {data?.users?.map((user: IUser) => {
              return (
                <Tr key={user.id}>
                  <Td>
                    <TuitorBadge />
                    {user.isAdmin && <AdminBadge />}
                    {user.isStaff && <StaffBadge />}
                    {user.name}
                  </Td>
                  <Td>{user.username}</Td>
                  <Td>{user.email}</Td>
                  <Td>{user.experience}</Td>
                  <Td>{user.gender}</Td>
                  <Td>{user.group}</Td>
                  <Td>{user.phone}</Td>
                  <Td>{null}</Td>
                </Tr>
              );
            })}
          </Table>
        </div>
      )}
    </Layout>
  );
}

export default Users;
