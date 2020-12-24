---
layout: post
title:  "Getting Started with Windows Terminal 在 WSL Ubuntu 上进行 .NET 跨平台开发入门"
date:   2020-12-14 00:05:00 +0800
categories: os
published: true
---

> 翻译自 Kayla Cinnamon 2020年12月17日的文章[《Getting Started with Windows Terminal》](https://devblogs.microsoft.com/commandline/getting-started-with-windows-terminal/) [^1]

[^1]: <https://devblogs.microsoft.com/commandline/getting-started-with-windows-terminal/> Getting Started with Windows Terminal

<!-- Installation
Windows Terminal is available in two different builds: Windows Terminal and Windows Terminal Preview. Both builds are available for download from the Microsoft Store and from the GitHub releases page. -->

## 安装

Windows Terminal 有两个不同的版本：[Windows Terminal](https://www.microsoft.com/p/windows-terminal/9n0dx20hk701) 和 [Windows Terminal 预览版](https://www.microsoft.com/p/windows-terminal-preview/9n8g5rfz9xk3)。两个版本都可以从 Microsoft Store 和 [GitHub 发布页](https://github.com/microsoft/terminal/releases)下载。

## 必备条件

<!-- In order to run either Windows Terminal build, your machine must be on Windows 10 1903 or later. -->

不管要运行哪一个 Windows Terminal 版本，您的机器必须是 Windows 10 1903 或更高版本。

## Windows Terminal 预览版

<!-- Windows Terminal Preview is the build where new features arrive first. This build is intended for those who like to see the latest features as soon as they are released. This build has a monthly release cadence with the newest features each month. -->

Windows Terminal 预览版是新功能首先推出的版本。这个版本是为那些希望新功能发布时尽快看到它们的人所准备的。这个版本的发布周期是按月发布，每个月都有最新的特性。

![Image terminal preview image](/assets/images/202012/terminal-preview-image-e1592500021421.png)

## Windows Terminal

<!-- Windows Terminal is the main build for the product. Features that arrive in Windows Terminal Preview appear in Windows Terminal after a month of being in production. This allows for extensive bug testing and stabilization of new features. This build is intended for those who want to receive features after they have been introduced and tested by the Preview community. -->

Windows Terminal 是该产品的主要版本。Windows Terminal 预览版中出现的功能，在生产出来一个月以后，会出现在 Windows Terminal 中。这个版本是为那些希望收到在预览社区中引入和通过测试的功能的人准备的。

## 第一次启动

After installing the terminal, you can launch the app and get started right away with the command line. By default, the terminal includes Windows PowerShell, Command Prompt, and Azure Cloud Shell profiles inside the dropdown. If you have Windows Subsystem for Linux (WSL) distributions installed on your machine, they should also dynamically populate as profiles when you first launch the terminal.

Windows Terminal 安装完成后，您可以启动它，并开始命令行界面。

安装终端后，您可以启动应用程序并立即从命令行开始。 默认情况下，终端在下拉列表中包括Windows PowerShell，命令提示符和Azure Cloud Shell配置文件。 如果您的计算机上安装了Linux的Windows子系统（WSL），则在首次启动终端时，它们也应作为配置文件动态填充。




<br/>

> 作者 ： Kayla Cinnamon  
> 译者 ： 技术译民  
> 出品 ： [技术译站](https://ittranslator.cn/)  
> 链接 ： [英文原文](https://devblogs.microsoft.com/commandline/getting-started-with-windows-terminal/)
