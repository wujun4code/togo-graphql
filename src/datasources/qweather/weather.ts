import { QWeatherDataSource } from './base.js';
import { Now } from '../../contracts/index.js';

export class NowDataSource extends QWeatherDataSource {
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
}