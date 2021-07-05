---
layout: post
title:  "Blazor 组件入门指南"
date:   2021-07-05 00:10:10 +0800
categories: dotnet csharp
published: true
---

> 翻译自 Waqas Anwar 2021年3月12日的文章 [《A Beginner’s Guide To Blazor Server and WebAssembly Applications》](https://www.ezzylearning.net/tutorial/a-beginners-guide-to-blazor-components) [^1]

[^1]: <https://www.ezzylearning.net/tutorial/a-beginners-guide-to-blazor-components> A Beginner’s Guide to Blazor Components

![A-Beginners-Guide-to-Blazor-Components](https://www.ezzylearning.net/wp-content/uploads/A-Beginners-Guide-to-Blazor-Components.png)

<!-- Blazor apps are the combination of components that are not only responsible for presenting the user interface but also work together to facilitate user interaction. They are the main building block of Blazor apps and most of the Blazor features revolves around components. In this tutorial, I will give you a detailed overview of components and will show you different techniques for creating and using components in Blazor Apps. -->

Blazor 应用程序是组件的组合，这些组件不仅负责呈现用户界面，还协同工作以促进用户交互。它们是 Blazor 应用程序的主要构建块，大多数 Blazor 功能都围绕组件展开。在本教程中，我将向您详细介绍组件，并向你展示在 Blazor 应用程序中创建和使用组件的不同技术。

[Download Source Code](https://github.com/ezzylearning/BlazorComponentsDemo)

## Blazor 组件概述

<!-- A Blazor component is a self-contained part of the UI such as a page, a sidebar menu, a contact form or a dashboard widget, etc. It includes the HTML markup to render the UI and the C# code to process the data or to handle the user events. Components can be nested in one another and they can also be reused within the project or even across multiple projects. Blazor components are implemented as Razor components and that’s why they use Razor syntax and also have **.razor** file extension. -->

Blazor 组件是一个 UI 的自包含部分，例如一个页面、一个侧边栏菜单、一个联系人表单或仪表板小工具等。它包括用于呈现 UI 的 HTML 标签和用于处理数据或处理用户事件的 C# 代码。组件可以相互嵌套，也可以在项目中重用，甚至可以跨多个项目重用。Blazor 组件是作为 Razor 组件实现的，这就是它们使用 Razor 语法并具有 **.razor** 文件扩展名的原因。

![Blazor-Component](https://www.ezzylearning.net/wp-content/uploads/Blazor-Component.png)

<!-- To understand how Blazor components are structured and how they work, let’s review the Counter.razor component which is automatically generated for us if you are using the Blazor App template in Visual Studio 2019. Here is the full code of Counter.razor. -->

为了理解 Blazor 组件的结构及其工作方式，让我们回顾一下 **Counter.razor** 组件（如果您在 Visual Studio 2019 中使用 Blazor App 模板，它会自动为我们生成）。下面是 Counter.razor 的完整代码。

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

The first line in the file is using the Razor **@page** directive and this line specifies the component route. It means that the Counter component is a page-level or routable component and it can be accessed in the browser using the **/counter** path at the end of the URL. If we don’t specify the @page directive, then the component will become a child component and it can be used by embedding it in other components.

文件中的第一行使用了 Razor **@page** 指令来指定组件的路由。这意味着 Counter 组件是页面级或可路由组件，可以在浏览器中使用 URL 末尾的 **/counter** 路径来访问它。如果我们不指定 @page 指令，则该组件将变为子组件，可以通过将其嵌套到其他组件来使用它。

```csharp
@page "/counter"
```

<!-- We are also allowed to declare multiple @page level directives as shown below. This will allow us to access the component using two URLs. -->

如下所示，我们还可以声明多个 @page 级别的指令。这将允许我们使用两个 URL 访问组件。

```csharp
@page "/counter"
@page "/mycounter"
```

After the **@page** directive, we have HTML markup that specifies the UI of the component. This markup can render HTML dynamically using expressions, conditions, or loops using a razor syntax. In case of above Counter component, the UI has a heading (h1), a paragraph (p), and a button element. The paragraph element is using a razor syntax to output the value of **currentCount** variable defined in the C# code block.

在 **@page** 指令之后，是用于指定该组件 UI 的 HTML 标记。此标记可以使用 Razor 语法，使用表达式、条件或循环来动态地呈现 HTML。在上述的 Counter 组件示例中，其 UI 包含一个标题 (h1)、一个段落 (p) 和一个按钮元素。该段落元素使用 Razor 语法来输出 C# 代码块中定义的 **currentCount** 变量的值。

```html
<p>Current count: @currentCount</p>
```

<!-- The button element is responding to the user click action by calling a method IncrementCount which is also defined in the code block. -->

按钮元素通过调用方法 **IncrementCount** 来响应用户单击操作，该方法也在代码块中定义。

```html
<button class="btn btn-primary" @onclick="IncrementCount">Click me</button>
```

<!-- Finally, we have a code block where we are simply incrementing the value of **currentCount** variable by 1 every time the **IncrementCount** method is called. -->

最后，我们有一个代码块，每次调用 **IncrementCount** 方法时，我们简单地将 **currentCount** 变量的值加 1。

```csharp
@code {
    private int currentCount = 0;
 
    private void IncrementCount()
    {
        currentCount++;
    }
}
```

<!-- When a Blazor app will compile, the HTML markup and the C# code will convert into a component class whose name will match with the name of the file. The members of this class will be the same variables and methods we defined in the **@code** block. We are allowed to use more than one **@code** block and all these code blocks will merge into one component class after compilation. -->

当 Blazor 应用程序编译时，HTML 标记和 C# 代码将转换为一个组件类，其名称与文件名称相对应。该类的成员将是我们在 **@code** 中定义的相同的变量和方法。允许使用多个 **@code** 块，所有这些代码块在编译后会合并成一个组件类。

## 在 Visual Studio 2019 中创建 Blazor 组件

If you want to create a page-level component, then right-click on the Pages folder and choose Add > Razor Component… menu option.

如果您要创建页面级组件，请右键单击 **Pages** 文件夹并选择 **添加 > Razor 组件...** 菜单选项。

![Add-New-Blazor-Component-in-Visual-Studio-2019](https://www.ezzylearning.net/wp-content/uploads/Add-New-Blazor-Component-in-Visual-Studio-2019.png)

You can also right-click on the project name in solution explorer and create a component using the Razor Component template.

您也可以在解决方案资源管理器中右键单击项目名称，然后使用 **Razor Component** 模板创建一个组件。

![Add-New-Item-Dialog-Add-Blazor-Component-in-Visual-Studio-2019](https://www.ezzylearning.net/wp-content/uploads/Add-New-Item-Dialog-Add-Blazor-Component-in-Visual-Studio-2019.png)

Let’s create a component with the file name Calculator.razor and add the following code to it.

让我们创建一个文件名为 **Calculator.razor** 的组件，并添加以下代码。

<b>Calculator.razor</b>

```html
@page "/calculator"
 
<h3>Calculator</h3>
 
<div class="form-group">
    <label for="number1">Number 1</label>
    <input type="number" class="form-control" id="number1" @bind="number1">
</div>
<div class="form-group">
    <label for="number2">Number 2</label>
    <input type="number" class="form-control" id="number2"  @bind="number2">
</div>
<div class="form-group">
    <label><b>Total: </b>@total</label> 
</div>
 
<button class="btn btn-primary" @onclick="Calculate">Calculate</button>
 
@code {
    private int number1 = 0;
    private int number2 = 0;
    private int total = 0;
 
    private void Calculate()
    {
        total = number1 + number2;
    }
}
```

The **@code** block has three private variables and a **Calculate** method. The Calculate method simply saves the sum of **number1** and **number2**  in the **total** variable.

此 **@code** 块具有三个私有变量和一个 **Calculate** 方法。Calculate 方法简单地将 **number1** 和 **number2** 的和保存在 **total** 变量中。

<!-- The HTML markup has two input fields which are using **@bind** attribute to bind the **number1** and **number2** variables -->

HTML 标记有两个输入字段，它们使用 **@bind** 属性来绑定 **number1** 和 **number2** 变量：

```html
<input type="number" class="form-control" id="number1" @bind="number1">
```

<!-- The **total** variable value will render on the page using razor syntax **@total** -->

**total** 变量的值将使用 Razor 语法 **@total** 在页面上呈现：

```html
<label><b>Total: </b>@total</label> 
```

Finally, we have a button element that binds the **Calculate** method with the **@onclick** event. Whenever the user will click the button, the Calculate method will be called and the value of the **total** variable will update on the page.

最后，是一个按钮元素，它将 **Calculate** 方法绑定到 **@onclick** 事件。每当用户点击按钮时，将会调用 Calculate 方法，页面上的 **total** 变量的值将更新。

```html
<button class="btn btn-primary" @onclick="Calculate">Calculate</button>
```

To make your Calculator component easily accessible, you can add your Calculator component in the application sidebar by adding the following markup in **NavMenu.razor** component.

为了使您的 Calculator 组件易于访问，您可以通过在 **NavMenu.razor** 组件中添加以下标记，在应用程序侧边栏中添加 Calculator 组件。

```html
<li class="nav-item px-3">
   <NavLink class="nav-link" href="calculator">
      <span class="oi oi-calculator" aria-hidden="true"></span> Calculator
   </NavLink>
</li>
```

Press `F5` to run your application and you should be able to see a page like the following. Try to input some numbers in the fields and you should be able to see the sum of the numbers displayed on the page. Pressing the **Calculate** button runs the server-side C# code but there is no browser postback or page refresh. Everything feels smooth and fast like you are doing calculations within the browser using some JavaScript.

按 `F5` 运行您的应用程序，您应该会看到如下所示的页面。尝试在输入框中输入一些数字，您应该能够看到页面上显示的数字之和。点击 **Calculate** 按钮运行了服务端 C# 代码，但并没有浏览器回传或页面刷新。一切都感觉那么流畅和快速，就像您在浏览器中使用 JavaScript 进行计算一样。

![Blazor-Calculator-Component-in-Browser](https://www.ezzylearning.net/wp-content/uploads/Blazor-Calculator-Component-in-Browser.png)

If you want to get the feeling that your code is running on the server-side, just try to add a breakpoint in the Calculate method and press F5 again. This time when you will click the Calculate button, you will see the code execution stopping at the breakpoint and you will also be able to see the user input in the tooltips as shown below.

如果您想感觉一下代码是在服务端上运行的，只需尝试在 Calculate 方法中添加一个断点，然后再次按 F5。这次当您单击 Calculate 按钮时，您将看到代码执行到断点处停止，您还可以 tooltips 中看到用户输入，如下所示：

![Debug-Blazor-Components-using-Breakpoints](https://www.ezzylearning.net/wp-content/uploads/Debug-Blazor-Components-using-Breakpoints.png)

## 拆分 Blazor 组件中的标签和代码

If you are creating small components, then you may want to write all C# code in a single .razor file but if you have lots of logic and for better code maintenance, you want to keep your C# code separate from your HTML markup then you can adopt one of the following two approaches.

如果您正在创建小的组件，那么您可能希望在单个 *.razor* 文件中编写所有 C# 代码，但如果您有大量逻辑并且为了更好的代码维护，您想要将 C# 代码与 HTML 标签分开，那么您可以采取以下两种方法之一。

### 使用基类拆分组件

Using this approach, you can create a separate class that should derive from ComponentBase class. You can then move components properties and methods from the **@code** block to this newly created class and finally, you can use the **@inherits** directive to specify the base class of your component. Let’s apply this approach to the Calculator component we created above. Create a class **CalculatorBase** in the project and move the C# code from the Calculator.razor into this new class.

使用这种方法，您可以创建一个独立的类，该类应该从 [ComponentBase](https://docs.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.components.componentbase) 类派生。然后，您可以将组件中的属性和方法从 **@code** 块移动到这个新创建的类，最后，您可以使用 **@inherits** 指令来指定组件的基类。让我们将此方法应用于我们上面创建的 Calculator 组件。在项目中创建一个 **CalculatorBase** 类，并将 C# 代码从 Calculator.razor 移动到这个新类中。

<b>CalculatorBase.cs</b>

```csharp
public class CalculatorBase : ComponentBase
{
    private int number1 = 0;
    private int number2 = 0;
    private int total = 0;
 
    private void Calculate()
    {
        total = number1 + number2;
    }
}
```

<!-- Then add the @inherits directive on top of the Calculator.razor file as follows: -->

然后在 *Calculator.razor* 文件的顶部添加 **@inherits** 指令，如下：

<b>Calculator.razor</b>

```html
@page "/calculator"
@inherits CalculatorBase
 
<h3>Calculator</h3>
 
<div class="form-group">
    <label for="number1">Number 1</label>
    <input type="number" class="form-control" id="number1" @bind="number1">
</div>
<div class="form-group">
    <label for="number2">Number 2</label>
    <input type="number" class="form-control" id="number2"  @bind="number2">
</div>
<div class="form-group">
    <label><b>Total: </b>@total</label> 
</div>
 
<button class="btn btn-primary" @onclick="Calculate">Calculate</button>
 
@code {
     
}
```

If you will try to build your application at this point, you will lot of errors complaining about the accessibility of the fields and methods.

此时如果您尝试构建应用程序，则会遇到很多错误抱怨字段和方法的可访问性。

![Blazor-BaseComponent-Property-Access-Errors](https://www.ezzylearning.net/wp-content/uploads/Blazor-BaseComponent-Property-Access-Errors.png)

<!-- All of the above errors are coming because the **Calculator** component is inheriting from the **CalculatorBase** class and the properties and methods we pasted in the **CalculatorBase** class are **private**. To make sure your fields and methods are accessible by the child components, you need to declare them as **public**. -->

出现上述所有错误是因为 **Calculator** 组件继承自 **CalculatorBase** 类，而我们在 **CalculatorBase** 类中粘贴的属性和方法是 **private**。为了确保子组件可以访问这些字段和方法，您需要将它们声明为 **public**。

```csharp
public class CalculatorBase : ComponentBase
{
    public int number1 = 0;
    public int number2 = 0;
    public int total = 0;
 
    public void Calculate()
    {
        total = number1 + number2;
    }
}
```

> 译者注：  
> 💡 基类中的字段和方法改为 `protected`， 在 `.razor` 中也是可以的访问的。  
> 💡 CalculatorBase 类必须包含在一个命名空间中，否则会报错。

### 使用部分类拆分组件

Blazor components are generated as partial classes which means we can create a **partial** class with the same name as our component and move all C# code in that partial class. This partial class will then become a code-behind file and the fields and properties declared in that file will be directly available in Blazor components. Let’s create a class Calculator.razor.cs and put our calculator code in this new class.

Blazor 组件生成为分部类，这意味着我们可以创建一个与我们的组件同名的 **partial** 类，并将所有 C# 代码移动到该分部类中。然后，此分部类将成为代码隐藏文件，并且该文件中声明的字段和属性在 Blazor 组件中可直接使用。 让我们创建一个类 *Calculator.razor.cs* 并将我们的 Calculator 代码放在这个新类中。

<b>Calculator.razor.cs</b>

```csharp
public partial class Calculator
{
    public int number1 = 0;
    public int number2 = 0;
    public int total = 0;
 
    public void Calculate()
    {
        total = number1 + number2;
    }
}
```

If file nesting is enabled, you will see that Visual Studio will automatically start displaying both the component and code-behind files together.

如果启用了文件嵌套，您将看到 Visual Studio 会自动同时显示组件和代码隐藏文件。

![Blazor-Component-Partial-Class-to-Separate-Code-from-View](https://www.ezzylearning.net/wp-content/uploads/Blazor-Component-Partial-Class-to-Separate-Code-from-View.png)

Run the app again and the Calculator should work in the same way as before.

再次运行应用程序，Calculator 会以前面相同的方式工作。

![Blazor-Calculator-Component-in-Browser](https://www.ezzylearning.net/wp-content/uploads/Blazor-Calculator-Component-in-Browser.png)

## 创建和使用子组件

Blazor Child Components are the components without @page directive. These components can be included inside other components using the standard HTML syntax. We can then build a complex UI by adding components on the page and we can even have multiple instances of the same child component on the same page. If a child component is supposed to be reused in multiple parent components or pages then it’s a good idea to place them inside the Shared folder. Let’s create a simple Heading.razor child component in the Shared folder and add the following code to it.

Blazor 子组件是没有 @page 指令的组件。这些组件可以使用标准 HTML 语法包含在其他组件中。 然后我们可以通过在页面上添加组件来构建复杂的 UI，我们甚至可以在同一页面上拥有同一个子组件的多个实例。 如果一个子组件应该在多个父组件或页面中重复使用，那么最好将它们放在 Shared 文件夹中。 让我们在 Shared 文件夹中创建一个简单的 Heading.razor 子组件，并在其中添加以下代码。

<b>Heading.razor</b>

```html
<h3>Calculator</h3>
```