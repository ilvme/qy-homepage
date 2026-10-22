---
title: "Tahoe 26 ↘️ Sonoma 14，我给吃灰许久的 MBA m2 丐版降了个级"
slug: "macos-jiang-ji"
date: "2026-10-11"
category: "工具链"
tags: ["折腾", "工具链"]
status: "published"
type: "article"
last_fetched_time: "2026-10-12T03:38:30.523Z"
last_edited_time: "2026-10-12T03:22:00.000Z"
page_id: "3f7c485e-f356-8027-9984-ebb5510d9b9d"
summary: "21 年买的 m2+8G+256G 丐版，真 hold 不住 macOS 26，我给它降级到 Sonoma 14，瞬间流畅，再战三年"
cover: ""
icon: ""
---



前段时间一次手贱，把 MacBook Air 给升级到最新的 macOS 26 了，21 年买的 m2 + 8G+256G 丐版，升级后明显感觉电脑操作迟钝。最近媳妇儿坚持不卖还说要用这电脑，我决定给它版本降下来。

经过一翻研究以及与豆包的一顿探讨，在 12、13、14、15 之中选择了 macOS Sonoma 14 版本。

## 制作 U 盘


在 APP Store 里搜索 macOS，选择 macOS Sonoma 14，进入后如下图

![Image](/notion-images/posts/macos-jiang-ji/image_3f7c485e-f356-8027-9d45-dfdd91d04f2e.webp)


点击获取，会自动跳转到设置里的软件更新页面下载（不要误解它在这个页面只是下载不会真的安装，要是能装就好了，直接降级了）。

等待安装完成，13G+，安装完成后应用程序了多了「安装 macOS Sonoma.app」。

![Image](/notion-images/posts/macos-jiang-ji/image_3f7c485e-f356-807e-bde0-c730ddbab283.webp)


准备 16G+ 的 U 盘，插入 Mac，改名为 MyVolume，后续要用到

打开终端，执行以下命令：

```bash
sudo /Applications/Install\ macOS\ Sonoma.app/Contents/Resources/createinstallmedia --volume /Volumes/MyVolume
```


等待执行完毕，此时 U 盘安装器就装好了，安装好后 U 盘名字就变成「Install macOS Sonoma」，如下图

![Image](/notion-images/posts/macos-jiang-ji/image_3f7c485e-f356-8098-a59d-eccda8741f13.webp)


此时可以退出终端，推出 U 盘，也可以从“应用程序”中删除安装器了。

## 执行安装


关机，插入 U 盘。

按住 Mac 上的电源按钮，直到 Mac 提示进入启动选项，其中会显示当前已安装的系统引导卷（Macintosh HD）、自己的 U 盘引导的安装器、设置三个选项。

可选步骤，进入设置里的磁盘管理，把当前系统引导卷的容器 disk0 啥的抹掉。

也可直接点击 U 盘的引导安装器，进入等待安装完成。

## 参考文档


- [创建可引导的 macOS 安装器](https://support.apple.com/zh-cn/101578)