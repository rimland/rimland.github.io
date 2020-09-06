---
layout: post
title:  "将微服务部署到 Azure Kubernetes 服务 (AKS) 实践"
date:   2020-09-07 00:10:00 +0800
categories: dotnet csharp
published: true
---

## 介绍

本文的目的是：通过使用 DockerHub 和 Azure Kubernetes Service (AKS) 将之前 [使用 .NET 和 Docker 构建的微服务](https://ittranslator.cn/dotnet/csharp/2020/08/31/aspnet-microservice-tutorial.html) 部署到微软 Azure 云上，来介绍微服务的基本部署过程。

## 推送到 Docker Hub

Docker Hub 是世界上最大的容器镜像库和社区。许多产品，包括微软 Azure，都可以基于 Docker Hub 中的镜像创建容器。

### 登录 Docker Hub

> 如果还没有 Docker Hub 账号，可以到 [https://hub.docker.com/](https://hub.docker.com/) 注册一个， 注册步骤可以参考 [Docker 快速入门（三）](https://ittranslator.cn/backend/docker/2020/06/24/quickstart-3.html) 中的说明。

在命令提示符窗口，运行以下命令：

```bash
docker login
```

输入您的 **Docker ID** 和密码，如果输出如下错误：

```bash
Login with your Docker ID to push and pull images from Docker Hub. If you don't have a Docker ID, head over to https://hub.docker.com to create one.
Username:xxxxxx
Password:
Error response from daemon: Get https://registry-1.docker.io/v2/: net/http: TLS handshake timeout
```

表示登录超时，可以尝试设置首选 DNS 服务器为 `8.8.8.8`（Google 提供的免费 DNS），命令行修改 DNS 的命令为：

```bash
# 使用时请将 "WLAN" 改为实际的本地链接名称，需要以管理员身份运行命令提示符窗口
netsh interface ip set dnsservers "WLAN" static 8.8.8.8 primary
```

然后再次登录，若输出 `Login Succeeded`，表示登录成功了。


### 将镜像推送到 Docker Hub

根据您的 Docker ID 重新标记（重命名）您的 Docker 镜像，并使用以下命令将其推送到 Docker Hub：

```bash
docker tag mymicroservice [YOUR DOCKER ID]/mymicroservice
docker push [YOUR DOCKER ID]/mymicroservice
```

等待推送完成，在 Docker Hub 中访问您的仓库 [https://hub.docker.com/repositories](https://hub.docker.com/repositories)，可以看到刚推送的镜像，如下图：

![docker-hub-mymicroservice](/assets/images/202009/docker-hub-mymicroservice.png)

镜像完成推送后，如果前面有修改过 DNS，务必将 DNS 地址改回原来的动态获取，不然可能会影响网络访问速度：

```bash
# 使用时请将 "WLAN" 改为实际的本地连接名称，需要以管理员身份运行命令提示符窗口

# 改为动态获取 DNS 地址
netsh interface ip set dnsservers "WLAN" source=dhcp

# 或者将 DNS 改为 114.114.114.114（国内移动、电信和联通通用的DNS）
netsh interface ip set dnsservers "WLAN" static 114.114.114.114 primary
# 还可以添加第二个 DNS 地址
netsh interface ip add dnsservers "WLAN" 8.8.8.8 index=2
```

## 安装 Azure 工具

### 创建 Azure 账户

如果您是 Azure 云的新手，您可以创建一个免费帐户。如果您有一个现有的帐户，您可以跳过这一步。

创建账户的步骤，请查看 『[创建免费 Azure 账户](https://azure.microsoft.com/free/dotnet/?utm_source=dotnet-website&utm_medium=page&utm_campaign=dotnet-banner)』

> 注册时需要填写姓名、邮箱、手机号、信用卡等一些个人信息，注册成功后扣除了 $1，然后赠送了 $200 一个月的信用额度供免费试用。

### 安装 Azure CLI

Azure Command Line Interface（CLI）提供了用于管理 Azure 帐户的工具。

安装 Azure CLI 的步骤，请查看 『[安装 Azure CLI for Windows](https://docs.microsoft.com/cli/azure/install-azure-cli-windows?view=azure-cli-latest)』

> 如果从官网下载 Azure CLI 比较慢，可以到这里下载：<br/>
> 链接：[https://pan.baidu.com/s/1FZhkAFX2o4GRCqSWYmYvmA](https://pan.baidu.com/s/1FZhkAFX2o4GRCqSWYmYvmA) 提取码：fi8x

安装完成后，打开一个**新的**命令提示符窗口，运行 `az --version` 命令检验是否安装成功。

### 登录 Azure

在命令提示符中运行 `az login` 命令登录您的 Azure 账户：

```bash
C:\WINDOWS\system32>az login
# 会提示弹出一个登录网页，登录成功后输出如下信息：
You have logged in. Now let us find all the subscriptions to which you have access...
[
  {
    "cloudName": "AzureCloud",
    "homeTenantId": "7cfff80b-cb8f-461f-8bb4-19bd80xxxxxx",
    "id": "0123237e-4c5e-4eb5-a4cc-205b0cxxxxxx",
    "isDefault": true,
    "managedByTenants": [],
    "name": "免费试用",
    "state": "Enabled",
    "tenantId": "7cfff80b-cb8f-461f-8bb4-19bd80xxxxxx",
    "user": {
      "name": "xxxxxx@163.com",
      "type": "user"
    }
  }
]
```

### 安装 AKS CLI 失败！使用线上 Azure Cloud Shell 替代

[`Kubernetes`](https://kubernetes.io/) 是一个容器编排平台。编排器负责运行、分发、缩放和修复由容器集合组成的应用程序。`Azure Kubernetes Service` (`AKS`) 将 `Kubernetes` 作为一个托管服务提供。

运行以下命令为 AKS 安装命令行工具。

```bash
az aks install-cli
```

> 然而，这条命令重试了很多次始终因网络问题而执行失败，最后放弃在本机安装 AKS CLI，直接使用线上 Azure Cloud Shell，关于 Azure Cloud Shell 请参考文档：[https://docs.microsoft.com/en-us/azure/cloud-shell/overview](https://docs.microsoft.com/en-us/azure/cloud-shell/overview)

在 Azure Portal 中打开 Azure Cloud Shell 的方法是：
![Azure Cloud Shell](/assets/images/202009/portal-azure-cloud-shell.png)

## 创建 Azure 资源

### 创建资源组

资源组是用于组织与单个应用程序相关的一组资源。

在本机命令提示符窗口中运行下面命令创建一个资源组：

```bash
az group create --name myMicroserviceResources --location eastasia
```

执行结果如下：

```bash
C:\Users\xxx>az group create --name myMicroserviceResources --location eastasia
{
  "id": "/subscriptions/0123237e-4c5e-4eb5-a4cc-205b0cxxxxxx/resourceGroups/myMicroserviceResources",
  "location": "eastasia",
  "managedBy": null,
  "name": "myMicroserviceResources",
  "properties": {
    "provisioningState": "Succeeded"
  },
  "tags": null,
  "type": "Microsoft.Resources/resourceGroups"
}
```
执行完，在 Azure Portal 中点击 “Resource groups” 查看：
![portal-azure-resource-groups](/assets/images/202009/portal-azure-resource-groups.png)

### 使用 Azure Cloud Shell 创建 AKS 集群

使用 Azure Cloud Shell 运行下面命令在资源组中创建一个 AKS 集群：

> 此命令通常需要等待几分钟才能完成。

```bash
az aks create --resource-group myMicroserviceResources --name myMicroserviceCluster --node-count 1 --enable-addons http_application_routing --generate-ssh-keys
```

执行完成后，查看资源组列表，可以看到多了一个 AKS 集群资源组和一个网络观察资源组：

![portal-azure-resource-groups-aks](/assets/images/202009/portal-azure-resource-groups-aks.png)

使用 Azure Cloud Shell 运行以下命令下载要部署到 AKS 集群的凭证：

```bash
az aks get-credentials --resource-group myMicroserviceResources --name myMicroserviceCluster
```

## 部署到 Azure

与 Kubernetes 一样，AKS 使用 `.yaml` 文件来定义如何部署容器。

### 使用 Azure Cloud Shell 创建部署文件

![azure-cloud-shell-vim-yaml](/assets/images/202009/azure-cloud-shell-vim-yaml.png)

在 Azure Portal 中打开 Azure Cloud Shell 窗口， 运行 `cd clouddrive` 命令打开 `clouddrive` 目录， 

运行下面的命令创建一个空的 `deploy-myMicroservice.yaml` 文件：

```bash
echo . > deploy-myMicroservice.yaml
```

然后运行 `vim deploy-myMicroservice.yaml` 命令编辑 `deploy-myMicroservice.yaml` 文件，将内容替换为以下内容：

```yaml
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mymicroservice
spec:
  replicas: 1
  template:
    metadata:
      labels:
        app: mymicroservice
    spec:
      containers:
      - name: mymicroservice
        image: [YOUR DOCKER ID]/mymicroservice:latest
        ports:
        - containerPort: 80
        env:
        - name: ASPNETCORE_URLS
          value: http://*:80
  selector:
    matchLabels:
      app: mymicroservice
---
apiVersion: v1
kind: Service
metadata:
  name: mymicroservice
spec:
  type: LoadBalancer
  ports:
  - port: 80
  selector:
    app: mymicroservice
```

按 `Esc` 键再输入 `:wq` 保存并退出 `vim` 命令。

此时打开 “cloud-shell-storage-southeastasia” 资源组，可以看到里面多了一个 `deploy-myMicroservice.yaml` 文件，如图：

![cloud-shell-storage-file](/assets/images/202009/cloud-shell-storage-file.png)

### 运行部署

在 Azure Cloud Shell 中定位到 `clouddrive` 目录，运行下面的命令，根据 `deploy-helloMicroservice.yaml` 中的设置进行部署：

```bash
kubectl apply -f deploy-myMicroservice.yaml
```

### 测试已部署的服务

在 Azure Cloud Shell 中运行以下命令查看已部署服务的详细信息：

```bash
kubectl get service mymicroservice --watch
```

![azure-cloud-shell-kubectl-apply](/assets/images/202009/azure-cloud-shell-kubectl-apply.png)

另外，前面的 `kubectl get service` 命令会显示服务可用的外部 IP 地址（`EXTERNAL-IP`）。

使用这个外部 IP 地址，在浏览器中浏览『`http://[YOUR EXTERNAL IP ADDRESS]/WeatherForecast`』。

> 如果 `EXTERNAL-IP` 标记为 `<pending>`，则在分配了外部 IP 之后，将会自动出现一个新行来显示。

<!-- 用真实的外部 IP `20.189.127.75` 替换 URL http://20.189.127.75/WeatherForecast -->


## 服务缩放

运行以下命令将服务扩展到两个实例：

```bash
kubectl scale --replicas=2 deployment/mymicroservice
# 输出如下信息：
deployment.apps/mymicroservice scaled
```

Good Job！现在已将微服务部署到 Azure，并进行了缩放。

## 总结

操作体验：Docker Hub，慢！Azure，慢！ 一顿操作猛如虎，步履蹒跚慢如牛，而且还是只蜗牛。

可以用 [Azure 容器注册表](https://azure.microsoft.com/zh-cn/services/container-registry/) 替代 Docker Hub 管理镜像。

Azure 虽好，但在国内使用，网络问题难以解决，大大影响使用感受！

在微服务和 DevOps 普及的时代，越来越多的大厂服务商提供了对 Kubernetes 的支持，Azure 的 “Azure Kubernetes 服务 (AKS) ”和“Azure 容器注册表”，国内有阿里云的“阿里云容器服务 Kubernetes 版（ACK）”和“阿里云容器镜像服务（ACR）” 对标，另外腾讯云和华为云也提供了云容器引擎服务。

## 参考文献及一些相关产品和文档
- [Azure](https://azure.microsoft.com/)
- [Deploy a microservice to Azure](https://dotnet.microsoft.com/learn/aspnet/deploy-microservice-tutorial/intro)
- [在 Windows 上安装 Azure CLI](https://docs.microsoft.com/zh-cn/cli/azure/install-azure-cli-windows?view=azure-cli-latest&tabs=azure-cli)
- [Azure CLI 入门](https://docs.microsoft.com/zh-cn/cli/azure/get-started-with-azure-cli?view=azure-cli-latest)
- [Overview of Azure Cloud Shell](https://docs.microsoft.com/en-us/azure/cloud-shell/overview)
- [Azure Kubernetes 服务 (AKS) 文档](https://docs.microsoft.com/zh-cn/azure/aks/)
- [Azure Kubernetes 服务 (AKS) 的 Kubernetes 核心概念](https://docs.microsoft.com/zh-cn/azure/aks/concepts-clusters-workloads)
- [Azure 容器注册表](https://azure.microsoft.com/zh-cn/services/container-registry/)

- [阿里云容器服务 Kubernetes 版 ACK（Alibaba Cloud Container Service for Kubernetes）](https://www.aliyun.com/product/kubernetes)
- [阿里云容器镜像服务 ACR（Alibaba Cloud Container Registry）](https://www.aliyun.com/product/acr)，即：阿里云容器注册表，这个产品目前我们正在使用，pull push 速度都是比较快的，国内还是用这个速度快点。

<br/>
上一篇：[编写第一个 .NET 微服务](/dotnet/csharp/2020/08/31/aspnet-microservice-tutorial.html)

<br/>

> 作者 ： 技术译民 <br/>
> 出品 ： [技术译站](https://ITTranslator.cn/)