class View {
  // tileWidth:50 & tileHeight:70
  constructor(game, document, tileWidth, tileHeight) {
    this.game = game;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.myCanva = document.querySelector("#myCanvas");
    this.ctx = this.myCanva.getContext("2d");
    this.gameboardWidth = this.game.width * this.tileWidth ;
    this.gameboardHeight = this.game.height * this.tileHeight; 
    this.espacementWidth = 2 * this.tileWidth;
    this.playerHandWidth = 7 * this.tileWidth;
    this.playerHandHeight = 4 * this.tileHeight;

    this.myCanva.width = this.gameboardWidth + this.espacementWidth + this.playerHandWidth;
    this.myCanva.height = this.gameboardHeight + this.playerHandHeight;

    // mobile
    this.isMobile = window.innerWidth < 600;
    this.setCanvasSize();

    this.refresh();
  }

  // Mobile:vertical != Desktop:horizontal
  setCanvasSize() {
    if (this.isMobile) { 
      this.myCanva.width = Math.max(this.gameboardWidth, this.playerHandWidth);
      this.myCanva.height = this.gameboardHeight + this.espacementWidth + this.playerHandHeight;
    } else {
      this.myCanva.width = this.gameboardWidth + this.espacementWidth + this.playerHandWidth;
      this.myCanva.height = Math.max(this.gameboardHeight, this.playerHandHeight);
    }
  }

  refresh() {
    this.ctx.clearRect(0, 0, this.myCanva.width, this.myCanva.height);
    this.displayGrid();
    this.displayPlayersCards();
  }

  displayGrid() {
    for (let y = 0; y < this.game.height; y++) {
      for (let x = 0; x < this.game.width; x++) {
        this.ctx.fillStyle = "#FFFFFF";
        // position x y & tileSize (width & height)
        this.ctx.fillRect(
          x * this.tileWidth,
          y * this.tileHeight,
          this.tileWidth,
          this.tileHeight
        );

        // load image
        const cell = this.game.matrix[y][x];
        if (cell !== null) {
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
            }
          } else {
            this.ctx.fillStyle = "#008bf8";
            this.ctx.fillRect(
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

  displayPlayersCards() {
    let zoneCardsDepartX, zoneCardsDepartY;

    if (this.isMobile) {
      zoneCardsDepartX = 0;
      zoneCardsDepartY = this.gameboardHeight + this.tileHeight/2;
    } else {
      zoneCardsDepartX = this.gameboardWidth + this.espacementWidth;
      zoneCardsDepartY = 0;
    }

    this.ctx.fillStyle = "#FFFFFF"; 
    this.ctx.fillRect(
      zoneCardsDepartX,          
      zoneCardsDepartY,                   
      this.isMobile ? this.gameboardWidth : this.playerHandWidth,
      this.playerHandHeight
    );

    // joueurs
    this.ctx.fillStyle = "#000000";
    this.ctx.font = "18px Tagesschrift, arial";
    const textOffsetY = this.isMobile ? zoneCardsDepartY + 25 : 25;
    this.ctx.fillText("Cartes du Joueur 1", zoneCardsDepartX + this.tileWidth / 1.75, textOffsetY);
    this.ctx.fillText("Cartes du Joueur 2", zoneCardsDepartX + this.tileWidth / 1.75, textOffsetY + this.tileHeight + this.tileHeight);
    
    const spaceBetweenCards = 10;

    // Cartes du Joueur 1 (5 cartes distribuées)
    for (let i = 0; i < 5; i++) {
      const carteX = zoneCardsDepartX + this.tileWidth / 1.75 + i * (this.tileWidth + spaceBetweenCards);
      const carteY = this.isMobile ? zoneCardsDepartY + this.tileHeight - 20 : this.tileHeight - 20; 

      this.ctx.fillStyle = "#008bf8";
      this.ctx.fillRect(carteX, carteY, this.tileWidth, this.tileHeight);

      this.ctx.strokeStyle = "#000000";
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(carteX, carteY, this.tileWidth, this.tileHeight);
    }

    // Cartes du Joueur 2
    for (let i = 0; i < 5; i++) {
      const carteX = zoneCardsDepartX + this.tileWidth / 1.75 + i * (this.tileWidth + spaceBetweenCards);
      const carteY = this.isMobile ? zoneCardsDepartY + (this.tileHeight * 2) + 45 : (this.tileHeight * 3) - 20; 

      this.ctx.fillStyle = "#008bf8";
      this.ctx.fillRect(carteX, carteY, this.tileWidth, this.tileHeight);

      this.ctx.strokeStyle = "#000000";
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(carteX, carteY, this.tileWidth, this.tileHeight);
    }
  }

  handleResize() {
    this.isMobile = window.innerWidth < 600;
    this.setCanvasSize();
    this.refresh();
  }

}


export default View;
