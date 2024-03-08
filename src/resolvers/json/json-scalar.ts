import { GraphQLScalarType, Kind } from 'graphql';

export const jsonScalar = new GraphQLScalarType({
    name: 'JSON',
    description: 'JSON custom scalar type',
    serialize(value) {
        if (value instanceof Object) {
            return value;
        }
        throw Error('GraphQL JSON Scalar serializer expected a `JSON` object');
    },
    parseValue(value) {
        if (typeof value === 'object') {
            return value; // Convert incoming integer to Date
        }
        throw new Error('GraphQL Date Scalar parser expected a `number`');
    },
    parseLiteral(ast) {
        if (ast.kind === Kind.OBJECT) {
            // Convert hard-coded AST string to integer and then to Date
            return ast;
        }
        // Invalid hard-coded value (not an integer)
        return null;
    },
});