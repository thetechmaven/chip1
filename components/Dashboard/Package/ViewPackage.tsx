'use client';

import React from 'react';
import Layout from '../Layout';
import { gql, useMutation, useQuery } from 'urql';
import Loading from '@/components/Elements/Loading';
import Table, { Td, Th, Tr } from '@/components/Elements/Table';
import CreateAndUpdatePackage from './CreateAndUpdatePackage';

export const VIEW_PACKAGE = gql`
  query Query {
    packages {
      createdAt
      description
      creatorId
      id
      name
      price
      status
      tags
      negotiation
      creator {
        id
        name
      }
    }
  }
`;

export const DELETE_PACKAGE = gql`
  mutation DeletePackage($deletePackageId: String!) {
    deletePackage(id: $deletePackageId) {
      id
    }
  }
`;

export default function ViewPackage() {
  const [selectedPackage, setSelectedPackage] = React.useState(null);

  const [{ fetching, data: packagesData }] = useQuery({ query: VIEW_PACKAGE });
  const [{ fetching: fetchingDelete }, deletePackage] =
    useMutation(DELETE_PACKAGE);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return;
    const result = await deletePackage({ deletePackageId: id });
    if (result.error) {
      console.error('Error deleting package:', result.error);
    } else {
      console.log('Package deleted:', result.data.deletePackage.id);
    }
  };

  return (
    <>
      <Layout heading="Packages">
        {selectedPackage ? (
          <CreateAndUpdatePackage
            selectedPackage={selectedPackage}
            setSelectedPackage={setSelectedPackage}
          />
        ) : fetching ? (
          <div className="flex justify-center items-center min-h-screen">
            <Loading />
          </div>
        ) : (
          <div>
            <Table className="!text-sm">
              <Tr>
                <Th>Name</Th>
                <Th>Description</Th>
                <Th>Price</Th>
                <Th>Creator</Th>
                <Th>Negotiation Limit</Th>
                <Th>Actions</Th>
              </Tr>
              {packagesData?.packages?.map((item: any) => {
                return (
                  <Tr key={item.id}>
                    <Td>{item.name}</Td>
                    <Td>{item.description}</Td>
                    <Td>{item.price}</Td>
                    <Td>{item.creator?.name}</Td>
                    <Td>{item.negotiation}</Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <button
                          className="bg-blue-600 p-1 px-2 text-white border-0 font-medium rounded-md"
                          onClick={() => setSelectedPackage(item)}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-600 p-1 px-2 text-white border-0 font-medium rounded-md ml-2"
                          onClick={() => handleDelete(item.id)}
                          disabled={fetchingDelete}
                        >
                          {fetchingDelete ? 'Deleting...' : 'Delete'}
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
    </>
  );
}
