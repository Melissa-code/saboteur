class Cible {
    /**
     * @param {string} type - le type de cible 
     * @param {Array|null} reference - données de référence de la cible :
     * - MATRICE => reference = [x, y] position dans la matrice
     * - JOUEUR => reference = [numJoueur, numCarte] , num= -1 | num carte cliquee
     * - CORBEILLE => reference = null
     * - EXTERIEUR => reference = null
     */
    constructor(type, reference) {
        this.type = type; 
        this.reference = reference; 
    }
}

export default Cible;