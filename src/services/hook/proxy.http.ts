import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { SessionContext, ServerContext } from '../../contracts/index.js';

const filteredHeaders = [
    'connection',
    'host',
    'content-length',
    'transfer-encoding',
    'x-forwarded-for',
    'x-forwarded-proto',
    'x-forwarded-host',
    'authorization',
    'proxy-authorization',
    'expect',
];

export class ProxyHookHttp {
    session: SessionContext;

    constructor(config: { session: SessionContext }) {
        this.session = config.session;
    }

    async sendRequest(config: { url: string, data: any, headers?: any }) {

        const { req }: { req: Request } = this.session.http;

        const targetUrl = config.url;

        const filteredRequestHeaders = Object.fromEntries(
            Object.entries(req.headers).filter(
                ([headerName]) => !filteredHeaders.includes(headerName.toLowerCase())
            )
        );

        const axiosConfig: AxiosRequestConfig = {
            method: 'POST',
            url: targetUrl,
            data: config.data,
            headers: {
                ...filteredRequestHeaders,
                ...config.headers,
                'X-Invoker-Origin': 'WebHook',
            },
        };

        try {
            const response: AxiosResponse = await axios(axiosConfig);
            return response;
        } catch (error) {
            const { url, } = error.response?.config || {};
            const { status } = error.response;
            const simplifyMessage = { url, status };
            console.error('Error forwarding request:', simplifyMessage);
        }
    }
}
