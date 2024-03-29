---
layout: post
title:  ".NET Worker Service 作为 Windows 服务运行及优雅退出改进"
date:   2021-06-17 00:01:01 +0800
categories: dotnet csharp
author: 技术译民
tags: [DotNet, Worker Service, Windows Services]
published: true
---

上一篇文章我们了解了[如何为 Worker Service 添加 Serilog 日志记录](https://ittranslator.cn/dotnet/csharp/2021/05/31/worker-service-with-serilog.html)，今天我接着介绍一下如何将 Worker Service 作为 Windows 服务运行。

我曾经在[前面一篇文章的总结](https://ittranslator.cn/dotnet/csharp/2021/05/17/worker-service-gracefully-shutdown.html)中提到过*可以使用 **sc.exe** 实用工具将 Worker Service 安装为 Windows 服务运行*，本文中我就来具体阐述一下如何实现它。

## SC 是什么？

**sc.exe** 是包含于 Windows SDK 的，可用于控制服务的命令行实用程序，它的命令对应于[服务控制管理器(SCM)](https://docs.microsoft.com/zh-cn/windows/win32/services/service-control-manager)[^scm] 提供的函数。

[^scm]: <https://docs.microsoft.com/zh-cn/windows/win32/services/service-control-manager>

服务控制管理器(SCM) 是 Windows NT 系列操作系统中的一个特殊进程，它在操作系统启动时由 wininit 进程启动，用于启动和停止 Windows 进程（包括设备驱动程序和启动程序）。SCM 的主要功能是在系统启动时启动所有必需的服务，它类似于类 Unix 系统上的 init 进程（或者现代 Linux 发行版上使用的较新的 systemd init 系统），用于启动各种系统守护进程[^scm2]。SCM 是一个远程过程调用(RPC)服务，服务配置和服务控制程序可以借它来控制远程计算机上的服务。

[^scm2]: <https://www.techopedia.com/definition/25522/service-control-manager-scm>

打开 Windows 命令提示符窗口，输入并运行 `sc` 命令，您便可以看到 **sc.exe** 实用工具的帮助信息：

```bash
> sc

描述:
        SC 是用来与服务控制管理器和服务进行通信
        的命令行程序。
用法:
        sc <server> [command] [service name] <option1> <option2>...


        <server> 选项的格式为 "\\ServerName"
        可通过键入以下命令获取有关命令的更多帮助: "sc [command]"
        命令:
          query-----------查询服务的状态，
                          或枚举服务类型的状态。
          queryex---------查询服务的扩展状态，
                          或枚举服务类型的状态。
          start-----------启动服务。
          pause-----------向服务发送 PAUSE 控制请求。
          interrogate-----向服务发送 INTERROGATE 控制请求。
          continue--------向服务发送 CONTINUE 控制请求。
          stop------------向服务发送 STOP 请求。
          config----------更改服务的配置(永久)。
          description-----更改服务的描述。
          failure---------更改失败时服务执行的操作。
          failureflag-----更改服务的失败操作标志。
          sidtype---------更改服务的服务 SID 类型。
          privs-----------更改服务的所需特权。
          managedaccount--更改服务以将服务帐户密码
                          标记为由 LSA 管理。
          qc--------------查询服务的配置信息。
          qdescription----查询服务的描述。
          qfailure--------查询失败时服务执行的操作。
          qfailureflag----查询服务的失败操作标志。
          qsidtype--------查询服务的服务 SID 类型。
          qprivs----------查询服务的所需特权。
          qtriggerinfo----查询服务的触发器参数。
          qpreferrednode--查询服务的首选 NUMA 节点。
          qmanagedaccount-查询服务是否将帐户
                          与 LSA 管理的密码结合使用。
          qprotection-----查询服务的进程保护级别。
          quserservice----查询用户服务模板的本地实例。
          delete ----------(从注册表中)删除服务。
          create----------创建服务(并将其添加到注册表中)。
          control---------向服务发送控制。
          sdshow----------显示服务的安全描述符。
          sdset-----------设置服务的安全描述符。
          showsid---------显示与任意名称对应的服务 SID 字符串。
          triggerinfo-----配置服务的触发器参数。
          preferrednode---设置服务的首选 NUMA 节点。
          GetDisplayName--获取服务的 DisplayName。
          GetKeyName------获取服务的 ServiceKeyName。
          EnumDepend------枚举服务依赖关系。
...
```

您可以从帮助信息中看到 **sc** 实用工具支持的所有命令集及其介绍。我们在本文中要用到的命令有：

- create----------创建服务(并将其添加到注册表中)
- description-----更改服务的描述。
- start-----------启动服务。
- stop------------向服务发送 STOP 请求。
- delete ----------(从注册表中)删除服务。

## 创建项目并发布

### 下载 Worker Service 源码

我将基于[上一篇文章中的 Worker Service 源码](https://github.com/ITTranslate/WorkerServiceWithSerilog)[^precode]来修改，如果您安装有 git，可以用下面的命令获取它：

[^precode]: <https://github.com/ITTranslate/WorkerServiceWithSerilog>

```bash
git clone git@github.com:ITTranslate/WorkerServiceWithSerilog.git
```

然后，使用 Visual Studio Code 打开此项目，运行一下，以确保一切正常：

```bash
dotnet build
dotnet run
```

### 添加 Windows Services 依赖

为了作为 Windows 服务运行，我们需要我们的 Worker 监听来自 *ServiceBase* 的启动和停止信号，[*ServiceBase*](https://github.com/dotnet/runtime/blob/main/src/libraries/System.ServiceProcess.ServiceController/src/System/ServiceProcess/ServiceBase.cs) 是将 Windows 服务系统公开给 .NET 应用程序的 .NET 类型。为此，我们需要添加 `Microsoft.Extensions.Hosting.WindowsServices` NuGet 包：

```bash
dotnet add package Microsoft.Extensions.Hosting.WindowsServices
```

然后修改 *Program.cs* 中的 `CreateHostBuilder` 方法，添加 `UseWindowsService` 方法调用：

```csharp
public static IHostBuilder CreateHostBuilder(string[] args) =>
    Host.CreateDefaultBuilder(args)
        .UseWindowsService() // Sets the host lifetime to WindowsServiceLifetime...
        .ConfigureServices((hostContext, services) =>
        {
            services.AddHostedService<Worker>();
        })
        .UseSerilog(); //将 Serilog 设置为日志提供程序
```

然后，运行一下构建命令，确保一切正常：

```bash
dotnet build
```

不出意外，您会看到 *已成功生成* 的提示。

### 发布程序

运行 `dotnet publish` 命令将应用程序及其依赖项发布到文件夹（我的操作系统是 win10 x64 系统）[^publish]。

[^publish]: <https://docs.microsoft.com/zh-cn/dotnet/core/tools/dotnet-publish>

```bash
dotnet publish -c Release -r win-x64 -o c:\test\workerpub
```

命令运行完成后，您会在 *C:\test\workerpub* 文件夹中看到可执行程序及其所有依赖项。

## 创建并运行服务

首先，需要特别注意的是：当我们使用 **sc.exe** 实用工具管理服务时，**必须以管理员身份运行 Windows 命令提示符**，否则会执行失败。

### 安装服务

安装服务我们需要用到创建服务命令 —— `sc create`。

以管理员身份打开 Windows 命令提示符窗口，输入并运行 `sc create` 命令，可以看到此命令的的帮助信息：

```bash
> sc create

描述:
        在注册表和服务数据库中创建服务项。
用法:
        sc <server> create [service name] [binPath= ] <option1> <option2>...

选项:
注意: 选项名称包括等号。
      等号和值之间需要一个空格。
 type= <own|share|interact|kernel|filesys|rec|userown|usershare>
       (默认 = own)
 start= <boot|system|auto|demand|disabled|delayed-auto>
       (默认 = demand)
 error= <normal|severe|critical|ignore>
       (默认 = normal)
 binPath= <.exe 文件的 BinaryPathName>
 group= <LoadOrderGroup>
 tag= <yes|no>
 depend= <依存关系(以 / (斜杠)分隔)>
 obj= <AccountName|ObjectName>
       (默认= LocalSystem)
 DisplayName= <显示名称>
 password= <密码>
```

命令 `sc create` 的参数说明[^sc-create]：

[^sc-create]: <https://docs.microsoft.com/zh-cn/windows-server/administration/windows-commands/sc-create>

- **server**：指定服务所在的远程服务器的名称。名称必须使用通用命名约定(UNC)格式 (例如，\myserver) 。若要在本地运行 SC.exe，请不要使用此参数。
- **service name**：指定 **getkeyname** 操作返回的服务名称。
- **binPath=**：指定服务二进制文件的路径。 binPath= 没有默认值，必须提供此字符串。
- **displayname= "显示名称"**：指定一个友好名称，用于标识用户界面程序中的服务。
- **start= `{boot|system|auto|demand|disabled|delayed-auto}`**：指定服务的启动类型。选项包括：
  - boot - 指定由启动加载程序加载的设备驱动程序。
  - system - 指定在内核初始化过程中启动的设备驱动程序。
  - auto - 指定一项服务，该服务在计算机每次重新启动时自动启动并运行（即使没有人登录到计算机）。
  - demand - 指定必须手动启动的服务。如果未指定 start= ，则此值为默认值。
  - disabled - 指定无法启动的服务。若要启动已禁用的服务，请将启动类型更改为其他某个值。
  - delayed-auto - 指定一项服务，该服务将在启动其他自动服务之后的短时间自动启动。

> 注意事项：  
> 1、每个命令行选项 (参数) 必须包含等号作为选项名称的一部分。  
> 2、选项与其值之间必须有一个空格（例如，**type= own**），如果遗漏了空格，操作将失败。

了解了 `sc create` 命令的用法，不难得出此处我们所需要的命令如下：

```bash
sc create MyService binPath= "C:\test\workerpub\MyService.exe" start= auto displayname= "技术译站的测试服务"
```

运行以上命令，输出以下结果：

```text
[SC] CreateService 成功
```

运行 `services.msc` 命令打开本地服务列表，可以看到我们的服务已经安装好了，服务名称显示为 **技术译站的测试服务**。它没有描述，处于*已停止*状态。

### 设置服务的描述

输入并运行 `sc description` 命令，可以看到此命令的的帮助信息：

```bash
> sc description
描述:
        设置服务的描述字符串。
用法:
        sc <server> description [service name] [description]
```

运行以下命令给该服务添加描述信息：

```bash
sc description MyService "这是一个由 Worker Service 实现的测试服务。"
```

输出结果：

```text
[SC] ChangeServiceConfig2 成功
```

运行成功以后，按 `F5` 刷新服务列表，您将看到服务描述已经更新了。

### 启动服务

输入并运行 `sc start` 命令，可以看到此命令的的帮助信息：

```bash
> sc start

描述:
        启动服务运行。
用法:
        sc <server> start [service name] <arg1> <arg2> ...
```

输入以下命令启动服务：

```bash
sc start MyService
```

输出结果：

```text
[SC] StartService 失败 1053:

服务没有及时响应启动或控制请求。
```

启动失败了，为什么呢？查看一下 Windows 事件查看器 --> 应用程序，显示的错误原因大致如下：

```text
The process was terminated due to an unhandled exception.
Exception Info: System.IO.FileNotFoundException: The configuration file 'appsettings.json' was not found and is not optional. 
The physical path is 'C:\WINDOWS\system32\appsettings.json'.
```

回头看一下 *Program.cs* 文件，在 `Main` 方法中我们为配置设置的基路径是 `Directory.GetCurrentDirectory()`。但是作为 Windows Service 运行时，默认的当前工作目录是 *C:\WINDOWS\system32*，所以导致了这样的错误。为了解决这一问题，我们需要在设置配置的基路径前添加一行 `Directory.SetCurrentDirectory(AppContext.BaseDirectory)`，代码如下：

```csharp
// 作为 Windows Service 运行时，默认的当前工作目录是 C:\WINDOWS\system32，会导致找不到配置文件，
// 所以需要添加下面一行，指定当前工作目录为应用程序所在的实际目录。
Directory.SetCurrentDirectory(AppContext.BaseDirectory);

var configuration = new ConfigurationBuilder()
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json")
    .AddJsonFile($"appsettings.{Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT") ?? "Production"}.json", true)
    .Build();
```

> 作为 Windows Service 运行时，默认情况下，Directory.GetCurrentDirectory() 为 *C:\WINDOWS\system32*，  
> AppDomain.CurrentDomain.BaseDirectory 和 AppContext.BaseDirectory 为应用程序所在的实际目录。  
> 因为在有的依赖程序包中有用到 Directory.GetCurrentDirectory() 来获取程序所在目录，所以这里必须使用 Directory.SetCurrentDirectory 设置当前工作目录。

再次启动服务：

```bash
> sc start MyService

SERVICE_NAME: MyService
        TYPE               : 10  WIN32_OWN_PROCESS
        STATE              : 2  START_PENDING
                                (NOT_STOPPABLE, NOT_PAUSABLE, IGNORES_SHUTDOWN)
        WIN32_EXIT_CODE    : 0  (0x0)
        SERVICE_EXIT_CODE  : 0  (0x0)
        CHECKPOINT         : 0x0
        WAIT_HINT          : 0x7d0
        PID                : 21736
        FLAGS              :
```

这次服务启动成功了。

![My Service](https://ittranslator.cn/assets/images/202106/MyService.png)

### 停止服务

运行以下命令，停止 *MyService* 服务。

```bash
sc stop MyService
```

输出结果：

```text
SERVICE_NAME: MyService
        TYPE               : 10  WIN32_OWN_PROCESS
        STATE              : 3  STOP_PENDING
                                (STOPPABLE, NOT_PAUSABLE, ACCEPTS_SHUTDOWN)
        WIN32_EXIT_CODE    : 0  (0x0)
        SERVICE_EXIT_CODE  : 0  (0x0)
        CHECKPOINT         : 0x0
        WAIT_HINT          : 0x0
```

### 删除服务

运行以下命令，(从注册表中)删除 *MyService* 服务。

```bash
sc delete MyService
```

输出结果：

```text
[SC] DeleteService 成功
```

至此，我们使用 **sc** 实用工具演示了服务的创建、更改描述、启动、停止和删除。当服务创建完成以后，您也可以使用 Windows 服务管理器来维护服务的启动、停止等。

## Windows Service 优雅退出

### 问题

我查看了一下 *C:\test\workerpub\Logs* 目录下的日志信息，发现当停止服务的时候，它并没有像我将 Worker Service 作为控制台应用运行时那样优雅退出（等待关闭前必须完成的任务正常结束后再退出）。也就是说，我在[.NET Worker Service 如何优雅退出](https://ittranslator.cn/dotnet/csharp/2021/05/17/worker-service-gracefully-shutdown.html)[^graceful]中使用的方法，在将 Worker Service 作为 Windows 服务运行时失效了。

[^graceful]: <https://ittranslator.cn/dotnet/csharp/2021/05/17/worker-service-gracefully-shutdown.html>

这是什么原因呢，该如何解决呢？

### 查找原因

我们来看一下 `UseWindowsService` 方法的[源代码](https://github.com/dotnet/runtime/blob/main/src/libraries/Microsoft.Extensions.Hosting.WindowsServices/src/WindowsServiceLifetimeHostBuilderExtensions.cs)：

![UseWindowsService Method](https://ittranslator.cn/assets/images/202106/UseWindowsService.png)

其中有这样一行：

```csharp
// https://github.com/dotnet/runtime/blob/main/src/libraries/Microsoft.Extensions.Hosting.WindowsServices/src/WindowsServiceLifetimeHostBuilderExtensions.cs

services.AddSingleton<IHostLifetime, WindowsServiceLifetime>();
```

也就是说，当 Worker Service 作为 Windows Service 运行时，使用的宿主(Host)生命周期控制类不再是作为控制台应用运行时的 [*ConsoleLifetime*](https://github.com/dotnet/runtime/blob/main/src/libraries/Microsoft.Extensions.Hosting/src/Internal/ConsoleLifetime.cs)，而是 [*WindowsServiceLifetime*](https://github.com/dotnet/runtime/blob/main/src/libraries/Microsoft.Extensions.Hosting.WindowsServices/src/WindowsServiceLifetime.cs)，它派生自 [*ServiceBase*](https://github.com/dotnet/runtime/blob/main/src/libraries/System.ServiceProcess.ServiceController/src/System/ServiceProcess/ServiceBase.cs)。

让我们来看一下 *WindowsServiceLifetime* 的[源代码](https://github.com/dotnet/runtime/blob/main/src/libraries/Microsoft.Extensions.Hosting.WindowsServices/src/WindowsServiceLifetime.cs)：

![WindowsServiceLifetime Class](https://ittranslator.cn/assets/images/202106/WindowsServiceLifetime.png)

您会发现 *WindowsServiceLifetime* 类的 `OnStop` 和 `OnShutdown` 方法中调用了 `ApplicationLifetime.StopApplication()`；而它的基类 *ServiceBase* 中，当服务停止时调用了 `OnStop` 和 `OnShutdown` 方法。也就是说，在 Windows 服务停止的时候已经调用了 `ApplicationLifetime.StopApplication()`。这就是我们在 *Worker* 中手动调用 `StopApplication` 失效的原因。

问题的原因找到了，该怎么解决它呢？

### 解决方法

功夫不负有心人，在认真查阅了 [dotnet runtime](https://github.com/dotnet/runtime)[^runtime] 中 *BackgroundService* 、*WindowsServiceLifetime* 和 *ApplicationLifetime* 类的源代码后，终于找到了解决方法。既然 *WindowsServiceLifetime* 中调用了 `StopApplication`，那我就换别的方法呗。

[^runtime]: <https://github.com/dotnet/runtime> dotnet runtime

注意到 *ApplicationLifetime* 的属性 `ApplicationStopping`（类型为 *CancellationToken*），它的注释是：

> Triggered when the application host is performing a graceful shutdown. Request may still be in flight. Shutdown will block until this event completes.

所以，我们可以向它注册一个取消时调用的的委托操作。修改一下 *Worker* 类中的 `StartAsync` 方法，添加以下代码：

```csharp
// 注册应用停止前需要完成的操作
_hostApplicationLifetime.ApplicationStopping.Register(() =>
{
    GetOffWork();
});
```

> 向 ApplicationStopping 注册的委托，在 `StopAsync` 之前运行。

修改后 *Worker* 类的完整代码如下：

```csharp
public class Worker : BackgroundService
{
    /// <summary>
    /// 状态：0-默认状态，1-正在完成关闭前的必要工作，2-正在执行 StopAsync
    /// </summary>
    private volatile int _status = 0; //状态
    private readonly IHostApplicationLifetime _hostApplicationLifetime;
    private readonly ILogger<Worker> _logger;

    public Worker(IHostApplicationLifetime hostApplicationLifetime, ILogger<Worker> logger)
    {
        _hostApplicationLifetime = hostApplicationLifetime;
        _logger = logger;
    }

    public override Task StartAsync(CancellationToken cancellationToken)
    {
        // 注册应用停止前需要完成的操作
        _hostApplicationLifetime.ApplicationStopping.Register(() =>
        {
            GetOffWork();
        });

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
            _logger.LogWarning("My worker service shut down.");
        }
    }

    private async Task SomeMethodThatDoesTheWork(CancellationToken cancellationToken)
    {
        string msg = _status switch
        {
            1 => "正在完成关闭前的必要工作……",
            2 => "假装还在埋头苦干ing…… 其实我去洗杯子了",
            _ => "我爱工作，埋头苦干ing……"
        };

        _logger.LogInformation(msg);
        await Task.CompletedTask;
    }

    /// <summary>
    /// 关闭前需要完成的工作
    /// </summary>
    private void GetOffWork()
    {
        _status = 1;

        _logger.LogInformation("太好了，下班时间到，output from ApplicationStopping.Register Action at: {time}", DateTimeOffset.Now);           

        _logger.LogDebug("开始处理关闭前必须完成的工作 at: {time}", DateTimeOffset.Now);

        _logger.LogInformation("糟糕，有一个紧急 bug 需要下班前完成！！！");

        _logger.LogInformation("啊啊啊，我爱加班，我要再干 20 秒，Wait 1 ");

        Task.Delay(TimeSpan.FromSeconds(20)).Wait();

        _logger.LogInformation("啊啊啊啊啊啊，我爱加班，我要再干 1 分钟，Wait 2 ");

        Task.Delay(TimeSpan.FromMinutes(1)).Wait();

        _logger.LogInformation("啊哈哈哈哈哈，终于好了，可以下班了！");

        _logger.LogDebug("关闭前必须完成的工作处理完成 at: {time}", DateTimeOffset.Now);
    }

    public override Task StopAsync(CancellationToken cancellationToken)
    {
        _status = 2;

        _logger.LogInformation("准备下班了，output from StopAsync at: {time}", DateTimeOffset.Now);

        _logger.LogInformation("去洗洗茶杯先……", DateTimeOffset.Now);
        Task.Delay(30_000).Wait();
        _logger.LogInformation("茶杯洗好了。", DateTimeOffset.Now);

        _logger.LogInformation("下班喽 ^_^", DateTimeOffset.Now);

        return base.StopAsync(cancellationToken);
    }
}
```

代码修改完成以后，停止服务，重新发布程序。

```bash
dotnet publish -c Release -r win-x64 -o c:\test\workerpub
```

再次启动服务然后关闭服务，您会发现，我们编写的 Windows Service 已经可以优雅退出了。

这种方法，不仅作为 Windows 服务运行时可以优雅退出，而且作为控制台应用运行时也一样适用，它比我在[.NET Worker Service 如何优雅退出](https://ittranslator.cn/dotnet/csharp/2021/05/17/worker-service-gracefully-shutdown.html)中介绍的方法更加完美。

## 总结

在本文中，我通过一个实例详细介绍了如何将 .NET Worker Service 作为 Windows 服务运行，并说明了如何使用 **sc.exe** 实用工具安装和管理服务。还改进了 Worker Service 优雅退出的方法，使它不仅适用于控制台应用而且适用于 Windows 服务。

当我们向 *HostBuilder* 添加了 `.UseWindowsService()` 方法调用后，编译出的程序，既可以作为控制台应用运行，也可以作为 Windows 服务运行。

您可以从 GitHub [下载本文中的源码](https://github.com/ITTranslate/WorkerServiceAsWindowsService)[^github]。

[^github]: <https://github.com/ITTranslate/WorkerServiceAsWindowsService> 源码下载

<br />

相关阅读：

- [.NET Worker Service 入门介绍](https://ittranslator.cn/dotnet/csharp/2021/05/06/what-are-dotnet-worker-services.html)
- [.NET Worker Service 如何优雅退出](https://ittranslator.cn/dotnet/csharp/2021/05/17/worker-service-gracefully-shutdown.html)
- [.NET Worker Service 添加 Serilog 日志记录](https://ittranslator.cn/dotnet/csharp/2021/05/31/worker-service-with-serilog.html)
- [.NET Worker Service 作为 Windows 服务运行及优雅退出改进](https://ittranslator.cn/dotnet/csharp/2021/06/17/worker-service-as-windows-services.html)
- [.NET Worker Service 部署到 Linux 作为 Systemd Service 运行](https://ittranslator.cn/dotnet/csharp/2021/06/29/worker-service-as-systemd-services-on-linux.html)

> 作者 ： 技术译民  
> 出品 ： [技术译站](https://ittranslator.cn/)

<!-- 
    https://docs.microsoft.com/zh-cn/aspnet/core/host-and-deploy/windows-service?view=aspnetcore-5.0&tabs=visual-studio
-->
