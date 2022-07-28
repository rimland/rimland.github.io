---
layout: post
title:  "IOptions、IOptionsSnapshot 和 IOptionsMonitor 之间的区别"
date:   2021-08-16 00:10:10 +0800
categories: dotnet csharp
tags: [DotNet]
published: true
---

> 翻译自 Farhad Zamani 2021年3月29日的文章 [《Difference between IOptions, IOptionsSnapshot and IOptionsMonitor》](https://dotnetdocs.ir/Post/42/difference-between-ioptions-ioptionssnapshot-and-ioptionsmonitor) [^1]

[^1]: <https://dotnetdocs.ir/Post/42/difference-between-ioptions-ioptionssnapshot-and-ioptionsmonitor>

本文我们来讨论一下 *IOptions*, *IOptionsSnapshot* 和 *IOptionsMonitor*  之间的区别。

The IOptions interface works as a Singleton and therefore can be injected into all services with any lifetime (Lifetime). If you change the value of the appsettings.json file after running the program and use this interface to read the data, you will not see your changes, because this service is Singleton and is only validated at the time of running the program. If the program does not run again, it shows the same initial values.

接口 *IOptions* 是作为 **Singleton**（单例）工作的，因此可以被注入到任一生命周期（Lifetime）的所有的服务中。在程序启动之后，如果您更改了 *appsettings.json* 文件中的值，那么使用这个接口读取数据，您将不会看到更改的数据，因为该服务是 Singleton 的，
 如果更改appsettings的值。在运行程序后，使用这个接口读取数据，你不会看到你的更改，因为这个服务是Singleton，只在运行程序时验证。如果程序没有再次运行，它将显示相同的初始值。
