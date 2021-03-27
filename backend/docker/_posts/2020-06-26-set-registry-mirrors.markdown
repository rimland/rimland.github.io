---
layout: post
title:  "为 Docker 配置镜像加速器（解决 TLS handshake timeout 问题）"
date:   2020-06-26 03:00:00 +0800
categories: backend docker
published: true
---

## 问题
当我们下载并安装完 [Docker Desktop for Windows](https://docs.docker.com/docker-for-windows/install/)，运行 [Docker 快速入门（一）- 情况介绍和安装](https://ittranslator.cn/backend/docker/2020/06/19/quickstart-1.html) 中的示例命令 `docker run hello-world` 时，可能会遇到如下的问题：


```powershell
PS C:\Users\Rimland> docker --version
Docker version 19.03.8, build afacb8b

PS C:\Users\Rimland> docker run hello-world
Unable to find image 'hello-world:latest' locally
C:\Program Files\Docker\Docker\resources\bin\docker.exe: Error response from daemon: Get https://registry-1.docker.io/v2/library/hello-world/manifests/latest: net/http: TLS handshake timeout.
See 'C:\Program Files\Docker\Docker\resources\bin\docker.exe run --help'.
```

![docker-registry-timeout](/assets/images/earlier/docker-registry-timeout.png)

## 原因

这是因为默认情况下 Docker 被配置为在 [Docker Hub](https://hub.docker.com/repositories) 上寻找镜像，Docker Hub 是一个任何人都可以使用的公共注册表，服务器远在海外，导致请求超时。

## 解决方案

配置镜像加速器，以提升获取 Docker 官方镜像的速度。

镜像加速器有很多，我们使用阿里云的加速器来设置，操作步骤如下：

1. 打开阿里云 [容器镜像服务 ACR](https://www.aliyun.com/product/acr) 
2. 点击“管理控制台”，登录阿里云账号（如果没有账号，需先注册一个）。
3. 左侧菜单导航到“镜像中心” --> "镜像加速器"，可以看到加速器地址及操作文档（有针对 Ubuntu、CentOS、Mac、Windows 各系统的操作文档）。

针对安装了 Docker Desktop for Windows 的用户，可以参考以下配置步骤：

在系统右下角 Docker 托盘图标右键弹出菜单选择 Settings，打开配置窗口后左侧导航菜单选择 Docker Engine。编辑窗口内的JSON串，填写下方加速器地址：

```json
{
  "registry-mirrors": ["https://mkts104l.mirror.aliyuncs.com"]
}
```

如图：

![docker-registry-mirrors](/assets/images/earlier/docker-registry-mirrors.png)

编辑完成后点击 `Apply & Restart` 按钮，等待 Docker 重启并应用配置的镜像加速器。

再次运行命令 `docker run hello-world` 检查，已经运行正常了：

![docker-registry-ok](/assets/images/earlier/docker-registry-ok.png)


<br/>

> 作者 ： 技术译民 <br/>
> 出品 ： [技术译站](https://ittranslator.cn/) <br/>

