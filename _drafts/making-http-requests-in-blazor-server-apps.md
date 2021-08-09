---
layout: post
title:  "Blazor 模板化组件开发指南"
date:   2021-07-19 00:10:10 +0800
categories: dotnet csharp
tags: [DotNet, Blazor]
published: true
---

> 翻译自 Waqas Anwar 2021年5月4日的文章 [《Making HTTP Requests in Blazor Server Apps》](https://www.ezzylearning.net/tutorial/making-http-requests-in-blazor-server-apps) [^1]

[^1]: <https://www.ezzylearning.net/tutorial/making-http-requests-in-blazor-server-apps> Making HTTP Requests in Blazor Server Apps

![Making-HTTP-Requests-in-Blazor-Server-Apps](https://www.ezzylearning.net/wp-content/uploads/Making-HTTP-Requests-in-Blazor-Server-Apps.jpg)

Blazor server apps use the standard ASP.NET Core application and they execute .NET code on the server. We can access any .NET library or server-side feature in these apps in the same way as we use in ASP.NET Core web applications. One such feature is to use HTTP Client instances to make HTTP requests to third-party Web APIs. In this tutorial, I will show you different ways to create HTTP Client instances. I will also show you how to consume a third-party API to fetch and display data in Blazor Server Apps.
