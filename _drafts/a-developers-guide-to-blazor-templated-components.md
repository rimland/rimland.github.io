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

<!-- In one of my previous posts A Beginner’s Guide to Blazor Components, I covered the component parameters and showed you how to pass data to Blazor components as parameters to customize their functionality. In this post, I will go one step further and will show you how to pass one or more UI templates as parameters into a different type of Blazor components called Templated components. -->

在我之前的一篇文章 [Blazor 组件入门指南](https://ittranslator.cn/dotnet/csharp/2021/07/12/a-beginners-guide-to-blazor-components.html)中，我介绍了组件参数，并向您展示了如何将数据作为参数传递给 Blazor 组件以定制化其功能。在这篇文章中，我将更进一步向您展示，如何将一个或多个 UI 模板作为参数传递给一个称之为*模板化组件*的不同类型的 Blazor 组件。

<!-- https://docs.microsoft.com/zh-cn/aspnet/core/blazor/components/templated-components -->

[下载源码](https://github.com/ezzylearning/BlazorTemplatedComponentDemo)[^source]

[^source]: <https://github.com/ezzylearning/BlazorTemplatedComponentDemo> 下载源码

## Blazor 模板化组件概述

<!-- Blazor templated component is a type of component that accepts one or more UI templates as parameters. This facilitates component reusability because you just need to create a templated component once and then every page where that component is used can provide its UI template which can be rendered by the templated component as per the page requirements. -->

Blazor 模板化组件是一种接受将一个或多个 UI 模板作为参数的组件。这有助于组件的可重用性，因为您只需要创建一次模板化组件，然后使用该组件的每个页面都可以提供其 UI 模板，模板化组件可以根据页面需求渲染此 UI 模板。

![Blazor-Templated-Component](https://www.ezzylearning.net/wp-content/uploads/Blazor-Templated-Component.png)

The examples of templated component include:

（下面的）模板化组件示例包括：

- A table component that allows a user to specify the templates for a table header, rows, and footer.
- A widget component that allows a user to render different widgets with the same look and feel but different contents.
- A list component that allows the user to specify a template for rendering the list items like bullets or numbers.
- A list component that allows user to display data in list, grid, or cards view

<!-- - 一个表格组件，允许用户指定表格标题、行和页脚的模板。
- 一个小部件组件，允许用户呈现具有相同外观和体验而具有不同内容的小部件。
- 一个列表组件，允许用户指定一个模板来呈现项目符号或编号等列表项。
- 一个允许用户以列表、网格或卡片视图来显示数据的列表组件。 -->

- 一个允许用户指定表格标题、行和页脚的模板的表格组件。
- 一个允许用户呈现具有相同外观和体验而具有不同内容的小部件组件。
- 一个允许用户指定一个模板来呈现项目符号或编号等列表项的列表组件。
- 一个允许用户以列表、网格或卡片视图来显示数据的列表组件。

<!-- When we create a parameter of any Blazor component, we commonly specify its type as string, int, or any other built-in .NET data type. To create a templated component, we create component parameters of type `RenderFragment` or `RenderFragment<T>`. RenderFragment allows us to provide a segment of UI that can be rendered by templated components. -->

当我们创建 Blazor 组件的一个参数时，我们通常将其类型指定为 `string`、`int` 或者其他任意内置 .NET 数据类型。为了创建一个模板化组件，我们需要创建类型为 `RenderFragment` 或 `RenderFragment<T>` 的组件参数。[RenderFragment](https://docs.microsoft.com/zh-cn/dotnet/api/microsoft.aspnetcore.components.renderfragment) 允许我们提供一个可以由模板化组件渲染的 UI 内容片段（作为一个委托实现，将其内容写入到 RenderTreeBuilder）。

```csharp
[Parameter]
public RenderFragment HeaderTemplate { get; set; }
```

`RenderFragment<T>` go one step further and allows us to pass the parameter of type T which can be used to customize the output of the templated component.

`RenderFragment<T>` 更进一步，允许我们传入参数的类型 `T`，它可以被用来自定义模板化组件的输出。

```csharp
[Parameter]
public RenderFragment<T> RowTemplate { get; set; }
```

## 实例讲解 Getting Started with a Real World Example

<!-- To understand the templated components in detail, I have decided to build a TableWidget templated component that will allow us to customize the table header, rows, and footer in different formats. Let’s create a new Blazor Server App and add the basic functionality to rendering some data in table format before we create our first templated component. -->

为了详细了解模板化组件，我决定构建一个 TableWidget 模板化组件，它允许我们自定义不同格式的表头、行和页脚。在创建第一个模板化组件之前，让我们创建一个新的 Blazor Server 应用程序并添加其基本功能，以表格格式呈现一些数据。

<!-- Create a **Data** folder in Blazor Server App and add the following two model classes in the **Data** folder. -->

在 Blazor Server 应用程序中创建一个 **Data** 文件夹，并在 **Data** 文件夹中添加以下两个模型类。

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

<!-- Create a Services folder in the project and add the following IProductService and ProductService in the Services folder. For this tutorial, I am just returning some fake data to generate the table. -->

在项目中创建一个 *Services* 文件夹，并在 *Services* 文件夹中添加如下的 `IProductService` 和 `ProductService`。在本教程中，我仅返回一些用于生成表格的模拟数据。

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

<!-- Next, create IOrderService and OrderService in the same Services folder and add some fake order data to generate a table. -->

接下来，在同一 *Services* 文件夹中创建 `IOrderService` 和 `OrderService` 并添加一些用于生成表格的伪造订单数据。

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

<!-- We need to inject the above services in Blazor components using the dependency injection and for that purpose, we need to register the above services in Startup.cs file. If you want to learn more about dependency injection you can read my article A Step by Step Guide to ASP.NET Core Dependency Injection -->

我们需要使用依赖注入将上述服务注入到 Blazor 组件中，为此，我们需要在 *Startup.cs* 文件中注册上述服务。如果您想了解更多关于依赖注入的知识，可以阅读我的文章 [A Step by Step Guide to ASP.NET Core Dependency Injection](https://www.ezzylearning.net/tutorial/a-step-by-step-guide-to-asp-net-core-dependency-injection)[^DI]。

[^DI]: <https://www.ezzylearning.net/tutorial/a-step-by-step-guide-to-asp-net-core-dependency-injection> A Step by Step Guide to ASP.NET Core Dependency Injection

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

<!-- Next, create a Blazor components Dashboard.razor and its corresponding code-behind file Dashboard.razor.cs in the project Pages folder. If you are not familiar with Blazor components and code-behind files then read my post A Beginner’s Guide to Blazor Components. -->

接下来，在项目 *Pages* 文件夹中创建 Blazor 组件 *Dashboard.razor* 及其对应的代码隐藏文件 *Dashboard.razor.cs*。如果您不熟悉 Blazor 组件及代码隐藏文件，请阅读我的文章 [Blazor 组件入门指南](https://ittranslator.cn/dotnet/csharp/2021/07/12/a-beginners-guide-to-blazor-components.html)。

<!-- The *Dashboard.razor.cs* file will inject both **IOrderService** and **IProductService** in the code-behind file of the component and then we will use the methods `GetLatestOrders` and `GetTopSellingProducts` to populate our local **Orders** and **Products** lists. -->

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

<!-- The razor component view file will simply run **foreach** loops on **Orders** and **Products** and will generate the HTML tables. -->

razor 组件视图文件将简单地在 **Orders** 和 **Products** 上运行 **foreach** 循环，并生成 HTML 表格。

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

<!-- If you will run the project, you will see the following two tables rendered on the page. -->

此时如果您运行项目，将在页面上看到以下两个表格。

![Display-Data-without-Templated-Components](https://www.ezzylearning.net/wp-content/uploads/Display-Data-without-Templated-Components.png)

<!-- So far, we haven’t created any templated component but you can feel that we need one soon because both orders and products tables are shown above have almost the same look and feel and we are duplicating lots of HTML in the **foreach** loops above to generate these two tables. It is a good idea to create a templated component and then reuse that component to generate both of the above tables and still be able to customize the headers and data rows rendered by those tables. Let’s create our first templated component called the **TableWidget** component. -->

截至目前，我们尚没有创建任何模板化组件，但您会感觉到我们很快会需要一个，因为上面显示的订单和产品表格几乎都具有相同的外观和体验，并且我们在上面的 **foreach** 循环中复制了大量的 HTML 来生成这两张表格。一个好注意是，创建一个模板化组件，然后重用该组件来生成上述两个表，并且仍然能够自定义由这些表显示的表头和数据行。让我们来创建我们的第一个模板化组件，命名为 **TableWidget** 组件。

## 创建 Blazor 模板化组件

<!-- Add a new Razor component TableWidget.razor in the Shared folder and add the following code in it. -->

在 **Shared** 文件夹中新建一个 Razor 组件 *TableWidget.razor*，并在其中添加以下代码：

<b>TableWidget.razor</b>

```html
@typeparam TItem
<br />
<h3>@Title</h3>
<table class="table table-striped table-bordered">
   <thead class="thead-dark">
      <tr>
         @HeaderTemplate
      </tr>
   </thead>
   <tbody>
      @foreach (var item in Items)
      {
      <tr>
         @RowTemplate(item)
      </tr>
      }
   </tbody>
   <tfoot>
      <tr>
         @FooterTemplate
      </tr>
   </tfoot>
</table>
@code {
    [Parameter]
    public string Title { get; set; }
 
    [Parameter]
    public RenderFragment HeaderTemplate { get; set; }
 
    [Parameter]
    public RenderFragment<TItem> RowTemplate { get; set; }
 
    [Parameter]
    public RenderFragment FooterTemplate { get; set; }
 
    [Parameter]
    public IReadOnlyList<TItem> Items { get; set; }
}
```

<!-- Our TableWidget component has the following three templates. -->

我们的 TableWidget 组件包含以下三个模板：

```csharp
[Parameter]
public RenderFragment HeaderTemplate { get; set; }
 
[Parameter]
public RenderFragment<TItem> RowTemplate { get; set; }
 
[Parameter]
public RenderFragment FooterTemplate { get; set; }
```

<!-- The **HeaderTemplate** will allow users to render any UI template in the header of the table. This template is used to render the table header cells within **thead** element. -->

**HeaderTemplate** 允许用户在表格的表头中呈现任意 UI 模板。此模板用于在 **thead** 元素内渲染表格表头的单元格。

```html
<thead class="thead-dark">
   <tr>
      @HeaderTemplate
   </tr>
</thead>
```

<!-- The **FooterTemplate** is similar to HeaderTemplate and it will allow users to render any UI template in the footer of the table. This template is used to render the table footer cells within **tfoot** element. -->

**FooterTemplate** 与 **HeaderTemplate** 类似，它允许用户在表格的页脚中呈现任意 UI 模板。此模板用于在 **tfoot** 元素内渲染表格页脚的单元格。

```html
<tfoot>
   <tr>
      @FooterTemplate
   </tr>
</tfoot>
```

<!-- The **RowTemplate** is of type `RanderFragment<TItem>` and it will allow users to render the UI template using any .NET type. The type is not fixed and declared as a generic type using the **@typeparam** directives on top of the component. -->

**RowTemplate** 的类型为 `RanderFragment<TItem>`，它允许用户使用任意的 .NET 类型渲染 UI 模板。该类型不是固定的，而是使用组件顶部的 **@typeparam** 指令声明为一个泛型类型。

```html
@typeparam TItem
```

<!-- We also created a collection of TItem objects in our component so that we can iterate over the collection and generate our table rows -->

我们还在组件中创建了一个 `TItem` 对象的集合，以便我们可以迭代该集合生成表格的行。

```csharp
[Parameter]
public IReadOnlyList<TItem> Items { get; set; }
```

<!-- The type of objects we will pass in our UI template will render using the following **foreach** loop. You will shortly see how this will help us to render both Products and Order tables using the same TableWidget component. -->

我们将要传入 UI 模板中的 `TItem` 类型的对象会使用以下 **foreach** 循环进行渲染。您很快就会看到这将如何帮助我们使用相同的 TableWidget 组件同时渲染产品和订单表格。

```html
<tbody>
   @foreach (var item in Items)
   {
       <tr>
          @RowTemplate(item)
       </tr>
   }
</tbody>
```

<!-- Different Ways to Use Blazor Templated Component -->

## 使用 Blazor 模板化组件的不同方式

<!-- It is now time to see our TableWidget component in action and there are different ways we can use this component. Replace the Recent Orders table we generated above with the following TableWidget component. -->

现在是时候看一下我们的 TableWidget 组件的运行情况了，我们可以通过不同的方式使用这个组件。用下面的 TableWidget 组件替换我们前面生成的 Recent Orders 表格。

```html
<div class="col">
   @if (Orders != null)
   {
       <TableWidget Title="Recent Orders" Items="Orders">
          <HeaderTemplate>
             <th scope="col">Order</th>
             <th scope="col">Date</th>
             <th scope="col">Status</th>
             <th scope="col">Total</th>
          </HeaderTemplate>
          <RowTemplate>
             <td>@context.OrderNo</td>
             <td>@context.OrderDate.ToShortDateString()</td>
             <td>@context.Status</td>
             <td>@context.OrderTotal</td>
          </RowTemplate>
       </TableWidget>
   }
</div>
```

<!-- In the above code snippet, the **Items** property is initialized with the **Orders** list we received from our service. Then we decided to use **HeaderTemplate** and **RowTemplate** to generate the header and footer of the table. You may be thinking from where the **context** came from. The **context** is an implicit parameter available to all component arguments of Type `RenderFragment<T>`. We can use **context** to access the properties of the object we are dealing with. In the above example, **context** will supply the order information to the template. -->

在上面的代码片段中，**Items** 属性是使用我们的从服务获取的 **Orders** 列表初始化的。然后我们决定使用 **HeaderTemplate** 和 **RowTemplate** 来生成表格的表头和数据行。您可能在想 **context** 是从哪里来的？**context** 是一个隐式参数，所有类型为 `RenderFragment<T>` 的组件参数都可以使用。我们可以使用 **context** 来访问我们正在处理的对象的属性。在上面的示例中，**context** 将向模板提供订单信息。

<!-- If you will run the project, you will see the following two tables rendered on the page. The Recent Orders table is now generated using our TableWidget component. -->

如果此时您运行项目，您将在页面上看到以下两个表格。现在，最近的订单（Recent Orders）表格是使用我们的 TableWidget 组件生成的了。

![Display-Data-without-Templated-Components](https://www.ezzylearning.net/wp-content/uploads/Display-Data-without-Templated-Components.png)

<!-- Let’s reuse our **TableWidget** component and this time generate the Top Selling Products table. This time, we are passing it Products list and we also specified our own **Context="product"** which means we can now access product properties using **product** instead of implicit parameter **context**. -->

让我们重用 **TableWidget** 组件来生成热卖产品（Top Selling Products）表格。这一次，我们传递了 Products 列表给它，还指定了我们自己的 **Context="product"**，这意味着现在我们可以使用 **product** 取代隐式参数 **context** 来访问产品属性。

```html
<div class="col">
   @if (Products != null)
   {
       <TableWidget Title="Top Selling Products" Items="Products" Context="product">
          <HeaderTemplate>
             <th scope="col">Title</th>
             <th scope="col">Price</th>
             <th scope="col">Quantity</th>
          </HeaderTemplate>
          <RowTemplate>
             <td>@product.Title</td>
             <td>@product.Price</td>
             <td>@product.Quantity</td>
          </RowTemplate>
       </TableWidget>
   }
</div>
```

<!-- You are allow allowed to specify the Context at template level as shown in the example where the **Context="product"** is added to **RowTemplate**. -->

您还可以在模板级别指定上下文（Context），如下面的示例所示，其中将 **Context="product"** 添加到了 **RowTemplate**。

```html
<TableWidget Title="Top Selling Products" Items="Products">
   <HeaderTemplate>
      <th scope="col">Title</th>
      <th scope="col">Price</th>
      <th scope="col">Quantity</th>
   </HeaderTemplate>
   <RowTemplate Context="product">
      <td>@product.Title</td>
      <td>@product.Price</td>
      <td>@product.Quantity</td>
   </RowTemplate>
</TableWidget>
```

<!-- If you will run the project, you will see the following two tables rendered on the page but this time we know that these two tables are rendered using our TableWidget templated component. This example clearly shows that the same templated component can be used to generate different types of UI and it can render the different types of objects as per our app requirement. -->

现在如果您运行该项目，您将看到页面上显示了以下两个表格，但是我们知道这次这两个表格是使用我们的模板化组件 TableWidget 渲染的。该示例清楚地演示了，同一个模板化组件可用于生成不同类型的 UI，并且可以根据我们的应用程序需求渲染不同类型的对象。

![Display-Data-without-Templated-Components](https://www.ezzylearning.net/wp-content/uploads/Display-Data-without-Templated-Components.png)

Let’s reuse our TableWidget component with two more examples that will show the same Recent Orders and Top Selling Products with slightly different layouts

下面让我们用另外两个示例来重用一下我们的 TableWidget 组件，这些示例将显示相同的最近订单和热销产品，但布局略有改变。

```html
<div class="row">
   <div class="col">
      @if (Orders != null)
      {
          <TableWidget Title="Recent Orders" Items="Orders">
             <HeaderTemplate>
                <th scope="col" colspan="2">Order Details</th>
                <th scope="col">Status</th>
                <th scope="col">Total</th>
             </HeaderTemplate>
             <RowTemplate Context="order">
                <td colspan="2">
                   <b>Order No: </b>@order.OrderNo
                   <br />
                   <b>Order Date: </b>@order.OrderDate.ToShortDateString()
                </td>
                <td>@order.Status</td>
                <td>@order.OrderTotal</td>
             </RowTemplate>
          </TableWidget>
      }
   </div>
   <div class="col">
      @if (Products != null)
      {
          <TableWidget Title="Top Selling Products" Items="Products" TItem=”Product”>
             <RowTemplate Context="product">
                <td>
                   <h2>@product.Title</h2>
                   <h4><b>@product.Price.ToString("C")</b></h4>
                </td>
             </RowTemplate>
             <FooterTemplate>
                <td class="text-right"><b>Last 30 Days</b></td>
             </FooterTemplate>
          </TableWidget>
      }
   </div>
</div>
```

When using generic-typed components, the type parameter is inferred if possible. However, we have the option to explicitly specify the type with an attribute that has a name matching the type parameter, which is **TItem** in the above example.

在使用泛型类型化组件时，会尽可能推断类型参数。不过，我们可以选择使用一个特性(attribute)来显式指定类型，该特性的名称与类型参数相同，在上例中是 **TItem**。

<!-- 使用泛型类型组件时，如果可能，将推断类型参数。 但是，我们可以选择使用名称与类型参数匹配的属性显式指定类型，在上面的示例中为 **TItem**。

在使用泛型类型化组件时，如果可能，将推断类型参数。但是，我们可以选择显式指定一个属性的类型，该属性的名称与类型参数匹配，在上面的示例中是**TItem**。 -->

If you will run the project, you will see all four tables rendered on the page using the same TableWidget templated component.

如果您运行该项目，您将在页面上看到使用相同的 TableWidget 模板化组件呈现的所有四个表格。

![Display-Data-with-Blazor-Templated-Component](https://www.ezzylearning.net/wp-content/uploads/Display-Data-with-Blazor-Templated-Component.jpg)

Creating a Generic Templated Component

## 创建通用模板组件

<!-- Our **TableWidget** component is good and we have already seen different examples it can be reused but the problem with that component is that it only generates HTML tables. What if we want to create an even more generic component that can be reused to generate any type of UI e.g. tables, cards, bullets, etc. We can create such a component easily by removing all markup from the templated component. Let’s create a generic **ListWidget** component to see one such component in action. -->

我们的 **TableWidget** 组件很好，我们已经看到了重用它的多个示例，但该组件的问题是它只生成 HTML 表格。如果我们想创建一个更通用的组件，可以重用它来生成任何类型的 UI（例如 表格、卡片、项目符号等）。我们可以通过从模板化组件中删除所有标签来轻松地创建这样一个组件。让我们来创建一个通用的 **ListWidget** 组件来查看这样一个组件的运行情况。

Create a new ListWidget.razor component in the **Shared** folder and add the following code in it. This time, we have no markup in the component and we just have an **ItemTemplate** in the **foreach** loop. This means we are free to generate any type of list using this ListWidget component.

在 **Shared** 文件夹中创建一个新的 *ListWidget.razor* 组件，并在其中添加以下代码。 这次在组件中没有 HTML 标签，在 **foreach** 循环中只有一个 **ItemTemplate**。这意味着我们可以使用这个 ListWidget 组件自由地生成任意类型的列表。

<b>ListWidget.razor</b>

```html
@typeparam TItem
 
@foreach (var item in Items)
{
    @ItemTemplate(item)
}
 
@code {
    [Parameter]
    public RenderFragment<TItem> ItemTemplate { get; set; }
 
    [Parameter]
    public IReadOnlyList<TItem> Items { get; set; }
}
```

Let’s say we want to generate the bootstrap list using this ListWidget component so we can do this using the following code snippet.

假设我们要想使用这个 ListWidget 组件生成引导程序（bootstrap）列表，那么我们可以使用下面的代码段来完成这一操作。

```html
<ul class="list-group">
   <li class="list-group-item d-flex justify-content-between align-items-center active">
      Latest Products
   </li>
   <ListWidget Items="Products" Context="product">
      <ItemTemplate>
         <li class="list-group-item d-flex justify-content-between align-items-center">
            @product.Title
            <b>@product.Price.ToString("C")</b>
            <span class="badge badge-primary badge-pill">
            @product.Quantity
            </span>
         </li>
      </ItemTemplate>
   </ListWidget>
</ul>
```

Run the project and you will see the same list of products are now generated as bootstrap list component.

运行该项目，您将看到现在生成的相同产品列表作为引导列表组件。

![Blazor-Generic-Templated-Component-Example 1](https://www.ezzylearning.net/wp-content/uploads/Blazor-Generic-Templated-Component-Example-1.jpg)

Now let’s say you have another page where the list of products need to be displayed differently using the **div** and **a** tags so once again you can reuse same ListWidget component and this time generate markup like the following:

现在假设您有另一个页面，其中需要使用 **div** 和 **a** 标签以不同方式显示产品列表，那么您可以再次重用相同的 ListWidget 组件，这次生成如下标记：

```html
<div class="list-group">
   <a class="list-group-item d-flex justify-content-between align-items-center active">
   Latest Products
   </a>
   <ListWidget Items="Products" Context="product" TItem="Product">
      <ItemTemplate>
         <a href="#" class="list-group-item list-group-item-action flex-column align-items-start">
            <div class="d-flex w-100 justify-content-between">
               <h5 class="mb-1"><b>@product.Title</b></h5>
               <small class="text-muted">@product.Quantity units left</small>
            </div>
            <p class="mb-1">@product.Price.ToString("C")</p>
         </a>
      </ItemTemplate>
   </ListWidget>
</div>
```

Run the project and you will see output similar to the following.

运行该项目，您将看到类似于以下内容的输出。

![Blazor-Generic-Templated-Component-Example 2](https://www.ezzylearning.net/wp-content/uploads/Blazor-Generic-Templated-Component-Example-2.jpg)

## 总结

In this tutorial, I gave you an overview of the Blazor templated component and we created two types of templated components. Next, we have seen several examples of reusing both the TableWidget and ListWidget components to generate different types of markup. I have to admit that the templated components are a wonderful addition to the Blazor developer’s toolbox and using these components we can create some amazing reusable components.

在本教程中，我概述了 Blazor 模板化组件，并创建了两种类型的模板化组件。然后，我们看到了几个重用 TableWidget 和 ListWidget 组件来生成不同类型标记的示例。我不得不承认，模板化组件是 Blazor 开发者工具箱的一个很好的补充，我们可以使用这些组件来创建一些惊人的可重用组件。
