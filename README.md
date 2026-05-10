# datamind-pro-analytics
A local-first business analytics and personal finance dashboard with CSV/Excel upload, automated insights, alerts, reports, and Jupyter analysis.
# DataMind Pro Analytics

DataMind Pro Analytics is a local-first business analytics and personal finance dashboard. It allows users to upload CSV or Excel files and automatically generate data quality checks, business KPIs, alerts, visualizations, reports, and finance planning insights directly in the browser.

## Overview

This project was built as an end-to-end analytics product prototype for business intelligence, financial planning, and portfolio presentation. It is designed to run without a backend server, making it easy to deploy with GitHub Pages or open locally as a single HTML file.

## Key Features

- CSV and Excel file upload
- Local-first data processing in the browser
- Automatic field type detection
- Business KPI recognition
- Data quality scoring
- Missing value and duplicate detection
- Outlier detection
- Correlation analysis
- Rule-based business alerts
- Automated business insights
- Custom charts and dashboards
- Personal finance planning tools
- Compound interest calculator
- Loan payment reference
- Investment and budget category analysis
- Exportable business report
- Sample CSV analysis report
- Jupyter Notebook for reproducible analysis

## Business Analytics

DataMind Pro automatically detects common business fields such as revenue, cost, profit, orders, customers, channels, and regions. Based on the uploaded dataset, it calculates useful business metrics including:

- Revenue
- Cost
- Profit
- Profit margin
- Average order value
- Growth trend
- Business health score
- Top category contribution
- Pareto-style contribution ranking

## Automation

The project includes an automated analysis pipeline:

1. Detect field types
2. Identify business-related columns
3. Calculate business KPIs
4. Evaluate data quality
5. Detect missing values and duplicates
6. Identify outliers
7. Generate rule-based alerts
8. Produce business recommendations
9. Export a structured analysis report

## Personal Finance Module

The finance module includes:

- Compound interest projection
- Monthly investment planning
- Loan payment reference
- Investment category analysis
- Budget and asset allocation overview

This module is useful for demonstrating how the same analytics engine can support both business data and personal finance data.

## Project Structure

```text
DataMind-Pro/
  index.html
  DataMind-Pro-single-file.html
  data/
    sample-business-finance.csv
  reports/
    sample-analysis-report.html
    sample-analysis-report.pdf
  notebooks/
    datamind_analysis.ipynb
  scripts/
    generate-assets.mjs
  README.md
  LICENSE
  package.json
How to Use
Option 1: Open Locally
Download the project and open:

index.html
Then upload a CSV or Excel file.

Option 2: Use GitHub Pages
Upload this repository to GitHub.
Go to repository Settings.
Open Pages.
Select the main branch and root folder.
GitHub Pages will serve index.html as the main app.
Reproduce the Report
The sample report and notebook are generated from:

data/sample-business-finance.csv
To regenerate assets, run:

node scripts/generate-assets.mjs
This creates:

reports/sample-analysis-report.html
reports/sample-analysis-report.pdf
notebooks/datamind_analysis.ipynb
Technologies Used
HTML
CSS
JavaScript
Chart.js
PapaParse
SheetJS
Node.js
Jupyter Notebook
Why This Project Matters
This project demonstrates practical skills in:

Frontend product development
Data analytics
Business intelligence
Financial modeling
Data visualization
Automation workflow design
Report generation
GitHub-ready project packaging
Interview Summary
DataMind Pro Analytics is a browser-based analytics tool that turns raw CSV or Excel files into business insights. It automatically detects key fields, calculates KPIs, identifies risks, generates visualizations, and produces reports. The project also includes a finance module and reproducible analysis notebook, making it suitable as a portfolio project for data analyst, business analyst, finance analyst, or junior developer roles.




