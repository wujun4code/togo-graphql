import { PrismaClient } from '@prisma/client';
import { ServerContext, SessionContext } from '../../contracts/index.js';
import { injectUser } from '../../decorators/index.js';
import { PrismaDataSource } from './base.js';

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

        await acl.addACLRules(this.prisma.travelPlanACLRule, aclRules, 'travelPlan', 'travelPlanId', created.id);

        webHook.invokeCreate(context, resourceName, 'create', created);

        return created;
    }

    @injectUser()
    async deleteMany(context: ServerContext, filters: any) {
        const { services: { webHook }, dataSources: { acl }, session: { user } } = context;
        try {
            const aclWhere = acl.createDeleteFilters(filters, 'aclRules', user, 'writePermission');
            const deletedRecords = await this.prisma.travelPlan.deleteMany({
                where: aclWhere,
            });
            webHook.invokeCreate(context, 'travel-plan', 'delete-many', deletedRecords);
            return deletedRecords;
        } catch (error) {
            console.error(`Error deleting records: ${error.message}`);
        }
    }

    @injectUser()
    async deleteUnique(context: ServerContext, filters: any) {
        return await this.deleteMany(context, filters);
    }

    @injectUser()
    async updateUnique(context: ServerContext, data) {
        const { services: { webHook }, dataSources: { acl }, session: { user } } = context;
        try {
            const { id, ...toUpdate } = data;
            const aclWhere = acl.createUpdateFilters(id, 'aclRules', user, 'writePermission');
            const updatedRecord = await this.prisma.travelPlan.update({
                where: aclWhere,
                data: toUpdate,
            });
            webHook.invokeCreate(context, 'travel-plan', 'update-unique', updatedRecord);
            return updatedRecord;
        }
        catch (error) {
            console.error(`Error deleting records: ${error.message}`);
        }
    }

    @injectUser()
    async findMany(context: ServerContext, filters: any) {
        const { dataSources: { acl }, session: { user } } = context;
        const aclWhere = acl.createFindFilters(filters, 'aclRules', user, 'readPermission');
        const aclFiltered = await this.prisma.travelPlan.findMany({ where: aclWhere });
        return aclFiltered;
    }

    @injectUser()
    async findUnique(context: ServerContext, filters: any) {
        const [item] = await this.findMany(context, filters);
        return item;
    }
}