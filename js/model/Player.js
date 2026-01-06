import CarteAction  from './cards/CarteAction.js'; 
import Actions from './enums/Actions.js'; 

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

    removeCarte(numCarte) {
        if (numCarte >= 0 && numCarte < this.cartes.length) {
            this.cartes.splice(numCarte, 1);
        }
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
