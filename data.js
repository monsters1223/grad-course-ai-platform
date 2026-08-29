/* =========================================================
   内嵌数据（静态展示版 · 无后端）
   说明：本文件把"后端接口返回的数据"直接写死在前端，
   因此部署到 GitHub Pages 后无需任何服务器即可运行。
   如需修改课程/资料，改这里即可。
   ========================================================= */

// 可登录的学生账号（演示用，密码为下发密码）
const USERS = [
  { username: "2023110001", password: "123456", name: "陈嘉禾", studentId: "2023110001", major: "人工智能学院" },
  { username: "2023110002", password: "123456", name: "林深夜", studentId: "2023110002", major: "计算机学院" },
];

// AI 互动课堂（多智能体）真实链接
const AI_CLASSROOM_URL = "https://open.maic.chat/classroom/GEFSFOgzV6";

// 推荐教学视频（按课程）
const VIDEO_LINKS = {
  1: [
    { title: "学术写作入门：如何提出研究问题", url: "https://search.bilibili.com/all?keyword=学术写作%20研究问题", source: "Bilibili" },
    { title: "引用规范与学术诚信（通识讲座）", url: "https://search.bilibili.com/all?keyword=引用规范%20学术诚信", source: "Bilibili" },
    { title: "文献综述写作方法", url: "https://search.bilibili.com/all?keyword=文献综述%20写作方法", source: "Bilibili" },
  ],
  2: [
    { title: "数据科学导论（清华公开课）", url: "https://search.bilibili.com/all?keyword=数据科学导论%20清华", source: "Bilibili" },
    { title: "Python 数据分析入门", url: "https://search.bilibili.com/all?keyword=Python%20数据分析%20入门", source: "Bilibili" },
    { title: "数据可视化与故事讲述", url: "https://search.bilibili.com/all?keyword=数据可视化%20故事讲述", source: "Bilibili" },
  ],
  3: [
    { title: "工程伦理：公众安全与职业责任", url: "https://search.bilibili.com/all?keyword=工程伦理%20公众安全", source: "Bilibili" },
    { title: "自动驾驶的伦理困境", url: "https://search.bilibili.com/all?keyword=自动驾驶%20伦理困境", source: "Bilibili" },
    { title: "工程师的 whistleblowing 与社会责任", url: "https://search.bilibili.com/all?keyword=工程师%20社会责任%20举报", source: "Bilibili" },
  ],
};

// 课程数据
const COURSES = [
  {
    id: 1,
    title: "学术写作与规范",
    teacher: "王怀安 · 人文学院",
    coverColor: "#5E82D8",
    coverText: "写",
    category: "人文通识",
    desc: "面向研究生的学术写作训练，涵盖文献综述、引用规范与论证结构。",
    progress: 35,
    sections: [
      { stype: "video", title: "第1章 文献检索与综述", content: "assets/ch1.mp4" },
      { stype: "video", title: "第2章 引用格式与学术诚信", content: "assets/ch2.mp4" },
      { stype: "video", title: "第3章 论证结构与逻辑", content: "assets/eth1.mp4" },
      { stype: "doc", title: "第1章课件·文献检索", content: "assets/slide1.html" },
      { stype: "doc", title: "第2章课件·引用规范", content: "assets/slide2.html" },
      { stype: "doc", title: "第3章课件·论证结构", content: "assets/slide3.html" },
      { stype: "quiz", title: "章节测验 1", questions: [
        { q: "直接引用他人原话时，必须标注什么？", options: ["作者姓名", "出版年份", "具体页码", "出版社"], answer: 2, explanation: "直接引用需要在引文后标注页码，以便读者核对原文。" },
        { q: "文献综述的核心目的是什么？", options: ["罗列尽可能多的文献", "梳理研究脉络并指出现有缺口", "直接复制摘要", "省略引用来源"], answer: 1, explanation: "文献综述重在梳理已有研究脉络，为自己的研究定位。" },
        { q: "下列哪一项不属于学术不端行为？", options: ["伪造数据", "正确引用", "一稿多投", "代写论文"], answer: 1, explanation: "正确引用是学术规范行为，其余均为学术不端。" },
        { q: "论证结构的三要素是什么？", options: ["论点、论据、论证", "引言、方法、结论", "背景、数据、致谢", "标题、摘要、关键词"], answer: 0, explanation: "论证=论点+论据+论证过程。" },
        { q: "间接引用时，正文标注通常需要包含？", options: ["仅作者", "作者与年份", "仅页码", "仅标题"], answer: 1, explanation: "间接引用需注明作者与年份，如（张三，2025）。" },
      ]},
      { stype: "quiz", title: "章节测验 2", questions: [
        { q: "学术论文中，结论部分不应做什么？", options: ["总结发现", "提出新观点", "重申研究意义", "建议未来方向"], answer: 1, explanation: "结论不应引入正文未讨论的新观点。" },
        { q: "引文格式混乱会导致什么问题？", options: ["影响可读性", "涉嫌抄袭", "降低可信度", "以上皆是"], answer: 3, explanation: "格式混乱会影响阅读、可信度，严重时被视为抄袭。" },
      ]},
    ],
    discussions: [
      { user: "陈嘉禾", role: "student", content: "老师，间接引用和直接引用在正文标注上有什么区别？", ts: "2026-09-10 09:12" },
      { user: "王怀安", role: "teacher", content: "间接引用需注明“据某某研究”，直接引用的话加上页码即可，详见第 2 章课件第 4 页。", ts: "2026-09-10 10:05" },
    ],
    homeworks: [
      { title: "作业 1：文献综述初稿", desc: "围绕自选课题完成 1500 字综述，使用课程引用格式。", due: "2026-09-20" },
      { title: "作业 2：论证结构分析", desc: "选取一篇论文分析其论点、论据与论证方式。", due: "2026-09-27" },
    ],
    analytics: {
      studyHours: 12.5,
      videoProgress: 68,
      avgScore: 88,
      weekly: [
        { label: "周一", val: 30 },
        { label: "周二", val: 55 },
        { label: "周三", val: 40 },
        { label: "周四", val: 72 },
        { label: "周五", val: 60 },
        { label: "周六", val: 88 },
        { label: "周日", val: 45 },
      ],
    },
  },
  {
    id: 2,
    title: "数据科学导论",
    teacher: "李慕白 · 计算机学院",
    coverColor: "#A99CF5",
    coverText: "数",
    category: "理工通识",
    desc: "从数据思维到机器学习基础，建立跨学科的数据分析能力。",
    progress: 0,
    sections: [
      { stype: "video", title: "第1章 数据思维与问题定义", content: "assets/ch1.mp4" },
      { stype: "video", title: "第2章 探索性数据分析", content: "assets/ch2.mp4" },
      { stype: "doc", title: "第1章课件·数据思维", content: "assets/slide1.html" },
      { stype: "quiz", title: "章节测验 1", questions: [
        { q: "数据科学的核心目标是什么？", options: ["收集最多数据", "从数据中提取洞见并支持决策", "制作精美图表", "编写最多代码"], answer: 1, explanation: "数据科学的核心是从数据中提取洞见并支持决策。" },
        { q: "EDA 是指？", options: ["探索性数据分析", "工程数据分析", "增强数据分析", "电子数据分析"], answer: 0, explanation: "EDA = Exploratory Data Analysis，探索性数据分析。" },
        { q: "过拟合的典型表现是？", options: ["训练集差测试集差", "训练集好测试集差", "训练集差测试集好", "训练集和测试集一样差"], answer: 1, explanation: "过拟合指模型在训练集上表现好，但在新数据上表现差。" },
        { q: "数据伦理不包括以下哪项？", options: ["隐私保护", "算法公平", "数据安全", "数据越多越好"], answer: 3, explanation: "数据伦理关注隐私、公平、安全，而非单纯追求数据量。" },
        { q: "特征工程的主要作用是？", options: ["让模型更容易学习有效模式", "减少训练时间", "增加数据量", "替代模型训练"], answer: 0, explanation: "特征工程通过构造有效特征帮助模型学习。" },
      ]},
    ],
    discussions: [],
    homeworks: [
      { title: "作业 1：数据集可视化", desc: "使用课程示例数据集完成一份可视化报告。", due: "2026-10-05" },
    ],
    analytics: { studyHours: 0, videoProgress: 0, avgScore: 0, weekly: [
      { label: "周一", val: 0 },
      { label: "周二", val: 0 },
      { label: "周三", val: 0 },
      { label: "周四", val: 0 },
      { label: "周五", val: 0 },
      { label: "周六", val: 0 },
      { label: "周日", val: 0 },
    ] },
  },
  {
    id: 3,
    title: "工程伦理与社会责任",
    teacher: "赵明 · 马克思主义学院",
    coverColor: "#62CBA0",
    coverText: "工",
    category: "理工通识",
    desc: "从真实工程事故出发，理解工程师的伦理责任与决策框架。",
    progress: 60,
    sections: [
      { stype: "video", title: "第1章 工程伦理导论", content: "assets/ch1.mp4" },
      { stype: "doc", title: "第1章课件·伦理决策框架", content: "assets/slide1.html" },
      { stype: "quiz", title: "章节测验 1", questions: [
        { q: "工程师的首要责任对象通常是？", options: ["雇主利益", "公众安全与健康", "个人声誉", "项目利润"], answer: 1, explanation: "工程伦理强调公众安全与健康优先。" },
        { q: "自动驾驶中的“电车难题”主要用于讨论什么？", options: ["算法效率", "伦理决策", "车辆外观设计", "电池续航"], answer: 1, explanation: "电车难题式情境常用于讨论自动驾驶的伦理决策。" },
        { q: "Whistleblowing 在工程伦理中通常指？", options: ["举报不当行为", "加班赶工", "技术创新", "市场推广"], answer: 0, explanation: "Whistleblowing 指揭露组织内不道德或违法行为。" },
        { q: "伦理决策时应当？", options: ["只考虑技术可行性", "综合多方利益与价值", "只听雇主意见", "回避公众意见"], answer: 1, explanation: "伦理决策需要综合技术、利益相关者与价值判断。" },
        { q: "数据隐私保护的基本原则之一是？", options: ["数据最小化", "数据最大化", "无限制共享", "永不删除"], answer: 0, explanation: "数据最小化原则：只收集必要数据。" },
      ]},
    ],
    discussions: [
      { user: "林深夜", role: "student", content: "老师，自动驾驶的“电车难题”在工程中真的需要工程师决策吗？", ts: "2026-09-12 15:30" },
    ],
    homeworks: [
      { title: "作业 1：工程事故案例分析", desc: "选取一个真实工程事故，从伦理责任角度分析。", due: "2026-09-25" },
    ],
    analytics: {
      studyHours: 8,
      videoProgress: 60,
      avgScore: 92,
      weekly: [
        { label: "周一", val: 20 },
        { label: "周二", val: 35 },
        { label: "周三", val: 50 },
        { label: "周四", val: 30 },
        { label: "周五", val: 65 },
        { label: "周六", val: 40 },
        { label: "周日", val: 25 },
      ],
    },
  },
];
