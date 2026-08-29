/* =========================================================
   研究生通识课 AI 教育平台 · 学生端（静态展示版 · 图标化重构）
   纯前端：登录用 localStorage，数据来自 data.js，无后端请求。
   ========================================================= */

const $ = (s) => document.querySelector(s);
const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const NF = (n) => Number(n);

let currentUser = null;
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
  if ($("#li-remember").checked) storeUser();
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
  $("#li-remember").checked = false;
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
function renderHome(v) {
  v.innerHTML = "";
  v.appendChild(el("div", "h-title", "课程中心"));
  v.appendChild(el("p", "h-sub", currentUser.name + "，" + currentUser.major + " · 这里有你的通识课程"));

  const grid = el("div", "course-grid");
  v.appendChild(grid);

  const list = COURSES.filter((c) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (c.title + c.teacher + c.category + (c.desc || "")).toLowerCase().includes(s);
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
    body.appendChild(el("h4", null, c.title));
    body.appendChild(el("div", "course-meta", c.category + " · " + c.teacher));
    const prog = el("div", "progress");
    const span = el("span");
    const saved = NF(localStorage.getItem("progress_" + c.id));
    const pct = saved || c.progress;
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
  if (!skipNav) pushView("learn", false, { courseId: id });
}

function renderLearn(v, c) {
  v.innerHTML = "";
  v.appendChild(el("h1", "h-title", c.title));
  const saved = NF(localStorage.getItem("progress_" + c.id)) || c.progress;
  v.appendChild(el("p", "h-sub", c.category + " · " + c.teacher + " · 进度 " + saved + "%"));

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

  const player = el("div");
  player.style.cssText = "border-radius:var(--radius);overflow:hidden;box-shadow:var(--shadow);background:#000";
  const video = document.createElement("video");
  video.controls = true;
  video.style.cssText = "width:100%;display:block;max-height:420px;background:#000";
  if (videos[0]) video.src = videos[0].content;
  video.addEventListener("timeupdate", () => {
    if (!video.duration) return;
    const ratio = Math.min(100, Math.round((video.currentTime / video.duration) * 100));
    const key = "progress_" + c.id;
    const prev = NF(localStorage.getItem(key)) || 0;
    if (ratio > prev) { localStorage.setItem(key, ratio); refreshProgressLabel(c, ratio); }
    // 累计学习时长（每播放满 60 秒记 1 分钟）
    const tickKey = "studyTick_" + c.id;
    const lastTick = NF(localStorage.getItem(tickKey)) || 0;
    if (video.currentTime - lastTick >= 60) {
      const studyKey = "studyMin_" + c.id;
      localStorage.setItem(studyKey, (NF(localStorage.getItem(studyKey)) || 0) + 1);
      localStorage.setItem(tickKey, video.currentTime);
    }
  });
  player.appendChild(video);

  const tabs = el("div", "learn-tabs");
  const tabDefs = [
    { key: "video", label: "视频", show: videos.length },
    { key: "doc", label: "资料", show: docs.length },
    { key: "quiz", label: "章节测验", show: quizzes.length },
    { key: "discussion", label: "课程讨论", show: true },
  ];
  let curTab = "video";

  function renderTab() {
    panel.innerHTML = "";
    if (curTab === "video") {
      panel.appendChild(player);
      // 视频推荐链接
      const recs = VIDEO_LINKS[c.id];
      if (recs && recs.length) {
        const recBox = el("div", "video-recs");
        recBox.innerHTML = '<div class="rec-title">推荐相关教学视频</div>';
        const ul = el("div", "rec-list");
        recs.forEach((r) => {
          const a = el("a", "rec-item");
          a.href = r.url; a.target = "_blank";
          a.innerHTML = '<span class="ic" data-icon="video"> </span><span>' + esc(r.title) + '</span><span class="rec-src">' + esc(r.source) + '</span>';
          ul.appendChild(a);
        });
        recBox.appendChild(ul);
        panel.appendChild(recBox);
      }
      const note = el("p", "muted");
      note.style.cssText = "font-size:12px;margin-top:12px";
      note.textContent = "提示：当前为演示视频，后续将接入课程实录与名师讲解。";
      panel.appendChild(note);
      chapter.innerHTML = '<div class="ch">章节列表</div>';
      if (videos.length === 0) chapter.appendChild(el("div", "item", "暂无视频"));
      videos.forEach((s, i) => {
        const it = el("div", "item" + (i === 0 ? " active" : ""), s.title);
        it.onclick = () => {
          video.src = s.content; video.play().catch(() => {});
          [...chapter.querySelectorAll(".item")].forEach((x) => x.classList.remove("active"));
          it.classList.add("active");
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
      wrap.innerHTML += '<div class="quiz-score">已提交 · 得分 ' + stored.score + ' / ' + quiz.questions.length + '</div>';
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
      quiz.questions.forEach((q, i) => {
        const sel = form.querySelector('input[name="q_' + c.id + '_' + qIdx + '_' + i + '"]:checked');
        if (sel && Number(sel.value) === q.answer) score++;
      });
      lsSet(quizKey(c, qIdx), { submitted: true, score: score, total: quiz.questions.length, at: new Date().toISOString() });
      renderQuizPanel(panel, c);
      toast("测验已提交，得分 " + score + "/" + quiz.questions.length);
    };
    form.appendChild(submit);
    wrap.appendChild(form);
    panel.appendChild(wrap);
  });
}

/* ---------------- 课程讨论（OpenMAIC 助教自动回复） ---------------- */
function aiReply(question, c) {
  const q = question.toLowerCase();
  if (c.id === 1) {
    if (q.includes("引用") || q.includes("页码")) return "直接引用必须标注页码，间接引用需注明作者与年份。建议查看《学术写作与规范》第 2 章课件。";
    if (q.includes("综述") || q.includes("文献")) return "文献综述不是罗列文献，而是梳理研究脉络、指出研究缺口，并为自己的研究定位。";
    if (q.includes("诚信") || q.includes("抄袭")) return "学术诚信要求对他人观点正确引用，避免一稿多投、伪造数据和代写等学术不端行为。";
    return "这是一个很好的问题。作为 OpenMAIC 助教，建议你结合课程视频与资料深入思考，也可以进入 AI 课堂继续讨论。";
  }
  if (c.id === 3) {
    if (q.includes("电车") || q.includes("自动驾驶")) return "自动驾驶的“电车难题”主要讨论在不可避免的碰撞中，算法应如何权衡不同主体的安全与责任。";
    if (q.includes("责任") || q.includes("公众")) return "工程伦理强调：工程师的首要责任是公众的安全、健康与福祉，其次才考虑雇主或客户利益。";
    if (q.includes("举报") || q.includes("whistleblowing")) return "Whistleblowing 是工程师在发现危及公众利益的问题时，向相关机构举报的行为，是负责任的最后手段。";
    return "工程伦理需要在技术可行性与社会责任之间做综合判断。你可以结合具体案例继续追问。";
  }
  if (c.id === 2) {
    if (q.includes("过拟合")) return "过拟合指模型在训练集表现很好，但在新数据上表现差，需要通过正则化、交叉验证等方法缓解。";
    if (q.includes("eda")) return "EDA 是 Exploratory Data Analysis，即探索性数据分析，帮助我们理解数据分布、发现异常与规律。";
    return "数据科学强调从数据中提取洞见、支持决策。继续提问，我可以帮你梳理思路。";
  }
  return "收到你的问题。我已记录，会尽快从课程知识点出发给你反馈。";
}

function renderDiscussion(panel, c) {
  const box = el("div", "chat-box");
  const head = el("div", "chat-head");
  head.innerHTML = icon("message", 18) + " <span>" + esc(c.title) + " · 课程讨论</span>";
  head.style.display = "flex"; head.style.alignItems = "center"; head.style.gap = "9px";
  const msgs = el("div", "chat-msgs");
  const key = "discussions_" + c.id;
  let list = lsGet(key, null);
  if (!list) {
    list = (c.discussions || []).map((m, i) => ({ ...m, ts: m.ts || "2026-09-0" + (i + 1) + " 09:1" + i, floor: i + 1 }));
    lsSet(key, list);
  }

  function paint() {
    msgs.innerHTML = "";
    let floor = 0;
    list.forEach((m) => {
      floor++;
      const isMe = m.user === currentUser.name;
      const isTeacher = m.role === "teacher";
      const isAI = m.role === "ai";
      const wrap = el("div", "chat-msg " + (isMe ? "me" : (isAI ? "ai" : "ai")));
      const meta = el("div", "meta");
      const badge = isAI ? '<span class="badge-ai">OpenMAIC 助教</span>' : (isTeacher ? '<span class="badge-teacher">教师</span>' : "");
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
  ipt.placeholder = "输入问题，OpenMAIC 助教将优先解答…";
  const send = el("button", "btn ai", "发送");
  send.onclick = () => {
    const v = ipt.value.trim();
    if (!v) return;
    const ts = new Date();
    const hh = String(ts.getHours()).padStart(2, "0");
    const mm = String(ts.getMinutes()).padStart(2, "0");
    list.push({ user: currentUser.name, role: "student", content: v, ts: "今天 " + hh + ":" + mm, floor: list.length + 1 });
    lsSet(key, list);
    ipt.value = "";
    paint();
    setTimeout(() => {
      const reply = aiReply(v, c);
      const now = new Date();
      const h2 = String(now.getHours()).padStart(2, "0");
      const m2 = String(now.getMinutes()).padStart(2, "0");
      list.push({ user: "OpenMAIC 助教", role: "ai", content: reply, ts: "今天 " + h2 + ":" + m2, floor: list.length + 1 });
      lsSet(key, list);
      paint();
    }, 900);
  };
  ipt.addEventListener("keydown", (e) => { if (e.key === "Enter") send.onclick(); });
  input.appendChild(ipt);
  input.appendChild(send);

  box.appendChild(head);
  box.appendChild(msgs);
  box.appendChild(input);
  panel.appendChild(box);
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
  const studyMin = NF(localStorage.getItem("studyMin_" + c.id)) || 0;
  const studyHours = +(studyMin / 60).toFixed(1);
  const videoProg = NF(localStorage.getItem("progress_" + c.id)) || c.progress;
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
  const bars = el("div", "bars");
  const weekly = COURSES[0] && COURSES[0].analytics ? COURSES[0].analytics.weekly : [];
  (weekly || []).forEach((w) => {
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
function sendAI() {
  const ipt = $("#aiDrawerInput");
  const v = ipt.value.trim();
  if (!v) return;
  addAIMsg(v, true);
  ipt.value = "";
  setTimeout(() => {
    const q = v.toLowerCase();
    let reply = "我理解了你的问题。作为 OpenMAIC 助教，建议你先查看对应课程的「视频」与「资料」章节，如果仍有疑问可以在课程讨论区继续提问。";
    if (q.includes("签到")) reply = "签到在左侧「课堂签到」页面完成。若已签到，切换页面后状态会保留。";
    else if (q.includes("作业") || q.includes("测验")) reply = "作业与测验均在学习页对应课程下。完成测验后成绩会自动同步到学情看板。";
    else if (q.includes("视频") || q.includes("进度")) reply = "视频进度会在你看课时自动记录，并同步到学情看板。";
    else if (q.includes("密码") || q.includes("登录")) reply = "如果忘记密码，可在登录页点击「忘记密码」重置。演示版注册信息保存在当前浏览器。";
    addAIMsg(reply, false);
  }, 600);
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
    if (e.key !== "Enter" || $("#login").style.display === "none") return;
    if ($("#regForm").style.display !== "none") { doRegister(); return; }
    if (e.target.id === "li-user" || e.target.id === "li-pass") doLogin();
  });

  initIcons();
})();
