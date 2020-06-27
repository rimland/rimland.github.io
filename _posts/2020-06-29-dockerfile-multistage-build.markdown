---
layout: post
title:  "使用 Docker 开发 - 使用多阶段构建"
date:   2020-06-29 21:00:00 +0800
categories: backend docker
published: false
---

多阶段构建是一个新特性，需要 Docker 17.05 或更高版本的守护进程和客户端。对于那些努力优化 Dockerfiles 并使其易于阅读和维护的人来说，多阶段构建非常有用。

## 在多阶段构建之前

构建镜像时最具挑战性的事情之一就是缩小镜像大小。Dockerfile 中的每一条指令都会在镜像中添加一个层，在进入下一层之前，您需要记住清除所有不需要的工件。要编写一个真正高效的 Dockerfile，传统上需要使用 shell 技巧和其他逻辑来保持层尽可能小，并确保每一层都有它需要的来自前一层的工件，而没有其他东西。

实际上，有一个 Dockerfile 用于开发环境（包含构建应用程序所需的所有内容），同时有一个精简的 Dockerfile 用于生产环境（仅包含应用程序和运行应用程序所需的内容）是非常常见的。这被称为“建造者模式”。维护两个 Dockerfiles 并不理想。

这里有一个例子 `Dockerfile.build` 文件以及符合上述建造者模式的 `Dockerfile`：

`Dockerfile.build`：

```BASH
FROM golang:1.7.3
WORKDIR /go/src/github.com/alexellis/href-counter/
COPY app.go .
RUN go get -d -v golang.org/x/net/html \
  && CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o app .
```

请注意，此示例还使用 Bash 操作符 `&&` 将两个 `RUN` 命令人为压缩在一起，以避免在镜像中创建额外的层。这很容易发生故障，也很难维护。例如，很容易插入另一个命令而忘记使用 `\` 字符继续行。

`Dockerfile`：

```BASH
FROM alpine:latest  
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY app .
CMD ["./app"]  
```

`build.sh`：

```BASH
#!/bin/sh
echo Building alexellis2/href-counter:build

docker build --build-arg https_proxy=$https_proxy --build-arg http_proxy=$http_proxy \  
    -t alexellis2/href-counter:build . -f Dockerfile.build

docker container create --name extract alexellis2/href-counter:build  
docker container cp extract:/go/src/github.com/alexellis/href-counter/app ./app  
docker container rm -f extract

echo Building alexellis2/href-counter:latest

docker build --no-cache -t alexellis2/href-counter:latest .
rm ./app
```

当你运行 `build.sh` 脚本，它需要构建第一个镜像，从中创建一个容器来复制工件，然后构建第二个镜像。这两个镜像在您的系统上占用空间，并且您的本地磁盘上仍然有 `app` 工件。

多阶段构建极大地简化了这种情况!

## 使用多阶段构建

With multi-stage builds, you use multiple FROM statements in your Dockerfile. Each FROM instruction can use a different base, and each of them begins a new stage of the build. You can selectively copy artifacts from one stage to another, leaving behind everything you don’t want in the final image. To show how this works, let’s adapt the Dockerfile from the previous section to use multi-stage builds.

对于多阶段构建，可以在 Dockerfile 中使用多个 `FROM` 语句。每个 `FROM` 指令都可以使用不同的基镜像，并且它们都开始了构建的新阶段。您可以选择性地将工件从一个阶段复制到另一个阶段，舍弃在最终镜像中您不想要的所有内容。为了说明这是如何工作的，让我们使用多阶段构建调整前一节中的 Dockerfile。

`Dockerfile`：

```
FROM golang:1.7.3
WORKDIR /go/src/github.com/alexellis/href-counter/
RUN go get -d -v golang.org/x/net/html  
COPY app.go .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o app .

FROM alpine:latest  
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=0 /go/src/github.com/alexellis/href-counter/app .
CMD ["./app"]  
```

You only need the single Dockerfile. You don’t need a separate build script, either. Just run docker build.

您只需要一个 Dockerfile。您也不需要单独的构建脚本。只要运行 `docker build`。

```BASH
$ docker build -t alexellis2/href-counter:latest .
```

最终的结果是与前面相同的微小生产镜像，并且显著降低了复杂性。您不需要创建任何中间镜像，也不需要将任何工件提取到本地系统中。

它是如何工作的？第二个 `FROM` 指令用 `alpine:latest` 镜像作为基础，开始一个新的构建阶段。`COPY --from=0` 行只将前一阶段的构建工件复制到这个新阶段。Go SDK 和任何中间工件都会被留下，不会保存在最终的镜像中。

## 为构建阶段命名











<br/>

> 作者 ： Docker 官网 <br/>
> 译者 ： 技术译民 <br/>
> 出品 ： [技术译站](https://ittranslator.cn/) <br/>
> 链接 ： [英文原文](https://docs.docker.com/develop/develop-images/multistage-build/)
