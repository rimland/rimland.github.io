---
layout: post
title:  "Docker 基础知识 - 使用绑定挂载(bind mounts)管理应用程序数据"
date:   2020-07-13 01:00:00 +0800
categories: backend docker
published: true
---

绑定挂载（bind mounts）在 Docker 的早期就已经出现了。与卷相比，绑定挂载的功能有限。当您使用绑定挂载时，主机上的文件或目录将挂载到容器中。文件或目录由其在主机上的完整或相对路径引用。相反地，当您使用卷时，在主机上 Docker 的存储目录中创建一个新目录，Docker 管理该目录的内容。

该文件或目录不需要已经存在于 Docker 主机上。如果还不存在，则按需创建。绑定挂载的性能非常好，但它们依赖于主机的文件系统，该文件系统具有特定的可用目录结构。如果您正在开发新的 Docker 应用程序，请考虑改用[命名卷](https://ittranslator.cn/backend/docker/2020/07/04/docker-storage-volumes.html)。不能使用 Docker CLI 命令直接管理绑定挂载。

![docker-types-of-mounts-bind](/assets/images/docker-types-of-mounts-bind.png)

## 选择 -v 或者 --mount 标记

最初，`-v` 或 `--volume` 标记用于独立容器，`--mount` 标记用于集群服务。但是，从 Docker 17.06 开始，您也可以将 `--mount` 用于独立容器。通常，`--mount` 标记表达更加明确和冗长。最大的区别是 `-v` 语法将所有选项组合在一个字段中，而 `--mount` 语法将选项分离。下面是每个标记的语法比较。

> 新用户推荐使用 `--mount` 语法，有经验的用户可能更熟悉 `-v` or `--volume` 语法，但是更鼓励使用 `--mount` 语法，因为研究表明它更易于使用。



- `-v` 或 `--volume`: 由三个字段组成，以冒号(:)分隔。字段必须按照正确的顺序排列，且每个字段的含义不够直观明显。
  - 对于绑定挂载（bind mounts）, 第一个字段是主机上文件或目录的路径。
  - 第二个字段是容器中文件或目录挂载的路径。
  - 第三个字段是可选的，是一个逗号分隔的选项列表，比如 `ro`、`consistent`、 `delegated`、 `cached`、 `z` 和 `Z`。这些选项会在本文下面讨论。
- `--mount`：由多个键-值对组成，以逗号分隔，每个键-值对由一个 `<key>=<value>` 元组组成。`--mount` 语法比 `-v` 或 `--volume` 更冗长，但是键的顺序并不重要，标记的值也更容易理解。
  - 挂载的类型（`type`），可以是 `bind`、`volume` 或者 `tmpfs`。本主题讨论绑定挂载（bind mounts），因此类型（`type`）始终为绑定挂载（`bind`）。
  - 挂载的源（`source`），对于绑定挂载，这是 Docker 守护进程主机上的文件或目录的路径。可以用 `source` 或者 `src` 来指定。
  - 目标（`destination`），将容器中文件或目录挂载的路径作为其值。可以用 `destination`、`dst` 或者 `target` 来指定。
  - `readonly` 选项（如果存在），则会将绑定挂载以[只读形式挂载到容器](#use-a-read-only-bind-mount)中。
  - `bind-propagation` 选项（如果存在），则更改绑定传播。 可能的值是 `rprivate`、 `private`、 `rshared`、 `shared`、 `rslave` 或 `slave` 之一.
  - [`consistency`](#configure-mount-consistency-for-macos) 选项（如果存在）， 可能的值是 `consistent`、 `delegated` 或 `cached` 之一。 这个设置只适用于 Docker Desktop for Mac，在其他平台上被忽略。
  - `--mount` 标记不支持用于修改 selinux 标签的 `z` 或 `Z`选项。

下面的示例尽可能同时展示 `--mount` 和 `-v` 两种语法，并且先展示 `--mount`。

### `-v` 和 `--mount` 行为之间的差异

由于 `-v` 和 `-volume` 标记长期以来一直是 Docker 的一部分，它们的行为无法改变。这意味着 `-v` 和 `-mount` 之间有一个不同的行为。

如果您使用 `-v` 或 `-volume` 来绑定挂载 Docker 主机上还不存在的文件或目录，则 `-v` 将为您创建它。它总是作为目录创建的。

如果使用 `--mount` 绑定挂载 Docker 主机上还不存在的文件或目录，Docker 不会自动为您创建它，而是产生一个错误。

## 启动带有绑定挂载的容器

考虑这样一个情况：您有一个目录 `source`，当您构建源代码时，工件被保存到另一个目录 `source/target/` 中。您希望工件在容器的 `/app/` 目录可用，并希望每次在开发主机上构建源代码时，容器能访问新的构建。使用以下命令将 `target/` 目录绑定挂载到容器的 `/app/`。在 `source` 目录中运行命令。在 Linux 或 macOS 主机上，`$(pwd)` 子命令扩展到当前工作目录。

下面的 `--mount` 和 `-v` 示例会产生相同的结果。除非在运行第一个示例之后删除了 `devtest` 容器，否则不能同时运行它们。

`--mount`：

```bash
$ docker run -d \
  -it \
  --name devtest \
  --mount type=bind,source="$(pwd)"/target,target=/app \
  nginx:latest
```

`-v`：

```bash
$ docker run -d \
  -it \
  --name devtest \
  -v "$(pwd)"/target:/app \
  nginx:latest
```

使用 `docker inspect devtest` 验证绑定挂载是否被正确创建。查看 `Mounts` 部分：

```bash
"Mounts": [
    {
        "Type": "bind",
        "Source": "/tmp/source/target",
        "Destination": "/app",
        "Mode": "",
        "RW": true,
        "Propagation": "rprivate"
    }
],
```

这表明挂载是一个 `bind` 挂载，它显示了正确的源和目标，也显示了挂载是可读写的，并且传播设置为 `rprivate`。

停止容器：

```bash
$ docker container stop devtest

$ docker container rm devtest
```

### 挂载到容器上的非空目录

如果您将其绑定挂载到容器上的一个非空目录中，则该目录的现有内容会被绑定挂载覆盖。这可能是有益的，例如当您想测试应用程序的新版本而不构建新镜像时。然而，它也可能是令人惊讶的，这种行为不同于 [docker volumes](https://ittranslator.cn/backend/docker/2020/07/04/docker-storage-volumes.html)。

这个例子被设计成极端的，仅仅使用主机上的 `/tmp/` 目录替换容器的 `/usr/` 目录的内容。在大多数情况下，这将导致容器无法正常工作。

`--mount` 和 `-v` 示例有相同的结果。

`--mount`：

```bash
$ docker run -d \
  -it \
  --name broken-container \
  --mount type=bind,source=/tmp,target=/usr \
  nginx:latest

docker: Error response from daemon: oci runtime error: container_linux.go:262:
starting container process caused "exec: \"nginx\": executable file not found in $PATH".
```

`-v`：

```bash
$ docker run -d \
  -it \
  --name broken-container \
  -v /tmp:/usr \
  nginx:latest

docker: Error response from daemon: oci runtime error: container_linux.go:262:
starting container process caused "exec: \"nginx\": executable file not found in $PATH".
```

容器被创建，但没有启动。删除它：

```bash
$ docker container rm broken-container
```

## <span id="use-a-read-only-bind-mount">使用只读绑定挂载</span>

对于一些开发应用程序，容器需要写入绑定挂载，因此更改将传播回 Docker 主机。在其他时候，容器只需要读访问。

这个示例修改了上面的示例，但是通过在容器内的挂载点之后的选项列表（默认为空）中添加 `ro`，将目录挂载为只读绑定挂载。当有多个选项时，使用逗号分隔它们。

`--mount` 和 `-v` 示例有相同的结果。


`--mount`：

```bash
$ docker run -d \
  -it \
  --name devtest \
  --mount type=bind,source="$(pwd)"/target,target=/app,readonly \
  nginx:latest
```

`-v`：

```bash
$ docker run -d \
  -it \
  --name devtest \
  -v "$(pwd)"/target:/app:ro \
  nginx:latest
```

使用 `docker inspect devtest` 验证绑定挂载是否被正确创建。查看 `Mounts` 部分：


```bash
"Mounts": [
    {
        "Type": "bind",
        "Source": "/tmp/source/target",
        "Destination": "/app",
        "Mode": "ro",
        "RW": false,
        "Propagation": "rprivate"
    }
],
```

停止容器：

```bash
$ docker container stop devtest

$ docker container rm devtest
```

## 配置绑定传播

对于绑定挂载和卷，绑定传播默认都是 `rprivate` 。只能为绑定挂载配置，而且只能在 Linux 主机上配置。绑定传播是一个高级主题，许多用户从不需要配置它。

绑定传播是指在给定绑定挂载或命名卷中创建的挂载是否可以传播到该挂载的副本。考虑一个挂载点 `/mnt`，它也挂载在 `/tmp` 上。传播设置控制 `/tmp/a` 上的挂载是否也可以在 `/mnt/a` 上使用。每个传播设置都有一个递归对应点。在递归的情况下，考虑一下 `/tmp/a` 也被挂载为 `/foo`。传播设置控制 `/mnt/a` 和/或 `/tmp/a` 是否存在。

|  传播设置   | 描述  |
|  ----  | ----  |
| shared  | 原始挂载的子挂载公开给副本挂载，副本挂载的子挂载也传播给原始挂载。 |
| slave  | 类似于共享(shared)挂载，但仅在一个方向上。如果原始挂载公开子挂载，副本挂载可以看到它。但是，如果副本挂载公开子挂载，则原始挂载无法看到它。 |
| private  | 该挂载是私有的。原始挂载的子挂载不公开给副本挂载，副本挂载的子挂载也不公开给原始挂载。 |
| rshared  | 与 shared 相同，但传播也扩展到嵌套在任何原始或副本挂载点中的挂载点。 |
| rslave  | 与 slave 相同，但传播也扩展到嵌套在任何原始或副本挂载点中的挂载点。 |
| rprivate  | 默认值。与 private 相同，这意味着原始或副本挂载点中的任何位置的挂载点都不会在任何方向传播。 |

当你在挂载点上设置绑定传播之前，主机文件系统需要已经支持绑定传播。

有关绑定传播的更多信息，请参见 [Linux 内核共享子树文档](https://www.kernel.org/doc/Documentation/filesystems/sharedsubtree.txt)。

下面的示例两次将 `target/` 目录挂载到容器中，第二次挂载设置了 `ro` 选项和 `rslave` 绑定传播选项。

`--mount` 和 `-v` 示例有相同的结果。

`--mount`：

```bash
$ docker run -d \
  -it \
  --name devtest \
  --mount type=bind,source="$(pwd)"/target,target=/app \
  --mount type=bind,source="$(pwd)"/target,target=/app2,readonly,bind-propagation=rslave \
  nginx:latest
```

`-v`：

```bash
$ docker run -d \
  -it \
  --name devtest \
  -v "$(pwd)"/target:/app \
  -v "$(pwd)"/target:/app2:ro,rslave \
  nginx:latest
```

现在，如果您创建 `/app/foo/`， `/app2/foo/` 也存在。

## 配置 selinux 标签

如果使用 `selinux` ，则可以添加 `z` 或 `Z` 选项，以修改挂载到容器中的主机文件或目录的 selinux 标签。这会影响主机上的文件或目录，并且会产生超出 Docker 范围之外的后果。

- `z` 选项表示绑定挂载内容在多个容器之间共享。
- `Z` 选项表示绑定挂载内容是私有的、非共享的。

使用这些选项时要**格外**小心。使用 `Z` 选项绑定挂载系统目录(如 `/home` 或 `/usr` )会导致您的主机无法操作，您可能需要重新手动标记主机文件。
Important: When using bind mounts with services, selinux labels (:Z and :z), as well as :ro are ignored. See moby/moby #32579 for details.

> 重要提示：当对服务使用绑定挂载时，selinux 标签(`:Z` 和 `:Z`) 以及 `:ro` 将被忽略。详情请参阅 [moby/moby #32579](https://github.com/moby/moby/issues/32579)。

这个示例设置了 `z` 选项来指定多个容器可以共享绑定挂载的内容：

无法使用 `--mount ` 标记修改 selinux 标签。

```bash
$ docker run -d \
  -it \
  --name devtest \
  -v "$(pwd)"/target:/app:z \
  nginx:latest
```

## <span id="configure-mount-consistency-for-macos">为 macOS 配置挂载一致性</span>

Docker Desktop for Mac 使用 `osxfs` 将从 macOS 共享的目录和文件传播到 Linux VM。这种传播使运行在 Docker Desktop for Mac 上的 Docker 容器可以使用这些目录和文件。

默认情况下，这些共享是完全一致的，这意味着每次在 macOS 主机上或通过容器中的挂载发生写操作时，更改都会刷新到磁盘上，以便共享中的所有参与者都拥有完全一致的视图。在某些情况下，完全一致性会严重影响性能。Docker 17.05及更高版本引入了一些选项，在每个挂载、每个容器的基础上调整一致性设置。以下选项可供选择：

- `consistent` 或 `default`: 完全一致性的默认设置，如上所述。
- `delegated`: 容器运行时的挂载视图是权威的。在容器中所做的更新，在主机上可见之前，可能会有延迟。
- `cached`: macOS 主机的挂载视图是权威的。在主机上所做的更新，在容器中可见之前，可能会有延迟。

这些选项在除 macOS 之外的所有主机操作系统上都被完全忽略。

`--mount` 和 `-v` 示例有相同的结果。

`--mount`：

```bash
$ docker run -d \
  -it \
  --name devtest \
  --mount type=bind,source="$(pwd)"/target,destination=/app,consistency=cached \
  nginx:latest
```

`-v`：

```bash
$ docker run -d \
  -it \
  --name devtest \
  -v "$(pwd)"/target:/app:cached \
  nginx:latest
```

<br/>

> 作者 ： Docker 官网 <br/>
> 译者 ： 技术译民 <br/>
> 出品 ： [技术译站](https://ittranslator.cn/) <br/>
> 链接 ： [英文原文](https://docs.docker.com/storage/bind-mounts/)
