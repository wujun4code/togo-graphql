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

export interface UserACLRelation {
    userACLRuleField: string;
    userIdField: string;
}
export interface RoleACLRelation {
    roleACLRuleField: string;
    roleIdField: string;
}

export interface PublicACLRelation {
    publicACLRuleField: string;
    wildcardField: string;
    wildcardFieldValue: string;
}

export interface UserACLInput {
    userACLRuleTable: any;
    resourceIdField: string;
    resourceId: number;
    userIdField: string;
}

export interface RoleACLInput {
    roleACLRuleTable: any;
    resourceField: string;
    resourceIdField: string;
    resourceId: number,
    roleIdField: string;
}

export interface WildcardInput {
    publicACLRuleTable: any;
    wildcardField: string;
    wildcardFieldValue: string;
    resourceId: number,
    resourceIdField: string,
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

    async addACLRulesX(
        rules: CreateACLRuleInput,
        input: { wildcard: WildcardInput, userInput: UserACLInput, roleInput: RoleACLInput }) {
        const bulk = this.createACLRulesX(rules, input);
        await Promise.all(bulk);
    }

    createFindFiltersX(
        filters: any,
        user: ExtendedUserInterface,
        permissionField: string,
        aclRuleMapping: {
            publicRuleRelation: PublicACLRelation,
            userRuleRelation: UserACLRelation,
            roleRuleRelation: RoleACLRelation
        }) {

        const where = {
            OR: [
                {
                    ...filters,
                    [aclRuleMapping.userRuleRelation.userACLRuleField]: {
                        some: {
                            [aclRuleMapping.userRuleRelation.userIdField]: parseInt(user.id),
                            [permissionField]: true
                        }
                    }
                },
                {
                    ...filters,
                    [aclRuleMapping.roleRuleRelation.roleACLRuleField]: {
                        some: {
                            [aclRuleMapping.roleRuleRelation.roleIdField]: { in: user.extendedRoles.map(r => r.id) },
                            [permissionField]: true
                        }
                    }
                },
                {
                    ...filters,
                    [aclRuleMapping.publicRuleRelation.publicACLRuleField]: {
                        some: {
                            [aclRuleMapping.publicRuleRelation.wildcardField]: aclRuleMapping.publicRuleRelation.wildcardFieldValue,
                            [permissionField]: true
                        }
                    }
                }
            ]
        };

        return where;

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

    createDeleteFiltersX(filters: any,
        user: ExtendedUserInterface,
        permissionField: string,
        aclRuleMapping: {
            publicRuleRelation: PublicACLRelation,
            userRuleRelation: UserACLRelation,
            roleRuleRelation: RoleACLRelation
        }) {
        return this.createFindFiltersX(filters, user, permissionField, aclRuleMapping);
    }

    createUpdateFiltersX(
        id: number | string,
        user: ExtendedUserInterface,
        permissionField: string,
        aclRuleMapping: {
            publicRuleRelation: PublicACLRelation,
            userRuleRelation: UserACLRelation,
            roleRuleRelation: RoleACLRelation
        }) {
        const where = {
            id: typeof id === 'string' ? parseInt(id) : id,
            OR: [{
                [aclRuleMapping.userRuleRelation.userACLRuleField]: {
                    some: {
                        [aclRuleMapping.userRuleRelation.userIdField]: parseInt(user.id),
                        writePermission: true
                    }
                },
            }, {
                [aclRuleMapping.roleRuleRelation.roleACLRuleField]: {
                    some: {
                        [aclRuleMapping.roleRuleRelation.roleIdField]: { in: user.extendedRoles.map(r => r.id) },
                        [permissionField]: true
                    }
                }
            },
            {
                [aclRuleMapping.publicRuleRelation.publicACLRuleField]: {
                    some: {
                        [aclRuleMapping.publicRuleRelation.wildcardField]: aclRuleMapping.publicRuleRelation.wildcardFieldValue,
                        [permissionField]: true
                    }
                }
            }],
        };
        return where;
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

    createACLRulesX(rule: CreateACLRuleInput, input: { wildcard: WildcardInput, userInput: UserACLInput, roleInput: RoleACLInput }) {

        let bulk = [];

        for (const key in rule) {
            const item = this.mapToACLRuleX(key, rule[key], input);
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

    mapToACLRuleX(key: string,
        permission: ACLPermission,
        input: { wildcard: WildcardInput, userInput: UserACLInput, roleInput: RoleACLInput }) {

        const { wildcard, userInput, roleInput } = input;

        if (key === "*") {
            const data = this.createPublicPermissionX(wildcard, permission);
            return wildcard.publicACLRuleTable.create({ data: data });
        }
        else if (key.startsWith('role')) {
            const [_, role] = key.split(':');
            const data = this.createRolePermissionX(roleInput, role, permission);
            return roleInput.roleACLRuleTable.create({ data: data });
        } else if (key.startsWith('user')) {
            const [_, userId] = key.split(':');
            const data = this.createUserPermissionX(userInput, parseInt(userId), permission);
            return userInput.userACLRuleTable.create({ data: data });
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

    createPublicPermissionX(input: WildcardInput, permission: ACLPermission) {
        return {
            [input.wildcardField]: input.wildcardFieldValue,
            [input.resourceIdField]: input.resourceId,
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

    createUserPermissionX(input: UserACLInput, userId: number, permission: ACLPermission) {
        return {
            [input.userIdField]: userId,
            [input.resourceIdField]: input.resourceId,
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

    createRolePermissionX(input: RoleACLInput, role: string, permission: ACLPermission) {

        const { resourceIdField, resourceField, roleIdField, resourceId } = input;

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
                        id: resourceId,
                    }
                },
                writePermission: permission.write,
                readPermission: permission.read
            };
            return data;
        }

        else {
            const data = {
                [roleIdField]: role,
                [resourceIdField]: resourceId,
                writePermission: permission.write,
                readPermission: permission.read
            }
            return data;
        }
    }
}