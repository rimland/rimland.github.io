---
layout: post
title:  "Docker 基础知识 - 使用 tmpfs 挂载(tmpfs mounts)管理应用程序数据"
date:   2020-07-20 01:30:00 +0800
categories: backend docker
published: true

---

[卷（volumes）](https://ittranslator.cn/backend/docker/2020/07/04/docker-storage-volumes.html) 和 [绑定挂载（bind mounts）](https://ittranslator.cn/backend/docker/2020/07/13/docker-storage-bind-mounts.html) 允许您在主机和容器之间共享文件，这样即使在容器停止后也可以持久存储数据。

如果在 Linux 上运行 Docker，那么还有第三种选择：`tmpfs` 挂载。当您创建带有 `tmpfs` 挂载的容器时，容器可以在容器的可写层之外创建文件。

与卷和绑定挂载不同，`tmpfs` 挂载是临时的，只存留在主机内存中。当容器停止时，`tmpfs` 挂载将被删除，在那里写入的文件不会被持久化。

![docker-types-of-mounts-tmpfs](/assets/images/docker-types-of-mounts-tmpfs.png)

这对于临时存储您不想在主机或容器可写层中持久存储的敏感文件非常有用。

## tmpfs 挂载的局限性

- 不同于卷和绑定挂载，不能在容器之间共享 `tmpfs` 挂载。
- 这个功能只有在 Linux 上运行 Docker  时才可用。

## 选择 `--tmpfs` 或 `--mount` 标记

最初，`--tmpfs` 标记用于独立容器，`--mount` 标记用于集群服务。但是从 Docker 17.06 开始，您还可以将 `--mount` 与独立容器一起使用。通常，`--mount` 标记表达更加明确和冗长。最大的区别是，`--tmpfs` 标记不支持任何可配置的选项。

- `--tmpfs`: 设置 `tmpfs` 挂载不允许您指定任何可配置选项，并且只能与独立容器一起使用。
- `--mount`：由多个键-值对组成，，每个键-值对由一个 `<key>=<value>` 元组组成。`--mount` 语法比 `--tmpfs` 更冗长：
  - 挂载的类型（`type`），可以是 `bind`、`volume` 或者 `tmpfs`。本主题讨论 `tmpfs`，因此类型（`type`）始终为 `tmpfs`。
  - 目标（`destination`），将容器中 `tmpfs` 挂载设置的路径作为其值。可以用 `destination`、`dst` 或者 `target` 来指定。
  - `tmpfs-size` 和 `tmpfs-mode` 选项。请查看下文的 [指定 tmpfs 选项](#specify-tmpfs-options)。

下面的示例尽可能同时展示 `--mount` 和 `--tmpfs` 两种语法，并且先展示 `--mount`。

### `--tmpfs` 和 `--mount` 行为之间的差异

- `--tmpfs` 标记不允许指定任何可配置选项。
- `--tmpfs` 标记不能用于集群服务。对于集群服务，您必须使用 `--mount`。

## 在容器中使用 tmpfs 挂载

要在容器中使用 `tmpfs` 挂载， 请使用 `--tmpfs` 标记, 或者使用带有 `type=tmpfs` 和 `destination` 选项的 `--mount` 标记。没有用于 `tmpfs` 挂载的源(`source`)。 

下面的示例在 Nginx 容器中的 `/app` 创建一个 `tmpfs` 挂载。第一个例子使用 `--mount` 标记，第二个使用 `--tmpfs` 标记。

`--mount`：

```bash
$ docker run -d \
  -it \
  --name tmptest \
  --mount type=tmpfs,destination=/app \
  nginx:latest
```

`--tmpfs`：

```bash
$ docker run -d \
  -it \
  --name tmptest \
  --tmpfs /app \
  nginx:latest
```

通过运行 `docker container inspect tmptest` 来验证挂载是否是 `tmpfs` 挂载，查看 `Mounts` 部分：

```bash
"Tmpfs": {
    "/app": ""
},
```

删除容器：

```bash
$ docker container stop tmptest

$ docker container rm tmptest
```

### <span id="specify-tmpfs-options">指定 tmpfs 选项</span>

`tmpfs` 挂载允许两个配置选项，两个选项都不是必需的。 如果需要指定这些选项，则必须使用 `--mount` 标记，因为 `--tmpfs` 标记不支持。

| 选项       | 描述                                                         |
| :--------- | :----------------------------------------------------------- |
| `tmpfs-size` | tmpfs 挂载的大小（以字节为单位）。默认无限制。                |
| `tmpfs-mode` | tmpfs 的八进制文件模式。例如，`700` 或 `0770`。默认为 `1777` 或全局可写。 |


下面的示例将 `tmpfs-mode` 设置为 `1770`，因此在容器中它不是全局可读的。

```bash
docker run -d \
  -it \
  --name tmptest \
  --mount type=tmpfs,destination=/app,tmpfs-mode=1770 \
  nginx:latest
```

<br/>

> 作者 ： Docker 官网 <br/>
> 译者 ： 技术译民 <br/>
> 出品 ： [技术译站](https://ittranslator.cn/) <br/>
> 链接 ： [英文原文](https://docs.docker.com/storage/tmpfs/)
