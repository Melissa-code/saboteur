import Directions from './Directions.js';

export class Card {
    constructor(image) {
        this.image = image
    }

    // return true/false
    rotation() {}
}


class CarteNain {
    //chercheur
    //saboteur
    constructor(typeNain) {
        this.typeNain = typeNain; 
    }
}

export class CarteChemin extends Card {

    constructor(haut, droite, bas, gauche, image) {
        super(image)
        this.haut = haut;
        this.droite = droite;
        this.bas = bas;
        this.gauche = gauche;
    }

    rotation() {
        let tempHaut = this.haut;
        this.haut = this.bas;
        this.bas = tempHaut;
        let tempDroite = this.droite; 
        this.droite = this.gauche; 
        this.gauche = tempDroite; 
    }

    // return bool 
    accepte_voisine(carteVoisine, direction)
    {
        if (direction == Directions["DROITE"]) return this.droite === "2" && carteVoisine.gauche !="0"
        if (direction == Directions["GAUCHE"]) return this.gauche === "2" && carteVoisine.droite !="0"
        if (direction == Directions["HAUT"]) return this.haut === "2" && carteVoisine.bas !="0"
        if (direction == Directions["BAS"]) return this.bas === "2" && carteVoisine.haut !="0"

    return false; 
    }  
    
}

// bloque le chemin 
class CarteImpasse {
    constructor(haut, droite, bas, gauche) {
        this.haut = haut;
        this.droite = droite;
        this.bas = bas;
        this.gauche = gauche;
    }
    
   
}

class CardAction {
    action // bloque debloque 
}

// regarder combinaison d'assemblage de cartes 

