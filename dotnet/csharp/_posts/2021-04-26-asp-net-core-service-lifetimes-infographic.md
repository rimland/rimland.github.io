---
layout: post
title:  "一图看懂 ASP.NET Core 中的服务生命周期"
date:   2021-04-26 00:10:10 +0800
categories: dotnet csharp
published: true
---

> 翻译自 Waqas Anwar 2020年11月8日的文章 [《ASP.NET Core Service Lifetimes (Infographic)》](https://www.ezzylearning.net/tutorial/asp-net-core-service-lifetimes-infographic) [^1]

[^1]: <https://www.ezzylearning.net/tutorial/asp-net-core-service-lifetimes-infographic> ASP.NET Core Service Lifetimes (Infographic)

<!-- ASP.NET Core supports the dependency injection (DI) software design pattern that allows us to register services and control how these services will be instantiated and injected in different components. Some services will be instantiated for a short time and will be available only in a particular component and request. Some will be instantiated just once and will be available throughout the application. Here are the service lifetimes available in ASP.NET Core. -->

ASP.NET Core 支持依赖关系注入（DI）软件设计模式，该模式允许我们注册服务、控制如何实例化这些服务并将其注入到不同的组件中。一些服务可以在短周期内实例化，并且仅在特定的组件和请求中可用；一些实例仅被实例化一次，并在整个应用程序生命周期中可用。这就是 ASP.NET Core 中可用的服务生命周期，共三种，下面我们来分别介绍一下。

## Singleton（单例）

<!-- A single instance of the service class is created, stored in memory and reused throughout the application. We can use Singleton for services that are expensive to instantiate. We can register Singleton service using the **AddSingleton** method as follows: -->

创建服务类的单个实例，将其存储在内存中，并在整个应用程序中重复使用。我们可以将 *Singleton* 用于实例化成本昂贵的服务。可以使用 **AddSingleton** 方法注册 *Singleton* 服务，如下所示：

```csharp
services.AddSingleton<IProductService, ProductService>();
```

## Scoped（范围内）

<!-- The service instance will be created once per request. All middlewares, MVC controllers, etc. that participate in handling of a single request will get the same instance. A good candidate for a scoped service is an Entity Framework context. We can register Scoped service using the AddScoped method as follows: -->

每个请求会创建一次服务实例。参与处理单个请求的所有中间件、MVC 控制器等等，都将获得相同的实例。实体框架上下文（Entity Framework context）是使用 *Scoped* 服务的一个很好的场景。我们可以使用 **AddScoped** 方法注册 *Scoped* 服务，如下所示：

```csharp
services.AddScoped<IProductService, ProductService>();
```

## Transient（临时）

<!-- Transient lifetime services are created each time they’re requested. This lifetime works best for lightweight, stateless services. We can register Transient service using the AddTransient method as follows: -->

每次请求 *Transient* 生命周期服务时都会创建它们。此生命周期最适合轻量级、无状态的服务。我们可以使用 **AddTransient** 方法注册 *Transient* 服务，如下所示：

```csharp
services.AddTransient<IProductService, ProductService>();
```

<!-- If you want to visualize the above concepts then here is an infographic for your quick reference. -->

如果您想将上述概念形象化，那么这里有一张图表，供您快速参考。

![ASP.NET Core Service Lifetimes (Infographic](https://ittranslator.cn/assets/images//202104/ASP.NET-Core-Service-Lifetime-Infographic-t.png)

> 译者注：  
> 图中背景颜色(深浅)不同的 `Instance` 代表不同的服务实例。  
> 这算得上描述 *服务生命周期* 最简单易懂的图解吗？

<br/>

> 作者 ： Waqas Anwar  
> 翻译 ： [技术译站](https://ittranslator.cn/)  
> 链接 ： [英文原文](https://www.ezzylearning.net/tutorial/asp-net-core-service-lifetimes-infographic)
