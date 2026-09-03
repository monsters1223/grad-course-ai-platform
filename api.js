/* =========================================================
 * api.js —— 后端数据层（研究生通识课 AI 教育平台 · 学生端）
 *
 * 作用：把页面里的"本地存储"统一替换成"调用后端接口"。
 * 所有需要连后端的地方都走这里，UI（app.js）不直接写 fetch。
 *
 * 配置：后端地址 API_BASE。
 *   - 默认本地 docker 后端 http://localhost:8000（web 服务端口）。
 *   - 部署时可在 index.html 引入本文件之前加一句：
 *       <script>window.API_BASE = "https://你的后端地址";</script>
 *     来覆盖，无需改代码。
 *   - ⚠ 跨域（前端与后端不在同一网址）时，后端需开启 CORS 允许本前端来源。
 * ========================================================= */

// 后端基地址（可被 window.API_BASE 覆盖）
const API_BASE = (window.API_BASE || "http://localhost:8000").replace(/\/+$/, "");

// 登录令牌（JWT）存取：令牌不是业务数据，是登录凭证，必须本地留存才能保持登录态。
const TOKEN_KEY = "grad_token";
function getToken() { try { return localStorage.getItem(TOKEN_KEY); } catch (e) { return null; } }
function setToken(t) { try { localStorage.setItem(TOKEN_KEY, t); } catch (e) {} }
function clearToken() { try { localStorage.removeItem(TOKEN_KEY); } catch (e) {} }

// 统一请求封装：自动带 JWT、解析 JSON、统一抛错。
async function apiFetch(path, opts) {
  opts = opts || {};
  const headers = { "Content-Type": "application/json" };
  const tk = getToken();
  if (tk) headers["Authorization"] = "Bearer " + tk;
  let res;
  try {
    res = await fetch(API_BASE + path, {
      method: opts.method || "GET",
      headers: headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
  } catch (e) {
    throw new Error("网络异常，无法连接后端（" + (API_BASE) + "）");
  }
  let data = null;
  try { data = await res.json(); } catch (e) { /* 无 JSON 主体 */ }
  if (res.status === 401) {
    clearToken();
    if (typeof onUnauthorized === "function") onUnauthorized();
    throw new Error("登录已过期，请重新登录");
  }
  if (!res.ok) {
    const msg = (data && (data.detail || data.message)) || ("请求失败（" + res.status + "）");
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }
  return data;
}

// 接口集合（与后端 routers 一一对应）
const API = {
  // 鉴权
  login: (username, password) =>
    apiFetch("/api/auth/login", { method: "POST", body: { username, password } }),
  getMe: () => apiFetch("/api/auth/me"),

  // 课堂签到
  getSignins: () => apiFetch("/api/signin/me"),
  postSignin: (course_id, method) =>
    apiFetch("/api/signin", { method: "POST", body: { course_id, method } }),

  // 作业
  getHomeworks: (cid) => apiFetch("/api/courses/" + cid + "/homeworks"),
  submitHomework: (homework_id, answer) =>
    apiFetch("/api/homeworks/submit", { method: "POST", body: { homework_id, answer } }),

  // 课程讨论
  getDiscussions: (cid) => apiFetch("/api/courses/" + cid + "/discussions"),
  postDiscussion: (course_id, content) =>
    apiFetch("/api/discussions", { method: "POST", body: { course_id, content } }),

  // 班级群聊 WebSocket 地址（rid = 房间/课程 id；token 作为查询参数鉴权）
  chatWsUrl: (rid) => {
    const wsBase = API_BASE.replace(/^http/, "ws");
    return wsBase + "/ws/chat/" + rid + "?token=" + encodeURIComponent(getToken() || "");
  },

  // 学习小组（与后端 routers/groups.py 对应）
  getGroups: () => apiFetch("/api/groups"),
  joinGroup: (gid) => apiFetch("/api/groups/" + gid + "/join", { method: "POST" }),

  // 学情上报（阶段二：真实化，落到 study_logs / quiz_results）
  reportVideo: (course_id, section_index, section_title, progress, watch_seconds) =>
    apiFetch("/api/progress/video", { method: "POST", body: { course_id, section_index, section_title, progress, watch_seconds } }),
  reportQuiz: (course_id, quiz_index, quiz_title, score, total) =>
    apiFetch("/api/progress/quiz", { method: "POST", body: { course_id, quiz_index, quiz_title, score, total } }),

  // 学情看板（真实聚合，来自后端）
  getDashboard: () => apiFetch("/api/dashboard"),
};
