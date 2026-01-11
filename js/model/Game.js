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
    this.pioche = CardFactory.generatePioche();
    this.partieTerminee = false;
  
    const carteDepart = CardFactory.createCarteChemin("2222", "./images/cartes_chemin/2222.svg");
    this.matrix[3][0] = carteDepart;
    this.cartesBut = this.selectionnerTroisCartesBut();
    this.matrix[1][10] = this.cartesBut[0];
    this.cartesBut[0].estDevoilee = false;
    this.matrix[3][10] = this.cartesBut[1];
    this.cartesBut[1].estDevoilee = false;
    this.matrix[5][10] = this.cartesBut[2];
    this.cartesBut[2].estDevoilee = false;

    this.joueurActuel = 1; 
    let roles = this.getRandomRole(2); //2 joueurs 
    this.joueur1 = new Player(1, roles[0]);
    this.joueur2 = new Player(2, roles[1]); 
    this.distribuerCartesJoueurs(); 
   
    this.action1 = null; // 1er clic (sélection carte/rotation carte)
    this.action2 = null; // 2e clic (sur cible)
  }


  /**
   * Initialise une matrice vide pour le plateau de jeu
   * tableau à 2D rempli de cases à null 
   * @returns {null[][]} Matrice vide
   */
  initGame() {
    let newMatrix = [];

    for (let y = 0; y < this.height; y++) {
      let row = [];
      for (let x = 0; x < this.width; x++) {
        row.push(null); //case vide === null
      }
      newMatrix.push(row);
    }
    return newMatrix; //matrix[y][x] 
  }


  /**
   * Recherche et extrait la carte "Croix" (carte de départ) de la pioche
   * Utilise le calcul de la somme des sorties tunnel(2+2+2+2 = 8)
   * @returns {CarteChemin|null} La carte croix trouvée, ou undefined si aucune n'existe.
   */
  tirerCarteCroix() {
    for (let i = 0; i < this.pioche.length; i++) {
      if (this.pioche[i] instanceof CarteChemin) {
        let somme = this.pioche[i].haut + this.pioche[i].bas + this.pioche[i].gauche + this.pioche[i].droite
        if (somme === 8) {
          let carteCroix = this.pioche[i]; 
          this.pioche.splice(i, 1); 
          return carteCroix;
        }
      }
    }
    console.error("Erreur : Il manque une carte en croix dans la pioche !");
    return null;
  }
  

  /**
   * Récupère 3 cartes buts: 2 normales + 1 croix trésor
   * @returns {CarteChemin[]} tableau de 3 cartes but
   */
  preparerTroisCartesBut() {
    let cartesBut = []; 

    while (cartesBut.length < 2 && this.pioche.length > 0) {
      const carte = this.pioche.shift();
      if (carte instanceof CarteChemin) {
        cartesBut.push(carte);
      } else {
        this.pioche.push(carte);
      }
    }

    let carteTresorEnCroix = this.tirerCarteCroix();
    if (carteTresorEnCroix) {
      carteTresorEnCroix.ajouterTresor();
      cartesBut.push(carteTresorEnCroix);
    } 

    return cartesBut;
  }

  /**
   * Sélectionne et retourne 3 cartes but mélangées
   * @returns {CarteChemin[]} tableau de 3 cartes but mélangées
   */
  selectionnerTroisCartesBut() {
    let cartesBut = this.preparerTroisCartesBut();

    // Mélange des cartes buts (Fisher-Yates)
    for (let i = cartesBut.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cartesBut[i], cartesBut[j]] = [cartesBut[j], cartesBut[i]];
    }
    return cartesBut;                   
  } 


  /**
   * Génère une liste de rôles équilibrée et les distribue aléatoirement (algorithme de Fisher-Yates)
   * @param {number} [nbJoueurs=2] par défaut 2
   * @returns {string[]} Un tableau de rôles mélangés
   */
  getRandomRole(nbJoueurs = 2) {
    // Initialisation des rôles (1 Saboteur, le reste en Chercheurs d'or)
    const roles = ['Saboteur'];
    for (let i = 1; i < nbJoueurs; i++) {
      roles.push('Chercheur d\'or');
    }

    // Mélange des rôles (tableau parcouru: échange chaque élément avec un autre au hasard)
    for (let i = roles.length - 1; i > 0; i--) { 
      const j = Math.floor(Math.random() * (i + 1));
      [roles[i], roles[j]] = [roles[j], roles[i]];
    }
    return roles;
  }


  /**
   * Distribue 5 cartes à chaque joueur au début de la partie
   */
  distribuerCartesJoueurs() {
    for (let i = 0; i < 5; i++) {
      // retire et retourne la derniere (!= shift() )
      this.joueur1.addCarte(this.pioche.pop())
      this.joueur2.addCarte(this.pioche.pop())
    }
  }


  /**
   * Change de joueur 
   */
  changerTour() {
    const newJoueur = this.joueurActuel === 1 ? this.joueur2 : this.joueur1;
    this.joueurActuel = newJoueur.id;

    this.dispatchEvent(new CustomEvent("showPlayerTurn", {
      detail: `C'est au tour du joueur ${newJoueur.id} de jouer.`
    }));
  }


  /**
   * Affiche un message dans la vue
   * @param {string} text - Le texte du message
   * @param {string} color - La couleur du message
   */
  afficherMessage(text, color = 'black') {
    this.dispatchEvent(new CustomEvent("message", {
      detail: { text, color }
    }));
  }


  /**
   * Vérifie les cartes voisines connectées à la carte aux coordonnées (x, y)
   * @returns {Array} Tableau des coordonnées [y, x] des cartes voisines connectées
   */
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

    return cartesAParcourir;
  }


  /**
   * Recherche récursive d'un chemin entre la carte départ matrix[3][0] et la carte trésor 
   * recherche d'un tunnel continu pour déterminer si le joueur a gagné 
   * carte.estVisitee = true -> eviter boucles infinies
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

    // pour chaque voisine connectée, appel récursif de parcourir()
    for (let i = 0; i < cartesAParcourir.length; i++) {
      const voisinCoordonnees = cartesAParcourir[i];
      const voisinY = voisinCoordonnees[0];
      const voisinX = voisinCoordonnees[1];
      
      if (this.parcourir(voisinY, voisinX)) {
        carte.cheminVictoire = true;
        return true;
      }
    }

    return false;
  }


  /**
   * Réinitialise les marqueurs estVisitee et cheminVictoire pour toutes les cartes du plateau jeu
   */
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
   * Vérifie si le joueur a atteint le trésor depuis la case de départ
   */
  verifierVictoire() {
    if (this.parcourir(3, 0) === true) {
      this.afficherMessage("Gagné ! ✌️🏆", 'green');
      this.partieTerminee = true;
      return true;
    } else {
      this.reinitialiserMarqueurs(); 
      return false;
    }
  }


  /**
   * Vérifie la validité de la connexion physique entre deux cartes adjacentes
   * connexion valide si 2 faces en contact possèdent un tunnel (valeur !== 0 - impossible de placer mur contre mur)
   * @returns {boolean} True si les deux tunnels se rejoignent, false s'il y a un mur (0)
   */
  verifierConnexion(carteGrille, coteCarteGrille, carteAPlacer, coteCarteAPlacer) {
    return carteGrille[coteCarteGrille] !== 0 && carteAPlacer[coteCarteAPlacer] !== 0;
  }

  
  /**
   * Dévoile une carte but si une carte chemin connectée est placée à côté
   * Rappel: this.cartesBut[[1,10], [3,10], [5,10]]: y 1,3,5 et x 10
   * tunnel 1 et 2 (0: mur)
  **/
  testRevelerCarteBut() {
    for(let y = 1; y <= 5; y = y + 2) {
      let carteBut = this.matrix[y][10];
      if (carteBut.estDevoilee === true) continue; //passe à la suivante si dévoilée

      // carte à gauche
      if (this.matrix[y][9] !== null) {
        if (this.matrix[y][9].droite !== 0) {
          this.matrix[y][10].estDevoilee = true;
          this.dispatchEvent(new Event("change"));//afficher la carte
          continue;
        }
      }
      // carte en haut
      if (this.matrix[y - 1][10] !== null) {
        if (this.matrix[y - 1][10].bas !== 0) {
          this.matrix[y][10].estDevoilee = true;
          this.dispatchEvent(new Event("change"));
          continue;
        }
      }
      // carte en bas
      if (this.matrix[y + 1][10] !== null) {
        if (this.matrix[y + 1][10].haut !== 0) {
          this.matrix[y][10].estDevoilee = true;
          this.dispatchEvent(new Event("change"));
          continue;
        }
      }
    }
  }


  /**
   * Vérifie la disponibilité de la case, la validité des connexions avec les cartes voisines - au moins une liaison entre les tunnels existe (pas de zone isolée sur plateau jeu)
   * et déclenche la vérification de victoire si le placement réussi
   * @returns {boolean} True si la carte a été placée avec succès, false sinon
   */
  placerCarte(x, y, carteAPlacer) {
    if (this.partieTerminee) {
      this.afficherMessage('La partie est terminée ! 😢', 'red');
      return false;
    }  

    if (this.matrix[y][x] != null) {
      this.afficherMessage('Cette case est déjà occupée', 'red');
      return false;
    }

    // au moins une voisine existe + connexion entre les 2 cartes pour toutes les cartes dévoilées
    let existeVoisinage = false; 
    let connexionCartes = false;
    
    // Pour voisine (carteGrille CarteChemin) de droite 
    if ((x + 1) < this.width && this.matrix[y][x + 1] !== null && this.matrix[y][x + 1].estDevoilee === true) {
      let carteGrille = this.matrix[y][x + 1];
      if (!carteGrille.accepterVoisine(carteAPlacer, Directions.GAUCHE)) return false;
      if (this.verifierConnexion(carteGrille, 'gauche', carteAPlacer, 'droite')) connexionCartes = true;
      existeVoisinage = true
    } 
    // Pour voisine (carteGrille) de gauche
    if ((x >= 1) && this.matrix[y][x - 1] !== null && this.matrix[y][x - 1].estDevoilee === true) {
      let carteGrille = this.matrix[y][x - 1];
      if (!carteGrille.accepterVoisine(carteAPlacer, Directions.DROITE)) {console.log("false");return false}; 
      if (this.verifierConnexion(carteGrille, 'droite', carteAPlacer, 'gauche')) connexionCartes = true;
      existeVoisinage = true;
    }
    // Pour voisine (carteGrille) du haut
    if ((y >= 1) && this.matrix[y - 1][x] !== null && this.matrix[y - 1][x].estDevoilee === true) {
      let carteGrille = this.matrix[y - 1][x];
      if (!carteGrille.accepterVoisine(carteAPlacer, Directions.BAS)) return false;
      if (this.verifierConnexion(carteGrille, 'bas', carteAPlacer, 'haut')) connexionCartes = true;
      existeVoisinage = true
    }
    // Pour voisine (carteGrille) du bas
    if ((y + 1) < this.height && this.matrix[y + 1][x] !== null && this.matrix[y + 1][x].estDevoilee === true) {
      let carteGrille = this.matrix[y + 1][x];
      if (!carteGrille.accepterVoisine(carteAPlacer, Directions.HAUT)) return false;
      if (this.verifierConnexion(carteGrille, 'haut', carteAPlacer, 'bas')) connexionCartes = true;
      existeVoisinage = true
    }

    if (existeVoisinage && connexionCartes) {
      this.matrix[y][x] = carteAPlacer;
      this.testRevelerCarteBut();
      this.verifierVictoire();
      return true;
    }
    
    return false; // échec placement
  }


  /**
   * récupère la carte sélectionnée du joueur courant (1er clic)
   */
  getCarteSelectionnee() {
    return this.action1; //sélection carte ou rotation carte
  }


  /**
   * Gère la rotation de la carte sélectionnée du joueur courant (re-clic sur la même carte - action1) 
   */
  gererRotation(joueur, numCarte) {
    const carte = joueur.cartes[numCarte];

    if (carte instanceof CarteChemin) {
      carte.rotation();
      this.dispatchEvent(new Event("change")); // pour que carte se redessine
    }
  }


  /**
   * Gère le premier clic du joueur (sélection carte/rotation carte)
   * @param {Object} cible - cible (clic dans zone joueur) 
   */
  gererPremierClic(cible) {
    if (cible.type !== TypesCibles.JOUEUR) {
      this.afficherMessage(`Clic incorrect: en dehors de la zone des joueurs.`, `red`);
      return;
    }

    const [numJoueur, numCarte] = cible.reference;
    if (numJoueur === this.joueurActuel && numCarte !== -1) {
      this.action1 = cible; // Sélection réussie
      this.dispatchEvent(new Event("change")); // montrer quelle carte est choisie
    } else {
      this.afficherMessage(`C'est au joueur ${this.joueurActuel} de jouer.`, `red`);
    }
  }


  /**
   * Gère le deuxième clic du joueur (action2)
   * @param {Object} cible - cible (clic dans zone joueur/adversaire/corbeille/matrice)
   */
  gererDeuxiemeClic(cible) {
    // cible: CORBEILLE ou MATRICE
     if (cible.type === TypesCibles.CORBEILLE || cible.type === TypesCibles.MATRICE) {
      this.action2 = cible; 
      this.appliquerActions();
      return
    }

    // cible: JOUEUR (soi-même ou adversaire)
    if (cible.type === TypesCibles.JOUEUR) {
      const [numJoueurCible, numCarteCible] = cible.reference; //[numJoueur, numCarte]
      const [numJoueurAction1, numCarteAction1] = this.action1.reference;

      // rotation: Re-clic sur la même carte (ne pas appliquerActions())
      if (numJoueurAction1 === numJoueurCible && numCarteAction1 === numCarteCible) {
        const joueurCourant = this.joueurActuel === 1 ? this.joueur1 : this.joueur2; 
        this.gererRotation(joueurCourant, numCarteAction1);
        return; 
      }

      // Changement de sélection: clic sur une autre carte de son propre jeu
      if (numJoueurAction1 === numJoueurCible && numCarteAction1 !== numCarteCible) {
        const [, numCarte] = cible.reference;
          if (numCarte !== -1) {
              this.action1 = cible; // mise à jour de carte sélectionnée
              this.dispatchEvent(new Event("change"));//surbrillance carte sélectionnée
              return;
          }
      }

      // Action sur adversaire (casser outil)
      if (numJoueurCible !== this.joueurActuel) {
        this.action2 = cible; 
        this.appliquerActions();
        return;
      }

      // Action sur soi-même: (réparer outil)
      if (numJoueurCible === this.joueurActuel) {
        // identifier carte jouée 
        const joueur = this.joueurActuel === 1 ? this.joueur1 : this.joueur2;
        const [, numCarte] = this.action1.reference;
        const carte = joueur.cartes[numCarte];
      
        if (carte instanceof CarteAction && carte.estCarteReparation()) {
          this.action2 = cible;
          this.appliquerActions();
          return;
        }
      }
    }
  } 


  /**
   * Gère le clic du joueur en fonction de l'état actuel des actions (action1: 1er clic et action2: 2e clic)
   * @param {Object} cible - cible (clic dans zone joueur/adversaire/corbeille/matrice)
   */
  notifierCible(cible) {
    if (cible.type === TypesCibles.EXTERIEUR) {
      this.afficherMessage(`Veuillez cliquer dans une zone valide du jeu.`, `red`);
      return;
    }

    if (this.action1 === null) {
      this.gererPremierClic(cible);
    } else {
      this.gererDeuxiemeClic(cible);
    }
  }

 
  appliquerActions() {
    const joueur = this.joueurActuel === 1 ? this.joueur1 : this.joueur2; 
    //Récupère la carte à jouer
    const [, numCarte] = this.action1.reference;
    const carte = joueur.cartes[numCarte]; 
    let success = false; 

    switch(this.action2.type) {
      case TypesCibles.MATRICE: 
        const [x, y] = this.action2.reference;

        if (joueur.cartesBloquantes.length !== 0) break; // joueur bloqué ne peut pas placer de carte chemin ou action

        // DETRUIRE carte chemin
        if (carte instanceof CarteAction) {
          if (carte.titreAction === Actions.DETRUIT_CARTE_CHEMIN) {
            const positionsCartesBloquees = [[3,0], [1, 10], [3, 10], [5,10]]; // d'office: carte départ + 3 cartes buts
            let incorrect = false

            // pas destruction des cartes obligatoires deja en place 
            for (let position of positionsCartesBloquees) {
              if(position[0] === y && position[1] === x) {
                incorrect = true;
                console.log("Impossible de détruire cette carte obligatoire déjà en place.")
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

  
}

export default Game;