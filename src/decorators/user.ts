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

    const createOrGetUser = await prisma.prisma.user.upsert({
        where: { email: user.email },
        update: {
        },
        create: {
            username: user.username,
            snsName: user.username,
            friendlyName: user.friendlyName,
            email: user.email,
            roles: {
                create: user.roles.map((roleName) => ({
                    role: {
                        connectOrCreate: {
                            where: { name: roleName },
                            create: { name: roleName, description: `the role named ${roleName}` }
                        }
                    }
                })),
            },
            oauth2Bindings: {
                create: [user.sub].map((openId) => ({
                    openId: openId,
                    oauth2: {
                        connectOrCreate: {
                            where: { unique_provider_clientId: { provider: user.provider, clientId: user.clientId } },
                            create: { provider: user.provider, clientId: user.clientId },
                        }
                    }
                }))
            }
        },
        select: {
            roles: {
                select: {
                    role: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            },
            id: true,
        }
    });
    context.session.user.id = createOrGetUser.id.toString();
    const extendedRoles = createOrGetUser.roles.map(userRole => {
        return { id: userRole.role.id, name: userRole.role.name };
    });
    context.session.user.extendedRoles = extendedRoles;

    return context.session.user;
}

export function injectUser() {

    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const original = descriptor.value;

        descriptor.value = async function (...args) {
            const user = await ensureUserInitialized(args[0]);
            args[0].session.user = user;
            const result = await original.call(this, ...args);

            return result;
        }
    };
}