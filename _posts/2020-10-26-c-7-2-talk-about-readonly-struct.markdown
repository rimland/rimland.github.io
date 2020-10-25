---
layout: post
title:  "C# 中的只读结构体（readonly struct）"
date:   2020-10-26 00:10:00 +0800
categories: dotnet csharp
published: true
---

> 翻译自 John Demetriou 2018年4月8日 的文章 《C# 7.2 – Let’s Talk About Readonly Structs》[^1]

[^1]: <https://www.devsanon.com/c/c-7-2-lets-talk-about-readonly-structs/>   C# 7.2 – Let’s Talk About Readonly Structs

在本文中，我们来聊一聊从 C# 7.2 开始出现的一个特性 `readonly struct`。

任一结构体都可以有公共属性、私有属性访问器等等。我们从以下结构体示例来开始讨论：

```csharp
public struct Person
{
    public string Name { get; set; }

    public string Surname { get; set; }

    public int Age { get; set; }

    public Person(string name, string surname, int age)
    {
        Name = name;
        Surname = surname;
        Age = age;
    }

    public void Replace(Person other)
    {
        this = other;
    }
}
```

如您所见，所有属性都可以公开访问和修改。更糟糕的是，我们甚至可以访问 `this` （通过调用 `Replace` 方法），将其更改为同一结构体类型的另一个实例。  
这就是 `readonly` 关键字出现的原因。如果（*仅*）在结构体的定义中添加它，如下所示：

```csharp
public readonly struct Person
{
    public string Name { get; set; }

    public string Surname { get; set; }

    public int Age { get; set; }

    public Person(string name, string surname, int age)
    {
        Name = name;
        Surname = surname;
        Age = age;
    }

    public void Replace(Person other)
    {
        this = other;
    }
}
```

编译器会显示如下面截图中的错误提示：

![readonly struct error](/assets/images/202010/readonly-struct-err.png)

为什么会这样？这是因为当我们向结构体定义添加 `readonly` 关键字，其实是把每个属性都设置为只读的了，包括 `this` 的值。

要让代码通过编译的唯一方法是把所有内容都设置为只读的，也就是说我们的结构体应该像这样：

```csharp
public readonly struct Person
{
    public string Name { get; }

    public string Surname { get; }

    public int Age { get; }

    public Person(string name, string surname, int age)
    {
        Name = name;
        Surname = surname;
        Age = age;
    }
}
```

因此，添加 `readonly` 可以消除结构体实例内部或外部发生意外赋值或修改值的可能性。不过，需要注意的一件事是，如果您经常使用无参构造函数并给属性赋值，像这样：

```csharp
Person s = new Person();
//错误
s.Age = 15;
s.Name = "asd";
s.Surname = "qwe";
```

或者像这样：

```csharp
//错误
Person s = new Person
{
    Age = 15,
    Name = "asd",
    Surname = "qwe"
};
```

虽然此结构体的默认无参构造函数仍然可以调用，但给任何属性赋值都将引发编译错误，因为属性是只读的。  
实际上，对此结构体的无参构造函数的调用会将其所有属性设置为它们的默认值，而且在结构体实例的整个生命周期中，永远不会被修改。  
正确的初始化方法是调用参数化构造函数：

```csharp
Person s = new Person("asd", "qwe", 15);
```

总之，这将有助于更容易地表明您的意图，因为您可以从一开始就定义这个结构体是不可变和不可修改的。

## 译者总结

使用 `readonly` 修饰符声明 `struct` 的目的就是为了明确地声明一个不可变的值类型。

`readonly` 结构体的所有数据成员都必须是只读的：

1. 所有字段声明都必须具有 `readonly` 修饰符
2. 所有属性（包括自动实现的属性）都必须是只读的

这就保证了 `readonly` 结构体的成员不会修改该结构体的状态。在 C# 8.0 及更高版本中，除构造函数外的其他实例成员都是隐式 `readonly` 的。


<br />

> 作者 ： [John Demetriou](https://www.devsanon.com/whoami/)  
> 译者 ： 技术译民  
> 出品 ： [技术译站](https://ittranslator.cn/)  
> 链接 ： [英文原文](https://www.devsanon.com/c/c-7-2-lets-talk-about-readonly-structs/)

