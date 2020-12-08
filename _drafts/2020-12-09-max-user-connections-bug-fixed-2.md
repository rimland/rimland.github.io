---
layout: post
title:  "从异常到68分钟到8分钟（记 RDS MySQL 的一个大坑之后记）"
date:   2020-12-08 00:05:00 +0800
categories: blog
published: true
---

在 [《记 RDS MySQL 的一个大坑》](https://ittranslator.cn/blog/2020/12/07/max-user-connections-bug-fixed.html) 中，我提到遇到 <font color="red">User juxxxxxxxxxx already has more than 'max_user_connections' active connections……</font> 这样的错误，最终通过在循环中使用 `Thread.Sleep`，降低 CRUD 操作的频率，让连接数下降至不到原来的一半，从而解决了这个棘手的问题，有兴趣的朋友可以[点击链接回顾一下](https://ittranslator.cn/blog/2020/12/07/max-user-connections-bug-fixed.html)。

昨日在[博客园中发出此文](https://www.cnblogs.com/ittranslator/p/14094449.html)后，有热心的朋友（[@沈赟](https://www.cnblogs.com/ittranslator/p/14094449.html#4766142)，[@不知道风往哪儿吹](https://www.cnblogs.com/ittranslator/p/14094449.html#4766160)）对此问题提出了宝贵的意见和想法，激发了我对此问题继续深究的念头。

下午经过几个小时的分析和测试，终于找到了该问题的真正原因和解决方法，在此做个补充。

**真正的原因在于：使用 MySQL 官方提供的 MySql.Data 作为驱动程序连接 MySQL 数据库的时候，默认使用了连接池，才引发了这个问题**。错怪了*阿里云（上篇中提到怀疑阿里云改了 MySQL 底层做了限制）*，在此对自己的不严谨表示诚恳的道歉😥😥😥，凡事要自己多思考多研究多求证，不可轻易怀疑权威的力量！！！

下面进入本文的正题，聊一聊该问题出现的真正原因和解决办法。

## MySQL 连接池

根据 [官方介绍](https://dev.mysql.com/doc/connector-net/en/connector-net-connections-pooling.html)：MySQL Connector/NET（即 MySql.Data）连接池的工作的机制是，当客户端配置 MySqlConnection 时，连接池通过保持一组与服务器的本地连接使其处于活动状态。随后，如果打开一个新的 MySqlConnection 对象，它将从连接池中创建连接，而不是重新创建一个新的本机连接。这样便可以重用数据库连接，避免了频繁创建、释放连接引起的大量性能开销，这有助于缩短响应速度、统一管理、提高运行性能等等。

在软件开发中，大多数情况下，数据库连接都有重用的可能，即便永不重用，连接池也有自己的回收机制在适当的时候释放资源，这有点像带有过期时间的缓存数据，也像 .NET 的 GC 回收机制。正因为在大多数情况下，它可以提高运行的性能，也有完善且可配置的回收机制。所以在没有提供连接池选项的情况，MySQL Connector/NET 默认

```sql
server=xxx;port=3306;userid=myuserid;password=pwd123;database=db125;charset=utf8;Pooling=false;
```


MySQL Connector/NET支持连接池，以便在数据库密集型应用程序中获得更好的性能和可伸缩性。

数据库连接池（Connection pooling）是程序启动时建立足够的数据库连接，并将这些连接组成一个连接池，由程序动态地对池中的连接进行申请，使用，释放。

https://dev.mysql.com/doc/connector-net/en/connector-net-8-0-connection-options.html#connector-net-8-0-connection-options-classic-pooling

https://dev.mysql.com/doc/connector-net/en/connector-net-connections-pooling.html

https://dev.mysql.com/doc/connector-net/en/connector-net-connections-pooling.html

资源重用
      由于数据库连接得到重用，避免了频繁创建、释放连接引起的大量性能开销。在减少系统消耗的基础上，另一方面也增进了系统运行环境的平稳性（减少内存碎片以及数据库临时进程/线程的数量）。

 更快的系统响应速度
       数据库连接池在初始化过程中，往往已经创建了若干数据库连接置于池中备用。此时连接的初始化工作均已完成。对于业务请求处理而言，直接利用现有可用连接，避免了数据库连接初始化和释放过程的时间开销，从而缩减了系统整体响应时间。

统一的连接管理，避免数据库连接泄漏
      在较为完备的数据库连接池实现中，可根据预先的连接占用超时设定，强制收回被占用连接。从而避免了常规数据库连接操作中可能出现的资源泄漏。一个最小化的数据库连接池实现：


> 作者 ： 技术译民  
> 出品 ： [技术译站](https://ittranslator.cn/)
