class View {
  // tileWidth:50 & tileHeight:70
  constructor(game, document, tileWidth, tileHeight) {
    this.game = game;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.myCanva = document.querySelector("#myCanvas");
    this.ctx = this.myCanva.getContext("2d");

    this.gameboardWidth = this.game.width * this.tileWidth;
    this.gameboardHeight = this.game.height * this.tileHeight; 
    this.espacementWidth = 2 * this.tileWidth;
    this.playerHandWidth = 7 * this.tileWidth;
    this.playerHandHeight = 4 * this.tileHeight;

    //this.myCanva.width = this.gameboardWidth + this.espacementWidth + this.playerHandWidth;
    //this.myCanva.height = this.gameboardHeight + this.playerHandHeight;

    // mobile
    this.isMobile = window.innerWidth < 600;

    // zones 
    this.initializeZones();

    this.setCanvasSize();
    this.refresh();
  }

  /**
   * zones: gameboard , playersCards, player1Cards,  player2Cards , garbage 
   */
  initializeZones() {
    this.zones = {};
    
    //vertical
    if (this.isMobile) {
      //gameBoard
      this.zones.gameBoard = {
        x: 0,
        y: 0,
        width: this.gameboardWidth,
        height: this.gameboardHeight
      };
      
      //playerCards
      this.zones.playerCards = {
        x: 0,
        y: this.gameboardHeight + this.tileHeight/2,
        width: Math.max(this.gameboardWidth, this.playerHandWidth),
        height: this.playerHandHeight
      };
      
      //player1Cards
      this.zones.player1Cards = {
        x: this.zones.playerCards.x + this.tileWidth / 1.75,
        y: this.zones.playerCards.y + this.tileHeight - this.tileWidth / 2,
        width: 5 * (this.tileWidth + 10), // 5 cartes + espacement
        height: this.tileHeight
      };
      
      //player2Cards
      this.zones.player2Cards = {
        x: this.zones.playerCards.x + this.tileWidth / 1.75,
        y: this.zones.playerCards.y + (this.tileHeight * 2) + this.tileWidth,
        width: 5 * (this.tileWidth + 10),
        height: this.tileHeight
      };
      
      // garbage
      this.zones.garbage = {
        x: this.zones.playerCards.x,
        y: this.zones.player2Cards.y + this.tileHeight * 1.75,
        width: this.tileWidth,
        height: this.tileHeight
      };

    //horizontal (desktop)
    } else {
      // gameBoard
      this.zones.gameBoard = {
        x: 0,
        y: 0,
        width: this.gameboardWidth,
        height: this.gameboardHeight
      };
      
      // playerCards
      this.zones.playerCards = {
        x: this.gameboardWidth + this.espacementWidth,
        y: 0,
        width: this.playerHandWidth,
        height: Math.max(this.gameboardHeight, this.playerHandHeight)
      };
      
      // player1Cards
      this.zones.player1Cards = {
        x: this.zones.playerCards.x + this.tileWidth / 1.75,
        y: this.tileHeight - this.tileWidth / 2,
        width: 5 * (this.tileWidth + 10),
        height: this.tileHeight
      };
      
      // player2Cards
      this.zones.player2Cards = {
        x: this.zones.playerCards.x + this.tileWidth / 1.75,
        y: (this.tileHeight * 3) - this.tileWidth / 2,
        width: 5 * (this.tileWidth + 10),
        height: this.tileHeight
      };
      
      // garbage
      this.zones.garbage = {
        x: this.zones.playerCards.x,
        y: this.zones.player2Cards.y + this.tileHeight * 2,
        width: this.tileWidth,
        height: this.tileHeight
      };
    }
  }

  handleResize() {
    this.isMobile = window.innerWidth < 600;
    this.initializeZones();
    this.setCanvasSize();
    this.refresh();
  }

  // Mobile:vertical != Desktop:horizontal
  setCanvasSize() {
    if (this.isMobile) { 
      this.myCanva.width = Math.max(this.gameboardWidth, this.playerHandWidth);
      this.myCanva.height = this.gameboardHeight + this.espacementWidth * 3 + this.playerHandHeight;
    } else {
      this.myCanva.width = this.gameboardWidth + this.espacementWidth + this.playerHandWidth;
      this.myCanva.height = Math.max(this.gameboardHeight, this.playerHandHeight);
    }
  }

  refresh() {
    this.ctx.clearRect(0, 0, this.myCanva.width, this.myCanva.height);
    this.displayGrid();
    this.displayPlayersCards();
    this.displayGarbage();
  }

  displayGrid() {
    // zone
    const zone = this.zones.gameBoard;

    for (let y = 0; y < this.game.height; y++) {
      for (let x = 0; x < this.game.width; x++) {
        const drawX = zone.x + (x * this.tileWidth);
        const drawY = zone.y + (y * this.tileHeight);

        this.ctx.fillStyle = "#FFFFFF";
        // position x y & tileSize (width & height)
        this.ctx.fillRect(
          drawX, //x * this.tileWidth,
          drawY, //y * this.tileHeight,
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
                drawX, //x * this.tileWidth,
                drawY, //y * this.tileHeight,
                this.tileWidth,
                this.tileHeight
              );
            }
          } else {
            this.ctx.fillStyle = "#008bf8";
            this.ctx.fillRect(
              drawX, //x * this.tileWidth,
              drawY, //y * this.tileHeight,
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
    const zone = this.zones.playerCards;

    //const position = this.getCardsZonePosition(); // return x et y
    //const zoneCardsDepartX = position.x;
    //const zoneCardsDepartY = position.y;

    // zone des cartes joueurs
    this.ctx.fillStyle = "#FFFFFF"; 
    // this.ctx.fillRect(
    //   zoneCardsDepartX,          
    //   zoneCardsDepartY,                   
    //   this.isMobile ? this.gameboardWidth : this.playerHandWidth,
    //   this.playerHandHeight
    // );
    this.ctx.fillRect(zone.x, zone.y, zone.width, this.playerHandHeight);

    // joueurs
    this.ctx.fillStyle = "#000000";
    this.ctx.font = "18px Tagesschrift, arial";

    const textOffsetY = this.isMobile ? zone.y + this.tileWidth / 2 : this.tileWidth / 2;
    const textStartX = zone.x + this.tileWidth / 1.75;
    this.ctx.fillText("Cartes du Joueur 1", textStartX, textOffsetY);
    this.ctx.fillText("Cartes du Joueur 2", textStartX, textOffsetY + this.tileHeight * 2);

    this.drawPlayerCards(this.game.joueur1, this.zones.player1Cards);
    this.drawPlayerCards(this.game.joueur2, this.zones.player2Cards);
  }

  drawPlayerCards(joueur, zone) {
    const spaceBetweenCards = 10;
    
    for (let i = 0; i < 5; i++) {
      const carteX = zone.x + i * (this.tileWidth + spaceBetweenCards);
      const carteY = zone.y;
      this.ctx.fillStyle = "#FFFFFF";
      this.ctx.fillRect(carteX, carteY, this.tileWidth, this.tileHeight);
      
      if (joueur.cartes[i]) {
        const image = new Image();
        image.src = joueur.cartes[i].image;
        image.onload = () => {
          this.ctx.drawImage(image, carteX, carteY, this.tileWidth, this.tileHeight);
        }
      }
    }
  }

  getCardsZonePosition() {
    return this.isMobile 
      ? { x: 0, y: this.gameboardHeight + this.tileHeight/2 }
      : { x: this.gameboardWidth + this.espacementWidth, y: 0 };
  }

  // Cartes des Joueurs (5 cartes distribuées)
  // drawPlayerCards(joueur, startX, cardsY, spaceBetweenCards) {
  //   for (let i = 0; i < 5; i++) {
  //     const carteX = startX + i * (this.tileWidth + spaceBetweenCards);
    
  //     this.ctx.fillStyle = "#FFFFFF";
  //     this.ctx.fillRect(carteX, cardsY, this.tileWidth, this.tileHeight);

  //     this.ctx.strokeStyle = "#000000";
  //     this.ctx.lineWidth = 1;

  //     const image = new Image();
  //           image.src = joueur.cartes[i].image;
  //           image.onload = () =>{
  //             this.ctx.drawImage(
  //               image,
  //               carteX,
  //               cardsY,
  //               this.tileWidth,
  //               this.tileHeight
  //             );
  //           }
  //     this.ctx.drawImage(image, carteX, cardsY, this.tileWidth, this.tileHeight);
  //   }
  // }

  displayGarbage() {
    const zone = this.zones.garbage;
    
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.fillRect(zone.x, zone.y, zone.width, zone.height);
    
    this.ctx.strokeStyle = "#000000";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);
    
    this.ctx.fillStyle = "#000000";
    this.ctx.font = "12px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText("X", zone.x + zone.width/2, zone.y + zone.height/2 + 4);
  }

  identifierCible(x,y)
  {
    let typeCible = "exterieur"
    let reference = null;
    let x1, x2, y1, y2;
    // type String: matrice - joueur - corbeille (à créer)
    /*
      matrice => reference = position i,j dans la matrice
      joueur => reference = Num joeur, Num carte
      corbeille => null
    */

    // zone de matrice : (0,0) - (this.game.width*this.tileWidth,....)
    x1 = 0; 
    x2 = this.game.width * this.tileWidth;
    y1 = 0; 
    y2 = this.game.height * this.tileHeight;

    if (x > x1 && x < x2 && y > y1 && y < y2) {
      typeCible = "matrice"; 
      reference = [x/this.tileWidth, y/this.tileHeight]
    }

    //if ()

    /* 
    - utiliser des variables de positionnemnt relatif partout (ex: zone de depart x de espace cartes , zone Player 1, corbeille)
    - identifier cible à finir (joueur, num carte + corbeille (taille 1 card))
    - clic event -> identifier cible (log cible de x y)
    - enum de types cible (ajouter "extérieur")
    */


      return new Cible(typeCible,reference);
  }

}

export default View;
