import {
    LocationDataSource, WeatherDataSource,
    AirDataSource, OpenWeatherMap,
    PrismaDataSource, TravelPlanDataSource,
    WebHookDataSource, LocationPointDataSource, ACLDataSource,
    PostDataSource, UserDataSource, FollowDataSource
} from '../datasources/index.js';

import { WebHookService } from '../services/index.js';
import { ACL } from '../decorators/index.js';

export interface OAuth2UserInterface {

    provider: string;
    clientId: string;
    id: string;
    sub: string;
    username: string;
    roles: string[];
    permissions: string[];
    email: string;
    friendlyName: string;
    hasRole: (roleName: string) => boolean;
    hasPermission: (permission: string) => boolean;
}

export interface ExtendedRole {
    name: string;
    id: number;
}

export interface ExtendedUserInterface extends OAuth2UserInterface {
    extendedRoles: ExtendedRole[];
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

export class KeycloakAccessTokenUser implements OAuth2UserInterface {

    content: KeycloakAccessTokenContent;

    provider: string;
    clientId: string;
    id: string;
    sub: string;
    email: string;
    username: string;
    friendlyName: string;
    roles: string[];
    permissions: string[];

    constructor(resource: string, accessTokenContent: KeycloakAccessTokenContent) {
        if (!accessTokenContent) return;
        this.content = accessTokenContent;
        this.sub = this.content.sub;
        this.email = this.content.email;
        this.username = this.content.preferred_username;
        this.friendlyName = this.content.name;
        this.provider = 'keycloak';
        this.clientId = resource;
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
    user?: ExtendedUserInterface,
    http: HttpContext;
}

export interface ServiceContext {
    acl: ACL;
    webHook: WebHookService;
}

export interface HttpContext {
    req: any;
    res: any;
}

export interface IDataSources {
    location: LocationDataSource;
    weather: WeatherDataSource;
    air: AirDataSource;
    owmWeather: OpenWeatherMap.WeatherDataSource;
    prisma: PrismaDataSource;
    travelPlan: TravelPlanDataSource;
    webHook: WebHookDataSource;
    locationPoint: LocationPointDataSource;
    acl: ACLDataSource;
    post: PostDataSource;
    user: UserDataSource;
    follow: FollowDataSource;
}

export interface ServerContext {
    session: SessionContext;
    services: ServiceContext;
    dataSources: IDataSources;
}

