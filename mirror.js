const diagram = document.querySelector('#mirror-diagram');
const objectGroup = document.querySelector('#object-group');
const imageGroup = document.querySelector('#image-group');
const candleObjectGroup = document.querySelector('#candle-object-group');
const candleImageGroup = document.querySelector('#candle-image-group');
const eyeGroup = document.querySelector('#eye-group');
const slider = document.querySelector('#distance-slider');
const heightSlider = document.querySelector('#height-slider');
const showRays = document.querySelector('#show-rays');
const mirrorX = 500;
const gridSize = 50;
let eyeX = 425;
let eyeY = 109;
let distance = 4;
let objectY = 440;
let scene = 'person';
let dragging = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

function setLine(id, x1, y1, x2, y2) {
  const line = document.querySelector(id);
  line.setAttribute('x1', x1);
  line.setAttribute('y1', y1);
  line.setAttribute('x2', x2);
  line.setAttribute('y2', y2);
}

function setArrow(id, x1, y1, x2, y2, fraction) {
  const x = x1 + (x2 - x1) * fraction;
  const y = y1 + (y2 - y1) * fraction;
  const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  document.querySelector(id).setAttribute('transform', `translate(${x} ${y}) rotate(${angle})`);
}

function setPoint(id, x, y) {
  const label = document.querySelector(id);
  label.setAttribute('x', x);
  label.setAttribute('y', y);
}

function render(nextDistance, nextY = objectY) {
  distance = Math.max(2, Math.min(7, nextDistance));
  objectY = Math.max(330, Math.min(470, nextY));
  const objectX = mirrorX - distance * gridSize;
  const imageX = mirrorX + distance * gridSize;
  const objectTop = objectY - 160;
  objectGroup.setAttribute('transform', `translate(${objectX} ${objectY})`);
  imageGroup.setAttribute('transform', `translate(${imageX} ${objectY}) scale(-1 1)`);
  candleObjectGroup.setAttribute('transform', `translate(${objectX} ${objectY})`);
  candleImageGroup.setAttribute('transform', `translate(${imageX} ${objectY}) scale(-1 1)`);
  eyeGroup.setAttribute('transform', `translate(${eyeX - 425} ${eyeY - 109})`);

  const sourceYs = scene === 'candle' ? [objectY - 132, objectY] : [objectTop, objectTop];
  sourceYs.forEach((sourceY, index) => {
    const number = index + 1;
    let mirrorY;
    let reflectedX;
    let reflectedY;
    if (scene === 'candle') {
      mirrorY = eyeY + (sourceY - eyeY) * (mirrorX - eyeX) / (imageX - eyeX);
      reflectedX = eyeX;
      reflectedY = eyeY;
    } else {
      mirrorY = objectTop + (index === 0 ? 50 : 110);
      const extension = Math.min(
        mirrorX - 60,
        (500 - mirrorY) * (mirrorX - objectX) / (mirrorY - sourceY)
      );
      reflectedX = mirrorX - extension;
      reflectedY = mirrorY + (mirrorY - sourceY) * extension / (mirrorX - objectX);
    }
    setLine(`#normal-${number}`, mirrorX - 110, mirrorY, mirrorX, mirrorY);
    setLine(`#incident-ray-${number}`, objectX, sourceY, mirrorX, mirrorY);
    setLine(`#reflected-ray-${number}`, mirrorX, mirrorY, reflectedX, reflectedY);
    setLine(`#virtual-ray-${number}`, mirrorX, mirrorY, imageX, sourceY);
    setArrow(`#incident-arrow-${number}`, objectX, sourceY, mirrorX, mirrorY, .68);
    setArrow(`#reflected-arrow-${number}`, mirrorX, mirrorY, reflectedX, reflectedY, .53);
  });

  const labelOffset = scene === 'candle' ? 40 : 62;
  setPoint('#object-a', objectX - labelOffset, scene === 'candle' ? sourceYs[0] + 5 : objectTop + 5);
  setPoint('#object-b', objectX - labelOffset, scene === 'candle' ? sourceYs[1] + 5 : objectY + 7);
  setPoint('#image-a', imageX + labelOffset, scene === 'candle' ? sourceYs[0] + 5 : objectTop + 5);
  setPoint('#image-b', imageX + labelOffset, scene === 'candle' ? sourceYs[1] + 5 : objectY + 7);
  for (const [id, x] of [['#object-b-marker', objectX], ['#image-b-marker', imageX]]) {
    const marker = document.querySelector(id);
    marker.setAttribute('cx', x);
    marker.setAttribute('cy', objectY);
    marker.style.display = scene === 'candle' ? '' : 'none';
  }
  setPoint('#object-name', objectX, objectY + 27);
  setPoint('#image-name', imageX, objectY + 27);
  document.querySelector('#object-name').textContent = scene === 'candle' ? '蠟燭' : '物體';
  document.querySelector('#image-name').textContent = scene === 'candle' ? '蠟燭虛像' : '虛像';
  setLine('#object-distance-line', objectX + 7, 530, mirrorX - 10, 530);
  setLine('#image-distance-line', mirrorX + 10, 530, imageX - 7, 530);
  setPoint('#object-distance-label', (objectX + mirrorX) / 2, 565);
  setPoint('#image-distance-label', (mirrorX + imageX) / 2, 565);
  document.querySelector('#object-distance-label').textContent = `物距 ${distance} 格`;
  document.querySelector('#image-distance-label').textContent = `像距 ${distance} 格`;

  slider.value = distance;
  heightSlider.value = objectY;
  document.querySelector('#height-value').textContent = objectY < 400 ? '較高' : objectY > 440 ? '較低' : '中間';
  for (const id of ['#slider-value', '#object-distance-value', '#image-distance-value']) {
    document.querySelector(id).textContent = `${distance} 格`;
  }
  document.querySelector('#ray-layer').style.display = showRays.checked ? '' : 'none';
  document.querySelector('#virtual-layer').style.display = showRays.checked ? '' : 'none';
}

function setScene(nextScene) {
  scene = nextScene;
  const candle = scene === 'candle';
  objectGroup.style.display = candle ? 'none' : '';
  imageGroup.style.display = candle ? 'none' : '';
  candleObjectGroup.style.display = candle ? '' : 'none';
  candleImageGroup.style.display = candle ? '' : 'none';
  eyeGroup.style.display = candle ? '' : 'none';
  document.querySelector('#scene-intro').textContent = candle
    ? '蠟燭發出的光先射到平面鏡，再反射進眼睛。沿反射線向鏡後看，便會看見蠟燭的虛像。'
    : '人物胸前的方塊標記會出現在鏡像的相反一側。物體和虛像始終一樣高、大小相同。';
  document.querySelector('#stage-hint-text').textContent = candle
    ? '上下左右拖動蠟燭或眼睛，看入射線、反射線，以及鏡後虛線如何改變。'
    : '上下左右拖動橙色人物，觀察鏡後虛像和光線如何改變。';
  document.querySelectorAll('.scene-button').forEach(button => {
    const selected = button.dataset.scene === scene;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', selected);
  });
  render(distance);
}

function pointerPosition(event) {
  const bounds = diagram.getBoundingClientRect();
  return {
    x: (event.clientX - bounds.left) * 1000 / bounds.width,
    y: (event.clientY - bounds.top) * 580 / bounds.height
  };
}

function beginDrag(event) {
  dragging = 'object';
  const pointer = pointerPosition(event);
  dragOffsetX = mirrorX - distance * gridSize - pointer.x;
  dragOffsetY = objectY - pointer.y;
  diagram.setPointerCapture(event.pointerId);
}
objectGroup.addEventListener('pointerdown', beginDrag);
candleObjectGroup.addEventListener('pointerdown', beginDrag);
eyeGroup.addEventListener('pointerdown', event => {
  dragging = 'eye';
  const pointer = pointerPosition(event);
  dragOffsetX = eyeX - pointer.x;
  dragOffsetY = eyeY - pointer.y;
  diagram.setPointerCapture(event.pointerId);
});
diagram.addEventListener('pointermove', event => {
  if (!dragging) return;
  const pointer = pointerPosition(event);
  if (dragging === 'eye') {
    eyeX = Math.max(80, Math.min(450, Math.round((pointer.x + dragOffsetX) / 10) * 10));
    eyeY = Math.max(110, Math.min(400, Math.round((pointer.y + dragOffsetY) / 10) * 10));
    render(distance);
  } else {
    render(
      Math.round((mirrorX - pointer.x - dragOffsetX) / gridSize),
      Math.round((pointer.y + dragOffsetY) / 10) * 10
    );
  }
});
diagram.addEventListener('pointerup', () => { dragging = null; });
diagram.addEventListener('pointercancel', () => { dragging = null; });
slider.addEventListener('input', () => render(Number(slider.value)));
heightSlider.addEventListener('input', () => render(distance, Number(heightSlider.value)));
showRays.addEventListener('change', () => render(distance));
document.querySelectorAll('.scene-button').forEach(button => {
  button.addEventListener('click', () => setScene(button.dataset.scene));
});
document.querySelector('#reset-button').addEventListener('click', () => {
  showRays.checked = true;
  eyeX = 425;
  eyeY = 109;
  render(4, 440);
});
setScene('person');
