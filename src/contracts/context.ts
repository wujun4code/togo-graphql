import { LocationDataSource, WeatherDataSource, UserDataSource, AirDataSource, OpenWeatherMapDataSource, OpenWeatherMap } from '../datasources/index.js';
import { ACL } from '../decorators/index.js';
import { GraphQLError } from 'graphql';

export interface UserInterface {
    id: string;
    name: string;
    roles: string[];
    permissions: string[];
    hasRole: (roleName: string) => boolean;
    hasPermission: (permission: string) => boolean;
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
        this.roles = this.content.resource_access[resource]['roles'];
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
        air: AirDataSource,
        owmWeather: OpenWeatherMap.WeatherDataSource,
    };
}

