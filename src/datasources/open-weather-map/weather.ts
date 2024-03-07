import { ServerContext } from '../../contracts/index.js';
import { OpenWeatherMapDataSource } from './base.js';
import { Now, Hourly, Daily } from '../../contracts/index.js';

export interface Coord {
    lon: number;
    lat: number;
}

export interface Weather {
    id: number;
    main: string;
    description: string;
    icon: string;
}

export interface Main {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level: number;
    grnd_level: number;
}

export interface Wind {
    speed: number;
    deg: number;
    gust: number;
}

export interface Rain {
    "1h": number;
}

export interface Clouds {
    all: number;
}

export interface Sys {
    type: number;
    id: number;
    country: string;
    sunrise: number;
    sunset: number;
}

export interface WeatherData {
    coord: Coord;
    weather: Weather[];
    base: string;
    main: Main;
    visibility: number;
    wind: Wind;
    rain: Rain;
    clouds: Clouds;
    dt: number;
    sys: Sys;
    timezone: number;
    id: number;
    name: string;
    cod: number;
}

export class WeatherDataSource extends OpenWeatherMapDataSource {

    async getWeather(context: ServerContext, location: string, lang: string): Promise<WeatherData> {
        const [lat, lon] = location.split(',');
        const data = await this.get('data/2.5/weather', {
            params: {
                lat: lat,
                lon: lon,
                appid: this.getAppId(),
                lang: lang,
                units: 'metric'
            },
        });
        return data;
    }

    async getNow(context: ServerContext, location: string, lang: string): Promise<Now> {
        const weather = await this.getWeather(context, location, lang);

        const now = {
            obsTime: this.utcTimestampToISO(weather.dt, weather.timezone),
            temp: weather.main.temp.toString(),
            feelsLike: weather.main.feels_like.toString(),
            icon: weather.weather[0].icon,
            text: weather.weather[0].description,
            wind360: weather.wind.deg.toString(),
            windDir: weather.wind.gust.toString(),
            windScale: '',
            windSpeed: weather.wind.speed.toString(),
            humidity: weather.main.humidity.toString(),
            precip: weather[0]?.rain?.["1h"]?.toString() ?? "",
            pressure: weather.main.pressure.toString(),
            vis: weather.visibility.toString(),
            cloud: weather.clouds.all.toString(),
            dew: ''
        };

        return now;
    }
}