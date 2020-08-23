---
layout: post
title:  "欢迎来到 C＃ 9.0（Welcome to C# 9.0）"
date:   2020-08-24 00:10:00 +0800
categories: dotnet csharp
published: true
---

> 翻译自 Mads Torgersen 2020年5月20日的博文[《Welcome to C# 9.0》](https://devblogs.microsoft.com/dotnet/welcome-to-c-9-0/)，Mads Torgersen 是微软 C# 语言的首席设计师，也是微软 .NET 团队的项目群经理。



C# 9.0 正在成形，我想和大家分享一下我们对下一版本语言中添加的一些主要特性的想法。

对于 C# 的每一个新版本，我们都在努力让常见的编码场景的实现变得更加清晰和简单，C# 9.0 也不例外。这次特别关注的是支持数据模型的简洁和不可变表示。

就让我们一探究竟吧!

## 一、仅初始化(init-only)属性

对象初始化器非常棒。它们为类型的客户端提供了一种非常灵活和可读的格式来创建对象，并且特别适合于嵌套对象的创建，让你可以一次性创建整个对象树。这里有一个简单的例子：

```csharp
new Person
{
    FirstName = "Scott",
    LastName = "Hunter"
}
```

对象初始化器还使类型作者不必编写大量的构造函数——他们所要做的就是编写一些属性！

```csharp
public class Person
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
}
```

目前最大的限制是属性必须是可变的（即可写的），对象初始化器才能工作：它们首先调用对象的构造函数(本例中是默认的无参数构造函数)，然后赋值给属性 `setter`。

仅初始化(init-only)属性解决了这个问题！它引入了一个 `init` 访问器，它是 `set` 访问器的变体，只能在对象初始化时调用：

```csharp
public class Person
{
    public string FirstName { get; init; }
    public string LastName { get; init; }
}
```

有了这个声明，上面的客户端代码仍然是合法的，但是随后对  `FirstName` 和 `LastName` 属性的任何赋值都是错误的。

### 初始化(`init`) 访问器和只读(`readonly`)字段

因为 `init` 访问器只能在初始化期间调用，所以允许它们更改封闭类的只读(`readonly`)字段，就像在构造函数中一样。

```csharp
public class Person
{
    private readonly string firstName;
    private readonly string lastName;
    
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

## 二、记录（record）

> 译者注：<br />
> 原文中声明一个记录的 `data class **` 联合关键字现在已经变成 `record` 关键字了，所以翻译过程中做了修正。

如果您想使单个属性不可变，那么仅初始化(init-only)属性是极好的。如果您想要整个对象是不可变的，行为像一个值，那么你应该考虑声明它为一个*记录(record)*：

```csharp
public record Person
{
    public string FirstName { get; init; }
    public string LastName { get; init; }
}
```

<!-- 类声明前的 `data` 关键字将其标记为一条记录(`record`)。-->
对于记录(`record`)，赋予了它一些类似值的行为，我们将在下面深入探讨。一般来说，记录更应该被看作是“值”——数据(`data`)，而不是对象！它们并不具有可变的封装状态，相反，您需要通过创建表示新状态的新记录来表示其随时间的变化。它们不是由它们的身份(identity)确定的，而是由它们的内容确定的。 

### `with` 表达式

当使用不可变数据(`data`)时，一种常见的模式是从现有的值中创建新值来表示新状态。例如，如果我们的 `person` 要更改他们的 `LastName`，我们会将其表示为一个新对象，该对象是旧对象的副本，只是有不同的 `LastName`。这种技巧通常被称之为*非破坏性突变(non-destructive mutation)*。记录(`record`)不是代表 `person` *在一段时间内的* 状态，而是代表 `person` *在给定时间点的* 状态。

为了帮助实现这种编程风格，记录(`record`)允许使用一种新的表达式 —— `with` 表达式：

```csharp
var otherPerson = person with { LastName = "Hanselman" };
```

`with` 表达式使用对象初始化器语法来声明新对象与旧对象的不同之处。您可以指定多个属性。

记录(`record`)隐式定义了一个受保护的(`protected`)“复制构造函数”——一个接受现在有记录对象并逐字段将其复制到新记录对象的构造函数：

```csharp
protected Person(Person original) { /* copy all the fields */ } // generated
```

`with` 表达式会调用“复制构造函数”，然后在上面应用对象初始化器来相应地变更属性。

如果您不喜欢生成的“复制构造函数”的默认行为，您可以定义自己的“复制构造函数”，它将被 `with` 表达式捕获。

### 基于值的相等（value-based equality）

所有对象都从对象类(`object`)继承一个虚的 `Equals(object)` 方法。这被用作是当两个参数都是非空(`non-null`)时，静态方法 `Object.Equals(object, object)` 的基本原则。

结构体重写了 `Equals(object)` 方法，通过递归地在结构体的每一个字段上调用 `Equals` 来比较结构体的每一个字段，从而实现了“基于值的相等”。**记录(`record`)是一样。**

这意味着，根据它们的“值性(value-ness)”，两个记录(`record`)对象可以彼此相等，而不是*同一个*对象。例如，如果我们将被修改 `person` 的 `LastName` 改回去：

```csharp
var originalPerson = otherPerson with { LastName = "Hunter" };
```

现在我们将得到 `ReferenceEquals(person, originalPerson)` = `false`(它们不是同一个对象)，但是 `Equals(person, originalPerson)` = `true`(它们有相同的值)。

如果您不喜欢生成的 `Equals` 重写的默认逐个字段比较的行为，您可以自己编写。您只需要注意理解“基于值的相等”是如何在记录(`record`)中工作的，特别是在涉及继承时，我们后面会讲到。

除了基于值的 `Equals` 之外，还有一个基于值的 `GetHashCode()` 重写。

### 数据成员（Data members）

绝大多数情况下，记录(`record`)都是不可变的，仅初始化(init-only)公共属性可以通过 `with` 表达式进行非破坏性修改。为了对这种常见情况进行优化，记录(`record`)更改了 `string FirstName` 这种形式的简单成员声明的默认含义，与其他类和结构体声明中的隐式私有字段不同，它被当作是一个公共的、仅初始化(init-only) 自动属性的简写！因此，声明：

```csharp
public record Person { string FirstName; string LastName; }
```

与我们之前的声明意思完全一样，即等同于声明：

```csharp
public record Person
{
    public string FirstName { get; init; }
    public string LastName { get; init; }
}
```

我们认为这有助于形成漂亮而清晰的记录(`record`)声明。如果您确实需要私有字段，只需显式添加 `private` 修饰符：

```csharp
private string firstName;
```

### 位置记录（Positional records）

有时，对记录(`record`)采用位置更明确的方法是有用的，其中它的内容是通过构造函数参数提供的，并且可以通过位置解构来提取。

完全可以在记录(`record`)中指定自己的构造函数和解构函数：

```csharp
public record Person 
{ 
    string FirstName; 
    string LastName; 
    public Person(string firstName, string lastName) 
      => (FirstName, LastName) = (firstName, lastName);
    public void Deconstruct(out string firstName, out string lastName) 
      => (firstName, lastName) = (FirstName, LastName);
}
```

但是有一种更简短的语法来表达完全相同的意思（参数名称包装模式`modulo casing of parameter names`）：

```csharp
public record Person(string FirstName, string LastName);
```

它声明了公共的仅初始化(init-only)自动属性以及构造函数和解构函数，因此您就可以编写：

```csharp
var person = new Person("Scott", "Hunter"); // 用位置参数构造（positional construction）
var (f, l) = person;                        // 用位置参数解构（positional deconstruction）
```

如果不喜欢生成的自动属性，您可以定义自己同名的属性，生成的构造函数和解构函数将只使用您自定义的属性。

### 记录和可变性（Records and mutation）

记录(`record`)的基于值的语义不能很好地适应可变状态。想象一下，将一个记录(`record`)对象放入字典中。再次查找它依赖于 `Equals` 和 `GetHashCode`(有时)。但是如果记录改变了状态，它的 `Equals` 值也会随之改变，我们可能再也找不到它了！在哈希表实现中，它甚至可能破坏数据结构，因为位置是基于它的哈希码得到的。

记录(`record`)内部的可变状态或许有一些有效的高级用法，特别是对于缓存。但是重写默认行为以忽略这种状态所涉及的手工工作很可能是相当大的。

### `with` 表达式和继承（With-expressions and inheritance）

众所周知，基于值的相等和非破坏性突变与继承结合在一起时是极具挑战性的。让我们在运行示例中添加一个派生的记录(`record`)类 `Student`：

```csharp
public record Person { string FirstName; string LastName; }
public record Student : Person { int ID; }
```

然后，让我们从 `with` 表达式示例开始，实际地创建一个 `Student`，但将它存储在 `Person` 变量中：

```csharp
int newId = 1;
Func<int> GetNewId = () => ++newId;
//上面两上是译者在测试时发现需要添加的代码。

Person person = new Student { FirstName = "Scott", LastName = "Hunter", ID = GetNewId() };
otherPerson = person with { LastName = "Hanselman" };
```

在最后一行带 `with` 表达式的地方，编译器不知道 `person` 实际上包含 `Student`。然而，如果新的 `person`(即 `otherPerson`) 不是一个*真正的* `Student` 对象，并且具有从第一个 `person` 复制过去的相同的 `ID`，那么它就不是一个恰当的拷贝。

C# 实现了这一点。记录(`record`)有一个隐藏的虚方法（`virtual method`），它被委托“克隆”*整个*对象。每个派生记录类型都重写此方法以调用该类型的复制构造函数，并且派生记录的复制构造函数将链接到基记录的复制构造函数。`with` 表达式只需调用隐藏的“克隆”方法并将对象初始化器应用于其返回结果。

### 基于值的相等和继承（Value-based equality and inheritance）

与 `with` 表达式支持类似，基于值的相等也必须是“虚的(`virtual`)”，即 `Student` 需要比较 `Student` 的所有字段，即使比较时静态已知的类型是 `Person` 之类的基类型。这很容易通过重写虚的(`virtual`) `Equals` 方法来实现。

然而，关于相等还有一个额外的挑战：如果你比较两种不同的 `Person` 会怎样?我们不能仅仅让其中一个来决定实施哪个相等：相等应该是对称的，所以不管两个对象哪个在前面，结果应该是相同的。换句话说，它们必须在*相等*的实施上*达成一致*！

举例说明一下这个问题：

```csharp
Person person1 = new Person { FirstName = "Scott", LastName = "Hunter" };
Person person2 = new Student { FirstName = "Scott", LastName = "Hunter", ID = GetNewId() };
```

这两个对象相等吗？ `person1` 可能会认为相等，因为 `person2` 对于 `Person` 的所有属性都是正确的，但是 `person2` 不敢苟同！我们需要确保它们都同意它们是不同的对象。

同样，C# 会自动为您处理这个问题。实现的方式是，记录有一个名为 `EqualityContract` 的“虚的(`virtual`)”受保护的属性。每个派生记录(`record`)都会重写它，为了比较相等，这两个对象必须具有相同的 `EqualityContract`。

## 三、顶级程序（Top-level programs）

> 译者注：<br />
> 什么是 Top-level program ? 这是在顶级编写程序的一种更简单的方式：一个更简单的 `Program.cs` 文件。

用 C# 编写一个简单的程序需要大量的样板代码：

```csharp
using System;
class Program
{
    static void Main()
    {
        Console.WriteLine("Hello World!");
    }
}
```

这不仅对语言初学者来说是难以承受的，而且还会使代码混乱，增加缩进级别。

在 C# 9.0 中，您可以选择在顶级编写你的主程序(main program)：

```csharp
using System;

Console.WriteLine("Hello World!");
```

允许任何语句。文件中的此程序必须在 `using` 语句之后，任何类型或命名空间声明之前执行，并且只能在一个文件中执行。就像目前只能有一个 `Main` 方法一样。

如果您想返回一个状态码，您可以做。如果您想等待(`await`)，您可以做。如果您想访问命令行参数，`args` 可以作为一个“魔法”参数使用。

局部函数是语句的一种形式，也允许在顶级程序中使用。从顶级语句部分之外的任何地方调用它们都是错误的。

## 四、改进的模式匹配（Improved pattern matching）

C# 9.0 中添加了几种新的模式。让我们从[模式匹配教程](https://docs.microsoft.com/en-us/dotnet/csharp/tutorials/pattern-matching)的代码片段的上下文中来看看它们:

```csharp
public static decimal CalculateToll(object vehicle) =>
    vehicle switch
    {
       ...
       
        DeliveryTruck t when t.GrossWeightClass > 5000 => 10.00m + 5.00m,
        DeliveryTruck t when t.GrossWeightClass < 3000 => 10.00m - 2.00m,
        DeliveryTruck _ => 10.00m,

        _ => throw new ArgumentException("Not a known vehicle type", nameof(vehicle))
    };
```

### 简单类型模式（Simple type patterns）

目前，类型模式需要在类型匹配时声明一个标识符——即使该标识符是一个丢弃的 `_`，如上面的 `DeliveryTruck _` 所示。但现在你只需写下类型就可以了：

```csharp
DeliveryTruck => 10.00m,
```

### 关系模式（Relational patterns）

C# 9.0 引入了与关系运算符 `<`、`<=` 等相对应的模式。因此，现在可以将上述模式的 `DeliveryTruck` 部分编写为嵌套的 `switch` 表达式：

```csharp
DeliveryTruck t when t.GrossWeightClass switch
{
    > 5000 => 10.00m + 5.00m,
    < 3000 => 10.00m - 2.00m,
    _ => 10.00m,
},
```

这里的 `> 5000` 和 `< 3000` 是关系模式。

### 逻辑模式（Logical patterns）

最后，您可以将模式与逻辑运算符 `and`、`or` 和 `not` 组合起来，这些运算符用单词拼写，以避免与表达式中使用的运算符混淆。例如，上面嵌套的`switch`的示例可以按如下升序排列：

```csharp
DeliveryTruck t when t.GrossWeightClass switch
{
    < 3000 => 10.00m - 2.00m,
    >= 3000 and <= 5000 => 10.00m,
    > 5000 => 10.00m + 5.00m,
},
```

此例中间的案例使用 `and` 合并了两个关系模式，形成一个表示区间的模式。

`not` 模式的一个常见用法是将其应用于 `null` 常量模式，如 `not null`。例如，我们可以根据未知实例是否为空来拆分它们的处理：

```csharp
not null => throw new ArgumentException($"Not a known vehicle type: {vehicle}", nameof(vehicle)),
null => throw new ArgumentNullException(nameof(vehicle))
```

此外，`not` 在 `if` 条件中包含 `is` 表达式时将会很方便，可以取代笨拙的双括号，例如：

```csharp
if (!(e is Customer)) { ... }
```

您可以写成：

```csharp
if (e is not Customer) { ... }
```

## 五、改进的目标类型（Improved target typing）

“目标类型(`Target typing`)”是一个术语，当一个表达式从使用它的位置的上下文中获得它的类型时，我们使用这个术语。例如，`null` 和 `lambda`表达式始终是目标类型的。

在 C# 9.0 中，一些以前不是目标类型的表达式变得可以由其上下文推导。

### 目标类型的 `new` 表达式（Target-typed new expressions）

C# 中的 `new` 表达式总是要求指定类型（隐式类型的数组表达式除外）。现在，如果表达式被赋值为一个明确的类型，则可以省略该类型。

```csharp
Point p = new (3, 5);
```

### 目标类型的 **`??`** 和 **`?:`**（Target typed `??` and `?:`）

有时有条件的 `??` 和 `?:` 表达式在分支之间没有明显的共享类型，这种情况目前是失败的。但是如果有一个两个分支都可以转换成的目标类型，在 C# 9.0 中将是允许的。

```csharp
Person person = student ?? customer; // Shared base type
int? result = b ? 0 : null; // nullable value type
```


## 六、协变式返回值（Covariant returns）

有时候，派生类中的方法重写具有一个比基类型中的声明更具体（更明确）的返回类型，这样的表达是有用的。C# 9.0 允许：

```csharp
abstract class Animal
{
    public abstract Food GetFood();
    ...
}
class Tiger : Animal
{
    public override Meat GetFood() => ...;
}
```

## 更多内容……

要查看 C# 9.0 即将发布的全部特性并追随他们的完成，最好的地方是 Roslyn(C#/VB 编译器) GitHub 仓库上的 [Language Feature Status](https://github.com/dotnet/roslyn/blob/master/docs/Language%20Feature%20Status.md)。



<br/>

> 作者 ： Mads Torgersen <br/>
> 译者 ： 技术译民 <br/>
> 出品 ： [技术译站](https://ittranslator.cn/) <br/>
> 链接 ： [英文原文](https://devblogs.microsoft.com/dotnet/welcome-to-c-9-0/)

<!-- https://developerpublish.com/how-to-download-c-9-0-preview-install-and-try/ -->
<!-- https://morioh.com/p/8bb2b55e618d -->
<!-- https://anthonygiretti.com/2020/06/17/introducing-c-9-records/ -->

