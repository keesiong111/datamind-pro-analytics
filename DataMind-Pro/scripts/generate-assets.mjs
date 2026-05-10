import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = path.resolve(new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const dataPath = path.join(root, "data", "sample-business-finance.csv");
const reportsDir = path.join(root, "reports");
const notebooksDir = path.join(root, "notebooks");

fs.mkdirSync(reportsDir, { recursive: true });
fs.mkdirSync(notebooksDir, { recursive: true });

function parseCsv(text) {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) return [];
  const split = (line) => {
    const out = [];
    let cur = "";
    let quote = false;
    for (let i = 0; i < line.length; i += 1) {
      const ch = line[i];
      const next = line[i + 1];
      if (ch === '"' && quote && next === '"') {
        cur += '"';
        i += 1;
      } else if (ch === '"') {
        quote = !quote;
      } else if (ch === "," && !quote) {
        out.push(cur.trim());
        cur = "";
      } else {
        cur += ch;
      }
    }
    out.push(cur.trim());
    return out;
  };
  const headers = split(lines[0]);
  return lines.slice(1).map((line) => {
    const values = split(line);
    return Object.fromEntries(headers.map((head, index) => [head || `字段${index + 1}`, values[index] ?? ""]));
  });
}

const isMissing = (value) => value === undefined || value === null || String(value).trim() === "";
const toNum = (value) => {
  if (isMissing(value)) return NaN;
  const n = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(n) ? n : NaN;
};
const sum = (values) => values.reduce((a, b) => a + b, 0);
const avg = (values) => (values.length ? sum(values) / values.length : NaN);
const money = (value) => (Number.isFinite(value) ? `¥${Math.round(value).toLocaleString("zh-CN")}` : "-");
const percent = (value) => (Number.isFinite(value) ? `${(value * 100).toFixed(1)}%` : "-");
const esc = (value) => String(value).replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]);

function analyze(rows) {
  const columns = Object.keys(rows[0] ?? {});
  const numeric = columns.filter((col) => {
    const present = rows.map((row) => row[col]).filter((value) => !isMissing(value));
    const nums = present.map(toNum).filter(Number.isFinite);
    return present.length > 0 && nums.length / present.length >= 0.75;
  });
  const categorical = columns.filter((col) => !numeric.includes(col));
  const find = (words, pool = columns) => pool.find((col) => words.some((word) => col.toLowerCase().includes(word) || col.includes(word)));
  const revenue = find(["revenue", "sales", "amount", "收入", "销售", "销售额", "营业额", "金额"], numeric) ?? numeric[0];
  const cost = find(["cost", "成本", "费用", "支出"], numeric);
  const orders = find(["order", "订单", "销量", "数量"], numeric);
  const channel = find(["channel", "渠道", "来源", "平台"], categorical) ?? categorical[0];
  const region = find(["region", "地区", "城市", "区域"], categorical);

  const values = (col) => (col ? rows.map((row) => toNum(row[col])).filter(Number.isFinite) : []);
  const revenueSum = sum(values(revenue));
  const costSum = sum(values(cost));
  const profit = Number.isFinite(revenueSum) && Number.isFinite(costSum) ? revenueSum - costSum : NaN;
  const margin = revenueSum ? profit / revenueSum : NaN;
  const orderSum = orders ? sum(values(orders)) : rows.length;
  const aov = orderSum ? revenueSum / orderSum : NaN;
  const missingCells = rows.flatMap((row) => columns.map((col) => row[col])).filter(isMissing).length;
  const missingRate = missingCells / Math.max(rows.length * columns.length, 1);

  const grouped = new Map();
  if (channel) {
    for (const row of rows) {
      const key = String(row[channel] || "空值");
      const value = toNum(row[revenue]);
      if (!grouped.has(key)) grouped.set(key, { key, total: 0, count: 0 });
      const item = grouped.get(key);
      item.count += 1;
      if (Number.isFinite(value)) item.total += value;
    }
  }
  const topGroups = [...grouped.values()].sort((a, b) => b.total - a.total).slice(0, 8);
  const risks = [];
  if (missingRate > 0.1) risks.push(`缺失率 ${percent(missingRate)}，建议先处理关键字段空值。`);
  if (Number.isFinite(margin) && margin < 0.15) risks.push(`利润率 ${percent(margin)}，低于 15%，建议拆分成本和渠道结构。`);
  if (!risks.length) risks.push("未发现默认规则下的高风险项，可继续配置业务阈值。");

  return { columns, numeric, categorical, revenue, cost, orders, channel, region, revenueSum, costSum, profit, margin, orderSum, aov, missingCells, missingRate, topGroups, risks };
}

function reportHtml(rows, a) {
  const groupRows = a.topGroups.map((item) => `<tr><td>${esc(item.key)}</td><td>${money(item.total)}</td><td>${item.count}</td></tr>`).join("");
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>DataMind Pro 示例 CSV 分析报告</title>
<style>
body{font-family:Arial,"Microsoft YaHei",sans-serif;margin:40px;color:#182235;line-height:1.65}
h1{font-size:28px;margin:0 0 8px} h2{margin-top:28px;border-bottom:1px solid #d8dee9;padding-bottom:6px}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:18px 0}.card{border:1px solid #d8dee9;border-radius:10px;padding:14px;background:#f8fafc}.card b{display:block;font-size:22px;margin-top:6px}
table{width:100%;border-collapse:collapse;margin-top:12px}th,td{border-bottom:1px solid #e5e7eb;padding:9px;text-align:left}th{background:#f1f5f9}
.risk{background:#fff7ed;border-left:4px solid #f59e0b;padding:10px 12px;margin:8px 0}
@media print{body{margin:26px}.card{break-inside:avoid}}
</style>
</head>
<body>
<h1>DataMind Pro 示例 CSV 分析报告</h1>
<p>数据源：<code>data/sample-business-finance.csv</code>。本报告由项目内置 Node 脚本自动生成。</p>
<div class="grid">
  <div class="card">记录数<b>${rows.length.toLocaleString("zh-CN")}</b></div>
  <div class="card">字段数<b>${a.columns.length}</b></div>
  <div class="card">收入规模<b>${money(a.revenueSum)}</b></div>
  <div class="card">利润率<b>${percent(a.margin)}</b></div>
</div>
<h2>商业 KPI</h2>
<table><tbody>
<tr><th>收入字段</th><td>${esc(a.revenue ?? "-")}</td><th>成本字段</th><td>${esc(a.cost ?? "-")}</td></tr>
<tr><th>收入</th><td>${money(a.revenueSum)}</td><th>成本</th><td>${money(a.costSum)}</td></tr>
<tr><th>利润</th><td>${money(a.profit)}</td><th>单均值</th><td>${money(a.aov)}</td></tr>
<tr><th>缺失单元格</th><td>${a.missingCells}</td><th>缺失率</th><td>${percent(a.missingRate)}</td></tr>
</tbody></table>
<h2>渠道贡献</h2>
<table><thead><tr><th>渠道/维度</th><th>贡献金额</th><th>记录数</th></tr></thead><tbody>${groupRows}</tbody></table>
<h2>风险与建议</h2>
${a.risks.map((risk) => `<div class="risk">${esc(risk)}</div>`).join("")}
<h2>下一步动作</h2>
<ul>
<li>将高风险规则加入日报或周报检查清单。</li>
<li>按渠道、地区、客户进一步拆分收入、成本和利润。</li>
<li>若用于理财数据，补充资产类别、金额、日期和现金流字段。</li>
</ul>
</body>
</html>`;
}

function notebook(rows, a) {
  const code = `import csv, statistics, pathlib\n\npath = pathlib.Path('../data/sample-business-finance.csv')\nrows = list(csv.DictReader(path.open(encoding='utf-8-sig')))\n\ndef num(value):\n    try:\n        return float(str(value).replace(',', ''))\n    except Exception:\n        return None\n\nrevenue_col = '${a.revenue ?? ""}'\ncost_col = '${a.cost ?? ""}'\nrevenue = [num(r[revenue_col]) for r in rows if revenue_col and num(r[revenue_col]) is not None]\ncost = [num(r[cost_col]) for r in rows if cost_col and num(r[cost_col]) is not None]\nprofit = sum(revenue) - sum(cost)\nmargin = profit / sum(revenue) if revenue else None\n\nprint('records:', len(rows))\nprint('columns:', list(rows[0].keys()))\nprint('revenue:', round(sum(revenue), 2))\nprint('profit:', round(profit, 2))\nprint('margin:', round(margin * 100, 2), '%')`;
  return {
    cells: [
      { cell_type: "markdown", metadata: {}, source: ["# DataMind Pro 示例数据分析\\n", "\\n", "这个 Notebook 展示如何用 Python 复现核心 CSV 分析逻辑。"] },
      { cell_type: "markdown", metadata: {}, source: ["## 自动分析摘要\\n", `- 记录数：${rows.length}\\n`, `- 字段数：${a.columns.length}\\n`, `- 收入字段：${a.revenue ?? "-"}\\n`, `- 收入规模：${money(a.revenueSum)}\\n`, `- 利润率：${percent(a.margin)}\\n`] },
      { cell_type: "code", execution_count: null, metadata: {}, outputs: [], source: code.split("\n").map((line) => `${line}\n`) },
      { cell_type: "markdown", metadata: {}, source: ["## 建议\\n", "- 将字段识别、质量检查、KPI 计算封装为可复用函数。\\n", "- 生产环境可以连接数据库或定时任务生成日报。\\n"] }
    ],
    metadata: {
      kernelspec: { display_name: "Python 3", language: "python", name: "python3" },
      language_info: { name: "python", version: "3.x" }
    },
    nbformat: 4,
    nbformat_minor: 5
  };
}

function edgePath() {
  const candidates = [
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"
  ];
  return candidates.find((candidate) => fs.existsSync(candidate));
}

const rows = parseCsv(fs.readFileSync(dataPath, "utf8"));
const analysis = analyze(rows);
const htmlPath = path.join(reportsDir, "sample-analysis-report.html");
const pdfPath = path.join(reportsDir, "sample-analysis-report.pdf");
const ipynbPath = path.join(notebooksDir, "datamind_analysis.ipynb");

fs.writeFileSync(htmlPath, reportHtml(rows, analysis), "utf8");
fs.writeFileSync(ipynbPath, JSON.stringify(notebook(rows, analysis), null, 2), "utf8");

const browser = edgePath();
if (browser) {
  const result = spawnSync(browser, [
    "--headless=new",
    "--disable-gpu",
    "--disable-software-rasterizer",
    "--no-sandbox",
    `--print-to-pdf=${pdfPath}`,
    `file:///${htmlPath.replace(/\\/g, "/")}`
  ], { encoding: "utf8" });
  if (result.status !== 0) {
    console.warn("PDF generation failed. HTML report was generated.", result.stderr || result.stdout);
  }
} else {
  console.warn("No Edge/Chrome executable found. HTML report was generated, PDF skipped.");
}

console.log("Generated assets:");
console.log(`- ${htmlPath}`);
console.log(`- ${pdfPath}`);
console.log(`- ${ipynbPath}`);
