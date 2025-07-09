class Cible {
    constructor(type, reference) {
        this.type = type; // type String: matrice - joueur - corbeille (à créer)
        this.reference = reference; // instance de player, coord x y, null/"corbeille" 
    }
}

export default Cible;