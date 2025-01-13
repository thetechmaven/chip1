'use client';

import React, { useMemo, useState } from 'react';
import Layout from '../Layout';
import { gql, useMutation, useQuery } from 'urql';
import Loading from '@/components/Elements/Loading';
import Table, { Td, Th, Tr } from '@/components/Elements/Table';
import ModalComponent from '@/components/Elements/Modal';

export type IUser = any;

const GET_USERS = gql`
  query Users {
    users {
      address
      bio
      brandIndustry
      brandLocation
      brandName
      chatId
      country
      dob
      email
      evmWallet
      facebookId
      id
      isAdmin
      isStaff
      location
      name
      niche
      schedule
      solWallet
      telegramId
      twitterId
      userType
      username
      youtubeId
    }
  }
`;

const UPDATE_ADMIN_STATUS = gql`
  mutation Mutation($userId: String!, $status: Boolean) {
    updateAdminStatus(userId: $userId, status: $status) {
      chatId
      id
      isStaff
      isAdmin
    }
  }
`;

const UPDATE_STAFF_STATUS = gql`
  mutation Mutation($userId: String!, $status: Boolean) {
    updateStaffStatus(userId: $userId, status: $status) {
      chatId
      id
      isStaff
      isAdmin
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
  const [{ fetching: updatingAdminStatus }, updateAdminStatus] =
    useMutation(UPDATE_ADMIN_STATUS);
  const [{ fetching: updatingStaffStatus }, updateStaffStatus] =
    useMutation(UPDATE_STAFF_STATUS);

  const [userDetailsId, setUserDetailsId] = useState('');

  const userDetails = useMemo(() => {
    return data?.users?.find((u: IUser) => u.id === userDetailsId);
  }, [userDetailsId, data]);

  return (
    <>
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
                <Th>Type</Th>
                <Th>{null}</Th>
              </Tr>
              {data?.users?.map((user: IUser) => {
                return (
                  <Tr key={user.id}>
                    <Td>{user.name}</Td>
                    <Td>{user.userType}</Td>
                    <Td>
                      <button
                        className="bg-blue-600 p-1 px-2 text-white border-0 font-medium rounded-md"
                        onClick={() => setUserDetailsId(user.id)}
                      >
                        View
                      </button>
                    </Td>
                  </Tr>
                );
              })}
            </Table>
          </div>
        )}
      </Layout>
      <ModalComponent
        isOpen={userDetails}
        title={'User Details'}
        header={<p className="font-medium text-blue-600">User Details</p>}
        onClose={() => setUserDetailsId('')}
      >
        <div
          style={{ width: 500, maxHeight: '75vh', overflow: 'auto' }}
          className="bg-white shadow-sm rounded-lg mt-2 p-2"
        >
          <div className="mt-2 border-b pb-2">
            <p className="text-sm font-medium text-gray-600">Name</p>
            <p className="">{userDetails?.name}</p>
          </div>
          <div className="mt-2 pb-2 border-b">
            <p className="text-sm font-medium text-gray-600">Email</p>
            <p className="">{userDetails?.email}</p>
          </div>
          <div className="mt-2 border-b pb-2">
            <p className="text-sm font-medium text-gray-600">Username</p>
            <p className="">{userDetails?.username}</p>
          </div>
          <div className="mt-2 pb-2 border-b">
            <p className="text-sm font-medium text-gray-600">Bio</p>
            <p className="">{userDetails?.bio}</p>
          </div>
          <div className="mt-2 pb-2 border-b">
            <p className="text-sm font-medium text-gray-600">Location</p>
            <p className="">{userDetails?.location}</p>
          </div>
          <div className="mt-2 pb-2 border-b">
            <p className="text-sm font-medium text-gray-600">Country</p>
            <p className="">{userDetails?.country}</p>
          </div>
          <div className="mt-2 pb-2 border-b">
            <p className="text-sm font-medium text-gray-600">Date of Birth</p>
            <p className="">{userDetails?.dob}</p>
          </div>
          <div className="mt-2 pb-2 border-b">
            <p className="text-sm font-medium text-gray-600">Brand Name</p>
            <p className="">{userDetails?.brandName}</p>
          </div>
          <div className="mt-2 pb-2 border-b">
            <p className="text-sm font-medium text-gray-600">Brand Industry</p>
            <p className="">{userDetails?.brandIndustry}</p>
          </div>
          <div className="mt-2 pb-2 border-b">
            <p className="text-sm font-medium text-gray-600">Brand Location</p>
            <p className="">{userDetails?.brandLocation}</p>
          </div>
          <div className="mt-2 pb-2 border-b">
            <p className="text-sm font-medium text-gray-600">EVM Wallet</p>
            <p className="">{userDetails?.evmWallet}</p>
          </div>
          <div className="mt-2 pb-2 border-b">
            <p className="text-sm font-medium text-gray-600">Sol Wallet</p>
            <p className="">{userDetails?.solWallet}</p>
          </div>
          <div className="mt-2 pb-2 border-b">
            <p className="text-sm font-medium text-gray-600">Telegram ID</p>
            <p className="">{userDetails?.telegramId}</p>
          </div>
          <div className="mt-2 pb-2 border-b">
            <p className="text-sm font-medium text-gray-600">Twitter ID</p>
            <p className="">{userDetails?.twitterId}</p>
          </div>
          <div className="mt-2 pb-2 border-b">
            <p className="text-sm font-medium text-gray-600">Facebook ID</p>
            <p className="">{userDetails?.facebookId}</p>
          </div>
          <div className="mt-2 pb-2 border-b">
            <p className="text-sm font-medium text-gray-600">YouTube ID</p>
            <p className="">{userDetails?.youtubeId}</p>
          </div>
          <div className="mt-2 pb-2 border-b">
            <p className="text-sm font-medium text-gray-600">Chat ID</p>
            <p className="">{userDetails?.chatId}</p>
          </div>
          <div className="mt-2 pb-2 border-b">
            <p className="text-sm font-medium text-gray-600">Niche</p>
            <p className="">{userDetails?.niche}</p>
          </div>
          <div className="mt-2 pb-2 border-b">
            <p className="text-sm font-medium text-gray-600">Schedule</p>
            <p className="">{userDetails?.schedule}</p>
          </div>
        </div>
      </ModalComponent>
    </>
  );
}

export default Users;
