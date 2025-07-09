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


  handleResize() {
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
    const position = this.getCardsZonePosition(); // return x et y
    const zoneCardsDepartX = position.x;
    const zoneCardsDepartY = position.y;

    // zone des cartes joueurs
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
    const textOffsetY = this.isMobile ? zoneCardsDepartY + this.tileWidth / 2 : this.tileWidth / 2;
    const textStartX = zoneCardsDepartX + this.tileWidth / 1.75;
    this.ctx.fillText("Cartes du Joueur 1", textStartX, textOffsetY);
    this.ctx.fillText("Cartes du Joueur 2", textStartX, textOffsetY + this.tileHeight * 2);

    const spaceBetweenCards = 10;

    const cardStartX = zoneCardsDepartX + this.tileWidth / 1.75;

    // Cartes du Joueur 1
    const player1CardsY = this.isMobile ? zoneCardsDepartY + this.tileHeight - this.tileWidth / 2 : this.tileHeight - this.tileWidth / 2;
    this.drawPlayerCards(this.game.joueur1, cardStartX, player1CardsY, spaceBetweenCards);

    // Cartes du Joueur 2  
    const player2CardsY = this.isMobile ? zoneCardsDepartY + (this.tileHeight * 2) + this.tileWidth : (this.tileHeight * 3) - this.tileWidth / 2;
    this.drawPlayerCards(this.game.joueur2, cardStartX, player2CardsY, spaceBetweenCards);
  }

  getCardsZonePosition() {
    return this.isMobile 
      ? { x: 0, y: this.gameboardHeight + this.tileHeight/2 }
      : { x: this.gameboardWidth + this.espacementWidth, y: 0 };
  }

  // Cartes des Joueurs (5 cartes distribuées)
  drawPlayerCards(joueur, startX, cardsY, spaceBetweenCards) {
    for (let i = 0; i < 5; i++) {
      const carteX = startX + i * (this.tileWidth + spaceBetweenCards);
    
      this.ctx.fillStyle = "#FFFFFF";
      this.ctx.fillRect(carteX, cardsY, this.tileWidth, this.tileHeight);

      this.ctx.strokeStyle = "#000000";
      this.ctx.lineWidth = 1;

      const image = new Image();
            image.src = joueur.cartes[i].image;
            image.onload = () =>{
              this.ctx.drawImage(
                image,
                carteX,
                cardsY,
                this.tileWidth,
                this.tileHeight
              );
            }
      this.ctx.drawImage(image, carteX, cardsY, this.tileWidth, this.tileHeight);
    }
  }

}

export default View;
