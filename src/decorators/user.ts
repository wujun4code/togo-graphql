import { ServiceContext, SessionContext, ServerContext, IDataSources } from '../contracts/index.js';

export async function ensureUserInitialized(context: ServerContext) {
    const {
        services: { acl },
        session: { user },
        dataSources: { prisma }
    }: {
        services: ServiceContext;
        session: SessionContext,
        dataSources: IDataSources
    } = context;

    const sub = user.sub;
    const userInDb = await prisma.prisma.user.findUnique({ where: { sub: sub } });
    if (!userInDb) {
        const newUserInDb = await prisma.prisma.user.create({
            data: {
                email: user.email,
                sub: user.sub,
                name: user.name,
            }
        });
        context.session.user.id = newUserInDb.id.toString();
    }
    else {
        context.session.user.id = userInDb.id.toString();
    }
}

export function ensureUserCreated() {

    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const original = descriptor.value;

        descriptor.value = async function (...args) {
            ensureUserInitialized(args[0]);
            const result = await original.call(this, ...args);

            return result;
        }
    };
}