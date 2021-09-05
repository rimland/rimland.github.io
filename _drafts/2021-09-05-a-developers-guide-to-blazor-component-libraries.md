---
layout: post
title:  "Blazor Server 应用程序中进行 HTTP 请求"
date:   2021-08-19 00:10:10 +0800
categories: dotnet csharp
tags: [DotNet, Blazor]
published: true
---

> 翻译自 Waqas Anwar 2021年5月21日的文章 [《A Developer’s Guide To Blazor Component Libraries》](https://www.ezzylearning.net/tutorial/a-developers-guide-to-blazor-component-libraries) [^1]

[^1]: <https://www.ezzylearning.net/tutorial/a-developers-guide-to-blazor-component-libraries> A Developer’s Guide To Blazor Component Libraries

![A-Developers-Guide-To-Blazor-Component-Libraries](/assets/images/202109/A-Developers-Guide-To-Blazor-Component-Libraries.jpg)

<!--Blazor is all about components. We create different types of components and reuse them throughout the project. Nobody wants to reinvent the wheel so it is always a good idea to create a library of reusable Blazor components that can not only be shared across multiple projects but can also be shared with others as a NuGet package. Blazor allows us to create such component libraries with the help of a new project template called Razor Class Library and in this post, I will show you how to create such a library and share not only components but also static contents such as images, stylesheets, etc.-->

Blazor 的核心是组件，我们创建不同类型的组件并在整个项目中重用它们。没有人想重复造轮子，因此创建一个可重用的 Blazor 组件库始终是一个好主意，这些组件不仅可以在多个项目之间共享，还可以作为 NuGet 包与其他人共享。Blazor 允许我们基于一个名为 Razor 类库（Razor Class Library）的新模板创建这样的组件库，在本文中，我将向您演示如何创建这样一个库，不仅仅共享组件，还共享静态内容（比如图片、样式表等等）。

[下载源码](https://github.com/ezzylearning/BlazorClassLibraryDemo)[^download]

[^download]: <https://github.com/ezzylearning/BlazorClassLibraryDemo>

## 创建一个 Razor 组件库

<!--Create a new Blazor Server App with the name BlazorClassLibraryDemo in Visual Studio 2019. Make sure you can build and run your project without any problem. If you are not sure how to create Blazor Server apps then I will recommend you to read my post A Beginner’s Guide To Blazor Server and WebAssembly Applications-->

在 Visual Studio 2019 中创建一个新的名为 **BlazorClassLibraryDemo** 的 Blazor Server 应用程序，确保您可以正常构建和运行该项目。如果您不确定如何创建 Blazor Server 应用程序，那么我建议您阅读我的文章[《Blazor Server 和 WebAssembly 应用程序入门指南》](https://ittranslator.cn/dotnet/csharp/2021/07/05/a-beginners-guide-to-blazor-server-and-webassembly-applications.html)

<!--To add a new components library in your Blazor project, right-click on the solution and choose **Add > New Project…** option. Choose **Razor Class Library** project template from the list of available project templates-->

要在 Blazor 项目中添加一个新组件库，请右键点击解决方案并选择 **添加 > 新建项目...** 选项。从项目模板列表中选择 **Razor 类库（Razor Class Library）** 项目模板。

![Add-New-Razor-Class-Library-in-Blazor-Project](/assets/images/202109/Add-New-Razor-Class-Library-in-Blazor-Project.jpg)

<!--Give the project any suitable name, I have chosen the name **MyComponentsLibrary**.-->

为项目提供任意合适的名称，我这里将其命名为 **MyComponentsLibrary**。

![Provide-Name-of-Razor-Class-Library](/assets/images/202109/Provide-Name-of-Razor-Class-Library.jpg)

<!--You will be asked to select the Project template once again with some additional options shown in the following dialog. There is only one item to select in this dialog so make sure Razor Class Library is selected and click Create button.-->

然后，会询问您选择一些其他设置项，直接点击 **创建** 按钮就好。

![Choose-Razor-Class-Library-Template](/assets/images/202109/Choose-Razor-Class-Library-Template.png)

<!--By default, the template will create an example component called **Component1.razor** with some additional files. Before we start creating our first shared component, we need to delete **Component1.razor** and **ExampleJsInterop.cs** as well as everything in the **wwwroot** folder so that we have a clean base to start.-->

默认情况下，模板会创建一个名为 **Component1.razor** 的示例组件和一些附加文件。在开始创建我们的第一个共享组件之前，我们需要删除 **Component1.razor**、**ExampleJsInterop.cs** 以及 **wwwroot** 文件夹中的所有内容，以便我们有一个纯净的开始。

## 在 Razor 类库中创建一个组件

<!--Let’s create our first reusable/shared components in the Razor class library project **MyComponentsLibrary**. Right-click on the class library project and choose **Add > New Item…** option. Select **Razor Component** template and give the component name **TableWidget.razor**.-->

让我们在 Razor 类库项目 **MyComponentsLibrary** 中创建我们的第一个可重用的共享组件。右键点击类库项目并选择 **添加 > 新建项…** 选项。 选择 **Razor 组件** 模板并指定组件名称 **TableWidget.razor**。

![Create-New-Blazor-Component-in-Razor-Class-Library](/assets/images/202109/Create-New-Blazor-Component-in-Razor-Class-Library.png)

<!--You can also add a **TableWidget.razor.cs** code-behind file if you want to keep your C# code separate from the component view. The TableWidget component is a simple Templated component that can be used to generate HTML tables from any list of objects. If you want to learn more about Blazor Templated components then you can read my post 《A Developer’s Guide To Blazor Templated Components》.-->

如果您希望将 C# 代码与组件视图分开，您还可以添加代码隐藏文件 **TableWidget.razor.cs**。该 TableWidget 组件是一个简单的模板化组件，可用于从任何对象列表生成 HTML 表格。如果您想了解有关 Blazor 模板化组件的更多知识，那么您可以阅读我的文章[《Blazor 模板化组件开发指南》](https://ittranslator.cn/dotnet/csharp/2021/08/16/a-developers-guide-to-blazor-templated-components.html)。

<!--Add the following markup in TableWidget.razor component view file.-->

在 TableWidget.razor 组件视图文件中添加以下标记。

<b>TableWidget.razor</b>

```html
@typeparam TItem
<table class="table table-striped table-bordered">
    <thead class="thead-green">
        <tr>
            @HeaderTemplate
        </tr>
    </thead>
    <tbody>
    @foreach (var item in Items)
    {
        <tr>
            @RowTemplate(item)
        </tr>
    }
    </tbody>
    <tfoot>
        <tr>
            @FooterTemplate
        </tr>
    </tfoot>
</table>
```

<!--Following is the code-behind file of our TableWidget component. The component has Header, Row, and Footer templates of RenderFragment type to generate the header, body, and the footer of the HTML table in the view.-->

下面是 TableWidget 组件的代码隐藏文件。该组件具有 RenderFragment 类型的 Header、Row 和 Footer 模板，用于在视图中生成 HTML 表格的表头、数据行和页脚。

<b>TableWidget.razor.cs</b>

```csharp
using System.Collections.Generic;
using Microsoft.AspNetCore.Components;
 
namespace MyComponentsLibrary
{
    public partial class TableWidget<TItem>
    {
        [Parameter]
        public RenderFragment HeaderTemplate { get; set; }
 
        [Parameter]
        public RenderFragment<TItem> RowTemplate { get; set; }
 
        [Parameter]
        public RenderFragment FooterTemplate { get; set; }
 
        [Parameter]
        public IReadOnlyList<TItem> Items { get; set; }
    }
}
```

<!--Every reusable component we create in the Razor class library can also have its stylesheet to define the look and feel of the component. For example, if we want our TableWidget component to generate tables with the dark green header, we can define the styles of our component in the **TableWidget.razor.css** file.-->

我们在 Razor 类库中创建的每个可重用组件还可以有对应的样式表来定义组件的外观。例如，如果我们希望我们的 TableWidget 组件生成带有深绿色表头的表格，我们可以在 **TableWidget.razor.css** 文件中定义组件的样式。

<b>TableWidget.razor.css</b>

```css
.thead-green {
    background-color: darkgreen;
    color: white;
}
```

## 使用 Razor 类库中的 Razor 组件

<!--Now we have defined our TableWidget component in the class library project, it is now time to use this component in our Blazor project. Right-click on the **Dependencies** node in the solution explorer and choose **Add Project Reference…** option from the context menu. Select the **MyComponentsLibrary** project and click OK.-->

现在我们已经在类库项目中定义了我们的 TableWidget 组件，是时候在我们的 Blazor 项目中使用这个组件了。右键单击解决方案资源管理器中的 **依赖项（Dependencies）** 节点，然后从上下文菜单中选择 **添加项目引用...（Add Project Reference...）** 选项。选中 **MyComponentsLibrary** 项目并点击确定。

![Add-Razor-Class-Library-in-Blazor-Project](/assets/images/202109/Add-Razor-Class-Library-in-Blazor-Project.jpg)

<!--If you want to use the TableWidget component on multiple pages then it is recommended to add the reference of the library in **_Imports.razor** file.-->

如果您想在多个页面上使用 TableWidget 组件，那么推荐您在 **_Imports.razor** 文件中添加该类库的引用。

```csharp
@using MyComponentsLibrary
```

<!--Blazor project template generates a **FetchData.razor** page by default that displays weather forecast objects from a backend service. We can test our **TableWidget** component on this page. Open the **FetchData.razor** file and replace the HTML table with the **TableWidget** component as shown in the code snippet below.-->

Blazor 项目模板默认生成一个 **FetchData.razor** 页面，显示来自后端服务的天气预报对象。我们可以在此页面上测试我们的 **TableWidget** 组件。打开 **FetchData.razor** 文件，并使用 **TableWidget** 组件替换其中的 HTML 表格，如下面的代码片段所示。

<b>FetchData.razor</b>

```html
@page "/fetchdata"
 
@using BlazorClassLibraryDemo.Data
@inject WeatherForecastService ForecastService
 
<h1>Weather forecast</h1>
 
@if (forecasts == null)
{
    <p><em>Loading...</em></p>
}
else
{
    <TableWidget Items="forecasts" Context="forecast">
        <HeaderTemplate>
            <th>Date</th>
            <th>Temp. (C)</th>
            <th>Temp. (F)</th>
            <th>Summary</th>
        </HeaderTemplate>
        <RowTemplate>
            <td>@forecast.Date.ToShortDateString()</td>
            <td>@forecast.TemperatureC</td>
            <td>@forecast.TemperatureF</td>
            <td>@forecast.Summary</td>
        </RowTemplate>
    </TableWidget>
}
 
@code {
    private WeatherForecast[] forecasts;
 
    protected override async Task OnInitializedAsync()
    {
        forecasts = await ForecastService.GetForecastAsync(DateTime.Now);
    }
}
```

<!-- Run the project and you should see the weather forecast grid generated using our TableWidget component. You can now reuse the TableWidget component in multiple pages or projects and you will always see the same grid generated for you. -->

运行该项目，您会看到使用我们的 TableWidget 组件生成的天气预报表格。现在，您可以在多个页面或项目中重用该 TableWidget 组件，并且将会看到始终为您生成相同的表格。

![Blazor-Component-Rendered-from-Class-Library](/assets/images/202109/Blazor-Component-Rendered-from-Class-Library.jpg)

<!--Consuming Images from Razor Class Library-->

## 使用 Razor 类库中的图片

<!--Razor class libraries can expose static assets such as images and these assets can be consumed by the Blazor apps that consume the library. Let’s add an image **blazor_logo.jpg** in the **wwwroot/images** folder of our **MyComponentsLibrary** project. To use this image inside a Blazor component, add a component with the name **BlazorLogo.razor** in the **MyComponentsLibrary** project.-->

Razor 类库可以公开静态资源（比如图片），并且这些资源可以由使用该库的 Blazor 应用程序使用。让我们在 **MyComponentsLibrary** 项目的 **wwwroot/images** 文件夹中添加一个图片 **blazor_logo.jpg**。为了在 Blazor 组件中使用此图片，请在 **MyComponentsLibrary** 项目中添加一个名为 **BlazorLogo.razor** 的组件。

![Add-an-Image-in-Razor-Class-Library](/assets/images/202109/Add-an-Image-in-Razor-Class-Library.jpg)

<!--Add the **blazor_logo.jpg** image inside the **BlazorLogo.razor** component using the simple **img** tag.-->

使用简单的 **img** 标签将 **blazor_logo.jpg** 图片添加到 **BlazorLogo.razor** 组件中。

<b>BlazorLogo.razor</b>

```html
<img src="images/blazor_logo.jpg" alt="Blazor Logo"/>
```

<!--To use the *BlazorLogo.razor* components in the Blazor app, open the Index.razor page from the Blazor demo app we created above and directly use the BlazorLogo components as shown in the code snippet below.-->

要在 Blazor 应用程序中使用此 *BlazorLogo.razor* 组件，请从我们上面创建的 Blazor 示例应用中打开 *Index.razor* 页面，然后直接使用 BlazorLogo 组件，如下面的代码片段所示。

<b>Index.razor</b>

```html
<h1>Hello, Blazor!</h1>
 
<BlazorLogo></BlazorLogo>
```

<!--Run the project and you will notice that the image is not rendered as you expected. This is because the relative path of the image **images/blazor_logo.jpg** is not accessible from outside the class library project.-->

运行该项目，您会注意到图片并未如预期那样显示出来。这是因为无法从类库项目外访问图片的相对路径 **images/blazor_logo.jpg**。

![Fail-to-Access-Static-Contents-from-Razor-Class-Library](/assets/images/202109/Fail-to-Access-Static-Contents-from-Razor-Class-Library.jpg)

<!--To fix the above problem, you need to use a special path syntax given below:-->

要解决上述问题，您需要使用下面给出的特殊路径语法：

```html
_content/{Razor Class Library Name}/{Path to file}
```

<!--In the above syntax, the **{Razor Class Library Name}** is the placeholder for the class library name e.g. MyComponentsLibrary. The **{Path to file}** is the path to file under **wwwroot** folder.-->

在上面的语法中，**{Razor Class Library Name}** 是类库名称的占位符（例如 MyComponentsLibrary），**{Path to file}** 是 **wwwroot** 文件夹下的文件路径。

<!--Let’s fix our image path using the special syntax describe above-->

让我们使用上面描述的特殊语法来修复我们的图片路径。

<b>BlazorLogo.razor</b>

```html
<img src="_content/MyComponentsLibrary/images/blazor_logo.jpg" alt="Blazor Logo"/>
```

<!--Run the project again and this time you will notice that the image is rendered as expected.-->

再次运行项目，这次您会注意到图片按预期显示了。

![Correct-Way-to-Access-Static-Contents-from-Razor-Class-Library](/assets/images/202109/Correct-Way-to-Access-Static-Contents-from-Razor-Class-Library.jpg)

<!--We can also access the images from Razor class libraries directly using the above special syntax. For example, the code snippet below will display images from the Razor class library using the **BlazorLogo** component as well as using the **img** tag. Notice the same special syntax is used with **img** tag in the Blazor app to access the image available in **MyComponentsLibrary**-->

我们还可以使用上述特殊语法直接访问 Razor 类库中的图片。例如，下面的代码片段将使用 **BlazorLogo** 组件以及 **img** 标签显示 Razor 类库中的图片。请注意，Blazor 应用中的 **img** 标签使用相同的特殊语法来访问 **MyComponentsLibrary** 中的图片。

<b>Index.razor</b>

```html
<h1>Hello, Blazor!</h1>
 
<h4>Showing Image from a Component available inside Class Library</h4>
 
<BlazorLogo></BlazorLogo>
 
<h4>Showing Image directly from Class Library</h4>
 
<img src="_content/MyComponentsLibrary/images/blazor_logo.jpg" alt="Blazor Logo" />
```

<!--Run the project once again and this time you should see the same image rendered twice using both approaches.-->

再次运行该项目，这次您应该会看到相同的图片使用了两种不同的方式显示两次。

![Different-Ways-to-Access-Static-Contents-from-Razor-Class-Library](/assets/images/202109/Different-Ways-to-Access-Static-Contents-from-Razor-Class-Library.jpg)

## 使用 Razor 类库中样式表

<!--We can also add stylesheets in Razor class libraries and the styles defined in those stylesheets can be used by Blazor apps. Let’s add a stylesheet **components.css** inside **wwwroot/css** folder-->

我们还可以在 Razor 类库中添加样式表，并且 Blazor 应用程序可以使用这些样式表中定义的样式。 让我们在 **wwwroot/css** 文件夹中添加一个样式表 **components.css**。

![Add-Stylesheet-in-Razor-Class-Library](/assets/images/202109/Add-Stylesheet-in-Razor-Class-Library.jpg)

<!--For the demonstration purpose, let’s add some styles related to **img** tag-->

出于演示目的，让我们添加一些与 **img** 标签相关的样式。

<b>components.css</b>

```css
img
{
    background-color: lightgreen;
    padding: 5px;
    border: 1px solid black;
}
```

<!--To include the **components.css** file in our Blazor app, we can use the same special syntax we saw above. Open the **_Host.cshtml** file available in our Blazor server app and include the **components.css** file inside the **head** tag using the following **link** tag.-->

要在我们的 Blazor 应用程序中包含 **components.css** 文件，我们可以使用与上面看到的相同的特殊语法。 打开 Blazor Server 应用程序中的 **_Host.cshtml** 文件，并使用以下 **link** 标签将 **components.css** 文件包含在 **head** 标签内。

<b>_Host.cshtml</b>

```html
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    ...
     
    <link href="~/_content/MyComponentsLibrary/css/components.css" rel="stylesheet" />
</head>
```

<!--Run the project and you will notice that the styles related to **img** tag we defined in the **components.css** file are applied to all the images of the projects.-->

运行项目，您会发现我们在 **components.css** 文件中定义的与 **img** 标签相关的样式被应用到了项目中的所有图片上。

![Apply-CSS-Styles-from-Razor-Class-Library](/assets/images/202109/Apply-CSS-Styles-from-Razor-Class-Library.jpg)

## 总结

<!--I have covered very basic examples of reusable components in this post but you can see the power of the Razor class library. Developers can create some cool and amazing libraries of reusable Blazor components that can not only add some advanced features to your project but also increase the development speed. Many component vendors already developed some open source and commercial libraries such as MatBlazor, Radzen, Syncfusion, etc.-->

我在本文中介绍了可重用组件的非常基础的示例，但您可以借此领会到 Razor 类库的强大功能。开发者可以创建一些又酷又炫的可重用 Blazor 组件库，这些库不仅可以为您的项目添加一些高级功能，还可以提升开发速度。许多组件供应商已经开发了一些开源和商业库，例如 [MatBlazor](https://www.matblazor.com/)[^Mat]、[Radzen](https://blazor.radzen.com/)[^Rad]、[Syncfusion](https://www.syncfusion.com/blazor-components)[^Syn] 等。

[^Mat]: <https://www.matblazor.com/>
[^Rad]: <https://blazor.radzen.com/>
[^Syn]: <https://www.syncfusion.com/blazor-components>
