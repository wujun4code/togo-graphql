import { SessionContext } from '../contracts/index.js';
import { DataSourceConfig } from '@apollo/datasource-rest';

export interface IContextDataSource {
    session: SessionContext;
}

export interface IRESTDataSourceConfig {
    session: SessionContext;
    restConfig: DataSourceConfig;
}