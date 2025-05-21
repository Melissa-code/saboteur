import GameStates from './GameStates.js'; 
import { Card , CarteChemin } from './Card.js'; 

class Game {
  constructor() {
    this.width = 11;
    this.height = 7; 
    this.matrix = this.initGame(); 
    this.placeCard(0, 3, new CarteChemin(1, 1, 1, 1, "./images/croix.svg")); 
  }

  initGame() {
    let newMatrix = [];

    for (let y = 0; y < this.height; y++) {
      let row = [];
      for (let x = 0; x < this.width; x++) {
        row.push(null); //case vide:
      }
      newMatrix.push(row);
    }

    return newMatrix;
  }

  placeCard(x, y, cardImage) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.matrix[y][x] = cardImage;
    } else {
      console.log("Carte hors du j eu");
    }
  }

}

export default Game;
