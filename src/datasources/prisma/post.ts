import { PrismaClient } from '@prisma/client';
import { ServerContext, SessionContext, GraphqlErrorCode } from '../../contracts/index.js';
import { injectUser } from '../../decorators/index.js';
import { PrismaDataSource } from './base.js';
import { GraphQLError } from 'graphql';


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

    async getPost(context: ServerContext, input: any) {
        if (!input) input = {};
        const { id } = input;

        if (!id) {
            throw new GraphQLError(`id ${id} not found.`, {
                extensions: {
                    code: GraphqlErrorCode.BAD_REQUEST,
                    name: GraphqlErrorCode[GraphqlErrorCode.BAD_REQUEST],
                },
            });
        }

        const post = await this.prisma.post.findUnique({ where: { id: id } });

        return post;
    }

    async getTrendingFeed(context: ServerContext, input: any) {

        if (!input) input = {};
        const limit = input.limit ? input.limit : 10;
        const skip = input.skip ? input.skip : 0;
        const sorter = input.sorted ? input.sorted : { postedAt: 'desc' };
        const filters = input.filters ? input.filters : {};
        const cursor = input.cursor ? input.cursor : null;
        const sortedKey = Object.keys(sorter)[0];
        const sortValue = Object.values(sorter)[0]
        const cursorFilter = cursor != null ? sortValue === 'desc' ? { [sortedKey]: { lt: cursor } } : { [sortedKey]: { gt: cursor } } : {};
        const supportedSortFields = ['updatedAt', 'id', 'postedAt'];
        if (!supportedSortFields.includes(sortedKey)) {
            throw new GraphQLError(`${sortedKey} in not a one of supported sort fields.`, {
                extensions: {
                    code: GraphqlErrorCode.BAD_REQUEST,
                    name: GraphqlErrorCode[GraphqlErrorCode.BAD_REQUEST],
                },
            });
        }
        const trendingFeedPosts = await this.prisma.post.findMany({
            where: {
                ...filters,
            },
            ...(cursor && sortedKey && supportedSortFields.includes(sortedKey) && {
                cursor: {
                    postedAt: cursor
                }
            }),
            orderBy: sorter ? sorter : {
                postedAt: 'desc',
            },
            take: limit,
        });

        return trendingFeedPosts;
    }

    async getByUser(context: ServerContext, input: any) {
        if (!input) input = {};
        const userId = input.userId;

        if (!userId)
            throw new GraphQLError(`user not found.`, {
                extensions: {
                    code: GraphqlErrorCode.BAD_REQUEST,
                    name: GraphqlErrorCode[GraphqlErrorCode.BAD_REQUEST],
                },
            });

        const limit = input.limit ? input.limit : 10;
        const skip = input.skip ? input.skip : 0;
        const sorter = input.sorted ? input.sorted : { postedAt: 'desc' };
        const filters = input.filters ? input.filters : {};
        const cursor = input.cursor ? input.cursor : null;
        const sortedKey = Object.keys(sorter)[0];
        const sortValue = Object.values(sorter)[0]
        const cursorFilter = cursor != null ? sortValue === 'desc' ? { [sortedKey]: { lt: cursor } } : { [sortedKey]: { gt: cursor } } : {};

        const supportedSortFields = ['updatedAt', 'id', 'postedAt'];
        if (!supportedSortFields.includes(sortedKey)) {
            throw new GraphQLError(`${sortedKey} in not a one of supported sort fields.`, {
                extensions: {
                    code: GraphqlErrorCode.BAD_REQUEST,
                    name: GraphqlErrorCode[GraphqlErrorCode.BAD_REQUEST],
                },
            });
        }
        const postsByUser = await this.prisma.post.findMany({
            where: {
                authorId: userId,
                ...filters,
            },
            ...(cursor && sortedKey && supportedSortFields.includes(sortedKey) && {
                cursor: {
                    postedAt: cursor
                }
            }),
            orderBy: sorter ? sorter : {
                postedAt: 'desc',
            },
            take: limit,
            //skip: skip,
        });

        return postsByUser;
    }

    @injectUser()
    async getTimeline(context: ServerContext, input: any) {
        const currentUserId = parseInt(context.session.user.id);
        if (!input) input = {};
        const limit = input.limit ? input.limit : 10;
        const skip = input.skip ? input.skip : 0;
        const sorter = input.sorted ? input.sorted : { postedAt: 'desc' };
        const filters = input.filters ? input.filters : {};
        const cursor = input.cursor ? input.cursor : null;
        const sortedKey = Object.keys(sorter)[0];
        const sortValue = Object.values(sorter)[0]
        const cursorFilter = cursor != null ? sortValue === 'desc' ? { [sortedKey]: { lt: cursor } } : { [sortedKey]: { gt: cursor } } : {};

        const supportedSortFields = ['updatedAt', 'id', 'postedAt'];
        if (!supportedSortFields.includes(sortedKey)) {
            throw new GraphQLError(`${sortedKey} in not a one of supported sort fields.`, {
                extensions: {
                    code: GraphqlErrorCode.BAD_REQUEST,
                    name: GraphqlErrorCode[GraphqlErrorCode.BAD_REQUEST],
                },
            });
        }
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
                            asFollowees: {
                                some: {
                                    followerId: currentUserId
                                }
                            },
                        },
                    },
                ],
            },
            ...(cursor && sortedKey && supportedSortFields.includes(sortedKey) && {
                cursor: {
                    postedAt: cursor
                }
            }),
            orderBy: sorter ? sorter : {
                postedAt: 'desc',
            },
            take: limit,
            //skip: skip,
        });

        return timelinePosts;
    }

    @injectUser()
    async create(context: ServerContext, input: any) {

        const { services: { webHook }, dataSources: { acl }, session: { user } } = context;

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

    async findRootComments(context: ServerContext, input: any) {
        if (!input) input = {};

        const postId = input.postId;

        if (!postId) {
            throw new GraphQLError(`${postId} in not a valid post id.`, {
                extensions: {
                    code: GraphqlErrorCode.BAD_REQUEST,
                    name: GraphqlErrorCode[GraphqlErrorCode.BAD_REQUEST],
                },
            });
        }

        const limit = input.limit ? input.limit : 10;
        const skip = input.skip ? input.skip : 0;
        const sorter = input.sorted ? input.sorted : { createdAt: 'desc' };
        const filters = input.filters ? input.filters : {};
        const cursor = input.cursor ? input.cursor : null;
        const sortedKey = Object.keys(sorter)[0];
        const sortValue = Object.values(sorter)[0]
        const cursorFilter = cursor != null ? sortValue === 'desc' ? { [sortedKey]: { lt: cursor } } : { [sortedKey]: { gt: cursor } } : {};

        const supportedSortFields = ['updatedAt', 'id', 'createdAt'];
        if (!supportedSortFields.includes(sortedKey)) {
            throw new GraphQLError(`${sortedKey} in not a one of supported sort fields.`, {
                extensions: {
                    code: GraphqlErrorCode.BAD_REQUEST,
                    name: GraphqlErrorCode[GraphqlErrorCode.BAD_REQUEST],
                },
            });
        }
        const rootComments = await this.prisma.postComment.findMany({
            where: {
                postId: parseInt(postId),
                threadId: null,
                replyTo: null,
                ...filters,
            },
            ...(cursor && sortedKey && supportedSortFields.includes(sortedKey) && {
                cursor: {
                    createdAt: cursor
                }
            }),
            orderBy: sorter ? sorter : {
                createdAt: 'desc',
            },
            take: limit,
            //skip: skip,
        });

        return rootComments;
    }

    async createComment(context: ServerContext, input: any) {

        const { postId, replyToId, threadId, content } = input;

        const { services: { webHook }, dataSources: { acl }, session: { user } } = context;

        const created = await this.prisma.postComment.create({
            data: {
                author: {
                    connect: {
                        id: parseInt(context.session.user.id),
                    }
                },
                ...(replyToId !== undefined ?
                    {
                        replyTo: {
                            connect: {
                                id: parseInt(replyToId)
                            }
                        }
                    }
                    : {}),
                ...(threadId !== undefined ?
                    {
                        thread: {
                            connect: {
                                id: parseInt(threadId)
                            }
                        }
                    }
                    : {}),
                post: {
                    connect: {
                        id: parseInt(postId)
                    }
                },
                content: content,
            }
        });

        return created;
    }
}