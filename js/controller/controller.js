import View from '../view/View.js';
import Game from '../model/Game.js'; 


const game = new Game(); 
const view = new View(game, document, 50, 70); 
game.view = view;

game.addEventListener("showPlayerTurn", (e) => view.showPlayerTurn(e.detail));
game.dispatchEvent(new CustomEvent("showPlayerTurn", {
  detail: `C'est au tour du joueur ${game.joueurActuel} de jouer.` // detail: propriete obligatoire 
}));

game.addEventListener("message", (e) => view.showMessage(e.detail));
  
window.addEventListener('resize', () => view.handleResize());

const canvas = document.querySelector("#myCanvas");
canvas.addEventListener("click", (event) => {
  // cf https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left; //x coin gauche du canvas
  const y = event.clientY - rect.top; //y haut du canvas

  const cible = view.identifierCible(x, y); //return new Cible(typeCible,reference);
  // console.log("Clic sur la cible : ", cible.type, cible.reference);
  game.notifierCible(cible);

  view.refresh();
});
