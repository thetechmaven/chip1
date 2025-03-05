'use client';

import React, { useEffect, useState } from 'react';
import { gql, useMutation } from 'urql';

export const CREATE_PACKAGE = gql`
  mutation CreatePackage(
    $name: String!
    $description: String!
    $price: Float!
    $negotiation: Int!
  ) {
    createPackage(
      name: $name
      description: $description
      price: $price
      negotiation: $negotiation
    ) {
      id
    }
  }
`;

export const UPDATE_PACKAGE = gql`
  mutation UpdatePackage(
    $updatePackageId: String!
    $name: String!
    $description: String!
    $price: Float!
    $negotiation: Int!
  ) {
    updatePackage(
      id: $updatePackageId
      name: $name
      description: $description
      price: $price
      negotiation: $negotiation
    ) {
      id
    }
  }
`;

export default function CreateAndUpdatePackage({
  selectedPackage,
  setSelectedPackage,
}: {
  selectedPackage: any;
  setSelectedPackage: any;
}) {
  const [{ fetching: fetchingCreate }, createPackage] =
    useMutation(CREATE_PACKAGE);
  const [{ fetching: fetchingUpdate }, updatePackage] =
    useMutation(UPDATE_PACKAGE);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    price: 0,
    negotiation: 0,
  });

  useEffect(() => {
    if (selectedPackage) {
      setFormData({
        id: selectedPackage.id,
        name: selectedPackage.name,
        description: selectedPackage.description,
        price: selectedPackage.price,
        negotiation: selectedPackage.negotiation,
      });
    } else {
      resetForm();
    }
  }, [selectedPackage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id) {
      const result = await updatePackage({
        updatePackageId: formData.id,
        name: formData.name,
        description: formData.description,
        price: formData.price,
        negotiation: formData.negotiation,
      });
      if (result.error) {
        console.error('Error updating package:', result.error);
      } else {
        // toast.success("Package updated:");
        console.log('Package updated:');
        resetForm();
        setSelectedPackage(undefined);
      }
    } else {
      const result = await createPackage({
        name: formData.name,
        description: formData.description,
        price: formData.price,
        negotiation: formData.negotiation,
      });
      if (result.error) {
        console.error('Error creating package:', result.error);
      } else {
        console.log('Package created:');
        resetForm();
        window.location.reload();
      }
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      description: '',
      price: 0,
      negotiation: 0,
    });
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="mb-4 grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
          className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          placeholder="Price"
          value={formData.price}
          onChange={(e) =>
            setFormData({ ...formData, price: parseFloat(e.target.value) })
          }
          required
          className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          placeholder="Negotiation Limit"
          value={formData.negotiation}
          onChange={(e) =>
            setFormData({ ...formData, negotiation: parseInt(e.target.value) })
          }
          required
          className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-black px-2 py-1 text-white rounded-lg w-max"
        >
          {formData.id ? 'Update Package' : 'Create Package'}
        </button>
      </form>
    </div>
  );
}
