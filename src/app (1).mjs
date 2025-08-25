// src/app.mjs — main app to be bundled to app.bundle.js
import { createClientAdapter } from '@spotware-web-team/sdk-external-api';
import {
  registerEvent, handleConfirmEvent, getAccountInformation,
  getLightSymbolList, subscribeQuotes, unsubscribeQuotes, quoteEvent
} from '@spotware-web-team/sdk';

(function(){
  const $ = (sel,root=document)=>root.querySelector(sel);
  const root = document.getElementById('app');
  root.innerHTML = `<div id="status">Booting…</div>
  <div style="margin-top:8px">
    <button id="account" disabled>Account info</button>
    <button id="load" disabled>Load symbols</button>
    <select id="sym" disabled></select>
    <button id="sub" disabled>Subscribe</button>
    <button id="unsub" disabled>Unsubscribe</button>
    <pre id="quote"></pre>
    <pre id="log"></pre>
  </div>`;

  const L = (m)=>{ $('#log').textContent += (typeof m==='string'?m:JSON.stringify(m)) + '\n'; };

  const sub = (obs, onNext) => {
    try {
      const s = obs && obs.subscribe ? obs.subscribe(v => {
        try { onNext && onNext(v); } finally { s.unsubscribe && s.unsubscribe(); }
      }, err => L('Error: '+(err?.message||err))) : null;
      return s;
    } catch (e) { L('Subscribe error: '+(e.message||e)); }
  };

  const adapter = createClientAdapter({});
  handleConfirmEvent(adapter).subscribe(()=>{});
  registerEvent(adapter).subscribe({
    next: ()=>{
      $('#status').textContent = 'Connected';
      $('#account').disabled = false;
      $('#load').disabled = false;
      L('Connected to host');
    },
    error: (err)=>L('registerEvent error: ' + (err?.message||err))
  });

  $('#account').onclick = ()=>{
    sub(getAccountInformation(adapter, {}), res => L('AccountInformation: '+JSON.stringify(res)));
  };

  $('#load').onclick = ()=>{
    const sel = $('#sym'); sel.innerHTML='';
    sub(getLightSymbolList(adapter, {}), list => {
      const items = list?.items || list || [];
      items.slice(0,300).forEach(s => {
        const name = s?.symbolName || s?.name || s;
        if(!name) return;
        const opt = document.createElement('option');
        opt.value = name; opt.textContent = name; sel.appendChild(opt);
      });
      sel.disabled = false; $('#sub').disabled = false; $('#unsub').disabled = false;
      L('Symbols loaded: '+sel.options.length);
      });
  };

  let qsub = null;
  $('#sub').onclick = ()=>{
    const sym = $('#sym').value;
    if(!sym) return;
    if(qsub) { qsub.unsubscribe?.(); qsub = null; }
    subscribeQuotes(adapter, { symbolName: sym }).subscribe(()=> L('Subscribed '+sym));
    qsub = quoteEvent(adapter, { symbolName: sym }).subscribe(q => { $('#quote').textContent = JSON.stringify(q,null,2);   });
  };

  $('#unsub').onclick = ()=>{
    const sym = $('#sym').value;
    if(!sym) return;
    try{
      sub(unsubscribeQuotes(adapter, { symbolName: sym }), ()=> L('Unsubscribed '+sym));
      if(qsub){ qsub.unsubscribe?.(); qsub = null; }
    }catch(e){ L('unsubscribe error: '+(e.message||e)); }
  };
})();
