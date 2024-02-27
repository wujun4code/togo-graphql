import { LocationDataSource, WeatherDataSource, UserDataSource } from '../datasources/index.js';
import { ACL } from '../decorators/index.js';
import { Grant } from 'keycloak-connect';
import { GraphQLError } from 'graphql';

export interface UserInterface {
    id: string;
    name: string;
    roles: string[];
    permissions: string[];
    hasRole: (roleName: string) => boolean;
    hasPermission: (permission: string) => boolean;
}

export class KeycloakGrantUser implements UserInterface {
    grant: Grant;
    id: string;
    constructor(grant: Grant) {
        this.grant = grant;

        // const subscribed = grant.access_token.hasApplicationRole(process.env.KEYCLOAK_CLIENT, 'subscribed');

        // const isUser = grant.access_token.hasRealmRole('user');

        // const hasViewProfilePermission = grant.access_token.hasApplicationRole('account', 'view-profile');
    }

    name: string;
    roles: [];
    permissions: [];
    hasRole = (roleName: string): boolean => {
        if (this.grant.access_token.isExpired()) {
            throw new GraphQLError('access token is expired.', {
                extensions: {
                    code: 'Unauthorized',
                },
            });
        }
        return this.grant.access_token.hasApplicationRole(process.env.KEYCLOAK_CLIENT, roleName);
    }

    hasPermission = (permission: string): boolean => {
        return this.hasRole(permission);
    }
}

export interface KeycloakAccessTokenContent {
    sub: string;
    realm_access: {
        roles: string[];
    };
    resource_access: {
        [key: string]: {
            roles: string[];
        };
    };
    name: string;
    preferred_username: string;
    given_name: string;
    family_name: string;
    email: string;
}

export class KeycloakAccessTokenUser implements UserInterface {

    content: KeycloakAccessTokenContent;

    id: string;
    name: string;
    roles: string[];
    permissions: string[];

    constructor(resource: string, accessTokenContent: KeycloakAccessTokenContent) {
        if (!accessTokenContent) return;
        this.content = accessTokenContent;
        this.id = this.content.sub;
        this.name = this.content.name;
        this.roles = this.content.resource_access[resource]['roles']
        this.permissions = this.content.resource_access[resource]['roles'];
    }


    hasRole = (roleName: string): boolean => {
        return this.roles.includes(roleName);
    }

    hasPermission = (permission: string): boolean => {
        return this.hasRole(permission);
    }
}


export interface SessionContext {
    user: UserInterface,
}

export interface ServiceContext {
    acl: ACL;
}

export interface HttpContext {
    req: any;
    res: any;
}

export interface ServerContext {
    http: HttpContext;
    session: SessionContext,
    services: ServiceContext;
    dataSources: {
        location: LocationDataSource;
        weather: WeatherDataSource,
    };
}

