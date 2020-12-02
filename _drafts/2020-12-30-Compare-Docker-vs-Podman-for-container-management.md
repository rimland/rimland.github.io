---
layout: post
title:  "Docker 与 Podman 容器管理的比较"
date:   2020-12-02 00:05:00 +0800
categories: backend docker
published: true
---

> 翻译自 Paul Ferrill 2020年9月1日的文章[《Compare Docker vs. Podman for container management》](https://searchservervirtualization.techtarget.com/tip/Compare-Docker-vs-Podman-for-container-management) [^1]

[^1]: <https://searchservervirtualization.techtarget.com/tip/Compare-Docker-vs-Podman-for-container-management> Compare Docker vs. Podman for container management

**Docker 和 Podman 在管理容器方面提供了类似的功能，但是 Docker 的安全漏洞可能使 Podman 对于某些管理员来说更具吸引力。**

![docker vs podman](/assets/images/202011/docker-vs-podman.jpeg#center)

目前 Docker 已经成为许多 IT 管理员们事实上的标准，并且在开发人员中占有很大的份额。 但是，Podman 由于具有以非特权用户身份运行且无需守护进程的能力，因此与基本的 Docker 相比，它为管理员们提供了一些安全上的优势。

Docker 和 Podman 都提供许多相同的功能，例如，它们对开放式容器倡议（OCI）的运行时和镜像规范的支持，以及它们映射命令以创建和管理容器的能力。 但是，Docker 和 Podman 之间存在一些差异，包括安全方面的问题和对守护程序的依赖。[^2]

[^2]: <https://ittranslator.cn/backend/docker/2020/11/30/docker-vs-podman.html> Docker Vs Podman

考虑到 Podman 不使用[守护进程](https://whatis.techtarget.com/definition/daemon)来开发、管理和运行 OCI 容器，因此它必须在 Linux OS 上运行。 容器可以以 root 模式运行，也可以以非 root 运行模式运行。Docker 利用一个守护进程（该守护进程是一个持久的后台进程）来处理主机上所有容器的管理职责。Docker 依赖于客户端/服务端（C/S）架构，守护进程扮演着服务端的角色，而客户端通过命令行界面（CLI）进行通信。

Docker 使用本机 Windows 守护进程就可以很好地运行 Windows 或基于 Linux 的镜像。Podman 需要 Windows Subsystem for Linux 版本2（WSL2）才能正常运行。 因此，管理员们必须有2020年5月以后的 Windows 10 更新才能开始使用 Podman，因为这是第一个将 WSL2 作为更新的一部分的发行版。

## 安全

Docker 与 Podman 之间的一个重大区别[涉及到安全问题](https://searchsecurity.techtarget.com/tip/Container-security-best-practices-help-mitigate-risks-and-threats)。 Docker 守护进程需要 root 权限，这在向用户提供 root 权限时带来了安全挑战。 这也意味着配置不当的 Docker 容器可以无限制地访问主机文件系统。管理员可以通过遵循一些基本的最佳实践来防止这种情况发生，比如仅使用来自受信任的供应商提供的容器镜像，但这种可能性仍然存在。

但是，管理员们使用 Podman 可以以非特权用户启动容器。这就使得 Podman 在锁定环境场景中具有了超越 Docker 的优势。 话虽如此，管理员们将无法以非特权用户身份在主机系统上执行任何需要 root 权限的命令。这包括映射主机上低于 1024 的任何特权端口号，以及默认的 HTTP 端口号 80。

此外，Docker 和 Podman 都使用 CLI 作为主要管理界面。但是，Docker 使用 REST API 终端与守护进程进行通信，且较旧的版本使用绑定到本机 IP 地址的 TCP socket 通信。这为跨站伪造利用提供了一个[潜在的攻击面](https://searchsecurity.techtarget.com/feature/How-to-mitigate-5-persistent-application-security-threats)。Docker 在 0.5.2 版本中通过引入 UNIX socket 解决了这个漏洞（管理员可以使用传统的 UNIX 权限进行控制，以限制访问）。考虑到 Podman 不依赖守护进程，因此不易受到此类攻击的影响。

## 容器编排

在容器编排方面，Kubernetes 已经成为占据主导地位的参与者。VMware 已采用 Kubernetes 作为 VM 以及连接到运行中的容器的所有其他设备的主要管理平台。 Kubernetes 使用术语 pod 来定义共享某些资源的容器集合。Podman 通过实现 pod 命令，将多个容器作为一个实体进行管理，从而支持相同的概念。

同样，Docker 为容器编排提供了多个选项。Docker Swarm 是 Docker 维护的用于管理集群的本地工具。Docker 还与 Kubernetes 集成得很好，这是大多数开发团队的主流选择。 对于 Windows 部署，管理员可以选择在安装过程中启用 Kubernetes，从而可以从管理员的台式机或笔记本电脑直接访问 Kubernetes 命令。

更进一步来说，管理员可以围绕持续集成和持续部署（CI/CD）模型构建他们的应用程序，在该模型中，开发和测试工作可以基于一些简单的配置文件在任何地方进行。当管理员准备将发布推送到生产环境时，只需执行几个额外步骤即可更改部署目标。

Podman 和 Docker 都符合 OCI 镜像标准，但仅就安全特性而言，Podman 是[值得一试](https://www.youtube-nocookie.com/embed/YkBk52MGV0Y)的。Podman 还提供了本地命令来支持 pod 的构建和测试，从而着眼于部署到一个运行 Kubernetes 的生产系统。

<br/>

> 作者 ： Paul Ferrill  
> 译者 ： 技术译民  
> 出品 ： [技术译站](https://ittranslator.cn/)  
> 链接 ： [英文原文](https://searchservervirtualization.techtarget.com/tip/Compare-Docker-vs-Podman-for-container-management)
