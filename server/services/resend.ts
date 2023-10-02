import { Resend } from 'resend';

interface ISendMailArgs {
  to: string;
  from: string;
  subject: string;
  text: string;
}
export const send = ({ to, from, subject, text }: ISendMailArgs) => {
  const resend = new Resend(process.env.RESEND_KEY);
  return resend.emails.send({
    from,
    to,
    subject,
    text,
  });
};
