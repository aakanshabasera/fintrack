'use strict';
/* FinTrack — workspace-based financial dashboard. All figures are derived from transactions. */
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MFULL=['January','February','March','April','May','June','July','August','September','October','November','December'];
const SYM={USD:'$',EUR:'€',GBP:'£',INR:'₹',JPY:'¥',CAD:'C$',AUD:'A$',CHF:'CHF ',CNY:'CN¥'};
const CUR_NAMES={USD:'US Dollar',EUR:'Euro',GBP:'British Pound',INR:'Indian Rupee',JPY:'Japanese Yen',CAD:'Canadian Dollar',AUD:'Australian Dollar',CHF:'Swiss Franc',CNY:'Chinese Yuan'};
const TZS=['UTC+5:30 — IST','UTC+0:00 — GMT','UTC-5:00 — EST','UTC-8:00 — PST','UTC+1:00 — CET','UTC+8:00 — SGT'];
let FX={USD:1,EUR:.924,GBP:.792,JPY:149.7,INR:83.42,CAD:1.364,AUD:1.532,CHF:.886,CNY:7.246},fxLive=false,fxTime=null;
const DEF_CATS=['Payroll','Operations','Marketing','Technology','Other'];
const COLORS=['#c8dff0','#f4c5ce','#b8e4ca','#f7e8b0','#d4c5f0','#f8d9c8','#c2eae0'];
const KEY='fintrack.v2';
const pad=n=>String(n).padStart(2,'0');
const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const TODAY=new Date(new Date().setHours(0,0,0,0));
const DT=s=>new Date(s+'T00:00:00');
let uidN=0;const uid=p=>p+Date.now().toString(36)+(uidN++).toString(36)+Math.random().toString(36).slice(2,5);

/* ---------- storage ---------- */
function demoTx(){
  const rev={'Product Sales':[38000,42000,44000,47000,42000,51000,49000,53000,55000,57000],'SaaS Subscriptions':[14000,15500,16000,16800,16400,18000,17500,18500,19000,20000],'Consulting':[10000,11000,11200,12000,11000,13000,13000,13500,14000,14200]};
  const exp={Payroll:[14000,15000,15500,15000,15500,16000,16000,17000,17500,18000],Operations:[8000,8800,9500,9000,9200,10000,9500,11000,11200,12000],Marketing:[4500,4800,5000,4800,5200,6000,5500,6500,7000,7500],Technology:[3500,4000,4500,4200,4100,4500,5000,4500,4500,5000],Other:[1000,1200,1500,1500,1200,1500,1500,1000,1000,1500]};
  const out=[],add=(date,desc,category,type,amount,currency='USD',status='approved')=>out.push({id:uid('d'),date,desc,category,type,amount,currency,status,src:'demo'});
  for(let i=0;i<10;i++){const b=10-i;
    const r=new Date(TODAY.getFullYear(),TODAY.getMonth()-b,15),e=new Date(TODAY.getFullYear(),TODAY.getMonth()-b,20);
    for(const k in rev)add(iso(r),k+' — monthly',k,'in',rev[k][i]);
    for(const k in exp)add(iso(e),k+' — monthly',k,'out',exp[k][i]);}
  const ago=n=>{const d=new Date(TODAY);d.setDate(d.getDate()-n);return iso(d)};
  [[0,'Enterprise License — TechCorp','Sales','in',48000],[3,'Consulting Revenue — Nexus','Consulting','in',22500],[5,'SaaS Subscriptions','SaaS Subscriptions','in',15800],[7,'Product Revenue — Batch 11','Product Sales','in',31200],[9,'Partner Commission','Sales','in',11000],
   [1,'AWS Infrastructure Q4','Technology','out',12400],[2,'November Payroll','Payroll','out',17800],[4,'Digital Marketing Campaign','Marketing','out',8700],[6,'Office Lease Q4','Operations','out',9500],[8,'Insurance Premium','Operations','out',3800],
   [3,'Team Retreat','Operations','out',12500,'pending'],[5,'PR Agency Retainer','Marketing','out',5000,'review'],[10,'Legal Consultation','Operations','out',3600],[11,'Office Supplies','Operations','out',420,'pending']
  ].forEach(a=>add(ago(a[0]),a[1],a[2],a[3],a[4],'USD',a[5]||'approved'));
  add(ago(4),'EU Reseller — Berlin','Sales','in',14000,'EUR');add(ago(6),'London Retainer','Consulting','in',9000,'GBP');add(ago(2),'Freelance Dev — Pune','Payroll','out',240000,'INR');add(ago(1),'Unknown Offshore Ltd','Other','out',38200,'USD','review');
  return out;
}
function newWs(name,currency,source){return{id:uid('w'),name,currency,fiscal:0,tz:TZS[0],user:'Admin',source,
  th:{fraud:7,budget:15,large:50000,email:true,fraudAlerts:true,weekly:false},
  budgets:source==='demo'?{Payroll:20000,Operations:10000,Marketing:6000,Technology:5000,Other:1500}:{},
  api:{url:'',header:'Authorization',key:'',last:null},fraudStatus:{},tx:source==='demo'?demoTx():[]};}
function load(){try{const s=JSON.parse(localStorage.getItem(KEY));if(s&&s.workspaces&&s.workspaces[s.active])return s;}catch(e){}
  const w=newWs('Acme Corporation','USD','demo');return{active:w.id,workspaces:{[w.id]:w}};}
let store=load();
function save(){try{localStorage.setItem(KEY,JSON.stringify(store));return true}catch(e){toast('Could not save — browser storage is full or blocked','error');return false}}
const W=()=>store.workspaces[store.active];
const sym=()=>SYM[W().currency]||W().currency+' ';
const baseAmt=t=>Math.abs(t.amount)/(FX[t.currency]||1)*(FX[W().currency]||1);
const money=n=>{const neg=n<0;return(neg?'-':'')+sym()+Math.round(Math.abs(n)).toLocaleString(W().currency==='INR'?'en-IN':'en-US')};
const kfmt=n=>{const a=Math.abs(n);return(n<0?'-':'')+sym()+(a>=1e6?(a/1e6).toFixed(1)+'M':a>=1e3?(a/1e3).toFixed(a>=1e5?0:1).replace('.0','')+'k':Math.round(a))};
const cats=()=>[...new Set([...DEF_CATS,...W().tx.filter(t=>t.type==='out').map(t=>t.category)])];

/* ---------- UI helpers ---------- */
function toast(msg,kind='ok'){const t=$('toast');t.textContent=msg;t.className='toast show '+kind;clearTimeout(toast.t);toast.t=setTimeout(()=>t.className='toast',3200);}
function openGM(title,html,wide){$('gm-title').textContent=title;$('gm-body').innerHTML=html;$('gm-box').style.width=wide?'760px':'520px';$('gm').classList.add('open');}
const closeGM=()=>$('gm').classList.remove('open');
const charts={};
function mk(id,cfg){const c=$(id);if(!c)return;if(charts[id])charts[id].destroy();charts[id]=new Chart(c,cfg);}
Chart.defaults.font.family="'Inter',system-ui,sans-serif";Chart.defaults.font.size=11;Chart.defaults.color='#6b6b8a';Chart.defaults.plugins.legend.display=false;
const axes=(stack)=>({x:{stacked:!!stack,grid:{display:false},border:{display:false}},y:{stacked:!!stack,grid:{color:'rgba(0,0,0,0.04)'},border:{display:false},ticks:{callback:v=>kfmt(v)}}});
const baseOpt=(legend,stack)=>({responsive:true,maintainAspectRatio:false,plugins:{legend:{display:!!legend,position:'top',align:'start'},tooltip:{callbacks:{label:c=>` ${c.dataset.label?c.dataset.label+': ':''}${money(c.parsed.y??c.parsed.x??c.parsed)}`}}},scales:axes(stack)});
const empty=(el,msg)=>{if(el)el.innerHTML=`<div class="empty">${msg}</div>`};

/* ---------- derived data ---------- */
const days=()=>parseInt($('period-select').value,10)||30;
const winOf=(n,shift=0)=>{const e=new Date(TODAY);e.setDate(e.getDate()-shift*n);const s=new Date(e);s.setDate(s.getDate()-(n-1));return[iso(s),iso(e)]};
const inW=(t,w)=>t.date>=w[0]&&t.date<=w[1];
const sumT=(type,w)=>W().tx.filter(t=>t.type===type&&inW(t,w)).reduce((a,t)=>a+baseAmt(t),0);
const catT=(type,w)=>{const m={};W().tx.filter(t=>t.type===type&&inW(t,w)).forEach(t=>m[t.category]=(m[t.category]||0)+baseAmt(t));return m};
function monthList(n){const o=[];for(let k=n-1;k>=0;k--){const d=new Date(TODAY.getFullYear(),TODAY.getMonth()-k,1);o.push({key:`${d.getFullYear()}-${pad(d.getMonth()+1)}`,label:MON[d.getMonth()],y:d.getFullYear(),m:d.getMonth()})}return o}
function agg(type){const m={};W().tx.filter(t=>t.type===type).forEach(t=>{const k=t.date.slice(0,7);(m[t.category]=m[t.category]||{})[k]=(m[t.category][k]||0)+baseAmt(t)});return m}
const monthSum=(a,key)=>Object.values(a).reduce((s,c)=>s+(c[key]||0),0);
function monthly(n=12){const ml=monthList(n),R=agg('in'),E=agg('out');const rev=ml.map(x=>monthSum(R,x.key)),exp=ml.map(x=>monthSum(E,x.key));return{ml,labels:ml.map(x=>x.label),rev,exp,profit:rev.map((r,i)=>r-exp[i]),R,E}}
const pct=(a,b)=>b?((a-b)/Math.abs(b)*100):null;
const chg=(v,suf='%')=>v==null?'no prior data':`${v>=0?'+':''}${v.toFixed(1)}${suf} vs last period`;
function riskOf(t,med){const a=baseAmt(t),th=W().th;let s=1;const r=[];const z=Math.log10(Math.max(1,a/med));
  if(z>.5){s+=Math.min(4,z*2.5);r.push('Unusual amount')}if(a>=th.large){s+=2.5;r.push('Large transaction')}
  if(t.currency!==W().currency){s+=1;r.push('Foreign currency')}const dw=DT(t.date).getDay();if((dw===0||dw===6)&&t.type==='out'){s+=.8;r.push('Weekend payment')}
  if(a>=5000&&a%1000===0){s+=.7;r.push('Round amount')}return{score:Math.min(10,+s.toFixed(1)),reasons:r}}
function fraud(w){const tx=W().tx;if(!tx.length)return[];const am=tx.map(baseAmt).sort((a,b)=>a-b),med=am[Math.floor(am.length/2)]||1;
  return tx.filter(t=>inW(t,w)).map(t=>({t,...riskOf(t,med)})).filter(x=>x.score>W().th.fraud).sort((a,b)=>b.score-a.score).map(x=>({...x,status:W().fraudStatus[x.t.id]||(x.score>=9?'blocked':'review')}))}
function budgetRows(){const cur=monthList(1)[0].key,E=agg('out'),b=W().budgets;return[...new Set([...Object.keys(b),...Object.keys(E)])].map(c=>({c,budget:+b[c]||0,actual:(E[c]||{})[cur]||0}))}
function alerts(){const out=[],w=winOf(days()),th=W().th,tx=W().tx;
  if(!tx.length)return[{sev:'info',title:'No data yet',desc:'Import a CSV, connect an API or add a transaction to get started.'}];
  const f=fraud(w);if(f.length&&th.fraudAlerts)out.push({sev:'high',title:`${f.length} transaction(s) above fraud threshold`,desc:`Highest risk score: ${f[0].score} (${f[0].t.desc}).`});
  budgetRows().filter(r=>r.budget&&r.actual>r.budget*(1+th.budget/100)).forEach(r=>out.push({sev:'high',title:`${r.c} is over budget`,desc:`${money(r.actual)} spent vs ${money(r.budget)} budget this month (+${((r.actual/r.budget-1)*100).toFixed(0)}%).`}));
  const big=tx.filter(t=>inW(t,w)&&baseAmt(t)>=th.large);if(big.length)out.push({sev:'med',title:`${big.length} large transaction(s)`,desc:`At or above your ${money(th.large)} limit in this period.`});
  const r=sumT('in',w),e=sumT('out',w);if(r>0&&(r-e)/r<.1)out.push({sev:'med',title:'Profit margin below 10%',desc:`Margin is ${((r-e)/r*100).toFixed(1)}% for the selected period.`});
  return out}

/* ---------- chrome ---------- */
function chrome(){const w=W();$('side-company').textContent=w.name;$('side-user').textContent=w.user;
  $('side-avatar').textContent=w.name.split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase();
  const n=alerts().filter(a=>a.sev!=='info').length;const b=$('bell-badge');b.textContent=n;b.style.display=n?'flex':'none';
  document.title=`${w.name} — FinTrack`;
  const dn=$('data-notice');const lab={demo:'<strong>Demo data:</strong> this workspace contains sample transactions.',blank:'<strong>No data yet.</strong> Add your first transaction or import your records.',csv:`<strong>Source: CSV import</strong> • ${w.tx.length} transactions`,api:`<strong>Source: API</strong> • ${w.tx.length} transactions • last sync ${w.api.last?new Date(w.api.last).toLocaleString():'never'}`}[w.source]||'';
  dn.innerHTML=`<div class="data-notice ${w.source==='demo'||!w.tx.length?'':'ok'}"><div class="data-notice-dot"></div><span>${lab}</span>${w.source==='demo'||!w.tx.length?'<span class="notice-actions"><button class="btn-outline" data-go="sources">Connect your data</button><button class="btn-outline" data-act="clear-demo">Start with empty workspace</button></span>':''}</div>`;}

/* ---------- Dashboard ---------- */
function initDashboard(){
  const w=winOf(days()),p=winOf(days(),1),M=monthly(),r=sumT('in',w),e=sumT('out',w),pr=sumT('in',p),pe=sumT('out',p);
  const mg=r?(r-e)/r*100:0,pm=pr?(pr-pe)/pr*100:null;
  const card=(c,l,v,ch,good,id)=>`<div class="kpi-card ${c}"><div class="kpi-label">${l}</div><div class="kpi-value">${v}</div><div class="kpi-change ${good?'positive':'negative'}">${ch}</div><div class="kpi-sparkline"><canvas id="${id}" height="32"></canvas></div></div>`;
  $('kpi-row').innerHTML=card('kpi-revenue','Total Revenue',money(r),chg(pct(r,pr)),(pct(r,pr)||0)>=0,'sp-r')+card('kpi-expenses','Total Expenses',money(e),chg(pct(e,pe)),(pct(e,pe)||0)<=0,'sp-e')+card('kpi-profit','Net Profit',money(r-e),chg(pct(r-e,pr-pe)),(pct(r-e,pr-pe)||0)>=0,'sp-p')+card('kpi-margin','Profit Margin',mg.toFixed(1)+'%',pm==null?'no prior data':`${mg-pm>=0?'+':''}${(mg-pm).toFixed(1)}pp vs last period`,pm==null||mg>=pm,'sp-m');
  const sp=(id,d,c)=>mk(id,{type:'line',data:{labels:d.map((_,i)=>i),datasets:[{data:d,borderColor:c,borderWidth:2,pointRadius:0,tension:.4}]},options:{responsive:true,animation:false,scales:{x:{display:false},y:{display:false}},plugins:{tooltip:{enabled:false}}}});
  sp('sp-r',M.rev,'#6baed6');sp('sp-e',M.exp,'#e88fa0');sp('sp-p',M.profit,'#5ec48a');sp('sp-m',M.profit.map((x,i)=>M.rev[i]?x/M.rev[i]*100:0),'#d4b44a');
  mk('chart-revexp',{type:'bar',data:{labels:M.labels,datasets:[{label:'Revenue',data:M.rev,backgroundColor:'#c8dff0',borderRadius:6,borderSkipped:false},{label:'Expenses',data:M.exp,backgroundColor:'#f4c5ce',borderRadius:6,borderSkipped:false},{label:'Profit',data:M.profit,type:'line',borderColor:'#5ec48a',backgroundColor:'rgba(94,196,138,.08)',borderWidth:2.5,pointRadius:4,pointBackgroundColor:'#5ec48a',tension:.4,fill:true}]},options:baseOpt()});
  const ct=catT('out',w),names=Object.keys(ct).sort((a,b)=>ct[b]-ct[a]);
  mk('chart-expense-donut',{type:'doughnut',data:{labels:names,datasets:[{data:names.map(n=>ct[n]),backgroundColor:COLORS,borderWidth:0,hoverOffset:6}]},options:{cutout:'70%',plugins:{tooltip:{callbacks:{label:c=>` ${money(c.parsed)}`}}}}});
  $('donut-legend').innerHTML=names.length?names.map((n,i)=>`<div class="donut-legend-item"><div class="donut-legend-left"><div class="donut-legend-dot" style="background:${COLORS[i%7]}"></div>${esc(n)}</div><b>${kfmt(ct[n])}</b></div>`).join(''):'<div class="empty">No expenses in this period</div>';
  const rec=[...W().tx].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,10);
  $('transaction-list').innerHTML=rec.length?rec.map(t=>`<div class="tx-item"><div class="tx-info"><span class="tx-name">${esc(t.desc)}</span><span class="tx-category">${esc(t.category)}</span></div><div style="text-align:right"><div class="tx-amount ${t.type}">${t.type==='in'?'+':'-'}${SYM[t.currency]||t.currency+' '}${Math.abs(t.amount).toLocaleString()}</div><div class="tx-date">${t.date}</div></div></div>`).join(''):'<div class="empty">No transactions yet</div>';
  // risk
  const f=fraud(w),n=W().tx.filter(t=>inW(t,w)).length,br=budgetRows().filter(x=>x.budget);
  const rf=Math.min(100,Math.round(f.length/Math.max(1,n)*400)),rl=!r?0:mg<=0?90:mg<20?60:mg<40?40:20,ro=br.length?Math.round(br.filter(x=>x.actual>x.budget).length/br.length*100):0,tot=Math.round(.4*rf+.3*rl+.3*ro);
  $('risk-center').textContent=tot;
  mk('risk-gauge',{type:'doughnut',data:{datasets:[{data:[tot,100-tot],backgroundColor:[tot>60?'#f4c5ce':tot>35?'#f7e8b0':'#b8e4ca','rgba(0,0,0,.05)'],borderWidth:0,circumference:270,rotation:225}]},options:{cutout:'78%',plugins:{tooltip:{enabled:false}}}});
  $('risk-breakdown').innerHTML=[['Fraud Risk',rf,'#e88fa0'],['Liquidity Risk',rl,'#d4b44a'],['Budget Risk',ro,'#9b7dd4']].map(i=>`<div class="risk-row"><span style="min-width:110px;color:#6b6b8a">${i[0]}</span><div class="risk-bar-bg"><div class="risk-bar-fill" style="width:${i[1]}%;background:${i[2]}"></div></div><b style="min-width:28px;text-align:right">${i[1]}</b></div>`).join('');
  // cash flow: cumulative net for 30d + straight-line projection
  const net={};W().tx.forEach(t=>{net[t.date]=(net[t.date]||0)+(t.type==='in'?1:-1)*baseAmt(t)});
  let cum=0;const act=[],lab=[];for(let i=29;i>=0;i--){const d=new Date(TODAY);d.setDate(d.getDate()-i);cum+=net[iso(d)]||0;if(i%3===0){act.push(cum);lab.push(`${MON[d.getMonth()]} ${d.getDate()}`)}}
  const rate=cum/30*3,fc=act.map(()=>null);fc[fc.length-1]=cum;const labs=[...lab];for(let i=1;i<=10;i++){const d=new Date(TODAY);d.setDate(d.getDate()+i*3);labs.push(`${MON[d.getMonth()]} ${d.getDate()}`);fc.push(cum+rate*i)}
  mk('chart-cashflow',{type:'line',data:{labels:labs,datasets:[{label:'Actual',data:act,borderColor:'#6baed6',backgroundColor:'rgba(107,174,214,.1)',fill:true,tension:.4,pointRadius:2,borderWidth:2},{label:'Projection',data:fc,borderColor:'#d4b44a',borderDash:[5,4],tension:.4,pointRadius:2,borderWidth:2}]},options:baseOpt(true)});
}

/* ---------- Transactions ---------- */
function initTransactions(){const q=($('tx-search').value||'').toLowerCase();
  const rows=[...W().tx].sort((a,b)=>b.date.localeCompare(a.date)).filter(t=>!q||[t.desc,t.category,t.amount,t.date,t.currency].join(' ').toLowerCase().includes(q));
  $('tx-count').textContent=`${rows.length} of ${W().tx.length} transactions`+(rows.length>300?' (showing first 300)':'');
  $('tx-tbody').innerHTML=rows.slice(0,300).map(t=>`<tr><td>${t.date}</td><td>${esc(t.desc)}</td><td><span class="badge badge-muted">${esc(t.category)}</span></td><td><span class="badge ${t.type==='in'?'badge-success':'badge-danger'}">${t.type==='in'?'Revenue':'Expense'}</span></td><td style="font-weight:600">${SYM[t.currency]||t.currency+' '}${Math.abs(t.amount).toLocaleString()}</td><td><button class="risk-btn risk-btn-block" data-del="${t.id}">Delete</button></td></tr>`).join('')||'<tr><td colspan="6"><div class="empty">No transactions found</div></td></tr>';}

/* ---------- P&L ---------- */
function initPnL(){const w=W(),fs=w.fiscal;let y=TODAY.getFullYear();if(TODAY.getMonth()<fs)y--;
  const ml=[];for(let i=0;i<12;i++){const d=new Date(y,fs+i,1);if(d>TODAY)break;ml.push({key:`${d.getFullYear()}-${pad(d.getMonth()+1)}`,label:MON[d.getMonth()]})}
  $('pnl-sub').textContent=`Fiscal year starting ${MFULL[fs]} ${y} (YTD) • ${w.currency}`;
  $('pnl-thead').innerHTML=`<tr><th>Category</th>${ml.map(m=>`<th>${m.label}</th>`).join('')}<th>Total</th></tr>`;
  const R=agg('in'),E=agg('out'),f=n=>n<0?`(${money(-n)})`:money(n),span=ml.length+2;
  const row=(l,v,cls)=>`<tr class="${cls||''}"><td>${esc(l)}</td>${v.map(x=>`<td class="${x<0?'negative':cls&&x>0?'positive':''}">${f(x)}</td>`).join('')}<td style="font-weight:700">${f(v.reduce((a,b)=>a+b,0))}</td></tr>`;
  const per=A=>Object.keys(A).map(c=>[c,ml.map(m=>(A[c][m.key]||0))]).filter(x=>x[1].some(v=>v));
  const rev=ml.map(m=>monthSum(R,m.key)),exp=ml.map(m=>monthSum(E,m.key)),net=rev.map((r,i)=>r-exp[i]);
  $('pnl-tbody').innerHTML=`<tr class="section-header"><td colspan="${span}">REVENUE</td></tr>${per(R).map(x=>row(x[0],x[1])).join('')}${row('Total Revenue',rev,'total-row')}<tr class="section-header"><td colspan="${span}">EXPENSES</td></tr>${per(E).map(x=>row(x[0],x[1])).join('')}${row('Total Expenses',exp,'total-row')}${row('NET PROFIT / LOSS',net,'total-row')}`;
  const tr=rev.reduce((a,b)=>a+b,0),te=exp.reduce((a,b)=>a+b,0);
  mk('chart-waterfall',{type:'bar',data:{labels:['Revenue','Expenses','Net Profit'],datasets:[{data:[tr,-te,tr-te],backgroundColor:['#b8e4ca','#f4c5ce',tr-te>=0?'#b8e4ca':'#f4c5ce'],borderRadius:8,borderSkipped:false}]},options:{...baseOpt(),plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>' '+money(c.parsed.y)}}}}});
  mk('chart-margin-trend',{type:'line',data:{labels:ml.map(m=>m.label),datasets:[{data:net.map((n,i)=>rev[i]?+(n/rev[i]*100).toFixed(1):0),borderColor:'#9b7dd4',backgroundColor:'rgba(155,125,212,.1)',fill:true,tension:.4,pointRadius:4,borderWidth:2.5}]},options:{responsive:true,maintainAspectRatio:false,plugins:{tooltip:{callbacks:{label:c=>` ${c.parsed.y}%`}}},scales:{x:axes().x,y:{...axes().y,ticks:{callback:v=>v+'%'}}}}});
  return{ml,rev,exp,net,R,E};}

/* ---------- Expenses ---------- */
let expFilter='all';
function initExpenses(){const C=cats(),M=monthly(),tabs=$('expense-filter-tabs');
  if(expFilter!=='all'&&!C.includes(expFilter))expFilter='all';
  tabs.innerHTML=['all',...C].map(c=>`<button class="filter-tab ${c===expFilter?'active':''}" data-filter="${esc(c)}">${c==='all'?'All':esc(c)}</button>`).join('');
  const sel=expFilter==='all'?C:[expFilter];
  mk('chart-expense-bar',{type:'bar',data:{labels:M.labels,datasets:sel.map((c,i)=>({label:c,data:M.ml.map(m=>(M.E[c]||{})[m.key]||0),backgroundColor:COLORS[C.indexOf(c)%7],borderRadius:6,borderSkipped:false}))},options:baseOpt(sel.length>1,expFilter==='all')});
  const b=budgetRows();
  mk('chart-budget',{type:'bar',data:{labels:b.map(x=>x.c),datasets:[{label:'Budget',data:b.map(x=>x.budget),backgroundColor:'rgba(107,174,214,.25)',borderColor:'#6baed6',borderWidth:1.5,borderRadius:6,borderSkipped:false},{label:'Actual (this month)',data:b.map(x=>x.actual),backgroundColor:b.map(x=>x.budget&&x.actual>x.budget?'#f4c5ce':'#b8e4ca'),borderRadius:6,borderSkipped:false}]},options:{...baseOpt(true),indexAxis:'y',scales:{x:axes().y,y:axes().x}}});
  renderExpTable();}
function renderExpTable(){const q=($('expense-search').value||'').toLowerCase(),bad=s=>({approved:'badge-success',pending:'badge-warning',review:'badge-info'})[s]||'badge-muted';
  const rows=W().tx.filter(t=>t.type==='out'&&(expFilter==='all'||t.category===expFilter)&&(!q||(t.desc+t.category).toLowerCase().includes(q))).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,100);
  $('expense-tbody').innerHTML=rows.map(t=>`<tr><td>${t.date}</td><td>${esc(t.desc)}</td><td><span class="badge badge-muted">${esc(t.category)}</span></td><td style="font-weight:600">${SYM[t.currency]||t.currency+' '}${Math.abs(t.amount).toLocaleString()}</td><td><span class="badge ${bad(t.status)}">${esc((t.status||'approved')[0].toUpperCase()+(t.status||'approved').slice(1))}</span></td></tr>`).join('')||'<tr><td colspan="5"><div class="empty">No expenses</div></td></tr>';}

/* ---------- Currency ---------- */
async function fetchFx(){try{const r=await fetch('https://open.er-api.com/v6/latest/USD');const j=await r.json();if(j.result==='success'){Object.keys(FX).forEach(k=>{if(j.rates[k])FX[k]=j.rates[k]});fxLive=true;fxTime=j.time_last_update_utc;}}catch(e){}}
function initCurrency(){const sf=$('conv-from'),st=$('conv-to');
  if(!sf.options.length){Object.keys(FX).forEach(c=>{sf.add(new Option(c,c));st.add(new Option(c,c))});sf.value='USD';st.value=W().currency==='USD'?'EUR':W().currency;}
  $('fx-title').textContent=`${fxLive?'Live':'Reference'} FX Rates (vs USD)`;
  $('fx-rates-grid').innerHTML=Object.entries(FX).filter(([c])=>c!=='USD').map(([c,r])=>`<div class="fx-rate-item"><span class="fx-currency">USD / ${c}</span><span class="fx-rate">${r.toLocaleString(undefined,{maximumFractionDigits:4})}</span></div>`).join('')+`<div class="rate-info">${fxLive?'Updated '+esc(fxTime):'Offline reference rates — live feed unavailable'}</div>`;
  const ex={};W().tx.forEach(t=>ex[t.currency]=(ex[t.currency]||0)+baseAmt(t));const k=Object.keys(ex);
  mk('chart-fx-exposure',{type:'doughnut',data:{labels:k,datasets:[{data:k.map(c=>ex[c]),backgroundColor:COLORS,borderWidth:0,hoverOffset:6}]},options:{cutout:'65%',plugins:{legend:{display:true,position:'bottom'},tooltip:{callbacks:{label:c=>' '+money(c.parsed)}}}}});
  doConvert();}
function doConvert(){const f=$('conv-from').value,t=$('conv-to').value,a=parseFloat($('conv-amount').value)||0;
  $('conv-result').value=(a/FX[f]*FX[t]).toFixed(4);$('rate-info').textContent=`1 ${f} = ${(FX[t]/FX[f]).toFixed(4)} ${t}`;}

/* ---------- Fraud ---------- */
function initFraud(){const w=winOf(days()),f=fraud(w),all=W().tx.filter(t=>inW(t,w));
  const blocked=f.filter(x=>x.status==='blocked').reduce((a,x)=>a+baseAmt(x.t),0),appr=f.filter(x=>x.status==='approved').length,avg=all.length?f.reduce((a,x)=>a+x.score,0)/Math.max(1,f.length):0;
  const k=(l,v,s)=>`<div class="fraud-kpi-card"><div class="fraud-kpi-label">${l}</div><div class="fraud-kpi-value">${v}</div><div class="fraud-kpi-sub">${s}</div></div>`;
  $('fraud-kpis').innerHTML=k('Flagged Transactions',f.length,`Score above ${W().th.fraud.toFixed(1)}`)+k('Avg Flagged Score',f.length?avg.toFixed(1)+' / 10':'—',f.length?(avg>=8?'Critical':avg>=7?'Elevated':'Moderate'):'Nothing flagged')+k('Blocked Amount',money(blocked),'Prevented losses')+k('Cleared After Review',f.length?(appr/f.length*100).toFixed(0)+'%':'—','Approved / flagged');
  const day=[],flag=[],lab=[],fs=new Set(f.map(x=>x.t.id));for(let i=29;i>=0;i--){const d=new Date(TODAY);d.setDate(d.getDate()-i);const s=iso(d),t=W().tx.filter(x=>x.date===s);lab.push(d.getDate());flag.push(t.filter(x=>fs.has(x.id)).length);day.push(t.length-t.filter(x=>fs.has(x.id)).length)}
  mk('chart-fraud-timeline',{type:'bar',data:{labels:lab,datasets:[{label:'Normal',data:day,backgroundColor:'#c8dff0',borderRadius:4,borderSkipped:false},{label:'Flagged',data:flag,backgroundColor:'#f4c5ce',borderRadius:4,borderSkipped:false}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:true,position:'top',align:'start'}},scales:{x:{stacked:true,grid:{display:false},border:{display:false}},y:{stacked:true,grid:{color:'rgba(0,0,0,.04)'},border:{display:false},ticks:{precision:0}}}}});
  const rc={};f.forEach(x=>x.reasons.forEach(r=>rc[r]=(rc[r]||0)+1));
  mk('chart-fraud-cat',{type:'doughnut',data:{labels:Object.keys(rc),datasets:[{data:Object.values(rc),backgroundColor:COLORS,borderWidth:0,hoverOffset:6}]},options:{cutout:'60%',plugins:{legend:{display:true,position:'bottom'}}}});
  const rb=s=>s>=8?'badge-danger':s>=6?'badge-warning':'badge-success',sb=s=>({blocked:'badge-danger',review:'badge-warning',approved:'badge-success'})[s];
  $('fraud-tbody').innerHTML=f.map(x=>`<tr><td style="font-family:monospace;font-size:12px">${esc(x.t.id.slice(-8).toUpperCase())}</td><td>${x.t.date}</td><td style="font-weight:600">${SYM[x.t.currency]||x.t.currency+' '}${Math.abs(x.t.amount).toLocaleString()}</td><td>${esc(x.t.desc)}<div class="tx-category">${esc(x.reasons.join(' • '))}</div></td><td><span class="badge ${rb(x.score)}">${x.score.toFixed(1)}</span></td><td><span class="badge ${sb(x.status)}">${x.status[0].toUpperCase()+x.status.slice(1)}</span></td><td><div style="display:flex;gap:6px">${['approved','review','blocked'].map(s=>`<button class="risk-btn risk-btn-${s==='approved'?'approve':s==='review'?'review':'block'}" data-fs="${x.t.id}" data-st="${s}">${s==='approved'?'Approve':s==='review'?'Review':'Block'}</button>`).join('')}</div></td></tr>`).join('')||'<tr><td colspan="7"><div class="empty">No transactions above your fraud threshold in this period 🎉</div></td></tr>';}

/* ---------- AI insights (rule-based analysis of your data) ---------- */
const SEV={HIGH:['#fce8ea','#e88fa0','#8c2d35','#f4c5ce'],MEDIUM:['#fdf8e8','#d4b44a','#7a5c10','#f7e8b0'],LOW:['#edf9f2','#5ec48a','#1a6e3a','#b8e4ca'],POSITIVE:['#eaf4fb','#6baed6','#235580','#c8dff0']};
const ACTIONS={over:['Freeze discretionary spending in the over-budget categories','Require approval for new commitments above your large-transaction limit','Renegotiate the top 3 vendors in that category','Review the budget — is the target still realistic?'],margin:['Audit your three largest expense lines for savings','Review pricing — even a 3% increase moves margin materially','Pause non-essential hiring and subscriptions until margin recovers'],conc:['Target new customers in adjacent segments','Offer recurring plans to existing customers','Set a goal to reduce top-category share below 40%'],fraud:['Require two-person approval above your large-transaction limit','Verify new counterparties before releasing payment','Review every flagged item in the Fraud Monitor']};
function insights(){const w=winOf(days()),p=winOf(days(),1),r=sumT('in',w),e=sumT('out',w),pr=sumT('in',p),pe=sumT('out',p),I=[],R=[];
  const add=(title,desc,score,sev,key)=>{I.push({title,desc,score,sev});if(key&&sev!=='LOW'&&sev!=='POSITIVE')R.push({title,sev,desc,actions:ACTIONS[key]})};
  if(!W().tx.length)return{I,R,H:[]};
  const over=budgetRows().filter(x=>x.budget&&x.actual>x.budget);
  if(over.length){const o=over.sort((a,b)=>b.actual/b.budget-a.actual/a.budget)[0];add(`${o.c} over budget`,`${o.c} spend is ${((o.actual/o.budget-1)*100).toFixed(0)}% above its monthly budget (${money(o.actual)} vs ${money(o.budget)}). ${over.length>1?over.length-1+' other categor'+(over.length>2?'ies are':'y is')+' also over.':''}`,Math.min(10,3+(o.actual/o.budget-1)*20),(o.actual/o.budget-1)*100>W().th.budget?'HIGH':'MEDIUM','over')}
  const mg=r?(r-e)/r*100:0;if(r){add(mg<10?'Thin profit margin':'Healthy profit margin',`Net margin is ${mg.toFixed(1)}% for the selected period (${money(r-e)} on ${money(r)} revenue).`,mg<0?9:mg<10?7:mg<25?4:1.5,mg<10?'HIGH':mg<25?'MEDIUM':'POSITIVE','margin')}
  const rg=pct(r,pr);if(rg!=null)add(rg>=0?'Revenue growing':'Revenue declining',`Revenue is ${rg>=0?'up':'down'} ${Math.abs(rg).toFixed(1)}% versus the previous ${days()} days.`,rg>=0?1.8:Math.min(9,4+Math.abs(rg)/5),rg>=10?'POSITIVE':rg>=0?'LOW':'MEDIUM');
  const eg=pct(e,pe);if(eg!=null&&eg>15)add('Expenses growing faster than expected',`Expenses are up ${eg.toFixed(1)}% versus the previous period${rg!=null?` while revenue moved ${rg.toFixed(1)}%`:''}.`,Math.min(9,4+eg/8),'MEDIUM','margin');
  const rc=catT('in',w),rk=Object.keys(rc).sort((a,b)=>rc[b]-rc[a]);if(rk.length>1&&r&&rc[rk[0]]/r>.5)add('Revenue concentration',`${rk[0]} generates ${(rc[rk[0]]/r*100).toFixed(0)}% of revenue. A dip there would hit total income hard.`,Math.min(9,rc[rk[0]]/r*10),rc[rk[0]]/r>.65?'HIGH':'MEDIUM','conc');
  const f=fraud(w);if(f.length)add('Fraud risk flagged',`${f.length} transaction(s) scored above ${W().th.fraud.toFixed(1)}, totalling ${money(f.reduce((a,x)=>a+baseAmt(x.t),0))}. Highest: ${f[0].t.desc} (${f[0].score}).`,Math.min(10,f[0].score),f[0].score>=8?'HIGH':'MEDIUM','fraud');
  const bt=budgetRows().filter(x=>x.budget),Hh=[['Profitability',Math.max(0,Math.min(100,mg*2.5)),'#d4b44a'],['Revenue Growth',Math.max(0,Math.min(100,50+(rg||0)*2)),'#9b7dd4'],['Cost Efficiency',r?Math.max(0,Math.min(100,100-e/r*100*1.2)):0,'#e88fa0'],['Budget Discipline',bt.length?100-over.length/bt.length*100:70,'#5ec48a'],['Fraud Exposure (lower is better)',Math.min(100,f.length/Math.max(1,W().tx.filter(t=>inW(t,w)).length)*400),'#e88fa0']];
  const ov=Math.round((Hh[0][1]+Hh[1][1]+Hh[2][1]+Hh[3][1]+(100-Hh[4][1]))/5);
  return{I,R,H:[['Overall Financial Health',ov,'#6baed6'],...Hh.map(h=>[h[0],Math.round(h[1]),h[2]])]}}
function initAI(){const{I,R,H}=insights(),box=$('ai-insights-grid');
  if(!I.length){empty(box,'Add transactions to generate insights.');empty($('health-scores'),'');empty($('remedies-grid'),'');}
  else{box.innerHTML=I.map(i=>{const c=SEV[i.sev];return`<div class="insight-card" style="background:${c[0]}"><div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap"><span class="insight-title" style="margin:0">${esc(i.title)}</span><span class="badge" style="background:${c[3]};color:${c[2]}">${i.sev}</span></div><div class="insight-desc">${esc(i.desc)}</div><div class="insight-score"><div class="score-label"><span>Risk Score</span><b style="color:${c[1]}">${i.score.toFixed(1)}/10</b></div><div class="score-bar-bg"><div class="score-bar-fill" style="width:${i.score*10}%;background:${c[1]}"></div></div></div></div>`}).join('');
  $('health-scores').innerHTML=H.map(s=>`<div><div class="health-label"><span>${s[0]}</span><span style="color:${s[2]}">${s[1]}%</span></div><div class="health-bar-bg"><div class="health-bar-fill" style="width:${s[1]}%;background:${s[2]}"></div></div></div>`).join('');
  $('remedies-grid').innerHTML=R.length?R.map(r=>{const c=SEV[r.sev];return`<div class="remedy-card"><div class="remedy-header"><span class="remedy-severity" style="background:${c[3]};color:${c[2]}">${r.sev}</span><span class="remedy-title">${esc(r.title)}</span></div><p class="remedy-desc">${esc(r.desc)}</p>${r.actions.map(a=>`<div class="remedy-action">${esc(a)}</div>`).join('')}</div>`}).join(''):'<div class="empty">Nothing needs attention right now.</div>';}
  const M=monthly(),n=M.rev.slice(-6),xm=(n.length-1)/2,ym=n.reduce((a,b)=>a+b,0)/n.length;let nu=0,de=0;n.forEach((y,i)=>{nu+=(i-xm)*(y-ym);de+=(i-xm)**2});const sl=de?nu/de:0,b0=ym-sl*xm;
  const lab=[...M.labels],act=[...M.rev],fc=M.rev.map(()=>null);fc[fc.length-1]=M.rev[M.rev.length-1];
  for(let i=1;i<=3;i++){const d=new Date(TODAY.getFullYear(),TODAY.getMonth()+i,1);lab.push(MON[d.getMonth()]);act.push(null);fc.push(Math.max(0,b0+sl*(n.length-1+i)))}
  mk('chart-forecast',{type:'line',data:{labels:lab,datasets:[{label:'Actual',data:act,borderColor:'#6baed6',backgroundColor:'rgba(107,174,214,.1)',fill:true,tension:.4,pointRadius:4,borderWidth:2.5},{label:'Forecast (linear trend)',data:fc,borderColor:'#d4b44a',borderDash:[6,4],tension:.4,pointRadius:4,borderWidth:2}]},options:baseOpt(true)});}

/* ---------- Reports ---------- */
const csvEsc=v=>{v=String(v??'');return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};
const toCSV=rows=>rows.map(r=>r.map(csvEsc).join(',')).join('\n');
function reportDefs(){const w=W();return[
  {name:'All transactions',meta:`${w.tx.length} rows • CSV`,color:'#c8dff0',rows:()=>[['Date','Description','Category','Type','Amount','Currency','Status'],...[...w.tx].sort((a,b)=>b.date.localeCompare(a.date)).map(t=>[t.date,t.desc,t.category,t.type==='in'?'Revenue':'Expense',Math.abs(t.amount),t.currency,t.status||''])]},
  {name:'Profit & Loss (fiscal YTD)',meta:'Monthly by category • CSV',color:'#b8e4ca',rows:()=>{const p=initPnL(),r=[['Category',...p.ml.map(m=>m.label),'Total']];const ad=(A,l)=>Object.keys(A).forEach(c=>{const v=p.ml.map(m=>Math.round(A[c][m.key]||0));r.push([l+': '+c,...v,v.reduce((a,b)=>a+b,0)])});ad(p.R,'Revenue');ad(p.E,'Expense');r.push(['Net profit',...p.net.map(Math.round),Math.round(p.net.reduce((a,b)=>a+b,0))]);return r}},
  {name:'Expense log',meta:'All expenses • CSV',color:'#f7e8b0',rows:()=>[['Date','Description','Category','Amount','Currency','Status'],...w.tx.filter(t=>t.type==='out').sort((a,b)=>b.date.localeCompare(a.date)).map(t=>[t.date,t.desc,t.category,Math.abs(t.amount),t.currency,t.status||''])]},
  {name:'Fraud review',meta:'Flagged in selected period • CSV',color:'#f4c5ce',rows:()=>[['Date','Description','Amount','Currency','Risk','Reasons','Status'],...fraud(winOf(days())).map(x=>[x.t.date,x.t.desc,Math.abs(x.t.amount),x.t.currency,x.score,x.reasons.join('; '),x.status])]}]}
function download(name,text,type='text/csv'){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),500)}
const slug=()=>W().name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'company';
function initReports(){const M=monthly(12),Y=TODAY.getFullYear(),R=agg('in');
  const yr=y=>Array.from({length:12},(_,m)=>monthSum(R,`${y}-${pad(m+1)}`));
  mk('chart-yoy',{type:'line',data:{labels:MON,datasets:[{label:String(Y-1),data:yr(Y-1),borderColor:'#d4c5f0',backgroundColor:'rgba(212,197,240,.1)',fill:true,tension:.4,pointRadius:3,borderWidth:2},{label:String(Y),data:yr(Y).map((v,i)=>i>TODAY.getMonth()?null:v),borderColor:'#6baed6',backgroundColor:'rgba(107,174,214,.1)',fill:true,tension:.4,pointRadius:3,borderWidth:2.5}]},options:baseOpt(true)});
  const E=agg('out'),qs=[];let qy=Y,q=Math.floor(TODAY.getMonth()/3);for(let i=0;i<4;i++){qs.unshift({y:qy,q});q--;if(q<0){q=3;qy--}}
  const qv=qs.map(s=>{let r=0,e=0;for(let m=s.q*3;m<s.q*3+3;m++){const k=`${s.y}-${pad(m+1)}`;r+=monthSum(R,k);e+=monthSum(E,k)}return[r,e]});
  mk('chart-quarterly',{type:'bar',data:{labels:qs.map(s=>`Q${s.q+1} ${s.y}`),datasets:[{label:'Revenue',data:qv.map(v=>v[0]),backgroundColor:'#c8dff0',borderRadius:6,borderSkipped:false},{label:'Expenses',data:qv.map(v=>v[1]),backgroundColor:'#f4c5ce',borderRadius:6,borderSkipped:false},{label:'Profit',data:qv.map(v=>v[0]-v[1]),backgroundColor:'#b8e4ca',borderRadius:6,borderSkipped:false}]},options:baseOpt(true)});
  $('report-list').innerHTML=reportDefs().map((r,i)=>`<div class="report-item"><div class="report-info"><div class="report-icon" style="background:${r.color}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1c1c2e" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div><div><div class="report-name">${r.name}</div><div class="report-meta">${r.meta}</div></div></div><div class="report-actions"><button class="btn-outline" data-prev="${i}">Preview</button><button class="btn-primary" style="font-size:12px;padding:7px 14px" data-dl="${i}">Download CSV</button></div></div>`).join('');}

/* ---------- Settings ---------- */
function initSettings(){const w=W(),th=w.th,opt=(a,sel,f=x=>x)=>a.map(x=>`<option value="${esc(x)}" ${x===sel?'selected':''}>${esc(f(x))}</option>`).join('');
  const bc=cats();
  $('settings-root').innerHTML=`<div class="chart-card"><div class="card-title">Company Settings</div><div class="settings-form">
   <label>Company Name</label><input id="s-name" class="settings-input" value="${esc(w.name)}"/>
   <label>Your Name</label><input id="s-user" class="settings-input" value="${esc(w.user)}"/>
   <label>Base Currency (reports are converted to this)</label><select id="s-cur" class="settings-input">${opt(Object.keys(SYM),w.currency,c=>`${c} — ${CUR_NAMES[c]}`)}</select>
   <label>Fiscal Year Start</label><select id="s-fy" class="settings-input">${MFULL.map((m,i)=>`<option value="${i}" ${i===w.fiscal?'selected':''}>${m}</option>`).join('')}</select>
   <label>Report Timezone</label><select id="s-tz" class="settings-input">${opt(TZS,w.tz)}</select>
   <button class="btn-primary" id="save-company">Save Changes</button></div>
   <div class="card-title" style="margin-top:26px">Monthly Budgets (${w.currency})</div><div class="settings-form">${bc.map(c=>`<label>${esc(c)}</label><input type="number" min="0" class="settings-input" data-budget="${esc(c)}" value="${w.budgets[c]||''}" placeholder="No budget"/>`).join('')}<button class="btn-primary" id="save-budgets">Save Budgets</button></div></div>
  <div class="chart-card"><div class="card-title">Alert Thresholds</div><div class="settings-form">
   <label>Fraud Risk Score Alert (&gt;)</label><input type="range" min="0" max="10" step=".1" value="${th.fraud}" class="range-input" id="s-fraud"/><span class="range-value" id="s-fraud-v">${(+th.fraud).toFixed(1)}</span>
   <label>Expense Over-budget Alert (%)</label><input type="range" min="0" max="50" value="${th.budget}" class="range-input" id="s-budget"/><span class="range-value" id="s-budget-v">${th.budget}%</span>
   <label>Large Transaction Alert (${w.currency})</label><input type="number" min="0" id="s-large" class="settings-input" value="${th.large}"/>
   <label>Notifications</label>
   <div class="toggle-row"><span>Email Alerts</span><label class="toggle"><input type="checkbox" id="s-email" ${th.email?'checked':''}/><span class="toggle-slider"></span></label></div>
   <div class="toggle-row"><span>Fraud Alerts</span><label class="toggle"><input type="checkbox" id="s-fal" ${th.fraudAlerts?'checked':''}/><span class="toggle-slider"></span></label></div>
   <div class="toggle-row"><span>Weekly Report</span><label class="toggle"><input type="checkbox" id="s-weekly" ${th.weekly?'checked':''}/><span class="toggle-slider"></span></label></div>
   <button class="btn-primary" id="save-th">Update Thresholds</button>
   <div class="rate-info" style="text-align:left">Email/weekly preferences are saved, but sending email needs a backend service — in-app alerts (the bell) work now.</div></div></div>`;
  $('s-fraud').oninput=e=>$('s-fraud-v').textContent=(+e.target.value).toFixed(1);$('s-budget').oninput=e=>$('s-budget-v').textContent=e.target.value+'%';
  $('save-company').onclick=()=>{const n=$('s-name').value.trim();if(!n){toast('Company name cannot be empty','error');return}
    Object.assign(w,{name:n,user:$('s-user').value.trim()||'Admin',currency:$('s-cur').value,fiscal:+$('s-fy').value,tz:$('s-tz').value});if(save()){toast('Company settings saved');render()}};
  $('save-th').onclick=()=>{Object.assign(w.th,{fraud:+$('s-fraud').value,budget:+$('s-budget').value,large:Math.max(0,+$('s-large').value||0),email:$('s-email').checked,fraudAlerts:$('s-fal').checked,weekly:$('s-weekly').checked});if(save()){toast('Thresholds updated');chrome()}};
  $('save-budgets').onclick=()=>{document.querySelectorAll('[data-budget]').forEach(i=>{const v=parseFloat(i.value);if(v>0)w.budgets[i.dataset.budget]=v;else delete w.budgets[i.dataset.budget]});if(save()){toast('Budgets saved');chrome()}};}

/* ---------- Data sources ---------- */
const ALIAS={date:['date','transaction date','txn date','posted','posted date','created','created_at','timestamp'],desc:['description','desc','name','memo','details','merchant','payee','narration','title'],category:['category','account','class','group'],amount:['amount','value','total','net','sum'],type:['type','kind','direction','dr/cr','transaction type'],currency:['currency','ccy','curr'],status:['status','state']};
function pick(o,k){const keys=Object.keys(o),l=keys.map(x=>x.toLowerCase().trim());for(const a of ALIAS[k]){const i=l.indexOf(a);if(i>-1)return o[keys[i]]}return undefined}
function normTx(o,src){let a=pick(o,'amount');if(a==null||a==='')return null;let s=String(a).trim(),neg=/^\(.*\)$/.test(s)||s.startsWith('-');a=parseFloat(s.replace(/[^0-9.]/g,''));if(!isFinite(a)||a===0)return null;
  const ty=String(pick(o,'type')??'').toLowerCase();let type=neg?'out':'in';if(/exp|out|debit|cost|purchase|bill|payment/.test(ty))type='out';else if(/rev|in|credit|income|sale|deposit/.test(ty)&&!neg)type='in';
  let d=pick(o,'date'),dt=d?new Date(/^\d+$/.test(String(d))&&String(d).length>=10?+d*(String(d).length===10?1000:1):d):null;if(!dt||isNaN(dt))return null;
  let cur=String(pick(o,'currency')||W().currency).toUpperCase();if(!FX[cur])cur=W().currency;
  return{id:uid('i'),date:iso(dt),desc:String(pick(o,'desc')||'Imported transaction').slice(0,120),category:String(pick(o,'category')||'Other').slice(0,40),type,amount:a,currency:cur,status:String(pick(o,'status')||'approved').toLowerCase(),src}}
function parseCSV(t){const rows=[];let r=[],c='',q=false;for(let i=0;i<t.length;i++){const ch=t[i];if(q){if(ch==='"'&&t[i+1]==='"'){c+='"';i++}else if(ch==='"')q=false;else c+=ch}else if(ch==='"')q=true;else if(ch===','){r.push(c);c=''}else if(ch==='\n'||ch==='\r'){if(ch==='\r'&&t[i+1]==='\n')i++;r.push(c);c='';if(r.some(x=>x.trim()))rows.push(r);r=[]}else c+=ch}
  if(c||r.length){r.push(c);rows.push(r)}const h=rows.shift()||[];return rows.map(x=>Object.fromEntries(h.map((k,i)=>[k,x[i]])))}
function ingest(list,src,replace){const w=W();let ok=list.map(o=>normTx(o,src)).filter(Boolean);const skipped=list.length-ok.length;
  if(!ok.length){toast(`No valid rows found (${skipped} skipped). Need at least date + amount columns.`,'error');return false}
  w.tx=replace?[]:w.tx.filter(t=>t.src!=='demo'&&!(src==='api'&&t.src==='api'));
  w.tx.push(...ok);w.source=src;if(!save())return false;toast(`Imported ${ok.length} transactions${skipped?` (${skipped} skipped)`:''}`);render();return true}
function wsList(){return Object.values(store.workspaces).map(w=>`<div class="report-item"><div class="report-info"><div class="user-avatar" style="width:34px;height:34px">${esc(w.name.slice(0,2).toUpperCase())}</div><div><div class="report-name">${esc(w.name)} ${w.id===store.active?'<span class="badge badge-success">Active</span>':''}</div><div class="report-meta">${w.currency} • ${w.tx.length} transactions • ${w.source}</div></div></div><div class="report-actions">${w.id!==store.active?`<button class="btn-primary" style="font-size:12px;padding:7px 14px" data-sw="${w.id}">Switch</button>`:''}<button class="btn-outline" data-rmws="${w.id}">Delete</button></div></div>`).join('')}
function initSources(){const w=W();
  $('sources-root').innerHTML=`<div class="chart-card"><div class="card-header"><div><div class="card-title">Companies / Workspaces</div><div class="card-subtitle">Each company has its own data, settings, budgets and connections</div></div><button class="btn-primary" id="new-ws">+ New company</button></div><div class="report-list">${wsList()}</div></div>
  <div class="sources-grid"><div class="chart-card"><div class="card-title">Import CSV / Excel export</div><div class="card-subtitle" style="margin-bottom:12px">Columns recognised: date, description, category, amount, type (revenue/expense — or use negative amounts), currency, status.</div>
   <div class="settings-form"><input type="file" id="csv-file" accept=".csv,text/csv" class="settings-input"/><label class="check"><input type="checkbox" id="csv-replace"/> Replace all existing data in this company</label>
   <button class="btn-primary" id="csv-go">Import file</button><button class="btn-outline" id="csv-tpl">Download template</button></div></div>
  <div class="chart-card"><div class="card-title">Connect accounting API</div><div class="card-subtitle" style="margin-bottom:12px">Any REST endpoint that returns a JSON array of transactions (or <code>{"transactions":[…]}</code>) with date, description, category and amount fields.</div>
   <div class="settings-form"><label>Endpoint URL</label><input id="api-url" class="settings-input" placeholder="https://api.yourcompany.com/transactions" value="${esc(w.api.url)}"/>
   <label>Auth header name</label><input id="api-header" class="settings-input" value="${esc(w.api.header)}"/><label>API key / token (e.g. Bearer abc123)</label><input id="api-key" type="password" class="settings-input" value="${esc(w.api.key)}"/>
   <button class="btn-primary" id="api-go">Save &amp; sync now</button><div class="rate-info" style="text-align:left">${w.api.last?'Last sync: '+new Date(w.api.last).toLocaleString():'Not synced yet'}<br/>The endpoint must allow browser requests (CORS). Keys are kept in this browser only — for production, route calls through your own server. QuickBooks/Xero/Zoho need OAuth on a backend.</div></div></div></div>
  <div class="chart-card"><div class="card-title">Backup &amp; reset</div><div class="settings-form" style="flex-direction:row;flex-wrap:wrap"><button class="btn-outline" id="bk-exp">Export this company (JSON)</button><label class="btn-outline" style="cursor:pointer">Import backup<input type="file" id="bk-imp" accept=".json" hidden/></label><button class="btn-outline" id="wipe">Delete all transactions</button></div></div>`;
  $('new-ws').onclick=newWsModal;
  $('csv-tpl').onclick=()=>download('fintrack-template.csv','date,description,category,type,amount,currency\n2026-11-01,Client invoice #101,Sales,revenue,12000,USD\n2026-11-03,Office rent,Operations,expense,3500,USD\n');
  $('csv-go').onclick=async()=>{const f=$('csv-file').files[0];if(!f){toast('Choose a CSV file first','error');return}ingest(parseCSV(await f.text()),'csv',$('csv-replace').checked)};
  $('api-go').onclick=async()=>{const a=w.api;a.url=$('api-url').value.trim();a.header=$('api-header').value.trim()||'Authorization';a.key=$('api-key').value.trim();if(!/^https?:\/\//.test(a.url)){toast('Enter a valid http(s) URL','error');return}
    const b=$('api-go');b.disabled=true;b.textContent='Syncing…';try{const r=await fetch(a.url,{headers:{Accept:'application/json',...(a.key?{[a.header]:a.key}:{})}});if(!r.ok)throw new Error('HTTP '+r.status);const j=await r.json();const arr=Array.isArray(j)?j:j.transactions||j.data||j.items||j.results||[];a.last=Date.now();if(!ingest(arr,'api',false))save();}catch(e){toast('Sync failed: '+e.message+' (check URL, key and CORS)','error')}b.disabled=false;b.textContent='Save & sync now'};
  $('bk-exp').onclick=()=>download(`${slug()}-backup.json`,JSON.stringify(w,null,1),'application/json');
  $('bk-imp').onchange=async e=>{try{const o=JSON.parse(await e.target.files[0].text());if(!o.name||!Array.isArray(o.tx))throw 0;o.id=uid('w');store.workspaces[o.id]=o;store.active=o.id;save();toast('Backup imported as a new company');render()}catch(x){toast('Not a valid FinTrack backup file','error')}};
  $('wipe').onclick=()=>{if(confirm('Delete ALL transactions in '+w.name+'?')){w.tx=[];w.source='blank';w.fraudStatus={};save();toast('All transactions deleted');render()}};}
function newWsModal(){openGM('New company',`<div class="settings-form" style="margin-top:0"><label>Company name</label><input id="nw-name" class="settings-input" placeholder="e.g. Sharma Traders"/><label>Base currency</label><select id="nw-cur" class="settings-input">${Object.keys(SYM).map(c=>`<option value="${c}">${c} — ${CUR_NAMES[c]}</option>`).join('')}</select><label>Start with</label><select id="nw-src" class="settings-input"><option value="blank">Empty workspace (my own data)</option><option value="demo">Sample demo data</option></select><button class="btn-primary" id="nw-go">Create company</button></div>`);
  $('nw-go').onclick=()=>{const n=$('nw-name').value.trim();if(!n){toast('Enter a company name','error');return}const x=newWs(n,$('nw-cur').value,$('nw-src').value);store.workspaces[x.id]=x;store.active=x.id;save();closeGM();toast(`Switched to ${n}`);navigate(x.source==='blank'?'sources':'dashboard')}}

/* ---------- navigation / events ---------- */
const TITLES={dashboard:['Dashboard',()=>`Overview — ${MFULL[TODAY.getMonth()]} ${TODAY.getFullYear()}`],transactions:['Transactions','All entries for this company'],pnl:['P&L Report','Profit & Loss — fiscal YTD'],expenses:['Expenses','Tracking & Categorization'],currency:['Currency','FX Rates & Conversion'],fraud:['Fraud Monitor','Risk & Anomaly Detection'],ai:['AI Insights','Automated analysis of your figures'],reports:['Reports','Charts & downloadable exports'],sources:['Data & Companies','Switch company, import data, connect an API'],settings:['Settings','Preferences & Configuration']};
const INITS={dashboard:initDashboard,transactions:initTransactions,pnl:initPnL,expenses:initExpenses,currency:initCurrency,fraud:initFraud,ai:initAI,reports:initReports,sources:initSources,settings:initSettings};
let page='dashboard';
function render(){chrome();const t=TITLES[page];$('page-title').textContent=t[0];$('page-subtitle').textContent=typeof t[1]==='function'?t[1]():t[1];INITS[page]()}
function navigate(p){if(!INITS[p])return;page=p;document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id==='page-'+p));document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.page===p));render();$('pages').scrollTop=0}
function switchWs(id){store.active=id;save();closeGM();toast(`Switched to ${W().name}`);navigate(page)}
function wsPicker(){openGM('Switch company',`<div class="report-list">${wsList()}</div><button class="btn-primary full-btn" id="pk-new" style="margin-top:14px">+ New company</button>`);$('pk-new').onclick=newWsModal}

document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('.nav-item').forEach(n=>n.onclick=e=>{e.preventDefault();navigate(n.dataset.page)});
  $('period-select').onchange=render;$('swap-currencies').onclick=()=>{const a=$('conv-from').value;$('conv-from').value=$('conv-to').value;$('conv-to').value=a;doConvert()};$('do-convert').onclick=doConvert;$('conv-amount').oninput=doConvert;$('conv-from').onchange=$('conv-to').onchange=doConvert;
  $('gm-close').onclick=closeGM;$('gm').onclick=e=>{if(e.target.id==='gm')closeGM()};
  $('side-footer').onclick=wsPicker;$('tx-search').oninput=initTransactions;$('expense-search').oninput=renderExpTable;
  $('global-search').oninput=e=>{if(page!=='transactions')navigate('transactions');$('tx-search').value=e.target.value;initTransactions()};
  $('bell').onclick=()=>openGM('Alerts',alerts().map(a=>`<div class="report-item" style="margin-bottom:8px"><div><div class="report-name"><span class="badge ${a.sev==='high'?'badge-danger':a.sev==='med'?'badge-warning':'badge-info'}">${a.sev==='high'?'High':a.sev==='med'?'Medium':'Info'}</span> ${esc(a.title)}</div><div class="report-meta">${esc(a.desc)}</div></div></div>`).join('')||'<div class="empty">All clear — no active alerts.</div>');
  // add transaction
  const ov=$('modal-overlay');$('tx-cur').innerHTML=Object.keys(SYM).map(c=>`<option>${c}</option>`).join('');
  $('add-transaction-btn').onclick=()=>{$('tx-cur').value=W().currency;$('tx-date').value=iso(new Date());$('tx-cats').innerHTML=cats().map(c=>`<option value="${esc(c)}">`).join('');ov.classList.add('open')};
  $('modal-close').onclick=()=>ov.classList.remove('open');ov.onclick=e=>{if(e.target===ov)ov.classList.remove('open')};
  $('save-transaction').onclick=()=>{const amount=parseFloat($('tx-amount').value),desc=$('tx-desc').value.trim(),date=$('tx-date').value,cat=$('tx-category').value.trim()||'Other';
    if(!(amount>0)||!desc||!date){toast('Enter a description, a positive amount and a date','error');return}
    const w=W();if(w.source==='demo'&&!confirm('This company contains demo data. Add your transaction to it anyway?\n(Cancel, then use "Start with empty workspace" to begin clean.)'))return;
    w.tx.push({id:uid('m'),date,desc,category:cat,type:$('tx-type').value==='Revenue'?'in':'out',amount,currency:$('tx-cur').value,status:'approved',src:'manual'});
    if(w.source==='blank')w.source='manual';if(save()){ov.classList.remove('open');$('tx-amount').value=$('tx-desc').value='';toast('Transaction added');render()}};
  // delegated clicks
  document.body.addEventListener('click',e=>{const t=e.target.closest('[data-go],[data-act],[data-del],[data-fs],[data-filter],[data-prev],[data-dl],[data-sw],[data-rmws]');if(!t)return;const d=t.dataset,w=W();
    if(d.go)navigate(d.go);
    else if(d.act==='clear-demo'){if(confirm('Remove the sample data from this company and start empty?')){w.tx=[];w.source='blank';w.budgets={};save();toast('Workspace cleared');navigate('sources')}}
    else if(d.del){w.tx=w.tx.filter(x=>x.id!==d.del);save();toast('Transaction deleted');render()}
    else if(d.fs){w.fraudStatus[d.fs]=d.st;save();toast('Status updated to '+d.st);render()}
    else if(d.filter){expFilter=d.filter;initExpenses()}
    else if(d.prev!==undefined){const rows=reportDefs()[d.prev].rows();openGM(reportDefs()[d.prev].name,`<div class="pnl-table-container" style="max-height:60vh;overflow:auto"><table class="data-table"><thead><tr>${rows[0].map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.slice(1,101).map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div><div class="rate-info">Showing ${Math.min(100,rows.length-1)} of ${rows.length-1} rows</div>`,true)}
    else if(d.dl!==undefined){const r=reportDefs()[d.dl];download(`${slug()}-${r.name.toLowerCase().replace(/[^a-z0-9]+/g,'-')}.csv`,toCSV(r.rows()));toast('Report downloaded')}
    else if(d.sw)switchWs(d.sw);
    else if(d.rmws){const x=store.workspaces[d.rmws];if(Object.keys(store.workspaces).length<2){toast('You need at least one company','error');return}
      if(confirm(`Delete "${x.name}" and all its data? This cannot be undone.`)){delete store.workspaces[d.rmws];if(store.active===d.rmws)store.active=Object.keys(store.workspaces)[0];save();closeGM();toast('Company deleted');render()}}});
  navigate('dashboard');
  fetchFx().then(()=>{if(page==='currency'||page==='dashboard')render()});
});
