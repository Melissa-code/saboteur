import Directions from './Directions.js';
import Actions from './Actions.js';

export class Card {
    constructor(image) {
        this.image = image
    }

    // return true/false
    rotation() {}
}

export class CarteChemin extends Card {

    constructor(haut, droite, bas, gauche, image, devoile = true, tresor = null) {
        super(image)
        this.haut = haut;
        this.droite = droite;
        this.bas = bas;
        this.gauche = gauche;
        this.devoile = devoile;
        this.tresor = tresor;
        this.rotated = false;
    }

    rotation() {
        let tempHaut = this.haut;
        this.haut = this.bas;
        this.bas = tempHaut;
        let tempDroite = this.droite; 
        this.droite = this.gauche; 
        this.gauche = tempDroite; 

        this.rotated = !this.rotated;
    }
 
    accepte_voisine(carteAPlacer, direction)
    {
        console.log(" ma carte à placer : ", carteAPlacer)
        console.log("direction ", direction)
        console.log(" carte accepte voisine ", this)

        // A tester incorrecte quand un des deux (et un seul) est 0 : somme!=0 et produit=0 => incorrecte
        if (direction === Directions.GAUCHE) return (this.gauche !== 0 && carteAPlacer.droite !== 0) || (this.gauche === 0 && carteAPlacer.droite === 0);
        if (direction === Directions.DROITE) return (this.droite !== 0 && carteAPlacer.gauche !== 0) || (this.droite === 0 && carteAPlacer.gauche === 0);
        if (direction === Directions.HAUT) return (this.haut !== 0 && carteAPlacer.bas !== 0) || (this.haut === 0 && carteAPlacer.bas === 0);
        if (direction === Directions.BAS) return (this.bas !== 0 && carteAPlacer.haut !== 0) || (this.bas === 0 && carteAPlacer.haut === 0);
      
        return false; 
    }  

    ajouterTresor() {
        this.tresor = "./images/treasure.svg";
    }
}

// bloque debloque
export class CarteAction extends Card {
    
    constructor(titreAction, image) {
        super(image);
        this.titreAction = titreAction; 
    }

    // bool 
    estCarteBloquante() {
        return this.titreAction == Actions.CASSER_CHARIOT 
            || this.titreAction == Actions.CASSER_LAMPE
            || this.titreAction == Actions.CASSER_PIOCHE
    }

    estCarteReparation() {
        return this.titreAction == Actions.REPARER_CHARIOT
            || this.titreAction == Actions.REPARER_LAMPE
            || this.titreAction == Actions.REPARER_PIOCHE
            || this.titreAction == Actions.REPARER_CHARIOT_LAMPE
            || this.titreAction == Actions.REPARER_LAMPE_PIOCHE
            || this.titreAction == Actions.REPARER_PIOCHE_CHARIOT
    }

}
