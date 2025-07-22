import TypesCibles from './TypesCibles.js';

class Cible {
    constructor(type, reference) {
        this.type = type; 
        this.reference = reference; 
        /*
            MATRICE => reference = [x, y] position dans la matrice
            JOUEUR => reference = [numJoueur, numCarte] 
            CORBEILLE => reference = null
            EXTERIEUR => reference = null
        */

    }
}

export default Cible;