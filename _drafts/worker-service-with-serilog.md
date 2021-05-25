---
layout: post
title:  ".NET Worker Service 添加 Serilog 日志记录"
date:   2021-05-25 00:10:01 +0800
categories: dotnet csharp
author: 技术译民
tags: [DotNet, Worker Service]
published: true
---

前面我们了解了 [.NET Worker Service 的入门知识](https://ittranslator.cn/dotnet/csharp/2021/05/06/what-are-dotnet-worker-services.html)[^part1] 和 [如何优雅退出 Worker Service](https://ittranslator.cn/dotnet/csharp/2021/05/17/worker-service-gracefully-shutdown.html) [^part2]，今天我们接着介绍一下如何为 Worker Service 添加 Serilog 日志记录。

[^part1]: <https://ittranslator.cn/dotnet/csharp/2021/05/06/what-are-dotnet-worker-services.html> .NET Worker Service 入门介绍
[^part2]: <https://ittranslator.cn/dotnet/csharp/2021/05/17/worker-service-gracefully-shutdown.html> 如何优雅退出 Worker Service

<!-- 
https://stackify.com/nlog-vs-log4net-vs-serilog/ see also

https://enlabsoftware.com/development/top-logging-frameworks-for-net-applications-and-the-best-configuration-tips.html

https://docs.microsoft.com/en-us/dotnet/core/extensions/custom-logging-provider

https://github.com/nlog/nlog/wiki/How-to-use-structured-logging

https://stackify.com/log4net-guide-dotnet-logging/

https://redwerk.com/blog/structured-logging-in-third-party-net-logging-frameworks/
-->

在实际的生产环境中，应用程序中记录日志是非常宝贵的。在许多情况下，开发人员无法直接访问生产环境来调试问题。高质量的日志是解决线上问题的线索和依据。

> [日志记录是将应用程序操作和状态记录到辅助接口的过程。](https://www.codeproject.com/Articles/42354/The-Art-of-Logging#what)

## .NET 日志记录框架

.NET 中有很多默认的[日志记录提供程序](https://docs.microsoft.com/zh-cn/dotnet/core/extensions/logging-providers)[^logging-providers]，它们可以将日志输出到控制台、Debug、EventSource 和 EventLog 等，例如在上一篇的示例中，默认的实现是将日志记录输出到了控制台窗口。

但是 .NET 中没有内置的提供程序可以帮我们将日志信息输出文件和数据库，而这却是我们在生产环境中常见的应用场景。为了实现这一功能，我们需要为 .NET [实现自定义的日志记录提供程序](https://docs.microsoft.com/zh-cn/dotnet/core/extensions/custom-logging-provider)[^custom-provider]，这需要大量时间，因为我们需要考虑很多事情，比如读写性能、存储空间、配置等等。

[^logging-providers]: <https://docs.microsoft.com/zh-cn/dotnet/core/extensions/logging-providers>
[^custom-provider]: <https://docs.microsoft.com/zh-cn/dotnet/core/extensions/custom-logging-provider>

幸运的是，一些优秀的第三方软件包可以为我们提供帮助，.NET 中三种最流行的日志框架分别是：[log4net](https://logging.apache.org/log4net/)、[NLog](https://nlog-project.org/)、[Serilog](https://serilog.net/)，我们只需从 [NuGet](https://www.nuget.org/) 包存储库中获取它们，然后简单地配置一下便可以使用它们了。
