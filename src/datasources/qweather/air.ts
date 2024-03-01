import { ServerContext } from '../../contracts/index.js';
import { QWeatherDataSource } from './base.js';
import { Now, Hourly, Daily } from '../../contracts/index.js';
import { hasRole, limitSize } from '../../decorators/index.js';

export class AirDataSource extends QWeatherDataSource {

    override baseURL = process.env.QWEATHERHOST;

    @hasRole(['basic'])
    async getNow(context: ServerContext, location: string, lang: string): Promise<Now> {
        const data = await this.get('v7/air/now', {
            params: {
                location: location,
                key: this.getKey(),
                lang: lang
            },
        });
        return data.now;
    }
}