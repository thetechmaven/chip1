'use client';

import fdtojson from '@/utils/fdtojson';
import gql from 'graphql-tag';
import { useSearchParams } from 'next/navigation';
import React from 'react';
import { useMutation } from 'urql';

const RESET_PASSWORD = gql`
  mutation ResetPassword($password: String!, $token: String!) {
    resetPassword(password: $password, token: $token) {
      status
      message
    }
  }
`;

function ResetPassword({}) {
  const [{ fetching }, resetPassword] = useMutation(RESET_PASSWORD);
  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { password, confirmPassword } = fdtojson(
        new FormData(e.target as HTMLFormElement)
      );
      if (password === confirmPassword) {
        resetPassword({
          token: searchParams.get('token'),
          password,
        });
      } else {
        alert('Password does not match');
      }
    } catch (err) {
    } finally {
      ('');
    }
  };

  if (fetching) return 'Updating...';

  return (
    <form onSubmit={handleSubmit}>
      <input type="password" name="password" placeholder="Password" />
      <input
        type="password"
        name="confirmPassword"
        placeholder="Confirm Password"
      />
      <input type="submit" />
    </form>
  );
}

export default ResetPassword;
