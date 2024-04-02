import { PrismaClient } from '@prisma/client';
import { ServerContext, SessionContext } from '../../contracts/index.js';
import { injectUser } from '../../decorators/index.js';
import { PrismaDataSource } from './base.js';
import { GraphQLError } from 'graphql';
import { GraphqlErrorCode } from '../../contracts/index.js';

export class RobotDataSource extends PrismaDataSource {
    constructor(config: { client: PrismaClient, session: SessionContext }) {
        super(config);
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

    async create(context: ServerContext, input: any) {
        const currentUserId = parseInt(context.session.user.id);
        const { relatedUser, hookUrl, website } = input;
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
    }
}