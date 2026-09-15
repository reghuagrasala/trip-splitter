/**
 * Trip Splitter – Cloudflare Pages Worker (_worker.js)
 * Make sure your KV namespace (TRIP_STORE) is bound in your Pages project settings.
 */

const HTML_PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="theme-color" content="#0d9488">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-title" content="Trip Splitter">
  <title>Trip Splitter · ₹</title>
  <meta property="og:type" content="website">
  <meta property="og:title" content="Trip Splitter · ₹">
  <meta property="og:description" content="Split trip expenses fairly. Each person adds only their own expenses.">
  <meta property="og:image" content="/og-image.png">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" type="image/png" href="/icon-192.png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="manifest" href="/manifest.json">
  <style>
    :root{--bg:#f5f5f0;--card:#fffcf5;--primary:#0d9488;--primary-dark:#0f766e;--danger:#b91c1c;--text:#1c1917;--muted:#78716c;--border:#e7e5e4;--success:#059669;--yellow:#ca8a04}
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:var(--bg);color:var(--text);min-height:100vh;padding:12px;padding-bottom:70px;line-height:1.45;-webkit-tap-highlight-color:transparent}
    .container{max-width:420px;margin:0 auto}
    .header{text-align:center;padding:16px 0 8px}
    .header h1{font-size:1.5rem;font-weight:700;color:var(--primary-dark);display:flex;align-items:center;justify-content:center;gap:6px}
    .header p{color:var(--muted);font-size:.85rem;margin-top:4px}
    .card{background:var(--card);border-radius:16px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,.06);border:1px solid var(--border);margin-bottom:16px}
    .card h2{font-size:1.25rem;margin-bottom:12px}
    .hint{font-size:.85rem;color:var(--muted);margin-bottom:16px;line-height:1.4}
    label{display:block;font-size:.875rem;font-weight:500;margin-bottom:6px}
    input,select{width:100%;padding:12px 14px;border:1px solid var(--border);border-radius:10px;font-size:1rem;background:#fff;margin-bottom:14px}
    input:focus,select:focus{outline:none;border-color:var(--primary);box-shadow:0 0 0 3px rgba(13,148,136,.15)}
    .btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:12px 18px;border:none;border-radius:10px;font-size:1rem;font-weight:600;cursor:pointer;width:100%;transition:transform .1s}
    .btn:active{transform:scale(.98)}
    .btn-primary{background:var(--primary);color:#fff}
    .btn-primary:disabled{background:#a8a29e;cursor:not-allowed}
    .btn-secondary{background:#e7e5e4;color:var(--text)}
    .btn-whatsapp{background:#25d366;color:#fff}
    .btn-sms{background:#3b82f6;color:#fff}
    .btn-sm{padding:8px 12px;font-size:.875rem;width:auto}
    .row{display:flex;gap:8px;align-items:center;margin-bottom:14px}
    .row input{margin-bottom:0;flex:1}
    .member-chip,.expense-item{display:flex;align-items:center;justify-content:space-between;background:#f5f5f4;padding:10px 12px;border-radius:10px;margin-bottom:8px;font-size:.95rem}
    .member-chip .info{display:flex;flex-direction:column}
    .member-chip .name{font-weight:600}
    .member-chip .phone{font-size:.8rem;color:var(--muted)}
    .chip-remove{background:none;border:none;color:var(--danger);font-size:1.2rem;cursor:pointer;padding:0 4px}
    .tabs{display:flex;gap:4px;margin-bottom:16px;background:#e7e5e4;padding:4px;border-radius:12px}
    .tab{flex:1;padding:10px;text-align:center;border-radius:8px;font-weight:600;font-size:.9rem;cursor:pointer;color:var(--muted);border:none;background:transparent}
    .tab.active{background:#fff;color:var(--primary-dark);box-shadow:0 1px 2px rgba(0,0,0,.06)}
    .section{display:none}.section.active{display:block}
    .balance-card{background:#f0fdfa;border:1px solid #99f6e4;border-radius:12px;padding:14px;margin-bottom:10px}
    .balance-card.owes{background:#fef2f2;border-color:#fecaca}
    .balance-card.even{background:#f5f5f4;border-color:#d6d3d1}
    .balance-amount{font-size:1.25rem;font-weight:700}
    .balance-amount.positive{color:var(--success)}.balance-amount.negative{color:var(--danger)}
    .summary-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}
    .stat{background:#f5f5f4;padding:12px;border-radius:10px;text-align:center}
    .stat .label{font-size:.75rem;color:var(--muted)}.stat .value{font-size:1.15rem;font-weight:700;margin-top:2px}
    .share-box{background:#ecfdf5;border:1px dashed var(--primary);border-radius:12px;padding:14px;margin-top:16px}
    .share-box input{font-size:.8rem;margin-bottom:8px}
    .empty{text-align:center;color:var(--muted);padding:20px;font-size:.9rem}
    .expense-item .left{flex:1}.expense-item .amount{font-weight:700;color:var(--primary-dark)}.expense-item .meta{font-size:.8rem;color:var(--muted)}
    footer{text-align:center;font-size:.75rem;color:var(--muted);padding:20px 0}
    .hidden{display:none!important}
    .toast{position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1c1917;color:#fff;padding:12px 20px;border-radius:999px;font-size:.9rem;z-index:100;opacity:0;transition:opacity .3s;pointer-events:none}
    .toast.show{opacity:1}
    .identity-banner{background:#ecfdf5;border:1px solid #99f6e4;border-radius:12px;padding:12px 14px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center}
    .identity-banner .you{font-weight:600;color:var(--primary-dark)}
    .identity-pick{display:grid;gap:8px;margin-top:12px}
    .identity-pick button{text-align:left;padding:14px;border-radius:12px;border:1px solid var(--border);background:#fff;font-size:1rem;cursor:pointer;display:flex;justify-content:space-between;align-items:center}
    .identity-pick button:hover{border-color:var(--primary);background:#f0fdfa}
    .identity-pick .phone{font-size:.8rem;color:var(--muted)}
    .locked-note{font-size:.8rem;color:var(--muted);margin-top:-8px;margin-bottom:12px}
    .settlement-row{font-size:.95rem;margin-top:8px;padding:10px 12px;background:#fefce8;border:1px solid #fde047;border-radius:8px;color:var(--yellow);font-weight:700}
    .share-actions{display:grid;gap:10px;margin-top:12px}
    .shared-bar{position:fixed;bottom:0;left:0;right:0;background:#e7e5e4;color:#a8a29e;font-size:.8rem;text-align:center;padding:10px 16px;border-top:1px solid #d6d3d1;z-index:50;pointer-events:none}
    .loading{text-align:center;padding:40px;color:var(--muted)}
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1><span>₹</span> Trip Splitter</h1><p>Split expenses fairly · Short clean links</p></div>
    <div id="loading" class="loading hidden">Loading trip…</div>
    <div id="landing" class="card"><h2>Start a trip</h2><p class="hint">Create a new trip or open a shared link. Each person picks “I am …” once and can only edit their own expenses.</p><button class="btn btn-primary" onclick="showCreate()">Create new trip</button></div>
    <div id="setup" class="card hidden"><h2>Set up your trip</h2><p class="hint">Add every member with name + mobile. Mobile is used for WhatsApp / SMS sharing.</p>
      <label>Trip name</label><input type="text" id="tripName" placeholder="e.g. Munnar trip" maxlength="60">
      <label>Number of days</label><input type="number" id="tripDays" placeholder="e.g. 3" min="1" max="60">
      <label>Members (name + mobile)</label><div id="membersList" class="members-list"><div class="empty">No members yet</div></div>
      <div class="row"><input type="text" id="memberName" placeholder="Member's name" maxlength="40"><button class="btn btn-primary btn-sm" onclick="addMember()" style="width:auto;min-width:70px">Add</button></div>
      <input type="tel" id="memberPhone" placeholder="Mobile number (required)" maxlength="15" style="margin-top:-6px">
      <button class="btn btn-primary" onclick="saveTrip()" style="margin-top:8px">Save trip</button>
      <button class="btn btn-secondary" onclick="backToLanding()" style="margin-top:8px">Cancel</button>
    </div>
    <div id="identity" class="card hidden"><h2>Who are you?</h2><p class="hint">Pick yourself once. You can only add/delete expenses under your name.</p><div id="identityList" class="identity-pick"></div><button class="btn btn-secondary" style="margin-top:16px" onclick="backToLanding()">Cancel</button></div>
    <div id="app" class="hidden">
      <div class="card" style="padding-bottom:12px"><div style="display:flex;justify-content:space-between;align-items:flex-start"><div><h2 id="appTripName" style="margin-bottom:2px"></h2><div style="font-size:.85rem;color:var(--muted)" id="appTripMeta"></div></div><button class="btn btn-secondary btn-sm" onclick="resetAll()">New</button></div></div>
      <div id="identityBanner" class="identity-banner hidden"><div>You are <span class="you" id="currentYou"></span></div><button class="btn btn-secondary btn-sm" onclick="changeIdentity()">Change</button></div>
      <div id="shareCard" class="card hidden"><h2 style="font-size:1.1rem">Share with members</h2><p class="hint">Send the short link to all other members via WhatsApp or SMS.</p>
        <div class="share-actions"><button class="btn btn-whatsapp" onclick="shareAll('whatsapp')">WhatsApp to all members</button><button class="btn btn-sms" onclick="shareAll('sms')">SMS to all members</button><button class="btn btn-secondary" onclick="markAsShared()">I’ve shared — show “Shared with” bar</button></div>
        <div style="margin-top:12px"><label>Or copy short link</label><input type="text" id="shareLinkQuick" readonly onclick="this.select()"><button class="btn btn-secondary btn-sm" onclick="copyShareLink()">Copy link</button></div>
      </div>
      <div class="tabs"><button class="tab active" data-tab="expenses" onclick="switchTab('expenses')">Expenses</button><button class="tab" data-tab="balances" onclick="switchTab('balances')">Balances</button><button class="tab" data-tab="members" onclick="switchTab('members')">Members</button></div>
      <div id="tab-expenses" class="section active"><div class="card"><h2 style="font-size:1.1rem">Add my expense</h2><p class="locked-note" id="payerLockNote">You can only add expenses under your own name.</p>
        <div class="who-selector"><label>Paid by</label><select id="expensePayer" disabled></select></div>
        <label>Amount (₹)</label><input type="number" id="expenseAmount" placeholder="0" min="0" step="0.01">
        <label>Description</label><input type="text" id="expenseDesc" placeholder="e.g. Hotel, Food, Taxi" maxlength="80">
        <button class="btn btn-primary" id="addExpenseBtn" onclick="addExpense()">Add expense</button></div>
        <div class="card"><h2 style="font-size:1.1rem">All expenses</h2><p class="hint" style="margin-bottom:10px">You can delete only the expenses you paid.</p><div id="expensesList" class="expenses-list"><div class="empty">No expenses yet</div></div></div>
      </div>
      <div id="tab-balances" class="section"><div class="card"><div class="summary-grid"><div class="stat"><div class="label">Total spent</div><div class="value" id="totalSpent">₹0</div></div><div class="stat"><div class="label">Per person</div><div class="value" id="perPerson">₹0</div></div></div>
        <h2 style="font-size:1.1rem;margin-bottom:12px">Settlements</h2><div id="balancesList"><div class="empty">Add expenses to see balances</div></div>
        <div class="share-box"><label>Share this trip (short link)</label><input type="text" id="shareLink" readonly onclick="this.select()"><button class="btn btn-primary btn-sm" onclick="copyShareLink()">Copy link</button></div>
      </div></div>
      <div id="tab-members" class="section"><div class="card"><h2 style="font-size:1.1rem">Members</h2><p class="hint">Only the trip creator can add/remove members.</p><div id="appMembersList" class="members-list"></div>
        <div id="addMemberSection"><label style="margin-top:8px">Add another member</label><div class="row"><input type="text" id="newMemberName" placeholder="Name" maxlength="40"><button class="btn btn-primary btn-sm" onclick="addMemberToTrip()" style="width:auto">Add</button></div><input type="tel" id="newMemberPhone" placeholder="Mobile number" maxlength="15" style="margin-top:-6px"></div>
      </div></div>
    </div>
  </div>
  <div id="sharedBar" class="shared-bar hidden">Shared with <span id="sharedNames"></span></div>
  <footer>Short clean links · Each person edits only their own expenses · ₹ Trip Splitter</footer>
  <div id="toast" class="toast"></div>
<script>
const API = location.origin;
let state = { id:null, name:'', days:0, members:[], expenses:[], creatorId:null, sharedWith:null };
let currentUserId = null;
let saving = false;

function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,7); }
function formatINR(n){ return '₹'+Number(n).toLocaleString('en-IN',{maximumFractionDigits:2}); }
function toast(msg){ const el=document.getElementById('toast'); el.textContent=msg; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'),2500); }
function escapeHtml(s){ if(!s)return''; return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function cleanPhone(p){ if(!p)return''; let x=String(p).replace(/\\D/g,''); if(x.length===10)x='91'+x; return (x.length>=10&&x.length<=15)?x:''; }
function isValidPhone(p){ return cleanPhone(p)!==''; }

async function saveToServer(){
  if(!state.id || saving) return;
  saving = true;
  try{
    const res = await fetch(API+'/api/trips/'+state.id, {
      method:'PUT',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(state)
    });
    if(!res.ok) throw new Error('Save failed');
  }catch(e){
    console.error(e);
    toast('Could not save – check connection');
  }finally{ saving=false; }
}

function shortLink(){ return location.origin + '/t/' + state.id; }
function updateShareLinks(){
  const link = shortLink();
  const a=document.getElementById('shareLink'); if(a) a.value=link;
  const b=document.getElementById('shareLinkQuick'); if(b) b.value=link;
}

function getStoredIdentity(){ try{ return localStorage.getItem('tripIdentity_'+state.id); }catch(e){ return null; } }
function setStoredIdentity(id){ try{ localStorage.setItem('tripIdentity_'+state.id, id); }catch(e){} }
function clearStoredIdentity(){ try{ localStorage.removeItem('tripIdentity_'+state.id); }catch(e){} }

function showCreate(){
  document.getElementById('landing').classList.add('hidden');
  document.getElementById('setup').classList.remove('hidden');
  document.getElementById('identity').classList.add('hidden');
  document.getElementById('app').classList.add('hidden');
  document.getElementById('sharedBar').classList.add('hidden');
  document.getElementById('tripName').value='';
  document.getElementById('tripDays').value='';
  document.getElementById('memberName').value='';
  document.getElementById('memberPhone').value='';
  state={id:null,name:'',days:0,members:[],expenses:[],creatorId:null,sharedWith:null};
  currentUserId=null;
  renderMembersSetup();
}
function backToLanding(){
  document.getElementById('landing').classList.remove('hidden');
  document.getElementById('setup').classList.add('hidden');
  document.getElementById('identity').classList.add('hidden');
  document.getElementById('app').classList.add('hidden');
  document.getElementById('sharedBar').classList.add('hidden');
  history.replaceState(null,'',location.origin+'/');
  currentUserId=null;
}
function showIdentityPicker(){
  document.getElementById('landing').classList.add('hidden');
  document.getElementById('setup').classList.add('hidden');
  document.getElementById('app').classList.add('hidden');
  document.getElementById('identity').classList.remove('hidden');
  renderIdentityList();
}
function showApp(){
  document.getElementById('landing').classList.add('hidden');
  document.getElementById('setup').classList.add('hidden');
  document.getElementById('identity').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  renderApp();
  updateShareLinks();
  updateSharedBar();
  history.replaceState(null,'', '/t/'+state.id);
}

function switchTab(tab){
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.querySelector('.tab[data-tab="'+tab+'"]').classList.add('active');
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
  document.getElementById('tab-'+tab).classList.add('active');
  if(tab==='balances') renderBalances();
  if(tab==='members') renderAppMembers();
  if(tab==='expenses'){ renderExpenses(); setupPayerSelect(); }
}

function addMember(){
  const name=document.getElementById('memberName').value.trim();
  const phone=document.getElementById('memberPhone').value.trim();
  if(!name){ toast('Enter a name'); return; }
  if(!phone){ toast('Enter mobile number for sharing'); return; }
  if(!isValidPhone(phone)){ toast('Enter a valid mobile number (10 digits)'); return; }
  if(state.members.some(m=>m.name.toLowerCase()===name.toLowerCase())){ toast('Name already added'); return; }
  state.members.push({id:uid(),name,phone});
  document.getElementById('memberName').value='';
  document.getElementById('memberPhone').value='';
  renderMembersSetup();
}
function removeMemberSetup(id){ state.members=state.members.filter(m=>m.id!==id); renderMembersSetup(); }
function renderMembersSetup(){
  const list=document.getElementById('membersList');
  if(!state.members.length){ list.innerHTML='<div class="empty">No members yet</div>'; return; }
  list.innerHTML=state.members.map(m=>\`<div class="member-chip"><div class="info"><span class="name">\${escapeHtml(m.name)}</span><span class="phone">\${escapeHtml(m.phone||'No mobile')}</span></div><button class="chip-remove" onclick="removeMemberSetup('\${m.id}')">×</button></div>\`).join('');
}

async function saveTrip(){
  const name=document.getElementById('tripName').value.trim();
  const days=parseInt(document.getElementById('tripDays').value,10);
  if(!name){ toast('Enter trip name'); return; }
  if(!days||days<1){ toast('Enter number of days'); return; }
  if(state.members.length<1){ toast('Add at least one member'); return; }
  state.id = uid();
  state.name=name; state.days=days; state.expenses=[];
  state.creatorId=state.members[0].id; state.sharedWith=null;
  currentUserId=state.creatorId;
  setStoredIdentity(currentUserId);
  try{
    const res=await fetch(API+'/api/trips',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(state)});
    if(!res.ok) throw new Error('Create failed');
    const data=await res.json();
    state.id = data.id || state.id;
    showApp();
    toast('Trip saved! Share the short link');
  }catch(e){
    toast('Could not create trip – check connection');
    console.error(e);
  }
}

function renderIdentityList(){
  document.getElementById('identityList').innerHTML=state.members.map(m=>\`<button onclick="selectIdentity('\${m.id}')"><div><div style="font-weight:600">\${escapeHtml(m.name)}</div>\${m.phone?\`<div class="phone">\${escapeHtml(m.phone)}</div>\`:''}</div><span style="color:var(--primary)">Select →</span></button>\`).join('');
}
function selectIdentity(id){ currentUserId=id; setStoredIdentity(id); showApp(); toast('You are set as '+(state.members.find(m=>m.id===id)?.name||'')); }
function changeIdentity(){ clearStoredIdentity(); currentUserId=null; showIdentityPicker(); }

function renderApp(){
  document.getElementById('appTripName').textContent=state.name;
  document.getElementById('appTripMeta').textContent=\`\${state.days} day\${state.days>1?'s':''} · \${state.members.length} members\`;
  const me=state.members.find(m=>m.id===currentUserId);
  const banner=document.getElementById('identityBanner');
  if(me){ banner.classList.remove('hidden'); document.getElementById('currentYou').textContent=me.name+(me.phone?' · '+me.phone:''); }
  else banner.classList.add('hidden');
  const shareCard=document.getElementById('shareCard');
  if(currentUserId===state.creatorId && !state.sharedWith) shareCard.classList.remove('hidden');
  else shareCard.classList.add('hidden');
  setupPayerSelect(); renderExpenses(); renderBalances(); renderAppMembers(); updateSharedBar();
}
function updateSharedBar(){
  const bar=document.getElementById('sharedBar');
  if(state.sharedWith&&state.sharedWith.length){ document.getElementById('sharedNames').textContent=state.sharedWith.join(', '); bar.classList.remove('hidden'); }
  else bar.classList.add('hidden');
}

function getShareMessage(){
  return \`Join our trip "\${state.name}" on Trip Splitter.\\n\\nOpen this link and pick your name:\\n\${shortLink()}\`;
}
async function shareAll(type){
  const others=state.members.filter(m=>m.id!==currentUserId);
  if(!others.length){ toast('No other members to share with'); return; }
  const withPhone=[], missing=[];
  others.forEach(m=>{ if(isValidPhone(m.phone)) withPhone.push(m); else missing.push(m.name); });
  if(missing.length){
    if(!withPhone.length){ alert('Cannot share.\\n\\nThese members have no valid mobile number:\\n• '+missing.join('\\n• ')+'\\n\\nAdd numbers in Members tab first.'); toast('Missing mobile numbers'); return; }
    if(!confirm('Some members have no valid number:\\n• '+missing.join('\\n• ')+'\\n\\nShare only with '+withPhone.length+' member(s)?')){ toast('Share cancelled'); return; }
  }
  const msg=encodeURIComponent(getShareMessage());
  let opened=0;
  withPhone.forEach((m,idx)=>{
    const phone=cleanPhone(m.phone);
    setTimeout(()=>{
      try{ window.open(type==='whatsapp'?\`https://wa.me/\${phone}?text=\${msg}\`:\`sms:\${phone}?body=\${msg}\`,'_blank'); }
      catch(e){ toast('Could not open for '+m.name); }
      opened++;
      if(opened===withPhone.length) setTimeout(()=>{ if(confirm('Did you send the messages? Mark as shared?')) markAsShared(); },800);
    }, idx*700);
  });
  toast(\`Opening \${type==='whatsapp'?'WhatsApp':'SMS'} for \${withPhone.length} member\${withPhone.length>1?'s':''}…\`);
}
async function markAsShared(){
  const others=state.members.filter(m=>m.id!==state.creatorId);
  state.sharedWith=others.map(m=>m.name.slice(0,3));
  await saveToServer();
  updateSharedBar();
  document.getElementById('shareCard').classList.add('hidden');
  toast('Shared bar is now visible to everyone');
}

function setupPayerSelect(){
  const sel=document.getElementById('expensePayer');
  const me=state.members.find(m=>m.id===currentUserId);
  if(me){ sel.innerHTML=\`<option value="\${me.id}">\${escapeHtml(me.name)} (you)</option>\`; sel.disabled=true; document.getElementById('payerLockNote').textContent='Locked to your name.'; document.getElementById('addExpenseBtn').disabled=false; }
  else{ sel.innerHTML='<option value="">Select yourself first</option>'; sel.disabled=true; document.getElementById('addExpenseBtn').disabled=true; }
}
function renderExpenses(){
  const list=document.getElementById('expensesList');
  if(!state.expenses.length){ list.innerHTML='<div class="empty">No expenses yet</div>'; return; }
  const sorted=[...state.expenses].sort((a,b)=>b.ts-a.ts);
  list.innerHTML=sorted.map(e=>{
    const payer=state.members.find(m=>m.id===e.payerId);
    const isMine=e.payerId===currentUserId;
    return \`<div class="expense-item"><div class="left"><div><strong>\${escapeHtml(e.desc||'Expense')}</strong></div><div class="meta">\${payer?escapeHtml(payer.name):'?'} · \${new Date(e.ts).toLocaleDateString('en-IN')}</div></div><div style="text-align:right"><div class="amount">\${formatINR(e.amount)}</div>\${isMine?\`<button class="chip-remove" onclick="removeExpense('\${e.id}')">×</button>\`:'<span style="font-size:.75rem;color:var(--muted)">locked</span>'}</div></div>\`;
  }).join('');
}
async function addExpense(){
  if(!currentUserId){ toast('Select who you are first'); return; }
  const amount=parseFloat(document.getElementById('expenseAmount').value);
  const desc=document.getElementById('expenseDesc').value.trim();
  if(!amount||amount<=0){ toast('Enter a valid amount'); return; }
  state.expenses.push({id:uid(),payerId:currentUserId,amount:Math.round(amount*100)/100,desc:desc||'Expense',ts:Date.now()});
  document.getElementById('expenseAmount').value=''; document.getElementById('expenseDesc').value='';
  renderExpenses(); await saveToServer(); toast('Expense added');
}
async function removeExpense(id){
  const exp=state.expenses.find(e=>e.id===id);
  if(!exp||exp.payerId!==currentUserId){ toast('You can only delete your own expenses'); return; }
  state.expenses=state.expenses.filter(e=>e.id!==id); renderExpenses(); await saveToServer(); toast('Removed');
}

function renderBalances(){
  const total=state.expenses.reduce((s,e)=>s+e.amount,0);
  const n=state.members.length||1; const fair=total/n;
  document.getElementById('totalSpent').textContent=formatINR(total);
  document.getElementById('perPerson').textContent=formatINR(fair);
  const paid={}; state.members.forEach(m=>paid[m.id]=0);
  state.expenses.forEach(e=>{ paid[e.payerId]=(paid[e.payerId]||0)+e.amount; });
  const balances=state.members.map(m=>{ const bal=(paid[m.id]||0)-fair; return {...m,paid:paid[m.id]||0,balance:Math.round(bal*100)/100}; });
  const list=document.getElementById('balancesList');
  if(total===0){ list.innerHTML='<div class="empty">Add expenses to see balances</div>'; return; }
  list.innerHTML=balances.map(b=>{
    let cls='even',label='Settled',ac='';
    if(b.balance>0.01){cls='';label='To receive';ac='positive';}
    else if(b.balance<-0.01){cls='owes';label='To pay';ac='negative';}
    return \`<div class="balance-card \${cls}"><div style="display:flex;justify-content:space-between;align-items:center"><div><div style="font-weight:600">\${escapeHtml(b.name)}</div><div style="font-size:.8rem;color:var(--muted)">Paid \${formatINR(b.paid)} · \${label}</div></div><div class="balance-amount \${ac}">\${b.balance>0.01?'+':''}\${formatINR(Math.abs(b.balance))}</div></div></div>\`;
  }).join('');
  const debtors=balances.filter(b=>b.balance<-0.01).sort((a,c)=>a.balance-c.balance);
  const creditors=balances.filter(b=>b.balance>0.01).sort((a,c)=>c.balance-a.balance);
  if(debtors.length&&creditors.length){
    let s='<div style="margin-top:16px"><strong style="font-size:.9rem">Suggested payments</strong></div>';
    let d=debtors.map(x=>({...x})),c=creditors.map(x=>({...x})); let i=0,j=0;
    while(i<d.length&&j<c.length){
      const pay=Math.min(-d[i].balance,c[j].balance);
      if(pay>0.01){ s+=\`<div class="settlement-row">\${escapeHtml(d[i].name)} pays \${escapeHtml(c[j].name)} \${formatINR(pay)}</div>\`; d[i].balance+=pay; c[j].balance-=pay; }
      if(Math.abs(d[i].balance)<0.02)i++; if(Math.abs(c[j].balance)<0.02)j++;
    }
    list.innerHTML+=s;
  }
}

function renderAppMembers(){
  const list=document.getElementById('appMembersList');
  const isCreator=currentUserId===state.creatorId;
  list.innerHTML=state.members.map(m=>{
    const paid=state.expenses.filter(e=>e.payerId===m.id).reduce((s,e)=>s+e.amount,0);
    const canRemove=isCreator&&m.id!==state.creatorId;
    return \`<div class="member-chip"><div class="info"><span class="name">\${escapeHtml(m.name)}\${m.id===currentUserId?' (you)':''}</span><span class="phone">\${m.phone?escapeHtml(m.phone)+' · ':''}Paid \${formatINR(paid)}</span></div>\${canRemove?\`<button class="chip-remove" onclick="removeMemberFromTrip('\${m.id}')">×</button>\`:''}</div>\`;
  }).join('');
  document.getElementById('addMemberSection').classList.toggle('hidden',!isCreator);
}
async function addMemberToTrip(){
  if(currentUserId!==state.creatorId){ toast('Only the trip creator can add members'); return; }
  const name=document.getElementById('newMemberName').value.trim();
  const phone=document.getElementById('newMemberPhone').value.trim();
  if(!name){ toast('Enter a name'); return; }
  if(!phone){ toast('Enter mobile number for sharing'); return; }
  if(!isValidPhone(phone)){ toast('Enter a valid mobile number (10 digits)'); return; }
  if(state.members.some(m=>m.name.toLowerCase()===name.toLowerCase())){ toast('Already exists'); return; }
  state.members.push({id:uid(),name,phone});
  document.getElementById('newMemberName').value=''; document.getElementById('newMemberPhone').value='';
  renderAppMembers(); await saveToServer(); toast('Member added');
}
async function removeMemberFromTrip(id){
  if(currentUserId!==state.creatorId){ toast('Only the trip creator can remove members'); return; }
  if(state.members.length<=1){ toast('Need at least one member'); return; }
  if(!confirm('Remove this member and their expenses?')) return;
  state.members=state.members.filter(m=>m.id!==id);
  state.expenses=state.expenses.filter(e=>e.payerId!==id);
  renderAppMembers(); renderExpenses(); await saveToServer(); toast('Member removed');
}
function copyShareLink(){
  const input=document.getElementById('shareLink')||document.getElementById('shareLinkQuick');
  if(!input)return; input.select();
  navigator.clipboard.writeText(input.value).then(()=>toast('Short link copied!')).catch(()=>toast('Select and copy manually'));
}
function resetAll(){ if(!confirm('Start a new trip?'))return; clearStoredIdentity(); backToLanding(); state={id:null,name:'',days:0,members:[],expenses:[],creatorId:null,sharedWith:null}; currentUserId=null; }

async function loadTrip(id){
  document.getElementById('loading').classList.remove('hidden');
  document.getElementById('landing').classList.add('hidden');
  try{
    const res=await fetch(API+'/api/trips/'+id);
    if(!res.ok) throw new Error('Not found');
    state=await res.json();
    if(!state.creatorId&&state.members.length) state.creatorId=state.members[0].id;
    const stored=getStoredIdentity();
    if(stored&&state.members.some(m=>m.id===stored)){ currentUserId=stored; showApp(); }
    else showIdentityPicker();
  }catch(e){
    toast('Trip not found or offline');
    document.getElementById('landing').classList.remove('hidden');
  }finally{ document.getElementById('loading').classList.add('hidden'); }
}

(function init(){
  const path=location.pathname;
  const m=path.match(/^\\/t\\/([a-z0-9-]+)$/i);
  if(m) loadTrip(m[1]);
  else document.getElementById('landing').classList.remove('hidden');
})();
</script>
</body>
</html>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Handle API: Create trip
    if (path === '/api/trips' && request.method === 'POST') {
      try {
        const body = await request.json();
        const id = body.id || crypto.randomUUID().slice(0, 8);
        body.id = id;
        await env.TRIP_STORE.put('trip:' + id, JSON.stringify(body), { expirationTtl: 60 * 60 * 24 * 90 }); 
        return json({ id, ok: true });
      } catch (e) {
        return json({ error: e.message }, 500);
      }
    }

    // Handle API: Get / Update trip
    const tripMatch = path.match(/^\/api\/trips\/([a-z0-9-]+)$/i);
    if (tripMatch) {
      const id = tripMatch[1];
      if (request.method === 'GET') {
        const data = await env.TRIP_STORE.get('trip:' + id);
        if (!data) return json({ error: 'Not found' }, 404);
        return json(JSON.parse(data));
      }
      if (request.method === 'PUT') {
        try {
          const body = await request.json();
          body.id = id;
          await env.TRIP_STORE.put('trip:' + id, JSON.stringify(body), { expirationTtl: 60 * 60 * 24 * 90 });
          return json({ ok: true });
        } catch (e) {
          return json({ error: e.message }, 500);
        }
      }
    }

    // Root HTML page and Short links
    if (path === '/' || path === '/index.html' || path.startsWith('/t/')) {
      return new Response(HTML_PAGE, {
        headers: { 'Content-Type': 'text/html;charset=UTF-8', 'Cache-Control': 'no-cache' },
      });
    }

    // This ensures your icons and manifest load correctly from GitHub files
    return env.ASSETS.fetch(request);
  },
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}