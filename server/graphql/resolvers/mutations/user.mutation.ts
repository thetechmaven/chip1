import prisma from '@/prisma/prisma';
import type * as Prisma from '@prisma/client';
import bcrypt from 'bcrypt';
import {
  isEmail,
  isNameValid,
  isPasswordValid,
} from '../../../utils/validation';
import jwt from 'jsonwebtoken';
import {
  ERROR,
  RESET_PASSWORD_RESPONSE,
  SUCCESS,
  URL_EXPIRED_OR_INVALID,
  VERIFICATION_EMAIL_SENT,
} from '@/constants';
import {
  sendForgetPasswordEmail,
  sendVerificationEmail as sendVerification,
} from '@/server/services/email';
import { getPayload } from '@/server/services/token';
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

type LoginUserInput = { email: string; password: string };
export const login = async (
  _: unknown,
  { email, password }: LoginUserInput
) => {
  const user = await prisma.user.findFirst({ where: { email: email || '' } });
  if (!user) {
    return {
      error: 'Incorrect email or password',
    };
  }
  /*
  if (await bcrypt.compare(password, user.pwHash)) {
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string);
    return {
      user,
      token,
    };
  } else {
    return {
      error: 'Incorrect email or password',
    };
  }
  */
};

export const sendResetPasswordLink = async (
  _: unknown,
  { email }: { email: string }
) => {
  const user = await prisma.user.findFirst({ where: { email } });
  if (user) {
    await sendForgetPasswordEmail(email);
  }
  return { message: RESET_PASSWORD_RESPONSE };
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
      data: { isAdmin: true },
    });
    return updatedUser;
  }
);
