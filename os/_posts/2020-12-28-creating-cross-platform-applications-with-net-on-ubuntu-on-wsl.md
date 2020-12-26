---
layout: post
title:  "在 WSL Ubuntu 上使用 .NET 进行跨平台开发新手入门"
date:   2020-12-28 00:05:00 +0800
categories: os
published: true
---

> 翻译自 haydenb 2020年6月3日的文章[《Getting started with cross-platform development using .NET on Ubuntu on WSL》](https://ubuntu.com/blog/creating-cross-platform-applications-with-net-on-ubuntu-on-wsl) [^1]

[^1]: <https://ubuntu.com/blog/creating-cross-platform-applications-with-net-on-ubuntu-on-wsl> Getting started with cross-platform development using .NET on Ubuntu on WSL

.NET 是一个开源软件框架，用于在 Linux、Windows 和 macOS 上构建跨平台应用程序。[WSL 上的 Ubuntu](https://ubuntu.com/wsl) [^wsl]允许您同时为 Ubuntu 和 Windows 构建和测试应用程序。当我们把这些融合在一起时会发生什么呢？这篇博客将演示如何在 WSL 上安装 .NET 开发栈，构建一个简单的操作系统感知应用，然后在 Linux 和 Windows 上测试它。

[^wsl]: <https://ubuntu.com/wsl> Ubuntu on WSL

## 启用 WSL 1

以管理员方式启动 PowerShell 并运行：

```powershell
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux
```

![Enable WSL 1](/assets/images/202012/wsl-ubuntu-net-1.png)

如果您只想安装 WSL 1，您可以重启电脑并跳过下一步。

```powershell
Restart-Computer
```

如果您要安装 WSL 2，请不要重启，继续下一步操作：

## 启用 WSL 2 (Windows 10 2004+)

查看 “[Ubuntu on WSL 2 Is Generally Available](https://ubuntu.com/blog/ubuntu-on-wsl-2-is-generally-available)” [^wsl2]了解更多关于 Ubuntu on WSL 2 的细节。

[^wsl2]: <https://ubuntu.com/blog/ubuntu-on-wsl-2-is-generally-available> Ubuntu on WSL 2 Is Generally Available

以管理员方式启动 PowerShell 并运行：

```powershell
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```

![Enable WSL 2](/assets/images/202012/wsl-ubuntu-net-2.png)

然后重启 Windows 操作系统：

```powershell
Restart-Computer
```

## 在 WSL 上安装 Ubuntu

从 Microsoft Store 中下载 Ubuntu：

[Ubuntu 20.04 LTS on the Microsoft Store](https://www.microsoft.com/store/productId/9N6SVWS3RX71) [^Ubuntu20]

[^Ubuntu20]: <https://www.microsoft.com/store/productId/9N6SVWS3RX71> Ubuntu 20.04 LTS on the Microsoft Store

![Ubuntu 20.04 LTS on the Microsoft Store](/assets/images/202012/wsl-ubuntu-net-3.png)

要想了解更多在 WSL 上安装 Ubuntu 的方法，请查看 [Ubuntu on WSL wiki 页面](https://wiki.ubuntu.com/WSL) [^wsl-wiki]。

[^wsl-wiki]: <https://wiki.ubuntu.com/WSL> Ubuntu on WSL wiki

## 安装 Windows Terminal

从 Microsoft Store 中下载 Windows Terminal：

[Windows Terminal on the Microsoft Store](https://www.microsoft.com/store/productId/9N0DX20HK701) [^Terminal]

[^Terminal]: <https://www.microsoft.com/store/productId/9N0DX20HK701> Windows Terminal on the Microsoft Store

![Windows Terminal on the Microsoft Store](/assets/images/202012/wsl-ubuntu-net-4.png)

也可以从 [GitHub](https://github.com/microsoft/terminal/releases) 下载 Windows Terminal。

## 运行 WSL 上的 Ubuntu

打开 Windows Terminal 并运行：

```powershell
ubuntu.exe
```

当您首次在 WSL 上运行 Ubuntu 时，它将安装，并提示您创建一个 Linux 用户，这个用户是独立于 Windows 用户的。

![Run Ubuntu on WSL](/assets/images/202012/wsl-ubuntu-net-5.png)

退出并重新打开 Windows Terminal，您将会发现 Ubuntu 出现在下拉菜单中：

![Ubuntu on the drop-down](/assets/images/202012/wsl-ubuntu-net-6.png)

您可以在 [settings.json](https://docs.microsoft.com/en-us/windows/terminal/get-started#configuration) 中设置 Windows Terminal，将 Ubuntu 设置为默认项。

## 更新 WSL 上的 Ubuntu

您应该定期检查更新，并在 WSL 上的 Ubuntu 中运行升级。我们用 apt (Ubuntu 包管理器)来实现。

要检查更新，请运行：

```bash
sudo apt update
```

![sudo apt update](/assets/images/202012/wsl-ubuntu-net-7.png)

要获得升级，请运行：

```bash
sudo apt upgrade
```

![sudo apt upgrade](/assets/images/202012/wsl-ubuntu-net-8.png)

您可以通过用 `&&` 将它们连接在同一行并添加 `-y` 标签，自动更新并应用可用的升级：

```bash
sudo apt update && sudo apt upgrade -y
```

## 添加微软的 .NET 资源库和签名密钥

我们需要为 apt 添加微软的 .NET 资源库和签名密钥。我们将从微软下载并安装一个包来完成这项工作。

请确保您正在为您的 Ubuntu 版本安装正确的资源库。您可以使用下面的命令检查 Ubuntu 的当前版本：

```bash
cat /etc/os-release
```

下面的示例使用 Ubuntu 20.04，来自 Canonical 的最新 LTS 发行版。如果您仍在使用 Ubuntu 16.04、18.04 或 19.10，您可以在[微软文档](https://docs.microsoft.com/en-us/dotnet/core/install/linux-ubuntu) [^repos]中找到相应的资源库。要了解关于 LTS 和中间版本之间的更多区别，我们有一个[发布周期页面](https://ubuntu.com/about/release-cycle) [^cycle]。

[^repos]: <https://docs.microsoft.com/en-us/dotnet/core/install/linux-ubuntu>
[^cycle]: <https://ubuntu.com/about/release-cycle>

为 20.04 版本下载微软的资源库和密钥包：

```bash
wget https://packages.microsoft.com/config/ubuntu/20.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
```

![Download the Microsoft repository and key package](/assets/images/202012/wsl-ubuntu-net-9.png)

使用 dpkg -i 手动安装微软资源包：

```bash
sudo dpkg -i packages-microsoft-prod.deb
```

![Install the Microsoft repo package](/assets/images/202012/wsl-ubuntu-net-10.png)

现在当你更新 apt 时，你会看到微软资源库已检查升级了：

![apt update](/assets/images/202012/wsl-ubuntu-net-11.png)

## 安装 .NET SDK

使用 apt 从微软资源库安装 .NET 和相关依赖项：

```bash
sudo apt-get install dotnet-sdk-3.1 -y
```

![Install the .NET SDK](/assets/images/202012/wsl-ubuntu-net-12.png)

## 新建工作区（workspace）

创建一个新的工作目录并打开该目录：

```bash
mkdir dotnetproject
cd dotnetproject/
```

![Create a workspace](/assets/images/202012/wsl-ubuntu-net-13.png)

## 新建一个 .NET 项目

使用 `dotnet new` 创建一个新的 .NET 控制台项目，这会创建一个名为 `Program.cs` 的文件和其他一些必要的文件夹和文件：

```bash
dotnet new console
```

![Create a new .NET project](/assets/images/202012/wsl-ubuntu-net-14.png)

## 探索我们的 .NET 应用

列出您的新 .NET 项目中的文件：

```bash
ls
```

查看 `Program.cs` 的内容：

```bash
cat Program.cs
```

![Explore our .NET app](/assets/images/202012/wsl-ubuntu-net-15.png)

运行示例程序：

```bash
dotnet run
```

![Run the sample program](/assets/images/202012/wsl-ubuntu-net-16.png)

## 自定义我们的 .NET 应用

在您最喜欢的编辑器中打开 `Program.cs`：vi、nano、emacs 或者有 remote WSL 扩展的 [VS Code](https://code.visualstudio.com/)：

![Code with the remote WSL extension](/assets/images/202012/wsl-ubuntu-net-17.png)

在这里，我们使用 WSL 上的 Ubuntu 中包含的 nano：

```bash
nano Program.cs
```

![nano Program.cs](/assets/images/202012/wsl-ubuntu-net-18.png)

首先，我们添加 [Interop services 命名空间](https://docs.microsoft.com/en-us/dotnet/api/system.runtime.interopservices?view=netcore-3.1)：

```csharp
using System.Runtime.InteropServices;
```

然后把：

```csharp
Console.WriteLine("Hello World!");
```

替换成：

```csharp
Console.WriteLine($"Hello {System.Environment.GetEnvironmentVariable("USER")}");

if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
{
  Console.WriteLine("We're on Linux!");
}

if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
{
  Console.WriteLine("We're on Windows!");
}

Console.WriteLine("Version {0}", Environment.OSVersion.Version);
```

![replace code](/assets/images/202012/wsl-ubuntu-net-19.png)

这段代码也可以在[这里](https://pastebin.ubuntu.com/p/swbPxXXSKD/?_ga=2.158712185.2144654207.1608393893-1964088564.1608393893) [^code]找到。

[^code]: <https://pastebin.ubuntu.com/p/swbPxXXSKD/>

这个应用程序告诉我们：当前的用户，检查是在 Windows 还是 Linux 上，然后给出 OS 内核版本。

退出并保存，然后运行：

```bash
dotnet run
```

![Exit and save and run](/assets/images/202012/wsl-ubuntu-net-20.png)

## 让我们的 .NET 应用程序跨平台

我们需要更新 .NET 项目文件 `dotnetproject.csproj`，告诉 .NET 同时为 Linux 和 Windows 平台构建。

在我们的编辑器中打开 `dotnetproject.csproj` 并添加：

```xml
<PropertyGroup>
    <RuntimeIdentifiers>win10-x64;linux-x64</RuntimeIdentifiers>
</PropertyGroup>
```

这将引导 .NET 同时为 Windows 10 x64 和 Linux x64 构建自包含的二进制文件。

![Make our .NET application cross-platform](/assets/images/202012/wsl-ubuntu-net-21.png)

## 构建我们的跨平台应用程序

当我们的配置好项目后，构建 .NET 应用程序变得如此简单：

```csharp
dotnet publish -r win10-x64
dotnet publish -r linux-x64
```

![dotnet publish](/assets/images/202012/wsl-ubuntu-net-22.png)

可以在项目的 `/bin/` 文件夹中找到每个平台的自包含二进制文件及其所有必需的库：

```bash
ls bin/Debug/netcoreapp3.1/
```

![ls bin/Debug/netcoreapp3.1/](/assets/images/202012/wsl-ubuntu-net-23.png)

## 测试 Linux 版本

您可以直接运行 Linux 二进制文件，如下所示：

```bash
./bin/Debug/netcoreapp3.1/linux-x64/publish/dotnetproject
```

![Test Linux build](/assets/images/202012/wsl-ubuntu-net-24.png)

## 测试 Windows 版本

要运行 Windows 版本，请将其复制到 Windows 文件系统中：

```bash
cp -r ~/dotnetproject/bin/Debug/netcoreapp3.1/win10-x64/publish /mnt/c/Users/Hayden/OneDrive/Desktop/
```

> 译者注：  
> `/mnt/` 为 Ubuntu 系统中看到的 Windows 文件系统的根目录，`/mnt/c/` 即为 Windows 系统中的 C 盘。

然后运行：

```bash
/mnt/c/Users/Hayden/OneDrive/Desktop/publish/dotnetproject.exe
```

![Test Windows build](/assets/images/202012/wsl-ubuntu-net-25.png)

至此，我们已经为 Linux 和 Windows 构建并运行了相同的应用程序。我们可以使用 WSL 同时测试它们。

<br/>

> 作者 ： haydenb  
> 译者 ： 技术译民  
> 出品 ： [技术译站](https://ittranslator.cn/)  
> 链接 ： [英文原文](https://ubuntu.com/blog/creating-cross-platform-applications-with-net-on-ubuntu-on-wsl)
