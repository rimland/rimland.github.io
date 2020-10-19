---
layout: post
title:  "C# 8: 默认接口方法"
date:   2020-10-19 00:20:00 +0800
categories: dotnet csharp
published: true
---

> 翻译自 John Demetriou 2018年8月4日 的文章 《C# 8: Default Interface Methods》[^1]

[^1]: <https://www.devsanon.com/c/c-8-default-interface-methods/>   C# 8: Default Interface Methods

## C# 8 之前

今天我们来聊一聊默认接口方法。听起来真的很奇怪，不是吗？接口仅用于定义契约。接口的实现类会拥有一组公共方法，不过实现类被赋予了以其自己的方式实现每个方法的自由。目前为止，如果我们还需要为这些方法中的一个或多个方法提供实现，我们将使用继承。  
如果我们希望这个类不是实现所有方法，而只是实现其中的一个子集，我们可以将这些方法和类本身抽象(`abstract`)。

例如，我们不能这么写：

```csharp
interface IExample
{
    void Ex1();                                      // 允许
    void Ex2() => Console.WriteLine("IExample.Ex2"); // 不允许(C# 8 以前)
}
```

我们不得不用下面的抽象类来替代：

```csharp
abstract class ExampleBase
{
    public abstract void Ex1();
    public void Ex2() => Console.WriteLine("ExampleBase.Ex2");
}
```

不过还好，这已经足够满足我们的大部分需求了。

## C# 8 之后

那么，有什么改变吗?为什么我们需要引入这个新特性？我们错过了什么并且从未注意到我们错过了什么？  

### 菱形问题

由于菱形问题[^diamond]，C#（以及许多其他语言）不支持多重继承。为了允许多重继承，同时避免菱形问题，C# 8 引入了默认接口方法。

[^diamond]: <https://ittranslator.cn/dotnet/csharp/2020/10/19/multiple-inheritance-and-the-diamond-problem.html>  菱形问题

从 C# 8 开始，使用默认接口方法，您可以拥有一个接口定义，以及该定义中某些或所有方法的默认实现。

```csharp
interface IExample
{
    void Ex1();                                      // 允许
    void Ex2() => Console.WriteLine("IExample.Ex2"); // 允许
}
```

因此，现在您可以实现一个含有已实现方法的接口，并且可以避免希望从特定类（也包含通用方法）继承的类中的代码重复。  

使用默认接口方法，菱形问题并没得到百分之百解决。当一个类继承自从第三个接口继承而来的两个接口，并且所有接口都实现了相同方法时，仍然可能发生这种情况。  
在这种情况下，C# 编译器将根据当前上下文选择调用适当的方法。如果无法推断出特定的哪一个，则会显示编译错误。  

例如，假设我们有以下接口：

```csharp
interface IA
{
    void DoSomething();
}

interface IB : IA
{
    void DoSomething() => Console.WriteLine("I am Interface B");
}

interface IC : IA
{
    void DoSomething() => Console.WriteLine("I am Interface C");
}
```

然后，我创建一个实现上述两个接口的类 `D`，会引发一个编译错误：

```csharp
//编译器提示：“D”未实现接口成员“IA.DoSomething()”
public class D : IB, IC 
{ }
```

但是，如果类 `D` 实现它自己版本的 `DoSomething` 方法，那么编译器将知道调用哪个方法：

```csharp
public class D : IB, IC
{
    public void DoSomething() => Console.WriteLine("I am Class D");
}
```

若 Main 方法代码如下：

```csharp
static void Main()
{
    var x = new D();
    x.DoSomething();
    Console.ReadKey();
}
```

运行程序，控制台窗口输出：`I am Class D`。

### 其他益处

使用方法的默认接口实现，API 提供者可以扩展现有接口而不会破坏遗留代码的任何部分。

### Trait 模式

> 译者注：  
> 在计算机编程中，特征（**Trait**）是面向对象编程中使用的一个概念，它表示可用于扩展类的功能的一组方法。[^trait]

[^trait]: <https://en.wikipedia.org/wiki/Trait_(computer_programming)>  Trait  

Trait 模式大体上就是多个类需要的一组方法。  
在此之前，C# 中的 Trait 模式是使用抽象类实现的。但是由于多重继承不可用，实现 Trait 模式变得非常棘手，所以大多数人要么避开它，要么迷失在一个巨大的继承链中。

不过，在接口中使用默认方法实现，这将发生改变。我们可以通过在接口中使用默认接口方法实现，提供一组需要类拥有的方法，然后让这些类继承此接口。  
当然，任何一个类都可以用它们自己的实现覆盖这些方法，但是以防它们不希望这么做，我们为它们提供了一组默认的实现。

<br />

> 作者 ： [John Demetriou](https://www.devsanon.com/whoami/)  
> 译者 ： 技术译民  
> 出品 ： [技术译站](https://ittranslator.cn/)  
> 链接 ： [英文原文](https://www.devsanon.com/c/c-8-default-interface-methods/)