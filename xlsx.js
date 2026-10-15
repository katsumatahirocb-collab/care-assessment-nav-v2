window.CANXLSX = (() => {
  const enc = new TextEncoder();
  const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const colName = n => { let s=''; while(n){n--;s=String.fromCharCode(65+n%26)+s;n=Math.floor(n/26);} return s; };
  const addr = (r,c) => colName(c)+r;
  const cleanName = s => String(s||'').replace(/[\\\/?*\[\]:]/g,'').slice(0,31) || 'Sheet';

  const crcTable = (()=>{ const t=[]; for(let n=0;n<256;n++){let c=n; for(let k=0;k<8;k++) c=(c&1)?0xedb88320^(c>>>1):c>>>1; t[n]=c>>>0;} return t; })();
  const crc32 = bytes => { let c=0xffffffff; for(const b of bytes) c=crcTable[(c^b)&0xff]^(c>>>8); return (c^0xffffffff)>>>0; };
  const u16=(a,o,v)=>{a[o]=v&255;a[o+1]=(v>>>8)&255}; const u32=(a,o,v)=>{u16(a,o,v&65535);u16(a,o+2,(v>>>16)&65535)};
  function zipStore(entries){
    const chunks=[], central=[]; let offset=0;
    for(const e of entries){
      const name=enc.encode(e.name), data=typeof e.data==='string'?enc.encode(e.data):e.data, crc=crc32(data);
      const h=new Uint8Array(30+name.length); u32(h,0,0x04034b50);u16(h,4,20);u16(h,6,0x0800);u16(h,8,0);u16(h,10,0);u16(h,12,0);u32(h,14,crc);u32(h,18,data.length);u32(h,22,data.length);u16(h,26,name.length);u16(h,28,0);h.set(name,30);
      chunks.push(h,data);
      const c=new Uint8Array(46+name.length);u32(c,0,0x02014b50);u16(c,4,20);u16(c,6,20);u16(c,8,0x0800);u16(c,10,0);u16(c,12,0);u16(c,14,0);u32(c,16,crc);u32(c,20,data.length);u32(c,24,data.length);u16(c,28,name.length);u16(c,30,0);u16(c,32,0);u16(c,34,0);u16(c,36,0);u32(c,38,0);u32(c,42,offset);c.set(name,46);central.push(c);
      offset += h.length+data.length;
    }
    const centralStart=offset; const centralSize=central.reduce((s,x)=>s+x.length,0); const end=new Uint8Array(22);u32(end,0,0x06054b50);u16(end,4,0);u16(end,6,0);u16(end,8,entries.length);u16(end,10,entries.length);u32(end,12,centralSize);u32(end,16,centralStart);u16(end,20,0);
    return new Blob([...chunks,...central,end],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
  }

  const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<numFmts count="0"/><fonts count="3"><font><sz val="10"/><name val="Yu Gothic"/></font><font><b/><sz val="14"/><color rgb="FFFFFFFF"/><name val="Yu Gothic"/></font><font><b/><sz val="10"/><name val="Yu Gothic"/></font></fonts>
<fills count="5"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF1F6F78"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFE8F2F3"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFFF3D6"/></patternFill></fill></fills>
<borders count="2"><border/><border><left style="thin"><color rgb="FFD5DFE0"/></left><right style="thin"><color rgb="FFD5DFE0"/></right><top style="thin"><color rgb="FFD5DFE0"/></top><bottom style="thin"><color rgb="FFD5DFE0"/></bottom></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="6">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
<xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyAlignment="1"><alignment vertical="center" horizontal="center" wrapText="1"/></xf>
<xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
<xf numFmtId="0" fontId="2" fillId="0" borderId="1" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
<xf numFmtId="0" fontId="2" fillId="4" borderId="1" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;

  function inlineCell(ref,v,style=4){ if(v===undefined||v===null||v==='') return ''; return `<c r="${ref}" t="inlineStr" s="${style}"><is><t xml:space="preserve">${esc(v)}</t></is></c>`; }
  function makeSheet(def){
    let maxRow=1,maxCol=1; const rows={};
    for(const cell of def.cells){ const m=cell.ref.match(/^([A-Z]+)(\d+)$/); const r=+m[2]; let c=0; for(const ch of m[1]) c=c*26+ch.charCodeAt(0)-64; maxRow=Math.max(maxRow,r);maxCol=Math.max(maxCol,c); (rows[r] ||= []).push({c, ...cell}); }
    let sheetData=''; for(let r=1;r<=maxRow;r++){ const cs=rows[r]||[]; cs.sort((a,b)=>a.c-b.c); const h=(def.rowHeights&&def.rowHeights[r])?` ht="${def.rowHeights[r]}" customHeight="1"`:''; sheetData += `<row r="${r}"${h}>${cs.map(x=>inlineCell(x.ref,x.v,x.style??4)).join('')}</row>`; }
    const cols=(def.widths||[16,16,16,16,16,16]).map((w,i)=>`<col min="${i+1}" max="${i+1}" width="${w}" customWidth="1"/>`).join('');
    const merges=(def.merges||[]).length?`<mergeCells count="${def.merges.length}">${def.merges.map(x=>`<mergeCell ref="${x}"/>`).join('')}</mergeCells>`:'';
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"/></sheetViews><cols>${cols}</cols><sheetData>${sheetData}</sheetData>${merges}<pageMargins left="0.3" right="0.3" top="0.45" bottom="0.45" header="0.2" footer="0.2"/><pageSetup orientation="landscape" fitToWidth="1" fitToHeight="1" paperSize="9"/></worksheet>`;
  }
  function cell(cells,ref,v,style=4){cells.push({ref,v,style});}
  function mergedLabel(cells,merges,row,label,cols=6,style=2){ cell(cells,`A${row}`,label,style); merges.push(`A${row}:${colName(cols)}${row}`); }
  const fmtDate = v => v ? String(v).replace(/-/g,'/') : '';
  const arr = v => Array.isArray(v)?v.join('・'):(v||'');
  const combineSources=(a,key)=>{ const s=a.sources?.[key]||{}; return [['本人',s.self],['家族',s.family],['CM観察',s.cm],['他職種・書類',s.other]].filter(x=>String(x[1]||'').trim()).map(x=>`${x[0]}：${x[1]}`).join('\n'); };
  const withSources=(a,key,v)=>{const unc=a.unconfirmed?.[key]?.reason;const base=unc?`確認できず（${unc}）`:(v||'');const src=combineSources(a,key);return [base,src].filter(Boolean).join(src&&base?'\n':'');};
  const get=(a,k)=>{const u=a.unconfirmed?.[k];return u?.reason?`確認できず（${u.reason}）`:(a.data?.[k]??'');};
  const issue=(a,sid)=>{const j=a.judgments?.[sid]; if(!j) return ''; let t=j.value||''; if(j.value==='判断保留'&&j.reason)t+=`（${j.reason}${j.note?`：${j.note}`:''}）`; if(j.value==='課題あり'&&j.note)t+=`：${j.note}`; return t;};
  const labelValueRows=(cells,merges,start,items,cols=6)=>{ let r=start; for(const [lab,val] of items){cell(cells,`A${r}`,lab,3);merges.push(`A${r}:B${r}`);cell(cells,`C${r}`,val,4);merges.push(`C${r}:${colName(cols)}${r}`);r++;} return r;};

  function existingSheets(user,a){
    // №1
    let c=[],m=[],r=1; mergedLabel(c,m,r++,'アセスメントシート　№1 基本情報',6,1);
    r=labelValueRows(c,m,r,[['計画の作成の状況',get(a,'planStatus')],['アセスメント理由',[get(a,'assessmentReason'),get(a,'assessmentReasonNote')].filter(Boolean).join('：')],['初回受付日',fmtDate(get(a,'receptionDate'))],['対応者',get(a,'receptionist')],['受付方法',get(a,'receptionMethod')],['相談理由',withSources(a,'consultationReason',get(a,'consultationReason'))]],6);
    mergedLabel(c,m,r++,'基本情報',6,2);
    r=labelValueRows(c,m,r,[['フリガナ',user.kana],['利用者氏名',user.name],['性別',user.sex],['生年月日',fmtDate(user.dob)],['年齢',calcAge(user.dob)],['住所',user.address],['電話番号',user.phone],['介護度',user.careLevel]],6);
    mergedLabel(c,m,r++,'家族構成・緊急連絡先',6,2);
    (user.family||[]).forEach((f,i)=>{r=labelValueRows(c,m,r,[[`家族${i+1}`,`${f.name||''}／${f.relation||''}／${f.age||''}${f.age?'歳':''}／${f.cohabit||''}${f.emergency?'／緊急連絡先':''}\n${f.address||''}${f.phone?`／${f.phone}`:''}`]],6);});
    mergedLabel(c,m,r++,'これまでの生活・現在の生活',6,2); r=labelValueRows(c,m,r,[['これまでの生活',withSources(a,'pastLife',get(a,'pastLife'))],['現在の生活',withSources(a,'currentLife',get(a,'currentLife'))],['利用者の主訴・意向',withSources(a,'userIntent',get(a,'userIntent'))],['家族等の主訴・意向',withSources(a,'familyIntent',get(a,'familyIntent'))]],6);
    mergedLabel(c,m,r++,'保険情報・社会保障制度',6,2); r=labelValueRows(c,m,r,[['介護保険 被保険者番号',user.insuredNo],['限度額',user.limitAmount],['負担割合',user.burdenRatio],['認定年月日',fmtDate(user.certDate)],['認定の有効期間',`${fmtDate(user.validFrom)} ～ ${fmtDate(user.validTo)}`],['審査会の意見',user.committeeOpinion],['医療保険',`${user.medicalInsurance||''} ${user.medicalBurden||''}`],['医療保険 記号・番号',user.medicalId],['年金',arr(user.pension)],['生活保護',user.publicAssistance],['障害福祉等',arr(user.disabilitySystems)]],6);
    mergedLabel(c,m,r++,'現在利用している支援や社会資源の状況',6,2); (user.resources||[]).forEach((x,i)=>{r=labelValueRows(c,m,r,[[`支援${i+1}`,`${x.category||''}／${x.type||''}${x.provider?`／${x.provider}`:''}`]],6);});
    mergedLabel(c,m,r++,'日常生活自立度',6,2); r=labelValueRows(c,m,r,[['障害高齢者の日常生活自立度',get(a,'independenceDisability')],['認知症高齢者の日常生活自立度',get(a,'independenceDementia')],['判定した書類',get(a,'independenceSource')],['認定日',fmtDate(get(a,'independenceDate'))],['CMから見た自立度',get(a,'independenceCM')]],6);
    const s1={name:'シート№1',cells:c,merges:m,widths:[22,10,24,18,22,22]};

    // №2
    c=[];m=[];r=1; mergedLabel(c,m,r++,'課題分析（アセスメント）に関する項目　№2',8,1);
    mergedLabel(c,m,r++,'【健康状態】',8,2); r=labelValueRows(c,m,r,[['課題',issue(a,'p2_health')],['身長・体重・BMI',`${get(a,'height')||''}cm ／ ${get(a,'weight')||''}kg ／ BMI ${bmi(get(a,'height'),get(a,'weight'))}`],['血圧',get(a,'bloodPressure')],['最近の体調',withSources(a,'conditionNow',get(a,'conditionNow'))],['気になる症状',withSources(a,'symptoms',get(a,'symptoms'))],['既往歴・傷病名・症状等',withSources(a,'history',get(a,'history'))],['痛み',[get(a,'pain'),get(a,'painNote')].filter(Boolean).join('：')],['皮膚状況',get(a,'skin')],['褥瘡',get(a,'pressureSore')],['特記事項',get(a,'healthNotes')]],8);
    mergedLabel(c,m,r++,'【受診状況（歯科医含む）】',8,2); r=labelValueRows(c,m,r,[['課題',issue(a,'p2_visit')]],8); (user.medical||[]).forEach((x,i)=>{r=labelValueRows(c,m,r,[[`受診${i+1}`,`${x.disease||''}${x.onset?`（${x.onset}～）`:''}\n${x.institution||''}${x.department?` ${x.department}`:''}${x.doctor?`／${x.doctor}`:''}${x.phone?`／${x.phone}`:''}\n頻度・方法：${x.frequency||''}　同行：${x.companion||''}\n${x.notes||''}`]],8);});
    mergedLabel(c,m,r++,'【服薬に関する状況】',8,2); (user.medications||[]).forEach((x,i)=>{r=labelValueRows(c,m,r,[[`薬${i+1}`,`${x.name||''}／用法：${x.dosage||''}／回数：${x.frequency||''}／自己服薬：${x.selfTake||''}／飲み忘れ：${x.missed||''}`]],8);}); r=labelValueRows(c,m,r,[['自身の健康に対する理解や意識',withSources(a,'healthUnderstanding',get(a,'healthUnderstanding'))]],8);
    mergedLabel(c,m,r++,'【ADL】',8,2); r=labelValueRows(c,m,r,[['課題',issue(a,'p2_adl')]],8); CAN.sections.find(s=>s.id==='p2_adl').questions.filter(x=>!/_part$|_degree$|bathingParts|bathingFall/.test(x.key)).forEach(x=>{const v=get(a,x.key);if(v!==''&&v!=null) r=labelValueRows(c,m,r,[[x.label,withSources(a,x.key,`${arr(v)}${get(a,x.key+'_part')?`／介助動作：${get(a,x.key+'_part')}`:''}${get(a,x.key+'_degree')?`／程度：${get(a,x.key+'_degree')}`:''}`)]],8);}); if(get(a,'adl_bathingParts'))r=labelValueRows(c,m,r,[['入浴（詳細）',`介助動作：${arr(get(a,'adl_bathingParts'))}／転倒歴・不安：${get(a,'adl_bathingFall')||''}`]],8);
    mergedLabel(c,m,r++,'【IADL】',8,2); r=labelValueRows(c,m,r,[['課題',issue(a,'p2_iadl')]],8); CAN.sections.find(s=>s.id==='p2_iadl').questions.filter(x=>!/_supporter$|_part$/.test(x.key)).forEach(x=>{const v=get(a,x.key); if(v!==''&&v!=null){const base=x.key; r=labelValueRows(c,m,r,[[x.label,`${arr(v)}${get(a,base+'_supporter')?`／支援者：${get(a,base+'_supporter')}`:''}${get(a,base+'_part')?`／支援部分：${get(a,base+'_part')}`:''}`]],8);}});
    const s2={name:'№２',cells:c,merges:m,widths:[22,10,24,18,22,20,20,20]};

    // №3
    c=[];m=[];r=1; mergedLabel(c,m,r++,'№3',8,1);
    for(const sid of ['p3_cognition','p3_communication','p3_rhythm','p3_elimination','p3_hygiene']){
      const sec=CAN.getSection(sid); mergedLabel(c,m,r++,`【${sec.title}】`,8,2); r=labelValueRows(c,m,r,[['課題',issue(a,sid)]],8); for(const x of sec.questions){const v=get(a,x.key); if(v!==''&&v!=null){r=labelValueRows(c,m,r,[[x.label,withSources(a,x.key,arr(v))]],8);}}
    }
    const s3={name:'№３',cells:c,merges:m,widths:[22,10,24,18,22,20,20,20]};

    // №4
    c=[];m=[];r=1; mergedLabel(c,m,r++,'№4',8,1);
    for(const sid of ['p4_oral','p4_diet','p4_social','p4_family','p4_environment','p4_other']){
      const sec=CAN.getSection(sid); mergedLabel(c,m,r++,`【${sec.title}】`,8,2); r=labelValueRows(c,m,r,[['課題',issue(a,sid)]],8); for(const x of sec.questions){const v=get(a,x.key); if(v!==''&&v!=null){r=labelValueRows(c,m,r,[[x.label,withSources(a,x.key,arr(v))]],8);}}
    }
    const s4={name:'№４',cells:c,merges:m,widths:[22,10,24,18,22,20,20,20]};
    return [s1,s2,s3,s4];
  }

  function newSheets(user,a){
    let c=[],m=[],r=1; mergedLabel(c,m,r++,'ケアマネアセスメントナビ　アセスメント記録',8,1);
    r=labelValueRows(c,m,r,[['利用者氏名',user.name],['生年月日',fmtDate(user.dob)],['介護度',user.careLevel],['実施日',fmtDate(a.date)],['区分',a.type],['質問表示',a.mode==='easy'?'やさしい質問モード':'Excel項目名モード'],['状態',a.status==='done'?'完了':'編集中'],['最終更新',a.updatedAt?new Date(a.updatedAt).toLocaleString('ja-JP'):'']],8);
    for(let page=1;page<=4;page++){
      mergedLabel(c,m,r++,CAN.pageTitles[page],8,1);
      for(const sec of CAN.sections.filter(s=>s.page===page)){
        mergedLabel(c,m,r++,sec.title,8,2); if(sec.judgment) r=labelValueRows(c,m,r,[['課題判定',issue(a,sec.id)]],8); if(a.narratives?.[sec.id]) r=labelValueRows(c,m,r,[['記録文',a.narratives[sec.id]]],8);
        if(sec.special==='family'){(user.family||[]).forEach((x,i)=>r=labelValueRows(c,m,r,[[`家族${i+1}`,`${x.name||''}／${x.relation||''}／${x.cohabit||''}${x.emergency?'／緊急連絡先':''}／${x.phone||''}`]],8));continue;}
        if(sec.special==='resources'){(user.resources||[]).forEach((x,i)=>r=labelValueRows(c,m,r,[[`支援${i+1}`,`${x.category||''}／${x.type||''}／${x.provider||''}`]],8));continue;}
        if(sec.special==='medical'){(user.medical||[]).forEach((x,i)=>r=labelValueRows(c,m,r,[[`受診${i+1}`,`${x.disease||''}／${x.institution||''} ${x.department||''}／${x.doctor||''}／${x.frequency||''}／同行:${x.companion||''}`]],8));continue;}
        if(sec.special==='medications'){(user.medications||[]).forEach((x,i)=>r=labelValueRows(c,m,r,[[`服薬${i+1}`,`${x.name||''}／${x.dosage||''}／${x.frequency||''}／自己服薬:${x.selfTake||''}／飲み忘れ:${x.missed||''}`]],8));}
        for(const x of [...(sec.questions||[]),...(sec.afterQuestions||[])]){const v=sec.userScope?user[x.key]:get(a,x.key); if(v!==''&&v!=null) r=labelValueRows(c,m,r,[[x.label,withSources(a,x.key,arr(v))]],8);}
      }
    }
    return [{name:'アセスメント記録',cells:c,merges:m,widths:[22,10,24,18,22,20,20,20]}];
  }
  function calcAge(d){if(!d)return'';const b=new Date(d+'T00:00:00'),n=new Date();let a=n.getFullYear()-b.getFullYear();if(n.getMonth()<b.getMonth()||(n.getMonth()===b.getMonth()&&n.getDate()<b.getDate()))a--;return a;}
  function bmi(h,w){h=Number(h);w=Number(w);if(!h||!w)return'';return (w/((h/100)**2)).toFixed(1);}
  function makeWorkbook(sheets){
    const contentTypes=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheets.map((_,i)=>`<Override PartName="/xl/worksheets/sheet${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>`;
    const rels=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`;
    const workbook=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets.map((s,i)=>`<sheet name="${esc(cleanName(s.name))}" sheetId="${i+1}" r:id="rId${i+1}"/>`).join('')}</sheets></workbook>`;
    const wbRels=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_,i)=>`<Relationship Id="rId${i+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i+1}.xml"/>`).join('')}<Relationship Id="rId${sheets.length+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;
    const entries=[{name:'[Content_Types].xml',data:contentTypes},{name:'_rels/.rels',data:rels},{name:'xl/workbook.xml',data:workbook},{name:'xl/_rels/workbook.xml.rels',data:wbRels},{name:'xl/styles.xml',data:styles}];
    sheets.forEach((s,i)=>entries.push({name:`xl/worksheets/sheet${i+1}.xml`,data:makeSheet(s)}));
    return zipStore(entries);
  }
  function download(blob,filename){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1500);}
  function exportXlsx(user,a,layout='existing'){const sheets=layout==='new'?newSheets(user,a):existingSheets(user,a);const blob=makeWorkbook(sheets);download(blob,`アセスメント_${user.name||'利用者'}_${a.date||''}_${layout==='new'?'新様式':'既存4ページ様式'}.xlsx`);}
  return {exportXlsx, existingSheets, newSheets, makeWorkbook, bmi, calcAge};
})();
