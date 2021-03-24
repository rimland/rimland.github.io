---
layout: post
title:  "在 .NET Core 5 中集成 Create React app"
date:   2021-03-25 00:10:09 +0800
categories: dotnet csharp
published: true
---

> 翻译自 Camilo Reyes 2021年2月22日的文章 [《Integrate Create React app with .NET Core 5》](https://www.red-gate.com/simple-talk/dotnet/net-tools/integrate-create-react-app-with-net-core-5/) [^1]  
>  
> Camilo Reyes 演示了如何将 Create React app 与 .NET Core 集成，以生成一个移除了几个依赖项的脚手架。

[^1]: <https://www.red-gate.com/simple-talk/dotnet/net-tools/integrate-create-react-app-with-net-core-5/> Integrate Create React app with .NET Core 5

<!-- The Create React app is the community’s preferred way to spin up a brand new React project. This tool generates the basic scaffold to start writing code and abstracts away many challenging dependencies. React tools like webpack and Babel are lumped into a single dependency. React developers can focus on the problem at hand, which lowers the bar necessary to build Single Page Apps. -->

*Create React app* 是社区中创建一个全新 React 项目的首选方式。该工具生成了基础的脚手架用于开始编写代码，并抽象出了许多具有挑战性的依赖项。webpack 和 Babel 之类的 React 工具被集中到一个单独的依赖项中，使得 React 开发者可以专注于手头的工作，这降低了构建*单页应用*的必要门槛。

<!-- The question remains, React solves the problem on the client-side, but what about the server-side? .NET developers have a long history of working with Razor, server-side configuration, and the ASP.NET user session via a session cookie. In this take, I will show you how to get the best of both worlds with a nice integration between the two. -->

不过问题依然存在，虽然 React 解决了客户端的问题，但服务端呢？.NET 开发者在使用 Razor、服务器端配置，并通过 session cookie 处理 ASP.NET 用户会话（session）方面有着悠久的历史。在本文中，我将向您展示如何通过两者之间的良好集成来实现两全其美的效果。

<!-- This article has a hands-on approach that reads better from top to bottom so you can follow along. If you feel comfortable enough with the code, it is available on GitHub for your reading pleasure. -->

本文提供了一种动手实践的方式，因此您可以依照自上而下的顺序，获得更佳的阅读效果。如果您更喜欢随着代码学习，可以[从 GitHub 上获取源码](https://github.com/beautifulcoder/integrate-dotnet-core-create-react-app.git)[^GitHub]，使阅读更愉快。

[^GitHub]: <https://github.com/beautifulcoder/integrate-dotnet-core-create-react-app.git> 示例代码

<!-- The general solution involves two major pieces, the front and the back ends. The back end is a typical ASP.NET MVC app anyone can spin up in .NET Core 5. Just make sure that you have .NET Core 5 installed and that your project is targeting .NET Core 5 when you do this to unlock C# 9 features. I will incrementally add more pieces as the integration progresses. The front end will have the React project, with an NPM build that outputs static assets like index.html. I will assume a working knowledge of .NET and React, so I don’t have to delve into basics such as setting up .NET Core or Node on a dev machine. That said, note some of the useful using statements here for later use: -->

一般的解决方案涉及两个主要部分——前端和后端。后端是一个典型的 ASP.NET MVC 应用，任何人都可以在 .NET Core 5 中启动。请确保您已安装 .NET Core 5，并将项目的目标设置为 .NET Core 5，只要执行了此操作也便开启了 C# 9 特性。随着集成的进行，我还将添加更多的部分。前端会有 React 项目和输出像 *index.html* 之类静态资产的 NPM 工具。我将假定您具有 .NET 和 React 的工作知识，因此我不会深究诸如在开发机上设置 .NET Core 或 Node 的基础。也就是说，请注意下面一些有用的 using 语句，以便后面使用：

```csharp
using Microsoft.AspNetCore.Http;
using System.Net;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using System.Text.RegularExpressions;
```

<!-- Initial Project Setup -->

## 初始化项目设置

<!-- The good news is that Microsoft provides a basic scaffold template that will spin up a new ASP.NET project with React on the front end. This ASP.NET React project has the client app, which outputs static assets that can be hosted anywhere, and the ASP.NET back end that gets called via API endpoints to get JSON data. The one advantage here is that the entire solution can be deployed at the same time as one monolith without splitting both ends into separate deployment pipelines. -->

好消息是，微软提供了一个基础的脚手架模板，用于启动新的带有 React 前端的 ASP.NET 项目。该 ASP.NET React 项目具有一个客户端应用，它输出可以托管在任何地方的静态资产；以及一个 ASP.NET 后端应用，它可以通过调用 API Endpoints 获取 JSON 数据。这里的一个优点是，整个解决方案可以作为一个整体同时部署，而无需将前后两端拆分成单独的部署管道。

<!-- To get the basic scaffold in place: -->

要安装基础的脚手架，请执行以下操作：

```bash
mkdir integrate-dotnet-core-create-react-app
cd integrate-dotnet-core-create-react-app
dotnet new react --no-https
dotnet new sln
dotnet sln add integrate-dotnet-core-create-react-app.csproj
```

<!-- With this in place, feel free to open the solution file in Visual Studio or VS Code. You can fire up the project with dotnet run to see what the scaffold does for you. Note the command dotnet new react；this is the template I’m using for this React project. -->

有了这些，就可以在 Visual Studio 或 VS Code 中打开解决方案文件。您可以运行 `dotnet run` 来启动项目，看看该脚手架都为您做了些什么。请注意命令 `dotnet new react`，这是我用于该 React 项目的模板。

<!-- Here is what the initial template looks like: -->

下面是初始模板的样子：

![initial react template](/assets/images/202103/initial-react-template.png)

<!-- If you run into any issues with React, simply change directory into ClientApp and run npm install to get Create React App up and running. The entire app renders on the client without server-side rendering. It has a react-router with three different pages: a counter, one that fetches weather data, and a home page. If you look at the controllers, it has a WeatherForecastController with an API endpoint to get weather data. -->

如果您在使用 React 时遇到任何问题，只需将目录更改为 `ClientApp` 并运行 `npm install`，即可启动并运行 Create React App。整个 React 应用程序在客户端渲染，而不需要服务器渲染。它有一个具有三个不同页面的 `react-router`：一个计数器、一个获取天气数据的页面和一个主页。如果您看一下控制器，会发现 `WeatherForecastController` 有一个 API Endpoint 来获取天气数据。

<!-- This scaffold already includes a Create React App project. To prove this, open the package.json file in the ClientApp folder to inspect it. -->

该脚手架已经包含了一个 Create React App 项目。为了验证这一点，请打开 *ClientApp* 文件夹中的 *package.json* 文件进行检查。

<!-- This is what gives it away: -->

这就是它的证据：

```json
{
  "scripts": {
      "start": "rimraf ./build && react-scripts start",
      "build": "react-scripts build",
    }
}
```

<!-- Look for react-scripts；this is the single dependency that encapsulates all other React dependencies like webpack . To upgrade React and its dependencies in the future, all you need to do is upgrade this one dependency. This is the React App’s real power because it abstracts away an otherwise potentially hazardous upgrade to stay on the latest bits. -->

找到 *react-scripts*，这是像 webpack 一样封装所有其他 React 依赖项的单一依赖项。若要在将来升级 React 和它的依赖项，您只需升级这一依赖项。它抽象化了可能有潜在危险的升级以保持最新状态，因此这才是 React App 的真正魔力。

<!-- The overall folder structure follows a conventional Create React App project in ClientApp with an ASP.NET project wrapped around it. -->

*ClientApp* 中的整个文件夹结构遵循常规的 Create React App 项目，在其周围包裹着 ASP.NET 项目。

<!-- The folder structure looks like this: -->

文件夹结构如下所示：

![dotnet react app folder structure](/assets/images/202103/dotnet-react-folder-structure.png)

<!-- This React app comes with many niceties but lacks some important ASP.NET features: -->

<!-- there is no server-side rendering via Razor, making any other MVC page work like a separate app
ASP.NET server configuration data is hard to access from the React client
it does not integrate with an ASP.NET user session via a session cookie -->

该 React 应用程序有很多优点，但是它缺少一些重要的 ASP.NET 功能：

- 没有通过 Razor 进行的服务端渲染，使任何其他 MVC 页面像一个单独的应用程序一样工作
- 很难从 React 客户端访问 ASP.NET 服务端配置数据
- 它不会集成由 session cookie 实现的 ASP.NET 用户会话

<!-- I will tackle each one of these concerns as I progress through the integration. What’s nice is these desirable features are attainable with the Create React App and ASP.NET. -->

随着集成的推进，我将逐一解决这些问题。好在这些理想的功能是可以使用 Create React App 和 ASP.NET 实现的。

<!-- To keep track of integration changes, I will now use Git to commit the initial scaffold. Assuming Git is installed, do a git init, git add, and git commit to commit this initial project. Looking at the commit history is an excellent way to track what changes are necessary to do the integration. -->

为了跟踪集成更改，我将使用 Git 提交初始脚手架。假设 Git 已安装，请执行 `git init`、`git add` 和 `git commit` 来提交这个初始项目。查看提交历史是跟踪集成所需更改的一种很好的方法。

<!-- Now, create the following folders and files that are useful for this integration. I recommend using Visual Studio with a right-click create Controller, Class, or View: -->

现在，创建以下对此集成很有用的文件夹和文件。我建议使用 Visual Studio 右键单击创建控制器 、类或 View：

- **/Controllers/HomeController.cs**：服务端主页，它将覆盖 Create React App 的 **index.html** 入口页
- **/Views/Home/Index.cshtml**：Razor 视图，它渲染服务端组件和来自 React 项目的解析过的 **index.html**
- **/CreateReactAppViewModel.cs**：主要的集成视图模型，它将抓取 **index.html** 静态资产并将其解析出来以供 MVC 使用

<!-- Once these folders and files are in place, kill the current running app, and spin up the app in watch mode via dotnet watch run. This command keeps track of changes both on the front and back ends and even refreshes the page when it needs to. -->

有了这些文件夹和文件后，请终止当前正在运行的应用程序，并通过 `dotnet watch run` 以监视模式启动该应用程序。此命令跟踪前端和后端的更改，甚至在需要时刷新页面。

<!-- The rest of the necessary changes will go in existing files that were put in place by the scaffold. This is great because it minimizes code tweaks necessary to flesh out this integration. -->

其余的必要更改将放入脚手架现有的文件中。这好极了，因为可以最大限度地减少必要的代码调整来充实这个集成。

<!-- Time to roll up your sleeves, take a deep breath, and tackle the main part of this integration. -->

是时候擼起袖子，做个深呼吸，处理这个集成的主要部分了。

## CreateReactAppViewModel 集成

<!-- I will begin by creating a view model that does most of the integration. Crack open CreateReactAppViewModel and put this in place: -->

我将从创建一个执行大部分集成工作的视图模型开始。打开 `CreateReactAppViewModel` 并放入以下代码：

```csharp
public class CreateReactAppViewModel
{
    private static readonly Regex _parser = new(
        @"<head>(?<HeadContent>.*)</head>\s*<body>(?<BodyContent>.*)</body>",
        RegexOptions.IgnoreCase | RegexOptions.Singleline);

    public string HeadContent { get；set；}
    public string BodyContent { get；set；}

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

这段代码乍一看可能有点吓人，但它只做了两件事：从开发服务器获取输出的 **index.html** 文件，并解析出 `head` 和 `body` 标签。这使得 ASP.NET 中的消费方应用程序可以访问 HTML，该 HTML 链接到来自 Create React App 的静态资产。这些资产是静态文件，其中包含带有 JavaScript 和 CSS 的代码包。例如，JavaScript 包 *js\main.3549aedc.chunk.js* 或 CSS 包 *css\2.ed890e5e.chunk.css*。这就是在 React 中 webpack 接收所编写的代码并将其呈现到浏览器的方式。

<!-- I opted to fire a `WebRequest` to the dev server directly because Create React App does not materialize any actual files accessible to ASP.NET while in developing mode. This is sufficient for local development because it works well with the webpack dev server. Any changes on the client-side will automatically update the browser. Any back-end changes while in watch mode will also refresh the browser. So, you get the best of both worlds here for optimum productivity. -->

我选择直接向开发服务器发起一个 `WebRequest`，是因为在开发模式下，Create React App 不会生成 ASP.NET 可访问的任何实际文件。这对于本地开发来说足够了，因为它可以与 webpack 开发服务器很好地配合。客户端上的任何更改都将自动更新到浏览器。在监视模式下进行的任何后端更改也会刷新到浏览器。因此，您可以在两全其美的环境中获得最佳的生产力。

<!-- In prod, this will create static assets via npm run build. I recommend doing file IO and reading the index file off its actual location in ClientApp/build. Also, while in prod mode, it is a good idea to cache the contents of this file after the static assets have been deployed to the hosting server. -->

在生产环境中，将会通过 `npm run build` 创建静态资产。我建议执行文件 IO，并从 *ClientApp/build* 中的实际位置读取 index 文件。另外，在生产模式下，最好在静态资产部署到托管服务器之后缓存该文件的内容。

<!-- To give you a better idea, this is what a built index.html file looks like: -->

为了让您有一个更好的概念，下面是一个 build 后的 **index.html** 文件的样子：

![built index.html looks like](/assets/images/202103/built-index-html.png)

<!-- I’ve highlighted the head and body tags the consuming ASP.NET app needs to parse. Once it has this raw HTML, the rest is somewhat easy peasy. -->

我高亮显示了消费方 ASP.NET 应用需要解析的 `head` 和 `body` 标签。有了这些原始的 HTML，剩下的就简单多了。

<!-- With the view model in place, time to tackle the home controller that will override the index.html file from React. -->

视图模型就绪后，就该花点时间处理 home 控制器了，它将覆盖来自 React 的 *index.html*。

<!-- Open the HomeController and add this: -->

打开 `HomeController` 并添加以下代码：

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

在 ASP.NET 中，该控制器是默认路由，它会在服务端渲染的支持下覆盖 Create React App。这就是解锁集成的诀窍，从而可以两全其美。

<!-- Then, put this Razor code in Home/Index.cshtml: -->

接着，把下面的 Razor 代码放入 *Home/Index.cshtml* 中：

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

React 应用程序使用 `react-router` 来定义客户端的路由。如果在浏览器处于非 home 路由时刷新页面，它将恢复为静态的 *index.html*。

<!-- To address this inconsistency, define these server-side routes in Startup. Routes are defined inside UseEndpoints: -->

要解决这种不一致性，请在 `Startup` 中定义下面的服务端路由，路由是在 `UseEndpoints` 中定义的：

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

此时，看一下浏览器，现在它将通过 **h2** 显示这个服务端“组件”。这看起来似乎有点愚蠢，因为它只是在页面上渲染的一些简单 HTML，但其潜力是无穷的。ASP.NET Razor 页面可以具有完整的应用程序外壳，其中包含菜单、品牌和导航，它可以在多个 React 应用之间共享。如果有任何旧版 MVC Razor 页面，这个闪亮的新 React 应用能够无缝集成。

<!-- ## Server-Side App Configuration -->

## 服务器端应用程序配置

<!-- Next, say I want to show server-side configuration on this app from ASP.NET, such as the HTTP protocol, hostname, and the base URL. I chose these mostly to keep it simple, but these config values can come from anywhere. They can be *appsettings.json* settings or even values from a configuration database. -->

接下来，假如我想显示此应用上来自 ASP.NET 的服务端配置，比如 HTTP 协议、主机名和 base URL。我选择这些主要是为了保持简单，不过这些配置值可以来自任何地方，它们可以是 *appsettings.json* 设置，或者甚至可以是来自配置数据库中的值。

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

这里在全局 `window` 浏览器对象中设置来自服务器的任意配置值。React 应用可以轻而易举地检索这些值。我选择在 Razor 中渲染这些相同的值，主要是为了演示它们与客户端应用将看到的是相同的值。

<!-- In React, crack open components\NavMenu.js and add this snippet；most of this will go inside the Navbar: -->

在 React 中，打开 *components\NavMenu.js* 并添加下面的代码段；其中大部分将放在 `Navbar` 中：

```js
import { NavbarText } from 'reactstrap';
 
<NavbarText>
  {window.SERVER_PROTOCOL}
   {window.SERVER_SCHEME}://{window.SERVER_HOST}{window.SERVER_PATH_BASE}
</NavbarText>
```

<!-- The client app will now reflect the server configuration that is set via the global window object. There is no need to fire an Ajax request to load this data or somehow make it available to the index.html static asset. -->

这个客户端应用现在将显示通过全局 `window` 对象设置的服务器端配置。它不需要触发 Ajax 请求来加载这些数据，也不需要以某种方式让 `index.html` 静态资产可以访问它。

<!-- If you’re using Redux, for example, this is even easier because this can be set when the app initializes the store. Initial state values can be passed into the store before anything renders on the client. -->

假如您使用了 Redux，这会变得更加容易，因为可以在应用程序初始化 store 时进行设置。初始化状态值可以在客户端渲染任何内容之前传递到 store 中。

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

为了简洁起见，我选择不使用 Redux store，而是通过 `window` 对象的方式实现，这只是一个粗略的想法。这种方法的好处是，整个应用都可以保持单元可测试的状态，而不会受到类似 `window` 对象的浏览器依赖项的污染。

<!-- ## .NET Core user session integration -->

## .NET Core 用户会话(Session)集成

<!-- Lastly, as the pièce de résistance, I will now integrate this React app with the ASP.NET user session. I will lock down the back-end API where it gets weather data and only show this information with a valid session. This means that when the browser fires an Ajax request, it must contain an ASP.NET session cookie. Otherwise, the request gets rejected with a redirect which indicates to the browser it must first login. -->

最后，作为主菜，现在我将这个 React 应用与 ASP.NET 用户会话集成在一起。我将锁定获取天气数据的后端 API，并仅在使用有效会话时显示此信息。这意味着当浏览器触发 Ajax 请求时，它必须包含一个 ASP.NET session cookie。否则，该请求将被拒绝，并重定向以指示浏览器必须先登录。

<!-- To enable user session support in ASP.NET, open the Startup file and add this: -->

要在 ASP.NET 中启用用户会话支持，请打开 *Startup* 文件并添加：

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services
        .AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
        .AddCookie(options =>
        {
            options.Cookie.HttpOnly = true;
        });
}

public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
{
    // 将下面代码放在 UseRouting 和 UseEndpoints 之间
    app.UseAuthentication();
    app.UseAuthorization();
}
```

<!-- Be sure to leave the rest of the scaffold code in there and only add this snippet in the correct methods. With authentication/authorization now enabled, go to the `WeatherForecastController` and slap an `Authorize` attribute to the controller. This will effectively lock it down to where it needs an ASP.NET user session via a cookie to get to the data. -->

请务必保留其余的脚手架代码，只是在恰当的方法中添加上面的代码段。启用了身份验证和授权后，转到 `WeatherForecastController` 并给该控制器添加一个 `Authorize` 属性。这将有效地将其锁定，从而需要由 cookie 实现的 ASP.NET 用户会话来获取数据。

<!-- The `Authorize` attribute assumes the user can login into the app. Go back to the `HomeController` and add the login/logout methods. Remember to be using `Microsoft.AspNetCore.Authentication`, `Microsoft.AspNetCore.Authentication.Cookies`, and `Microsft.AspNetCore.Mvc`. -->

`Authorize` 属性假定用户可以登录到该应用。回到 `HomeController` 并添加 Login 和 Logout 方法，记得添加 using `Microsoft.AspNetCore.Authentication`、`Microsoft.AspNetCore.Authentication.Cookies` 和 `Microsft.AspNetCore.Mvc`。

<!-- This is one way to establish and then kill the user session: -->

这是建立然后终止用户会话的一种方法：

```csharp
public async Task<ActionResult> Login()
{
    var userId = Guid.NewGuid().ToString();
    var claims = new List<Claim>
    {
        new(ClaimTypes.Name, userId)
    };

    var claimsIdentity = new ClaimsIdentity(claims,
            CookieAuthenticationDefaults.AuthenticationScheme);
    var authProperties = new AuthenticationProperties();

    await HttpContext.SignInAsync(
        CookieAuthenticationDefaults.AuthenticationScheme,
        new ClaimsPrincipal(claimsIdentity),
        authProperties);

    return RedirectToAction("Index");
}

public async Task<ActionResult> Logout()
{
    await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

    return RedirectToAction("Index");
}
```

<!-- Note that the user session is typically established with a redirect and an ASP.NET session cookie. I added a `ClaimsPrincipal` with a user-id set to a random **Guid** to make this seem more real. In a real app, these claims can come from a database or a JWT. -->

请注意，通常使用重定向和 ASP.NET session cookie 来建立用户会话。我添加了一个 `ClaimsPrincipal`，它带有一个设置为随机 **Guid** 的用户 ID，使其看起来更加真实。[^Claims] 在实际应用中，这些 Claims 可能来自数据库或者 JWT。

[^Claims]: 用 Cookie 代表一个通过验证的主体，它包含 Claims, ClaimsIdentity, ClaimsPrincipal 三部分信息，其中 ClaimsPrincipal 相当于持有证件的人，ClaimsIdentity 就是持有的证件，Claims 是证件上的信息。<https://andrewlock.net/introduction-to-authentication-with-asp-net-core/>

<!-- To expose this functionality to the client, open *components\NavMenu.js* and add these links to the `Navbar`: -->

要将此功能公开给客户端，请打开 *components\NavMenu.js* 并将下面的链接添加到 `Navbar`：

```xml
<NavItem>
  <a class="text-dark nav-link" href="/home/login">Log In</a>
</NavItem>
<NavItem>
  <a class="text-dark nav-link" href="/home/logout">Log Out</a>
</NavItem>
```

<!-- Lastly, I want the client app to handle request failures and give some indication to the end user that something went wrong. Bust open *components\FetchData.js* and replace `populateWeatherData` with this code snippet: -->

最后，我希望客户端应用处理请求失败的情况，并给最终用户提供一些提示，指出出了点问题。打开 *components\FetchData.js* 并用下面的代码段替换 `populateWeatherData`：

```js
async populateWeatherData() {
    try {
        const response = await fetch(
            'weatherforecast',
            { redirect: 'error' });
        const data = await response.json();
        this.setState({ forecasts: data, loading: false });
    } catch {
        this.setState({
            forecasts: [{ date: 'Unable to get weather forecast' }],
            loading: false
        });
    }
}
```

<!-- I tweaked the `fetch` so it does not follow failed requests on a redirect, which is an error response. The ASP.NET middleware responds with a redirect to the login page when an Ajax request fails to get the data. In a real app, I recommend customizing this to a 401 (Unauthorized) status code so the client can deal with this more gracefully. Or, set up some way to poll the back end and check for an active session and redirect accordingly via `window.location`. -->

我调整了一下 `fetch`，以使它不会用重定向跟踪失败的请求，而是返回一个错误响应。当 Ajax 请求获取数据失败时，ASP.NET 中间件将以重定向到登录页的方式响应。在实际的应用中，我建议将其自定义为 401 (Unauthorized) 状态码，以便客户端可以更优雅地处理此问题；或者，设置某种方式来轮询后端并检查活动会话，然后通过 `window.location` 进行相应地重定向。

<!-- Done, the dotnet watcher should keep track of changes on both ends while refreshing the browser. To take this out for a test spin, I will first visit the Fetch Data page, note that the request fails, login, and try again to get weather data with a valid session. I will open the network tab to show Ajax requests in the browser. -->

完成后，dotnet 监视程序应该会在刷新浏览器时跟踪前后两端的更改。为了进行测试，我将首先访问 Fetch Data 页，请注意会请求失败，然后登录，并使用有效的会话再次尝试获取天气数据。我将打开“Network”选项卡，以在浏览器中显示 Ajax 请求。

![ajax request with valid session](/assets/images/202103/ajax-request-with-valid-session.png)

<!-- Note the 302 redirect when I first get the weather data, and it fails. Then, the subsequent redirect from login establishes a session. Peeking at the browser cookies shows this cookie name `AspNetCore.Cookies`, which is a session cookie that allows a subsequent Ajax request to work properly. -->

请注意当我第一次获取天气数据时的 302 重定向，它失败了。接着，来自登录页的后续重定向建立了一个会话。查看一下浏览器的 cookies，会显示这个名为 `AspNetCore.Cookies` 的 cookie，它是一个 session cookie，正是它让后面的 Ajax 请求工作正常了。

## 结论

<!-- .NET Core 5 and React do not have to live in separate silos. With an excellent integration, it is possible to unlock server-side rendering, server config data, and the ASP.NET user session in React. -->

.NET Core 5 和 React 不必独立存在。通过出色的集成，便可以在 React 中解锁服务端渲染、服务端配置数据和 ASP.NET 用户会话。

<br />

> 作者 ： Camilo Reyes  
> 译者 ： 技术译民  
> 出品 ： [技术译站](https://ittranslator.cn/)  
> 链接 ： [英文原文](https://www.red-gate.com/simple-talk/dotnet/net-tools/integrate-create-react-app-with-net-core-5/)
