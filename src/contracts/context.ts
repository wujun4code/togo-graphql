import {
    LocationDataSource, WeatherDataSource,
    AirDataSource, OpenWeatherMap,
    PrismaDataSource, TravelPlanDataSource,
    WebHookDataSource, LocationPointDataSource, ACLDataSource,
    PostDataSource, UserDataSource, FollowDataSource, RobotDataSource
} from '../datasources/index.js';

import { WebHookService, UserTokenService } from '../services/index.js';
import { ACL } from '../decorators/index.js';

export type OAuthUserInfo = {
    basic: IOAuth2BasicInfo;
    extra: IOAuth2ExtraProfile;
}

export interface IOAuth2BasicInfo {
    provider: string;
    clientId: string;
    sub: string;
    username: string;
    email: string;
    friendlyName: string;
}

export interface IOAuth2ExtraProfile {
    avatar?: string;
    site?: string;
    bio?: string;
}

export interface OAuth2UserInterface extends IOAuth2BasicInfo {

    id: string;
    roles: string[];
    permissions: string[];
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
    jwt: UserTokenService;
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
    robot: RobotDataSource;
}

export interface ServerContext {
    session: SessionContext;
    services: ServiceContext;
    dataSources: IDataSources;
}

