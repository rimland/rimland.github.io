---
layout: post
title:  "在 .NET Core 中构建 REST API"
date:   2021-03-11 00:10:00 +0800
categories: dotnet csharp
published: true
---

> 翻译自 Camilo Reyes 2020年8月26日的文章 [《Build a REST API in .NET Core》](https://www.red-gate.com/simple-talk/dotnet/c-programming/build-a-rest-api-in-net-core/) [^1]  
>  
> REST API 可以使用简单的谓词（如 POST、PUT、PATCH 等）将大型解决方案背后的复杂性隐藏起来。在本文中，Camilo Reyes 解释了如何在 .NET Core 中创建 REST API。

[^1]: <https://www.red-gate.com/simple-talk/dotnet/c-programming/build-a-rest-api-in-net-core/> Build a REST API in .NET Core

<!-- One way to scale large complex solutions is to break them out into REST microservices. Microservices unlock testability and reusability of business logic that sits behind an API boundary. This allows organizations to share software modules because REST APIs can be reused by multiple clients. Clients can then call as many APIs from mobile, web, or even static assets via a single-page app. -->

扩展大型复杂解决方案的一种方法是将它们分解为 REST 微服务。微服务开启了 API 背后的业务逻辑的可测试性和可重用性。因为 REST API 可以被多个客户端重用，使得组织可以共享软件模块。客户端或许是移动端、网页端，甚至单页应用中的静态资源端，它们可以调用任意多的 API。

<!-- In this take, I will show you what it takes to build a REST API in .NET Core. I will hit this with real-world demands such as versioning, search, and logging, to name a few. REST is often employed with verbs like POST, PUT, or PATCH, so I plan to cover them all. What I hope you see is a nice, effective way to deliver value with the tools available. -->

在本文中，我将向您展示在 .NET Core 中构建 REST API 的全过程。我将用现实工作中的需求来解释这个过程，比如版本控制、搜索、日志记录等等。REST 通常与诸如 `POST`、`PUT` 或 `PATCH` 的谓词一起使用，因此我打算将它们全部覆盖。我希望您看到的是，使用现有工具交付价值的一个好的有效的方式。

<!-- This article assumes a working grasp of ASP.NET, C#, and REST APIs so I will not cover any basics. I recommend the latest .NET Core LTS release at the time of this writing to follow along. If you would like to start with working code, the sample code can be downloaded from GitHub. -->

本文假定您已掌握了 ASP.NET、C# 和 REST API，因此我不会涉及任何基础知识。我建议在学习本文时使用[最新的 .NET Core 版本](https://dotnet.microsoft.com/download/dotnet-core)[^dotnet]。如果您想从工作代码开始学习，可以[从 GitHub 下载](https://github.com/beautifulcoder/BuildRestApiNetCore)[^GitHub]示例代码。

[^dotnet]: <https://dotnet.microsoft.com/download/dotnet-core> Download .NET Core  
[^GitHub]: <https://github.com/beautifulcoder/BuildRestApiNetCore> 示例代码

<!-- You can begin by creating a new folder like BuildRestApiNetCore and firing this up in a shell: -->

你可以先新建一个文件夹，比如 *BuildRestApiNetCore*，然后在 shell 中打开它：

```shell
dotnet new sln
dotnet new webapi --no-https
dotnet sln add .
```

<!-- 
This project is based on a Web API template with HTTPS disabled to make it easier for local development. Double-clicking the solution file brings it up in Visual Studio if you have it installed. For .NET Core 3.1 support, be sure to have the 2019 version of the IDE. -->

该项目基于禁用了 HTTPS 的 Web API 模板，以简化本地开发。双击解决方案文件会在 Visual Studio 中打开它（如果已安装）。为了支持 .NET Core 3.1，请确保安装了 2019 版的 IDE。

<!-- APIs put a layer of separation between clients and the database, so the data is an excellent place to start. To keep data access trivial, Entity Framework has an in-memory alternative so that I can focus on the API itself. -->

由于 API 在客户端和数据库之间建立了一层分离，因此准备数据是一个很好的开始。为了简化数据访问，Entity Framework 提供了一个内存中的替代方案，这样我就可以只关注 API 本身。

<!-- An in-memory database provider comes via NuGet: -->

通过 NuGet 获取内存数据库提供程序：

```shell
dotnet add package Microsoft.EntityFrameworkCore.InMemory
```

<!-- Then, create the following data model. I put this in the Models folder to indicate this namespace houses raw data. To use the data annotations, add System.ComponentModel.DataAnnotations in a using statement. -->

然后，创建以下数据模型。我将其放在 Models 文件夹中，以表示此命名空间存放原始数据。若要使用数据标注，请在 using 语句中添加 `System.ComponentModel.DataAnnotations`。

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

在实际的解决方案中，这可能要根据团队的需要将其放在单独的项目中。请注意分配给该模型的属性，例如 `Required`、`Display` 和 `Range`，这些是 ASP.NET 中的数据标注，用于在模型绑定时验证 `Product`。因为我使用的是内存数据库，所以 Entity Framework 需要一个唯一的 *Key*。这些属性指定了验证规则，例如：价格区间或者该属性是否是必须的。

<!-- From a business perspective, this is an e-commerce site with a product number, name, and price. Each product is also assigned a department to make searches by department easier. -->

从业务的视角来看，这是一个包含产品编号、名称和价格的电子商务站点。每个产品还指定了一个部门，以便按部门进行搜索。

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

该数据库上下文被依赖注入到控制器中，用于查询或更新数据。要在 ASP.NET Core 中启用依赖注入，请打开 `Startup` 类并将其添加到 `ConfigureServices` 中：

```csharp
services.AddDbContext<ProductContext>(opt => opt.UseInMemoryDatabase("Products"));
```

<!-- This code completes the in-memory database. Be sure to add Microsoft.EntityFrameworkCore to both classes in a using statement. Because a blank back end is no fun, this needs seed data. -->

这行代码完成了内存数据库。请确保在两个类的 using 语句中添加 `Microsoft.EntityFrameworkCore`。一个空白的后端是无趣的，因此我们来填充一些种子数据。

<!-- Create this extension method to help iterate through seed items. This can go in an `Extensions` namespace or folder: -->

创建下面的扩展方法以帮助迭代生成种子数据，可以将它放在 *Extensions* 命名空间或文件夹中：

```csharp
public static class EnumerableExtensions
{
    public static IEnumerable<T> Times<T>(this int count, Func<int, T> func)
    {
        for (var i = 1; i <= count; i++) yield return func.Invoke(i);
    }
}
```

<!-- The initial seed goes in Models via a static class: -->

在 *Models* 命名空间下添加一个静态类以初始化种子数据：

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
                ProductNumber = $"{department.First()}{name.First()}{productId}",
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

这段代码循环遍历一个 900 条数据的列表以生成大量的产品，这些产品的部门、价格和名称都是随机捡选的。每个产品都有一个“巧妙”的 key 作为主键，该主键由部门、名称和产品 Id 组合而成。

<!-- Once this seed runs, you may get products such as “Smart Wooden Pants” in the Electronics department for a nominal price. -->

有了这些种子数据，您就可以得到诸如在 Electronics 部门带有标价的名为 “Smart Wooden Pants” 的产品了。

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

我选择在 API 响应中包括可用版本，以便客户端知道何时有可用的升级。我建议使用 [语义化的版本控制](https://semver.org/) [^Semantic]来传达 API 中的重大更改。让客户端知道每次升级都修改了什么，有助于每个客户端保持最新的功能。

[^Semantic]: <https://semver.org/> Semantic Versioning

<!-- ## Search endpoint in a REST API -->

## REST API 中的搜索终端

<!-- 要构建端点，请在ASP.NET中旋转Controllers文件夹中的Controller。

To build an endpoint, spin up a Controller in ASP.NET which goes in the Controllers folder. -->

要构建一个终端，请在 *Controllers* 文件夹中转到 ASP.NET 中的 Controller。

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

请注意，当数据库中没有任何产品时，将运行 `InitData` 初始化种子数据。我设置了一个带有版本控制的 `Route`，版本号通过 `ApiVersion` 设置。通过依赖注入将数据上下文 `ProductContext` 注入到构造函数中。在该 Controller 中，第一个终端是返回一个产品列表的 *GET* 终端：

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

我选择按产品编号排序产品，以便更轻松地显示结果。在生产系统中，可以检查这种排序是否与聚集索引相匹配，以便减轻数据库的运行压力。经常检查执行计划和统计 IO，以确认有良好的性能。

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

我在两个独立的控制台窗口中运行这两条命令。一个以监视模式运行项目，当我更改代码文件时，会自动重新生成并刷新；另一个是我保持 curl 结果的地方，可以使用 Postman，但是伴随 Windows 10 而来的 curl 也可以完成该工作。

结果如下：

![curl results of GetProducts](/assets/images/202102/curl-results-get-products.png)

<!-- This request returns all products in the database, but it’s not scalable. As the product list grows, clients will get slammed with unbound data, putting more pressure on SQL and network traffic. -->

该请求返回数据库中的所有产品，但它不可扩展。随着产品列表的增加，客户端将受到未过滤数据的猛烈冲击，从而给 SQL 和网络流量带来更大的压力。

<!-- A better approach is to introduce limit and offset request parameters in a model: -->

更好的方法是在一个模型中引入 `limit` 和 `offset` 请求参数：

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

将此请求参数关联到 **GetProducts** 端点：

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

```json
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

当 API 成形后，如何向其他开发人员传达终端呢？对于团队来说，在不破坏开放代码的情况下了解 API 公开的内容是有益的。Swagger 是这里的首选工具，它能通过反射，生成可用内容的文档。

<!-- What if I told you everything swagger needs is already set in this API? Go ahead, take a second look: -->

如果我告诉您，Swagger 所需的一切都已经在此 API 中设置过了呢？来吧，再看一眼：

```csharp
[Produces("application/json")]
[ProducesResponseType(StatusCodes.Status200OK)]
ActionResult<IQueryable<Product>> GetProducts([FromQuery] 
               string department, [FromQuery] ProductRequest request)
```

<!-- ASP.NET attributes are useful for documenting endpoints. Swagger also picks up return types from controller methods to figure out what responses look like and picks up request parameters in each controller method via reflection. It produces “living documentation” because it sucks up everything from working code, which reduces mishaps. -->

ASP.NET 属性对于端点自文档化非常有用。Swagger 通过反射，从控制器方法中获得返回类型，以推断响应该是什么样子，并获得每个控制器方法中的请求参数。因为它收集了工作代码中的所有内容，所以可以生成“活文档”，从而减少了故障的发生。

<!-- The one dependency lacking is a NuGet: -->

通过 NuGet 获取缺少的依赖项：

```bash
dotnet add package Swashbuckle.AspNetCore
```

并在 `ConfigureServices` 中将其关联进来：

```csharp
services.AddSwaggerGen(c => c.SwaggerDoc("v1", new OpenApiInfo
{
    Title = "Products",
    Description = "The ultimate e-commerce store for all your needs",
    Version = "v1"
}));
```

<!-- Then, enable this in Configure: -->

然后，在 `Configure` 中启用它：

```csharp
app.UseSwagger();
app.UseSwaggerUI(opt => opt.SwaggerEndpoint("/swagger/v1/swagger.json", "Products v1"));
```

<!-- Note `OpenApiInfo` comes from the `Microsoft.OpenApi.Models` namespace. With this, navigate to *http://localhost:5000/swagger* in the browser to check out the swagger doc. -->

注意 `OpenApiInfo` 来自 `Microsoft.OpenApi.Models` 命名空间。此时，在浏览器中导航到 *http://localhost:5000/swagger* 就可以查看 swagger 文档了。

<!-- The page should look like this: -->

页面大概如下显示：

![swagger page](/assets/images/202102/swagger-page.png)

<!-- From the swagger doc, feel free to poke around and fire requests to the API from this tool. Fellow developers from across the organization might even buy you a cup of coffee for making their lives easier. -->

在 swagger 文档中，您可以轻松浏览 API 并通过这个工具向 API 发起请求，您所在组织的其他开发人员会因此受益而生活轻松，他们甚至可能会请您喝杯咖啡。

<!-- Note how expanding GET /Products picks up C# data types from the method in the controller:
注意扩展GET / Products如何从控制器中的方法中提取C＃数据类型： -->

展开 GET `/Products` 查看从控制器中的方法中提取的 C# 数据类型：

![swagger page](/assets/images/202102/get-products.png)

<!-- The next stop is the logger. I will use NLog to store logs in the back end. This enables the API to save logs for further analysis. In a real environment, logs are useful for troubleshooting outages. They also aid in gathering telemetry to help understand how the API is utilized in the wild. -->

下一站是日志记录。我将使用 `NLog` 在后端存储日志，使得 API 能够保存日志以供进一步分析。在实际环境中，日志对于故障排除非常有用；另外，它们还可以帮助收集遥测数据，以帮助了解 API 的使用情况。

<!-- To set up the logger, I am going to need the following: -->

要设置日志记录器，需要完成做以下操作：

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

请注意 `Layout`，因为它设置了日志文件的类型，这里将其设置为 `JsonLayout`。当在不同的分析工具中使用日志文件时，JSON 格式具有最大的灵活性。为了让冗余降到最小，记录器规则不记录来自 *Microsoft.** 的错误。另外，因为将 `throwExceptions` 设置为了 false，API 中未处理的异常会被记录，但不会被重新抛出。这里的用法可能是多变的，但是通常最好是在 logger 中处理所有未处理的异常。

<!-- Inside the Program class, enable NLog, remembering to include using NLog.Web: -->

在 `Program` 类中，启用 `NLog`，记得添加 `using NLog.Web`：

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

其基本思想是减少与此 API 无关的日志条目的数量。您可以随意调整这些设置，以便恰当地记录 API 所需要的日志内容。

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

假设，现在团队决定要抓取客户端请求获取 100 条或更多条记录的频率相关的遥测数据。

将下面代码放入 `GetProducts` 中：

```csharp
if (request.Limit >= 100)
  _logger.LogInformation("Requesting more than 100 products.");
```

<!-- Be sure to have a temp folder handy to check the logs, for example, C:\temp\BuildRestApiNetCore\. -->

请确保有一个已存在的临时文件夹来查看日志，例如：`C:\temp\BuildRestApiNetCore\`。

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

## 带谓词的 REST 端点

<!-- Take a deep breath in and breath out. This API is almost production-ready with minimal code. I will now quickly turn towards REST features such as `POST`, `PUT`, `PATCH`, and `DELETE`. -->

深吸一口气，然后呼出。该 API 几乎可以投入生产环境了，而且只用了很少的代码。现在，我将快速转向 `POST`、`PUT`、`PATCH` 和 `DELETE` 等 REST 特性的介绍。

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

ASP.NET 通过 `ValidationProblem` 自动处理异常。该验证将返回一条符合 [RFC 7807 规范](https://tools.ietf.org/html/rfc7807)[^RFC]的响应，并带有一条消息。在实际的系统中，我建议确保不要暴露任何有关 API 的内部信息。将异常信息放在此处可帮助客户端对代码进行故障排除，但是安全性也很重要。我选择包含错误信息主要是出于演示目的。这里还会将异常记录为警告，以避免记录大量错误。当异常太多时，监控工具可能会呼叫值班人员。最佳实践是仅在可能需要人工干预的灾难性故障期间记录错误。

[^RFC]: <https://tools.ietf.org/html/rfc7807> RFC 7807 规范
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

*400 (Bad Request)* 响应表示请求中的用户错误。因为无法信任用户发送有效数据，所以 API 会记录一个警告。

<!-- Note that on success POST returns a 201 with Location: -->

请注意，如果成功，`POST` 将返回带有 *Location* 的 201：

```json
HTTP/1.1 201 Created
Date: Mon, 13 Jul 2020 22:52:46 GMT
Content-Type: application/json; charset=utf-8
Server: Kestrel
Content-Length: 76
Location: /products/bc916
api-supported-versions: 1.0
```

<!-- This points the client towards the new resource. So, it is a good idea to spin up this GET endpoint: -->

这将引导客户端转向新资源。因此，转向 `GET` 端点是个好主意：

```csharp
[HttpGet]
[Route("{productNumber}")]
[ProducesResponseType(StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
public ActionResult<Product> GetProductByProductNumber([FromRoute] 
            string productNumber)
{
  var productDb = _context.Products
    .FirstOrDefault(p => p.ProductNumber.Equals(productNumber, 
              StringComparison.InvariantCultureIgnoreCase));
 
  if (productDb == null) return NotFound();
 
  return Ok(productDb);
}
```

<!-- A 404 response indicates the resource does not exist in the API yet but might become available at some point in the future. -->

404 响应表示该资源在 API 中尚不存在，但可能会在将来的某个时候变得可用。

<!-- `PUT` is similar: -->

`PUT` 是类似的：

```csharp
[HttpPut]
[ProducesResponseType(StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
[ProducesResponseType(StatusCodes.Status400BadRequest)]
public ActionResult<Product> PutProduct([FromBody] Product product)
{
  try
  {
    var productDb = _context.Products
      .FirstOrDefault(p => p.ProductNumber.Equals(product.ProductNumber, 
           StringComparison.InvariantCultureIgnoreCase));
 
    if (productDb == null) return NotFound();
 
    productDb.Name = product.Name;
    productDb.Price = product.Price;
    productDb.Department = product.Department;
    _context.SaveChanges();
 
    return Ok(product);
  }
  catch (Exception e)
  {
    _logger.LogWarning(e, "Unable to PUT product.");
 
    return ValidationProblem(e.Message);
  }
}
```

<!-- In REST design, a PUT allows updates to an entire resource. It is idempotent because multiple identical requests do not alter the number of resources. -->

在 REST 设计中，`PUT` 允许对整个资源进行更新。它是幂等的，因为多次相同的请求不会改变资源的数量。

<!-- Like a GET 404 response, the resource is unavailable for updates, but this might change later. As a bonus, ASP.NET provides model binding validation out of the box. Go ahead, try to update an existing resource with bad data. -->

就像 *GET 404* 响应一样，表示该资源不可用于更新，但这可能在稍后发生变化。另外，ASP.NET 提供现成的模型绑定验证。接下来，尝试一下使用错误的数据更新现有资源。

<!-- This JSON is the *Bad Request* response you might see: -->

下面的 JSON 是您可能看到的 *错误请求* 的响应：

```json
{
  "errors": {
    "Price": ["The price field is required."]
  },
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "traceId": "|c445a409-43564e0626f9af50."
}
```

<!-- `PATCH` is the most complex of all verbs because it only updates a part of the resource via a JSON Patch document. -->

`PATCH` 是所有谓词中最复杂的，因为它通过 [JSON Patch 文档](https://tools.ietf.org/html/rfc6902)[^rfc6902]仅更新资源的一部分。

[^rfc6902]: <https://tools.ietf.org/html/rfc6902> JSON Patch 文档

<!-- The good news is .NET Core helps with a NuGet package: -->

好消息是 .NET Core 提供了一个 NuGet 包：

```bash
dotnet add package Microsoft.AspNetCore.Mvc.NewtonsoftJson
```

<!-- Then, enable this in ConfigureServices: -->

然后，在 `ConfigureServices` 中启用它：

```csharp
services.AddControllers().AddNewtonsoftJson();
```

<!-- This is the PATCH endpoint. Remember using Microsoft.AspNetCore.JsonPatch: -->

下面是 `PATCH` 端点，记得添加 `using Microsoft.AspNetCore.JsonPatch`：

```csharp
[HttpPatch]
[Route("{productNumber}")]
[ProducesResponseType(StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
[ProducesResponseType(StatusCodes.Status400BadRequest)]
public ActionResult<Product> PatchProduct([FromRoute] 
      string productNumber, [FromBody] JsonPatchDocument<Product> patch)
{
  try
  {
    var productDb = _context.Products
      .FirstOrDefault(p => p.ProductNumber.Equals(productNumber, 
           StringComparison.InvariantCultureIgnoreCase));
 
    if (productDb == null) return NotFound();
 
    patch.ApplyTo(productDb, ModelState);
 
    if (!ModelState.IsValid || !TryValidateModel(productDb)) 
             return ValidationProblem(ModelState);
 
    _context.SaveChanges();
 
    return Ok(productDb);
  }
  catch (Exception e)
  {
    _logger.LogWarning(e, "Unable to PATCH product.");
 
    return ValidationProblem(e.Message);
  }
}
```

<!-- I hope you see a pattern start to emerge with the different status code response types. A 200 OK means success and a 400 Bad Request means user error. Once a patch gets applied it appends any validation errors in ModelState. Take a closer look at JsonPatchDocument, which does model binding, and ApplyTo, which applies changes. This is how a JSON Patch document gets applied to an existing product in the database. Exceptions get logged and included in the response like all the other endpoints. A 404 (Not Found) response indicates the same situation as all the other verbs. This consistency in response status codes helps clients deal with all possible scenarios. -->

我希望您看到一种含有不同状态码响应类型的模式开始浮现。*200 OK* 表示成功，*400 Bad Request* 表示用户错误。当 patch 被应用后，将会在 `ModelState` 中附加所有的验证错误。仔细研究进行模型绑定的 `JsonPatchDocument` 和 应用更改的 `ApplyTo`。这就是将 JSON Patch 文档应用到数据库中现有产品的方式。像所有其它端点一样，异常会被记录并包含在响应中。与其它谓词端点一样，*404 (Not Found)* 响应表示相同的情形。响应状态码的一致性有助于客户端处理所有可能的场景。

<!-- A JSON patch request body looks like the following: -->

一个 JSON patch 请求的 body 大概如下所示：

```json
[{
  "op": "replace",
  "path": "price",
  "value": 13.67
}]
```

<!-- Model binding validation rules still apply to the patch operation to preserve data integrity. Note the patch gets wrapped around an array, so it supports an arbitrary list of operations. -->

模型绑定验证规则依然适用于 patch 操作，以保持数据的完整性。请注意，patch 操作被包装在一个数组中，因此它支持任意的操作列表。

<!-- This is PATCH in curl: -->

下图是 curl 中的 `PATCH`：

![PATCH in curl](/assets/images/202102/patch-in-curl.png)

<!-- Last stop, a DELETE method: -->

最后一站，`DELETE` 方法：

```csharp
[HttpDelete]
[Route("{productNumber}")]
[ProducesResponseType(StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
public ActionResult<Product> DeleteProduct([FromRoute] 
        string productNumber)
{
  var productDb = _context.Products
    .FirstOrDefault(p => p.ProductNumber.Equals(productNumber, 
           StringComparison.InvariantCultureIgnoreCase));
 
  if (productDb == null) return NotFound();
 
  _context.Products.Remove(productDb);
  _context.SaveChanges();
 
  return NoContent();
}
```

<!-- The status code response is No Content: -->

它的状态码响应是 *No Content*：

```json
HTTP/1.1 204 No Content
Date: Tue, 14 Jul 2020 22:59:20 GMT
Server: Kestrel
api-supported-versions: 1.0
```

<!-- This status signals to clients that the resource is no longer available because the response body is empty. The response can also be 204 (Accepted) if this needs an async background process to clean up the data. In a real system, soft deletes are sometimes preferable to allow rollback during auditing. When deleting data, be sure to comply with GPDR or any policy that applies to the data. -->

此状态向客户端发出信号，表示资源不再可用，因为响应主体为空。如果需要异步后台进程来清理数据，则响应也可以为 *204 (Accepted)*。在实际系统中，有时最好使用软删除，以允许在审核期间进行回滚。删除数据时，请确保遵守 GPDR 或适用于该数据的任一策略。

<!-- ## Conclusion -->
## 总结

<!-- .NET Core adds many useful features to your toolbelt to make working with REST APIs easier. Complex use cases such as documentation, validation, logging, and PATCH requests are simpler to think about. -->

.NET Core 在您的工具袋中添加许多有用的特性，从而让使用 REST API 变得更加轻松，将诸如文档、验证、日志记录和 `PATCH` 请求等复杂的用例变得更易于实现。
