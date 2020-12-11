---
layout: post
title:  "连接数从异常到 300 到 5（RDS MySQL 的一个大坑•后记）"
date:   2020-12-09 00:05:00 +0800
categories: blog
published: true
---

在 [《记 RDS MySQL 的一个大坑》](https://ittranslator.cn/blog/2020/12/07/max-user-connections-bug-fixed.html) 中，我提到遇到 <font color="red">User juxxxxxxxxxx already has more than 'max_user_connections' active connections……</font> 这样的错误，最终通过在循环中使用 `Thread.Sleep`，降低 CRUD 操作的频率，让连接数下降至不到原来的一半，从而解决了这个棘手的问题，有兴趣的朋友可以[点击链接回顾一下](https://ittranslator.cn/blog/2020/12/07/max-user-connections-bug-fixed.html)。

今天又看了一下添加 `Thread.Sleep` 后，程序运行时的 IOPS 和 连接数：

![iops-connections-3](https://ittranslator.cn/assets/images/202012/iops-connections-3.png)

运行结果：**连接数：300，运行时间：68 分钟，IOPS：7**。

昨天在[博客园中发出上篇文章](https://www.cnblogs.com/ittranslator/p/14094449.html)后，热心的朋友（[@沈赟](https://www.cnblogs.com/ittranslator/p/14094449.html#4766142)，[@不知道风往哪儿吹](https://www.cnblogs.com/ittranslator/p/14094449.html#4766160)）对此问题提出了宝贵的意见和想法，激发了我对此问题继续深究的决定。

下午经过几个小时的分析和测试，终于找到了该问题的真正原因和更好的解决方法，在此做个补充。

**真正的原因在于：使用 MySQL 官方提供的 MySql.Data 作为驱动程序连接 MySQL 数据库的时候，默认使用了连接池，才引发了这个问题**。错怪了*阿里云（上篇中提到怀疑阿里云改了 MySQL 底层做了限制）*，在此对自己的不严谨表示诚恳的道歉😥😥😥，凡事要自己多思考多研究多求证，不可轻易怀疑权威的力量，切记切记！！！

下面聊一聊该问题出现的真正原因和更优的解决方法。

## MySQL 连接池

根据 [官方介绍](https://dev.mysql.com/doc/connector-net/en/connector-net-connections-pooling.html)：MySQL Connector/NET 中（即 MySql.Data 中）连接池的工作的机制是，当客户端配置 MySqlConnection 时，连接池通过保持一组与服务器的本地连接使其处于活动状态，随后，如果打开一个新的 MySqlConnection 对象，它将从连接池中创建连接，而不是重新创建一个新的本地连接。这样便可以重用数据库连接，避免了频繁创建、释放连接引起的大量性能开销，这有助于缩短响应时间、统一管理、提高运行性能等等。

在软件开发中，大多数情况下，数据库连接都有重用的可能，即便永不重用，连接池也有自己的回收机制在适当的时候释放资源，这有点像带有过期时间的缓存数据，也像 .NET 的 GC 回收机制。正因为在大多数情况下，它可以提高运行的性能，也有完善且可配置的回收机制。所以**在没有提供任何连接池选项的情况下，MySQL Connector/NET 默认启用连接池**，也就是说，创建 MySqlConnection 时使用下面的连接字符串：

```sql
server=xxx;port=3306;userid=myuserid;password=pwd123;database=db125;charset=utf8;
```

等同于使用：

```sql
server=xxx;port=3306;userid=myuserid;password=pwd123;database=db125;charset=utf8;Pooling=true;
```

而我原来的代码中恰好用的就是前者，也就是说默认启用了连接池。

## 为什么使用连接池反而出问题了

上面说到连接池有那么多的好处，为什么我用了连接池反倒出问题了呢？我们来看一下

**连接对池资源的利用情况：**

> 官方文档：  
> Connector/NET runs a background job every three minutes and removes connections from pool that have been idle (unused) for more than three minutes. The pool cleanup frees resources on both client and server side. This is because on the client side every connection uses a socket, and on the server side every connection uses a socket and a thread.  

> 译文：  
> Connector/NET 每三分钟运行一次后台作业，从连接池中删除闲置（未使用）超过三分钟的连接。连接池清理会释放客户端和服务器端的资源。这是因为在客户端，每个连接使用一个套接字，而在服务器端，每个连接都使用一个套接字和一个线程。

[上一篇](https://www.cnblogs.com/ittranslator/p/14094449.html)中有介绍过我的程序的基本情况，这里有必要再补充一下关键的使用场景：

> 我们的 MySql 服务实例有很多台，每台实例上有很多个数据库，只有其中一台 MySql 服务实例出现了超出 max_user_connections 的异常，这台实例最大的连接数限制在 600，但是这台实例上的数据库就有 700 多个。

聪明的朋友看到这里，估计已经明白为什么使用了连接池会出现问题了。为什么呢？就因为上面提到的连接池每三分钟运行一次清理操作呗。循环语句执行的速度是很快的，有的小库瞬间就执行完了，但是在连接池中却保持了一个连接，还没有到每隔三分钟的资源回收时间（*这也是我在上篇中添加了 Thread.Sleep 后连接数减少的原因*）。当这台实例的 600 个连接被全部占满时，再连接同一实例上另一个连接池中没有缓存的数据库时，就报了超出 max_user_connections 的异常。

## 解决方法

怎么解决呢？最简单的解决方法就是，判断请求的是这台 MySql 服务实例时，不使用连接池，这样就会在调用 MySqlConnection 的 Close 方法时，立即释放客户端和服务端所占用的资源。因此，在数据库连接字符串中加上 `Pooling=false`，改成下面这样：

```sql
server=xxx;port=3306;userid=myuserid;password=pwd123;database=db125;charset=utf8;Pooling=false;
```

然后发布到服务器上进行测试，查看一下程序运行时的 IOPS 和 连接数：

![pooling-false-result](https://ittranslator.cn/assets/images/202012/pooling-false-result.png)

惊不惊喜，意不意外，嚯嚯嚯~~~🥰🥰🥰

运行结果：**连接数只有 5 个，运行时间缩短到了 8 分钟，IOPS 为 36**，与之前添加 `Thread.Sleep` 的测试结果相比，天壤之别呀……

<!-- `ClearPoolAsync` `ClearAllPoolsAsync` -->

最后，用一张图来描述一下两种解决方法的运行效果比较：

![activity-diagram](https://ittranslator.cn/assets/images/202012/activity-diagram.png)

## 结论

阿里云 RDS MySQL 没有问题，问题出在，在不恰当的场景使用了 MySQL 连接池，连接池虽好，但不可乱用哟，切记切记！

> 作者 ： 技术译民  
> 出品 ： [技术译站](https://ittranslator.cn/)

<!-- 
https://dev.mysql.com/doc/connector-net/en/connector-net-8-0-connection-options.html#connector-net-8-0-connection-options-classic-pooling

https://dev.mysql.com/doc/connector-net/en/connector-net-connections-pooling.html

https://dev.mysql.com/doc/connector-net/en/connector-net-connections-pooling.html

https://github.com/mysql-net/MySqlConnector/issues/211

https://github.com/mysql-net/MySqlConnector/issues/442 -->
