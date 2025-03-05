import prisma from '@/prisma/prisma';
import type * as Prisma from '@prisma/client';
import { isNameValid, isPasswordValid } from '../../../utils/validation';
import jwt from 'jsonwebtoken';
import { adminOnly } from '../../wrappers';

type RegisterUserInput = Prisma.User & { password: string };
export const registerUser = async (_: unknown, args: RegisterUserInput) => {
  isPasswordValid(args.password);
  isNameValid(args.name);

  const { password: _p, ...data } = args;

  return prisma.user.create({
    data: {
      ...data,
    },
  });
};

type LoginUserInput = { username: string; password: string };
export const login = async (
  _: unknown,
  { username, password }: LoginUserInput
) => {
  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASS
  ) {
    const token = jwt.sign({ id: 'admin' }, process.env.JWT_SECRET as string);
    return {
      token,
    };
  } else {
    return {
      error: 'Incorrect username or password',
    };
  }
};

type ChangeAdminStatusArgs = { userId: string; status: boolean };
export const updateAdminStatus = adminOnly(
  async (_: unknown, { userId, status }: ChangeAdminStatusArgs) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('User does not exist');
    }
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isAdmin: status },
    });
    return updatedUser;
  }
);

export const updateStaffStatus = adminOnly(
  async (_: unknown, { userId, status }: ChangeAdminStatusArgs) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('User does not exist');
    }
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isStaff: status },
    });
    return updatedUser;
  }
);

export const updatePackage = async (
  _: unknown,
  { id, ...data }: Prisma.Package
) => {
  return prisma.package.update({
    where: { id },
    data,
  });
};

export const deletePackage = async (_: unknown, { id }: { id: string }) => {
  return prisma.package.delete({
    where: { id },
  });
};
