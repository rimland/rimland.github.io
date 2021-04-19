---
layout: post
title:  "创建支持依赖注入、Serilog 日志和 AppSettings 的 .NET 5 控制台应用"
date:   2021-04-19 00:10:10 +0800
categories: dotnet csharp
published: true
---

> 翻译自 Mohamad Lawand 2021年3月24日的文章 [《.NET 5 Console App with Dependency Injection, Serilog Logging, and AppSettings》](https://dev.to/moe23/net-5-console-app-with-dependency-injection-serilog-logging-and-appsettings-3d4n) [^1]

[^1]: <https://dev.to/moe23/net-5-console-app-with-dependency-injection-serilog-logging-and-appsettings-3d4n> .NET 5 Console App with Dependency Injection, Serilog Logging, and AppSettings

<!-- In this article we will be building a .NET 5 console app which support dependency injection, logging and app settings configuration. -->

在本文中，我们将构建一个 .NET 5 控制台应用程序，该应用程序支持依赖注入、日志记录和 *appsettings* 配置。

你也可以在 YouTube 上[观看完整的视频](https://youtu.be/4mEN1XpLN_s)[^video]，还可以在 GitHub 上[下载源代码](hhttps://github.com/mohamadlawand087/v22-DotnetConsole)[^source]。

[^video]: <https://youtu.be/4mEN1XpLN_s>

[^source]: <https://github.com/mohamadlawand087/v22-DotnetConsole>

![.NET 5 Console App with Dependency Injection, Serilog Logging, and AppSettings](https://ittranslator.cn/assets/images/202104/dotnet-console.png)

我们要用到的开发工具有：

- Visual Studio Code (<https://code.visualstudio.com/>)
- .NET Core SDK (<https://dotnet.microsoft.com/download>)

我们要实现的功能包含：

- 依赖注入
- Serilog Logger
- AppSettings

<!-- We are going to build a sample application which will mimic connecting to a database through dependency injection as well as outputting logs. -->

我们将构建一个示例应用程序，该应用程序将模拟通过依赖注入连接数据库，并输出日志。

<!-- We will start by creating our application, inside our terminal -->

首先，我们在终端中创建应用程序：

```bash
dotnet new console -n "SampleApp"
```

<!-- Once the application has been create, open the application in Visual Studio Code and let us build and the application to make sure everything is working. -->

创建好应用程序后，在 Visual Studio Code 中打开应用程序，然后构建并运行一下，以确保一切正常：

```bash
dotnet build
dotnet run
```

接下来是安装我们所需的程序包：

```bash
dotnet add package Microsoft.Extensions.Hosting
dotnet add package Serilog.Extensions.Hosting
dotnet add package Serilog.Settings.Configuration 
dotnet add package Serilog.Sinks.Console
```

<!-- The next step will be adding our appsettings.json, to do that in root directory of our application right-click select New File. Name the file appsettings.json

Inside the appsettings we are going to add all of the configuration that we need to setup serilog as well as the connectionString to mimic a database connection -->

下一步是添加 *appsettings.json*，在应用程序的根目录中右键单击并选择 *New File*，将文件名称设置为 *appsettings.json*。

我们将在 *appsettings* 中添加所需的配置项——Serilog，以及用于模拟数据库连接的 ConnectionStrings：

```json
// appsettings.json

{
    "Serilog": {
        "MinimalLevel": {
            "Default": "Information",
            "Override": {
                "System": "Warning",
                "Microsoft": "Information"
            }
        }
    },
    "ConnectionStrings": {
        "DefaultConnection": "DataSource:app.db;Cache=Shared"
    }
}
```

<!-- We will start by implementing the logging mechanism. Inside our Program.cs Add the following code, this code responsibility is reading the appsetting.json and making it available to our application. -->

我们从实现日志记录的机制开始讲起。

在 *Program.cs* 中添加以下代码，该段代码的职责是读取 *appsetting.json* 并将其提供给我们的应用程序：

```csharp
// 检查应用程序运行的当前目录，找到并加载 'appsetting.json'，
// 然后添加环境变量，这些环境变量会覆盖 appsettings.json 中的配置 
static void BuildConfig(IConfigurationBuilder builder)
{
    builder.SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
            .AddEnvironmentVariables();
}
```

<!-- Now we need to create another method which will be out startup method for our application, it will responsible to put everything together. We will define Serilog as well our dependency injection mechanism in .NET Core. -->

然后，我们需要创建另一个方法，该方法是我们应用程序的启动方法，它负责将所有的内容汇集在一起。我们将定义 Serilog 和 .NET Core 中的依赖注入机制。

```csharp
// Program.cs

static IHost AppStartup()
{
    var builder = new ConfigurationBuilder();
    BuildConfig(builder);

    // 定义 Serilog 配置
    Log.Logger = new LoggerConfiguration()  //初始化 Logger 配置
        .ReadFrom.Configuration(builder.Build()) //将 Serilog 连接到我们的配置
        .Enrich.FromLogContext() //从装入的 Serilog 向日志添加更多信息
        .WriteTo.Console() //决定在哪里显示日志
        .CreateLogger(); //初始化 Logger

    Log.Logger.Information("Application Starting");

    // 初始化依赖注入容器
    var host = Host.CreateDefaultBuilder() //初始化 Host 
                .ConfigureServices((context, services) => //向容器添加服务
                {
                    
                })
                .UseSerilog() //添加 Serilog
                .Build(); //构建 Host

    return host;
}
```

<!-- Now let us implement data service which will mimic a database

Let us create a new class called DataService and an interface called IDataService -->

现在，让我们实现数据服务，用它来模拟数据库。

让我们创建一个名为 `DataService` 的新类和一个名为 `IDataService` 的接口：

```csharp
// IDataService.cs

// 接口
public interface IDataService
{
    void Connect();
}

// DataService.cs

// 类
public class DataService : IDataService
{
    private readonly ILogger<DataService> _log;
    private readonly IConfiguration _config;

    public DataService(ILogger<DataService> log, IConfiguration config)
    {
        _log = log;
        _config = config;
    }

    public void Connect()
    {
        // 读取连接字符串
        var connString = _config.GetValue<string>("ConnectionStrings:DefaultConnection");

        _log.LogInformation("Connection String {cs}", connString);
    }
}
```

<!-- Now we need to update our AppStartup method in the Program.cs class to inject the DataService -->

然后我们需要更新 *Program.cs* 类中的 `AppStartup` 方法以注入 `DataService`：

```csharp
// Program.cs

var host = Host.CreateDefaultBuilder() //初始化 Host 
            .ConfigureServices((context, services) => //向容器添加服务
            {
                services.AddTransient<IDataService, DataService>(); //AddTransient 意味着每次请求都会创建一个实例。
            })
            .UseSerilog() //添加 Serilog
            .Build(); //构建 Host
```

最后，让我们在 `Main` 方法中调用他们：

```csharp
// Program.cs

static void Main(string[] args)
{
    var host = AppStartup();

    var dataService = ActivatorUtilities.CreateInstance<DataService>(host.Services);

    dataService.Connect();
}
```

好了，就是这样。

感谢您的阅读。

<br/>

> 作者 ： Mohamad Lawand  
> 译者 ： 技术译民  
> 出品 ： [技术译站](https://ittranslator.cn/)  
> 链接 ： [英文原文](https://dev.to/moe23/net-5-console-app-with-dependency-injection-serilog-logging-and-appsettings-3d4n)
