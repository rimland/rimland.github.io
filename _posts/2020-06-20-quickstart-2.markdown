---
layout: post
title:  "Docker 快速入门（二）- 构建并运行您的镜像"
date:   2020-06-21 02:09:00 +0800
categories: backend docker
published: false
---

## 前提条件

完成[第一部分](https://ittranslator.cn/backend/docker/2020/06/19/quickstart-1.html)的情况介绍和安装

## 介绍 Introduction

现在您已经安装了开发环境，可以开始开发容器化的应用程序了。一般来说，开发工作流是这样的：

1. 通过首先创建 Docker 镜像，为应用程序的每个组件创建和测试单独的容器。
2. 将容器和支持基础设施（supporting infrastructure）组装成一个完整的应用程序。
3. 测试、共享并部署完整的容器化应用程序。

在本教程的这一阶段，让我们集中讨论此工作流的第一步：创建容器将基于的镜像。请记住，Docker 镜像捕获您的容器化进程将在其中运行的私有文件系统;您需要创建一个镜像，其中仅包含应用程序运行所需的内容。

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
   - `--name` 指定可以在后续命令中引用你的容器的名称，在本例中是 bb。

## <span id="sample-dockerfile">Dockerfile 示例</span>






















## CLI 参考文献

有关本文中使用的所有CLI命令的进一步文档，请参阅以下主题：

- [docker version](https://docs.docker.com/engine/reference/commandline/version/)
- [docker run](https://docs.docker.com/engine/reference/commandline/run/)
- [docker image](https://docs.docker.com/engine/reference/commandline/image/)
- [docker container](https://docs.docker.com/engine/reference/commandline/container/)

<br/>

> 作者 ： Docker 官网 <br/>
> 译者 ： 技术译民 <br/>
> 出品 ： [技术译站](https://ittranslator.cn/) <br/>
> 链接 ： [英文原文](https://docs.docker.com/get-started/part2/)
