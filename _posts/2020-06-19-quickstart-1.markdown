---
layout: post
title:  "Docker 快速入门（一）- 情况介绍和安装"
date:   2020-06-19 02:09:00 +0800
categories: backend docker
published: true
---

欢迎您! 我们很高兴您想学习 Docker 。

这个页面包含了如何开始使用 Docker 的循序渐进的说明。

Docker 快速入门培训模块教你如何:

- 设置 Docker 环境（在本页）
- [构建并运行您的镜像](https://docs.docker.com/get-started/part2/)
- [在 Docker Hub 上共享镜像](https://docs.docker.com/get-started/part3/)

## Docker 概念

Docker 是一个供开发人员和系统管理员构建、运行和与容器共享应用程序的平台。使用容器部署应用程序称为容器化。容器并不是新事物，但它们用于轻松部署应用程序却是新鲜的。

容器化越来越受欢迎，归因于容器有以下优点：

- **灵活性**：即使是最复杂的应用程序也可以容器化。
- **轻量级**：容器利用并共享主机内核，使它们在系统资源方面比虚拟机更有效率。
- **可移植**：您可以在本地构建，部署到云上，并在任何地方运行。
- **松耦合**：容器是高度自给自足和封装的，允许您在不影响其他容器的情况下替换或升级其中一个。 
- **可扩展**：您可以跨数据中心增加和自动分发容器副本。
- **安全性**：容器对进程应用主动约束和隔离，而不需要用户进行任何配置。

### 镜像和容器

从根本上讲，容器不过是一个正在运行的进程，对其应用了一些附加的封装特性，以便将它与主机和其他容器隔离开来。容器隔离的一个最重要的方面是，每个容器与自己的私有文件系统交互；这个文件系统由 Docker 镜像提供。镜像包含运行应用程序所需的所有内容——代码或二进制文件、运行时、依赖项以及所需的任何其他文件系统对象。

### 容器和虚拟机

容器在 Linux 上本机运行，并与其他容器共享主机的内核。 它运行一个离散进程，占用的内存不比任何其他可执行文件多，从而使其轻巧。相比之下，虚拟机(VM)运行成熟的“来宾”操作系统，通过管理程序虚拟访问主机资源。一般而言，虚拟机会产生比应用程序逻辑本身所消耗资源更多的开销。

|                            容器                             |                           虚拟机                           |
| :---------------------------------------------------------: | :--------------------------------------------------------: |
| ![Container stack example](/assets/images/Container@2x.png) | ![Virtual machine stack example](/assets/images/VM@2x.png) |

## 设置 Docker 环境

### 下载并安装Docker桌面

Docker Desktop 是一款适用于Mac或Windows环境的易于安装的应用程序，使您能够在几分钟内开始编码和容器化。Docker Desktop 包含了从您的机器构建、运行和共享容器化应用程序所需的一切。

按照适合您的操作系统的说明下载和安装 Docker Desktop：

- [Docker Desktop for Mac](https://docs.docker.com/docker-for-mac/install/)
- [Docker Desktop for Windows](https://docs.docker.com/docker-for-windows/install/)

### 检验 Docker 版本

成功安装 Docker Desktop 后，打开一个终端，运行 `docker --version` 来检查机器上安装的 Docker 版本。

```BASH
$ docker --version
Docker version 19.03.5, build 633a0ea
```

### 检验 Docker 安装结果

1. 通过运行 hello-world Docker 镜像测试您的安装工作:
```BASH
   $ docker run hello-world

   Unable to find image 'hello-world:latest' locally
   latest: Pulling from library/hello-world
   ca4f61b1923c: Pull complete
   Digest: sha256:ca0eeb6fb05351dfc8759c20733c91def84cb8007aa89a5bf606bc8b315b9fc7
   Status: Downloaded newer image for hello-world:latest

   Hello from Docker!
   This message shows that your installation appears to be working correctly.
   ...
```
2. 运行 `docker image ls` 以列出你下载到计算机的 `hello-world` 镜像。
3. 列出显示其消息后退出的 `hello-world` 容器(由镜像派生)。如果它仍在运行，则不需要 `--all` 选项:
```BASH
   $ docker ps --all

   CONTAINER ID     IMAGE           COMMAND      CREATED            STATUS
   54f4984ed6a8     hello-world     "/hello"     20 seconds ago     Exited (0) 19 seconds ago
```

## 结论

现在，您已经在开发机器上安装了 Docker Desktop，并运行了一个快速测试，以确保您已经为构建和运行第一个容器化应用程序进行了设置。

<br/>

> 作者 ： Docker 官网 <br/>
> 译者 ： 技术译民 <br/>
> 出品 ： [技术译站](https://ittranslator.cn/) <br/>
> 链接 ： [英文原文](https://docs.docker.com/get-started/)