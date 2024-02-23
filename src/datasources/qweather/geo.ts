import { QWeatherDataSource } from './base.js';
import { Location } from '../../contracts/index.js';

export class LocationDataSource extends QWeatherDataSource {

    async searchLocations(location: string): Promise<Location[]> {
        const data = await this.get('v2/city/lookup', {
            params: {
                location: location,
                key: this.getKey(),
            },
        });
        return data.location;
    }

    getLocation = async (locationId: string) => {
        return await this.searchLocations(locationId);
    }
}