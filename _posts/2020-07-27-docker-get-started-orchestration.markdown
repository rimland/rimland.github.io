---
layout: post
title:  "Docker 基础知识 - 在生产环境中运行您的应用 - 编排(Orchestration)"
date:   2020-07-27 01:30:00 +0800
categories: backend docker
published: false
---

# 编排(Orchestration)
# [总览](https://docs.docker.com/get-started/orchestration/)


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
3. 为了确认 Kubernetes 已经启动并正在运行，创建一个名为 `pod.yaml` 的文本文件，包括以下内容：

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
    你应该会看到这样的东西：
    ```powershell
    NAME      READY     STATUS    RESTARTS   AGE
    demo      1/1       Running   0          4s
    ```
6. 检查是否获得了您期望的 ping 进程的日志：
    ```powershell
    kubectl logs demo
    ```
    您应该可以看到正常ping进程的输出：
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

与 Windows 类似，具体请参看 https://docs.docker.com/get-started/orchestration/#kubeosx


## 启用 Docker Swarm

Docker Desktop runs primarily on Docker Engine, which has everything you need to run a Swarm built in. Follow the setup and validation instructions appropriate for your operating system:

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

### Mac

与 Windows 类似，具体请参看 https://docs.docker.com/get-started/orchestration/#swarmosx




















<br/>

> 作者 ： Docker 官网 <br/>
> 译者 ： 技术译民 <br/>
> 出品 ： [技术译站](https://ittranslator.cn/) <br/>
> 链接 ： [英文原文](https://docs.docker.com/get-started/orchestration/)
