---
layout: post
title:  "Compare Docker vs. Podman for container management"
date:   2020-11-29 00:05:00 +0800
categories: backend docker
published: true
---

> 翻译自 Paul Ferrill 2020年9月1日的博文[《Compare Docker vs. Podman for container management》](https://searchservervirtualization.techtarget.com/tip/Compare-Docker-vs-Podman-for-container-management) [^1]

[^1]: <https://searchservervirtualization.techtarget.com/tip/Compare-Docker-vs-Podman-for-container-management> Compare Docker vs. Podman for container management

**Docker 和 Podman 在管理容器方面提供了类似的功能，但是 Docker 的安全漏洞可能使 Podman 对某些管理员更具吸引力。**

Docker has become the de facto standard for many IT administrators and does have the lion's share of developer interest today. Yet, Podman offers admins some security advantages over basic Docker due to its ability to run as a nonprivileged user and without a daemon.

目前 Docker 已经成为许多 IT 管理员们事实上的标准，并且在开发人员中占有很大的份额。 但是，Podman 由于具有以非特权用户身份运行且无需守护进程的能力，因此与基本的 Docker 相比，它为管理员提供了一些安全上的优势。

Docker and Podman both offer many of the same features, such as their support for Open Container Initiative's (OCI) runtime and image specifications, as well as their ability to map commands to create and manage containers. Yet, there are several differences between Docker and Podman, including security concerns and reliance on daemon programs.

Docker 和 Podman 都提供许多相同的功能，例如，它们对开放式容器倡议（OCI）的运行时和镜像规范的支持，以及它们映射命令以创建和管理容器的能力。 但是，Docker 和 Podman 之间存在一些差异，包括安全方面的问题和对守护程序的依赖。

Considering Podman does not use a daemon to develop, manage and run OCI containers, it must run on top of a Linux OS. Containers can either be run as root or in rootless mode. Docker utilizes a daemon, which is a persistent background process that handles all container management duties on the host. Docker relies on both a client and server architecture where the daemon fulfills the role of a server while clients communicate via the command-line interface (CLI).

考虑到 Podman 不使用[守护进程](https://whatis.techtarget.com/definition/daemon)来开发、管理和运行 OCI 容器，因此它必须在 Linux OS 上运行。 容器能以root 模式运行，也能以非 root 运行模式运行。 Docker 利用一个守护进程（该守护进程是一个持久的后台进程）来处理主机上所有容器的管理职责。 Docker 依赖于客户端/服务端（C/S）架构，守护进程扮演着服务端的角色，而客户端通过命令行界面（CLI）进行通信。

Docker runs just fine using a native Windows daemon to launch either Windows or Linux-based images. Podman requires version 2 of the Windows Subsystem (WSL) for Linux to function properly. As a result, admins must have the May 2020 Windows 10 update to get started with Podman because this was the first release to include WSL2 as a part of the update.

Docker 使用本机 Windows 守护程序就可以很好地运行 Windows 或基于 Linux 的镜像。Podman 需要 Windows Subsystem for Linux 版本2（WSL2）才能正常运行。 因此，管理员们必须有2020年5月以后的 Windows 10 更新才能开始使用 Podman，因为这是第一个将 WSL2 作为更新的一部分的发行版。

## 安全

A significant difference between Docker vs. Podman involves security concerns. The Docker daemon requires root privileges, which presents a security challenge when providing root privileges to users. It also means that an improperly configured Docker container could potentially access the host filesystem without restriction. Admins can prevent this by following some basic best practices, such as only using container images from trusted vendors, but the possibility still does exist.

Docker 与 Podman 之间的一个重大区别[涉及到安全问题](https://searchsecurity.techtarget.com/tip/Container-security-best-practices-help-mitigate-risks-and-threats)。 Docker 守护进程需要 root 权限，这在向用户提供 root 权限时带来了安全挑战。 这也意味着配置不当的 Docker 容器可以无限制地访问主机文件系统。管理员可以通过遵循一些基本的最佳实践来防止这种情况发生，比如仅使用来自受信任的供应商的容器映像，但这种可能性仍然存在。

But admins can launch containers as a nonprivileged user with Podman. This provides Podman with an advantage over Docker when it comes to locked down environments. That being said, admins won't be able to execute any commands that require root privileges on the host system as a nonprivileged user. This includes mapping any privileged port numbers below 1024 on the host, as well as the default HTTP port 80.

但是，管理员们使用 Podman 可以以非特权用户启动容器。就是使得 Podman 在锁定环境场景中具有了超越 Docker 的优势。 话虽如此，管理员们将无法以非特权用户身份在主机系统上执行任何需要 root 权限的命令。这包括映射主机上低于 1024 的任何特权端口号，以及默认的 HTTP 端口号 80。

In addition, both Docker and Podman use a CLI as the primary management interface. Yet, Docker uses a REST API endpoint for communication with the daemon, and older versions use a TCP socket bound to the localhost IP address. This presents a potential attack surface for a cross-site forgery exploit. Docker addressed this vulnerability in version 0.5.2 by introducing a UNIX socket that admins can control with traditional UNIX permissions to restrict access. Considering Podman doesn't rely on a daemon, it's not susceptible to this type of attack.

此外，Docker 和 Podman 都使用 CLI 作为主要管理界面。但是，Docker 使用 REST API 终端与守护进程进行通信，且较旧的版本使用绑定到本机 IP 地址的 TCP socket 通信。这为跨站点伪造利用提供了一个[潜在的攻击面](https://searchsecurity.techtarget.com/feature/How-to-mitigate-5-persistent-application-security-threats)。Docker 在 0.5.2 版本中通过引入 UNIX socket 解决了这个漏洞（管理员可以使用传统的 UNIX 权限进行控制，以限制访问）。考虑到 Podman 不依赖守护进程，因此不易受到此类攻击的影响。

## 容器编排

Kubernetes has become the dominant player when it comes to container orchestration. VMware has adopted Kubernetes as its primary management plane for VMs and everything else connected to running containers. Kubernetes uses the term pod to define a collection of containers that share certain resources. Podman supports this same concept by implementing a pod command to manage multiple containers as a single entity.

在容器编排方面，Kubernetes 已经成为占据主导地位的参与者。VMware 已采用 Kubernetes 作为 VM 以及与运行中的容器连接的所有其他设备的主要管理平台。 Kubernetes 使用术语 pod 来定义共享某些资源的容器集合。Podman 通过实现 pod 命令，将多个容器作为一个实体进行管理，从而支持相同的概念。


Similarly, Docker provides multiple options for container orchestration. Docker Swarm is the native tool maintained by Docker for managing a cluster. Docker also integrates well with Kubernetes, which is the popular choice for most development teams. For Windows deployments, admins have the option to enable Kubernetes during the installation process, which provides full access to the Kubernetes commands right from admins' desktop or laptop.

同样，Docker 为容器编排提供了多个选项。Docker Swarm 是 Docker 维护的用于管理集群的本地工具。Docker 还与 Kubernetes 很好地集成，这是大多数开发团队的主流选择。 对于 Windows 部署，管理员可以选择在安装过程中启用 Kubernetes，从而可以从管理员的台式机或笔记本电脑直接访问 Kubernetes 命令。

Taking this one step further, it's possible for admins to build their applications around the continuous integration and deployment model where development and test can happen anywhere based on some simple configuration files. A few additional steps to change the deployment target are all that's required when admins are ready to push a release to production.

更进一步，管理员可以围绕持续集成和部署模型构建应用程序，在该模型中，开发人员可以根据一些简单的配置文件在任何地方进行开发和测试。 当管理员准备将发布发布到生产环境时，只需执行几个其他步骤即可更改部署目标。

更进一步，管理员可以围绕持续集成和部署模型构建应用程序，在该模型中，开发人员可以根据一些简单的配置文件在任何地方进行开发和测试。 当管理员准备将发布发布到生产环境时，只需执行几个其他步骤即可更改部署目标。

<br/>
<br/>
<br/><br/><br/><br/><br/><br/>









![docker vs podman](/assets/images/202011/docker-vs-podman.jpeg#center)

容器化的一场全新革命是从 Docker 开始的，Docker 的守护进程管理着所有的事情，并成为最受欢迎和广泛使用的容器管理系统之一。

但是，请稍等！您真的会假设 Docker 是唯一有效的容器化方式而认为值得坚持去使用它吗？

这篇博文将帮助您了解以下问题：

<!-- Why would we not use Docker? Why would we use Docker? Are there no alternatives to it ? and when you will start using new set of tools for container management , docker will be just another tool and there is no “docker containers/images” but just “containers/images” -->

为什么我们*不使用* Docker？ 为什么我们*要使用* Docker？ 没有别的选择了吗？其实，当您决定要开始使用一套新的工具进行容器管理时，Docker 便成了“别的”工具，此时没有了 “docker containers/images”，只有 “containers/images”。

在继续讨论本文内容之前，让我们先来了解一下 Docker 是什么以及它是如何工作的。

## Docker 是什么？

Docker 是一个容器化平台，在这个平台中，我们可以将我们的应用程序与容器中的库和环境绑定在一起。 Docker Container 在某种程度上类似于虚拟机。  
但是……

与硬件虚拟化的虚拟机不同，在 Docker 中，运行中的容器共享主机 OS 内核。

![Containers VS VMs](/assets/images/202011/containers-vs-VMs.png#center)

**Docker 是如何工作的呢？让我们来看一下：**

**Docker 流程:**

![Docker Flow](/assets/images/202011/docker-flow.png#center)

Docker 的两个主要组成模块是： **Docker Daemon** 和 **Docker CLI**。

请允许我简短地解释一下：

**Docker Daemon：** 一个常驻的后台进程，帮助管理和创建 Docker 镜像、容器、网络和存储卷。

**Docker Engine REST API：** 一个应用程序用来与 Docker 守护进程进行交互的 API; 可以通过 HTTP 客户端访问它。

**Docker CLI：** 一个用来与 Docker 守护进程进行交互的 Docker 命令行客户端，也就是 Docker 命令。

如果换个角度思考，我们可以把下面这些问题与 Docker 联系起来：

1. 众所周知，Docker 运行在单个进程上，这可能会导致单点故障。
2. 所有子进程都归属于此进程。
3. 无论何时，如果 Docker 守护进程失败，所有子进程都会失去跟踪并进入孤立状态。
4. 安全漏洞。
5. 对于 Docker 的操作，所有步骤都需要由 root 执行。

## Podman

<!-- Now we know how Docker works, let’s come to the main topic about Podman And how we can overcome on most of the problems associated with containers. -->

现在我们知道了 Docker 是如何工作的，下面我们来探讨有关 Podman 的主题，以及我们如何克服与 Docker 相关的大多数问题。

此时，您一定想了解“**Podman 是什么？**”

- **Podman** 是一个无守护进程的容器引擎，用于在 Linux 系统上进行开发、管理和运行 OCI Containers。 Containers 能以 root 模式运行，也能以非 root 模式运行。

![Podman](/assets/images/202011/podman.png#center)

- Podman 直接与镜像注册表、容器和镜像存储进行交互。
- 我们知道，Docker 是建立在 runC 容器运行时之上 [^runC]，并且使用了守护进程的; Podman 中没有使用守护进程，而是直接使用 runC 容器运行时。

[^runC]: <https://www.docker.com/blog/runc/> Introducing runC

> 译者注：  
> Podman 没有守护进程，也不用 REST API 交互，可以使用非 root 模式运行，这便解决了上面提到的 与 Docker 相关的问题 3、4 和 5。

<!-- There are a few things to unpack about podman -->

**关于 Podman，有几件事需要重点了解一下：**

- Podman 不需要启动或管理像 Docker daemon 那样的守护进程。
- **适用于 Docker 的命令在 Podman 中也是同样可用的。**您可以指定命令别名：`alias docker=podman`
- Podman 和 Docker 的镜像具有兼容性。

很酷……不是吗？

## Podman 入门

### 安装 podman

在 CentOS 8 上安装 podman：

```bash
[cloudbunny@technopanti ~]$ yum install podman
```

![install podman](/assets/images/202011/install-podman.png#center)

安装 podman 之后，您可以使用下面命令检查版本：

```bash
[cloudbunny@technopanti ~]$ podman --version
```

输出：podman version 2.1.1

### 运行一个示例容器

```bash
[cloudbunny@technopanti ~]$ podman run -dt -p 8080:8080/tcp -e HTTPD_VAR_RUN=/var/run/httpd -e HTTPD_MAIN_CONF_D_PATH=/etc/httpd/conf.d \
-e HTTPD_MAIN_CONF_PATH=/etc/httpd/conf \
-e HTTPD_CONTAINER_SCRIPTS_PATH=/usr/share/container-scripts/httpd/ \
registry.fedoraproject.org/f29/httpd /usr/bin/run-httpd
```

![Running a sample container](/assets/images/202011/podman-run.png#center)

<!-- Because the container is being run in detached mode, represented by the -d in the podman run command, Podman will print the container ID after it has run. Note that we use port forwarding to be able to access the HTTP server. -->

由于在 `podman run` 命令中 `-d` 表示以分离模式运行容器，因此 Podman 将在容器运行后打印出容器 ID。注意，这里我们使用了端口转发来访问容器内的 HTTP server。

注释：

1. `-d` 表示以分离模式在后台运行此容器。
2. Podman 在后台运行后会打印出容器 ID。（例如：f1f7215ccf26fe7bb83dd108cdb41480aae5794058a007dd85a098af0d390563）
3. `-p`: 利用端口转发，使能够访问容器内的 HTTP server。

### 列出运行中的容器

```bash
[cloudbunny@technopanti ~]$ podman ps
```

![Listing running containers](/assets/images/202011/podman-ps.png#center)

### 检查运行中的容器

```bash
[cloudbunny@technopanti ~]$ podman inspect -l
```

<!-- This will help to “inspect” a running container for metadata and details about itself.
status : running/ stopped , date of creation , container ID , etc.

 -->

这将有助于“检查”正在运行的容器中的元数据和相关的详细信息 —— 状态（运行或停止）、创建日期和容器 ID，等等。

![Inspecting a running container](/assets/images/202011/podman-inspect.png#center)

<!-- Since we have a detail of container we can test our http server , in this example the port fowarding is done on port : 8080 -->

既然我们有容器的详细信息，我们便可以测试 http server，此例中，在端口 8080 上执行端口转发。  
执行命令：

```bash
[cloudbunny@technopanti ~]$ curl http://localhost:8080
```

上面的命令将会显示我们容器化的 httpd server 中的 index 页面。

![curl http://localhost:8080](/assets/images/202011/curl-localhost.png#center)

### 查看容器日志

```bash
[cloudbunny@technopanti ~]$ podman logs --latest
```

希望您享受本文的阅读 :)

<br/>

> 作者 ： Chetansingh  
> 译者 ： 技术译民  
> 出品 ： [技术译站](https://ittranslator.cn/)  
> 链接 ： [英文原文](https://medium.com/technopanti/docker-vs-podman-c03359fabf77)
