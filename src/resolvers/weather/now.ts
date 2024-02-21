export const resolvers = {
    Query: {
        getNowByLocationId: async (parent, args, { dataSources }, info) => {
            return dataSources.now.getNow(args.locationId, args.lang);
        },
    },
};