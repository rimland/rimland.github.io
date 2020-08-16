---
layout: post
title:  "使用 Visual Studio 2019 批量添加代码文件头"
date:   2020-08-17 00:05:00 +0800
categories: dotnet vs2019
published: true
---

## 应用场景介绍

在我们使用一些开源项目时，基本上都会在每个源代码文件的头部看到一段版权声明。一个项目或解决方案中源代码文件的个数少则几十，多则几千甚至更多，那么怎么才能给这么多文件方便地批量添加或者修改一致的文件头呢？在 2020 年 8 月 11 日 更新的 *Visual Studio 2019* **v16.7.1** 版中，就加入了*使用 EditorConfig 向现有文件、项目和解决方案添加文件头* 这一功能。提到 *EditorConfig*， 那么：

## 什么是 EditorConfig？

`EditorConfig` 是帮助跨多个编辑器和 IDE 的从事同一项目的多个开发人员保持一致性编码风格的一个文本文件。EditorConfig 文件可以设置诸如缩进样式、选项卡宽度、行尾字符以及编码等，而无需考虑使用的编辑器或 IDE。向项目添加 EditorConfig 文件，可以强制对使用该项目的所有人员实施一致的编码风格。 EditorConfig 设置优先于全局 Visual Studio 文本编辑器设置。

由于这些设置包含在基本代码的文件中，因此能与基本代码一起移动。 只要在 EditorConfig 兼容的编辑器中打开代码文件，就能实现文本编辑器设置。 有关 EditorConfig 文件的详细信息，请参阅 [EditorConfig.org](https://editorconfig.org/) 网站。

## 使用 Visual Studio 2019 添加文件头

首先，在 Visual Studio 中打开项目或解决方案，点击“帮助” > “关于”，查看您的 Visual Studio 2019 版本是否是 `16.7.1` 或更高版本，如果不是请先升级。


1. 向项目或解决方案添加 EditorConfig。
   
   根据要应用 `.editorconfig` 设置的对象（是解决方案中的所有项目还是其中一个项目），选择项目或解决方案节点。 还可在项目或解决方案中选择一个文件夹，向其添加 `.editorconfig` 文件。

   从菜单栏中，选择“项目” > “添加新项”，或按 Ctrl+Shift+A ：

   ![vs_file_header_template_0](/assets/images/vs_file_header/vs_file_header_template_0.png)

   或者在“解决方案资源管理器”中右键单击项目、解决方案或文件夹，选择“添加” > “新建 EditorConfig”：

   ![vs_file_header_template_1](/assets/images/vs_file_header/vs_file_header_template_1.png)

   添加完成后可以看到 `.editorconfig` 文件的内容大致如下：

   ![vs_file_header_template_2](/assets/images/vs_file_header/vs_file_header_template_2.png)

2. 在  `.editorconfig` 文件中添加 `file_header_template` 项
   
   ```
   file_header_template = 添加文件头（add file header）示例程序\n Copyright (c) https://ittranslator.cn/
   ```

   > `.editorconfig` 中换行需要使用 Unix 换行符(`\n`)来插入新行。

   如图：

   ![vs_file_header_template_3](/assets/images/vs_file_header/vs_file_header_template_3.png)

3. 将光标置于任意 C# 或 Visual Basic 文件的第一行，按 `Ctrl+.` 触发“快速操作和重构”菜单，选择“添加文件头”，如图：
   
   ![vs_file_header_template_4](/assets/images/vs_file_header/vs_file_header_template_4.png)

   在“修复以下对象中的所有实例:”处可以选择 “文档”、“项目”或“解决方案”，下图是选择了“项目”后的预览效果：

   ![vs_file_header_template_5](/assets/images/vs_file_header/vs_file_header_template_5.png)

4. 点击“应用”按钮，以应用更改。
   
   此时可以看到项目中的所有代码文件都添加了 `.editorconfig` 中设置的 `file_header_template` 项的字符串作为文件头：

   ![vs_file_header_template_6](/assets/images/vs_file_header/vs_file_header_template_6.png)

### 修改文件头

修改文件头和添加文件头的步骤是一样的。

1. 在  `.editorconfig` 文件中修改 `file_header_template` 项的值
   
   添加“技术译站”几个文字试试：

   ```
   file_header_template = 添加文件头（add file header）示例程序\n Copyright (c) 技术译站 https://ittranslator.cn/ 
   ```
2. 重复上面“添加文件头”的第 3 步，预览如下图：
   
   ![vs_file_header_template_7](/assets/images/vs_file_header/vs_file_header_template_7.png)

3. 重复上面“添加文件头”的第 4 步，点击“应用”按钮，结果如下图：
   
   ![vs_file_header_template_8](/assets/images/vs_file_header/vs_file_header_template_8.png)

## 参考文献

- [https://docs.microsoft.com/zh-cn/visualstudio/ide/create-portable-custom-editor-options?view=vs-2019](https://docs.microsoft.com/zh-cn/visualstudio/ide/create-portable-custom-editor-options?view=vs-2019)
- [https://docs.microsoft.com/zh-cn/visualstudio/ide/reference/add-file-header?view=vs-2019](https://docs.microsoft.com/zh-cn/visualstudio/ide/reference/add-file-header?view=vs-2019)

<br/>

> 作者 ： 技术译民 <br/>
> 出品 ： [技术译站](https://ittranslator.cn/)
> 