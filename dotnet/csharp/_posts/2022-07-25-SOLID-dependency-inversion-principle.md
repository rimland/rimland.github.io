---
layout: post
title:  "C# 实例解释面向对象编程中的依赖反转原则"
date:   2022-07-25 00:10:00 +0800
categories: dotnet csharp
published: true
---

在面向对象编程中，**SOLID** 是五个设计原则的首字母缩写，旨在使软件设计更易于理解、灵活和可维护。这些原则是由美国软件工程师和讲师罗伯特·C·马丁(Robert Cecil Martin)提出的许多原则的子集，在他2000年的论文《设计原则与设计模式》中首次提出。

SOLID 原则包含：

- **S**：[单一功能原则（single-responsibility principle）](https://ittranslator.cn/dotnet/csharp/2022/02/07/SOLID-single-responsibility-principle.html)
- **O**：[开闭原则（open-closed principle）](https://ittranslator.cn/dotnet/csharp/2022/02/17/SOLID-open-closed-principle.html)
- **L**：[里氏替换原则（Liskov substitution principle）](https://ittranslator.cn/dotnet/csharp/2022/02/23/SOLID-liskov-substitution-principle.html)
- **I**：[接口隔离原则（Interface segregation principle）](https://ittranslator.cn/dotnet/csharp/2022/07/13/SOLID-interface-segregation-principle.html)
- **D**：[依赖反转原则（Dependency inversion principle）](https://ittranslator.cn/dotnet/csharp/2022/07/25/SOLID-dependency-inversion-principle.html)

本文我们来介绍*依赖反转原则*。

## 依赖反转原则

在面向对象编程领域中，**依赖反转原则**（Dependency inversion principle，DIP）**是指一种特定的解耦形式，使得高层次的模块不依赖于低层次模块的实现细节，依赖关系被颠倒（反转），从而使低层次模块依赖于高层次模块的需求抽象。**（*传统的依赖关系创建在高层次上，而具体的策略设置则应用在低层次的模块上*）

<!-- ![dependency inversion](/assets/images/2022/Dependency_inversion_2.png#center) -->

![dependency inversion](/assets/images/2022/Dependency_inversion.png#center)

（*图1 中，高层 对象A 依赖于低层 对象B 的实现；图2 中，把高层 对象A 对低层对象的需求抽象为一个 接口A，低层 对象B 实现了 接口A，这就是依赖反转。*）

依赖反转原则约定：

- 高层次的模块不应该依赖于低层次的模块，两者都应该依赖于抽象接口。
- 抽象接口不应该依赖于具体实现。而具体实现则应该依赖于抽象接口。

该原则颠倒了一部分人对于面向对象设计的认识方式（如高层次和低层次对象都应该依赖于相同的抽象接口）。

*依赖注入*是该原则的一种实现方式。

## C# 示例

先定义一个商品信息类：

```csharp
public class ProductInfo
{
    public int ID { get; set; }
    public string ProductName { get; set; }
    public string ProductSpec { get; set; }
    public int Stock { get; set; }
}
```

### 糟糕的示范

新建一个数据访问类 *ProductDataAccess* 和业务逻辑类 *ProductBusinessLogic*：

```csharp
public class ProductDataAccess
{
    public ProductInfo GetDetail(int id)
    {
        ProductInfo product = new()
        {
            ID = id,
            ProductName = "白糖",
            ProductSpec = "500g",
            Stock = 100
        };
        return product;
    }
}

public class ProductBusinessLogic
{
    private readonly ProductDataAccess _productDataAccess;
    public ProductBusinessLogic()
    {
        _productDataAccess = new ProductDataAccess();
    }

    public ProductInfo GetProductDetails(int id)
    {
        return _productDataAccess.GetDetail(id);
    }
}
```

在上面的代码中，高层次的类 *ProductBusinessLogic* 直接依赖于低层次的类 *ProductDataAccess*，这明显违反了 *依赖反转原则*。

### 正确的示范

根据 *依赖反转原则* 的要求，我们**把高层对象** *ProductBusinessLogic* 对低层对象**的需求抽象为一个接口** *IProductDataAccess*：

```csharp
public interface IProductDataAccess
{
    ProductInfo GetDetail(int id);
}
```

在低层对象 *ProductDataAccess* 中实现接口 *IProductDataAccess*，然后在高层对象 *ProductBusinessLogic* 中引用（注入）接口 *IProductDataAccess*：

```csharp
public class ProductDataAccess : IProductDataAccess
{
    public ProductInfo GetDetail(int id)
    {
        ProductInfo product = new()
        {
            ID = id,
            ProductName = "白糖",
            ProductSpec = "500g",
            Stock = 100
        };
        return product;
    }
}

public class ProductBusinessLogic
{
    private readonly IProductDataAccess _productDataAccess;
    public ProductBusinessLogic(IProductDataAccess productDataAccess)
    {
        _productDataAccess = productDataAccess;
    }

    public ProductInfo GetProductDetails(int id)
    {
        return _productDataAccess.GetDetail(id);
    }
}
```

这样，这些类的设计便遵守了*依赖反转原则*。

其实，ASP.NET Core 中服务的依赖注入正是遵循了*依赖反转原则*。

## 总结

本文我介绍了 SOLID 原则中的**依赖反转原则**（Dependency inversion principle），并通过 C# 代码示例简明地诠释了它的含意和实现，希望对您有所帮助。

> 作者 ： 技术译民  
> 出品 ： [技术译站](https://ittranslator.cn/)

<br />

参考文档：

- <https://en.wikipedia.org/wiki/SOLID>
- <https://www.c-sharpcorner.com/blogs/dependency-inversion-principle-in-c-sharp>
- <https://flylib.com/books/en/4.444.1.71/1/>
