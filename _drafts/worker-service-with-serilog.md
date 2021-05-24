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
https://stackify.com/nlog-vs-log4net-vs-serilog/ 

https://enlabsoftware.com/development/top-logging-frameworks-for-net-applications-and-the-best-configuration-tips.html

https://docs.microsoft.com/en-us/dotnet/core/extensions/custom-logging-provider
-->

## log4net、NLog、Serilog
