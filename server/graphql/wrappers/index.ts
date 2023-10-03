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
