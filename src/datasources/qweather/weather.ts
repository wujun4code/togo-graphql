import { QWeatherDataSource } from './base.js';
import { Now, Hourly } from '../../contracts/index.js';

export class WeatherDataSource extends QWeatherDataSource {
    override baseURL = process.env.qweatherHost;
    async getNow(location: string, lang: string): Promise<Now> {
        const data = await this.get('v7/weather/now', {
            params: {
                location: location,
                key: this.getKey(),
                lang: lang
            },
        });
        return data.now;
    }

    forcastHourly = async (location: string, lang: string, hourly: Hourly = Hourly.Hourly24H, limit: number) => {
        const path = `v7/weather/${hourly}`;
        const data = await this.get(path, {
            params: {
                location: location,
                key: this.getKey(),
                lang: lang
            },
        });
        this.handleErrors(data);
        if (limit < data.hourly.length) return data.hourly.slice(0, limit);
        return data.hourly;
    }
}