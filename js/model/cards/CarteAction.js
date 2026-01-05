import Card from './Card.js';
import Actions from '../enums/Actions.js';

/**
 * Représente une carte d'effet (blocage, réparation, éboulement...)
 * hérite de la classe abstraite Card
 */
class CarteAction extends Card {
    /**
     * @param {string} image - path de l'image de la carte
     * @param {string} titreAction - type d'action issu de l'Enum Actions
     */
    constructor(titreAction, image) {
        super(image);
        this.titreAction = titreAction; 
    }

    estCarteBloquante() {
        const cartesBloquantes = [
            Actions.CASSER_CHARIOT,
            Actions.CASSER_LAMPE,
            Actions.CASSER_PIOCHE
        ];
        
        return cartesBloquantes.includes(this.titreAction);
    }

    estCarteReparation() {
        const cartesReparation = [
            Actions.REPARER_CHARIOT,
            Actions.REPARER_LAMPE,
            Actions.REPARER_PIOCHE,
            Actions.REPARER_CHARIOT_LAMPE,
            Actions.REPARER_LAMPE_PIOCHE,
            Actions.REPARER_PIOCHE_CHARIOT
        ];

        return cartesReparation.includes(this.titreAction);
    }; 
}

export default CarteAction;