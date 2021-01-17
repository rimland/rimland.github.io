---
layout: post
title:  "Working with the Dynamic Type in C#"
date:   2020-08-10 00:10:00 +0800
categories: dotnet csharp
published: true
---

> 翻译自 Camilo Reyes 2018年10月15日的文章 [《Working with the Dynamic Type in C#》](https://www.red-gate.com/simple-talk/dotnet/c-programming/working-with-the-dynamic-type-in-c/)  

<br />

> .NET 4 中引入了动态类型。动态对象使您可以处理诸如 JSON 文档之类的结构，这些结构的组成可能要到运行时才能知道。在本文中，Camilo Reyes 解释了如何使用动态类型。

.NET 4.0 中引入的 `dynamic` 关键字带来了 C# 编程的范式转变。对于 C# 程序员来说，强类型系统之上的动态行为可能会让人感到不适 —— 当您在编译过程中失去类型安全性时，这似乎是一种倒退。

动态编程可能使您面临运行时错误。声明一个在执行过程中会发生变化的动态变量是可怕的，当开发人员对数据做出错误的假设时，代码质量就会受到影响。

对 C# 程序员来说，避免代码中的动态行为是合乎逻辑的。具有强类型的经典方法有很多好处。通过类型检查得到的数据类型的良好反馈对于正常运行的程序是至关重要的。一个好的类型系统可以传达意图并减少代码中的歧义。

随着动态语言运行时（Dynamic Language Runtime，DLR）的引入，这对 C# 意味着什么呢？ .NET 提供了丰富的类型系统，可用于编写企业级软件。让我们仔细看看 `dynamic` 关键字，并探索一下它的功能。

## 类型层次结构

<!-- Every type in the Common Language Runtime (CLR) inherits from System.Object. Now, read that last sentence again until you internalize this. This means the object type is the common parent to the entire type system. This fact alone aids us when we get to more exotic dynamic behavior. The idea here is to develop this ‘code-sense’, so you know how to navigate around dynamic types in C#. -->

公共语言运行时（Common Language Runtime，CLR）中的每种类型都继承自 `System.Object`。 现在，再次阅读最后一句话，直到将其铭记于心。这意味着 `object` 类型是整个类型系统的公共父类。当我们研究更神奇的动态行为时，这一事实本身就能为我们提供帮助。这里的想法是开发这种“代码感”，这样您就会知道如何驾驭 C# 中的动态类型。

为了演示这一点，你可以编写以下程序：

```csharp
Console.WriteLine("long inherits from ValueType: " + typeof(long).IsSubclassOf(typeof(ValueType)));
```

<!-- I will omit using statements until the end of this article to keep code samples focused. Then, I will go over each namespace and what it does. This keeps me from having to repeat myself and provides an opportunity to review all types. -->

我将忽略 `using` 语句直到本文结束，以保持对代码示例的专注。然后，我将介绍每个命名空间及其作用。这使我不必重复自己，并提供了一个回顾所有类型的机会。

<!-- The code above evaluates to True inside the console. The long type in .NET is a value type, so it’s more like an enumeration or a struct. The ValueType overrides the default behavior that comes from the object class. ValueType descendants go on the stack which have a short lifetime and are more efficient. -->

上面的代码在控制台中的运算结果为 `True`。.NET 中的 `long` 类型是值类型，因此它更像是枚举或结构体。`ValueType` 覆盖来自 `object` 类的默认行为。`ValueType` 的子类在栈（stack）上运行，它们的生命周期较短，效率更高。

要验证 `ValueType` 是继承 `System.Object` 的，请执行以下代码：

```csharp
Console.WriteLine("ValueType inherits from System.Object: " + typeof(ValueType).IsSubclassOf(typeof(Object)));
```

它的运算结果为 `True`。这是一个可以追溯到 `System.Object` 的继承链。对于值类型，链中至少有两个父级。

看一下从 `System.Object` 派生的另一种 C# 类型，例如：

```csharp
Console.WriteLine("string inherits from System.Object: " + typeof(string).IsSubclassOf(typeof(Object)));
```

<!-- This code spits out True in the console. Another type that inherits from the object are reference types. Reference types get allocated on the heap and undergo garbage collection. The CLR manages reference types and deallocates them from the heap when necessary. -->

此代码在控制台中显示 `True`。从 `object` 继承的另一种类型是引用类型。引用类型在堆（heap）上分配并进行垃圾回收。CLR 管理着引用类型，并在必要时从堆中释放它们。

查看下图，您可以直观地看到 CLR 的类型系统：

![CLR’s type system](/assets/images/202101/clr-type-system.png)
<!-- 
Both value and reference types are the basic building blocks of the CLR. This elegant type system predates both .NET 4.0 and dynamic types. I recommend keeping this figure in your mind’s eye when you work with types in C#. So how does the DLR fit into this picture? -->

值类型和引用类型都是 CLR 的基本构建块。这种优雅的类型系统在 .NET 4.0 和动态类型之前就有了。我建议您在使用 C# 中的类型时，在脑海中记住这张图。那么，DLR 是如何适应这张图的呢?

## 动态语言运行时（DLR）

动态语言运行时（DLR）是使用动态对象的便捷方法。例如，假设您有 XML 或 JSON 格式的数据，其中的成员事先并不知道。DLR 允许您使用自然代码来处理对象和访问成员。

For C#, this enables working with libraries where types aren’t known at compile time. A dynamic type eliminates magic strings in code for a natural API. This unlocks dynamic languages that sit on top of the CLR such as IronPython.

对于 C#，这允许您可以使用在编译时不知道类型的库。动态类型消除了自然 API 代码中的万能字符串。这就开启了像 IronPython 一样位于 CLR 之上的动态语言。



<br />

> 作者 ： Camilo Reyes  
> 译者 ： 技术译民  
> 出品 ： [技术译站](https://ittranslator.cn/)  
> 链接 ： [英文原文](https://www.red-gate.com/simple-talk/dotnet/c-programming/working-with-the-dynamic-type-in-c/)
