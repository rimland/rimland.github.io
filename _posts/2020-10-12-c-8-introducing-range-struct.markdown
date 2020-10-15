---
layout: post
title:  "C# 中 System.Range 结构体"
date:   2020-10-12 00:10:00 +0800
categories: dotnet csharp
published: true
---

> 翻译自 John Demetriou 2020年4月6日 的文章 [《C# 8 Is Introducing Ranges》](http://www.devsanon.com/c/c-8-is-introducing-ranges/)

我们之前讨论过的 C# 中的一个特性 [**System.Index 结构体**](https://mp.weixin.qq.com/s/k4qxPRaMRRUWal5muc0SQQ)[^1]，与另一特性 **System.Range 结构体** 是携手并进的。

[^1]: <https://ittranslator.cn/dotnet/csharp/2020/09/28/c-8-introducing-index-struct-and-a-brand-new-usage-for-the-hat-operator.html>  `System.Index` 结构体和 Hat 运算符(^)的全新用法

在 C# 8.0 之前，没有访问集合中任意部分的范围或切片的语法。开发人员通常不得不执行一些自定义的切片操作，或者依靠诸如 `array.Skip(5).Take(2);` 的 LINQ 方法。

现在 C# 添加了一个新的小特性，它可以帮助人们从一个大的数组项目中获取一个小范围的项目。

让我们来考虑一下。假设我们有一个项目数组，我们仅需展示其中的一部分。通常情况下，我们只需要循环这部分，然后像下面这样输出它们。

```csharp
var array = new string[]
    {
        "Item0",
        "Item1",
        "Item2",
        "Item3",
        "Item4",
        "Item5",
        "Item6",
        "Item7",
        "Item8",
        "Item9"
    };

for (int i = 1; i <= 5; i++)
{
    Console.WriteLine(array[i]);
}
```

因此当我们仅需要几个特定的项，我们通过控制索引值来获取它们。

通过使用范围(`Range`)，我们可以用以下方式来替换：

```csharp
var array = new string[]
    {
        "Item0",
        "Item1",
        "Item2",
        "Item3",
        "Item4",
        "Item5",
        "Item6",
        "Item7",
        "Item8",
        "Item9"
    };

foreach (var item in array[1..5])
{
    Console.WriteLine(item);
}
```

在这里，第一次使用的人会注意到一个奇怪的情况——它只会打印四项。为什么呢？这是因为**范围(`Range`)包含开始，但不包含末尾**。  
如果想要与上面的 `for` 循环有相同的结果，我们的 `foreach` 循环应该是：

```csharp
foreach (var item in array[1..6])
{
    Console.WriteLine(item);
}
```

## Range 的一些示例

1、从索引 1（包含） 到末尾（包含）

```csharp
foreach (var item in array[1..])
{
    Console.WriteLine(item);
}
```

2、从开始（包含）到索引 3（不包含）

```csharp
foreach (var item in array[..3])
{
    Console.WriteLine(item);
}
```

3、结合以上两种，您可以得到一个语法上正确的以下版本

```csharp
foreach (var item in array[..])
{
    Console.WriteLine(item);
}
```

它的意思是获取整个范围。

> 译者注  
> 它也等同于下面两种写法：

```csharp
foreach (var item in array[0..^0])
{
    Console.WriteLine(item);
}
```

```csharp
foreach (var item in array[0..array.Length])
{
    Console.WriteLine(item);
}
```

4、从索引 1（包含）到 *从末尾开始*的索引 1（不包含）

```csharp
foreach (var item in array[1..^1])
{
    Console.WriteLine(item);
}
```

在这里，它结合了[前面文章](https://mp.weixin.qq.com/s/k4qxPRaMRRUWal5muc0SQQ)中介绍的 `Index` 的 Hat 运算符(`^`)。

一个快速的解释，Hat 运算符(`^`)，会给您一个特定的索引。如果您写 `^1`，也就是在请求最后一项的索引。如上所述，考虑到最后一个索引号是排除的，在一个有 10 项的序列中，请求索引项直到 `^1`，您也就是在请求索引项直到索引 9（索引从 0 开始），并且该项不包括在其中。
我希望我讲清楚了。

## 将范围作为变量

我们前面所做的是，将范围(`Range`)作为类型传递。我们也可以将范围声明为一个变量：

```csharp
Range range = 1..9;
```

然后，可以在 `[` 和 `]` 字符中使用该范围：

```csharp
var subarray = array[range];
```

我们还可以将其作为方法的参数传递、将其存储为私有变量，或者用在任何业务逻辑所需的地方。

## 范围的类型支持

范围(`Range`)不能被用在 `List` 或者 `IEnumerable<Τ>`，但数组并不是唯一支持它的类型。

您还可以将索引(`Index`)和范围(`Range`) 与 `String`、`Span<T>`[^2] 或 `ReadOnlySpan<T>`[^3]一起使用。

[^2]: <https://docs.microsoft.com/zh-cn/dotnet/api/system.span-1> `Span<T>`
[^3]: <https://docs.microsoft.com/zh-cn/dotnet/api/system.readonlyspan-1> `ReadOnlySpan<T>`

与字符串一起使用的例子基本上就是代替 `Substring` 方法，如下所示：

```csharp
string s = "01234567";
string r = s[1..3]; // r 将会是 "12"
```

对于每个担心 `List`（它可能是您通常用来替代数组的类型）不支持范围的人来说，`List` 从 .Net Framework 2.0 开始就已经有 `GetRange` 方法了。

<br/>  

---

<br/>

> 以下为译者补充

## 索引和范围总结

索引(`Index`)和范围(`Range`)为访问序列中的单个元素或范围提供了简洁的语法。

对索引和范围的语言支持依赖于*两个新类型*和*两个新运算符*：

- `System.Index`[^4] 类型表示一个序列索引。
- Hat 运算符(`^`)，指定一个索引与序列末尾相关，用于构造 `System.Index` 对象。
- `System.Range`[^5] 类型表示序列的子范围。
- 范围运算符(`..`)，用于指定范围的开始和末尾，就像操作数一样，用于构造 `System.Range` 对象。

[^4]: <https://docs.microsoft.com/zh-cn/dotnet/api/system.index>  `System.Index`
[^5]: <https://docs.microsoft.com/zh-cn/dotnet/api/system.range>  `System.Range`

考虑数组 `sequence`， `0` 索引与 `sequence[0]` 相同。 `^0` 索引与 `sequence[sequence.Length]` 相同。 请注意，`sequence[..^0]` 不会引发异常，就像 `sequence[..sequence.Length]` 一样。对于任意数字 `n`，索引 `^n` 与 `sequence.Length - n` 相同。 如下面代码中的注释所示：

```csharp
var array = new string[]
{
               // index from start    index from end
    "Item0",   // 0                   ^9
    "Item1",   // 1                   ^8
    "Item2",   // 2                   ^7
    "Item3",   // 3                   ^6
    "Item4",   // 4                   ^5
    "Item5",   // 5                   ^4
    "Item6",   // 6                   ^3
    "Item7",   // 7                   ^2
    "Item8",   // 8                   ^1
};             // 9 (or array.Length) ^0
```

一个范围指定了范围的*“开始”*和*“末尾”*。 范围是左闭右开的，也就是说范围包含*“开始”*，不包含*“末尾”*。  
范围 `[0..sequence.Length]`、`[0..^0]`和 `[..]` 都表示整个范围。

<!-- ## 参考文献

[索引和范围](https://docs.microsoft.com/zh-cn/dotnet/csharp/tutorials/ranges-indexes) -->

<br />

> 作者 ： [John Demetriou](https://www.devsanon.com/whoami/)  
> 译者 ： 技术译民  
> 出品 ： [技术译站](https://ittranslator.cn/)  
> 链接 ： [英文原文](http://www.devsanon.com/c/c-8-is-introducing-ranges/)
