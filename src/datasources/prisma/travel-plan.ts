import { PrismaClient } from '@prisma/client';
import { SessionContext } from '../../contracts/index.js';
import { PrismaDataSource } from './base.js';
import { ServerContext } from '../../contracts/index.js';
import { injectUser } from '../../decorators/index.js';

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
        const { services: { webHook } } = context;
        webHook.invokeCreate(context, 'travel-plan', 'create', created);
        return created;
    }

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

    async findMany(context: ServerContext, filters: any) {
        const data = await this.prisma.travelPlan.findMany({ where: filters });
        return data;
    }
}