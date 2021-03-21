---
layout: post
title:  "在 .NET Core 中构建 REST API"
date:   2021-03-15 00:10:09 +0800
categories: dotnet csharp
published: true
---

> 翻译自 Camilo Reyes 2021年2月22日的文章 [《Integrate Create React app with .NET Core 5》](https://www.red-gate.com/simple-talk/dotnet/net-tools/integrate-create-react-app-with-net-core-5/) [^1]  
>  
> Camilo Reyes 演示了如何将 Create React app 与 .NET core 集成，以生成一个移除了几个依赖项的脚手架。

[^1]: <https://www.red-gate.com/simple-talk/dotnet/net-tools/integrate-create-react-app-with-net-core-5/> Integrate Create React app with .NET Core 5

<!-- The Create React app is the community’s preferred way to spin up a brand new React project. This tool generates the basic scaffold to start writing code and abstracts away many challenging dependencies. React tools like webpack and Babel are lumped into a single dependency. React developers can focus on the problem at hand, which lowers the bar necessary to build Single Page Apps. -->

*Create React app* 是社区中创建一个全新 React 项目的首选方式。该工具生成了基础的脚手架，以开始编写代码并抽象出许多具有挑战性的依赖项。webpack 和 Babel 之类的 React 工具被集中到一个单独的依赖项中，使得 React 开发者可以专注于手边的问题，这降低了构建*单页应用*的必要门槛。

<!-- The question remains, React solves the problem on the client-side, but what about the server-side? .NET developers have a long history of working with Razor, server-side configuration, and the ASP.NET user session via a session cookie. In this take, I will show you how to get the best of both worlds with a nice integration between the two. -->

问题依然存在，虽然 React 解决了客户端的问题，但是服务端呢？.NET 开发者在使用 Razor、服务器端配置，并通过 session cookie 处理 ASP.NET 用户会话（session）方面有着悠久的历史。在本文中，我将向您展示如何通过两者之间的良好集成来实现两全其美的效果。

<!-- This article has a hands-on approach that reads better from top to bottom so you can follow along. If you feel comfortable enough with the code, it is available on GitHub for your reading pleasure. -->

本文提供了一种动手实践的方式，因此您可以依照自上而下顺序阅读，效果更佳。如果您更喜欢随着代码学习，可以[从 GitHub 上获取源码](https://github.com/beautifulcoder/integrate-dotnet-core-create-react-app.git)[^GitHub]，使阅读更愉快。

[^GitHub]: <https://github.com/beautifulcoder/integrate-dotnet-core-create-react-app.git> 示例代码

<!-- The general solution involves two major pieces, the front and the back ends. The back end is a typical ASP.NET MVC app anyone can spin up in .NET Core 5. Just make sure that you have .NET Core 5 installed and that your project is targeting .NET Core 5 when you do this to unlock C# 9 features. I will incrementally add more pieces as the integration progresses. The front end will have the React project, with an NPM build that outputs static assets like index.html. I will assume a working knowledge of .NET and React, so I don’t have to delve into basics such as setting up .NET Core or Node on a dev machine. That said, note some of the useful using statements here for later use: -->

一般的解决方案涉及两个主要部分，前端和后端。后端是一个典型的 ASP.NET MVC 应用，任何人都可以在 .NET Core 5 中启动。请确保您已安装 .NET Core 5，并将项目的目标设置为 .NET Core 5，只要执行了此操作便解锁了 C# 9 特性。随着集成的进行，我还将添加更多的部分。前端会有 React 项目，和输出像 *index.html* 之类静态资产的 NPM 工具。我将假定您具有 .NET 和 React 的工作知识，因此我不会深究诸如在开发机上设置 .NET Core 或 Node 的基础。也就是说，请注意下面一些有用的 using 语句，以便后面使用：

```csharp
using Microsoft.AspNetCore.Http;
using System.Net;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using System.Text.RegularExpressions;
```

<!-- Initial Project Setup -->

## 初始化项目安装

<!-- The good news is that Microsoft provides a basic scaffold template that will spin up a new ASP.NET project with React on the front end. This ASP.NET React project has the client app, which outputs static assets that can be hosted anywhere, and the ASP.NET back end that gets called via API endpoints to get JSON data. The one advantage here is that the entire solution can be deployed at the same time as one monolith without splitting both ends into separate deployment pipelines. -->

好消息是，微软提供了一个基础的脚手架模板，用于启动新的带有 React 前端的 ASP.NET 项目。该 ASP.NET React 项目具有一个客户端应用，它输出可以托管在任何地方的静态资产; 以及一个 ASP.NET 后端应用，它可以通过调用 API Endpoints 获取 JSOM 数据。这里的一个优点是，整个解决方案可以作为一个整体同时部署，而无需将前后两端拆分成单独的部署管道。

<!-- To get the basic scaffold in place: -->

要安装基础的脚手架，请执行以下操作：

```bash
mkdir integrate-dotnet-core-create-react-app
cd integrate-dotnet-core-create-react-app
dotnet new react --no-https
dotnet new sln
dotnet sln add integrate-dotnet-core-create-react-app.csproj
```

<!-- With this in place, feel free to open the solution file in Visual Studio or VS Code. You can fire up the project with dotnet run to see what the scaffold does for you. Note the command dotnet new react; this is the template I’m using for this React project. -->

有了这些，就可以在 Visual Studio 或 VS Code 中打开解决方案文件。您可以运行 `dotnet run` 来启动项目，看看该脚手架都为您做了些什么。请注意命令 `dotnet new react`，这是我用于该 React 项目的模板。

<!-- Here is what the initial template looks like: -->

下面是初始模板的样子：

![initial react template](/assets/images/202103/initial-react-template.png)

<!-- If you run into any issues with React, simply change directory into ClientApp and run npm install to get Create React App up and running. The entire app renders on the client without server-side rendering. It has a react-router with three different pages: a counter, one that fetches weather data, and a home page. If you look at the controllers, it has a WeatherForecastController with an API endpoint to get weather data. -->

如果您在使用 React 时遇到任何问题，只需将目录更改为 `ClientApp` 并运行 `npm install`，即可启动并运行 Create React App。整个应用程序在客户端渲染，而不需要服务器渲染。它有一个具有三个不同页面的 `react-router`：一个计数器、一个获取天气数据的页面和一个主页。如果您看一下控制器，会发现 `WeatherForecastController` 有一个 API Endpoint 来获取天气数据。

<!-- This scaffold already includes a Create React App project. To prove this, open the package.json file in the ClientApp folder to inspect it. -->

该脚手架已经包含了一个 Create React App 项目。为了验证这一点，请打开 *ClientApp* 文件夹中的 *package.json* 文件进行检查。

<!-- This is what gives it away: -->

这就是它的原因：

```json
{
  "scripts": {
      "start": "rimraf ./build && react-scripts start",
      "build": "react-scripts build",
    }
}
```

<!-- Look for react-scripts; this is the single dependency that encapsulates all other React dependencies like webpack . To upgrade React and its dependencies in the future, all you need to do is upgrade this one dependency. This is the React App’s real power because it abstracts away an otherwise potentially hazardous upgrade to stay on the latest bits. -->

寻找一下 *react-scripts*，这是像 webpack 一样封装所有其他 React 依赖项的单一依赖项。若要在将来升级 React 和它的依赖项，您只需升级这一依赖项。因为它抽象化可能有危险的升级以保持最新状态，所以这才是 React App 的真正魔力。

The overall folder structure follows a conventional Create React App project in ClientApp with an ASP.NET project wrapped around it.

*ClientApp* 中的整个文件夹结构遵循常规的 Create React App 项目，在其周围包裹着 ASP.NET 项目。

<!-- The folder structure looks like this: -->

文件夹结构如下所示：

![dotnet react app folder structure](/assets/images/202103/dotnet-react-folder-structure.png)

<!-- This React app comes with many niceties but lacks some important ASP.NET features: -->

<!-- there is no server-side rendering via Razor, making any other MVC page work like a separate app
ASP.NET server configuration data is hard to access from the React client
it does not integrate with an ASP.NET user session via a session cookie -->

这个 React 应用程序有很多优点，但是缺少一些重要的 ASP.NET 功能：

- 没有通过 Razor 进行的服务端渲染，使任何其他 MVC 页面像一个单独的应用程序一样工作
- 很难从 React 客户端访问 ASP.NET 服务器配置数据
- 它不会集成通过 session cookie 实现的 ASP.NET 用户会话


<!-- I will tackle each one of these concerns as I progress through the integration. What’s nice is these desirable features are attainable with the Create React App and ASP.NET. -->

随着集成的推进，我将解决这些问题中的每一个。好在这些理想的功能可以使用 Create React App 和 ASP.NET 实现。

<!-- To keep track of integration changes, I will now use Git to commit the initial scaffold. Assuming Git is installed, do a git init, git add, and git commit to commit this initial project. Looking at the commit history is an excellent way to track what changes are necessary to do the integration. -->

为了跟踪集成更改，我将使用 Git 提交初始脚手架。假设 Git 已安装，请执行 `git init`、`git add` 和 `git commit` 来提交这个初始项目。查看提交历史是跟踪集成所需更改的一种很好的方法。

<!-- Now, create the following folders and files that are useful for this integration. I recommend using Visual Studio with a right-click create Controller, Class, or View: -->

现在，创建以下对此集成很有用的文件夹和文件。我建议使用 Visual Studio 右键单击创建控制器 、类或 View：

- **/Controllers/HomeController.cs**：服务端主页，它将覆盖 Create React App 的 **index.html** 入口页面
- **/Views/Home/Index.cshtml**：Razor 视图，它渲染服务端组件和来自 React 项目的解析过的 **index.html**
- **/CreateReactAppViewModel.cs**：主要的集成视图模型，它将抓取 **index.html** 静态资产并将其解析出来以供 MVC 使用

<!-- Once these folders and files are in place, kill the current running app, and spin up the app in watch mode via dotnet watch run. This command keeps track of changes both on the front and back ends and even refreshes the page when it needs to. -->

有了这些文件夹和文件后，请终止当前正在运行的应用程序，并通过 `dotnet watch run` 以监视模式启动该应用程序。此命令跟踪前端和后端的更改，甚至在需要时刷新页面。

<!-- The rest of the necessary changes will go in existing files that were put in place by the scaffold. This is great because it minimizes code tweaks necessary to flesh out this integration. -->

其余的必要更改将放入脚手架现有的文件中。这样很好，因为可以最大限度地减少必要的代码调整来充实这个集成。

<!-- Time to roll up your sleeves, take a deep breath, and tackle the main part of this integration. -->

是时候擼起袖子，做个深呼吸，处理这个集成的主要部分了。

## CreateReactAppViewModel 集成

I will begin by creating a view model that does most of the integration. Crack open CreateReactAppViewModel and put this in place:

我将从创建一个执行大部分集成的视图模型开始。打开 `CreateReactAppViewModel` 并放入以下代码：

```csharp
public class CreateReactAppViewModel
{
    private static readonly Regex _parser = new(
        @"<head>(?<HeadContent>.*)</head>\s*<body>(?<BodyContent>.*)</body>",
        RegexOptions.IgnoreCase | RegexOptions.Singleline);

    public string HeadContent { get; set; }
    public string BodyContent { get; set; }

    public CreateReactAppViewModel(HttpContext context)
    {
        var request = WebRequest.Create(
            context.Request.Scheme + "://" + context.Request.Host +
            context.Request.PathBase + "/index.html");

        var response = request.GetResponse();
        var stream = response.GetResponseStream();
        var reader = new StreamReader(
            stream ?? throw new InvalidOperationException(
            "The create-react-app build output could not be found in " +
            "/ClientApp/build. You probably need to run npm run build. " +
            "For local development, consider npm start."));

        var htmlFileContent = reader.ReadToEnd();
        var matches = _parser.Matches(htmlFileContent);

        if (matches.Count != 1)
        {
            throw new InvalidOperationException(
                "The create-react-app build output does not appear " +
                "to be a valid html file.");
        }

        var match = matches[0];

        HeadContent = match.Groups["HeadContent"].Value;
        BodyContent = match.Groups["BodyContent"].Value;
    }
}
```

<!-- This code may seem scary at first but only does two things: gets the output index.html file from the dev server and parses out the head and body tags. This allows the consuming app in ASP.NET to access the HTML that links to the static assets that come from Create React App. The assets will be the static files that contain the code bundles with JavaScript and CSS in it. For example, js\main.3549aedc.chunk.js for JavaScript or css\2.ed890e5e.chunk.css for CSS. This is how webpack takes in the React code that is written and presents it to the browser. -->

这段代码乍一看可能有点吓人，但它只做了两件事：从开发服务器获取输出的 **index.html** 文件，并解析到 `head` 和 `body` 标签。这允许 ASP.NET 中的使用方应用程序访问 HTML，该 HTML 链接到来自 Create React App 的静态资产。这些资产将是静态文件，其中包含带有 JavaScript 和 CSS 的代码包。例如，JavaScript 的 *js\main.3549aedc.chunk.js* 或 CSS 的 *css\2.ed890e5e.chunk.css*。这其实就是 webpack 接收所编写的 React 代码并将其渲染到浏览器的方式。

<!-- I opted to fire a `WebRequest` to the dev server directly because Create React App does not materialize any actual files accessible to ASP.NET while in developing mode. This is sufficient for local development because it works well with the webpack dev server. Any changes on the client-side will automatically update the browser. Any back-end changes while in watch mode will also refresh the browser. So, you get the best of both worlds here for optimum productivity. -->

我选择直接向开发服务器发起一个 `WebRequest`，是因为在开发模式下，Create React App 不会生成 ASP.NET 可访问的任何实际文件。这对于本地开发来说足够了，因为它可以与 webpack 开发服务器配合得很好。客户端上的任何更改都将自动更新浏览器。在监视模式下进行的任何后端更改也会刷新浏览器。因此，您可以在两全其美的环境中获得最佳的生产力。

<!-- In prod, this will create static assets via npm run build. I recommend doing file IO and reading the index file off its actual location in ClientApp/build. Also, while in prod mode, it is a good idea to cache the contents of this file after the static assets have been deployed to the hosting server. -->

在生产环境中，将会通过 `npm run build` 创建静态资产。我建议执行文件 IO，并从 *ClientApp/build* 中的实际位置读取 index 文件。另外，在生产模式下，最好在静态资产部署到托管服务器之后缓存该文件的内容。

<!-- To give you a better idea, this is what a built index.html file looks like: -->

为了让您有一个更好的概念，下面是一个 build 后的 **index.html** 文件的样子：

![built index.html looks like](/assets/images/202103/built-index-html.png)

<!-- I’ve highlighted the head and body tags the consuming ASP.NET app needs to parse. Once it has this raw HTML, the rest is somewhat easy peasy. -->

我已经高亮显示了消费 ASP.NET 应用需要解析的 `head` 和 `body` 标签。有了这些原始的 HTML，剩下的就简单多了。

<!-- 我突出了头部和身体的标签ASP.NET应用程序需要解析。一旦有了这个原始的HTML，剩下的就有点简单了。

我已经强调了消费型ASP.NET应用程序需要解析的head和body标签。 一旦有了这个原始的HTML，剩下的就容易了。 -->

<!-- With the view model in place, time to tackle the home controller that will override the index.html file from React. -->

视图模型就绪后，该花点时间处理 home 控制器了，它将覆盖来自 React 的 *index.html*。


Open the HomeController and add this:

打开 `HomeController` 并添加下面的代码：

```csharp
public class HomeController : Controller
{
    public IActionResult Index()
    {
        var vm = new CreateReactAppViewModel(HttpContext);

        return View(vm);
    }
}
```

<!-- In ASP.NET, this controller will be the default route that overrides Create React App with server-side rendering support. This is what unlocks the integration, so you get the best of both worlds. -->

在 ASP.NET 中，该控制器是默认路由，它会在服务端渲染支持下覆盖 Create React App。这就是开启集成的方法，因此您可以两全其美。

<!-- Then, put this Razor code in Home/Index.cshtml: -->

然后把下面的 Razor 代码放入 `Home/Index.cshtml` 中：

```html
@model integrate_dotnet_core_create_react_app.CreateReactAppViewModel
 
<!DOCTYPE html>
<html lang="en">
<head>
  @Html.Raw(Model.HeadContent)
</head>
<body>
  @Html.Raw(Model.BodyContent)
 
  <div class="container ">
    <h2>Server-side rendering</h2>
  </div>
</body>
</html>
```

<!-- The React app uses react-router to define two client-side routes. If the page gets refreshed while the browser is on a route other than home, it will revert to the static index.html. -->

React 应用使用 `react-router` 来定义客户端的路由。如果在浏览器处于非 home 路由时刷新页面，它将恢复为静态的 *index.html*。

<!-- To address this inconsistency, define these server-side routes in Startup. Routes are defined inside UseEndpoints: -->

要解决这种不一致性，请在 `Startup` 中定义下面这些服务端路由，路由是在 `UseEndpoints` 中定义的：

```csharp
endpoints.MapControllerRoute(
  "default",
  "{controller=Home}/{action=Index}");
endpoints.MapControllerRoute(
  "counter",
  "/counter",
  new { controller = "Home", action = "Index"});
endpoints.MapControllerRoute(
  "fetch-data",
  "/fetch-data",
  new { controller = "Home", action = "Index"});
```

<!-- With this, take a look at the browser which will now show this server-side “component” via an h3 tag. This may seem silly because it’s just some simple HTML rendered on the page, but the possibilities are endless. The ASP.NET Razor page can have a full app shell with menus, branding, and navigation that can be shared across many React apps. If there are any legacy MVC Razor pages, this shiny new React app will integrate seamlessly. -->

此时，看一下浏览器，现在它将通过 **h2** 显示这个服务端“组件”。这看起来似乎有点愚蠢，因为它只是在页面上呈现的一些简单 HTML，但其潜力是无穷的。ASP.NET Razor 页面可以具有完整的应用程序外壳，其中包含菜单、品牌、和导航，它们可以在多个 React 应用之间共享。如果有任何旧版 MVC Razor 页面，这个闪亮的新 React 应用将无缝集成。

<!-- ## Server-Side App Configuration -->

## 服务器端应用程序配置

<!-- Next, say I want to show server-side configuration on this app from ASP.NET, such as the HTTP protocol, hostname, and the base URL. I chose these mostly to keep it simple, but these config values can come from anywhere. They can be *appsettings.json* settings or even values from a configuration database. -->

接下来，假如我想显示此应用上来自 ASP.NET 的服务端配置，比如 HTTP 协议、主机名和 base URL。我选择这些主要是为了保持简单，不过这些配置值可以来自任何地方。它们可以是 *appsettings.json* 设置，或者甚至可以是来自配置数据库中的值。

<!-- To make server-side settings accessible to the React client, put this in *Index.cshtml*: -->

要使服务端设置可以被 React 客户端访问，请将其放在 *Index.cshtml* 中：

```html
<script>
  window.SERVER_PROTOCOL = '@Context.Request.Protocol';
  window.SERVER_SCHEME = '@Context.Request.Scheme';
  window.SERVER_HOST = '@Context.Request.Host';
  window.SERVER_PATH_BASE = '@Context.Request.PathBase';
</script>
 
<p>
  @Context.Request.Protocol
  @Context.Request.Scheme://@Context.Request.Host@Context.Request.PathBase
</p>
```

<!-- This sets any config values that come from the server in the global `window` browser object. The React app can retrieve these values with little effort. I opted to render these same values in Razor, mostly to show they are the same values that the client app will see. -->

这里在全局 `window` 浏览器对象中设置来自服务器的任意配置值。React 应用可以轻而易举地获取这些值。我选择在 Razor 中渲染这些相同的值，主要是为了演示它们与客户端应用将看到的是相同的值。

<!-- In React, crack open components\NavMenu.js and add this snippet; most of this will go inside the Navbar: -->

在 React 中，打开 *components\NavMenu.js* 并添加下面的代码段; 其中大部分将放在导航栏中：

```js
import { NavbarText } from 'reactstrap';
 
<NavbarText>
  {window.SERVER_PROTOCOL}
   {window.SERVER_SCHEME}://{window.SERVER_HOST}{window.SERVER_PATH_BASE}
</NavbarText>
```

<!-- The client app will now reflect the server configuration that is set via the global window object. There is no need to fire an Ajax request to load this data or somehow make it available to the index.html static asset. -->

这个客户端应用现在将反映通过全局 `window` 对象设置的服务器配置。它不需要触发 Ajax 请求来加载此数据，也不需要以某种方式让 `index.html` 静态资产可以使用它。

<!-- If you’re using Redux, for example, this is even easier because this can be set when the app initializes the store. Initial state values can be passed into the store before anything renders on the client. -->

如果您使用了 Redux，这会变得更加容易，因为可以在应用程序初始化 store 时进行设置。初始化状态值可以在客户端渲染任何内容之前传递到 store 中。

例如：

```js
const preloadedState = {
  config: {
    protocol: window.SERVER_PROTOCOL,
    scheme: window.SERVER_SCHEME,
    host: window.SERVER_HOST,
    pathBase: window.SERVER_PATH_BASE
  }
};
 
const store = createStore(reducers, preloadedState, 
    applyMiddleware(...middleware));
```

<!-- I chose to opt-out of putting in place a Redux store for the sake of brevity, but this is a rough idea of how it can be done via the `window` object. What’s nice with this approach is that the entire app can remain unit-testable without polluting it with browser dependencies like this `window` object. -->

为了简洁起见，我选择不使用 Redux store，但这是如何通过 `window` 对象实现的一个粗略想法。这种方法的好处是，整个应用都可以保持单元可测试的状态，而不会受到诸如 `window` 对象之类的浏览器依赖项的污染。

<!-- ## .NET Core user session integration -->

## .NET Core 用户会话（session）集成




























<br />

> 作者 ： Camilo Reyes  
> 译者 ： 技术译民  
> 出品 ： [技术译站](https://ittranslator.cn/)  
> 链接 ： [英文原文](https://www.red-gate.com/simple-talk/dotnet/net-tools/integrate-create-react-app-with-net-core-5/)
