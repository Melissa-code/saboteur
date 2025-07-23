import View from '../view/View.js';
import Game from '../model/Game.js'; 
import Cible from '../model/Cible.js';

const game = new Game(); 
const view = new View(game, document, 50, 70); 


window.addEventListener('resize', () => {
  view.handleResize();
});


// Test identifier cible 
const canvas = document.querySelector("#myCanvas");
canvas.addEventListener("click", (event) => {
  //https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left; //x du coin gauche du canvas
  const y = event.clientY - rect.top; //y du haut du canvas

  const cible = view.identifierCible(x, y); //return new Cible(typeCible,reference);
  console.log("Clic sur la cible : ", cible.type, cible.reference);
});