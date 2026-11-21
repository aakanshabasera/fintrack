/* ============================================================
   FinTrack — app.js
   Business Financial Dashboard
   ============================================================ */

// ─── DATA LAYER ──────────────────────────────────────────────
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov'];
const MONTHS_FULL = ['January','February','March','April','May','June','July','August','September','October','November'];

const DATA = {
  revenue:  [62000, 68500, 71200, 75800, 69400, 82000, 79500, 85000, 88000, 91200, 69900],
  expenses: [31000, 33800, 36000, 34500, 35200, 38000, 37500, 40000, 41200, 44000, 20000],
  get profit() { return this.revenue.map((r,i) => r - this.expenses[i]); },

  expenseCategories: {
    Payroll:    [14000,15000,15500,15000,15500,16000,16000,17000,17500,18000,8000],
    Operations: [8000, 8800, 9500, 9000, 9200, 10000, 9500, 11000, 11200, 12000, 5500],
    Marketing:  [4500, 4800, 5000, 4800, 5200, 6000, 5500, 6500, 7000, 7500, 3500],
    Technology: [3500, 4000, 4500, 4200, 4100, 4500, 5000, 4500, 4500, 5000, 2200],
    Other:      [1000, 1200, 1500, 1500, 1200, 1500, 1500, 1000, 1000, 1500, 800],
  },

  fxRates: {
    EUR: { rate: 0.924, change: +0.12 },
    GBP: { rate: 0.792, change: -0.08 },
    JPY: { rate: 149.70, change: +0.34 },
    INR: { rate: 83.42, change: -0.21 },
    CAD: { rate: 1.364, change: +0.05 },
    AUD: { rate: 1.532, change: +0.17 },
    CHF: { rate: 0.886, change: -0.03 },
    CNY: { rate: 7.246, change: +0.09 },
  },

  transactions: [
    { date:'2026-11-21', name:'Enterprise License — TechCorp', category:'Sales', amount:48000, type:'in' },
    { date:'2026-11-20', name:'AWS Infrastructure Q4', category:'Technology', amount:-12400, type:'out' },
    { date:'2026-11-19', name:'Payroll — November Cycle', category:'Payroll', amount:-68000, type:'out' },
    { date:'2026-11-18', name:'Consulting Revenue — Nexus', category:'Sales', amount:22500, type:'in' },
    { date:'2026-11-17', name:'Digital Marketing Campaign', category:'Marketing', amount:-8700, type:'out' },
    { date:'2026-11-16', name:'SaaS Subscriptions', category:'Sales', amount:15800, type:'in' },
    { date:'2026-11-15', name:'Office Lease Q4', category:'Operations', amount:-9500, type:'out' },
    { date:'2026-11-14', name:'Product Revenue — Batch 11', category:'Sales', amount:31200, type:'in' },
    { date:'2026-11-13', name:'Insurance Premium', category:'Operations', amount:-3800, type:'out' },
    { date:'2026-11-12', name:'Partner Commission', category:'Sales', amount:11000, type:'in' },
  ],

  fraudTransactions: [
    { id:'TXN-00841', date:'2026-11-21', amount:92400, merchant:'Unknown Offshore Ltd', risk:9.1, status:'blocked' },
    { id:'TXN-00817', date:'2026-11-20', amount:38200, merchant:'Rapid Wire Services', risk:7.8, status:'review' },
    { id:'TXN-00793', date:'2026-11-19', amount:5800, merchant:'Int\'l Supplier Co.', risk:6.2, status:'review' },
    { id:'TXN-00765', date:'2026-11-18', amount:15400, merchant:'Swift Pay Ltd', risk:8.5, status:'blocked' },
    { id:'TXN-00744', date:'2026-11-17', amount:2200, merchant:'Freelance Dev — INR', risk:5.1, status:'approved' },
    { id:'TXN-00710', date:'2026-11-15', amount:67800, merchant:'Crypto Bridge LLC', risk:9.6, status:'blocked' },
  ],

  expenses_log: [
    { date:'2026-11-21', desc:'AWS EC2 Instances', category:'Technology', amount:4800, status:'approved' },
    { date:'2026-11-20', desc:'Google Ads Campaign', category:'Marketing', amount:7200, status:'approved' },
    { date:'2026-11-19', desc:'November Payroll', category:'Payroll', amount:68000, status:'approved' },
    { date:'2026-11-18', desc:'Office Supplies', category:'Operations', amount:420, status:'pending' },
    { date:'2026-11-17', desc:'Salesforce CRM', category:'Technology', amount:2800, status:'approved' },
    { date:'2026-11-16', desc:'Team Retreat', category:'Operations', amount:12500, status:'pending' },
    { date:'2026-11-15', desc:'Legal Consultation', category:'Operations', amount:3600, status:'approved' },
    { date:'2026-11-14', desc:'LinkedIn Ads', category:'Marketing', amount:1500, status:'approved' },
    { date:'2026-11-13', desc:'Azure Storage', category:'Technology', amount:900, status:'approved' },
    { date:'2026-11-12', desc:'PR Agency Retainer', category:'Marketing', amount:5000, status:'review' },
    { date:'2026-11-11', desc:'Contractor Payments', category:'Payroll', amount:14000, status:'approved' },
    { date:'2026-11-10', desc:'Insurance Premium', category:'Operations', amount:3800, status:'approved' },
  ],

  budget: {
    Payroll:    { budget: 72000, actual: 68000 },
    Operations: { budget: 15000, actual: 18200 },
    Marketing:  { budget: 10000, actual: 7200 },
    Technology: { budget: 8000, actual: 9500 },
    Other:      { budget: 3000, actual: 2800 },
  },

  aiInsights: [
    {
      title: 'Operations Overspend',
      desc: 'Operations expenses exceeded budget by 21.3% this month. Office supplies, legal, and retreat costs are primary drivers.',
      score: 8.2,
      color: '#f4c5ce',
      scoreColor: '#e88fa0',
      severity: 'HIGH',
      severityColor: '#8c2d35',
      severityBg: '#f4c5ce',
    },
    {
      title: 'Revenue Concentration Risk',
      desc: 'Top 3 clients account for 61% of total revenue. Any churn from these accounts creates significant downside risk.',
      score: 6.8,
      color: '#f7e8b0',
      scoreColor: '#d4b44a',
      severity: 'MEDIUM',
      severityColor: '#7a5c10',
      severityBg: '#f7e8b0',
    },
    {
      title: 'Cash Flow Positive Trend',
      desc: 'Net cash position improved by $42,000 this month. AR collection cycle shortened by 4 days vs last quarter.',
      score: 2.1,
      color: '#b8e4ca',
      scoreColor: '#5ec48a',
      severity: 'LOW',
      severityColor: '#1a6e3a',
      severityBg: '#b8e4ca',
    },
    {
      title: 'Payroll Cost Trajectory',
      desc: 'Payroll increased 12.8% YoY driven by new hires. At current growth rate, payroll will exceed 48% of revenue by Q2 2027.',
      score: 5.9,
      color: '#d4c5f0',
      scoreColor: '#9b7dd4',
      severity: 'MEDIUM',
      severityColor: '#5a3d9e',
      severityBg: '#d4c5f0',
    },
    {
      title: 'Marketing ROI Improving',
      desc: 'Revenue per marketing dollar rose from $4.2 to $5.8 this quarter. LinkedIn campaigns outperform Google Ads 2:1.',
      score: 1.8,
      color: '#c8dff0',
      scoreColor: '#6baed6',
      severity: 'POSITIVE',
      severityColor: '#235580',
      severityBg: '#c8dff0',
    },
    {
      title: 'Fraud Risk Elevated',
      desc: '6 high-risk transactions flagged this month totalling $213,800. 3 blocked automatically; 2 require manual review.',
      score: 7.5,
      color: '#f4c5ce',
      scoreColor: '#e88fa0',
      severity: 'HIGH',
      severityColor: '#8c2d35',
      severityBg: '#f4c5ce',
    },
  ],

  remedies: [
    {
      title: 'Reduce Operational Overhead',
      severity: 'HIGH', severityColor: '#8c2d35', severityBg: '#f4c5ce',
      desc: 'Operations costs are 21% over budget. Key drivers are unplanned team retreats and rising legal fees. Immediate action required.',
      actions: [
        'Freeze discretionary spending above $1,000 pending CFO approval',
        'Renegotiate annual legal retainer — target 15% reduction',
        'Implement expense pre-approval workflow for all categories',
        'Review and consolidate SaaS tools — potential $4,200/mo savings',
      ],
      prediction: 'Projected savings: $14,000–$18,000/month if actions are implemented within 30 days.',
      predictionColor: '#e88fa0',
    },
    {
      title: 'Diversify Revenue Streams',
      severity: 'MEDIUM', severityColor: '#7a5c10', severityBg: '#f7e8b0',
      desc: 'Revenue concentration in top 3 clients (61%) creates fragility. Loss of one major client would reduce monthly revenue by ~$28,000.',
      actions: [
        'Launch SMB outbound campaign — target 20 new mid-market accounts',
        'Introduce recurring subscription tier for existing clients',
        'Explore geographic expansion — APAC and EMEA markets identified',
        'Activate referral program with 8% commission incentive',
      ],
      prediction: 'Diversification target: Reduce top-3 concentration to below 40% within 6 months.',
      predictionColor: '#d4b44a',
    },
    {
      title: 'Payroll Optimization',
      severity: 'MEDIUM', severityColor: '#7a5c10', severityBg: '#f7e8b0',
      desc: 'Payroll at 46.3% of revenue and growing. Hiring pace outstrips revenue growth by 2:1 ratio. Rebalancing needed in H1 2027.',
      actions: [
        'Conduct role efficiency audit — identify automation opportunities',
        'Shift 2 junior roles to contractor model — save $36,000 annually',
        'Implement performance-linked variable pay component',
        'Pause non-critical open requisitions until Q2 revenue targets met',
      ],
      prediction: 'Target payroll ratio: 40% of revenue. Estimated 7-month timeline with proposed changes.',
      predictionColor: '#d4b44a',
    },
    {
      title: 'Strengthen Fraud Controls',
      severity: 'HIGH', severityColor: '#8c2d35', severityBg: '#f4c5ce',
      desc: '6 high-risk transactions flagged this month. Pattern analysis suggests testing of payment systems by external actors.',
      actions: [
        'Enable real-time transaction velocity limits per merchant category',
        'Require 2-factor authorization for all transactions above $10,000',
        'Block new international counterparties until KYC completed',
        'Schedule quarterly penetration test of payment infrastructure',
      ],
      prediction: 'Fraud prevention score estimated to improve from 6.4 to 8.5 within 60 days of implementation.',
      predictionColor: '#e88fa0',
    },
  ],
};

// ─── CHART DEFAULTS ──────────────────────────────────────────
Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
Chart.defaults.font.size = 11;
Chart.defaults.color = '#6b6b8a';
Chart.defaults.plugins.legend.display = false;

// ─── CHART INSTANCES ─────────────────────────────────────────
const charts = {};

function destroyChart(key) {
  if (charts[key]) { charts[key].destroy(); delete charts[key]; }
}

// ─── SPARKLINES ──────────────────────────────────────────────
function makeSparkline(id, data, color) {
  const ctx = document.getElementById(id);
  if (!ctx) return;
  destroyChart(id);
  charts[id] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map((_,i) => i),
      datasets: [{ data, borderColor: color, borderWidth: 2, pointRadius: 0, fill: false, tension: 0.4 }]
    },
    options: { responsive: true, animation: false, scales: { x: { display: false }, y: { display: false } }, plugins: { tooltip: { enabled: false } } }
  });
}

function initSparklines() {
  makeSparkline('spark-revenue',  DATA.revenue,  '#6baed6');
  makeSparkline('spark-expenses', DATA.expenses, '#e88fa0');
  makeSparkline('spark-profit',   DATA.profit,   '#5ec48a');
  makeSparkline('spark-margin',   DATA.profit.map((p,i) => +(p/DATA.revenue[i]*100).toFixed(1)), '#d4b44a');
}

// ─── REVENUE vs EXPENSES CHART ───────────────────────────────
function initRevExpChart() {
  const ctx = document.getElementById('chart-revexp');
  if (!ctx) return;
  destroyChart('chart-revexp');
  charts['chart-revexp'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: MONTHS,
      datasets: [
        {
          label: 'Revenue',
          data: DATA.revenue,
          backgroundColor: '#c8dff0',
          borderRadius: 6,
          borderSkipped: false,
        },
        {
          label: 'Expenses',
          data: DATA.expenses,
          backgroundColor: '#f4c5ce',
          borderRadius: 6,
          borderSkipped: false,
        },
        {
          label: 'Profit',
          data: DATA.profit,
          type: 'line',
          borderColor: '#5ec48a',
          backgroundColor: 'rgba(94,196,138,0.08)',
          borderWidth: 2.5,
          pointBackgroundColor: '#5ec48a',
          pointRadius: 4,
          tension: 0.4,
          fill: true,
          yAxisID: 'y',
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` $${ctx.parsed.y.toLocaleString()}`
          }
        }
      },
      scales: {
        x: { grid: { display: false }, border: { display: false } },
        y: {
          grid: { color: 'rgba(0,0,0,0.04)' },
          border: { display: false },
          ticks: { callback: v => '$' + (v/1000).toFixed(0) + 'k' }
        }
      }
    }
  });
}

// ─── EXPENSE DONUT ───────────────────────────────────────────
function initExpenseDonut() {
  const ctx = document.getElementById('chart-expense-donut');
  if (!ctx) return;
  destroyChart('chart-expense-donut');
  const cats = Object.keys(DATA.expenseCategories);
  const totals = cats.map(c => DATA.expenseCategories[c].reduce((a,b) => a+b, 0));
  const colors = ['#c8dff0','#f4c5ce','#b8e4ca','#f7e8b0','#d4c5f0'];
  charts['chart-expense-donut'] = new Chart(ctx, {
    type: 'doughnut',
    data: { labels: cats, datasets: [{ data: totals, backgroundColor: colors, borderWidth: 0, hoverOffset: 6 }] },
    options: {
      cutout: '70%',
      plugins: {
        tooltip: { callbacks: { label: ctx => ` $${ctx.parsed.toLocaleString()}` } }
      }
    }
  });
  const legend = document.getElementById('donut-legend');
  if (legend) {
    legend.innerHTML = cats.map((c,i) => `
      <div class="donut-legend-item">
        <div class="donut-legend-left"><div class="donut-legend-dot" style="background:${colors[i]}"></div>${c}</div>
        <span style="font-weight:600;color:#1c1c2e">$${(totals[i]/1000).toFixed(0)}k</span>
      </div>`).join('');
  }
}

// ─── TRANSACTION LIST ────────────────────────────────────────
function renderTransactionList() {
  const el = document.getElementById('transaction-list');
  if (!el) return;
  el.innerHTML = DATA.transactions.map(tx => `
    <div class="tx-item">
      <div class="tx-info">
        <span class="tx-name">${tx.name}</span>
        <span class="tx-category">${tx.category}</span>
      </div>
      <div style="text-align:right">
        <div class="tx-amount ${tx.type}">${tx.type === 'in' ? '+' : ''}$${Math.abs(tx.amount).toLocaleString()}</div>
        <div class="tx-date">${tx.date}</div>
      </div>
    </div>`).join('');
}

// ─── RISK GAUGE ──────────────────────────────────────────────
function initRiskGauge() {
  const ctx = document.getElementById('risk-gauge');
  if (!ctx) return;
  destroyChart('risk-gauge');
  const score = 72;
  charts['risk-gauge'] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [score, 100 - score],
        backgroundColor: ['#f4c5ce', 'rgba(0,0,0,0.05)'],
        borderWidth: 0,
        circumference: 270,
        rotation: 225,
      }]
    },
    options: {
      cutout: '78%',
      plugins: { tooltip: { enabled: false } }
    }
  });

  const breakdown = document.getElementById('risk-breakdown');
  if (breakdown) {
    const items = [
      { label: 'Fraud Risk', value: 68, color: '#e88fa0' },
      { label: 'Liquidity Risk', value: 42, color: '#d4b44a' },
      { label: 'Operational Risk', value: 55, color: '#9b7dd4' },
    ];
    breakdown.innerHTML = items.map(it => `
      <div class="risk-row">
        <span style="font-size:12px;min-width:110px;color:#6b6b8a">${it.label}</span>
        <div class="risk-bar-bg">
          <div class="risk-bar-fill" style="width:${it.value}%;background:${it.color}"></div>
        </div>
        <span style="font-size:12px;font-weight:600;min-width:28px;text-align:right">${it.value}</span>
      </div>`).join('');
  }
}

// ─── CASH FLOW CHART ─────────────────────────────────────────
function initCashflowChart() {
  const ctx = document.getElementById('chart-cashflow');
  if (!ctx) return;
  destroyChart('chart-cashflow');
  const labels = Array.from({length: 30}, (_,i) => `Nov ${i+1}`).filter((_,i) => i % 3 === 0);
  const actual  = [120, 118, 125, 131, 128, 135, 142, 138, 145, 150].map(v => v * 1000);
  const forecast= [null,null,null,null,null,null,142000, 148000, 155000, 162000];
  charts['chart-cashflow'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: Array.from({length: 10}, (_,i) => `Nov ${(i+1)*3}`),
      datasets: [
        { label: 'Actual', data: actual, borderColor: '#6baed6', backgroundColor: 'rgba(107,174,214,0.1)', fill: true, tension: 0.4, pointRadius: 3, borderWidth: 2 },
        { label: 'Forecast', data: forecast, borderColor: '#d4b44a', backgroundColor: 'rgba(212,180,74,0.08)', fill: true, tension: 0.4, pointRadius: 3, borderWidth: 2, borderDash: [5,4] },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { tooltip: { callbacks: { label: c => ` $${(c.parsed.y/1000).toFixed(0)}k` } } },
      scales: {
        x: { grid: { display: false }, border: { display: false } },
        y: { grid: { color: 'rgba(0,0,0,0.04)' }, border: { display: false }, ticks: { callback: v => '$'+(v/1000).toFixed(0)+'k' } }
      }
    }
  });
}

// ─── P&L TABLE ───────────────────────────────────────────────
function initPnL() {
  const tbody = document.getElementById('pnl-tbody');
  if (!tbody) return;
  const fmt = n => n >= 0 ? `$${n.toLocaleString()}` : `($${Math.abs(n).toLocaleString()})`;
  const rowTotal = arr => arr.reduce((a,b) => a+b, 0);

  const rows = [
    { label: 'REVENUE', isHeader: true },
    { label: 'Product Sales', data: [38000,42000,44000,47000,42000,51000,49000,53000,55000,57000,43000] },
    { label: 'SaaS Subscriptions', data: [14000,15500,16000,16800,16400,18000,17500,18500,19000,20000,15000] },
    { label: 'Consulting', data: [10000,11000,11200,12000,11000,13000,13000,13500,14000,14200,11900] },
    { label: 'Total Revenue', data: DATA.revenue, isTotal: true },

    { label: 'COST OF GOODS', isHeader: true },
    { label: 'Direct Costs', data: DATA.expenses.map(e => Math.round(e * 0.4)) },
    { label: 'Gross Profit', data: DATA.revenue.map((r,i) => r - Math.round(DATA.expenses[i]*0.4)), isTotal: true },

    { label: 'OPERATING EXPENSES', isHeader: true },
    ...Object.entries(DATA.expenseCategories).map(([k,v]) => ({ label: k, data: v })),
    { label: 'Total OpEx', data: DATA.expenses.map((e,i) => Math.round(e*0.6)), isTotal: true },

    { label: 'NET PROFIT / LOSS', data: DATA.profit, isTotal: true },
  ];

  tbody.innerHTML = rows.map(row => {
    if (row.isHeader) return `<tr class="section-header"><td colspan="13">${row.label}</td></tr>`;
    const vals = row.data || [];
    const total = rowTotal(vals);
    return `<tr class="${row.isTotal ? 'total-row' : ''}">
      <td>${row.label}</td>
      ${vals.map(v => `<td class="${v < 0 ? 'negative' : (row.label.includes('Net') || row.label.includes('Gross') ? (v>0?'positive':'negative') : '')}">${fmt(v)}</td>`).join('')}
      <td class="${total < 0 ? 'negative' : 'positive'}" style="font-weight:700">${fmt(total)}</td>
    </tr>`;
  }).join('');

  initWaterfallChart();
  initMarginTrendChart();
}

function initWaterfallChart() {
  const ctx = document.getElementById('chart-waterfall');
  if (!ctx) return;
  destroyChart('chart-waterfall');
  const labels = ['Revenue','COGS','Gross Profit','OpEx','Net Profit'];
  const values = [842500, -156400, 686100, -234800, 451300];
  const colors = values.map(v => v >= 0 ? '#b8e4ca' : '#f4c5ce');
  charts['chart-waterfall'] = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: [{ data: values, backgroundColor: colors, borderRadius: 8, borderSkipped: false }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { tooltip: { callbacks: { label: c => ` $${Math.abs(c.parsed.y).toLocaleString()}` } } },
      scales: {
        x: { grid: { display: false }, border: { display: false } },
        y: { grid: { color: 'rgba(0,0,0,0.04)' }, border: { display: false }, ticks: { callback: v => '$'+(Math.abs(v)/1000).toFixed(0)+'k' } }
      }
    }
  });
}

function initMarginTrendChart() {
  const ctx = document.getElementById('chart-margin-trend');
  if (!ctx) return;
  destroyChart('chart-margin-trend');
  const margins = DATA.profit.map((p,i) => +(p / DATA.revenue[i] * 100).toFixed(1));
  charts['chart-margin-trend'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: MONTHS,
      datasets: [{ data: margins, borderColor: '#9b7dd4', backgroundColor: 'rgba(155,125,212,0.1)', fill: true, tension: 0.4, pointRadius: 4, borderWidth: 2.5 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { tooltip: { callbacks: { label: c => ` ${c.parsed.y}%` } } },
      scales: {
        x: { grid: { display: false }, border: { display: false } },
        y: { grid: { color: 'rgba(0,0,0,0.04)' }, border: { display: false }, ticks: { callback: v => v + '%' } }
      }
    }
  });
}

// ─── EXPENSES PAGE ───────────────────────────────────────────
let activeExpenseFilter = 'all';

function initExpenseBar(filter) {
  const ctx = document.getElementById('chart-expense-bar');
  if (!ctx) return;
  destroyChart('chart-expense-bar');
  const cats = filter === 'all' ? Object.keys(DATA.expenseCategories) : [filter];
  const colors = { Payroll:'#c8dff0', Operations:'#f4c5ce', Marketing:'#b8e4ca', Technology:'#f7e8b0', Other:'#d4c5f0' };
  charts['chart-expense-bar'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: MONTHS,
      datasets: cats.map(c => ({
        label: c,
        data: DATA.expenseCategories[c],
        backgroundColor: colors[c],
        borderRadius: 6,
        borderSkipped: false,
      }))
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: cats.length > 1, position: 'top', align: 'start' }, tooltip: { callbacks: { label: c => ` $${c.parsed.y.toLocaleString()}` } } },
      scales: {
        x: { stacked: filter === 'all', grid: { display: false }, border: { display: false } },
        y: { stacked: filter === 'all', grid: { color: 'rgba(0,0,0,0.04)' }, border: { display: false }, ticks: { callback: v => '$'+(v/1000).toFixed(0)+'k' } }
      }
    }
  });
}

function initBudgetChart() {
  const ctx = document.getElementById('chart-budget');
  if (!ctx) return;
  destroyChart('chart-budget');
  const cats = Object.keys(DATA.budget);
  const budgets = cats.map(c => DATA.budget[c].budget);
  const actuals = cats.map(c => DATA.budget[c].actual);
  charts['chart-budget'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: cats,
      datasets: [
        { label: 'Budget', data: budgets, backgroundColor: 'rgba(107,174,214,0.25)', borderColor: '#6baed6', borderWidth: 1.5, borderRadius: 6, borderSkipped: false },
        { label: 'Actual', data: actuals, backgroundColor: actuals.map((a,i) => a > budgets[i] ? '#f4c5ce' : '#b8e4ca'), borderRadius: 6, borderSkipped: false },
      ]
    },
    options: {
      indexAxis: 'y',
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: true, position: 'top', align: 'start' }, tooltip: { callbacks: { label: c => ` $${c.parsed.x.toLocaleString()}` } } },
      scales: {
        x: { grid: { color: 'rgba(0,0,0,0.04)' }, border: { display: false }, ticks: { callback: v => '$'+(v/1000).toFixed(0)+'k' } },
        y: { grid: { display: false }, border: { display: false } }
      }
    }
  });
}

function renderExpenseTable(filter) {
  const tbody = document.getElementById('expense-tbody');
  if (!tbody) return;
  const rows = filter === 'all' ? DATA.expenses_log : DATA.expenses_log.filter(e => e.category === filter);
  const badge = s => {
    const map = { approved: 'badge-success', pending: 'badge-warning', review: 'badge-info' };
    return `<span class="badge ${map[s] || 'badge-muted'}">${s.charAt(0).toUpperCase() + s.slice(1)}</span>`;
  };
  tbody.innerHTML = rows.map(e => `
    <tr>
      <td>${e.date}</td>
      <td>${e.desc}</td>
      <td><span class="badge badge-muted">${e.category}</span></td>
      <td style="font-weight:600">$${e.amount.toLocaleString()}</td>
      <td>${badge(e.status)}</td>
    </tr>`).join('');
}

// ─── CURRENCY PAGE ───────────────────────────────────────────
function initCurrencyPage() {
  const currencies = ['USD','EUR','GBP','JPY','INR','CAD','AUD','CHF','CNY'];
  const selFrom = document.getElementById('conv-from');
  const selTo = document.getElementById('conv-to');
  if (!selFrom || !selTo) return;

  currencies.forEach(c => {
    selFrom.add(new Option(c, c));
    selTo.add(new Option(c, c));
  });
  selFrom.value = 'USD';
  selTo.value = 'EUR';

  document.getElementById('do-convert')?.addEventListener('click', doConvert);
  document.getElementById('swap-currencies')?.addEventListener('click', () => {
    const tmp = selFrom.value;
    selFrom.value = selTo.value;
    selTo.value = tmp;
    doConvert();
  });

  // FX rates grid
  const grid = document.getElementById('fx-rates-grid');
  if (grid) {
    grid.innerHTML = Object.entries(DATA.fxRates).map(([cur, {rate, change}]) => `
      <div class="fx-rate-item">
        <span class="fx-currency">USD / ${cur}</span>
        <span class="fx-rate">${rate.toLocaleString()}</span>
        <span class="fx-change ${change >= 0 ? 'up' : 'down'}">${change >= 0 ? '+' : ''}${change}%</span>
      </div>`).join('');
  }

  initFxExposureChart();
  initFxHistoryChart();
  doConvert();
}

function doConvert() {
  const from = document.getElementById('conv-from')?.value;
  const to = document.getElementById('conv-to')?.value;
  const amount = parseFloat(document.getElementById('conv-amount')?.value) || 0;
  const rates = { USD:1, ...Object.fromEntries(Object.entries(DATA.fxRates).map(([k,v]) => [k,v.rate])) };
  const result = amount / rates[from] * rates[to];
  const resultEl = document.getElementById('conv-result');
  if (resultEl) resultEl.value = result.toFixed(4);
  const info = document.getElementById('rate-info');
  if (info) info.textContent = `1 ${from} = ${(rates[to]/rates[from]).toFixed(4)} ${to}  •  Rate updated Nov 21, 2026`;
}

function initFxExposureChart() {
  const ctx = document.getElementById('chart-fx-exposure');
  if (!ctx) return;
  destroyChart('chart-fx-exposure');
  const labels = ['USD','EUR','GBP','INR','Other'];
  const data = [52, 18, 12, 10, 8];
  const colors = ['#c8dff0','#f4c5ce','#b8e4ca','#f7e8b0','#d4c5f0'];
  charts['chart-fx-exposure'] = new Chart(ctx, {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0, hoverOffset: 6 }] },
    options: {
      cutout: '65%',
      plugins: {
        legend: { display: true, position: 'bottom' },
        tooltip: { callbacks: { label: c => ` ${c.parsed}%` } }
      }
    }
  });
}

function initFxHistoryChart() {
  const ctx = document.getElementById('chart-fx-history');
  if (!ctx) return;
  destroyChart('chart-fx-history');
  const labels = Array.from({length: 30}, (_,i) => `Oct ${i+1 <= 11 ? i+1 : 'Nov '+(i-10)}`).filter((_,i) => i%5===0);
  const eur = [0.912, 0.918, 0.921, 0.924, 0.919, 0.924];
  const gbp = [0.785, 0.788, 0.791, 0.793, 0.790, 0.792];
  const inr = [83.1, 83.2, 83.35, 83.3, 83.4, 83.42];
  charts['chart-fx-history'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Oct 1','Oct 6','Oct 11','Oct 16','Oct 21','Nov 1'],
      datasets: [
        { label: 'EUR', data: eur, borderColor: '#6baed6', borderWidth: 2, tension: 0.4, pointRadius: 3 },
        { label: 'GBP', data: gbp, borderColor: '#e88fa0', borderWidth: 2, tension: 0.4, pointRadius: 3 },
        { label: 'INR (÷10)', data: inr.map(v => v/10), borderColor: '#5ec48a', borderWidth: 2, tension: 0.4, pointRadius: 3 },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: true, position: 'top', align: 'start' } },
      scales: {
        x: { grid: { display: false }, border: { display: false } },
        y: { grid: { color: 'rgba(0,0,0,0.04)' }, border: { display: false }, ticks: { callback: v => v.toFixed(2) } }
      }
    }
  });
}

// ─── FRAUD MONITOR ───────────────────────────────────────────
function initFraudPage() {
  initFraudTimeline();
  initFraudCatChart();
  renderFraudTable();
}

function initFraudTimeline() {
  const ctx = document.getElementById('chart-fraud-timeline');
  if (!ctx) return;
  destroyChart('chart-fraud-timeline');
  const data  = [2, 1, 3, 0, 2, 4, 1, 2, 3, 2, 1, 0, 1, 3, 4, 2, 1, 1, 2, 3, 2, 1, 0, 2, 3, 1, 2, 4, 2, 1];
  const flags = [1, 0, 2, 0, 1, 3, 0, 1, 2, 1, 0, 0, 0, 2, 3, 1, 0, 1, 1, 2, 1, 0, 0, 1, 2, 0, 1, 3, 1, 0];
  charts['chart-fraud-timeline'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Array.from({length:30},(_,i)=> i+1),
      datasets: [
        { label: 'Transactions', data, backgroundColor: '#c8dff0', borderRadius: 4, borderSkipped: false },
        { label: 'Flagged', data: flags, backgroundColor: '#f4c5ce', borderRadius: 4, borderSkipped: false },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: true, position: 'top', align: 'start' } },
      scales: {
        x: { stacked: true, grid: { display: false }, border: { display: false } },
        y: { stacked: true, grid: { color: 'rgba(0,0,0,0.04)' }, border: { display: false } }
      }
    }
  });
}

function initFraudCatChart() {
  const ctx = document.getElementById('chart-fraud-cat');
  if (!ctx) return;
  destroyChart('chart-fraud-cat');
  charts['chart-fraud-cat'] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Unusual Amount','New Counterparty','Velocity','Geographic','Crypto Bridge'],
      datasets: [{ data: [38, 24, 18, 12, 8], backgroundColor: ['#f4c5ce','#f7e8b0','#d4c5f0','#c8dff0','#b8e4ca'], borderWidth: 0, hoverOffset: 6 }]
    },
    options: { cutout: '60%', plugins: { legend: { display: true, position: 'bottom' } } }
  });
}

function renderFraudTable() {
  const tbody = document.getElementById('fraud-tbody');
  if (!tbody) return;
  const riskBadge = score => {
    if (score >= 8) return `<span class="badge badge-danger">${score.toFixed(1)}</span>`;
    if (score >= 6) return `<span class="badge badge-warning">${score.toFixed(1)}</span>`;
    return `<span class="badge badge-success">${score.toFixed(1)}</span>`;
  };
  const statusBadge = s => {
    const map = { blocked: 'badge-danger', review: 'badge-warning', approved: 'badge-success' };
    return `<span class="badge ${map[s]}">${s.charAt(0).toUpperCase() + s.slice(1)}</span>`;
  };
  tbody.innerHTML = DATA.fraudTransactions.map(tx => `
    <tr>
      <td style="font-family:monospace;font-size:12px">${tx.id}</td>
      <td>${tx.date}</td>
      <td style="font-weight:600">$${tx.amount.toLocaleString()}</td>
      <td>${tx.merchant}</td>
      <td>${riskBadge(tx.risk)}</td>
      <td>${statusBadge(tx.status)}</td>
      <td>
        <div style="display:flex;gap:6px">
          <button class="risk-btn risk-btn-approve">Approve</button>
          <button class="risk-btn risk-btn-review">Review</button>
          <button class="risk-btn risk-btn-block">Block</button>
        </div>
      </td>
    </tr>`).join('');
}

// ─── AI INSIGHTS PAGE ────────────────────────────────────────
function initAIPage() {
  renderAIInsights();
  initForecastChart();
  renderHealthScores();
  renderRemedies();
}

function renderAIInsights() {
  const grid = document.getElementById('ai-insights-grid');
  if (!grid) return;
  grid.innerHTML = DATA.aiInsights.map(ins => `
    <div class="insight-card" style="background:${ins.color}22;border-color:${ins.color}">
      <div class="insight-icon" style="background:${ins.color}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${ins.scoreColor}" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <span class="insight-title">${ins.title}</span>
        <span class="badge" style="background:${ins.severityBg};color:${ins.severityColor}">${ins.severity}</span>
      </div>
      <div class="insight-desc">${ins.desc}</div>
      <div class="insight-score">
        <div class="score-label"><span>Risk Score</span><span style="font-weight:700;color:${ins.scoreColor}">${ins.score}/10</span></div>
        <div class="score-bar-bg"><div class="score-bar-fill" style="width:${ins.score*10}%;background:${ins.scoreColor}"></div></div>
      </div>
    </div>`).join('');
}

function initForecastChart() {
  const ctx = document.getElementById('chart-forecast');
  if (!ctx) return;
  destroyChart('chart-forecast');
  const histLabels = MONTHS.slice(0,8);
  const histData = DATA.revenue.slice(0,8);
  const fcastLabels = ['Sep','Oct','Nov','Dec','Jan 27','Feb 27','Mar 27'];
  const fcastData   = [88000, 91200, null, 96000, 102000, 108000, 115000];
  const lowerBand   = [null, null, null, 90000, 95000, 100000, 108000];
  const upperBand   = [null, null, null, 102000, 109000, 116000, 122000];
  charts['chart-forecast'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [...histLabels, ...fcastLabels.slice(1)],
      datasets: [
        { label: 'Actual', data: [...histData, 88000, 91200], borderColor: '#6baed6', backgroundColor: 'rgba(107,174,214,0.1)', fill: true, tension: 0.4, pointRadius: 4, borderWidth: 2.5 },
        { label: 'Forecast', data: [...Array(histData.length).fill(null), null, 91200, 96000, 102000, 108000, 115000], borderColor: '#d4b44a', borderDash: [6,4], tension: 0.4, pointRadius: 4, borderWidth: 2 },
        { label: 'Upper Band', data: [...Array(histData.length+1).fill(null), 95000, 102000, 109000, 116000, 122000], borderColor: 'transparent', backgroundColor: 'rgba(212,180,74,0.1)', fill: '+1', pointRadius: 0 },
        { label: 'Lower Band', data: [...Array(histData.length+1).fill(null), 88000, 90000, 95000, 100000, 108000], borderColor: 'transparent', backgroundColor: 'rgba(212,180,74,0.1)', fill: false, pointRadius: 0 },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: true, position: 'top', align: 'start' }, tooltip: { callbacks: { label: c => c.parsed.y ? ` $${c.parsed.y.toLocaleString()}` : '' } } },
      scales: {
        x: { grid: { display: false }, border: { display: false } },
        y: { grid: { color: 'rgba(0,0,0,0.04)' }, border: { display: false }, ticks: { callback: v => '$'+(v/1000).toFixed(0)+'k' } }
      }
    }
  });
}

function renderHealthScores() {
  const el = document.getElementById('health-scores');
  if (!el) return;
  const scores = [
    { label: 'Overall Financial Health', value: 74, color: '#6baed6' },
    { label: 'Liquidity', value: 82, color: '#5ec48a' },
    { label: 'Profitability', value: 68, color: '#d4b44a' },
    { label: 'Revenue Growth', value: 79, color: '#9b7dd4' },
    { label: 'Cost Efficiency', value: 55, color: '#e88fa0' },
    { label: 'Risk Exposure', value: 42, color: '#e88fa0' },
  ];
  el.innerHTML = scores.map(s => `
    <div class="health-item">
      <div class="health-label"><span>${s.label}</span><span style="color:${s.color}">${s.value}%</span></div>
      <div class="health-bar-bg"><div class="health-bar-fill" style="width:${s.value}%;background:${s.color}"></div></div>
    </div>`).join('');
}

function renderRemedies() {
  const grid = document.getElementById('remedies-grid');
  if (!grid) return;
  grid.innerHTML = DATA.remedies.map(r => `
    <div class="remedy-card">
      <div class="remedy-header">
        <span class="remedy-severity" style="background:${r.severityBg};color:${r.severityColor}">${r.severity}</span>
        <span class="remedy-title">${r.title}</span>
      </div>
      <p class="remedy-desc">${r.desc}</p>
      <div class="remedy-actions">
        ${r.actions.map(a => `<div class="remedy-action">${a}</div>`).join('')}
      </div>
      <div class="remedy-prediction" style="border-left-color:${r.predictionColor}">
        <strong>Prediction:</strong> ${r.prediction}
      </div>
    </div>`).join('');
}

// ─── REPORTS PAGE ────────────────────────────────────────────
function initReportsPage() {
  initYoYChart();
  initQuarterlyChart();
  renderReportList();
}

function initYoYChart() {
  const ctx = document.getElementById('chart-yoy');
  if (!ctx) return;
  destroyChart('chart-yoy');
  const prev = [52000, 56000, 61000, 64000, 59000, 68000, 65000, 72000, 74000, 78000, 60000];
  charts['chart-yoy'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: MONTHS,
      datasets: [
        { label: '2025', data: prev, borderColor: '#d4c5f0', backgroundColor: 'rgba(212,197,240,0.1)', fill: true, tension: 0.4, pointRadius: 3, borderWidth: 2 },
        { label: '2026', data: DATA.revenue, borderColor: '#6baed6', backgroundColor: 'rgba(107,174,214,0.1)', fill: true, tension: 0.4, pointRadius: 3, borderWidth: 2.5 },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: true, position: 'top', align: 'start' }, tooltip: { callbacks: { label: c => ` $${c.parsed.y.toLocaleString()}` } } },
      scales: {
        x: { grid: { display: false }, border: { display: false } },
        y: { grid: { color: 'rgba(0,0,0,0.04)' }, border: { display: false }, ticks: { callback: v => '$'+(v/1000).toFixed(0)+'k' } }
      }
    }
  });
}

function initQuarterlyChart() {
  const ctx = document.getElementById('chart-quarterly');
  if (!ctx) return;
  destroyChart('chart-quarterly');
  const qRevenue  = [201700, 227200, 252500, 161100];
  const qExpenses = [100800, 107700, 122700, 64000];
  const qProfit   = qRevenue.map((r,i) => r - qExpenses[i]);
  charts['chart-quarterly'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Q1 2026','Q2 2026','Q3 2026','Q4 (YTD)'],
      datasets: [
        { label: 'Revenue', data: qRevenue, backgroundColor: '#c8dff0', borderRadius: 6, borderSkipped: false },
        { label: 'Expenses', data: qExpenses, backgroundColor: '#f4c5ce', borderRadius: 6, borderSkipped: false },
        { label: 'Profit', data: qProfit, backgroundColor: '#b8e4ca', borderRadius: 6, borderSkipped: false },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: true, position: 'top', align: 'start' }, tooltip: { callbacks: { label: c => ` $${c.parsed.y.toLocaleString()}` } } },
      scales: {
        x: { grid: { display: false }, border: { display: false } },
        y: { grid: { color: 'rgba(0,0,0,0.04)' }, border: { display: false }, ticks: { callback: v => '$'+(v/1000).toFixed(0)+'k' } }
      }
    }
  });
}

function renderReportList() {
  const el = document.getElementById('report-list');
  if (!el) return;
  const reports = [
    { name: 'P&L Statement — November 2026', meta: 'Generated Nov 21, 2026  •  PDF  •  2.4 MB', color: '#c8dff0' },
    { name: 'Quarterly Revenue Report Q3 2026', meta: 'Generated Oct 1, 2026  •  PDF  •  1.8 MB', color: '#b8e4ca' },
    { name: 'Expense Audit — October 2026', meta: 'Generated Nov 1, 2026  •  XLSX  •  980 KB', color: '#f7e8b0' },
    { name: 'Fraud Risk Assessment Q3 2026', meta: 'Generated Oct 5, 2026  •  PDF  •  3.1 MB', color: '#f4c5ce' },
    { name: 'FX Exposure Summary — 2026 YTD', meta: 'Generated Nov 15, 2026  •  PDF  •  1.2 MB', color: '#d4c5f0' },
  ];
  el.innerHTML = reports.map(r => `
    <div class="report-item">
      <div class="report-info">
        <div class="report-icon" style="background:${r.color}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1c1c2e" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <div>
          <div class="report-name">${r.name}</div>
          <div class="report-meta">${r.meta}</div>
        </div>
      </div>
      <div class="report-actions">
        <button class="btn-outline">Preview</button>
        <button class="btn-primary" style="font-size:12px;padding:7px 14px">Download</button>
      </div>
    </div>`).join('');
}

// ─── TRANSACTION MODAL ───────────────────────────────────────
function initModal() {
  const overlay = document.getElementById('modal-overlay');
  const btn = document.getElementById('add-transaction-btn');
  const close = document.getElementById('modal-close');
  const save = document.getElementById('save-transaction');
  const dateInput = document.getElementById('tx-date');

  if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
  btn?.addEventListener('click', () => overlay?.classList.add('open'));
  close?.addEventListener('click', () => overlay?.classList.remove('open'));
  overlay?.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('open'); });
  save?.addEventListener('click', () => {
    const type = document.getElementById('tx-type')?.value;
    const cat = document.getElementById('tx-category')?.value;
    const amount = parseFloat(document.getElementById('tx-amount')?.value);
    const date = document.getElementById('tx-date')?.value;
    const desc = document.getElementById('tx-desc')?.value;
    if (!amount || !desc) { alert('Please fill in all fields.'); return; }
    DATA.transactions.unshift({ date, name: desc, category: cat, amount: type === 'Revenue' ? amount : -amount, type: type === 'Revenue' ? 'in' : 'out' });
    renderTransactionList();
    overlay?.classList.remove('open');
  });
}

// ─── SETTINGS SLIDERS ────────────────────────────────────────
function initSettingsPage() {
  const fraudSlider = document.getElementById('fraud-threshold');
  const budgetSlider = document.getElementById('budget-threshold');
  const fraudVal = document.getElementById('fraud-threshold-val');
  const budgetVal = document.getElementById('budget-threshold-val');
  fraudSlider?.addEventListener('input', () => { if (fraudVal) fraudVal.textContent = parseFloat(fraudSlider.value).toFixed(1); });
  budgetSlider?.addEventListener('input', () => { if (budgetVal) budgetVal.textContent = budgetSlider.value + '%'; });
}

// ─── NAVIGATION ──────────────────────────────────────────────
const PAGE_TITLES = {
  dashboard: ['Dashboard', 'Overview — November 2026'],
  pnl:       ['P&L Report', 'Profit & Loss — YTD 2026'],
  expenses:  ['Expenses', 'Tracking & Categorization'],
  currency:  ['Currency', 'FX Rates & Conversion'],
  fraud:     ['Fraud Monitor', 'Risk & Anomaly Detection'],
  ai:        ['AI Insights', 'Automated Financial Intelligence'],
  reports:   ['Reports', 'Downloadable Documents'],
  settings:  ['Settings', 'Preferences & Configuration'],
};

const PAGE_INITS = {
  dashboard: initDashboard,
  pnl:       initPnL,
  expenses:  initExpensesPage,
  currency:  initCurrencyPage,
  fraud:     initFraudPage,
  ai:        initAIPage,
  reports:   initReportsPage,
  settings:  initSettingsPage,
};

function initDashboard() {
  initSparklines();
  initRevExpChart();
  initExpenseDonut();
  renderTransactionList();
  initRiskGauge();
  initCashflowChart();
}

function initExpensesPage() {
  initExpenseBar(activeExpenseFilter);
  initBudgetChart();
  renderExpenseTable(activeExpenseFilter);

  document.querySelectorAll('.filter-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeExpenseFilter = btn.dataset.filter;
      initExpenseBar(activeExpenseFilter);
      renderExpenseTable(activeExpenseFilter);
    });
  });

  document.getElementById('expense-search')?.addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll('#expense-tbody tr').forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
}

let currentPage = 'dashboard';

function navigate(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(`page-${page}`)?.classList.add('active');
  document.getElementById(`nav-${page}`)?.classList.add('active');
  const [title, subtitle] = PAGE_TITLES[page] || ['Dashboard', ''];
  document.getElementById('page-title').textContent = title;
  document.getElementById('page-subtitle').textContent = subtitle;
  currentPage = page;
  if (PAGE_INITS[page]) PAGE_INITS[page]();
}

// ─── BOOT ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      navigate(item.dataset.page);
    });
  });

  initModal();
  navigate('dashboard');
});
