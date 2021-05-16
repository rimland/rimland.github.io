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

默认情况下 *Worker* 只重写必要的抽象方法 `ExecuteAsync`。

## 新建一个 Worker Service

我们新建一个 Worker Service，使用 `Task.Delay` 来模拟关闭前必须完成的一些操作，看看是否通过简单的在 ExecuteAsync 中 Delay 就可以实现优雅关闭。

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

按 `CTRL+C` 键关闭服务，服务会立即退出，默认情况下 Worker Service 的关闭就是这么直接！在很多场景中（比如内存中的队列），这不是我们想要的结果，有时我们不得不在服务关闭前完成一些必要的资源回收或事务处理。

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

然后测试一下，看它是不是会像我们预期的那样先等待 60 秒再关闭。

```bash
dotnet build
dotnet run
```

按 `CTRL+C` 键关闭服务，我们会发现，它在输出 “等待退出” 后，并没有等待 60 秒并输出 “退出” 之后再关闭，而是很快便退出了。这就像我们熟悉的控制台应用程序，默认情况下，在我们点了右上角的关闭按钮或者按下 `CTRL+C` 键时，会直接关闭一样。

## Worker Service 优雅退出

那么，怎么才能实现优雅退出呢？

方法其实很简单，那就是将 *IHostApplicationLifetime* 注入到我们的服务中，然后在应用程序停止时手动调用 *IHostApplicationLifetime* 的 `StopApplication` 方法来关闭应用程序。

修改 *Worker* 的构造函数，注入 *IHostApplicationLifetime*：

```csharp
private readonly IHostApplicationLifetime _hostApplicationLifetime;
private readonly ILogger<Worker> _logger;

public Worker(IHostApplicationLifetime hostApplicationLifetime, ILogger<Worker> logger)
{
    _hostApplicationLifetime = hostApplicationLifetime;
    _logger = logger;
}
```

然后在 `ExecuteAsync` 中手动调用 *IHostApplicationLifetime* 的 `StopApplication` 方法，下面是丰富过的 `ExecuteAsync` 代码：

```csharp
protected override async Task ExecuteAsync(CancellationToken stoppingToken)
{
    try
    {
        // 这里实现实际的业务逻辑
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                _logger.LogInformation("Worker running at: {time}", DateTimeOffset.Now);

                await SomeMethodThatDoesTheWork(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Global exception occurred. Will resume in a moment.");
            }

            await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
        }
    }
    finally
    {
        _logger.LogWarning("Exiting application...");
        GetOffWork(stoppingToken);
        _hostApplicationLifetime.StopApplication(); //手动调用 StopApplication
    }
}

private async Task SomeMethodThatDoesTheWork(CancellationToken cancellationToken)
{
    _logger.LogInformation("我爱工作，埋头苦干ing……");
    await Task.CompletedTask;
}

/// <summary>
/// 关闭前需要完成的工作
/// </summary>
private void GetOffWork(CancellationToken cancellationToken)
{
    _logger.LogInformation("啊，糟糕，有一个紧急 bug 需要下班前完成！！！");

    _logger.LogInformation("啊啊啊，我爱加班，我要再干 20 秒，Wait 1 ");

    Task.Delay(TimeSpan.FromSeconds(20)).Wait();

    _logger.LogInformation("啊啊啊啊啊啊，我爱加班，我要再干 1 分钟，Wait 2 ");

    Task.Delay(TimeSpan.FromMinutes(1)).Wait();

    _logger.LogInformation("啊哈哈哈哈哈，终于好了，下班走人！");
}
```

此时，再次 `dotnet run` 运行服务，然后按 `CTRL+C` 键关闭服务，您会发现关闭前需要完成的工作 `GetOffWork` 运行完成后才会退出服务了。

此时已经实现了 Worker Service 的优雅退出。

## StartAsync 和 StopAsync

为了更进一步了解 Worker Service，我们再来丰富一下我们的代码，重写基类 *BackgroundService* 的 `StartAsync` 和 `StopAsync` 方法：

```csharp
public class Worker : BackgroundService
{
    private bool _isStopping = false; //是否正在停止工作
    private readonly IHostApplicationLifetime _hostApplicationLifetime;
    private readonly ILogger<Worker> _logger;

    public Worker(IHostApplicationLifetime hostApplicationLifetime, ILogger<Worker> logger)
    {
        _hostApplicationLifetime = hostApplicationLifetime;
        _logger = logger;
    }

    public override Task StartAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("上班了，又是精神抖擞的一天，output from StartAsync");
        return base.StartAsync(cancellationToken);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try
        {
            // 这里实现实际的业务逻辑
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    _logger.LogInformation("Worker running at: {time}", DateTimeOffset.Now);

                    await SomeMethodThatDoesTheWork(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Global exception occurred. Will resume in a moment.");
                }

                await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
            }
        }
        finally
        {
            _logger.LogWarning("Exiting application...");
            GetOffWork(stoppingToken);
            _hostApplicationLifetime.StopApplication();
        }
    }

    private async Task SomeMethodThatDoesTheWork(CancellationToken cancellationToken)
    {
        if (_isStopping)
            _logger.LogInformation("假装还在埋头苦干ing…… 其实我去洗杯子了");
        else
            _logger.LogInformation("我爱工作，埋头苦干ing……");

        await Task.CompletedTask;
    }

    /// <summary>
    /// 关闭前需要完成的工作
    /// </summary>
    private void GetOffWork(CancellationToken cancellationToken)
    {
        _logger.LogInformation("啊，糟糕，有一个紧急 bug 需要下班前完成！！！");

        _logger.LogInformation("啊啊啊，我爱加班，我要再干 20 秒，Wait 1 ");

        Task.Delay(TimeSpan.FromSeconds(20)).Wait();

        _logger.LogInformation("啊啊啊啊啊啊，我爱加班，我要再干 1 分钟，Wait 2 ");

        Task.Delay(TimeSpan.FromMinutes(1)).Wait();

        _logger.LogInformation("啊哈哈哈哈哈，终于好了，下班走人！");
    }

    public override Task StopAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("太好了，下班时间到了，output from StopAsync at: {time}", DateTimeOffset.Now);

        _isStopping = true;

        _logger.LogInformation("去洗洗茶杯先……", DateTimeOffset.Now);
        Task.Delay(30_000).Wait();
        _logger.LogInformation("茶杯洗好了。", DateTimeOffset.Now);

        _logger.LogInformation("下班喽 ^_^", DateTimeOffset.Now);

        return base.StopAsync(cancellationToken);
    }
}
```

重新运行一下

```bash
dotnet build
dotnet run
```

然后按 `CTRL+C` 键关闭服务，看看运行结果是什么？我们可以观察到在 Worker Service 启动和关闭时，基类 *BackgroundService* 中可重写的三个方法的运行顺序分别如下图所示：

<!-- <https://devblogs.microsoft.com/premier-developer/demystifying-the-new-net-core-3-worker-service/> -->

![worker service startup flowchart](/assets/images/202105/worker-service-flowchart-startup.png)

![worker service shutdown flowchart](/assets/images/202105/worker-service-flowchart-shutdown.png)

## 总结

