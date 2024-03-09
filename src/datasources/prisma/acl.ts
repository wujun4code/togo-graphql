import { PrismaClient } from '@prisma/client';
import { ExtendedUserInterface, SessionContext } from '../../contracts/index.js';
import { PrismaDataSource } from './base.js';

export interface ACLPermission {
    write: boolean;
    read: boolean;
}

export interface CreateRoleInput {
    name: string;
    description?: string;
}

export interface CreateACLRuleInput {
    [key: string]: ACLPermission;
}

export class ACLDataSource extends PrismaDataSource {
    constructor(config: { client: PrismaClient, session: SessionContext }) {
        super(config);
    }

    async addPublicPermission(prismaACLTable: any, resourceIdField: string, id: number, permission: ACLPermission) {
        const publicPermission = this.createPublicPermission(resourceIdField, id, permission);
        await prismaACLTable.create({ data: publicPermission });
    }

    async addUserPermission(prismaACLTable: any, resourceIdField: string, id: number, userId: number, permission: ACLPermission) {
        const userPermission = this.createUserPermission(resourceIdField, id, userId, permission);
        await prismaACLTable.create({ data: userPermission });
    }

    async addRolePermission(prismaACLTable: any, role: string, resourceField: string,
        resourceIdField: string,
        id: number, permission: ACLPermission) {
        const rolePermission = this.createRolePermission(role, resourceField, resourceIdField, id, permission);
        await prismaACLTable.create({ data: rolePermission });
    }

    async addACLRules(prismaACLTable: any,
        input: CreateACLRuleInput,
        resourceField: string,
        resourceIdField: string,
        id: number) {
        const bulk = this.createACLRules(input, resourceField, resourceIdField, id);
        await Promise.all(bulk.map(data => prismaACLTable.create({ data: data })));
    }

    createFindFilters(filters: any, aclRulesRelationField: string, user: ExtendedUserInterface, permissionField: string) {
        const where = {
            OR: [
                {
                    ...filters,
                    [aclRulesRelationField]: {
                        some: {
                            userId: parseInt(user.id),
                            [permissionField]: true
                        }
                    }
                },
                {
                    ...filters,
                    [aclRulesRelationField]: {
                        some: {
                            roleId: { in: user.extendedRoles.map(r => r.id) },
                            [permissionField]: true
                        }
                    }
                },
                {
                    ...filters,
                    [aclRulesRelationField]: {
                        some: {
                            wildcard: "*",
                            [permissionField]: true
                        }
                    }
                }
            ]
        };

        return where;
    }

    createDeleteFilters(filters: any, aclRulesRelationField: string, user: ExtendedUserInterface, permissionField: string) {
        return this.createFindFilters(filters, aclRulesRelationField, user, permissionField);
    }

    createUpdateFilters(id: number | string, aclRulesRelationField: string, user: ExtendedUserInterface, permissionField: string) {
        const where = {
            id: typeof id === 'string' ? parseInt(id) : id,
            OR: [{
                [aclRulesRelationField]: {
                    some: {
                        userId: parseInt(user.id),
                        writePermission: true
                    }
                },
            }, {
                [aclRulesRelationField]: {
                    some: {
                        roleId: { in: user.extendedRoles.map(r => r.id) },
                        [permissionField]: true
                    }
                }
            },
            {
                [aclRulesRelationField]: {
                    some: {
                        wildcard: '*',
                        [permissionField]: true
                    }
                }
            }],
        };
        return where;
    }

    createACLRules(input: CreateACLRuleInput,
        resourceField: string,
        resourceIdField: string,
        id: number) {

        let bulk = [];

        for (const key in input) {
            const item = this.mapToACLRule(key, input[key], resourceField, resourceIdField, id);
            bulk.push(item);
        }

        return bulk;
    };

    mapToACLRule(
        key: string,
        permission: ACLPermission,
        resourceField: string,
        resourceIdField: string,
        id: number) {

        if (key === "*") {
            return this.createPublicPermission(resourceIdField, id, permission);
        } else if (key.startsWith('role')) {
            const [_, role] = key.split(':');
            return this.createRolePermission(role, resourceField, resourceIdField, id, permission);
        } else if (key.startsWith('user')) {
            const [_, userId] = key.split(':');
            return this.createUserPermission(resourceIdField, id, parseInt(userId), permission);
        }
    }

    createPublicPermission(resourceIdField: string, id: number, permission: ACLPermission) {
        return {
            wildcard: '*',
            [resourceIdField]: id,
            writePermission: permission.write,
            readPermission: permission.read
        };
    }

    createUserPermission(resourceIdField: string, id: number, userId: number, permission: ACLPermission) {
        return {
            userId: userId,
            [resourceIdField]: id,
            writePermission: permission.write,
            readPermission: permission.read
        };
    }

    createRolePermission(role: string, resourceField: string,
        resourceIdField: string,
        id: number, permission: ACLPermission) {

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
                [resourceField]: {
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
                [resourceIdField]: id,
                writePermission: permission.write,
                readPermission: permission.read
            }
            return data;
        }
    }
}