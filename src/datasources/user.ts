import DataLoader from 'dataloader';

export class UserDataSource {

    constructor() {
    }

    demoUsers = [
        { username: 'admin', id: 1, token: 'admin123', roles: ['admin'] },
        { username: 'alice', id: 2, token: 'subscribed123', roles: ['subscribed'], permissions: ['getNow'] },
        { username: 'bob', id: 3, token: 'free123', roles: ['free'], },
    ];

    private batchUsers = new DataLoader(async (token: string[]) => {

        const productIdToProductMap = this.demoUsers.reduce((mapping, user) => {
            mapping[user.token] = user;
            return mapping;
        }, {});
        return token.map((token) => productIdToProductMap[token]);
    });

    async getUserFor(token) {
        return this.batchUsers.load(token);
    }
}