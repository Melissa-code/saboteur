/** * Enum immuable pour les 11 actions (cf. cartes actions)
 * @enum {string}
 */
const Actions = Object.freeze({
    DETRUIT_CARTE_CHEMIN : "detruit_carte_chemin",
    CASSER_CHARIOT : "casser_chariot",
    CASSER_LAMPE : "casser_lampe",
    CASSER_PIOCHE : "casser_pioche", 
    REGARDER_CARTE_BUT : "regarder_carte_but",
    REPARER_CHARIOT_LAMPE : "reparer_chariot_lampe" ,
    REPARER_CHARIOT : "reparer_chariot",
    REPARER_LAMPE_PIOCHE : "reparer_lampe_pioche", 
    REPARER_LAMPE : "reparer_lampe",
    REPARER_PIOCHE_CHARIOT : "reparer_pioche_chariot",
    REPARER_PIOCHE : "reparer_pioche"
});

export default Actions;