---
layout: post
title:  "C# 中 Struct 和 Class 的区别总结"
date:   2020-09-14 00:10:00 +0800
categories: dotnet csharp
published: true
---

> 翻译自 Manju lata Yadav 2019年6月2日 的博文 [《Difference Between Struct And Class In C#》](https://www.c-sharpcorner.com/blogs/difference-between-struct-and-class-in-c-sharp)，补充了一些内容和示例。

结构体（`struct`）是类(`class`)的轻量级版本。结构是值类型，可用于创建行为类似于内置类型的对象。

结构体和类共享许多特性，但与类相比有以下限制。

- 结构体不能有默认构造函数(无参构造函数)或析构函数，构造函数中必须给所有字段赋值。

    ```csharp
    public struct Coords
    {
        public double x;
        public double y;
    
        public Coords() //错误，不允许无参构造函数
        {
            this.x = 3;
            this.y = 4;
        }
        
        public Coords(double x) //错误，构造函数中必须给所有字段赋值
        {
            this.x = x;
        }
        
        public Coords(double x) //这个是正确的
        {
            this.x = x;
            this.y = 4;
        }
    
        public Coords(double x, double y) //这个是正确的
        {
            this.x = x;
            this.y = y;
        }
    }
    ```

- 结构体是值类型，在赋值时进行复制。
- 结构体是值类型，而类是引用类型。
- 结构可以在不使用 `new` 操作符的情况下实例化。
    例如：
    
    ```csharp
    public struct Coords
    {
        public double x;
        public double y;
    }
    
    static void Main()
    {
        Coords p;
        p.x = 3;
        p.y = 4;
        Console.WriteLine($"({p.x}, {p.y})");  // 输出: (3, 4)
    }
    ```
    
- 结构体不能继承自另一个结构体或者类，类也不能继承结构体。所有结构体直接继承于抽象类 `System.ValueType`，`System.ValueType` 又继承于 `System.Object`。
- 结构体不能是基类，因此，结构体不能是 `abstract` 的，且总是隐式密封的(`sealed`)。
- 不允许对结构体使用抽象（`abstract`）和密封（`sealed`）修饰符，也不允许对结构体成员使用 `protected` 或 `protected internal` 修饰符。
- 结构体中的函数成员不能是抽象的（`abstract`）或虚的（`virtual`），重写（`override`）修饰符只允许重写从 `System.ValueType` 继承的方法。
- 结构体中不允许实例属性或字段包含初始值设定项。但是，结构体允许静态属性或字段包含初始值设定项。
    例如：
    ```csharp
    public struct Coords
    {
        public double x = 4; //错误, 结构体中初始化器不允许实例字段设定初始值
        public static double y = 5; // 正确
        public static double z { get; set; } = 6; // 正确
    }
    ```
    
- 结构体可以实现接口。
- 结构体可以用作 `nullable type`（即：`Nullable<T>` 中的 `T`），赋值 `null` 值，参考【[`Nullable<T> Struct`](https://docs.microsoft.com/en-us/dotnet/api/system.nullable-1?view=netcore-3.1)】

## 什么时候使用结构体或类？

要回答这个问题，我们应该很好地理解它们的差异。

| 序号 | 结构体（`struct`）                                           | 类(`class`)                                                  |
| :--: | :----------------------------------------------------------- | :----------------------------------------------------------- |
|  1   | 结构体是值类型，可以在栈（`stack`）上分配，也可以在包含类型中内联分配。 | 类是引用类型，在堆（`heap`）上分配并垃圾回收。               |
|  2   | 值类型的分配和释放通常比引用类型的分配和释放更节约成本。     | 大量的引用类型的赋值比大量的值类型的赋值成本更低。           |
|  3   | 在结构体中，每个变量都包含自己的数据副本（`ref` 和 `out` 参数变量除外），对一个变量的操作不会影响另一个变量。 | 在类中，两个变量可以包含同一对象的引用，对一个变量的任何操作都会影响另一个变量。 |

这样，结构体（`struct`）只能在确定以下情形时使用：

- 它在逻辑上表示单个值，比如基本类型(`int`, `double`，等等)。
- 它是不可变的。
- 它不会频繁地装箱和拆箱。

在所有其他情形，应该将类型定义为类(`class`)。

结构体示例：
```csharp
struct Location
{
    public int x, y;
    public Location(int x, int y)
    {
        this.x = x;
        this.y = y;
    }
}

static void Main()
{
    Location a = new Location(20, 20);
    Location b = a;
    a.x = 100;
    Console.WriteLine(b.x);
}
```

输出将是 20。“b” 的值是 “a” 的副本，因此 “b” 不受 “a.x” 更改的影响。但是在类中，输出将是 100，因为变量 “a” 和 “b” 引用同一个对象。

---

> 以下为译者补充

## 结构体实例与类实例

结构体实例内存在栈（`stack`）上进行分配，所占用的内存随声明它的类型或方法一起回收。 这就是在赋值时复制结构的一个原因。 相比之下，类实例内存在堆（`heap`）上进行分配，当对类的实例对象的所有引用都超出范围时，为该类实例分配的内存将由公共语言运行时自动回收（垃圾回收）。

### 结构体实例的值相等性

两个结构体实例的比较是基于值的比较，而类实例的比较则是对其引用的比较。

若要确定两个结构实例中的实例字段是否具有相同的值，可使用 `ValueType.Equals` 方法。 由于所有结构都隐式继承自 `System.ValueType`，因此可以直接在对象上调用该方法，如以下示例所示：

```csharp
public struct Person
{
    public string Name;
    public int Age;
    public Person(string name, int age)
    {
        Name = name;
        Age = age;
    }
}

static void Main()
{
    Person p1 = new Person("技术译站", 100);
    Person p2;
    p2.Name = "技术译站";
    p2.Age = 100;

    if (p2.Equals(p1))
        Console.WriteLine("p2 和 p1 有相同的值。");

    Console.ReadKey();
}
// 输出: p2 和 p1 有相同的值。
```

`System.ValueType` 的 `Equals` 使用反射实现，因为它必须能够确定任何结构中有哪些字段。 在创建自己的结构时，重写 `Equals` 方法可以提供特定于你的类型的高效求等算法。

这一点和 C# 9.0 中新增的记录(`record`) 具有相似之处，想了解 C# 9.0 可以查看 [欢迎来到 C＃ 9.0](https://mp.weixin.qq.com/s/0BWgiBuIxW-agyFNSejMtg)。

<br/>

> 作者 ： Manju lata Yadav <br/>
> 译者 ： 技术译民 <br/>
> 出品 ： [技术译站](https://ittranslator.cn/) <br/>
> 链接 ： [英文原文](https://www.c-sharpcorner.com/blogs/difference-between-struct-and-class-in-c-sharp)


<!-- [对象（C# 编程指南）](https://docs.microsoft.com/zh-cn/dotnet/csharp/programming-guide/classes-and-structs/objects)
[结构类型（C# 参考）](https://docs.microsoft.com/zh-cn/dotnet/csharp/language-reference/builtin-types/struct) -->