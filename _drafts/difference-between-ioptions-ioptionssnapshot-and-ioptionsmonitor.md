---
layout: post
title:  "IOptions、IOptionsSnapshot 和 IOptionsMonitor 之间的区别"
date:   2021-08-16 00:10:10 +0800
categories: dotnet csharp
tags: [DotNet]
published: true
---

> 翻译自 Farhad Zamani 2021年3月29日的文章 [《Difference between IOptions, IOptionsSnapshot and IOptionsMonitor》](https://dotnetdocs.ir/Post/42/difference-between-ioptions-ioptionssnapshot-and-ioptionsmonitor) [^1]

[^1]: <https://dotnetdocs.ir/Post/42/difference-between-ioptions-ioptionssnapshot-and-ioptionsmonitor>

本文我们来讨论一下 *IOptions*, *IOptionsSnapshot* 和 *IOptionsMonitor*  之间的区别。

<!-- The IOptions interface works as a Singleton and therefore can be injected into all services with any lifetime (Lifetime). If you change the value of the appsettings.json file after running the program and use this interface to read the data, you will not see your changes, because this service is Singleton and is only validated at the time of running the program. If the program does not run again, it shows the same initial values. -->

接口 *IOptions* 是作为 **Singleton**（单例）工作的，因此可以被注入到任一生命周期（Lifetime）的所有的服务当中。如果您在程序启动之后更改了 *appsettings.json* 文件中的值，并使用这个接口读取数据时，您将不会得到更新的值，因为该服务是 **Singleton**（单例） 的，只在启动程序的时候进行验证。如果程序没有再次运行，将显示相同的初始值。

<!-- The IOptionsSnapshot interface works as Scoped. That is, for each request, it re-reads the data from appsettings.json and provides it to us. This interface cannot be used in Singleton lifetime services. -->

接口 *IOptionsSnapshot* 是作为 **Scoped**（范围内） 工作的，也就是说，对于每个请求，它都会重新从 *appsettings.json* 读取数据并提供给我们。该接口不能在 **Singleton**（单例）生命周期的服务中使用。

<!-- The IOptionsMonitor interface works as a Singleton, but the difference with the IOptions interface is that if a change is made to the appsettings.json file, new changes can be received by the OnChange method. For example, we created a class called ApplicationConfig that has a property called Name, and the value of this property is called appsettings.json. -->

接口 *IOptionsMonitor* 是作为 **Singleton**（单例）工作的，但与接口 *IOptions* 不同的是，如果对 *appsettings.json* 文件进行了更改，可以通过 `OnChange` 方法接收新的更改。例如，我们创建一个名为 *ApplicationConfig* 的类，该类包含一个名为 `Name` 的属性，该属性的值通过 *appsettings.json* 设置。

```csharp
public class ApplicationConfig
{
    public string Name { get; set; }
}
```

*appsettings.json* 文件：

```json
{
  "ApplicationConfig": {
    "Name": "DotNetDocs"
  }
}
```

然后我们在 ConfigureService 方法中的 Configure 方法中添加这个类：

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.Configure<ApplicationConfig>(Configuration.GetSection(nameof(ApplicationConfig)));
   //...
}
```

接下来，我们创建一个控制器来测试接收到的值：

```csharp
[Route("api/[controller]")]
[ApiController]
public class HomeController : Controller
{
    private readonly ApplicationConfig _options;
    private readonly ApplicationConfig _optionsSnapshot;
    public HomeController(IOptions<ApplicationConfig> options, IOptionsSnapshot<ApplicationConfig> optionsSnapshot)
    {
        _options = options.Value;
        _optionsSnapshot = optionsSnapshot.Value;
    }

    [HttpGet("Index")]
    public IActionResult Index()
    {
        var options = _options.Name;
        var snapshot = _optionsSnapshot.Name;

        return Json(new { options = options, snapshot = snapshot });
    }
}
```

现在，如果您在浏览器中输入 `/api/Home/Index`，您将得到以下值：

```json
{"options":"DotNetDocs","snapshot":"DotNetDocs"}
```

<!-- If you change the Name value in the appsetting.json file to dntips and reload the page, you will get the following values: -->

如果您将 *appsetting.json* 文件中的 `Name` 值更改为 **ITTranslator** 并重新加载页面，您将得到以下值：

```json
{"options":"DotNetDocs","snapshot":"ITTranslator"}
```

<!-- The Name value received from the IOptionsSnapshot interface receives the changes, but the IOptions interface does not receive the changes because it is registered as a Singleton. -->

从接口 *IOptionsSnapshot* 接收到的 `Name` 值得到了更新，但从接口 *IOptions* 接收到的 `Name` 值未得到更新，因为它注册为一个 **Singleton**（单例） 服务。

<!-- To test how IOptionsMonitor works, we create a hosting service called HostedService, in the manufacturer of which we change the OnChange method according to our needs: -->

为了测试 *IOptionsMonitor* 是如何工作的，我们创建一个名为 *HostedService* 的宿主服务，根据我们的需要在其构造函数中更改 `OnChange` 方法。

```csharp
public class HostedService : BackgroundService
{
    private ApplicationConfig _optionsMonitor;

    public HostedService(IOptionsMonitor<ApplicationConfig> optionsMonitor)
    {
        _optionsMonitor = optionsMonitor.CurrentValue;
        optionsMonitor.OnChange(config =>
        {
            _optionsMonitor = config;
        });
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            var name = _optionsMonitor.Name;
            await Task.Delay(1000);
        }
    }
}
```

注册宿主服务：

```csharp
public void ConfigureServices(IServiceCollection services)
{
    //...
    services.AddHostedService<HostedService>();
}
```

<!-- Now if you run the program, the host service will also run and read the values from appsettings.json once and put the Name value inside the name variable next time (in ExecuteAsync method). But when a change is made in the appsettings.json file, the OnChange method is called and puts the new values in the config parameter of the OnChange method, and using this method we can get the new changes and change the _optionsMonitor. -->

现在，如果您运行该程序，宿主服务也将运行并从 *appsettings.json* 读取一次值，然后将 `Name` 的值赋值给 `name` 变量（在 `ExecuteAsync` 方法中）。但是当 *appsettings.json* 文件发生更改时，会调用 `OnChange` 方法并将新值放入 `OnChange` 方法的 `config` 参数中，使用这种方法我们便可以获取更新并改变 `_optionsMonitor`。

- If you have a service that is registered as Singleton and reads a set of values from appsettings.json, if the data may change, it is best to use IOptionsMonitor to apply the changes using the OnChange method. The IOptionsMonitor interface is more commonly used in Singleton services such as HostedServices because IOptionsSnapshot cannot be used to refresh data.
- If the changes to the appsettings.json file are not very important and should not be applied immediately, you can use IOptions.
- If the changes to the appsettings.json file are important and need to be changed, you can use IOptionsSnapshot because it re-reads the data from appsettings.json for each request. This interface cannot be used in Singleton services.
