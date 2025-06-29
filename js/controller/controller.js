import View from '../view/View.js';
import Game from '../model/Game.js'; 

const game = new Game(); 
const view = new View(game, document, 50, 70); 


window.addEventListener('resize', () => {
  view.handleResize();
});