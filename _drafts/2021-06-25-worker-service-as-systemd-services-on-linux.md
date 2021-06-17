---
layout: post
title:  ".NET Worker Service 部署到 Linux 作为 Systemd Service 运行"
date:   2021-06-17 00:01:01 +0800
categories: dotnet csharp
author: 技术译民
tags: [DotNet, Worker Service, Windows Services]
published: false
---

上一篇文章我们了解了如何将[.NET Worker Service 作为 Windows 服务运行](https://ittranslator.cn/dotnet/csharp/2021/06/17/worker-service-as-windows-services.html)，今天我接着介绍一下如何将 Worker Service 部署到 Linux 上，并作为 Systemd Service 运行。

<!-- 我曾经在[前面一篇文章的总结](https://ittranslator.cn/dotnet/csharp/2021/05/17/worker-service-gracefully-shutdown.html)中提到过*可以使用 **sc.exe** 实用工具将 Worker Service 安装为 Windows 服务运行*，本文中我就来具体阐述一下如何实现它。 -->

我在本文中要覆盖的内容包含：

- 作为 Linux 控制台程序运行
- 作为 Systemd Service 运行
- 开机自动启动

## 删除不用的依赖库

```bash
dotnet remove package Microsoft.Extensions.Hosting.WindowsServices
```

### 修改配置文件

打开配置文件 *appsettings.json*，将日志文件的保存路径中的 `\` 改为 `/`，其他不用做任何更改。

```json
{
  "Name": "RollingFile",
  "Args": {
    "pathFormat": "Logs/{Hour}.log",
    "outputTemplate": "{Timestamp:o} [{Level:u3}] ({MachineName}/{ProcessId}/{ProcessName}/{ThreadId}) {Message}{NewLine}{Exception}"
  }
},
{
  "Name": "SQLite",
  "Args": {
    "sqliteDbPath": "Logs/log.db",
    "tableName": "Logs",
    "maxDatabaseSize": 1,
    "rollOver": true
  }
}
```

这是因为 Windows 中用反斜杠 `\` 用来表示目录而，Linux 中用正斜杠 `/` 来表示目录。

如果保存路径不改，您将会看到日志保存成如下的尴尬文件名：

```bash
'Logs\2021061715.log'
'Logs\log.db'
```

### 发布程序

运行 `dotnet publish` 命令将应用程序及其依赖项发布到文件夹[^publish]。

[^publish]: <https://docs.microsoft.com/zh-cn/dotnet/core/tools/dotnet-publish>

```bash
dotnet publish -c Release -r linux-x64 -o c:\test\workerpub\linux
```

命令运行完成后，您会在 *C:\test\workerpub\linux* 文件夹中看到适用于 Linux 系统的可执行程序及其所有依赖项。

## 作为 Linux 控制台程序运行

[如何在 Windows 10 上安装 WSL2](https://ittranslator.cn/os/2020/12/14/how-to-install-wsl2-on-windows-10.html)

```bash
mkdir /home/worker
```

```bash
cp -r /mnt/c/test/workerpub/linux/. /home/worker
```

```bash
cd /home/worker

./MyService
```