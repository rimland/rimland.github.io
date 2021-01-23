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

