---
layout: post
title:  "使用 Docker 开发"
date:   2020-06-25 21:00:00 +0800
categories: backend docker
published: true
---

本页面包含一个资源列表，供希望使用 Docker 构建新应用程序的应用程序开发人员使用。

## 前提条件

通过学习[快速入门](https://ittranslator.cn/backend/docker/2020/06/19/quickstart-1.html)中的学习模块，了解如何构建一个镜像并将其作为一个容器化应用程序运行。

## 在 Docker 上开发新的应用程序

如果你刚刚开始在 Docker 上开发一个全新的应用程序，请参阅这些资源，了解从 Docker 获得最大的收益的一些最常见的模式。

- 使用多[阶段构建](https://docs.docker.com/develop/develop-images/multistage-build/)来保持你的镜像简洁
- 使用[卷](https://docs.docker.com/storage/volumes/)和[绑定挂载](https://docs.docker.com/storage/bind-mounts/)管理应用程序数据
- [使用 Kubernetes 扩展你的应用程序](https://docs.docker.com/get-started/kube-deploy/)
- [将你的应用程序扩展为集群服务](https://docs.docker.com/get-started/swarm-deploy/)
- [一般应用程序开发最佳实践](https://docs.docker.com/develop/dev-best-practices/)

了解使用 Docker 开发特定语言的应用程序

- [Docker 用于 Java 开发人员实验室](https://github.com/docker/labs/tree/master/developer-tools/java/)
- [将 node.js 应用程序移植到 Docker lab](https://github.com/docker/labs/tree/master/developer-tools/nodejs/porting)
- [Docker 实验室的 Ruby on Rails 应用程序](https://github.com/docker/labs/tree/master/developer-tools/ruby)
- [容器化一个 .Net Core 应用程序](https://docs.docker.com/engine/examples/dotnetcore/)
- [使用 Docker Compose 在 Linux 上容器化一个使用了 SQL Server 的 ASP.NET Core 应用程序](https://docs.docker.com/compose/aspnet-mssql-compose/)

## 使用 SDK 或 API 进行高级开发

在您可以编写 Dockerfiles 或 Compose files 并使用 Docker CLI 之后，可以使用 Docker Engine SDK for Go/Python 或直接使用 HTTP API 将其提升到下一个层次。

<br/>

> 作者 ： Docker 官网 <br/>
> 译者 ： 技术译民 <br/>
> 出品 ： [技术译站](https://ittranslator.cn/) <br/>
> 链接 ： [英文原文](https://docs.docker.com/develop/)
