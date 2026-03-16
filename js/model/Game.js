import Directions from './enums/Directions.js';
import Actions from './enums/Actions.js'; 
import TypesCibles from './enums/TypesCibles.js';
import Player from './Player.js'; 
import CarteChemin from './cards/CarteChemin.js'; 
import CarteAction  from './cards/CarteAction.js'; 
import CardFactory from './cards/CardFactory.js'; 


class Game extends EventTarget {
  /**
   * Gère l'état des joueurs, le plateau de jeu (matrice) et les règles métier 
   * @extends EventTarget (.dispatchEvent(), .addEventListener() et .removeEventListener())
   */
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
  * Notifie la vue d'un événement message text à afficher
  * @param {string} code - Le code du message ou le texte brut
  * @param {string} type - Le type (error, success, info)
  */
  notifierEventMessage(message, type = 'info') {
    this.dispatchEvent(new CustomEvent("game-notification", {
      detail: { message, type }
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
    const joueurCourant = (this.joueurActuel === 1) ? this.joueur1 : this.joueur2;

    if (this.parcourir(3, 0) === true) {
      this.partieTerminee = true;
      // check le joueur gagnant: si le joueur est Saboteur message de défaite !=  message de victoire
      joueurCourant.role === 'Saboteur' ? this.notifierEventMessage("Perdu, vous êtes le Saboteur ! 😖😭", 'error') : this.notifierEventMessage("Gagné ! ✌️🏆", 'success');
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
    for(let y = 1; y <= 5; y += 2) {
      let carteBut = this.matrix[y][10];
      if (carteBut.estDevoilee === true) continue; //passe à la suivante si dévoilée

      // carte à gauche (tunnel droite)
      if (this.matrix[y][9] !== null && this.matrix[y][9].droite !== 0) {
            this.matrix[y][10].estDevoilee = true;
            this.dispatchEvent(new Event("change"));//afficher la carte (la retourner dans la vue)
            continue;
      }
      // carte en haut (tunnel bas)
      if (this.matrix[y - 1][10] !== null && this.matrix[y - 1][10].bas !== 0) {
            this.matrix[y][10].estDevoilee = true;
            this.dispatchEvent(new Event("change"));
            continue;
      }
      // carte en bas (tunnel haut)
      if (this.matrix[y + 1][10] !== null && this.matrix[y + 1][10].haut !== 0) {
            this.matrix[y][10].estDevoilee = true;
            this.dispatchEvent(new Event("change"));
            continue;
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
      this.notifierEventMessage('La partie est terminée ! 😖😭', 'error');
      return false;
    }  

    if (this.matrix[y][x] != null) {
      this.notifierEventMessage('Cette case est déjà occupée', 'error');
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
      if (!carteGrille.accepterVoisine(carteAPlacer, Directions.DROITE)) return false; 
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
      this.notifierEventMessage(`Clic incorrect: en dehors de la zone des joueurs.`, `error`);
      return;
    }

    const [numJoueur, numCarte] = cible.reference;
    if (numJoueur === this.joueurActuel && numCarte !== -1) {
      this.action1 = cible; // Sélection réussie
      this.dispatchEvent(new Event("change")); // montrer quelle carte est choisie
    } else {
      this.notifierEventMessage(`C'est au joueur ${this.joueurActuel} de jouer.`, `error`);
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
      this.notifierEventMessage(`Veuillez cliquer dans une zone valide du jeu.`, `error`);
      return;
    }

    if (this.action1 === null) {
      this.gererPremierClic(cible);
    } else {
      this.gererDeuxiemeClic(cible);
    }
  }

  /**
   * Détruit une carte chemin à la position (x, y) 
   */
  detruireCarteChemin(x, y) {
    const positionsCartesBloquees = [[3,0], [1, 10], [3, 10], [5,10]]; // d'office: carte départ + 3 cartes buts

    // Vérification destruire cartes obligatoires
    for (let position of positionsCartesBloquees) {
      if(position[0] === y && position[1] === x) {
        this.notifierEventMessage("Impossible de détruire cette carte.", "error");
        return false; 
      }
    }
          
    // Vérification détruire une case est vide
    if (this.matrix[y][x] === null) {
      this.notifierEventMessage("Il n'y a pas de carte à détruire ici.", "error");
      return false;
    }

    // Destruction réussie 
    this.matrix[y][x] = null; 
      this.notifierEventMessage("Carte chemin détruite avec succès !", "success");
      return true;
  }

  /**
   * Dévoile temporairement une carte but à la position (x, y)
   */
  regarderCarteBut(x, y) {
    // positions des cartes but
    const positionsCartesBut = [[1,10], [3,10], [5,10]];

    for (let position of positionsCartesBut) {
      if (position[0] === y && position[1] === x) {
        this.matrix[y][x].estDevoilee = true;

        setTimeout(()=> {
          this.matrix[y][x].estDevoilee = false; 
          this.dispatchEvent(new Event("change")); // afficher la carte (la retourner dans la vue)
        }, 3000);

        return true;
      }
    }

    this.notifierEventMessage("Cette carte n'est pas une carte but.", "error");
    return false;
  }
 

  /**
   * Applique une carte chemin ou carte action détruire/regarder sur la matrice 
   */
  appliquerSurMatrice(joueur, carte) {
    const [x, y] = this.action2.reference;

    // joueur bloqué: ne peut placer ni carte chemin ni carte action
    if (joueur.cartesBloquantes.length > 0) {
      this.notifierEventMessage("Bloqué ! Jetez une carte ou réparer un outil.", "error");
      return false;
    }

    if (carte instanceof CarteAction) {
      // Carte action: DETRUIRE chemins (bool)
      if (carte.titreAction === Actions.DETRUIT_CARTE_CHEMIN) {
        return this.detruireCarteChemin(x, y); 
      }
      // Carte action: REGARDER carte but (bool)
      if (carte.titreAction === Actions.REGARDER_CARTE_BUT) {
        return this.regarderCarteBut(x, y);
      }
    }

    // Si ce n'est pas une action, placer carte chemin
    return this.placerCarte(x, y, carte);
  }


  /**
   * Bloque l'adversaire 
   */
  bloquerJoueur(joueur, joueurCible, carte) {
    // Bloquer uniquement l'adversaire
    if (joueur.id === joueurCible.id) {
      this.notifierEventMessage("Impossible de se bloquer soi-même !", "error");
    } else {
      let bloquer = joueurCible.addCarteBloquante(carte);
      if (bloquer) {
        this.notifierEventMessage(`Le joueur ${joueurCible.id} est bloqué !`, "success");
        return true;
      } else {
        this.notifierEventMessage(`Impossible de bloquer ${joueurCible.id} avec le même outil.` , "error");
      }
    }
    return false;
  }

  /**
   * Débloque le joueur cible (soi-même ou adversaire)
   */
  debloquerJoueur(joueurCible, carte) {
    if (carte.estCarteReparation()) { 
      let debloquer = joueurCible.removeCarteBloquante(carte); 
      if (debloquer) {
        this.notifierEventMessage(`Le joueur ${joueurCible.id} est débloqué !`, "success");
        return true;
      } else {
        this.notifierEventMessage("Aucune carte bloquante correspondante pour le joueur " + joueurCible.id, "error");
        return false;
      }
    }
    return false;
  }


  /**
   * Applique une carte action de blocage/réparation sur un joueur (adversaire ou soi-même)
   */
  appliquerSurJoueur(joueur, carte) {
    const [numJoueurCible, ] = this.action2.reference; //[numJoueurCible, numCarteCible]
    const joueurCible = numJoueurCible === 1 ? this.joueur1 : this.joueur2; 

    if (carte instanceof CarteAction) {
      if (carte.estCarteBloquante()) {
        return this.bloquerJoueur(joueur, joueurCible, carte);
      }
      // débloquer joueur (le joueur doit pouvoir jouer sur lui-meme)
      if (carte.estCarteReparation()) {
        return this.debloquerJoueur(joueurCible, carte);
      }
    }
    return false
  }


 /**
  * Applique les actions en fonction des cibles sélectionnées (action1 et action2)
  */
  appliquerActions() {
    const joueur = this.joueurActuel === 1 ? this.joueur1 : this.joueur2; 
    const [, numCarte] = this.action1.reference; //Récupère la carte à jouer
    const carte = joueur.cartes[numCarte]; 
    let success = false; 

    switch(this.action2.type) {
      case TypesCibles.MATRICE: 
        success = this.appliquerSurMatrice(joueur, carte);
        break;
      case TypesCibles.JOUEUR: 
        success = this.appliquerSurJoueur(joueur, carte); 
        break;
      case TypesCibles.CORBEILLE:
        success = true; 
        this.notifierEventMessage("Carte jetée dans la corbeille.", "success");
        break;
      case TypesCibles.EXTERIEUR:
        this.notifierEventMessage("Clic en dehors des zones de jeu valides.", "error");  
        break;
      default:
        this.notifierEventMessage("Erreur pour appliquer une action.", "error");
        break;
    }

    // fin du tour du joueur si action réussie
    if (success) {
      joueur.removeCarte(numCarte);
      this.changerTour();
      if (this.pioche.length > 0) {
        joueur.addCarte(this.pioche.pop());
      }
    }

    this.action1 = null;
    this.action2 = null; 
  }
}

export default Game;