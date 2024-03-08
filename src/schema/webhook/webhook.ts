export const typeDefs = `#graphql

    type WebHook {
        id: Int!
        name: String!
        url: String!
        headers: [WebHookHeader!]!
        events: [WebHookEvent!]!
    }

    type WebHookHeader {
        id: Int!
        webHook: WebHook!
        key: String!
        value: String!
    }

    type WebHookEvent {
        id: Int!
        webHook: WebHook!
        resource: String!
        operation: String!
    }
    
    input CreateWebHookHeaderInput {
        key: String!
        value: String!
    }

    input CreateWebHookEventInput {
        resource: String!
        operation: String!
    }

    input CreateWebHookInput {
        name: String!
        url: String!
        events: [CreateWebHookEventInput]
        headers: [CreateWebHookHeaderInput]
    }

    type Query {
        getWebHook(id: Int!): WebHook
    }

    type Mutation {
        createWebHook(input: CreateWebHookInput): WebHook
    }
`