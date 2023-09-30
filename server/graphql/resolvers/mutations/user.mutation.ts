import prisma from '@/prisma/prisma';
import type * as Prisma from '@prisma/client';
import bcrypt from 'bcrypt';
import {
  isEmail,
  isNameValid,
  isPasswordValid,
} from '../../../utils/validation';

type RegisterUserInput = Prisma.User & { password: string };
export const registerUser = async (_: unknown, args: RegisterUserInput) => {
  const password = args.password;
  const pwHash = await bcrypt.hash(password, 10);

  isEmail(args.email);
  isPasswordValid(args.password);
  isNameValid(args.name);

  return;
  return prisma.user.create({
    data: {
      ...args,
      pwHash,
    },
  });
};
