---
layout: post
title:  "用 SQL 查询 MySQL 数据库和表的大小"
date:   2020-01-01 00:00:00 +0800
categories: utils
permalink: /utils/query-mysql-data-size
published: true
---

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
