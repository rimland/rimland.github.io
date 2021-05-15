---
layout: post
title:  ".NET Worker Service 如何优雅退出"
date:   2020-10-30 00:10:00 +0800
categories: dotnet csharp
published: false
---

> 人生天地之间，若白驹之过隙，忽然而已。

上一篇文章中我们讲述了 [.NET Worker Service 的入门知识](https://ittranslator.cn/dotnet/csharp/2021/05/06/what-are-dotnet-worker-services.html)，今天我们接着介绍一下如何优雅地关闭和退出 Worker Service。

## Worker 类

从上一篇文章中，我们已经知道了 Worker Service 模板为我们提供三个开箱即用的核心文件，其中 **Worker** 类是继承自抽象基类 *BackgroundService* 的，而 *BackgroundService* 实现了 *IHostedService* 接口。最终 *Worker* 类会被注册为托管服务，我们处理任务的核心代码就是写在 *Worker* 类中的。那么，下面我们需要先重点了解一下 *Worker* 类。

先来看看它的基类 *BackgroundService* ：

![Background Service](/assets/images/202105/BackgroundService.png)

基类 *BackgroundService* 中有 3 个可重写的方法，可以让你绑定到应用程序的生命周期中：

- 抽象方法 `ExecuteAsync`，作为应用程序主要入口点的方法。如果此方法退出，则应用程序将关闭。我们必须在 *Worker* 中实现它。
- 虚方法 `StartAsync`，在应用程序启动时调用。如果需要，可以重写此方法，它可用于在服务启动时一次性设置资源；当然，也可以忽略它。
- 虚方法 `StopAsync`，在应用程序关闭时调用。如果需要，可以重写此方法，在关闭时释放资源和销毁对象；当然，也可以忽略它。




<https://devblogs.microsoft.com/premier-developer/demystifying-the-new-net-core-3-worker-service/>


