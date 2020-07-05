---
layout: post
title:  "Docker 基础知识 - 使用绑定挂载(bind mounts)管理应用程序数据"
date:   2020-07-04 17:00:00 +0800
categories: backend docker
published: false
---

绑定挂载（bind mounts）在 Docker 的早期就已经出现了。与卷相比，绑定挂载的功能有限。当您使用绑定挂载时，主机上的文件或目录将挂载到容器中。文件或目录由其在主机上的完整或相对路径引用。相反地，当您使用卷时，在主机上 Docker 的存储目录中创建一个新目录，Docker 管理该目录的内容。

该文件或目录不需要已经存在于 Docker 主机上。如果还不存在，则按需创建。绑定挂载的性能非常好，但它们依赖于主机的文件系统，该文件系统具有特定的可用目录结构。如果您正在开发新的 Docker 应用程序，请考虑改用[命名卷](https://ittranslator.cn/backend/docker/2020/07/04/docker-storage-volumes.html)。不能使用 Docker CLI 命令直接管理绑定挂载。

![docker-types-of-mounts-bind](/assets/images/docker-types-of-mounts-bind.png)

## 选择 -v 或者 --mount 标记

最初，`-v` 或 `--volume` 标记用于独立容器，`--mount` 标记用于集群服务。但是，从 Docker 17.06 开始，您也可以将 `--mount` 用于独立容器。通常，`--mount` 标记表达更加明确和冗长。最大的区别是 `-v` 语法将所有选项组合在一个字段中，而 `--mount` 语法将选项分离。下面是每个标记的语法比较。

> 新用户推荐使用 `--mount` 语法，有经验的用户可能更熟悉 `-v` or `--volume` 语法，但是更鼓励使用 `--mount` 语法，因为研究表明它更易于使用。





















<br/>

> 作者 ： Docker 官网 <br/>
> 译者 ： 技术译民 <br/>
> 出品 ： [技术译站](https://ittranslator.cn/) <br/>
> 链接 ： [英文原文](https://docs.docker.com/storage/bind-mounts/)
