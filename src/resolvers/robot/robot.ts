import { GraphQLError } from 'graphql';
import { useAuthentication } from '../../decorators/index.js';
import { withAuthentication } from '../../decorators/index.js';
import { GraphqlErrorCode } from '../../contracts/index.js';

export const resolvers = {
    Query: {
        robot: async (parent, args, context, info) => {
            if (!args.input.snsName)
                throw new GraphQLError(`no robot found`, {
                    extensions: {
                        code: GraphqlErrorCode.BAD_REQUEST,
                        name: GraphqlErrorCode[GraphqlErrorCode.BAD_REQUEST],
                    },
                });
            const data = await context.dataSources.robot.findBySnsName(context, args.input);
            return data;
        },
    },
    Robot: {
        relatedUser: async (parent, args, context, info) => {
            if (context.session.user)
                return await context.dataSources.user.getPublicInfo(context, parent.relatedUserId);
            else return await context.dataSources.user.getSharedPublicProfileByUserId(context, parent.relatedUserId);
        },
    },

    Mutation: {
        createRobot: withAuthentication(async (parent, args, context, info) => {
            if (!args.input.relatedUser.snsName)
                throw new GraphQLError(`snsName is a required field.`, {
                    extensions: {
                        code: GraphqlErrorCode.BAD_REQUEST,
                        name: GraphqlErrorCode[GraphqlErrorCode.BAD_REQUEST],
                    },
                });
            const data = await context.dataSources.robot.create(context, args.input);
            return data;
        }),
    },
};