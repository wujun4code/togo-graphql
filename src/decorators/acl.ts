import { ServiceContext, SessionContext, ServerContext } from '../contracts/index.js';
import { GraphQLError } from 'graphql';

export interface FieldFilterAttribute {
    name: string;
    onFilter: (name, value) => boolean;
}

export function cleanFields(result, fields: FieldFilterAttribute[]) {

    fields.forEach(filter => {
        if (Array.isArray(result)) {
            result.forEach((v) => {
                const filtered = filter.onFilter(filter.name, v[filter.name]);
                if (filtered) {
                    delete v[filter.name];
                }
            });
        }
        else {
            const filtered = filter.onFilter(filter.name, result[filter.name]);
            if (filtered) {
                delete result[filter.name];
            }
        }
    });
    return result;
}

export function filterFields(fields: FieldFilterAttribute[]) {

    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const original = descriptor.value;

        descriptor.value = async function (...args) {
            const result = await original.call(this, ...args);
            const after = cleanFields(result, fields);
            return after;
        }
    };
}

export interface ObjectFilterAttribute {
    onFilter: (item) => boolean;
}


export function cleanObject(result, fields: ObjectFilterAttribute[]) {

    fields.forEach((filter, index, all) => {
        if (Array.isArray(result)) {
            const after = result.filter((item, i, r) => {
                if (filter.onFilter(item))
                    r.slice(i, 1);
            });
            return after;
        }
        else {
            const filtered = filter.onFilter(result);
            if (filtered == true)
                result = {};
        }
    });

    return result;
}

export function filterObject(fields: ObjectFilterAttribute[]) {

    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const original = descriptor.value;

        descriptor.value = async function (...args) {
            const result = await original.call(this, ...args);
            const after = cleanObject(result, fields);
            return after;
        }
    };
}


interface LimitSizeOnFilterAttribute {
    onFilter: (context: ServerContext, result: any) => boolean;
    limit: number;
}

export function limitSize(limitFilters: LimitSizeOnFilterAttribute[], backwardCompatible: boolean = true) {

    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const original = descriptor.value;

        descriptor.value = async function (...args) {

            const context = args[0] as ServerContext;

            const result = await original.call(this, ...args);
            if (Array.isArray(result)) {
                let limitSizes: number[] = [];
                limitFilters.forEach(filter => {
                    const filtered = filter.onFilter(context, result);
                    if (filtered)
                        limitSizes.push(filter.limit);
                });
                let limit = Math.min(...limitSizes);
                if (!backwardCompatible) limit = Math.max(...limitSizes);
                const after = result.slice(0, limit);
                return after;
            }
            return result;
        }
    };
}

export class ACL {

    hasACLPermissionByPrefix = (item: { acl }, user: { id, roles }, keyPrefix: 'role' | 'user', operation: 'read' | 'write') => {

        if (!item.acl) return true;

        if (item.acl['*'][operation] == true) {
            return true;
        }

        if (keyPrefix == 'role' && Array.isArray(user.roles) && user.roles.length > 0) {
            const found = user.roles.some(role => {
                const roleKey = `role:${role}`;

                if (roleKey in item.acl) {
                    const authorized = item.acl[`role:${role}`][operation];
                    if (authorized == true) return true;
                }
            });
            if (found == true) return found;
        }
        else if (keyPrefix == 'user') {
            const authorized = item.acl[`user:${user.id}`][operation];
            if (authorized == true) return true;
        }

        // for (const [key, value] of Object.entries(item.acl)) {
        //     console.log(`${key}: ${value}`);
        //     if (key.includes(keyPrefix)) {
        //         const roleName = key.split(':')[1];
        //         if (value[operation] == true && user.hasRole(roleName)) {
        //             return true;
        //         }
        //     }
        // }

        return false;
    }



    hasACLRole = (item: { acl }, user: { id, roles, }, operation: 'read' | 'write') => {
        return this.hasACLPermissionByPrefix(item, user, 'role', operation);
    };

    hasACLPermission = (item: { acl }, user: { id, roles, hasRole, hasPermission }, operation: 'read' | 'write') => {
        return this.hasACLPermissionByPrefix(item, user, 'user', operation);
    };


    hasRole = (user: { roles, hasRole }, roles: string[]) => {
        return roles.some(item => user.roles.includes(item));
        //return roles.some(item => user.hasRole(item));
    }

    hasPermission = (user: { permissions, hasPermission }, permissions: string[]) => {
        return permissions.some(item => user.permissions.includes(item));
        //return permissions.some(item => user.hasPermission(item));
    }
}

export function logger() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const original = descriptor.value;

        descriptor.value = async function (...args) {
            console.log('params: ', ...args);
            const result = await original.call(this, ...args);
            console.log('result: ', result);
            return result;
        }
    };
}

export interface FieldPermission {
    name: string;
    acl: any;
    operation: 'read' | 'write';
}

export function hasFieldPermission(fieldPermissions: FieldPermission[]) {

    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const original = descriptor.value;

        descriptor.value = async function (...args) {
            const {
                services: { acl },
                session: { user }
            }: {
                services: ServiceContext;
                session: SessionContext
            } = args[0];

            const result = await original.call(this, ...args);
            const filters = fieldPermissions.map(f => {
                return {
                    name: f.name,
                    onFilter: (name, value) => {
                        const authorized = acl.hasACLRole(f, user, f.operation);
                        return !authorized;
                    }
                };
            });

            const after = cleanFields(result, filters);

            return after;
        }
    };
}

export function hasPermission(permissions: string[]) {

    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const original = descriptor.value;

        descriptor.value = async function (...args) {
            const {
                services: { acl },
                session: { user }
            }: {
                services: ServiceContext;
                session: SessionContext
            } = args[0];

            const authorized = acl.hasPermission(user, permissions);
            if (authorized == false) {
                throw new GraphQLError(`no authorized permission for current user on current operation`, {
                    extensions: {
                        code: 'Forbidden',
                    },
                });
            }
            const result = await original.call(this, ...args);
            return result;
        }
    };
}

export function hasRole(roles: string[]) {

    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const original = descriptor.value;

        descriptor.value = async function (...args) {
            const {
                services: { acl },
                session: { user }
            }: {
                services: ServiceContext;
                session: SessionContext
            } = args[0];
            const authorized = acl.hasRole(user, roles);
            if (authorized == false) {
                throw new GraphQLError(`no authorized role for current user`, {
                    extensions: {
                        code: 'Forbidden',
                    },
                });
            }
            const result = await original.call(this, ...args);
            return result;
        }
    };
}
