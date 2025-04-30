import GameStates from './GameStates.js'; 

class Game {
  constructor() {
    this.width = 11;
    this.height = 7; 
    this.matrix = this.initGame(); 
  }

  initGame() {
    let newMatrix = [];

    for (let y = 0; y < this.height; y++) {
      let row = [];
      for (let x = 0; x < this.width; x++) {
        row.push(0); //case vide: 0
      }
      newMatrix.push(row);
    }

    return newMatrix;
  }

}

export default Game;
