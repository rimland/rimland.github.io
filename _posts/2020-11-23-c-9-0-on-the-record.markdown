---
layout: post
title:  "C# 9.0 正式发布（C# 9.0 on the record）"
date:   2020-11-23 00:10:00 +0800
categories: dotnet csharp
published: false
---

> 翻译自 Mads Torgersen 2020年11月10日的博文[《C# 9.0 on the record》](https://devblogs.microsoft.com/dotnet/c-9-0-on-the-record/)，Mads Torgersen 是微软 C# 语言的首席设计师，也是微软 .NET 团队的项目群经理。

## C# 9.0 正式发布

It’s official: C# 9.0 is out! Back in May I blogged about the C# 9.0 plans, and the following is an updated version of that post to match what we actually ended up shipping.

With every new version of C# we strive for greater clarity and simplicity in common coding scenarios, and C# 9.0 is no exception. One particular focus this time is supporting terse and immutable representation of data shapes.

正式宣布：C# 9.0 发布了！ 早在5月，我就写了一篇关于 C# 9.0 计划的博文，以下是该帖子的更新版本，以匹配我们最终实际交付的产品。

对于 C# 的每一个新版本，我们都在努力让常见编码场景的实现变得更加清晰和简单，C# 9.0 也不例外。这次特别关注的是支持数据模型的简洁和不可变表示。

## 一、仅初始化属性（Init-only properties）

对象初始化器非常棒。它们为类型的客户端提供了一种非常灵活和易读的格式来创建对象，并且特别适合于嵌套对象的创建，让你可以一次性创建整个对象树。这里有一个简单的例子：

```csharp
var person = new Person { FirstName = "Mads", LastName = "Torgersen" };
```

对象初始化器还使类型作者不必编写大量的构造函数——他们所要做的就是编写一些属性！

```csharp
public class Person
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
}
```

目前最大的限制是属性必须是*可变的（即可写的）*，对象初始化器才能工作：它们首先调用对象的构造函数(本例中是默认的无参数构造函数)，然后赋值给属性 `setter`。

仅初始化(init-only)属性解决了这个问题！它引入了一个 `init` 访问器，它是 `set` 访问器的变体，只能在对象初始化时调用：

```csharp
public class Person
{
    public string? FirstName { get; init; }
    public string? LastName { get; init; }
}
```

有了这个声明，上面的客户端代码仍然是合法的，但是随后对  `FirstName` 和 `LastName` 属性的任何赋值都是错误的：

```csharp
var person = new Person { FirstName = "Mads", LastName = "Nielsen" }; // OK
person.LastName = "Torgersen"; // ERROR!
```

因此，仅初始化属性可在初始化完成后保护对象的状态免遭突变。

### 初始化访问器和只读字段（Init accessors and readonly fields）

Because init accessors can only be called during initialization, they are allowed to mutate readonly fields of the enclosing class, just like you can in a constructor.

因为 `init` 访问器只能在初始化期间调用，所以允许它们更改封闭类的只读(`readonly`)字段，就像在构造函数中一样。

```csharp
public class Person
{
    private readonly string firstName = "<unknown>";
    private readonly string lastName = "<unknown>";

    public string FirstName
    {
        get => firstName;
        init => firstName = (value ?? throw new ArgumentNullException(nameof(FirstName)));
    }
    public string LastName
    {
        get => lastName;
        init => lastName = (value ?? throw new ArgumentNullException(nameof(LastName)));
    }
}
```

## 二、记录（Records）

At the core of classic object-oriented programming is the idea that an object has strong identity and encapsulates mutable state that evolves over time. C# has always worked great for that, But sometimes you want pretty much the exact opposite, and here C#’s defaults have tended to get in the way, making things very laborious.

经典的面向对象编程的核心思想是，对象具有强大的身份并封装了随时间演变的可变状态。 C# 在这方面一直都很出色，但是有时您想要的恰恰相反，而在此时，C# 的默认设置往往会妨碍工作，使事情变得非常麻烦。

If you find yourself wanting the whole object to be immutable and behave like a value, then you should consider declaring it as a record:

<!-- 如果您想使单个属性不可变，那么仅初始化(init-only)属性是极好的。 -->
如果您发现自己希望整个对象是不可变的，并且行为像一个值，那么您应该考虑将其声明为*记录(record)*：

```csharp
public record Person
{
    public string? FirstName { get; init; }
    public string? LastName { get; init; }
}
```

记录仍然是类，但是 `record` 关键字赋予了它一些另外的类似于值的行为。 一般来说，记录是根据其内容而不是其标识来定义的。 在这点上，记录更接近于结构体，但是记录仍然是引用类。型。

虽然记录是可变的，但它们主要是为更好地支持不可变数据模型而构建的。

### `with` 表达式（With-expressions）

When working with immutable data, a common pattern is to create new values from existing ones to represent a new state. For instance, if our person were to change their last name we would represent it as a new object that’s a copy of the old one, except with a different last name. This technique is often referred to as non-destructive mutation. Instead of representing the person over time, the record represents the person’s state at a given time. To help with this style of programming, records allow for a new kind of expression; the with-expression:

处理不可变数据时，一种常见的模式是从现有值创建新值以表示新状态。例如，如果我们的 `person` 要更改他们的 `LastName`，我们会将其表示为一个新对象，该对象是旧对象的副本，只是有不同的 `LastName`。这种技巧通常被称之为*非破坏性突变(non-destructive mutation)*。记录(`record`)不是代表 `person` *在一段时间内的* 状态，而是代表 `person` *在给定时间点的* 状态。

为了帮助实现这种编程风格，记录(`record`)允许使用一种新的表达式 —— `with` 表达式：

```csharp
var person = new Person { FirstName = "Mads", LastName = "Nielsen" };
var otherPerson = person with { LastName = "Torgersen" };
```

`with` 表达式使用对象初始化器语法来声明新对象与旧对象的不同之处。您可以指定多个属性。

The with-expression works by actually copying the full state of the old object into a new one, then mutating it according to the object initializer. This means that properties must have an init or set accessor to be changed in a with-expression.

`with` 表达式的工作原理是将旧对象的完整状态实际复制到一个新对象中，然后根据对象初始化设定项对其进行改变。这意味着属性必须具有 `init` 或 `set` 访问器才能在 `with` 表达式中进行更改。

### 基于值的相等（Value-based equality）

所有对象都从对象类(`object`)继承一个虚的 `Equals(object)` 方法。这被用作是当两个参数都是非空(`non-null`)时，静态方法 `Object.Equals(object, object)` 的基础。

结构体重写了 `Equals(object)` 方法，通过递归地在结构体的每一个字段上调用 `Equals` 来比较结构体的每一个字段，从而实现了“基于值的相等”。**记录(`record`)是一样的。**

这意味着，根据它们的“值性(value-ness)”，两个记录(`record`)对象可以彼此相等，而不是*同一个*对象。例如，如果我们将被修改 `person` 的 `LastName` 改回去：

```csharp
var originalPerson = otherPerson with { LastName = "Nielsen" };
```

<!-- We would now have ReferenceEquals(person, originalPerson) = false (they aren’t the same object) but Equals(person, originalPerson) = true (they have the same value). Along with the value-based Equals there’s also a value-based GetHashCode() override to go along with it. 
Additionally, records implement IEquatable<T> and overload the `==` and `!=` operators, so that the value-based behavior shows up consistently across all those different equality mechanisms. -->

现在我们将得到 `ReferenceEquals(person, originalPerson)` = `false`(它们不是同一个对象)，但是 `Equals(person, originalPerson)` = `true`(它们有相同的值)。除了基于值的 `Equals` 之外，还有一个基于值的 `GetHashCode()` 重写。另外，记录实现了 `IEquatable<T>` 并且重载 `==` 和 `!=` 操作符，因此基于值的行为在所有这些不同的相等机制中表现一致。

<!-- Value equality and mutability don’t always mesh well. One problem is that changing values could cause the result of GetHashCode to change over time, which is unfortunate if the object is stored in a hash table! We don’t disallow mutable records, but we discourage them unless you have thought through the consequences! -->

值的相等性和可变性并不总是很好地融合在一起。一个问题是，更改值可能导致 `GetHashCode` 的结果随时间变化，如果对象存储在哈希表中，这是很不幸的！我们不会禁止使用可变记录，但是我们不鼓励它们，除非您充分考虑过后果!


<!-- 如果您不喜欢生成的 `Equals` 重写的默认逐个字段比较的行为，您可以自己编写。您只需要注意理解“基于值的相等”是如何在记录(`record`)中工作的，特别是在涉及继承时，我们后面会讲到。 -->

### 继承（Inheritance）












<br/>

> 作者 ： Mads Torgersen  
> 译者 ： 技术译民  
> 出品 ： [技术译站](https://ittranslator.cn/)  
> 链接 ： [英文原文](https://devblogs.microsoft.com/dotnet/c-9-0-on-the-record/)