const questions = [
  { title: '虛像的方向', prompt: '鏡中人物的上下方向會怎樣？', kind: 'choice', scene: 'blank', options: [['頭朝上，與物體一樣', 'upright'], ['頭朝下', 'upside-down'], ['橫躺', 'sideways']], answer: 'upright', explanation: '平面鏡成的像是正立的，人物的頭仍然朝上。' },
  { title: '左右相反', prompt: '鏡前人物胸前左側有星星。把星星放在鏡像人物胸前的正確一側。', kind: 'badge', answer: 'right', explanation: '鏡像左右相反；物體左側的星星，會出現在鏡像的右側。' },
  { title: '物體與像的大小', prompt: '把物體移遠一點，鏡中的像會變大、變小，還是一樣大？', kind: 'choice', scene: 'blank', options: [['像與物體一樣大', 'same'], ['像變小', 'smaller'], ['像變大', 'larger']], answer: 'same', explanation: '平面鏡中的像與物體大小相同，移動物體也不會改變這個關係。' },
  { title: '物距與像距', prompt: '圖中物體與鏡面相距 3 格。像與鏡面相距幾格？', kind: 'number', scene: 'distance', answer: 3, explanation: '平面鏡成像時，像距等於物距，所以像距是 3 格。' },
  { title: '虛像能否投到屏幕？', prompt: '鏡後看見的像，能否投射到屏幕上？', kind: 'choice', scene: 'rays', options: [['可以，鏡後有真正的光線交會', 'real'], ['不可以，只有反射線的延長線在鏡後交會', 'virtual'], ['物體靠近鏡面時才可以', 'near']], answer: 'virtual', explanation: '鏡後只有反射線的虛線延長線相交，沒有真正的光線在該處交會，因此是不能投射到屏幕上的虛像。' }
];

let questionIndex = 0;
let solved = false;
let selectedChoice = null;
let selectedSide = null;

function avatar(x, color, flipped = false, badge = true, opacity = 1) {
  return `<g transform="translate(${x} 250) scale(${flipped ? -1 : 1} 1)" opacity="${opacity}">
    <rect x="-24" y="-140" width="48" height="39" fill="#f8d6a8" stroke="#743b1c" stroke-width="3"/>
    <rect x="-25" y="-143" width="50" height="11" fill="#593b2a"/>
    <rect x="-31" y="-99" width="62" height="64" fill="${color}" stroke="#743b1c" stroke-width="3"/>
    <rect x="-42" y="-93" width="11" height="51" fill="${color}" stroke="#743b1c" stroke-width="3"/>
    <rect x="31" y="-93" width="11" height="51" fill="${color}" stroke="#743b1c" stroke-width="3"/>
    <rect x="-25" y="-35" width="18" height="35" fill="#526b84" stroke="#263b35" stroke-width="3"/>
    <rect x="7" y="-35" width="18" height="35" fill="#526b84" stroke="#263b35" stroke-width="3"/>
    ${badge ? '<text x="-20" y="-64" font-size="21" font-weight="900" fill="#fff4d2" stroke="#743b1c" stroke-width="1" paint-order="stroke">★</text>' : ''}
  </g>`;
}

function diagram(scene) {
  const distance = scene === 'distance';
  const objectX = distance ? 150 : 170;
  const imageX = distance ? 450 : 430;
  const showImage = scene === 'badge' || distance || scene === 'rays';
  const rays = scene === 'rays' ? `
    <line x1="170" y1="110" x2="300" y2="145" stroke="#e98936" stroke-width="3"/>
    <line x1="170" y1="110" x2="300" y2="190" stroke="#e98936" stroke-width="3"/>
    <line x1="300" y1="145" x2="210" y2="169.2" stroke="#42a9be" stroke-width="3"/>
    <line x1="300" y1="190" x2="220" y2="239.2" stroke="#42a9be" stroke-width="3"/>
    <path d="M300 145L430 110M300 190L430 110" fill="none" stroke="#7460a4" stroke-width="3" stroke-dasharray="8 6"/>
    <path d="M13 0L-2 -8V-4H-15V4H-2V8Z" transform="translate(251 131) rotate(15)" fill="#e98936"/>
    <path d="M13 0L-2 -8V-4H-15V4H-2V8Z" transform="translate(252 158) rotate(32)" fill="#e98936"/>
    <path d="M13 0L-2 -8V-4H-15V4H-2V8Z" transform="translate(257 157) rotate(165)" fill="#42a9be"/>
    <path d="M13 0L-2 -8V-4H-15V4H-2V8Z" transform="translate(262 213) rotate(148)" fill="#42a9be"/>` : '';
  return `<svg viewBox="0 0 600 320" role="img" aria-label="平面鏡左側的物體及右側的虛像示意圖">
    <defs><pattern id="quiz-grid" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M50 0H0V50" fill="none" stroke="#d7decf"/></pattern></defs>
    <rect width="600" height="320" fill="#fffaf0"/><rect width="600" height="320" fill="url(#quiz-grid)"/>
    <rect x="305" width="295" height="320" fill="#d6eeee" opacity=".25"/>
    <line x1="50" y1="250" x2="550" y2="250" stroke="#a8b7a7" stroke-width="3"/>
    ${rays}
    <rect x="294" y="25" width="12" height="243" fill="#7aa4ab" stroke="#244e57" stroke-width="3"/>
    ${avatar(objectX, '#e98936')}
    ${showImage ? avatar(imageX, '#42a9be', true, scene !== 'badge', .48) : `<rect x="${imageX - 35}" y="110" width="70" height="140" fill="none" stroke="#42a9be" stroke-width="3" stroke-dasharray="8 6"/><text x="${imageX}" y="188" text-anchor="middle" font-size="35" font-weight="900" fill="#23798d">?</text>`}
    <text x="${objectX}" y="289" text-anchor="middle" font-size="17" font-weight="900" fill="#9f4d1b">物體</text>
    <text x="300" y="20" text-anchor="middle" font-size="17" font-weight="900" fill="#263b35">平面鏡</text>
    <text x="${imageX}" y="289" text-anchor="middle" font-size="17" font-weight="900" fill="#23798d">${showImage ? '虛像' : '像的位置'}</text>
    ${distance ? '<path d="M150 274H294M306 274H450" stroke="#466350" stroke-width="3"/><text x="222" y="310" text-anchor="middle" font-size="17" font-weight="900" fill="#263b35">物距 3 格</text><text x="378" y="310" text-anchor="middle" font-size="17" font-weight="900" fill="#263b35">像距 ？</text>' : ''}
  </svg>`;
}

function updateProgress() {
  const count = Math.min(questionIndex + (solved ? 1 : 0), 5);
  document.querySelector('#quiz-progress').innerHTML = `<span>${count} ／ 5 完成</span>` +
    Array.from({ length: 5 }, (_, index) => `<span class="progress-block ${index < count ? 'done' : index === questionIndex ? 'current' : ''}" aria-hidden="true"></span>`).join('');
}

function feedback(message, kind = '') {
  const field = document.querySelector('#quiz-feedback');
  field.textContent = message;
  field.className = `quiz-feedback ${kind}`;
}

function chooseSide(side) {
  if (solved) return;
  selectedSide = side;
  document.querySelectorAll('.badge-target').forEach(target => {
    const chosen = target.dataset.side === side;
    target.classList.toggle('selected', chosen);
    target.textContent = chosen ? '★' : '＋';
  });
  document.querySelector('#badge-chip').classList.remove('selected');
  feedback('完成後按「檢查答案」。');
}

function attachBadgeDrag(chip) {
  let startX, startY, ghost;
  chip.addEventListener('pointerdown', event => {
    if (solved) return;
    event.preventDefault();
    startX = event.clientX;
    startY = event.clientY;
    chip.setPointerCapture(event.pointerId);
  });
  chip.addEventListener('pointermove', event => {
    if (startX === undefined) return;
    if (!ghost && Math.hypot(event.clientX - startX, event.clientY - startY) > 8) {
      ghost = chip.cloneNode(true);
      ghost.classList.add('badge-ghost');
      document.body.append(ghost);
    }
    if (ghost) {
      ghost.style.left = `${event.clientX}px`;
      ghost.style.top = `${event.clientY}px`;
    }
  });
  chip.addEventListener('pointerup', event => {
    if (startX === undefined) return;
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('.badge-target');
    if (target) chooseSide(target.dataset.side);
    else if (!ghost) chip.classList.toggle('selected');
    ghost?.remove(); ghost = null; startX = undefined;
  });
  chip.addEventListener('pointercancel', () => { ghost?.remove(); ghost = null; startX = undefined; });
  chip.addEventListener('click', event => {
    if (event.detail === 0) chip.classList.toggle('selected');
  });
}

function showQuestion() {
  const question = questions[questionIndex];
  solved = false;
  selectedChoice = null;
  selectedSide = null;
  updateProgress();
  document.querySelector('#quiz-number').textContent = `第 ${questionIndex + 1} 題 ／ 共 5 題`;
  document.querySelector('#question-title').textContent = question.title;
  document.querySelector('#question-prompt').textContent = question.prompt;
  document.querySelector('#quiz-check').hidden = false;
  document.querySelector('#quiz-next').hidden = true;
  document.querySelector('#quiz-restart').hidden = true;
  feedback('完成後按「檢查答案」。');

  if (question.kind === 'badge') {
    document.querySelector('#quiz-visual').innerHTML = `<div class="badge-board">${diagram('badge')}<button class="badge-target left" type="button" data-side="left" aria-label="鏡像人物左側">＋</button><button class="badge-target right" type="button" data-side="right" aria-label="鏡像人物右側">＋</button></div>`;
    document.querySelector('#quiz-answer').innerHTML = '<p class="quiz-instruction">拖動星星到鏡像人物胸前，也可先點星星再點位置。</p><button type="button" class="badge-chip" id="badge-chip">★ 星星標記</button>';
    document.querySelectorAll('.badge-target').forEach(target => target.addEventListener('click', () => chooseSide(target.dataset.side)));
    attachBadgeDrag(document.querySelector('#badge-chip'));
  } else if (question.kind === 'number') {
    document.querySelector('#quiz-visual').innerHTML = diagram(question.scene);
    document.querySelector('#quiz-answer').innerHTML = '<label class="quiz-answer-label" for="number-answer">像距是多少格？</label><div class="number-entry"><input id="number-answer" type="number" min="0" max="7" step="1" inputmode="numeric" autocomplete="off"><span>格</span></div>';
    document.querySelector('#number-answer').addEventListener('keydown', event => { if (event.key === 'Enter') checkAnswer(); });
  } else {
    document.querySelector('#quiz-visual').innerHTML = diagram(question.scene);
    document.querySelector('#quiz-answer').innerHTML = `<p class="quiz-instruction">選出正確答案。</p><div class="choice-list">${question.options.map(([label, value]) => `<button type="button" class="choice" data-choice="${value}">${label}</button>`).join('')}</div>`;
    document.querySelectorAll('.choice').forEach(choice => choice.addEventListener('click', () => {
      if (solved) return;
      selectedChoice = choice.dataset.choice;
      document.querySelectorAll('.choice').forEach(item => item.classList.toggle('selected', item === choice));
      feedback('完成後按「檢查答案」。');
    }));
  }
}

function markSolved(explanation) {
  solved = true;
  feedback(`答對了！${explanation}`, 'success');
  document.querySelector('#quiz-check').hidden = true;
  document.querySelector('#quiz-next').hidden = false;
  document.querySelector('#quiz-next').textContent = questionIndex === 4 ? '查看結果' : '下一題';
  updateProgress();
}

function checkAnswer() {
  if (solved) return;
  const question = questions[questionIndex];
  if (question.kind === 'badge') {
    if (!selectedSide) feedback('請先把星星放在鏡像人物身上。', 'error');
    else if (selectedSide === question.answer) markSolved(question.explanation);
    else feedback('再觀察：鏡像會把左右方向對調。', 'error');
  } else if (question.kind === 'number') {
    const input = document.querySelector('#number-answer');
    const value = Number(input.value);
    if (input.value.trim() === '' || !Number.isInteger(value) || value < 0 || value > 7) feedback('請輸入 0 至 7 的整數格數。', 'error');
    else if (value === question.answer) { input.disabled = true; markSolved(question.explanation); }
    else feedback('再試一次：比較物距和像距。', 'error');
  } else if (!selectedChoice) {
    feedback('請先選擇一個答案。', 'error');
  } else if (selectedChoice === question.answer) {
    markSolved(question.explanation);
  } else {
    feedback('再看一次圖像，然後重試。', 'error');
  }
}

document.querySelector('#quiz-check').addEventListener('click', checkAnswer);
document.querySelector('#quiz-next').addEventListener('click', () => {
  if (!solved) return;
  questionIndex++;
  if (questionIndex < 5) {
    showQuestion();
  } else {
    updateProgress();
    document.querySelector('#quiz-number').textContent = '全部完成';
    document.querySelector('#question-title').textContent = '成功完成成像挑戰！';
    document.querySelector('#question-prompt').textContent = '你已辨認平面鏡成像的五項性質。';
    document.querySelector('#quiz-visual').innerHTML = '<div class="quiz-complete"><div><span>✓</span>5 題完成</div></div>';
    document.querySelector('#quiz-answer').innerHTML = '<p class="quiz-instruction">再回到模擬器移動物體，看看五項性質是否每次都成立。</p>';
    document.querySelector('#quiz-check').hidden = true;
    document.querySelector('#quiz-next').hidden = true;
    document.querySelector('#quiz-restart').hidden = false;
    feedback('挑戰完成！', 'success');
  }
});
document.querySelector('#quiz-restart').addEventListener('click', () => { questionIndex = 0; showQuestion(); });
showQuestion();
