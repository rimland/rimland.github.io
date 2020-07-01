---
layout: post
title:  "Docker 基础知识 - 使用卷（volumes）管理应用程序数据"
date:   2020-07-02 21:00:00 +0800
categories: backend docker
published: false
---

卷（volumes）是 Docker 容器生产和使用持久化数据的首选机制。[绑定挂载（bind mounts）](https://docs.docker.com/storage/bind-mounts/)依赖于主机的目录结构，卷（volumes）完全由 Docker 管理。卷与绑定挂载相比有几个优势：

- 卷比绑定挂载更容易备份或迁移。
- 您可以使用 Docker CLI 命令或 Docker API 来管理卷。
- 卷可以在 Linux 和 Windows 容器上工作。
- 卷可以更安全地在多个容器之间共享。
- 卷驱动程序允许您在远程主机或云提供商上存储卷、加密卷的内容或添加其他功能。
- 新卷的内容可以由容器预先填充。（New volumes can have their content pre-populated by a container.）

此外，与将数据持久化到容器的可写层相比，卷通常是更好的选择，因为卷不会增加使用它的容器的大小，而且卷的内容存在于给定容器的生命周期之外。

![types-of-mounts-volume](/assets/images/docker-types-of-mounts-volume.png)

如果容器生成非持久性状态数据，请考虑使用 [tmpfs 挂载（tmpfs mount）](https://docs.docker.com/storage/tmpfs/)以避免将数据永久存储在任何位置，并通过避免写入容器的可写层来提高容器的性能。

卷使用 `rprivate` 绑定传播，并且绑定传播对于卷是不可配置的。

## 选择 -v 或 --mount 标记


The biggest difference is that the -v syntax combines all the options together in one field, while the --mount syntax separates them. Here is a comparison of the syntax for each flag.

最初，`-v` 或 `--volume` 标记用于独立容器，`--mount` 标记用于集群服务。但是，从 Docker 17.06 开始，您还可以将 `--mount` 用于独立容器。通常，`--mount` 标记表达更加明确和冗长。最大的区别是 `-v` 语法将所有选项组合在一个字段中，而 `--mount` 语法将选项分离。下面是每个标记的语法比较。

> 新用户应该尝试 `--mount` 语法，它比 `--volume` 语法更简单。

如果需要指定卷驱动程序选项，则必须使用 `--mount`。

- `-v` 或 `--volume`: 由三个字段组成，以冒号(:)分隔。字段必须按照正确的顺序排列，且每个字段的含义不够直观明显。
  - 对于命名卷，第一个字段是卷的名称，在给定的主机上是惟一的。对于匿名卷，省略第一个字段。
  - 第二个字段是文件或目录在容器中挂载的路径。
  - 第三个字段是可选的，是一个逗号分隔的选项列表，比如 `ro`。这些选项会在下面讨论。(These options are discussed below.)
- `--mount`：由多个键-值对组成，以逗号分隔，每个键-值对由一个 `<key>=<value>` 元组组成。`--mount` 语法比 `-v` 或 `--volume` 更冗长，但是键的顺序并不重要，而且标记的值更容易理解。
  - 挂载的类型（`type`），可以是 `bind`、`volume` 或者 `tmpfs`。本主题讨论卷（volume），因此类型（`type`）始终为卷（`volume`）。
  - 挂载的源（`source`），对于命名卷，这是卷的名称。对于匿名卷，此字段被省略。可以用 `source` 或者 `src` 来指定。
  - 目标（`destination`），将容器中挂载的文件或目录的路径作为其值。可以用 `destination`、`dst` 或者 `target` 来指定。
  - `readonly` 选项（如果存在），则会将绑定挂载以[只读形式挂载到容器](https://docs.docker.com/storage/volumes/#use-a-read-only-volume)中。
  - `volume-opt` 选项，可以被指定多次，接受由选项名及其值组成的键-值对。

> **从外部CSV解析器转义值**
> 
> 如果卷驱动程序接受以逗号分隔的列表作为选项，则必须从外部CSV解析器转义该值。要转义 `volume-opt`, 请使用双引号(")将其括起来，并使用单引号(')将整个挂载参数括起来。例如，本地驱动程序在参数 `o` 中接受以逗号分隔的列表作为挂载选项。下面这个例子展示了转义列表的正确写法。
>  ```bash
>  $ docker service create \
>      --mount 'type=volume,src=<VOLUME-NAME>,dst=<CONTAINER-PATH>,volume-driver=local,volume-opt=type=nfs,volume-opt=device=<nfs-server>:<nfs-path>,"volume-opt=o=addr=<nfs-address>,vers=4,soft,timeo=180,bg,tcp,rw"'
>      --name myservice \
>      <IMAGE>
>  ```
> &nbsp;

The examples below show both the --mount and -v syntax where possible, and --mount is presented first.
下面的示例尽可能展示了 `--mount` 和 `-v` 语法，首先介绍 `--mount`。

### `-v` 和 `--mount` 行为之间的差异

与绑定挂载不同，卷的所有选项对于 `--mount` 和 `-v` 标记都可用。

当卷与服务一起使用时，只有 `--mount` 支持。

## 创建和管理卷

与绑定挂载不同，您可以在任何容器的作用域之外创建和管理卷。

创建一个卷：

```bash
$ docker volume create my-vol
```

卷列表：

```bash
$ docker volume ls
# 输出结果：
local               my-vol
```

检查卷：

```bash
$ docker volume inspect my-vol
# 输出结果：
[
    {
        "Driver": "local",
        "Labels": {},
        "Mountpoint": "/var/lib/docker/volumes/my-vol/_data",
        "Name": "my-vol",
        "Options": {},
        "Scope": "local"
    }
]
```

删除卷：

```bash
$ docker volume rm my-vol
```

## 启动一个带有卷的容器

如果您启动的容器的卷还不存在，Docker 将为您创建这个卷。下面的示例将卷 `myvol2` 挂载到容器中的 `/app/` 中。

下面的 `--mount` 和 `-v` 示例会产生相同的结果。除非在运行第一个示例之后删除了 `devtest` 容器和 `myvol2` 卷，否则不能同时运行它们。

`--mount`：

```bash
$ docker run -d \
  --name devtest \
  --mount source=myvol2,target=/app \
  nginx:latest
```

`-v`：

```bash
$ docker run -d \
  --name devtest \
  -v myvol2:/app \
  nginx:latest
```

使用 `docker inspect devtest` 验证卷的创建和挂载是否正确。查看 Mounts 部分：

```bash
"Mounts": [
    {
        "Type": "volume",
        "Name": "myvol2",
        "Source": "/var/lib/docker/volumes/myvol2/_data",
        "Destination": "/app",
        "Driver": "local",
        "Mode": "",
        "RW": true,
        "Propagation": ""
    }
],
```

这表明挂载是一个卷，它显示了正确的源和目标，并且挂载是可读写的。

停止容器并删除卷。注意删除卷是一个单独的步骤。

```bash
$ docker container stop devtest

$ docker container rm devtest

$ docker volume rm myvol2
```

### 启动带有卷的服务

启动服务并定义卷时，每个服务容器都使用自己的本地卷。 如果使用本地（`local`）卷驱动程序，则没有任何容器可以共享此数据，但某些卷驱动程序确实支持共享存储。Docker for AWS 和Docker for Azure 都支持使用 Cloudstor 插件的持久存储。

下面的示例使用四个副本启动 `nginx` 服务，每个副本使用一个名为 `myvol2` 的本地卷。

```bash
$ docker service create -d \
  --replicas=4 \
  --name devtest-service \
  --mount source=myvol2,target=/app \
  nginx:latest
```

使用 `docker service ps devtest-service` 验证服务是否正在运行：

```bash
$ docker service ps devtest-service

ID                  NAME                IMAGE               NODE                DESIRED STATE       CURRENT STATE            ERROR               PORTS
4d7oz1j85wwn        devtest-service.1   nginx:latest        moby                Running             Running 14 seconds ago
```

删除服务，该服务将停止其所有任务：

```bash
$ docker service rm devtest-service
```

删除服务不会删除该服务创建的任何卷。删除卷是一个单独的步骤。

#### 服务的语法差异

`docker service create` 命令不支持 `-v` 或 `--volume` 标记，在将卷挂载到服务的容器中时，必须使用 `--mount` 标记。

### 使用容器填充卷

如果您启动了一个创建新卷的容器，如上所述，并且该容器在要挂载的目录(例如上面的 `/app/`)中有文件或目录，那么该目录的内容将复制到新卷中。然后容器挂载并使用该卷，使用该卷的其他容器也可以访问预填充的内容。

为了说明这一点，这个例子启动了一个 `nginx` 容器，并用容器的 `/usr/share/nginx/html` 目录中的内容填充新的卷 `nginx-vol`，Nginx 在其中存储默认的 HTML 内容。

下面的 `--mount` 和 `-v` 示例具有相同的最终结果。

`--mount`：

```bash
$ docker run -d \
  --name=nginxtest \
  --mount source=nginx-vol,destination=/usr/share/nginx/html \
  nginx:latest
```

`-v`：

```bash
$ docker run -d \
  --name=nginxtest \
  -v nginx-vol:/usr/share/nginx/html \
  nginx:latest
```

运行两个示例中的任何一个之后，运行以下命令来清理容器和卷。注意：删除卷是一个单独的步骤。

```bash
$ docker container stop nginxtest

$ docker container rm nginxtest

$ docker volume rm nginx-vol
```

## 使用只读卷
















<br/>

> 作者 ： Docker 官网 <br/>
> 译者 ： 技术译民 <br/>
> 出品 ： [技术译站](https://ittranslator.cn/) <br/>
> 链接 ： [英文原文](https://docs.docker.com/storage/volumes/)
