import { PrismaClient } from '@prisma/client';
import { SessionContext } from '../../contracts/index.js';
import { PrismaDataSource } from './base.js';
import { ServerContext } from '../../contracts/index.js';
import { injectUser } from '../../decorators/index.js';
import { ACLPermission, CreateACLRuleInput } from './acl.js';


const defaultACLRule = {
    "*": { read: false, write: false },
    "role:subscribed": {
        read: true,
        write: false
    },
    "role:admin": {
        read: true,
        write: true
    },
};

export class TravelPlanDataSource extends PrismaDataSource {
    constructor(config: { client: PrismaClient, session: SessionContext }) {
        super(config);
    }

    @injectUser()
    async create(context: ServerContext, input: any) {
        const created = await this.prisma.travelPlan.create({
            data: {
                creator: {
                    connect: {
                        id: parseInt(context.session.user.id),
                    }
                },
                content: input.content,
                published: input.published,
                origin: {
                    connectOrCreate: {
                        create: {
                            lat: input.origin.lat,
                            lon: input.origin.lon,
                        },
                        where: {
                            unique_lat_lon_constraint: {
                                lat: input.origin.lat,
                                lon: input.origin.lon,
                            }
                        }
                    }
                },
                destination: {
                    connectOrCreate: {
                        create: {
                            lat: input.destination.lat,
                            lon: input.destination.lon,
                        },
                        where: {
                            unique_lat_lon_constraint: {
                                lat: input.destination.lat,
                                lon: input.destination.lon,
                            }
                        }
                    }
                },
            }
        });
        const { services: { webHook }, dataSources: { acl }, session: { user } } = context;

        const resourceName = 'travel-plan';

        const aclRules = {
            ...defaultACLRule,
            [`user:${user.id}`]: {
                read: true,
                write: true
            }
        };

        await this.createACLRules(aclRules, created.id);
        webHook.invokeCreate(context, resourceName, 'create', created);
        return created;
    }

    async createACLRules(input: CreateACLRuleInput, id: number) {

        let bulk = [];

        for (const key in input) {
            const item = this.mapToACLRule(key, input[key], id);
            bulk.push(item);
        }
        const asyncResults = await Promise.all(bulk.map(data => this.prisma.travelPlanACLRule.create({ data: data })));
    };

    mapToACLRule(key: string, permission: ACLPermission, id: number) {
        if (key === "*") {
            return {
                wildcard: '*',
                travelPlanId: id,
                writePermission: permission.write,
                readPermission: permission.read
            };
        } else if (key.startsWith('role')) {
            const [_, role] = key.split(':');

            if (isNaN(parseInt(role, 10))) {
                const data = {
                    role: {
                        connectOrCreate: {
                            create: {
                                name: role,
                                description: `a role named ${role}`
                            },
                            where: {
                                name: role
                            }
                        }
                    },
                    travelPlan: {
                        connect: {
                            id: id,
                        }
                    },
                    writePermission: permission.write,
                    readPermission: permission.read
                };
                return data;
            }

            else {
                const data = {
                    roleId: role,
                    travelPlanId: id,
                    writePermission: permission.write,
                    readPermission: permission.read
                }
                return data;
            }
        } else if (key.startsWith('user')) {
            const [_, userId] = key.split(':');
            return {
                userId: parseInt(userId),
                travelPlanId: id,
                writePermission: permission.write,
                readPermission: permission.read
            };
        }
    }

    async addPublicPermission(id: number, permission: ACLPermission) {

        await this.prisma.travelPlanACLRule.create({
            data: {
                wildcard: '*',
                travelPlanId: id,
                writePermission: permission.write,
                readPermission: permission.read
            }
        });
    }

    async addUserPermission(id: number, userId: number, permission: ACLPermission) {

        await this.prisma.travelPlanACLRule.create({
            data: {
                userId: userId,
                travelPlanId: id,
                writePermission: permission.write,
                readPermission: permission.read
            }
        });
    }

    async addRolePermission(id: number, role: string | number, permission: ACLPermission) {
        if (typeof role === 'string') {
            await this.prisma.travelPlanACLRule.create({
                data: {
                    role: {
                        connectOrCreate: {
                            create: {
                                name: role,
                                description: `a role named ${role}`
                            },
                            where: {
                                name: role
                            }
                        }
                    },
                    travelPlan: {
                        connect: {
                            id: id,
                        }
                    },
                    writePermission: permission.write,
                    readPermission: permission.read
                }
            });
        }

        else if (typeof role === 'number') {
            await this.prisma.travelPlanACLRule.create({
                data: {
                    roleId: role,
                    travelPlanId: id,
                    writePermission: permission.write,
                    readPermission: permission.read
                }
            });
        }
    }

    @injectUser()
    async deleteMany(context: ServerContext, filters: any) {
        try {
            const deletedRecords = await this.prisma.travelPlan.deleteMany({
                where: filters,
            });
            const { services: { webHook } } = context;
            webHook.invokeCreate(context, 'travel-plan', 'delete-many', deletedRecords);
            return deletedRecords;
        } catch (error) {
            console.error(`Error deleting records: ${error.message}`);
        }
    }

    async updateUnique(context: ServerContext, data) {

        try {
            const { id, ...toUpdate } = data;

            const updatedRecord = await this.prisma.travelPlan.update({
                where: {
                    id: parseInt(id),
                },
                data: toUpdate,
            });

            const { services: { webHook } } = context;
            webHook.invokeCreate(context, 'travel-plan', 'update-unique', updatedRecord);
            return updatedRecord;
        }
        catch (error) {
            console.error(`Error deleting records: ${error.message}`);
        }
    }

    @injectUser()
    async findMany(context: ServerContext, filters: any) {
        const { services: { webHook }, dataSources: { acl }, session: { user } } = context;
        const aclFiltered = await this.prisma.travelPlan.findMany({
            where: {
                OR: [
                    {
                        ...filters,
                        aclRules: {
                            some: {
                                userId: parseInt(user.id),
                                readPermission: true
                            }
                        }
                    },
                    {
                        ...filters,
                        aclRules: {
                            some: {
                                roleId: { in: user.extendedRoles.map(r => r.id) },
                                readPermission: true
                            }
                        }
                    }
                ]
            }
        });

        return aclFiltered;
    }

    async findUnique(context: ServerContext, filters: any) {
        const item = await this.prisma.travelPlan.findUnique({ where: filters });
        return item;
    }
}