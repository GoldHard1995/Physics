const questions=[
  {title:'角度由哪條線量度？',prompt:'圖中的虛線是法線。入射角及折射角應怎樣量度？',kind:'normal',options:['兩個角都從法線量度','兩個角都從介質分界面量度','入射角從法線、折射角從分界面量度'],answer:0,hint:'找出與介質分界面垂直的虛線。',explain:'法線垂直於分界面；入射角與折射角都由各自光線量度至法線。'},
  {title:'空氣進入水',prompt:'光線由空氣斜射入水。折射線相對法線會怎樣？',kind:'water',options:['偏向法線','遠離法線','一定沿分界面前進'],answer:0,hint:'水的折射率大於空氣。',explain:'進入折射率較大的水，折射角小於入射角，光線偏向法線。'},
  {title:'同一入射角，比較三種介質',prompt:'入射介質及入射角相同。光線分別進入水、玻璃、鑽石，哪一種情況偏折最多，折射角最小？',kind:'compare',options:['水','玻璃','鑽石'],answer:2,hint:'先固定入射介質和入射角，再比較目的介質的折射率。',explain:'三者之中鑽石的折射率最大，所以折射角最小，偏折最多。'},
  {title:'水進入空氣',prompt:'光線由水斜射入空氣，且未達臨界角。折射線會怎樣？',kind:'air',options:['偏向法線','遠離法線','必然全內反射'],answer:1,hint:'空氣的折射率比水小。',explain:'進入折射率較小的空氣，折射角大於入射角，光線遠離法線。'},
  {title:'空氣與真空',prompt:'一般入射角下，光在空氣與真空之間通過，圖上可能出現甚麼現象？',kind:'vacuum',options:['只有很小的方向變化，圖上幾乎看不出','每次都發生全內反射','折射線必然與法線重合'],answer:0,hint:'比較空氣與真空的折射率，兩者十分接近。',explain:'空氣與真空的折射率極接近，因此方向變化非常小。'},
  {title:'找出全內反射',prompt:'水射入空氣的臨界角約為 48.6°。哪一個入射角會發生全內反射？',kind:'tir',options:['40°','48.6°','55°'],answer:2,hint:'全內反射要求入射角「大於」臨界角。',explain:'55° 大於 48.6°，所以發生全內反射；等於臨界角時折射線沿界面前進。'},
  {title:'剛好等於臨界角',prompt:'水射入空氣，入射角剛好等於臨界角。折射線走向何處？',kind:'critical',options:['沿介質分界面前進','折回水中，沒有任何折射線','沿法線進入空氣'],answer:0,hint:'想想折射角剛好達到 90° 的方向。',explain:'等於臨界角時，折射角為 90°，折射線沿分界面前進。'}
];
const $=id=>document.getElementById(id);let index=0,selected=null,solved=false,score=0;
function svg(body,top='入射介質',bottom='目的介質'){
  return `<svg viewBox="0 0 600 340" role="img" aria-label="折射示意圖"><defs><pattern id="qgrid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="#dce4d5"/></pattern><marker id="aorange" viewBox="0 0 20 20" refX="16" refY="10" markerWidth="10" markerHeight="10" orient="auto"><path d="M0 2L18 10L0 18Z" fill="#e98936"/></marker><marker id="ablue" viewBox="0 0 20 20" refX="16" refY="10" markerWidth="10" markerHeight="10" orient="auto"><path d="M0 2L18 10L0 18Z" fill="#42a9be"/></marker><marker id="agreen" viewBox="0 0 20 20" refX="16" refY="10" markerWidth="10" markerHeight="10" orient="auto"><path d="M0 2L18 10L0 18Z" fill="#65a755"/></marker></defs><rect width="600" height="340" fill="#f8f3e7"/><rect y="170" width="600" height="170" fill="#d7edf0"/><rect width="600" height="340" fill="url(#qgrid)"/><path d="M0 170H600" stroke="#244e57" stroke-width="5"/><path d="M300 16V325" stroke="#617a6b" stroke-width="3" stroke-dasharray="8 7"/><text x="18" y="32" font-size="19" font-weight="900" fill="#263b35">${top}</text><text x="18" y="205" font-size="19" font-weight="900" fill="#263b35">${bottom}</text><text x="311" y="36" font-size="16" font-weight="900" fill="#466350">法線</text>${body}<circle cx="300" cy="170" r="6" fill="#263b35"/></svg>`;
}
const ray=(x1,y1,x2,y2,color,marker)=>`<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="${color}" stroke-width="5" marker-end="url(#${marker})"/>`;
function visual(kind){
  const incoming=ray(150,45,300,170,'#e98936','aorange');
  if(kind==='normal')return svg(`${incoming}${ray(300,170,380,313,'#42a9be','ablue')}<path d="M300 116A54 54 0 0 0 258 136M300 224A54 54 0 0 0 328 216" fill="none" stroke="#7a65aa" stroke-width="3"/><text x="225" y="126" fill="#7a65aa" font-size="23" font-weight="900">α</text><text x="322" y="235" fill="#7a65aa" font-size="23" font-weight="900">β</text>`,'空氣','水');
  if(kind==='water')return svg(`${incoming}${ray(300,170,390,316,'#42a9be','ablue')}<text x="192" y="93" fill="#a4511b" font-weight="900">入射線</text><text x="386" y="287" fill="#146278" font-weight="900">折射線</text>`,'空氣','水');
  if(kind==='compare')return svg(`${incoming}${ray(300,170,407,306,'#42a9be','ablue')}${ray(300,170,382,318,'#609b69','agreen')}${ray(300,170,354,326,'#866bb8','ablue')}<text x="410" y="305" fill="#146278" font-size="17" font-weight="900">水</text><text x="385" y="323" fill="#306937" font-size="17" font-weight="900">玻璃</text><text x="307" y="329" fill="#6b52a0" font-size="17" font-weight="900">鑽石</text>`,'空氣','三種目的介質');
  if(kind==='air')return svg(`${ray(245,45,300,170,'#e98936','aorange')}${ray(300,170,450,287,'#42a9be','ablue')}`,'水','空氣');
  if(kind==='vacuum')return svg(`${incoming}${ray(300,170,470,313,'#42a9be','ablue')}<text x="328" y="255" fill="#146278" font-weight="900">方向幾乎不變</text>`,'空氣','真空');
  if(kind==='tir')return svg(`${ray(150,45,300,170,'#e98936','aorange')}${ray(300,170,450,45,'#65a755','agreen')}<text x="380" y="80" fill="#306937" font-weight="900">反射線</text><text x="365" y="245" fill="#146278" font-weight="900">無折射線</text>`,'水','空氣');
  return svg(`${ray(245,45,300,170,'#e98936','aorange')}${ray(300,170,552,170,'#42a9be','ablue')}<text x="374" y="154" fill="#146278" font-weight="900">折射線</text>`,'水','空氣');
}
function feedback(message,type=''){const el=$('quiz-feedback');el.textContent=message;el.className=`quiz-feedback ${type}`;}
function render(){
  const q=questions[index];selected=null;solved=false;
  $('quiz-number').textContent=`第 ${index+1} 題 ／ 共 ${questions.length} 題`;
  $('question-title').textContent=q.title;$('question-prompt').textContent=q.prompt;$('quiz-visual').innerHTML=visual(q.kind);
  const list=document.createElement('div');list.className='choice-list';list.setAttribute('role','group');list.setAttribute('aria-label','選擇答案');
  q.options.forEach((option,i)=>{const button=document.createElement('button');button.type='button';button.className='choice';button.textContent=option;button.setAttribute('aria-pressed','false');button.addEventListener('click',()=>{if(solved)return;selected=i;for(const child of list.children){child.classList.remove('selected');child.setAttribute('aria-pressed','false');}button.classList.add('selected');button.setAttribute('aria-pressed','true');});list.append(button);});
  $('quiz-answer').replaceChildren(list);feedback('選擇答案後按「檢查答案」。');
  $('quiz-check').hidden=false;$('quiz-hint').hidden=false;$('quiz-next').hidden=true;$('quiz-restart').hidden=true;
  $('quiz-progress').innerHTML=`${Array.from({length:questions.length},(_,i)=>`<span class="progress-block ${i<index?'done':i===index?'current':''}"></span>`).join('')} <span>${index+1}/${questions.length}</span>`;
}
$('quiz-check').addEventListener('click',()=>{
  if(selected===null){feedback('請先選擇一個答案。','error');return;}
  const q=questions[index];if(selected!==q.answer){feedback(`再想一想：${q.hint}`,'error');return;}
  solved=true;score++;feedback(`答對了！${q.explain}`,'success');$('quiz-check').hidden=true;$('quiz-hint').hidden=true;
  if(index===questions.length-1){$('quiz-restart').hidden=false;$('quiz-next').hidden=true;$('quiz-next').textContent='下一題';$('quiz-progress').innerHTML=`完成 ${score}/${questions.length}`;}
  else $('quiz-next').hidden=false;
});
$('quiz-hint').addEventListener('click',()=>feedback(`提示：${questions[index].hint}`));
$('quiz-next').addEventListener('click',()=>{index++;render();});
$('quiz-restart').addEventListener('click',()=>{index=0;score=0;render();});
render();
