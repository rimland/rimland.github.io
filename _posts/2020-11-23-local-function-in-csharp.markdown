---
layout: post
title:  "C# 中的本地函数"
date:   2020-11-23 00:10:00 +0800
categories: dotnet csharp
published: true
---

今天我们来聊一聊 C# 中的本地函数。本地函数是从 C# 7.0 开始引入，并在 C# 8.0 和 C# 9.0 中加以完善的。

## 引入本地函数的原因

我们来看一下微软 C# 语言首席设计师 Mads Torgersen 的一段话：

> Mads Torgersen：  
> 我们认为这个场景是有用的 —— 您需要一个辅助函数。 您仅能在单个函数中使用它，并且它可能使用包含在该函数作用域内的变量和类型参数。 另一方面，与 lambda 不同，您不需要将其作为第一类对象，因此您不必关心为它提供一个委托类型并分配一个实际的委托对象。 另外，您可能希望它是递归的或泛型的，或者将其作为迭代器实现。[^1]

[^1]: <https://github.com/dotnet/roslyn/issues/3911> C# Design Meeting Notes

正是 Mads Torgersen 所说的这个原因，让 C# 语言团队添加了对本地函数的支持。  
本人在近期的项目中多次用到本地函数，发现它比使用委托加 Lambda 表达式的写法更加方便和清晰。

## 本地函数是什么

用最简单的大白话来说，本地函数就是*方法中的方法*，是不是一下子就理解了？不过，这样理解本地函数难免有点片面和肤浅。

我们来看一下官方对本地函数的定义：

**本地函数是一种嵌套在另一个成员中的私有方法，仅能从包含它的成员中调用它。** [^locfun]

[^locfun]: <https://docs.microsoft.com/zh-cn/dotnet/csharp/programming-guide/classes-and-structs/local-functions> 本地函数

定义中点出了三个重点：

1. 本地函数是*私有方法*。
2. 本地函数是*嵌套在另一成员中*的方法。
3. *只能从定义该本地函数的成员中调用*它，其它位置都不可以。

其中，可以声明和调用本地函数的成员有以下几种：

- 方法，尤其是迭代器方法和异步方法
- 构造函数
- 属性访问器
- 事件访问器
- 匿名方法
- Lambda 表达式
- 析构函数
- 其它本地函数

举个简单的示例，在方法 `M` 中定义一个本地函数 `add`：

```csharp
public class C
{
    public void M()
    {
        int result = add(100, 200);
        // 本地函数 add
        int add(int a, int b) { return a + b; }
    }
}
```

本地函数都是私有的，目前可用的修饰符只有 `async`、`unsafe`、`static`（静态本地函数无法访问局部变量和实例成员） 和 `extern` 四种。在包含成员中定义的所有本地变量和其方法参数都可在非静态的本地函数中访问。本地函数可以声明在其包含成员中的任意位置，但通常的习惯是声明在其包含成员的最后位置（即结束 `}` 之前）。

## 本地函数与 Lambda 表达式的比较

本地函数和我们熟知的 [Lambda 表达式](https://docs.microsoft.com/zh-cn/dotnet/csharp/language-reference/operators/lambda-expressions) [^Lambda]非常相似，比如上面示例中的本地函数，我们可以使用 Lambda 表达式实现如下：

[^Lambda]: <https://docs.microsoft.com/zh-cn/dotnet/csharp/language-reference/operators/lambda-expressions> Lambda 表达式

```csharp
public void M()
{
    // Lambda 表达式
    Func<int, int, int> add = (int a, int b) => a + b;
    int result = add(100, 200);
}
```

如此看来，似乎选择使用 Lambda 表达式还是本地函数只是编码风格和个人偏好问题。但是，应该注意到，使用它们的时机和条件其实是存在很大差异的。

我们来看一下获取斐波那契数列第 n 项的例子，其实现包含递归调用。

```csharp
// 使用本地函数的版本
public static uint LocFunFibonacci(uint n)
{
    return Fibonacci(n);

    uint Fibonacci(uint num)
    {
        if (num == 0) return 0;
        if (num == 1) return 1;
        return checked(Fibonacci(num - 2) + Fibonacci(num - 1));
    }
}
// 使用 Lambda 表达式的版本
public static uint LambdaFibonacci(uint n)
{
    Func<uint, uint> Fibonacci = null; //这里必须明确赋值
    Fibonacci = num => {
        if (num == 0) return 0;
        if (num == 1) return 1;
        return checked(Fibonacci(num - 2) + Fibonacci(num - 1));
    };

    return Fibonacci(n);
}
```

### 命名

本地函数的命名方式和类中的方法类似，声明本地函数的过程就像是编写普通方法。 Lambda 表达式是一种匿名方法，需要分配给委托类型的变量，通常是 `Action` 或 `Func` 类型的变量。

### 参数和返回值类型

本地函数因为语法类似于普通方法，所以参数类型和返回值类型已经是函数声明的一部分。Lambda 表达式依赖于为其分配的 `Action` 或 `Func` 变量的类型来确定参数和返回值的类型。

### 明确赋值

**本地函数是在编译时定义的**方法。由于未将本地函数分配给变量，因此可以从包含它的成员的任意代码位置调用它们。在本例中，我们将本地函数 `Fibonacci` 定义在其包含方法 `LocFunFibonacci` 的 `return` 语句之后，方法体的结束 `}` 之前，而不会有任何编译错误。

而 **Lambda 表达式是在运行时声明和分配的**对象。使用 Lambda 表达式时，必须先对其进行明确赋值：声明要分配给它的 `Action` 或 `Func` 变量，并为其分配 Lambda 表达式，然后才能在后面的代码中调用它们。在本例中，我们首先声明并初始化了一个委托变量 `Fibonacci`， 然后将 Lambda 表达式赋值给了该委托变量。

这些区别意味着*使用本地函数创建递归算法会更轻松*。因为在创建递归算法时，使用本地函数和使用普通方法是一样的; 而使用 Lambda 表达式，则必须先声明并初始化一个委托变量，然后才能将其重新分配给引用相同 Lambda 表达式的主体。

### 变量捕获

我们使用 VS 编写或者编译代码时，编译器可以对代码执行静态分析，提前告知我们代码中存在的问题。

看下面一个例子：

```csharp
static int M1()
{
    int num; //这里不用赋值默认值
    LocalFunction();
    return num; //OK
    void LocalFunction() => num = 8; // 本地函数
}

static int M2()
{
    int num;    //这里必须赋值默认值（比如改为：int num = 0;），下面使用 num 的行才不会报错
    Action lambdaExp = () => num = 8; // Lambda 表达式
    lambdaExp();
    return num; //错误 CS0165 使用了未赋值的局部变量“num”
}
```

在使用本地函数时，因为*本地函数是在编译时定义的*，编译器可以确定在调用本地函数 `LocalFunction` 时明确分配 `num`。 因为在 return 语句之前调用了 `LocalFunction`，也就在 return 语句前明确分配了 `num`，所以不会引发编译异常。  
而在使用 Lambda 表达式时，因为 *Lambda 表达式是在运行时声明和分配的*，所以在 return 语句前，编译器不能确定是否分配了 `num`，所以会引发编译异常。

### 内存分配

为了更好地理解本地函数和 Lambda 表达式在分配上的区别，我们先来看下面两个例子，并看一下它们编译后的代码。

Lambda 表达式：

```csharp
public class C
{
    public void M()
    {
        int c = 300;
        int d = 400;
        int num = c + d;
        //Lambda 表达式
        Func<int, int, int> add = (int a, int b) => a + b + c + d;
        var num2 = add(100, 200);
    }
}
```

使用 Lambda 表达式，编译后的[代码如下](https://sharplab.io/#v2:CYLg1APgAgTAjAWAFBQMwAJboMLIN7LpGYZQAs6AsgBQCUhxBSxL6AlgHYAu6AxugF50qAAwiA3A1btu6YIPRkxk5tJk8OAVwC2C/mDkq16APQmAMgENtAI2CX0gCwjAffGB4fSmsoAVgA8nLgA06kH+AHzolsDyQtT+ESGyNrSC4Q4GNugG+oYeLABulgBO6FraMAqRwNRwYkEwYrRGxAC+yM1AA===)：

```csharp
public class C
{
    [CompilerGenerated]
    private sealed class <>c__DisplayClass0_0
    {
        public int c;

        public int d;

        internal int <M>b__0(int a, int b)
        {
            return a + b + c + d;
        }
    }

    public void M()
    {
        <>c__DisplayClass0_0 <>c__DisplayClass0_ = new <>c__DisplayClass0_0();
        <>c__DisplayClass0_.c = 300;
        <>c__DisplayClass0_.d = 400;
        int num = <>c__DisplayClass0_.c + <>c__DisplayClass0_.d;
        Func<int, int, int> func = new Func<int, int, int>(<>c__DisplayClass0_.<M>b__0);
        int num2 = func(100, 200);
    }
}
```

可以看出，使用 Lambda 表达式时，编译后实际上是生成了包含实现方法的一个类，然后创建该类的一个对象并将其分配给了委托。因为要创建类的对象，所以需要额外的堆（heap）分配。

我们再来看一下具有同样功能的本地函数实现：

```csharp
public class C
{
    public void M()
    {
        int c = 300;
        int d = 400;
        int num = c + d;
        var num2 = add(100, 200);
        //本地函数
        int add(int a, int b) { return a + b + c + d; }
    }
}
```

使用本地函数，编译后的[代码如下](https://sharplab.io/#v2:CYLg1APgAgTAjAWAFBQMwAJboMLIN7LpGYZQAs6AsgBQCUhxBSxL6AlgHYAu6AxugF50qAAwiA3A1btu6YIPRkxk5tJk8OAVwC2C/mDkq16AG4BDAE7ot2mArPBg1OGIA06GGNoqprTjwcnf3Qzd2CAI1p0PEwAdhD0A3DEvhTgcXQAX19spEygA)：

```csharp
public class C
{
    [StructLayout(LayoutKind.Auto)]
    [CompilerGenerated]
    private struct <>c__DisplayClass0_0
    {
        public int c;

        public int d;
    }

    public void M()
    {
        <>c__DisplayClass0_0 <>c__DisplayClass0_ = default(<>c__DisplayClass0_0);
        <>c__DisplayClass0_.c = 300;
        <>c__DisplayClass0_.d = 400;
        int num = <>c__DisplayClass0_.c + <>c__DisplayClass0_.d;
        int num2 = <M>g__add|0_0(100, 200, ref <>c__DisplayClass0_);
    }

    [CompilerGenerated]
    private static int <M>g__add|0_0(int a, int b, ref <>c__DisplayClass0_0 P_2)
    {
        return a + b + P_2.c + P_2.d;
    }
}
```

可以看出，使用本地函数时，编译后只是在包含类中生成了一个私有方法，因此调用时不需要实例化对象，不需要额外的堆（heap）分配。  
当本地函数中使用到其包含成员中的变量时，编译器生成了一个结构体，并将此结构体的实例以引用（`ref`）方式传递到了本地函数，这也有助于节省内存分配。

综上所述，使用本地函数相比使用 Lambda 表达式更能节省时间和空间上的开销。

## 本地函数与异常

本地函数还有一个比较实用功能是可以在迭代器方法和异步方法中立即显示异常。

我们知道，迭代器方法的主体是延迟执行的，所以仅在枚举其返回的序列时才显示异常，而并非在调用迭代器方法时。  
我们来看一个经典的迭代器方法的例子：

```csharp
static void Main(string[] args)
{
    int[] list = new[] { 1, 2, 3, 4, 5, 6 };
    var result = Filter(list, null);

    Console.WriteLine(string.Join(',', result));
}

public static IEnumerable<T> Filter<T>(IEnumerable<T> source, Func<T, bool> predicate)
{
    if (source == null) throw new ArgumentNullException(nameof(source));
    if (predicate == null) throw new ArgumentNullException(nameof(predicate));

    foreach (var element in source)
        if (predicate(element))
            yield return element;
}
```

运行上面的代码，由于迭代器方法的主体是延迟执行的，所以抛出异常的位置将发生在 `string.Join(',', result)` 所在的行，也就是在枚举返回的序列结果 `result` 时显示，如图：

![exception_1](/assets/images/202011/exception_1.png#center)

如果我们把上面的迭代器方法 `Filter` 中的迭代器部分放入本地函数：

```csharp
static void Main(string[] args)
{
    int[] list = new[] { 1, 2, 3, 4, 5, 6 };
    var result = Filter(list, null);

    Console.WriteLine(string.Join(',', result));
}

public static IEnumerable<T> Filter<T>(IEnumerable<T> source, Func<T, bool> predicate)
{
    if (source == null) throw new ArgumentNullException(nameof(source));
    if (predicate == null) throw new ArgumentNullException(nameof(predicate));
    //本地函数
    IEnumerable<T> Iterator()
    {
        foreach (var element in source)
            if (predicate(element))
                yield return element;
    }
    return Iterator();
}
```

那么这时抛出异常的位置将发生在 `Filter(list, null)` 所在的行，也就是在调用 `Filter` 方法时显示，如图：

![exception_2](/assets/images/202011/exception_2.png#center)

可以看出，使用了本地函数包装迭代器逻辑的写法，相当于把显示异常的位置提前了，这有助于我们更快的观察到异常并进行处理。

同理，在使用了 `async` 的异步方法中，如果把异步执行部分放入 `async` 的本地函数中，也有助于立即显示异常。由于篇幅问题这里不再举例，可以查看[官方文档](https://docs.microsoft.com/zh-cn/dotnet/csharp/programming-guide/classes-and-structs/local-functions#local-functions-and-exceptions)<!-- [^ex]-->。

<!-- [^ex]: <https://docs.microsoft.com/zh-cn/dotnet/csharp/programming-guide/classes-and-structs/local-functions#local-functions-and-exceptions> 本地函数和异常 -->

## 总结

综上所述，本地函数是*方法中的方法*，但它又不仅仅是*方法中的方法*，它还可以出现在构造函数、属性访问器、事件访问器等等成员中; 本地函数在功能上类似于 Lambda 表达式，但它比 Lambda 表达式方便和清晰很多，在分配和性能上也比 Lambda 表达式略占优势; 本地函数还有助于在迭代器方法和异步方法中立即显示异常。

<br />

> 作者 ： 技术译民  
> 出品 ： [技术译站](https://ittranslator.cn/)
