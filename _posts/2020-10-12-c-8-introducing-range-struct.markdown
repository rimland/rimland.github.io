---
layout: post
title:  "C# 中 System.Range 结构体和 "
date:   2020-10-12 00:10:00 +0800
categories: dotnet csharp
published: false
---

> 翻译自 John Demetriou 2020年4月6日 的文章 [《C# 8 Is Introducing Ranges》](http://www.devsanon.com/c/c-8-is-introducing-ranges/)

我们之前讨论过的 C# 中的一个特性 [**System.Index 结构体**](https://mp.weixin.qq.com/s/k4qxPRaMRRUWal5muc0SQQ)，与另一特性 **System.Range 结构体** 是携手并进的。

在 C# 8.0 之前，没有访问集合任意部分的范围或切片的语法。开发人员通常不得不执行一些自定义的切片操作，或者依靠诸如 `array.Skip(5).Take(2);` 的 LINQ 方法。

Now C# is adding a new small feature, that can help people in getting a range of items from a bigger array of items.

现在 C# 添加了一个新的小特性，它可以帮助人们从一个大的数组项目中获取一个小范围的项目。

让我们看一下基本情况。假设我们有一个项目数组，我们仅需展示其中的一部分。通常情况下，我们只需要从头到尾循环，然后像下面这样输出它们。

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

通过使用 `Range`，我们可以用以下操作来替代：

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

在这里，第一次使用的人会注意到一些奇怪的情况——它只会打印四项。为什么呢？这是因为 `Range` 包含开始，但不包含末尾。  
如果想要与上面的 `for` 循环有相同的效果，我们的 `foreach` 循环应该是：

```csharp
foreach (var item in array[1..6])
{
    Console.WriteLine(item);
}
```

 ## Range 的一些实例

1. 从索引 1（包含） 到末尾（包含）
   
```csharp
foreach (var item in array[1..])
{
    Console.WriteLine(item);
}
```

2. 从开始（包含）到索引 3（不包含）

```csharp
foreach (var item in array[..3])
{
    Console.WriteLine(item);
}
```

3. 结合以上两种，您可以得到一个语法上正确的以下版本

```csharp
foreach (var item in array[..])
{
    Console.WriteLine(item);
}
```

它的意思是说，获取整个范围。

> 译者补充  
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

4. 从索引 1（包含）到 *从末尾数*的索引 1（不包含）

```csharp
foreach (var item in array[1..^1])
{
    Console.WriteLine(item);
}
```

在这里，它结合了[前面文章](https://mp.weixin.qq.com/s/k4qxPRaMRRUWal5muc0SQQ)中介绍的 `Index` 的 Hat 运算符(`^`)。

一个快速的解释，Hat 运算符(`^`)，会给你一个特定的索引。如果你写 `^1`，你也就是在请求最后一项的索引。如上所述，考虑到最后一个索引号是排除的，在一个有 10 项的序列中，请求索引项直到 `^1`，您也就是在请求索引项直到索引 9（索引从 0 开始），并且该项不包括在其中。
我希望我讲清楚了。

## 将 Range 作为类型

What we can do now, is use Ranges as a type to pass around. Which is what we did earlier, but we can also store it in a variable or pass it around, by simply typing

我们现在可以做的是，用 `Range` 作为传递类型。这是我们之前所做的，但是我们也可以将它存储在一个变量中，或者通过简单的输入来传递它

我们现在可以做的是，使用范围作为传递类型。这是我们之前做的，但我们也可以将它存储在一个变量中，或者通过输入

```csharp
Range range = 1..9;
```

将其作为方法的参数传递，将其存储为私有变量，或者用在其他业务逻辑所需的任何地方。

现在，`Range` 不能被用在 `List` 或者 `IEnumerable<Τ>`，但是数组并不是唯一支持它的类型。

您还可以将 `Index` 和 `Range` 与 `string`、`Span` 或 `ReadOnlySpan` 一起使用。

与字符串一起使用的示例基本上是替换 `Substring` 方法，如下所示：

```csharp
string s = "01234567";
string r = s[1..3]; // r 将会是 "12"
```

Now to everyone worrying about their lists (which probably is what you usually use instead of array), List already has the GetRange method since .Net Framework 2.0 (which is why they went with a method here).

现在对于每个担心 `List`（它可能是您通常用来替代数组的类型）的人来说，`List` 从 .Net Framework 2.0 开始就已经有 `GetRange` 方法了（这就是他们在这里使用方法的原因）。



















<br/><br/><br/><br/><br/><br/><br/><br/><br/>

今天我们要讲的是 Hat 运算符(`^`)。目前为止，Hat 运算符(`^`)已经被用作布尔类型的异或运算符，以及字节、整型类型的按位异或运算符。在 C# 8 中，它有一个新的用法。

这个运算符的新用法是*自动创建 `Index` 结构体的实例*。那什么是 `Index` 结构呢？这在 C# 8 中也有介绍。  
`Index` 结构体的代码（就像所有的 C# 代码一样）可以[在 github 上找到](https://github.com/dotnet/coreclr/blob/88eb93abba27e97d5997ad2d6c04b54aeaff5e8f/src/System.Private.CoreLib/shared/System/Index.cs)。你可以看到，它是一个相当简单的结构体，包含一个整数值，和一个定义是否应该从末尾开始计数的布尔值。  
它有助于让访问数组比以往容易很多。我们可以很轻松地将这个值存储在一个 `Index` 类型中来代替一个整数，它比一个简单的整数更清楚地定义了我们的意图，并有助于避免该变量的误用。

到目前为止，当尝试访问数组中特定索引处的值时，我们总是从第一个元素开始考虑。那么 Hat 运算符(`^`)是如何帮助我们的呢？例如，如果你想获取一个已知大小的数组的最后一个元素，你通常会从数组的 Length 中减去 1，并在检索时使用这个技巧或硬编码的数字。

例如：

```csharp
int[] array = new int[] { 1, 3, 5, 7, 9 };
var x = array[4];
```

你可以像下面的例子一样使用数组提供的变量:

```csharp
int[] array = new int[] { 1, 3, 5, 7, 9 };
var x = array[array.Length - 1];
```

这种方法也可以用于编译时长度未知的数组。并且这通常是首选方法，因为它表明您希望更容易地检索最后一项，而不是必须进行计数来查看哪个是第四项并验证它是最后一项。

适当的使用 `Index` 结构，我们可以很容易地创建一个索引值类型，这样我们就可以存储它并随心地重用它，以避免违反 DRY 原则。

```csharp
Index lastItem = new Index(4, false);
int[] array = new int[] { 1, 3, 5, 7, 9 };
var x = array[lastItem];
```

> 译者注：  
> DRY 是 “Don't repeat yourself” 的缩写，是软件开发的一个原则，旨在减少软件模式的重复，用抽象来替代它，或者使用数据规范化来避免冗余。也就是说，在一个设计里，对于任何东西，都应该有且只有一个表示，其它的地方都应该引用这一处。这样需要改动的时候，只需调整这一处，所有的地方就都变更过来了。

但正如我们所看到的，我们还可以使用 fromEnd 参数来更好地表达我们希望检索最后一项，并在编译时从一个大小未知的数组中检索最后一项。

```csharp
Index lastItem = new Index(1, true);
int[] array = new int[] { 1, 3, 5, 7, 9 };
var x = array[lastItem];
```

不过，我们需要记住的一点是，当从末尾开始计数时，不是以 0 开始的索引。把它想象成我们使用的 `Length - x` ，其中 **`x`** 就是我们在 `Index` 结构体构造函数中使用的值。

但是 Hat 运算符(`^`)在这一切中有何用武之地呢？唔，Hat 运算符(`^`) 是调用 `Index` 结构体时将 fromEnd 设置为 true 的简写方式。
比如，下面的两行是完全相同的：

```csharp
Index lastItem = new Index(1, true); // line 1
int[] array = new int[] { 1, 3, 5, 7, 9 };
var x = array[lastItem];

Index lastItem = ^1;  //line 2, 同 line 1
int[] array = new int[] { 1, 3, 5, 7, 9 };
var x = array[lastItem];
```

或者，如果你想要检索倒数第二项，你可以这么做：

```csharp
Index secondToLast = new Index(2, true);
int[] array = new int[] { 1, 3, 5, 7, 9 };
var x = array[secondToLast];

Index secondToLast = ^2;
int[] array = new int[] { 1, 3, 5, 7, 9 };
var x = array[secondToLast];
```

就这样，一个新的结构体类型和一个旧运算符(`^`)的新用法打包在一起了。

<br />

> 作者 ： [John Demetriou](https://www.devsanon.com/whoami/)   
> 译者 ： 技术译民   
> 出品 ： [技术译站](https://ittranslator.cn/)   
> 链接 ： [英文原文](http://www.devsanon.com/c/c-8-introducing-index-struct-and-a-brand-new-usage-for-the-hat-operator/)

