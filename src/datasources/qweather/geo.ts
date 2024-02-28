import { QWeatherDataSource } from './base.js';
import { Location } from '../../contracts/index.js';

export class LocationDataSource extends QWeatherDataSource {

    async searchLocations(context, location: string, lang: string): Promise<Location[]> {
        const data = await this.get('v2/city/lookup', {
            params: {
                location: location,
                key: this.getKey(),
                lang: lang
            },
        });
        return data.location;
    }

    async getLocation(context, locationId: string, lang: string) {
        return await this.searchLocations(context, locationId, lang);
    }
}