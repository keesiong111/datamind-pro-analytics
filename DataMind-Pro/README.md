# DataMind Pro

DataMind Pro 是一个单文件、本地运行的商业数据分析与理财规划工作台。用户直接打开 `index.html`，上传 CSV / Excel 数据后，即可得到数据质量、商业 KPI、规则预警、可视化、自动报告和理财规划结果。

## 功能

- 本地 CSV / Excel 上传分析
- 字段类型识别：数值、类别、日期
- 商业字段识别：收入、成本、利润、订单、客户、渠道、地区
- 经营健康度、利润率、增长、单均值、贡献排名
- 数据质量评分、缺失值、重复行、异常值检测
- 自动化规则预警与数据处理建议
- 自定义图表：柱状图、折线图、散点图、环形图
- 理财模块：复利规划、贷款月供参考、投资/预算数据识别
- 一键导出商业与理财分析报告
- Jupyter Notebook 示例分析
- 示例 CSV 分析报告 HTML / PDF

## 快速开始

直接双击打开：

```text
index.html
```

或上传到 GitHub 后启用 GitHub Pages，入口文件仍然是：

```text
index.html
```

## 文件结构

```text
DataMind-Pro/
  index.html                         # 成品单页应用
  DataMind-Pro-single-file.html       # 单文件副本，方便独立分发
  data/
    sample-business-finance.csv       # 示例数据
  reports/
    sample-analysis-report.html       # 示例 CSV 分析报告
    sample-analysis-report.pdf        # 示例 CSV 分析 PDF
  notebooks/
    datamind_analysis.ipynb           # Jupyter Notebook 示例分析
  scripts/
    generate-assets.mjs               # 生成报告和 Notebook 的 Node 脚本
  package.json
  LICENSE
```

## 重新生成报告和 Notebook

需要安装 Node.js。项目不依赖 npm 第三方包。

```bash
npm run build:assets
```

脚本会读取 `data/sample-business-finance.csv`，生成：

- `reports/sample-analysis-report.html`
- `reports/sample-analysis-report.pdf`
- `notebooks/datamind_analysis.ipynb`

PDF 生成依赖本机 Edge / Chrome 的无头打印功能；如果没有可用浏览器，HTML 报告仍会生成。

## 商业使用说明

本项目默认使用 MIT License，可用于商业项目、客户演示、内部工具或二次开发。你需要自行确认上传数据的隐私、合规和安全要求。

## 注意

- CSV 分析可以离线运行。
- Excel 解析和图表渲染使用 CDN 库；在离线环境下，核心 CSV 分析仍可运行，图表会降级提示。
- 本工具提供数据分析和理财计算框架，不构成投资建议。
