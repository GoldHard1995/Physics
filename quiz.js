    const quizQuestions = [
      { title: '認識光線與角度', prompt: '把五個文字方塊拖到圖中相應的位置。平板上也可先點文字，再點位置。', type: 'labels' },
      { title: '鏡面角度 → 入射角', prompt: '圖中 25° 是鏡面與入射線的夾角。入射角是多少度？', surfaceAngle: 25, given: 'surface-in', ask: 'normal-in', answer: 65, explanation: '法線與鏡面成 90°，所以入射角是 90° − 25° ＝ 65°。' },
      { title: '鏡面角度 → 反射角', prompt: '圖中 40° 是鏡面與入射線的夾角。反射角是多少度？', surfaceAngle: 40, given: 'surface-in', ask: 'normal-out', answer: 50, explanation: '入射角是 90° − 40° ＝ 50°；反射角與入射角相等，也是 50°。' },
      { title: '入射角 → 反射角', prompt: '圖中入射角是 58°。反射角是多少度？', incidence: 58, given: 'normal-in', ask: 'normal-out', answer: 58, explanation: '根據反射定律，反射角等於入射角，所以反射角是 58°。' },
      { title: '反射角 → 入射角', prompt: '圖中反射角是 70°。入射角是多少度？', incidence: 70, given: 'normal-out', ask: 'normal-in', answer: 70, explanation: '根據反射定律，入射角等於反射角，所以入射角是 70°。' }
    ];
    const labelWords = ['入射線', '反射線', '法線', '入射角', '反射角'];
    const labelTargets = [
      ['normal', '法線'],
      ['incident-ray', '入射線'],
      ['reflected-ray', '反射線'],
      ['incidence-angle', '入射角'],
      ['reflection-angle', '反射角']
    ];
    let quizIndex = 0;
    let quizSolved = false;
    let assignments = {};
    let selectedWord = null;

    function updateQuizProgress() {
      const count = Math.min(quizIndex + (quizSolved ? 1 : 0), 5);
      document.querySelector('#quiz-progress').innerHTML =
        `<span>${count} ／ 5 完成</span>` + Array.from({ length: 5 }, (_, index) =>
          `<span class="progress-block ${index < count ? 'done' : index === quizIndex ? 'current' : ''}" aria-hidden="true"></span>`).join('');
    }

    function setQuizFeedback(message, kind = '') {
      const feedback = document.querySelector('#quiz-feedback');
      feedback.textContent = message;
      feedback.className = `quiz-feedback ${kind}`;
    }

    function labelDiagram() {
      const zones = labelTargets.map(([id], index) =>
        `<button type="button" class="drop-zone zone-${id}" data-target="${id}" aria-label="圖中位置 ${index + 1}"><span class="zone-number">${index + 1}</span><span class="zone-text">放在這裏</span></button>`).join('');
      return `<div class="label-board">
        <svg viewBox="0 0 600 340" role="img" aria-label="平面鏡、兩條有方向箭嘴的光線、虛線法線和兩個角度弧線">
          <rect width="600" height="340" fill="#fffaf0"/>
          <path d="M0 40H600M0 80H600M0 120H600M0 160H600M0 200H600M0 240H600M0 280H600M0 320H600" stroke="#e6e5d5"/>
          <line x1="300" y1="26" x2="300" y2="240" stroke="#627d73" stroke-width="4" stroke-dasharray="10 8"/>
          <rect x="55" y="245" width="490" height="36" fill="#7aa4ab" stroke="#244e57" stroke-width="4"/>
          <rect x="55" y="245" width="490" height="9" fill="#b4e3e4"/>
          <path d="M300 192 A48 48 0 0 0 266.06 206.06" fill="none" stroke="#e98936" stroke-width="4"/>
          <path d="M300 192 A48 48 0 0 1 333.94 206.06" fill="none" stroke="#42a9be" stroke-width="4"/>
          <line x1="140" y1="80" x2="300" y2="240" stroke="#e98936" stroke-width="7"/>
          <line x1="300" y1="240" x2="460" y2="80" stroke="#42a9be" stroke-width="7"/>
          <path d="M20 0 L-2 -13 -2 -6 -21 -6 -21 6 -2 6 -2 13Z" transform="translate(198 138) rotate(45)" fill="#e98936" stroke="#743b1c" stroke-width="3"/>
          <path d="M20 0 L-2 -13 -2 -6 -21 -6 -21 6 -2 6 -2 13Z" transform="translate(400 140) rotate(-45)" fill="#42a9be" stroke="#205a68" stroke-width="3"/>
          <circle cx="300" cy="240" r="7" fill="#203529"/>
          <text x="300" y="311" text-anchor="middle" font-size="17" font-weight="900" fill="#263b35">平面鏡</text>
        </svg>${zones}</div>`;
    }

    function arcMarkup(type, incidence, radius, label, color) {
      const rad = incidence * Math.PI / 180;
      const surface = (90 - incidence) * Math.PI / 180;
      const left = [300 - radius * Math.sin(rad), 240 - radius * Math.cos(rad)];
      const right = [300 + radius * Math.sin(rad), 240 - radius * Math.cos(rad)];
      let start, end, sweep, textX, textY;
      const textRadius = radius + 27;
      if (type === 'surface-in') {
        start = [300 - radius, 240]; end = left; sweep = 1;
        textX = 300 - textRadius * Math.cos(surface / 2);
        textY = 240 - textRadius * Math.sin(surface / 2);
      } else if (type === 'surface-out') {
        start = [300 + radius, 240]; end = right; sweep = 0;
        textX = 300 + textRadius * Math.cos(surface / 2);
        textY = 240 - textRadius * Math.sin(surface / 2);
      } else if (type === 'normal-in') {
        start = [300, 240 - radius]; end = left; sweep = 0;
        textX = 300 - textRadius * Math.sin(rad / 2);
        textY = 240 - textRadius * Math.cos(rad / 2);
      } else {
        start = [300, 240 - radius]; end = right; sweep = 1;
        textX = 300 + textRadius * Math.sin(rad / 2);
        textY = 240 - textRadius * Math.cos(rad / 2);
      }
      return `<path d="M${start[0]} ${start[1]} A${radius} ${radius} 0 0 ${sweep} ${end[0]} ${end[1]}" fill="none" stroke="${color}" stroke-width="4" ${label === '?' ? 'stroke-dasharray="8 5"' : ''}/>
        <text x="${textX}" y="${textY}" text-anchor="middle" dominant-baseline="middle" fill="${color}" stroke="#fffaf0" stroke-width="5" paint-order="stroke" font-size="20" font-weight="900">${label}</text>`;
    }

    function numberDiagram(question) {
      const incidence = question.incidence ?? 90 - question.surfaceAngle;
      const rad = incidence * Math.PI / 180;
      const rayX = 190 * Math.sin(rad);
      const rayY = 190 * Math.cos(rad);
      const givenValue = question.given.startsWith('surface') ? 90 - incidence : incidence;
      return `<svg viewBox="0 0 600 340" role="img" aria-label="平面鏡光線圖，已知角度 ${givenValue} 度，求問號所示角度">
        <rect width="600" height="340" fill="#fffaf0"/>
        <path d="M0 40H600M0 80H600M0 120H600M0 160H600M0 200H600M0 240H600M0 280H600M0 320H600" stroke="#e6e5d5"/>
        <line x1="300" y1="26" x2="300" y2="240" stroke="#627d73" stroke-width="4" stroke-dasharray="10 8"/>
        <text x="313" y="42" fill="#466358" font-size="16" font-weight="900">法線</text>
        <rect x="55" y="245" width="490" height="36" fill="#7aa4ab" stroke="#244e57" stroke-width="4"/>
        <rect x="55" y="245" width="490" height="9" fill="#b4e3e4"/>
        <line x1="${300 - rayX}" y1="${240 - rayY}" x2="300" y2="240" stroke="#e98936" stroke-width="7"/>
        <line x1="300" y1="240" x2="${300 + rayX}" y2="${240 - rayY}" stroke="#42a9be" stroke-width="7"/>
        <path d="M17 0 L-2 -11 -2 -5 -18 -5 -18 5 -2 5 -2 11Z" transform="translate(${300 - rayX * .58} ${240 - rayY * .58}) rotate(${90 - incidence})" fill="#e98936" stroke="#743b1c" stroke-width="2"/>
        <path d="M17 0 L-2 -11 -2 -5 -18 -5 -18 5 -2 5 -2 11Z" transform="translate(${300 + rayX * .58} ${240 - rayY * .58}) rotate(${incidence - 90})" fill="#42a9be" stroke="#205a68" stroke-width="2"/>
        ${arcMarkup(question.given, incidence, 52, `${givenValue}°`, '#ac581d')}
        ${arcMarkup(question.ask, incidence, 73, '?', '#504c96')}
        <circle cx="300" cy="240" r="7" fill="#203529"/>
        <text x="300" y="311" text-anchor="middle" fill="#263b35" font-size="17" font-weight="900">平面鏡</text>
      </svg>`;
    }

    function refreshLabelBoard() {
      for (const [id] of labelTargets) {
        const zone = document.querySelector(`.zone-${id}`);
        const word = assignments[id];
        zone.querySelector('.zone-text').textContent = word || '放在這裏';
        zone.classList.toggle('filled', Boolean(word));
        zone.classList.remove('correct', 'incorrect');
      }
      document.querySelectorAll('.word-chip').forEach(chip => {
        chip.hidden = Object.values(assignments).includes(chip.dataset.word);
        chip.classList.toggle('selected', selectedWord === chip.dataset.word);
      });
    }

    function selectWord(word) {
      if (quizSolved) return;
      selectedWord = selectedWord === word ? null : word;
      refreshLabelBoard();
    }

    function placeWord(target) {
      if (quizSolved) return;
      if (selectedWord) {
        for (const [id, word] of Object.entries(assignments)) {
          if (word === selectedWord) delete assignments[id];
        }
        assignments[target] = selectedWord;
        selectedWord = null;
      } else if (assignments[target]) {
        delete assignments[target];
      }
      refreshLabelBoard();
      setQuizFeedback('完成後按「檢查答案」。');
    }

    function attachWordDrag(chip) {
      let startX, startY, moved, ghost;
      chip.addEventListener('pointerdown', event => {
        if (quizSolved) return;
        event.preventDefault();
        startX = event.clientX; startY = event.clientY; moved = false;
        chip.setPointerCapture(event.pointerId);
      });
      chip.addEventListener('pointermove', event => {
        if (startX === undefined) return;
        if (!moved && Math.hypot(event.clientX - startX, event.clientY - startY) > 8) {
          moved = true;
          ghost = chip.cloneNode(true);
          ghost.classList.add('drag-ghost');
          document.body.append(ghost);
        }
        if (ghost) {
          ghost.style.left = `${event.clientX}px`;
          ghost.style.top = `${event.clientY}px`;
        }
      });
      chip.addEventListener('pointerup', event => {
        if (startX === undefined) return;
        if (moved) {
          const zone = document.elementFromPoint(event.clientX, event.clientY)?.closest('.drop-zone');
          if (zone) {
            selectedWord = chip.dataset.word;
            placeWord(zone.dataset.target);
          }
        } else {
          selectWord(chip.dataset.word);
        }
        ghost?.remove(); ghost = null; startX = undefined;
      });
      chip.addEventListener('pointercancel', () => {
        ghost?.remove(); ghost = null; startX = undefined;
      });
      chip.addEventListener('click', event => {
        if (event.detail === 0) selectWord(chip.dataset.word);
      });
    }

    function showQuizQuestion() {
      const question = quizQuestions[quizIndex];
      quizSolved = false;
      assignments = {};
      selectedWord = null;
      updateQuizProgress();
      document.querySelector('#quiz-number').textContent = `第 ${quizIndex + 1} 題 ／ 共 5 題`;
      document.querySelector('#question-title').textContent = question.title;
      document.querySelector('#question-prompt').textContent = question.prompt;
      document.querySelector('#quiz-check').hidden = false;
      document.querySelector('#quiz-next').hidden = true;
      document.querySelector('#quiz-restart').hidden = true;
      setQuizFeedback('完成後按「檢查答案」。');

      if (question.type === 'labels') {
        document.querySelector('#quiz-visual').innerHTML = labelDiagram();
        document.querySelector('#quiz-answer').innerHTML = `<p class="quiz-instruction">拖動文字到圖中位置，或點選文字再點位置。</p><div class="word-bank">${labelWords.map(word => `<button type="button" class="word-chip" data-word="${word}">${word}</button>`).join('')}</div>`;
        document.querySelectorAll('.word-chip').forEach(attachWordDrag);
        document.querySelectorAll('.drop-zone').forEach(zone => zone.addEventListener('click', () => placeWord(zone.dataset.target)));
      } else {
        document.querySelector('#quiz-visual').innerHTML = numberDiagram(question);
        document.querySelector('#quiz-answer').innerHTML = '<label class="quiz-answer-label" for="number-answer">問號所示的角度是多少？</label><div class="number-entry"><input id="number-answer" type="number" min="0" max="90" step="1" inputmode="numeric" autocomplete="off"><span>°</span></div>';
        document.querySelector('#number-answer').addEventListener('keydown', event => {
          if (event.key === 'Enter') checkQuizAnswer();
        });
      }
    }

    function markQuizSolved(message) {
      quizSolved = true;
      setQuizFeedback(message, 'success');
      document.querySelector('#quiz-check').hidden = true;
      document.querySelector('#quiz-next').hidden = false;
      document.querySelector('#quiz-next').textContent = quizIndex === 4 ? '查看結果' : '下一題';
      updateQuizProgress();
    }

    function checkQuizAnswer() {
      if (quizSolved) return;
      const question = quizQuestions[quizIndex];
      if (question.type === 'labels') {
        if (Object.keys(assignments).length < 5) {
          setQuizFeedback('請先把五個文字方塊全部放到圖中。', 'error');
          return;
        }
        let correct = 0;
        for (const [id, expected] of labelTargets) {
          const right = assignments[id] === expected;
          document.querySelector(`.zone-${id}`).classList.add(right ? 'correct' : 'incorrect');
          if (right) correct++;
        }
        if (correct === 5) {
          markQuizSolved('五個標籤全部正確！你已分清光線、法線與兩個角。');
        } else {
          setQuizFeedback(`目前答對 ${correct} ／ 5 個。點錯誤位置可取回文字，再試一次。`, 'error');
        }
        return;
      }

      const input = document.querySelector('#number-answer');
      const value = Number(input.value);
      if (input.value.trim() === '' || !Number.isInteger(value) || value < 0 || value > 90) {
        setQuizFeedback('請輸入 0 至 90 之間的整數角度。', 'error');
      } else if (value === question.answer) {
        input.disabled = true;
        markQuizSolved(`答對了！${question.explanation}`);
      } else {
        const hint = question.given.startsWith('surface') ? '先用 90° 找到與法線的夾角。' : '先用反射定律，再看所問角度是否由鏡面量度。';
        setQuizFeedback(`再試一次。${hint}`, 'error');
      }
    }

    document.querySelector('#quiz-check').addEventListener('click', checkQuizAnswer);
    document.querySelector('#quiz-next').addEventListener('click', () => {
      if (!quizSolved) return;
      quizIndex++;
      if (quizIndex < 5) {
        showQuizQuestion();
      } else {
        updateQuizProgress();
        document.querySelector('#quiz-number').textContent = '全部完成';
        document.querySelector('#question-title').textContent = '成功完成反射挑戰！';
        document.querySelector('#question-prompt').textContent = '你已練習辨認光線和角度，並分清由法線與鏡面量度的角。';
        document.querySelector('#quiz-visual').innerHTML = '<div class="quiz-complete"><div><span>✓</span>5 題完成</div></div>';
        document.querySelector('#quiz-answer').innerHTML = '<p class="quiz-instruction">記住：法線與鏡面成 90°；入射角等於反射角。</p>';
        document.querySelector('#quiz-check').hidden = true;
        document.querySelector('#quiz-next').hidden = true;
        document.querySelector('#quiz-restart').hidden = false;
        setQuizFeedback('挑戰完成！', 'success');
      }
    });
    document.querySelector('#quiz-restart').addEventListener('click', () => {
      quizIndex = 0;
      showQuizQuestion();
    });
    showQuizQuestion();
