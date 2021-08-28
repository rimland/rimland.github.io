---
layout: post
title:  "Blazor Server 应用程序中进行 HTTP 请求"
date:   2021-07-19 00:10:10 +0800
categories: dotnet csharp
tags: [DotNet, Blazor]
published: true
---

> 翻译自 Waqas Anwar 2021年5月13日的文章 [《Making HTTP Requests in Blazor WebAssembly Apps》](https://www.ezzylearning.net/tutorial/making-http-requests-in-blazor-webassembly-apps) [^1]

[^1]: <https://www.ezzylearning.net/tutorial/making-http-requests-in-blazor-webassembly-apps> Making HTTP Requests in Blazor WebAssembly Apps

![Making-HTTP-Requests-in-Blazor-WebAssembly-Apps](https://www.ezzylearning.net/wp-content/uploads/Making-HTTP-Requests-in-Blazor-WebAssembly-Apps.jpg)

<!--In my previous post Making HTTP Requests in Blazor Server Apps, I covered different techniques of making HTTP requests in Blazor Server apps where you have access to all .NET libraries and components. If you are creating a Blazor WebAssembly App, then your code is running on the client within the browser sandbox and your options are somehow limited. In this tutorial, I will show you how you can make HTTP requests from Blazor WebAssembly Apps.-->

在我的前篇文章[《Blazor Server 应用程序中进行 HTTP 请求》](https://ittranslator.cn/dotnet/csharp/2021/08/23/making-http-requests-in-blazor-server-apps.html)中，我介绍了在 Blazor Server 应用程序中进行 HTTP 请求的相关技术，在 Blazor Server App 中您可以访问所有的 .NET 类库和组件。但如果您创建的是 Blazor WebAssembly 应用程序，那么您的代码将在客户端的浏览器沙箱中运行，您的选择在某种程度上会受到限制。在本教程中，我将向您展示如何在 Blazor WebAssembly 应用程序进行 HTTP 请求。

<!-- Overview of HttpClient in Blazor WebAssembly Apps -->

## Blazor WebAssembly 应用程序中的 HttpClient 概述

<!--Blazor WebAssembly apps call web APIs using a preconfigured HttpClient service. This preconfigured HttpClient is implemented using the use browser Fetch API  and has some limitations. HttpClient can also use Blazor JSON helpers or HttpRequestMessage object to make API calls. By default, the API call requests can only be made to the same server of origin but you can call third-party APIs available on other servers if they support Cross-origin resource sharing (CORS).-->

Blazor WebAssembly 应用程序使用预置的 [HttpClient](https://docs.microsoft.com/zh-cn/dotnet/api/system.net.http.httpclient) 服务调用 Web API。这个预置的 HttpClient 是使用浏览器的 [Fetch API](https://developer.mozilla.org/docs/Web/API/Fetch_API) 实现的，会有一些限制。HttpClient 还可以使用 Blazor JSON 帮助程序或 [HttpRequestMessage](https://docs.microsoft.com/zh-cn/dotnet/api/system.net.http.httprequestmessage) 对象进行 API 调用。默认情况下，您只能向同源服务器发送 API 调用请求，不过如果第三方 API 支持跨域资源共享(CORS)的话，您也可以调用其他服务器上的 API。

<!--The System.Net.Http.Json namespace provides extension methods for HttpClient that perform automatic serialization and deserialization using System.Text.Json. These extension methods send requests to a Web API URI and process the response accordingly. The common methods include:-->

[System.Net.Http.Json](https://docs.microsoft.com/zh-cn/dotnet/api/system.net.http.json) 命名空间为使用 System.Text.Json 执行自动序列化和反序列化的 HttpClient 提供了扩展方法。这些扩展方法将请求发送到一个 Web API URI 并处理相应的响应。常用的方法有：

<!--GetFromJsonAsync: Sends an HTTP GET request and parses the JSON response body to create an object.-->
<!--PostAsJsonAsync: Sends a POST request to the specified URI containing the value serialized as JSON in the request body.-->
<!--PutAsJsonAsync: Sends an HTTP PUT request, including JSON-encoded content.-->

- **GetFromJsonAsync**：发送 HTTP GET 请求，并将 JSON 响应正文解析成一个对象。
- **PostAsJsonAsync**：将 POST 请求发送到指定的 URI，并在请求正文中载有序列化为 JSON 的 `value`。
- **PutAsJsonAsync**：发送 HTTP PUT 请求，其中包含 JSON 编码的内容。

<!--To understand how to use these methods along with HttpClient, we need to create two projects. The first project will be a Web API project that will expose a Web API for clients. The second project will be Blazor WebAssembly App that will make HTTP requests to a Web API created in the first project.-->

要理解如何将这些方法与 HttpClient 一起使用，我们需要创建两个项目。第一个项目是一个 Web API 项目，它向客户端公开一个 Web API。第二个项目是 Blazor WebAssembly 应用程序，它向第一个项目中创建的 Web API 发送 HTTP 请求。

<!-- Implementing an ASP.NET Core Web API -->

## 实现一个 ASP.NET Core Web API

<!--In this section, we will implement a Web API with Cross-origin resource sharing (CORS) support so that this API can be called by Blazor WebAssembly apps. Create a new Web API project **BlazorClientWebAPI** in Visual Studio 2019. We will create a simple API that will return the list of products so let’s first create a **Models** folder in the project and add the following **Product** class to it.-->

在本节中，我们将实现一个支持跨域资源共享 (CORS) 的 Web API，以便 Blazor WebAssembly 应用程序可以调用此 API。在 Visual Studio 2019 中创建一个新的 Web API 项目 **BlazorClientWebAPI**。我们将创建一个简单的 API 来返回产品列表，所以首先要在项目中创建一个 **Models** 文件夹，并在其中添加如下的 **Product** 类。

<b>Product.cs</b>

```csharp
public class Product
{
    public int Id { get; set; }
    public string Name { get; set; }
    public decimal Price { get; set; }
}
```

<!--Next, create a **Controllers** folder and add the following **ProductsController** in it. The controller is simply returning some fake product data from the **GetProducts** method.-->

接下来，创建一个 **Controllers** 文件夹并在其中添加下面的 **ProductsController**。该控制器简单地从 **GetProducts** 方法返回一些模拟的产品数据。

<b>ProductsController.cs</b>

```csharp
[Route("api/[controller]")]
[ApiController]
public class ProductsController : ControllerBase
{
    [HttpGet]
    public IActionResult GetProducts()
    {
        var products = new List<Product>()
        {
            new Product()
            {
                Id = 1,
                Name = "Wireless Mouse",
                Price = 29.99m
            },
            new Product()
            {
                Id = 2,
                Name = "HP Headphone",
                Price = 79.99m
            },
            new Product()
            {
                Id = 3,
                Name = "Sony Keyboard",
                Price = 119.99m
            }
        };
 
        return Ok(products);
    }
}
```

If you will run your project and try to access the API using the URI **api/products** in the browser, you should be able to see the product data returned in JSON format.

现在如果您运行该项目，并尝试在浏览器中使用 URI **api/products** 访问此 API，您应该能看到以 JSON 格式返回的产品数据。

![Products-API-Response-for-Blazor-WebAssembly-HttpClient](https://www.ezzylearning.net/wp-content/uploads/Products-API-Response-for-Blazor-WebAssembly-HttpClient.jpg)

## 在 ASP.NET Core Web API 中启用跨域资源共享（CORS）

By default, browser security doesn’t allow a web page to make requests to a different domain other than the one from where the web page is served. This restriction is called the same-origin policy. If we want Blazor WebAssembly Apps or other client apps to consume the above Web API then we have to enable cross-origin resource sharing (CORS). Open the **Startup.cs** file and call the **AddCors** method in the **ConfigureServices** method.

默认情况下，浏览器安全性不允许网页向除提供网页的域之外的其他域发送请求。这种限制称为同源策略。如果我们希望 Blazor WebAssembly 应用程序或其他客户端应用程序使用上述 Web API，那么我们必须启用跨域资源共享 (CORS)。打开 **Startup.cs** 文件，并在 **ConfigureServices** 方法中调用 **AddCors** 方法。

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddCors(policy =>
    {
        policy.AddPolicy("CorsPolicy", opt => opt
            .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod());
    });
 
    services.AddControllers();
}
```

Also add the following line in the Configure method of Startup.cs file

同时，在 *Startup.cs* 文件的 **Configure** 方法中添加以下代码行。

```csharp
app.UseCors("CorsPolicy");
```

For detailed information on CORS with ASP.NET Core apps, see Enable Cross-Origin Requests (CORS) in ASP.NET Core.

有关使用 ASP.NET Core 应用程序的 CORS 的详细信息，请参阅 [《Enable Cross-Origin Requests (CORS) in ASP.NET Core》](https://docs.microsoft.com/zh-cn/aspnet/core/security/cors)[^CORS]。

[^CORS]: <https://docs.microsoft.com/zh-cn/aspnet/core/security/cors> 

## 实现 Blazor WebAssembly 应用程序

Add a new Blazor WebAssembly App project **BlazorClientWebAPIsDemo** in the same solution in which you created the above Web API project.

在创建上述 Web API 项目的同一解决方案中添加一个新的 Blazor WebAssembly 应用程序项目 **BlazorClientWebAPIsDemo**。

The first thing we need to make sure of is that we have the reference of **System.Net.Http.Json** in the project file. If it’s not available then you can add the reference.

我们需要确保的第一件事是，在项目文件中有 **System.Net.Http.Json** 的引用。如果它不可用，那么您可以添加该引用。

```xml
<Project Sdk="Microsoft.NET.Sdk.BlazorWebAssembly">
   <PropertyGroup>
      <TargetFramework>net5.0</TargetFramework>
   </PropertyGroup>
   <ItemGroup>
      <PackageReference Include="Microsoft.AspNetCore.Components.WebAssembly" Version="5.0.1" />
      <PackageReference Include="Microsoft.AspNetCore.Components.WebAssembly.DevServer" Version="5.0.1" PrivateAssets="all" />
      <PackageReference Include="System.Net.Http.Json" Version="5.0.0" />
   </ItemGroup>
</Project>
```

Next, we need to configure the HttpClient service in **Program.cs** file. Make sure to provide the base address of the Web APIs you want to call from Blazor WebAssembly Apps

接下来，我们需要在 **Program.cs** 文件中配置 HttpClient 服务。确保提供了要从 Blazor WebAssembly 应用程序调用的 Web API 的基地址。

<b>Program.cs</b>

```csharp
public static async Task Main(string[] args)
{
    var builder = WebAssemblyHostBuilder.CreateDefault(args);
    builder.RootComponents.Add<App>("#app");
 
    builder.Services.AddScoped(sp => new HttpClient
    {
        BaseAddress = new Uri("http://localhost:5000/api/")
    }); 
 
    await builder.Build().RunAsync();
}
```

To consume the products API, let’s create a **Products.razor** component in the **Pages** folder. The view is very straightforward as it is simply iterating the list of products and displaying them using a simple HTML table.

为了使用产品 API，我们在 **Pages** 文件夹中创建一个 **Products.razor** 组件。该视图非常简单，因为它只是迭代产品列表并使用简单的 HTML 表示显示它们。

<b>Products.razor</b>

```html
@page "/products"
 
<h1>Products</h1>
 
@if (products == null)
{
    <p><em>Loading...</em></p>
}
else
{
    <table class="table">
        <thead>
            <tr>
                <th>Id</th>
                <th>Name</th>
                <th>Price</th>
            </tr>
        </thead>
        <tbody>
            @foreach (var forecast in products)
            {
                <tr>
                    <td>@forecast.Id</td>
                    <td>@forecast.Name</td>
                    <td>@forecast.Price</td>
                </tr>
            }
        </tbody>
    </table>
}
```

Create a **Products.razor.cs** code-behind file and inject the configured **HttpClient** instance in the class as a private member. Finally, use the **GetFromJsonAsync** method to call the products API.

创建一个代码隐藏文件 **Products.razor.cs**，并将配置的 **HttpClient** 实例作为私有成员注入到该类中。最后，使用 **GetFromJsonAsync** 方法调用产品 API。

<b>Products.razor.cs</b>

```csharp
public partial class Products
{
    private List<Product> products;
 
    [Inject]
    private HttpClient Http { get; set; }
 
    protected override async Task OnInitializedAsync()
    {
        products = await Http.GetFromJsonAsync<List<Product>>("products");
    } 
}
```

You also need to create a local copy of the **Product** class in the Blazor WebAssembly project to deserialized the results of the products API into a list of product objects.

您还需要在 Blazor WebAssembly 项目中创建一个 **Product** 类的本地副本，以将产品 API 的结果反序列化为产品对象列表。

```csharp
public class Product
{
    public int Id { get; set; }
    public string Name { get; set; }
    public decimal Price { get; set; }
}
```

Run the project and you will see the page with products loaded from a backend Web API.

运行该项目，您将看到含有从后端 Web API 加载了产品的页面。

![Makking-HTTP-Requests-to-Web-API-from-Blazor-WebAssembly-App](https://www.ezzylearning.net/wp-content/uploads/Makking-HTTP-Requests-to-Web-API-from-Blazor-WebAssembly-App.jpg)
