import Directions from './enums/Directions.js';
import Actions from './enums/Actions.js'; 
import TypesCibles from './enums/TypesCibles.js';
import Player from './Player.js'; 
import CarteChemin from './cards/CarteChemin.js'; 
import CarteAction  from './cards/CarteAction.js'; 
import CardFactory from './cards/CardFactory.js'; 


class Game extends EventTarget {
  constructor() {
    super(); 
    this.width = 11;
    this.height = 7;
    this.matrix = this.initGame();
  
    const carteDepart = CardFactory.createCarteChemin("2222", "./images/cartes_chemin/2222.svg");
    this.matrix[3][0] = carteDepart;

    this.pioche = CardFactory.generatePioche()
   
    this.cartesBut = this.selectionnerTroisCartesBut()
    this.matrix[1][10] = this.cartesBut[0]
    this.cartesBut[0].estDevoilee = false;
    this.matrix[3][10] = this.cartesBut[1]
    this.cartesBut[1].estDevoilee = false;
    this.matrix[5][10] = this.cartesBut[2]
    this.cartesBut[2].estDevoilee = false;

    this.joueurActuel = 1; 
    let roles = this.getRandomRole();
    this.joueur1 = new Player(1, roles[0]);
    this.joueur2 = new Player(2, roles[1]); 
   
    this.action1 = null; // 1er clic (sélection carte/rotation)
    this.action2 = null; // 2e clic (sur cible)
    this.distribuerCartesJoueurs()
  }

  initGame() {
    let newMatrix = [];
    for (let y = 0; y < this.height; y++) {
      let row = [];
      for (let x = 0; x < this.width; x++) {
        row.push(null); //case vide: null
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
    const indexRole2 = (indexRole +1) % 2;
    const randomRole2 = roles[indexRole2];

    randomRoles.push(randomRole)
    randomRoles.push(randomRole2)

    return randomRoles;
  }

  passerAuJoueurSuivant() {
    // J1=0-> 0+1=1 : Divise 1 par 2 : 1/2=0 reste 1 (next joueur)->revient au 1er joueur après le dernier
    this.joueurActuelIndex = (this.joueurActuelIndex + 1) % this.roles.length;
  }

  afficherMessage(text, color = 'black') {
    this.dispatchEvent(new CustomEvent("message", {
      detail: { text, color }
    }));
  }

  /**
   * Vérifie si 2 cartes ont une connexion de tunnel
   * Les deux côtés en contact doivent avoir un tunnel (valeur !== 0)
   * Empêche de placer deux cartes "dos à dos" (mur contre mur sans connexion)
   */
  verifierConnexion(carteGrille, coteCarteGrille, carteAPlacer, coteCarteAPlacer) {
    return carteGrille[coteCarteGrille] !== 0 && carteAPlacer[coteCarteAPlacer] !== 0;
  }

  /**
   * Respecte les contraintes tunnel-tunnel(2-2)/ tunnel-impasse(2-1)/ mur-mur(0-0) 
   * Au moins une liaison entre les tunnels existe (pas de zone isolée sur plateau jeu)
   */
  placerCarte(x, y, carteAPlacer) {

    if (this.matrix[y][x] != null) {
      this.afficherMessage('La case est déjà occupée', 'red');
      return false;
    }

    // au moins une voisine existe + connexion entre les 2 cartes pour toutes les cartes dévoilées
    let existeVoisinage = false; 
    let connexionCartes = false;
    
    // Pour voisine (carteGrille) de droite 
    if ((x + 1) < this.width && this.matrix[y][x + 1] != null && this.matrix[y][x + 1].estDevoilee === true) {
      let carteGrille = this.matrix[y][x + 1];
      if (!carteGrille.accepterVoisine(carteAPlacer, Directions.GAUCHE)) return false;
      if (this.verifierConnexion(carteGrille, 'gauche', carteAPlacer, 'droite')) connexionCartes = true;
      existeVoisinage = true
    } 
    // Pour voisine (carteGrille) de gauche
    if ((x >= 1) && this.matrix[y][x - 1] != null && this.matrix[y][x - 1].estDevoilee === true) {
      let carteGrille = this.matrix[y][x - 1];
      if (!carteGrille.accepterVoisine(carteAPlacer, Directions.DROITE)) {console.log("false");return false}; 
      if (this.verifierConnexion(carteGrille, 'droite', carteAPlacer, 'gauche')) connexionCartes = true;
      existeVoisinage = true;
    }
    // Pour voisine (carteGrille) du haut
    if ((y >= 1) && this.matrix[y - 1][x] != null && this.matrix[y - 1][x].estDevoilee === true) {
      let carteGrille = this.matrix[y - 1][x];
      if (!carteGrille.accepterVoisine(carteAPlacer, Directions.BAS)) return false;
      if (this.verifierConnexion(carteGrille, 'bas', carteAPlacer, 'haut')) connexionCartes = true;
      existeVoisinage = true
    }
    // Pour voisine (carteGrille) du bas
    if ((y + 1) < this.height && this.matrix[y + 1][x] != null && this.matrix[y + 1][x].estDevoilee === true) {
      let carteGrille = this.matrix[y + 1][x];
      if (!carteGrille.accepterVoisine(carteAPlacer, Directions.HAUT)) return false;
      if (this.verifierConnexion(carteGrille, 'haut', carteAPlacer, 'bas')) connexionCartes = true;
      existeVoisinage = true
    }

    if (existeVoisinage && connexionCartes) {
      this.matrix[y][x] = carteAPlacer;
      this.testRevelerCarteBut(); 

      // carte depart matrix[3][0]
      if (this.parcourir(3, 0) === true) {
        console.log("C'est gagné :) ")
         this.afficherMessage("C'est gagné :) ", 'green');
      } else {
        this.reinitialiserMarqueurs(); 
      }

      return true;
    }

    return false;
  }

  reinitialiserMarqueurs() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.matrix[y][x] !== null) {
          this.matrix[y][x].estVisitee = false; 
          this.matrix[y][x].cheminVictoire = false;
        }
      }
    }
  }

  /**
   * 
   * Rappel: this.cartesBut[[1,10], [3,10], [5,10]]
   * tunnel 1 et 2 (0: mur)
  **/
  testRevelerCarteBut() {
    for(let y = 1; y <= 5; y = y + 2) {
      let carteBut = this.matrix[y][10];
      if (carteBut.estDevoilee === true) continue; 

      //carte à gauche
      if (this.matrix[y][9] !== null) {
        if (this.matrix[y][9].droite !== 0) {
          this.matrix[y][10].estDevoilee = true;
          this.dispatchEvent(new Event("change"))
          continue;
        }
      }
      // carte en haut
      if (this.matrix[y - 1][10] !== null) {
        if (this.matrix[y - 1][10].bas !== 0) {
          this.matrix[y][10].estDevoilee = true;
          this.dispatchEvent(new Event("change"))
          continue;
        }
      }
      // carte en bas
      if (this.matrix[y + 1][10] !== null) {
        if (this.matrix[y + 1][10].haut !== 0) {
          this.matrix[y][10].estDevoilee = true;
          this.dispatchEvent(new Event("change"))
          continue;
        }
      }
    }
  }

  tirerCarteCroix() {
    for (let i = 0; i < this.pioche.length; i++) {
      if (this.pioche[i] instanceof CarteChemin) {
        let somme = this.pioche[i].haut + this.pioche[i].bas + this.pioche[i].gauche + this.pioche[i].droite
        if (somme === 8) {
          let carteCroix = this.pioche[i]; 
          this.pioche.splice(i,1)
          return carteCroix;
        }
      }
    }
  }

  /** 
   * @returns array[] d'objets CarteChemin
   */
  selectionnerTroisCartesBut() {
    let cartesBut = []; 
  
    while (cartesBut.length < 2 && this.pioche.length > 0) {
      const carte = this.pioche.shift(); 
      if (carte instanceof CarteChemin) {
        cartesBut.push(carte);
      } else {
        this.pioche.push(carte);
      }
    }

    let carteTresor = this.tirerCarteCroix(); 
    carteTresor.ajouterTresor();
    cartesBut.push(carteTresor)

    if (cartesBut.length < 3) {
      console.log("Pas assez de cartes chemin dans la pioche !");
    }
    const indexCarteTresor = Math.floor(Math.random() * cartesBut.length);
    let carte = cartesBut[indexCarteTresor]
    cartesBut[indexCarteTresor] = carteTresor
    cartesBut[2] = carte;
    return cartesBut; 
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

      this.dispatchEvent(new CustomEvent("message", {
        detail: {
          text: `Clic en dehors des zones actives.`,
          color: `red`
        }
      })); 
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

          this.dispatchEvent(new CustomEvent("message", {
            detail: {
              text: `Sélectionnez une carte du joueur courant.`, 
              color: `red`
            }
          })); 
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
      const [numJoueurAction1, numCarteAction1] = this.action1.reference;

      // rotation (ne pas appliquerActions() sélection)
      if (numJoueurAction1 === numJoueurCible && numCarteAction1 === numCarteCible) {
        const joueurCourant = this.joueurActuel === 1 ? this.joueur1 : this.joueur2; 
        const carteAJouer = joueurCourant.cartes[numCarteAction1];

        if (carteAJouer instanceof CarteChemin) {
          console.log(carteAJouer)
          carteAJouer.rotation();
        }
    
        // event pour que la Vue se redessine
        this.dispatchEvent(new Event("change"));

        return;
      }

      // 2e clic pour changer de carte sélectionnée 
      if (numJoueurAction1 === numJoueurCible && numCarteAction1 !== numCarteCible) {
        const [numJoueur, numCarte] = cible.reference;
          if (numCarte !== -1) {
              this.action1 = cible;
          }
      }

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
    this.joueurActuel = newJoueur.id;

    this.dispatchEvent(new CustomEvent("showPlayerTurn", {
      detail: `C'est au tour du joueur ${newJoueur.id} de jouer.`
    }));
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

        if (joueur.cartesBloquantes.length !== 0) {
          break; 
        }

        // détruit carte chemin 
        if (carte instanceof CarteAction) {
          if (carte.titreAction === Actions.DETRUIT_CARTE_CHEMIN) {
            const positionsCartesBloquees = [[3,0], [1, 10], [3, 10], [5,10]];
            let incorrect = false

            // pas destruction des cartes obligatoires deja en place 
            for (let position of positionsCartesBloquees) {
              if(position[0] === y && position[1] === x) {
                incorrect = true;
                console.log("Impossible de détruire cette carte obligatoire déjà en place ")
                break;
              }
            }
           
            // si case vide
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
                this.matrix[y][x].estDevoilee = true;

                setTimeout(()=> {
                  this.matrix[y][x].estDevoilee = false; 
                  this.dispatchEvent(new Event("change"))
                }, 3000);

                // console.log("voir la carte but ", "x: "+x, " y: "+y);
                // console.log("carte but image :", this.matrix[y][x].image)
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

  // array cartes pas vides seConnectent 
  verifierCartesVoisines(x, y) {
    let cartesAParcourir = [];
    let carte = this.matrix[y][x];

    // gauche 
    if (x > 0 && this.matrix[y][x -1] !== null) {
      let carteVoisine = this.matrix[y][x -1];
      if (carteVoisine.estVisitee == false && carte.seConnecter(carteVoisine, Directions.GAUCHE)) {
        cartesAParcourir.push([y, x-1])
      }
    }
    // droite
    if (x < this.width-1 && this.matrix[y][x +1] !== null) {
      let carteVoisine = this.matrix[y][x + 1];
      if (carteVoisine.estVisitee == false && carte.seConnecter(carteVoisine, Directions.DROITE)) {
        cartesAParcourir.push([y, x + 1])
      }
    }
    // haut
    if (y > 0 && this.matrix[y-1][x] !== null) {
      let carteVoisine = this.matrix[y-1][x];
      if (carteVoisine.estVisitee == false && carte.seConnecter(carteVoisine, Directions.HAUT)) {
        cartesAParcourir.push([y -1, x])
      }
    }
    // bas
    if (y < this.height - 1 && this.matrix[y + 1][x] !== null) {
      let carteVoisine = this.matrix[y + 1][x];
      if (carteVoisine.estVisitee == false && carte.seConnecter(carteVoisine, Directions.BAS)) {
        cartesAParcourir.push([y+1, x])
      }
    }

    console.log("Cartes a parcourir : ", cartesAParcourir)
    return cartesAParcourir;
  }

  /**
   * Recherche récursive d'un chemin entre la carte départ matrix[3][0] et la carte trésor (recherche d'un tunnel continu)
   * pour déterminer si le joueur a gagné 
   * carte.estVisitee = true; -> eviter boucles infinies
   */
  parcourir(y, x) {
    const carte = this.matrix[y][x]; 
    carte.estVisitee = true; 

    if (carte.tresor !== null) {
      carte.cheminVictoire = true;
      return true; 
    }

    // recuperer les coordonnées des cartes voisines si elles snt connectées: verifierCartesVoisines()
    const cartesAParcourir = this.verifierCartesVoisines(x, y); 

    //let cheminTrouve = false;
    // pour chaque voisine connectée, appel récursif de parcourir()
    for (let i = 0; i < cartesAParcourir.length; i++) {
      const voisinCoordonnees = cartesAParcourir[i];
      const voisinY = voisinCoordonnees[0];
      const voisinX = voisinCoordonnees[1];
      
      //cheminTrouve = cheminTrouve || this.parcourir(voisinY, voisinX); // true/false
      if (this.parcourir(voisinY, voisinX)) {
        carte.cheminVictoire = true;
        return true;
      }
    }

    //return cheminTrouve;
    return false;
  }

  // tester le parcours du jeu (avec impasses etc )
  // penser technique marquage (algo pour vue)

  // créer un attribut card: cheminVictoire = false 
  // dans parcourir() : si carte trésor trouvée alors cheminVictoire = true 
  // si voisin mene au tresor alors cheminVictoire = true 
  // reinitaliser cheminVictoire = false  avant nouveau parcours 
  // Vue : dans displayGrid: if cell.cheminVictoire === true alors bordure carte jaune (function)
}

export default Game;