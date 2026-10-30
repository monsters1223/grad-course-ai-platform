# 研究生通识课 AI 教育平台 · 前端

「研究生通识课 AI 教育平台」的前端代码（学生端 + 教师端），由后端同源托管，
**必须配合后端一起运行**：`https://github.com/monsters1223/grad-course-ai-platform-backend`。

## 目录说明

| 文件 | 作用 |
|---|---|
| `index.html` | 单页入口（登录 / 学生端 / 教师端共用同一页面，按角色路由） |
| `app.js` | 全部界面逻辑：课程中心、学习页、作业、测验、讨论、群聊、签到、学情、教师模块、通知中心 |
| `api.js` | 数据层：统一封装 `/api/*` 请求、JWT 注入、401 处理（界面不直接写 fetch） |
| `styles.css` | 全局样式 |
| `icons.js` | 内联 SVG 图标（Lucide 风格，无外部依赖） |
| `data.js` | 后端不可用时的兜底课程数据 |
| `assets/` | 示例课件（HTML 幻灯片） |

界面能力覆盖：课程学习（视频/资料/章节测验/作业）、师生互通通知中心、
课件在线预览（pptx/docx/xlsx/pdf 服务端渲染）、课程讨论、班级群聊、
学习小组、课堂签到、学情看板，以及教师端的课程/章节/名单/批改/学情/签到/公告管理。

## 运行方式

前端不单独起服务，由后端同源提供：

```bash
cd grad-course-ai-platform-backend/backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000
# 浏览器访问 http://<服务器IP>:8000
```

前端资源默认走同源相对路径（`API_BASE = ""`），因此不需要配置跨域。
若前后端分离部署，在 `index.html` 引入 `api.js` 之前加一句：

```html
<script>window.API_BASE = "https://你的后端地址";</script>
```

## 关于 GitHub Pages

> ⚠️ 本仓库早期的「纯静态演示版」（数据内嵌、localStorage 登录）已于 2026-10-30 下线。
> 当前代码依赖后端接口，直接部署到 GitHub Pages 无法登录，页面会给出访问提示。
> 如需对外演示，请通过校内服务器访问，或另外维护一个独立的演示分支。

## 更新前端后必做

`index.html` 中所有 `styles.css?v=` / `app.js?v=` 的版本号需要同步递增，
否则浏览器会继续使用缓存的旧脚本（曾因此出现"改了代码但页面没变化"的问题）。
