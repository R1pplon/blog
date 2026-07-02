---
title: "Docker Compose 实用技巧"
date: 2025-12-20
---

整理几个 Docker Compose 的使用技巧，提升开发效率。

## 使用 profiles 按需启动服务

```yaml
services:
  app:
    build: .
  debug:
    build: .
    profiles: ["debug"]
```

通过 `docker compose --profile debug up` 选择性启动。

## 健康检查

为数据库等服务添加 healthcheck，确保依赖顺序正确。

## 网络隔离

使用自定义网络实现服务间的安全通信。
