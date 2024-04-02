# 和风天气 Graphql 

此项目是纯属技术玩具，目的是学习 apollo server 和 graphql 的基础用法。

## 在线 Demo

https://weather-graphql.shouyicheng.com/


注意, 在线 demo 挂了一层 oauth2-proxy 需要你注册一个 keycloak 的账号，才能访问，请放心，这个 keycloak 也是我自己运维的，请随意填写邮箱和用户名，不会泄露您任何隐私，我只是为了防止机器人。

## 查询示例

```
curl --request POST \
    --header 'content-type: application/json' \
    --url 'https://weather-graphql.shouyicheng.com/' \
    --data '{"query":"query ExampleQuery($location: String!) {\n  searchLocations(location: $location) {\n    name\n    country\n    fxLink\n    adm1\n    adm2\n    id\n    isDst\n    lat\n    lon\n    rank\n    type\n    tz\n    utcOffset\n    now {\n      temp\n      text\n      vis\n      wind360\n      windDir\n      windScale\n      windSpeed\n      pressure\n      precip\n      obsTime\n      icon\n      humidity\n      feelsLike\n      dew\n      cloud\n    }\n  }\n}","variables":{"location":"苏州"}}'
```

示例截图:

![query sample](https://raw.githubusercontent.com/wujun4code/weather-graphql/main/image.png)

## 本地启动

git clone 之后，重命名 .env.sample -> .env

确保你本地的 node 至少是 18 以上，其他版本没有验证（懒~~）。

```shell
node -v
v18.19.1
```

并且修改 `.env.sample` 里面的 qweatherKey 改用你的和风天气的项目对应的 private key，然后将 `.env.sample` 重命名为 `.env`，注意保密，不要上传到开源平台。

然后执行

```shell
npm install
npm start
```

然后打开浏览器输入 `localhost:4000` 就可以直接在 apollo 的 graphql playground 里面查询了。


## docker 启动

```shell
docker compose up -d
```


```json
{"login":"wujun4code","id":5119542,"node_id":"MDQ6VXNlcjUxMTk1NDI=","avatar_url":"https://avatars.githubusercontent.com/u/5119542?v=4","gravatar_id":"","url":"https://api.github.com/users/wujun4code","html_url":"https://github.com/wujun4code","followers_url":"https://api.github.com/users/wujun4code/followers","following_url":"https://api.github.com/users/wujun4code/following{/other_user}","gists_url":"https://api.github.com/users/wujun4code/gists{/gist_id}","starred_url":"https://api.github.com/users/wujun4code/starred{/owner}{/repo}","subscriptions_url":"https://api.github.com/users/wujun4code/subscriptions","organizations_url":"https://api.github.com/users/wujun4code/orgs","repos_url":"https://api.github.com/users/wujun4code/repos","events_url":"https://api.github.com/users/wujun4code/events{/privacy}","received_events_url":"https://api.github.com/users/wujun4code/received_events","type":"User","site_admin":false,"name":"Wu Jun","company":"Freestyle","blog":"https://blog.shouyicheng.com","location":"Kunshan,China","email":null,"hireable":true,"bio":".NET & TypeScript & Kubernetes ","twitter_username":null,"public_repos":190,"public_gists":0,"followers":33,"following":63,"created_at":"2013-07-30T08:30:26Z","updated_at":"2024-03-28T23:08:01Z"}
```