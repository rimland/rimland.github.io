---
layout: post
title:  "用 SQL 查询 MySQL 数据库和表的大小"
date:   2020-01-01 00:00:00 +0800
categories: utils
permalink: /utils/query-mysql-data-size
published: true
---

## MySQL 查询语句

### 查询一个 MySQL 服务实例中所有数据库的总大小

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
/// <param name="connStr"></param>
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
