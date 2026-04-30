# frontendflow-pro

面向前端工程任务的 AI Agent 平台 MVP。当前版本提供基于 HTTP API 的异步任务执行、文件持久化、结构化日志和前端项目自动初始化/生成/修复能力。

## 项目定位

这个项目把一次性脚本式的 Agent 执行流程，扩展成了可以通过接口提交任务、跟踪状态、查询日志和读取结果的轻量平台。

当前工作流包含以下阶段：

1. `planning`：将用户需求拆解为前端开发步骤
2. `bootstrap`：初始化 Vite + React 项目
3. `coding`：按步骤生成代码文件
4. `testing`：执行构建验证
5. `fixing`：构建失败时进行自动修复
6. `finalizing`：收口结果并写入持久化数据

## 目录结构

```text
server/
  agents/         LLM 调用与各类 Agent
  core/           状态模型、工作流、任务运行器
  repositories/   任务和产物持久化
  routes/         HTTP 路由
  services/       任务服务层
  tools/          命令执行与文件写入
  utils/          路径安全工具
workspace/
  tasks/          任务状态、日志、产物元数据
  projects/       每个任务生成的前端项目
```

## 环境要求

- Node.js 18+
- npm
- 可用的 OpenAI API Key

## 快速开始

1. 安装依赖

```bash
npm install
```

2. 复制环境变量

```bash
copy .env.example .env
```

3. 设置 `OPENAI_API_KEY`

4. 启动服务

```bash
npm start
```

服务默认监听 `http://localhost:3000`。

## 环境变量

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `OPENAI_API_KEY` | 空 | OpenAI API Key |
| `MODEL` | `gpt-4o-mini` | LLM 模型名称 |
| `PORT` | `3000` | 服务端口 |
| `WORKSPACE` | `workspace` | 任务数据和生成项目根目录 |
| `MAX_RETRY` | `3` | 构建失败后的自动修复重试次数 |
| `COMMAND_TIMEOUT_MS` | `120000` | 命令执行超时时间 |

## API

### 健康检查

```http
GET /health
```

### 创建任务

```http
POST /tasks
Content-Type: application/json

{
  "prompt": "创建一个 React 页面，包含商品列表和详情弹窗"
}
```

示例响应：

```json
{
  "id": "task-id",
  "status": "queued",
  "createdAt": "2026-04-30T10:00:00.000Z"
}
```

### 查询任务状态

```http
GET /tasks/:id
```

### 查询任务日志

```http
GET /tasks/:id/logs
```

### 查询任务结果

```http
GET /tasks/:id/result
```

### 兼容入口

```http
POST /run
```

该接口仍会创建异步任务，但会返回废弃提示，建议迁移到 `POST /tasks`。

## 任务持久化

每个任务会在工作区写入以下文件：

- `workspace/tasks/<taskId>/task.json`
- `workspace/tasks/<taskId>/logs.jsonl`
- `workspace/tasks/<taskId>/artifacts.json`

任务生成的前端项目位于：

- `workspace/projects/<taskId>/`

## 测试

运行关键路径测试：

```bash
npm test
```

当前测试覆盖：

- 任务仓储读写
- 路径越界保护
- 工作流失败重试与修复逻辑

### **项目名称：FrontendFlow Agent - 前端工程化全流程 AI Agent 自治系统**

#### **1. 解决的核心痛点**

- **开发效率瓶颈**：前端开发者每日需处理大量重复性工作（如组件生成、样式适配、状态管理模板搭建），占用了 40% 以上的工作时间。
- **工程规范一致性差**：团队成员水平参差不齐，代码风格、组件设计规范难以统一，导致后期维护成本高。
- **自动化测试覆盖率低**：传统前端项目单元测试覆盖率普遍低于 70%，尤其在复杂交互和状态流转场景下，手工编写测试用例成本极高。
- **AI 工具割裂**：现有 Cursor、Copilot 等工具虽能辅助编码，但无法形成端到端的自动化流程，仍需人工串联。

#### **2. 核心逻辑流（多 Agent 协作）**

- **Designer Agent**：接收 Figma 设计稿链接或 UI 图片，利用 Figma2Code 能力（如文心快码的技术），解析图层结构、颜色、字体、间距等，生成语义化的 React/Vue 组件代码和对应的 Tailwind CSS 类名。
- **Architect Agent**：分析项目代码结构和 `package.json`，根据功能模块自动生成符合团队规范的目录结构、API 接口层、状态管理 (Zustand/Jotai) 模板和路由配置。
- **CodeGen Agent**：基于 Git Commit Message 或 Jira Issue 描述，理解开发意图，在指定位置生成业务逻辑代码、TypeScript 类型定义和 Mock 数据。
- **TestGen Agent**：深度集成 Vitest/Jest，分析新生成或修改的组件/函数逻辑，自动生成单元测试、快照测试，并特别针对 UI 交互（如点击、拖拽）生成 Playwright E2E 测试脚本。此 Agent 会利用覆盖率反馈循环，主动识别未覆盖的代码路径并补充针对性测试。
- **QA Agent**：执行所有自动化测试，收集覆盖率报告（目标：将整体测试覆盖率从平均 65% 提升至 90%+），分析测试结果，自动提交修复建议或直接创建 PR。
- **Deploy Agent**：确认测试通过后，自动执行构建 (`npm run build`)，并将产物推送到预发布环境（如 Vercel/Netlify），触发自动化部署流程。
