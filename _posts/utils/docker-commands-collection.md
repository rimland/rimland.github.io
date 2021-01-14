---
layout: post
title:  "Docker 常用命令集锦"
date:   2020-01-01 00:00:00 +0800
categories: utils
permalink: /docker-commands-collection
published: true
---

## Docker remove <none> TAG images

### Remove all docker images marked as "none" in Powershell

```powershell
docker rmi ((docker images | select-string "<none>" | ConvertFrom-String) | Select -ExpandProperty "P3")
```

> 参考 <https://gist.github.com/ngpestelos/4fc2e31e19f86b9cf10b>

<br />

> 作者 ： 技术译民 <br/>
> 出品 ： [技术译站](https://ittranslator.cn/)
