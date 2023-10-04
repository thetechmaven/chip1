import { userMutations } from './mutations';
import { userQueries } from './queries';
import projectQueries from './project-bridge/queries';
import projectMutations from './project-bridge/mutations';
import projectTypes from './project-bridge/types';
import Date from './types/Date';

const resolvers = {
  Query: {
    ...userQueries,
    ...projectQueries,
  },
  Mutation: {
    ...userMutations,
    ...projectMutations,
  },
  Date,
  ...projectTypes,
};

export default resolvers;
