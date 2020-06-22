---
layout: post
title:  "Docker 快速入门（二）- 构建并运行您的镜像"
date:   2020-06-21 12:00:00 +0800
categories: backend docker
published: true
---

## 前提条件

完成[第一部分](https://ittranslator.cn/backend/docker/2020/06/19/quickstart-1.html)的情况介绍和安装

## 介绍

现在您已经安装了开发环境，可以开始开发容器化的应用程序了。一般来说，开发工作流是这样的：

1. 通过首先创建 Docker 镜像，为应用程序的每个组件创建和测试单独的容器。
2. 将容器和支持基础设施（supporting infrastructure）组装成一个完整的应用程序。
3. 测试、共享并部署完整的容器化应用程序。

在本教程的这一阶段，让我们集中讨论此工作流的第一步：创建容器将基于的镜像。请记住，Docker 镜像捕获您的容器化进程将在其中运行的私有文件系统；您需要创建一个镜像，其中仅包含应用程序运行所需的内容。

## 配置

让我们下载 `node-bulletin-board` 示例项目。这是一个用 Node.js 写的简单的公告板应用程序。

### Git

如果您使用的是 Git，您可以从GitHub克隆示例项目：

```BASH
git clone https://github.com/dockersamples/node-bulletin-board
cd node-bulletin-board/bulletin-board-app
```

### Windows (没有 Git)

如果你使用的是 Windows 机器，喜欢下载示例项目而不安装 Git，在 PowerShell 运行以下命令：

```BASH
curl.exe -LO https://github.com/dockersamples/node-bulletin-board/archive/master.zip
tar.exe xf master.zip
cd node-bulletin-board-master\bulletin-board-app
```

### Mac 或 Linux (没有 Git)

如果您使用的是 Mac 或 Linux 机器，并且喜欢下载示例项目而不安装 Git，请在终端运行以下命令:

```BASH
curl -LO https://github.com/dockersamples/node-bulletin-board/archive/master.zip
unzip master.zip
cd node-bulletin-board-master/bulletin-board-app
```

## 用 Dockerfile 定义一个容器

下载项目后，查看公告板应用程序中名为 `Dockerfile` 的文件。Dockerfiles 描述了如何为容器组装私有文件系统，还可以包含描述如何基于此镜像运行容器的一些元数据。

有关公告板应用程序中使用的 Dockerfile 的更多信息，请参阅 [示例 Dockerfile](#sample-dockerfile)。

## 构建并测试您的镜像

现在您已经有了一些源代码和 Dockerfile，是时候构建您的第一个镜像了，并确保从镜像中启动的容器按预期工作。

在终端或者 PowerShell 中使用命令 `cd` 确保您在 `node-bulletin-board/bulletin-board-app` 目录中。运行以下命令来构建您的公告栏镜像：

```BASH
docker build --tag bulletinboard:1.0 .
```

您将看到 Docker 一步步完成 Dockerfile 中的每条指令，并在此过程中构建您的镜像。如果成功，构建过程应该以一条消息 `Successfully tagged bulletinboard:1.0` 结束。

> Windows 用户：
> 本例使用 Linux 容器。右键单击系统托盘中的 Docker 图标，然后单击 **Switch to Linux containers**，确保您的环境正在运行 Linux 容器。不必担心——本教程中的所有命令对于 Windows 容器工作方式完全一样。
> 在运行镜像后，您可能会收到一条标题为“安全警告”的消息，提示正在为添加到镜像中的文件设置读、写和执行权限。在本示例中，我们不处理任何敏感信息，因此可以忽略本示例中的警告。

## 将镜像作为容器运行

1. 运行以下的命令来启动基于新镜像的一个容器：

   ```BASH
   docker run --publish 8000:8080 --detach --name bb bulletinboard:1.0
   ```

   这里有几个常见的标记：
      - `--publish` 要求 Docker 将主机端口8000上传入的流量转发到容器端口8080。容器有自己的私有端口集，因此如果您希望从网络访问一个端口，就必须以这种方式将流量转发给它。否则，作为默认的安全情形，防火墙规则将阻止所有网络流量到达您的容器。
      - `--detach` 要求 Docker 在后台运行此容器。
      - `--name` 指定可以在后续命令中引用你的容器的名称，在本例中是 `bb`。

2. 在浏览器中访问您的应用程序，地址是 localhost:8000。您应该会看到您的公告板应用程序启动并运行了。在此步骤中，您通常会尽一切可能确保容器按照预期的方式工作；例如，现在是运行单元测试的时候了。
3. 一旦您确信您的公告栏容器工作正常，您可以删除它：

```BASH
docker rm --force bb
```

`--force` 选项会停止正在运行的容器，因此可以将其删除。 如果您先用 `docker stop bb` 停止运行的容器，那么您不需要使用 `--force` 来删除它。 

## 结论

此时，您已经成功地构建了一个镜像，执行了一个应用程序的简单容器化，并确认了您的应用程序在其容器中成功运行。下一步是在 [Docker Hub](https://hub.docker.com/) 上分享您的镜像，以便它们可以被轻松地下载和运行在任意目标机器上。

## <span id="sample-dockerfile">Dockerfile 示例</span>

编写 Dockerfile 是容器化一个应用程序的第一步。您可以将这些 Dockerfile 命令看作是如何构建镜像的逐步配方。公告板应用程序中的 Dockerfile 是这样的：

```BASH
# 使用官方镜像作为父镜像。
FROM node:current-slim

# 设置工作目录。
WORKDIR /usr/src/app

# 将文件从主机复制到当前位置。
COPY package.json .

# 在镜像文件系统中运行该命令。
RUN npm install

# 通知 Docker 容器在运行时监听指定的端口。
EXPOSE 8080

# 在容器中运行指定的命令。
CMD [ "npm", "start" ]

# 将应用程序的其余源代码从主机复制到镜像文件系统。
COPY . .
```

本例中定义的 dockerfile 执行以下步骤：

- `FROM` 预先存在的 `node:current-slim` 镜像开始。这是一个官方镜像，由 node.js 供应商构建，经过 Docker 验证是一个高质量的镜像，包含了 Node.js 的长期支持（LTS）解释器和基本依赖项。
- 使用 `WORKDIR` 指定所有后续操作都应该从镜像文件系统中的目录 `/usr/src/app` 执行（永远不要从主机的文件系统执行）。
- 从您的主机复制(`COPY`) 文件 `package.json` 到镜像中的当前位置 (`.`) (在本示例中, 是到 `/usr/src/app/package.json`)。
- 在镜像文件系统中运行(`RUN`) 命令 `npm install`（它将读取 `package.json` 确定应用程序的节点依赖项并安装它们）。
- 将应用程序的其余源代码从主机复制(`COPY`) 到镜像文件系统。

您可以看到，这些步骤与您在主机上设置和安装应用程序时所采取的步骤基本相同。但是，将这些捕获为 Dockerfile，允许您在一个可移植的、独立的 Docker 镜像中做同样的事情。

上面的步骤构建了镜像的文件系统，但是 Dockerfile 中还有其他行。

`CMD` 指令是在镜像中指定一些元数据的第一个示例，这些元数据描述如何基于此镜像运行容器。在本例中，它表示此镜像要支持的容器化进程是 `npm start`。

`EXPOSE 8080` 通知 Docker 容器在运行时监听端口 8080。

上面的内容是组织一个简单 Dockerfile 的好方法；始终从 `FROM` 命令开始，按照它的步骤构建您的私有文件系统，并以任何元数据指定结束。还有更多的 Dockerfile 指令，而不仅仅是您在上面看到几个。有关完整列表，请参阅 [Dockerfile 参考](https://docs.docker.com/engine/reference/builder/)。

## CLI 参考文献

有关本文中使用的所有 CLI 命令的进一步文档可以在这里找到：

- [docker image](https://docs.docker.com/engine/reference/commandline/image/)
- [docker container](https://docs.docker.com/engine/reference/commandline/container/)
- [Dockerfile reference](https://docs.docker.com/engine/reference/builder/)

<br/>

> 作者 ： Docker 官网 <br/>
> 译者 ： 技术译民 <br/>
> 出品 ： [技术译站](https://ittranslator.cn/) <br/>
> 链接 ： [英文原文](https://docs.docker.com/get-started/part2/)
