---
layout: post
title:  "C# 中 ConcurrentDictionary 一定线程安全吗？"
date:   2020-12-21 00:10:00 +0800
categories: dotnet csharp
published: true
---

根据 [.NET 官方文档](https://docs.microsoft.com/en-us/dotnet/api/system.collections.concurrent.concurrentdictionary-2)的定义：*`ConcurrentDictionary<TKey,TValue>` Class* 表示可由多个线程同时访问的线程安全的键/值对集合。这也是我们在并发任务中比较常用的一个类型，但它真的是绝对线程安全的吗？

[^dic]: <https://docs.microsoft.com/en-us/dotnet/api/system.collections.concurrent.concurrentdictionary-2> ConcurrentDictionary Class

仔细阅读官方文档，我们会发现在文档的底部*线程安全性*小节里这样描述：

> `ConcurrentDictionary<TKey,TValue>` 的所有公共和受保护的成员都是线程安全的，可从多个线程并发使用。但是，通过一个由 `ConcurrentDictionary<TKey,TValue>` 实现的接口的成员（包括扩展方法）访问时，不保证其线程安全性，并且可能需要由调用方进行同步。

也就是说，调用 ConcurrentDictionary 本身的方法和属性可以保证都是线程安全的。但是由于 ConcurrentDictionary 实现了一些接口（例如 ICollection、IEnumerable 和 IDictionary 等），使用这些接口的成员（或者这些接口的扩展方法）不能保证其线程安全性。`System.Linq.Enumerable.ToList` 方法就是其中的一个例子，该方法是 `IEnumerable` 的一个扩展方法，在 ConcurrentDictionary 实例上使用该方法，当它被其它线程改变时可能抛出 `System.ArgumentException` 异常。下面是一个简单的示例：

```csharp
static void Main(string[] args)
{
    var cd = new ConcurrentDictionary<int, int>();
    Task.Run(() =>
    {
        var random = new Random();
        while (true)
        {
            var value = random.Next(10000);
            cd.AddOrUpdate(value, value, (key, oldValue) => value);
        }
    });

    while (true)
    {
        cd.ToList(); //调用 System.Linq.Enumerable.ToList，抛出 System.ArgumentException 异常
    }
}
```

`System.Linq.Enumerable.ToList` 扩展方法：

![System.Linq.Enumerable.ToList](/assets/images/202012/System.Linq.Enumerable.ToList.png)

发生异常是因为扩展方法 `ToList` 中调用了 `List` 的构造函数，该构造函数接收一个 `IEnumerable<T>` 类型的参数，且该构造函数中有一个对 `ICollection<T>` 的优化（由 ConcurrentDictionary 实现的）。

`System.Collections.Generic.List<T>` 构造函数：

![System.Collections.Generic.List](/assets/images/202012/System.Collections.Generic.List_Construction.png)

在 `List` 的构造函数中，首先通过调用 `Count` 获取字典的大小，然后以该大小初始化数组，最后调用 `CopyTo` 将所有 `KeyValuePair` 项从字典复制到该数组。因为字典是可以由多个线程改变的，在调用 `Count` 后且调用 `CopyTo` 前，字典的大小可以增加或者减少。当 `ConcurrentDictionary` 试图访问数组超出其边界时，将引发 `ArgumentException` 异常。

ConcurrentDictionary<TKey,TValue> 中实现的 ICollection.CopyTo 方法：
![ConcurrentDictionary-CopyTo-ArgumentException](/assets/images/202012/ConcurrentDictionary-CopyTo-ArgumentException.png)

<hr />

如果您只需要一个包含字典所有项的单独集合，可以通过调用 `ConcurrentDictionary.ToArray` 方法来避免此异常。它完成类似的操作，但是操作之前先获取了字典的所有内部锁，保证了线程安全性。

![ConcurrentDictionary-ToArray](/assets/images/202012/ConcurrentDictionary-ToArray.png)

注意，不要将此方法与 `System.Linq.Enumerable.ToArray` 扩展方法混淆，调用 `Enumerable.ToArray` 像 `Enumerable.ToList` 一样，可能引发 `System.ArgumentException` 异常。

看下面的代码中：

```csharp
static void Main(string[] args)
{
    var cd = new ConcurrentDictionary<int, int>();
    Task.Run(() =>
    {
        var random = new Random();
        while (true)
        {
            var value = random.Next(10000);
            cd.AddOrUpdate(value, value, (key, oldValue) => value);
        }
    });

    while (true)
    {
        cd.ToArray(); //ConcurrentDictionary.ToArray, OK.
    }
}
```

此时调用 `ConcurrentDictionary.ToArray`，而不是调用 `Enumerable.ToArray`，因为后者是一个扩展方法，前者重载解析的优先级高于后者。所以这段代码不会抛出异常。

但是，如果通过字典实现的接口（继承自 IEnumerable）使用字典，将会调用 `Enumerable.ToArray` 方法并抛出异常。例如，下面的代码显式地将 `ConcurrentDictionary` 实例分配给一个 `IDictionary` 变量：

```csharp
static void Main(string[] args)
{
    System.Collections.Generic.IDictionary<int, int> cd = new ConcurrentDictionary<int, int>();
    Task.Run(() =>
    {
        var random = new Random();
        while (true)
        {
            var value = random.Next(10000);
            cd[value] = value;
        }
    });

    while (true)
    {
        cd.ToArray(); //调用 System.Linq.Enumerable.ToArray，抛出 System.ArgumentException 异常
    }
}
```

此时调用 `Enumerable.ToArray`，就像调用 `Enumerable.ToList` 时一样，引发了 `System.ArgumentException` 异常。

## 总结

正如官方文档上所说的那样，ConcurrentDictionary 的所有公共和受保护的成员都是线程安全的，可从多个线程并发调用。但是，通过一个由 ConcurrentDictionary 实现的接口的成员（包括扩展方法）访问时，并不是线程安全的，此时要特别注意。

如果需要一个包含字典所有项的单独集合，可以通过调用 `ConcurrentDictionary.ToArray` 方法得到，千万不能使用扩展方法 `ToList`，因为它不是线程安全的。

<hr />

**参考：**

- <http://blog.i3arnon.com/2018/01/16/concurrent-dictionary-tolist/> ConcurrentDictionary Is Not Always Thread-Safe
- <https://docs.microsoft.com/en-us/dotnet/api/system.collections.concurrent.concurrentdictionary-2> ConcurrentDictionary<TKey,TValue> Class

<br />

> 作者 ： 技术译民  
> 出品 ： [技术译站](https://ittranslator.cn/)
