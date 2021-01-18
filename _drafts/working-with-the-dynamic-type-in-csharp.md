---
layout: post
title:  "Working with the Dynamic Type in C#"
date:   2020-08-10 00:10:00 +0800
categories: dotnet csharp
published: true
---

> 翻译自 Camilo Reyes 2018年10月15日的文章 [《Working with the Dynamic Type in C#》](https://www.red-gate.com/simple-talk/dotnet/c-programming/working-with-the-dynamic-type-in-c/)  

<br />

> .NET 4 中引入了动态类型。动态对象使您可以处理诸如 JSON 文档之类的结构，这些结构的组成可能要到运行时才能知道。在本文中，Camilo Reyes 解释了如何使用动态类型。

.NET 4.0 中引入的 `dynamic` 关键字为 C# 编程带来了一个范式转变。对于 C# 程序员来说，强类型系统之上的动态行为可能会让人感到不适 —— 当您在编译过程中失去类型安全性时，这似乎是一种倒退。

动态编程可能使您面临运行时错误。声明一个在执行过程中会发生变化的动态变量是可怕的，当开发人员对数据做出错误的假设时，代码质量就会受到影响。

对 C# 程序员来说，避免代码中的动态行为是合乎逻辑的。具有强类型的经典方法有很多好处。通过类型检查得到的数据类型的良好反馈对于正常运行的程序是至关重要的。一个好的类型系统可以更好地表达意图并减少代码中的歧义。

随着动态语言运行时（Dynamic Language Runtime，DLR）的引入，这对 C# 意味着什么呢？ .NET 提供了丰富的类型系统，可用于编写企业级软件。让我们来仔细看看 `dynamic` 关键字，并探索一下它的功能。

## 类型层次结构

<!-- Every type in the Common Language Runtime (CLR) inherits from System.Object. Now, read that last sentence again until you internalize this. This means the object type is the common parent to the entire type system. This fact alone aids us when we get to more exotic dynamic behavior. The idea here is to develop this ‘code-sense’, so you know how to navigate around dynamic types in C#. -->

公共语言运行时（Common Language Runtime，CLR）中的每种类型都继承自 `System.Object`，现在，请重复阅读这句话，直到将其铭记于心。这意味着 `object` 类型是整个类型系统的公共父类。当我们研究更神奇的动态行为时，这一事实本身就能为我们提供帮助。这里的想法是开发这种“代码感”，以便于您了解如何驾驭 C# 中的动态类型。

为了演示这一点，你可以编写以下程序：

```csharp
Console.WriteLine("long inherits from ValueType: " + typeof(long).IsSubclassOf(typeof(ValueType)));
```

<!-- I will omit using statements until the end of this article to keep code samples focused. Then, I will go over each namespace and what it does. This keeps me from having to repeat myself and provides an opportunity to review all types. -->

我将忽略 `using` 语句直到本文结束，以保持对代码示例的专注。然后，我再介绍每个命名空间及其作用。这样我就不必重复说过的话，并提供了一个回顾所有类型的机会。

<!-- The code above evaluates to True inside the console. The long type in .NET is a value type, so it’s more like an enumeration or a struct. The ValueType overrides the default behavior that comes from the object class. ValueType descendants go on the stack which have a short lifetime and are more efficient. -->

上面的代码在控制台中的运算结果为 `True`。.NET 中的 `long` 类型是值类型，因此它更像是枚举或结构体。`ValueType` 重写来自 `object` 类的默认行为。`ValueType` 的子类在栈（stack）上运行，它们的生命周期较短，效率更高。

要验证 `ValueType` 是继承自 `System.Object` 的，请执行以下代码：

```csharp
Console.WriteLine("ValueType inherits from System.Object: " + typeof(ValueType).IsSubclassOf(typeof(Object)));
```

它的运算结果为 `True`。这是一条可以追溯到 `System.Object` 的继承链。对于值类型，链中至少有两个父级。

看一下从 `System.Object` 派生的另一种 C# 类型，例如：

```csharp
Console.WriteLine("string inherits from System.Object: " + typeof(string).IsSubclassOf(typeof(Object)));
```

<!-- This code spits out True in the console. Another type that inherits from the object are reference types. Reference types get allocated on the heap and undergo garbage collection. The CLR manages reference types and deallocates them from the heap when necessary. -->

此代码在控制台中显示 `True`。从 `object` 继承的另一种类型是引用类型。引用类型在堆（heap）上分配并进行垃圾回收。CLR 管理着引用类型，并在必要时从堆中释放它们。

查看下图，您可以直观地看到 CLR 的类型系统：

![CLR’s type system](/assets/images/202101/clr-type-system.png)
<!-- 
Both value and reference types are the basic building blocks of the CLR. This elegant type system predates both .NET 4.0 and dynamic types. I recommend keeping this figure in your mind’s eye when you work with types in C#. So how does the DLR fit into this picture? -->

值类型和引用类型都是 CLR 的基本构建块。这种优雅的类型系统在 .NET 4.0 和动态类型之前就有了。我建议您在使用 C# 中的类型时，在脑海中记住这张图。那么，DLR 是如何适应这张图的呢?

## 动态语言运行时（DLR）

动态语言运行时（Dynamic Language Runtime, DLR）是处理动态对象的一种便捷方法。比如，假设您有 XML 或 JSON 格式的数据，其中的成员事先并不知道。DLR 允许您使用自然代码来处理对象和访问成员。

对于 C#，这允许您可以使用在编译时不知道其类型的库。动态类型消除了自然 API 代码中的万能字符串。这就开启了像 IronPython 一样位于 CLR 之上的动态语言。

可以将 DLR 视为支持三项主要服务：

- 表达式树，来自 System.Linq.Expressions 命名空间。编译器在运行时生成具有动态语言互操作性的表达式树。动态语言超出了本文的讨论范围，这里就不介绍它们了。
- 调用站点缓存，即缓存动态操作的结果。DLR 缓存像 `a + b` 之类的操作，并存储 `a` 和 `b` 的特征。当执行动态操作时，DLR 将检索先前操作中可用的信息。
- 动态对象互操作性是可用于访问 DLR 的 C# 类型。这些类型包括 `DynamicObject` 和 `ExpandoObject`。可用的类型还有很多，但是在使用动态类型时请注意这两种类型。

要了解 DLR 和 CLR 是如何结合在一起的，请看下图：

![how the DLR and CLR fit together](/assets/images/202101/dlr-clr-fit.png)

<!-- The DLR sits on top of the CLR. Recall that I said every type descends from System.Object. Well, I did scope it to the CLR but what about the DLR? Test this theory with this program: -->

DLR 位于 CLR 之上。回想一下，我说过的*每种类型都是从 `System.Object` 派生的而来*。嗯，这句话对于 CLR 是适用的，但是对于 DLR 呢？我们使用下面的程序来测试一下这个理论：

```csharp
Console.WriteLine("ExpandoObject inherits from System.Object: " + typeof(ExpandoObject).IsSubclassOf(typeof(Object)));

Console.WriteLine("DynamicObject inherits from System.Object: " + typeof(DynamicObject).IsSubclassOf(typeof(Object)));
```

`ExpandoObject` 和 `DynamicObject` 在命令行中输出的值都是 `True`。可以将这两个类视为使用动态类型的基本构建块，它们清楚地描绘了两个运行时是如何结合在一起的。

## 一个 JSON 序列化程序

动态类型解决的一个问题是，当您有一个不知道其成员的 JSON HTTP 请求时，假设要在 C# 中使用此任意的 JSON。要解决这个问题，请将此 JSON 序列化为 C# 动态类型。

<!-- I’ll use the Newtonsoft serializer, you can add this dependency through NuGet, for example: -->

我将使用 Newtonsoft 序列化库，您可以通过 NuGet 添加此依赖项，例如：

```csharp
dotnet add package Newtonsoft.Json –-version 11.0.2
```

<!-- You can use this serializer to work with both ExpandoObject and DynamicObject. Explore what each dynamic type brings to dynamic programming. -->

您可以使用这个序列化程序来处理 `ExpandoObject` 和 `DynamicObject`。探索每种动态类型给动态编程带来了什么。

## ExpandoObject 动态类型

<!-- The ExpandoObject is a convenience type that allows setting and retrieving dynamic members. It implements IDynamicMetaObjectProvider which enables sharing instances between languages in the DLR. Because it implements IDictionary and IEnumerable, it works with types from the CLR. This allows an instance of the ExpandoObject to cast to IDictionary, for example. Then enumerate members like any other IDictionary type. -->

`ExpandoObject` 是一种方便的类型，允许设置和检索动态成员。它实现了 `IDynamicMetaObjectProvider`，该接口允许在 DLR 中的语言之间共享实例。因为它实现了 `IDictionary` 和 `IEnumerable`，所以它也可以处理 CLR 中的类型。举例而言，它允许将 `ExpandoObject` 的实例转换为 `IDictionary`，然后像其它任意的 `IDictionary` 类型一样枚举成员。

要用 `ExpandoObject` 处理任意 JSON，您可以编写以下程序：

```csharp
var exObj = JsonConvert.DeserializeObject<ExpandoObject>("{\"a\":1}") as dynamic;

Console.WriteLine($"exObj.a = {exObj?.a}, type of {exObj?.a.GetType()}");
//exObj.a = 1, type of System.Int64
```

它将会在控制台打印 `1` 和 `long`。请注意，尽管它是一个动态 JSON，但它会绑定到 CLR 中的 C# 类型。由于数字的类型未知，因此序列化程序默认会选择最大的 `long` 类型。注意，我成功地将序列化结果转换成了具有 null 检查的 `dynamic` 类型，其原因是序列化程序返回来自 CLR 的 `object` 类型。因为 `ExpandoObject` 继承自 `System.Object`，所以可以被拆箱成 DLR 类型。

更奇妙的是，可以用 `IDictionary` 枚举 `exObj`：

```csharp
foreach (var exObjProp in exObj as IDictionary<string, object> ?? new Dictionary<string, object>())
{
    Console.WriteLine($"IDictionary = {exObjProp.Key}: {exObjProp.Value}");
}
```

它在控制台输出 `IDictionary = a: 1`。请确保使用 `string` 和 `object` 作为键和值的类型。
否则，将在转换的过程中抛出 `RuntimeBinderException` 异常。

## DynamicObject 动态类型

`DynamicObject` 提供对动态类型的精确控制。您可以继承该类型并重写动态行为。例如，您可以定义如何设置和获取类型中的动态成员。`DynamicObject` 允许您通过重写选择实现哪些动态操作。这比实现 `IDynamicMetaObjectProvider` 的语言实现方式更容易访问。它是一个抽象类，需要继承它而不是实例化它。该类有 14 个虚方法，它们定义了类型的动态操作。每个虚方法都允许重写以指定动态行为。

<!-- Say you want precise control over what gets into the dynamic JSON. Although you do not know the properties ahead of time, with a DynamicObject, you get control over the type. -->

假设您想要精确控制动态 JSON 中的内容。尽管事先不知道其属性，您却可以使用 `DynamicObject` 来控制类型。

<!-- Let’s override three methods, TryGetMember, TrySetMember, and GetDynamicMemberNames: -->

让我们来重写三个方法，`TryGetMember`、`TrySetMember` 和 `GetDynamicMemberNames`：

```csharp
public class TypedDynamicJson<T> : DynamicObject
{
    private readonly IDictionary<string, T> _typedProperty;

    public TypedDynamicJson()
    {
        _typedProperty = new Dictionary<string, T>();
    }

    public override bool TryGetMember(GetMemberBinder binder, out object result)
    {
        T typedObj;

        if (_typedProperty.TryGetValue(binder.Name, out typedObj))
        {
            result = typedObj;

            return true;
        }

        result = null;

        return false;
    }

    public override bool TrySetMember(SetMemberBinder binder, object value)
    {
        if (value.GetType() != typeof(T))
        {
            return false;
        }

        _typedProperty[binder.Name] = (T)value;

        return true;
    }

    public override IEnumerable<string> GetDynamicMemberNames()
    {
        return _typedProperty.Keys;
    }
}
```

<!-- C# generics strong type the _typedProperty in a generic way which drives member types. This means the property type comes from the T generic type. Dynamic JSON members are inside a dictionary and only store the generic type. This dynamic type allows for a homogeneous set of members of the same type. Although it allows a dynamic set of members, you can strongly type the behavior. Say you only care about long types from an arbitrary JSON: -->

C# 泛型强类型 `_typedProperty` 以泛型的方式驱动成员类型。这意味着其属性类型来自泛型类型 `T`。动态 JSON 成员位于字典中，并且仅存储泛型类型。此动态类型允许同一类型的同类成员集合。尽管它允许动态成员集，但您可以强类型约束其行为。假设您只关心任意 JSON 中的 `long` 类型：

```csharp
var dynObj = JsonConvert.DeserializeObject<TypedDynamicJson<long>>("{\"a\":1,\"b\":\"1\"}") as dynamic;
Console.WriteLine($"dynObj.a = {dynObj?.a}, type of {dynObj?.a.GetType()}");

var members = string.Join(",", dynObj?.GetDynamicMemberNames());
Console.WriteLine($"dynObj member names: {members}");
```

结果是，您将看到一个值为 `1` 的属性，因为第二个属性是 `string` 类型。如果将泛型类型更改为 `string`，将会获得第二个属性。

## 类型结果

<!-- Quite a bit of ground has been covered so far; here are some highlights:

All types from both CLR and DLR inherit from System.Object
The DLR is where all dynamic operations take place
ExpandoObject implements enumerable types from the CLR such as IDictionary
DynamicObject has precise control over the dynamic type through virtual methods -->

到目前为止，已经涉及了相当多的领域; 以下是一些亮点：

- CLR 和 DLR 中的所有类型都继承自 `System.Object`
- DLR 是所有动态操作发生的地方
- `ExpandoObject` 实现了 CLR 中诸如 `IDictionary` 的可枚举类型
- `DynamicObject` 通过虚方法对动态类型进行精确控制

看一下在控制台捕获的结果：

![dynamic type results](/assets/images/202101/dynamic-type-results.png)

## 可能的单元测试

<!-- For unit tests, I’ll use the xUnit test framework. In .NET Core, you add a test project with the dotnet new xunit command. One problem that becomes evident is mocking and verifying dynamic parameters. For example, say you want to verify that a method call exists with dynamic properties. -->

对于单元测试，我将使用 xUnit 测试框架。 在 .NET Core 中，您可以使用 `dotnet new xunit` 命令添加一个测试项目。一个明显的问题是模拟和验证动态参数。例如，假设您想验证一个方法调用是否具有动态属性。

要使用 Moq 模拟库，您可以通过 NuGet 添加此依赖项，例如：

```csharp
dotnet add package Moq –-version 4.10.0
```

假设您有一个接口，其想法是验证它是否被正确的动态对象调用。

```csharp
public interface IMessageBus
{
  void Send(dynamic message);
}
```

忽略该接口的实现。这些实现细节对于编写单元测试不是必需的。下面是被测试的系统：

```csharp
public class MessageService
{
    private readonly IMessageBus _messageBus;

    public MessageService(IMessageBus messageBus)
    {
        _messageBus = messageBus;
    }

    public void SendRawJson<T>(string json)
    {
        var message = JsonConvert.DeserializeObject<T>(json) as dynamic;

        _messageBus.Send(message);
    }
}
```

<!-- You can make use of generics, so you can pass in the dynamic type for the serializer. Then call the IMessageBus and send the dynamic message. The method under test takes a string parameter and makes a call with a dynamic type. -->

您可以使用泛型，这样就可以为序列化程序传入动态类型。然后调用 `IMessageBus` 并发送动态消息。被测试的方法接受一个 `string` 参数，并使用动态类型进行调用。

对于单元测试，请将其封装在 `MessageServiceTests` 类中。首先初始化 Mock 和被测试的服务：

```csharp
public class MessageServiceTests
{
    private readonly Mock<IMessageBus> _messageBus;
    private readonly MessageService _service;

    public MessageServiceTests()
    {
        _messageBus = new Mock<IMessageBus>();

        _service = new MessageService(_messageBus.Object);
    }
}
```

<!-- The IMessageBus gets mocked using a C# generic in the Moq library. Then create a mock instance using the Object property. The private instance variables are useful inside all unit tests. Private instances with high reusability add class cohesion. -->

使用 Moq 库中的 C# 泛型来模拟 `IMessageBus`，然后使用 `Object` 属性创建一个模拟实例。私有实例变量在所有单元测试中都很有用。具有高可重用性的私有实例增加了类的内聚性。

通过 Moq 验证调用，一种直观的方法是尝试这样做：

```csharp
_messageBus.Verify(m => m.Send(It.Is<ExpandoObject>(o => o != null && (o as dynamic).a == 1)));
```

<!-- But alas, the error message you’ll see is this: “An expression tree may not contain a dynamic operation.” This is because C# lambda expressions do not have access to the DLR. It expects a type from the CLR which makes this dynamic parameter hard to verify. Remember your training and tap into your “code-sense” to solve this problem. -->

但是，遗憾的是，您将看到这样的错误消息：“表达式树不能包含动态操作。” 这是因为 C# lambda 表达式无法访问 DLR，它期望一个来自 CLR 的类型，这使得此动态参数难以验证。记得您的训练，利用您的“代码感”来解决这个问题。

<!-- To navigate around what seems like a discrepancy between types, use a Callback method: -->

要处理类型之间的差异，请使用 `Callback` 方法：

```csharp
dynamic message = null;

_messageBus.Setup(m => m.Send(It.IsAny<ExpandoObject>())).Callback<object>(o => message = o);
```

<!-- Note the callback gets typed to a System.Object. Because all types inherit from the object type, you’re able to make the assignment into a dynamic type. C# can unbox the object inside the lambda expression into a dynamic message. -->

请注意，回调函数将类型转换为 `System.Object`。因为所有类型都继承自 `object` 类型，所以可以将其赋值为 `dynamic` 类型。C# 可以将 lambda 表达式中的 `object` 拆箱成 `dynamic message`。

<!-- Time to write a nice unit test for the ExpandoObject type. Use xUnit as the testing framework, so you’ll see the method with a Fact attribute. -->

是时候为 `ExpandoObject` 类型编写一个漂亮的单元测试了。使用 xUnit 作为测试框架，您将看到带有 `Fact` 属性的方法。

```csharp
[Fact]
public void SendsWithExpandoObject()
{
    // arrange
    const string json = "{\"a\":1}";
    dynamic message = null;

    _messageBus.Setup(m => m.Send(It.IsAny<ExpandoObject>())).Callback<object>(o => message = o);

    // act
    _service.SendRawJson<ExpandoObject>(json);

    // assert
    Assert.NotNull(message);
    Assert.Equal(1, message.a);
}
```

<!-- Test with a DynamicObject type, reusing the TypedDymaicJson that you’ve seen before: -->
使用 `DynamicObject` 类型进行测试，重用您之前看到的 `TypedDynamicJson`：

```csharp
[Fact]
public void SendsWithDynamicObject()
{
    // arrange
    const string json = "{\"a\":1,\"b\":\"1\"}";
    dynamic message = null;

    _messageBus.Setup(m => m.Send(It.IsAny<TypedDynamicJson<long>>())).Callback<object>(o => message = o);

    // act
    _service.SendRawJson<TypedDynamicJson<long>>(json);

    // assert
    Assert.NotNull(message);
    Assert.Equal(1, message.a);
    Assert.Equal("a", string.Join(",", message.GetDynamicMemberNames()));
}
```

<!-- Using C# generics, you can swap dynamic types for the serializer while reusing code. The Callback method in Moq allows you to make the necessary hop between type systems. Having an elegant type hierarchy with a common parent turns to be a lifesaver. -->

使用 C# 泛型，您可以在重用代码的同时转换序列化程序的动态类型。Moq 中的 `Callback` 方法允许您在两种类型系统之间进行必要的跳转。拥有一个优雅的类型层次结构和一个共同的父类成为了一个救星。

## Using 语句

下面的 using 语句是代码示例的一部分：

- System: CLR 的基础类型，例如 Object 和 Console
- System.Collections.Generic: 可枚举类型，例如 IDictionary
- System.Dynamic: DLR 的动态类型，例如 ExpandoObject 和 DynamicObject
- Newtonsonft.Json: JSON 序列化程序
- Moq: 模拟库
- Xunit: 测试框架

## Conclusion

<!-- The C# dynamic type may seem scary at first but has benefits on top of a strongly typed system. The DLR is where all dynamic operations occur and interoperate with the CLR. Type inheritance makes it easy to work with both type systems at the same time. In C#, there is no animosity between dynamic and static programming. Both type systems work together to solve dynamic problems in a creative way. -->

C# 动态类型或许看起来令人望而生畏，但它在强类型系统之上具有很多好处。DLR 是所有动态操作发生和与 CLR 交互的地方，类型继承使同时处理这两个类型系统变得容易。在 C# 中，动态和静态编程之间并没有对立，这两种类型系统一起工作，以创造性的方式解决动态问题。

<br />

> 作者 ： Camilo Reyes  
> 译者 ： 技术译民  
> 出品 ： [技术译站](https://ittranslator.cn/)  
> 链接 ： [英文原文](https://www.red-gate.com/simple-talk/dotnet/c-programming/working-with-the-dynamic-type-in-c/)
