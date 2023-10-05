import { IGqlContext } from '@/types';

export const user = (_: unknown, args: unknown, { user }: IGqlContext) => {
  return user;
};
