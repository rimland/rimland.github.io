---
layout: post
title:  "如何在 Windows 10 安装 WSL 2"
date:   2020-12-13 00:05:00 +0800
categories: backend docker
published: true
---

> 翻译自 Joey Sneddon 2020年10月30日的文章[《How to Install WSL 2 on Windows 10》](https://www.omgubuntu.co.uk/how-to-install-wsl2-on-windows-10) [^1]

[^1]: <https://www.omgubuntu.co.uk/how-to-install-wsl2-on-windows-10> How to Install WSL 2 on Windows 10

![ubuntu-20.4-wsl](/assets/images/202012/ubuntu-20.4-wsl.jpg#center)

如果您想在最新的 Windows 版本中尝试经过改进的 [Windows 子系统 Linux 2](https://docs.microsoft.com/zh-cn/windows/wsl/wsl2-index) (即 WSL 2) [^wsl2]，怎么做呢？我们在本文中介绍了安装它所需要做的一切。

[^wsl2]: <https://docs.microsoft.com/zh-cn/windows/wsl/wsl2-index> WSL 2

WSL 2 是微软早在 2017 年推出的 [WSL 的原始版本](https://www.omgubuntu.co.uk/2017/07/windows-subsystem-linux-left-beta)的重大升级。WSL 2 不仅仅是版本的升级。它更快、更通用，并且使用**真正的 Linux 内核**。未来的 Linux 内核更新甚至会以 Windows 10 软件更新的形式发布——想想看，这有点疯狂!

微软创建 WSL 2 的目的是提高性能。最好的方法是什么？添加完整的系统调用兼容性，即以真正的 Linux 内核为核心。

“添加 WSL 2 为新架构，为 WSL 团队提供了一个更好的平台来提供一些特性，使 WSL 成为在 Windows 中运行 Linux 环境的一种令人惊叹的方式。” [微软表示](https://docs.microsoft.com/en-us/windows/wsl/wsl2-faq)。

微软还计划让用户[在 Windows 10 运行桌面 Linux 应用程序](https://www.omgubuntu.co.uk/2020/05/run-linux-apps-on-windows-10-wsl-2)，并使用 GPU 加强的任务，因此这种疯狂尚没有减弱的迹象。它还使得[用单条命令安装 WSL](https://www.omgubuntu.co.uk/2020/06/microsoft-wsl-install-command) 成为可能。

目前，除非您使用的是最新的内部版本，否则 WSL 2 的设置工作需要一点点的努力——但是，为了在 Windows 中调用和指挥一个完整的 Linux 系统，难道不值得吗？

## 在 Windows 10 上 安装 WSL 2

![Ubuntu-WSL-screenshot](/assets/images/202012/Ubuntu-WSL-screenshot.jpg#center)

### 必要条件

要在 Windows 10 上安装 WSL 2，您需要以下东西：

- Windows 10 2020年5月(2004) 版, Windows 10 2019年5月(1903) 版，或者 Windows 10 2019年11月(1909) 版
- 一台支持 Hyper-V 虚拟化的计算机

Windows 10 2020年5月更新已于 2020年5月发布（显然），但并非每个设备都能立即升级。要查看您的计算机上是否有 Windows 10 2020年5月更新，请转至“设置” > “更新和安全性” > “Windows 更新”。

在 8 月，[微软将 WSL 2 向后移植](https://devblogs.microsoft.com/commandline/wsl-2-support-is-coming-to-windows-10-versions-1903-and-1909/)到 Windows 10 的较早版本。版本号为 1903 或 1909 的任何人也可以安装WSL 2 —— 但必须首先安装 [Windows 更新 KB4566116](https://support.microsoft.com/zh-cn/help/4566116/windows-10-update-kb4566116)。

高级（和心急）的 Windows 用户可以强制安装 Windows 10 2020年5月更新，但请记住，如果按照这种方法操作，您可能会遭遇缺失驱动程序、GUI 故障或其他硬件故障。

从技术上讲，您可以在 Windows 10 build 18917 或更高版本的“内部”版本上安装 WSL 2。我不太熟悉“内部”版本系统是如何工作的，所以请注意，本文的其余部分都基于在稳定版的 Windows 上使用该功能。

为了运行 WSL 2，您的计算机还需要支持 Hyper-V 虚拟化。您可以[检查您的计算机确认对 Hyper-V 的支持](https://www.zdnet.com/article/windows-10-tip-find-out-if-your-pc-can-run-hyper-v/) [^HyperV]。

[^HyperV]: <https://www.zdnet.com/article/windows-10-tip-find-out-if-your-pc-can-run-hyper-v/> Find out if your PC can run Hyper-V

如果您不能同时满足这两个必要条件，则无法安装或启用 WSL 2——但可以使用 WSL 1。

在 Windows 10 上安装 WSL 2 的过程如下：

1. 启用 WSL 2
2. 启用“虚拟机平台”
3. 设置 WSL 2 为默认值
4. 安装 Linux 发行版

我将使用 PowerShell 应用程序依次介绍每个步骤，您需要以管理员身份运行此应用程序。您可以在 Windows “开始” 菜单中找到 PowerShell。

> 注意：也可以使用 GUI 安装 WSL 1，但使用命令行安装的速度要快得多，而且由于 WSL 是 CLI 工具，这也比较讲得通！

### 第 1 步，启用 WSL

不管您想要使用哪个版本的 WSL，都首先需要启用它。为此，请**以管理员身份打开 PowerShell 工具并运行以下命令**。小心不要在命令中输入错误或遗漏任何字符：

```powerShell
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
```

如果只想使用 WSL 1，您可以跳到第 4 步。

### 第 2 步，启用“虚拟机平台”

WSL 2 需要启用 Windows 10 的 “虚拟机平台” 特性。它独立于 Hyper-V，并提供了一些在 Linux 的 Windows 子系统新版本中可用的更有趣的平台集成。

要在 Windows 10（2004）上启用虚拟机平台，请以管理员身份打开 PowerShell 并运行：

```powershell
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```

要在 Windows 10（1903，1909）上启用虚拟机平台，请以管理员身份打开 PowerShell 并运行：

```powershell
Enable-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform -NoRestart
```

为了确保所有相关部件都整齐到位，您应该在**此时重启系统**，否则可能会发现事情没按预期进行。

### 第 3 步，设置 WSL 2 为默认值

以管理员身份打开 PowerShell，然后运行以下命令以将 WSL 2 设置为 WSL 的默认版本：

```powershell
wsl --set-default-version 2
```

如果需要，您可以（随时）将发行版配置为以 WSL 1 模式运行。

### 第 4 步，安装一个 Linux 发行版

有了 WSL 和必要的虚拟化技术，接下来您要做的就是从 Microsoft Store 中选择并安装 Linux 发行版。

有几种不同的发行版可供选择，包括 OpenSUSE、Pengwin、Fedora Remix 和 Alpine Linux。但是我个人推荐（自然地）Ubuntu 20.04 LTS（尽管也有 18.04 LTS 和 16.04 LTS 可用）。

要在 Windows 10 上安装 Ubuntu，请打开 Microsoft Store 应用，搜索 “Ubuntu 20.04”，然后单击“获取”按钮：

[Ubuntu 20.04 LTS on the Microsoft Store](https://www.microsoft.com/store/productId/9N6SVWS3RX71) [^Ubuntu20]

[^Ubuntu20]: <https://www.microsoft.com/store/productId/9N6SVWS3RX71> Ubuntu 20.04 LTS on the Microsoft Store

当您在 Microsoft Store 中时，我强烈建议您**也安装开源的 Windows Terminal 应用程序**。该工具旨在为您提供最佳的 WSL 体验：

[Windows Terminal on the Microsoft Store](https://www.microsoft.com/store/productId/9N0DX20HK701) [^Terminal]

[^Terminal]: <https://www.microsoft.com/store/productId/9N0DX20HK701> Windows Terminal on the Microsoft Store

### 第 5 步，使用 WSL 2

当您安装 Ubuntu（或其他 Linux 发行版）时，快捷方式已添加到 Windows “开始”菜单中。使用它可以“打开” Ubuntu（或您选择的任何发行版）。第一次运行发行版时，速度似乎有点慢。这是预料之中的；发行版必须解压缩其所有内容——只是不要中断这个过程。

还将提示您设置用于发行版的用户名和密码。尝试挑选一些您不会忘记的字符。

## 将 WSL 1 上的 Ubuntu 转换为 WSL 2

如果您使用 WSL 1，则可以将现有的 WSL 1 安装升级到 WSL 2。要将现有的 WSL 1 发行版转换为 WSL 2，请在 PowerShell 中运行以下命令，例如：

```powershell
wsl.exe --set-version Ubuntu 2
```

使用时，您应将命令中的 “Ubuntu” 替换为您在 WSL 1 上安装运行的对应发行版的名称。

### 译者补充

可以在 PowerShell 中运行下面命令显示所有发行版的详细信息：

```powershell
wsl --list --verbose
```

命令 `wsl --set-version` 更改指定分发版的版本，其用法为：

```powershell
wsl --set-version <颁发版名称> <版本号>
```

例如：

```powershell
wsl --set version Ubuntu-20.04 2
```

👍 如果本指南对您有用，请在评论中告诉我！

<br/>

> 作者 ： Joey Sneddon  
> 译者 ： 技术译民  
> 出品 ： [技术译站](https://ittranslator.cn/)  
> 链接 ： [英文原文](https://www.omgubuntu.co.uk/how-to-install-wsl2-on-windows-10)
