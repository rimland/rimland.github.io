---
layout: post
title:  "Blazor Server 应用程序中进行 HTTP 请求"
date:   2021-07-19 00:10:10 +0800
categories: dotnet csharp
tags: [DotNet, Blazor]
published: true
---

> 翻译自 Waqas Anwar 2021年5月4日的文章 [《Making HTTP Requests in Blazor Server Apps》](https://www.ezzylearning.net/tutorial/making-http-requests-in-blazor-server-apps) [^1]

[^1]: <https://www.ezzylearning.net/tutorial/making-http-requests-in-blazor-server-apps> Making HTTP Requests in Blazor Server Apps

![Making-HTTP-Requests-in-Blazor-Server-Apps](https://www.ezzylearning.net/wp-content/uploads/Making-HTTP-Requests-in-Blazor-Server-Apps.jpg)

<!-- Blazor server apps use the standard ASP.NET Core application and they execute .NET code on the server. We can access any .NET library or server-side feature in these apps in the same way as we use in ASP.NET Core web applications. One such feature is to use HTTP Client instances to make HTTP requests to third-party Web APIs. In this tutorial, I will show you different ways to create HTTP Client instances. I will also show you how to consume a third-party API to fetch and display data in Blazor Server Apps. -->

Blazor Server 应用使用标准的 ASP.NET Core 应用程序，在服务端执行 .NET 代码。在这些应用程序中，我们可以像在 ASP.NET Core Web 应用程序中那样，使用相同的方式访问任意 .NET 库或服务端功能。这其中的一项功能是，使用 HTTP Client 实例向第三方 Web API 发送 HTTP 请求。在本教程中，我将向您展示创建 HTTP Client 实例的不同方法。另外，我还会向您展示如何在 Blazor Server 应用程序中使用第三方 API 来获取和显示数据。

[下载源码](https://github.com/ezzylearning/BlazorServerWebAPIsDemo)[^download]

[^download]: <https://github.com/ezzylearning/BlazorServerWebAPIsDemo>

## 第三方 Web API 概述

<!-- We will develop a Blazor server app that will allow the user to input a country code and a year on a Blazor page component and then we will call a third party API to fetch the list of public holidays of that particular country in that particular year. The third-party API we will consume is Nager.Date which is a worldwide public holidays API. -->

我们将开发一个 Blazor Server 应用程序，该应用允许用户在 Blazor 页面组件上输入国家代码和年份，然后我们将调用第三方 API 以获取指定国家和年份的公共假期列表。我们使用的第三方 API 是 [Nager.Date](https://date.nager.at/)，它是一个全球公共假期 API。

<p style="text-align:center">
<a href="https://date.nager.at/" target="_blank"><img style="background-color:#fff;" loading="lazy" src="https://www.ezzylearning.net/wp-content/uploads/Nager.Date-World-Wide-Public-Holidays-API.png" alt="Nager.Date-World-Wide-Public-Holidays-API"></a>
</p>

<!-- It is a very simple API and you can easily test this API in Postman by entering the following URL. -->

这是一个非常简单的 API，您可以轻松地在 Postman 中输入以下 URL 测试此 API。

[https://date.nager.at/api/v2/PublicHolidays/2021/CN](https://date.nager.at/api/v2/PublicHolidays/2021/CN)

<!-- The response of this API is the list of public holidays in JSON format as shown below: -->

该 API 的响应是 JSON 格式的公共假期列表，如下所示：

![World-Wide-Public-Holidays-API-in-Postman](https://www.ezzylearning.net/wp-content/uploads/World-Wide-Public-Holidays-API-in-Postman.png)

## Getting Started with Blazor Sever App

<!-- Create a Blazor Server App in Visual Studio 2019 and create a folder named Models. Add the following two model classes in the Models folder to map Holidays API request and response shown above. -->

在 Visual Studio 2019 中创建一个 Blazor Server 应用程序，并新建一个名为 **Models** 的文件夹。在 **Models** 文件夹中添加以下两个模型类，以映射上述 Holidays API 的请求和响应。

<b>HolidayRequestModel.cs</b>

```csharp
public class HolidayRequestModel
{
    public string CountryCode { get; set; }
    public int Year { get; set; }
}
```

<b>HolidayResponseModel.cs</b>

```csharp
public class HolidayResponseModel
{
    public string Name { get; set; }
    public string LocalName { get; set; }
    public DateTime? Date { get; set; }
    public string CountryCode { get; set; }
    public bool Global { get; set; }
}
```

<!-- Next, create a new Razor component HolidaysExplorer.razor in the Pages folder along with its code-behind file HolidaysExplorer.razor.cs. If you want to learn more about Razor components and code-behind files then you can read my post A Beginner’s Guide to Blazor Components. -->

接下来，在 **Pages** 文件夹中创建一个新的 Razor 组件 **HolidaysExplorer.razor** 及其代码隐藏文件 **HolidaysExplorer.razor.cs**。如果您想了解有关 Razor 组件和代码隐藏文件的更多知识，可以阅读我的文章[《Blazor 组件入门指南》](https://ittranslator.cn/dotnet/csharp/2021/07/12/a-beginners-guide-to-blazor-components.html)。

<b>HolidayResponseModel.cs</b>

```csharp
public partial class HolidaysExplorer
{
    private HolidayRequestModel HolidaysModel = new HolidayRequestModel();
    private List<HolidayResponseModel> Holidays = new List<HolidayResponseModel>();
 
    [Inject]
    protected IHolidaysApiService HolidaysApiService { get; set; }
 
    private async Task HandleValidSubmit()
    {
        Holidays = await HolidaysApiService.GetHolidays(HolidaysModel);
    }
}
```

<!-- The **HolidaysModel** field is an instance of the **HolidayRequestModel** class that will help us in creating a simple form to ask the user the Country Code and the Year. The following code snippet shows the Blazor form created using the **HolidaysModel** object. The **HandleValidSubmit** method is configured with the Blazor Form’s **OnValidSubmit** event and it will be called when the user will submit the form. -->

**HolidaysModel** 字段是 **HolidayRequestModel** 类的一个实例，它将帮助我们创建一个简单的表单来询问用户国家代码和年份。下面的代码片段显示了使用 **HolidaysModel** 对象创建的 Blazor 表单，其中 **HandleValidSubmit** 方法是使用 Blazor Form 的 **OnValidSubmit** 事件配置的，用户提交表单时该方法将被调用。

```html
<EditForm Model="@HolidaysModel" OnValidSubmit="@HandleValidSubmit" class="form-inline">
     
   <label class="ml-2">Country Code:</label>
   <InputText id="CountryCode" @bind-Value="HolidaysModel.CountryCode" class="form-control" />
     
   <label class="ml-2">Year:</label>
   <InputNumber id="Year" @bind-Value="HolidaysModel.Year" class="form-control" />
     
   <button class="btn btn-primary ml-2" type="submit">Submit</button>
     
</EditForm>
```

<!-- The **Holidays** list will be used to display the holidays returned from the third-party API. We need to generate a simple bootstrap table by iterating the holidays with a simple `@foreach` loop. -->

**Holidays** 列表用来显示从第三方 API 返回的假期。我们需要使用一个 `@foreach` 循环迭代返回的假期来生成一个简单的 bootstrap 表格。

```html
@if (Holidays.Count > 0)
{
    <table class="table table-bordered table-striped table-sm">
       <thead>
          <tr>
             <th>Date</th>
             <th>Name</th>
             <th>Local Name</th>
             <th>Country Code</th>
             <th>Global</th>
          </tr>
       </thead>
       <tbody>
          @foreach (var item in Holidays)
          {
              <tr>
                 <td>@item.Date.Value.ToShortDateString()</td>
                 <td>@item.Name</td>
                 <td>@item.LocalName</td>
                 <td>@item.CountryCode</td>
                 <td>@item.Global</td>
              </tr>
          }
       </tbody>
    </table>
}
```

<!-- The complete code of HolidaysExplorer.razor view is shown below. -->

**HolidaysExplorer.razor** 视图的完整代码如下：

<b>HolidaysExplorer.razor</b>

```html
@page "/"
<h3>Holidays Explorer</h3>
<br />
 
<EditForm Model="@HolidaysModel" OnValidSubmit="@HandleValidSubmit" class="form-inline">
 
   <label class="ml-2">Country Code:</label>
   <InputText id="CountryCode" @bind-Value="HolidaysModel.CountryCode" class="form-control" />
 
   <label class="ml-2">Year:</label>
   <InputNumber id="Year" @bind-Value="HolidaysModel.Year" class="form-control" />
 
   <button class="btn btn-primary ml-2" type="submit">Submit</button>
 
</EditForm>
 
<br />
@if (Holidays.Count > 0)
{
    <table class="table table-bordered table-striped table-sm">
       <thead>
          <tr>
             <th>Date</th>
             <th>Name</th>
             <th>Local Name</th>
             <th>Country Code</th>
             <th>Global</th>
          </tr>
       </thead>
       <tbody>
          @foreach (var item in Holidays)
          {
              <tr>
                 <td>@item.Date.Value.ToShortDateString()</td>
                 <td>@item.Name</td>
                 <td>@item.LocalName</td>
                 <td>@item.CountryCode</td>
                 <td>@item.Global</td>
              </tr>
          }
       </tbody>
    </table>
}
```

<!-- If you will run the app at this point, you will see a simple HTML form without any holidays. This is because the method **HandleValidSubmit** is empty and we are not calling any API to fetch holiday data yet. -->

此时如果您运行该应用程序，您将看到一个不显示任何假期的简单 HTML 表单。这是因为方法 **HandleValidSubmit** 是空的，我们还未调用任何 API 来获取假期数据。

![Simple-Form-using-Blazor-Form-Component](https://www.ezzylearning.net/wp-content/uploads/Simple-Form-using-Blazor-Form-Component.jpg)

<!-- Creating HttpClient using IHttpClientFactory in Blazor Server Apps -->

## 在 Blazor Server 应用中使用 IHttpClientFactory 创建 HttpClient

<!-- There are different ways to consume third-party APIs in Blazor server apps using HttpClient so let’s start with a basic example in which we will create HttpClient object using IHttpClientFactory. -->

在 Blazor Server 应用程序中使用 HttpClient 请求第三方 API 有多种不同的方式，让我们从一个基础的示例开始，在该示例中我们使用 [`IHttpClientFactory`](https://docs.microsoft.com/zh-cn/dotnet/api/system.net.http.ihttpclientfactory) 创建 [`HttpClient`](https://docs.microsoft.com/zh-cn/dotnet/api/system.net.http.httpclient) 对象。

<!-- Create a **Services** folder in the project and create the following **IHolidaysApiService** interface.  The interface has just one method **GetHolidays** that takes **HolidayRequestModel** as a parameter and returns the list of **HolidayResponseModel** objects. -->

在项目中创建一个 **Services** 文件夹，并创建如下的 **IHolidaysApiService** 接口。该接口只有一个方法 **GetHolidays**，它以 **HolidayRequestModel** 作为参数并返回 **HolidayResponseModel** 对象的列表。

<b>IHolidaysApiService.cs</b>

```csharp
public interface IHolidaysApiService
{
    Task<List<HolidayResponseModel>> GetHolidays(HolidayRequestModel holidaysRequest);
}
```

<!-- Next, create a class **HolidaysApiService** in the **Services** folder and implement the above interface. -->

接下来，在 **Services** 文件夹中创建一个 **HolidaysApiService** 类，实现上面的接口。

<b>HolidaysApiService.cs</b>

```csharp
public class HolidaysApiService : IHolidaysApiService
{
    private readonly IHttpClientFactory _clientFactory;
 
    public HolidaysApiService(IHttpClientFactory clientFactory)
    {
        _clientFactory = clientFactory;
    }
 
    public async Task<List<HolidayResponseModel>> GetHolidays(HolidayRequestModel holidaysRequest)
    {
        var result = new List<HolidayResponseModel>();
 
        var url = string.Format("https://date.nager.at/api/v2/PublicHolidays/{0}/{1}", 
            holidaysRequest.Year, holidaysRequest.CountryCode);
 
        var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Add("Accept", "application/vnd.github.v3+json");
 
        var client = _clientFactory.CreateClient();
 
        var response = await client.SendAsync(request);
 
        if (response.IsSuccessStatusCode)
        {
            var stringResponse = await response.Content.ReadAsStringAsync();
 
            result = JsonSerializer.Deserialize<List<HolidayResponseModel>>(stringResponse,
                new JsonSerializerOptions() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        }
        else
        {
            result = Array.Empty<HolidayResponseModel>().ToList();
        }
 
        return result;
    }
}
```

<!-- In the GetHolidays method above, we first created a URL for a third party API and appended the country code and year parameters in the URL. -->

在上面的 GetHolidays 方法中，我们首先为第三方 API 创建了一个 URL，并将国家代码和年份参数添加到 URL 中。

```csharp
var url = string.Format("https://date.nager.at/api/v2/PublicHolidays/{0}/{1}", holidaysRequest.Year, holidaysRequest.CountryCode);
```

<!-- Next, we created HttpRequestMessage object and configured it to send HTTP GET request to third part API URL. -->

接下来，我们创建了 HttpRequestMessage 对象并配置它以向第三方 API URL 发送 HTTP GET 请求。

```csharp
var request = new HttpRequestMessage(HttpMethod.Get, url);
request.Headers.Add("Accept", "application/vnd.github.v3+json");
```

<!-- An IHttpClientFactory can be requested using dependency injection (DI) and this is why we are injecting it in the constructor of the above class. The following line is using IHttpClientFactory to create an HttpClient instance. -->

可以使用依赖注入 (DI) 请求 IHttpClientFactory，这正是我们将其注入到前面类的构造函数的原因。下面这行代码使用 IHttpClientFactory 创建了一个 HttpClient 实例。

```csharp
var client = _clientFactory.CreateClient();
```

<!-- Once we have the HttpClient object available, we are simply calling its **SendAsync** method to send an HTTP GET request to -->

有了 HttpClient 对象之后，我们简单地调用它的 **SendAsync** 方法来发送一个 HTTP GET 请求。

```csharp
var response = await client.SendAsync(request);
```

<!-- If the API call is successful, we are reading the response as a string using the following line. -->

如果 API 调用成功，我们使用下面这行代码将其响应读取为字符串。

```csharp
var stringResponse = await response.Content.ReadAsStringAsync();
```

<!-- Finally, we are deserializing the response using the **Deserialize** method of **JsonSerializer** class. -->

最后，我们使用 **JsonSerializer** 类的 **Deserialize** 方法反序列化该响应。

```csharp
result = JsonSerializer.Deserialize<List<HolidayResponseModel>>(stringResponse, 
   new JsonSerializerOptions() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
```

<!-- Before we test our app, we need to register HolidaysApiService in the **Startup.cs** file. We also need to register **IHttpClientFactory** using the **AddHttpClient** method. -->

在测试该应用程序之前，我们需要在 **Startup.cs** 文件中注册 HolidaysApiService 服务。我们还需要调用 **AddHttpClient** 方法注册 **IHttpClientFactory**。

<b>Startup.cs</b>

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddRazorPages();
    services.AddServerSideBlazor();
 
    services.AddSingleton<IHolidaysApiService, HolidaysApiService>();
 
    services.AddHttpClient();
}
```

<!-- Run the application and provide any country code and year in the text fields. Clicking the Submit button should invoke our **GetHolidays** method in the background and you should be able to see the list of public holidays as shown below. -->

运行应用程序并在文本框中提供任意国家代码和年份。点击 **Submit** 按钮就会在后台调用我们的 **GetHolidays** 方法，然后您应该能看到如下所示的公共假期列表。

![Making-HTTP-Requests-in-Blazor-Server-Apps-1](https://www.ezzylearning.net/wp-content/uploads/Making-HTTP-Requests-in-Blazor-Server-Apps-1.jpg)

<!-- Creating Named HttpClient objects in Blazor Server Apps -->

## 在 Blazor Server 应用程序中创建*命名 HttpClient* 对象

<!-- The above example is good for scenarios where you are refactoring an existing application and you want to create HttpClient objects in some methods using IHttpClientFactory without affecting the entire application. If you are creating a new application or you want to centralize the way HttpClient objects are created, then you have to use named HTTP clients. -->

上面的示例适用于您正在重构现有的应用程序，希望在不影响整个应用程序的情况下，在某些方法中使用 IHttpClientFactory 创建 HttpClient 对象的场景。如果您要创建一个全新的应用程序，或者您想要将创建 HttpClient 对象的方式集中化，那么您必须使用**命名 HttpClient**。

<!-- Following are the benefits of creating named HTTP clients: -->

下面是创建命名 HTTP 客户端的好处：

<!-- We can give each HttpClient a name and specify all configurations related to HttpClient at the application startup instead of having configurations scattered throughout the application.
We can configure the named HttpClient once and reuse it multiple times for calling APIs of a particular API provider.
We can configure multiple named HttpClient objects with different configurations depending upon the usage of these clients in different areas of the application. -->

1. 我们可以为每个 HttpClient 命名，并在应用程序启动时指定与 HttpClient 相关的所有配置，而不是将配置分散在整个应用程序当中。
2. 我们可以只配置一次命名的 HttpClient，并多次重用它调用一个特定 API 提供者的所有 API。
3. 我们可以根据这些客户端在应用程序不同区域的使用情况，配置多个不同配置的命名 HttpClient 对象。

<!-- We can specify a named client in the **ConfigureServices** method of **Startup.cs** file using the name **AddHttpClient** method we used above. -->

我们可以在 **Startup.cs** 文件的 **ConfigureServices** 方法中，使用上面用过的名为 **AddHttpClient** 方法指定一个命名的 HttpClient。

<b>Startup.cs</b>

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddRazorPages();
    services.AddServerSideBlazor();
 
    services.AddSingleton<IHolidaysApiService, HolidaysApiService>();
 
    services.AddHttpClient("HolidaysApi", c =>
    {
        c.BaseAddress = new Uri("https://date.nager.at/");
        c.DefaultRequestHeaders.Add("Accept", "application/vnd.github.v3+json");
    });
}
```

<!-- We need to specify the name of the client e.g. **HolidaysApi** and we can also configure the **BaseAddress**, **DefaultRequestHeaders**, and other properties as shown above. -->

我们需要指定客户端的名称（例如 **HolidaysApi**），我们还可以配置如上所示的 **BaseAddress**、**DefaultRequestHeaders** 和其他属性。

<!-- Once the named HttpClient is configured, we can now create HttpClient objects throughout the application by using the same **CreateClient** method but this time we need to specify which named client e.g. **HolidaysApi** we want to create. -->

配置了命名 HttpClient 之后，我们可以使用相同的 **CreateClient** 方法在整个应用程序中创建 HttpClient 对象，不过这次我们需要指定想要创建哪个已命名的客户端（例如 **HolidaysApi**）。

<b>HolidaysApiService.cs</b>

```csharp
public class HolidaysApiService : IHolidaysApiService
{
    private readonly IHttpClientFactory _clientFactory;
 
    public HolidaysApiService(IHttpClientFactory clientFactory)
    {
        _clientFactory = clientFactory;
    }
 
    public async Task<List<HolidayResponseModel>> GetHolidays(HolidayRequestModel holidaysRequest)
    {
        var result = new List<HolidayResponseModel>();
 
        var url = string.Format("api/v2/PublicHolidays/{0}/{1}", 
            holidaysRequest.Year, holidaysRequest.CountryCode);
 
        var request = new HttpRequestMessage(HttpMethod.Get, url);
 
        var client = _clientFactory.CreateClient("HolidaysApi");
 
        var response = await client.SendAsync(request);
 
        if (response.IsSuccessStatusCode)
        {
            var stringResponse = await response.Content.ReadAsStringAsync();
 
            result = JsonSerializer.Deserialize<List<HolidayResponseModel>>(stringResponse,
                new JsonSerializerOptions() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        }
        else
        {
            result = Array.Empty<HolidayResponseModel>().ToList();
        }
 
        return result;
    }
}
```

<!-- The name e.g. **HolidaysApi** we mentioned in the **CreateClient** method must match with the name we configured in **Startup.cs** file. Each time a CreateClient method is called, a new instance of HttpClient is created for us. -->

我们在 **CreateClient** 方法中传递的名称（比如 **HolidaysApi**）必须与我们在 **Startup.cs** 文件中配置的名称一致。每次调用 **CreateClient** 方法时，都会为我们创建一个新的 **HttpClient** 实例。

<!-- We also don’t need to specify the API hostname in the Request URL because we already specified the based address in Startup.cs file. -->

另外，我们不需要在请求的 URL 中指定 API 主机名称，因为我们在 *Startup.cs* 文件中已经指定过基地址了。

<!-- Run the application once again and provide the country code and year values and you should be able to see the list of public holidays. -->

再次运行应用程序并提供国家代码和年份值，您应该能看到以下公共假期列表。

![Making-HTTP-Requests-in-Blazor-Server-Apps-1](https://www.ezzylearning.net/wp-content/uploads/Making-HTTP-Requests-in-Blazor-Server-Apps-1.jpg)

Creating Typed HttpClient objects in Blazor Server Apps

## 在 Blazor Server 应用程序中创建类型化 HttpClient 对象

The third option for creating and using HttpClient objects is to use Typed clients. These clients have the following benefits:

创建和使用 HttpClient 对象的第三个选项是使用类型化客户端。这种客户端具有以下好处：

<!-- 1. They provide the same capabilities as named clients without the need to use strings as keys.
2. They provide IntelliSense and compiler help when consuming clients.
3. They provide a single location to configure and interact with a particular HttpClient. For example, we can configure a typed HttpClient specific to a particular endpoint of Facebook API, and that HttpClient can encapsulate all the logic required to use that particular endpoint.
4. They work with Dependency Inject (DI) and can be injected where required. -->

1. 它们提供与命名客户端相同的功能，而无需使用字符串作为键。
2. 它们在使用客户端时提供智能感知和编译器帮助。
3. 它们提供了一个位置来配置特定的 HttpClient 并与之交互。 例如，我们可以配置特定于 Facebook API 指定端点的类型化 HttpClient，并且该 HttpClient 可以封装使用该特定端点所需的所有逻辑。
4. 它们与依赖注入 (DI) 一起使用，并且可以在需要时注入。

To configure a typed HTTPClient, we need to register it in **Startup.cs** file using the same **AddHttpClient** method but this time, we need to pass our service name **HolidaysApiService** as the type.

要配置类型化的 HTTPClient，我们需要在 **Startup.cs** 文件中使用相同的 **AddHttpClient** 方法注册它，但这一次，我们需要传递服务名称 **HolidaysApiService** 作为类型。

<b>Startup.cs</b>

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddRazorPages();
    services.AddServerSideBlazor();
 
    services.AddSingleton<IHolidaysApiService, HolidaysApiService>();
 
    services.AddHttpClient<HolidaysApiService>();
}
```

In the code snippet above, the HTTP client and our service HolidaysApiService both will be registered as transient client and service. This will allow us to pass the HttpClient in the constructor of the service as shown in the following code snippet. Notice, how the HttpClient is exposed as the public property of the service.

在上面的代码片段中，HTTP 客户端和我们的服务 HolidaysApiService 都将注册为临时客户端和服务。这将允许我们在服务的构造函数中传递 HttpClient，如以下代码片段所示。 请注意，HttpClient 如何公开为服务的公共属性。

<b>HolidaysApiService.cs</b>

```csharp
public class HolidaysApiService : IHolidaysApiService
{
    public HttpClient Client { get; }
 
    public HolidaysApiService(HttpClient client)
    {
        client.BaseAddress = new Uri("https://date.nager.at/");
        client.DefaultRequestHeaders.Add("Accept", "application/vnd.github.v3+json");
        Client = client;
    }
 
    public async Task<List<HolidayResponseModel>> GetHolidays(HolidayRequestModel holidaysRequest)
    {
        var result = new List<HolidayResponseModel>();
 
        var url = string.Format("api/v2/PublicHolidays/{0}/{1}",
            holidaysRequest.Year, holidaysRequest.CountryCode);
 
        var response = await Client.GetAsync(url);
 
        if (response.IsSuccessStatusCode)
        {
            var stringResponse = await response.Content.ReadAsStringAsync();
 
            result = JsonSerializer.Deserialize<List<HolidayResponseModel>>(stringResponse,
                new JsonSerializerOptions() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        }
        else
        {
            result = Array.Empty<HolidayResponseModel>().ToList();
        }
 
        return result;
    }
}
```

The configuration for a typed client can be specified during registration in the **ConfigureServices** method of **Startup.cs** file, rather than in the typed client’s constructor.

类型化客户端的配置可以在注册期间在 **Startup.cs** 文件的 **ConfigureServices** 方法中指定，而不是在类型化客户端的构造函数中。

<b>Startup.cs</b>

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddRazorPages();
    services.AddServerSideBlazor(); 
 
    services.AddHttpClient<IHolidaysApiService, HolidaysApiService>(c =>
    {
        c.BaseAddress = new Uri("https://date.nager.at/");
        c.DefaultRequestHeaders.Add("Accept", "application/vnd.github.v3+json");
    });
}
```

If you are using this technique, then you don’t need to register your service separately. You can remove the following line from the ConfigureServices method.

如果您正在使用这种方式，则无需单独注册您的服务。您可以从 ConfigureServices 方法中删除下面的行。

```csharp
services.AddSingleton<IHolidaysApiService, HolidaysApiService>();
```

The HttpClient object can be encapsulated within a typed client rather than exposed as a public property. We can then use this client internally in any method of service.

可以将 HttpClient 对象封装在类型化客户端中，而不是作为公共属性公开。然后，我们可以在服务的任意方法内使用这个客户端。

```csharp
public class HolidaysApiService : IHolidaysApiService
{
    private readonly HttpClient _httpClient;
 
    public HolidaysApiService(HttpClient client)
    {
        _httpClient = client;
    }
 
    public async Task<List<HolidayResponseModel>> GetHolidays(HolidayRequestModel holidaysRequest)
    {
        var result = new List<HolidayResponseModel>();
 
        var url = string.Format("api/v2/PublicHolidays/{0}/{1}",
            holidaysRequest.Year, holidaysRequest.CountryCode);
 
        var response = await _httpClient.GetAsync(url);
 
        if (response.IsSuccessStatusCode)
        {
            var stringResponse = await response.Content.ReadAsStringAsync();
 
            result = JsonSerializer.Deserialize<List<HolidayResponseModel>>(stringResponse,
                new JsonSerializerOptions() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        }
        else
        {
            result = Array.Empty<HolidayResponseModel>().ToList();
        }
 
        return result;
    }
}
```

Run the application once again and provide the country code and year values and you should be able to see the list of public holidays.

再次运行应用程序，并提供国家代码和年份值，您应该能够看到以下公共假期列表。

![Using-HTTP-Client-to-Call-Third-Party-APIs-in-Blazor](https://www.ezzylearning.net/wp-content/uploads/Using-HTTP-Client-to-Call-Third-Party-APIs-in-Blazor.jpg)

## 总结

In this tutorial, I covered different techniques of creating and using HTTP clients in Blazor Server Apps. Most of the techniques mentioned here can also be used in ASP.NET Core applications because Blazor Server Apps are built on top of ASP.NET Core infrastructure. In my next post 《Making HTTP Requests in Blazor WebAssembly Apps》, I will try to cover the creation and usage of HTTP clients in Blazor WebAssembly Apps.

在本文中，我介绍了在 Blazor Server 应用程序中创建和使用 HTTP 客户端的不同技术。这里提到的大部分技术也可以在 ASP.NET Core 应用程序中使用，因为 Blazor Server 应用程序是构建在 ASP.NET Core 基础架构之上的。在我的下篇文章 [《Making HTTP Requests in Blazor WebAssembly Apps》](https://www.ezzylearning.net/tutorial/making-http-requests-in-blazor-webassembly-apps) 中，我将尝试介绍 HTTP 客户端在 Blazor WebAssembly 应用程序中的创建和使用。
