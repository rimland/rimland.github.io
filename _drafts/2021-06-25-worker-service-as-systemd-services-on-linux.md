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

<!-- 
- [如何在 Windows 10 上安装 WSL2](https://ittranslator.cn/os/2020/12/14/how-to-install-wsl2-on-windows-10.html)
- [在 WSL Ubuntu 上使用 .NET 进行跨平台开发新手入门](https://ittranslator.cn/os/2020/12/28/creating-cross-platform-applications-with-net-on-ubuntu-on-wsl.html)
- [Windows Terminal 新手入门](https://ittranslator.cn/os/2020/12/31/getting-started-with-windows-terminal.html)

启动 WSL 2 上的 Ubuntu 系统，新建 */srv/Worker* 目录

```bash
mkdir /srv/Worker
``` -->

将文件夹 *C:\test\workerpub\linux* 下的文件压缩为 *linux.zip*。

打开 Xshell 工具，连接到一台 CentOS 测试机，新建 */srv/Worker* 目录：

```bash
mkdir /srv/Worker
```

使用 `rz` 命令将 *linux.zip* 复制到测试机，

![copy files to linux](https://ittranslator.cn/assets/images/202106/xshel-copy-rz.png)

然后解压 *linux.zip* 到 */srv/Worker* 目录：

```bash
unzip linux.zip -d /srv/Worker
```

为我们的程序分配可执行权限，并运行：

```bash
# 分配可执行权限
chmod +x /srv/Worker/MyService
# 运行
/srv/Worker/MyService
```

<!-- 
复制应用程序文件到 Ubuntu 系统：

```bash
cp -r /mnt/c/test/workerpub/linux/. /srv/Worker
```

> 此处的 /mnt/ 为 Ubuntu 系统中看到的 Windows 文件系统的根目录，/mnt/c/ 即为 Windows 系统中的 C 盘。

打开 */srv/Worker* 目录，输入 `./MyService` 回车，运行应用，您会在终端看到控制台输出。

```bash
cd /srv/Worker

./MyService
``` -->

![run as console on linux](https://ittranslator.cn/assets/images/202106/linux-run-as-console.png)

按 `Ctrl+C` 关闭应用，等待关闭前必须完成的任务正常结束，应用退出。输入 `ls /srv/Worker` 命令回车，您会在该目录下看到多了一个 *Logs* 目录，日志文件输出正常。

## 作为 Systemd Service 运行

### 添加 Systemd Service 依赖

<!-- 
provides notification messages for application started and stopping, and configures console logging to the systemd format.
并将控制台日志记录配置为systemd格式。
并将控制台日志配置为 systemd 格式。
https://www.freedesktop.org/software/systemd/man/systemd.service.html
 -->

为了让我们的 Worker 监听来自 Systemd 的启动和停止信号，我们需要添加 `Microsoft.Extensions.Hosting.Systemd` NuGet 包：

```bash
dotnet add package Microsoft.Extensions.Hosting.Systemd
```

然后，我们需要修改 *Program.cs* 中的 `CreateHostBuilder` 方法，添加 `UseSystemd` 方法调用，将宿主(host)生命周期设置为 *Microsoft.Extensions.Hosting.Systemd.SystemdLifetime*，以便应用程序可以接收启动和停止通知，并配置控制台输出记录为 systemd 格式。

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

重新运行以下命令将程序发布到文件夹：

```bash
dotnet publish -c Release -r linux-x64 -o c:\test\workerpub\linux
```

然后使用 `rz` 将程序文件复制到测试机，并为 */srv/Worker/MyService* 文件分配可执行权限。

接下来，我们需要为 systemd 创建配置文件，告诉它服务的信息，以便它知道如何运行它。为此，我们需要创建一个 `.service` 文件，我们将在注册和运行此服务的 Linux 机器上使用此文件。

在我们的项目中创建一个名为 *MyService.service* 的服务单元配置文件，内容如下：

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

# This gives time to MyService to shutdown gracefully.
TimeoutStopSec=300

[Install]
WantedBy=multi-user.target
```

使用时应将 *User=yourusername* 项中的 `yourusername` 改为具体的 linux 系统的登录名。

Systemd 期望所有的配置文件放置在 */etc/systemd/system/* 目录下，我们打开此目录，并使用 `rz` 命令将服务配置文件复制到 */etc/systemd/system/MyService.service*，

```bash
cd /etc/systemd/system/

rz
```

然后执行以下命令让 systemd 重新加载配置文件：
 <!-- all configuration files to be put under '/etc/systemd/system/'. Copy the service configuration file to '/etc/systemd/system/HelloWorld.service'. Then tell systemd to reload the configuration files, and start the service.

Systemd 期望所有配置文件都放在“/etc/systemd/system/”下。 将服务配置文件复制到'/etc/systemd/system/HelloWorld.service'。 然后告诉 systemd 重新加载配置文件，并启动服务。 

sudo cp -r /mnt/d/Git/Github/it/WorkerServiceAsSystemdService/MyService.service /etc/systemd/system/
-->

```bash
# sudo cp -r /mnt/d/demo/WorkerServiceAsSystemdService/MyService.service /etc/systemd/system/
systemctl daemon-reload
```

<!-- > 请将  /mnt/d/demo/WorkerServiceAsSystemdService/MyService.service 替换成您的实际路径 -->

之后，可以运行以下命令来查看 systemd 是否识别了您的服务：

```bash
systemctl status MyService
```

结果显示如下：

![systemctl status MyService](https://ittranslator.cn/assets/images/202106/systemctl-status-MyService.png)

这表明您注册的新服务被禁用了，我们可以通过运行以下命令来启动它:

```bash
systemctl start MyService
```

重新运行 `systemctl status MyService` 命令查看服务状态，显示如下：

![systemctl status MyService 2](https://ittranslator.cn/assets/images/202106/systemctl-status-MyService-2.png)

如果您希望该服务在机器启动时自动启动，那么可以使用以下命令：

```bash
systemctl enable MyService
```

使用 `journalctl`，我们可以验证应用程序是否成功运行。命令 `journalctl` 可以跟踪显示应用程序的输出信息：

```bash
journalctl -u MyService -f
```

按 `Ctrl-C` 退出命令。

当我们调用 `UseSystemd` 时，会将 `Extensions.LogLevel` 映射到 Syslog 日志级别：

| LogLevel    | Syslog level | systemd name |
| ----------- | ------------ | ------------ |
| Trace/Debug | 7            | debug        |
| Information | 6            | info         |
| Warning     | 4            | warning      |
| Error       | 3            | err          |
| Critical    | 2            | crit         |

所以，我们可以使用 `journalctl` 命令的优先级标记（priority-flag）`-p` 来根据日志级别过滤应用的输出信息：

```bash
journalctl -p 4 -u MyService -f
```

## 总结

<!-- ```bash
$ sudo systemctl daemon-reload

System has not been booted with systemd as init system (PID 1). Can't operate.
Failed to connect to bus: Host is down
```

```bash
$ systemctl

System has not been booted with systemd as init system (PID 1). Can't operate.
Failed to connect to bus: Host is down
``` -->

<!-- 
sudo systemctl daemon-reload

System has not been booted with systemd as init system (PID 1). Can't operate.
Failed to connect to bus: Host is down

https://github.com/DamionGans/ubuntu-wsl2-systemd-script 

https://www.cyberciti.biz/faq/howto-reboot-linux/

https://stackoverflow.com/questions/48407070/wsl-ubuntu-hangs-how-to-restart

https://superuser.com/questions/1126721/rebooting-ubuntu-on-windows-without-rebooting-windows

-->

<!-- ```bash
sudo apt install git
```

```bash
sudo git clone https://github.com/DamionGans/ubuntu-wsl2-systemd-script.git
cd ubuntu-wsl2-systemd-script/
bash ubuntu-wsl2-systemd-script.sh
# Enter your password and wait until the script has finished
``` -->
