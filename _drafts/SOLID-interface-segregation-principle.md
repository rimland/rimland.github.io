---
layout: post
title:  "C# 实例解释面向对象编程中的接口隔离原则"
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

本文我们来介绍*接口隔离原则*。

## 接口隔离原则

接口隔离原则（Interface segregation principle，ISP）认为“**多个特定客户端接口要好于一个宽泛用途的接口**”。

它指明客户（client）不应被迫使用对其而言无用的方法或功能。*接口隔离原则*拆分庞大臃肿的接口成为更小、更具体的接口，使得客户仅需知道他们感兴趣的方法。这种缩小了的接口也被称为**角色接口**（role interfaces）。*接口隔离原则*的目的是将系统解耦，从而使其易于重构、更改和重新部署。

## C# 示例
