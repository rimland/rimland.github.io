---
layout: post
title:  "记阿里云 RDS MySQL 的一个大坑"
date:   2020-12-06 00:10:00 +0800
categories: blog
published: true
---

花了一个下午的时间，终于把一个阿里云 RDS MySQL 的一个大坑填上了，解决方法令人匪夷所思！绝对会让各位看官感到大吃一惊，阿里云 RDS MySQL 居然有这样 xx 的大坑！

## 问题

最近，应业务的需求，加了一个定时统计的任务，其中的算法很简单，只是需要大量的 CRUD 操作。
由于业务简单，且时效性要求不高，所以代码写起来若行云流水，一气呵成，本地测试一遍通过。
没料想，当部署到线上测试的时候，却上演了现场翻车，真是让人大跌眼镜……

看了一下错误日志，大致如下显示：

```yaml
ERROR [DAL.EvaluateDetails:403] GetCount [(null)] - GetCount Error :Authentication to host 'rdsxxxxxxxxxxxxxxxxx.mysql.rds.aliyuncs.com' for user 'juxxxxxxxxxx' using method 'mysql_native_password' failed with message: User juxxxxxxxxxx already has more than 'max_user_connections' active connections
MySql.Data.MySqlClient.MySqlException (0x80004005): Authentication to host 'rdsxxxxxxxxxxxxxxxxx.mysql.rds.aliyuncs.com' for user 'juxxxxxxxxxx' using method 'mysql_native_password' failed with message: User juxxxxxxxxxx already has more than 'max_user_connections' active connections ---> MySql.Data.MySqlClient.MySqlException (0x80004005): User juxxxxxxxxxx already has more than 'max_user_connections' active connections
   在 MySql.Data.MySqlClient.MySqlStream.ReadPacket()
   在 MySql.Data.MySqlClient.Authentication.MySqlAuthenticationPlugin.ReadPacket()
   在 MySql.Data.MySqlClient.Authentication.MySqlAuthenticationPlugin.AuthenticationFailed(Exception ex)
   在 MySql.Data.MySqlClient.Authentication.MySqlAuthenticationPlugin.ReadPacket()
   在 MySql.Data.MySqlClient.Authentication.MySqlAuthenticationPlugin.Authenticate(Boolean reset)
   在 MySql.Data.MySqlClient.NativeDriver.Open()
   在 MySql.Data.MySqlClient.Driver.Open()
   在 MySql.Data.MySqlClient.Driver.Create(MySqlConnectionStringBuilder settings)
   在 MySql.Data.MySqlClient.MySqlPool.GetPooledConnection()
   在 MySql.Data.MySqlClient.MySqlPool.TryToGetDriver()
   在 MySql.Data.MySqlClient.MySqlPool.GetConnection()
   在 MySql.Data.MySqlClient.MySqlConnection.Open()
   在 Utility.MySqlDbHelper.PrepareCommand(MySqlCommand cmd, MySqlConnection conn, MySqlTransaction trans, CommandType cmdType, String cmdText, MySqlParameter[] cmdParms) 位置 D:\Work\git\Utility\MySqlDbHelper.cs:行号 322
   在 Utility.MySqlDbHelper.ExecuteReader(String connString, CommandType cmdType, String cmdText, MySqlParameter[] cmdParms) 位置 D:\Work\git\Utility\MySqlDbHelper.cs:行号 101
   在 DAL.EvaluateDetails.GetCount(String connStr, Nullable`1 startDate, Nullable`1 endDate, Nullable`1 marketingType) 位置 D:\Work\git\DAL\EvaluateDetails.cs:行号 403
```

<font color="red">User juxxxxxxxxxx already has more than 'max_user_connections' active connections</font>……

What?! Shit!

## 问题分析

以前从来没有遇到过 *max_user_connections* 这样的错误，倒是遇到过几次 *max_connections*，**根据经验，这种错误基本上都是使用连接后忘记关闭连接导致的。** 是的，我一开始就是这么想的，尽管作为多年耕耘于一线的资深编程老鸟，对于自己写的代码满怀信心，认为不可能犯这么低级的错误，但暂时想不到别的问题了！于是，开始围绕这个思路展开复查和求证……

### 基本情况

先简单介绍一下程序的情况：C# 开发，基于 .NET Framework 4.5.2（哈哈，很老的运行框架，很多时候不得不这么做，因为调用的类库太多，全基于这个框架，升级的成本太大），数据库访问调用的是 MySql 官方提供的 MySql.Data（Version=6.9.7.0, Runtime: v4.0.30319）。

![MySql.Data.dll Version](/assets/images/202012/MySql.Data.dll.png)

在阿里云控制台查看一下这台 MySql Server 的配置情况：

![RDS MySql Configuration](/assets/images/202012/rds-mysql-configuration.png)

数据库中查询一下连接数的配置情况：

```sql
SELECT @@max_user_connections, @@max_connections, @@wait_timeout, @@interactive_timeout;
```

查询结果：

```csharp
| max_user_connections | max_connections | wait_timeout | interactive_timeout |
| -------------------- | --------------- | ------------ | ------------------- |
| 600                  | 1112            | 7200         | 7200                |
```

![max connections query](/assets/images/202012/max_connections_query.png)

在控制台查看一下程序运行时的 IOPS 和 连接数：

![IOPS and Connections 1](/assets/images/202012/iops-connections-1.png)

数据库的配置是 max_user_connections = 600，程序运行时，总连接数确实超过了这项配置。

### 问题排查

#### 1、检查数据库打开后是否忘记关闭

程序实现的业务虽简单，但数据库的访问和逻辑运算有太多了，大量的 CRUD 操作，使用到 MySqlCommand 的 ExecuteScalar 、ExecuteReader、ExecuteNonQuery 以及 MySqlDataAdapter 的 Fill 方法。一个一个看方法查下去，遗憾的是，发现所有的数据库访问之后都同步执行了 MySqlConnection 的 Close 方法。

虽然最先怀疑的就是这个原因，但事实证明并不是。除非 MySql.Data 内部在调用 Close 后实际上没有立即 Close？ 我用 ILSpy 查看了源码，也没有发现问题。

#### 2、检查程序中的并发逻辑

另一个可想到的原因就是，并发 CRUD 太多？

上面我说过，因为这个程序用于常规统计，所以时效性要不高，为避免给数据库服务带来压力，根本没有用到并发执行。

那是什么问题呢？

#### 3、关于 max_user_connections 的思考

错误提示是 <font color="red">用户 juxxxxxxxxxx 的活动连接数已超过 'max_user_connections'</font>，注意这里提示的是***活动连接数***。

到官网查看一下配置项 [max_user_connections](https://dev.mysql.com/doc/refman/8.0/en/server-system-variables.html#sysvar_max_user_connections) [^max_user] 和 [max_connections](https://dev.mysql.com/doc/refman/8.0/en/server-system-variables.html#sysvar_max_connections) [^max]

[^max_user]: <https://dev.mysql.com/doc/refman/8.0/en/server-system-variables.html#sysvar_max_user_connections> max_user_connections
[^max]: <https://dev.mysql.com/doc/refman/8.0/en/server-system-variables.html#sysvar_max_connections> max_connections

![max connections](/assets/images/202012/max_connections.png)

![max user connections](/assets/images/202012/max_user_connections.png)

`max_connections` 是允许的最大**并发**客户端连接数，`max_user_connections` 是**给定用户账号**允许的最大**并发**连接数。注意它们都是***并发数***。

*活动连接数* 正好是对应 MySql 官方说的 *并发连接数* 了。

问题是，**明明每次执行 CRUD 后都关闭了连接，而且程序是单线程运行的，为什么活动连接数还是超出了 max_user_connections 的值 600 呢？**

难道……

难道说……

***难道说这里的并发数指的每秒或者每分钟的累计数？？？***

不可能啊，

官方的文档中没有提到 per second 或者 per minute 啊！

Google 了一下，也查到不到类似的说法啊！

那是不是*阿里云改了 MySql 底层*，做了 per second 或者 per minute 的限制呢？

想不出别的原因了，死马当活马医，试一下吧！

## 问题解决

本来就是单线程运行的程序，为了降低 CRUD 操作的频率，只好在循环执行的逻辑中每次循环后添加 `Thread.Sleep` 等待。  
将代码改成大概如下的样子：

```csharp
// ...

for (DateTime dt = startDate; dt <= endDate; dt = dt.AddMonths(1))
{
    foreach (var shopInfo in list)
    {
        StatisticOneStore(shopInfo, dt);
        Thread.Sleep(1000); //第一处 Sleep
    }
}

// ...

private void StatisticOneStore(ShopInfo shopInfo, DateTime statisticDate)
{
    // 其他业务逻辑 ...

    foreach (var item in normalList)
    {
        SaveToDb(shopInfo, item, MarketingType.Normal, dbMonth);
        Thread.Sleep(50); //第二处 Sleep
    }

    // 其他业务逻辑 ...

    foreach (var item in eventList)
    {
        SaveToDb(shopInfo, item, MarketingType.Event, dbMonth);
        Thread.Sleep(50); //第三处 Sleep
    }

    //...
}

// ...
```

然后再重新发布到服务器上进行测试，虽然运行的速度慢了一点儿，但运行完成后查看运行日志，惊喜的发现，没有报错了！

再在控制台查看一下程序运行时的 IOPS 和 连接数：

![IOPS and Connections 2](/assets/images/202012/iops-connections-2.png)

连接数居然降至不到原来的一半了！！！

折腾了半天，最终居然只是加了个 `Sleep` 问题便解决了，实在是太出乎意料了！

大跌眼镜！

有没有？！

好在程序没有那么高的时效性要求，不然只能升级 MySql Server 的配置规格了。

## 总结

问题虽然是解决了，但是依然有个疑惑，官方文档上明明说的是**并发连接数**限制，为什么在阿里云 RDS MySql 中，却感觉是限制了每秒或者每分钟的累计连接数呢？

不知道有没有别的朋友遇到过这样的问题？

不管怎样，问题解决了，聊以记之，以儆效尤。

<!-- https://help.aliyun.com/knowledge_detail/41714.html?spm=5176.13643027.213.1.492f1450fEDUAT -->
