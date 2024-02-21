export interface Now {
    obsTime: string;
    temp: string;
    feelsLike: string;
    icon: string;
    text: string;
    wind360: string;
    windDir: string;
    windScale: string;
    windSpeed: string;
    humidity: string;
    precip: string;
    pressure: string;
    vis: string;
    cloud: string;
    dew: string;
}

export interface Refer {
    sources: string[];
    license: string[];
}

export interface WeatherData {
    code: string;
    updateTime: string;
    fxLink: string;
    now: Now;
    refer: Refer;
}

