---
layout: post
title:  "Docker 基础知识 - 在生产环境中运行您的应用 - 编排(Orchestration) - 部署到 Kubernetes"
date:   2020-07-31 01:30:00 +0800
categories: backend docker
published: false
---


## 前提条件

- 下载并安装 Docker Desktop，详见[情况介绍和安装](/backend/docker/2020/06/19/quickstart-1.html)。
- 在[第二部分](/backend/docker/2020/06/21/quickstart-2.html)中完成应用程序的容器化。
- 在您的 Docker Desktop 中确保 Kubernetes 是启用的：
  - **Mac**：点击菜单栏中的 Docker 图标，导航到 **Preferences**，确保“Kubernetes”旁边有绿灯。
  - **Windows**：点击系统托盘中的 Docker 图标，导航到 **Settings**，确保“Kubernetes”旁边有绿灯。
  如果 Kubernetes 没有运行， 请按照本教程[编排(Orchestration)](/backend/docker/2020/07/27/docker-get-started-orchestration.html)中的说明完成设置。

## 介绍

既然我们已经演示了应用程序的各个组件作为独立容器运行，那么现在就可以安排它们由类似 Kubernetes 的编排器管理了。Kubernetes 提供了许多扩展、联网、保护和维护您的容器化应用程序的工具，这些工具超出了容器本身的能力。

为了验证我们的容器化应用程序能否在 Kubernetes 上很好地工作，我们将在开发机上使用 Docker Desktop 内置的 Kubernetes 环境来部署我们的应用程序，然后将其移交到生产环境中一个完整的 Kubernetes 集群上运行。Docker Desktop 创建的 Kubernetes 环境功能齐全，这意味着它拥有您的应用程序将在真实集群上享受到的所有 Kubernetes 功能，可以通过您的开发机方便地访问。

## 使用 Kubernetes YAML 描述应用程序

Kubernetes 中的所有容器都被安排为 pods，即共享一些资源的位于同一位置的容器组。此外，在实际的应用程序中，我们几乎从不创建单独的pods;相反，我们的大部分工作负载被安排为部署，部署是由 Kubernetes 自动维护的可伸缩的 pods 组。最后，所有 Kubernetes 对象都可以并且应该在名为 *Kubernetes YAML* 文件的清单中进行描述。这些 YAML 文件描述了 Kubernetes 应用程序的所有组件和配置，可用于在任何 Kubernetes 环境中轻松地创建和销毁应用程序。

You already wrote a very basic Kubernetes YAML file in the Orchestration overview part of this tutorial. Now, let’s write a slightly more sophisticated YAML file to run and manage our bulletin board. Place the following in a file called `bb.yaml`:

1. 您已经在本教程的[编排(Orchestration)概述](https://ittranslator.cn/backend/docker/2020/07/27/docker-get-started-orchestration.html)部分中编写了一个非常基本的 Kubernetes YAML 文件。现在，让我们编写一个稍微复杂一点的 YAML 文件来运行和管理我们的公告栏应用程序。将下面的内容放到一个名为 `bb.yaml` 的文件中：

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
    - 一个 `部署(Deployment)`，描述一个可扩展的相同 pods 组。在本例中，您只会得到一个 `副本(replica)`，即您的 pod 的副本，并且该 pod(在 `template:` 键下描述) 中只有一个容器，这个容器基于本教程前一步骤中的 `bulletinboard:1.0` 镜像。
    - 一个 `NodePort` 服务，它将流量从您的主机上的 30001 端口路由到它所路由到的 pods 内的 8080 端口，允许您从网络到达您的公告栏应用。

    另外，请注意，虽然 Kubernetes YAML 一开始可能看起来又长又复杂，但它几乎总是遵循相同的模式:
    - `apiVersion`，表明解析该对象的 Kubernetes API
    - `kind`，表明这是什么类型的对象
    - `metadata`，将名字之类的东西应用到对象上
    - `spec`，指定对象的所有参数和配置。

































---

---


容器化流程的可移植性和可再现性意味着我们有机会跨云和数据中心移动和扩展我们的容器化应用程序。容器有效地保证了这些应用程序在任何地方都以相同的方式运行，从而使我们能够快速、轻松地利用所有这些环境。此外，随着应用程序规模的扩大，我们需要一些工具来帮助自动化这些应用程序的维护，能够自动替换失败的容器，并在这些容器的生命周期中管理更新和配置的上线。

管理、扩展和维护容器化应用程序的工具称为编排器，其中最常见的例子是 *Kubernetes* 和 *Docker Swarm*。这两种编排器的开发环境部署都由 Docker Desktop 提供，我们将在本指南中使用它来创建我们的第一个编排的容器化应用程序。

高级模块教你如何：

1. [在您的开发机上设置和使用 Kubernetes 环境](https://docs.docker.com/get-started/kube-deploy/)
2. [在您的开发机器上设置和使用 Swarm 环境](https://docs.docker.com/get-started/swarm-deploy/)

## 启用 Kubernetes

Docker Desktop 将为您快速轻松地设置 Kubernetes。按照适用于您的操作系统的设置和验证说明进行操作：

### Windows

1. 安装 Docker Desktop 后，您应该会在系统托盘中看到 Docker 图标。右键单击它，然后导航到 **Settings** > **Kubernetes**。
2. 选中标签为 **Enable Kubernetes** 的复选框，然后点击 **Apply & Restart**。Docker Desktop 会自动为您设置 Kubernetes。当您看到设置菜单中“Kubernetes *running*”旁边的绿灯时，说明 Kubernetes 已经成功启用。
    ![docker-enable-kubernetes](/assets/images/docker-enable-kubernetes.png)
    > 译者注：
    > 
    > 如果看不到 **Kubernetes** 项，请右键单击系统托盘图标，选择 “Switch to Linux containers...” 后，再次导航到 **Settings** > **Kubernetes** 查看。
3. 为了确认 Kubernetes 已经启动并正在运行，创建一个名为 `pod.yaml` 的文本文件，包含以下内容：

    ```yaml
    apiVersion: v1
    kind: Pod
    metadata:
    name: demo
    spec:
    containers:
    - name: testpod
        image: alpine:3.5
        command: ["ping", "8.8.8.8"]
    ```

    这描述了一个带有单个容器的 pod，隔离一个简单的 ping 到 “8.8.8.8”。
4. 在 PowerShell 中，导航到您创建 `pod.yaml` 的目录，并创建 pod：
   
   ```powershell
   kubectl apply -f pod.yaml
   ```

5. 检查 pod 是否已启动并运行：
   ```powershell
    kubectl get pods
    ```
    你应该会看到这样的输出：
    ```powershell
    NAME      READY     STATUS    RESTARTS   AGE
    demo      1/1       Running   0          4s
    ```
6. 检查是否获得了您期望的 ping 进程的日志：
    ```powershell
    kubectl logs demo
    ```
    您应该可以看到正常 ping 进程的输出：
    ```powershell
    PING 8.8.8.8 (8.8.8.8): 56 data bytes
    64 bytes from 8.8.8.8: seq=0 ttl=37 time=21.393 ms
    64 bytes from 8.8.8.8: seq=1 ttl=37 time=15.320 ms
    64 bytes from 8.8.8.8: seq=2 ttl=37 time=11.111 ms
    ...
    ```
7. 最后，拆除测试 pod：
    ```powershell
    kubectl delete -f pod.yaml
    ```

### Mac

与 Windows 类似，具体请参看 [https://docs.docker.com/get-started/orchestration/#kubeosx](https://docs.docker.com/get-started/orchestration/#kubeosx)


## 启用 Docker Swarm

Docker Desktop 主要运行在 Docker 引擎上，它内置了运行 Swarm 所需的一切。按照适用于您的操作系统的设置和验证说明进行操作：

### Windows

1. 打开 powershell, 初始化 Docker Swarm 模式：
    ```powershell
    docker swarm init
    ```
    如果一切顺利，您应该会看到类似如下的消息：

    ```powershell
    Swarm initialized: current node (tjjggogqpnpj2phbfbz8jd5oq) is now a manager.

    To add a worker to this swarm, run the following command:

        docker swarm join --token SWMTKN-1-3e0hh0jd5t4yjg209f4g5qpowbsczfahv2dea9a1ay2l8787cf-2h4ly330d0j917ocvzw30j5x9 192.168.65.3:2377

    To add a manager to this swarm, run 'docker swarm join-token manager' and follow the instructions.
    ```
2. 运行一个简单的 Docker 服务，使用基于 alpin 的文件系统，并隔离一个 ping 到 8.8.8.8：
    ```powershell
    docker service create --name demo alpine:3.5 ping 8.8.8.8
    ```
3. 检查您的服务是否创建了一个正在运行的容器：
    ```powershell
    docker service ps demo
    ```
    你应该会看到这样的输出：
    ```powershell
    ID                  NAME                IMAGE               NODE                DESIRED STATE       CURRENT STATE           ERROR               PORTS
    463j2s3y4b5o        demo.1              alpine:3.5          docker-desktop      Running             Running 8 seconds ago
    ```
4. 检查是否获得了您期望的 ping 进程的日志：
    ```powershell
    docker service logs demo
    ```
    您应该可以看到正常 ping 进程的输出：
    ```powershell
    demo.1.463j2s3y4b5o@docker-desktop    | PING 8.8.8.8 (8.8.8.8): 56 data bytes
    demo.1.463j2s3y4b5o@docker-desktop    | 64 bytes from 8.8.8.8: seq=0 ttl=37 time=13.005 ms
    demo.1.463j2s3y4b5o@docker-desktop    | 64 bytes from 8.8.8.8: seq=1 ttl=37 time=13.847 ms
    demo.1.463j2s3y4b5o@docker-desktop    | 64 bytes from 8.8.8.8: seq=2 ttl=37 time=41.296 ms
    ...
    ```
5. 最后，拆除测试服务：
    ```powershell
    docker service rm demo
    ```

### Mac

与 Windows 类似，具体请参看 [https://docs.docker.com/get-started/orchestration/#swarmosx](https://docs.docker.com/get-started/orchestration/#swarmosx)



## 结论

至此，您已经确认可以在 Kubernetes 和 Swarm 中运行简单的容器化工作负载。下一步是编写 Kubernetes yaml，描述如何在 Kubernetes 上运行和管理这些容器。

[关于部署到 Kubernetes >>](https://docs.docker.com/get-started/kube-deploy/)

要了解如何编写堆栈文件(stack file)来帮助您在 Swarm 上运行和管理容器，请参阅 [部署到 To Swarm](https://docs.docker.com/get-started/swarm-deploy/)。

## CLI 参考文献

本文中使用的所有 CLI 命令的进一步文档可以在这里找到：

- [kubectl apply](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#apply)
- [kubectl get](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#get)
- [kubectl logs](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#logs)
- [kubectl delete](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#delete)
- [docker swarm init](https://docs.docker.com/engine/reference/commandline/swarm_init/)
- [docker service *](https://docs.docker.com/engine/reference/commandline/service/)

<!-- https://kubernetes.io/zh/docs/home/ -->
<br/>

> 作者 ： Docker 官网 <br/>
> 译者 ： 技术译民 <br/>
> 出品 ： [技术译站](https://ittranslator.cn/) <br/>
> 链接 ： [英文原文](https://docs.docker.com/get-started/kube-deploy/)
