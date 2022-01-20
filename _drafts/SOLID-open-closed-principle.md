---
layout: post
title:  "C# 实例解释面向对象编程中的开闭原则"
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

本文我们来介绍*开闭原则*。

## 开闭原则

在面向对象编程领域中，开闭原则 (open-closed principle, OCP) 规定“**软件中的对象（类，模块，函数等等）应该对于扩展是开放的，而对于修改是封闭的**”，这意味着*一个实体是允许在不改变它的源代码的前提下变更它的行为*。该特性在产品化的环境中是特别有价值的，在这种环境中，改变源代码需要代码审查，单元测试以及诸如此类的用以确保产品使用品质的过程。遵循开闭原则的代码在扩展时并不发生改变，因此无需这些过程。

具体到类，也就是说，在不修改类本身代码的情况下，应该是可以扩展它的行为的。

## C# 示例

让我们回顾一下上一篇文章*单一功能原则*中提到的 *AreaCalculator* 类，

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

对于上面的计算方法，考虑这样一种场景，用户想要计算一些其它形状的面积总和，比如三角形、矩形、五边形等等…… 您将不得不反复编辑此类以添加更多的 `if/else` 块，这就违背了*开闭原则*。

### 改进

一个更好的做法是，将计算每个形状的面积的逻辑从 *AreaCalculator* 类中移除，并将其添加到对应每个形状的类中。我们可以定义一个带有 `CalcArea` 方法的接口 *IShape*，然后让每个形状都实现这个接口。

接口 *IShape*：

```csharp
interface IShape
{
    /// <summary>
    /// 计算面积
    /// </summary>
    /// <returns></returns>
    double CalcArea();
}
```

修改后的 *Square* 和 *Circle* 类：

```csharp
/// <summary>
/// 正方形
/// </summary>
class Square : IShape
{
    public Square(double length)
    {
        SideLength = length;
    }
    public double SideLength { get; init; }

    public double CalcArea()
    {
        return Math.Pow(SideLength, 2);
    }
}

/// <summary>
/// 圆形
/// </summary>
class Circle : IShape
{
    public Circle(double radius)
    {
        Radius = radius;
    }

    public double Radius { get; init; }

    public double CalcArea()
    {
        return Math.PI * Math.Pow(Radius, 2);
    }
}
```

*AreaCalculator* 类也要对应做一些修改：

```csharp
class AreaCalculator
{
    private List<IShape> _shapes;

    public AreaCalculator(List<IShape> shapes)
    {
        _shapes = shapes;
    }

    /// <summary>
    /// 计算面积总和
    /// </summary>
    /// <returns></returns>
    public double Sum()
    {
        List<double> areas = new List<double>();

        foreach (var item in _shapes)
        {
            areas.Add(item.CalcArea());
        }

        return areas.Sum();
    }
}
```

此时，如果我们有一个新的形状需要进行计算，我们可以直接添加一个实现了接口 *IShape* 的新类，而无需修改 *AreaCalculator* 类的代码，比如长方形：

```csharp
/// <summary>
/// 长方形
/// </summary>
class Rectangle : IShape
{
    public Rectangle(double width, double height)
    {
        Width = width;
        Height = height;
    }

    public double Width { get; init; }
    public double Height { get; init; }

    public double CalcArea()
    {
        return Width * Height;
    }
}
```

处理输出格式的 *SumCalculatorOutputter* 类同样保持不变：

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

然后，我们修改 `Main` 方法中的代码来测试一下：

```csharp
static void Main(string[] args)
{
    var shapes = new List<IShape> {
            new Circle(2),
            new Square(5),
            new Rectangle(2,3)
    };

    var areaCalculator = new AreaCalculator(shapes);
    var outputer = new SumCalculatorOutputter(areaCalculator);
    Console.WriteLine(outputer.JSON());
    Console.WriteLine(outputer.String());
}
```

运行一下，输出结果为：

```plain
{"Sum":43.56637061435917}
Sum of the areas of provided shapes: 43.56637061435917
```

现在，这些类的设计，既遵循了*单一功能原则*又遵循了*开闭原则*。

## 总结

本文我介绍了 SOLID 原则中的**开闭原则** (open-closed principle)，并通过 C# 代码示例简明地诠释了它的含意和实现，希望对您有所帮助。

> 作者 ： 技术译民  
> 出品 ： [技术译站](https://ittranslator.cn/)

<br />

参考文档：

- <https://en.wikipedia.org/wiki/SOLID>
- <https://www.digitalocean.com/community/conceptual_articles/s-o-l-i-d-the-first-five-principles-of-object-oriented-design>
