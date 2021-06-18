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

- [如何在 Windows 10 上安装 WSL2](https://ittranslator.cn/os/2020/12/14/how-to-install-wsl2-on-windows-10.html)
- [在 WSL Ubuntu 上使用 .NET 进行跨平台开发新手入门](https://ittranslator.cn/os/2020/12/28/creating-cross-platform-applications-with-net-on-ubuntu-on-wsl.html)
- [Windows Terminal 新手入门](https://ittranslator.cn/os/2020/12/31/getting-started-with-windows-terminal.html)

启动 WSL 2 上的 Ubuntu 系统，新建 */srv/Worker* 目录

```bash
sudo mkdir /srv/Worker
```

复制应用程序文件到 Ubuntu 系统：

```bash
cp -r /mnt/c/test/workerpub/linux/. /srv/Worker
```

> 此处的 /mnt/ 为 Ubuntu 系统中看到的 Windows 文件系统的根目录，/mnt/c/ 即为 Windows 系统中的 C 盘。

打开 */srv/Worker* 目录，输入 `./MyService` 回车，运行应用，您会在终端看到控制台输出。

```bash
cd /srv/Worker

./MyService
```

![run as console on linux](https://ittranslator.cn/assets/images/202106/linux-run-as-console.png)

按 `Ctrl+C` 关闭应用，等待关闭前必须完成的任务正常结束，应用退出。输入 `ls` 命令回车，您会在当前目录下看到多了一个 *Logs* 目录，日志文件输出正常。

## 作为 Systemd Service 运行

### 添加 Systemd Service 依赖

```bash
dotnet add package Microsoft.Extensions.Hosting.Systemd
```

<!-- provides notification messages for application started and stopping, and configures console logging to the systemd format.
并将控制台日志记录配置为systemd格式。
并将控制台日志配置为 systemd 格式。
https://www.freedesktop.org/software/systemd/man/systemd.service.html
 -->

为了让我们的 Worker 监听来自 Systemd 的启动和停止信号，我们需要修改 *Program.cs* 中的 `CreateHostBuilder` 方法，添加 `UseSystemd` 方法调用，将宿主(host)生命周期设置为 *Microsoft.Extensions.Hosting.Systemd.SystemdLifetime*，以便应用程序可以接收启动和停止通知，并配置控制台输出记录为 systemd 格式。

```csharp
public static IHostBuilder CreateHostBuilder(string[] args) =>
    Host.CreateDefaultBuilder(args)
        .UseSystemd() // Sets the host lifetime to Microsoft.Extensions.Hosting.Systemd.SystemdLifetime...
        .ConfigureServices((hostContext, services) =>
        {
            services.AddHostedService<Worker>();
        })
        .UseSerilog(); //将 Serilog 设置为日志提供程序
```

现在我们有了一个应用程序，我们需要为 systemd 创建配置文件，告诉它服务的信息，以便它知道如何运行它。为此，我们需要创建一个 `.service` 文件，我们将在注册和运行此服务的 Linux 机器上使用此文件。

在我们的项目中创建一个名为 *MyService.service* 的服务单元配置文件：

```ini
[Unit]
Description=Long running service/daemon created from .NET worker template

[Service]
# The systemd service file must be configured with Type=notify to enable notifications.
Type=notify
# will set the Current Working Directory (CWD). Worker service will have issues without this setting
WorkingDirectory=/srv/Worker
# systemd will run this executable to start the service
ExecStart=/srv/Worker/MyService
# to query logs using journalctl, set a logical name here  
SyslogIdentifier=MyService

# Use your username to keep things simple.
# If you pick a different user, make sure dotnet and all permissions are set correctly to run the app
# To update permissions, use 'chown yourusername -R /srv/Worker' to take ownership of the folder and files,
#       Use 'chmod +x /srv/Worker/Worker' to allow execution of the executable file
User=yourusername

# This environment variable is necessary when dotnet isn't loaded for the specified user.
# To figure out this value, run 'env | grep DOTNET_ROOT' when dotnet has been loaded into your shell.
Environment=DOTNET_ROOT=/usr/share/dotnet/dotnet

[Install]
WantedBy=multi-user.target
```

<!-- 这个文件需要存在于 /etc/systemd/system/ 目录中，在我们的例子中是 /etc/systemd/system/testapp.service。 通过指定 Type=notify，应用程序可以在主机启动/停止时通知 systemd。 一旦文件存在于目录中，请为 systemd 运行以下命令以使用 systemctl 命令加载新的配置文件，这是您与 systemd 交互的方式：

This file needs to exist in the /etc/systemd/system/ directory, /etc/systemd/system/testapp.service in our case. By specifying Type=notify an application can notify systemd when the host has started/is stopping. Once the file exists in the directory run the following for systemd to load the new configuration file using the systemctl command which is how you interact with systemd: -->

Systemd 期望所有的配置文件放置在 */etc/systemd/system/* 目录下，将服务配置文件复制到 */etc/systemd/system/MyService.service*，然后告诉 systemd 重新加载配置文件，并启动服务。
 <!-- all configuration files to be put under '/etc/systemd/system/'. Copy the service configuration file to '/etc/systemd/system/HelloWorld.service'. Then tell systemd to reload the configuration files, and start the service.

Systemd 期望所有配置文件都放在“/etc/systemd/system/”下。 将服务配置文件复制到'/etc/systemd/system/HelloWorld.service'。 然后告诉 systemd 重新加载配置文件，并启动服务。 

sudo cp -r /mnt/d/Git/Github/it/WorkerServiceAsSystemdService/MyService.service /etc/systemd/system/
-->

```bash
sudo cp -r /mnt/d/demo/WorkerServiceAsSystemdService/MyService.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl start MyService
```

> 请将  /mnt/d/demo/WorkerServiceAsSystemdService/MyService.service 替换成您的实际路径

之后，如果您可以运行以下命令来查看 systemd 是否了解您的服务：

```bash
sudo systemctl status MyService
```

```bash
$ sudo systemctl daemon-reload

System has not been booted with systemd as init system (PID 1). Can't operate.
Failed to connect to bus: Host is down
```

```bash
$ systemctl

System has not been booted with systemd as init system (PID 1). Can't operate.
Failed to connect to bus: Host is down
```

<!-- 
sudo systemctl daemon-reload

System has not been booted with systemd as init system (PID 1). Can't operate.
Failed to connect to bus: Host is down

https://github.com/DamionGans/ubuntu-wsl2-systemd-script 

https://www.cyberciti.biz/faq/howto-reboot-linux/

https://stackoverflow.com/questions/48407070/wsl-ubuntu-hangs-how-to-restart

https://superuser.com/questions/1126721/rebooting-ubuntu-on-windows-without-rebooting-windows

-->

```bash
sudo apt install git
```

```bash
sudo git clone https://github.com/DamionGans/ubuntu-wsl2-systemd-script.git
cd ubuntu-wsl2-systemd-script/
bash ubuntu-wsl2-systemd-script.sh
# Enter your password and wait until the script has finished
```
