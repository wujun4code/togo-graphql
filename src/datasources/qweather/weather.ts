import { ServerContext } from '../../contracts/index.js';
import { QWeatherDataSource } from './base.js';
import { Now, Hourly, Daily } from '../../contracts/index.js';
import { hasRole, hasPermission, hasFieldPermission, filterFields, filterObject, limitSize } from '../../decorators/index.js';

const windDirAcl = {
    "*": { read: false },
    "role:subscribed": {
        read: false,
        write: false
    },
    "role:admin": {
        read: true,
        write: false
    },
    "user:1": {
        read: true,
        write: false
    },
};

export class WeatherDataSource extends QWeatherDataSource {

    override baseURL = process.env.QWEATHERHOST;

    @hasRole(['basic'])
    //@hasPermission(['get_now'])
    //@hasFieldPermission([{ name: 'windDir', acl: windDirAcl, operation: 'read' }])
    // @filterFields([{ name: 'temp', onFilter: (name, value) => { return value > 0; } }])
    // @filterObject([{ onFilter: (item) => { return item.cloud > 0; } }])
    async getNow(context: ServerContext, location: string, lang: string): Promise<Now> {
        const data = await this.get('v7/weather/now', {
            params: {
                location: location,
                key: this.getKey(),
                lang: lang
            },
        });
        return data.now;
    }

    @hasRole(['basic'])
    @limitSize(
        [
            {
                limit: 6, onFilter: ({ session: { user } }, result) => { return user.hasRole('basic'); }
            },
            {
                limit: 24, onFilter: ({ session: { user } }, result) => { return user.hasRole('subscribed'); }
            },
            {
                limit: 36, onFilter: ({ session: { user } }, result) => { return user.hasRole('enterprise'); }
            },
        ], false)
    async forecastHourly(context: ServerContext, location: string, lang: string, hourly: Hourly = Hourly.Hourly24H, limit: number) {
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

    @hasRole(['basic'])
    @limitSize(
        [
            {
                limit: 5, onFilter: ({ session: { user } }, result) => { return user.hasRole('basic'); }
            },
            {
                limit: 7, onFilter: ({ session: { user } }, result) => { return user.hasRole('subscribed'); }
            },
            {
                limit: 15, onFilter: ({ session: { user } }, result) => { return user.hasRole('enterprise'); }
            },
        ], false)
    async forecastDaily(context: ServerContext, location: string, lang: string, daily: Daily = Daily.Daily7D, limit: number) {
        const path = `v7/weather/${daily}`;
        const data = await this.get(path, {
            params: {
                location: location,
                key: this.getKey(),
                lang: lang
            },
        });
        this.handleErrors(data);
        if (limit < data.daily.length) return data.daily.slice(0, limit);
        return data.daily;
    }
}