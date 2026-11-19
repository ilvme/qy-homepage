# AGENTS.md

This file provides guidance to AI coding tools (Qoder and others) when working with code in this repository.

## 项目文档

两份文件分工明确，不要在这里重复维护内容：

| 文件 | 面向 | 内容 |
|------|------|------|
| **CLAUDE.md** | AI 编码工具 | 命令、硬约定、已知陷阱——**动手前先读这个** |
| **README.md** | 人 | 项目介绍、站点结构、内容管线、开发与部署 |

设计取舍与「为什么这么做」就近写在代码注释里，改代码时顺手更新。

## 一句话概述

个人主页/博客（"林深时觉寒"），基于 Next.js 16（App Router）、React 19、TypeScript 和 Tailwind CSS v4 构建。内容在 Notion 中编辑，通过脚本同步为本地 Markdown 文件（含 YAML frontmatter），MDX 通过 `@mdx-js/mdx` 的 `evaluate()` 在服务端渲染。部署在 Vercel。
