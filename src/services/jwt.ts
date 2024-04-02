import jsonwebtoken from 'jsonwebtoken';
import { IOAuth2BasicInfo, IOAuth2ExtraProfile, OAuthUserInfo } from '../contracts/context.js';
import { GraphqlErrorCode } from '../contracts/index.js';
import { GraphQLError } from 'graphql';


export const generateJWTToken = async (payload: any) => {
    if (!process.env.JWT_PRIVATE_KEY) throw new Error('no private key provided.');
    const options: jsonwebtoken.SignOptions = {
        expiresIn: '8h',
    };
    const token = jsonwebtoken.sign(payload, process.env.JWT_PRIVATE_KEY, options);
    return token;
}

export interface UserTokenServiceInput {
    provider: string;
    accessToken: string;
    clientId: string;
}

export interface IOAuth2Provider {
    getProfile: (input: UserTokenServiceInput) => Promise<OAuthUserInfo>;
}

export class UserTokenService {
    providers: { [key: string]: IOAuth2Provider };
    constructor() {
        this.providers = {};
    }

    use = (provider: IOAuth2Provider, name: string) => {
        this.providers[name] = provider;
    }

    getProfile = async (input: UserTokenServiceInput): Promise<OAuthUserInfo> => {
        return await this.providers[input.provider].getProfile(input);
    }

    getJwt = async (input: IOAuth2BasicInfo): Promise<string> => {
        const jwt = generateJWTToken(input);
        return jwt;
    }
}

export class GitHubOAuth2Provider implements IOAuth2Provider {
    getProfile = async (input: UserTokenServiceInput): Promise<OAuthUserInfo> => {
        const profileResponse = await fetch("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${input.accessToken}`,
            },
        });

        if (profileResponse.status != 200) {
            if (profileResponse.status === 401)
                throw new GraphQLError(`Bad credentials.`, {
                    extensions: {
                        code: GraphqlErrorCode.UNAUTHORIZED,
                        name: GraphqlErrorCode[GraphqlErrorCode.UNAUTHORIZED],
                    },
                });
        }

        const profile = await profileResponse.json() as { [key: string]: any };

        const emailResponse = await fetch("https://api.github.com/user/emails", {
            headers: {
                Authorization: `Bearer ${input.accessToken}`,
            },
        });

        console.log(`profile:${JSON.stringify(profile)}`);

        if (emailResponse.status != 200) {
            if (emailResponse.status === 401)
                throw new GraphQLError(`Bad credentials.`, {
                    extensions: {
                        code: GraphqlErrorCode.UNAUTHORIZED,
                        name: GraphqlErrorCode[GraphqlErrorCode.UNAUTHORIZED],
                    },
                });
        }

        const email = await emailResponse.json() as any[];

        const primaryEmail = email.filter(({ verified }) => verified)
            .sort((a, b) => {
                if (a.primary && !b.primary) return -1;
                if (!a.primary && b.primary) return 1;
                return 0;
            })
            .map(({ email }) => ({ value: email }));

        const basic = {
            sub: profile.id,
            username: profile.login,
            email: primaryEmail[0].value,
            provider: input.provider,
            clientId: input.clientId,
            friendlyName: profile.name,
        };

        const extra = {
            avatar: profile.avatar_url,
            site: profile.html_url,
            bio: profile.bio,
        };

        return { basic, extra };
    }
}
