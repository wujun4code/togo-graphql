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

export class PostDataSource extends PrismaDataSource {
    constructor(config: { client: PrismaClient, session: SessionContext }) {
        super(config);
    }

    async getTrendingFeed(context: ServerContext, input: any) {
        if (!input) input = {};
        const limit = input.limit ? input.limit : 10;
        const skip = input.skip ? input.skip : 0;
        const sorter = input.sorted;
        const filters = input.filters ? input.filters : {};

        const trendingFeedPosts = await this.prisma.post.findMany({
            where: {
                ...filters,
            },
            orderBy: sorter ? sorter : {
                postedAt: 'desc',
            },
            take: limit,
            skip: skip,
        });

        return trendingFeedPosts;
    }

    @injectUser()
    async getTimeline(context: ServerContext, input: any) {
        const currentUserId = parseInt(context.session.user.id);
        if (!input) input = {};
        const limit = input.limit ? input.limit : 10;
        const skip = input.skip ? input.skip : 0;
        const sorter = input.sorted;
        const filters = input.filters ? input.filters : {};
        // SELECT "Post".*
        // FROM "Follow" JOIN "User" ON "Follow"."followeeId" = "User"."id" 
        // JOIN "Post" ON "User"."id" = "Post"."authorId"
        // WHERE "Follow"."followerId" = 2
        const timelinePosts = await this.prisma.post.findMany({
            where: {
                OR: [
                    {
                        ...filters,
                        authorId: currentUserId,
                    },
                    {
                        ...filters,
                        author: {
                            followees: {
                                some: {
                                    followerId: currentUserId
                                }
                            },
                        },
                    },
                ],
            },
            orderBy: sorter ? sorter : {
                postedAt: 'desc',
            },
            take: limit,
            skip: skip,
        });

        return timelinePosts;
    }

    @injectUser()
    async create(context: ServerContext, input: any) {
        const created = await this.prisma.post.create({
            data: {
                author: {
                    connect: {
                        id: parseInt(context.session.user.id),
                    }
                },
                content: input.content,
                published: input.published ? input.published : true,
            }
        });
        const { services: { webHook }, dataSources: { acl }, session: { user } } = context;

        const resourceName = 'post';

        const aclRules = {
            ...defaultACLRule,
            [`user:${user.id}`]: {
                read: true,
                write: true
            }
        };

        await acl.addACLRulesX(aclRules, {
            wildcard: {
                publicACLRuleTable: this.prisma.post_PublicACLRule,
                wildcardField: 'wildcard',
                wildcardFieldValue: "*",
                resourceIdField: 'postId',
                resourceId: created.id
            },
            userInput: {
                userACLRuleTable: this.prisma.post_UserACLRule,
                resourceIdField: 'postId',
                resourceId: created.id,
                userIdField: 'userId',
            },
            roleInput: {
                roleACLRuleTable: this.prisma.post_RoleACLRule,
                resourceField: 'post',
                resourceIdField: 'postId',
                resourceId: created.id,
                roleIdField: 'roleId',
            }
        })

        webHook.invokeCreate(context, resourceName, 'create', created);

        return created;
    }

    @injectUser()
    async deleteMany(context: ServerContext, filters: any) {
        const { services: { webHook }, dataSources: { acl }, session: { user } } = context;
        try {
            const aclWhere = acl.createDeleteFiltersX(filters, user, 'writePermission', {
                publicRuleRelation: {
                    publicACLRuleField: "aclPublicRules",
                    wildcardField: "wildcard",
                    wildcardFieldValue: "*",
                },
                userRuleRelation: {
                    userACLRuleField: "aclUserRules",
                    userIdField: "userId",
                },
                roleRuleRelation: {
                    roleACLRuleField: "aclRolesRules",
                    roleIdField: "roleId",
                }
            });
            const deletedRecords = await this.prisma.post.deleteMany({
                where: aclWhere,
            });
            webHook.invokeCreate(context, 'post', 'delete-many', deletedRecords);
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
            const aclWhere = acl.createUpdateFiltersX(id, user, 'writePermission', {
                publicRuleRelation: {
                    publicACLRuleField: "aclPublicRules",
                    wildcardField: "wildcard",
                    wildcardFieldValue: "*",
                },
                userRuleRelation: {
                    userACLRuleField: "aclUserRules",
                    userIdField: "userId",
                },
                roleRuleRelation: {
                    roleACLRuleField: "aclRolesRules",
                    roleIdField: "roleId",
                }
            });
            const updatedRecord = await this.prisma.post.update({
                where: aclWhere,
                data: toUpdate,
            });
            webHook.invokeCreate(context, 'post', 'update-unique', updatedRecord);
            return updatedRecord;
        }
        catch (error) {
            console.error(`Error deleting records: ${error.message}`);
        }
    }

    @injectUser()
    async findMany(context: ServerContext, filters: any) {
        const { dataSources: { acl }, session: { user } } = context;
        const aclWhere = acl.createFindFiltersX(filters, user, 'readPermission', {
            publicRuleRelation: {
                publicACLRuleField: "aclPublicRules",
                wildcardField: "wildcard",
                wildcardFieldValue: "*",
            },
            userRuleRelation: {
                userACLRuleField: "aclUserRules",
                userIdField: "userId",
            },
            roleRuleRelation: {
                roleACLRuleField: "aclRolesRules",
                roleIdField: "roleId",
            }
        });
        const aclFiltered = await this.prisma.post.findMany({ where: aclWhere });
        return aclFiltered;
    }

    @injectUser()
    async findUnique(context: ServerContext, filters: any) {
        const [item] = await this.findMany(context, filters);
        return item;
    }
}