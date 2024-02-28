import { RESTDataSource } from '@apollo/datasource-rest';
import { GraphQLError } from 'graphql';
import { IContextDataSource, IRESTDataSourceConfig } from '../context-base.js';
import { SessionContext } from '../../contracts/index.js';

export class QWeatherDataSource extends RESTDataSource implements IContextDataSource {
    session: SessionContext;
    constructor(config: IRESTDataSourceConfig) {
        super(config.restConfig);
        this.session = config.session;
    }
    override baseURL = process.env.GEOHOST || 'https://geoapi.qweather.com/';

    getKey = (): string => process.env.QWEATHERKEY;

    handleErrors = (response) => {
        if (response.code == '403')
            throw new GraphQLError('please upgrade your qweather subscription.', {
                extensions: {
                    code: 'Forbidden',
                },
            });
    };
}