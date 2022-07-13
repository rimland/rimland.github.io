---
layout: post
title:  "C# 实例解释面向对象编程中的接口隔离原则"
date:   2022-07-13 00:10:00 +0800
categories: dotnet csharp
published: true
---

在面向对象编程中，**SOLID** 是五个设计原则的首字母缩写，旨在使软件设计更易于理解、灵活和可维护。这些原则是由美国软件工程师和讲师罗伯特·C·马丁(Robert Cecil Martin)提出的许多原则的子集，在他2000年的论文《设计原则与设计模式》中首次提出。

SOLID 原则包含：

- **S**：[单一功能原则（single-responsibility principle）](https://ittranslator.cn/dotnet/csharp/2022/02/07/SOLID-single-responsibility-principle.html)
- **O**：[开闭原则（open-closed principle）](https://ittranslator.cn/dotnet/csharp/2022/02/17/SOLID-open-closed-principle.html)
- **L**：[里氏替换原则（Liskov substitution principle）](https://ittranslator.cn/dotnet/csharp/2022/02/23/SOLID-liskov-substitution-principle.html)
- **I**：[接口隔离原则（Interface segregation principle）](https://ittranslator.cn/dotnet/csharp/2022/07/13/SOLID-interface-segregation-principle.html)
- **D**：依赖反转原则（Dependency inversion principle）

本文我们来介绍*接口隔离原则*。

## 接口隔离原则

接口隔离原则（Interface segregation principle，ISP）认为“**多个特定用户接口要好于一个宽泛用途的接口**”。

它指明用户（client）不应被迫使用对其而言无用的方法或功能。*接口隔离原则*将庞大臃肿的接口拆分成为更小、更具体的接口，让用户仅需知道他们感兴趣的方法。这种缩小了的接口也被称为**角色接口**（role interfaces）。*接口隔离原则*的目的是将系统解耦，从而使其易于重构、更改和重新部署。

## C# 示例

### 糟糕的示范

创建一个包含公司部门的 *ICompanyDepartment* 接口。

```csharp
interface ICompanyDepartment
{
    public void AdminDepartment();
    public void FinanaceDepartment();
    public void HRDepartment();
    public void ITDepartment();
}
```

让我们首先为 A 公司实现 *ICompanyDepartment* 接口，文件名为 *ACompany.cs*：

```csharp
class ACompany : ICompanyDepartment
{
    public void AdminDepartment()
    {
        //DO SOMETHING
    }
    public void FinanaceDepartment()
    {
        //DO SOMETHING
    }
    public void HRDepartment()
    {
        //DO SOMETHING
    }
    public void ITDepartment()
    {
        //DO SOMETHING
    }
}
```

假如现在有一个从事制造业的 B 公司，他们没有 IT 部门，而多了一个生产部门，那么上面的实现就有问题了。

如果在接口 *ICompanyDepartment* 上添加一个 `ManufacturingDepartment` 生产部门，那我们就不得不在 *ACompany* 和 *BCompany* 两个类上都实现该签名。

也就是说，为了使用 *ICompanyDepartment* 接口，我们不得不在 *ACompany* 类上实现不必要的 `ManufacturingDepartment` 方法，在 *BCompany* 类上实现不必要的 `ITDepartment` 方法。这明显违反了*接口隔离原则*。

为了使其符合*接口隔离原则*，我们需要进行一些修改。

### 正确的示范

根据*接口隔离原则*，我们要将 `ITDepartment` 和 `ManufacturingDepartment` 方法从接口 *ICompanyDepartment* 拆分出来，形成两个独立的**角色接口**：

1. IACompanyUniqueFeature
2. IBCompanyUniqueFeature

这样我们就拥有了三个接口：

```csharp
interface ICompanyDepartment
{
    public void AdminDepartment();
    public void FinanaceDepartment();
    public void HRDepartment();
}
interface IACompanyUniqueFeature
{
    public void ITDepartment();
}
interface IBCompanyUniqueFeature
{
    public void ManufacturingDepartment();
}
```

类 *ACompany* 和 *BCompany* 的实现如下：

```csharp
class ACompany : ICompanyDepartment, IACompanyUniqueFeature
{
    public void AdminDepartment()
    {
        //DO SOMETHING
    }
    public void FinanaceDepartment()
    {
        //DO SOMETHING
    }
    public void HRDepartment()
    {
        //DO SOMETHING
    }
    public void ITDepartment()
    {
        //DO SOMETHING
    }
}

class BCompany : ICompanyDepartment, IBCompanyUniqueFeature
{
    public void AdminDepartment()
    {
        //DO SOMETHING
    }
    public void FinanaceDepartment()
    {
        //DO SOMETHING
    }
    public void HRDepartment()
    {
        //DO SOMETHING
    }
    public void ManufacturingDepartment()
    {
        //DO SOMETHING
    }
}
```

这样，以上的接口设计便遵循了*接口隔离原则*。

## 总结

本文我介绍了 SOLID 原则中的**接口隔离原则**（Interface segregation principle），并通过 C# 代码示例简明地诠释了它的含意和实现，希望对您有所帮助。

> 作者 ： 技术译民  
> 出品 ： [技术译站](https://ittranslator.cn/)

<br />

参考文档：

- <https://en.wikipedia.org/wiki/SOLID>
- <https://www.c-sharpcorner.com/blogs/interface-segregation-principle-in-c-sharp>
