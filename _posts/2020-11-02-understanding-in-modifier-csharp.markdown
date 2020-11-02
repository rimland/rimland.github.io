---
layout: post
title:  "C# 中的 in 参数和性能分析"
date:   2020-11-02 00:10:00 +0800
categories: dotnet csharp
published: true
---

`in` 修饰符也是从 C# 7.2 开始引入的，它与我们上一篇中讨论的 《[C# 中的只读结构体（readonly struct）](https://mp.weixin.qq.com/s/wwVZbdY7m7da1nmIKb2jCA)》[^1] 是紧密相关的。

[^1]: <https://ittranslator.cn/dotnet/csharp/2020/10/26/c-7-2-talk-about-readonly-struct.html>   C# 中的只读结构体

## in 修饰符

`in` 修饰符通过引用传递参数。 它让形参成为实参的别名，即对形参执行的任何操作都是对实参执行的。 它类似于 `ref` 或 `out` 关键字，不同之处在于 `in` 参数无法通过调用的方法进行修改。

- `ref` 修饰符，指定参数由引用传递，可以由调用方法读取或写入。
- `out` 修饰符，指定参数由引用传递，必须由调用方法写入。
- `in` 修饰符，指定参数由引用传递，可以由调用方法读取，但不可以写入。

举个简单的例子：

```csharp
struct Product
{
    public int ProductId { get; set; }
    public string ProductName { get; set; }
}

public static void Modify(in Product product)
{
    //product = new Product();          // 错误 CS8331 无法分配到 变量 'in Product'，因为它是只读变量
    //product.ProductName = "测试商品";  // 错误 CS8332 不能分配到 变量 'in Product' 的成员，因为它是只读变量
    Console.WriteLine($"Id: {product.ProductId}, Name: {product.ProductName}"); // OK
}
```

## 引入 in 参数的原因

我们知道，结构体实例的内存在栈（stack）上进行分配，所占用的内存随声明它的类型或方法一起回收，所以通常在内存分配上它是比引用类型占有优势的。[^2]  

[^2]: <https://ittranslator.cn/dotnet/csharp/2020/09/14/difference-between-struct-and-class-in-c-sharp.html>   C# 中 Struct 和 Class 的区别总结

但是对于有些很大（比如有很多字段或属性）的结构体，将其作为方法参数，在紧凑的循环或关键代码路径中调用方法时，复制这些结构的成本就会很高。当所调用的方法不修改该参数的状态，使用新的修饰符 `in` 声明参数以指定此参数可以按引用安全传递，可以避免（可能产生的）高昂的复制成本，从而提高代码运行的性能。  

## in 参数对性能的提升

为了测试 `in` 修饰符对性能的提升，我定义了两个较大的结构体，一个是可变的结构体 `NormalStruct`，一个是只读的结构体 `ReadOnlyStruct`，都定义了 30 个属性，然后定义三个测试方法：

- `DoNormalLoop` 方法，参数不加修饰符，传入一般结构体，这是以前比较常见的做法。
- `DoNormalLoopByIn` 方法，参数加 `in` 修饰符，传入一般结构体。
- `DoReadOnlyLoopByIn` 方法，参数加 `in` 修饰符，传入只读结构体。

代码如下所示：

```csharp
public struct NormalStruct
{
    public decimal Number1 { get; set; }
    public decimal Number2 { get; set; }
    //...
    public decimal Number30 { get; set; }
}

public readonly struct ReadOnlyStruct
{
    public readonly decimal Number1 { get; }
    public readonly decimal Number2 { get; }
    //...
    public readonly decimal Number30 { get; }
}

public class BenchmarkClass
{
    const int loops = 50000000;
    NormalStruct normalInstance = new NormalStruct();
    ReadOnlyStruct readOnlyInstance = new ReadOnlyStruct();

    [Benchmark(Baseline = true)]
    public decimal DoNormalLoop()
    {
        decimal result = 0M;
        for (int i = 0; i < loops; i++)
        {
            result = Compute(normalInstance);
        }
        return result;
    }

    [Benchmark]
    public decimal DoNormalLoopByIn()
    {
        decimal result = 0M;
        for (int i = 0; i < loops; i++)
        {
            result = ComputeIn(in normalInstance);
        }
        return result;
    }

    [Benchmark]
    public decimal DoReadOnlyLoopByIn()
    {
        decimal result = 0M;
        for (int i = 0; i < loops; i++)
        {
            result = ComputeIn(in readOnlyInstance);
        }
        return result;
    }

    public decimal Compute(NormalStruct s)
    {
        //业务逻辑
        return 0M;
    }

    public decimal ComputeIn(in NormalStruct s)
    {
        //业务逻辑
        return 0M;
    }

    public decimal ComputeIn(in ReadOnlyStruct s)
    {
        //业务逻辑
        return 0M;
    }
}
```

在没有使用 `in` 参数的方法中，意味着每次调用传入的是变量的一个新副本; 而在使用 `in` 修饰符的方法中，每次不是传递变量的新副本，而是传递同一副本的只读引用。

使用 BenchmarkDotNet 工具测试三个方法的运行时间，结果如下：

```
|             Method |       Mean |    Error |    StdDev |     Median | Ratio | RatioSD |
|------------------- |-----------:|---------:|----------:|-----------:|------:|--------:|
|       DoNormalLoop | 1,536.3 ms | 65.07 ms | 191.86 ms | 1,425.7 ms |  1.00 |    0.00 |
|   DoNormalLoopByIn |   480.9 ms | 27.05 ms |  79.32 ms |   446.3 ms |  0.32 |    0.07 |
| DoReadOnlyLoopByIn |   581.9 ms | 35.71 ms | 105.30 ms |   594.1 ms |  0.39 |    0.10 |
```

从这个结果可以看出，如果使用 `in` 参数，不管是一般的结构体还是只读结构体，相对于不用 `in` 修饰符的参数，性能都有较大的提升。这个性能差异在不同的机器上运行可能会有所不同，但是毫无疑问，使用 `in` 参数会得到更好的性能。

### 在 Parallel.For 中使用

在上面简单的 `for` 循环中，我们看到 `in` 参数有助于性能的提升，那么在并行运算中呢？我们把上面的 `for` 循环改成使用 `Parallel.For` 来实现，代码如下：

```csharp
[Benchmark(Baseline = true)]
public decimal DoNormalLoop()
{
    decimal result = 0M;
    Parallel.For(0, loops, i => Compute(normalInstance));
    return result;
}

[Benchmark]
public decimal DoNormalLoopByIn()
{
    decimal result = 0M;
    Parallel.For(0, loops, i => ComputeIn(in normalInstance));
    return result;
}

[Benchmark]
public decimal DoReadOnlyLoopByIn()
{
    decimal result = 0M;
    Parallel.For(0, loops, i => ComputeIn(in readOnlyInstance));
    return result;
}
```

事实上，道理是一样的，在使用 `in` 参数的方法中，每次调用传入的是变量的一个新副本; 在使用 `in` 修饰符的方法中，每次传递的是同一副本的只读引用。  

使用 BenchmarkDotNet 工具测试三个方法的运行时间，结果如下：

```
|             Method |     Mean |    Error |   StdDev | Ratio |
|------------------- |---------:|---------:|---------:|------:|
|       DoNormalLoop | 793.4 ms | 13.02 ms | 11.54 ms |  1.00 |
|   DoNormalLoopByIn | 352.4 ms |  6.99 ms | 17.27 ms |  0.42 |
| DoReadOnlyLoopByIn | 341.1 ms |  6.69 ms | 10.02 ms |  0.43 |
```

同样表明，使用 `in` 参数会得到更好的性能。

## 使用 in 参数需要注意的地方

我们来看一个例子，定义一个一般的结构体，包含一个属性 `Value` 和 一个修改该属性的方法 `UpdateValue`。 然后在别的地方也定义一个方法 `UpdateMyNormalStruct` 来修改该结构体的属性 `Value`。
代码如下：

```csharp
struct MyNormalStruct
{
    public int Value { get; set; }

    public void UpdateValue(int value)
    {
        Value = value;
    }
}

class Program
{
    static void UpdateMyNormalStruct(MyNormalStruct myStruct)
    {
        myStruct.UpdateValue(8);
    }

    static void Main(string[] args)
    {
        MyNormalStruct myStruct = new MyNormalStruct();
        myStruct.UpdateValue(2);
        UpdateMyNormalStruct(myStruct);
        Console.WriteLine(myStruct.Value);
    }
}
```

您可以猜想一下它的运行结果是什么呢？ 2 还是 8？  

我们来理一下，在 `Main` 中先调用了结构体自身的方法 `UpdateValue` 将 `Value` 修改为 2， 再调用 `Program` 中的方法 `UpdateMyNormalStruct`， 而该方法中又调用了 `MyNormalStruct` 结构体自身的方法 `UpdateValue`，那么输出是不是应该是 8 呢？ 如果您这么想就错了。   
它的正确输出结果是 **2**，这是为什么呢？

这是因为，结构体和许多内置的简单类型（sbyte、byte、short、ushort、int、uint、long、ulong、char、float、double、decimal、bool 和 enum 类型）一样，都是值类型，在传递参数的时候以值的方式传递。因此调用方法 `UpdateMyNormalStruct` 时传递的是 `myStruct` 变量的新副本，在此方法中，其实是此副本调用了 `UpdateValue` 方法，所以原变量 `myStruct` 的 `Value` 不会发生变化。

说到这里，有聪明的朋友可能会想，我们给 `UpdateMyNormalStruct` 方法的参数加上 `in` 修饰符，是不是输出结果就变为 8 了，`in` 参数不就是引用传递吗？  
我们可以试一下，把代码改成：

```csharp
static void UpdateMyNormalStruct(in MyNormalStruct myStruct)
{
    myStruct.UpdateValue(8);
}

static void Main(string[] args)
{
    MyNormalStruct myStruct = new MyNormalStruct();
    myStruct.UpdateValue(2);
    UpdateMyNormalStruct(in myStruct);
    Console.WriteLine(myStruct.Value); 
}
```

运行一下，您会发现，结果依然为 **2** ！这……就让人大跌眼镜了……  
用工具查看一下 `UpdateMyNormalStruct` 方法的中间语言：

```msil
.method private hidebysig static 
	void UpdateMyNormalStruct (
		[in] valuetype ConsoleApp4InTest.MyNormalStruct& myStruct
	) cil managed 
{
	.param [1]
		.custom instance void [System.Runtime]System.Runtime.CompilerServices.IsReadOnlyAttribute::.ctor() = (
			01 00 00 00
		)
	// Method begins at RVA 0x2164
	// Code size 18 (0x12)
	.maxstack 2
	.locals init (
		[0] valuetype ConsoleApp4InTest.MyNormalStruct
	)

	IL_0000: nop
	IL_0001: ldarg.0
	IL_0002: ldobj ConsoleApp4InTest.MyNormalStruct 
	IL_0007: stloc.0
	IL_0008: ldloca.s 0
	IL_000a: ldc.i4.8
	IL_000b: call instance void ConsoleApp4InTest.MyNormalStruct::UpdateValue(int32)
	IL_0010: nop
	IL_0011: ret
} // end of method Program::UpdateMyNormalStruct
```

您会发现，在 `IL_0002`、`IL_0007` 和 `IL_0008` 这几行，仍然创建了一个 `MyNormalStruct` 结构体的防御性副本(`defensive copy`)。虽然在调用方法 `UpdateMyNormalStruct` 时以引用的方式传递参数，但在方法体中调用结构体自身的 `UpdateValue` 前，却创建了一个该结构体的防御性副本，改变的是该副本的 `Value`。这就有点奇怪了，不是吗？

Google 了一些资料是这么解释的：C# 无法知道当它调用一个结构体上的方法(或getter)时，是否也会修改它的值/状态。于是，它所做的就是创建所谓的“防御性副本”。当在结构体上运行方法(或getter)时，它会创建传入的结构体的副本，并在副本上运行方法。这意味着原始副本与传入时完全相同，调用者传入的值并没有被修改。

有没有办法让方法 `UpdateMyNormalStruct` 调用后输出 8 呢？您将参数改成 `ref` 修饰符试试 :stuck_out_tongue_winking_eye: :grin: :joy:

综上所述，**最好不要把 `in` 修饰符和一般*（非只读）*结构体一起使用，以免产生晦涩难懂的行为，而且可能对性能产生负面影响。**

## in 参数的限制

不能将 `in`、`ref` 和 `out` 关键字用于以下几种方法：

- 异步方法，通过使用 `async` 修饰符定义。
- 迭代器方法，包括 `yield return` 或 `yield break` 语句。
- 扩展方法的第一个参数不能有 `in` 修饰符，除非该参数是结构体。
- 扩展方法的第一个参数，其中该参数是泛型类型（即使该类型被约束为结构体。）

## 总结

- 使用 `in` 参数，有助于明确表明此参数不可修改的意图。
- 当**只读结构体（`readonly struct`）**的大小大于 `IntPtr.Size` [^IntPtr] 时，出于性能原因，应将其作为 `in` 参数传递。
- 不要将一般*（非只读）*结构体作为 `in` 参数，因为结构体是可变的，反而有可能对性能产生负面影响，并且可能产生晦涩难懂的行为。

[^IntPtr]: <https://docs.microsoft.com/zh-cn/dotnet/api/system.intptr.size#System_IntPtr_Size>  IntPtr.Size

<br />

> 作者 ： 技术译民  
> 出品 ： [技术译站](https://ittranslator.cn/)  
