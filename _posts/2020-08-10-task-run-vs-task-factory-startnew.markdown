---
layout: post
title:  ".NET - Task.Run vs Task.Factory.StartNew"
date:   2020-08-09 23:10:00 +0800
categories: dotnet csharp
published: true
---

> 翻译自 Stephen Toub 2011年10月24日的博文[《Task.Run vs Task.Factory.StartNew》](https://devblogs.microsoft.com/pfxteam/task-run-vs-task-factory-startnew/)，Stephen Toub 是微软 .NET 团队的一名开发人员。

在 *.NET 4* 中，`Task.Factory.StartNew` 是安排新任务的首选方法。它有许多重载提供了高度可配置的机制，通过启用设置选项，可以传递任意状态、启用取消，甚至控制调度行为。所有这些功能的另一面是复杂性。您需要知道什么时候使用哪个重载、提供什么调度程序等等。另外，`Task.Factory.StartNew` 用起来并不直截干脆，至少对于它的一些使用场景来说还不够快，比如它的主要使用场景——轻松地将工作交付到后台处理线程。 

因此，在 *.NET Framework 4.5 开发者预览版* 中，我们引入了新的 `Task.Run` 方法。这决不是要淘汰 `Task.Factory.StartNew`，而是应该简单地认为这是使用 `Task.Factory.StartNew` 而不必传递一堆参数的一个便捷方式。这是一个捷径。事实上，`Task.Run` 实际是按照与 `Task.Factory.StartNew` 相同的逻辑实现的，只是传入了一些默认的参数。当你传递一个 `Action` 给 `Task.Run`：

```csharp
Task.Run(someAction);
```

完全等同于：

```csharp
Task.Factory.StartNew(someAction, CancellationToken.None, TaskCreationOptions.DenyChildAttach, TaskScheduler.Default);
```

通过这种方式，`Task.Run` 就可以并且应该被用于大多数通用场景——简单地将工作交给线程池`ThreadPool`处理（即参数 TaskScheduler.Default 的目标）。这并不意味着 `Task.Factory.StartNew` 将不再被使用; 远非如此，`Task.Factory.StartNew` 还有很多重要的（固然更高级）用途。你可以控制 `TaskCreationOptions` 来控制任务的行为，可以控制 `TaskScheduler` 来控制任务的调度和运行，也可以使用接收对象状态的重载，对于性能敏感的代码路径，使用该重载可以避免闭包和相应的内存分配。不过，对于简单的情况，`Task.Run` 是你的朋友。

`Task.Run` 提供八个重载，以支持下面的所有组合：

1. 无返回值任务(`Task`)和有返回值任务(`Task<TResult>`)
2. 支持取消(`cancelable`)和不支持取消(`non-cancelable`)
3. 同步委托(`synchronous delegate`)和异步委托(`asynchronous delegate`)

前两点应该是不言而喻的。对于第一点，有返回 `Task` 的重载（对于没有返回值的操作），还有返回 `Task<TResult>` 的重载（对于返回值类型为 `TResult` 的操作）。对于第二点，还有接受 `CancellationToken` 的重载，如果在任务开始执行之前请求取消，则任务并行库（TPL）可以将任务转换为取消状态。

第三点是更有趣的，它与 *Visual Studio 11* 中 C# 和 Visual Basic 的异步语言支持直接相关。 让我们暂时考虑一下 `Task.Factory.StartNew`，这将有助于突出这一区别。如果我编写下面的调用：

```csharp
var t = Task.Factory.StartNew(() =>
{
    Task inner =Task.Factory.StartNew(() => {});
    return inner;
});
```

这里的 “t” 的类型将会是 `Task<Task>`; 因为任务委托的类型是 `Func<TResult>`，在此例中 `TResult` 是 `Task`，因此 `StartNew` 的返回值是 `Task<Task>`。 类似地，如果我将代码改变为：

```csharp
var t = Task.Factory.StartNew(() => 
{ 
    Task<int> inner = Task.Factory.StartNew(() => 42)); 
    return inner; 
});
```

此时，这里的 “t” 的类型将会是 `Task<Task<int>>`。因为任务委托的类型是 `Func<TResult>`，此时 `TResult` 是 `Task<int>`，因此 `StartNew` 的返回值是 `Task<Task<int>>`。 为什么这是相关的？ 现在考虑一下，如果我编写如下的代码会发生什么：

```csharp
var t = Task.Factory.StartNew(async delegate
{
    await Task.Delay(1000);
    return 42;
});
```

这里通过使用 `async` 关键词，编译器会将这个委托(`delegate`)映射成 `Func<Task<int>>`，调用该委托会返回 `Task<int>` 表示此调用的最终完成。因为委托是 `Func<Task<int>>`，`TResult` 是 `Task<int>`，因此这里 “t” 的类型将会是 `Task<Task<int>>`，而不是 `Task<int>`。

为了处理这类情况，在 *.NET 4* 我们引入了 `Unwrap` 方法。`Unwrap` 方法有两个重载，都是扩展方法，一个针对类型 `Task<Task>`，一个针对类型 `Task<Task<TResult>>`。我们称此方法为 `Unwrap`，因为实际上它“解包”了内部任务，将内部任务的返回值作为了外部任务的返回值而返回。对 `Task<Task>` 调用 `Unwrap` 返回一个新的 `Task`(我们通常将其称为代理)，它表示该内部任务的最终完成。类似地，对 `Task<Task<TResult>>` 调用 `Unwrap` 返回一个新的 `Task<TResult>` 表示该内部任务的最终完成。（在这两种情况下，如果外部任务出错或被取消，则不存在内部任务，因为没有运行到完成的任务不会产生结果，因此代理任务表示外部任务的状态。） 回到前面的例子，如果我希望 “t” 表示那个内部任务的返回值（在此例中，值是 42），我可以编写：

```csharp
var t = Task.Factory.StartNew(async delegate
{
    await Task.Delay(1000);
    return 42;
}).Unwrap();
```

现在，这里 “t” 变量的类型将会是 `Task<int>`，表示异步调用的返回值。

回到 `Task.Run`。因为我们希望人们将工作转移到线程池(`ThreadPool`)中并使用 `async/await` 成为普遍现象，所以我们决定将此解包(`unwrapping`)功能构建到 `Task.Run` 中。这就是上面第三点中提到的内容。有多种 `Task.Run` 的重载，它们接受 `Action`(针对无返回值任务)、 `Func<TResult>`(针对返回 `TResult` 的任务)、`Func<Task>`(针对无返回值的异步任务) 和 `Func<Task<TResult>>`(针对返回 `TResult` 的异步任务)。在内部，`Task.Run` 会执行与上面 `Task.Factory.StartNew` 所示的同样类型的解包(`unwrapping`)操作。所以，当我写下：

```csharp
var t = Task.Run(async delegate
{
    await Task.Delay(1000);
    return 42;
});
```

“t” 的类型是 `Task<int>`，`Task.Run` 的这种重载实现基本上等效于：

```csharp
var t = Task.Factory.StartNew(async delegate
{
    await Task.Delay(1000); 
    return 42;
}, CancellationToken.None, TaskCreationOptions.DenyChildAttach, TaskScheduler.Default).Unwrap();
```

如前所述，这是一条捷径。

所有这些都意味着您可以将 `Task.Run` 与常规lambdas/匿名方法或与异步lambdas/匿名方法一起使用，都会发生正确的事情。如果我想将工作交给线程池(`ThreadPool`)并等待其结果，例如：

```csharp
int result = await Task.Run(async () =>
{
    await Task.Delay(1000);
    return 42;
});
```

变量 `result` 的类型将会是 `int`，正如您期望的那样，在调用此任务大约一秒种后，变量 `result` 的值将被设置为 42。

有趣的是，几乎可以将新的 `await` 关键字看作是与 `Unwrap` 方法等效的语言。因此，如果我们返回到 `Task.Factory.StartNew` 示例，则可以使用 `Unwrap` 重写上面最后一个代码片断，如下：

```csharp
int result = await Task.Factory.StartNew(async delegate
{
    await Task.Delay(1000);
    return 42;
}, CancellationToken.None, TaskCreationOptions.DenyChildAttach, TaskScheduler.Default).Unwrap();
```

或者，我可以使用第二个 `await` 来代替使用 `Unwrap`：

```csharp
int result = await await Task.Factory.StartNew(async delegate
{
    await Task.Delay(1000);
    return 42;
}, CancellationToken.None, TaskCreationOptions.DenyChildAttach, TaskScheduler.Default);
```

这里的 “await await” 不是输入错误，`Task.Factory.StartNew` 返回 `Task<Task<int>>`。 `await` `Task<Task<int>>` 返回 `Task<int>`，然后 `await` `Task<int>` 返回 `int`，很有趣，对吧？


<br/>

> 作者 ： Stephen Toub <br/>
> 译者 ： 技术译民 <br/>
> 出品 ： [技术译站](https://ittranslator.cn/) <br/>
> 链接 ： [英文原文](https://devblogs.microsoft.com/pfxteam/task-run-vs-task-factory-startnew/)
