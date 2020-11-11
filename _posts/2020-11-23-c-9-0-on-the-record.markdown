---
layout: post
title:  "官宣：C# 9.0 正式发布了（C# 9.0 on the record）"
date:   2020-11-12 00:10:00 +0800
categories: dotnet csharp
published: true
---

> 翻译自 Mads Torgersen 2020年11月10日的博文[《C# 9.0 on the record》](https://devblogs.microsoft.com/dotnet/c-9-0-on-the-record/) [^1]，Mads Torgersen 是微软 C# 语言的首席设计师，也是微软 .NET 团队的项目群经理。

[^1]: <https://devblogs.microsoft.com/dotnet/c-9-0-on-the-record/> C# 9.0 on the record

## C# 9.0 正式发布

正式宣布：C# 9.0 发布了！ 早在5月，我就写了一篇关于 C# 9.0 计划的博文 [^old]，以下是该帖子的更新版本，以匹配我们最终实际交付的产品。

[^old]: <https://ittranslator.cn/dotnet/csharp/2020/08/24/welcome-to-csharp-9-0.html> 欢迎来到 C＃ 9.0

对于 C# 的每一个新版本，我们都在努力让常见编码场景的实现变得更加清晰和简单，C# 9.0 也不例外。这次特别关注的是支持数据模型的简洁和不可变表示。

## 一、仅初始化属性（Init-only properties）

对象初始化器非常棒。它们为类型的客户端提供了一种非常灵活和易读的格式来创建对象，并且特别适合于嵌套对象的创建，让你可以一次性创建整个对象树。这里有一个简单的例子：

```csharp
var person = new Person { FirstName = "Mads", LastName = "Torgersen" };
```

对象初始化器还使类型作者不必编写大量的构造函数 —— 他们所要做的就是编写一些属性！

```csharp
public class Person
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
}
```

目前最大的限制是属性必须是*可变的（即可写的）*，对象初始化器才能工作：它们首先调用对象的构造函数(本例中是默认的无参数构造函数)，然后赋值给属性 `setter`。

**仅初始化(init-only)属性**解决了这个问题！它引入了一个 `init` 访问器，它是 `set` 访问器的变体，只能在对象初始化时调用：

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

经典的面向对象编程的核心思想是，对象具有强大的身份并封装了随时间演变的可变状态。 C# 在这方面一直都很出色，但是有时您想要的恰恰相反，而在此时，C# 的默认设置往往会妨碍工作，使事情变得非常麻烦。

<!-- 如果您想使单个属性不可变，那么仅初始化(init-only)属性是极好的。 -->
如果您发现自己希望整个对象是不可变的，并且行为像一个值，那么您应该考虑将其声明为*记录(record)*：

```csharp
public record Person
{
    public string? FirstName { get; init; }
    public string? LastName { get; init; }
}
```

记录仍然是类，但是 `record` 关键字赋予了它一些另外的类似于值的行为。 一般来说，记录是根据其内容而不是其标识来定义的。 在这点上，记录更接近于结构体，但是记录仍然是引用类型。

虽然记录是可变的，但它们主要是为更好地支持不可变数据模型而构建的。

### `with` 表达式（With-expressions）

处理不可变数据时，一种常见的模式是从现有值创建新值以表示新状态。例如，如果我们的 `person` 要更改他们的 `LastName`，我们会将其表示为一个新对象，该对象是旧对象的副本，只是有不同的 `LastName`。这种技巧通常被称之为*非破坏性突变(non-destructive mutation)*。记录(`record`)不是代表 `person` *在一段时间内的* 状态，而是代表 `person` *在给定时间点的* 状态。

为了帮助实现这种编程风格，记录(`record`)允许使用一种新的表达式 —— `with` 表达式：

```csharp
var person = new Person { FirstName = "Mads", LastName = "Nielsen" };
var otherPerson = person with { LastName = "Torgersen" };
```

`with` 表达式使用对象初始化器语法来声明新对象与旧对象的不同之处。您可以指定多个属性。

`with` 表达式的工作原理是将旧对象的完整状态实际地复制到一个新对象中，然后根据对象初始化器对其进行改变。这意味着属性必须具有 `init` 或 `set` 访问器才能在 `with` 表达式中进行更改。

### 基于值的相等（Value-based equality）

所有对象都从对象类(`object`)继承一个虚的 `Equals(object)` 方法。这被用作是当两个参数都是非空(`non-null`)时，静态方法 `Object.Equals(object, object)` 的基础。

**结构体重写了 `Equals(object)` 方法，通过递归地在结构体的每一个字段上调用 `Equals` 来比较结构体的每一个字段，从而实现了“基于值的相等”。记录(`record`)是一样的。**

这意味着，根据它们的“值性(value-ness)”，两个记录(`record`)对象可以彼此相等，而不是*同一个*对象。例如，如果我们将被修改 `person` 的 `LastName` 改回去：

```csharp
var originalPerson = otherPerson with { LastName = "Nielsen" };
```

现在我们将得到 `ReferenceEquals(person, originalPerson)` = `false`(它们不是同一个对象)，但是 `Equals(person, originalPerson)` = `true`(它们有相同的值)。除了基于值的 `Equals` 之外，还有一个基于值的 `GetHashCode()` 重写。另外，记录实现了 `IEquatable<T>` 并且重载 `==` 和 `!=` 操作符，因此基于值的行为在所有这些不同的相等机制中表现一致。

值的相等性和可变性并不总是很好地融合在一起。一个问题是，更改值可能导致 `GetHashCode` 的结果随时间变化，如果对象存储在哈希表中，这是很不幸的！我们不会禁止使用可变记录，但是我们不鼓励它们，除非您充分考虑过后果!

### 继承（Inheritance）

记录可以从其他记录继承：

```csharp
public record Student : Person
{
    public int ID;
}
```

<!-- With-expressions and value equality work well with record inheritance, in that they take the whole runtime object into account, not just the type that it’s statically known by. Say that I create a `Student` but store it in a `Person` variable: -->

`with` 表达式和值的相等性与记录的继承很好地结合在一起，因为它们考虑了整个运行时对象，而不仅仅是它的静态已知类型。假设我创建了一个 `Student`，但将其存储在 `Person` 变量中：

```csharp
Person student = new Student { FirstName = "Mads", LastName = "Nielsen", ID = 129 };
```

`with` 表达式仍将复制整个对象并保留运行时类型：

```csharp
var otherStudent = student with { LastName = "Torgersen" };
WriteLine(otherStudent is Student); // true
```

以相同的方式，值的相等性确保两个对象具有相同的运行时类型，然后比较它们的所有状态：

```csharp
Person similarStudent = new Student { FirstName = "Mads", LastName = "Nielsen", ID = 130 };
WriteLine(student != similarStudent); //true, 因为 ID 不同
```

### 位置记录（Positional records）

<!-- Sometimes it’s useful to have a more positional approach to a record, where its contents are given via constructor arguments, and can be extracted with positional deconstruction. It’s perfectly possible to specify your own constructor and deconstructor in a record: -->

有时，对记录采用更具位置定位的方法很有用，因为记录的内容是通过构造函数参数指定的，并且可以通过位置解构来提取。完全可以在记录(`record`)中指定您自己的构造函数和解构函数：

```csharp
public record Person
{
    public string FirstName { get; init; }
    public string LastName { get; init; }
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
var person = new Person("Mads", "Torgersen"); //用位置参数构造（positional construction）
var (f, l) = person;                          //用位置参数解构（positional deconstruction）
```

<!-- If you don’t like the generated auto-property you can define your own property of the same name instead, and the generated constructor and deconstructor will just use that one. In this case, the parameter is in scope for you to use for initialization. Say, for instance, that you’d rather have the `FirstName` be a protected property: -->

如果不喜欢生成的自动属性，您可以定义自己的同名属性，生成的构造函数和解构函数将只使用您自定义的属性。在这种情况下，该参数在作用域内供您用于初始化。举例来说，假设您希望将 `FirstName` 设为受保护的属性：

```csharp
public record Person(string FirstName, string LastName)
{
    protected string FirstName { get; init; } = FirstName;
}
```

<!-- A positional record can call a base constructor like this: -->

位置记录可以像这样调用基构造函数：

```csharp
public record Student(string FirstName, string LastName, int ID) : Person(FirstName, LastName);
```

## 三、顶级程序（Top-level programs）  

> 译者注：  
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

在 C# 9.0 中，您可以在顶级编写主程序(main program)：

```csharp
using System;

Console.WriteLine("Hello World!");
```

允许任何语句。此程序必须在文件中的 `using` 语句之后，任何类型或命名空间声明之前执行，并且只能在一个文件中执行。就像目前只能有一个 `Main` 方法一样。  
如果您想返回一个状态码，您可以做。如果您想等待(`await`)事情，您可以做。如果您想访问命令行参数，`args` 可以作为一个“魔法”参数使用。

```csharp
using static System.Console;
using System.Threading.Tasks;

WriteLine(args[0]);
await Task.Delay(1000);
return 0;
```

局部函数是语句的一种形式，也允许在顶级程序中使用。从顶级语句部分之外的任何地方调用它们都是错误的。

## 四、改进的模式匹配（Improved pattern matching）

C# 9.0 中添加了几种新的模式。让我们从[模式匹配教程](https://docs.microsoft.com/en-us/dotnet/csharp/tutorials/pattern-matching) [^pattern]的以下代码片段的上下文中来看看它们：

[^pattern]: <https://docs.microsoft.com/en-us/dotnet/csharp/tutorials/pattern-matching> pattern matching tutorial

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

目前，类型模式需要在类型匹配时声明一个标识符 —— 即使该标识符是一个弃元 `_`，如上面的 `DeliveryTruck _` 所示。但现在你只需写下类型就可以了：

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

最后，您可以将模式与逻辑运算符 `and`、`or` 和 `not` 组合起来，这些运算符用单词拼写，以避免与表达式中使用的运算符混淆。例如，上面嵌套的 `switch` 的示例可以按如下升序排列：

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

if (!(e is Customer)) { ... } // 旧的写法
```

您可以写成：

```csharp
if (e is not Customer) { ... } // 新的写法
```

<!-- And in fact, in an `is not` expression like that we allow you to name the Customer for subsequent use: -->

实际上，在 `is not` 表达式中，允许您命名 `Customer` 以供后续使用：

```csharp
if (e is not Customer c) { throw ... } // 如果此分支，则抛出异常或返回...
var n = c.FirstName;                   // ... 在这里，c 肯定已赋值
```

## 五、目标类型的 `new` 表达式（Target-typed new expressions）

“目标类型(`Target typing`)”是我们在表达式从使用位置的上下文中获取其类型时所用的一个术语。例如，`null` 和 `lambda` 表达式始终是目标类型的。

<!-- “目标类型(`Target typing`)”是一个术语，当一个表达式从使用它的地方的上下文中获得其类型时，我们使用这个术语。例如，`null` 和 `lambda`表达式始终是目标类型的。 -->

<!-- 在 C# 9.0 中，一些以前不是目标类型的表达式变得可以由其上下文推导。 -->

<!-- new expressions in C# have always required a type to be specified (except for implicitly typed array expressions). In C# 9.0 you can leave out the type if there’s a clear type that the expression is being assigned to. -->

C# 中的 `new` 表达式总是要求指定类型（隐式类型的数组表达式除外）。在 C# 9.0 中，如果表达式被赋值为一个明确的类型，则可以省略该类型。

```csharp
Point p = new (3, 5);
```

当您有很多重复时，例如在数组或对象初始化设定中，这特别地好用：

```csharp
Point[] ps = { new (1, 2), new (5, 2), new (5, -3), new (1, -3) };
```

## 六、协变式返回值（Covariant returns）

<!-- It’s sometimes useful to express that a method override in a derived class has a more specific return type than the declaration in the base type. C# 9.0 allows that: -->

有时候，这样的表达是有用的 —— 派生类中的方法重写，具有一个比基类型中的声明更具体（更明确）的返回类型。C# 9.0 允许：

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

查看 C# 9.0 全部特性集的最好地方是 [“What’s new in C# 9.0” 文档页面](https://docs.microsoft.com/dotnet/csharp/whats-new/csharp-9) [^more]。

[^more]: <https://docs.microsoft.com/dotnet/csharp/whats-new/csharp-9> What’s new in C# 9.0

<br/>

> 作者 ： Mads Torgersen  
> 译者 ： 技术译民  
> 出品 ： [技术译站](https://ittranslator.cn/)  
> 链接 ： [英文原文](https://devblogs.microsoft.com/dotnet/c-9-0-on-the-record/)
