---
title: "测试 md"
slug: "test-md-notion"
date: "2026-11-27"
category: "工具链"
tags: ["胡言乱语", "断舍离", "牛马生活", "旅行", "折腾", "日常", "雨", "青春", "诗", "简历", "相思"]
status: "published"
type: "article"
last_fetched_time: "2026-07-01T07:10:08.840Z"
last_edited_time: "2026-06-28T13:06:00.000Z"
page_id: "38cc485e-f356-80f5-a82b-c21e656e220a"
summary: "本篇文章仅供 md 测试，无实际意义。"
cover: ""
icon: ""
---



## 测试常用功能


### 有序列表


1. 苹果
1. 橘子
### 无序列表


- 大一
- 大二
### 任务列表


- [ ] 处理说说
- [x] 博客迁移
- [ ] 域名续期
### 其他


这是一段测试文字，主要测试行内代码  `/mute all` ， ~~删除~~ 线， **加粗** ， *斜体，* 下划线和带颜色的字体效果。还有高级的背景效果 。

此外，还得测试下链接，[百度一下](https://www.baidu.com/)。

---


## 测试折叠内容


<details>
<summary>
点击展开查看详细内容
</summary>

我是详细内容文字。

```java
 public class Out {
     void show() {
         System.out.println("调用 Out 类的 show() 方法");
     }
 }
 public class TestAnonymousInterClass {
     // 在这个方法中构造一个匿名内部类
     private void show() {
         Out anonyInter = new Out() {
             // 获取匿名内部类的实例
             void show() {
                 System.out.println("调用匿名类中的 show() 方法");
             }
         };
         anonyInter.show();
     }
     public static void main(String[] args) {
         TestAnonymousInterClass test = new TestAnonymousInterClass();
         test.show();
     }
 }
 
 // 调用匿名类中的 show() 方法
```

<br />

</details>


---


## 测试引用


> 这是一段引用文字：
> 
> 
> 春眠不觉晓，处处闻啼鸟。
> 夜来风雨声，花落知多少。


---


## 测试下高亮块


<Callout icon="💡" color="red_background">

好消息

恭喜，彩票中了一等奖！

</Callout>


<Callout icon="💡" color="green_background">

好消息

</Callout>


---


## 测试多列


<Columns cols={3}>
<Column>

 **`说说`** 

第一

emo

</Column>
<Column>

 **`博客`** 

年终总结

技术笔记

</Column>
<Column>

 **`分享内容`** 

看过的书

电视剧

</Column>
</Columns>


### 多列图片


<Columns cols={3}>
<Column>

![向](/notion-images/posts/test-md-notion/col_1782889807584_dteyuw.png)

<br />

</Column>
<Column>

![日](/notion-images/posts/test-md-notion/col_1782889807523_lbfp0d.png)

<br />

</Column>
<Column>

![Image](/notion-images/posts/test-md-notion/col_1782889807514_6gxt72.png)

<br />

</Column>
</Columns>


## 测试图片


![我就看看能不能显示标题](/notion-images/posts/test-md-notion/image_38cc485e-f356-80d8-9a5a-df8b0cd80a92.png)


---


## 测试选项卡（不支持）


## 测试表格


| 序号 | 水果名称 | 备注 |
| --- | --- | --- |
| 1 | 橡胶 | 啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊 **啊啊啊啊** |
| 2 | 苹果 | 啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊 |


## 测试代码


```javascript
// （一）最简便的方法，数组字面量。推荐
var arr = ['a', 'b', 'c'];  // 最后一个元素后最好不要加逗号，浏览器兼容性问题

// （二）使用 new Array()，不推荐，其行为不一致
let a = new Array() // 没有参数，创建空数组 []
let c = new Array(2)  // 一个参数时，如果是数值则表示新数组的长度，非数值即当作数组新元素
var cars = new Array("Saab", "Volvo", "BMW"); // 多个参数时，参数即为新数组元素
```


```html
<title>首页 - XXX 的官方网站</title>
<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">
<meta name="viewport" content="width=device-width, initial-scale=1">
```


```bash
# 解压 tar.gz 文件【到指定目录】
tar -zxvf demo.tar.gz [-C /home]

# 解压 tar.bz2 文件【到指定目录】
tar -jxvf demo.tar.bz2 [-C /home]

# 解压 zip 【到指定目录】
unzip [-d /home] demo.zip

# 解打包 tar 文件【到指定目录】
tar -xvf demo.tar [-C /home]

```


```java
 public class Out {
     void show() {
         System.out.println("调用 Out 类的 show() 方法");
     }
 }
 public class TestAnonymousInterClass {
     // 在这个方法中构造一个匿名内部类
     private void show() {
         Out anonyInter = new Out() {
             // 获取匿名内部类的实例
             void show() {
                 System.out.println("调用匿名类中的 show() 方法");
             }
         };
         anonyInter.show();
     }
     public static void main(String[] args) {
         TestAnonymousInterClass test = new TestAnonymousInterClass();
         test.show();
     }
 }
 
 // 调用匿名类中的 show() 方法
```

