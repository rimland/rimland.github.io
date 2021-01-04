---
layout: post
title:  "如何禁用控制台窗口的关闭按钮？"
date:   2021-01-06 00:10:00 +0800
categories: dotnet csharp
published: true
---

这是一段古老的代码，也是我以前经常用到的代码。虽然现在和以后基本上都不会再用到它了，但是在特定的场景中，它很好用。

```csharp
using System;
using System.Runtime.InteropServices;
using System.Threading;

namespace ConsoleApp20
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
        ///<param name="consoleName">控制台名字</param>
        public static void DisableCloseButton(string title)
        {
            //线程睡眠，确保能够正常 FindWindow，否则有时会 Find 失败。
            Thread.Sleep(100);

            IntPtr windowHandle = FindWindow(null, title);
            IntPtr closeMenu = GetSystemMenu(windowHandle, IntPtr.Zero);
            uint SC_CLOSE = 0xF060;
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
