---
layout: post
title:  "多重继承和菱形问题"
date:   2020-10-20 00:10:00 +0800
categories: dotnet csharp
published: true
---

> 翻译自 John Demetriou 2018年4月8日 的文章 《Multiple Inheritance And The Diamond Problem》[^1]

[^1]: <http://www.devsanon.com/language-agnostic/multiple-inheritance-and-the-diamond-problem/>   Multiple Inheritance And The Diamond Problem

![...](/assets/images/202010/1024px-CPT-OOP-inheritance-300x169.png#center)

开篇之前，我假设每个人都知道在面向对象编程中继承是什么，以及它能提供什么好处。我不会深入探究对象继承的基础知识。这篇文章更关注于多重继承和它所面临的问题。

确是如此，多重继承的一个大问题就是菱形问题。你可能会问为什么？想象一下继承的分布如下：

![...](/assets/images/202010/500px-Diamond_inheritance-200x300.png#center)


上面的图显示，***D*** 继承自 ***B*** 和 ***C***，而 ***B*** 和 ***C*** 继承自 ***A***。  
现在假设 ***A*** 是一个抽象类（菱形问题的存在不必是*抽象类*，但它使问题更明显），并且包含一个名为 `Jump()` 的公共抽象方法（`public abstract Jump()`）。***B*** 和 ***C*** 都需要以自己特定的方式实现该方法。然后 ***D*** 继承自这两个类，当有人在 ***D*** 上调用 `Jump()` 时会发生什么？  
调用 `Jump()` 的哪一个实现是不明确的。

就是由于这个原因，Java 和 C# 都不允许多重继承。不过它们允许多接口继承，并且 C# 的一个新特性将接口与多继承问题联系起来[^2]。

[^2]: <https://ittranslator.cn/dotnet/csharp/2020/10/20/c-8-default-interface-methods.html>  C# 8: 默认接口方法

<br />

> 作者 ： [John Demetriou](https://www.devsanon.com/whoami/)  
> 译者 ： 技术译民  
> 出品 ： [技术译站](https://ittranslator.cn/)  
> 链接 ： [英文原文](http://www.devsanon.com/language-agnostic/multiple-inheritance-and-the-diamond-problem/)