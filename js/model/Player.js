import CarteAction  from './cards/CarteAction.js'; 
import Actions from './enums/Actions.js'; 

class Player {
    /**
     * Gère la main du joueur, son rôle et ses états de blocage avec ses outils cassés (pioche, lampe ou chariot)
     */
    constructor(id, role) {
        /**
         * @param {string|number} id - Le N° du joueur 
         * @param {string} role - Le rôle du joueur (Chercheur d'or ou Saboteur)
         */
        this.id = id;
        this.role = role;
        this.cartes = []; 
        this.cartesBloquantes = [];  // {CarteAction[]}
    }

    addCarte(carte) {
        this.cartes.push(carte); 
    }

    removeCarte(numCarte) {
        if (numCarte >= 0 && numCarte < this.cartes.length) {
            this.cartes.splice(numCarte, 1);
        }
    }

    /**
     * Ajoute une carte action de type "Casser" sur le joueur si l'outil n'est pas déjà cassé
     * @param {CarteAction} carteAction - La carte d'action de type blocage
     * @returns {boolean} True si le joueur a été bloqué, false sinon
     */
    addCarteBloquante(carteAction) {
        if (!(carteAction instanceof CarteAction)) return false;
        if (!carteAction.estCarteBloquante()) return false; 
      
        for (let i = 0; i < this.cartesBloquantes.length; i++) {
            if (carteAction.titreAction === this.cartesBloquantes[i].titreAction) {
                return false; 
            }
        }
        this.cartesBloquantes.push(carteAction);

        return true;
    }

    /**
     * Tente de supprimer une carte bloquante spécifique en fonction de la carte de réparation jouée
     * @param {number} index - L'index de la carte dans le tableau des blocages
     * @param {string} typeCasse - Le type d'outil cassé à soigner provenant de l'enum Actions
     * @returns {boolean} True si l'outil a été réparé
     */
    appliquerReparation(index, typeCasse) {
        if (this.cartesBloquantes[index].titreAction === typeCasse) {
            this.cartesBloquantes.splice(index, 1); // supprime la carte bloquante
            return true; 
        }
        return false; 
    }

    /**
     * Utilise une carte de réparation pour débloquer un outil du joueur
     * @param {CarteAction} carteAction - La carte de type réparation jouée
     * @returns {boolean} True si une carte bloquante a été enlevée
     */
    removeCarteBloquante(carteAction) {
        if (!(carteAction instanceof CarteAction)) return false;

        const nbCartesBloquantes = this.cartesBloquantes.length;

        for (let i = 0; i < this.cartesBloquantes.length; i++) {
            let succes = false;

            switch(carteAction.titreAction) {
                case Actions.REPARER_CHARIOT: 
                    succes = this.appliquerReparation(i, Actions.CASSER_CHARIOT);
                    break;
                case Actions.REPARER_LAMPE: 
                    succes = this.appliquerReparation(i, Actions.CASSER_LAMPE);
                    break;
                case Actions.REPARER_PIOCHE: 
                    succes = this.appliquerReparation(i, Actions.CASSER_PIOCHE);
                    break;
                case Actions.REPARER_LAMPE_PIOCHE: 
                    succes = this.appliquerReparation(i, Actions.CASSER_PIOCHE) || 
                             this.appliquerReparation(i, Actions.CASSER_LAMPE);
                    break;
                case Actions.REPARER_PIOCHE_CHARIOT: 
                    succes = this.appliquerReparation(i, Actions.CASSER_PIOCHE) || 
                             this.appliquerReparation(i, Actions.CASSER_CHARIOT);
                    break;
                case Actions.REPARER_CHARIOT_LAMPE: 
                    succes = this.appliquerReparation(i, Actions.CASSER_LAMPE) || 
                             this.appliquerReparation(i, Actions.CASSER_CHARIOT);
                    break;
            }

            if (succes) {
                break;
            }
        }
        return nbCartesBloquantes !== this.cartesBloquantes.length; // true si une carte bloquante a été retirée
    }
}

export default Player; 
