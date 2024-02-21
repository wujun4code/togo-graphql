export const resolvers = {
    Query: {
        searchLocations: async (parent, args, { dataSources }, info) => {
            return dataSources.location.searchLocations(args.location);
        },
    },
    Location: {
        now(parent, args, { dataSources }, info) {
            return dataSources.now.getNow(parent.id);
        }
    }
};