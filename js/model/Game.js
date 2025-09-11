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
   
    this.cartesBut = this.selectionnerTroisCartesChemin()
    this.matrix[1][10] = this.cartesBut[0]
    this.cartesBut[0].devoile = false;
    this.matrix[3][10] = this.cartesBut[1]
    this.cartesBut[1].devoile = false;
    this.matrix[5][10] = this.cartesBut[2]
    this.cartesBut[2].devoile = false;
    this.tirerAuSortCarteTresor(this.cartesBut);

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

    console.log("carte trésor: ", carteTresor)

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

    // code pour traiter l'action 2 (2e clic)
    if (cible.type === TypesCibles.CORBEILLE || cible.type === TypesCibles.MATRICE) {
      this.action2 = cible; 
      this.appliquerActions();

      return
    }


    if (cible.type === TypesCibles.JOUEUR) {
    const [numJoueurCible, numCarteCible] = cible.reference; //[numJoueur, numCarte]

    // Si cible est un autre joueur
    if (numJoueurCible !== this.joueurActuel) {
      this.action2 = cible; 
      this.appliquerActions();

      return;
    }

    // Si cible est soi-même: uniquement si la carte est réparation
    if (numJoueurCible === this.joueurActuel) {
      // identifier carte jouée 
      const joueur = this.joueurActuel === 1 ? this.joueur1 : this.joueur2;
      const [numJoueur, numCarte] = this.action1.reference;
      const carte = joueur.cartes[numCarte];
    
      if (carte instanceof CarteAction && carte.estCarteReparation()) {
        this.action2 = cible;
        this.appliquerActions();

        return;
      }
    }
  }

    console.log('clic incorrect');
  }

  // action1 contient la cible de la carte sélectionnée
  getCarteSelectionnee() {
    return this.action1; 
  }

  changerTour() {
    const newJoueur = this.joueurActuel === 1 ? this.joueur2 : this.joueur1;
    console.log("A présent au tour du joueur " + newJoueur.id + " de jouer."); 
    this.joueurActuel = newJoueur.id;
  }

  appliquerActions() {
    const joueur = this.joueurActuel === 1 ? this.joueur1 : this.joueur2; 
    console.log("joueur courant : ", joueur.id);
    let success = false; 

    //carte
    const [numJoueur, numCarte] = this.action1.reference;
    const carte = joueur.cartes[numCarte]; 
  
    switch(this.action2.type) {
      case TypesCibles.MATRICE: 
        const [x, y] = this.action2.reference;

        if (joueur.cartesBloquent.length !== 0) {
          break; 
        }

        // détruit carte chemin 
        if (carte instanceof CarteAction) {
          if (carte.titreAction === Actions.DETRUIT_CARTE_CHEMIN) {
            const positionsCartesBloquees = [[0,3], [10, 1], [10,3], [10,5]];
            let incorrect = false

            // pas destruction des cartes obligatoires deja en place 
            for (let position of positionsCartesBloquees) {
              if(position[0] === y && position[1] === x) {
                incorrect = true;
                console.log("carte détruit chemin sur carte ")
                break;
              }
            }
           
            // sic ase vide
            if (this.matrix[y][x] === null) {
              console.log("carte détruit chemin sur aucune carte")
              incorrect = true;
            }

            // si possible qu’il y avait bien une carte
            if (incorrect)
              break;
            else {
              this.matrix[y][x] = null; 
              console.log("carte détruit carte chemin :SUCCESS", this.matrix[y][x])
              success = true; 
              break;
            }
            
          }
        }

        // Regarde Carte but 
        if (carte instanceof CarteAction) {
          if (carte.titreAction === Actions.REGARDER_CARTE_BUT) {
            console.log(Actions.REGARDER_CARTE_BUT + 'ici :' + ' ' + x +' '+ y)
            // cartes qui peuvent etre vues 
            const positionsCartesBut = [[10, 1], [10,3], [10,5]];
            //let correct = false;

            // voir 3 cartes but deja en place 
            for (let position of positionsCartesBut) {
              if (position[0] === x && position[1] === y) {
                success = true;
                // appliquer l'action oeil 
                this.matrix[y][x].devoile = true;

                setTimeout(()=> {
                  this.matrix[y][x].devoile = false; 
                }, 3000);

                console.log("voir la carte but ", "x: "+x, " y: "+y);
                console.log("carte but image :", this.matrix[y][x].image)
                break;
              }
            }
            break;
          }
        } 

        success = this.placerCarte(x, y, carte); 
        
        if (success) {
          console.log("carte placée: ", "x :" + x, "y :" + y)
        }
        else {
            console.log("impossible de placer la carte : ", "x :" + x, "y :" + y)
          }
        
        break;

      case TypesCibles.JOUEUR: 
        const [numJoueurCible, numCarteCible] = this.action2.reference;
        const joueurCible = numJoueurCible === 1 ? this.joueur1 : this.joueur2; 

        if (carte instanceof CarteAction) {

          console.log(
            "joueur courant:", joueur.id,
            "joueur cible:", numJoueurCible,
            "carte:", carte
          );
 
          // bloquer joueur adv
          if (carte.estCarteBloquante()) {
            // Bloquer uniquement l'autre joueur
            if (carte.estCarteBloquante()) {
              if (joueur.id === numJoueurCible) {
                console.log("Impossible de se bloquer soi-même !");
              } else {
                let bloque = joueurCible.addCarteBloquante(carte);
                if (bloque) {
                  success = true;
                } else {
                  console.log("Cette carte bloquante ne peut pas être jouée sur le joueur ", joueurCible.id);
                }
              }
            }
          }
          if (success) {
            console.log("Carte bloquante jouée sur l'autre joueur a fonctionné", joueurCible.id); 
          } else {
            console.log("Cette carte bloquante ne peut pas etre jouée sur le joueur ", joueurCible.id)
          }

          // débloquer joueur (joueur 1 doit pouvoir jouer sur lui-meme)
          if (carte.estCarteReparation()) {
            console.log("Tentative de réparation:", carte.titreAction, "sur joueur", joueur.id);
           
            let debloque = joueurCible.removeCarteBloquante(carte); 
            if (debloque) {
              console.log("Carte débloquante a fonctionné sur le joueur ", joueur.id);
              success = true;
            } else {
              console.log("Aucune carte bloquante à retirer pour le joueur ", joueur.id);
            }
          
          }
        }
        break;

      case TypesCibles.CORBEILLE:
        success = true; 
        console.log("Carte dans la corbeille ", carte);
        break;

      case TypesCibles.EXTERIEUR:
        console.log("Carte en dehors des zones", carte);
        break;

      default:
        console.log("erreur pour appliquer une action", carte);
        break;
    }

    if (success) {
      joueur.removeCarte(numCarte);
      this.changerTour();
      joueur.addCarte(this.pioche.pop());

    }

    this.action1 = null;
    this.action2 = null;
  }

  // ne pas afficher la carte bleue la détruire par la carte action faite pour
  // arranger le visuel 
  // faire carte voir : dévoilée 2s
  // corriger ne peut pas placer carte sur 1re 

  // afficher trésor 
  // chemin correct et gagné (jusque trésor)
}

export default Game;
