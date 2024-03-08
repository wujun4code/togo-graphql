import { ServiceContext, SessionContext, ServerContext, IDataSources } from '../contracts/index.js';

export async function ensureUserInitialized(context) {
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

    console.log(`context.session.user.id:${context.session.user.id}`);
    return context.session.user.id;
}

export function injectUser() {

    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const original = descriptor.value;

        descriptor.value = async function (...args) {
            const userId = await ensureUserInitialized(args[0]);
            args[0].session.user.id = userId;
            const result = await original.call(this, ...args);

            return result;
        }
    };
}