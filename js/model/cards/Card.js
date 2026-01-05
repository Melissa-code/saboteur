/**
 * @abstract
 * Classe représentant une carte générique du Saboteur - ne doit pas être instanciée directement
 * Card seule n'existe pas dans le jeu: c'est forcément un chemin ou une action et toutes ont une image
 */
class Card {
    constructor(image) {
        // Sécurité: empêche l'instanciation de la classe mère
        if (this.constructor === Card) { throw new TypeError("Impossible d'instancier la classe abstraite Card directement."); }
        this.image = image
    }

    /**
     * Méthode abstraite à surcharger dans la classe fille CarteChemin (180° sinon rien, pour évolutivité)
     * une carte de base ne sait pas comment pivoter 
     */
    rotation() {
        throw new Error("La méthode 'rotation()' doit être implémentée par la classe CarteChemin.");
    }
}

export default Card;
