import { ServiceContext, SessionContext, ServerContext } from '../contracts/index.js';
import { checkRole } from './acl.js';
import { GraphQLError } from 'graphql';
import { ensureUserInitialized } from './user.js';

export function authorize() {

    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const original = descriptor.value;

        descriptor.value = async function (...args) {
            const {
                services: { acl },
                session: { user }
            }: {
                services: ServiceContext;
                session: SessionContext
            } = args[0];

            checkUser(args[0]);

            const result = await original.call(this, ...args);
            return result;
        }
    };
}

export const withAuthentication = (resolverFunc) => {
    return async (parent, args, context, info) => {
        checkUser(context);
        await ensureUserInitialized(context);
        return await resolverFunc(parent, args, context, info);
    };
};

export const withAuthorization = (roles: string[], resolverFunc) => {
    return async (parent, args, context, info) => {
        checkUser(context);
        await ensureUserInitialized(context);
        checkRole(context, roles);
        return await resolverFunc(parent, args, context, info);
    };
};

export function checkUser(context: ServerContext) {
    const {
        services: { acl },
        session: { user }
    }: {
        services: ServiceContext;
        session: SessionContext
    } = context;

    if (!user) {
        throw new GraphQLError(`no authorized.`, {
            extensions: {
                code: 'Unauthorized',
            },
        });
    }
    return true;
}

export class Authentication {
    constructor() {
    }

    async execute(executor: (parent, args, context, info) => Promise<any>, parent, args, context, info): Promise<any> {
        checkUser(context);
        return await executor(parent, args, context, info);
    }
}

export class Authorization {

    constructor() {
    }

    hasRoles(context, roles: string[]) {
        checkUser(context);
        checkRole(context, roles);
        return this;
    }

    async execute(executor: (parent, args, context, info) => Promise<any>, parent, args, context, info): Promise<any> {
        return await executor(parent, args, context, info);
    }
}

export const useAuthentication = new Authentication();


export const userAuthorization = new Authorization();