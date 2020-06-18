---
layout: post
title:  "Docker 快速入门（二）- 构建并运行您的镜像"
date:   2020-06-20 02:09:00 +0800
categories: backend docker
published: false
---

## 前提条件

完成[第一部分](https://ittranslator.cn/backend/docker/2020/06/19/quickstart-1.html)的介绍和安装

## 介绍 Introduction

现在您已经安装了开发环境，可以开始开发容器化的应用程序了。一般来说，开发工作流是这样的：

1. 通过首先创建 Docker 镜像，为应用程序的每个组件创建和测试单独的容器。
2. 将容器和支持基础设施（supporting infrastructure）组装成一个完整的应用程序。
3. 测试、共享并部署完整的容器化应用程序。