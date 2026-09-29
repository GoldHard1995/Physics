const questions = [
  {type:'labels',title:'認識透鏡光線圖',prompt:'把「主軸、光心、主焦點、焦距」放到圖中正確的位置。'},
  {type:'choice',kind:'convex-rays',title:'凸透鏡的成像光線',prompt:'哪一項正確描述圖中的三條主要光線？',options:['通過光心後不改變方向；平行光線折射後通過另一側焦點；通過物體側焦點後變成平行光','所有光線通過透鏡後都與主軸平行','平行光線通過透鏡後看似來自物體側焦點'],answer:0,hint:'分別留意光心、平行線和兩個焦點。',explain:'凸透鏡三條主要光線都符合圖示規則，任意兩條可找出像的位置。'},
  {type:'choice',kind:'concave-rays',title:'凹透鏡的平行光線',prompt:'與主軸平行的光線通過凹透鏡後，為甚麼要畫虛線？',options:['表示光線真的倒後行走','表示折射光的反向延長線，看似來自物體側焦點 F′','表示透鏡把光完全吸收'],answer:1,hint:'實線有箭嘴，代表實際傳播方向；虛線只是向後延長。',explain:'折射光實際向外發散；把它反向延長，會通過物體側主焦點 F′。'},
  {type:'choice',kind:'beyond-2f',title:'物體位於 2f 之外',prompt:'凸透鏡前的物體位於 2f 之外，像有甚麼性質？',options:['實像、倒立、縮小','虛像、正立、放大','實像、正立、大小相同'],answer:0,hint:'像形成於透鏡另一側的 f 和 2f 之間。',explain:'物體在 2f 之外時，形成倒立、縮小的實像。'},
  {type:'choice',kind:'at-2f',title:'物體位於 2f',prompt:'物體位於凸透鏡的 2f，像有甚麼性質？',options:['虛像、正立、縮小','實像、倒立、大小相同','實像、倒立、放大'],answer:1,hint:'物距和像距同為 2f。',explain:'像形成於另一側 2f，是倒立實像，大小與物體相同。'},
  {type:'choice',kind:'between',title:'物體位於 f 和 2f 之間',prompt:'物體位於凸透鏡的 f 和 2f 之間，像有甚麼性質？',options:['實像、倒立、放大','虛像、正立、縮小','實像、正立、放大'],answer:0,hint:'折射光在另一側 2f 之外相交。',explain:'這時形成倒立、放大的實像。'},
  {type:'choice',kind:'at-f',title:'物體位於主焦點',prompt:'物體剛好位於凸透鏡的主焦點 f，折射光和像會怎樣？',options:['折射光互相平行，像在無限遠','折射光立即回到物體，形成縮小像','形成位於光心的實像'],answer:0,hint:'觀察離開透鏡後的兩條光線是否相交。',explain:'折射光互相平行，不會在有限位置相交，所以像在無限遠。'},
  {type:'choice',kind:'inside-f',title:'物體位於焦距內',prompt:'物體位於凸透鏡與主焦點之間，像有甚麼性質？',options:['實像、倒立、縮小','虛像、正立、放大','虛像、倒立、放大'],answer:1,hint:'實際折射光發散，要向後延長才能找到像。',explain:'焦距內的凸透鏡形成正立、放大的虛像。'},
  {type:'choice',kind:'concave-image',title:'凹透鏡的成像性質',prompt:'物體放在凹透鏡前，一般會形成哪一種像？',options:['實像、倒立、放大','虛像、正立、縮小','實像、正立、大小相同'],answer:1,hint:'折射光向外發散，只有反向延長線相交。',explain:'凹透鏡形成的像位於物體同側，是正立、縮小的虛像。'},
  {type:'number',kind:'magnification',title:'計算放大率',prompt:'凹透鏡的物距是 30 cm，像距是 12 cm。放大率 m 是多少？',answer:0.4,hint:'使用 m＝像距 v／物距 u。',explain:'m＝12／30＝0.4。放大率小於 1，所以像是縮小的。'}
];

const labelWords=['主軸','光心','主焦點','焦距'];
const labelTargets=[['axis','主軸'],['center','光心'],['focus','主焦點'],['focal-length','焦距']];
const $=id=>document.getElementById(id);
let index=0,selected=null,solved=false,score=0,assignments={},selectedWord=null;

function baseSvg(body,lens='convex'){
  const shape=lens==='convex'?'M300 24C270 72 270 268 300 316C330 268 330 72 300 24Z':'M280 24C310 82 310 258 280 316H320C290 258 290 82 320 24Z';
  return `<svg viewBox="0 0 600 340" role="img" aria-label="透鏡光線圖"><defs><pattern id="qgrid" width="25" height="25" patternUnits="userSpaceOnUse"><path d="M25 0H0V25" fill="none" stroke="#dce4d5"/></pattern><marker id="qo" viewBox="0 0 20 20" refX="16" refY="10" markerWidth="9" markerHeight="9" orient="auto"><path d="M0 2L18 10L0 18Z" fill="#e98936"/></marker><marker id="qb" viewBox="0 0 20 20" refX="16" refY="10" markerWidth="9" markerHeight="9" orient="auto"><path d="M0 2L18 10L0 18Z" fill="#42a9be"/></marker></defs><rect width="600" height="340" fill="#fffaf0"/><rect width="600" height="340" fill="url(#qgrid)"/><path d="M20 190H580" stroke="#334e47" stroke-width="4"/><path d="${shape}" fill="#bfe8e7" fill-opacity=".75" stroke="#257387" stroke-width="4"/><path d="M300 35V305" stroke="#257387" stroke-width="2"/><path d="M200 178V202M400 178V202" stroke="#334e47" stroke-width="4"/><text x="200" y="223" text-anchor="middle" font-weight="900">F′</text><text x="312" y="181" font-weight="900">C</text><text x="400" y="223" text-anchor="middle" font-weight="900">F</text>${body}</svg>`;
}
const ray=(d,color='#e98936',marker='qo',dash='')=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="5" ${dash?`stroke-dasharray="${dash}"`:''} marker-end="url(#${marker})"/>`;
function visual(kind){
  const object='<path d="M95 190V80M80 100L95 78L110 100" fill="none" stroke="#a4511b" stroke-width="5"/>';
  if(kind==='convex-rays')return baseSvg(`${object}${ray('M95 80L300 80L400 190','#e98936','qo')}${ray('M95 80L300 190L505 300','#42a9be','qb')}${ray('M95 80L200 190L300 295L500 295','#65a755','qb')}`);
  if(kind==='concave-rays')return baseSvg(`${object}${ray('M95 80L300 80L510 20','#e98936','qo')}${ray('M300 80L200 190','#7a65aa','qb','9 7')}<text x="334" y="58" fill="#146278" font-weight="900">折射光</text><text x="145" y="142" fill="#5c477f" font-weight="900">虛線延長線</text>`,'concave');
  if(kind==='at-f')return baseSvg(`${object}${ray('M200 80L300 80L540 20','#e98936','qo')}${ray('M200 80L300 190L540 130','#42a9be','qb')}<text x="400" y="45" fill="#146278" font-weight="900">互相平行</text>`);
  if(kind==='inside-f')return baseSvg(`${object.replaceAll('95','245').replaceAll('80','85').replaceAll('100','105')}${ray('M245 85L300 85L520 295','#e98936','qo')}${ray('M245 85L300 190L510 590','#42a9be','qb')}${ray('M300 85L120 -50','#7a65aa','qb','9 7')}<text x="150" y="55" fill="#5c477f" font-weight="900">虛像</text>`);
  if(kind==='concave-image')return baseSvg(`${object}${ray('M95 80L300 80L520 10','#e98936','qo')}${ray('M300 80L200 190','#7a65aa','qb','9 7')}<path d="M245 190V135M235 150L245 133L255 150" fill="none" stroke="#7a65aa" stroke-width="4" stroke-dasharray="7 5"/><text x="245" y="124" text-anchor="middle" fill="#5c477f" font-weight="900">虛像</text>`,'concave');
  const cases={
    'beyond-2f':['65','420','135'],
    'at-2f':['100','500','80'],
    'between':['145','540','35']
  };
  if(cases[kind]){const [ox,ix,iy]=cases[kind];return baseSvg(`<path d="M${ox} 190V80M${Number(ox)-12} 100L${ox} 78L${Number(ox)+12} 100" fill="none" stroke="#a4511b" stroke-width="5"/><path d="M${ix} 190V${iy}" stroke="#146278" stroke-width="5"/><path d="M${Number(ix)-12} ${Number(iy)+20}L${ix} ${iy}L${Number(ix)+12} ${Number(iy)+20}" fill="none" stroke="#146278" stroke-width="5"/>${ray(`M${ox} 80L300 80L${ix} ${iy}`)}${ray(`M${ox} 80L300 190L${ix} ${iy}`,'#42a9be','qb')}`);}
  if(kind==='magnification')return baseSvg(`${object}<path d="M430 190V146M420 160L430 144L440 160" fill="none" stroke="#7a65aa" stroke-width="4"/><text x="95" y="60" text-anchor="middle" font-weight="900">物距 30 cm</text><text x="430" y="126" text-anchor="middle" font-weight="900">像距 12 cm</text>`,'concave');
  return '';
}

function labelBoard(){
  const zones=labelTargets.map(([id],i)=>`<button type="button" class="drop-zone lens-zone zone-${id}" data-target="${id}"><span class="zone-number">${i+1}</span><span class="zone-text">放在這裏</span></button>`).join('');
  return `<div class="label-board">${baseSvg('<path d="M80 190V95M68 112L80 92L92 112" fill="none" stroke="#a4511b" stroke-width="5"/><path d="M80 95L300 95L400 190" fill="none" stroke="#e98936" stroke-width="5"/><path d="M300 190L500 276" fill="none" stroke="#42a9be" stroke-width="5"/><path d="M300 250H400" stroke="#7a65aa" stroke-width="3" marker-start="url(#qo)" marker-end="url(#qb)"/>')}${zones}</div>`;
}

function feedback(message,type=''){const el=$('quiz-feedback');el.textContent=message;el.className=`quiz-feedback ${type}`;}
function progress(){ $('quiz-progress').innerHTML=`${Array.from({length:questions.length},(_,i)=>`<span class="progress-block ${i<index?'done':i===index?'current':''}"></span>`).join('')} <span>${index+1}/${questions.length}</span>`; }

function refreshLabels(){
  labelTargets.forEach(([id])=>{const zone=document.querySelector(`.zone-${id}`),word=assignments[id];zone.querySelector('.zone-text').textContent=word||'放在這裏';zone.classList.toggle('filled',Boolean(word));zone.classList.remove('correct','incorrect');});
  document.querySelectorAll('.word-chip').forEach(chip=>{chip.hidden=Object.values(assignments).includes(chip.dataset.word);chip.classList.toggle('selected',selectedWord===chip.dataset.word);});
}
function placeWord(target){if(solved)return;if(selectedWord){Object.keys(assignments).forEach(key=>{if(assignments[key]===selectedWord)delete assignments[key];});assignments[target]=selectedWord;selectedWord=null;}else if(assignments[target])delete assignments[target];refreshLabels();}
function attachDrag(chip){
  let start=null,ghost=null,moved=false;
  chip.addEventListener('pointerdown',e=>{if(solved)return;e.preventDefault();start={x:e.clientX,y:e.clientY};moved=false;chip.setPointerCapture(e.pointerId);});
  chip.addEventListener('pointermove',e=>{if(!start)return;if(!moved&&Math.hypot(e.clientX-start.x,e.clientY-start.y)>8){moved=true;ghost=chip.cloneNode(true);ghost.classList.add('drag-ghost');document.body.append(ghost);}if(ghost){ghost.style.left=`${e.clientX}px`;ghost.style.top=`${e.clientY}px`;}});
  chip.addEventListener('pointerup',e=>{if(!start)return;if(moved){const zone=document.elementFromPoint(e.clientX,e.clientY)?.closest('.drop-zone');if(zone){selectedWord=chip.dataset.word;placeWord(zone.dataset.target);}}else{selectedWord=selectedWord===chip.dataset.word?null:chip.dataset.word;refreshLabels();}ghost?.remove();start=null;ghost=null;});
  chip.addEventListener('pointercancel',()=>{ghost?.remove();start=null;ghost=null;});
}

function render(){
  const q=questions[index];selected=null;solved=false;assignments={};selectedWord=null;progress();
  $('quiz-number').textContent=`第 ${index+1} 題 ／ 共 ${questions.length} 題`;$('question-title').textContent=q.title;$('question-prompt').textContent=q.prompt;
  $('quiz-check').hidden=false;$('quiz-hint').hidden=false;$('quiz-next').hidden=true;$('quiz-restart').hidden=true;feedback('完成後按「檢查答案」。');
  if(q.type==='labels'){
    $('quiz-visual').innerHTML=labelBoard();$('quiz-answer').innerHTML=`<p class="quiz-instruction">拖動文字到圖中，或點選文字再點位置。</p><div class="word-bank">${labelWords.map(w=>`<button type="button" class="word-chip" data-word="${w}">${w}</button>`).join('')}</div>`;
    document.querySelectorAll('.word-chip').forEach(attachDrag);document.querySelectorAll('.drop-zone').forEach(zone=>zone.addEventListener('click',()=>placeWord(zone.dataset.target)));
  }else{
    $('quiz-visual').innerHTML=visual(q.kind);
    if(q.type==='choice'){
      $('quiz-answer').innerHTML=`<div class="choice-list" role="group" aria-label="選擇答案">${q.options.map((o,i)=>`<button type="button" class="choice" data-option="${i}" aria-pressed="false">${o}</button>`).join('')}</div>`;
      document.querySelectorAll('.choice').forEach(button=>button.addEventListener('click',()=>{if(solved)return;selected=Number(button.dataset.option);document.querySelectorAll('.choice').forEach(item=>{const active=item===button;item.classList.toggle('selected',active);item.setAttribute('aria-pressed',active);});}));
    }else $('quiz-answer').innerHTML='<div class="formula-card">m ＝ 像距 v ÷ 物距 u</div><label class="quiz-answer-label" for="number-answer">輸入放大率：</label><div class="number-entry"><input id="number-answer" type="number" min="0" max="10" step="0.1" inputmode="decimal"><span>倍</span></div>';
  }
}

function markSolved(message){solved=true;score++;feedback(`答對了！${message}`,'success');$('quiz-check').hidden=true;$('quiz-hint').hidden=true;if(index===questions.length-1){$('quiz-restart').hidden=false;$('quiz-progress').innerHTML=`完成 ${score}/${questions.length}`;}else $('quiz-next').hidden=false;}
function check(){
  if(solved)return;const q=questions[index];
  if(q.type==='labels'){
    if(Object.keys(assignments).length<4){feedback('請先放置全部四個標籤。','error');return;}let right=0;labelTargets.forEach(([id,word])=>{const ok=assignments[id]===word;document.querySelector(`.zone-${id}`).classList.add(ok?'correct':'incorrect');if(ok)right++;});
    if(right===4)markSolved('你已認出主軸、光心、主焦點和焦距。');else feedback(`目前答對 ${right}／4 個，點選錯誤位置可取回文字。`,'error');return;
  }
  if(q.type==='number'){
    const input=$('number-answer'),value=Number(input.value);if(input.value.trim()===''){feedback('請先輸入放大率。','error');return;}if(Math.abs(value-q.answer)<.001){input.disabled=true;markSolved(q.explain);}else feedback(`再試一次。${q.hint}`,'error');return;
  }
  if(selected===null){feedback('請先選擇一個答案。','error');return;}if(selected===q.answer)markSolved(q.explain);else feedback(`再想一想：${q.hint}`,'error');
}

$('quiz-check').addEventListener('click',check);$('quiz-hint').addEventListener('click',()=>feedback(`提示：${questions[index].hint||'找出圖中的光心、焦點和主軸。'}`));$('quiz-next').addEventListener('click',()=>{index++;render();});$('quiz-restart').addEventListener('click',()=>{index=0;score=0;render();});render();
