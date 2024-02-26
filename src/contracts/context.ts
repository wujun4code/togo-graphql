import { LocationDataSource, WeatherDataSource, UserDataSource } from '../datasources/index.js';
import { ACL } from '../decorators/index.js';
export interface UserInterface {
    name: string;
    roles: [];
    permissions: [];
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
        user: UserDataSource
    };
}

