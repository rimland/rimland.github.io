---
layout: post
title:  "在 .NET Core 中构建 REST API"
date:   2021-01-20 00:10:00 +0800
categories: dotnet csharp
published: true
---

> 翻译自 Camilo Reyes 2018年10月15日的文章 [《Build a REST API in .NET Core》](https://www.red-gate.com/simple-talk/dotnet/c-programming/build-a-rest-api-in-net-core/) [^1]  
>  
> REST API 可以使用简单的动词（如 POST、PUT、PATCH 等）将大型解决方案背后的复杂性隐藏起来。在本文中，Camilo Reyes 解释了如何在 .NET Core 中创建 REST API。

[^1]: <https://www.red-gate.com/simple-talk/dotnet/c-programming/build-a-rest-api-in-net-core/> Build a REST API in .NET Core

<!-- One way to scale large complex solutions is to break them out into REST microservices. Microservices unlock testability and reusability of business logic that sits behind an API boundary. This allows organizations to share software modules because REST APIs can be reused by multiple clients. Clients can then call as many APIs from mobile, web, or even static assets via a single-page app. -->

扩展大型复杂解决方案的一种方法是将它们分解为 REST 微服务。微服务开启了 API 边界后的业务逻辑的可测试性和可重用性。因为 REST API 可以被多个客户端重用，使得组织可以共享软件模块。客户端或许是移动端、网页端，甚至单面应用的静态资源端，它们可以调用任意多的 API。

<!-- In this take, I will show you what it takes to build a REST API in .NET Core. I will hit this with real-world demands such as versioning, search, and logging, to name a few. REST is often employed with verbs like POST, PUT, or PATCH, so I plan to cover them all. What I hope you see is a nice, effective way to deliver value with the tools available. -->

在本文中，我将向您展示在 .NET Core 中构建 REST API 的全过程。我将用现实工作中的需求来解释这个过程，比如版本控制、搜索、日志记录等等。REST 通常与诸如 POST、PUT 或 PATCH 的动词一起使用，因此我打算将它们全部覆盖。我希望您看到的是，使用现有工具交付价值的一个好的有效的方式。

<!-- This article assumes a working grasp of ASP.NET, C#, and REST APIs so I will not cover any basics. I recommend the latest .NET Core LTS release at the time of this writing to follow along. If you would like to start with working code, the sample code can be downloaded from GitHub. -->

本文假定您已掌握了 ASP.NET、C# 和 REST API，因此我不会涉及任何基础知识。我建议在学习本文时使用[最新的 .NET Core 版本](https://dotnet.microsoft.com/download/dotnet-core)[^dotnet]。如果您想从工作代码开始学习，可以[从 GitHub 下载](https://github.com/beautifulcoder/BuildRestApiNetCore)[^GitHub]示例代码。

[^dotnet]: <https://dotnet.microsoft.com/download/dotnet-core> Download .NET Core  
[^GitHub]: <https://github.com/beautifulcoder/BuildRestApiNetCore> 示例代码

You can begin by creating a new folder like BuildRestApiNetCore and firing this up in a shell:

你可以先新建一个文件夹，比如 BuildRestApiNetCore，然后在 shell 中启用它：

```shell
dotnet new sln
dotnet new webapi --no-https
dotnet sln add .
```
<!-- 
This project is based on a Web API template with HTTPS disabled to make it easier for local development. Double-clicking the solution file brings it up in Visual Studio if you have it installed. For .NET Core 3.1 support, be sure to have the 2019 version of the IDE. -->

该项目基于禁用了 HTTPS 的 Web API 模板，以简化本地开发。双击解决方案文件会在 Visual Studio 中打开它（如果已安装）。为了支持 .NET Core 3.1，请确保安装了 2019 版的 IDE。

<!-- APIs put a layer of separation between clients and the database, so the data is an excellent place to start. To keep data access trivial, Entity Framework has an in-memory alternative so that I can focus on the API itself. -->

由于 API 在客户端和数据库之间建立了一层隔离，因此数据是一个很好的起点。为了简化数据访问，Entity Framework 提供了一个内存中的替代方案，这样我就可以专注于 API 本身。

<!-- An in-memory database provider comes via NuGet: -->

通过 NuGet 获取内存数据库提供程序：

```shell
dotnet add package Microsoft.EntityFrameworkCore.InMemory
```

<!-- Then, create the following data model. I put this in the Models folder to indicate this namespace houses raw data. To use the data annotations, add System.ComponentModel.DataAnnotations in a using statement. -->

然后，创建以下数据模型。我将其放在 Models 文件夹中，以指示此命名空间存放原始数据。若要使用数据标注，请在 using 语句中添加 `System.ComponentModel.DataAnnotations`。

```csharp
public class Product
{
    [Key]
    [Required]
    [Display(Name = "productNumber")]
    public string ProductNumber { get; set; }

    [Required]
    [Display(Name = "name")]
    public string Name { get; set; }

    [Required]
    [Range(10, 90)]
    [Display(Name = "price")]
    public double? Price { get; set; }

    [Required]
    [Display(Name = "department")]
    public string Department { get; set; }
}
```

<!-- In a real solution, this may go in a separate project depending on the team’s needs. Pay attention to the attributes assigned to this model like Required, Display, and Range. These are data annotations in ASP.NET to validate the Product during model binding. Because I use an in-memory database, Entity Framework requires a unique Key. These attributes assign validation rules like price range or whether the property is required. -->

在实际的解决方案中，这可能要根据团队的需要将其放在单独的项目中。注意分配给该模型的属性，例如 `Required`、`Display` 和 `Range`，这些是 ASP.NET 中的数据标注，用于在模型绑定时验证 `Product`。因为我使用的是内存数据库，所以 Entity Framework 需要一个唯一的 Key。这些属性指定了验证规则，例如：价格区间或者属性是否是必须的。

<!-- From a business perspective, this is an e-commerce site with a product number, name, and price. Each product is also assigned a department to make searches by department easier. -->

从业务的角度来看，这是一个包含产品编号、名称和价格的电子商务站点。每个产品还指定了一个部门，以便按部门进行搜索。

<!-- Next, set the Entity Framework DbContext in the Models namespace: -->

接下来，在 Models 命名空间中设置 Entity Framework `DbContext`：

```csharp
public class ProductContext : DbContext
{
    public ProductContext(DbContextOptions<ProductContext> options) : base(options)
    {
    }

    public DbSet<Product> Products { get; set; }
}
```

<!-- This database context is the dependency injected in the controller to query or update data. To enable Dependency Injection in ASP.NET Core, crack open the `Startup` class and add this in `ConfigureServices`: -->

该数据库上下文是注入到控制器中用于查询或更新数据的依赖项。要在 ASP.NET Core 中启用依赖注入，请打开 `Startup` 类并将其添加到 `ConfigureServices` 中：

```csharp
services.AddDbContext<ProductContext>(opt => opt.UseInMemoryDatabase("Products"));
```

<!-- This code completes the in-memory database. Be sure to add Microsoft.EntityFrameworkCore to both classes in a using statement. Because a blank back end is no fun, this needs seed data. -->

这行代码完成了内存数据库。请确保将 `Microsoft.EntityFrameworkCore` 添加到两个类的 using 语句中。因为空白的后端是无趣的，所以我们需要填充一些种子数据。

<!-- Create this extension method to help iterate through seed items. This can go in an `Extensions` namespace or folder: -->

创建下面的扩展方法以帮助迭代生成种子数据，可以将它放在 `Extensions` 命名空间或文件夹中：

```csharp
public static class EnumerableExtensions
{
    public static IEnumerable<T> Times<T>(this int count, Func<int, T> func)
    {
        for (var i = 1; i <= count; i++) yield return func.Invoke(i);
    }
}
```

The initial seed goes in Models via a static class:

在 `Models` 命名空间下添加一个静态类以初始化种子数据：

```csharp
public static class ProductSeed
{
    public static void InitData(ProductContext context)
    {
        var rnd = new Random();

        var adjectives = new[] { "Small", "Ergonomic", "Rustic", "Smart", "Sleek" };
        var materials = new[] { "Steel", "Wooden", "Concrete", "Plastic", "Granite", "Rubber" };
        var names = new[] { "Chair", "Car", "Computer", "Pants", "Shoes" };
        var departments = new[] { "Books", "Movies", "Music", "Games", "Electronics" };

        context.Products.AddRange(900.Times(x =>
        {
            var adjective = adjectives[rnd.Next(0, 5)];
            var material = materials[rnd.Next(0, 5)];
            var name = names[rnd.Next(0, 5)];
            var department = departments[rnd.Next(0, 5)];
            var productId = $"{x,-3:000}";

            return new Product
            {
                ProductNumber =
                    $"{department.First()}{name.First()}{productId}",
                Name = $"{adjective} {material} {name}",
                Price = (double)rnd.Next(1000, 9000) / 100,
                Department = department
            };
        }));

        context.SaveChanges();
    }
}
```

<!-- This code loops through a list of 900 items to create this many products. The names are picked at random with a department and price. Each product gets a “smart” key as the primary key which comes from department, name, and product id. -->

这段代码循环遍历一个 900 条项目的列表以生成这么多的产品，这些产品的部门、价格和名称都是随机挑选的。每个产品都有一个巧妙的 key 作为主键，该主键由部门、名称和产品 Id 组合而成。

<!-- Once this seed runs, you may get products such as “Smart Wooden Pants” in the Electronics department for a nominal price. -->

有了这些种子数据，您可以获得类似，一个带有标价的部门为 Electronics 的，名为 “Smart Wooden Pants” 的产品。

<!-- As a preliminary step to start building endpoints, it is a good idea to set up versioning. This allows client apps to upgrade API functionality at their leisure without tight coupling. -->

作为开始构建终端的第一步，设置 API 版本是一个好主意。这使得客户端应用可以随时升级 API 功能，而无需紧密耦合。

<!-- API versioning comes in a NuGet package: -->

API 版本控制来自一个 NuGet 包：

```shell
dotnet add package Microsoft.AspNetCore.Mvc.Versioning
```

<!-- Go back to the Startup class and add this to ConfigureServices: -->

回到 `Startup` 类，并将其添加到 `ConfigureServices` 中：

```csharp
services.AddApiVersioning(opt => opt.ReportApiVersions = true);
```

<!-- I opted to include available versions in the API response, so clients know when upgrades are available. I recommend using [Semantic Versioning](https://semver.org/) to communicate breaking changes in the API. Letting clients know what to expect between upgrades helps everyone stay on the latest features. -->

我选择在 API 响应中包括可用版本，以便客户端知道何时有可用的升级。我建议使用 [Semantic Versioning](https://semver.org/) [^Semantic]来传达 API 中的重大更改。让客户端知道升级之间会发生什么，可以帮助每个人保持最新功能。

[^Semantic]: <https://semver.org/> Semantic Versioning

## Search endpoint in a REST API

## REST API 中的搜索终端

<!-- 要构建端点，请在ASP.NET中旋转Controllers文件夹中的Controller。

To build an endpoint, spin up a Controller in ASP.NET which goes in the Controllers folder. -->

要构建一个终端，请在 Controllers 文件夹中，定位到 ASP.NET 中的 Controller。

<!-- Create a ProductsController with the following, making sure to add the namespace Microsoft.AspNetCore.Mvc with a using statement: -->

使用下面的代码创建一个 `ProductsController`，请确保在 using 语句中添加 `Microsoft.AspNetCore.Mvc` 命名空间：

```csharp
[ApiController]
[ApiVersion("1.0")]
[Route("v{version:apiVersion}/[controller]")]
[Produces("application/json")]
public class ProductsController : ControllerBase
{
    private readonly ProductContext _context;

    public ProductsController(ProductContext context)
    {
        _context = context;

        if (_context.Products.Any()) return;

        ProductSeed.InitData(context);
    }
}
```

<!-- Note `InitData` runs the initial seed when there aren’t any products in the database. I set a `Route` that uses versioning which is set via `ApiVersion`. The data context `ProductContext` gets injected in the constructor with Dependency Injection. The first endpoint is *GET* which returns a list of Products in the Controller: -->

请注意，当数据库中没有任何产品时，`InitData` 将运行并初始化种子数据。我设置了一个带有版本控制的 `Route`，版本号通过 `ApiVersion` 设置。通过依赖注入将数据上下文 `ProductContext` 注入到构造函数中。在该 Controller 中，第一个终端是返回一个产品列表的 *GET* 终端：

```csharp
[HttpGet]
[Route("")]
[ProducesResponseType(StatusCodes.Status200OK)]
public ActionResult<IQueryable<Product>> GetProducts()
{
    var result = _context.Products as IQueryable<Product>;

    return Ok(result.OrderBy(p => p.ProductNumber));
}
```

<!-- Be sure to add Microsoft.AspNetCore.Http in a using statement to set status codes in the response type. -->
请确保在 using 语句中添加 `Microsoft.AspNetCore.Http`，以设置响应类型中的状态码。

<!-- I opted to order products by product number to make it easier to show the results. In a production system, check this sort matches the clustered index, so the database doesn’t work as hard. Always review execution plans and statistics IO to confirm good performance. -->

我选择按产品编号排序产品，以便更轻松地显示结果。在一个生产系统中，检查这种排序是否与聚集索引相匹配，以便减轻数据库的运行压力。经常检查执行计划和统计 IO，以确认性能良好。

<!-- This project is ready to go for a test drive! Inside of a CLI type: -->

此项目已经可以进行测试了！在命令行中运行以下命令：

```bash
dotnet watch run
```

<!-- Hit the endpoint with curl: -->

使用 curl 测试接口：

```bash
curl -i -X GET "http://localhost:5000/v1/products" -H "accept: application/json"
```

<!-- I run both commands in separate consoles. One runs the file watcher that automatically refreshes when I make changes. The other terminal is where I keep curl results. Postman is also useful, but curl gets the job done and comes with Windows 10. -->

我在两个独立的控制台窗口中运行这两条命令。一个以监视模式运行项目，当我更新代码文件时，会自动重新生成并刷新；另一个是我保持 curl 结果的地方，可以使用 Postman，但是伴随 Windows 10 而来的 curl 也可以完成该工作。

结果如下：

![curl results of GetProducts](/assets/images/202101/curl-results-get-products.png)

<!-- This request returns all products in the database, but it’s not scalable. As the product list grows, clients will get slammed with unbound data, putting more pressure on SQL and network traffic. -->

该请求返回数据库中的所有产品，但它不可扩展。随着产品列表的增加，客户端将受到未过滤数据的猛烈冲击，从而给 SQL 和网络流量带来更大的压力。

<!-- A better approach is to introduce limit and offset request parameters in a model: -->

更好的方法是在模型中引入 `limit` 和 `offset` 请求参数：

```csharp
public class ProductRequest
{
    [FromQuery(Name = "limit")]
    public int Limit { get; set; } = 15;

    [FromQuery(Name = "offset")]
    public int Offset { get; set; }
}
```

<!-- Wire this request parameter to the GetProducts endpoint: -->

将此请求参数连接到 GetProducts 端点：

```csharp
public ActionResult<IQueryable<Product>> GetProducts([FromQuery] ProductRequest request)
{
    var result = _context.Products as IQueryable<Product>;

    Response.Headers["x-total-count"] = result.Count().ToString();

    return Ok(result
        .OrderBy(p => p.ProductNumber)
        .Skip(request.Offset)
        .Take(request.Limit));
}
```

<!-- Note I set an HTTP header x-total-count with the Count. This helps clients that may want to page through the entire result set. When requests parameters are not specified then the API defaults to the first 15 items.

Next, add a search parameter to filter products by department: -->

请注意我设置了一个值为 `Count` 的 HTTP header `x-total-count`，用于帮助想要分页浏览整个结果集的客户端。如果未指定请求参数，则该 API 默认返回前 15 项数据。

接下来，添加一个搜索参数，按部门筛选产品：

```csharp
public ActionResult<IQueryable<Product>> GetProducts([FromQuery] 
             string department, [FromQuery] ProductRequest request)
{
    // ...
    if (!string.IsNullOrEmpty(department))
    {
        result = result.Where(p => p.Department.StartsWith(department, 
                        StringComparison.InvariantCultureIgnoreCase));
    }
    // ..
}
```

<!-- Search can go inside a conditional block that alters the query. Note I use `StartsWith` and `InvariantCultureIgnoreCase` to make it easier to filter products. In actual SQL, the LIKE operator is useful, and case insensitivity can be set via collation. -->

可以通过修改 Query，让搜索进入条件块内。请注意我用了 `StartsWith` 和 `InvariantCultureIgnoreCase` 来简化产品过滤，在实际的 SQL 中，`LIKE` 运算符很有用，可以通过排序规则设置不区分大小写。

<!-- To test out paging and this new filter in curl: -->

要测试分页和此新过滤器，请使用 curl 执行以下命令：

```bash
curl -i -X GET "http://localhost:5000/v1/products?offset=15&department=electronics" -H "accept: application/json"
```

<!-- Be sure to check out HTTP headers which include total count and supported versions: -->

检查确定包含总数和受支持版本的 HTTP 头：

```
HTTP/1.1 200 OK
Date: Thu, 28 Jan 2021 11:19:09 GMT
Content-Type: application/json; charset=utf-8
Server: Kestrel
Transfer-Encoding: chunked
x-total-count: 155
api-supported-versions: 1.0
```

## 日志记录和 API 文档
