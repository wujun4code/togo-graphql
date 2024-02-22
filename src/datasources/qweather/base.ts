import { RESTDataSource } from '@apollo/datasource-rest';
import { GraphQLError } from 'graphql';

export class QWeatherDataSource extends RESTDataSource {
    override baseURL = process.env.geoHost || 'https://geoapi.qweather.com/';

    getKey = (): string => process.env.qweatherKey;

    handleErrors = (response) => {
        if (response.code == '403')
            throw new GraphQLError('please upgrade your qweather subscription.', {
                extensions: {
                    code: 'Forbidden',
                },
            });
    };
}