---
layout: post
title:  "Blazor 路由及导航开发指南"
date:   2021-07-16 00:10:10 +0800
categories: dotnet csharp
published: true
---

> 翻译自 Waqas Anwar 2021年3月21日的文章 [《A Developer’s Guide To Blazor Routing and Navigation》](https://www.ezzylearning.net/tutorial/a-developers-guide-to-blazor-routing-and-navigation) [^1]

[^1]: <https://www.ezzylearning.net/tutorial/a-developers-guide-to-blazor-routing-and-navigation> A Developer’s Guide To Blazor Routing and Navigation

![A-Developers-Guide-To-Blazor-Routing-and-Navigation](https://www.ezzylearning.net/wp-content/uploads/A-Developers-Guide-To-Blazor-Routing-and-Navigation.jpg)

<!-- Inspecting incoming request URLs and route them to appropriate views or pages are the basic features of every single-page app (SPA) framework. Blazor Server and WebAssembly apps also support routing using some built-in components and services. In this tutorial, I will cover everything you need to learn about implementing routing in Blazor apps. -->

检查传入的请求 URL 并将它们导航到对应的视图或页面是每个单页应用程序 (SPA) 框架的基本功能。Blazor Server 和 WebAssembly 应用程序也同样支持使用一些内置组件和服务进行路由。在本教程中，我将向您介绍在 Blazor 应用程序中实现路由所需了解的所有内容。

## Blazor 应用程序中的路由配置

<!-- Before we start creating routes for different Blazor components/pages we need to see how the Blazor Server apps are integrated into ASP.NET Core Endpoint Routing. Blazor Server apps communicate with the clients over SignalR connections and to accept incoming connections for Blazor components we call the **MapBlazorHub** method in **Startup.cs** file **Configure** method as follows: -->

在开始为不同的 Blazor 组件/页面创建路由之前，我们需要了解如何将 Blazor Server 应用程序集成到 [ASP.NET Core Endpoint 路由](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/routing?view=aspnetcore-5.0)中。Blazor Server 应用程序通过 SignalR 连接与客户端通信，为了接受 Blazor 组件传入的连接，我们在 **Startup.cs** 文件的 **Configure** 方法中调用 **MapBlazorHub** 方法，如下所示：

```csharp
app.UseEndpoints(endpoints =>
{
    endpoints.MapBlazorHub();
    endpoints.MapFallbackToPage("/_Host");
});
```

The default configuration routes all requests to a Razor page which acts as the host for the server-side part of the Blazor Server app. By convention, this host page is **_Host.cshtml** and it is available in the **Pages** folder of the app. The route specified in the host file is called a fallback route and has very low priority in route matching which means this route is used when no other route matches.

默认配置将所有请求都转发到一个 Razor 页面，该页面扮演 Blazor Server 应用程序服务端角色的主机。按照惯例，此主机页面是 **_Host.cshtml**，它位于应用程序的 **Pages** 文件夹中。主机文件中指定的路由被称之为应急路由，并且在路由匹配中具有非常低的优先级，这意味着当没有其他路由匹配时，才会使用此路由。

## Blazor 路由组件介绍

The **Router** component is one of the built-in components in Blazor and it is used in the **App** component of Blazor apps. This component enables routing in Blazor apps and supplies route data corresponding to the current navigation state. This component intercepts the incoming requests and renders the page that matches the requested URL.

[Router](https://docs.microsoft.com/zh-cn/dotnet/api/microsoft.aspnetcore.components.routing.router)[^router] 组件是 Blazor 中的内置组件之一，用于 Blazor 应用程序的 **App** 组件之中。此组件启用 Blazor 应用程序中的路由，并提供与当前导航状态相对应的路由数据。它拦截传入的请求并呈现与请求的 URL 相匹配的页面。

[^router]: <https://docs.microsoft.com/zh-cn/dotnet/api/microsoft.aspnetcore.components.routing.router>

```html
<Router AppAssembly="@typeof(Program).Assembly" PreferExactMatches="@true">
    <Found Context="routeData">
        <RouteView RouteData="@routeData" DefaultLayout="@typeof(MainLayout)" />
    </Found>
    <NotFound>
        <LayoutView Layout="@typeof(MainLayout)">
            <p>Sorry, there's nothing at this address.</p>
        </LayoutView>
    </NotFound>
</Router>
```

The following tables show the properties of the Router component.

下表显示了 [Router 组件](https://docs.microsoft.com/zh-cn/dotnet/api/microsoft.aspnetcore.components.routing.router)的属性。

| 属性                   | 说明                                      |
|----------------------|-----------------------------------------|
| AdditionalAssemblies | 获取或设置其他程序集的集合，这些程序集应在搜索可与 URI 匹配的组件时搜索。 |
| AppAssembly          | 获取或设置应在其中搜索与 URI 匹配的组件的程序集。             |
| Found                | 获取或设置当为请求的路由找到匹配项时要显示的内容。               |
| Navigating           | 获取或设置异步导航正在进行时显示的内容。                    |
| NotFound             | 获取或设置当没有为请求的路由找到匹配项时要显示的内容。             |
| OnNavigateAsync      | 获取或设置在导航到新页之前应调用的处理程序。                  |

When Blazor components (.razor) are compiled their generated C# classes are saved in **obj\Debug\net5.0\Razor\Pages** folder

当编译 Blazor 组件 (.razor) 时，它们生成的 C# 类会保存在 **obj\Debug\net5.0\Razor\Pages** 文件夹中

![Blazor-Componnts-Compiled-into-Classes](https://www.ezzylearning.net/wp-content/uploads/Blazor-Componnts-Compiled-into-Classes.png)

If you will open any of the compiled files you will notice that after compilation, all the components with an **@page** directive have generated a class with the RouteAttribute attribute.

如果您打开任一已编译的文件，将会注意到在编译之后，所有带有 **@page** 指令的组件都生成了一个带有 [RouteAttribute](https://docs.microsoft.com/zh-cn/dotnet/api/microsoft.aspnetcore.components.routeattribute) 特性的类。

![RouteAttribute-added-to-all-Blazor-Components-generated-classes](https://www.ezzylearning.net/wp-content/uploads/RouteAttribute-added-to-all-Blazor-Components-generated-classes.png)

<!-- When the app starts, the assembly specified by the **AppAssembly** property is scanned to gather the route information from all classes that have RouteAttribute specified on them. -->

当应用程序启动时，会扫描 **AppAssembly** 属性指定的程序集，从所有指定了 [RouteAttribute](https://docs.microsoft.com/zh-cn/dotnet/api/microsoft.aspnetcore.components.routeattribute) 特性的类中收集路由信息。

```html
<Router AppAssembly="@typeof(Program).Assembly" PreferExactMatches="@true">
```

If you have created separate component class libraries and you want the app to scan and load routes from those assemblies, then you can use **AdditionalAssemblies** property that accepts a collection of [Assembly](https://docs.microsoft.com/zh-cn/dotnet/api/system.reflection.assembly) objects.

如果您创建了独立的组件类库，并希望应用程序从这些程序集中扫描和加载路由，那么您可以使用 **AdditionalAssemblies** 属性来接受一个 [Assembly](https://docs.microsoft.com/zh-cn/dotnet/api/system.reflection.assembly) 对象集合。

![Blazor-App-Additional-Routes-from-External-Assemblies](https://www.ezzylearning.net/wp-content/uploads/Blazor-App-Additional-Routes-from-External-Assemblies.png)

<!-- Here is an example of loading route information from two routable components Component1 and Component2 defined in component class libraries. -->

下面是一个从组件类库中定义的两个可路由组件 *Component1* 和 *Component2* 加载路由信息的示例。

```html
<Router AppAssembly="@typeof(Program).Assembly" PreferExactMatches="@true"
        AdditionalAssemblies="new[] { typeof(Component1).Assembly, typeof(Component2).Assembly }"> 
</Router>
```

<!-- At runtime, the **RouteView** component receives the **RouteData** from the **Router** along with any route parameters and renders the specified component with the layout defined in the component. If no layout is defined, then it uses the layout specified by the **DefaultLayout** property. The default layout is normally the **MainLayout** component available in the **Shared** folder but you can also create and specify a custom layout. -->

在运行时，[**RouteView**](https://docs.microsoft.com/zh-cn/dotnet/api/microsoft.aspnetcore.components.routeview) 组件从 [**Router**](https://docs.microsoft.com/zh-cn/dotnet/api/microsoft.aspnetcore.components.routing.router) 接收 [**RouteData**](https://docs.microsoft.com/zh-cn/dotnet/api/microsoft.aspnetcore.components.routedata) 以及任意路由参数，并使用组件中定义的布局渲染指定的组件。如果未定义布局，则它使用 **DefaultLayout** 属性指定的布局。默认的布局通常是 **Shared** 文件夹中的 **MainLayout** 组件，不过您也可以创建并指定一个自定义布局。

```html
<RouteView RouteData="@routeData" DefaultLayout="@typeof(MainLayout)" />
```

The **Found** template is used to display the contents of the matching route is found as you can see in the example below where a matching route is found and a Counter page is rendered in the browser.

**Found** 模板用于显示已找到的匹配路由的内容，正如您在下例中所看到的那样，其中找到了匹配路由，并在浏览器中呈现了一个 Counter 页面。

![Blazor-App-Counter-Page-Route](https://www.ezzylearning.net/wp-content/uploads/Blazor-App-Counter-Page-Route.png)

The **NotFound** template is used to display the contents if no matching route is found. By default, the NotFound template is just displaying a message as shown in the screenshot below.

**NotFound** 模板用于在没有找到匹配的路由时显示内容。默认情况下，NotFound 模板仅显示一条消息，如下面的截图所示。

![Blazor-App-Default-Error-Page-Contents](https://www.ezzylearning.net/wp-content/uploads/Blazor-App-Default-Error-Page-Contents.png)

We can also create a custom error layout and page and display a custom error page. Let’s create a new custom Layout with the name **ErrorLayout.razor** in the **Shared** folder.

我们还可以创建自定义错误布局和页面来显示自定义错误页面。让我们在 **Shared** 文件夹中创建一个新的名为 **ErrorLayout.razor** 的自定义布局。

<b>ErrorLayout.razor</b>

```html
@inherits LayoutComponentBase
 
<main role="main" class="container"> 
    <div class="text-center">
        @Body
    </div> 
</main>
```

<!-- <b>ErrorLayout.razor</b> -->

Then change the **Layout** property of the **LayoutView** component to **ErrorLayout** and change the contents inside the **LayoutView** as follows

然后将 **LayoutView** 组件的 **Layout** 属性改为 **ErrorLayout**，并将 **LayoutView** 里的内容修改如下：

```html
<Router AppAssembly="@typeof(Program).Assembly" PreferExactMatches="@true">
    <Found Context="routeData">
        <RouteView RouteData="@routeData" DefaultLayout="@typeof(MainLayout)" />
    </Found>
    <NotFound>
        <LayoutView Layout="@typeof(ErrorLayout)">
            <h1 class="display-1">404</h1>
            <h1 class="display-4">Not Found</h1>
            <p class="lead">
                Oops! Looks like this page doesn't exist.
            </p>
        </LayoutView>
    </NotFound>
</Router>
```

If you will run the app in the browser and will try to access a URL that is not specified anywhere in the application then you will see a custom 404 error page as shown below.

现在，如果您在浏览器中运行应用程序，并尝试访问未在应用中任何位置指定过的 URL，那么您将会看到一个自定义 404 错误页面，如下所示。

![Blazor-App-Custom-Error-Page-Layout](https://www.ezzylearning.net/wp-content/uploads/Blazor-App-Custom-Error-Page-Layout.png)

All Blazor apps should explicitly set the **PreferExactMatches** attribute to @true so that route matching prefers exact matches rather than wildcards. As per Microsoft official docs, this attribute will not be available from .NET 6 onward and the router will always prefer exact matches.

所有 Blazor 应用程序都应将 **PreferExactMatches** 特性显式地设置为 `@true`，以便路由匹配更倾向于精确匹配，而不是通配符匹配。根据 Microsoft 官方文档，此属性从 .NET 6 开始将不可用，路由器将总是更倾向于精确匹配。

## 定义路由、参数和约束

Before we learn how to define routes for Blazor components, we need to make sure that we have the following `base` tag available on every page to resolve the URLs correctly. If you are creating Blazor Server App then you can add this tag in the head section of **Pages/_Host.cshtml** file and for Blazor WebAssembly apps this tag can be added in **wwwroot/index.html** file.

在我们学习如何为 Blazor 组件定义路由之前，我们需要确保下面的 `base` 标签在每个页面都可用，以便正确地解析 URL。如果创建的是 Blazor Server 应用程序，那么您可以将此标签添加到 **Pages/_Host.cshtml** 文件的 `head` 部分，如果是 Blazor WebAssembly 应用程序，则可以将此标签添加到 **wwwroot/index.html** 文件。

```html
<base href="~/" />
```

To define routes, we can use the @page directive as shown in the Counter component example below.

要定义路由，我们可以使用 **@page** 指令，如下面的 Counter 组件示例所示。

```html
@page "/counter"
 
<h1>Counter</h1>
 
<p>Current count: @currentCount</p>
 
<button class="btn btn-primary" @onclick="IncrementCount">Click me</button>
 
@code {
    private int currentCount = 0;
 
    private void IncrementCount()
    {
        currentCount++;
    }
}
```

<!-- We can now access the counter component using the **/counter** URL. -->

现在我们就可以使用 **/counter** URL 访问 Counter 组件了。

![Blazor-App-Counter-Page-Route](https://www.ezzylearning.net/wp-content/uploads/Blazor-App-Counter-Page-Route.png)

We are also allowed to define multiple route templates using multiple **@page** directives as shown in the example below.

我们还可以使用多个 **@page** 指令定义多个路由模板，如下例所示。

```html
@page "/counter"
@page "/mycounter"
```

<!-- This means that now the same Counter component can also be accessed using **/mycounter** URL: -->

这意味着现在也可以使用 **/mycounter** URL 访问相同的 Counter 组件：

![Blazor-App-Counter-Page-with-Second-Route](https://www.ezzylearning.net/wp-content/uploads/Blazor-App-Counter-Page-with-Second-Route.png)

<!-- It is very common practice to pass data from one page to another page using the route parameters and Blazor route templates support parameters. The route parameter names are case insensitive and once we have the route parameter defined the router automatically populates the corresponding component property with the same name. For example, in the following code snippet, we define a route parameter **title** and also created a corresponding property **Title** in the component. This property will populate with the value of route parameter text automatically. We are then displaying the Title property as a heading of the page inside the **h1** element. -->

使用路由参数将数据从一个页面传递到另一个页面是非常常见的做法，Blazor 路由模板支持路由参数。路由参数名称不区分大小写，一旦我们定义了路由参数，路由器就会自动填充相应的具有相同名称的组件属性。例如，在下面的代码片段中，我们定义了一个路由参数 **title**，并在组件中创建了一个相应的属性 **Title**。此属性将自动使用路由参数文本的值填充。然后，我们在 `h1` 元素中显示 Title 属性作为页面的标题。

```html
@page "/counter/{title}"
 
<h1>@Title</h1>
 
<p>Current count: @currentCount</p>
 
<button class="btn btn-primary" @onclick="IncrementCount">Click me</button>
 
@code {
    private int currentCount = 0;
 
    [Parameter]
    public string Title { get; set; }
 
    private void IncrementCount()
    {
        currentCount++;
    }
}
```

<!-- Run the app and try to specify any string in the address bar after the /counter/ and you will see the route parameter value displayed as page heading. -->

运行应用程序，尝试在地址栏中 **/counter/** 之后指定任意字符串，您将看到路由参数值显示为页面标题。

![Blazor-App-with-Route-Parameter](https://www.ezzylearning.net/wp-content/uploads/Blazor-App-with-Route-Parameter.png)

We are also allowed to define optional route parameters as shown in the example below where the title is an optional parameter as it has the question mark **(?)** after the parameter name. If we will not provide the value of this route parameter, the parameter will initialize with the default value of Counter in the **OnInitialized** method.

我们还可以定义可选的路由参数，如下例所示，其中 `title` 是可选参数，因为在此参数名称后面带有问号 **(?)**。假如我们不提供此路由参数的值，该参数将在 **OnInitialized** 方法中使用默认值 *Counter* 进行初始化。

```html
@page "/counter/{title?}"
 
<h1>@Title</h1>
 
<p>Current count: @currentCount</p>
 
<button class="btn btn-primary" @onclick="IncrementCount">Click me</button>
 
@code {
    private int currentCount = 0;
 
    [Parameter]
    public string Title { get; set; }
 
    protected override void OnInitialized()
    {
        Title = Title ?? "Counter";
    }
 
    private void IncrementCount()
    {
        currentCount++;
    }
}
```

Blazor also supports route constraints that enforce the type matching on a route. In the code snippet below, I created a route parameter `start` with an `int` type which means now I can only provide the integer value for this route parameter. The counter will now start with the value specified in the route parameter.

Blazor 还支持在路由上强制类型匹配的路由约束。在下面的代码片段中，我创建了一个 `int` 类型的路由参数 `start`，这意味着现在我只能为此路由参数提供整数值。计数器现在将从路由参数中指定的值开始计数。

```html
@page "/counter/{start:int}"
 
<h1>Counter</h1>
 
<p>Current count: @Start</p>
 
<button class="btn btn-primary" @onclick="IncrementCount">Click me</button>
 
@code { 
    [Parameter]
    public int Start { get; set; }
 
    private void IncrementCount()
    {
        Start++;
    }
}
```

Run the app in the browser and specify any integer value in the URL such as **/counter/4** and you will see the counter will start incrementing from this starting value.

在浏览器中运行应用程序，并在 URL 中指定任一整数值，比如 **/counter/4**，您将看到计数器将从该起始值递增。

![Blazor-App-with-Route-Parameter-Constraint](https://www.ezzylearning.net/wp-content/uploads/Blazor-App-with-Route-Parameter-Constraint.png)

The following table shows the types supported by Blazor route constraints.

下表显示了 Blazor 路由约束支持的类型。

| 约束         | 示例                | 匹配项示例                                                                            |
|------------|-------------------|----------------------------------------------------------------------------------|
| `datetime` | `{dob:datetime}`  | `2016-12-31`, `2016-12-31 7:32pm`                                                |
| `decimal`  | `{price:decimal}` | `49.99`, `-1,000.01`                                                             |
| `double`   | `{weight:double}` | `1.234`, `-1,001.01e8`                                                           |
| `float`    | `{weight:float}`  | `1.234`, `-1,001.01e8`                                                           |
| `guid`     | `{id:guid}`       | `CD2C1638-1638-72D5-1638-DEADBEEF1638`, `{CD2C1638-1638-72D5-1638-DEADBEEF1638}` |
| `int`      | `{id:int}`        | `123456789`, `-123456789`                                                        |
| `long`     | `{ticks:long}`    | `123456789`, `-123456789`                                                        |

Multiple route parameters can also be defined as shown in the example below where we defined **start** and **increment** as **int** type parameters.

也可以定义多个路由参数，如下例所示，我们将 `start` 和 `increment` 定义为 `int` 类型参数。

```html
@page "/counter/{start:int}/{increment:int}"
 
<h1>Counter</h1>
 
<p>Current count: @Start</p>
 
<button class="btn btn-primary" @onclick="IncrementCount">Click me</button>
 
@code { 
    [Parameter]
    public int Start { get; set; }
 
    [Parameter]
    public int Increment { get; set; }
 
    private void IncrementCount()
    {
        Start+=Increment;
    }
}
```

Run the app and specified both `start` and `increment` values in the address URL as shown below and you will notice that not only the counter will start with the value `2` but it will also increment by `3` every time you will click the **Click me** button.

运行应用程序并在地址 URL 中指定 `start` 和 `increment` 值，如下所示，你会注意到计数器不仅会从数字 `2` 开始计数，而且当您每次点击 **Click me** 按钮时都会递增 `3`。

![Blazor-App-with-Multiple-Route-Parameter-and-Constraints](https://www.ezzylearning.net/wp-content/uploads/Blazor-App-with-Multiple-Route-Parameter-and-Constraints.png)

## Blazor NavigationManager 服务概述

The *NavigationManager* service allows us to manage URIs and navigation in C# code. The NavigationManager class has the following common properties, methods, and events.

[*NavigationManager*](https://docs.microsoft.com/zh-cn/dotnet/api/microsoft.aspnetcore.components.navigationmanager) 服务允许我们在 C# 代码中管理 URI 和导航。*NavigationManager* 类具有以下常见的属性、方法和事件。

| 名称                 | 类型 | 说明                                                                                 |
|--------------------|----|------------------------------------------------------------------------------------|
| BaseUri            | 属性 | 获取或设置当前的基 URI。BaseUri 始终表示为字符串形式的绝对 URI，后跟斜杠。 通常，这与文档的 `<base>` 元素上的 "href" 特性相对应。 |
| Uri                | 属性 | 获取或设置当前 URI。 Uri 始终以字符串形式表示为绝对 URI。                                                |
| NavigateTo         | 方法 | 导航到指定 URI。                                                                         |
| ToAbsoluteUri      | 方法 | 将相对 URI 转换为绝对 URI。                                                                 |
| ToBaseRelativePath | 方法 | 给定基 URI (例如，之前由 BaseUri 返回)，将绝对 URI 转换为相对于基 URI 前缀的 URI。                           |
| LocationChanged    | 事件 | 导航位置更改时触发的事件。                                                                      |

Let’s create a page to see some of the above properties and methods in action. Create a new Blazor component and inject the NavigationManager service using the @inject directive. Try to print the Uri and BaseUri properties on the page to see what type of URIs they return.

让我们创建一个页面，来查看一下以上属性和方法的一些实际行为。创建一个新的 Blazor 组件并使用 @inject 指令注入 NavigationManager 服务。 尝试在页面上打印 Uri 和 BaseUri 属性以查看它们返回的是什么类型的 URI。

```html
@page "/navigationmanager"
@inject NavigationManager nvm
 
<h3>Navigation Manager</h3>
<br />
 
<p>@nvm.Uri</p>
<p>@nvm.BaseUri</p>
```

Run the app and you will see output similar to the following in the browser. The **Uri** property will display the current absolute URI of the page whereas the **BaseUri** property will display the current base URI.

运行应用程序，您将在浏览器中看到类似于以下内容的输出。**Uri** 属性显示当前页面的绝对 URI，而 **BaseUri** 属性显示当前页面的基 URI。

![Blazor-App-NavigationManager-Properties](https://www.ezzylearning.net/wp-content/uploads/Blazor-App-NavigationManager-Properties.png)

Add two buttons **Home Page** and **Counter Page** on the page and add their onclick event handler methods in the **@code** block. Inside the event handler methods, we can use the **NavigateTo** method to redirect the user to different Blazor components from the C# code.

在页面上添加两个按钮 **Home Page** 和 **Counter Page**，并在 **@code** 块中添加它们的 `onclick` 事件处理方法。在事件处理方法中，我们可以从 C# 代码中使用 **NavigateTo** 方法将用户重定向到不同的 Blazor 组件。

```html
@page "/navigationmanager"
@inject NavigationManager nvm
 
<h3>Navigation Manager</h3>
<br />
 
<p>@nvm.Uri</p>
<p>@nvm.BaseUri</p>
 
<button class="btn btn-primary" @onclick="GoToHome">
    Home Page
</button>
 
<button class="btn btn-primary" @onclick="GoToCounter">
    Counter Page
</button>
 
@code {
 
    private void GoToHome()
    {
        nvm.NavigateTo("/");
    }
 
    private void GoToCounter()
    {
        nvm.NavigateTo("counter");
    }
}
```

Run the app and try to click both buttons, you will be able to navigate to home and counter pages as expected.

运行应用程序并试着点击这两个按钮，您将能够按预期的那样导航到主页和计数器页面。

![Blazor-App-NavigationManager-NavigateTo-Method](https://www.ezzylearning.net/wp-content/uploads/Blazor-App-NavigationManager-NavigateTo-Method.png)

If you don’t want to handle navigation programmatically and want to generate hyperlinks in HTML then you can use Blazor NavLink component. The NavLink component is similar to HTML `<a>` element with some cool features. It automatically toggles the **active** class with the element if the **href** attribute value matches with the current URL. This allows us to apply different styles on the currently selected link. You can see the usage of this component in **Shared/NavMenu.razor** file

如果不想以编程方式处理导航，而想在 HTML 中生成超链接，则可以使用 Blazor [**NavLink**](https://docs.microsoft.com/zh-cn/dotnet/api/microsoft.aspnetcore.components.routing.navlink) 组件。 NavLink 组件类似于 HTML 中的 `<a>` 元素，具有一些很酷的功能。如果 NavLink 的 **href** 特性值与当前 URL 相匹配，则会自动切换该元素的 **active** CSS 类（class）。这就允许我们在当前选中的链接上应用不同的样式。您可以在 **Shared/NavMenu.razor** 文件中看到这个组件的用法。

```html
<div class="@NavMenuCssClass" @onclick="ToggleNavMenu">
    <ul class="nav flex-column">
        <li class="nav-item px-3">
            <NavLink class="nav-link" href="" Match="NavLinkMatch.All">
                <span class="oi oi-home" aria-hidden="true"></span> Home
            </NavLink>
        </li>
        <li class="nav-item px-3">
            <NavLink class="nav-link" href="counter">
                <span class="oi oi-plus" aria-hidden="true"></span> Counter
            </NavLink>
        </li>
        <li class="nav-item px-3">
            <NavLink class="nav-link" href="fetchdata">
                <span class="oi oi-list-rich" aria-hidden="true"></span> Fetch data
            </NavLink>
        </li> 
    </ul>
</div>
```

The component also has a Match property that can be set to one of the following:

<!-- 获取或设置一个值，该值表示 URL 匹配行为。 -->

[**NavLink**](https://docs.microsoft.com/zh-cn/dotnet/api/microsoft.aspnetcore.components.routing.navlink) 组件也有一个 Match 属性，可以设置为以下选项之一：

- NavLinkMatch.All: 指定当 NavLink 与整个当前 URL 匹配时应处于活动状态。
- NavLinkMatch.Prefix（默认值）: 指定当 NavLink 与当前 URL 的任意前缀匹配时应处于活动状态。

## 总结

In this tutorial, I tried to cover many routing features available in Blazor apps and also covered different routing related components and services available to developers. I hope you will be able to define routes, parameters, and constraints with more confidence now. If you liked this tutorial, please share it with others to spread the knowledge.

在本教程中，我尝试介绍 Blazor 应用中可用的多种路由功能，还介绍了可供开发者使用的不同的路由相关的组件和服务。我希望您现在能够更熟练地定义路由、参数和约束。如果您喜欢本教程，请与他人分享以传播知识。
