---
layout: post
title:  "Blazor 事件处理开发指南"
date:   2021-07-19 00:10:10 +0800
categories: dotnet csharp
published: true
---

> 翻译自 Waqas Anwar 2021年3月28日的文章 [《Communication between Blazor Components using EventCallback》](https://www.ezzylearning.net/tutorial/communication-between-blazor-components-using-eventcallback) [^1]

[^1]: <https://www.ezzylearning.net/tutorial/communication-between-blazor-components-using-eventcallback> Communication between Blazor Components using EventCallback

![Communication-between-Blazor-Components-using-EventCallback](https://www.ezzylearning.net/wp-content/uploads/Communication-between-Blazor-Components-using-EventCallback.jpg)

Blazor apps are the collection of multiple Blazor components interacting with each other and we are also allowed to use child components inside other parent components. In real-world apps, it is a very common scenario to pass data or event information from one component to another component. Maybe you have a page in which user actions occurred in one component need to update some UI in other components. This type of communication is normally handled using an [EventCallback](https://docs.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.components.eventcallback) delegate. In this tutorial, we will cover how to use EventCallback to communicate between a parent and a child component.

Blazor 应用程序是多个相互交互的 Blazor 组件的集合，我们还可以在其他父组件中使用子组件。 在现实世界的应用程序中，将数据或事件信息从一个组件传递到另一个组件是一种非常常见的场景。 也许您有一个页面，其中一个组件中发生的用户操作需要更新其他组件中的某些 UI。 这种类型的通信通常使用 [EventCallback](https://docs.microsoft.com/zh-cn/dotnet/api/microsoft.aspnetcore.components.eventcallback) 委托进行处理。 在本教程中，我们将介绍如何使用 EventCallback 在父组件和子组件之间进行通信。

[Router 组件](https://docs.microsoft.com/zh-cn/dotnet/api/microsoft.aspnetcore.components.routing.router)[^router] 的属性：

| 属性                   | 说明                                      |
|----------------------|-----------------------------------------|
| AdditionalAssemblies | 获取或设置其他程序集的集合，这些程序集应在搜索可与 URI 匹配的组件时搜索。 |
| AppAssembly          | 获取或设置应在其中搜索与 URI 匹配的组件的程序集。             |
| Found                | 获取或设置当为请求的路由找到匹配项时要显示的内容。               |
| Navigating           | 获取或设置异步导航正在进行时显示的内容。                    |
| NotFound             | 获取或设置当找不到请求的路由的匹配项时要显示的内容。              |
| OnNavigateAsync      | 获取或设置在导航到新页之前应调用的处理程序。                  |

[^router]: <https://docs.microsoft.com/zh-cn/dotnet/api/microsoft.aspnetcore.components.routing.router>

