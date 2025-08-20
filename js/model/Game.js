import GameStates from "./GameStates.js";
import { Card, CarteChemin, CarteAction } from './Card.js'; 
import { CardFactory } from "./CardFactory.js";
import Directions from './Directions.js';
import Player from './Player.js'; 
import Actions from './Actions.js'; 
import Cible from './Cible.js'; 
import TypesCibles from '../model/TypesCibles.js';

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
    this.tirerAuSortCarteTresor(cartesBut);

    this.joueurActuel = 1; 
    let roles = this.getRandomRole();
    this.joueur1 = new Player(1, roles[0]);
    this.joueur2 = new Player(2, roles[1]); 
   
    this.action1 = null;
    this.action2 = null;
    this.distribuerCartesJoueurs()
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

  getRandomRole() {
    const roles = ['Saboteur', 'Chercheur d\'or']; 
    const randomRoles = [];
    const indexRole = Math.floor(Math.random() * roles.length);
    const randomRole = roles[indexRole]; 

    randomRoles.push(randomRole)
    let indexRole2 = (indexRole +1) % 2;
    const randomRole2 = roles[indexRole2]; 
    randomRoles.push(randomRole2)

    return randomRoles;
  }

  passerAuJoueurSuivant() {
    // J1=0-> 0+1=1 : Divise 1 par 2 : 1/2=0 reste 1 (next joueur)->revient au 1er joueur après le dernier
    this.joueurActuelIndex = (this.joueurActuelIndex + 1) % this.roles.length;
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

    if (existeVoisinage) {
      this.matrix[y][x] = carteAPlacer;
      //console.log('Carte placée :', x, y);
    }

    return existeVoisinage;
  }

  /** 
   * @returns array[] d'objets CarteChemin
   */
  selectionnerTroisCartesChemin() {
    let cartesBut = []; 
  
    while (cartesBut.length < 3 && this.pioche.length > 0) {
      const carte = this.pioche.shift(); 

      if (carte instanceof CarteChemin) {
        cartesBut.push(carte);
      } else {
        this.pioche.push(carte);
      }
    }

    if (cartesBut.length < 3) {
      console.log("Pas assez de cartes chemin dans la pioche !");
    }

    return cartesBut; 
  }

  /**
   * @returns obj CarteChemin 
   */
  tirerAuSortCarteTresor(cartesBut) {
    const indexCarteTresor = Math.floor(Math.random() * cartesBut.length);
    let carteTresor = cartesBut[indexCarteTresor]; 
    carteTresor.ajouterTresor();

    return carteTresor;  
  }

  distribuerCartesJoueurs() {
    for (let i = 0; i < 5; i++) {
      // retire et retourne la derniere 
      this.joueur1.addCarte(this.pioche.pop())
      this.joueur2.addCarte(this.pioche.pop())
    }
  }

  notifierCible(cible) {
    if (cible.type === TypesCibles.EXTERIEUR) {
      console.log('clic en dehors des zones actives')
      return
    }

    if (this.action1 === null) {
      if (cible.type === TypesCibles.JOUEUR) {
        const [numJoueur, numCarte] = cible.reference;
        if (numJoueur === this.joueurActuel && numCarte !== -1) {
          this.action1 = cible;
          return;
        } else {
          console.log("premier clic n'est pas sur une carte du joueur courant.");
          return;
        }
      } else {
          console.log('premier clic hors de la zone des joueurs.')
          return
      }
    }

    // code pour traiter l'action 2
    if (cible.type === TypesCibles.CORBEILLE || cible.type === TypesCibles.MATRICE) {
      this.action2 = cible; 
      this.appliquerActions();
      return
    }

    if (cible.type === TypesCibles.JOUEUR) {
      if (cible.reference[0] !== this.joueurActuel) {
        this.action2 = cible; 
        this.appliquerActions();
        return
      }
    }
    
    console.log('clic incorrect');
  }

  changerTour() {
    const newJoueur = this.joueurActuel === 1 ? this.joueur2 : this.joueur1;
    console.log("A présent au tour du joueur " + newJoueur.id + " de jouer."); 
    this.joueurActuel = newJoueur.id;
  }

  appliquerActions() {
    const joueur = this.joueurActuel === 1 ? this.joueur1 : this.joueur2; 
    console.log("joueur courant ", joueur.id);
    
    //carte
    const [numJoueur, numCarte] = this.action1.reference;
    const carte = joueur.cartes[numCarte]; 
    
    console.log("nb de cartes avant jeu: ", joueur.cartes.length);
    joueur.removeCarte(numCarte);

    switch(this.action2.type) {
      case TypesCibles.MATRICE: 
        const [x, y] = this.action2.reference;
        const success = this.placerCarte(x, y, carte); 
        if (success) {
          console.log("carte placée: ", "x :" + x, "y :" + y)
        }
        else {
          console.log("impossible de placer la carte : ", "x :" + x, "y :" + y)
          joueur.addCarte(carte); // ajoute à pioche
        }
        break;

      case TypesCibles.JOUEUR: 
        const [numJoueurCible, numCarteCible] = this.action2.reference;
        const joueurCible = numJoueurCible === 1 ? this.joueur1 : this.joueur2; 

        if (carte instanceof CarteAction) {
          // bloquer joueur adv
          console.log("Carte jouée sur l'autre joueur ", joueurCible); 
        } else {
          console.log("Cette carte ne peut pas etre jouée sur le joueur ", joueurCible)
          joueur.addCarte(carte);
        }
        break;

      case TypesCibles.CORBEILLE:
        console.log("Carte dans la corbeille ", carte);
        break;

      case TypesCibles.EXTERIEUR:
        console.log("Carte en dehors des zones", carte);
        break;

      default:
        console.log("erreur pour appliquer une action", carte);
        break;
    }

    console.log("nb de cartes après jeu: ", joueur.cartes.length);

    this.changerTour();
    this.action1 = null;
    this.action2 = null;
  }


  // faire appliquerActions : jouer carte chemin sur la grille
  // changer le tour et neutraliser action 1 et 2 (mettre à null)

}

export default Game;
