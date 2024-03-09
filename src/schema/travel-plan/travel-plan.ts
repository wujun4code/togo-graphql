export const typeDefs = `#graphql

type TravelPlan {
  id: ID!
  content: String
  published: Boolean!
  creatorId: ID!
  origin: LocationPoint
  destination: LocationPoint
}

type Query {
  getTravelPlan(id: ID!): TravelPlan
  getAllTravelPlans(filters: JSON!): [TravelPlan]
  getMyTravelPlans(filters: JSON!): [TravelPlan]
}

type LocationPoint {
  id: ID!
  lat: Float!
  lon: Float!
}

input CreateTravelPlanInput {
  content: String
  published: Boolean!
  origin: TravelPlanLocationInput
  destination: TravelPlanLocationInput
}

input TravelPlanLocationInput {
  lat: Float!
  lon: Float!
}

input UpdateTravelPlanInput {
  id: ID!
  content: String
  published: Boolean
  origin: TravelPlanLocationInput
  destination: TravelPlanLocationInput
}

type DeletedResult {
  count: Int!
}

type Mutation {
  createTravelPlan(input: CreateTravelPlanInput!): TravelPlan
  updateTravelPlan(input: UpdateTravelPlanInput!): TravelPlan
  deleteTravelPlan(id: ID!): DeletedResult
}
`