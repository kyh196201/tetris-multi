// 보드 로직
// 조각 회전
function rotate(p) {
  // 얕은 복사
  // NOTE: clone = {...p};로 했을 경우에는 shape가 변경됨
  const clone = JSON.parse(JSON.stringify(p));

  // 행렬을 변환한다. p는 Piece의 인스턴스이다.
  for (let y = 0; y < clone.shape.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [clone.shape[x][y], clone.shape[y][x]] = [
        clone.shape[y][x],
        clone.shape[x][y],
      ];
    }
  }

  // 열 순서대로 뒤집는다.
  clone.shape.forEach(row => row.reverse());

  return clone;
}

/**
 * NOTE 얕은 복사
 * 원본 조각을 변화시키지 않고 새로운 조각을 얻을 수 있다.
 */
const moves = {
  [KEY.LEFT]: p => ({...p, x: p.x - 1}),
  [KEY.RIGHT]: p => ({...p, x: p.x + 1}),
  [KEY.DOWN]: p => ({...p, y: p.y + 1}),
  [KEY.SPACE]: p => ({...p, y: p.y + 1}),
  [KEY.UP]: p => rotate(p),
};
class Board {
  constructor(scale, ctx, ctxNext, account) {
    this.ctx = ctx;
    this.ctxNext = ctxNext;
    this.account = account;

    this.rows = scale.rows;
    this.cols = scale.cols;
    this.grid = [];

    this.piece = null;
    this.nextPiece = null;
  }

  reset() {
    this.account.score = 0;
    this.account.lines = 0;
    this.account.level = 0;

    this.grid = this.getEmptyBoard();
    this.piece = new Piece(this.ctx);
    this.piece.setStartingPosition();
    this.getNextPiece();
  }

  getEmptyBoard() {
    return Array.from({length: this.rows}, () => Array(this.cols).fill(0));
  }

  getNextPiece() {
    this.nextPiece = new Piece(this.ctxNext);
  }

  valid(p) {
    return p.shape.every((row, dy) =>
      row.every((value, dx) => {
        const x = p.x + dx;
        const y = p.y + dy;

        return (
          this.isEmpty(value) ||
          (this.isInsideWall(x, y) && this.notOccupied(x, y))
        );
      }),
    );
  }

  isEmpty(value) {
    return value === 0;
  }

  isInsideWall(x, y) {
    return x >= 0 && y < this.rows && x < this.cols;
  }

  notOccupied(x, y) {
    return this.grid[y] && this.grid[y][x] === 0;
  }

  drop() {
    const p = moves[KEY.DOWN](this.piece);

    if (this.valid(p)) {
      this.piece.move(p);
    } else {
      this.freeze();
      this.clearLines();

      if (this.piece.y <= 0) {
        // Game Over
        return false;
      }

      this.piece = this.nextPiece;
      this.piece.ctx = this.ctx;
      this.piece.setStartingPosition();
      this.getNextPiece();
    }

    return true;
  }

  draw() {
    this.piece.draw();
    this.nextPiece.draw();
    this.drawBoard();
  }

  drawBoard() {
    this.grid.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          this.ctx.fillStyle = COLORS[value - 1];
          this.ctx.fillRect(x, y, 1, 1);
        }
      });
    });
  }

  freeze() {
    this.piece.shape.forEach((row, dy) => {
      row.forEach((value, dx) => {
        if (value > 0) {
          const x = this.piece.x + dx;
          const y = this.piece.y + dy;

          this.grid[y][x] = value;
        }
      });
    });
  }

  clearLines() {
    let lines = 0;

    this.grid.forEach((row, y) => {
      if (row.every(value => value > 0)) {
        this.grid.splice(y, 1);
        this.grid.unshift(Array(COLS).fill(0));
        lines++;
      }
    });

    if (lines > 0) {
      const score = this.getLineClearPoints(lines);
      this.account.score += score;
      this.account.lines += lines;
      this.account.level = parseInt(this.account.lines / 10);
    }
  }

  getLineClearPoints(lines) {
    let point = 0;

    if (lines === 1) {
      point = POINTS.SINGLE;
    } else if (lines === 2) {
      point = POINTS.DOUBLE;
    } else if (lines === 3) {
      point = POINTS.TRIPLE;
    } else if (lines === 42) {
      point = POINTS.TETRIS;
    } else {
      point = 0;
    }

    return point * (this.account.level + 1);
  }
}
