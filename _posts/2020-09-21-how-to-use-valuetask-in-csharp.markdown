---
layout: post
title:  "如何使用 C# 中的 ValueTask"
date:   2020-09-21 00:10:00 +0800
categories: dotnet csharp
published: true
---

# 在 C# 中利用 `ValueTask` 避免从异步方法返回 `Task` 对象时分配

> 翻译自 Joydip Kanjilal 2020年7月6日 的博文 [《How to use ValueTask in C#》](https://www.infoworld.com/article/3565433/how-to-use-valuetask-in-csharp.html)

异步编程已经使用了相当长一段时间了。近年来，随着 `async` 和 `await` 关键字的引入，它变得更加强大。您可以利用异步编程来提高应用程序的响应能力和吞吐量。

C# 中异步方法的推荐返回类型是 `Task`。如果您想编写一个有返回值的异步方法，那么应该返回 `Task<T>`; 如果想编写事件处理程序，则可以返回 `void`。在 C# 7.0 之前，异步方法可以返回 `Task`、`Task<T>` 或 `void`。从 C# 7.0 开始，异步方法还可以返回 `ValueTask`（作为 `System.Threading.Tasks.Extensions` 包的一部分可用）或 `ValueTask<T>`。本文就讨论一下如何在 C# 中使用 `ValueTask`。

要使用本文提供的代码示例，您的系统中需要安装 Visual Studio 2019。如果还没有安装，您可以[在这里下载 Visual Studio 2019](https://visualstudio.microsoft.com/downloads/)。

## 在 Visual Studio 中创建一个 .NET Core 控制台应用程序项目

首先，让我们在 Visual Studio 中创建一个 .NET Core 控制台应用程序项目。假设您的系统中安装了 Visual Studio 2019，请按照下面描述的步骤在 Visual Studio 中创建一个新的 .NET Core 控制台应用程序项目。

1. 启动 Visual Studio IDE。
2. 点击 “创建新项目”。
3. 在 “创建新项目” 窗口中，从显示的模板列表中选择 “控制台应用(.NET Core)”。
4. 点击 “下一步”。
5. 在接下来显示的 “配置新项目” 窗口，指定新项目的名称和位置。
6. 点击 “创建”。

这将在 Visual Studio 2019 中创建一个新的 .NET Core 控制台应用程序项目。我们将在 本文后面的部分中使用这个项目来说明 `ValueTask` 的用法。

## 为什么要使用 ValueTask ？

`Task` 表示某个操作的状态，即此操作是否完成、取消等。异步方法可以返回 `Task` 或者 `ValueTask`。

现在，由于 `Task` 是一个引用类型，从异步方法返回一个 `Task` 对象意味着每次调用该方法时都会在托管堆（`managed heap`）上分配该对象。因此，在使用 `Task` 时需要注意的一点是，每次从方法返回 `Task` 对象时都需要在托管堆中分配内存。如果你的方法执行的操作的结果立即可用或同步完成，则不需要这种分配，因此代价很高。

这正是 `ValueTask` 要出手相助的目的，`ValueTask<T>` 提供了两个主要好处。首先，`ValueTask<T>` 提高了性能，因为它不需要在堆（`heap`）中分配; 其次，它的实现既简单又灵活。当结果立即可用时，通过从异步方法返回 `ValueTask<T>` 代替 `Task<T>`，你可以避免不必要的分配开销，因为这里的 “T” 表示一个结构，而 C# 中的结构体（`struct`）是一个值类型（与 `Task<T>` 中表示类的 “T” 不同）。

C# 中 `Task` 和 `ValueTask` 表示两种主要的 “可等待（awaitable）” 类型。请注意，您不能阻塞（block）一个 `ValueTask`。如果需要阻塞，则应使用 `AsTask` 方法将 `ValueTask` 转换为 `Task`，然后在该引用 `Task` 对象上进行阻塞。

另外请注意，每个 `ValueTask` 只能被消费（consumed）一次。这里的单词 “消费（consume）” 意味着 `ValueTask` 可以异步等待（`await`）操作完成，或者利用 `AsTask` 将 `ValueTask` 转换为 `Task`。但是，`ValueTask` 只应被消费（consumed）一次，然后 `ValueTask<T>` 应被忽略。

## C# 中的 ValueTask 示例

假设有一个异步方法返回一个 `Task`。你可以利用 `Task.FromResult` 创建 `Task` 对象，如下面给出的代码片段所示。

```csharp
public Task<int> GetCustomerIdAsync()
{
    return Task.FromResult(1);
}
```

上面的代码片段并没有创建整个异步状态机制，但它在托管堆（`managed heap`）中分配了一个 `Task` 对象。为了避免这种分配，您可能希望利用 `ValueTask` 代替，像下面给出的代码片段所示的那样。

```csharp
public ValueTask<int> GetCustomerIdAsync()
{
    return new ValueTask<int>(1);
}
```

下面的代码片段演示了 `ValueTask` 的同步实现。

```csharp
public interface IRepository<T>
{
    ValueTask<T> GetData();
}
```

`Repository` 类扩展了 `IRepository` 接口，并实现了如下所示的方法。

```csharp
public class Repository<T> : IRepository<T>
{
    public ValueTask<T> GetData()
    {
        var value = default(T);
        return new ValueTask<T>(value);
    }
}
```

下面是如何从 `Main` 方法调用 `GetData` 方法。

```csharp
static void Main(string[] args)
{
    IRepository<int> repository = new Repository<int>();
    var result = repository.GetData();
    if (result.IsCompleted)
        Console.WriteLine("Operation complete...");
    else
        Console.WriteLine("Operation incomplete...");
    Console.ReadKey();
}
```

现在让我们将另一个方法添加到我们的存储库（repository）中，这次是一个名为 `GetDataAsync` 的异步方法。以下是修改后的 `IRepository` 接口的样子。

```csharp
public interface IRepository<T>
{
    ValueTask<T> GetData();

    ValueTask<T> GetDataAsync();
}
```

`GetDataAsync` 方法由 `Repository` 类实现，如下面给出的代码片段所示。

```csharp
public class Repository<T> : IRepository<T>
{
    public ValueTask<T> GetData()
    {
        var value = default(T);
        return new ValueTask<T>(value);
    }

    public async ValueTask<T> GetDataAsync()
    {
        var value = default(T);
        await Task.Delay(100);
        return value;
    }
}
```

## C# 中应该在什么时候使用 ValueTask ?

尽管 `ValueTask` 提供了一些好处，但是使用 `ValueTask` 代替 `Task` 有一定的权衡。`ValueTask` 是具有两个字段的值类型，而 `Task` 是具有单个字段的引用类型。因此，使用 `ValueTask` 意味着要处理更多的数据，因为方法调用将返回两个数据字段而不是一个。另外，如果您等待(`await`)一个返回 `ValueTask` 的方法，那么该异步方法的状态机也会更大，因为它必须容纳一个包含两个字段的结构体而不是在使用 `Task` 时的单个引用。

此外，如果异步方法的使用者使用 `Task.WhenAll` 或者 `Task.WhenAny`，在异步方法中使用 `ValueTask<T>` 作为返回类型可能会代价很高。这是因为您需要使用 `AsTask` 方法将 `ValueTask<T>` 转换为 `Task<T>`，这将引发一个分配，而如果使用起初缓存的 `Task<T>`，则可以轻松避免这种分配。

**经验法则是这样的：当您有一段代码总是异步的时，即当操作（总是）不能立即完成时，请使用 `Task`。当异步操作的结果已经可用时，或者当您已经缓存了结果时，请利用 `ValueTask`。不管怎样，在考虑使用 `ValueTask` 之前，您都应该执行必要的性能分析。**

<br/>

> `ValueTask` 是 `readonly struct` 类型，`Task` 是 `class` 类型。  
> 相关链接：[C# 中 Struct 和 Class 的区别总结](https://mp.weixin.qq.com/s/wVikRMfc4BbrB6WbDy1gXw)。

<br/>

> 作者 ： [Joydip Kanjilal](https://www.infoworld.com/author/Joydip-Kanjilal/)   
> 译者 ： 技术译民   
> 出品 ： [技术译站](https://ittranslator.cn/)   
> 链接 ： [英文原文](https://www.infoworld.com/article/3565433/how-to-use-valuetask-in-csharp.html)

