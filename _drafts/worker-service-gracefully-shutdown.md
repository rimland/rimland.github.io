---
layout: post
title:  ".NET Worker Service 如何优雅退出"
date:   2020-10-30 00:10:00 +0800
categories: dotnet csharp
published: false
---

上一篇文章中我们了解了 [.NET Worker Service 的入门知识](https://ittranslator.cn/dotnet/csharp/2021/05/06/what-are-dotnet-worker-services.html)，今天我们接着介绍一下如何优雅地关闭和退出 Worker Service。

## Worker 类

从上一篇文章中，我们已经知道了 Worker Service 模板为我们提供三个开箱即用的核心文件，其中 **Worker** 类是继承自抽象基类 *BackgroundService* 的，而 *BackgroundService* 实现了 *IHostedService* 接口。最终 *Worker* 类会被注册为托管服务，我们处理任务的核心代码就是写在 *Worker* 类中的。那么，下面我们需要先重点了解一下 *Worker* 类。

先来看看它的基类 *BackgroundService* ：

![Background Service](/assets/images/202105/BackgroundService.png)

基类 *BackgroundService* 中有 3 个可重写的方法，可以让你绑定到应用程序的生命周期中：

- 抽象方法 `ExecuteAsync`，作为应用程序主要入口点的方法。如果此方法退出，则应用程序将关闭。我们必须在 *Worker* 中实现它。
- 虚方法 `StartAsync`，在应用程序启动时调用。如果需要，可以重写此方法，它可用于在服务启动时一次性设置资源；当然，也可以忽略它。
- 虚方法 `StopAsync`，在应用程序关闭时调用。如果需要，可以重写此方法，在关闭时释放资源和销毁对象；当然，也可以忽略它。

## 新建一个 Worker Service

需要用到的开发工具：

- Visual Studio Code：<https://code.visualstudio.com/>
- 最新的 .NET SDK：<https://dotnet.microsoft.com/download>

安装好以上工具后，在终端中运行以下命令，创建一个 Worker Service 项目：

```bash
dotnet new Worker -n "MyService"
```

创建好 Worker Service 后，在 Visual Studio Code 中打开应用程序，然后构建并运行一下，以确保一切正常：

```bash
dotnet build
dotnet run
```

按 `CTRL+C` 键关闭服务，服务会立即退出。

我们看一下 *Worker* 类的代码，会看到它只重写了基类 *BackgroundService* 中的抽象方法 `ExecuteAsync`：

```csharp
protected override async Task ExecuteAsync(CancellationToken stoppingToken)
{
    while (!stoppingToken.IsCancellationRequested)
    {
        _logger.LogInformation("Worker running at: {time}", DateTimeOffset.Now);
        await Task.Delay(1000, stoppingToken);
    }
}
```

我们尝试修改一下此方法，加上等待时间：

```csharp
protected override async Task ExecuteAsync(CancellationToken stoppingToken)
{
    while (!stoppingToken.IsCancellationRequested)
    {
        _logger.LogInformation("Worker running at: {time}", DateTimeOffset.Now);
        // await Task.Delay(1000, stoppingToken);
        await Task.Delay(1000);
    }

    _logger.LogInformation("等待退出 {time}", DateTimeOffset.Now);

    await Task.Delay(60_000); //模拟退出前需要完成的工作

    _logger.LogInformation("退出 {time}", DateTimeOffset.Now);
}
```

然后我们测试一下，看它是不是会像我们预期的那样在关闭前先等待 60 秒。

```bash
dotnet build
dotnet run
```

按 `CTRL+C` 键关闭服务，我们会发现，它在输出 “等待退出” 后，并没有等待 60 秒并输出 “退出” 之后再关闭，而是直接关闭应用程序了。这就像是以前的控制台应用程序一样，在我们点了右上角的关闭按钮或者按下 `CTRL+C` 键，它会直接关闭。


<!-- <https://devblogs.microsoft.com/premier-developer/demystifying-the-new-net-core-3-worker-service/> -->

![worker service startup flowchart](/assets/images/202105/worker-service-flowchart-startup.png)

![worker service shutdown flowchart](/assets/images/202105/worker-service-flowchart-shutdown.png)


