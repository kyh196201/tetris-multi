// 테트리스 조각 로직
class Piece {
  constructor(ctx) {
    this.color = '';
    this.shape = [];
    this.x = 0;
    this.y = 0;

    this.ctx = ctx;
    this.spawn();
  }

  spawn() {
    const typeId = this.randomizeTetrominoType(SHAPE.length);
    this.shape = this.getRandomShape(typeId);
    this.color = this.getRandomColor(typeId);
  }

  draw() {
    this.ctx.fillStyle = this.color;

    this.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          this.ctx.fillRect(this.x + x, this.y + y, 1, 1);
        }
      });
    });
  }

  move(p) {
    this.x = p.x;
    this.y = p.y;
    this.shape = p.shape;
  }

  getRandomShape(index) {
    return SHAPE[index];
  }

  getRandomColor(index) {
    return COLORS[index];
  }

  randomizeTetrominoType(length) {
    return Math.floor(Math.random() * length);
  }

  setStartingPosition() {
    this.x = 3;
  }
}
