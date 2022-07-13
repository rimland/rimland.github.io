---
layout: post
title:  "C# 实例解释面向对象编程中的单一功能原则"
date:   2022-02-07 00:10:00 +0800
categories: dotnet csharp
published: true
---

在面向对象编程中，**SOLID** 是五个设计原则的首字母缩写，旨在使软件设计更易于理解、灵活和可维护。这些原则是由美国软件工程师和讲师罗伯特·C·马丁(Robert Cecil Martin)提出的许多原则的子集，在他2000年的论文《设计原则与设计模式》中首次提出。

SOLID 原则包含：

- **S**：[单一功能原则（single-responsibility principle）](https://ittranslator.cn/dotnet/csharp/2022/02/07/SOLID-single-responsibility-principle.html)
- **O**：[开闭原则（open-closed principle）](https://ittranslator.cn/dotnet/csharp/2022/02/17/SOLID-open-closed-principle.html)
- **L**：[里氏替换原则（Liskov substitution principle）](https://ittranslator.cn/dotnet/csharp/2022/02/23/SOLID-liskov-substitution-principle.html)
- **I**：[接口隔离原则（Interface segregation principle）](https://ittranslator.cn/dotnet/csharp/2022/07/13/SOLID-interface-segregation-principle.html)
- **D**：依赖反转原则（Dependency inversion principle）

本文我们来介绍*单一功能原则*。

## 单一功能原则

在面向对象编程领域中，**单一功能原则（Single responsibility principle）规定每个类都应该有且仅有一个单一的功能，并且该功能应该由这个类完全封装起来**。所有它的（这个类的）服务都应该严密的和该功能平行（功能平行，意味着没有依赖）。

这个术语由罗伯特·C·马丁（Robert Cecil Martin）在他的《敏捷软件开发，原则，模式和实践》一书中的一篇名为『面向对象设计原则』的文章中提出。马丁表述该原则是基于《结构化分析和系统规格》一书中的内聚原则（Cohesion）之上的。

马丁把功能（职责）定义为：“改变的原因”，并总结出一个类或者模块应该有且只有一个改变的原因。一个具体的例子就是，想象有一个用于编辑和打印报表的模块。这样的一个模块存在两个改变的原因。第一，报表的内容可以改变（编辑）。第二，报表的格式可以改变（打印）。这两方面的改变会因为完全不同的起因而发生：一个是本质的修改，一个是表面的修改。单一功能原则认为这两方面的问题事实上是两个分离的功能，因此他们应该分离在不同的类或者模块里。把具有不同的改变原因的事物耦合在一起的设计是糟糕的。

保持一个类专注于单一功能点的一个重要的原因是，它可以使类更加的健壮。回顾上面的例子，如果有一个对于报表“编辑”流程的修改，那么将存在极大的危险性，因为假设这两个功能存在于同一个类中，修改报表的“编辑”流程会导致公共状态或者依赖关系的改变，从而可能使“打印”功能的代码无法正常运行。

## C# 示例

例如，考虑这样一个应用程序，它接受一组形状（圆形和正方形），并计算该列表中所有形状的面积之和。

首先，创建形状类，并通过构造函数设置所需的参数。

对于正方形，需要知道它的边长：

```csharp
/// <summary>
/// 正方形
/// </summary>
class Square
{
    public Square(double length)
    {
        SideLength = length;
    }
    public double SideLength { get; init; }
}
```

对于圆形，需要它的半径：

```csharp
/// <summary>
/// 圆形
/// </summary>
class Circle
{
    public Circle(double radius)
    {
        Radius = radius;
    }

    public double Radius { get; init; }
}
```

接下来，创建 *AreaCalculator* 类，然后编写逻辑以计算所有提供的形状的面积。正方形的面积是用边长的平方计算的，圆的面积由 `π` 乘以半径的平方来计算的。

### 糟糕的示范

```csharp
class AreaCalculator
{
    private List<object> _shapes;

    public AreaCalculator(List<object> shapes)
    {
        _shapes = shapes;
    }

    /// <summary>
    /// 计算所有形状的面积总和
    /// </summary>
    /// <returns></returns>
    public double Sum()
    {
        List<double> areas = new List<double>();

        foreach (var item in _shapes)
        {
            if (item is Square s)
            {
                areas.Add(Math.Pow(s.SideLength, 2));
            }
            else if (item is Circle c)
            {
                areas.Add(Math.PI * Math.Pow(c.Radius, 2));
            }
        }

        return areas.Sum();
    }

    public string Output()
    {
        return $"Sum of the areas of provided shapes: {Sum()}";
    }
}
```

要使用 *AreaCalculator* 类，您需要实例化这个类，并传入一个形状列表，并显示其输出。

在此，我们传入一个三个形状的列表：一个半径为 2 的圆，一个边长为 5 的正方形，一个边长为 6 的正方形。

```csharp
static void Main(string[] args)
{
    var shapes = new List<object> {
            new Circle(2),
            new Square(5),
            new Square(6)
    };

    var areas = new AreaCalculator(shapes);
    Console.WriteLine(areas.Output());
}
```

运行程序，您会看到如下的输出：

> Sum of the areas of provided shapes: 73.56637061435917

输出正常，但这并不符合*单一功能原则*。因为 *AreaCalculator* 类既计算了所有形状的面积之和，又处理了输出数据的格式。

考虑这样一个场景，假如想要输出转换为另一种格式呢，如 JSON。我们就需要去修改 *AreaCalculator* 类，这样本来是为了修改输出数据的格式，却可能会影响到计算的逻辑，这明显违反了*单一功能原则*。

### 正确的示范

*AreaCalculator* 类应该只关心计算提供的形状的面积之和，不应该关心输出什么格式。

下面我们来做一些修改，删除 *AreaCalculator* 类中的 `Output` 方法：

```csharp
class AreaCalculator
{
    private List<object> _shapes;

    public AreaCalculator(List<object> shapes)
    {
        _shapes = shapes;
    }

    /// <summary>
    /// 计算所有形状的面积总和
    /// </summary>
    /// <returns></returns>
    public double Sum()
    {
        List<double> areas = new List<double>();

        foreach (var item in _shapes)
        {
            if (item is Square s)
            {
                areas.Add(Math.Pow(s.SideLength, 2));
            }
            else if (item is Circle c)
            {
                areas.Add(Math.PI * Math.Pow(c.Radius, 2));
            }
        }

        return areas.Sum();
    }
}
```

并新增一个 *SumCalculatorOutputter* 类来专门处理输出格式的逻辑：

```csharp
class SumCalculatorOutputter
{
    protected AreaCalculator _calculator;

    public SumCalculatorOutputter(AreaCalculator calculator)
    {
        _calculator = calculator;
    }

    public string String()
    {
        return $"Sum of the areas of provided shapes: {_calculator.Sum()}";
    }

    public string JSON()
    {
        var data = new { Sum = _calculator.Sum() };
        return System.Text.Json.JsonSerializer.Serialize(data);
    }
}
```

此时我们再来修改一下 `Main` 中的调用：

```csharp
static void Main(string[] args)
{
    var shapes = new List<object> {
            new Circle(2),
            new Square(5),
            new Square(6)
    };

    var areaCalculator = new AreaCalculator(shapes);
    var outputer = new SumCalculatorOutputter(areaCalculator);
    Console.WriteLine(outputer.JSON());
    Console.WriteLine(outputer.String());
}
```

运行程序，输出结果如下：

```plain
{"Sum":73.56637061435917}
Sum of the areas of provided shapes: 73.56637061435917
```

现在，*AreaCalculator* 类处理计算逻辑，*SumCalculatorOutputter* 类处理输出格式，它们各司其职，遵循了*单一功能原则*。

## 总结

本文我介绍了 SOLID 原则中的**单一功能原则**（single-responsibility principle），并通过 C# 代码示例简明地诠释了它的含意和实现，希望对您有所帮助。

> 作者 ： 技术译民  
> 出品 ： [技术译站](https://ittranslator.cn/)

<br />

参考文档：

- <https://en.wikipedia.org/wiki/SOLID>
- <https://www.digitalocean.com/community/conceptual_articles/s-o-l-i-d-the-first-five-principles-of-object-oriented-design>
