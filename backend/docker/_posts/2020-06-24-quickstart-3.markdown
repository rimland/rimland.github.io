---
layout: post
title:  "Docker 快速入门（三）- 在 Docker Hub 上共享镜像"
date:   2020-06-24 09:00:00 +0800
categories: backend docker
published: true
---

## 前提条件

在[第二部分](https://ittranslator.cn/backend/docker/2020/06/21/quickstart-2.html)，按照步骤构建镜像并将其作为一个容器化应用程序运行。

## 介绍

现在，您已经在本地开发机器上构建了[第二部分](https://ittranslator.cn/backend/docker/2020/06/21/quickstart-2.html)中描述的容器化应用程序。开发容器化应用程序的最后一步是在像 [Docker Hub](https://hub.docker.com/) 这样的注册表上共享镜像，以便它们可以被轻松地下载和运行在任意目标机器上。

## 设置您的 Docker Hub 帐户

如果您没有 Docker ID，请按照以下步骤创建一个。Docker ID 允许你在 Docker Hub 上共享镜像。

- 访问 [Docker Hub](https://hub.docker.com/signup) 注册页。
- 填写表单并提交创建您的 Docker ID。
- 验证您的电子邮件地址，以完成注册流程。
- 单击工具栏或系统托盘中的 Docker 图标，然后单击 **登录/创建 Docker ID**(*Sign in / Create Docker ID*)。
- 填写您的新 Docker ID 和密码。在您成功地通过身份验证之后，您的 Docker ID 将出现在 Docker Desktop 菜单中，取代您刚刚使用的“登录”选项。

您还可以从命令行输入 `docker login` 登录 Docker Hub。

## 创建 Docker Hub 仓库并推送您的镜像

> 在创建仓库之前，请确保您已设置您的  Docker Hub 账户并将其连接到 Docker Desktop。

现在，让我们创建第一个仓库，并将公告栏镜像推送到 Docker Hub。

1. 单击菜单栏中的 Docker 图标，导航到 **Repositories > Create**。您将被重定向到 Docker Hub 上的 **Create Repository** 页。 
2. 输入仓库名 `bulletinboard` 然后在页面底部点击 **Create** 。暂时不要填写任何其他细节。

    ![make a repo](/assets/images/docker-repository-newrepo.png)

3. 您现在已经准备好在 Docker Hub 上共享镜像了，但是，必须先做一件事：镜像必须正确地设置命名空间，才能在 Docker Hub 上共享。具体来说，您必须将镜像命名为：<br/> `<Your Docker ID>/<Repository Name>:<tag>` 。

    请确保您在终端或者 PowerShell 中的 `node-bulletin-board/bulletin-board-app` 目录下，然后运行：

    ```BASH
    docker tag bulletinboard:1.0 <Your Docker ID>/bulletinboard:1.0
    ```

4. 最后，将您的镜像推送到 Docker Hub：

    ```BASH
    docker push <Your Docker ID>/bulletinboard:1.0
    ```

    在 [Docker Hub](https://hub.docker.com/repositories) 中访问您的仓库，您将在那里看到您新的镜像。记住，Docker Hub 仓库在默认情况下是公开的。

    > 推送遇到麻烦？请记住，您必须通过 Docker Desktop 或命令行登录到 Docker Hub，并且必须按照上述步骤正确命名您的镜像。如果推送看起来有效，但在 Docker Hub 中看不到新的镜像，请在几分钟后刷新浏览器，然后再次检查。

## 结论

现在您的镜像已经可以在 Docker Hub 上使用了，您可以在任何地方运行它了。如果您试图在一台还没有它的新机器上使用它，Docker 将自动尝试从Docker Hub 下载它。通过这种方式移动镜像，您不再需要在想要运行您的软件的机器上安装除了 Docker 以外的任何依赖项。容器化应用程序的依赖项完全封装并隔离在您的镜像中，您可以使用上面描述的 Docker Hub 来共享镜像。

另一件需要记住的事情是：目前，您只是把您的镜像推送到了 Docker Hub，您的 Dockerfile 呢？一个关键的最佳实践是将它们保存在版本控制中，可能与应用程序的源代码放在一起。您可以在 Docker Hub 仓库描述中添加一个链接或注释，指示在何处可以找到这些文件，这样不仅可以保存镜像如何构建的记录，还可以保存镜像作为完整的应用程序运行的记录。

## 下一步做什么

我们建议您看一下 [Develop with Docker](https://ittranslator.cn/backend/docker/2020/06/25/develop-with-docker.html) 中的主题，学习如何使用 Docker 开发您自己的应用程序。

<br/>
上一篇：[Docker 快速入门（二）- 构建并运行您的镜像](/backend/docker/2020/06/21/quickstart-2.html)

<br/>

> 作者 ： Docker 官网 <br/>
> 译者 ： 技术译民 <br/>
> 出品 ： [技术译站](https://ittranslator.cn/) <br/>
> 链接 ： [英文原文](https://docs.docker.com/get-started/part3/)
