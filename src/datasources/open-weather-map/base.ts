import { RESTDataSource } from '@apollo/datasource-rest';
import { GraphQLError } from 'graphql';
import { IContextDataSource, IRESTDataSourceConfig } from '../context-base.js';
import { SessionContext } from '../../contracts/index.js';

export class OpenWeatherMapDataSource extends RESTDataSource implements IContextDataSource {
    session: SessionContext;
    constructor(config: IRESTDataSourceConfig) {
        super(config.restConfig);
        this.session = config.session;
    }
    override baseURL = process.env.OPENWEATHERMAP_HOST || 'https://api.openweathermap.org/';

    getAppId = (): string => process.env.OPENWEATHERMAP_APP_ID;

    handleErrors = (response) => {
        if (response.code == '403')
            throw new GraphQLError('please upgrade your qweather subscription.', {
                extensions: {
                    code: 'Forbidden',
                },
            });
    };

    utcTimestampToISO(utcTimestamp: number, timezone: number) {
        const date = new Date((utcTimestamp + timezone) * 1000),
            tzo = timezone,
            dif = tzo >= 0 ? '+' : '-',
            pad = function (num) {
                return (num < 10 ? '0' : '') + num;
            };

        return date.getFullYear() +
            '-' + pad(date.getMonth() + 1) +
            '-' + pad(date.getDate()) +
            'T' + pad(date.getHours()) +
            ':' + pad(date.getMinutes()) +
            ':' + pad(date.getSeconds()) +
            dif + pad(Math.floor(Math.abs(tzo) / 3600)) +
            ':' + pad(Math.abs(tzo) % 3600);
    }
}