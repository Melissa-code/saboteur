import CarteAction  from './CarteAction.js'; 
import CarteChemin  from './CarteChemin.js'; 
import Actions from '../enums/Actions.js'; 

class CardFactory {

    static PATH_CHEMINS = "./images/cartes_chemin/";
    static PATH_ACTIONS = "./images/cartes_action/";

    /**
     * Crée une instance de CarteChemin à partir d'un schéma 
     * 
     * @param {string} schema - string de 4 chiffres (ex: "2012") représentant [haut, droite, bas, gauche]
     * @param {string} image - path vers le fichier image (ex: images/cartes_chemin/2012.svg)
     * @returns {CarteChemin} Une nouvelle instance de carte chemin
     */
    static createCarteChemin(schema, image) {
        if (typeof schema !== 'string' || schema.length !== 4) {
            throw new Error('Le schema doit etre une string comme "1011"');
        }
     
        const chars = schema.split(''); //string -> array 
        const haut = parseInt(chars[0]) ;
        const droite = parseInt(chars[1]) ;
        const bas = parseInt(chars[2]) ;
        const gauche = parseInt(chars[3]) ;

        return new CarteChemin(haut, droite, bas, gauche, image);
    }

    /**
     * Génère toutes les cartes Chemin en fonction des occurrences définies 
     * @returns {CarteChemin[]}
     */
    static createAllCartesChemin() {
        let cartesCheminList = []; 
        let typesCartesChemin = {
            "2020" : 4, // nb occurences (soit value)
            "2220" : 5,
            //"2222" : 4, // -1 soit la carte depart 
            "2222" : 40, 
            "2202": 5,
            "0202" : 3,
            "0220" : 4,
            "0022": 5,
            "0020" : 1,
            "1010" : 1,
            "1110": 1,
            "1111": 1,
            "1101":1,
            "0101": 1,
            "0110": 1,
            "0011": 1,
            "0002": 1
        }
        
        for (let modeleCarte in typesCartesChemin) {
            const occurences = typesCartesChemin[modeleCarte];
            const imagePath = `${CardFactory.PATH_CHEMINS}/${modeleCarte}.svg`;

            // Pour chaque occurence on crée la carte
            for (let i = 0; i < occurences; i++) {
                const carteChemin = CardFactory.createCarteChemin(modeleCarte, imagePath)
                cartesCheminList.push(carteChemin); 
            }
        }
        return cartesCheminList; 
    }

    /**
     * Génère toutes les cartes Action en fonction des occurrences définies
     * @returns {CarteAction[]}
     */
    static createAllCartesAction(titreAction, image) {
        let cartesActionList = [];
        let typesCartesAction = [
            [Actions.DETRUIT_CARTE_CHEMIN, 3],
            [Actions.CASSER_CHARIOT, 3],
            [Actions.CASSER_LAMPE, 3],
            [Actions.CASSER_PIOCHE, 3],
            [Actions.REGARDER_CARTE_BUT, 6],
            [Actions.REPARER_CHARIOT_LAMPE, 1],
            [Actions.REPARER_CHARIOT, 2],
            [Actions.REPARER_LAMPE_PIOCHE, 1],
            [Actions.REPARER_LAMPE, 2],
            [Actions.REPARER_PIOCHE_CHARIOT,1],
            [Actions.REPARER_PIOCHE, 2],
        ];

        for (let carteModeleAction of typesCartesAction) {
            const occurences = carteModeleAction[1];
            const imagePath = `${CardFactory.PATH_ACTIONS}/${carteModeleAction[0]}.svg`;

            for (let i = 0; i < occurences; i++) {
                const carteAction = new CarteAction(carteModeleAction[0], imagePath);
                cartesActionList.push(carteAction); 
            }
        }
        return cartesActionList; 
    }

    /**
     * Crée, rassemble et mélange toutes les cartes chemin et action (Algorithme Fisher-Yates)
     * @returns {Card[]} La pioche mélangée
     */
    static generatePioche() {
        const cartesAction = CardFactory.createAllCartesAction();
        const cartesChemin = CardFactory.createAllCartesChemin(); 

        let pioche = []; 
        pioche = [...cartesAction, ...cartesChemin]; //fusion des 2 tableaux

        // Algorithme de Fisher-Yates pour mélanger équitablement la pioche: fin->debut et i changé par élément aléatoire
        for (let i = pioche.length -1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1)); //nb de 0 à i
            [pioche[i], pioche[j]] = [pioche[j], pioche[i]]; //destructuring assignment (sans la temp)
        }
        return pioche; 
    }
}

export default CardFactory; 