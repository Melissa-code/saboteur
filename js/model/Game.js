import GameStates from "./GameStates.js";
import { Card, CarteChemin } from "./Card.js";
import { CardFactory } from "./CardFactory.js";
import Directions from './Directions.js';

class Game {
  constructor() {
    this.width = 11;
    this.height = 7;
    this.matrix = this.initGame();

    const carteDepart = CardFactory.createCarteChemin("2222", "./images/cartes_chemin/2222.svg");
    this.matrix[3][0] = carteDepart;

    this.pioche = CardFactory.shuffleCartes()
   
    let cartesBut = this.selectionnerTroisCartesChemin() 
    this.matrix[1][10] = cartesBut[0]
    cartesBut[0].devoile = false; 
    this.matrix[3][10] = cartesBut[1]
    cartesBut[1].devoile = false; 
    this.matrix[5][10] = cartesBut[2]
    cartesBut[2].devoile = false; 

    console.table(this.matrix)
    this.tirerAuSortCarteTresor();
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

  selectionnerTroisCartesChemin() {
    let cartesBut = []; 
  
    for (let i = 0; i < this.pioche.length && cartesBut.length < 3; i++) {
      if (this.pioche[i] instanceof CarteChemin) {
        cartesBut.push(this.pioche[i]);
        this.pioche.splice(i, 1);
        i--;
      } 
    }

    console.log(cartesBut)
    return cartesBut; 
  }

  /**
   * @returns obj CarteChemin 
   */
  tirerAuSortCarteTresor() {
    const cartesBut = this.selectionnerTroisCartesChemin(); 
    let indexCarteTresor = 0; 

    for (let i = 0; i < cartesBut.length; i++) {
      indexCarteTresor = Math.floor(Math.random() * cartesBut.length);
    }

    console.log("N° carteTresor :", indexCarteTresor)//nb
    let carteTresor = cartesBut[indexCarteTresor]; 
    console.log("carte tresor", carteTresor)
    return carteTresor;  
  }

// faire un tirage au sort pour la carte trésor (add tresor dessus)
// mémoriser l'état 
// créer un espace plateau pour les joueurs (afficher les cartes)
// joueur: ses cartes, son état (bloqué ou non), role (saboteur )
}

export default Game;
