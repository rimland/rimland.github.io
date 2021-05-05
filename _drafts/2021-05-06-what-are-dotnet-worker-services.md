---
layout: post
title:  ".NET 中的 Worker Services 入门介绍"
date:   2021-05-06 00:10:09 +0800
categories: dotnet csharp
published: true
---

> 翻译自 Steve Gordon 2020年3月30日的文章 [《WHAT ARE .NET WORKER SERVICES?》](https://www.stevejgordon.co.uk/what-are-dotnet-worker-services) [^1]

[^1]: <https://www.stevejgordon.co.uk/what-are-dotnet-worker-services> WHAT ARE .NET WORKER SERVICES?

<!-- With the release of .NET Core 3.0, the ASP.NET team introduced a new “Worker Service” project template, which is available as part of the SDK. In this post, I’ll introduce the new template, along with some practical examples of the kinds of services which I develop using it. -->

随着 .NET Core 3.0 的发布，ASP.NET 团队引入了一个新的 **Worker Service** 项目模板，该模板作为 .NET SDK 的一部分发布。在本文中，我将向您介绍此新模板，以及使用它开发的一些实际的服务示例。

<!-- If you find the information in this post useful and plan to build your own worker services, may I suggest viewing my new course on Pluralsight – “Building ASP.NET Core Hosted Services and .NET Core Worker Services“. I dive deeply into worker services and demonstrate how to refactor parts of a web application as microservices. -->

> 译者注：  
> 请先完成以下准备工作，以便于您理解本文。  
> 1、下载最新的 .NET SDK：<https://dotnet.microsoft.com/download>  
> 2、命令行运行 `dotnet new Worker -n "MyService"` 命令，创建一个 Worker Service 项目。

## 什么是 .NET Core Worker Service？

<!-- A worker service is a .NET project built using a template which supplies a few useful features that turn a regular console application into something more powerful. A worker service runs on top of the concept of a host, which maintains the lifetime of the application. The host also makes available some familiar features, such as dependency injection, logging and configuration. -->

Worker Service 是使用模板构建的 .NET 项目，该模板提供了一些有用的功能，可以将常规控制台应用程序变得更加强大。Worker Service 运行于宿主(Host)的概念之上，宿主维护应用程序的生命周期。宿主还提供了一些常见的特性，如依赖注入、日志记录和配置。

<!-- Worker services will generally be long-running services, performing some regularly occurring workload. -->

Worker Service 通常是长时间运行的服务，执行一些规律发生的工作负载。

### Worker Service 的一些例子

<!-- Processing messages/events from a queue, service bus or event stream
Reacting to file changes in an object/file store
Aggregating data from a data store
Enriching data in data ingestion pipelines
Formatting and cleansing of AI/ML datasets -->

- 处理来自队列、服务总线或事件流的消息、事件
- 响应对象、文件存储中的文件更改
- 聚合数据存储中的数据
- 丰富数据提取管道中的数据
- AI/ML 数据集的格式化和清理

<!-- It’s also possible to develop a worker service which performs a process from start to finish and then shuts down. Coupled with a scheduler, this can support periodical batch workloads. For example, every hour the service is started by the scheduler, calculates some aggregate totals and then shuts down. -->

还可以开发一个这样的 Worker Service，该服务从头到尾执行一个过程，然后关闭。结合调度程序，便可以支持定期的批处理工作负载。例如，调度程序每隔一小时启动一次服务，完成一些汇总数据的计算，然后关闭。

<!-- Worker services do not have a user interface, nor will they support direct user interaction. They are particularly applicable when designing a microservices architecture. Here responsibilities are often split into distinct, separately deployable and scalable services. It’s not uncommon to have numerous worker services as your microservices architecture grows and evolves. -->

Worker Service 没有用户界面，也不支持直接的用户交互，它们特别适用于设计微服务架构。在微服务体系结构中，职责通常被划分为不同的、可单独部署的、可伸缩的服务。随着微服务架构的成长和发展，拥有大量的 Worker Service 会变得越来越常见。

## Worker Service 模板提供了什么？

<!-- It’s entirely possible to develop a long-running worker service without using the worker service template. I was doing so in early versions of .NET Core, manually establishing a host with a dependency injection container and then initiating my processing workloads. -->

完全可以在不使用 Worker Service 模板的情况下开发长时间运行的 Worker Service。在 .NET Core 的早期版本中我是这样做的，使用依赖注入容器手动建立宿主，然后启动我的处理工作负载。

<!-- The worker service template includes useful foundational components, like dependency injection, by default so that we can focus on building our business logic on top. It includes a host which manages the lifecycle of the application. -->

在默认情况下，Worker Service 模板包含了有用的基础组件，比如依赖注入，这样我们就可以集中精力在其上构建业务逻辑。它包含了一个管理应用程序生命周期的宿主。

<!-- The worker service template is reasonably basic and includes just three core files out of the box. -->

Worker Service 模板本身是相当基础的，它只包含了三个开箱即用的核心文件。

### 1. Program.cs

<!-- The first of which is a `Program` class. This class consists of the required Main method entry point for .NET console applications. The .NET runtime expects to locate this method within the `Program` class when it starts your .NET application. -->

第一个是 **Program** 类。该类包含 .NET 控制台应用程序所必需的 `Main` 方法入口点，.NET 运行时期望在启动 .NET 应用程序时在 *Program* 类中查找此方法。

```csharp
public class Program
{
    public static void Main(string[] args)
    {
        CreateHostBuilder(args).Build().Run();
    }

    public static IHostBuilder CreateHostBuilder(string[] args) =>
        Host.CreateDefaultBuilder(args)
            .ConfigureServices((hostContext, services) =>
            {
                services.AddHostedService<Worker>();
            });
}
```

<!-- Included within the Program class, as part of the worker service template, is the `CreateHostBuilder` private method which creates an `IHostBuilder`. The IHostBuilder interface defines a type which uses the builder pattern to produce an instance of an `IHost`. The template creates a new HostBuilder by calling the static `CreateDefaultBuilder` method on the Host class. -->

在 *Program* 类中，作为 Worker Service 模板一部分的是 `CreateHostBuilder` 方法，该方法创建一个 `IHostBuilder`。`IHostBuilder` 接口定义了一个类型，该类型使用生成器模式生成 `IHost` 的实例。此模板通过调用 *Host* 类中的静态 `CreateDefaultBuilder` 方法来创建一个新的 *HostBuilder*。

<!-- It then uses the builder to configure the IHost, which will be used to run the worker service application. The host provides features such as a dependency injection container and logging, just as we can use in ASP.NET Core applications. In fact, since .NET Core 3.0, ASP.NET Core web applications and .NET Core worker services both run on the same IHost. -->

然后，它使用生成器来配置 *IHost*，该 *IHost* 被用于运行 Worker Service 应用程序。宿主提供了依赖注入容器和日志记录等功能，就像我们可以在 ASP.NET Core 应用程序中使用的那样。事实上，从 .NET Core 3.0 开始，ASP.NET Core Web 应用程序和 .NET Core Worker Service 都运行在同一 *IHost* 上的。

<!-- There’s one service registration included by default which I’ll come back to a little later in this post. Let’s not worry about it for now. -->

默认情况下，它包含了一个服务注册，稍后我会在本文中介绍，暂时不用担心。

<!-- The CreateDefaultBuilder method is called from within the Main method and is used to build and then immediately run the host. When the runtime calls the Main method, the application will be started, and the host will keep it running, listening for typical shutdown signals such as the CTRL+C keys being pressed. -->

从 `Main` 方法中调用 `CreateDefaultBuilder` 方法，将构建并立即运行宿主。当 .NET 运行时调用 `Main` 方法时，应用程序启动，宿主将保持运行，监听标准的关闭信号（例如按下 `CTRL+C` 键）。

### 2. appsettings.json

<!-- The appsettings.json file will be very familiar if you have previously used ASP.NET Core. It is one of the common sources for application configuration. The host is configured to load application configuration from several sources when the application starts using any registered configuration providers. One such provider loads configuration from the appsettings.json file. This file contains JSON, structured to contain keys and values representing application configuration. These values can optionally by defined within sections which logically group related configuration. -->

如果您以前使用过 ASP.NET Core，将会非常熟悉 *appsettings.json* 文件，它是应用程序配置的常见来源之一。宿主被设计<!--（配置）-->为，当启动应用程序时，使用任意已注册的配置提供程序从多个来源加载应用程序配置。其中一种提供程序是从 *appsettings.json* 加载配置，该文件内容由 JSON 组成，其结构包含表示应用程序配置的键和值。这些值可以随意地定义在对相关配置按逻辑分组成的片段（Sections）内。

<!-- In worker services, the same configuration sources, including this appsettings.json file and environment variables will be inspected at startup, with the final configuration being built from the various sources. A number of default providers, and therefore sources, are loaded by default. If you need to, it’s possible to customise the providers which the host uses to load configuration data. -->

在 Worker Service 中，启动时会检查相同的配置源（包括此 *appsettings.json* 文件和环境变量），并从不同的源构建最终的配置。默认情况下会加载多种默认的提供程序，因此也会加载多种源。如果需要，您也可以自定义宿主用来加载配置数据的提供程序。

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Warning",
      "Microsoft.Hosting.Lifetime": "Information"
    }
  }
}
```

<!-- The default appsettings file in the template includes configuration settings for the logging library, which is available by default for worker services. The configuration here sets log levels for some of the logging contexts. -->

模板中的默认 *appsettings* 文件中包含日志记录库的配置设置项，默认对 Worker Service 可用。这里的配置是为某些日志记录上下文设置记录级别的。

### 3. Worker.cs

<!-- The `Worker` class is something new which you will not find in the default ASP.NET Core project template. This is where the magic of hosted services, combined with the host, provide the basis of a worker service. -->

*Worker* 是一个您在默认的 ASP.NET Core 项目模板中见不到的新类。它是托管服务与宿主相结合的魔力所在，提供了 Worker Service 的基础。

<!-- Let’s take a peek at the code. -->

让我们来看一下它的代码：

```csharp
public class Worker : BackgroundService
{
    private readonly ILogger<Worker> _logger;

    public Worker(ILogger<Worker> logger)
    {
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            _logger.LogInformation("Worker running at: {time}", DateTimeOffset.Now);
            await Task.Delay(1000, stoppingToken);
        }
    }
}
```

<!-- This class derives from the BackgroundService abstract base class. The BackgroundService class implements an interface named IHostedService. In my now outdated post from July 2017, I introduced the IHostedService interface and demonstrate how one could implement it to start a long-running task. -->

此类从 *BackgroundService* 抽象基类派生。*BackgroundService* 类实现了一个名为 *IHostedService* 的接口。

<!-- BackgroundService includes an abstract method named ExecuteAsync which we must override in our subclass, just as the worker class, provided in the worker service template, does here. ExecuteAsync returns a Task which internally the BackgroundService expects to be some long-running workload. It will start the Task, which then runs in the background. -->

*BackgroundService* 包含一个名为 `ExecuteAsync` 的抽象方法，我们必须在子类中重写该方法，就像 Worker Service 模板中提供的 *Worker* 类中所做的那样。`ExecuteAsync` 方法返回一个 *Task*，在 *BackgroundService* 内部，期望此 *Task* 是一些长时间运行的工作负载。该 *Task* 会被启动并在后台运行。

<!-- Internally, the host will start any registered implementations of IHostedService. This includes types which derive from the BackgroundService abstract class. Remember, BackgroundService implements IHostedService for us.  -->

在内部，宿主将启动 *IHostedService* 的所有注册实现（包括从 *BackgroundService* 抽象类派生的类型）。请记住，*BackgroundService* 为我们实现了 *IHostedService*。

### 4. 如何注册托管服务(IHostedService)？

<!-- The next logical question is, how do I register an IHostedService? If we head back to the code from Program.cs, we’ll find out. -->

下一个显而易见的问题是，如何注册 *IHostedService* ？ 如果我们返回到 *Program.cs* 的代码，我们将会找到答案：

```csharp
public static IHostBuilder CreateHostBuilder(string[] args) =>
    Host.CreateDefaultBuilder(args)
        .ConfigureServices((hostContext, services) =>
        {
            services.AddHostedService<Worker>();
        });
```

<!-- Inside the ConfigureServices method, types can be registered with the dependency injection container. An extension method is defined for the IServiceCollection called AddHostedService, which allows us to register a class which implements IHostedService. -->

在 `ConfigureServices` 方法中，可以向依赖注入容器注册类型。`AddHostedService` 是为 *IServiceCollection* 定义的一个扩展方法，它允许我们注册一个实现了 *IHostedService* 的类。

<!-- The template has already registered the Worker class as a hosted service.

At startup, the host will locate all registered instances of IHostedService and start them in order, at which point, their long-running workloads run as background Tasks. -->

该模板中已将 *Worker* 类注册为托管服务。

在启动时，宿主将找到已注册的 *IHostedService* 的所有实例，并按顺序启动它们，此时，它们的长时间运行的工作负载会作为后台任务来运行。

## 为什么要构建 .NET Core Worker Service？

<!-- The simple answer is – when and if you need them! If you have a requirement to develop a microservice which has no user interface and which performs long-running work, then a worker service is very likely going to be a good fit. -->

<!-- 简单的答案是——当您需要它们的时候！如果您需要开发一个微服务，它没有用户界面，并执行长时间运行的工作，那么 Worker Service 很可能是一个好的选择。 -->
简单的答案是——何时以及是否需要它们！如果您需要开发一个微服务，它没有用户界面，并执行长时间运行的工作，那么 Worker Service 很可能是一个好的选择。

<!-- Remember that a worker service is just a console application under the hood. That console application uses a host to turn the application into something which runs until it is signalled to stop. The host brings with it features like dependency injection that you’ll likely already familiar with. Using the same logging and configuration extensions available in ASP.NET Core makes it easy to develop worker services which should log information and which require some configuration. These requirements are nearly always present when building worker services that will run in the cloud. For example, you will likely need to provide configuration for any external services that your worker service will interact with. A queue URL for example. -->

请记住，Worker Service 的底层只是一个控制台应用程序。该控制台应用程序使用宿主将应用程序转换为运行的服务，直到收到停止的信号。宿主带来了您可能已经熟悉的一些特性，比如依赖关系注入。使用和 ASP.NET Core 中可用的相同的日志记录和配置扩展，使得开发可记录日志信息且需要一些配置的 Worker Service 变得相当轻松。当构建运行在云上的 Worker Service 时，几乎总会存在这种需求。例如，您可能需要为与您的 Worker Service 相交互的任何外部服务提供配置（比如一个队列 URL）。

<!-- Worker services can be used to extract responsibilities from existing ASP.NET Core applications (I cover this in my Pluralsight course) and to design new .NET Core based microservices. -->

Worker Service 可用于从现有的 ASP.NET Core 应用程序提取职责，设计新的基于 .NET Core 的微服务。

## 总结

<!-- In this post, I introduced the worker service project template and some potential use cases for worker services. We explored the three default files that are included in new projects created using the worker service template. -->

在本文中，我介绍了 Worker Service 项目模板，以及它的一些潜在用例。我们探索了使用 Worker Service 模板创建的新项目中所包含的三个默认文件。

### Worker Service 模板包含哪些文件？

<!-- - **Program.cs**： Entry point for the console application. Creates and runs a host to manage the application lifetime and make a long-running service.
- **appsettings.json**： – A JSON file which provides application configuration values.
- **Worker.cs**： – Derives from the BackgroundService base class to define long-running workloads which are executed as background Tasks. -->

- **Program.cs**： 控制台应用程序的入口点，创建并运行宿主以管理应用程序生命周期并生成一个长期运行的服务。
- **appsettings.json**：一个提供应用程序配置值的 JSON 文件。
- **Worker.cs**：派生自 *BackgroundService* 基类，用于定义作为后台任务执行的长时间运行的工作负载。

### Worker Service 是什么？

<!-- Applications which do not require user interaction.
Use a host to maintain the lifetime of the console application until the host is signalled to shut down. Turning a console application into a long-running service.
Include features common to ASP.NET Core such and dependency injection, logging and configuration.
Perform periodic and long-running workloads. -->

- 不需要用户交互的应用程序。
- 使用宿主来维护控制台应用程序的生命周期，直到宿主收到关闭的信号。将控制台应用程序转换为长时间运行的服务。
- 包含和 ASP.NET Core 相同的功能，如依赖注入、日志记录和配置。
- 执行定期和长时间运行的工作负载。

<br/>

> 作者 ： Steve Gordon  
> 译者 ： 技术译民  
> 出品 ： [技术译站](https://ittranslator.cn/)  
> 链接 ： [英文原文](https://www.stevejgordon.co.uk/what-are-dotnet-worker-services)
