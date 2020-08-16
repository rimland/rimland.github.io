---
layout: post
title:  "欢迎使用C＃9.0"
date:   2020-08-24 00:10:00 +0800
categories: dotnet csharp
published: false
---

> 翻译自 Mads Torgersen 2020年5月20日的博文[《Welcome to C# 9.0》](https://devblogs.microsoft.com/dotnet/welcome-to-c-9-0/)，Mads Torgersen 是微软 C# 语言的首席设计师，也是微软 .NET 团队的项目群经理。

C# 9.0 已经初具规模，我想和大家分享一下我们对下一版本语言中添加的一些主要特性的想法。

对于 C# 的每一个新版本，我们都在努力让常见的编码场景的实现变得更加清晰和简单，C# 9.0 也不例外。这次特别关注的是支持数据形状的简洁和不可变表示。

就让我们一探究竟吧!

## 仅初始化(init-only)属性

对象初始化器非常棒。它们为类型的客户端提供了一种非常灵活和可读的格式来创建对象，并且特别适合于嵌套对象的创建，让你可以一次性创建整个对象树。这里有一个简单的例子：

```csharp
new Person
{
    FirstName = "Scott",
    LastName = "Hunter"
}
```

对象初始化器还使类型作者不必编写大量的构造函数——他们所要做的就是编写一些属性！

```csharp
public class Person
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
}
```

目前最大的限制是属性必须是可变的（即可写的），对象初始化器才能工作：它们首先调用对象的构造函数(本例中是默认的无参数构造函数)，然后赋值给属性 `setter`。

仅初始化(init-only)属性解决了这个问题！它引入了一个 `init` 访问器，它是 `set` 访问器的变体，只能在对象初始化时调用：

```csharp
public class Person
{
    public string FirstName { get; init; }
    public string LastName { get; init; }
}
```

有了这个声明，上面的客户端代码仍然是合法的，但是随后对  `FirstName` 和 `LastName` 属性的任何赋值都是错误的。

### `init` 访问器和只读(`readonly`)字段

因为 `init` 访问器只能在初始化期间调用，所以允许它们更改封闭类的只读(`readonly`)字段，就像在构造函数中一样。

```csharp
public class Person
{
    private readonly string firstName;
    private readonly string lastName;
    
    public string FirstName 
    { 
        get => firstName; 
        init => firstName = (value ?? throw new ArgumentNullException(nameof(FirstName)));
    }
    public string LastName 
    { 
        get => lastName; 
        init => lastName = (value ?? throw new ArgumentNullException(nameof(LastName)));
    }
}
```

## 记录（Records）

```csharp

```


<br/>

> 作者 ： Mads Torgersen <br/>
> 译者 ： 技术译民 <br/>
> 出品 ： [技术译站](https://ittranslator.cn/) <br/>
> 链接 ： [英文原文](https://devblogs.microsoft.com/dotnet/welcome-to-c-9-0/)
