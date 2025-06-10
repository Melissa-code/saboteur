import { Card, CarteChemin, CarteAction } from './Card.js'; 
import Actions from './Actions.js'; 

export class CardFactory {
    
     /**
     * return CarteChemin 
     */
    static createCarteChemin(schema, image) {
        if (typeof schema !== 'string' || schema.length !== 4) {
            throw new Error('Le schema doit etre une string comme "1011"');
        }
        //string -> array 
        const chars = schema.split('');
        const haut = parseInt(chars[0]) ;
        const droite = parseInt(chars[1]) ;
        const bas = parseInt(chars[2]) ;
        const gauche = parseInt(chars[3]) ;

        return new CarteChemin(haut, droite, bas, gauche, image);
    }

    /**
     * return cartesCheminList[]
     */
    static createAllCartesChemin() {
        let typesCartesChemin = {
            "2020" : 4, // nb occurences (soit value)
            "2220" : 5,
            "2222" : 4, // -1 carte depart 
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
        let cartesCheminList = []; 

        for (let modeleCarte in typesCartesChemin) {
            //console.log(modeleCarte)
            let occurences = typesCartesChemin[modeleCarte]
          
            let image = `./images/cartes_chemin/${modeleCarte}.png`;

            // pour chaque occurence on crée la carte
            for (let i = 0; i < occurences; i++) {
                let carteChemin = this.createCarteChemin(modeleCarte, image)
                cartesCheminList.push(carteChemin); 
            }
        }

    
        return cartesCheminList; 
    }

    /**
     * return cartesActionList[]
     */
    static createAllCartesAction(titreAction, image) {
        let cartesActionList = [];
        let typesCartesAction = [
            [Actions.DETRUIT_CARTE_CHEMIN, 3],
            [Actions.CASSER_CHARIOT, 3],
            [Actions.CASSER_LAMPE, 3],
            [Actions.CASSER_PIOCHE, 3],
            [Actions.REGARDER_CARTE_BUT, 6 ],
            [Actions.REPARER_CHARIOT_LAMPE, 1 ],
            [Actions.REPARER_CHARIOT, 2 ],
            [Actions.REPARER_LAMPE_PIOCHE, 1],
            [Actions.REPARER_LAMPE, 2 ],
            [Actions.REPARER_PIOCHE_CHARIOT,1 ],
            [Actions.REPARER_PIOCHE, 2],
        ];

        for (let carteModeleAction of typesCartesAction) {
            let occurences = carteModeleAction[1];
            let image = `./images/cartes_action/${carteModeleAction[0]}.png`;

            for (let i = 0; i < occurences; i++) {
                let carteAction = new CarteAction(carteModeleAction[0], image);
                cartesActionList.push(carteAction); 
            }
        }

        return cartesActionList; 
    }
}
