---
layout: post
title:  ".NET 中的 Worker Services"
date:   2021-05-02 00:10:10 +0800
categories: dotnet csharp
published: true
---

> 翻译自 Steve Gordon 2020年3月30日的文章 [《WHAT ARE .NET WORKER SERVICES?》](https://www.stevejgordon.co.uk/what-are-dotnet-worker-services) [^1]

[^1]: <https://www.stevejgordon.co.uk/what-are-dotnet-worker-services> WHAT ARE .NET WORKER SERVICES?

<!-- With the release of .NET Core 3.0, the ASP.NET team introduced a new “Worker Service” project template, which is available as part of the SDK. In this post, I’ll introduce the new template, along with some practical examples of the kinds of services which I develop using it. -->

随着 .NET Core 3.0 的发布，ASP.NET 团队引入了一个新的 “Worker Service” 项目模板，该模板作为 SDK 的一部分提供。在本文中，我将介绍新模板，以及使用它开发的各种服务的一些实际示例。

If you find the information in this post useful and plan to build your own worker services, may I suggest viewing my new course on Pluralsight – “Building ASP.NET Core Hosted Services and .NET Core Worker Services“. I dive deeply into worker services and demonstrate how to refactor parts of a web application as microservices. 

## 什么是 .NET Core Worker Service？

<!-- A worker service is a .NET project built using a template which supplies a few useful features that turn a regular console application into something more powerful. A worker service runs on top of the concept of a host, which maintains the lifetime of the application. The host also makes available some familiar features, such as dependency injection, logging and configuration. -->

Worker Service 是使用模板构建的 .NET 项目，该模板提供了一些有用的功能，可以将常规控制台应用程序变得到更强大。Worker Service 运行在宿主(Host)的概念之上，宿主维护应用程序的生命周期。宿主还提供了一些熟悉的特性，如依赖注入、日志记录和配置。

<!-- Worker services will generally be long-running services, performing some regularly occurring workload. -->

Worker Service 通常是长时间运行的服务，执行一些规律发生的工作负载。

## Worker Service 的例子

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

还可以开发一个 Worker Service，该服务从头到尾执行一个过程，然后关闭。结合调度程序，便可以支持定期的批处理工作负载。例如，调度程序每隔一小时启动一次服务，计算出一些汇总数据，然后关闭。

Worker services do not have a user interface, nor will they support direct user interaction. They are particularly applicable when designing a microservices architecture. Here responsibilities are often split into distinct, separately deployable and scalable services. It’s not uncommon to have numerous worker services as your microservices architecture grows and evolves.

Worker Service 没有用户界面，也不支持直接的用户交互，它们在设计微服务架构时特别适用。在微服务体系结构中，职责通常被划分为不同的、可单独部署的和可伸缩的服务。随着微服务架构的成长和发展，拥有大量的 Worker Service 会变得越来越常见。

## Worker Service 模板提供了什么？

<!-- It’s entirely possible to develop a long-running worker service without using the worker service template. I was doing so in early versions of .NET Core, manually establishing a host with a dependency injection container and then initiating my processing workloads. -->

完全可以在不使用 Worker Service 模板的情况下开发长时间运行的 Worker Service。在 .NET Core 的早期版本中我是这样做的，使用依赖项注入容器手动建立宿主，然后启动我的处理工作负载。

<!-- The worker service template includes useful foundational components, like dependency injection, by default so that we can focus on building our business logic on top. It includes a host which manages the lifecycle of the application. -->

默认情况下，Worker Service 模板包含了有用的基础组件，比如依赖项注入，这样我们就可以集中精力在其上构建业务逻辑。它包括了一个管理应用程序生命周期的宿主。

<!-- The worker service template is reasonably basic and includes just three core files out of the box. -->

Worker Service 模板是相当基础的，它只包含了三个开箱即用的核心文件。

### 1. Program.cs

<!-- The first of which is a `Program` class. This class consists of the required Main method entry point for .NET console applications. The .NET runtime expects to locate this method within the `Program` class when it starts your .NET application. -->

第一个是 **Program** 类。该类包含 .NET 控制台应用程序所必需的 `Main` 方法入口点，.NET 运行时期望在启动 .NET 应用程序时在 *Program* 类中找到此方法。

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

作为 Worker Service 模板的一部分，包含在 *Program* 类中的是 `CreateHostBuilder` 私有方法，该方法创建一个 `IHostBuilder`。`IHostBuilder` 接口定义了一个类型，该类型使用生成器模式生成 `IHost` 的实例。此模板通过调用 *Host* 类中的静态 `CreateDefaultBuilder` 方法来创建一个新的 *HostBuilder*。

<!-- It then uses the builder to configure the IHost, which will be used to run the worker service application. The host provides features such as a dependency injection container and logging, just as we can use in ASP.NET Core applications. In fact, since .NET Core 3.0, ASP.NET Core web applications and .NET Core worker services both run on the same IHost. -->

然后，它使用生成器来配置 IHost，该 IHost 将用于运行 Worker Service 应用程序。宿主提供了依赖项注入容器和日志记录等功能，就像我们可以在 ASP.NET Core 应用程序中使用的那样。事实上，从 .NET Core 3.0 开始，ASP.NET Core Web 应用程序和 .NET Core Worker Service 都运行在同一 IHost 上。

There’s one service registration included by default which I’ll come back to a little later in this post. Let’s not worry about it for now.

默认情况下，包含了一个服务注册，稍后我将在本文中介绍，暂时不用担心。

<!-- The CreateDefaultBuilder method is called from within the Main method and is used to build and then immediately run the host. When the runtime calls the Main method, the application will be started, and the host will keep it running, listening for typical shutdown signals such as the CTRL+C keys being pressed. -->

从 `Main` 方法中调用 `CreateDefaultBuilder` 方法，将构建然后立即运行宿主。当 .NET 运行时调用 `Main` 方法时，应用程序启动，宿主将保持运行，监听标准的关闭信号，例如按下 `CTRL+C` 键。

### 2. appsettings.json

<!-- The appsettings.json file will be very familiar if you have previously used ASP.NET Core. It is one of the common sources for application configuration. The host is configured to load application configuration from several sources when the application starts using any registered configuration providers. One such provider loads configuration from the appsettings.json file. This file contains JSON, structured to contain keys and values representing application configuration. These values can optionally by defined within sections which logically group related configuration. -->

如果您以前使用过 ASP.NET Core，将会非常熟悉 *appsettings.json* 文件。它是应用程序配置的常见来源之一。宿主配置为，当使用任一已注册的配置提供程序启动应用程序时，从多个来源加载应用程序配置。其中一种提供程序是从 *appsettings.json* 加载配置，该文件包含 JSON，其结构包含表示应用程序配置的键和值。这些值可以随意地定义在对相关配置按逻辑分组成的片段（sections）内。

In worker services, the same configuration sources, including this appsettings.json file and environment variables will be inspected at startup, with the final configuration being built from the various sources. A number of default providers, and therefore sources, are loaded by default. If you need to, it’s possible to customise the providers which the host uses to load configuration data.

在 Worker Service 中，启动时会检查相同的配置源（包括此 *appsettings.json* 文件和环境变量），并从不同的源构建最终配置。默认情况下会加载多种默认的提供程序，因此也会加载多种源。如果需要，您也可以自定义宿主用来加载配置数据的提供程序。

```csharp
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

The default appsettings file in the template includes configuration settings for the logging library, which is available by default for worker services. The configuration here sets log levels for some of the logging contexts.

模板中的默认 *appsettings* 文件包括日志记录库的配置设置，默认情况下可用于 Worker Service。这里的配置为某些日志记录上下文设置日志级别。

### Worker.cs

The `Worker` class is something new which you will not find in the default ASP.NET Core project template. This is where the magic of hosted services, combined with the host, provide the basis of a worker service.

<br/>

> 作者 ： Steve Gordon  
> 译者 ： 技术译民  
> 出品 ： [技术译站](https://ittranslator.cn/)  
> 链接 ： [英文原文](https://www.stevejgordon.co.uk/what-are-dotnet-worker-services)
