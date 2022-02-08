---
layout: post
title:  "C# 实例解释面向对象编程中的里氏替换原则"
date:   2022-03-10 00:10:00 +0800
categories: dotnet csharp
published: true
---

在面向对象编程中，**SOLID** 是五个设计原则的首字母缩写，旨在使软件设计更易于理解、灵活和可维护。这些原则是由美国软件工程师和讲师罗伯特·C·马丁(Robert Cecil Martin)提出的许多原则的子集，在他2000年的论文《设计原则与设计模式》中首次提出。

SOLID 原则包含：

- **S**：单一功能原则（single-responsibility principle）
- **O**：开闭原则（open-closed principle）
- **L**：里氏替换原则（Liskov substitution principle）
- **I**：接口隔离原则（Interface segregation principle）
- **D**：依赖反转原则（Dependency inversion principle）

本文我们来介绍*里氏替换原则*。

## 里氏替换原则

在面向对象的程序设计中，里氏替换原则（Liskov Substitution principle）是对子类型的特别定义。它由芭芭拉·利斯科夫（Barbara Liskov）在1987年的一次会议上，在名为“数据的抽象与层次”的演说中首先提出。

里氏替换原则的内容可以描述为：“**派生类（子类）对象可以在程序中代替其基类（超类）对象。**”

也就是说，**程序中的对象不管出现在什么地方，都应该可以使用其派生类（子类）的对象进行替换，而不影响程序运行的正确性。**

## C# 示例

我们看这样一个示例，假设一个企业有三种员工，一种是拿铁饭碗的永久雇员，一种是合同工，一种是临时工。我们设计几个类来表示这三种员工。

### 糟糕的示范

先定义一个 *Employee* 基类。

```csharp
public abstract class Employee
{
    public string Name { get; set; }
    /// <summary>
    /// 计算奖金
    /// </summary>
    /// <returns></returns>
    public abstract decimal CalculateBonus();
}
```

再定义它的三个子类：

```csharp
/// <summary>
/// 永久雇员
/// </summary>
public class PermanentEmployee : Employee
{
    public override decimal CalculateBonus()
    {
        return 80000;
    }
}

/// <summary>
/// 合同工
/// </summary>
public class ContractEmployee : Employee
{
    public override decimal CalculateBonus()
    {
        return 2000;
    }
}

/// <summary>
/// 临时工（临时工没有奖金）
/// </summary>
public class TemporaryEmployee : Employee
{
    public override decimal CalculateBonus()
    {
        throw new NotImplementedException(); //违反里氏替换原则
    }
}
```

在 `Main` 方法中调用它们。

先定义一个类型为基类 *Employee* 的变量 `e`，然后分别使用其子类 *PermanentEmployee*、*ContractEmployee* 和 *TemporaryEmployee* 创建对象赋值给变量 `e`，然后调用 `e` 的 `CalculateBonus()` 方法。

```csharp
static void Main(string[] args)
{
    Employee e;

    e = new PermanentEmployee() { Name = "张三" };
    Console.WriteLine($"{e.Name} 的年终奖是 {e.CalculateBonus()} 元");

    e = new ContractEmployee() { Name = "李四" };
    Console.WriteLine($"{e.Name} 的年终奖是 {e.CalculateBonus()} 元");

    e = new TemporaryEmployee() { Name = "王五" };
    Console.WriteLine($"{e.Name} 的年终奖是 {e.CalculateBonus()} 元");
}
```

运行一下可以观察到，当使用 *PermanentEmployee* 和 *ContractEmployee* 类创建的对象替换基类型 *Employee* 的变量 `e` 时，调用 `CalculateBonus()` 方法可以正常运行，但是使用 *TemporaryEmployee* 类创建的对象替换变量 `e` 时，调用 `CalculateBonus()` 方法抛出了异常，导致程序无法正常运行。这明显违反了*里氏替换原则*。

那么，如何改进它一下呢？

### 正确的示范

我们看到，每种员工都有基本信息 `Name` 属性，但是由于临时工 *TemporaryEmployee* 没有奖金，所以不需要计算奖金。因此我们应该把计算奖金的方法 `CalculateBonus` 单独抽象出去，而不是让它们都继承于同一个基类，并将 *TemporaryEmployee* 类中的 `CalculateBonus` 方法抛出一个异常。

改进后的代码：

```csharp
interface IEmployee
{
    /// <summary>
    /// 计算年终奖
    /// </summary>
    /// <returns></returns>
    public decimal CalculateBonus();
}

public abstract class Employee
{
    public string Name { get; set; }
}

/// <summary>
/// 永久雇员
/// </summary>
public class PermanentEmployee : Employee, IEmployee
{
    public decimal CalculateBonus()
    {
        return 80000;
    }
}

/// <summary>
/// 合同工
/// </summary>
public class ContractEmployee : Employee, IEmployee
{
    public decimal CalculateBonus()
    {
        return 2000;
    }
}

/// <summary>
/// 临时工
/// </summary>
public class TemporaryEmployee : Employee
{
}
```

在 `Main` 方法中调用它们的测试代码改为：

```csharp
static void Main(string[] args)
{
    Employee e;
    IEmployee ie;

    var p = new PermanentEmployee() { Name = "张三" };
    e = p;
    ie = p;
    Console.WriteLine($"{e.Name} 的年终奖是 {ie.CalculateBonus()} 元");

    var c = new ContractEmployee() { Name = "李四" };
    e = c;
    ie = c;
    Console.WriteLine($"{e.Name} 的年终奖是 {ie.CalculateBonus()} 元");

    e = new TemporaryEmployee() { Name = "王五" };
    Console.WriteLine($"{e.Name} 是临时工，无年终奖。");
}
```

程序运行正常。

这样，这些子类的设计便遵守了*里氏替换原则*。

## 总结

本文我介绍了 SOLID 原则中的**里氏替换原则**（Liskov substitution principle），并通过 C# 代码示例简明地诠释了它的含意和实现，希望对您有所帮助。

> 作者 ： 技术译民  
> 出品 ： [技术译站](https://ittranslator.cn/)

<br />

参考文档：

- <https://en.wikipedia.org/wiki/SOLID>
- <https://www.c-sharpcorner.com/blogs/liskov-substitution-principle-in-c-sharp>
