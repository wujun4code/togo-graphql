---
sidebar_position: 1
---

# Create a Robot

## Create Robot and related user

```graphql
mutation CreateRobot($input: CreateRobotInput) {
  createRobot(input: $input) {
    hookUrl
    id
    relatedUser {
      apiClientConnection {
        edges {
          cursor
          node {
            apiId
            apiKey
            description
            id
            name
          }
        }
      }
    }
  }
}
```

with `variables`

```json
{
  "input": {
    "apiClient": {
      "name": "GPT4o",
      "description": "API Client for GPT4o"
    },
    "headers": [
      {
        "key": "Authorization",
        "value": "qVbTHGduSv9MgBE0E0GBAGWUcotB8J7bczpDlhrZOVG8gGhJh5HM1HeUAj9GrMKP"
      }
    ],
    "hookUrl": "http://localhost:4000/openai/gpt4o",
    "relatedUser": {
      "email": "openai-azure@test.com",
      "friendlyName": "GPT4o",
      "snsName": "gpt4o",
      "username": "openai-gpt4o-azure",
      "bio": "gpt4o from Azure",
      "avatar": "https://pbs.twimg.com/profile_images/1634058036934500352/b4F1eVpJ_400x400.jpg"
    },
    "website": "https://azure.microsoft.com/en-us/products/ai-services/openai-service"
  }
}
```

## Create API Client

```graphql
mutation CreateAPIClient($input: CreateAPIClientInput!) {
  createAPIClient(input: $input) {
    apiId
    apiKey
    description
    id
    name
  }
}
```

with `variables`

```json
{
  "input": {
    "description": "GPT3.5 API Client",
    "name": "gpt35"
  }
}
```

then please config apiId and apiKey in the server side of web hook url.