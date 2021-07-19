---
layout: post
title:  "Blazor 模板化组件开发指南"
date:   2021-07-19 00:10:10 +0800
categories: dotnet csharp
tags: [DotNet, Blazor]
published: true
---

> 翻译自 Waqas Anwar 2021年4月15日的文章 [《A Developer’s Guide To Blazor Templated Components》](https://www.ezzylearning.net/tutorial/a-developers-guide-to-blazor-templated-components) [^1]

[^1]: <https://www.ezzylearning.net/tutorial/a-developers-guide-to-blazor-templated-components> A Developer’s Guide To Blazor Templated Components

![A-Developers-Guide-To-Blazor-Templated-Components](https://www.ezzylearning.net/wp-content/uploads/A-Developers-Guide-To-Blazor-Templated-Components.jpg)

In one of my previous posts A Beginner’s Guide to Blazor Components, I covered the component parameters and showed you how to pass data to Blazor components as parameters to customize their functionality. In this post, I will go one step further and will show you how to pass one or more UI templates as parameters into a different type of Blazor components called Templated components.

在我之前的一篇文章 [Blazor 组件入门指南](https://ittranslator.cn/dotnet/csharp/2021/07/12/a-beginners-guide-to-blazor-components.html)中，我介绍了组件参数，并向您展示了如何将数据作为参数传递给 Blazor 组件以定制化其功能。在这篇文章中，我将更进一步，向您展示如何将一个或多个 UI 模板作为参数传递到称为*模板化组件*的一个不同类型的 Blazor 组件中。

<!-- https://docs.microsoft.com/zh-cn/aspnet/core/blazor/components/templated-components -->

[下载源码](https://github.com/ezzylearning/BlazorTemplatedComponentDemo)[^source]

[^source]: <https://github.com/ezzylearning/BlazorTemplatedComponentDemo> 下载源码

## Blazor 模板化组件概述

Blazor templated component is a type of component that accepts one or more UI templates as parameters. This facilitates component reusability because you just need to create a templated component once and then every page where that component is used can provide its UI template which can be rendered by the templated component as per the page requirements.

<!-- Blazor 模板化组件是一种接受一个或多个 UI 模板作为参数的组件。这有助于组件的可重用性，因为您只需要创建一次模板化组件，然后使用该组件的每个页面都可以提供其 UI 模板，该模板可以根据页面要求由模板化组件呈现。 -->

Blazor 模板化组件是一种接受一个或多个 UI 模板作为参数的组件。这有助于组件的可重用性，因为您只需要创建一次模板化组件，然后使用该组件的每个页面都可以提供其 UI 模板，模板化组件可以根据页面要求渲染此 UI 模板。

![Blazor-Templated-Component](https://www.ezzylearning.net/wp-content/uploads/Blazor-Templated-Component.png)

The examples of templated component include:

模板化组件的示例包括：

- A table component that allows a user to specify the templates for a table header, rows, and footer.
- A widget component that allows a user to render different widgets with the same look and feel but different contents.
- A list component that allows the user to specify a template for rendering the list items like bullets or numbers.
- A list component that allows user to display data in list, grid, or cards view

- 一个表格组件，允许用户指定表格标题、行和页脚的模板。
- 一个小部件组件，允许用户呈现具有外观和感觉相同但内容不同的不同小部件。
- 一个列表组件，允许用户指定一个模板来呈现项目符号或数字等列表项。
- 一个允许用户以列表、网格或卡片视图来显示数据的列表组件。

When we create a parameter of any Blazor component, we commonly specify its type as string, int, or any other built-in .NET data type. To create a templated component, we create component parameters of type `RenderFragment` or `RenderFragment<T>`. RenderFragment allows us to provide a segment of UI that can be rendered by templated components.

当我们创建一个 Blazor 组件的参数时，我们通常将其类型指定为 `string`、`int` 或其他任意内置 .NET 数据类型。为了创建模板化组件，我们需要创建 `RenderFragment` 或 `RenderFragment<T>` 类型的组件参数。[RenderFragment](https://docs.microsoft.com/zh-cn/dotnet/api/microsoft.aspnetcore.components.renderfragment) 允许我们提供可以由模板化组件呈现的一个 UI 内容段（作为一个委托实现，将内容写入 RenderTreeBuilder）。

```csharp
[Parameter]
public RenderFragment HeaderTemplate { get; set; }
```

`RenderFragment<T>` go one step further and allows us to pass the parameter of type T which can be used to customize the output of the templated component.

`RenderFragment<T>` 更进一步，允许我们传递 `T` 类型的参数，该参数可用于自定义模板化组件的输出。

```csharp
[Parameter]
public RenderFragment<T> RowTemplate { get; set; }
```

## 实例讲解 Getting Started with a Real World Example

To understand the templated components in detail, I have decided to build a TableWidget templated component that will allow us to customize the table header, rows, and footer in different formats. Let’s create a new Blazor Server App and add the basic functionality to rendering some data in table format before we create our first templated component.

为了详细了解模板化组件，我决定构建一个 TableWidget 模板化组件，它允许我们自定义不同格式的表头、行和页脚。 在创建第一个模板化组件之前，让我们创建一个新的 Blazor Server 应用程序并添加基本功能来以表格格式呈现一些数据。
