---
layout: post
title:  "编写第一个 .NET 微服务"
date:   2020-08-31 00:10:00 +0800
categories: dotnet csharp
published: true
---

## 介绍

本文的目的是：通过创建一个返回列表的简单服务，并在 Docker 容器中运行该服务，让您熟悉使用 .NET 创建微服务的构建过程。

## 安装 .NET SDK

要开始构建 .NET 应用程序，首先下载并安装 .NET Core SDK（软件开发工具包）。

根据操作系统的类型下载并安装对应版本的 .NET Core SDK v3.1：
[.NET SDK (64-位)](https://download.visualstudio.microsoft.com/download/pr/547f9f81-599a-4b58-9322-d1d158385df6/ebe3e02fd54c29487ac32409cb20d352/dotnet-sdk-3.1.401-win-x64.exe) 
 或 
[.NET SDK (32-位)](https://download.visualstudio.microsoft.com/download/pr/719cf74a-8a57-405d-a048-be8d94bbef37/1914f811ddbf10f7a2a45181b9cac714/dotnet-sdk-3.1.401-win-x86.exe)

> Download .NET SDKs for Visual Studio: <br/>
> [https://dotnet.microsoft.com/download/visual-studio-sdks](https://dotnet.microsoft.com/download/visual-studio-sdks)

### 检查安装是否正确

.NET SDK 安装完成后，打开一个命令提示符窗口并运行以下命令:

```bash
dotnet
```

如果命令运行时，打印出的信息是介绍如何使用 `dotnet`，说明安装正确。

## 创建您的服务

### 创建一个应用

在命令提示符窗口运行以下命令：

```bash
dotnet new webapi -o myMicroservice --no-https

cd myMicroservice
```

第一行中 `dotnet` 命令创建了一个 `webapi`（一个 REST API 终端）类型的“新”应用。

- 参数 `-o` 创建一个名为 `myMicroservice` 的目录，用于存储应用程序。
- 标记 `--no-https` 创建一个不需要 HTTPS 证书就可以运行的应用程序，以便简化部署。

使用 `cd myMicroservice` 命令进入新建应用程序的目录。

### 生成的代码

可以看到，在 `myMicroservice` 目录中创建了几个文件，为您提供了一个可以运行的简单服务。

- `myMicroservice.csproj` 定义了项目引用的库等。
- `Startup.cs` 包含应用程序启动时加载的所有设置和配置。
- `Controllers/WeatherForecastController.cs` 有一个简单 API 的代码，可以返回未来 5 天的天气预报（*模拟数据*）。

`Controllers/WeatherForecastController.cs` 文件中代码：

```csharp
[ApiController]
[Route("[controller]")]
public class WeatherForecastController : ControllerBase
{
    private static readonly string[] Summaries = new[]
    {
        "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
    };

    private readonly ILogger<WeatherForecastController> _logger;

    public WeatherForecastController(ILogger<WeatherForecastController> logger)
    {
        _logger = logger;
    }

    [HttpGet]
    public IEnumerable<WeatherForecast> Get()
    {
        var rng = new Random();
        return Enumerable.Range(1, 5).Select(index => new WeatherForecast
        {
            Date = DateTime.Now.AddDays(index),
            TemperatureC = rng.Next(-20, 55),
            Summary = Summaries[rng.Next(Summaries.Length)]
        })
        .ToArray();
    }
}
```

## 运行您的服务

确保命令提示符定位在 `myMicroservice` 目录中，运行以下命令：

```bash
dotnet run
```

命令完成后，在浏览器中打开『http://localhost:5000/WeatherForecast』

![The API endpoint returns JSON data containing weather forecast information](/assets/images/dotnet/screenshot-microservice-tutorial-run.png)

恭喜，您已经运行了一个简单的服务。

## 安装 Docker

Docker 是一个平台，它可以让你将一个应用程序及其配置和依赖项组合成一个叫作容器的单独的、可独立部署的单元。

### 下载并安装 Docker Desktop

请参阅我之前翻译的 [Docker 快速入门（一）](/backend/docker/2020/06/19/quickstart-1.html)

### 检查 Docker 是否可用

安装完成后，打开一个**新的**命令提示符窗口并运行以下命令：

```bash
docker --version
```

若命令运行后，显示一个版本信息，那么表示 Docker 安装成功了。

## 添加 Docker 元数据

要运行 Docker 镜像，需要一个 `Dockerfile` —— 一个文本文件，其中包含如何将应用构建为 Docker 镜像的指令。Docker 镜像包含将您的应用作为 Docker 容器运行所需的所有内容。


### 添加 `Dockerfile` 文件

在 `myMicroservice` 目录中，使用文本编辑器(推荐使用 Visual Studio Code)创建一个名为 `Dockerfile` 的文件，包含以下内容：

```dockerfile
FROM mcr.microsoft.com/dotnet/core/sdk:3.1 AS build
WORKDIR /src
COPY myMicroservice.csproj .
RUN dotnet restore
COPY . .
RUN dotnet publish -c release -o /app

FROM mcr.microsoft.com/dotnet/core/aspnet:3.1
WORKDIR /app
COPY --from=build /app .
ENTRYPOINT ["dotnet", "myMicroservice.dll"]
```

> 注意：确保将文件命名为 Dockerfile(没有扩展名)，而不是 Dockerfile.txt 或其他名称。

### 添加 `.dockerignore` 文件(可选的)

`.dockerignore` 文件可以减少 `docker build` 过程中使用的文件集，文件越少则构建越快。

在文本编辑器中创建一个名为 `.dockerignore` 的文件(这个文件类似于 `.gitignore` 文件，如果你熟悉的话)，包含以下内容:

```dockerfile
Dockerfile
[b|B]in
[O|o]bj
```

## 创建 Docker 镜像

运行以下命令：

```bash
docker build -t mymicroservice .
```

`docker build` 命令使用 `Dockerfile` 构建 Docker 镜像。

- 参数 `-t mymicroservice` 告诉命令标记(或命名)镜像为 `mymicroservice`。
- 最后一个参数告诉命令使用哪个目录来查找 `Dockerfile` (`.` 指定当前目录)。

> 译者注：<br/>
> 如果是第一次在本机上构建基于 `mcr.microsoft.com/dotnet/core/sdk:3.1` 和 `mcr.microsoft.com/dotnet/core/aspnet:3.1` 的镜像，构建 `mymicroservice` 镜像将会是一个漫长的过程，因为从官方 Docker 注册表拉取镜像实在是太慢了！耐心等待，终会成功的，我已经实践过了。

等待镜像构建完成，可以运行下面的命令来查看计算机上可用的所有镜像的列表，包括您刚刚创建的 `mymicroservice` 镜像。

```bash
docker images
```

## 运行 Docker 镜像

您可以使用下面的命令在容器中运行您的应用：

```bash
docker run -it --rm -p 3000:80 --name mymicroservicecontainer mymicroservice
```

可选地，您可以在单独的**新的**命令提示符窗口中输入下面的命令查看正在运行的容器：

```bash
docker ps
```

在运行 `docker run` 命令后，您可以在浏览器中输入 URL『http://localhost:3000/WeatherForecast』来访问正在容器中运行的应用程序。

![The API endpoint returns JSON data containing weather forecast information](/assets/images/dotnet/screenshot-microservice-tutorial-run-docker.png)

恭喜！您已经成功地创建了一个可以使用 Docker 容器部署和缩放的小型、独立的服务。

以上这些就是微服务的基本构建块。




<br/>

> 作者 ： Microsoft 官网 <br/>
> 译者 ： 技术译民 <br/>
> 出品 ： [技术译站](https://ittranslator.cn/) <br/>
> 链接 ： [英文原文](https://dotnet.microsoft.com/learn/aspnet/microservice-tutorial/intro)