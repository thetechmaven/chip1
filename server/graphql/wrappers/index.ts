import { IGqlContext } from '@/types';

export const adminOnly =
  (fn: (parent: unknown, args: any, context: unknown) => void) =>
  (parent: unknown, args: unknown, context: unknown) => {
    const { isAdmin } = context as IGqlContext;
    if (!isAdmin) {
      throw new Error('Only Admins can perform this action');
    }
    return fn(parent, args, context);
  };

export const isLoggedIn =
  (fn: (parent: unknown, args: any, context: IGqlContext) => void) =>
  (parent: unknown, args: unknown, context: IGqlContext) => {
    const { user } = context as IGqlContext;
    if (!user) {
      throw new Error('Login to continue');
    }
    return fn(parent, args, context);
  };
