---
layout: post
title:  "Blazor 数据绑定开发指南"
date:   2021-07-19 00:10:10 +0800
categories: dotnet csharp
tags: [DotNet, Blazor]
published: true
---

> 翻译自 Waqas Anwar 2021年3月21日的文章 [《A Developer’s Guide to Blazor Data Binding》](https://www.ezzylearning.net/tutorial/a-developers-guide-to-blazor-data-binding) [^1]

[^1]: <https://www.ezzylearning.net/tutorial/a-developers-guide-to-blazor-data-binding> A Developer’s Guide to Blazor Data Binding

![A-Developer-Guide-to-Blazor-Data-Binding](/assets/images/202107/A-Developer-Guide-to-Blazor-Data-Binding-1.png)

<!-- Most web apps these days either display some sort of data on pages or they collect data from users using forms. This means every SPA framework must need to support data binding so that developers can bind data with elements such as labels, form controls, etc. Blazor components have built-in support of data binding and they support both one-way and two-way data binding using multiple techniques. In this tutorial, I will cover the fundamentals of Blazor data binding features with a simple card designer example where the user will be able to see his card design updated in real-time. -->

现如今，大多数 Web 应用程序要么是在页面上显示某种数据，要么是使用表单从用户那里收集数据。这意味着每个 SPA 框架都必须支持数据绑定，以便开发者可以将数据与 `label`、`form` 控件等元素进行绑定。Blazor 组件内置了对数据绑定的支持，还使用了多种技术来同时支持单向和双向数据绑定。在本教程中，我将通过一个简单的卡片设计器示例来介绍 Blazor 数据绑定功能的基础知识，在该示例中，用户能够查看其卡片设计的实时更新情况。

[下载源码](https://github.com/ezzylearning/BlazorDataBindingDemo)[^source]

[^source]: <https://github.com/ezzylearning/BlazorDataBindingDemo> 下载源码

## 单向绑定

<!-- In one-way data binding, the data flows in one direction. The application code updates the value in response to some event or user action and when the value is updated, the corresponding UI is updated dynamically. In one-way data binding, the user is not allowed to change the value directly. In Blazor, we typically use @ symbol followed by the property, field, or even a method to implement one-way data binding. For example, if you have a Title property in your code and you want to bind it with an h1 element then you can write code similar to the following snippet. -->

在单向数据绑定中，数据沿一个方向传递。应用程序代码更新值以响应某些事件或用户操作，当值更新时，相应的 UI 也会动态更新。单向数据绑定中，不允许用户直接更改值。在 Blazor 中，我们通常使用 `@` 符号后跟属性、字段，甚至是一个方法来实现单向数据绑定。例如，如果您的代码中有一个 **Title** 属性，并且您想将它与一个 **h1** 元素绑定，那么您可以编写类似以下代码段的代码。

```html
<h1>@TItle</h1>
```

<!-- Now to update the **Title** in the code you can use a simple button **onclick** event that can call a method **UpdateTitle** in the code to update the value of the **Title** property. As soon as, the user will click the button, the **h1** element text will update automatically because the updated value will automatically flow from the code to the user interface. -->

现在，要更新上述代码中的 **Title**，您可以使用一个简单的按钮 **onclick** 事件，调用代码中的 **UpdateTitle** 方法来更新 **Title** 属性的值。因为一旦用户点击按钮，更新的值便自动从代码传递到用户界面，所以 **h1** 元素的文本将会自动更新。

```html
<button @onclick="UpdateTitle">Update Title</button>
 
@code{
    public string Title { get; set; } = "Hello";
 
    private void UpdateTitle()
    {
        Title = "Hello, Blazor!";
    }
}
```

## 双向绑定

<!-- In two-way data binding data flows in both directions. Typically user updates the value in some form on the front-end and the value is automatically updated in the code at the back-end, then this updated value flows to UI and updates all elements bind to that value. In Blazor, two-way data binding can be achieved using the **@bind** attribute which can be used in several ways. The following simple example demonstrates the basic usage of the **@bind** attribute where we are using **@bind=Property** syntax to bind **Title** property with an input element. -->

在双向数据绑定中，数据是双向流动的。通常，用户在前端以某种形式更新某个值，该值在后端代码中自动更新，然后这个新值再传递到 UI 并更新绑定到该值的所有元素。在 Blazor 中，可以使用 **@bind** 特性实现双向数据绑定，该特性能够以多种方式使用。下面的简单示例演示了 **@bind** 特性的基本用法，在这个示例中我们使用 **@bind=Property** 语法将 **Title** 属性与 `input` 元素进行绑定。

```html
<h1>@Title</h1>
 
<input @bind="Title" />
 
@code {
    public string Title { get; set; } = "Blazor";
}
```

<!-- We can also bind a certain property to a specific event so that the property value only updates when that particular event occurs. The syntax of binding to a specific event is @bind:event=”EVENT NAME”. For example, in the following code snippet, I only want to change the Title property if the user moves the focus away from the input field. -->

我们还可以将某一属性绑定到特定的事件，以便仅在特定的事件触发时才更新该属性的值。绑定到特定事件的语法是 **@bind:event="EVENT NAME"**。例如，在下面的代码段中，我希望仅在用户将焦点从输入框移开时才改变 Title 属性。

```html
<h1>@Title</h1>
 
<input @bind="Title" @bind:event="onchange" />
 
@code {
    public string Title { get; set; } = "Blazor";
}
```

<!-- We now have a basic knowledge of Blazor data binding so, in the remaining tutorial, I will show you some real-world examples of using data binding. Before we start, please make sure that you are familiar with creating and using Blazor components. If you don’t know how to create a Blazor app or component, I will recommend you to read my previous post A Beginner’s Guide to Blazor Components. -->

现在我们已经掌握了 Blazor 数据绑定的基础知识，那么，在接下来的教程中，我将向您展示一些使用数据绑定的真实示例。在我们开始之前，请确保您已熟悉了创建和使用 Blazor 组件。如果您不了解如何创建 Blazor 应用程序或组件，我建议您阅读我之前的文章 [Blazor 组件入门指南](https://ittranslator.cn/dotnet/csharp/2021/07/12/a-beginners-guide-to-blazor-components.html)。

## 入门实例

<!-- Create a Blazor Server app in Visual Studio 2019 and add a new Blazor component **CardDesigner.razor** in the **Pages** folder. We want to build a simple card designer page that will allow the user to design and preview the card at the same time. Let’s add the following HTML markup in the razor view of our newly created component. -->

在 Visual Studio 2019 中创建一个 Blazor Server 应用，并在 **Pages** 文件夹中添加一个新的 Blazor 组件 **CardDesigner.razor**。 我们想要构建一个简单的卡片设计器页面，允许用户同时设计和预览卡片。 让我们在新建组件的 razor 视图中添加以下 HTML 标记。

<b>CardDesigner.razor</b>

```html
@page "/"
 
<h1>Card Designer (Blazor Data Binding)</h1> 
 
<div class="container">
    <div class="row">
        <div class="col-8">
            <h3>Design</h3>
            <form>
                <div class="form-group">
                    <label for="Heading">Heading</label>
                    <input type="text" class="form-control" id="Heading">
                </div>
                <div class="form-group">
                    <label for="Description">Description</label>
                    <textarea class="form-control" id="Description" rows="4"></textarea>
                </div>              
                <button class="btn btn-secondary mb-2">Reset</button>
            </form>
        </div>
        <div class="col-4">
            <h3>Preview</h3>
            <div class="card bg-light w-100">
                <div class="card-header">
                    Heading
                </div>
                <div class="card-body">
                    <p class="card-text">
                        Description
                    </p>
                </div> 
            </div>
        </div>
    </div>
</div>
```

<!-- You also need to add some basic CSS styles to **wwwroot/css/site.css** file to make sure our card designer looks pleasing to the eyes. -->

为了确保我们的卡片设计器看起来赏心悦目，您还需要在 **wwwroot/css/site.css** 文件中添加一些基本的 CSS 样式。

<b>site.css</b>

```css
.container {
    margin: 15px;
    padding: 0px;
}
.col-8, .col-4 {
    border: 1px solid #dadada;
    padding: 10px;
}
h1 {
    font-size: 22px;
    font-weight: bold;
    margin-bottom: 30px;
    margin-top: 20px;
}
h3 {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 25px;
}
```

<!-- Run the app and you should be able to see a page similar to the following. The left-hand side is the Design section that will allow the user to set the **Heading** and **Description** of the card and on the right-hand side, we are showing the card preview. There is also a **Reset** button that will reset the form to default values. -->

运行该应用程序，您应该能看到类似以下内容的页面。左手边是设计部分，允许用户设置卡片的 **Heading** 和 **Description**，右手边显示卡片预览。还有一个 **Reset** 按钮，可以将表单重置为默认值。

![Blazor-Data-Binding-Demo-Form](/assets/images/202107/Blazor-Data-Binding-Demo-Form.png)

<!-- Let’s create a separate code-behind partial class for the implementation logic of our card designer. The class has two simple properties **Heading** and **Description** with some default values. There is also a method **ResetCard** that we will call when the user will click the **Reset** button and this method will reset both properties to their default values. -->

让我们为卡片设计器的实现逻辑创建一个单独的代码隐藏部分类(partial class)。该类有两个简单的带有默认值的属性 **Heading** 和 **Description**。还有一个 **ResetCard** 方法，当用户点击 **Reset** 按钮时会调用此方法，将两个属性重置为其默认值。

<b>CardDesigner.razor.cs</b>

```csharp
public partial class CardDesigner
{
    public string Heading { get; set; } = "Heading";
    public string Description { get; set; } = "Description";
 
    public void ResetCard(MouseEventArgs e)
    {
        Heading = "Heading";
        Description = "Description";
    }
}
```

<!-- We are now ready to see Blazor data binding capabilities in action. Let’s start with one-way data binding first. Let’s update the above `<form>` code slightly and add one-way binding using @ symbol with the property names. I am binding the **value** attribute of **input** and **textarea** elements with the **Heading** and **Description** properties and then I added the **@onchange** event to change the **Heading** property using the Lambda expression syntax. I also attached the **ResetCard** method with the **onclick** event of the Reset button. -->

### 单向绑定实例

现在，我们已为查看 Blazor 数据绑定功能的实际应用做好了准备。让我们先从单向数据绑定开始。稍微更新一下上面的 `<form>` 代码，并使用 `@` 符号和属性名添加单向绑定。我将 `input` 和 `textarea` 元素的 **value** 特性(attribute)绑定到 **Heading** 和 **Description** 属性(property)，然后添加 **@onchange** 事件，使用 Lambda 表达式语法更改 **Heading** 属性。还将 **ResetCard** 方法附加到了 Reset 按钮的 **onclick** 事件。

<b>CardDesigner.razor</b>

```html
<form>
   <div class="form-group">
      <label for="Heading">Heading</label>
      <input type="text" class="form-control" id="Heading" value="@Heading"
         @onchange="@(e => { Heading = e.Value.ToString(); })">
   </div>
   <div class="form-group">
      <label for="Description">Description</label>
      <textarea class="form-control" id="Description" rows="4"
         @onchange="@(e => { Description = e.Value.ToString(); })" value="@Description"></textarea>
   </div>
   <button type="button" class="btn btn-secondary mb-2" @onclick="ResetCard">Reset</button>
</form>
```

<!-- We also need to update our Preview section card with one-way data binding so that every time the **Heading** or **Description** updates in the code the Preview section automatically renders the updated values on the card. -->

我们还需要使用单向数据绑定更新预览部分的卡片，以便每次代码中的 **Heading** 或 **Description** 更新时，预览部分都会自动在卡片上渲染更新后的值。

<b>CardDesigner.razor</b>

```html
<div class="card text-white w-100 @SelectedStyleCssClass">
   <div class="card-header">
      @Heading
   </div>
   <div class="card-body">
      <p class="card-text">
         @Description
      </p>
   </div>
</div>
```

<!-- If you will run your application now, you will see an output similar to the following. Try to input some heading and description in the Design area and you will notice that as soon as you will leave the focus or move away from the input field, the Preview area will update automatically on the fly. -->

现在，如果您运行应用程序，您将会看到类似于下面的输出。尝试在设计区输入标题和描述，您会注意到，当您将焦点从输入框移开时，预览区会立即自动更新。

![Blazor-One-Way-Data-Binding-using-Expressions](/assets/images/202107/Blazor-One-Way-Data-Binding-using-Expressions.png)

<!-- If you are not a fan of using Lambda expressions in HTML, you can also define **UpdateHeading** and **UpdateDescription** methods in your code and then these methods can be associated with **@onchange** events. -->

如果您不喜欢在 HTML 中使用 Lambda 表达式，您还可以在代码中定义 **UpdateHeading** 和 **UpdateDescription** 方法，然后将这些方法与 **@onchange** 事件关联起来。

<b>CardDesigner.razor</b>

```html
<form>
   <div class="form-group">
      <label for="Heading">Heading</label>
      <input type="text" class="form-control" id="Heading" value="@Heading"
         @onchange="UpdateHeading">
   </div>
   <div class="form-group">
      <label for="Description">Description</label>
      <textarea class="form-control" id="Description" rows="4"
         value="@Description"
         @onchange="UpdateDescription"></textarea>
   </div>
   <button type="button" class="btn btn-secondary mb-2" @onclick="ResetCard">Reset</button>
</form>
```

<b>CardDesigner.razor.cs</b>

```csharp
public partial class CardDesigner
{
    public string Heading { get; set; } = "Heading";
    public string Description { get; set; } = "Description";
 
    public void ResetCard(MouseEventArgs args)
    {
        Heading = "Heading";
        Description = "Description";
    }
 
    public void UpdateHeading(ChangeEventArgs e)
    {
        Heading = e.Value.ToString();
    }
 
    public void UpdateDescription(ChangeEventArgs e)
    {
        Description = e.Value.ToString();
    }
}
```

<!-- So far, we are only using one-way binding in our application because the value of **Heading** and **Description** properties are updating inside our code and our code only executes if the user leaves focus from the form controls. Let’s update the code of our example and see how we can use two-way data binding with our example. Use the **@bind** attribute to bind the **Heading** and **Description** properties with the form controls. I also want the card Preview to be updated instantly as soon as the user starts typing in the form controls. To achieve this, add **@bind:event="oninput"** to the input and textarea controls. -->

### 双向绑定实例

截至目前，我们仅在应用程序中使用了单向绑定，因为 **Heading** 和 **Description** 属性的值是在我们的代码中更新的，而且我们的代码只在用户将焦点从表单控件移开时才执行。让我们更新一下示例的代码，看看如何在该示例中使用双向数据绑定。使用 **@bind** 特性将 **Heading** 和 **Description** 属性与表单控件绑定。我还希望当用户开始在表单控件中打字时立即更新卡片预览。为此，请将 **@bind:event="oninput"** 添加到了 `input` 和 `textarea` 控件。

<b>CardDesigner.razor</b>

```html
<form>
   <div class="form-group">
      <label for="Heading">Heading</label>
      <input type="text" class="form-control" id="Heading" @bind="Heading" @bind:event="oninput">
   </div>
   <div class="form-group">
      <label for="Description">Description</label>
      <textarea class="form-control" id="Description" rows="4" @bind="Description" @bind:event="oninput"></textarea>
   </div>
   <button type="button" class="btn btn-secondary mb-2" @onclick="ResetCard">Reset</button>
</form>
```

<!-- Now the two-way binding is in place so we don’t need to manually update the properties so we can remove the **UpdateHeading** and **UpdateDescription** methods from the code. -->

现在，双向绑定已经设置好了，因此我们不再需要手动更新属性，这样我们就可以将 **UpdateHeading** 和 **UpdateDescription** 方法从代码中删除。

<b>CardDesigner.razor.cs</b>

```csharp
public partial class CardDesigner
{
    public string Heading { get; set; } = "Heading";
    public string Description { get; set; } = "Description";
 
    public void ResetCard(MouseEventArgs args)
    {
        Heading = "Heading";
        Description = "Description";
    }
}
```

<!-- Run the app again and input the heading and description in the Design form and see how the card preview is updating automatically. -->

再次运行应用程序并在设计表单中输入标题和描述，看下卡片预览是如何自动更新的。

![Blazor-Two-Way-Data-Binding](/assets/images/202107/Blazor-Two-Way-Data-Binding.png)

<!-- Let’s extend our example further and introduce a dropdown control in the Design area. This dropdown will display different card styles and the user will be able to select and apply any card style instantly using two-way data binding. Let’s add the following **StyleInfo** class in the **Data** folder. -->

让我们进一步扩展我们的示例，在设计区引入一个下拉列表控件。该下拉列表将显示不同的卡片样式，用户能够使用双向数据绑定即时地选择和应用任一卡片样式。让我们在 **Data** 文件夹中添加以下 **StyleInfo** 类。

<b>StyleInfo.cs</b>

```csharp
public class StyleInfo
{
    public string Name { get; set; }
    public string CssClass { get; set; }
}
```

<!-- Let’s add two more properties in our CardDesigner.razor.cs file to store the list of available card styles and to store the reference of the selected style. We are initializing the **Styles** property in one of the component initialization methods named **OnInitialized**. The **OnInitialized** method is invoked when the component is initialized after having received its initial parameters from its parent component. -->

让我们在 *CardDesigner.razor.cs* 文件中再添加两个属性来存储可用卡片样式的列表，并存储所选样式的引用。我们在名为 **OnInitialized** 的组件初始化方法中初始化 **Styles** 属性。在从父组件接收到初始化参数后，组件会进行初始化，初始化完成时将调用 **OnInitialized** 方法。

<b>CardDesigner.razor.cs</b>

```csharp
public partial class CardDesigner
{
    public string Heading { get; set; } = "Heading";
    public string Description { get; set; } = "Description";
    public List<StyleInfo> Styles { get; set; }
    public string SelectedStyleCssClass { get; set; }
 
    protected override void OnInitialized()
    {
        Styles = new List<StyleInfo>()
        {
            new StyleInfo() { Name = "Primary", CssClass = "bg-primary" },
            new StyleInfo() { Name = "Secondary", CssClass = "bg-secondary" },
            new StyleInfo() { Name = "Success", CssClass = "bg-success" } 
        };
 
        SelectedStyleCssClass = "bg-primary";
    }
 
    public void ResetCard(MouseEventArgs args)
    {
        Heading = "Heading";
        Description = "Description";
    }
}
```

<!-- Finally, we need to add an HTML select element in our CardDesigner.razor file. We are running a simple **@foreach** loop to iterate over the Styles property and creating `<option>` element inside the loop. The value attribute of the `<option>` element will render the **CssClass** property value and the text of each `<option>` element will render using the **Name** property. -->

最后，我们需要在 *CardDesigner.razor* 文件中添加一个 HTML `select` 元素。我们运行一个简单的 **@foreach** 循环来迭代 **Styles** 属性，并在循环中创建 `<option>` 元素。每个 `<option>` 元素的 **value** 特性使用 **CssClass** 属性值呈现，每个 `<option>` 元素的文本使用 **Name** 属性值呈现。

<b>CardDesigner.razor</b>

```html
<div class="form-group">
   <label for="Style">Style</label>
   <select class="form-control" id="Style" @bind="SelectedStyleCssClass" @bind:event="onchange">
      @foreach (var style in Styles)
      {
      <option value="@style.CssClass">@style.Name</option>
      }
   </select>
</div>
```

<!-- In the above code snippet, we are binding the **SelectedStyleCssClass** property with the select element using the **@bind** attribute and we have decided to use the **onchange** event with select so that every time the user selects an option from the dropdown the card style update automatically. -->

在上面的代码片段中，我们使用 **@bind** 特性将 **SelectedStyleCssClass** 属性与 `select` 元素绑定，并指定使用 `select` 的 **onchange** 事件，以便每次用户从下拉列表中选择一个选项时，卡片样式自动更新。

<!-- If you will run the project now you will see the styles populated in the dropdown and a selected style is also applied to the card in the Preview section. -->

现在，如果您运行项目，将会看到下拉列表中填充的样式，并且选中的样式会应用到预览部分的卡片。

![Blazor-Data-Binding-with-Select](/assets/images/202107/Blazor-Data-Binding-with-Select.png)

<!-- Right-click on the select element and choose **Inspect** menu option to see how the options are rendered in the HTML and how the **value** of each **option** contains the **CssClass** property we initialized in our code. -->

右键点击 `select` 元素并选择 **检查(Inspect)** 菜单选项，可以查看 `option` 是如何渲染在 HTML 中的，以及每个 `option` 的 **value** 是如何包含我们在代码中初始化的 **CssClass** 属性的。

![Bind-Select-with-Custom-Class-in-Blazor](/assets/images/202107/Bind-Select-with-Custom-Class-in-Blazor.png)

<!-- Try to select different styles from the dropdown and the card preview will update instantly. -->

试试从下拉列表中选择不同的样式，卡片预览会立即更新。

![Blazor-Two-Way-Data-Binding-Demo](/assets/images/202107/Blazor-Two-Way-Data-Binding-Demo.png)

## 总结

<!-- In this tutorial, I covered the basics of Blazor data binding. We have learned how to use both one-way and two-data binding features and how to update values using data binding. We also learned how to use different events to specify when the value should be updated. There are some more advanced data binding concepts available in Blazor and I will try my best to write few more posts on this topic soon. -->

在本教程中，我介绍了 Blazor 数据绑定的基础知识。我们学习了如何使用单向和双向数据绑定功能，以及如何使用数据绑定更新值。我们还学习了如何利用不同的事件来指定何时更新值。在 Blazor 中还有一些更高级的数据绑定概念，我将尽最大的努力就这个主题再写几篇文章。

<br/>

相关阅读：

- [Blazor Server 和 WebAssembly 应用程序入门指南](https://ittranslator.cn/dotnet/csharp/2021/07/05/a-beginners-guide-to-blazor-server-and-webassembly-applications.html)
- [Blazor 组件入门指南](https://ittranslator.cn/dotnet/csharp/2021/07/12/a-beginners-guide-to-blazor-components.html)
- [Blazor 数据绑定开发指南](https://ittranslator.cn/dotnet/csharp/2021/07/19/a-developers-guide-to-blazor-data-binding.html)
- [Blazor 事件处理开发指南](https://ittranslator.cn/dotnet/csharp/2021/07/26/a-developers-guide-to-blazor-event-handling.html)
- [Blazor 组件之间使用 EventCallback 进行通信](https://ittranslator.cn/dotnet/csharp/2021/08/02/communication-between-blazor-components-using-eventcallback.html)
- [Blazor 路由及导航开发指南](https://ittranslator.cn/dotnet/csharp/2021/08/09/a-developers-guide-to-blazor-routing-and-navigation.html)
- [Blazor 模板化组件开发指南](https://ittranslator.cn/dotnet/csharp/2021/08/16/a-developers-guide-to-blazor-templated-components.html)
- [Blazor Server 应用程序中进行 HTTP 请求](https://ittranslator.cn/dotnet/csharp/2021/08/23/making-http-requests-in-blazor-server-apps.html)
- [Blazor WebAssembly 应用程序中进行 HTTP 请求](https://ittranslator.cn/dotnet/csharp/2021/08/30/making-http-requests-in-blazor-webassembly-apps.html)
- [Blazor 组件库开发指南](https://ittranslator.cn/dotnet/csharp/2021/09/06/a-developers-guide-to-blazor-component-libraries.html)

> 作者 ： Waqas Anwar  
> 翻译 ： [技术译站](https://ittranslator.cn/)  
> 链接 ： [英文原文](https://www.ezzylearning.net/tutorial/a-developers-guide-to-blazor-data-binding)
