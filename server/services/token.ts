import jwt from 'jsonwebtoken';

interface IGenerateTokenArgs {
  tokenFor: string;
  data: unknown;
  expiryDate?: string;
}
export const generateToken = ({ tokenFor, data }: IGenerateTokenArgs) => {
  return jwt.sign({ tokenFor, data }, process.env.JWT_SECRET as string);
};

export const getPayload = ({ token }: { token: string }) => {
  return jwt.verify(token, process.env.JWT_SECRET as string);
};
