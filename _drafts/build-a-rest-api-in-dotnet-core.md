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

![curl results of GetProducts](/assets/images/202102/curl-results-get-products.png)

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

<!-- With the API taking shape, how can I communicate endpoints to other developers? It is beneficial for teams to know what the API exposes without having to bust open code. Swagger is the tool of choice here; by using reflection, it is capable of documenting what’s available. -->

当 API 成形后，如何向其他开发人员传达终端呢？对于团队来说，在不破坏开放代码的情况下了解 API 公开的内容是益的。Swagger 是这里的首选工具，它能通过反射，生成可用内容的文档。

What if I told you everything swagger needs is already set in this API? Go ahead, take a second look:

如果我告诉您，Swagger 所需的一切都已经在此 API 中设置过了呢？来吧，再看一下：

```csharp
[Produces("application/json")]
[ProducesResponseType(StatusCodes.Status200OK)]
ActionResult<IQueryable<Product>> GetProducts([FromQuery] 
               string department, [FromQuery] ProductRequest request)
```

<!-- ASP.NET attributes are useful for documenting endpoints. Swagger also picks up return types from controller methods to figure out what responses look like and picks up request parameters in each controller method via reflection. It produces “living documentation” because it sucks up everything from working code, which reduces mishaps. -->

ASP.NET 属性对于端点文档非常有用。Swagger 通过反射，从控制器方法中获得返回类型，以推断响应该是什么样子，并获得每个控制器方法中的请求参数。因为它吸收了工作代码中的所有内容，所以它可以生成“活生生的文档”，从而减少故障的发生。

<!-- The one dependency lacking is a NuGet: -->

通过 NuGet 获取缺少的依赖项：

```bash
dotnet add package Swashbuckle.AspNetCore
```

并将其连接到 `ConfigureServices` 中：

```csharp
services.AddSwaggerGen(c => c.SwaggerDoc("v1", new OpenApiInfo
{
    Title = "Products",
    Description = "The ultimate e-commerce store for all your needs",
    Version = "v1"
}));
```

<!-- Then, enable this in Configure: -->

然后，在 `Configure` 中启动：

```csharp
app.UseSwagger();
app.UseSwaggerUI(opt => opt.SwaggerEndpoint("/swagger/v1/swagger.json", "Products v1"));
```

<!-- Note `OpenApiInfo` comes from the `Microsoft.OpenApi.Models` namespace. With this, navigate to *http://localhost:5000/swagger* in the browser to check out the swagger doc. -->

注意 `OpenApiInfo` 来自 `Microsoft.OpenApi.Models` 命名空间。此时，在浏览器中导航到 *http://localhost:5000/swagger* 可以查看 swagger 文档。

<!-- The page should look like this: -->

页面大概如下显示：

![swagger page](/assets/images/202102/swagger-page.png)

<!-- From the swagger doc, feel free to poke around and fire requests to the API from this tool. Fellow developers from across the organization might even buy you a cup of coffee for making their lives easier. -->

在 swagger 文档中，您可以轻松浏览 API 接口并向接口发起请求，您所在组织的其他开发人员会因此受益而生活轻松，他们甚至可能会请您喝杯咖啡。

<!-- Note how expanding GET /Products picks up C# data types from the method in the controller:
注意扩展GET / Products如何从控制器中的方法中提取C＃数据类型： -->

展开 GET `/Products` 查看从控制器中的方法中提取的 C# 数据类型：

![swagger page](/assets/images/202102/get-products.png)

<!-- The next stop is the logger. I will use NLog to store logs in the back end. This enables the API to save logs for further analysis. In a real environment, logs are useful for troubleshooting outages. They also aid in gathering telemetry to help understand how the API is utilized in the wild. -->

下一站是日志记录。我将使用 `NLog` 在后端存储日志，使得 API 能够保存日志以供进一步分析。在实际环境中，日志对于故障排除非常有用；另外，它们还可以帮助收集遥测数据，以帮助了解 API 的使用情况。

<!-- To set up the logger, I am going to need the following: -->

要设置记录器，需要完成做以下操作：

- 一个 NuGet 包
- 一个 *nlog.config* 设置文件
- 修改 `Program` 类
- 微调 *appsettings.json*

安装 NuGet 包：

```bash
dotnet add package NLog.Web.AspNetCore
```

*nlog.config* 文件可以如下：

```xml
<?xml version="1.0" encoding="utf-8" ?>
<nlog xmlns="http://www.nlog-project.org/schemas/NLog.xsd"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      throwExceptions="false"
      throwConfigExceptions="false"
      autoReload="true"
      internalLogLevel="Warn"
      internalLogFile=
           "C:\temp\BuildRestApiNetCore\RestApi-internal-nlog.txt">
 
  <extensions>
    <add assembly="NLog.Web.AspNetCore"/>
  </extensions>
 
  <targets async="true">
    <target xsi:type="File"
            name="ownFile-web"
            fileName=
              "C:\temp\BuildRestApiNetCore\RestApi-${shortdate}.log">
 
      <layout xsi:type="JsonLayout">
        <attribute name="Timestamp" layout="${longdate}" />
        <attribute name="Level" layout="${uppercase:${level}}" />
        <attribute name="Logger" layout="${logger}" />
        <attribute name="Action" layout="${aspnet-mvc-action}" />
        <attribute name="Message" layout="${message}" />
        <attribute 
           name="Exception" layout="${exception:format=tostring}" />
      </layout>
    </target>
  </targets>
 
  <rules>
    <logger name="Microsoft.*" maxlevel="Info" final="true" /> 
                
    <logger name="*" minlevel="Info" writeTo="ownFile-web" />
  </rules>
</nlog>
```
<!--Pay attention to `Layout` because it sets the type of log file which is set to `JsonLayout`. This JSON format has the most flexibility when consuming log files in different analytical tools. Logger rules do not log errors from *Microsoft.** to keep chattiness down to a minimum. As a bonus, unhandled exceptions from the API get logged but do not rethrow because `throwExceptions` is false. Usage here may vary, but it is generally a good idea to handle all unhandled exceptions in the logger. -->

请注意 `Layout`，因为它设置了日志文件的类型，这里将其设置为 `JsonLayout`。当在不同的分析工具中使用日志文件时，JSON 格式具有最大的灵活性。为了让冗余降到最小，记录器规则不记录来自 *Microsoft.** 的错误。另外，因为将 `throwExceptions` 设置为了 false，API 中未处理的异常会被记录，但不会被重新抛出。这里的用法可能会有所改变，但是通常最好在记录器中处理所有未处理的异常。

<!-- Inside the Program class, enable NLog, remembering to include using NLog.Web: -->

在 `Program` 类中，启用 NLog，记得添加 `using NLog.Web`：

```csharp
Host.CreateDefaultBuilder(args)
  .ConfigureWebHostDefaults(webBuilder =>
  {
    webBuilder.UseStartup<Startup>();
  })
  .UseNLog();
```

<!-- Finally, make these tweaks to configure logging in appsettings.json: -->

最后，在 *appsettings.json* 中进行以下微调来配置日志记录：

```json
"Logging": {
  "LogLevel": {
    "Default": "Information",
    "Microsoft": "None",
    "Microsoft.AspNetCore": "Error",
    "Microsoft.Hosting.Lifetime": "Information"
  }
}
```

<!-- The basic idea is to cut the number of log entries which aren’t relevant to this API. Feel free to poke around with the settings, so it logs exactly what the API needs. -->

其基本思想是减少与此 API 无关的日志条目的数量。您可以随意调整这些设置，以便精确地记录 API 所需要的日志内容。

<!-- It’s time to take this for a spin. In the Controller class, add using Microsoft.Extensions.Logging and inject a plain old ASP.NET logger: -->

是时候言归正传了，在 `Controller` 类中，添加 `using Microsoft.Extensions.Logging` 并注入一个普通的旧 ASP.NET 记录器：

```csharp
private readonly ILogger<ProductsController> _logger;
 
public ProductsController(ProductContext context, 
            ILogger<ProductsController> logger)
{
  _logger = logger;
  // ...
}
```

<!-- Say now the team decides to grab telemetry around how often clients ask for 100 records or more. -->

假设现在团队决定根据客户要求获取 100 条或更多记录的频率获取遥测数据。

将下面代码放入 `GetProducts` 中：

```csharp
if (request.Limit >= 100)
  _logger.LogInformation("Requesting more than 100 products.");
```

<!-- Be sure to have a temp folder handy to check the logs, for example, C:\temp\BuildRestApiNetCore\. -->

请确保有一个方便的临时文件夹来检查日志，例如：`C:\temp\BuildRestApiNetCore\`。

<!-- This is what an entry might look like: -->

记录可能是这样的：

```json
{
  "Timestamp": "2020-07-12 10:30:30.8960",
  "Level": "INFO",
  "Logger": "BuildRestApiNetCore.Controllers.ProductsController",
  "Action": "GetProducts",
  "Message": "Requesting more than 100 products."
}
```

<!-- ## REST Endpoints with Verbs -->

## 带动词的 REST 端点

Take a deep breath in and breath out. This API is almost production-ready with minimal code. I will now quickly turn towards REST features such as `POST`, `PUT`, `PATCH`, and `DELETE`.

深吸一口气，然后呼出。该 API 几乎可以投入生产环境了，只用了很少的代码。现在，我将快速转向 `POST`、`PUT`、`PATCH` 和 `DELETE` 等 REST 特性。

<!-- The POST endpoint takes in a body with the new product and adds it to the list. This method is not idempotent because it creates new resources when invoked. -->

`POST` 终端接收带有新产品的 body，并将其添加到列表当中。此方法是非幂等的，因为它在调用时创建了新的资源。

将下面代码放入 `ProductsController` 中：

```csharp
[HttpPost]
[ProducesResponseType(StatusCodes.Status201Created)]
[ProducesResponseType(StatusCodes.Status400BadRequest)]
public ActionResult<Product> PostProduct([FromBody] Product product)
{
  try
  {
    _context.Products.Add(product);
    _context.SaveChanges();
 
    return new CreatedResult($"/products/{product.ProductNumber.ToLower()}", product);
  }
  catch (Exception e)
  {
    _logger.LogWarning(e, "Unable to POST product.");
 
    return ValidationProblem(e.Message);
  }
}
```

<!-- ASP.NET automatically handles exceptions via ValidationProblem. This validation returns an RFC 7807 spec compliant response with a message. In a real system, I recommend making sure this does not expose any internals about the API. Putting the exception message here helps clients troubleshoot their code, but security is also important. I opted to include the error message mostly for demonstration purposes. The exception is also logged as a warning, to avoid logging a bunch of errors. Monitoring tools might page out to whoever is on-call when there are too many exceptions. A best practice is to only log errors during catastrophic failures that might need human intervention. -->

ASP.NET 通过 `ValidationProblem` 自动处理异常。该验证将返回一条符合 [RFC 7807 规范](https://tools.ietf.org/html/rfc7807)的响应，并带有一条消息。在实际的系统中，我建议确保不要暴露任何有关API的内部信息。将异常消息放在此处可帮助客户端对代码进行故障排除，但是安全性也很重要。我选择包含错误消息主要是出于演示目的。还会将异常记录为警告，以避免记录大量错误。当异常太多时，监控工具可能会呼叫值班人员。最佳实践是仅在可能需要人工干预的灾难性故障期间记录错误。

<!-- 
ASP.NET通过ValidationProblem自动处理异常。此验证返回一个符合RFC 7807规范的响应和一条消息。在实际系统中，我建议确保这不会暴露任何有关API的内部信息。将异常消息放在这里有助于客户机排除代码故障，但安全性也很重要。我选择包含错误消息主要是为了演示。异常也被记录为警告，以避免记录大量错误。当异常太多时，监控工具可能会向任何待命人员发送页面。最佳实践是只记录可能需要人工干预的灾难性故障期间的错误。

ASP。
NET通过ValidationProblem自动处理异常。
该验证返回一个符合RFC 7807规范的响应，并带有一条消息。
在实际的系统中，我建议确保这不会暴露API的任何内部内容。
将异常消息放在这里可以帮助客户对其代码进行故障排除，但安全性也很重要。
我选择包含错误消息主要是出于演示目的。
异常也被记录为警告，以避免记录大量错误。
当有太多的例外情况时，监控工具可能会转到值班人员身上。
最佳实践是仅在可能需要人工干预的灾难性故障期间记录错误。

ASP.NET通过ValidationProblem自动处理异常。 该验证将返回一条符合RFC 7807规范的响应，并带有一条消息。 在真实系统中，我建议确保不要暴露任何有关API的内部信息。 将异常消息放在此处可帮助客户端对代码进行故障排除，但是安全性也很重要。 我选择包含错误消息主要是出于演示目的。 还会将异常记录为警告，以避免记录大量错误。 异常太多时，监视工具可能会将呼叫者呼叫出去。 最佳做法是仅在可能需要人工干预的灾难性故障期间记录错误。 -->

<!-- Using the swagger tool, the curl command is: -->

使用 swagger 工具，curl 命令为：

```bash
curl -i -X POST http://localhost:5000/v1/products
  -H "accept: application/json"
  -H "Content-Type: application/json"
  -d "{\"productNumber\":\"string\",\"name\":\"string\",\"price\":10,\"department\":\"string\"}"
```

<!-- When there are problems with the request, the API responds with: -->

当请求出现问题时，API 会响应：

```json
{
  "errors": {},
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title":"One or more validation errors occurred.",
  "status": 400,
  "detail": "An item with the same key has already been added. Key: string",
  "traceId":"|c445a403-43564e0626f9af50."
}
```

<!-- A 400 (*Bad Request*) response indicates a user error in the request. Because users can’t be trusted to send valid data, the API logs a warning. -->

400 (*Bad Request*) 响应表示请求中的用户错误。因为无法信任用户发送有效数据，所以 API 会记录一个警告。

<!-- Note that on success POST returns a 201 with Location: -->

请注意，如果成功，POST 将返回带有 *Location* 的 201：

```json
HTTP/1.1 201 Created
Date: Mon, 13 Jul 2020 22:52:46 GMT
Content-Type: application/json; charset=utf-8
Server: Kestrel
Content-Length: 76
Location: /products/bc916
api-supported-versions: 1.0
```
