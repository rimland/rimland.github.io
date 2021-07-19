---
layout: post
title:  "Blazor 事件处理开发指南"
date:   2021-07-19 00:10:10 +0800
categories: dotnet csharp
tags: [DotNet, Blazor]
published: true
---

> 翻译自 Waqas Anwar 2021年3月25日的文章 [《A Developer’s Guide To Blazor Event Handling》](https://www.ezzylearning.net/tutorial/a-developers-guide-to-blazor-event-handling) [^1]

[^1]: <https://www.ezzylearning.net/tutorial/a-developers-guide-to-blazor-event-handling> A Developer’s Guide To Blazor Event Handling

![A-Developers-Guide-To-Blazor-Event-Handling](https://www.ezzylearning.net/wp-content/uploads/A-Developers-Guide-To-Blazor-Event-Handling.jpg)

If you are developing an interactive web app, it is very common practice to update the user interface dynamically based on different application events and user actions. These actions raise events and as a developer, it is our job to handle these events using some event handling techniques. Blazor has built-in support to handle several events such as onclick, onchange and onmousemove, etc. and it also provides developers multiple ways to handle these events. In this tutorial, I will give you an overview of Blazor event handling. You will also learn how to use event arguments and lambda expressions and how you can pass additional parameters to your event handlers in Blazor.

如果您正在开发交互式 Web 应用程序，根据不同的应用程序事件和用户操作动态更新用户界面是非常常见的做法。这些操作会触发事件，而作为开发人员，使用一些事件处理技术来处理这些事件就是我们的工作。Blazor 内置支持处理多种事件，例如 onclick、onchange 和 onmousemove 等，并为开发者提供了多种处理这些事件的方法。在本教程中，我将概述 Blazor 事件处理。您还将学习，在 Blazor 中，如何使用事件参数和 lambda 表达式，以及如何将附加参数传递给事件处理程序。

## Blazor 事件处理入门

The basic syntax of handling events in Blazor is following

Blazor 中处理事件的基本语法如下所示：

```text
@on[DOM EVENT]="[DELEGATE]"
```

在上面的语法中

- **[DOM EVENT]** 是 DOM 事件的占位符，例如 click、mouseup 等。
- **[DELEGATE]** 是 C# 委托事件处理程序的占位符。

Let’s say you want to handle a button click event you can apply the above syntax as follows:

假设您要处理按钮单击事件，您可以按如下方式使用上述语法：

```html
<button @onclick="Update" /> 
```

Let’s cover the event handling in more detail with some practical examples. Create a new Blazor Server App in Visual Studio 2019 and then add a new Blazor component **Calculator.razor**.

让我们通过一些实际示例更详细地介绍一下事件处理。 在 Visual Studio 2019 中创建一个新的 Blazor Server 应用程序，然后添加一个新的 Blazor 组件 **Calculator.razor**。

```html
@page "/calculator"
 
<h3>Calculator</h3>
 
<div class="form-group">
    <label for="number1">Number 1</label>
    <input type="number" class="form-control" id="number1" @bind="number1">
</div>
<div class="form-group">
    <label for="number2">Number 2</label>
    <input type="number" class="form-control" id="number2" @bind="number2">
</div>
<div class="form-group">
    <label><b>Total: </b>@total</label>
</div>
 
<button class="btn btn-primary" @onclick="Calculate">Calculate</button>
<button class="btn btn-secondary" @onclick="Clear">Clear</button>
 
@code {
    private int number1 = 0;
    private int number2 = 0;
    private int total = 0;
 
    private void Calculate()
    {
        total = number1 + number2;
    }
 
    private void Clear()
    {
        number1 = 0;
        number2 = 0;
        total = 0;
    }
}
```

The above component has two buttons Calculate and Clear and they both are handling **onclick** event and calling **Calculate** and **Clear** methods written in the **@code** block above.

上面的组件中有两个按钮：Calculate 和 Clear，它们都处理了 **onclick** 事件并调用上面的 **@code** 块中编写的 **Calculate** 和 **Clear** 方法。

```html
<button class="btn btn-primary" @onclick="Calculate">Calculate</button>
<button class="btn btn-secondary" @onclick="Clear">Clear</button>
```

If you will run this simple example, you will see a page similar to the following. Input some numbers in the text fields and then press the buttons to see event handling in action.

如果您运行这个简单的示例，将会看到类似于以下内容的页面。在文本框中输入一些数字，然后按下按钮查看事件处理的效果。

![Simple-Blazor-Event-Handling-Example](https://www.ezzylearning.net/wp-content/uploads/Simple-Blazor-Event-Handling-Example.png)

Blazor also supports asynchronous delegate event handlers as shown in the code snippet below. These types of handlers can return a **Task** and inside these handlers, we can call an async method with the **await** keyword.

如下面的代码片段所示，Blazor 还支持异步委托事件处理程序。这些类型的处理程序可以返回一个 **Task**，在这些处理程序内部，我们可以使用 **await** 关键字调用异步方法。

```csharp
private async Task Clear()
{
    await Task.Delay(10);
 
    number1 = 0;
    number2 = 0;
    total = 0;
}
```

## 理解 Blazor 事件参数

Most of the Blazor event support event arguments which are the objects that can carry the extra information about the event occurred. For example, a **KeyboardEventArgs** can provide us the details about the keyboard key users press.

大部分 Blazor 事件支持事件参数，这些参数是携带发生的事件的相关信息的对象。例如，**KeyboardEventArgs** 可以为我们提供用户按下的按键的详细信息。

Let’s create a basic component with a standard HTML **div** element as shown below.

让我们创建一个带有标准的 HTML **div** 元素的基本组件，如下所示。

```html
@page "/mouseevents"
 
<h3>Mouse Events</h3>
 
<div style="width: 400px; height: 400px; background: lightblue" @onmousemove="Move"></div>
<label><b>Coordinates: </b>@coordinates</label>
 
@code {
    private string coordinates = "";
 
    private void Move(MouseEventArgs e)
    {
        coordinates = $"{e.ScreenX}:{e.ScreenY}";
    }
}
```

The **div** element is handling **onmousemove** event and passing the **MouseEventArgs** to the event handler method named **Move**. The Move event handler then updating the local field **coordinates** with the X and Y position of the mouse using **ScreenX** and **ScreenY** properties available in **MouseEventArgs** class. Run the app and try to move the mouse inside the div and you will see the coordinates updating in real-time.

**div** 元素处理 **onmousemove** 事件并将 **MouseEventArgs** 传递给方法名为 **Move** 的事件处理程序。然后，Move 事件处理程序使用 **MouseEventArgs** 类中可用的 **ScreenX** 和 **ScreenY** 属性，使用鼠标的 X 和 Y 位置更新本地字段 **coordinates**。运行应用程序，并尝试在 div 中移动鼠标，您会看到坐标实时更新。

![Blazor-Mouse-Move-Event-Example](https://www.ezzylearning.net/wp-content/uploads/Blazor-Mouse-Move-Event-Example.png)

Blazor supports a big list of EventArgs objects but the most commonly used EventArgs are shown in the following table.

Blazor 支持大量的 EventArgs 对象，但最常用的 EventArgs 如下表所示。

| Event       | Class                                                                                                                  | DOM Events                                                                                       |
|-------------|------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| Focus       | [FocusEventArgs](https://docs.microsoft.com/zh-cn/dotnet/api/microsoft.aspnetcore.components.web.focuseventargs)       | onfocus, onblur, onfocusin, onfocusout                                                           |
| Input       | [ChangeEventArgs](https://docs.microsoft.com/zh-cn/dotnet/api/microsoft.aspnetcore.components.changeeventargs)         | onchange, oninput                                                                                |
| Keyboard    | [KeyboardEventArgs](https://docs.microsoft.com/zh-cn/dotnet/api/microsoft.aspnetcore.components.web.keyboardeventargs) | onkeydown, onkeypress, onkeyup                                                                   |
| Mouse       | [MouseEventArgs](https://docs.microsoft.com/zh-cn/dotnet/api/microsoft.aspnetcore.components.web.mouseeventargs)       | onclick, oncontextmenu, ondblclick, onmousedown, onmouseup, onmouseover, onmousemove, onmouseout |
| Mouse wheel | [WheelEventArgs](https://docs.microsoft.com/zh-cn/dotnet/api/microsoft.aspnetcore.components.web.wheeleventargs)       | onwheel, onmousewheel                                                                            |
| Touch       | [TouchEventArgs](https://docs.microsoft.com/zh-cn/dotnet/api/microsoft.aspnetcore.components.web.toucheventargs)       | ontouchstart, ontouchend, ontouchmove, ontouchenter, ontouchleave, ontouchcancel                 |

<!-- You can see the full list of EventArgs on Microsoft Blazor docs page. -->

您可以在微软 Blazor [文档页面](https://docs.microsoft.com/zh-cn/aspnet/core/blazor/components/event-handling)[^eh]看到 EventArgs 的完整列表。

[^eh]: <https://docs.microsoft.com/zh-cn/aspnet/core/blazor/components/event-handling>

## 在 Blazor 事件中使用 Lambda 表达式

Blazor also support Lambda expressions as the delegate event handler. You should use these expressions only for simple use cases and should avoid these if you have lot of code to execute. Let’s modify our Calculator example and this time use Lambda expressions instead of **Calculate** and **Clear** methods we used above.

Blazor 还支持 Lambda 表达式作为委托事件处理程序。您应该只在简单的用例中使用这些表达式，如果有很多的代码要执行，应避免使用 Lambda 表达式。让我们修改一下前面的 Calculator 示例，这次使用 Lambda 表达式，而不是上面的 **Calculate** 和 **Clear** 方法。

```html
@page "/calculator"
<h3>Calculator</h3>
<div class="form-group">
    <label for="number1">Number 1</label>
    <input type="number" class="form-control" id="number1" @bind="number1">
</div>
<div class="form-group">
    <label for="number2">Number 2</label>
    <input type="number" class="form-control" id="number2" @bind="number2">
</div>
<div class="form-group">
    <label><b>Total: </b>@total</label>
</div>
 
<button class="btn btn-primary" @onclick="@(e => total = number1 + number2)">Calculate</button>
<button class="btn btn-secondary" @onclick="@(e => total = number1 = number2 = 0)">Clear</button>
 
@code {
    private int number1 = 0;
    private int number2 = 0;
    private int total = 0; 
}
```

## 向事件处理程序传递附加参数

Sometimes, we want to pass additional parameters to event handlers as per your application requirements. For example, if you are in a loop, you may want to pass the loop iteration index number to an event argument so that you know for which item in the loop this particular event handler is executed. Another simple example would be to call the same event handler from two or more controls and pass the reference of the control handling the event. Let’s cover this concept with a basic example. Modify the Calculator code once again as per the following code snippet.

有时，我们希望根据每个应用程序的需求向事件处理程序传递额外的参数。例如，在一个循环中，您可能希望将循环迭代索引序号传递给事件参数，以便您知道此特定事件处理程序是针对循环中的哪个项目执行的。另一个简单的例子是从两个或多个控件调用相同的事件处理程序，并传递处理事件的控件的引用。让我们用一个基础的例子来介绍一下这个概念。依照下面的代码片段再次修改 *Calculator* 的代码。

```html
<div class="form-group">
    <label for="number1">Number 1</label>
    <input type="number" class="form-control" id="number1" @bind="number1">
</div>
 
<div class="form-group">
    <label for="number2">Number 2</label>
    <input type="number" class="form-control" id="number2" @bind="number2">
</div>
  
<div class="form-group">
    <label><b>Total: </b>@total</label>
</div>
 
<button class="btn btn-primary" @onclick="@(e => Calculate(e, 1))">Add</button>
<button class="btn btn-primary" @onclick="@(e => Calculate(e, 2))">Subtract</button>
 
<button class="btn btn-secondary" @onclick="Clear">Clear</button>
 
@code {
    private int number1 = 0;
    private int number2 = 0;
    private int total = 0;
 
    private void Calculate(MouseEventArgs e, int buttonType)
    {
        switch (buttonType)
        {
            case 1:
                total = number1 + number2;
                break;
            case 2:
                total = number1 - number2;
                break;
        }
    }
 
    private void Clear()
    {
        number1 = 0;
        number2 = 0;
        total = 0;
    }
}
```

The important lines in the above code snippet are following where I am passing an additional parameter to the **Calculate** method with the value **1** and **2**

上面代码片段中的重要两行如下，我将一个附加参数传递给了 **Calculate** 方法，其值为 **1** 和 **2**：

```html
<button class="btn btn-primary" @onclick="@(e => Calculate(e, 1))">Add</button>
<button class="btn btn-primary" @onclick="@(e => Calculate(e, 2))">Subtract</button>
```

The code of **Calculate** method is also modified slightly as it is now accepting an additional argument **buttonType**. Inside the method, we are doing addition or subtraction depending upon the **buttonType** argument value.

**Calculate** 方法的代码也略有修改，因为它现在接受一个额外的参数 **buttonType**。在此方法中，我们根据 **buttonType** 参数的值进行加法或减法运算。

```csharp
private void Calculate(MouseEventArgs e, int buttonType)
{
    switch (buttonType)
    {
        case 1:
            total = number1 + number2;
            break
        case 2:
            total = number1 - number2;
            break;
    }
}
```

Run the app once again and try to click both **Add** and **Subtract** methods and you will see the same **Calculate** method will give us a different result.

再次运行应用程序，并尝试点击 **Add** 和 **Subtract** 方法，您会看到相同的 **Calculate** 方法会给我们带来了不同的结果。

![Passing-Additional-Arguments-to-Blazor-Event-Handler-using-Lambda-Expression](https://www.ezzylearning.net/wp-content/uploads/Passing-Additional-Arguments-to-Blazor-Event-Handler-using-Lambda-Expression.png)
