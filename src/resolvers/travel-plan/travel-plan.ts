import { GraphQLError } from 'graphql';
import { withAuthentication, withAuthorization } from '../../decorators/index.js';
import { GraphqlErrorCode } from '../../contracts/index.js';

export const resolvers = {
    Query: {
        getTravelPlan: withAuthentication(async (parent, args, context, info) => {
            return context.dataSources.travelPlan.findUnique(context, { id: parseInt(args.id) });
        }),
        getAllTravelPlans: withAuthorization(['admin'], async (parent, args, context, info) => {
            return context.dataSources.travelPlan.findMany(context, args.filters);

        }),
        getMyTravelPlans: withAuthentication(async (parent, args, context, info) => {
            const filters = { ...args.filters, creatorId: context.session.user.id };
            return context.dataSources.travelPlan.findMany(context, filters);
        }),
    },
    Mutation: {
        createTravelPlan: withAuthentication(async (parent, args, context, info) => {
            return context.dataSources.travelPlan.create(context, args.input);
        }),
        updateTravelPlan: withAuthentication((parent, args, context, info) => {
            const { id } = args.input;
            if (!id) throw new GraphQLError(`no id found`, {
                extensions: {
                    code: GraphqlErrorCode.BAD_REQUEST,
                    name: GraphqlErrorCode[GraphqlErrorCode.BAD_REQUEST],
                },
            });
            return context.dataSources.travelPlan.updateUnique(context, args.input);
        }),
        deleteTravelPlan: withAuthentication(async (parent, args, context, info) => {
            return context.dataSources.travelPlan.deleteUnique(context, { id: parseInt(args.id) });
        }),
    },
    TravelPlan: {
        origin: async (parent, args, context, info) => {
            return context.dataSources.locationPoint.findUnique(context, { id: parent.originId });
        },
        destination: async (parent, args, context, info) => {
            return context.dataSources.locationPoint.findUnique(context, { id: parent.destinationId });
        },
    }
};