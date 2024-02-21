import { RESTDataSource } from '@apollo/datasource-rest';

export class QWeatherDataSource extends RESTDataSource {
    override baseURL = 'https://geoapi.qweather.com/';

    getKey = (): string => process.env.qweatherKey;
}