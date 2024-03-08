export const resolvers = {
    Query: {
        getWebHook: async (parent, args, context, info) => {
            return context.dataSources.webHook.findUnique(context, { id: args.id });
        },
    },
    Mutation: {
        createWebHook(parent, args, context, info) {
            return context.dataSources.webHook.create(context, args.input);
        },
    },
    WebHook: {
        headers(parent, args, context, info) {
            return context.dataSources.webHook.findHeadersByWebHookId(context, parent.id);
        },
        events(parent, args, context, info) {
            return context.dataSources.webHook.findEventsByWebHookId(context, parent.id);
        },
    },
    WebHookHeader: {
        webHook(parent, args, context, info) {
            return context.dataSources.webHook.findUnique(context, { id: parent.webHookId });
        },
    },
    WebHookEvent: {
        webHook(parent, args, context, info) {
            return context.dataSources.webHook.findUnique(context, { id: parent.webHookId });
        },
    },
};