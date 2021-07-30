---
layout: post
title:  "Blazor 组件之间使用 EventCallback 进行通信"
date:   2021-07-31 00:10:10 +0800
categories: dotnet csharp
tags: [DotNet, Blazor]
published: true
---

> 翻译自 Waqas Anwar 2021年3月28日的文章 [《Communication between Blazor Components using EventCallback》](https://www.ezzylearning.net/tutorial/communication-between-blazor-components-using-eventcallback) [^1]

[^1]: <https://www.ezzylearning.net/tutorial/communication-between-blazor-components-using-eventcallback> Communication between Blazor Components using EventCallback

![Communication-between-Blazor-Components-using-EventCallback](https://www.ezzylearning.net/wp-content/uploads/Communication-between-Blazor-Components-using-EventCallback.jpg)

<!-- Blazor apps are the collection of multiple Blazor components interacting with each other and we are also allowed to use child components inside other parent components. In real-world apps, it is a very common scenario to pass data or event information from one component to another component. Maybe you have a page in which user actions occurred in one component need to update some UI in other components. This type of communication is normally handled using an [EventCallback](https://docs.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.components.eventcallback) delegate. In this tutorial, we will cover how to use EventCallback to communicate between a parent and a child component. -->

Blazor 应用程序是相互交互的多个 Blazor 组件的集合，我们可以在其他父组件中使用子组件。在实际的应用程序中，将数据或事件信息从一个组件传递到另一组件是一种十分常见的场景。可能您有一个页面，其中一个组件中发生的用户操作需要更新其他组件中的某些 UI。通常使用 [EventCallback](https://docs.microsoft.com/zh-cn/dotnet/api/microsoft.aspnetcore.components.eventcallback) 委托来处理这种类型的通信。在本教程中，我们将介绍如何使用 EventCallback 在父组件和子组件之间进行通信。

<!-- Following are the common steps involved to communicate from child component to parent component using EventCallback. -->

下面是使用 EventCallback 从子组件到父组件进行通信所涉及的通用步骤。

1. 在子组件中声明一个 `EventCallback` 或 `EventCallback<T>` 委托
2. 在父组件中附加一个到子组件的 `EventCallback` 或 `EventCallback<T>` 的回调方法
3. 当子组件想要与父组件通信时，可以使用以下方法之一调用父组件的回调方法。
   - InvokeAsync(Object) – 如果使用的是 `EventCallback`
   - InvokeAsync(T) – 如果使用的是 `EventCallback<T>`

<!-- To understand the above steps, let’s create a simple To Do List example. First, create the following **ToDo.cs** class in the Data folder. It is a simple class that will store the **Title** and **Minutes** properties for each To Do Item. The **Minutes** property specifies how long a particular ToDo item will take to complete. -->

为了理解上述步骤，让我们创建一个简单的待办事项列表(To Do List)示例。首先，在 *Data* 文件夹中创建以下 **ToDo.cs** 类。这是一个简单类，用于存储每个待办事项的 **Title** 和 **Minutes** 属性。**Minutes** 属性指定完成特定待办事项所需的时间。

<b>ToDo.cs</b>

```csharp
public class ToDo
{
    public string Title { get; set; }
    public int Minutes { get; set; }
}
```

<!-- Add the following ToDoList.razor component in the project and write the following code in it. -->

在项目中添加以下 *ToDoList.razor* 组件，并在其中编写以下代码：

<b>ToDoList.razor</b>

```html
@page "/todos"
@using BlazorEventHandlingDemo.Data
 
<div class="row">
    <div class="col"><h3>To Do List</h3></div>
    <div class="col"><h5 class="float-right">Total Minutes: @TotalMinutes</h5></div>
</div>
 
<br />
<table class="table">
    <tr>
        <th>Title</th>
        <th>Minutes</th>
        <th></th>
    </tr>
    @foreach (var todo in ToDos)
    {
        <ToDoItem Item="todo" />
    }
</table>
 
@code {
 
    public List<ToDo> ToDos { get; set; }
    public int TotalMinutes { get; set; }
 
    protected override void OnInitialized()
    {
        ToDos = new List<ToDo>()
        {
                new ToDo() { Title = "Analysis", Minutes = 40 },
                new ToDo() { Title = "Design", Minutes = 30 },
                new ToDo() { Title = "Implementation", Minutes = 75 },
                new ToDo() { Title = "Testing", Minutes = 40 }
        };
 
        UpdateTotalMinutes();
    }
 
    public void UpdateTotalMinutes()
    {
        TotalMinutes = ToDos.Sum(x => x.Minutes);
    }
}
```

<!-- In the above **@code** block, we declared two properties **ToDos** and **TotalMinutes**. The ToDos property will store the list of ToDo items and the **TotalMinutes** will store the sum of all ToDo Items minutes. -->

在上面的 **@code** 代码块中，我们声明了两个属性 **ToDos** 和 **TotalMinutes**。 其中 **ToDos** 属性存储待办事项的列表，**TotalMinutes** 存储所有待办事项花费分钟数的总和。

```csharp
public List<ToDo> ToDos { get; set; }
public int TotalMinutes { get; set; }
```

<!-- Next, we are initializing our **ToDos** list with some **ToDo** item objects in one of the Blazor component life cycle methods called **OnInitialized**. We are also calling the **UpdateTotalMinutes** method that simply calculates the Sum of **Minutes** property of all ToDo objects in the ToDos list. -->

接下来，我们在 Blazor 组件生命周期方法之一的名为 **OnInitialized** 的方法中使用一些待办事项对象来初始化我们的 **ToDos** 列表。我们还调用了 **UpdateTotalMinutes** 方法，该方法简单地计算 ToDos 列表中所有 ToDo 对象的 **Minutes** 属性的总和。

```csharp
protected override void OnInitialized()
{
    ToDos = new List<ToDo>()
    {
            new ToDo() { Title = "Analysis", Minutes = 40 },
            new ToDo() { Title = "Design", Minutes = 30 },
            new ToDo() { Title = "Implementation", Minutes = 75 },
            new ToDo() { Title = "Testing", Minutes = 40 }
    };
 
    UpdateTotalMinutes();
}
```

<!-- The HTML code is also very straightforward. We are displaying the TotalMinutes property on top of the page with the page heading.

HTML 代码也非常简单。我们在带有页面标题的页面顶部显示 **TotalMinutes** 属性。 -->

HTML 代码也非常简单。我们将 **TotalMinutes** 属性显示在带有页面标题的页面顶部。

```html
<h5 class="float-right">Total Minutes: @TotalMinutes</h5>
```

<!-- We are also generating an HTML table on the page and the following **foreach** loop iterates over the **ToDos** list and renders a child component called **ToDoItem**. We are also passing each **ToDo** object inside the child component using the **Item** property. -->

我们还在页面上生成了一个 HTML 表格，接下来的 **foreach** 循环遍历 **ToDos** 列表并渲染一个名为 **ToDoItem** 的子组件，我们还使用其 **Item** 属性将每个 **ToDo** 对象传入子组件中。

```csharp
@foreach (var todo in ToDos)
{
    <ToDoItem Item="todo" />
}
```

<!-- Let’s create a child component **ToDoItem.razor** in the **Shared** folder and add the following code to it. The child component has an **Item** property which we are setting in the parent component inside **foreach** loop. The child component simply generates a table row using `<tr>` element and displays the **Title** and **Minutes** properties in table cells. -->

让我们在 **Shared** 文件夹中创建一个子组件 **ToDoItem.razor** 并在其中添加以下代码。该子组件有一个 **Item** 属性（我们在父组件的 **foreach** 循环中设置了属性）。该子组件简单地使用 `<tr>` 元素生成一个表格行，并在表格单元格中显示 **Title** 和 **Minutes** 属性。

<b>ToDoItem.razor</b>

```html
@using BlazorEventHandlingDemo.Data
<tr>
    <td>@Item.Title</td>
    <td>@Item.Minutes</td>
    <td>
       <button type="button" class="btn btn-success btn-sm float-right">
            + Add Minutes
        </button>
    </td>
</tr>
 
@code {
    [Parameter]
    public ToDo Item { get; set; }
}
```

运行该应用程序，您会看到一个类似于如下的页面：

![Blazor-Child-Component-that-will-Raise-Event](https://www.ezzylearning.net/wp-content/uploads/Blazor-Child-Component-that-will-Raise-Event.png)

<!-- If you will click **Add Minutes** button in the child component nothing will happen because we haven’t attached the click event with the **Add Minutes** button yet. Let’s update the **Add Minutes** button code and add the **@onclick** attribute that will call the **AddMinute** method. -->

如果此时您点击子组件中的 **Add Minutes** 按钮，则不会有任何反应，因为我们还没有将 click 事件与 **Add Minutes** 按钮关联起来。让我们更新一下 **Add Minutes** 按钮的代码，添加调用 **AddMinute** 方法的 **@onclick** 特性。

```html
<button type="button" class="btn btn-success btn-sm float-right" @onclick="AddMinute">
    + Add Minutes
</button>
```

<!-- The **AddMinute** event handler method will simply add 1 minute in the Minutes property every time user will click the Add Minutes button. -->

当用户每次点击 Add Minutes 按钮时，事件处理方法 **AddMinute** 简单地将 Minutes 属性加 1。

```csharp
public async Task AddMinute(MouseEventArgs e)
{
    Item.Minutes += 1; 
}
```

<!-- Run the app again and try to click **Add Minutes** buttons for each To Do item. You will notice that the minutes displayed with every To Do Item will start to increment but the Total Minutes property on the top will stay the same. This is because the **TotalMinutes** property is calculated in the parent component and the parent component has no idea that the **Minutes** are incrementing in the child components. -->

再次运行应用程序并尝试点击每个待办事项的 **Add Minutes** 按钮。您将注意到每个待办事项显示的分钟数会增加，但是顶部的总分钟数属性将保持不变。这是由于 **TotalMinutes** 属性是在父组件中计算的，而父组件并不知道子组件中的 **Minutes** 属性增加了。

![Blazor-Child-Component-Not-Updating-Parent-Component](https://www.ezzylearning.net/wp-content/uploads/Blazor-Child-Component-Not-Updating-Parent-Component.png)

<!-- Let’s facilitate the child to parent communication in our example using the steps I mentioned above so that every time we add **Minutes** in the child component, we will be able to update the parent UI accordingly. -->

让我们使用上面提到的步骤在我们的示例中改进一下子组件到父组件的通信，以便每次增加子组件中的 **Minutes** 时，能够相应地更新父组件的 UI。

<!-- Step 1: Declare an EventCallback or EventCallback<T> delegate in child component -->

### 步骤1：在子组件中声明一个 `EventCallback` 或 `EventCallback<T>` 委托

<!-- The first step is to declare the `EventCallback<T>` delegate in our child component. We are declaring a delegate **OnMinutesAdded** and using **MouseEventArgs** as T because this can provide us extra information about the button click event. -->

第一步是在我们的子组件中声明 `EventCallback<T>` 委托。我们声明一个委托 **OnMinutesAdded**，并使用 **MouseEventArgs** 作为 `T`，因为它可以为我们提供有关按钮点击事件的额外信息。

```csharp
[Parameter]
public EventCallback<MouseEventArgs> OnMinutesAdded { get; set; }
```

Step 2: Attach a callback method to child component’s EventCallback or EventCallback<T> in parent component

### 步骤2：在父组件中附加一个到子组件的 `EventCallback` 或 `EventCallback<T>` 的回调方法

In this step, we need to attach a callback method with the child component’s **OnMinutesAdded** EventCallback delegate we declared in Step 1 above.

在这一步中，我们需要向在前面的步骤 1 中声明的子组件的 `EventCallback` 委托 **OnMinutesAdded** 附加一个回调方法。

```csharp
<ToDoItem Item="todo" OnMinutesAdded="OnMinutesAddedHandler" />
```

<!-- The callback method we are using in this example is **OnMinutesAddedHandler** and this method simply calls the same **UpdateTotalMinutes** method that updates the **TotalMinutes** property. -->

我们在本例中使用的回调方法是 **OnMinutesAddedHandler**，该方法简单地调用同一个 **UpdateTotalMinutes** 方法，更新 **TotalMinutes** 属性。

```csharp
public void OnMinutesAddedHandler(MouseEventArgs e)
{
    UpdateTotalMinutes();
}
```

<!-- Step 3: Whenever a child component wants to communicate with the parent component, it invokes the parent component’s callback method using InvokeAsync(Object) or InvokeAsync(T) methods. -->

### 步骤3：当子组件需要与父组件通信时，使用 `InvokeAsync(Object)` 或 `InvokeAsync(T)` 方法调用父组件的回调方法。

<!-- In this step, we need to invoke the parent component callback method and the best place to do this is the **AddMinute** method because we want to update the parent component UI every time user clicks the Add Minute button. -->

在这一步中，我们需要调用父组件回调方法，因为我们希望每次用户点击 **Add Minute** 按钮时都会更新父组件 UI，所以最好的位置是在 **AddMinute** 方法中调用。

```csharp
public async Task AddMinute(MouseEventArgs e)
{
    Item.Minutes += 1;
    await OnMinutesAdded.InvokeAsync(e);
}
```

<!-- That’s all we need to facilitate communication from child component to parent component in Blazor. Following is the complete code of ToDoItem.razor child component. -->

这就是在 Blazor 中实现从子组件到父组件通信我们所需要做的全部事情。以下是子组件 *ToDoItem.razor* 的完整代码：

<b>ToDoItem.razor</b>

```html
@using BlazorEventHandlingDemo.Data
<tr>
    <td>@Item.Title</td>
    <td>@Item.Minutes</td>
    <td>
        <button type="button" class="btn btn-success btn-sm float-right" @onclick="AddMinute">
            + Add Minutes
        </button>
    </td>
</tr>
 
@code {
 
  [Parameter]
  public ToDo Item { get; set; }
 
  [Parameter]
  public EventCallback<MouseEventArgs> OnMinutesAdded { get; set; }
 
  public async Task AddMinute(MouseEventArgs e)
  {
    Item.Minutes += 1;
    await OnMinutesAdded.InvokeAsync(e);
  }
}
```

<!-- Following is the complete code of ToDoList.razor parent component -->

以下是父组件 *ToDoList.razor* 的完整代码：

<b>ToDoList.razor</b>

```html
@page "/todos"
@using BlazorEventHandlingDemo.Data
 
<div class="row">
    <div class="col"><h3>To Do List</h3></div>
    <div class="col"><h5 class="float-right">Total Minutes: @TotalCount</h5></div>
</div>
 
<br />
<table class="table">
    <tr>
        <th>Title</th>
        <th>Minutes</th>
        <th></th>
    </tr>
    @foreach (var todo in ToDos)
    {
        <ToDoItem Item="todo" OnMinutesAdded="OnMinutesAddedHandler" />
    }
</table>
 
@code {
 
    public List<ToDo> ToDos { get; set; }
    public int TotalCount { get; set; }
 
    protected override void OnInitialized()
    {
        ToDos = new List<ToDo>()
        {
                new ToDo() { Title = "Analysis", Minutes = 40 },
                new ToDo() { Title = "Design", Minutes = 30 },
                new ToDo() { Title = "Implementation", Minutes = 75 },
                new ToDo() { Title = "Testing", Minutes = 40 }
        };
 
        UpdateTotalMinutes();
    }
 
    public void UpdateTotalMinutes()
    {
        TotalCount = ToDos.Sum(x => x.Minutes);
    }
 
    public void OnMinutesAddedHandler(MouseEventArgs e)
    {
        UpdateTotalMinutes();
    }
}
```

<!-- Run the application in the browser and try to add minutes in any ToDo item and you will notice that the parent component is automatically updating the Total Minutes in real-time. -->

在浏览器中运行应用程序，并尝试增加任一 ToDo 项的分钟数，您会注意到父组件将自动地实时更新总分钟数。

![Blazor-Child-Component-Updating-Parent-Compoent-with-EventCallback](https://www.ezzylearning.net/wp-content/uploads/Blazor-Child-Component-Updating-Parent-Compoent-with-EventCallback.png)



<!-- 
[Router 组件](https://docs.microsoft.com/zh-cn/dotnet/api/microsoft.aspnetcore.components.routing.router)[^router] 的属性：

| 属性                   | 说明                                      |
|----------------------|-----------------------------------------|
| AdditionalAssemblies | 获取或设置其他程序集的集合，这些程序集应在搜索可与 URI 匹配的组件时搜索。 |
| AppAssembly          | 获取或设置应在其中搜索与 URI 匹配的组件的程序集。             |
| Found                | 获取或设置当为请求的路由找到匹配项时要显示的内容。               |
| Navigating           | 获取或设置异步导航正在进行时显示的内容。                    |
| NotFound             | 获取或设置当找不到请求的路由的匹配项时要显示的内容。              |
| OnNavigateAsync      | 获取或设置在导航到新页之前应调用的处理程序。                  |

[^router]: <https://docs.microsoft.com/zh-cn/dotnet/api/microsoft.aspnetcore.components.routing.router>
 -->
