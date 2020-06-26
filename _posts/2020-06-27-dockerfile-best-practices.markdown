---
layout: post
title:  "使用 Docker 开发 - 编写 Dockerfiles 的最佳实践"
date:   2020-06-27 21:00:00 +0800
categories: backend docker
published: false
---

本文介绍构建高效镜像推荐的最佳实践和方法。

Docker 通过读取 Dockerfile 中的指令自动构建镜像，Dockerfile 是一个文本文件，包含构建给定镜像所需的所有命令。Dockerfile 遵循特定的格式和指令集，您可以在 [Dockerfile 参考](https://docs.docker.com/engine/reference/builder/) 中找到它们。

Docker 镜像由只读层组成，每个层代表一条 Dockerfile 指令。
这些层被堆叠起来，每个层都是前一层变化的增量。考虑一下这个 Dockerfile:

```BASH
FROM ubuntu:18.04
COPY . /app
RUN make /app
CMD python /app/app.py
```

每条指令创建一个层：

- `FROM` 基于 `ubuntu:18.04` Docker 镜像创建一个层。
- `COPY` 从您的 Docker 客户端的当前目录添加文件。
- `RUN` 使用 `make` 构建应用程序。
- `CMD` 指定要在容器中运行的命令。

当您运行一个镜像并生成一个容器时，您将在基础层的顶部添加一个新的可写层(“容器层”)。对运行中的容器所做的所有更改，例如写入新文件、修改现有文件和删除文件，都将写入这个精简的可写容器层。

有关镜像层(以及 Docker 如何构建和存储镜像)的更多信息，请参阅 [About storage drivers](https://docs.docker.com/storage/storagedriver/)。

## 一般准则和建议

### 创建临时容器

`Dockerfile` 定义的镜像应该生成尽可能短暂的容器。所谓“短暂”，我们的意思是容器可以停止和销毁，然后重建和替换为一个绝对最小的设置和配置。

参考 12-Factor 应用方法下的[进程](https://12factor.net/zh_cn/processes)，了解以这种无状态方式运行容器的动机。

> 12-Factor 应用的进程必须无状态且无共享 。 任何需要持久化的数据都要存储在 [后端服务](https://12factor.net/zh_cn/backing-services) 内，比如数据库。

### 理解构建上下文

当你发出 `docker build` 命令时，当前工作目录称为 *build context*。默认情况下，Dockerfile 被假定位于此处，但您可以使用文件标记（`-f`）指定一个不同的位置。不管 `Dockerfile` 实际位于何处，当前目录中文件和目录的所有递归内容都将作为构建上下文发送到 Docker 守护进程。


> **Build context 示例** <br/>
> 为构建上下文创建一个目录并 `cd` 到其中。写入“hello”到一个名为 `hello` 的文本文件，并创建一个Dockerfile 对 `/hello` 文件运行 `cat` 命令，从构建上下文( `.` )构建镜像：
> ```BASH
> mkdir myproject && cd myproject
> echo "hello" > hello
> echo -e "FROM busybox\nCOPY /hello /\nRUN cat /hello" > Dockerfile
> docker build -t helloapp:v1 .
> ```
> 将 `Dockerfile` 和 `hello` 移动到单独的目录中，并构建quj镜像的第二个版本（不依赖上次构建的缓存）。使用 `-f` 指向 Dockerfile，并指定构建上下文的目录：
> ```BASH
> mkdir -p dockerfiles context
> mv Dockerfile dockerfiles && mv hello context
> docker build --no-cache -t helloapp:v2 -f dockerfiles/Dockerfile context
> ```

无意中包含构建镜像不需要的文件会导致更大的构建上下文和更大的镜像大小。这可能会增加构建镜像的时间、拉取和推送映像的时间以及容器运行时大小。要查看你的构建上下文有多大，请在构建 `Dockerfile` 时，查找这样的信息:

```
Sending build context to Docker daemon  187.8MB
```














<br/>

> 作者 ： Docker 官网 <br/>
> 译者 ： 技术译民 <br/>
> 出品 ： [技术译站](https://ittranslator.cn/) <br/>
> 链接 ： [英文原文](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
