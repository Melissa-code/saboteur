import { Card, CarteChemin } from './Card.js'; 

export class CardFactory {
    
    static createCarteChemin(schema, image) {
        if (typeof schema !== 'string' || schema.length !== 4) {
            throw new Error('Le schema doit etre une string comme "1011"');
        }
        //string -> array 
        const chars = schema.split('');
        const haut = chars[0] ;
        const droite = chars[1] ;
        const bas = chars[2] ;
        const gauche = chars[3] ;

        return new CarteChemin(haut, droite, bas, gauche, image);
    }

    /**
     * return cartesCheminList[]
     */
    static createAllCarteChemin() {
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
            console.log(modeleCarte)
            let occurences = typesCartesChemin[modeleCarte]
            // directions (haut droite bas gauche)
            let haut = parseInt(modeleCarte[0]);
            let droite = parseInt(modeleCarte[1]);
            let bas = parseInt(modeleCarte[2]);
            let gauche = parseInt(modeleCarte[3]);
            let image = `./images/cartes_chemin/${modeleCarte}.png`;

            // pour chaque occurence on crée la carte
            for (let i = 0; i < occurences; i++) {
                let carteChemin = new CarteChemin(haut, droite, bas, gauche, image); 
                cartesCheminList.push(carteChemin); 
            }
        }

        return cartesCheminList; 
    }
}
