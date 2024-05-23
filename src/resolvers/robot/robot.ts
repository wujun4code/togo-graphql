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
        userRobot: withAuthentication(async (parent, args, context, info) => {
            return { input: args.input };
        }),
    },
    PrivateRobotInfo: {
        relatedUser: async (parent, args, context, info) => {
            console.log(`PrivateRobotInfo.relatedUser.parent`, parent);
            if (context.session.user)
                return await context.dataSources.user.getPublicInfo(context, parent.relatedUserId);
            else return await context.dataSources.user.getSharedPublicProfileByUserId(context, parent.relatedUserId);
        },
    },
    Robot: {
        relatedUser: async (parent, args, context, info) => {
            if (context.session.user)
                return await context.dataSources.user.getPublicInfo(context, parent.relatedUserId);
            else return await context.dataSources.user.getSharedPublicProfileByUserId(context, parent.relatedUserId);
        },
        managingUser: async (parent, args, context, info) => {
            if (context.session.user)
                return await context.dataSources.user.getPublicInfo(context, parent.managingUserId);
            else return await context.dataSources.user.getSharedPublicProfileByUserId(context, parent.managingUserId);
        },
    },
    UserRobot: {
        managingRobots: withAuthentication(async (parent, args, context, info) => {
            const {
                robot
            } = context.dataSources;
            const list = await robot.managingBy(context, parent.input);

            const connection = {
                edges: list.map(n => {
                    return { cursor: n.id, node: n };
                }),
                pageInfo: {
                    hasNextPage: false,
                    endCursor: list.length > 0 ? list[list.length - 1].id : ''
                },
            };

            return { ...connection, input: { ...args.input, ...parent.input } };
        }),
    },
    UserRobotConnection: {
        totalCount: async (parent, args, context, info) => {

            const {
                robot
            } = context.dataSources;
            const count = await robot.countManagingBy(context, parent.input);
            return count;
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
            const { relatedUserId } = data;
            const { apiClient } = args.input;

            let createdAPIClient = undefined;
            if (apiClient) {
                createdAPIClient = await context.dataSources.user.createAPIClient(context, { userId: relatedUserId, ...args.input.apiClient });
            }
            return data;
        }),
        updateRobot: withAuthentication(async (parent, args, context, info) => {

            if (!args.input.id)
                throw new GraphQLError(`id is a required field.`, {
                    extensions: {
                        code: GraphqlErrorCode.BAD_REQUEST,
                        name: GraphqlErrorCode[GraphqlErrorCode.BAD_REQUEST],
                    },
                });
            const { apiClient, ...toUpdatedFields } = args.input;
            const { robot } = context.dataSources;

            const data = await robot.findById(context, toUpdatedFields);
            if (!data) {
                throw new GraphQLError(`robot not found.`, {
                    extensions: {
                        code: GraphqlErrorCode.NOT_FOUND,
                        name: GraphqlErrorCode[GraphqlErrorCode.NOT_FOUND],
                    },
                });
            }
            const { managingUserId, relatedUserId } = data;
            if (managingUserId !== parseInt(context.session.user.id)) {
                throw new GraphQLError(`robot managed user not match.`, {
                    extensions: {
                        code: GraphqlErrorCode.FORBIDDEN,
                        name: GraphqlErrorCode[GraphqlErrorCode.FORBIDDEN],
                    },
                });
            }
            const updated = await robot.update(context, toUpdatedFields);
            if (apiClient) {
                await context.dataSources.user.createAPIClient(context, { userId: relatedUserId, ...args.input.apiClient });
            }
            return updated;
        }),
    },
};