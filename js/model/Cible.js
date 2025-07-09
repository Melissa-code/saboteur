class Cible {
    constructor(type, reference) {
        this.type = type; // type String: matrice - joueur - corbeille (à créer)
        this.reference = reference; // instance de player, coord x y, null/"corbeille" 
        /*
            matrice => reference = position i,j dans la matrice
            joueur => reference = Num joeur, Num carte
            corbeille => null
        */
    }
}

export default Cible;