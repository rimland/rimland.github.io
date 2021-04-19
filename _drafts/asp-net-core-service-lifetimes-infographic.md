---
layout: post
title:  "ASP.NET Core Service 生命周期"
date:   2021-04-19 00:10:10 +0800
categories: dotnet csharp
published: true
---

> 翻译自 Waqas Anwar 2020年11月8日的文章 [《ASP.NET Core Service Lifetimes (Infographic)》](https://www.ezzylearning.net/tutorial/asp-net-core-service-lifetimes-infographic) [^1]

[^1]: <https://www.ezzylearning.net/tutorial/asp-net-core-service-lifetimes-infographic> ASP.NET Core Service Lifetimes (Infographic)

ASP.NET Core supports the dependency injection (DI) software design pattern that allows us to register services and control how these services will be instantiated and injected in different components. Some services will be instantiated for a short time and will be available only in a particular component and request. Some will be instantiated just once and will be available throughout the application. Here are the service lifetimes available in ASP.NET Core.

![ASP.NET Core Service Lifetimes (Infographic](/assets/images//202104/ASP.NET-Core-Service-Lifetime-Infographic.png)

<br/>

> 作者 ： Waqas Anwar  
> 译者 ： 技术译民  
> 出品 ： [技术译站](https://ittranslator.cn/)  
> 链接 ： [英文原文](https://www.ezzylearning.net/tutorial/asp-net-core-service-lifetimes-infographic)
