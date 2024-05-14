import { PrismaClient, Prisma } from '@prisma/client';
import { ServerContext, SessionContext } from '../../contracts/index.js';
import { injectUser } from '../../decorators/index.js';
import { PrismaDataSource } from './base.js';
import { GraphQLError } from 'graphql';
import { GraphqlErrorCode } from '../../contracts/index.js';

export class RobotDataSource extends PrismaDataSource {
    constructor(config: { client: PrismaClient, session: SessionContext }) {
        super(config);
    }

    async countManagingBy(context: ServerContext, input: any) {
        let userId = parseInt(context.session.user.id);

        const {
            limit,
            skip,
            sorter,
            filters,
            cursor,
            sortedKey,
            sortValue,
            cursorFilter,
            supportedSortFields,
        } = this.prepareFilters(input);

        if (input && input.snsName) {
            const targetUser = await context.dataSources.user.getUniqueUser(context, input);
            userId = targetUser.id;
        }

        const count = await this.prisma.robot.count({
            where: {
                managingUserId: userId,
            },
        });
        return count;
    }

    async managingBy(context: ServerContext, input: any) {

        let userId = parseInt(context.session.user.id);

        const {
            limit,
            skip,
            sorter,
            filters,
            cursor,
            sortedKey,
            sortValue,
            cursorFilter,
            supportedSortFields,
        } = this.prepareFilters(input);

        if (input && input.snsName) {
            const targetUser = await context.dataSources.user.getUniqueUser(context, input);
            userId = targetUser.id;
        }

        const robots = await this.prisma.robot.findMany({
            where: {
                managingUserId: userId,
            },
            ...(cursor && sortedKey && supportedSortFields.includes(sortedKey) && {
                cursor: {
                    id: cursor
                }
            }),
            orderBy: sorter ? sorter : {
                createdAt: 'desc',
            },
            take: limit,
            select: {
                id: true,
                managingOrganizationId: true,
                managingUserId: true,
                hookUrl: true,
                website: true,
                relatedUserId: true,
            },
        });

        return robots;
    }

    async findBySnsName(context: ServerContext, input: any) {
        const { snsName } = input;
        const data = await this.prisma.robot.findFirst(
            {
                where: {
                    relatedUser: { snsName: snsName },
                }
            });

        return data;
    }
    
    async findById(context: ServerContext, input: any) {
        const { id } = input;
        const data = await this.prisma.robot.findUnique(
            {
                where: {
                    id: parseInt(id),
                }
            });

        return data;
    }

    async update(context: ServerContext, input: any) {
        // const data = await this.prisma.robot.update({
        //     where: { id: parseInt(input.id) },
        //     data: {
        //         website: input.website,
        //         hookUrl: input.hookUrl,
        //         headers: {
        //             upsert: {
        //                 where: {
        //                     key: input.headers[0].key,
        //                 },
        //                 create: {
        //                     key: input.headers[0].key,
        //                     value: input.headers[0].value,
        //                 },
        //             }
        //         },
        //     },
        // });
        let headers = [];
        if (input.headers) {
            headers = input.headers;
        }
        const { id, ...toUpdatedFields } = input;
        const robotId = parseInt(id);
        const updatedRobot = await this.prisma.robot.update({
            where: { id: robotId },
            data: {
                ...toUpdatedFields,
                headers: {
                    upsert: headers.map(header => ({
                        where: {
                            unique_robot_key_constraint: {
                                robotId,
                                key: header.key,
                            },
                        },
                        update: {
                            key: header.key,
                            value: header.value,
                        },
                        create: {
                            key: header.key,
                            value: header.value,
                        },
                    })),
                },
            },
            include: {
                headers: true,
            },
        });

        return updatedRobot;
    }

    async create(context: ServerContext, input: any) {
        const currentUserId = parseInt(context.session.user.id);
        const { relatedUser, hookUrl, website } = input;

        try {
            const data = await this.prisma.robot.create({
                data: {
                    website: website,
                    hookUrl: hookUrl,
                    relatedUser: {
                        create: {
                            snsName: relatedUser.snsName,
                            email: relatedUser.email,
                            username: relatedUser.username ? relatedUser.username : relatedUser.snsName,
                            bio: relatedUser.bio,
                            friendlyName: relatedUser.friendlyName,
                            avatar: relatedUser.avatar
                        }
                    },
                    managingUser: {
                        connect: { id: currentUserId }
                    }
                }
            });

            return data;
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
                throw new GraphQLError(e.message, {
                    extensions: {
                        code: GraphqlErrorCode.BAD_REQUEST,
                        name: GraphqlErrorCode[GraphqlErrorCode.BAD_REQUEST],
                    },
                });
            }
        }
    }
}