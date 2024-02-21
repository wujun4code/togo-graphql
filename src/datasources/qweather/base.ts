import { RESTDataSource } from '@apollo/datasource-rest';

export class QWeatherDataSource extends RESTDataSource {
    override baseURL = process.env.geoHost || 'https://geoapi.qweather.com/';

    getKey = (): string => process.env.qweatherKey;
}