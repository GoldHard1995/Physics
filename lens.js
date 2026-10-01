const svg = document.querySelector('#lens-diagram');
const lensX = 500;
const axisY = 300;
const focalLength = 10;
const scale = 10;
const objectHeight = 12;
const $ = id => document.getElementById(id);

let lensType = 'convex';
let objectDistance = 30;
let farObject = false;
let dragging = null;

const lensRules = {
  convex: [
    ['規則 1：通過光心', '光線通過光心 C 後，方向保持不變。'],
    ['規則 2：平行主軸', '與主軸平行的光線，離開透鏡後通過另一側主焦點 F。'],
    ['規則 3：焦點光線', '通過物體側主焦點 F′ 的光線，離開透鏡後與主軸平行。']
  ],
  concave: [
    ['規則 1：通過光心', '光線通過光心 C 後，方向保持不變。'],
    ['規則 2：平行主軸', '與主軸平行的光線，離開透鏡後看似來自物體側主焦點 F′。'],
    ['規則 3：焦點光線', '射向另一側主焦點 F 的光線，離開透鏡後與主軸平行。']
  ]
};

function neat(value, digits = 1) {
  return Number(value.toFixed(digits)).toString();
}

function pointOnLine(a, b, x) {
  if (Math.abs(b.x - a.x) < .001) return a.y;
  return a.y + (b.y - a.y) * (x - a.x) / (b.x - a.x);
}

function solveLens(u) {
  if (lensType === 'convex') {
    if (Math.abs(u - focalLength) < .001) return {kind: 'infinite'};
    if (u > focalLength) {
      const v = focalLength * u / (u - focalLength);
      return {kind: 'real', v, m: v / u, upright: false};
    }
    const v = focalLength * u / (focalLength - u);
    return {kind: 'virtual', v, m: v / u, upright: true};
  }
  const v = focalLength * u / (u + focalLength);
  return {kind: 'virtual', v, m: v / u, upright: true};
}

function candleShape() {
  return '<path class="candle-flame" d="M0-120C-17-102-15-88 0-82C15-88 17-102 0-120Z"/><path class="candle-inner" d="M0-108C-7-99-6-92 0-89C6-92 7-99 0-108Z"/><rect class="candle-body" x="-22" y="-82" width="44" height="82"/><rect class="candle-band" x="-16" y="-69" width="32" height="9"/><path d="M0-84V-91" stroke="#4b2d1e" stroke-width="4"/>';
}

function renderLensAndFoci() {
  const shape = lensType === 'convex'
    ? '<path class="lens-fill" d="M500 52C458 112 458 488 500 548C542 488 542 112 500 52Z"/><path class="lens-center" d="M500 62V538"/>'
    : '<path class="lens-fill" d="M470 52C510 145 510 455 470 548H530C490 455 490 145 530 52Z"/><path class="lens-center" d="M500 62V538"/>';
  $('lens-shape').innerHTML = `${shape}<text x="516" y="283" class="focus-text" text-anchor="start">C</text>`;
  const marks = [
    [lensX - 2 * focalLength * scale, lensType === 'convex' ? '2F′' : '2F′'],
    [lensX - focalLength * scale, 'F′'],
    [lensX + focalLength * scale, 'F'],
    [lensX + 2 * focalLength * scale, '2F']
  ];
  $('focus-layer').innerHTML = marks.map(([x, label]) => `<path class="focus-mark" d="M${x} 288V312"/><text class="focus-text" x="${x}" y="335">${label}</text>`).join('');
}

function makeRay(rule, source) {
  const nearFocus = {x: lensX - focalLength * scale, y: axisY};
  const farFocus = {x: lensX + focalLength * scale, y: axisY};
  let hit;
  let end;
  let virtual = '';
  if (rule === 'center') {
    hit = {x: lensX, y: axisY};
    end = {x: 960, y: pointOnLine(source, hit, 960)};
  } else if (rule === 'parallel') {
    hit = {x: lensX, y: source.y};
    if (lensType === 'convex') end = {x: 960, y: pointOnLine(hit, farFocus, 960)};
    else {
      end = {x: 960, y: pointOnLine(nearFocus, hit, 960)};
      virtual = `<path class="ray virtual" d="M${hit.x} ${hit.y}L${nearFocus.x} ${nearFocus.y}"/>`;
    }
  } else {
    const target = lensType === 'convex' ? nearFocus : farFocus;
    hit = {x: lensX, y: pointOnLine(source, target, lensX)};
    end = {x: 960, y: hit.y};
    if (lensType === 'concave') virtual = `<path class="ray virtual" d="M${hit.x} ${hit.y}L${farFocus.x} ${farFocus.y}"/>`;
  }
  const midIn = {x:(source.x+hit.x)/2,y:(source.y+hit.y)/2};
  const midOut = {x:(hit.x+end.x)/2,y:(hit.y+end.y)/2};
  return `<path class="ray incoming" d="M${source.x} ${source.y}L${midIn.x} ${midIn.y}L${hit.x} ${hit.y}"/><path class="ray outgoing" d="M${hit.x} ${hit.y}L${midOut.x} ${midOut.y}L${end.x} ${end.y}"/>${virtual}`;
}

function renderRays(source, outcome) {
  const selected = [...document.querySelectorAll('[data-ray]')].filter(input => input.checked).map(input => input.dataset.ray);
  let paths = selected.map(rule => makeRay(rule, source)).join('');
  if (outcome.kind === 'virtual') {
    const imageX = lensX - outcome.v * scale;
    const imageTipY = axisY - objectHeight * scale * outcome.m;
    const hitY = source.y;
    paths += `<path class="ray virtual" d="M${lensX} ${hitY}L${imageX} ${imageTipY}"/>`;
  }
  $('ray-layer').innerHTML = paths;
}

function propertyWords(u, outcome) {
  if (outcome.kind === 'infinite') return ['像在無限遠', '沒有有限像'];
  const size = Math.abs(outcome.m - 1) < .015 ? '大小相同' : outcome.m > 1 ? '放大' : '縮小';
  return [outcome.kind === 'real' ? '實像' : '虛像', outcome.upright ? '正立' : '倒立', size];
}

function renderObjects(u, outcome) {
  const objectX = farObject ? 80 : lensX - u * scale;
  const source = {x: objectX, y: axisY - objectHeight * scale};
  $('object-candle').setAttribute('transform', `translate(${objectX} ${axisY})`);
  $('object-candle').setAttribute('aria-valuenow', farObject ? '1000' : neat(u));
  $('object-candle').innerHTML = `${candleShape()}<text class="candle-label" x="0" y="28">物體</text>`;
  $('image-candle').innerHTML = '';
  $('offscreen-note').innerHTML = '';
  if (outcome.kind === 'infinite') return {objectX, source};
  const imageX = outcome.kind === 'real' ? lensX + outcome.v * scale : lensX - outcome.v * scale;
  const verticalScale = outcome.upright ? outcome.m : -outcome.m;
  const className = outcome.kind === 'real' ? 'image-real' : 'image-virtual';
  const visible = imageX > 50 && imageX < 950 && objectHeight * outcome.m < 245;
  if (visible) {
    const labelY = outcome.upright ? axisY + 28 : axisY - objectHeight * scale * outcome.m - 18;
    $('image-candle').innerHTML = `<g class="${className}" transform="translate(${imageX} ${axisY}) scale(${outcome.m} ${verticalScale})">${candleShape()}</g><text class="image-label" x="${imageX}" y="${labelY}">${outcome.kind === 'real' ? '實像' : '虛像'}</text>`;
  } else {
    const sideX = outcome.kind === 'real' ? 875 : 125;
    $('offscreen-note').innerHTML = `<rect class="offscreen-box" x="${sideX-92}" y="48" width="184" height="52"/><text class="offscreen-text" x="${sideX}" y="80">像在畫面外</text>`;
  }
  return {objectX, source};
}

function renderReadouts(u, outcome) {
  const shownU = farObject ? '約 1000 cm' : `${neat(u)} cm`;
  $('distance-value').textContent = farObject ? '遠處（約 10 m）' : shownU;
  $('object-distance').textContent = shownU;
  if (outcome.kind === 'infinite') {
    $('image-distance').textContent = '無限遠';
    $('image-height').textContent = '不適用';
    $('magnification-value').textContent = '像在無限遠，放大率大小不適用';
    $('screen-note').textContent = '物體位於主焦點，折射光互相平行，不形成有限位置的像。';
  } else {
    const v = neat(outcome.v);
    const imageHeight = neat(objectHeight * outcome.m);
    const shownMagnification = neat(outcome.m, 2);
    const equalsSign = Math.abs(Number(imageHeight) / objectHeight - Number(shownMagnification)) < 1e-10 ? '＝' : '≈';
    $('image-distance').textContent = `${v} cm`;
    $('image-height').textContent = `${imageHeight} cm`;
    $('magnification-value').textContent = `｜m｜＝${imageHeight}／${neat(objectHeight)}${equalsSign}${shownMagnification}`;
    $('screen-note').textContent = outcome.kind === 'real' ? '這是實像，可以用屏幕承接。' : '這是虛像，不能用屏幕承接。';
  }
  $('properties').innerHTML = propertyWords(u,outcome).map(word => `<span class="property">${word}</span>`).join('');
}

function renderRuleCards() {
  $('rules-lens-name').textContent = lensType === 'convex' ? '凸透鏡' : '凹透鏡';
  $('rule-cards').innerHTML = lensRules[lensType].map(([title,text]) => `<article class="rule-card"><strong>${title}</strong><p>${text}</p></article>`).join('');
}

function render() {
  const u = farObject ? 1000 : objectDistance;
  const outcome = solveLens(u);
  renderLensAndFoci();
  const {source} = renderObjects(u,outcome);
  renderRays(source,outcome);
  renderReadouts(u,outcome);
  renderRuleCards();
  $('distance-slider').value = farObject ? 40 : objectDistance;
  $('distance-slider').disabled = farObject;
  $('stage-hint').textContent = '左右拖動蠟燭，觀察像的位置、方向和大小。';
}

function pointerPosition(event) {
  const bounds = svg.getBoundingClientRect();
  return {x:(event.clientX-bounds.left)*1000/bounds.width,y:(event.clientY-bounds.top)*560/bounds.height};
}

document.querySelectorAll('.type-button').forEach(button=>button.addEventListener('click',()=>{
  lensType=button.dataset.lens;
  document.querySelectorAll('.type-button').forEach(item=>{const active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-pressed',active);});
  render();
}));

$('distance-slider').addEventListener('input',()=>{farObject=false;objectDistance=Number($('distance-slider').value);render();});
document.querySelectorAll('.presets button').forEach(button=>button.addEventListener('click',()=>{
  farObject=button.dataset.distance==='far';
  if (!farObject) objectDistance=Number(button.dataset.distance);
  render();
}));
document.querySelectorAll('[data-ray]').forEach(input=>input.addEventListener('change',render));

$('object-candle').addEventListener('pointerdown',event=>{
  if (farObject) return;
  event.preventDefault();dragging='object';svg.setPointerCapture(event.pointerId);
});
$('object-candle').addEventListener('keydown',event=>{
  if (event.key==='ArrowLeft') objectDistance=Math.min(40,objectDistance+.5);
  else if (event.key==='ArrowRight') objectDistance=Math.max(5,objectDistance-.5);
  else return;
  event.preventDefault();farObject=false;render();
});
svg.addEventListener('pointermove',event=>{
  if (!dragging) return;
  const point=pointerPosition(event);
  farObject=false;objectDistance=Math.round(Math.max(5,Math.min(40,(lensX-point.x)/scale))*2)/2;render();
});
svg.addEventListener('pointerup',()=>{dragging=null;});
svg.addEventListener('pointercancel',()=>{dragging=null;});

render();
