---
layout: post
title:  "Windows Terminal 新手入门"
date:   2020-12-26 00:05:00 +0800
categories: os
published: true
---

> 翻译自 Kayla Cinnamon 2020年12月17日的文章[《Getting Started with Windows Terminal》](https://devblogs.microsoft.com/commandline/getting-started-with-windows-terminal/) [^1]

[^1]: <https://devblogs.microsoft.com/commandline/getting-started-with-windows-terminal/> Getting Started with Windows Terminal

## 安装

Windows Terminal（Windows 终端）有两个不同的版本：[Windows Terminal](https://www.microsoft.com/p/windows-terminal/9n0dx20hk701)[^Terminal] 和 [Windows Terminal 预览版](https://www.microsoft.com/p/windows-terminal-preview/9n8g5rfz9xk3)[^Preview]。两个版本都可以从 Microsoft Store 和 [GitHub 发布页](https://github.com/microsoft/terminal/releases)下载。

[^Terminal]: <https://www.microsoft.com/p/windows-terminal/9n0dx20hk701> Windows Terminal
[^Preview]: <https://www.microsoft.com/p/windows-terminal-preview/9n8g5rfz9xk3> Windows Terminal Preview

### 必备条件

不管要运行哪一个 Windows Terminal 版本，您的机器必须是 Windows 10 1903 或更高版本。

### Windows Terminal 预览版

<!-- Windows Terminal Preview is the build where new features arrive first. This build is intended for those who like to see the latest features as soon as they are released. This build has a monthly release cadence with the newest features each month. -->

Windows Terminal 预览版是新功能首先推出的版本。这个版本是为那些希望新功能发布时尽快看到它们的人所准备的。这个版本的发布周期是按月发布，每个月都有最新的功能。

![Image terminal preview image](/assets/images/202012/terminal-preview-image-e1592500021421.png)

### Windows Terminal

<!-- Windows Terminal is the main build for the product. Features that arrive in Windows Terminal Preview appear in Windows Terminal after a month of being in production. This allows for extensive bug testing and stabilization of new features. This build is intended for those who want to receive features after they have been introduced and tested by the Preview community. -->

Windows Terminal 是该产品的主要版本。Windows Terminal 预览版中出现的功能，在生产出来一个月以后，会出现在 Windows Terminal 中。这个版本是为那些想要收到在预览社区中引入并通过测试的功能的人准备的。

## 首次启动

<!-- After installing the terminal, you can launch the app and get started right away with the command line. By default, the terminal includes Windows PowerShell, Command Prompt, and Azure Cloud Shell profiles inside the dropdown. If you have Windows Subsystem for Linux (WSL) distributions installed on your machine, they should also dynamically populate as profiles when you first launch the terminal. -->

Windows Terminal 安装完成后，您可以启动它，并开启命令行界面。默认情况下，Windows Terminal 的下拉菜单中包含 Windows PowerShell、Command Prompt 和 Azure Cloud Shell 配置文件。如果您的计算机上安装了 Windows Subsystem for Linux (WSL) 分发版，则在首次启动 Windows Terminal 时，它们也会作为配置文件动态加载。

## 配置文件（Profiles）

<!-- 行动；表现；起作用；扮演（角色）；担任；假装；代理

Profiles act as different command line environments that you can configure inside the terminal. By default, each profile uses a different command line executable, however you can create as many profiles as you’d like using the same executable. Each profile can have its own customizations to help you differentiate between them and add your own flair to each one. -->

配置文件代表着您可以在 Windows Terminal 中配置的不同的命令行环境。默认情况下，每个配置文件使用不同的命令行可执行程序，但是您可以根据自己的喜好，创建任意数量的使用同一可执行程序的配置文件。每个配置文件可以有自己的定制项以帮助您区分它们，并且可以为每个配置文件添加您特有的个性。

![Image terminal dropdown](/assets/images/202012/terminal-dropdown.png)

### 默认配置文件

<!-- Upon first launch of Windows Terminal, the default profile is set to Windows PowerShell. The default profile is the profile that always opens when you launch the terminal and it is the profile that will open when clicking the new tab button. You can change the default profile by setting  to the name of your preferred profile in your settings.json file. -->

首次启动 Windows Terminal 时，默认配置文件设置为 Windows PowerShell。默认配置文件是您启动 Windows Terminal 时总是打开的配置文件，也是单击新选项卡按钮时打开的配置文件。您可以通过在 `settings.json` 文件中将 `"defaultProfile"` 设置为首选配置文件的名称来更改默认配置文件。

```json
"defaultProfile": "PowerShell"
```

### 新增一个配置文件

<!-- New profiles can be added dynamically by the terminal or by hand. Windows Terminal will create profiles for PowerShell and WSL distributions automatically. These profiles will have a "source" property that tells the terminal where it can find the proper executable. -->

可以通过 Windows 终端或者手动动态地添加新的配置文件。Windows Terminal 会自动地为 PowerShell 和 WSL 分发版创建配置文件。这些配置文件具有一个 `"source"` 属性，告诉 Windows 终端在哪里可以找到合适的可执行程序。

<!-- If you’d like to create a new profile by hand, you just need to generate a new "guid", provide a "name", and provide the executable for the "commandline" property. -->

如果您想要手动创建新的配置文件，您只需[生成一个新的 `"guid"`](https://guidgenerator.com/online-guid-generator.aspx)[^guid]，提供一个 `"name"`，并为 `"commandline"` 属性提供可执行程序。

[^guid]: <https://guidgenerator.com/online-guid-generator.aspx> Online GUID Generator

<!-- 👉 Note: You will not be able to copy the "source" property from a dynamically generated profile. The terminal will just ignore this profile. You will have to replace "source" with "commandline" and provide the executable in order to duplicate a dynamically generated profile. -->

👉 **注意：**您不能从动态生成的配置文件中复制 `"source"` 属性，否则 Windows 终端会忽略此配置文件。您必须使用 `"commandline"` 替换 `"source"` 并提供可执行程序，以便复制一个动态生成的配置文件。

## Settings.json 结构

<!-- There are two settings files included in Windows Terminal. One is defaults.json, which can be opened by holding the Alt key and clicking the Settings button in the dropdown. This is an unchangeable file that includes all of the default settings that come with the terminal. The second file is settings.json, which is where you can apply all of your custom settings. This can be accessed by clicking the Settings button in the dropdown menu. -->

Windows Terminal 中包含两个设置文件。**一个是 *defaults.json*，可以通过按住 `Alt` 键并点击下拉菜单中的 Settings 按钮打开**，这是一个不可更改的文件，其中包含 Windows Terminal 的所有默认设置。另**一个是 *settings.json*，可以通过点击下拉菜单中的 Settings 按钮访问**，您可以在其中应用所有的自定义设置。

<!-- The settings.json file is split into four main sections. The first is the global settings object, which lives at the top of the JSON file inside the first {. Settings applied here will affect the entire application. -->

*settings.json* 文件分为四个主要部分。第一部分是[全局设置](https://docs.microsoft.com/windows/terminal/customize-settings/global-settings)对象，它位于 JSON 文件的顶部，在第一个 `{` 内，此处的设置影响整个应用程序。

<!-- Looking down the file, the next main section is the "profiles" object. The "profiles" object is split into two sections: "defaults" and "list". You can apply profile settings to the "defaults" object and these will apply to all profiles in your "list". The "list" contains each profile object that represents the profiles described above and these are the items that appear in your terminal’s dropdown menu. Settings applied to individual profiles in the "list" will override settings applied in the "defaults" section. -->

继续往下看，下一个主要部分是配置文件（`"profiles"`）对象，`"profiles"` 对象分为两个部分：`"defaults"` 和 `"list"`。您可以将配置文件设置应用于 `"defaults"` 对象，这些设置将应用到 `"list"` 中的所有配置文件。`"list"` 包含代表上述配置文件的每个配置文件对象，这些是出现在 Windows 终端下拉菜单中的项目。应用于 `"list"` 中各个配置文件的设置会覆盖 `"defaults"` 部分中应用的设置。

<!-- Further down in the file is the "schemes" array. This is where custom color schemes can be placed. A great tool to help you generate your own color schemes is terminal.sexy. -->

文件再往下是 `"schemes"` 数组，这里可以放置自定义[配色方案](https://docs.microsoft.com/en-us/windows/terminal/customize-settings/color-schemes) [^schemes]。一个可以帮您生成自己的配色方案的好工具是 [terminal.sexy](http://terminal.sexy/) [^se]。

[^schemes]: <https://docs.microsoft.com/en-us/windows/terminal/customize-settings/color-schemes> Color schemes in Windows Terminal

[^se]: <http://terminal.sexy/> Terminal Color Scheme Designer

<!-- Lastly, at the bottom of the file, lives the "actions" array. Objects listed here add actions to your terminal, which can be invoked by the keyboard and/or found inside the command palette. -->

最后，在文件底部，放置 `"actions"` 数组。这里列出的对象会将[操作](https://docs.microsoft.com/windows/terminal/customize-settings/actions) [^actions]添加到 Windows 终端，可以通过键盘调用和（或）在[命令面板](https://docs.microsoft.com/windows/terminal/command-palette)[^palette]中找到。

[^actions]: <https://docs.microsoft.com/windows/terminal/customize-settings/actions> Actions
[^palette]: <https://docs.microsoft.com/windows/terminal/command-palette> Command Palette

## 基本定制

<!-- Here are some basic settings to get you started with customizing your terminal. -->

以下是一些基本设置，可帮助您开始定制 Windows 终端。

### 背景图片

<!-- One of our most popular settings is the custom background image. This is a profile setting, so it can either be placed inside the "defaults" object inside the "profiles" object to apply to all profiles or inside a specific profile object. -->

自定义背景图片是我们最受欢迎的设置之一。这是一个*配置文件（profile）*设置，因此可以将其放置在 `"profiles"` 对象内的 `"defaults"` 对象内以应用到所有配置文件，或者放置在某个特定的配置文件（profile）对象内。

```json
"backgroundImage": "C:\\Users\\admin\\background.png"
```

<!-- The `"backgroundImage"` setting accepts the file location of the image you would like to use as your profile background. Accepted file types include .jpg, .png, .bmp, .tiff, .ico, and .gif. -->

`"backgroundImage"` 设置接受您想要用作配置文件的背景图片的文件位置，可接受的文件类型包含 .jpg、 .png、 .bmp、 .tiff、 .ico 和 .gif。

![Image snowy terminal](/assets/images/202012/snowy-terminal.png)

### 配色方案

<!-- The list of available color schemes can be found on our docs site. Color schemes are applied at the profile level, so you can place the setting inside "defaults" or in a specific profile object. -->

可用的配色方案列表可以在我们的[文档站点](https://docs.microsoft.com/en-us/windows/terminal/customize-settings/color-schemes)[^schemes]上找到。配色方案应用在*配置文件（profile）*级别，因此您可以将设置放在 `"defaults"` 内或特定的配置文件对象内。

```json
"colorScheme": "COLOR SCHEME NAME"
```

<!-- This setting accepts the name of the color scheme. You can also create your own color scheme and place it inside the "schemes" list, then set the profile setting to the name of that new scheme to apply it. -->

此设置接受配色方案的名称，您也可以创建自己的配色方案并将其放置在 `"schemes"` 列表中，然后将配置文件设置为该新方案的名称。

### 字体

<!-- By default, Windows Terminal uses Cascadia Mono as its font face. The font face is a profile level setting. You can change your font face by setting "fontFace" to the name of the font you would like to use. -->

Windows Terminal 默认使用 Cascadia Mono 字体。字体是*配置文件（profile）*级别的设置，您可以通过将 `"fontFace"` 设置为想要使用的字体名称来更改字体。

```json
"fontFace": "FONT NAME"
```

💡 **提示：**Windows Terminal 也附带了 Cascadia Code 字体，其中包含编程连字（请参阅下面的 gif）。如果您使用的是 Powerline，Cascadia Code 也带有 PL 版本，可以从 [GitHub](https://github.com/microsoft/cascadia-code/releases) [^cascadia]下载。

[^cascadia]: <https://github.com/microsoft/cascadia-code/releases> Cascadia Code

<!-- 💡 提示: Windows Terminal also ships with the Cascadia Code font face, which includes programming ligatures (see gif below). If you are using Powerline, Cascadia Code also comes in a PL version which can be downloaded from [GitHub](https://github.com/microsoft/cascadia-code/releases).

 -->

![programming ligatures](/assets/images/202012/programming-ligatures.gif)

<br/>

> 作者 ： Kayla Cinnamon  
> 译者 ： 技术译民  
> 出品 ： [技术译站](https://ittranslator.cn/)  
> 链接 ： [英文原文](https://devblogs.microsoft.com/commandline/getting-started-with-windows-terminal/)
