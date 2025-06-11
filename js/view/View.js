class View {
  constructor(game, document, tileWidth, tileHeight) {
    this.game = game;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.myCanva = document.querySelector("#myCanvas");
    this.ctx = this.myCanva.getContext("2d");
    this.myCanva.width = this.game.width * this.tileWidth;
    this.myCanva.height = this.game.width * this.tileHeight;

    this.refresh();
  }

  refresh() {
    this.displayGrid();
  }

  displayGrid() {
    for (let y = 0; y < this.game.height; y++) {
      for (let x = 0; x < this.game.width; x++) {
        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.fillRect(
          // position x y & tileSize (width & height)
          x * this.tileWidth,
          y * this.tileHeight,
          this.tileWidth,
          this.tileHeight
        );

        // load image
        const cell = this.game.matrix[y][x];
        if (cell != null) {
          if (cell.devoile == true) {
            const image = new Image();
            image.src = cell.image;
            image.onload = () => {
              this.ctx.drawImage(
                image,
                x * this.tileWidth,
                y * this.tileHeight,
                this.tileWidth,
                this.tileHeight
              );
            };
          } else {
            this.ctx.fillStyle = "red";
            this.ctx.fillRect(
            // position x y & tileSize (width & height)
            x * this.tileWidth,
            y * this.tileHeight,
            this.tileWidth,
            this.tileHeight
            );

          }
        }

        // border
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = "#000000";
        this.ctx.strokeRect(
          x * this.tileWidth,
          y * this.tileHeight,
          this.tileWidth,
          this.tileHeight
        );
      }
    }
  }
}

export default View;
