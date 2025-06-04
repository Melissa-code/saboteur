import GameStates from "./GameStates.js";
import { Card, CarteChemin } from "./Card.js";
import { CardFactory } from "./CardFactory.js";
import Directions from './Directions.js';

class Game {
  constructor() {
    this.width = 11;
    this.height = 7;
    this.matrix = this.initGame();

    //const carteDepart = CardFactory.createCarteChemin("2020", "./images/croix.svg");
    const carteDepart = CardFactory.createCarteChemin("2222", "./images/cartes_chemin/2222.svg");

    const carte2 = CardFactory.createCarteChemin("0020", "./images/cartes_chemin/0020.svg");
    const carte3 = CardFactory.createCarteChemin("0002", "./images/cartes_chemin/0002.svg");
    
    const carte4 = CardFactory.createCarteChemin("0002", "./images/cartes_chemin/0002.svg");


    this.matrix[3][0] = carteDepart;

    this.placerCarte(1, 3, carte3);
    this.placerCarte(5, 3, carte4);
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



  placerCarte(x, y, carteAPlacer) {
    let existeVoisinage = false; 

    if (this.matrix[y][x + 1] != null) {
      let carteGrille = this.matrix[y][x + 1];
      if (!carteGrille.accepte_voisine(carteAPlacer, Directions["GAUCHE"])) 
        return false;
      existeVoisinage = true
    }
    if (this.matrix[y][x - 1] != null) {
      let carteGrille = this.matrix[y][x - 1];
      if (!carteGrille.accepte_voisine(carteAPlacer, Directions["DROITE"])) return false;
      existeVoisinage = true
    }
    if (this.matrix[y + 1][x] != null) {
      let carteGrille = this.matrix[y + 1][x];
      if (!carteGrille.accepte_voisine(carteAPlacer, Directions["HAUT"])) return false;
      existeVoisinage = true
    }
    if (this.matrix[y - 1][x] != null) {
      let carteGrille = this.matrix[y - 1][x];
      if (!carteGrille.accepte_voisine(carteAPlacer, Directions["BAS"])) return false;
      existeVoisinage = true
    }

    if(existeVoisinage) {
      this.matrix[y][x] = carteAPlacer;
      console.log('Carte placée :', x, y);
    }

    return existeVoisinage;
  }
}

export default Game;
