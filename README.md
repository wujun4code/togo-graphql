# 和风天气 Graphql 

此项目是纯属技术玩具，目的是学习 apollo server 和 graphql 的基础用法。

## 本地启动

git clone 之后，重命名 .env.sample -> .env

确保你本地的 node 至少是 18 以上，其他版本没有验证（懒~~）。

```shell
node  -v
v18.19.1
```

并且修改 .env 里面的 qweatherKey，用你的和风天气的项目对应的 private key，注意保密，不要上传到开源平台。

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