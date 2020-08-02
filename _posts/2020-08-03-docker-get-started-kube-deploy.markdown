---
layout: post
title:  "Docker 基础知识 - 在生产环境中运行您的应用 - 编排(Orchestration) - 部署到 Kubernetes"
date:   2020-08-03 01:30:00 +0800
categories: backend docker
published: true
comments: true
---


## 前提条件

- 下载并安装 Docker Desktop，详见[情况介绍和安装](/backend/docker/2020/06/19/quickstart-1.html)。
- 在[第二部分](/backend/docker/2020/06/21/quickstart-2.html)中完成应用程序的容器化。
- 在您的 Docker Desktop 中确保 Kubernetes 是启用的：
  - **Mac**：点击菜单栏中的 Docker 图标，导航到 **Preferences**，确保“Kubernetes”旁边有绿灯。
  - **Windows**：点击系统托盘中的 Docker 图标，导航到 **Settings**，确保“Kubernetes”旁边有绿灯。
  如果 Kubernetes 没有运行， 请按照本教程[编排(Orchestration)概述](/backend/docker/2020/07/27/docker-get-started-orchestration.html)中的说明完成设置。

## 介绍

既然我们已经演示了应用程序的各个组件作为独立容器运行，那么现在就可以安排它们由类似 Kubernetes 的编排器管理了。Kubernetes 提供了许多扩展、联网、保护和维护您的容器化应用程序的工具，这些工具超出了容器本身的能力。

为了验证我们的容器化应用程序能否在 Kubernetes 上很好地工作，我们将在开发机上使用 Docker Desktop 内置的 Kubernetes 环境来部署我们的应用程序，然后将其移交到生产环境中一个完整的 Kubernetes 集群上运行。Docker Desktop 创建的 Kubernetes 环境功能齐全，这意味着它拥有您的应用程序将在真实集群上享受到的所有 Kubernetes 功能，可以通过您的开发机方便地访问。

## 使用 Kubernetes YAML 描述应用程序

Kubernetes 中的所有容器都被安排为 *pods*，即共享一些资源的位于同一位置的容器组。此外，在实际的应用程序中，我们几乎从不创建单独的 pods;相反，我们的大部分工作负载被安排为*部署(deployments)*，部署是由 Kubernetes 自动维护的可扩展的 pods 组。最后，所有 Kubernetes 对象都可以并且应该在名为 *Kubernetes YAML* 文件的清单中进行描述。这些 YAML 文件描述了 Kubernetes 应用程序的所有组件和配置，可用于在任何 Kubernetes 环境中轻松地创建和销毁应用程序。

1. 您已经在本教程的[编排(Orchestration)概述](/backend/docker/2020/07/27/docker-get-started-orchestration.html)部分中编写了一个非常基本的 Kubernetes YAML 文件。现在，让我们编写一个稍微复杂一点的 YAML 文件来运行和管理我们的公告栏应用程序。将下面的内容放到一个名为 `bb.yaml` 的文件中：

    ```yaml
    apiVersion: apps/v1
    kind: Deployment
    metadata:
        name: bb-demo
        namespace: default
    spec:
        replicas: 1
        selector:
            matchLabels:
                bb: web
        template:
            metadata:
                labels:
                    bb: web
            spec:
                containers:
                -   name: bb-site
                    image: bulletinboard:1.0
    ---
    apiVersion: v1
    kind: Service
    metadata:
        name: bb-entrypoint
        namespace: default
    spec:
        type: NodePort
        selector:
            bb: web
        ports:
        -   port: 8080
            targetPort: 8080
            nodePort: 30001
    ```

    在此 Kubernetes YAML 文件中，有两个对象，以 `---` 分隔：
    - 一个 `部署(Deployment)`，描述一个可扩展的相同 pods 组。在本例中，您只会得到一个 `副本(replica)`，即您的 pod 的副本，并且该 pod(在 `template:` 键下描述) 中只有一个容器，这个容器基于本教程[前一步骤](/backend/docker/2020/06/21/quickstart-2.html)中的 `bulletinboard:1.0` 镜像。
    - 一个 `NodePort` 服务，它将流量从您的主机上的 30001 端口转发到它所路由到的 pods 内的 8080 端口，允许您从网络到达您的公告栏应用。

    另外，请注意，虽然 Kubernetes YAML 一开始可能看起来又长又复杂，但它几乎总是遵循相同的模式：
    - `apiVersion`，表明解析该对象的 Kubernetes API
    - `kind`，表明这是什么类型的对象
    - `metadata`，将名字之类的东西应用到对象上
    - `spec`，指定对象的所有参数和配置

## 部署并检查应用程序

1. 在终端中，导航到您创建 `bb.yaml` 的位置，并将应用程序部署到 Kubernetes：
   
   ```bash
   kubectl apply -f bb.yaml
   ```

   您将看到如下所示的输出，表明 Kubernetes 对象已成功创建：

   ```bash
   deployment.apps/bb-demo created
   service/bb-entrypoint created
   ```

2. 通过列出部署确保一切正常：

   ```bash
   kubectl get deployments
   ```

   如果一切顺利，您的部署应列出如下：

   ```bash
   NAME      DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
   bb-demo   1         1         1            1           48s
   ```

   这表示您在 YAML 中请求的“所有”一个 pod 已启动并运行。对您的服务进行同样的检查：

   ```bash
   kubectl get services

   NAME            TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)          AGE
   bb-entrypoint   NodePort    10.106.145.116   <none>        8080:30001/TCP   53s
   kubernetes      ClusterIP   10.96.0.1        <none>        443/TCP          138d
   ```

   除了默认的 `kubernetes` 服务之外，我们还看到 `bb-entrypoint` 服务，它接受端口 30001/TCP 上的流量。

3. 打开浏览器并访问您的公告栏 `localhost:30001`; 您将看到您的公告栏，就像我们在 Docker 快速入门的[第二部分](/backend/docker/2020/06/21/quickstart-2.html)中将其作为独立容器运行时一样。 
4. 一旦满意，请拆除您的应用程序：
    
   ```bash
   kubectl get deployments
   ``` 

## 结论

至此，我们已经成功地使用 Docker Desktop 将我们的应用程序部署到开发机上功能齐全的 Kubernetes 环境中。我们还没有对 Kubernetes 做太多的工作，但是现在大门已经打开了;
我们还没有对 Kubernetes 做太多的工作，但是大门已经打开了;您可以开始在您的应用程序中添加其他组件，并利用 Kubernetes 的所有特性和功能，就在您自己的机器上。

除了部署到 Kubernetes 之外，我们还将应用程序描述为 Kubernetes YAML 文件。这个简单的文本文件包含我们需要创建的我们的应用程序在运行状态下所需的一切内容。我们可以将其签入版本控制并与同事共享，从而使我们能够轻松地将应用程序分发到其他集群（比如开发环境之后可能出现的测试和生产集群）。

## Kubernetes 参考文献

本文中使用的所有新 Kubernetes 对象的进一步文档请参看：

- [Kubernetes Pods](https://kubernetes.io/docs/concepts/workloads/pods/pod/)
- [Kubernetes Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [Kubernetes Services](https://kubernetes.io/docs/concepts/services-networking/service/)


Kubernetes 中文文档：[https://kubernetes.io/zh/docs/home/](https://kubernetes.io/zh/docs/home/)

<br/>

> 作者 ： Docker 官网 <br/>
> 译者 ： 技术译民 <br/>
> 出品 ： [技术译站](https://ittranslator.cn/) <br/>
> 链接 ： [英文原文](https://docs.docker.com/get-started/kube-deploy/)
