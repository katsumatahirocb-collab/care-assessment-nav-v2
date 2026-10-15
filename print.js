window.CANPRINT = (()=>{
  const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const arr=v=>Array.isArray(v)?v.join('・'):(v||'');
  const get=(a,k)=>{const u=a.unconfirmed?.[k];return u?.reason?`確認できず（${u.reason}）`:(a.data?.[k]??'');};
  const issue=(a,id)=>{const j=a.judgments?.[id];if(!j)return'';let t=j.value||'';if(j.value==='判断保留'&&j.reason)t+=`（${j.reason}${j.note?`：${j.note}`:''}）`;if(j.value==='課題あり'&&j.note)t+=`：${j.note}`;return t;};
  const sourceText=(a,k)=>{const s=a.sources?.[k]||{};return [['本人',s.self],['家族',s.family],['CM観察',s.cm],['他職種・書類',s.other]].filter(x=>String(x[1]||'').trim()).map(x=>`${x[0]}：${x[1]}`).join('\n');};
  const val=(a,k,v)=>{const unc=a.unconfirmed?.[k]?.reason;const x=unc?`確認できず（${unc}）`:arr(v??get(a,k)),src=sourceText(a,k);return [x,src].filter(Boolean).join(x&&src?'\n':'');};
  const row=(l,v)=>`<tr><th>${esc(l)}</th><td>${esc(v).replace(/\n/g,'<br>')}</td></tr>`;
  const section=(title,body,jud='')=>`<section><h2>${esc(title)}${jud?`<span class="judgment">${esc(jud)}</span>`:''}</h2><table>${body}</table></section>`;
  const fmtDate=v=>v?String(v).replace(/-/g,'/'):'';
  function basicRows(user,a){return [
    row('利用者氏名',user.name),row('フリガナ',user.kana),row('性別',user.sex),row('生年月日',fmtDate(user.dob)),row('介護度',user.careLevel),row('住所',user.address),row('電話番号',user.phone),
    row('計画の作成の状況',get(a,'planStatus')),row('アセスメント理由',[get(a,'assessmentReason'),get(a,'assessmentReasonNote')].filter(Boolean).join('：')),row('初回受付日',fmtDate(get(a,'receptionDate'))),row('対応者',get(a,'receptionist')),row('受付方法',get(a,'receptionMethod')),row('相談理由',val(a,'consultationReason'))
  ].join('');}
  function specialHtml(sec,user,a){
    if(sec.special==='family') return (user.family||[]).map((x,i)=>row(`家族${i+1}`,`${x.name||''}／${x.relation||''}／${x.age||''}${x.age?'歳':''}／${x.cohabit||''}${x.emergency?'／緊急連絡先':''}\n${x.address||''}${x.phone?`／${x.phone}`:''}`)).join('') || row('家族','登録なし');
    if(sec.special==='resources') return (user.resources||[]).map((x,i)=>row(`支援${i+1}`,`${x.category||''}／${x.type||''}／${x.provider||''}`)).join('') || row('支援','登録なし');
    if(sec.special==='medical') return (user.medical||[]).map((x,i)=>row(`受診${i+1}`,`${x.disease||''}${x.onset?`（${x.onset}～）`:''}\n${x.institution||''} ${x.department||''}／${x.doctor||''}／${x.phone||''}\n頻度・方法：${x.frequency||''}　同行：${x.companion||''}\n${x.notes||''}`)).join('') || row('受診','登録なし');
    if(sec.special==='medications') return ((user.medications||[]).map((x,i)=>row(`服薬${i+1}`,`${x.name||''}／用法：${x.dosage||''}／回数：${x.frequency||''}／自己服薬：${x.selfTake||''}／飲み忘れ：${x.missed||''}`)).join('') || row('服薬','登録なし')) + (sec.afterQuestions||[]).map(x=>row(x.label,val(a,x.key))).join('');
    return '';
  }
  function sectionHtml(sec,user,a){
    if(sec.id==='p1_basic') return section(sec.title,basicRows(user,a));
    if(sec.special){let b=specialHtml(sec,user,a);if(a.narratives?.[sec.id])b=row('記録文',a.narratives[sec.id])+b;return section(sec.title,b,sec.judgment?issue(a,sec.id):'');}
    let body='';
    for(const x of [...(sec.questions||[]),...(sec.afterQuestions||[])]){
      const v=sec.userScope?user[x.key]:get(a,x.key); if(v!==''&&v!=null) body+=row(x.label,val(a,x.key,v));
    }
    if(a.narratives?.[sec.id]) body=row('記録文',a.narratives[sec.id])+body;
    if(!body) body=row('入力','なし');
    return section(sec.title,body,sec.judgment?issue(a,sec.id):'');
  }
  function pageHtml(page,user,a){return `<div class="report-page"><header><div>ケアマネアセスメントナビ</div><strong>${esc(CAN.pageTitles[page])}</strong><span>${esc(user.name||'')}</span></header>${CAN.sections.filter(s=>s.page===page).map(s=>sectionHtml(s,user,a)).join('')}</div>`;}
  function printAssessment(user,a,layout='existing'){
    const title=`アセスメント_${user.name||'利用者'}_${a.date||''}`;
    const pages=layout==='existing'?[1,2,3,4].map(p=>pageHtml(p,user,a)).join(''):`<div class="report-page"><header><div>ケアマネアセスメントナビ</div><strong>アセスメント記録</strong><span>${esc(user.name||'')}</span></header>${[1,2,3,4].flatMap(p=>CAN.sections.filter(s=>s.page===p)).map(s=>sectionHtml(s,user,a)).join('')}</div>`;
    const html=`<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>${esc(title)}</title><style>
      @page{size:A4;margin:9mm}*{box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Yu Gothic",Meiryo,sans-serif;color:#111;font-size:9.5pt;margin:0}header{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;border-bottom:2px solid #1f6f78;padding:0 0 5px;margin-bottom:7px}header strong{font-size:13pt}header span{text-align:right}.report-page{page-break-after:always}.report-page:last-child{page-break-after:auto}section{margin:0 0 7px}h2{font-size:10.5pt;background:#e8f2f3;border-left:4px solid #1f6f78;margin:0;padding:4px 6px;display:flex;justify-content:space-between;gap:8px}.judgment{font-size:8.5pt;background:#fff3d6;padding:2px 6px;border-radius:10px}table{width:100%;border-collapse:collapse;table-layout:fixed}th,td{border:1px solid #bfcaca;padding:4px 5px;vertical-align:top;line-height:1.4;word-break:break-word}th{width:28%;background:#f7f9f9;text-align:left}@media screen{body{background:#eee}.report-page{background:white;width:210mm;min-height:297mm;margin:10px auto;padding:9mm;box-shadow:0 2px 15px #aaa}@page{margin:0}}@media print{.screen-tip{display:none}}
    </style></head><body><div class="screen-tip" style="padding:8px;background:#fff3d6;text-align:center">印刷画面で「PDFとして保存」または端末のPDF保存機能を選択してください。</div>${pages}<script>window.onload=()=>setTimeout(()=>window.print(),250)<\/script></body></html>`;
    const w=window.open('','_blank'); if(!w){alert('印刷画面を開けませんでした。ポップアップを許可してください。');return;} w.document.open();w.document.write(html);w.document.close();
  }
  return {printAssessment};
})();
