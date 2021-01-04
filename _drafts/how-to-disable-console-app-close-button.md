---
layout: post
title:  "如何禁用控制台窗口的关闭按钮？"
date:   2021-01-05 00:10:00 +0800
categories: dotnet csharp
published: true
---

这是一段古老的代码，也是我以前经常用到的代码。虽然现在和以后基本上都不会再用到它了，但是在特定的场景中，它很好用。

## 使用场景

有时候，我们需要编写一个具有一定处理逻辑的控制台程序，这比编写 Windows 服务要简单一些。但是，我们要防止不小心点击到控制台窗口右上角的关闭按钮而导致程序非正常退出。于是就有了如这篇文章标题所述的一个简单的需求。

## 代码实现

查找 Windows 窗口和禁用 Windows 窗口的按钮，需要用到 Windows API `FindWindow` 、`GetSystemMenu` 和 `RemoveMenu`，具体的代码实现如下所示，可以将代码复制到控制台项目中直接运行：

```csharp
using System;
using System.Runtime.InteropServices;
using System.Threading;

namespace Demo
{
    class Program
    {
        static void Main(string[] args)
        {
            string title = $"程序 {DateTime.Now} 启动";
            //修改控制台窗口标题
            Console.Title = title;
            //禁用控制台窗口关闭按钮
            DisableCloseButton(title);

            //检测指定 title 的控制台窗口是否存在
            bool isExist = IsExistsConsole(title);

            Console.WriteLine($"isExist = {isExist}，窗口标题：{title}");

            Console.WriteLine("按回车键退出");

            Console.ReadLine();
        }

        #region 禁用控制台窗口关闭按钮
        [DllImport("user32.dll", EntryPoint = "FindWindow")]
        static extern IntPtr FindWindow(string lpClassName, string lpWindowName);

        [DllImport("user32.dll", EntryPoint = "GetSystemMenu")]
        static extern IntPtr GetSystemMenu(IntPtr hWnd, IntPtr bRevert);

        [DllImport("user32.dll", EntryPoint = "RemoveMenu")]
        static extern IntPtr RemoveMenu(IntPtr hMenu, uint uPosition, uint uFlags);

        ///<summary>
        /// 禁用控制台窗口关闭按钮
        ///</summary>
        ///<param name="title">窗口标题</param>
        public static void DisableCloseButton(string title)
        {
            //线程休眠，确保能够正常 FindWindow，否则有时会 Find 失败。
            Thread.Sleep(100);

            IntPtr windowHandle = FindWindow(null, title);
            IntPtr closeMenu = GetSystemMenu(windowHandle, IntPtr.Zero);
            const uint SC_CLOSE = 0xF060;
            RemoveMenu(closeMenu, SC_CLOSE, 0x0);
        }

        /// <summary>
        /// 检测指定 title 的控制台窗口是否存在
        /// </summary>
        /// <param name="title">windows 窗口标题</param>
        /// <returns></returns>
        public static bool IsExistsConsole(string title)
        {
            IntPtr windowHandle = FindWindow(null, title);
            if (windowHandle.Equals(IntPtr.Zero)) return false;

            return true;
        }
        #endregion
    }
}
```

它的运行结果如下：

![disable close button](/assets/images/202101/disable-close-button.png)

## 总结

如上所述，代码很简单，实现的功能也很简单。只是觉得以后基本上不会再用到它了，聊以记之，以防永久遗忘。

<br />

> 作者 ： 技术译民  
> 出品 ： [技术译站](https://ittranslator.cn/)
