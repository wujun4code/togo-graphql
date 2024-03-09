import { PrismaClient } from '@prisma/client';
import { SessionContext } from '../../contracts/index.js';
import { PrismaDataSource } from './base.js';
import { ServerContext } from '../../contracts/index.js';
import { injectUser } from '../../decorators/index.js';

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

    async createACLRules(input: CreateACLRuleInput, resourceIdField: string, id: number) {

        let bulk = [];

        for (const key in input) {
            const item = this.mapToACLRule(key, input[key], resourceIdField, id);
            bulk.push(item);
        }
        const asyncResults = await Promise.all(bulk.map(data => this.prisma.travelPlanACLRule.create({ data: data })));
    };

    mapToACLRule(key: string, permission: ACLPermission, resourceIdField: string, id: number) {
        if (key === "*") {
            const p = this.createPublicPermission(resourceIdField, id, permission);
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

    async createPublicPermission(resourceIdField: string, id: number, permission: ACLPermission) {
        return {
            data: {
                wildcard: '*',
                [resourceIdField]: id,
                writePermission: permission.write,
                readPermission: permission.read
            }
        };
    }
}