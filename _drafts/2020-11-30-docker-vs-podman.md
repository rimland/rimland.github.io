---
layout: post
title:  "Docker Vs Podman"
date:   2020-11-27 00:05:00 +0800
categories: backend docker
published: true
---

> 翻译自 Chetansingh 2020年4月24日的博文[《Docker Vs Podman》](https://medium.com/technopanti/docker-vs-podman-c03359fabf77) [^1]

[^1]: <https://medium.com/technopanti/docker-vs-podman-c03359fabf77> Docker Vs Podman

![docker vs podman](/assets/images/202011/docker-vs-podman.jpeg#center)

容器化的一场全新革命是从 Docker 开始的，Docker 的守护进程管理着所有的事情，并成为最受欢迎和广泛使用的容器管理系统之一。

但是，请稍等！您真的会假设 Docker 是唯一有效的容器化方式而认为值得坚持去使用它吗？

<!-- This blog post will help you with such questions like: -->

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

![Docker Flow](/assets/images/202011/docker-flow.png)

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

![Podman](/assets/images/202011/podman.png)

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

![install podman](/assets/images/202011/install-podman.png)

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

![Running a sample container](/assets/images/202011/podman-run.png)

<!-- Because the container is being run in detached mode, represented by the -d in the podman run command, Podman will print the container ID after it has run. Note that we use port forwarding to be able to access the HTTP server. -->

由于在 `podman run` 命令中 `-d` 表示以分离模式运行容器，因此 Podman 将在容器运行后打印出容器 ID。注意，这里我们使用了端口转发来访问容器内的 HTTP server。

注释：

1. `-d` 表示以分离模式在后台运行此容器。
2. Podman 在后台运行后会打印容器 ID。（例如：f1f7215ccf26fe7bb83dd108cdb41480aae5794058a007dd85a098af0d390563）
3. `-p`: 利用端口转发，使能够访问容器内的 HTTP server。

### 列出运行中的容器

```bash
[cloudbunny@technopanti ~]$ podman ps
```

![Listing running containers](/assets/images/202011/podman-ps.png)

### 检查运行中的容器


```bash
[cloudbunny@technopanti ~]$ podman inspect -l
```

<!-- This will help to “inspect” a running container for metadata and details about itself.
status : running/ stopped , date of creation , container ID , etc.

 -->

这将有助于“检查”正在运行的容器中的元数据和相关的详细信息。  
状态（运行或停止）、创建日期和容器 ID，等等。

![Inspecting a running container](/assets/images/202011/podman-inspect.png)

<!-- Since we have a detail of container we can test our http server , in this example the port fowarding is done on port : 8080 -->

既然我们有容器的详细信息，我们便可以测试 http server，此例中，在端口 8080 上执行端口转发。  
执行命令：

```bash
[cloudbunny@technopanti ~]$ curl http://localhost:8080
```

上面的命令将会显示我们容器化的 httpd server 中的 index 页面。

![curl http://localhost:8080](/assets/images/202011/curl-localhost.png)

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
