import Card from './Card.js';
import Actions from '../enums/Actions.js';

class CarteAction extends Card {
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

export default CarteAction;