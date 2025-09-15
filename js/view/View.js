import TypesCibles from '../model/TypesCibles.js';
import Cible from '../model/Cible.js';

class View {
  // tileWidth:50 & tileHeight:70
  constructor(game, document, tileWidth, tileHeight) {
    this.game = game;

    this.game.addEventListener("change", ()=> this.refresh()); 

    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.myCanva = document.querySelector("#myCanvas");
    this.ctx = this.myCanva.getContext("2d");

    this.gameboardWidth = this.game.width * this.tileWidth;
    this.gameboardHeight = this.game.height * this.tileHeight; 
    this.espacementWidth = 2 * this.tileWidth; // space width between gameboard & playerHand
    this.playerHandWidth = 7 * this.tileWidth;
    this.playerHandHeight = 4 * this.tileHeight;
    this.playerHandMarginX = this.tileWidth / 2;
    this.playerCardsSpacingX = ((this.playerHandWidth - 2 * this.playerHandMarginX) - 5 * this.tileWidth) / 4; // space between 5 player cards
    this.playerHandMarginY = this.tileHeight / 2 + this.playerCardsSpacingX;
    this.cardsRowsSpacingY = this.tileHeight * 2; // space between  player1Cards and player2Cards

    this.isMobile = window.innerWidth < 600;

    this.selectedCard = null; //joueurId: 1|2, index: 0..4 

    // zones 
    this.initializeZones();

    this.setCanvasSize();
    this.refresh();

    const cartesBut = this.game.cartesBut;
    console.log(cartesBut)

    //const carteButDevoilee = cartesBut[1];
    //this.drawCarteCheminWithTresor(carteButDevoilee, 3, 4)
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
        y: this.gameboardHeight + this.playerHandMarginY,
        width: this.playerHandWidth,
        height: this.playerHandHeight
      };
      
      //player1Cards
      this.zones.player1Cards = {
        x: 0,
        y: this.gameboardHeight + this.playerHandMarginY,
        width: this.playerHandWidth, 
        height: this.tileHeight
      };
      
      //player2Cards
      this.zones.player2Cards = {
        x: 0,
        y: this.zones.player1Cards.y + this.cardsRowsSpacingY,
        width: this.playerHandWidth, 
        height: this.tileHeight
      };
      
      // garbage
      this.zones.garbage = {
        x: 0,
        y: this.zones.playerCards.y + this.zones.playerCards.height + this.playerHandMarginY,
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
        height: this.playerHandHeight
      };
      
      // player1Cards
      this.zones.player1Cards = {
        x: this.zones.playerCards.x,
        y: 0,
        width: this.playerHandWidth, 
        height: this.playerHandHeight /2
      };
      
      // player2Cards
      this.zones.player2Cards = {
        x: this.zones.playerCards.x,
        y: this.zones.playerCards.y + this.playerHandHeight /2,
        width: this.playerHandWidth, 
        height: this.playerHandHeight /2
      };
      
      // garbage
      this.zones.garbage = {
        x: this.zones.playerCards.x,
        y: this.zones.playerCards.y + this.zones.playerCards.height + this.cardsRowsSpacingY,
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
      this.myCanva.width = this.gameboardWidth;
      this.myCanva.height = this.gameboardHeight + this.playerHandHeight + this.cardsRowsSpacingY + this.playerHandMarginY;
    } else {
      this.myCanva.width = this.gameboardWidth + this.espacementWidth + this.playerHandWidth;
      this.myCanva.height = this.gameboardHeight;
    }
  }

  refresh() {
    this.ctx.clearRect(0, 0, this.myCanva.width, this.myCanva.height);
    this.displayGrid();
    this.displayPlayersCards();
    this.displayGarbage();
  }

  displayGrid() {
    const zone = this.zones.gameBoard;

    for (let y = 0; y < this.game.height; y++) {
      for (let x = 0; x < this.game.width; x++) {
        const drawX = zone.x + (x * this.tileWidth);
        const drawY = zone.y + (y * this.tileHeight);
        this.ctx.fillStyle = "#FFFFFF";
        // position x y & tileSize (width & height)
        this.ctx.fillRect(
          drawX,
          drawY, 
          this.tileWidth,
          this.tileHeight
        );

        const cell = this.game.matrix[y][x];

        if (cell !== null) {
          if (cell.devoile === true) {
            // carte trésor ?
            if (this.isCarteTresor(cell)) {
              this.drawCarteCheminWithTresor(cell, x, y)

            // image de carte
            } else {
              const image = new Image();
              image.src = cell.image;
              image.onload = () => {
                this.ctx.drawImage(image, drawX, drawY, this.tileWidth, this.tileHeight);
              }
            };

          // carte retournée
          } else {
            this.ctx.fillStyle = "#008bf8";
            this.ctx.roundRect(
              drawX,
              drawY, 
              this.tileWidth,
              this.tileHeight,
              10
            );
            this.ctx.fill(); 
          }
        } 

        // this.matrix[y][x] === null
        else {
          this.ctx.fillStyle = "#FFFFFF"; 
          this.ctx.fillRect(
            drawX,
            drawY, 
            this.tileWidth,
            this.tileHeight
          );
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

  isCarteTresor(carte) {
    //checker si cartesbut 
    if (!this.game.cartesBut) return false;

    for (const carteBut of this.game.cartesBut) {        
      if (carteBut === carte && carteBut.tresor === "./images/treasure.svg") {
        return true;
      } 
    }
    
    return false;
  }

  drawCarteCheminWithTresor(carteButDevoilee, x, y) {
    const drawX = this.zones.gameBoard.x + (x * this.tileWidth);
    const drawY = this.zones.gameBoard.y + (y * this.tileHeight);

    const image = new Image();
    image.src = carteButDevoilee.image; 
    image.onload = ()=> {
      this.ctx.drawImage(image, drawX, drawY, this.tileWidth, this.tileHeight); 
      this.drawTresor(drawX, drawY)
    }
  }

  drawTresor(x, y) {
    const tresorSize = this.tileHeight/1.5; 
    const tresorX = x;
    const tresorY = y + 10; 
    const tresorImage = new Image();
    tresorImage.src = './images/treasure.svg';

    tresorImage.onload = () => {
        this.ctx.drawImage(tresorImage, tresorX, tresorY, tresorSize, tresorSize);
    };
  }

  isCarteSelectionnee(joueurId, indexCarte) {
    const carteSelectionnee = this.game.getCarteSelectionnee();
    if (!carteSelectionnee || carteSelectionnee.type !== TypesCibles.JOUEUR) {
      return false;
    }
    
    const [numJoueur, numCarte] = carteSelectionnee.reference;
    return numJoueur === joueurId && numCarte === indexCarte;
  }

  displayPlayersCards() {
    const zone = this.zones.playerCards;

    // zone des cartes joueurs
    this.ctx.fillStyle = "#FFFFFF"; 
    this.ctx.fillRect(zone.x, zone.y, zone.width, this.playerHandHeight);

    // label joueurs
    this.ctx.fillStyle = "#000000";
    this.ctx.font = "18px Tagesschrift, arial";

    const textDecalageY = this.isMobile ? zone.y + this.playerHandMarginY : this.playerHandMarginY - this.playerCardsSpacingX;
    const textStartX = zone.x + this.playerHandMarginX;
    this.ctx.fillText("Cartes du Joueur 1", textStartX, textDecalageY);
    this.ctx.fillText("Cartes du Joueur 2", textStartX, textDecalageY + this.playerHandHeight/2);
    // this.ctx.fillText("Cartes du Joueur 1", 650, 20);
    // this.ctx.fillText("Cartes du Joueur 2", 650, 150);

    this.drawPlayerCards(this.game.joueur1, this.zones.player1Cards);
    this.drawPlayerCards(this.game.joueur2, this.zones.player2Cards);
  }

  // cartes des joueurs 
  drawPlayerCards(joueur, zone) {
    for (let i = 0; i < 5; i++) {
      const carteX = zone.x + this.playerHandMarginX + i * (this.tileWidth + this.playerCardsSpacingX);
      const carteY = zone.y + this.playerHandMarginY ;
      
      this.ctx.fillStyle = "#FFFFFF";
      this.ctx.fillRect(carteX, carteY, this.tileWidth, this.tileHeight);
      
      if (joueur.cartes[i]) {
        const image = new Image();
        image.src = joueur.cartes[i].image;
        image.onload = () => {
          this.ctx.drawImage(image, carteX, carteY, this.tileWidth, this.tileHeight);
        }
      }

      // Bordure carte sélectionnée
      if (this.isCarteSelectionnee(joueur.id, i)) {
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = "gold";
        this.ctx.strokeRect(carteX - 2, carteY - 2, this.tileWidth + 4, this.tileHeight + 4);
      }

      joueur.cartesBloquent.forEach((carte, index) => {
        const carteX = zone.x + this.playerHandMarginX + index * (this.tileWidth/2 + this.playerCardsSpacingX);
        const carteY = zone.y + this.playerHandMarginY - this.tileHeight/2 - 10; // au-dessus

        const image = new Image();
        image.src = carte.image;
        image.onload = () => {
          this.ctx.drawImage(image, carteX, carteY, this.tileWidth/2, this.tileHeight/2);
        };
        
      }); 

    }
  }

  getCardsZonePosition() {
    return this.isMobile 
      ? { x: 0, y: this.gameboardHeight + this.playerHandMarginY }
      : { x: this.gameboardWidth + this.espacementWidth, y: 0 };
  }

  displayGarbage() {
    const zone = this.zones.garbage;
    
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.fillRect(zone.x, zone.y, zone.width, zone.height);

    this.ctx.fillStyle = "#000000";
    this.ctx.font = "18px Tagesschrift, arial";
    this.ctx.textAlign = "center"; 
    this.ctx.fillText("🗑️", zone.x + zone.width / 2, zone.y + zone.height / 2 + this.playerCardsSpacingX / 2);
  }

  isPointInZone(x, y, zone) {
    return x >= zone.x && y >= zone.y && x <= (zone.x + zone.width) && y <= (zone.y + zone.height)
  }

  getNumCartePlayerZone(x, y, zone, margeX, margeY, largeurCarte, hauteurCarte, espacement, nbCartes) {
    const decalageX = x - zone.x - margeX; //position de 1re carte 
    const decalageY = y - zone.y ;

    // clic avant cartes
    if (decalageX < 0) {
      return null;
    } 

    if (decalageY < margeY || decalageY > margeY + hauteurCarte) {
      return null;
    }

    const bloc = largeurCarte + espacement;//40 + 10 = 50
    const numCarte = Math.floor(decalageX / bloc);//65/50 = 1
    const reste = decalageX % bloc; // 65 % 50 = 15

    if (numCarte < 0 || numCarte >= nbCartes) return null;
    if (reste > largeurCarte) return null; // clic dans espace entre les cartes

    return numCarte;
  }

  identifierCible(x, y) {
    let typeCible = TypesCibles.EXTERIEUR;
    let reference = null;

    const gameBoardZone = this.zones.gameBoard;
    const player1CardsZone = this.zones.player1Cards; 
    const player2CardsZone = this.zones.player2Cards; 
    const garbageZone = this.zones.garbage; 

    if (this.isPointInZone(x, y, gameBoardZone)) {
      typeCible = TypesCibles.MATRICE;
      const matrixX = Math.floor((x - gameBoardZone.x) / this.tileWidth);
      const matrixY = Math.floor((y - gameBoardZone.y) / this.tileHeight);
      reference = [matrixX, matrixY];
    } 

    else if (this.isPointInZone(x, y, player1CardsZone)) {
      typeCible = TypesCibles.JOUEUR;
      const numCarte = this.getNumCartePlayerZone(
        x,
        y,
        player1CardsZone,
        this.playerHandMarginX,
        this.playerHandMarginY ,
        this.tileWidth,
        this.tileHeight,
        this.playerCardsSpacingX,
        5 
      );
      typeCible = TypesCibles.JOUEUR;
      if (numCarte !== null) {
        reference = [1, numCarte];
      } else {
       reference = [1, -1];
      } 
    } 

    else if (this.isPointInZone(x, y, player2CardsZone)) {
      typeCible = TypesCibles.JOUEUR;
      const numCarte = this.getNumCartePlayerZone(
        x,
        y,
        player2CardsZone,
        this.playerHandMarginX,
        this.playerHandMarginY,
        this.tileWidth,
        this.tileHeight,
        this.playerCardsSpacingX,
        5 
      );
      typeCible = TypesCibles.JOUEUR;
      if (numCarte !== null) {
        typeCible = TypesCibles.JOUEUR;
        reference = [2, numCarte];
      } else {
        reference = [2, -1];
      } 
    } 

    else if (this.isPointInZone(x, y, garbageZone)) {
        typeCible = TypesCibles.CORBEILLE;
        reference = null;
    }

    return new Cible(typeCible, reference);
  }


}

export default View;
