import { Card, CarteChemin, CarteAction } from './Card.js'; 
import Actions from './Actions.js'; 

class Player {
    constructor(id, role) {
        this.id = id;
        this.role = role;
        this.cartes = [];
        this.cartesBloquent = [];  
    }

    addCarte(carte) {
        this.cartes.push(carte); 
    }

    removeCarte(carte) {
        const index = this.cartes.indexOf(carte);
        //this.cartes.splice(index, 1)[0]; 
        this.cartes.splice(index, 1); 
    }

    addCarteBloquante(carteAction) {
        if (!(carteAction instanceof CarteAction)) {
            return false;
        }
        if (!carteAction.estCarteBloquante()) {
            return false; 
        }
        for (let i = 0; i < this.cartesBloquent.length; i++) {
            if (carteAction.titreAction === this.cartesBloquent[i].titreAction) {
                return false; 
            }
        }
        this.cartesBloquent.push(carteAction);

        console.log(this.cartesBloquent);
        return true;
    }

    removeCarteBloquante(carteAction) {
        if (!(carteAction instanceof CarteAction)) {
            return false;
        }

        let nbCartesBloquantes = this.cartesBloquent.length;

        for (let i = 0; i < this.cartesBloquent.length; i++) {
            switch(carteAction.titreAction) {
                case Actions.REPARER_CHARIOT: 
                    if (this.cartesBloquent[i].titreAction == Actions.CASSER_CHARIOT) {
                        this.cartesBloquent.splice(i, 1); 
                        i--;
                    }
                break;
                case Actions.REPARER_LAMPE: 
                    if (this.cartesBloquent[i].titreAction == Actions.CASSER_LAMPE) {
                        this.cartesBloquent.splice(i, 1); 
                        i--;
                    }
                break;
                case Actions.REPARER_PIOCHE: 
                    if (this.cartesBloquent[i].titreAction == Actions.CASSER_PIOCHE) {
                        this.cartesBloquent.splice(i, 1); 
                        i--;
                    }
                break;
                case Actions.REPARER_LAMPE_PIOCHE: 
                    if (this.cartesBloquent[i].titreAction == Actions.CASSER_PIOCHE
                        || this.cartesBloquent[i].titreAction == Actions.CASSER_LAMPE
                    ) {
                        this.cartesBloquent.splice(i, 1); 
                        i--;
                    }
                break;
                case Actions.REPARER_PIOCHE_CHARIOT: 
                    if (this.cartesBloquent[i].titreAction == Actions.CASSER_PIOCHE
                        || this.cartesBloquent[i].titreAction == Actions.CASSER_CHARIOT
                    ) {
                        this.cartesBloquent.splice(i, 1); 
                        i--;
                    }
                break;
                case Actions.REPARER_CHARIOT_LAMPE: 
                    if (this.cartesBloquent[i].titreAction == Actions.CASSER_LAMPE
                        || this.cartesBloquent[i].titreAction == Actions.CASSER_CHARIOT
                    ) {
                        this.cartesBloquent.splice(i, 1); 
                        i--;
                    }
                break;
            }
        }

        if (nbCartesBloquantes !== this.cartesBloquent.length) {
            return true
        } else {
            return false; 
        }
    }

}

export default Player; 