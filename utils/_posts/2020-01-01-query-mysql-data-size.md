---
layout: post
title:  "查询 MySQL 数据库和表的大小"
date:   2020-01-01 00:00:00 +0800
categories: utils
permalink: /utils/query-mysql-data-size
published: true
---

## MySQL 查询语句

### 基础知识

在 MySQL 中，`INFORMATION_SCHEMA` 库提供对数据库的元数据以及 MySQL 服务器的相关信息（例如，数据库或表的名称、列的数据类型或访问权限）的访问。[^schema]

`INFORMATION_SCHEMA` 是每个 MySQL 实例中的一个数据库，用于存储 MySQL 服务器维护的所有其他数据库的相关信息。`INFORMATION_SCHEMA` 数据库包含一些只读表，它们实际上是视图，而不是基表，因此没有与之相关联的文件，您也不能在这些只读表上设置触发器。另外，没有具有该名称的数据库目录。

尽管您可以使用 `USE` 语句选定 `INFORMATION_SCHEMA` 作为默认数据库，但您只能读取表的内容，而不能对其执行 INSERT、UPDATE 或 DELETE 操作。

[^schema]: <https://dev.mysql.com/doc/refman/8.0/en/information-schema-introduction.html>

`INFORMATION_SCHEMA` 库中的 `TABLES` 表提供数据库中表的相关信息。[^tables]

`TABLES` 表中的列 `DATA_LENGTH` 表示该表的大小。

- 对于 MyISAM，DATA_LENGTH 是数据文件的长度，以字节为单位。

- 对于 InnoDB，DATA_LENGTH 是为聚集索引分配的近似空间大小，以字节为单位。具体来说，它是聚集索引大小（以页为单位）乘以 InnoDB 页大小。

[^tables]: <https://dev.mysql.com/doc/refman/8.0/en/information-schema-tables-table.html>

有了以上的基础知识，我们不难总结出以下查询语句。

### 查询一个 MySQL 实例中所有数据库的总大小

```sql
select concat(round(sum(DATA_LENGTH/1024/1024/1024),3),'GB') as `所有数据库的总大小` from information_schema.TABLES;
```

### 查询每一个数据库的大小

```sql
select table_schema as `数据库`,concat(round(sum(DATA_LENGTH/1024/1024/1024),3),'GB') as `大小` from information_schema.TABLES group by table_schema;
```

### 查询某一个数据库的大小

```sql
select table_schema as `数据库`,concat(round(sum(DATA_LENGTH/1024/1024/1024),3),'GB') as `大小` from information_schema.TABLES where table_schema='db_name';
```

### 查询某一数据库中每张表的大小

```sql
select table_name as `表名`,concat(round(DATA_LENGTH/1024/1024,2),'MB') as `大小` from information_schema.TABLES where table_schema='db_name';
```

### 查询某一数据库中某张表的大小

```sql
select concat(round(DATA_LENGTH/1024/1024,2),'MB') as `大小` from information_schema.TABLES where table_schema='db_name' and table_name='tbl_name';
```

> 💡 注释  
> `db_name` 为实际的数据库名称。  
> `tbl_name` 为实际的表名称。

## C# 应用实例

为了便于查询，我使用了 Dapper ORM，它小巧、方便、好用，我太喜欢它了。

### C# 查询某一个数据库的大小

```csharp
using Dapper;
using MySql.Data.MySqlClient;
using System.Text.RegularExpressions;

/// <summary>
/// 查询某一个数据库的大小
/// </summary>
/// <param name="mysqlDbConn">数据库链接</param>
/// <returns></returns>
public string QueryDbSize(string mysqlDbConn)
{
    string dbName = GetDbNameFromConnStr(mysqlDbConn);

    string sql = "select sum(DATA_LENGTH) from information_schema.TABLES where table_schema=@db_name;";
    var parameters = new { db_name = dbName };

    using (var connection = new MySqlConnection(mysqlDbConn))
    {
        connection.Open();

        var dataLength = connection.QueryFirstOrDefault<long>(sql, parameters);

        string strSize = $"{(double)dataLength / 1024 / 1024 / 1024:0.###}GB";

        _logger.LogInformation("数据库 {dbName} 的大小为 {strSize}。", dbName, strSize);

        return strSize;
    }
}

/// <summary>
/// 从MySQL链接字符串中找出数据库名称，比如：从“"server=192.168.1.25;port=3306;userid=myuid;password=z89ld895;database=mydbname;charset=utf8;"” 中找出 mydbname
/// </summary>
/// <param name="connStr">MySQL 链接字符串</param>
/// <returns></returns>
public string GetDbNameFromConnStr(string connStr)
{
    var match = Regex.Match(connStr, "(?<=(database|db) ?= ?)[a-zA-Z0-9]+(?=;)");
    if (match.Success)
        return match.Value;
    else
        return null;
}
```

### C# 查询某一数据库中某张表的大小

```csharp
using Dapper;
using MySql.Data.MySqlClient;

/// <summary>
/// 查询某一数据库中某张表的大小
/// </summary>
/// <param name="mysqlDbConn">数据库链接</param>
/// <param name="dbName">数据库名称</param>
/// <param name="tblName">表名称</param>
/// <returns></returns>
public string QueryTableSize(string mysqlDbConn, string dbName, string tblName)
{
    string sql = "select DATA_LENGTH from information_schema.TABLES where table_schema=@db_name and table_name=@tbl_name;";
    var parameters = new { db_name = dbName, tbl_name = tblName };

    using (var connection = new MySqlConnection(mysqlDbConn))
    {
        connection.Open();

        var dataLength = connection.QueryFirstOrDefault<long>(sql, parameters);

        string strSize = $"{(double)dataLength / 1024 / 1024:0.###}MB";

        _logger.LogInformation("表 {dbName}.{tblName} 的大小为 {strSize}。", dbName, tblName, strSize);

        return strSize;
    }
}
```

## 总结

在本文中，我总结了查询 MySQL 数据库和表的大小的 SQL 语句，还使用 C# 结合 Dapper 实现了两个查询数据库和表大小的实例。

如果您觉得本文对您有用，请分享给更多的人。

> 作者 ： 技术译民  
> 出品 ： [技术译站](https://ittranslator.cn/)
