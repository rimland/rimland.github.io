---
layout: post
title:  "C# 实例解释面向对象编程中的依赖反转原则"
date:   2022-03-10 00:10:00 +0800
categories: dotnet csharp
published: true
---

在面向对象编程中，**SOLID** 是五个设计原则的首字母缩写，旨在使软件设计更易于理解、灵活和可维护。这些原则是由美国软件工程师和讲师罗伯特·C·马丁(Robert Cecil Martin)提出的许多原则的子集，在他2000年的论文《设计原则与设计模式》中首次提出。

SOLID 原则包含：

- **S**：单一功能原则（single-responsibility principle）
- **O**：开闭原则（open-closed principle）
- **L**：里氏替换原则（Liskov substitution principle）
- **I**：接口隔离原则（Interface segregation principle）
- **D**：依赖反转原则（Dependency inversion principle）

本文我们来介绍*依赖反转原则*。

## 依赖反转原则

在面向对象编程领域中，**依赖反转原则**（Dependency inversion principle，DIP）**是指一种特定的解耦形式，使得高层次的模块不依赖于低层次模块的实现细节，依赖关系被颠倒（反转），从而使低层次模块依赖于高层次模块的需求抽象。**（*传统的依赖关系创建在高层次上，而具体的策略设置则应用在低层次的模块上*）

![dependency inversion](/assets/images/2022/Dependency_inversion.png#center)

图1 中，高层 对象A 依赖于底层 对象B 的实现；图2 中，把高层 对象A 对底层对象的需求抽象为一个 接口A，底层 对象B 实现了 接口A，这就是依赖反转。

依赖反转原则规定：

- 高层次的模块不应该依赖于低层次的模块，两者都应该依赖于抽象接口。
- 抽象接口不应该依赖于具体实现。而具体实现则应该依赖于抽象接口。

该原则颠倒了一部分人对于面向对象设计的认识方式（如高层次和低层次对象都应该依赖于相同的抽象接口）。

依赖注入是该原则的一种实现方式。
