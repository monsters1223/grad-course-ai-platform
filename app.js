/* =========================================================
   研究生通识课 AI 教育平台 · 学生端（静态展示版 · 图标化重构）
   纯前端：登录用 localStorage，数据来自 data.js，无后端请求。
   ========================================================= */

const $ = (s) => document.querySelector(s);
const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const NF = (n) => Number(n);

let currentUser = null;

// 进度/学习时长按用户隔离：key 带上学号前缀。
// 新注册用户（新学号）在本地没有任何记录，因此进度天然为 0，开始学习后才累积。
function uKey(prefix, courseId) {
  const uid = (currentUser && currentUser.username) || "_guest";
  return prefix + "_" + uid + (courseId != null ? "_" + courseId : "");
}

let activeNav = "home";
let searchTerm = "";
let pages = {}; // SPA 页面缓存
let popHandling = false;
let aiChatOpen = false;

const STUDY_START = "2026-09-01";

/* ---------------- 图标初始化 ---------------- */
function initIcons(root) {
  (root || document).querySelectorAll("[data-icon]").forEach((node) => {
    node.innerHTML = icon(node.getAttribute("data-icon"));
  });
}

/* ---------------- 密码显示切换 ---------------- */
function togglePwd() {
  const inp = $("#li-pass");
  const eye = $("#eyeBtn");
  if (inp.type === "password") { inp.type = "text"; eye.innerHTML = icon("eye-off"); }
  else { inp.type = "password"; eye.innerHTML = icon("eye"); }
}

/* ---------------- toast ---------------- */
function toast(msg) {
  let t = $("#toast");
  if (!t) { t = el("div", "toast"); t.id = "toast"; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ---------------- localStorage 工具 ---------------- */
function lsGet(key, fallback) {
  try { const v = localStorage.getItem(key); return v == null ? fallback : JSON.parse(v); } catch (e) { return fallback; }
}
function lsSet(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }

function getAllUsers() {
  return USERS.concat(lsGet("reg_users", []));
}

/* ---------------- 登录 / 退出 ---------------- */
function doLogin() {
  const u = $("#li-user").value.trim();
  const p = $("#li-pass").value;
  const user = getAllUsers().find((x) => x.username === u);
  if (!user || !checkPass(u, p)) {
    showErr("账号或密码错误");
    return;
  }
  const prof = getProfile(u);
  currentUser = { username: user.username, name: prof.name || user.name || user.username, sid: user.studentId || user.username, major: prof.major || user.major || "—", specialty: prof.specialty || "", cls: prof.cls || "", contact: prof.contact || "", nickname: prof.nickname || prof.name || user.name || user.username };
  storeUser();
  showApp({ replace: true });
}
function showErr(m) {
  const e = $("#li-err");
  e.textContent = m;
  setTimeout(() => { if (e.textContent === m) e.textContent = ""; }, 3000);
}
function storeUser() { lsSet("static_user", currentUser); }

function showRegister() {
  $("#loginForm").style.display = "none";
  $("#regForm").style.display = "block";
  $("#li-err").textContent = "";
}
function showLogin() {
  $("#regForm").style.display = "none";
  $("#forgotForm").style.display = "none";
  $("#loginForm").style.display = "block";
  $("#reg-msg").textContent = "";
  $("#fg-msg").textContent = "";
}
function togglePwdReg() {
  const inp = $("#reg-pass");
  const eye = $("#eyeBtn2");
  if (inp.type === "password") { inp.type = "text"; eye.innerHTML = icon("eye-off"); }
  else { inp.type = "password"; eye.innerHTML = icon("eye"); }
}
function togglePwdReg2() {
  const inp = $("#reg-pass2");
  const eye = $("#eyeBtn3");
  if (inp.type === "password") { inp.type = "text"; eye.innerHTML = icon("eye-off"); }
  else { inp.type = "password"; eye.innerHTML = icon("eye"); }
}
function doRegister() {
  const sid = $("#reg-user").value.trim();
  const p1 = $("#reg-pass").value;
  const p2 = $("#reg-pass2").value;
  const msg = $("#reg-msg");
  if (!/^\d{8}$/.test(sid)) { msg.style.color = "var(--danger)"; msg.textContent = "学号必须为 8 位数字"; return; }
  if (p1.length < 6) { msg.style.color = "var(--danger)"; msg.textContent = "密码至少 6 位"; return; }
  if (p1 !== p2) { msg.style.color = "var(--danger)"; msg.textContent = "两次输入的密码不一致"; return; }
  if (getAllUsers().some((x) => x.username === sid)) { msg.style.color = "var(--danger)"; msg.textContent = "该学号已注册，请直接登录"; return; }
  const reg = lsGet("reg_users", []);
  reg.push({ username: sid, password: p1, name: sid, studentId: sid, major: "—" });
  lsSet("reg_users", reg);
  msg.style.color = "var(--ok, #16a34a)";
  msg.textContent = "✓ 注册成功，请点击下方返回登录";
}

function showForgot() {
  $("#loginForm").style.display = "none";
  $("#regForm").style.display = "none";
  $("#forgotForm").style.display = "block";
  $("#li-err").textContent = "";
  $("#fg-msg").textContent = "";
}
function togglePwdFg() {
  const inp = $("#fg-pass");
  const eye = $("#eyeBtn4");
  if (inp.type === "password") { inp.type = "text"; eye.innerHTML = icon("eye-off"); }
  else { inp.type = "password"; eye.innerHTML = icon("eye"); }
}
function togglePwdFg2() {
  const inp = $("#fg-pass2");
  const eye = $("#eyeBtn5");
  if (inp.type === "password") { inp.type = "text"; eye.innerHTML = icon("eye-off"); }
  else { inp.type = "password"; eye.innerHTML = icon("eye"); }
}
function doForgot() {
  const sid = $("#fg-user").value.trim();
  const p1 = $("#fg-pass").value;
  const p2 = $("#fg-pass2").value;
  const msg = $("#fg-msg");
  if (!/^\d{8}$/.test(sid)) { msg.style.color = "var(--danger)"; msg.textContent = "学号必须为 8 位数字"; return; }
  if (p1.length < 6) { msg.style.color = "var(--danger)"; msg.textContent = "密码至少 6 位"; return; }
  if (p1 !== p2) { msg.style.color = "var(--danger)"; msg.textContent = "两次输入的密码不一致"; return; }
  if (!getAllUsers().some((x) => x.username === sid)) { msg.style.color = "var(--danger)"; msg.textContent = "该学号尚未注册，请先注册"; return; }
  const reg = lsGet("reg_users", []);
  const i = reg.findIndex((x) => x.username === sid);
  if (i >= 0) { reg[i].password = p1; lsSet("reg_users", reg); }
  else {
    const ov = lsGet("pwd_override", {});
    ov[sid] = p1; lsSet("pwd_override", ov);
  }
  msg.style.color = "var(--ok, #16a34a)";
  msg.textContent = "✓ 密码已重置，请用新密码登录";
  setTimeout(showLogin, 900);
}

function logout() {
  localStorage.removeItem("static_user");
  currentUser = null;
  pages = {};
  activeNav = "home";
  searchTerm = "";
  $("#view").innerHTML = "";
  $("#topSearch").value = "";
  $("#li-user").value = "";
  $("#li-pass").value = "";
  $("#app").style.display = "none";
  $("#login").style.display = "flex";
  hideAIFAB();
}

function showApp(opts) {
  $("#login").style.display = "none";
  $("#app").style.display = "flex";
  applyAvatar();
  renderNav();
  showAIFAB();
  navigate("home", Object.assign({ replace: true }, opts || {}));
}

/* ---------------- 历史记录 / 浏览器返回 ---------------- */
function pushView(view, replace, data) {
  const state = Object.assign({ view: view }, data || {});
  const title = document.title;
  if (replace) history.replaceState(state, title, location.pathname);
  else history.pushState(state, title, location.pathname);
}

/* ---------------- 个人资料存储 ---------------- */
function getProfile(u) {
  const map = lsGet("profiles", {});
  return map[u] || {};
}
function setProfile(u, patch) {
  const map = lsGet("profiles", {});
  map[u] = Object.assign(map[u] || {}, patch);
  lsSet("profiles", map);
}
function checkPass(u, p) {
  const ov = lsGet("pwd_override", {});
  if (ov[u] != null) return ov[u] === p;
  const base = getAllUsers().find((x) => x.username === u);
  return base && base.password === p;
}
function applyAvatar() {
  const av = $("#topAvatar");
  if (!av || !currentUser) return;
  const prof = getProfile(currentUser.username);
  const text = (prof.avatarText && prof.avatarText.trim()) || currentUser.nickname || currentUser.name || currentUser.username;
  if (prof.avatarImg) {
    av.textContent = "";
    av.style.background = "center/cover no-repeat url(" + prof.avatarImg + ")";
  } else {
    av.textContent = text.slice(0, 8);
    av.style.background = prof.avatarColor || "linear-gradient(135deg,var(--accent),var(--primary))";
  }
}

/* ---------------- 头像菜单 ---------------- */
function toggleAvatarMenu() {
  $("#avatarMenu").classList.toggle("show");
}
function openProfile() {
  $("#avatarMenu").classList.remove("show");
  const m = $("#menuWho");
  m.innerHTML = '<div style="font-size:13px;color:var(--text-2)">学号 ' + currentUser.sid + '</div>' +
    '<div style="font-size:15px;color:var(--text);font-weight:800;margin-top:2px">' + esc(currentUser.nickname || currentUser.name) + '</div>';
  $("#profileMask").style.display = "flex";
  renderProfileTab("info");
}
function closeProfile() { $("#profileMask").style.display = "none"; }

function renderProfileTab(tab) {
  document.querySelectorAll("#profileTabs .tab").forEach((t) => t.classList.toggle("cur", t.getAttribute("data-tab") === tab));
  const body = $("#profileBody");
  const prof = getProfile(currentUser.username);
  if (tab === "info") {
    const infoBg = prof.avatarImg ? ("center/cover no-repeat url(" + prof.avatarImg + ")") : (prof.avatarColor || "linear-gradient( 135deg,var(--accent),var(--primary))");
    const infoText = prof.avatarImg ? "" : ((prof.avatarText || currentUser.name || currentUser.username).slice(0, 2));
    const nm = (currentUser.name && currentUser.name !== currentUser.sid) ? currentUser.name : "未填写";
    let html =
      '<div style="display:flex;align-items:center;gap:14px;padding:6px 4px 16px">' +
        '<div class="avatar lg" style="width:64px;height:64px;font-size:20px;background:' + infoBg + '">' + infoText + '</div>' +
        '<div><div style="font-size:17px;font-weight:800">' + esc(nm) + '</div>' +
        '<div style="font-size:12px;color:var(--text-2);margin-top:3px">学号 ' + currentUser.sid + '</div></div>' +
      '</div>' +
      '<div class="info-list">' +
        '<div class="info-row"><span class="info-label">姓名</span><span class="info-val">' + esc(nm) + '</span></div>' +
        '<div class="info-row"><span class="info-label">学号</span><span class="info-val">' + currentUser.sid + '</span></div>' +
        '<div class="info-row"><span class="info-label">学院</span><span class="info-val">' + (currentUser.major && currentUser.major !== "—" ? esc(currentUser.major) : "未填写") + '</span></div>' +
        '<div class="info-row"><span class="info-label">专业</span><span class="info-val">' + (currentUser.specialty ? esc(currentUser.specialty) : "未填写") + '</span></div>' +
        '<div class="info-row"><span class="info-label">班级</span><span class="info-val">' + (currentUser.cls ? esc(currentUser.cls) : "未填写") + '</span></div>' +
        '<div class="info-row"><span class="info-label">联系方式</span><span class="info-val">' + (currentUser.contact ? esc(currentUser.contact) : "未填写") + '</span></div>' +
      '</div>' +
      '<button class="btn ghost" style="margin-top:14px;width:100%" onclick="editInfo()">编辑资料</button>';
    body.innerHTML = html;
  } else if (tab === "nick") {
    body.innerHTML =
      '<div class="field"><label>当前昵称</label><div class="muted" style="padding:4px 0">' + esc(currentUser.nickname || currentUser.name) + '</div></div>' +
      '<div class="field"><label>新昵称</label><input id="nf-nick" placeholder="输入新的昵称" value="' + esc(currentUser.nickname || "") + '" /></div>' +
      '<button class="btn" style="margin-top:10px" onclick="saveNick()">保存昵称</button>' +
      '<p id="nick-msg" class="muted" style="min-height:16px;font-size:12px;margin-top:8px;color:var(--success)"></p>';
  } else if (tab === "avatar") {
    const colors = ["linear-gradient(135deg,#8AA9F0,#5E82D8)", "linear-gradient(135deg,#FFB49E,#FF8C7A)", "linear-gradient(135deg,#A99CF5,#7C6FD6)", "linear-gradient(135deg,#62CBA0,#3FA98A)", "linear-gradient(135deg,#F5C26B,#E0A23C)", "linear-gradient(135deg,#69B7E8,#4A93C9)"];
    const cur = prof.avatarImg || "";
    const prevBg = cur ? ("center/cover no-repeat url(" + cur + ")") : (prof.avatarColor || colors[0]);
    const prevText = cur ? "" : ((prof.avatarText || currentUser.nickname || currentUser.name || currentUser.username).slice(0, 2));
    let html = '<div style="text-align:center;padding:8px 0 14px"><div class="avatar lg" id="av-prev" style="width:72px;height:72px;font-size:22px;margin:0 auto;background:' + prevBg + '" data-img="' + cur + '">' + prevText + '</div></div>';
    html += '<div class="field"><label>上传头像图片（不超过 2MB）</label><input type="file" id="av-file" accept="image/*" onchange="uploadAvatar(this)" /></div>';
    html += '<div class="field"><label>头像文字（无图片时生效，最多 2 字）</label><input id="av-text" maxlength="2" placeholder="留空则用昵称" value="' + esc(prof.avatarText || "") + '" oninput="updAvPrev()" /></div>';
    html += '<div style="font-size:12px;color:var(--text-3);margin:6px 0 8px">选择底色（无图片时生效）</div><div class="swatches">';
    colors.forEach((c) => { html += '<span class="sw" style="background:' + c + '" onclick="pickColor(\'' + c + '\')"></span>'; });
    html += '</div>';
    if (cur) html += '<button class="btn ghost" style="margin-top:10px" onclick="removeAvatar()">移除图片，使用文字头像</button>';
    html += '<button class="btn" style="margin-top:14px" onclick="saveAvatar()">保存头像</button>';
    body.innerHTML = html;
  } else if (tab === "pwd") {
    body.innerHTML =
      '<div class="field"><label>当前密码</label><input id="pw-old" type="password" placeholder="请输入当前密码" /></div>' +
      '<div class="field"><label>新密码</label><input id="pw-new" type="password" placeholder="至少 6 位" /></div>' +
      '<div class="field"><label>确认新密码</label><input id="pw-new2" type="password" placeholder="再次输入新密码" /></div>' +
      '<button class="btn" style="margin-top:10px" onclick="savePwd()">修改密码</button>' +
      '<p id="pw-msg" class="muted" style="min-height:16px;font-size:12px;margin-top:8px;color:var(--danger)"></p>';
  }
}
function updAvPrev() {
  const t = $("#av-text").value.trim() || currentUser.nickname || currentUser.name || currentUser.username;
  const prev = $("#av-prev");
  if (!prev.getAttribute("data-img")) prev.textContent = t.slice(0, 2);
}
function pickColor(c) { $("#av-prev").style.background = c; $("#av-prev").setAttribute("data-c", c); }
function uploadAvatar(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) { toast("图片过大，请选择 2MB 以内的图片"); return; }
  const reader = new FileReader();
  reader.onload = function () {
    const url = reader.result;
    const prev = $("#av-prev");
    prev.style.background = "center/cover no-repeat url(" + url + ")";
    prev.setAttribute("data-img", url);
    prev.textContent = "";
  };
  reader.readAsDataURL(file);
}
function removeAvatar() {
  const prev = $("#av-prev");
  const prof = getProfile(currentUser.username);
  prev.setAttribute("data-img", "");
  prev.style.background = prof.avatarColor || "linear-gradient(135deg,#8AA9F0,#5E82D8)";
  prev.textContent = (prof.avatarText || currentUser.nickname || currentUser.name || currentUser.username).slice(0, 2);
}
function saveNick() {
  const v = $("#nf-nick").value.trim();
  if (!v) { $("#nick-msg").style.color = "var(--danger)"; $("#nick-msg").textContent = "昵称不能为空"; return; }
  setProfile(currentUser.username, { avatarText: "", nickname: v });
  currentUser.nickname = v;
  applyAvatar();
  $("#nick-msg").textContent = "✓ 昵称已更新";
  setTimeout(() => { $("#nick-msg").textContent = ""; }, 1500);
}
function saveAvatar() {
  const img = $("#av-prev").getAttribute("data-img") || "";
  const c = $("#av-prev").getAttribute("data-c") || getProfile(currentUser.username).avatarColor || "linear-gradient(135deg,#8AA9F0,#5E82D8)";
  const t = $("#av-text").value.trim();
  setProfile(currentUser.username, { avatarColor: c, avatarText: t, avatarImg: img });
  applyAvatar();
  toast("✓ 头像已更新");
  renderProfileTab("info");
}
function editInfo() {
  const body = $("#profileBody");
  body.innerHTML =
    '<div class="field"><label>姓名</label><input id="inf-name" value="' + esc(currentUser.name || "") + '" placeholder="请输入姓名" /></div>' +
    '<div class="field"><label>学号</label><input value="' + currentUser.sid + '" disabled style="opacity:.7" /></div>' +
    '<div class="field"><label>学院</label><input id="inf-major" value="' + esc(currentUser.major && currentUser.major !== "—" ? currentUser.major : "") + '" placeholder="如 计算机学院" /></div>' +
    '<div class="field"><label>专业</label><input id="inf-spec" value="' + esc(currentUser.specialty || "") + '" placeholder="如 计算机科学与技术" /></div>' +
    '<div class="field"><label>班级</label><input id="inf-class" value="' + esc(currentUser.cls || "") + '" placeholder="如 计科2301班" /></div>' +
    '<div class="field"><label>联系方式</label><input id="inf-contact" value="' + esc(currentUser.contact || "") + '" placeholder="手机或邮箱" /></div>' +
    '<div style="display:flex;gap:10px;margin-top:14px">' +
      '<button class="btn" onclick="saveInfo()">保存</button>' +
      '<button class="btn ghost" onclick="renderProfileTab(\'info\')">取消</button>' +
    '</div>';
}
function saveInfo() {
  const name = $("#inf-name").value.trim();
  const major = $("#inf-major").value.trim();
  const spec = $("#inf-spec").value.trim();
  const cls = $("#inf-class").value.trim();
  const contact = $("#inf-contact").value.trim();
  if (!name) { toast("姓名不能为空"); return; }
  currentUser.name = name;
  currentUser.major = major || "—";
  currentUser.specialty = spec;
  currentUser.cls = cls;
  currentUser.contact = contact;
  setProfile(currentUser.username, { name: name, major: currentUser.major, specialty: spec, cls: cls, contact: contact });
  applyAvatar();
  toast("✓ 资料已更新");
  renderProfileTab("info");
}
function savePwd() {
  const oldP = $("#pw-old").value, newP = $("#pw-new").value, newP2 = $("#pw-new2").value;
  const msg = $("#pw-msg");
  if (!checkPass(currentUser.username, oldP)) { msg.textContent = "当前密码错误"; return; }
  if (newP.length < 6) { msg.textContent = "新密码至少 6 位"; return; }
  if (newP !== newP2) { msg.textContent = "两次输入的新密码不一致"; return; }
  const reg = lsGet("reg_users", []);
  const i = reg.findIndex((x) => x.username === currentUser.username);
  if (i >= 0) { reg[i].password = newP; lsSet("reg_users", reg); }
  else { const ov = lsGet("pwd_override", {}); ov[currentUser.username] = newP; lsSet("pwd_override", ov); }
  msg.style.color = "var(--success)"; msg.textContent = "✓ 密码已修改";
  $("#pw-old").value = ""; $("#pw-new").value = ""; $("#pw-new2").value = "";
}

/* ---------------- 顶部通知 ---------------- */
const NOTIFS = [
  { ic: "clipboard", title: "新作业发布", desc: "《学术写作与规范》第三次随笔", time: "10 分钟前", to: "learn:1" },
  { ic: "map-pin", title: "课堂签到提醒", desc: "数据科学导论 第 5 讲 10:00 开始", time: "1 小时前", to: "signin" },
  { ic: "message", title: "教师回复了你", desc: "王怀安：方差与标准差的区别已补充", time: "昨天", to: "learn:1" },
];

function renderNotif() {
  const box = $("#notifyPanel");
  box.innerHTML = '<div class="nt-head"><span>通知</span><span class="muted">共 ' + NOTIFS.length + ' 条</span></div>';
  if (!NOTIFS.length) { box.innerHTML += '<div class="nt-empty">暂无通知</div>'; return; }
  NOTIFS.forEach((n) => {
    const item = el("div", "nt-item");
    const icBox = el("div", "nt-ic"); icBox.innerHTML = icon(n.ic, 18);
    const body = el("div"); body.style.flex = "1";
    body.innerHTML = '<div style="font-weight:700">' + esc(n.title) + '</div><div class="nt-body">' + esc(n.desc) + '</div>';
    const t = el("div", "muted"); t.style.fontSize = "11px"; t.style.whiteSpace = "nowrap"; t.textContent = n.time;
    item.appendChild(icBox); item.appendChild(body); item.appendChild(t);
    item.onclick = () => { box.classList.remove("show"); const [k, cid] = n.to.split(":"); navigate(k); if (cid) openCourse(+cid, true); };
    box.appendChild(item);
  });
}

/* ---------------- 导航 ---------------- */
const NAV = [
  { key: "home", ic: "book-open", label: "课程中心" },
  { key: "aichat", ic: "bot", label: "AI 课堂" },
  { key: "dashboard", ic: "bar-chart", label: "学情看板" },
  { key: "signin", ic: "check-circle", label: "课堂签到" },
];

function renderNav() {
  const nav = $("#nav");
  nav.innerHTML = "";
  NAV.forEach((n) => {
    const item = el("div", "nav-item" + (n.key === activeNav ? " active" : ""));
    const ic = el("span", "ic"); ic.innerHTML = icon(n.ic, 18);
    item.appendChild(ic);
    item.appendChild(el("span", null, n.label));
    item.onclick = () => navigate(n.key);
    nav.appendChild(item);
  });
}

function navigate(key, opts) {
  opts = opts || {};
  activeNav = key;
  renderNav();
  hideCrumb();
  if (!opts.noPush && !popHandling) pushView(key, opts.replace);
  const v = $("#view");
  const content = $(".content");
  v.querySelectorAll(".page").forEach((p) => p.style.display = "none");
  if (!pages[key]) {
    const page = el("div", "page");
    page.id = "page-" + key;
    v.appendChild(page);
    pages[key] = page;
    if (key === "home") renderHome(page);
    else if (key === "aichat") renderAIChat(page);
    else if (key === "dashboard") renderDashboard(page);
    else if (key === "signin") renderSignin(page);
  }
  pages[key].style.display = "block";
  if (key === "learn") content.classList.add("learn-active");
  else content.classList.remove("learn-active");
}

/* ---------------- 面包屑 ---------------- */
function showCrumb(parts) {
  const v = $("#view");
  let cr = $("#crumb");
  if (!cr) { cr = el("div", "crumb"); cr.id = "crumb"; v.parentNode.insertBefore(cr, v); }
  cr.className = "crumb show";
  cr.innerHTML = "";
  parts.forEach((p, i) => {
    if (i > 0) cr.appendChild(Object.assign(el("span", "sep"), { textContent: "/" }));
    const item = el("span", "c-item" + (i === parts.length - 1 ? " cur" : ""), p.label);
    if (p.onclick) item.onclick = p.onclick;
    cr.appendChild(item);
  });
}
function hideCrumb() { const c = $("#crumb"); if (c) c.className = "crumb"; }

/* ---------------- 课程中心（含搜索过滤） ---------------- */
function highlight(text, term) {
  if (!term) return esc(text);
  const t = term.toLowerCase();
  const idx = text.toLowerCase().indexOf(t);
  if (idx < 0) return esc(text);
  return esc(text.slice(0, idx)) + '<mark>' + esc(text.slice(idx, idx + term.length)) + '</mark>' + esc(text.slice(idx + term.length));
}

function renderHome(v) {
  v.innerHTML = "";
  v.appendChild(el("div", "h-title", "课程中心"));
  v.appendChild(el("p", "h-sub", currentUser.name + "，" + currentUser.major + " · 这里有你的通识课程"));

  const grid = el("div", "course-grid");
  v.appendChild(grid);

  const s = (searchTerm || "").trim().toLowerCase();
  const list = COURSES.filter((c) => {
    if (!s) return true;
    return (c.title + " " + (c.desc || "")).toLowerCase().includes(s);
  });

  if (!list.length) {
    grid.innerHTML = '<div class="card" style="grid-column:1/-1;text-align:center;padding:48px;color:var(--text-3)">未找到与「' + esc(searchTerm) + '」相关的课程</div>';
    return;
  }
  list.forEach((c) => {
    const card = el("div", "course-card");
    const cover = el("div", "course-cover", c.coverText);
    cover.style.background = c.coverColor;
    const body = el("div", "course-body");
    const h4 = el("h4");
    h4.innerHTML = highlight(c.title, searchTerm);
    body.appendChild(h4);
    body.appendChild(el("div", "course-meta", c.category + " · " + c.teacher));
    const prog = el("div", "progress");
    const span = el("span");
    const pct = NF(localStorage.getItem(uKey("progress", c.id))) || 0;
    span.style.width = pct + "%";
    prog.appendChild(span);
    body.appendChild(prog);
    card.appendChild(cover);
    card.appendChild(body);
    card.onclick = () => openCourse(c.id);
    grid.appendChild(card);
  });
}

$("#topSearch").addEventListener("input", (e) => {
  searchTerm = e.target.value.trim();
  if (activeNav === "home" && pages.home) renderHome(pages.home);
});

/* ---------------- 学习页 ---------------- */
function openCourse(id, skipNav) {
  const c = COURSES.find((x) => x.id === id);
  if (!c) return;
  activeNav = "learn";
  renderNav();
  showCrumb([
    { label: "课程中心", onclick: () => navigate("home") },
    { label: c.title },
  ]);
  const v = $("#view");
  v.querySelectorAll(".page").forEach((p) => p.style.display = "none");
  if (!pages.learn) {
    const page = el("div", "page");
    page.id = "page-learn";
    v.appendChild(page);
    pages.learn = page;
  }
  pages.learn.style.display = "block";
  pages.learn.innerHTML = "";
  renderLearn(pages.learn, c);
  $(".content").classList.add("learn-active");
  if (!skipNav) pushView("learn", false, { courseId: id });
}

function renderLearn(v, c) {
  v.innerHTML = "";
  const saved = NF(localStorage.getItem(uKey("progress", c.id))) || 0;

  const header = el("div", "learn-header");
  const backBtn = el("button", "btn sm ghost learn-back-btn");
  backBtn.innerHTML = icon("arrow-left", 14) + " 返回课程";
  backBtn.onclick = () => navigate("home");
  header.appendChild(backBtn);
  const titleWrap = el("div");
  titleWrap.appendChild(el("h1", "h-title", c.title));
  titleWrap.appendChild(el("p", "h-sub", c.category + " · " + c.teacher + " · 进度 " + saved + "%"));
  header.appendChild(titleWrap);
  v.appendChild(header);

  if (!c.sections || c.sections.length === 0) {
    const empty = el("div", "card");
    empty.style.textAlign = "center"; empty.style.padding = "64px 20px"; empty.style.color = "var(--text-3)";
    empty.innerHTML = '<div style="font-size:46px;opacity:.6">📭</div>' +
      '<div style="font-size:18px;margin-top:14px;color:var(--text-2);font-weight:800;font-family:var(--font-serif)">老师暂未上传数据</div>' +
      '<div style="margin-top:8px">本课程的内容正在准备中，请稍后再来查看～</div>';
    v.appendChild(empty);
    return;
  }

  const learn = el("div", "learn");
  const chapter = el("div", "chapter");
  const panel = el("div", "card");

  const videos = c.sections.filter((s) => s.stype === "video");
  const docs = c.sections.filter((s) => s.stype === "doc");
  const quizzes = c.sections.filter((s) => s.stype === "quiz");

  const player = el("div", "player-wrap");
  player.style.cssText = "border-radius:var(--radius);overflow:hidden;box-shadow:var(--shadow);background:#000;position:relative;min-height:320px";
  let currentVideo = videos[0] || null;

  function buildVideoPoster(s) {
    player.innerHTML = "";
    const poster = el("div", "video-poster");
    const hasVideo = s && s.content;
    poster.style.cssText = "position:absolute;inset:0;background:" + (hasVideo ? "linear-gradient(160deg,#3A3550,#574E7A)" : "linear-gradient(160deg,#5A5A6A,#7A7A8A)") + ";display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;" + (hasVideo ? "cursor:pointer;" : "cursor:default;") + "z-index:2";
    if (hasVideo) {
      poster.innerHTML =
        '<div class="video-poster-play">' + icon("video", 36) + '</div>' +
        '<div style="margin-top:14px;font-size:16px;font-weight:700">' + esc(s.title) + '</div>' +
        '<div style="margin-top:6px;font-size:12px;opacity:.75">点击开始播放</div>';
      poster.onclick = () => startVideo(s);
    } else {
      poster.innerHTML =
        '<div style="font-size:40px;opacity:.6">📭</div>' +
        '<div style="margin-top:14px;font-size:16px;font-weight:700">教师未上传视频</div>' +
        '<div style="margin-top:6px;font-size:12px;opacity:.75">可以先看下方推荐视频</div>';
    }
    player.appendChild(poster);
  }

  function startVideo(s) {
    if (!s) return;
    currentVideo = s;
    player.innerHTML = "";
    const video = document.createElement("video");
    video.controls = true;
    video.style.cssText = "width:100%;display:block;max-height:420px;background:#000";
    video.src = s.content;
    video.addEventListener("timeupdate", () => {
      if (!video.duration) return;
      const ratio = Math.min(100, Math.round((video.currentTime / video.duration) * 100));
      const key = uKey("progress", c.id);
      const prev = NF(localStorage.getItem(key)) || 0;
      if (ratio > prev) { localStorage.setItem(key, ratio); refreshProgressLabel(c, ratio); }
      // 累计学习时长（每播放满 60 秒记 1 分钟），按用户隔离
      const tickKey = uKey("studyTick", c.id);
      const lastTick = NF(localStorage.getItem(tickKey)) || 0;
      if (video.currentTime - lastTick >= 60) {
        const studyKey = uKey("studyMin", c.id);
        localStorage.setItem(studyKey, (NF(localStorage.getItem(studyKey)) || 0) + 1);
        localStorage.setItem(tickKey, video.currentTime);
        // 写入「今日学习分钟」，用于学情看板「本周学习时长」
        const dlog = lsGet(uKey("studyDaily"), {}) || {};
        const today = new Date().toISOString().slice(0, 10);
        dlog[today] = (dlog[today] || 0) + 1;
        lsSet(uKey("studyDaily"), dlog);
      }
    });
    player.appendChild(video);
    video.play().catch(() => {});
  }

  buildVideoPoster(currentVideo);

  const tabs = el("div", "learn-tabs");
  const tabDefs = [
    { key: "video", label: "视频", show: videos.length },
    { key: "doc", label: "资料", show: docs.length },
    { key: "quiz", label: "章节测验", show: quizzes.length },
    { key: "discussion", label: "课程讨论", show: true },
  ];
  let curTab = "video";

  function buildRecs(recs, key) {
    const box = el("div", "video-recs");
    if (!recs || !recs.length) return box;
    const ckey = "rec_collapsed_" + (key || c.id);
    const collapsed = lsGet(ckey, true);
    if (collapsed) box.classList.add("collapsed");

    const head = el("div", "rec-head");
    const title = el("div", "rec-title", "本章节推荐视频");
    const toggle = el("button", "rec-toggle", collapsed ? "展开 ▼" : "收起 ▲");
    toggle.title = "折叠/展开推荐视频";
    toggle.onclick = (e) => {
      e.stopPropagation();
      const now = box.classList.toggle("collapsed");
      toggle.textContent = now ? "展开 ▼" : "收起 ▲";
      lsSet(ckey, now);
    };
    head.appendChild(title);
    head.appendChild(toggle);
    box.appendChild(head);

    const body = el("div", "rec-body");
    const ul = el("div", "rec-list");
    recs.forEach((r) => {
      const a = el("a", "rec-item");
      a.href = r.url; a.target = "_blank";
      a.innerHTML = '<span class="ic" data-icon="video"> </span><span>' + esc(r.title) + '</span><span class="rec-src">' + esc(r.source) + '</span>';
      ul.appendChild(a);
    });
    body.appendChild(ul);
    box.appendChild(body);
    return box;
  }

  let recBox = null;
  function renderTab() {
    panel.innerHTML = "";
    if (curTab === "video") {
      panel.appendChild(player);
      // 视频推荐链接（随当前章节变化）
      recBox = buildRecs((videos[0] && videos[0].recs) || VIDEO_LINKS[c.id], currentVideo ? currentVideo.title : c.id);
      panel.appendChild(recBox);
      const note = el("p", "muted");
      note.style.cssText = "font-size:12px;margin-top:12px";
      note.textContent = "提示：当前为演示视频，后续将接入课程实录与名师讲解。";
      panel.appendChild(note);
      chapter.innerHTML = '<div class="ch">章节列表</div>';
      if (videos.length === 0) chapter.appendChild(el("div", "item", "暂无视频"));
      videos.forEach((s, i) => {
        const it = el("div", "item" + (i === 0 ? " active" : ""), s.title);
        it.onclick = () => {
          currentVideo = s;
          buildVideoPoster(s);
          [...chapter.querySelectorAll(".item")].forEach((x) => x.classList.remove("active"));
          it.classList.add("active");
          if (recBox) {
            const next = buildRecs(s.recs || VIDEO_LINKS[c.id], s.title);
            recBox.parentNode.replaceChild(next, recBox);
            recBox = next;
          }
        };
        chapter.appendChild(it);
      });
    } else if (curTab === "doc") {
      panel.appendChild(el("h3", null, "课程资料"));
      const list = el("div", "card");
      list.style.cssText = "box-shadow:none;border:1px solid var(--border);margin-top:10px";
      if (docs.length === 0) list.appendChild(el("div", "muted", "暂无资料"));
      docs.forEach((s) => {
        const row = el("div", "doc-row");
        const info = el("div", "doc-info");
        info.innerHTML = '<div class="li-ic" data-icon="file-text"> </div><div class="li-body"><h4>' + esc(s.title) + '</h4><p>课件 / 讲义</p></div>';
        const actions = el("div", "doc-actions");
        const viewBtn = el("a", "btn sm");
        viewBtn.href = s.content; viewBtn.target = "_blank";
        viewBtn.textContent = "在线预览";
        const dlBtn = el("a", "btn sm ghost");
        dlBtn.href = s.content; dlBtn.download = s.title + ".html";
        dlBtn.textContent = "下载";
        actions.appendChild(viewBtn); actions.appendChild(dlBtn);
        row.appendChild(info); row.appendChild(actions);
        initIcons(row);
        list.appendChild(row);
      });
      panel.appendChild(list);
      chapter.innerHTML = '<div class="ch">资料列表</div><div class="item active">' + docs.length + " 份资料</div>";
    } else if (curTab === "quiz") {
      renderQuizPanel(panel, c);
      chapter.innerHTML = '<div class="ch">测验列表</div><div class="item active">' + quizzes.length + " 份测验</div>";
    } else {
      renderDiscussion(panel, c);
      chapter.innerHTML = '<div class="ch">讨论区</div><div class="item active">课程讨论</div>';
    }
  }

  tabs.innerHTML = "";
  tabDefs.forEach((t) => {
    if (!t.show) return;
    const b = el("button", curTab === t.key ? "active" : "", t.label);
    b.onclick = () => { curTab = t.key; [...tabs.children].forEach((x) => x.classList.remove("active")); b.classList.add("active"); renderTab(); };
    tabs.appendChild(b);
  });
  v.appendChild(tabs);

  learn.appendChild(chapter);
  learn.appendChild(panel);
  v.appendChild(learn);
  renderTab();
}

function refreshProgressLabel(c, ratio) {
  const sub = $("#page-learn").querySelector(".h-sub");
  if (sub) sub.textContent = c.category + " · " + c.teacher + " · 进度 " + ratio + "%";
}

/* ---------------- 章节测验（可交互） ---------------- */
function quizKey(c, qIdx) { return "quiz_" + c.id + "_" + qIdx; }

function renderQuizPanel(panel, c) {
  panel.innerHTML = "";
  panel.appendChild(el("h3", null, "章节测验"));
  const quizzes = c.sections.filter((s) => s.stype === "quiz");
  if (!quizzes.length) {
    panel.appendChild(el("div", "muted", "暂无测验"));
    return;
  }
  quizzes.forEach((quiz, qIdx) => {
    const wrap = el("div", "quiz-card");
    const head = el("div", "quiz-head", quiz.title);
    wrap.appendChild(head);
    const stored = lsGet(quizKey(c, qIdx), null);

    if (stored && stored.submitted) {
      const pct = Math.round((stored.score / quiz.questions.length) * 100);
      const summary = el("div", "quiz-summary");
      const circle = el("div", "quiz-score-circle");
      circle.style.background = "conic-gradient(var(--success) 0 " + pct + "%, var(--bg-2) " + pct + "% 100%)";
      circle.innerHTML = "<span>" + pct + "%</span>";
      const info = el("div", "quiz-score-info");
      info.innerHTML =
        '<div class="quiz-score-num">得分 ' + stored.score + ' / ' + quiz.questions.length + '</div>' +
        '<div class="quiz-score-time">' + (stored.at ? "提交于 " + stored.at.slice(0, 10) + " " + stored.at.slice(11, 16) : "已提交") + '</div>';
      summary.appendChild(circle);
      summary.appendChild(info);
      wrap.appendChild(summary);

      const hint = el("div", "quiz-hint");
      hint.textContent = "这是你的上次作答记录，题目答案默认隐藏，可点击查看解析。";
      wrap.appendChild(hint);

      const actions = el("div", "quiz-actions");
      const viewBtn = el("button", "btn sm", "查看解析");
      const resetBtn = el("button", "btn sm ghost", "重新测验");
      actions.appendChild(viewBtn);
      actions.appendChild(resetBtn);
      wrap.appendChild(actions);

      viewBtn.onclick = () => renderQuizReview(wrap, quiz, stored, c, qIdx, panel);
      resetBtn.onclick = () => {
        if (!confirm("重新测验将清空本次作答记录，确定吗？")) return;
        lsSet(quizKey(c, qIdx), null);
        renderQuizPanel(panel, c);
      };

      panel.appendChild(wrap);
      return;
    }

    const form = el("div", "quiz-form");
    quiz.questions.forEach((q, i) => {
      const qbox = el("div", "quiz-q");
      qbox.innerHTML = '<div class="quiz-qq"><span class="quiz-no">Q' + (i + 1) + '</span>' + esc(q.q) + '</div>';
      const opts = el("div", "quiz-opts");
      q.options.forEach((opt, j) => {
        const lab = el("label", "quiz-opt");
        lab.innerHTML = '<input type="radio" name="q_' + c.id + '_' + qIdx + '_' + i + '" value="' + j + '"><span>' + esc(opt) + '</span>';
        opts.appendChild(lab);
      });
      qbox.appendChild(opts);
      form.appendChild(qbox);
    });
    const submit = el("button", "btn", "提交测验");
    submit.onclick = () => {
      let score = 0;
      const answers = [];
      quiz.questions.forEach((q, i) => {
        const sel = form.querySelector('input[name="q_' + c.id + '_' + qIdx + '_' + i + '"]:checked');
        const val = sel ? Number(sel.value) : -1;
        answers.push(val);
        if (val === q.answer) score++;
      });
      lsSet(quizKey(c, qIdx), { submitted: true, score: score, total: quiz.questions.length, answers: answers, at: new Date().toISOString() });
      renderQuizPanel(panel, c);
      toast("测验已提交，得分 " + score + "/" + quiz.questions.length);
    };
    form.appendChild(submit);
    wrap.appendChild(form);
    panel.appendChild(wrap);
  });
}

function renderQuizReview(wrap, quiz, stored, c, qIdx, panel) {
  wrap.innerHTML = '<div class="quiz-head">' + esc(quiz.title) + ' · 解析</div>';
  quiz.questions.forEach((q, i) => {
    const userAns = (stored.answers && stored.answers[i] != null) ? stored.answers[i] : -1;
    const isCorrect = userAns === q.answer;
    const qbox = el("div", "quiz-q quiz-review" + (isCorrect ? " correct" : " wrong"));
    qbox.innerHTML =
      '<div class="quiz-qq"><span class="quiz-no">Q' + (i + 1) + '</span>' + esc(q.q) + '</div>' +
      '<div class="quiz-status">' + (isCorrect ? "✓ 回答正确" : (userAns < 0 ? "✗ 未作答" : "✗ 回答错误")) + '</div>';
    const opts = el("div", "quiz-opts");
    q.options.forEach((opt, j) => {
      const row = el("div", "quiz-opt-row");
      if (j === q.answer) row.classList.add("right");
      if (j === userAns && j !== q.answer) row.classList.add("picked-wrong");
      row.innerHTML = '<span class="quiz-opt-letter">' + String.fromCharCode(65 + j) + '</span><span>' + esc(opt) + '</span>';
      opts.appendChild(row);
    });
    qbox.appendChild(opts);
    if (q.explanation) {
      const exp = el("div", "quiz-exp");
      exp.innerHTML = '<b>解析：</b>' + esc(q.explanation);
      qbox.appendChild(exp);
    }
    wrap.appendChild(qbox);
  });
  const back = el("button", "btn sm ghost", "返回概览");
  back.style.marginTop = "10px";
  back.onclick = () => renderQuizPanel(panel, c);
  wrap.appendChild(back);
}

/* ---------------- 课程讨论 / 悬浮 AI：固定话术回复（无后端、不接大模型） ---------------- */

// AI 助教回复：基于关键词匹配 data.js 中的预设话术，不调用任何外部接口、不跳转、不转圈。
// 后续接入真实模型 / 后端时，只需把本函数内部替换为接口调用即可（保持返回 { text } 结构）。
function getAIReply(question, courseTitle) {
  const q = (question || "").toLowerCase();
  for (const item of AI_REPLIES) {
    if (item.keys.some((k) => q.indexOf(k.toLowerCase()) !== -1)) {
      return { text: item.answer };
    }
  }
  return { text: AI_FALLBACK };
}

function nowHM() {
  const ts = new Date();
  return String(ts.getHours()).padStart(2, "0") + ":" + String(ts.getMinutes()).padStart(2, "0");
}

function renderDiscussion(panel, c) {
  const box = el("div", "chat-box");
  const collapseKey = "discuss_collapsed_" + c.id;
  let collapsed = lsGet(collapseKey, false);

  const head = el("div", "chat-head chat-head-toggle");
  head.innerHTML = '<div style="display:flex;align-items:center;gap:9px">' + icon("message", 18) + " <span>" + esc(c.title) + " · 课程讨论</span></div>";
  const toggleBtn = el("button", "chat-toggle", collapsed ? "展开 ▼" : "收起 ▲");
  toggleBtn.title = "折叠/展开讨论区";
  head.appendChild(toggleBtn);

  const body = el("div", "chat-body");
  const msgs = el("div", "chat-msgs");
  const key = "discussions_" + c.id;
  let list = lsGet(key, null);
  if (!list) {
    list = (c.discussions || []).map((m, i) => ({ ...m, ts: m.ts || "2026-09-0" + (i + 1) + " 09:1" + i, floor: i + 1 }));
    lsSet(key, list);
  }

  function applyCollapse() {
    if (collapsed) {
      body.style.display = "none";
      box.classList.add("collapsed");
      toggleBtn.textContent = "展开 ▼";
    } else {
      body.style.display = "flex";
      box.classList.remove("collapsed");
      toggleBtn.textContent = "收起 ▲";
      setTimeout(() => { msgs.scrollTop = msgs.scrollHeight; }, 10);
    }
    lsSet(collapseKey, collapsed);
  }

  function paint() {
    msgs.innerHTML = "";
    let floor = 0;
    list.forEach((m) => {
      floor++;
      const isMe = m.user === currentUser.name;
      const isAI = m.role === "ai";
      const wrap = el("div", "chat-msg " + (isMe ? "me" : (isAI ? "ai" : "")));
      const meta = el("div", "meta");
      const badge = isAI ? '<span class="badge-ai">AI 助教</span>' : (m.role === "teacher" ? '<span class="badge-teacher">教师</span>' : "");
      meta.innerHTML = '<span style="font-weight:700">' + esc(m.user) + "</span>" + badge +
        "<span>· " + (m.ts || "") + "</span><span>· #" + floor + "楼</span>";
      wrap.appendChild(meta);
      wrap.appendChild(el("div", null, m.content));
      msgs.appendChild(wrap);
    });
    msgs.scrollTop = msgs.scrollHeight;
  }
  paint();

  const input = el("div", "chat-input");
  const ipt = document.createElement("input");
  ipt.placeholder = "向 AI 助教提问，将获得解答…";
  const send = el("button", "btn ai", "发送");
  send.onclick = async () => {
    const v = ipt.value.trim();
    if (!v) return;
    if (collapsed) { collapsed = false; applyCollapse(); }
    list.push({ user: currentUser.name, role: "student", content: v, ts: "今天 " + nowHM(), floor: list.length + 1, openMAIC: false });
    lsSet(key, list);
    ipt.value = "";
    paint();
    // 思考中占位
    const thinking = el("div", "chat-msg ai");
    thinking.innerHTML = '<div class="meta"><span style="font-weight:700">AI 助教</span></div><div class="typing"><span></span><span></span><span></span></div>';
    msgs.appendChild(thinking);
    msgs.scrollTop = msgs.scrollHeight;
    const result = await getAIReply(v, c.title);
    thinking.remove();
    list.push({ user: "AI 助教", role: "ai", content: result.text, ts: "今天 " + nowHM(), floor: list.length + 1 });
    lsSet(key, list);
    paint();
  };
  ipt.addEventListener("keydown", (e) => { if (e.key === "Enter") send.onclick(); });
  input.appendChild(ipt);
  input.appendChild(send);

  toggleBtn.onclick = (e) => { e.stopPropagation(); collapsed = !collapsed; applyCollapse(); };

  body.appendChild(msgs);
  body.appendChild(input);
  box.appendChild(head);
  box.appendChild(body);
  panel.appendChild(box);
  applyCollapse();
}

/* ---------------- AI 课堂 ---------------- */
function renderAIChat(v) {
  v.innerHTML = "";
  v.appendChild(el("div", "h-title", "AI 互动课堂"));
  v.appendChild(el("p", "h-sub", "基于 OpenMAIC 的多智能体课堂，随时与 AI 助教对话"));

  const banner = el("div", "ai-banner");
  banner.innerHTML = '<div class="emoji" data-icon="bot" style="font-size:40px;color:#6B5BD8"> </div><div><h3>多智能体 AI 课堂已就绪</h3><p>点击右侧按钮，进入真实的 AI 互动课堂（教师 / 助教 / 学伴 三种智能体）</p></div>';
  const btn = el("button", "btn ai", "打开 AI 互动课堂");
  btn.style.marginLeft = "auto";
  btn.onclick = () => window.open(AI_CLASSROOM_URL, "_blank");
  banner.appendChild(btn);
  v.appendChild(banner);
  initIcons(banner);

  const agents = el("div", "ai-agent");
  const defs = [
    { cls: "teacher", face: "师", role: "教师智能体", name: "主讲教师", desc: "讲解知识点、梳理课程脉络", color: "#EAF1FB" },
    { cls: "tutor", face: "助", role: "助教智能体", name: "答疑助教", desc: "解答疑问、布置与批改练习", color: "#F0ECFF" },
    { cls: "mate", face: "伴", role: "学伴智能体", name: "AI 学伴", desc: "陪伴讨论、激发思考", color: "#FFEDE5" },
  ];
  defs.forEach((d) => {
    const a = el("div", "agent " + d.cls);
    const face = el("div", "face", d.face);
    face.style.cssText = "width:44px;height:44px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;background:#fff;color:#5E82D8";
    a.appendChild(face);
    a.appendChild(el("span", "role", d.role));
    a.appendChild(el("h4", null, d.name));
    a.appendChild(el("p", null, d.desc));
    agents.appendChild(a);
  });
  v.appendChild(agents);

  const chat = el("div", "chat-box");
  chat.style.height = "300px";
  chat.innerHTML =
    '<div class="chat-head">' + icon("sparkles", 18) + ' <span>示例对话</span></div>' +
    '<div class="chat-msgs"><div class="chat-msg ai"><div class="meta"><span style="font-weight:700">答疑助教</span></div>同学你好，我是本课 AI 助教。有什么想了解的吗？</div>' +
    '<div class="chat-msg me"><div class="meta"><span style="font-weight:700">' + esc(currentUser.name) + '</span></div>能帮我总结一下第 1 章的核心概念吗？</div>' +
    '<div class="chat-msg ai"><div class="meta"><span style="font-weight:700">答疑助教</span></div>当然！第 1 章围绕「数据思维」展开，重点是从业务问题出发，明确要回答什么问题、需要哪些数据……</div></div>';
  v.appendChild(chat);
}

/* ---------------- 学情看板 ---------------- */
function getCourseStats(c) {
  const studyMin = NF(localStorage.getItem(uKey("studyMin", c.id))) || 0;
  const studyHours = +(studyMin / 60).toFixed(1);
  const videoProg = NF(localStorage.getItem(uKey("progress", c.id))) || 0;
  // 测验平均分
  const quizzes = (c.sections || []).filter((s) => s.stype === "quiz");
  let quizScore = 0, quizCount = 0;
  quizzes.forEach((q, i) => {
    const s = lsGet(quizKey(c, i), null);
    if (s && s.submitted) { quizScore += s.score; quizCount++; }
  });
  const avgScore = quizCount ? Math.round(quizScore / quizCount) : 0;
  return { studyHours, videoProg, avgScore, quizCount, totalQuiz: quizzes.length };
}

function renderDashboard(v) {
  v.innerHTML = "";
  v.appendChild(el("div", "h-title", "学情看板"));
  v.appendChild(el("p", "h-sub", currentUser.name + " · " + currentUser.major + " · 学习概览"));

  // 聚合数据
  let totalStudyMin = 0;
  let totalVideoNum = 0, totalVideoPct = 0;
  let totalScoreNum = 0, totalScoreSum = 0;
  COURSES.forEach((c) => {
    const st = getCourseStats(c);
    totalStudyMin += Math.round(st.studyHours * 60);
    totalVideoNum++; totalVideoPct += st.videoProg;
    if (st.quizCount) { totalScoreNum += st.quizCount; totalScoreSum += st.avgScore * st.quizCount; }
  });
  const studyHours = +(totalStudyMin / 60).toFixed(1);
  const avgVideo = totalVideoNum ? Math.round(totalVideoPct / totalVideoNum) : 0;
  const avgScore = totalScoreNum ? Math.round(totalScoreSum / totalScoreNum) : 0;
  const signState = lsGet("signin_done", null);
  const signText = signState && signState.done ? "已签到" : "未签到";

  const stats = el("div", "stat-grid");
  [
    { ic: "clock", num: studyHours + " h", lbl: "累计学习时长", tip: "自 " + STUDY_START + " 起累计，以实际观看视频与完成测验时长计算。" },
    { ic: "video", num: avgVideo + "%", lbl: "视频平均完成度", tip: "当前三门通识课视频完成度的平均值；可点下方课程明细查看单科进度。" },
    { ic: "clipboard", num: avgScore || "—", lbl: "测验平均得分", tip: avgScore ? "已提交测验的平均分。" : "尚未提交任何测验，完成章节测验后将自动更新。" },
    { ic: "check-circle", num: signText, lbl: "签到记录", tip: signState && signState.done ? "上次签到时间：" + signState.time : "今日尚未签到，请前往课堂签到。" },
  ].forEach((s) => {
    const card = el("div", "stat");
    const ic = el("div", "ic"); ic.style.background = "var(--primary-soft)"; ic.style.color = "var(--primary-deep)"; ic.innerHTML = icon(s.ic, 22);
    card.appendChild(ic);
    card.appendChild(el("div", "num", s.num));
    card.appendChild(el("div", "lbl", s.lbl));
    if (s.tip) {
      const tip = el("span", "stat-tip");
      tip.textContent = "?";
      tip.setAttribute("data-tip", s.tip);
      card.appendChild(tip);
    }
    stats.appendChild(card);
  });
  v.appendChild(stats);

  // 待办 / 未掌握
  const tasks = [];
  COURSES.forEach((c) => {
    const st = getCourseStats(c);
    if (st.videoProg < 100) tasks.push({ type: "video", text: "完成「" + c.title + "」视频学习（当前 " + st.videoProg + "%）", cid: c.id });
    if (st.totalQuiz && st.quizCount < st.totalQuiz) tasks.push({ type: "quiz", text: "完成「" + c.title + "」剩余章节测验", cid: c.id });
    (c.homeworks || []).forEach((hw) => {
      tasks.push({ type: "hw", text: "待提交作业：「" + hw.title + "」" + (hw.due ? "（截止 " + hw.due + "）" : ""), cid: c.id });
    });
  });
  const todoCard = el("div", "card dash-todo");
  todoCard.innerHTML = '<div class="h-title2">待办与未掌握</div>';
  if (!tasks.length) {
    todoCard.innerHTML += '<div class="todo-empty">✓ 当前没有待办任务，继续保持！</div>';
  } else {
    const ul = el("div", "todo-list");
    tasks.forEach((t) => {
      const row = el("div", "todo-row");
      const iconName = t.type === "video" ? "video" : (t.type === "quiz" ? "clipboard" : "book-open");
      row.innerHTML = '<span class="ic" data-icon="' + iconName + '"> </span><span>' + esc(t.text) + '</span>';
      const btn = el("button", "btn sm", "去做");
      btn.onclick = () => { openCourse(t.cid, true); };
      row.appendChild(btn);
      initIcons(row);
      ul.appendChild(row);
    });
    todoCard.appendChild(ul);
  }
  v.appendChild(todoCard);

  // 课程进度明细
  const progressCard = el("div", "card dash-progress");
  progressCard.innerHTML = '<div class="h-title2">课程进度明细</div>';
  COURSES.forEach((c) => {
    const st = getCourseStats(c);
    const row = el("div", "hbar");
    row.innerHTML = '<div class="lab">' + esc(c.title) + '</div>' +
      '<div class="track"><span style="width:' + st.videoProg + '%"></span></div>' +
      '<div class="val">' + st.videoProg + '%</div>';
    progressCard.appendChild(row);
  });
  v.appendChild(progressCard);

  // 本周学习时长
  const chartCard = el("div", "chart-card");
  chartCard.appendChild(el("div", "h-title2", "本周学习时长（分钟）"));
  // 本周学习时长：取最近 7 天真实学习分钟（按用户累计，开始学习后才会有数据）
  const dlog = lsGet(uKey("studyDaily"), {}) || {};
  const wd = ["日", "一", "二", "三", "四", "五", "六"];
  const weekly = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const k = d.toISOString().slice(0, 10);
    weekly.push({ label: "周" + wd[d.getDay()], val: dlog[k] || 0 });
  }
  const bars = el("div", "bars");
  weekly.forEach((w) => {
    const bar = el("div", "bar");
    const col = el("div", "col");
    col.style.height = Math.min(180, w.val) + "px";
    bar.appendChild(col);
    bar.appendChild(el("div", "lab", w.label));
    bars.appendChild(bar);
  });
  chartCard.appendChild(bars);
  v.appendChild(chartCard);
}

/* ---------------- 课堂签到 ---------------- */
function renderSignin(v) {
  v.innerHTML = "";
  v.appendChild(el("div", "h-title", "课堂签到"));
  v.appendChild(el("p", "h-sub", "线下课程定位签到 / 扫码签到"));

  const signState = lsGet("signin_done", null);

  const card = el("div", "signin-task");
  const left = el("div");
  left.appendChild(el("div", "st-course", "数据科学导论 · 第 5 讲"));
  left.appendChild(el("div", "muted", "签到时间：2026-09-15 10:00 - 10:15"));
  const btn = el("button", signState && signState.done ? "btn ai" : "btn", signState && signState.done ? "✅ 已签到" : "立即签到");
  if (signState && signState.done) btn.disabled = true;
  btn.onclick = () => {
    if (signState && signState.done) return;
    const now = new Date();
    const t = now.getFullYear() + "-" + String(now.getMonth()+1).padStart(2,"0") + "-" + String(now.getDate()).padStart(2,"0") + " " + String(now.getHours()).padStart(2,"0") + ":" + String(now.getMinutes()).padStart(2,"0");
    lsSet("signin_done", { done: true, time: t });
    btn.textContent = "✅ 已签到";
    btn.className = "btn ai";
    btn.disabled = true;
    card.style.background = "linear-gradient(120deg,var(--ai-soft),var(--accent-soft))";
    toast("签到成功，已记录于「数据科学导论」");
  };
  card.appendChild(left);
  card.appendChild(btn);
  v.appendChild(card);

  const panel = el("div", "signin-panel");
  panel.innerHTML =
    '<div class="sp-map"><span data-icon="map-pin" style="font-size:22px"> </span><div class="sp-pin">校本部 · 教学楼 A302</div></div>' +
    '<div class="sp-info">定位签到需授权浏览器位置；或请教师出示课堂二维码进行扫码签到。</div>';
  v.appendChild(panel);
  initIcons(panel);
}

/* ---------------- 悬浮 AI 助手 ---------------- */
function showAIFAB() {
  let fab = $("#aiFAB");
  if (!fab) {
    fab = el("div", "ai-fab");
    fab.id = "aiFAB";
    fab.innerHTML = icon("bot", 22);
    fab.setAttribute("title", "OpenMAIC 助教");
    fab.onclick = toggleAIDrawer;
    document.body.appendChild(fab);
  }
  fab.style.display = "flex";
}
function hideAIFAB() {
  const fab = $("#aiFAB"); if (fab) fab.style.display = "none";
  const drawer = $("#aiDrawer"); if (drawer) drawer.classList.remove("show");
  aiChatOpen = false;
}
function toggleAIDrawer() {
  let drawer = $("#aiDrawer");
  if (!drawer) {
    drawer = el("div", "ai-drawer");
    drawer.id = "aiDrawer";
    drawer.innerHTML =
      '<div class="ai-drawer-head"><span data-icon="bot"> </span><b>OpenMAIC 助教</b><span class="ai-close" onclick="toggleAIDrawer()">✕</span></div>' +
      '<div class="ai-drawer-msgs" id="aiDrawerMsgs"></div>' +
      '<div class="ai-drawer-input"><input id="aiDrawerInput" placeholder="随时提问…" onkeydown="if(event.key===\'Enter\') sendAI()" /><button class="btn ai" onclick="sendAI()">发送</button></div>';
    document.body.appendChild(drawer);
    initIcons(drawer);
    addAIMsg("同学你好，我是 OpenMAIC 助教。在课程、作业或讨论中遇到问题，可以随时问我。", false);
  }
  drawer.classList.toggle("show");
  aiChatOpen = drawer.classList.contains("show");
  if (aiChatOpen) setTimeout(() => $("#aiDrawerInput").focus(), 50);
}
function addAIMsg(text, me) {
  const box = $("#aiDrawerMsgs");
  const wrap = el("div", "ai-msg " + (me ? "me" : "ai"));
  wrap.innerHTML = '<div>' + esc(text) + '</div>';
  box.appendChild(wrap);
  box.scrollTop = box.scrollHeight;
}
function addAIMsgTyping() {
  const box = $("#aiDrawerMsgs");
  const wrap = el("div", "ai-msg ai");
  wrap.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';
  box.appendChild(wrap);
  box.scrollTop = box.scrollHeight;
  return wrap;
}
async function sendAI() {
  const ipt = $("#aiDrawerInput");
  const v = ipt.value.trim();
  if (!v) return;
  addAIMsg(v, true);
  ipt.value = "";
  const typing = addAIMsgTyping();
  const result = await getAIReply(v, "研究生通识课");
  if (typing && typing.remove) typing.remove();
  addAIMsg(result.text, false);
}

/* ---------------- 启动 ---------------- */
(function init() {
  // 铃铛
  $("#bellBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    const p = $("#notifyPanel");
    p.classList.toggle("show");
    renderNotif();
  });
  document.addEventListener("click", (e) => {
    const p = $("#notifyPanel");
    if (p && !$("#bellBtn").contains(e.target)) p.classList.remove("show");
    const am = $("#avatarMenu");
    if (am && !$("#topAvatar").parentNode.contains(e.target)) am.classList.remove("show");
  });

  document.querySelectorAll("#profileTabs .tab").forEach((t) => {
    t.addEventListener("click", () => renderProfileTab(t.getAttribute("data-tab")));
  });

  const saved = localStorage.getItem("static_user");
  if (saved) { try { currentUser = JSON.parse(saved); } catch (e) { currentUser = null; } }

  // 浏览器返回 / 前进
  window.addEventListener("popstate", (e) => {
    const s = e.state || {};
    popHandling = true;
    if (s.view === "learn" && s.courseId) openCourse(+s.courseId, true);
    else if (s.view) navigate(s.view, { noPush: true });
    popHandling = false;
  });

  if (currentUser) {
    showApp({ replace: true });
  } else {
    $("#login").style.display = "flex";
    $("#app").style.display = "none";
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const d = $("#aiDrawer");
      if (d && d.classList.contains("show")) { toggleAIDrawer(); return; }
    }
    if (e.key !== "Enter" || $("#login").style.display === "none") return;
    if ($("#regForm").style.display !== "none") { doRegister(); return; }
    if (e.target.id === "li-user" || e.target.id === "li-pass") doLogin();
  });

  initIcons();
})();
