// 게임 초기화와 종료 코드
let requestId = null;
const time = {
  start: 0,
  elapsed: 0,
  level: 800,
};

// Account
const accountValues = {
  score: 0,
  lines: 0,
  level: 0,
};

// Account Proxy
const account = new Proxy(accountValues, {
  set: (target, key, value) => {
    target[key] = value;
    updateAccount(key, value);

    if (key === 'level') {
      const newLevel = Math.max(40, time.level - MINUS_PER_LEVEL * value);

      time.level = newLevel;
    }

    return true;
  },
});

// Canvas
const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
ctx.canvas.width = COLS * BLOCK_SIZE;
ctx.canvas.height = ROWS * BLOCK_SIZE;

// scale을 사용해서 블록의 크기를 1로 취급하도록 설정
ctx.scale(BLOCK_SIZE, BLOCK_SIZE);

const next = document.getElementById('next');
const ctxNext = next.getContext('2d');
ctxNext.canvas.width = 4 * BLOCK_SIZE;
ctxNext.canvas.height = 4 * BLOCK_SIZE;

// scale을 사용해서 블록의 크기를 1로 취급하도록 설정
ctxNext.scale(BLOCK_SIZE, BLOCK_SIZE);

const board = new Board({rows: ROWS, cols: COLS}, ctx, ctxNext, account);

// 키보드 입력 이벤트
document.addEventListener('keydown', event => {
  const {code} = event;

  if (moves[code]) {
    // 이벤트 버블링을 막는다.
    event.preventDefault();

    // NOTE ✨ 얕은 복사를 할 경우 p는 piece의 인스턴스가 아니라 일반 객체가 된다.
    let p = moves[code](board.piece);

    if (code === KEY.SPACE) {
      while (board.valid(p)) {
        account.score += POINTS.HARD_DROP;
        board.piece.move(p);
        p = moves[KEY.DOWN](board.piece);
      }

      //   그리기 전에 이전 좌표를 지운다.
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctxNext.clearRect(0, 0, ctxNext.canvas.width, ctxNext.canvas.height);
      board.draw();

      board.drop();
    } else if (board.valid(p)) {
      if (code === KEY.DOWN) {
        account.score += POINTS.SOFT_DROP;
      }

      // 이동이 가능한 상태라면 조각을 이동한다.
      board.piece.move(p);

      //   그리기 전에 이전 좌표를 지운다.
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctxNext.clearRect(0, 0, ctxNext.canvas.width, ctxNext.canvas.height);
      board.draw();
    } else {
      return false;
    }
  }
});

function play() {
  board.reset();
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctxNext.clearRect(0, 0, ctxNext.canvas.width, ctxNext.canvas.height);
  animate();
}

function animate(now = 0) {
  const elapsed = now - time.start;

  if (elapsed > time.level) {
    // move
    const dropped = board.drop();

    if (!dropped) {
      // Game Over
      gameOver();
      return;
    }
    time.start = now;
  }
  // Clear board before drawing new state.
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctxNext.clearRect(0, 0, ctxNext.canvas.width, ctxNext.canvas.height);

  board.draw();
  requestId = window.requestAnimationFrame(animate);
}

function gameOver() {
  window.cancelAnimationFrame(requestId);
  alert('game over!');
}

function updateAccount(key, value) {
  const $el = document.getElementById(key);

  if ($el) {
    $el.textContent = value;
  }
}
