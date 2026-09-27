const media = [
  {id:'vacuum',name:'真空',n:1,shown:'1.0000'},
  {id:'air',name:'空氣',n:1.000293,shown:'1.0003'},
  {id:'water',name:'水',n:1.333,shown:'1.33'},
  {id:'glass',name:'玻璃',n:1.52,shown:'1.52'},
  {id:'diamond',name:'鑽石',n:2.419,shown:'2.42'}
];
const $ = id => document.getElementById(id);
const sourceSelect=$('source-medium'), targetSelect=$('target-medium'), slider=$('angle-slider');
for(const select of [sourceSelect,targetSelect]) for(const medium of media){
  const option=document.createElement('option'); option.value=medium.id; option.textContent=`${medium.name}（約 ${medium.shown}）`; select.append(option);
}
sourceSelect.value='air'; targetSelect.value='water';
let angle=45;
const rad=d=>d*Math.PI/180, deg=r=>r*180/Math.PI;
const neat=n=>`${Number(n.toFixed(1))}°`;
function result(n1,n2,incidence){
  const critical=n1>n2 ? deg(Math.asin(n2/n1)) : null;
  if(critical!==null && incidence>critical+0.051) return {kind:'tir',critical};
  if(critical!==null && Math.abs(incidence-critical)<=0.051) return {kind:'critical',angle:90,critical};
  const sine=Math.min(1,n1/n2*Math.sin(rad(incidence)));
  return {kind:'refracted',angle:deg(Math.asin(sine)),critical};
}
function point(angleDegrees,length,side){return {x:400+side*Math.sin(rad(angleDegrees))*length,y:270+side*Math.cos(rad(angleDegrees))*length};}
function line(id,start,end){$(id).setAttribute('d',`M${start.x.toFixed(2)} ${start.y.toFixed(2)}L${end.x.toFixed(2)} ${end.y.toFixed(2)}`);}
function arrow(id,start,end){
  const x=start.x+(end.x-start.x)*.53,y=start.y+(end.y-start.y)*.53;
  const rotation=deg(Math.atan2(end.y-start.y,end.x-start.x));
  $(id).setAttribute('d',`M${x+15} ${y}l-21 -10v6h-16v8h16v6Z`);
  $(id).setAttribute('transform',`rotate(${rotation} ${x} ${y})`);
}
function arc(id,angleDegrees,below){
  if(angleDegrees<.3){$(id).setAttribute('d','');return;}
  const r=56,y=below?1:-1,start={x:400,y:270+y*r},end={x:400+(below?1:-1)*Math.sin(rad(angleDegrees))*r,y:270+y*Math.cos(rad(angleDegrees))*r};
  $(id).setAttribute('d',`M${start.x} ${start.y}A${r} ${r} 0 0 ${below?0:1} ${end.x.toFixed(2)} ${end.y.toFixed(2)}`);
}
function render(){
  const source=media.find(m=>m.id===sourceSelect.value),target=media.find(m=>m.id===targetSelect.value);
  const outcome=result(source.n,target.n,angle), origin={x:400,y:270}, start=point(angle,230,-1);
  $('source-label').textContent=source.name; $('target-label').textContent=target.name;
  $('source-index').textContent=`約 ${source.shown}`; $('target-index').textContent=`約 ${target.shown}`;
  $('critical-angle').textContent=outcome.critical===null?'不適用':neat(outcome.critical);
  $('critical-button').hidden=outcome.critical===null;
  $('slider-value').textContent=neat(angle); slider.value=angle;
  $('drag-handle').setAttribute('transform',`translate(${start.x.toFixed(2)} ${start.y.toFixed(2)})`);
  $('drag-handle').setAttribute('aria-valuenow',angle.toFixed(1));
  line('incident-ray',start,origin);arrow('incident-arrow',start,origin);arc('incident-arc',angle,false);
  const iLabel=$('incident-angle-label'); iLabel.textContent=`入射角 ${neat(angle)}`;
  iLabel.setAttribute('x',angle<15?285:angle>70?258:310);iLabel.setAttribute('y',angle>70?235:205);
  const tir=outcome.kind==='tir';
  $('output-ray').hidden=tir;$('output-arrow').hidden=tir;$('output-arc').hidden=tir;$('output-angle-label').hidden=tir;
  $('reflection-ray').hidden=!tir;$('reflection-arrow').hidden=!tir;
  if(tir){
    const end={x:400+Math.sin(rad(angle))*230,y:270-Math.cos(rad(angle))*230};
    line('reflection-ray',origin,end);arrow('reflection-arrow',origin,end);
    $('output-angle').textContent='無折射線';
    $('conclusion').textContent=`入射角 ${neat(angle)} 大於臨界角 ${neat(outcome.critical)}：發生全內反射。綠色是反射線，目的介質中沒有折射線。`;
  }else{
    const end={x:400+Math.sin(rad(outcome.angle))*230,y:270+Math.cos(rad(outcome.angle))*230};
    line('output-ray',origin,end);arrow('output-arrow',origin,end);arc('output-arc',outcome.angle,true);
    const label=$('output-angle-label');label.textContent=`折射角 ${neat(outcome.angle)}`;label.setAttribute('x',outcome.angle>70?484:420);label.setAttribute('y',outcome.angle>70?330:365);
    $('output-angle').textContent=neat(outcome.angle);
    let conclusion;
    if(outcome.kind==='critical') conclusion=`入射角剛好等於臨界角 ${neat(outcome.critical)}；折射線沿介質分界面前進。`;
    else if(angle===0) conclusion='入射角為 0°，光沿法線前進，方向不偏折。';
    else if(source.id===target.id) conclusion='兩側是相同介質，光線保持直線。';
    else if(source.n<target.n) conclusion='進入折射率較大的介質，折射線偏向法線，折射角小於入射角。';
    else conclusion='進入折射率較小的介質，折射線遠離法線，折射角大於入射角。';
    if((source.id==='air'&&target.id==='vacuum')||(source.id==='vacuum'&&target.id==='air')) conclusion+=' 空氣和真空的折射率極接近，圖上可能幾乎看不出偏折。';
    $('conclusion').textContent=conclusion;
  }
  $('comparison-body').replaceChildren(...media.map(m=>{
    const row=document.createElement('tr');if(m.id===target.id)row.className='active';
    const r=result(source.n,m.n,angle);
    const values=[m.name,m.shown,r.kind==='tir'?'全內反射':r.kind==='critical'?'沿分界面':neat(r.angle),r.kind==='tir'?'—':neat(Math.abs(angle-r.angle))];
    for(const value of values){const cell=document.createElement('td');cell.textContent=value;row.append(cell);}return row;
  }));
  $('comparison-note').textContent='偏折角度＝入射角與折射角的差；全內反射時沒有折射角。空氣與真空的差異很小，圖像可能難以分辨。';
}
sourceSelect.addEventListener('change',render);targetSelect.addEventListener('change',render);
slider.addEventListener('input',()=>{angle=Number(slider.value);render();});
$('critical-button').addEventListener('click',()=>{const a=media.find(m=>m.id===sourceSelect.value),b=media.find(m=>m.id===targetSelect.value);angle=deg(Math.asin(b.n/a.n));render();});
const svg=$('diagram'),handle=$('drag-handle');let dragging=false;
function updateFromPointer(event){
  const p=svg.createSVGPoint();p.x=event.clientX;p.y=event.clientY;
  const local=p.matrixTransform(svg.getScreenCTM().inverse());
  angle=Math.round(Math.max(0,Math.min(90,deg(Math.atan2(400-local.x,270-local.y))))*10)/10;render();
}
handle.addEventListener('pointerdown',event=>{dragging=true;handle.setPointerCapture(event.pointerId);updateFromPointer(event);});
handle.addEventListener('pointermove',event=>{if(dragging)updateFromPointer(event);});
handle.addEventListener('pointerup',()=>{dragging=false;});handle.addEventListener('pointercancel',()=>{dragging=false;});
handle.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowDown')angle=Math.max(0,angle-1);else if(event.key==='ArrowRight'||event.key==='ArrowUp')angle=Math.min(90,angle+1);else return;event.preventDefault();render();});
render();
