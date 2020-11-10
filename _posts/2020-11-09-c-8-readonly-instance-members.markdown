---
layout: post
title:  "C# 8: 可变结构体中的只读实例成员"
date:   2020-11-09 00:10:00 +0800
categories: dotnet csharp
published: true
---

在之前的文章中我们介绍了 C# 中的 [只读结构体（readonly struct）](https://mp.weixin.qq.com/s/wwVZbdY7m7da1nmIKb2jCA)[^1] 和与其紧密相关的 [`in` 参数](https://ittranslator.cn/dotnet/csharp/2020/11/02/understanding-in-modifier-csharp.html)[^2]。  
今天我们来讨论一下从 C# 8 开始引入的一个特性：可变结构体中的只读实例成员（当结构体可变时，将不会改变结构体状态的实例成员声明为 `readonly`）。

[^1]: <https://ittranslator.cn/dotnet/csharp/2020/10/26/c-7-2-talk-about-readonly-struct.html>   C# 中的只读结构体

[^2]: <https://ittranslator.cn/dotnet/csharp/2020/11/02/understanding-in-modifier-csharp.html>   C# 中的 in 参数和性能分析

## 引入只读实例成员的原因

简单来说，还是为了**提升性能**。  
我们已经知道了只读结构体（`readonly struct`）和 `in` 参数可以通过减少创建副本，来提高代码运行的性能。当我们创建只读结构体类型时，编译器强制所有成员都是只读的（即没有实例成员修改其状态）。但是，在某些场景，比如您有一个现有的 API，具有公开可访问字段或者兼有可变成员和不可变成员。在这种情形下，不能将类型标记为 `readonly` （因为这关系到所有实例成员）。

通常，这没有太大的影响，但是在使用 `in` 参数的情况下就例外了。**对于非只读结构体的 `in` 参数，编译器将为每个实例成员的调用创建参数的防御性副本，因为它无法保证此调用不会修改其内部状态。这可能会导致创建大量副本，并且比直接按值传递结构体时的总体性能更差**（因为按值传递只会在传参时创建一次副本）。

看一个例子您就明白了，我们定义这样一个一般结构体，然后将其作为 `in` 参数传递：

```csharp
public struct Rect
{
    public float w;
    public float h;

    public float Area
    {
        get
        {
            return w * h;
        }
    }
}
public class SampleClass
{
    public float M(in Rect value)
    {
        return value.Area + value.Area;
    }
}
```

编译后，类 `SampleClass` 中的方法 **`M`** 代码运行逻辑实际上是[这样的](https://sharplab.io/#v2:CYLg1APgAgzABAZwC4CcCuBjJcBKBTLAWACgBvEuSuWOAMwBsB7AQ2wHcBuCqmhl7ABZdi3Sryas4AQRR5mouOWJUVcAOZ4kClUtV7qAdjhs4AKjhDtVAL4LbxezSgAmOAGVmAWwAO9PAGF6ZgQEEl0eeD5JAFkACgBLADtcAmwAN2Z6NDwASgVwvSgjDKy8ADoZOTgwOBLsitlmYRV7ayA=)：

```csharp
public float M([In] [IsReadOnly] ref Rect value)
{
    Rect rect = value;  //防御性副本
    float area = rect.Area;
    rect = value;       //防御性副本
    return area + rect.Area;
}
```

## 可变结构体中的只读实例成员

我们把上面的可变结构体 `Rect` 修改一下，添加一个 `readonly` 方法 `GetAreaReadOnly`，如下：

```csharp
public struct Rect
{
    public float w;
    public float h;

    public float Area
    {
        get
        {
            return w * h;
        }
    }

    public readonly float GetAreaReadOnly()
    {
        return Area; //警告	CS8656	从 "readonly" 成员调用非 readonly 成员 "Rect.Area.get" 将产生 "this" 的隐式副本。
    }
}
```

此时，代码是可以通过编译的，但是会提示一条这样的的警告：*从 "readonly" 成员调用非 readonly 成员 "Rect.Area.get" 将产生 "this" 的隐式副本。*  
翻译成大白话就是说，我们在只读方法 `GetAreaReadOnly` 中调用了非只读 `Area` 属性将会产生 "this" 的防御性副本。用代码演示一下编译后方法 `GetAreaReadOnly` 的方法体运行逻辑实际上是[这样的](https://sharplab.io/#v2:CYLg1APgAgzABAZwC4CcCuBjJcBKBTLAWACgBvEuSuWOAMwBsB7AQ2wHcBuCqmhl7ABZdi3Sryas4AQRR5mouOWJUVcAOZ4kClUtV7qAdjhs4AKjhDtVAL4LbI5T3izmwRgDt6ATzoTsAcU0ZOXxXAHlPLwAKAEoFXX0oI2DmYRV7exIaKAAmOABlZgBbAAd6PABhemYEBBIEsXg+SQBZKIBLd1wCbAA3Zno0PDjHSgbVJLh+wbwAOhS4MCmBofmXNJsSayA)：

```csharp
[IsReadOnly]
public float GetAreaReadOnly()
{
    Rect rect = this; //防御性副本
    return rect.Area;
}
```

所以为了避免创建多余的防御性副本而影响性能，我们应该给只读方法体中调用的属性或方法都加上 `readonly` 修饰符（在本例中，即给属性 `Area` 加上 `readonly` 修饰符）。

## 调用可变结构体中的只读实例成员

我们将上面的示例再修改一下：

```csharp
public struct Rect
{
    public float w;
    public float h;

    public readonly float Area
    {
        get
        {
            return w * h;
        }
    }

    public readonly float GetAreaReadOnly()
    {
        return Area;
    }

    public float GetArea()
    {
        return Area;
    }
}

public class SampleClass
{
    public float CallGetArea(Rect vector)
    {
        return vector.GetArea();
    }

    public float CallGetAreaIn(in Rect vector)
    {
        return vector.GetArea();
    }

    public float CallGetAreaReadOnly(in Rect vector)
    {
        //调用可变结构体中的只读实例成员
        return vector.GetAreaReadOnly();
    }
}
```

类 `SampleClass` 中定义三个方法：

- 第一个方法是以前我们常见的调用方式; 
- 第二个以 `in` 参数传入可变结构体，调用非只读方法（可能修改结构体状态的方法）;
- 第三个以 `in` 参数传入可变结构体，调用只读方法。

我们来重点看一下第二个和第三个方法有什么区别，还是把它们的 IL 代码逻辑翻译成易懂的执行逻辑，[如下所示](https://sharplab.io/#v2:CYLg1APgAgTAjAWAFBQMwAIDOAXATgVwGNt0AlAU2OQG9l17010AzAGwHsBDEgdwG46DJmy4kAFgKSD6TXOU7B2AO1YBPFh27oAgnM7T0tJAxPoA5uWwGTR03cYB2dD3QAqdBOsMAvgd9TjIQw9RRV1ES0AcUtdeQoFAHkwgAoASgNbeygnWM5JE38DYU0SaOxctIyvGRy9fJ9kQpQMWHQAZU4AWwAHVnIAYVZOTEwaIowIkn7OVlYyiopidAA3Smx2XHTA+ky7bJW1jYA6eb00+vomk2LRdGnZ0/kASSVkgEslMjWD4g2tm2qjh+61wJxiZ1SF3QVyCGlu9zm4Li8mASTU70+ixIq1+myq21M+xxILB5T08VRKUhfkaQA==)：

```csharp
public float CallGetAreaIn([In] [IsReadOnly] ref Rect vector)
{
    Rect rect = vector; //防御性副本
    return rect.GetArea();
}

public float CallGetAreaReadOnly([In] [IsReadOnly] ref Rect vector)
{
    return vector.GetAreaReadOnly();
}
```

可以看出，`CallGetAreaReadOnly` 在调用结构体的（只读）成员方法时，相对于 `CallGetAreaIn` （调用结构体的非只读成员方法）少创建了一次本地的防御性副本，所以在执行性能上应该是有优势的。

## 只读实例成员的性能分析

性能的提升在结构体较大的时候比较明显，所以在测试的时候为了能够突出三个方法性能的差异，我在 `Rect` 结构体中添加了 30 个 decimal 类型的属性，然后在类 `SampleClass` 中添加了三个测试方法，代码如下所示：

```csharp
public struct Rect
{
    public float w;
    public float h;

    public readonly float Area
    {
        get
        {
            return w * h;
        }
    }

    public readonly float GetAreaReadOnly()
    {
        return Area;
    }

    public float GetArea()
    {
        return Area;
    }

    public decimal Number1 { get; set; }
    public decimal Number2 { get; set; }
    //...
    public decimal Number30 { get; set; }
}

public class SampleClass
{
    const int loops = 50000000;
    Rect rectInstance;

    public SampleClass()
    {
        rectInstance = new Rect();
    }

    [Benchmark(Baseline = true)]
    public float DoNormalLoop()
    {
        float result = 0F;
        for (int i = 0; i < loops; i++)
        {
            result = CallGetArea(rectInstance);
        }
        return result;
    }

    [Benchmark]
    public float DoNormalLoopByIn()
    {
        float result = 0F;
        for (int i = 0; i < loops; i++)
        {
            result = CallGetAreaIn(in rectInstance);
        }
        return result;
    }

    [Benchmark]
    public float DoReadOnlyLoopByIn()
    {
        float result = 0F;
        for (int i = 0; i < loops; i++)
        {
            result = CallGetAreaReadOnly(in rectInstance);
        }
        return result;
    }

    public float CallGetArea(Rect vector)
    {
        return vector.GetArea();
    }

    public float CallGetAreaIn(in Rect vector)
    {
        return vector.GetArea();
    }

    public float CallGetAreaReadOnly(in Rect vector)
    {
        return vector.GetAreaReadOnly();
    }
}
```

在没有使用 `in` 参数的方法中，意味着每次调用传入的是变量的一个新副本; 而在使用 `in` 修饰符的方法中，每次不是传递变量的新副本，而是传递同一副本的只读引用。

- `DoNormalLoop` 方法，参数不加修饰符，传入一般结构体，调用可变结构体的非只读方法，这是以前比较常见的做法。
- `DoNormalLoopByIn` 方法，参数加 `in` 修饰符，传入一般结构体，调用可变结构体的非只读方法。
- `DoReadOnlyLoopByIn` 方法，参数加 `in` 修饰符，传入一般结构体，调用可变结构体的只读方法。

使用 BenchmarkDotNet 工具测试三个方法的运行时间，结果如下：

|             Method |    Mean |    Error |   StdDev | Ratio | RatioSD |
|-------------------:|--------:|---------:|---------:|------:|--------:|
|       DoNormalLoop | 2.034 s | 0.0392 s | 0.0348 s |  1.00 |    0.00 |
|   DoNormalLoopByIn | 3.490 s | 0.0667 s | 0.0557 s |  1.71 |    0.03 |
| DoReadOnlyLoopByIn | 1.041 s | 0.0189 s | 0.0202 s |  0.51 |    0.01 |

从结果可以看出，当结构体可变时，使用 `in` 参数调用结构体的只读方法，性能高于其他两种; 使用 `in` 参数调用可变结构体的非只读方法，运行时间最长，严重影响了性能，应该避免这样调用。

## 总结

- 当结构体为可变类型时，应将不会引起变化（即不会改变结构体状态）的成员声明为 `readonly`。
- 当仅调用结构体中的只读实例成员时，使用 `in` 参数，可以有效提升性能。
- `readonly` 修饰符在只读属性上是必需的。编译器不会假定 getter 访问者不修改状态。因此，必须在属性上显式声明。
- 自动属性可以省略 `readonly` 修饰符，因为不管 `readonly` 修饰符是否存在，编译器都将所有自动实现的 getter 视为只读。
- 不要使用 `in` 参数调用结构体中的非只读实例成员，因为会对性能造成负面影响。

<br />

> 作者 ： 技术译民  
> 出品 ： [技术译站](https://ittranslator.cn/) 
