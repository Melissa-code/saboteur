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
}


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

// Faire un e factory pour créer les cartes chemin 
// pour placement 

