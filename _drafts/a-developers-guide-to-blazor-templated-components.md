---
layout: post
title:  "Blazor 组件之间使用 EventCallback 进行通信"
date:   2021-07-19 00:10:10 +0800
categories: dotnet csharp
tags: [DotNet, Blazor]
published: true
---

> 翻译自 Waqas Anwar 2021年4月15日的文章 [《A Developer’s Guide To Blazor Templated Components》](https://www.ezzylearning.net/tutorial/a-developers-guide-to-blazor-templated-components) [^1]

[^1]: <https://www.ezzylearning.net/tutorial/a-developers-guide-to-blazor-templated-components> A Developer’s Guide To Blazor Templated Components

![A-Developers-Guide-To-Blazor-Templated-Components](https://www.ezzylearning.net/wp-content/uploads/A-Developers-Guide-To-Blazor-Templated-Components.jpg)

In one of my previous posts A Beginner’s Guide to Blazor Components, I covered the component parameters and showed you how to pass data to Blazor components as parameters to customize their functionality. In this post, I will go one step further and will show you how to pass one or more UI templates as parameters into a different type of Blazor components called Templated components.

在我之前的一篇文章 [Blazor 组件入门指南](https://ittranslator.cn/dotnet/csharp/2021/07/12/a-beginners-guide-to-blazor-components.html)中，我介绍了组件参数，并向您展示了如何将数据作为参数传递给 Blazor 组件以定制化其功能。在这篇文章中，我将更进一步，向您展示如何将一个或多个 UI 模板作为参数传递到称为模板组件的不同类型的 Blazor 组件中。

[下载源码](https://github.com/ezzylearning/BlazorTemplatedComponentDemo)[^source]

[^source]: <https://github.com/ezzylearning/BlazorTemplatedComponentDemo> 下载源码