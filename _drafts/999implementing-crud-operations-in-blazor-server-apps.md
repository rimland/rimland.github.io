---
layout: post
title:  "Blazor Server 应用程序中进行 HTTP 请求"
date:   2021-08-19 00:10:10 +0800
categories: dotnet csharp
tags: [DotNet, Blazor]
published: true
---

> 翻译自 Waqas Anwar 2021年7月11日的文章 [《Implementing CRUD Operations in Blazor Server Apps》](https://www.ezzylearning.net/tutorial/implementing-crud-operations-in-blazor-server-apps) [^1]

[^1]: <https://www.ezzylearning.net/tutorial/implementing-crud-operations-in-blazor-server-apps> Implementing CRUD Operations in Blazor Server Apps

![Implementing-CRUD-Operations-in-Blazor-Server-Apps](https://www.ezzylearning.net/wp-content/uploads/Implementing-CRUD-Operations-in-Blazor-Server-Apps.png)


Blazor is a free, open-source, single-page apps (SPA) development framework that enables developers to build interactive web apps using HTML, CSS, and C# instead of JavaScript. We can build either Blazor WebAssembly or Blazor Server Apps using this popular framework and both hosting models have their own pros and cons. Blazor Server apps run on the server where they can enjoy the full support of .NET runtime and use any .NET library. I have already written several tutorials on Blazor and many people asked me to write a tutorial about implementing CRUD operations in the Blazor server app using the Entity Framework Core. In this tutorial, I will implement a demo app that will show you how to perform CRUD operations using EF Core and SQL Server as a backend database.

<https://ittranslator.cn/dotnet/csharp/2021/07/05/a-beginners-guide-to-blazor-server-and-webassembly-applications.html>