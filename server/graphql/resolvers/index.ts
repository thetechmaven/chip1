import { userMutations } from './mutations';
import { userQueries } from './queries';

const resolvers = {
  Query: {
    ...userQueries,
  },
  Mutation: {
    ...userMutations,
  },
};

export default resolvers;
