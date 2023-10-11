import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { ApolloServer } from '@apollo/server';
import { NextRequest } from 'next/server';
import resolvers from '@/server/graphql/resolvers';
import typeDefs from '@/server/graphql/typedefs';
import { getPayload } from '@/server/services/token';
import prisma from '@/prisma/prisma';
import { IGqlContext } from '@/types';

const server = new ApolloServer({
  resolvers,
  typeDefs,
});
const handler = startServerAndCreateNextHandler<NextRequest>(server, {
  context: async (req, res): Promise<IGqlContext> => {
    let user;
    let isAdmin = false;
    const [, token] = req.headers.get('authorization')?.split(' ') || [];
    if (token) {
      const { id } = getPayload({ token });
      if (id) {
        user = await prisma.user.findUnique({ where: { id } });
        isAdmin =
          user?.isAdmin || user?.username === process.env.ADMIN_USERNAME;
      }
    }
    return { user, isAdmin };
  },
});

export async function GET(request: NextRequest) {
  return handler(request);
}

export async function POST(request: NextRequest) {
  return handler(request);
}
