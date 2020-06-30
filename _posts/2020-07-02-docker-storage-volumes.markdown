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
























<br/>

> 作者 ： Docker 官网 <br/>
> 译者 ： 技术译民 <br/>
> 出品 ： [技术译站](https://ittranslator.cn/) <br/>
> 链接 ： [英文原文](https://docs.docker.com/storage/volumes/)
