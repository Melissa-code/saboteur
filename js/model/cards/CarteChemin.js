import Directions from '../enums/Directions.js';
import Card from './Card.js';

/**
 * Représente une carte de tunnel (chemin)
 * gère les connexions physiques et l'état de découverte du trésor
 * @extends Card hérite de la classe abstraite Card
 */
class CarteChemin extends Card {

    static TYPE_TRESOR = "tresor";

    /**
     * @param {number} haut/droite/bas/gauche - Connexion (0:mur, 1:impasse, 2:tunnel)
     * @param {string} image - path vers l'image
     * @param {boolean} [estDevoilee=true] - Si la carte est visible/retournée
     * @param {string|null} [tresor=null] - Si la carte est trésor ou null
     */
    constructor(haut, droite, bas, gauche, image, estDevoilee = true, tresor = null) {
        super(image)
        this.haut = haut;
        this.droite = droite;
        this.bas = bas;
        this.gauche = gauche;
        this.estDevoilee = estDevoilee;
        this.tresor = tresor;

        /** @type {boolean} Indique si la carte a subi une rotation de 180° */
        this.rotated = false; 

        /** @type {boolean} Utilisé par l'algorithme de parcours (BFS/DFS) */
        this.estVisitee = false; 

        /** @type {boolean} Indique si cette carte fait partie du chemin final vers le trésor */
        this.cheminVictoire = false; 
    }

    /**
     * Effectue une rotation de 180° de la carte (inverse les connexions opposées: haut <-> bas et droite <-> gauche)
     */
    rotation() {
        let tempHaut = this.haut;
        this.haut = this.bas;
        this.bas = tempHaut;
        let tempDroite = this.droite; 
        this.droite = this.gauche; 
        this.gauche = tempDroite; 

        this.rotated = !this.rotated;
    }

    /**
     * Vérifie si une carte voisine peut être placée à côté de celle-ci (impasse ou tunnel)
     * exemple: 2 (tunnel) et 1 (impasse) true===true - 0 (mur) et 0 (mur) false===false - 2 (tunnel) et 0 (mur) true!==false 
     * @returns {boolean} True si les bords sont compatibles
     */
    accepterVoisine(carteAPlacer, direction) {
        const verification = (bord1, bord2) => (bord1 > 0) === (bord2 > 0);

        switch (direction) {
            case Directions.GAUCHE: return verification(this.gauche, carteAPlacer.droite);
            case Directions.DROITE: return verification(this.droite, carteAPlacer.gauche);
            case Directions.HAUT:   return verification(this.haut, carteAPlacer.bas);
            case Directions.BAS:    return verification(this.bas, carteAPlacer.haut);
            default: return false;
        }
    }  

    /**
     * Vérifie si le passage réel (2-2) existe la cette carte et sa voisine: 
     * pour tracer le vrai chemin du nain vers le trésor
     * @returns {boolean} True si un passage existe entre les deux cartes
     */
    seConnecter(carteAPlacer, direction) {
        switch (direction) {
            case Directions.GAUCHE: return this.gauche === 2 && carteAPlacer.droite === 2;
            case Directions.DROITE: return this.droite === 2 && carteAPlacer.gauche === 2;
            case Directions.HAUT:   return this.haut === 2   && carteAPlacer.bas === 2;
            case Directions.BAS:    return this.bas === 2    && carteAPlacer.haut === 2;
            default: return false;
        }
    }  

    ajouterTresor() {
        this.tresor = CarteChemin.TYPE_TRESOR;
    }
}

export default CarteChemin;