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

为了详细了解模板化组件，我决定构建一个 TableWidget 模板化组件，它允许我们自定义不同格式的表头、行和页脚。在创建第一个模板化组件之前，让我们创建一个新的 Blazor Server 应用程序并添加基本功能来以表格格式呈现一些数据。

Create a **Data** folder in Blazor Server App and add the following two model classes in the **Data** folder.

在 Blazor Server App 中创建一个 **Data** 文件夹，并在 **Data** 文件夹中添加以下两个模型类。

<b>Product.cs</b>

```csharp
public class Product
{
    public int Id { get; set; }
    public string Title { get; set; }
    public decimal Price { get; set; }
    public int Quantity { get; set; }
}
```

<b>Order.cs</b>

```csharp
public class Order
{
    public int Id { get; set; }
    public string OrderNo { get; set; }
    public DateTime OrderDate { get; set; }
    public string Status { get; set; }
    public decimal OrderTotal { get; set; }
}
```

Create a Services folder in the project and add the following IProductService and ProductService in the Services folder. For this tutorial, I am just returning some fake data to generate the table.

在项目中创建一个 *Services* 文件夹，在 *Services* 文件夹中添加如下的 `IProductService` 和 `ProductService`。在此，我仅返回一些假数据以生成表。

<b>IProductService.cs</b>

```csharp
public interface IProductService
{
    List<Product> GetTopSellingProducts();
}
```

<b>ProductService.cs</b>

```csharp
public class ProductService : IProductService
{
    public List<Product> GetTopSellingProducts()
    {
        return new List<Product>()
        {
            new Product()
            {
                Id = 1,
                Title = "Wireless Mouse",
                Price = 29.99m,
                Quantity = 3
            },
            new Product()
            {
                Id = 2,
                Title = "HP Headphone",
                Price = 79.99m,
                Quantity = 4
            },
            new Product()
            {
                Id = 3,
                Title = "Sony Keyboard",
                Price = 119.99m,
                Quantity = 5
            }
        };
    }
}
```

Next, create IOrderService and OrderService in the same Services folder and add some fake order data to generate a table.

接下来，同样在 *Services* 文件夹中创建 `IOrderService` 和 `OrderService` 并添加一些假订单数据以生成一个表格。

<b>IOrderService.cs</b>

```csharp
public interface IOrderService
{
    List<Order> GetLatestOrders();
}
```

<b>OrderService.cs</b>

```csharp
public class OrderService : IOrderService
{
    public List<Order> GetLatestOrders()
    {
        return new List<Order>()
        {
            new Order()
            {
                Id = 1, 
                OrderNo = "12345",
                OrderDate = DateTime.Today.AddDays(-2),
                Status = "Pending",
                OrderTotal = 399.99m
            },
            new Order()
            {
                Id = 2,
                OrderNo = "67890",
                OrderDate = DateTime.Today.AddDays(-5),
                Status = "Completed",
                OrderTotal = 199.99m
            },
            new Order()
            {
                Id = 3,
                OrderNo = "13579",
                OrderDate = DateTime.Today.AddDays(-7),
                Status = "Completed",
                OrderTotal = 249.99m
            }
        };
    }
}
```

We need to inject the above services in Blazor components using the dependency injection and for that purpose, we need to register the above services in Startup.cs file. If you want to learn more about dependency injection you can read my article A Step by Step Guide to ASP.NET Core Dependency Injection

我们需要使用依赖注入将上述服务注入到 Blazor 组件中，为此，我们需要在 *Startup.cs* 文件中注册上述服务。如果你想了解更多关于依赖注入的知识，可以阅读我的文章 [A Step by Step Guide to ASP.NET Core Dependency Injection](https://www.ezzylearning.net/tutorial/a-step-by-step-guide-to-asp-net-core-dependency-injection)。

<b>Startup.cs</b>

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddRazorPages();
    services.AddServerSideBlazor();
    services.AddSingleton<WeatherForecastService>();
 
    services.AddScoped<IOrderService, OrderService>();
    services.AddScoped<IProductService, ProductService>();
}
```

Next, create a Blazor components Dashboard.razor and its corresponding code-behind file Dashboard.razor.cs in the project Pages folder. If you are not familiar with Blazor components and code-behind files then read my post A Beginner’s Guide to Blazor Components.

接下来，在项目 *Pages* 文件夹中创建 Blazor 组件 *Dashboard.razor* 及其对应的代码隐藏文件 *Dashboard.razor.cs*。如果您不熟悉 Blazor 组件和代码隐藏文件，请阅读我的文章 [Blazor 组件入门指南](https://ittranslator.cn/dotnet/csharp/2021/07/12/a-beginners-guide-to-blazor-components.html)。

The *Dashboard.razor.cs* file will inject both **IOrderService** and **IProductService** in the code-behind file of the component and then we will use the methods `GetLatestOrders` and `GetTopSellingProducts` to populate our local **Orders** and **Products** lists.

组件的代码隐藏文件 *Dashboard.razor.cs* 中同时注入了 **IOrderService** 和 **IProductService**，然后我们将使用 `GetLatestOrders` 和 `GetTopSellingProducts` 方法来填充我们的本地 **Orders** 和 **Products** 列表。

<b>Dashboard.razor.cs</b>

```csharp
public partial class Dashboard
{
    [Inject]
    private IOrderService OrderService { get; set; }
 
    [Inject]
    private IProductService ProductService { get; set; }
 
    private List<Order> Orders { get; set; }
    private List<Product> Products { get; set; }
 
    protected override void OnInitialized()
    {
        Orders = OrderService.GetLatestOrders();
        Products = ProductService.GetTopSellingProducts();
    }
}
```

The razor component view file will simply run **foreach** loops on **Orders** and **Products** and will generate the HTML tables.

razor 组件视图文件将简单地在 **Orders** 和 **Products** 上运行 **foreach** 循环，并将生成 HTML 表格。

```html
@page "/dashboard"
<h1>Dashboard</h1>
<br />
<div class="row">
   <div class="col">
      @if (Orders != null)
      {
          <table class="table table-striped table-bordered">
             <thead class="thead-dark">
                <tr>
                   <th scope="col">Order</th>
                   <th scope="col">Date</th>
                   <th scope="col">Status</th>
                   <th scope="col">Total</th>
                </tr>
             </thead>
             <tbody>
                @foreach (var order in Orders)
                {
                    <tr>
                       <td>@order.OrderNo</td>
                       <td>@order.OrderDate.ToShortDateString()</td>
                       <td>@order.Status</td>
                       <td>@order.OrderTotal</td>
                    </tr>
                }
             </tbody>
          </table>
      }
   </div>
   <div class="col">
      @if (Products != null)
      {
          <h3>Top Selling Products</h3>
          <table class="table table-striped table-bordered">
             <thead class="thead-dark">
                <tr>
                   <th scope="col">Title</th>
                   <th scope="col">Price</th>
                   <th scope="col">Quantity</th>
                </tr>
             </thead>
             <tbody>
                @foreach (var product in Products)
                {
                    <tr>
                       <td>@product.Title</td>
                       <td>@product.Price</td>
                       <td>@product.Quantity</td>
                    </tr>
                }
             </tbody>
          </table>
      }
   </div>
</div>
```

If you will run the project, you will see the following two tables rendered on the page.

如果您运行项目，将在页面上看到以下两个表格。

![Display-Data-without-Templated-Components](https://www.ezzylearning.net/wp-content/uploads/Display-Data-without-Templated-Components.png)

So far, we haven’t created any templated component but you can feel that we need one soon because both orders and products tables are shown above have almost the same look and feel and we are duplicating lots of HTML in the **foreach** loops above to generate these two tables. It is a good idea to create a templated component and then reuse that component to generate both of the above tables and still be able to customize the headers and data rows rendered by those tables. Let’s create our first templated component called the **TableWidget** component.

截至目前，我们尚没有创建任何模板化组件，但您会觉得我们很快就需要一个，因为上面显示的订单和产品表感觉上几乎具有相同的外观，并且我们在上面的 **foreach** 循环中复制了大量的 HTML 来生成这两个表。一个好注意是，创建一个模板化组件，然后重用该组件来生成上述两个表，并且仍然能够自定义由这些表显示的标题和数据行。让我们创建我们的第一个模板化组件，命名为 **TableWidget** 组件。

## 创建 Blazor 模板化组件
