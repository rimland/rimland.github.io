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

Blazor server apps use the standard ASP.NET Core application and they execute .NET code on the server. We can access any .NET library or server-side feature in these apps in the same way as we use in ASP.NET Core web applications. One such feature is to use HTTP Client instances to make HTTP requests to third-party Web APIs. In this tutorial, I will show you different ways to create HTTP Client instances. I will also show you how to consume a third-party API to fetch and display data in Blazor Server Apps.

Blazor Server 应用使用标准的 ASP.NET Core 应用程序，在服务器端执行 .NET 代码。我们可以像在 ASP.NET Core Web 应用程序中那样，使用的相同方式访问这些应用程序中的任何 .NET 库或服务器端功能。这其中的一项功能是，使用 HTTP Client 实例向第三方 Web API 发送 HTTP 请求。在本教程中，我将向您展示创建 HTTP Client 实例的不同方法。另外，我还会向您展示如何在 Blazor Server 应用程序中使用第三方 API 来获取和显示数据。

[下载源码](https://github.com/ezzylearning/BlazorServerWebAPIsDemo)

## 第三方 Web API 概述

We will develop a Blazor server app that will allow the user to input a country code and a year on a Blazor page component and then we will call a third party API to fetch the list of public holidays of that particular country in that particular year. The third-party API we will consume is Nager.Date which is a worldwide public holidays API.

我们将开发一个 Blazor Server 应用程序，该应用允许用户在 Blazor 页面组件上输入国家代码和年份，然后我们将调用第三方 API 以获取指定的国家和年份的公共假期列表。我们将使用的第三方 API 是 [Nager.Date](https://date.nager.at/)，它是一个全球公共假期 API。

<p style="text-align:center">
<a href="https://date.nager.at/" target="_blank"><img style="background-color:#fff;" loading="lazy" src="https://www.ezzylearning.net/wp-content/uploads/Nager.Date-World-Wide-Public-Holidays-API.png" alt="Nager.Date-World-Wide-Public-Holidays-API"></a>
</p>

<!-- It is a very simple API and you can easily test this API in Postman by entering the following URL. -->

这是一个非常简单的 API，您可以轻松地在 Postman 中输入以下 URL 测试此 API。

[https://date.nager.at/api/v2/PublicHolidays/2021/CN](https://date.nager.at/api/v2/PublicHolidays/2021/CN)

The response of this API is the list of public holidays in JSON format as shown below:

该 API 的响应是 JSON 格式的公共假期列表，如下所示：

![World-Wide-Public-Holidays-API-in-Postman](https://www.ezzylearning.net/wp-content/uploads/World-Wide-Public-Holidays-API-in-Postman.png)

## Getting Started with Blazor Sever App

Create a Blazor Server App in Visual Studio 2019 and create a folder named Models. Add the following two model classes in the Models folder to map Holidays API request and response shown above.

在 Visual Studio 2019 中创建一个 Blazor Server 应用程序，新建一个名为 **Models** 的文件夹。在 **Models** 文件夹中添加以下两个模型类以映射上面显示的 Holidays API 请求和响应。

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

Next, create a new Razor component HolidaysExplorer.razor in the Pages folder along with its code-behind file HolidaysExplorer.razor.cs. If you want to learn more about Razor components and code-behind files then you can read my post A Beginner’s Guide to Blazor Components.

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

The **HolidaysModel** field is an instance of the **HolidayRequestModel** class that will help us in creating a simple form to ask the user the Country Code and the Year. The following code snippet shows the Blazor form created using the **HolidaysModel** object. The **HandleValidSubmit** method is configured with the Blazor Form’s **OnValidSubmit** event and it will be called when the user will submit the form.

**HolidaysModel** 字段是 **HolidayRequestModel** 类的一个实例，它将帮助我们创建一个简单的表单来询问用户国家代码和年份。下面的代码片段显示了使用 **HolidaysModel** 对象创建的 Blazor 表单。**HandleValidSubmit** 方法是使用 Blazor Form 的 **OnValidSubmit** 事件配置的，它在用户提交表单时被调用。

```html
<EditForm Model="@HolidaysModel" OnValidSubmit="@HandleValidSubmit" class="form-inline">
     
   <label class="ml-2">Country Code:</label>
   <InputText id="CountryCode" @bind-Value="HolidaysModel.CountryCode" class="form-control" />
     
   <label class="ml-2">Year:</label>
   <InputNumber id="Year" @bind-Value="HolidaysModel.Year" class="form-control" />
     
   <button class="btn btn-primary ml-2" type="submit">Submit</button>
     
</EditForm>
```

The **Holidays** list will be used to display the holidays returned from the third-party API. We need to generate a simple bootstrap table by iterating the holidays with a simple `@foreach` loop.  

**Holidays** 列表用来显示从第三方 API 返回的假期。我们需要通过一个 `@foreach` 循环迭代假期来生成一个简单的 bootstrap 表格。

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

The complete code of HolidaysExplorer.razor view is shown below.

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

If you will run the app at this point, you will see a simple HTML form without any holidays. This is because the method **HandleValidSubmit** is empty and we are not calling any API to fetch holiday data yet.

此时如果您运行该应用程序，您将看到一个不显示任何假期的简单 HTML 表单。这是因为 **HandleValidSubmit** 方法是空的，我们还没有调用任何 API 来获取假期数据。

![Simple-Form-using-Blazor-Form-Component](https://www.ezzylearning.net/wp-content/uploads/Simple-Form-using-Blazor-Form-Component.jpg)

<!-- Creating HttpClient using IHttpClientFactory in Blazor Server Apps -->

## 在 Blazor Server 应用中使用 IHttpClientFactory 创建 HttpClient

There are different ways to consume third-party APIs in Blazor server apps using HttpClient so let’s start with a basic example in which we will create HttpClient object using IHttpClientFactory.

在 Blazor Server 中使用 HttpClient 请求第三方 API 有多种不同的方式，因此让我们从一个基础的示例开始，在该示例中我们使用 [IHttpClientFactory](https://docs.microsoft.com/zh-cn/dotnet/api/system.net.http.ihttpclientfactory) 创建 [HttpClient](https://docs.microsoft.com/zh-cn/dotnet/api/system.net.http.httpclient) 对象。

Create a **Services** folder in the project and create the following **IHolidaysApiService** interface.  The interface has just one method **GetHolidays** that takes **HolidayRequestModel** as a parameter and returns the list of **HolidayResponseModel** objects.

在项目中创建一个 **Services** 文件夹，并创建如下的 **IHolidaysApiService** 接口。该接口只有一个方法 **GetHolidays**，它将 **HolidayRequestModel** 作为参数并返回 **HolidayResponseModel** 对象的列表。

<b>IHolidaysApiService.cs</b>

```csharp
public interface IHolidaysApiService
{
    Task<List<HolidayResponseModel>> GetHolidays(HolidayRequestModel holidaysRequest);
}
```

Next, create a class **HolidaysApiService** in the **Services** folder and implement the above interface.

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

In the GetHolidays method above, we first created a URL for a third party API and appended the country code and year parameters in the URL.
