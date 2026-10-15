'use strict';
const $=id=>document.getElementById(id);
const tg=window.Telegram?.WebApp;
const colors=['#c5f77a','#b5a3f3','#79b6c9','#eca897','#e0ce82','#8e9cea','#87b4a6','#d5a2cb','#a5b9cb','#d6ae78','#959d96'];
const icons={'Еда':'◒','Кафе':'☕','Транспорт':'↗','Жильё':'⌂','Здоровье':'+','Одежда':'◇','Связь':'⌁','Учёба':'▤','Развлечения':'✦','Подписки':'↻','Работа':'▣','Подарок':'✧','Родители':'♡','Подработка':'↗','Возврат':'↩','Накопления':'◎','Между своими счетами':'⇄'};
let period='month',offset=0,kind='all',categoryKind='expense',data=null,demoMode=new URLSearchParams(location.search).get('demo')==='1'||(!window.Telegram?.WebApp?.initData),requestSerial=0;
const locale=()=>window.FinanceI18n.locale;
const money=cents=>new Intl.NumberFormat(locale(),{minimumFractionDigits:2,maximumFractionDigits:2}).format(cents/100);
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
const today=()=>{const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Minsk',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const p=Object.fromEntries(parts.map(x=>[x.type,x.value]));return new Date(Number(p.year),Number(p.month)-1,Number(p.day),12);};
const iso=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
const dateLabel=d=>new Date(d+'T12:00:00').toLocaleDateString(locale(),{day:'numeric',month:'short'});

function bounds(){
  const end=today();let start=new Date(end);let last=new Date(end);
  if(period==='month'){
    start=new Date(end.getFullYear(),end.getMonth()+offset,1,12);
    last=offset===0?end:new Date(start.getFullYear(),start.getMonth()+1,0,12);
  }else if(period==='week')start.setDate(start.getDate()-6);
  else if(period==='year')start=new Date(end.getFullYear(),0,1,12);
  else start=new Date(2000,0,1,12);
  $('period-label').textContent=period==='month'?start.toLocaleDateString(locale(),{month:'long',year:'numeric'}):period==='year'?window.FinanceI18n.language==='ru'?`${end.getFullYear()} год`:`${end.getFullYear()}`:period==='week'?`${dateLabel(iso(start))} — ${dateLabel(iso(end))}`:'Все операции';
  $('previous').disabled=period!=='month'||start.getFullYear()<=2000&&start.getMonth()===0;
  $('next').disabled=period!=='month'||offset>=0;
  return {start:iso(start),end:iso(last)};
}

function showAmount(id,cents){const n=$(id);n.replaceChildren(document.createTextNode(money(cents)),el('span','unit','BYN'));}
function change(id,current,previous,isExpense=false){
  const n=$(id);
  if(!previous){n.textContent=current?'Новый результат за период':'Пока без операций';return;}
  const diff=(current-previous)/previous*100;
  n.textContent=`${diff>=0?'↑':'↓'} ${Math.abs(diff).toFixed(1).replace('.',window.FinanceI18n.language==='ru'?',':'.')}% к предыдущему периоду`;
  n.style.color=(isExpense?diff<=0:diff>=0)?'var(--green)':'var(--red)';
}

function render(){
  const t=data.totals,remaining=t.income-t.expense;
  showAmount('balance',remaining);showAmount('income',t.income);showAmount('expense',t.expense);
  const rate=t.income?remaining/t.income*100:null;
  $('saving').textContent=rate===null?'Разница введённых доходов и расходов':`${rate.toFixed(1).replace('.',window.FinanceI18n.language==='ru'?',':'.')}% доходов осталось за период`;
  $('saving-bar').style.width=`${Math.max(0,Math.min(100,rate||0))}%`;
  change('income-change',t.income,data.previous.income||0);
  change('expense-change',t.expense,data.previous.expense||0,true);
  $('daily').textContent=money(data.daily_average)+' BYN';$('count').textContent=data.count.toLocaleString(locale());
  $('sync').textContent=demoMode?'Вымышленные данные для знакомства':data.pending?`Ожидают Google Sheets: ${data.pending}`:`Google Sheets · обновлено ${new Date(data.updated).toLocaleTimeString(locale(),{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Minsk'})}`;
  $('sync').classList.toggle('sync-pending',!demoMode&&data.pending>0);
  renderTrend();renderCategories();renderTransactions();window.FinanceI18n.apply();
}

function svgNode(tag,attrs={}){const n=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,String(v));return n;}
function renderTrend(){
  const target=$('trend');target.replaceChildren();
  const points=data.timeline;
  if(!points.length||!points.some(p=>p.expense||p.income)){target.append(el('div','chart-empty','Здесь появится динамика ваших операций'));return;}
  const svg=svgNode('svg',{viewBox:'0 0 540 230',role:'img','aria-label':'Доходы и расходы по дням или месяцам'});
  const W=476,H=172,x0=50,y0=12;
  const max=Math.max(100,...points.flatMap(p=>[p.income,p.expense]));
  const unit=10**Math.floor(Math.log10(max));const ceiling=Math.ceil(max/unit)*unit;
  for(let i=0;i<4;i++){
    const y=y0+H-i*H/3;
    svg.append(svgNode('line',{x1:x0,y1:y,x2:530,y2:y,class:'grid'}));
    const label=svgNode('text',{x:0,y:y+4});const val=ceiling*i/3/100;label.textContent=val>=1000?(val/1000).toFixed(1)+(window.FinanceI18n.language==='ru'?'к':'k'):Math.round(val).toLocaleString(locale());svg.append(label);
  }
  const n=points.length,step=W/Math.max(n,1),bw=Math.max(.7,Math.min(9,step*.32));
  points.forEach((p,i)=>{
    const x=x0+(i+.5)*step;
    for(const[k,col,shift]of [['income','#a6e4bb',-bw-.7],['expense','#b5a3f3',.7]]){
      const h=p[k]/ceiling*H;
      const bar=svgNode('rect',{x:x+shift,y:y0+H-h,width:bw,height:Math.max(p[k]?2:0,h),rx:Math.min(3,bw/2),fill:col,opacity:k==='expense'?'.9':'1'});
      const title=svgNode('title');title.textContent=`${p.date} · ${k==='income'?'Доходы':'Расходы'}: ${money(p[k])} BYN`;bar.append(title);svg.append(bar);
    }
  });
  const indexes=[...new Set([0,Math.floor((n-1)/3),Math.floor((n-1)*2/3),n-1])];
  indexes.forEach(i=>{const tx=svgNode('text',{x:x0+(i+.5)*step,y:211,'text-anchor':'middle'});const d=points[i].date;tx.textContent=d.length===7?new Date(d+'-01T12:00:00').toLocaleDateString(locale(),{month:'short',year:n>24?'2-digit':undefined}):dateLabel(d);svg.append(tx);});
  target.append(svg);
}

function renderCategories(){
  const list=data.categories[categoryKind]||[],total=data.totals[categoryKind];
  $('donut-label').textContent=categoryKind==='expense'?'Всего расходов':'Всего доходов';
  $('category-title').textContent=categoryKind==='expense'?'Куда уходят деньги':'Откуда приходят деньги';
  $('category-toggle').textContent=categoryKind==='expense'?'Расходы ⇄':'Доходы ⇄';
  $('donut-total').textContent=money(total);
  const svg=$('donut');svg.replaceChildren();
  svg.append(svgNode('circle',{cx:110,cy:110,r:88,fill:'none',stroke:'var(--line)','stroke-width':19}));
  const circumference=2*Math.PI*88;let used=0;
  list.forEach((c,i)=>{
    const fraction=total?c.cents/total:0,len=fraction*circumference;
    const arc=svgNode('circle',{cx:110,cy:110,r:88,fill:'none',stroke:colors[i%colors.length],'stroke-width':19,'stroke-dasharray':`${Math.max(0,len-4)} ${circumference-Math.max(0,len-4)}`,'stroke-dashoffset':-used});
    const title=svgNode('title');title.textContent=`${c.name}: ${money(c.cents)} BYN (${Math.round(fraction*100)}%)`;arc.append(title);svg.append(arc);used+=len;
  });
  const target=$('category-list');target.replaceChildren();
  if(!list.length){target.append(el('div','empty',categoryKind==='expense'?'Расходов за этот период нет':'Доходов за этот период нет'));return;}
  list.forEach((c,i)=>{const row=el('div','category-row'),dot=el('i','category-dot'),pct=total?c.cents/total*100:0;dot.style.background=colors[i%colors.length];row.append(dot,el('span','',c.name),el('span','sum',money(c.cents)),el('span','percent',`${Math.round(pct)}%`));const bar=el('div','category-bar'),fill=el('i');fill.style.width=pct+'%';fill.style.background=colors[i%colors.length];bar.append(fill);row.append(bar);target.append(row);});
}

function renderTransactions(){
  const target=$('transactions');target.replaceChildren();
  const rows=data.transactions.filter(t=>kind==='all'||t.kind===kind);
  if(!rows.length){target.append(el('div','empty','Пока нет операций за этот период.\nДобавьте доход или расход в чате с ботом.'));}
  for(const t of rows.slice(0,30)){
    const row=el('div','transaction'),desc=el('div'),value=el('div','tx-value '+t.kind);
    desc.append(el('div','tx-title',t.category),el('div','tx-note',t.note||(t.kind==='income'?'Доход':t.kind==='transfer'?'Между своими счетами':'Расход')));
    if(!demoMode)desc.querySelector('.tx-note').setAttribute('data-user-content','true');
    value.append(document.createTextNode((t.kind==='income'?'+ ':t.kind==='expense'?'− ':'↔ ')+money(t.cents)),el('div','tx-date',dateLabel(t.day)));
    row.append(el('div','tx-icon',icons[t.category]||'·'),desc,value);target.append(row);
  }
  $('history-note').textContent=data.count>30?'Здесь показаны последние операции. Полная история и исправление — в чате с ботом.':'Отменённые записи исключены. Переводы себе не меняют итог доходов и расходов.';
}

function demoData(b){
  // Synthetic preview only. It never reads or substitutes the owner's actual data.
  const end=today(),samples=[];
  const expenseCats=['Еда','Транспорт','Кафе','Подписки','Развлечения','Здоровье'];
  for(let i=0;i<150;i++){
    const day=new Date(end);day.setDate(day.getDate()-i);
    if(day.getDate()===5||day.getDate()===20)samples.push({id:1000+i,kind:'income',category:'Работа',cents:day.getDate()===5?185000:90000,day:iso(day),note:day.getDate()===5?'Зарплата':'Аванс'});
    if(i%5!==0)samples.push({id:i+1,kind:'expense',category:expenseCats[i%6],cents:[3750,840,1680,2490,5200,2950][i%6]+(i%7)*80,day:iso(day),note:['Продукты на неделю','Поездка по городу','Кофе с друзьями','Музыка и сервисы','Выходные','Аптека'][i%6]});
  }
  const rows=samples.filter(t=>t.day>=b.start&&t.day<=b.end).sort((a,c)=>c.day.localeCompare(a.day)||c.id-a.id),totals={income:0,expense:0,transfer:0},groups={income:{},expense:{}},timeline={};
  const start=new Date(b.start+'T12:00:00'),stop=new Date(b.end+'T12:00:00');const duration=Math.round((stop-start)/86400000)+1;
  // Demo "all time" displays only the sample's available 150 days on the chart.
  let cursor=new Date(Math.max(+start,+end-149*86400000));
  for(;cursor<=stop;cursor.setDate(cursor.getDate()+1)){const key=duration>62?iso(cursor).slice(0,7):iso(cursor);timeline[key]??={date:key,income:0,expense:0};}
  for(const t of rows){totals[t.kind]+=t.cents;groups[t.kind][t.category]=(groups[t.kind][t.category]||0)+t.cents;const key=duration>62?t.day.slice(0,7):t.day;timeline[key]??={date:key,income:0,expense:0};timeline[key][t.kind]+=t.cents;}
  const categories=Object.fromEntries(Object.entries(groups).map(([k,g])=>[k,Object.entries(g).map(([name,cents])=>({name,cents})).sort((a,c)=>c.cents-a.cents)]));
  return {...b,totals,previous:{income:Math.round(totals.income*.92),expense:Math.round(totals.expense*1.14)},categories,timeline:Object.values(timeline).sort((a,c)=>a.date.localeCompare(c.date)),transactions:rows,count:rows.length,pending:0,daily_average:Math.round(totals.expense/duration),updated:new Date().toISOString()};
}

async function load(){
  const current=++requestSerial,b=bounds();$('error').classList.add('hidden');$('loading').classList.remove('hidden');
  try{
    if(demoMode){data=demoData(b);}else{
      const response=await fetch('/api/analytics',{method:'POST',headers:{'Content-Type':'application/json','X-Telegram-Init-Data':tg?.initData||''},body:JSON.stringify(b),credentials:'omit',cache:'no-store',signal:AbortSignal.timeout(20000)});
      const result=await response.json();if(!response.ok)throw Error(result.error||'Не удалось обновить данные.');if(current!==requestSerial)return;data=result;
    }
    render();
  }catch(e){if(current!==requestSerial)return;$('error').textContent=e.name==='TimeoutError'?'Долго нет ответа. Нажмите ↻, чтобы повторить.':e.message;$('error').classList.remove('hidden');}
  finally{if(current===requestSerial)$('loading').classList.add('hidden');window.FinanceI18n.apply();}
}

function launch(){
  $('app').classList.remove('hidden');$('gate').classList.add('hidden');$('demo-banner').classList.toggle('hidden',!demoMode);$('live-label').textContent=demoMode?'Демо-режим':'Личный доступ';load();
}
document.querySelectorAll('[data-period]').forEach(b=>b.addEventListener('click',()=>{period=b.dataset.period;offset=0;document.querySelectorAll('[data-period]').forEach(x=>x.classList.toggle('active',x===b));tg?.HapticFeedback?.selectionChanged();load();}));
document.querySelectorAll('[data-kind]').forEach(b=>b.addEventListener('click',()=>{kind=b.dataset.kind;document.querySelectorAll('[data-kind]').forEach(x=>x.classList.toggle('active',x===b));if(data){renderTransactions();window.FinanceI18n.apply();}}));
$('previous').addEventListener('click',()=>{offset--;load();});$('next').addEventListener('click',()=>{offset=Math.min(0,offset+1);load();});
$('category-toggle').addEventListener('click',()=>{categoryKind=categoryKind==='expense'?'income':'expense';if(data){renderCategories();window.FinanceI18n.apply();}});
$('refresh').addEventListener('click',()=>{if(demoMode||tg?.initData)load();});
$('demo').addEventListener('click',()=>{demoMode=true;history.replaceState(null,'','?demo=1#dashboard');launch();});
if(tg?.initData){tg.ready();tg.expand();try{tg.setHeaderColor('#101315');tg.setBackgroundColor('#101315');}catch{}}
if(demoMode||tg?.initData)launch();else $('gate').classList.remove('hidden');

// Scroll progress drives the opening scene; no wheel or touch events are intercepted.
const journey = $('journey');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let scrollQueued = false;
function paintJourney() {
  const distance = Math.max(1, journey.offsetHeight - innerHeight);
  const p = Math.max(0, Math.min(1, -journey.getBoundingClientRect().top / distance));
  journey.style.setProperty('--journey', p.toFixed(4));
  journey.style.setProperty('--scene-opacity', Math.max(0, 1 - p * 1.75).toFixed(4));
  journey.style.setProperty('--phrase-opacity', Math.max(0, Math.min(1, (p - .36) * 4, (1 - p) * 5)).toFixed(4));
  $('journey-progress').textContent = String(Math.round(p * 100)).padStart(2, '0');
  $('journey-bar').style.width = `${p * 100}%`;
  scrollQueued = false;
}
function queueScroll() { if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(paintJourney); } }
addEventListener('scroll', queueScroll, {passive:true});
addEventListener('resize', queueScroll, {passive:true});
paintJourney();
const revealObserver = new IntersectionObserver(entries => {
  for (const entry of entries) if (entry.isIntersecting) {
    entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target);
  }
}, {threshold: .07});
document.querySelectorAll('.metric, .panel, .intro, .period-row').forEach((node, i) => {
  node.classList.add('reveal'); node.style.setProperty('--reveal-delay', `${i % 3 * 70}ms`); revealObserver.observe(node);
});
if (location.hash === '#dashboard') requestAnimationFrame(() => $('dashboard').scrollIntoView());

addEventListener('finance-language-change',()=>{bounds();if(data)render();window.FinanceI18n.apply();});
