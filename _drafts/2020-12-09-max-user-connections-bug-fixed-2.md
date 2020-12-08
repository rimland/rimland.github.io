---
layout: post
title:  "从异常到68分钟到8分钟（记 RDS MySQL 的一个大坑之后记）"
date:   2020-12-08 00:05:00 +0800
categories: blog
published: true
---

在 [《记 RDS MySQL 的一个大坑》](https://ittranslator.cn/blog/2020/12/07/max-user-connections-bug-fixed.html) 中，我提到遇到 <font color="red">User juxxxxxxxxxx already has more than 'max_user_connections' active connections……</font> 这样的错误，最终通过在循环中使用 `Thread.Sleep`，降低 CRUD 操作的频率，让连接数下降至不到原来的一半，从而解决了这个棘手的问题，有兴趣的朋友可以[点击链接回顾一下](https://ittranslator.cn/blog/2020/12/07/max-user-connections-bug-fixed.html)。





> 作者 ： 技术译民  
> 出品 ： [技术译站](https://ittranslator.cn/)
