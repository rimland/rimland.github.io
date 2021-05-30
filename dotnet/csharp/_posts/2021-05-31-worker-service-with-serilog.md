---
layout: post
title:  ".NET Worker Service 添加 Serilog 日志记录"
date:   2021-05-31 00:10:01 +0800
categories: dotnet csharp
author: 技术译民
tags: [Serilog, DotNet, Worker Service]
published: true
---

前面我们了解了 [.NET Worker Service 的入门知识](https://ittranslator.cn/dotnet/csharp/2021/05/06/what-are-dotnet-worker-services.html)[^part1] 和 [如何优雅退出 Worker Service](https://ittranslator.cn/dotnet/csharp/2021/05/17/worker-service-gracefully-shutdown.html) [^part2]，今天我们接着介绍一下如何为 Worker Service 添加 Serilog 日志记录。

[^part1]: <https://ittranslator.cn/dotnet/csharp/2021/05/06/what-are-dotnet-worker-services.html> .NET Worker Service 入门介绍
[^part2]: <https://ittranslator.cn/dotnet/csharp/2021/05/17/worker-service-gracefully-shutdown.html> 如何优雅退出 Worker Service

在实际的生产环境中，应用程序中记录日志是非常宝贵的。在许多情况下，开发人员无法直接访问生产环境来调试问题。高质量的日志记录为解决线上问题提供了线索和依据。

> [日志记录是将应用程序操作和状态记录到辅助接口的过程。](https://www.codeproject.com/Articles/42354/The-Art-of-Logging#what)

## .NET 日志记录框架

.NET 中有很多默认的[日志记录提供程序](https://docs.microsoft.com/zh-cn/dotnet/core/extensions/logging-providers)[^logging-providers]，它们可以将日志输出到控制台、Debug、EventSource 和 EventLog 等，例如在上一篇的示例中，默认的实现是将日志记录输出到了控制台窗口。

但是 .NET 中没有可以帮我们将日志信息输出到文件和数据库的内置提供程序，而这却是我们在生产环境中十分常见的应用场景。为了实现这一功能，我们需要为 .NET [实现自定义的日志记录提供程序](https://docs.microsoft.com/zh-cn/dotnet/core/extensions/custom-logging-provider)[^custom-provider]，这需要大量时间，因为需要考虑很多事情，比如读写性能、存储空间、配置等等。

[^logging-providers]: <https://docs.microsoft.com/zh-cn/dotnet/core/extensions/logging-providers>
[^custom-provider]: <https://docs.microsoft.com/zh-cn/dotnet/core/extensions/custom-logging-provider>

幸运的是，一些优秀的第三方程序包可以为我们提供帮助，.NET 中三种最流行的日志框架分别是：[log4net](https://logging.apache.org/log4net/)、[NLog](https://nlog-project.org/)、[Serilog](https://serilog.net/)，我们只需从 [NuGet](https://www.nuget.org/) 包存储库中获取它们，然后简单地配置一下便可以愉快地使用它们了。

### log4net

[log4net](https://logging.apache.org/log4net/)[^log4net] 是一个始于 2001 年的领先的日志记录框架，最初是 Java 框架 log4j 的端口。多年来，Apache Logging Services 项目持续进行开发，没有其他框架能像 log4net 一样久经考验。log4net 是所有现代 .NET 日志记录框架的鼻祖，在日志框架中，日志级别（log levels）、记录器(logger)和输出模块(appenders/targets/sinks)等概念几乎都是通用的[^vs]。相信所有多年使用 .NET 编程的朋友对 log4net 都相当熟悉。

[^log4net]: <https://logging.apache.org/log4net/>
[^vs]: <https://stackify.com/nlog-vs-log4net-vs-serilog/>

log4net 好用、稳定且灵活，但是它的配置相对来说比较复杂一些，而且很难实现结构化的日志记录。

### NLog

[NLog](https://nlog-project.org/)[^NLog] 也是一个相当老的项目，最早的版本发布于 2006 年，不过目前仍在积极开发中。NLog 从 v4.5 版本开始新增了[对结构化日志记录的支持](https://github.com/nlog/nlog/wiki/How-to-use-structured-logging)。

[^NLog]: <https://nlog-project.org/>

<!-- 在 NLog 框架中使用结构化日志非常容易。只需要一个 `@`  -->
<!-- 
因此，如您所见，在NLog框架中使用结构化日志非常容易。只需一个符号即可为您的日志提供更多上下文，这可以在错误处理过程中提供帮助。
-->

与 log4net 相比，NLog 的配置更加容易，并且基于代码的配置也比较简洁。NLog 中的默认设置比 log4net 中的默认设置会更合理一些。需要注意的一点是，当使用这两个框架，您可能会遇到同一个问题，那就是配置有问题（比如忘记复制配置文件）时，不会得到任何提示，也不会输出日志信息。假如您将应用部署上线以后遇到这个情况，这将是致命的，因为许多问题的检查都是依赖于日志记录的。当然，这么设计的初衷是避免让应用程序因日志问题而导致崩溃。

### Serilog

[Serilog](https://serilog.net/)[^Serilog] 日志记录框架发布于 2013 年，相对来说是一个较新的框架。与其他日志框架不同的是，Serilog 在设计时考虑了强大的结构化事件数据，提供了开箱即用的结构化日志实现。所以 Serilog 对结构化日志的支持非常好，而且配置简洁。Serilog 中的日志可以发送到许多终端，Serilog 称这些终端为“输出模块库(sinks)”。您可以在 <https://github.com/serilog/serilog/wiki/Provided-Sinks> 页面查看非常全面的列表。

[^Serilog]: <https://serilog.net/>

Serilog 中还有一个功能强大的概念是[Enricher](https://github.com/serilog/serilog/wiki/Enrichment)，可以通过各种方式来丰富日志事件的属性，从而向日志添加新的信息。NuGet 中提供了一些预建的 Enricher，您也可以通过实现 *ILogEventEnricher* 构建自己的 Enricher。

## 结构化日志记录

或许您已注意到了，前面我多次提到*结构化日志记录*，那么什么是结构化日志记录，为什么我要强调结构化日志记录呢？

通常情况下，您会发现日志信息基本上包含两部分内容：*消息模板*和*值*，而 .NET 通常只接受诸如 `string.Format(...)` 这样的的输入字符串。比如：

```csharp
var position = new { Latitude = 25, Longitude = 134 };
var elapsedMs = 34;

log.Information("Processed Position, Latitude:{0}, Longitude: {1} in Elapsed:{2} ms.", position.Latitude, position.Longitude, elapsedMs);
```

这条日志只是简单地被转换为文本输出到日志文件中：

```text
[INF] Processed Position, Latitude:25, Longitude: 134 in Elapsed:34 ms.
```

这看起来很好，但它可以更好！

当我们遇到问题的时候，我们需要根据一些已知的信息来检索日志记录。比如，假设我们已知 Latitude 为 25，Longitude 为 134，我们要查找这条日志的话，该怎么做呢？由于上面输出的日志信息是简单的文本，有经验的您可能立马会想到使用正则表达式或者简单的字符串匹配，但这样不仅不够直观，实现起来也比较麻烦。有没有更好的方法呢？

如果我们在存储日志的时候，将其中包含值的部分作为特征提取出来，形成由键和值组成的有结构的 JSON 对象，作为每条日志记录的属性(`properties`)：

```json
{"Position": {"Latitude": 25, "Longitude": 134}, "Elapsed": 34}
```

然后，在我们检索的时候只需要查找日志记录的 `properties` 就可以了，它是结构化的，检索起来既方便又直观。

Serilog 帮我们实现了这一点，您只需改动一行代码就可以了：

```csharp
log.Information("Processed {@Position} in {Elapsed:000} ms.", position, elapsedMs);
```

Position 前面的 `@` 是*解构操作符*，它告诉 Serilog 需要将传入的对象序列化，而不是调用 `ToString()` 转换它。

Elapsed 之后的 `:000` 是一个标准的 .NET 格式字符串，它决定该属性的呈现方式。

## 为 Worker Service 添加 Serilog 日志

现在，您已经大概了解了 Serilog，以及为什么我会选用它的原因。下面我用一个实例来介绍一下它的用法。

需要用到的开发工具：

- Visual Studio Code：(<https://code.visualstudio.com/>)
- 最新的 .NET SDK：(<https://dotnet.microsoft.com/download>)
- DBeaver：(<https://dbeaver.io/>)

本示例基于[上一篇文章中的 Worker Service 源码](https://github.com/ITTranslate/WorkerServiceGracefullyShutdown)[^precode]修改，如果您安装有 git，可以用下面的命令获取它：

[^precode]: <https://github.com/ITTranslate/WorkerServiceGracefullyShutdown>

```bash
git clone git@github.com:ITTranslate/WorkerServiceGracefullyShutdown.git
```

然后，使用 Visual Studio Code 打开此项目，运行一下，以确保一切正常：

```bash
dotnet build
dotnet run
```

您在 [Serilog 官方文档](https://serilog.net/)中可以看到很多例子，不过大部分示例都是使用编码的方式配置 Serilog，或者以 xml 的方式配置在老旧项目的 AppSettings 文件中。

在本文的示例中，我将以 JSON 的方式把 Serilog 的配置放置在现在流行的 *appsettings.json* 配置文件中。我们只需要修改 *Program.cs* 和 *appsettings.json*，不需要修改 *Worker.cs*。

### 安装依赖程序包

首先，安装我们所需的程序包：

```bash
dotnet add package Serilog
dotnet add package Serilog.Settings.Configuration
dotnet add package Serilog.Extensions.Hosting
dotnet add package Serilog.Sinks.Console
dotnet add package Serilog.Sinks.RollingFile
```

### 修改 *Program*

然后，修改 *Program* 中的 `Main` 方法，从 *appsettings.json* 读取配置并根据配置构建 Serilog 日志记录器的实例：

```csharp
public static void Main(string[] args)
{
    var configuration = new ConfigurationBuilder()
        .SetBasePath(Directory.GetCurrentDirectory())
        .AddJsonFile("appsettings.json")
        .AddJsonFile($"appsettings.{Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT") ?? "Production"}.json", true)
        .Build();

    // 全局共享的日志记录器
    Log.Logger = new LoggerConfiguration()
        .ReadFrom.Configuration(configuration)
        .Enrich.FromLogContext()
        .CreateLogger();

    try
    {
        var separator = new string('-', 30);

        Log.Information($"{separator} Starting host {separator} ");

        CreateHostBuilder(args).Build().Run();

        Log.Information($"{separator} Exit host {separator} ");
    }
    catch (Exception ex)
    {
        Log.Fatal(ex, "Host terminated unexpectedly");
    }
    finally
    {
        Log.CloseAndFlush(); // 释放资源
    }
}
```

修改 *Program* 中的 `CreateHostBuilder` 方法，将 Serilog 设置为日志提供程序：

```csharp
public static IHostBuilder CreateHostBuilder(string[] args) =>
    Host.CreateDefaultBuilder(args)
        .ConfigureServices((hostContext, services) =>
        {
            services.AddHostedService<Worker>();
        })
        .UseSerilog(); //将 Serilog 设置为日志提供程序
```

### 修改配置文件 *appsettings.json*

修改应用程序配置文件 *appsettings.json*，添加 `Serilog` 节点(Section)。

Serilog 所需的配置节点名称默认为 `Serilog`；当然，您也可以改变它，但要在读取的时候指定节点名。

```json
{
  "Serilog": {
    "Using": [
      "Serilog.Sinks.Console",
      "Serilog.Sinks.RollingFile"
    ],
    "MinimalLevel": {
      "Default": "Information",
      "Override": {
        "System": "Warning",
        "Microsoft": "Information"
      }
    },
    "WriteTo": [
      {
        "Name": "Console"
      },
      {
        "Name": "RollingFile",
        "Args": {
          "pathFormat": "Logs\\{Hour}.txt",
        }
      }
    ]
  }
}
```

<!-- ### Serilog 配置 -->

看一下我们都配置了什么：

> 您可以在 [Serilog.Settings.Configuration 包](https://github.com/serilog/serilog-settings-configuration)[^config] 的文档中找到这些配置的说明。

[^config]: <https://github.com/serilog/serilog-settings-configuration>

#### Using 节点

Using 节点包含了所需的程序集列表，用于自动发现 *WriteTo* 和 *Enrich* 等节点中配置的方法所属的程序集。

对于 .NET Core 项目，构建工具会生成 *.deps.json* 文件，并且 *Serilog.Settings.Configuration* 包使用 *Microsoft.Extensions.DependencyModel* 实现了一个约定，从而可以从名称任意位置带有*Serilog* 的依赖程序包中找出正确的包，并从中提取配置的方法。因此，上面示例中的 Using 节点是可以省略的。

#### MinimalLevel 节点

MinimumLevel 对象配置输出日志的最低级别。添加 MinimalLevel.Override 项，可以覆盖某些特定命名空间的最小级别。

#### WriteTo 节点

使用 WriteTo 对象配置输出模块(sinks)，可以同时配置并激活多个输出模块。本示例中我们配置了 *Console* 和 *RollingFile*，前者将日志输出到控制台，后者将日志输出到滚动文件中。

> 将日志输出到文件，您还可以使用 [Serilog.Sinks.File](https://github.com/serilog/serilog-sinks-file) 程序包，它也支持滚动文件。

`Args` 用于配置 Sink 的选项。本例中 `pathFormat` 配置了日志文件的存放位置，该项的值中 `{Hour}` 是滚动日志文件的 *文件名格式说明符*。该输出模块支持三种不同的文件名格式说明符（区分大小写）：

- `{Date}`：每天创建一个文件。文件名使用 `yyyyMMdd` 格式。
- `{Hour}`：每小时创建一个文件。文件名使用 `yyyyMMddHH` 格式。
- `{HalfHour}`：每半小时创建一个文件。文件名使用 `yyyyMMddHHmm` 格式。

完成以上这些配置后，我们运行应用程序：

```bash
dotnet build
dotnet run
```

您会发现在应用程序根目录下多了一个 *Logs* 文件夹，可以将日志信息正常输出到文件了。同时，控制台也有输出日志。两者的输出格式略有不同，控制台中的输出更简洁一些。

### 添加 Enricher 和格式化输出

前文我提到过 Serilog 中还有一个功能强大的概念是[Enricher](https://github.com/serilog/serilog/wiki/Enrichment)，这里我就以预建的 Enricher 来举例说明一下它的使用。

添加以下依赖程序包：

```bash
dotnet add package Serilog.Enrichers.Thread
dotnet add package Serilog.Enrichers.Environment
dotnet add package Serilog.Enrichers.Process
```

这三个 Enricher 分别提供了不同的信息以丰富日志事件的属性。

- **Serilog.Enrichers.Environment** 提供 `WithMachineName()` 和 `WithEnvironmentUserName()`
- **Serilog.Enrichers.Process** 提供 `WithProcessId()`
- **Serilog.Enrichers.Thread** 提供 `WithThreadId()`

修改 *appsettings.json*，向 Serilog 配置对象添加 *Enrich* 配置节点，以丰富日志事件的信息：

```json
"Enrich": [
  "WithMachineName",
  "WithProcessId",
  "WithProcessName",
  "WithThreadId"
]
```

修改 *appsettings.json*，向 WriteTo 下的 RollingFile 对象节点的 *Args* 添加一个 `outputTemplate` 选项，以自定义输出消息模板：

```json
{
  "Name": "RollingFile",
  "Args": {
    "pathFormat": "Logs\\{HalfHour}.txt",
    "outputTemplate": "{Timestamp:o} [{Level:u3}] ({MachineName}/{ProcessId}/{ProcessName}/{ThreadId}) {Message}{NewLine}{Exception}"
  }
}
```

修改好配置后，重新运行应用程序：

```bash
dotnet build
dotnet run
```

再查看一下日志文件，您会发现日志已经按我们自定义的格式输出了，并且多了一些我们使用 Enricher 获得的信息：*(计算机名/进程ID/进程名称/线程ID)*。

```text
2021-05-27T18:15:40.2992230+08:00 [INF] (DESKTOP-6LTYU3O/54376/MyService/1) Worker running at: 05/27/2021 18:15:40 +08:00
```

## 将日志保存到数据库

前文我提到过日志文件的属性(`properties`)，为什么直到现在还没有看到过它呢？

这是因为，当 Serilog 将日志事件写入文件或控制台时，消息模板和属性将仅会呈现为易于阅读的友好文本。而当我们将日志事件发送到基于云的日志服务器、数据库和消息队列等输出模块(sinks)时，就可以保存为结构化的数据了。

为了简便起见，我以 SQLite 数据库为例来介绍一下。

添加 [SQLite 依赖程序包](https://github.com/saleem-mirza/serilog-sinks-sqlite)：

```bash
dotnet add package Serilog.Sinks.SQLite
```

修改 *appsettings.json*，在 Serilog 配置中的 WriteTo 节点下添加以下配置节点，以向 SQLite 输出日志：

```json
{
  "Name": "SQLite",
  "Args": {
    "sqliteDbPath": "Logs\\log.db",
    "tableName": "Logs",
    "maxDatabaseSize": 1,
    "rollOver": true
  }
}
```

解释一下 *Args* 各个选项的作用：

- **sqliteDbPath：** SQLite 数据库的路径。
- **tableName：** 用于存储日志的 SQLite 表的名称。
- **maxDatabaseSize：** 数据库的最大文件大小，可以以 MB 为单位增加。默认为 10MB，最大为 20GB。为了方便测试，我在这里将其设置为 1MB。
- **rollOver：** 如果文件大小超过最大数据库文件大小，则创建滚动备份，默认为 true。

此时，再次运行应用程序：

```bash
dotnet build
dotnet run
```

您将会在应用程序目录下的 Logs 文件夹中看到一个 SQLite 数据库文件 *log.db*。使用 DBeaver 打开检查一下：

![Serilog SQLite table](https://ittranslator.cn/assets/images/202105/Serilog-SQLite-table.png)

可以看到，SQLite 输出模块自动为我们创建了数据库和表，日志记录成功了。

我们配置了数据库文件大于 1MB 时自动滚动备份，可以多输出一些日志测试一下，看它是否有自动滚动备份。我的测试结果如下图：

![Serilog SQLite dbs](https://ittranslator.cn/assets/images/202105/Serilog-SQLite-dbs.png)

再看一下 Serilog 捕获的日志事件的属性(`properties`)：

![Serilog SQLite table properties](https://ittranslator.cn/assets/images/202105/Serilog-SQLite-table-Properties.png)

Serilog 使用[消息模板](https://messagetemplates.org/)、以及命名和位置参数扩展 .NET 的格式化字符串，不过 Serilog 捕获与每个命名参数相关联的值，而不是直接将事件格式化为文本。我们添加几行代码，测试一下 Serilog 捕获日志事件的情况：

```csharp
var position = new { Latitude = 25, Longitude = 134 };
var elapsedMs = 34;
Log.Information("Processed {@Position} in {Elapsed:000} ms.", position, elapsedMs);
```

上面的示例在日志事件中记录了两个属性：*Position* 和 *Elapsed*，*Position* 前面的 `@` 操作符告诉 Serilog 要序列化传入的对象。最终我们在数据库中存储的结构化的 `Properties` 如下所示：

```json
{"Position":{"Latitude":25,"Longitude":134},"Elapsed":34,"MachineName":"DESKTOP-6LVG1OL","ProcessId":54332,"ProcessName":"MyService","ThreadId":1}
```

![Serilog SQLite structured data](https://ittranslator.cn/assets/images/202105/Serilog-SQLite-structured-data.png)

Serilog 对结构化事件数据深入且丰富的支持，开创了原本使用传统日志记录器所没有的巨大的诊断可能性。

## 总结

在本文中，我介绍了 .NET 中常用的结构化事件日志框架 Serilog，以及使用它的原因和好处；并通过一个 .NET Worker Service 实例，说明如何将日志保存到滚动文件和数据库中。

Serilog 是一个稳定的、配置简洁的、功能强大的、可扩展的、支持结构化日志事件的 .NET 日志记录提供程序，值得我们在应用中广泛使用。

您可以从 GitHub [下载本文中的源码](https://github.com/ITTranslate/WorkerServiceWithSerilog)[^github]。

[^github]: <https://github.com/ITTranslate/WorkerServiceWithSerilog> 源码下载

<br />

> 作者 ： 技术译民  
> 出品 ： [技术译站](https://ittranslator.cn/)

<!-- 
https://github.com/serilog/serilog/wiki/Structured-Data

https://stackify.com/nlog-vs-log4net-vs-serilog/ see also

https://enlabsoftware.com/development/top-logging-frameworks-for-net-applications-and-the-best-configuration-tips.html

https://docs.microsoft.com/en-us/dotnet/core/extensions/custom-logging-provider

https://stackify.com/log4net-guide-dotnet-logging/

https://redwerk.com/blog/structured-logging-in-third-party-net-logging-frameworks/\

https://github.com/nlog/nlog/wiki/How-to-use-structured-logging
-->
