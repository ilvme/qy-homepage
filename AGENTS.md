# AGENTS.md

This file provides guidance to Qoder (qoder.com) when working with code in this repository.

## 项目文档

项目的完整文档见 **CLAUDE.md**（与本文件同目录，唯一权威来源）：包含常用命令、架构、内容管线、路由表、组件清单、设计系统、CI/CD、依赖注意事项。

**请始终以 CLAUDE.md 为准**，本文件不再重复维护内容，避免两处文档不同步。

## 一句话概述

个人主页/博客（"和光同尘"），基于 Next.js 16（App Router）、React 19、TypeScript 和 Tailwind CSS v4 构建。内容在 Notion 中编辑，通过脚本同步为本地 Markdown 文件（含 YAML frontmatter），MDX 通过 `@mdx-js/mdx` 的 `evaluate()` 在服务端渲染。部署在 Vercel。
