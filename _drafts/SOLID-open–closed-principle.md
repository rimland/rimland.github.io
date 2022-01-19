---
layout: post
title:  "C# 实例解释面向对象编程中的开闭原则"
date:   2022-03-10 00:10:00 +0800
categories: dotnet csharp
published: true
---

在面向对象编程中，**SOLID** 是五个设计原则的首字母缩写，旨在使软件设计更易于理解、灵活和可维护。这些原则是由美国软件工程师和讲师罗伯特·C·马丁(Robert Cecil Martin)提出的许多原则的子集，在他2000年的论文《设计原则与设计模式》中首次提出。

SOLID 原则包含：

- **S**：单一功能原则（single-responsibility principle）
- **O**：开闭原则（open–closed principle）
- **L**：里氏替换原则（Liskov substitution principle）
- **I**：接口隔离原则（Interface segregation principle）
- **D**：依赖反转原则（Dependency inversion principle）

本文我们来介绍*开闭原则*。

## 开闭原则

在面向对象编程领域中，开闭原则 (open–closed principle, OCP) 规定“软件中的对象（类，模块，函数等等）应该对于扩展是开放的，但是对于修改是封闭的”，这意味着一个实体是允许在不改变它的源代码的前提下变更它的行为。该特性在产品化的环境中是特别有价值的，在这种环境中，改变源代码需要代码审查，单元测试以及诸如此类的用以确保产品使用品质的过程。遵循开闭原则的代码在扩展时并不发生改变，因此无需这些过程。

开闭原则的命名被应用在两种方式上。这两种方式都使用了继承来解决明显的困境，但是它们的目的，技术以及结果是不同的。

