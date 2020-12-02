---
layout: post
title:  "Compare Docker vs. Podman for container management"
date:   2020-11-29 00:05:00 +0800
categories: backend docker
published: true
---

> 翻译自 Paul Ferrill 2020年9月1日的文章[《Compare Docker vs. Podman for container management》](https://searchservervirtualization.techtarget.com/tip/Compare-Docker-vs-Podman-for-container-management) [^1]

[^1]: <https://searchservervirtualization.techtarget.com/tip/Compare-Docker-vs-Podman-for-container-management> Compare Docker vs. Podman for container management

![docker vs podman](/assets/images/202011/docker-vs-podman.jpeg#center)

**Docker 和 Podman 在管理容器方面提供了类似的功能，但是 Docker 的安全漏洞可能使 Podman 对于某些管理员来说更具吸引力。**

Docker has become the de facto standard for many IT administrators and does have the lion's share of developer interest today. Yet, Podman offers admins some security advantages over basic Docker due to its ability to run as a nonprivileged user and without a daemon.

目前 Docker 已经成为许多 IT 管理员们事实上的标准，并且在开发人员中占有很大的份额。 但是，Podman 由于具有以非特权用户身份运行且无需守护进程的能力，因此与基本的 Docker 相比，它为管理员们提供了一些安全上的优势。

Docker and Podman both offer many of the same features, such as their support for Open Container Initiative's (OCI) runtime and image specifications, as well as their ability to map commands to create and manage containers. Yet, there are several differences between Docker and Podman, including security concerns and reliance on daemon programs.

Docker 和 Podman 都提供许多相同的功能，例如，它们对开放式容器倡议（OCI）的运行时和镜像规范的支持，以及它们映射命令以创建和管理容器的能力。 但是，Docker 和 Podman 之间存在一些差异，包括安全方面的问题和对守护程序的依赖。

Considering Podman does not use a daemon to develop, manage and run OCI containers, it must run on top of a Linux OS. Containers can either be run as root or in rootless mode. Docker utilizes a daemon, which is a persistent background process that handles all container management duties on the host. Docker relies on both a client and server architecture where the daemon fulfills the role of a server while clients communicate via the command-line interface (CLI).

考虑到 Podman 不使用[守护进程](https://whatis.techtarget.com/definition/daemon)来开发、管理和运行 OCI 容器，因此它必须在 Linux OS 上运行。 容器可以以 root 模式运行，也可以以非 root 运行模式运行。Docker 利用一个守护进程（该守护进程是一个持久的后台进程）来处理主机上所有容器的管理职责。Docker 依赖于客户端/服务端（C/S）架构，守护进程扮演着服务端的角色，而客户端通过命令行界面（CLI）进行通信。

Docker runs just fine using a native Windows daemon to launch either Windows or Linux-based images. Podman requires version 2 of the Windows Subsystem (WSL) for Linux to function properly. As a result, admins must have the May 2020 Windows 10 update to get started with Podman because this was the first release to include WSL2 as a part of the update.

Docker 使用本机 Windows 守护进程就可以很好地运行 Windows 或基于 Linux 的镜像。Podman 需要 Windows Subsystem for Linux 版本2（WSL2）才能正常运行。 因此，管理员们必须有2020年5月以后的 Windows 10 更新才能开始使用 Podman，因为这是第一个将 WSL2 作为更新的一部分的发行版。

## 安全

A significant difference between Docker vs. Podman involves security concerns. The Docker daemon requires root privileges, which presents a security challenge when providing root privileges to users. It also means that an improperly configured Docker container could potentially access the host filesystem without restriction. Admins can prevent this by following some basic best practices, such as only using container images from trusted vendors, but the possibility still does exist.

Docker 与 Podman 之间的一个重大区别[涉及到安全问题](https://searchsecurity.techtarget.com/tip/Container-security-best-practices-help-mitigate-risks-and-threats)。 Docker 守护进程需要 root 权限，这在向用户提供 root 权限时带来了安全挑战。 这也意味着配置不当的 Docker 容器可以无限制地访问主机文件系统。管理员可以通过遵循一些基本的最佳实践来防止这种情况发生，比如仅使用来自受信任的供应商提供的容器镜像，但这种可能性仍然存在。

But admins can launch containers as a nonprivileged user with Podman. This provides Podman with an advantage over Docker when it comes to locked down environments. That being said, admins won't be able to execute any commands that require root privileges on the host system as a nonprivileged user. This includes mapping any privileged port numbers below 1024 on the host, as well as the default HTTP port 80.

但是，管理员们使用 Podman 可以以非特权用户启动容器。这就使得 Podman 在锁定环境场景中具有了超越 Docker 的优势。 话虽如此，管理员们将无法以非特权用户身份在主机系统上执行任何需要 root 权限的命令。这包括映射主机上低于 1024 的任何特权端口号，以及默认的 HTTP 端口号 80。

In addition, both Docker and Podman use a CLI as the primary management interface. Yet, Docker uses a REST API endpoint for communication with the daemon, and older versions use a TCP socket bound to the localhost IP address. This presents a potential attack surface for a cross-site forgery exploit. Docker addressed this vulnerability in version 0.5.2 by introducing a UNIX socket that admins can control with traditional UNIX permissions to restrict access. Considering Podman doesn't rely on a daemon, it's not susceptible to this type of attack.

此外，Docker 和 Podman 都使用 CLI 作为主要管理界面。但是，Docker 使用 REST API 终端与守护进程进行通信，且较旧的版本使用绑定到本机 IP 地址的 TCP socket 通信。这为跨站伪造利用提供了一个[潜在的攻击面](https://searchsecurity.techtarget.com/feature/How-to-mitigate-5-persistent-application-security-threats)。Docker 在 0.5.2 版本中通过引入 UNIX socket 解决了这个漏洞（管理员可以使用传统的 UNIX 权限进行控制，以限制访问）。考虑到 Podman 不依赖守护进程，因此不易受到此类攻击的影响。

## 容器编排

Kubernetes has become the dominant player when it comes to container orchestration. VMware has adopted Kubernetes as its primary management plane for VMs and everything else connected to running containers. Kubernetes uses the term pod to define a collection of containers that share certain resources. Podman supports this same concept by implementing a pod command to manage multiple containers as a single entity.

在容器编排方面，Kubernetes 已经成为占据主导地位的参与者。VMware 已采用 Kubernetes 作为 VM 以及连接到运行中的容器的所有其他设备的主要管理平台。 Kubernetes 使用术语 pod 来定义共享某些资源的容器集合。Podman 通过实现 pod 命令，将多个容器作为一个实体进行管理，从而支持相同的概念。


Similarly, Docker provides multiple options for container orchestration. Docker Swarm is the native tool maintained by Docker for managing a cluster. Docker also integrates well with Kubernetes, which is the popular choice for most development teams. For Windows deployments, admins have the option to enable Kubernetes during the installation process, which provides full access to the Kubernetes commands right from admins' desktop or laptop.

同样，Docker 为容器编排提供了多个选项。Docker Swarm 是 Docker 维护的用于管理集群的本地工具。Docker 还与 Kubernetes 集成得很好，这是大多数开发团队的主流选择。 对于 Windows 部署，管理员可以选择在安装过程中启用 Kubernetes，从而可以从管理员的台式机或笔记本电脑直接访问 Kubernetes 命令。

Taking this one step further, it's possible for admins to build their applications around the continuous integration and deployment model where development and test can happen anywhere based on some simple configuration files. A few additional steps to change the deployment target are all that's required when admins are ready to push a release to production.

更进一步来说，管理员可以围绕持续集成和持续部署（CI/CD）模型构建他们的应用程序，在该模型中，开发和测试工作可以基于一些简单的配置文件在任何地方进行。当管理员准备将一个发行版推入生产环境时，只需执行几个其他步骤即可更改部署目标。

Both Podman and Docker conform to OCI standards for images, but Podman is worth checking out for the security features alone. Podman also provides native commands to support the building and testing of pods with an eye toward deploying a production system running Kubernetes.

Podman 和 Docker 都符合 OCI 镜像标准，但仅就安全特性而言，Podman 是[值得一试](https://www.youtube-nocookie.com/embed/YkBk52MGV0Y)的。Podman 还提供了本地命令来支持 pod 的构建和测试，着眼于部署到一个运行 Kubernetes 的生产系统。

<br/>

> 作者 ： Paul Ferrill  
> 译者 ： 技术译民  
> 出品 ： [技术译站](https://ittranslator.cn/)  
> 链接 ： [英文原文](https://searchservervirtualization.techtarget.com/tip/Compare-Docker-vs-Podman-for-container-management)
