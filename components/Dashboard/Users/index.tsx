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
      contentStyle
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

function Users() {
  const [{ fetching, data }, reexecuteQuery] = useQuery({ query: GET_USERS });
  const [{ fetching: updatingAdminStatus }, updateAdminStatus] =
    useMutation(UPDATE_ADMIN_STATUS);
  const [{ fetching: updatingStaffStatus }, updateStaffStatus] =
    useMutation(UPDATE_STAFF_STATUS);

  const [userDetailsId, setUserDetailsId] = useState('');
  const [deleteUserId, setDeleteUserId] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [{ fetching: deletingUser }, deleteUser] = useMutation(gql`
    mutation DeleteUser($userId: String!) {
      deleteUser(userId: $userId) {
        id
      }
    }
  `);

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
                      <div className="flex gap-2">
                        <button
                          className="bg-blue-600 p-1 px-2 text-white border-0 font-medium rounded-md"
                          onClick={() => setUserDetailsId(user.id)}
                        >
                          View
                        </button>
                        <button
                          className="bg-red-600 p-1 px-2 text-white border-0 font-medium rounded-md"
                          onClick={() => {
                            setDeleteUserId(user.id);
                            setShowDeleteConfirm(true);
                          }}
                        >
                          Delete
                        </button>
                      </div>
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
          <div className="mt-2 pb-2 border-b">
            <p className="text-sm font-medium text-gray-600">Content Style</p>
            <p className="">
              {userDetails?.contentStyle ?? (
                <span className="text-red-600 text-sm">
                  Content style information unavailable
                </span>
              )}
            </p>
          </div>
        </div>
      </ModalComponent>

      <ModalComponent
        isOpen={showDeleteConfirm}
        title="Confirm Delete"
        header={<p className="font-medium text-red-600">Delete User</p>}
        onClose={() => {
          setDeleteUserId('');
          setShowDeleteConfirm(false);
        }}
      >
        <div className="p-4">
          <p>
            Are you sure you want to delete this user? This action cannot be
            undone.
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <button
              className="bg-gray-500 p-2 px-4 text-white rounded-md"
              onClick={() => {
                setDeleteUserId('');
                setShowDeleteConfirm(false);
              }}
            >
              Cancel
            </button>
            <button
              className="bg-red-600 p-2 px-4 text-white rounded-md"
              onClick={async () => {
                try {
                  const result = await deleteUser({ userId: deleteUserId });
                  if (result.error) {
                    console.error('Error deleting user:', result.error);
                    return;
                  }
                  await reexecuteQuery({ requestPolicy: 'network-only' });
                  setDeleteUserId('');
                  setShowDeleteConfirm(false);
                } catch (error) {
                  console.error('Error deleting user:', error);
                }
              }}
              disabled={deletingUser}
            >
              {deletingUser ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </ModalComponent>
    </>
  );
}

export default Users;
