import Directions from './Directions.js';
import Actions from './Actions.js';

export class Card {
    constructor(image) {
        this.image = image
    }

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
        this.visite = false; 
        this.cheminVictoire = false; 
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
 
    //ne pas rejeter carte parce qu’un voisin est mur 0 0
    accepte_voisine(carteAPlacer, direction)
    {
        // A tester incorrecte quand un des deux (et un seul) est 0 : somme!=0 et produit=0 => incorrecte
        if (direction === Directions.GAUCHE) return (this.gauche !== 0 && carteAPlacer.droite !== 0) || (this.gauche === 0 && carteAPlacer.droite === 0) ;
        else if (direction === Directions.DROITE) return (this.droite !== 0 && carteAPlacer.gauche !== 0) || (this.droite === 0 && carteAPlacer.gauche === 0);
        else if (direction === Directions.HAUT) return (this.haut !== 0 && carteAPlacer.bas !== 0) || (this.haut === 0 && carteAPlacer.bas === 0) ;
        else if (direction === Directions.BAS) return (this.bas !== 0 && carteAPlacer.haut !== 0) || (this.bas === 0 && carteAPlacer.haut === 0) ;
      
        return false; 
    }  

    seConnecte(carteAPlacer, direction)
    {
        if (direction === Directions.GAUCHE) return (this.gauche == 2 && carteAPlacer.droite == 2);
        else if (direction === Directions.DROITE) return (this.droite == 2 && carteAPlacer.gauche == 2) ;
        else if (direction === Directions.HAUT) return (this.haut == 2 && carteAPlacer.bas == 2) ;
        else if (direction === Directions.BAS) return (this.bas == 2 && carteAPlacer.haut == 2);
      
        return false; 
    }  

    ajouterTresor() {
        this.tresor = "./images/treasure.svg";
    }
}


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