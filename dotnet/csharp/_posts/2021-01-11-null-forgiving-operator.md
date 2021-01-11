---
layout: post
title:  "C# 中的 null 包容运算符 “!” —— 概念、由来、用法和注意事项"
date:   2021-01-11 00:10:00 +0800
categories: dotnet csharp
published: true
---

在 2020 年的最后一天，[博客园发起了一个开源项目：基于 .NET 的博客引擎 fluss](https://www.cnblogs.com/cmt/p/14217355.html)，我抽空把源码下载下来看了下，发现在属性的定义中，有很多地方都用到了 `null!`，[如下图所示](https://github.com/cnblogs/fluss/blob/main/src/Cnblogs.Fluss.Domain/Entities/ContentBlock.cs)：

![cnblog null](/assets/images/202101/cnblog-null.png)

这是什么用法呢？之前没有在项目中用过，所以得空就研究了一下。

以前，`!` 运算符用来表示 “否”，比如不等于 `!=`。在 C# 8.0 以后，`!` 运算符有了一个新意义—— **`null` 包容运算符**，用来控制类型的*可空性*。要了解 `null` 包容运算符，首先就要了解*可为 null 的引用类型*。

## 可为 null 的引用类型

C# 8.0 引入了[可为 null 的引用类型](https://docs.microsoft.com/zh-cn/dotnet/csharp/nullable-references)，与可空类型补充*值类型*的方式一样，它们以相同的方式补充*引用类型*。也就是说，通过将 `?` 追加到某引用类型，可以将变量声明为*可以为 null 的引用类型*。 例如，`string?` 表示*可以为 `null` 的 `string`*。使用这些新类型可以更清楚地表达代码设计的意图 —— 比如将某些变量声明为 **必须始终具有值**，而其他一些变量声明为 **可以缺少值**。

借助这个定义，我们在定义引用类型的变量或属性时，便有了两种选择：

1. **假定引用不可以为 `null`。** 当变量定义为不可以为 `null` 时，编译器会强制执行规则——确保在不检查它们是否为 `null` 的前提下，取消引用这些变量是安全的：
   - 变量必须初始化为非 `null` 值。
   - 变量永远不能赋值为 `null`。
2. **假定引用可以为 `null`。** 当变量定义为可以为 `null` 时，编译器会强制执行不同的规则——确保您自己已正确检查 `null` 引用：
   - 只有当编译器可以保证该值不为 `null` 时，才可以取消引用该变量。
   - 这些变量可以用默认的 `null` 值进行初始化，也可以在其他代码中赋值为 `null`。

与 C# 8.0 之前对引用变量的处理相比，这个新功能提供了显著的优势。在早期版本中，不能通过变量的声明来确定设计意图，编译器没有为引用类型提供针对 `null` 引用异常的安全性。

通过添加*可为 `null` 的引用类型*，您可以更清楚地声明您的意图。`null` 值是表示一个变量不引用值的正确方法，请不要使用此功能从代码中删除所有的 `null` 值。而是，应向编译器和阅读代码的其他开发人员声明您的意图。通过声明意图，编译器会在您编写与该意图不一致的代码时警告您。

是不是读起来有点绕？还是直接看示例比较容易理解些，请继续往下看。首先，我们来

## 启用可为 null 的引用类型

有三种方法可以启用*可为 null 的引用类型*。

### 在项目文件中启用

```xml
<Nullable>enable</Nullable>
```

将上面这一行添加到项目文件中，为当前项目启用 *可为 null 的引用类型*，如下图所示：

![nullable enable 1](/assets/images/202101/nullable-enable-1.png)

### 在自定义项目属性中启用

在 `Directory.Build.props` 文件中可以为目录下的所有项目启用 *可为 null 的引用类型*， 下面截图是 [fluss 项目中的设置](https://github.com/cnblogs/fluss/blob/main/Directory.Build.props)：

![cnblog nullable enable 3](/assets/images/202101/cnblog-nullable-enable.png)

### 使用预处理器指令启用

可以使用 `#nullable enable` 和 `#nullable disable` 预处理器指令在代码中的任意位置启用和禁用 *可为 null 的引用类型*：

![nullable enable 2](/assets/images/202101/nullable-enable-2.png)

## 举例说明

### 典型用法

假设有这个定义：

```csharp
class Person
{
    public string? MiddleName;
}
```

如下这样调用：

```csharp
void LogPerson(Person person)
{
    Console.WriteLine(person.MiddleName.Length);  // 警告  CS8602  解引用可能出现空引用。
    Console.WriteLine(person.MiddleName!.Length); // 没有警告
}
```

![nullable enable warning](/assets/images/202101/nullable-enable-warning.png)

这个 `!` 运算符基本上就是关闭了编译器的空检查。

### 内部运行机制

使用此运算符*告诉编译器可以安全地访问可能为 `null` 的内容*。您可以用它来表达在这种情况下“不关心” `null` 安全性。

当我们讨论到 `null` 安全性时，一个变量可以有两种状态：

1. Nullable : 可以为 `null`。
2. Non-Nullable ：不可以为 `null`。

从 C# 8.0 开始，所有的*引用类型*默认都是 *Non-nullable*。

“可空性”可以通过以下两个新的**类型运算符**进行修改：

1. `!` ：从 Nullable 改为 Non-Nullable
2. `?` ：从 Non-Nullable 改为 Nullable

这两个运算符是相互对应的。您使用这两个运算符限定变量，然后编译器根据您的限定来确保 `null` 安全性。

### `?` 运算符的用法

1. Nullable：`string? x;`
   - `x` 是引用类型，因此默认是*不可以为 `null` 的*。
   - 我们使用 `?` 运算符将其改为*可以为 `null` 的*。
   - `x = null;` 赋值正常，没有警告。
2. Non-Nullable：`string y;`
   - `y` 是引用类型，因此默认是*不可以为 `null` 的*。
   - `y = null;` 赋值会产生一个警告，因为您给一个声明为不支持 `null` 的变量分配了一个 `null` 值。

如下图：

![nullable enable warning y](/assets/images/202101/nullable-enable-warning-xy.png)

### `!` 运算符的用法

```csharp
string x;
string? y = null;
```

1. `x = y;`
   - 非法！警告：将 null 文本或可能的 null 值转换为不可为 null 类型（`y` 可能为 `null`）。
   - 赋值运算符 `=` 左边是*不可以为 `null` 的*，但右边是*可以为 `null` 的*。
2. `x = y!;`
   - 合法！
   - 赋值运算符 `=` 左右两边都是*不可以为 `null` 的*。
   - 因为 `y!` 使用了 `!` 运算符到 `y`，使得右边也变成了*不可以为 `null` 的*，所以赋值没有问题。

如下图：

![nullable enable warning y 2](/assets/images/202101/nullable-enable-warning-xy-2.png)

> ⚠️ **警告：** `null` 包容运算符 `!` 仅在类型系统级别关闭编译器检查；在运行时，该值仍然可能是 `null`。

## 这是反模式的

**C# 编程时应该尽量避免使用 *`null` 包容运算符 `!`*。**

有一些有效的使用场景（在下面会介绍），比如单元测试，使用这个运算符是适合的。不过，在 99% 的情况下，使用替代解决方案会更好。请不要只是为了取消警告，而在代码中打几十个 `!`。要想清楚您的场景是否真的值得使用它。

> 💡 可以使用，但要小心使用。如果没有实际的目的或使用场景，请不要使用它。

`null` 包容运算符 `!` 抵消了您获得的编译器保证的 `null` 安全性的作用！

**使用 `!` 运算符将导致很难发现 bug。**如果您定义了一个标记为*不可以为 `null` 的*属性，您也就假定了可以安全地使用它。但是在运行时，您却突然遇到 `NullReferenceException` 异常而挠头，因为一个值*在用 `!` 绕过了编译器检查后，实际上却变成了 `null`*，这不是给自己添麻烦吗？

既然这样，那么，

### 为什么 `!` 运算符会存在？

- 在某些边缘情况下，编译器无法检测到*可以为 null 的值*实际上是不为 `null` 的。
- 使遗留代码库迁移更容易。
- 在某些情况下，您根本不关心某些内容是否为 `null`。
- 在进行单元测试时，您可能想要检查传递 `null` 时的代码行为。

接下来，我们继续看下：

## `null!` 是什么意思呢？

`null!` 是在告诉编译器 `null` 不是 `null` 值，这听起来很怪异，是不是？

实际上，它和上面例子中的 `y!` 一样。**它只是看起来挺怪异，因为您将该运算符用在了 `null` 字面量上**，但概念是一样的。

我们再来看一下文章开头提到的 fluss 源码中的一行代码：

```csharp
/// <summary>
/// 所属的博客。
/// </summary>
public BlogSite BlogSite { get; set; } = null!;
```

这行代码定义了一个名称为 `BlogSite`、类型为 `BlogSite` 的*不可以为 `null` 的*类属性。因为它是*不可以为 `null` 的*，因此单从技术上讲，很明显它是不可以被赋值为 `null`的。

但是，您可以通过使用 `!` 运算符，将 `BlogSite` 属性赋值为 `null`。因为，**就编译器所关心的 `null` 安全性而言，`null!` 不是 `null`。**

## 总结

看到这里，想必您肯定已经明白了 `null!` 是什么意思，也学会了 `null` 包容运算符 `!` 的概念、由来和用法。但是正如我在文中提到的那样，编程时应该尽量避免使用 `!`，因为它抵消了您本可以获得的编译器保证的 `null` 安全性；而且，这种写法阅读起来有点让人费解。

---

**参考：**

- <https://docs.microsoft.com/en-us/dotnet/csharp/nullable-references>
- <https://stackoverflow.com/questions/54724304/what-does-null-statement-mean>
- <https://www.cnblogs.com/cmt/p/14217355.html>
- <https://www.meziantou.net/csharp-8-nullable-reference-types.htm>

<br />

> 作者 ： 技术译民  
> 出品 ： [技术译站](https://ittranslator.cn/)
