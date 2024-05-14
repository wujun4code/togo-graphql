export const typeDefs = `#graphql

  type DirectMessage {

  }

  type Subscription {
    directMessageCreated: DirectMessage
  }
`