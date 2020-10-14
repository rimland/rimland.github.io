---
layout: post
title:  "C# 中 System.Index 结构体和 Hat 运算符(^)的全新用法"
date:   2020-09-28 00:10:00 +0800
categories: dotnet csharp
published: true
---

> 翻译自 John Demetriou 2019年2月17日 的文章 [《C# 8 – Introducing Index Struct And A Brand New Usage For The Hat Operator》](http://www.devsanon.com/c/c-8-introducing-index-struct-and-a-brand-new-usage-for-the-hat-operator/)

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

`System.Index` 结构体，与 `System.Range` 结构体[^1]是携手并进的，您可以点击[这里查看](https://ittranslator.cn/dotnet/csharp/2020/10/12/c-8-introducing-range-struct.html)。

[^1]: <https://ittranslator.cn/dotnet/csharp/2020/10/12/c-8-introducing-range-struct.html> `System.Range` 结构体

<br />

> 作者 ： [John Demetriou](https://www.devsanon.com/whoami/)  
> 译者 ： 技术译民  
> 出品 ： [技术译站](https://ittranslator.cn/)  
> 链接 ： [英文原文](http://www.devsanon.com/c/c-8-introducing-index-struct-and-a-brand-new-usage-for-the-hat-operator/)
