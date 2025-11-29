# Documentation technique du Jeu du Saboteur 

## 1. Architecture du projet

Le projet suit une architecture MVC (Model-View-Controller) stricte pour séparer les responsabilités :

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   View.js   │◄─────│Controller.js │─────►│  Game.js    │
│  (Canvas)   │      │  (Clics)     │      │  (Logique)  │
└─────────────┘      └──────────────┘      └─────────────┘
    Affichage          Interactions          État du jeu
```

**Model** (Game.js, Card.js, CardFactory, Player.js, Cible.js)
→ Gère l'état du jeu, les règles et la logique métier

**View** (View.js)
→ Affiche le jeu sur Canvas, gère le rendu visuel

**Controller** (Controller.js)
→ Capture les clics, traduit les interactions en actions

---

## 2. Classes et POO 

#### Hiérarchie des cartes

```
Card (classe parent abstraite)
├── CarteChemin (cartes tunnel)
│   └── Propriétés: haut, droite, bas, gauche, rotated, image
└── CarteAction 
    └── Propriétés: action, image
```

#### Héritage 

Toutes les cartes héritent de Card qui contient l'image de base.

```
class Card {
  constructor(image) {
    this.image = image;
  }
}

class CarteChemin extends Card {
  constructor(image, haut, droite, bas, gauche) {
    super(image); // Appel au constructeur parent
    this.haut = haut; 
    ...
  }
}
```

#### Factory Pattern

`CardFactory.js` utilise le pattern Factory pour créer les cartes :

```
class CardFactory {

  /**
  * Méthode statique : pas besoin d'instancier la classe
  */
  static createCarteChemin(schema, image) {
    ...
    return new CarteChemin(haut, droite, bas, gauche, image);
  }
  
  /**
  * Créer toutes les cartes chemin du jeu selon leurs occurences
  */
  static createAllCartesChemin() {
    let typesCartesChemin = {
      "2020": 4,  // 4 cartes de ce type
      ...
    };
    // Génère et retourne un tableau de cartes 
    return cartesCheminList;
  }
}
```
Avantage : Centralise la création des cartes, facile à maintenir.

#### Observer Pattern

Communication entre Model et View via événements :

```
// Dans Game.js (Model)
class Game extends EventTarget {
  notifierCible(cible) {
    // ... 
    this.dispatchEvent(new Event("change")); // Notifie la Vue
  }
}

// Dans View.js
class View {
  constructor(game) {
    this.game = game;
    this.game.addEventListener("change", () => this.refresh());
  }
}
```
Avantage : Le Model ne connaît pas la View, couplage faible.

--- 

## Algorithmes clés

#### Vérification des connexions (placement de carte)

Problème : Vérifier qu'une carte peut être posée (connexions valides avec voisines)
```
verifierCartesVoisines(x, y) {
  const carte = this.matrix[y][x];
  const cartesConnectees = [];
  
  // Vérifier chaque direction (haut, droite, bas, gauche)
  const directions = [
    { dy: -1, dx: 0, carteCote: 'haut', voisinCote: 'bas' },
    { dy: 0, dx: 1, carteCote: 'droite', voisinCote: 'gauche' },
    { dy: 1, dx: 0, carteCote: 'bas', voisinCote: 'haut' },
    { dy: 0, dx: -1, carteCote: 'gauche', voisinCote: 'droite' }
  ];
  
  for (let dir of directions) {
    const voisinY = y + dir.dy;
    const voisinX = x + dir.dx;
    
    // Si voisin existe et connexion ouverte des deux côtés
    if (this.matrix[voisinY]?.[voisinX] && 
        carte[dir.carteCote] !== 0 && 
        this.matrix[voisinY][voisinX][dir.voisinCote] !== 0) {
      cartesConnectees.push([voisinY, voisinX]);
    }
  }
  
  return cartesConnectees;
}
```
Complexité : O(4) = O(1) - vérifie seulement 4 voisins

#### Recherche de chemin DFS (Depth First Search)

Problème : Trouver s'il existe un chemin du départ au trésor
Algorithme de récursivité avec méthode parcourir() 
```
parcourir(y, x) {
  const carte = this.matrix[y][x];
  carte.visite = true; 
  ...
  return true/false
}
```
Complexité : O(n) où n = nombre de cartes sur le plateau
Optimisation : Utilise carte.visite pour éviter de revisiter les mêmes cartes

**Explication :**

- Le plateau de jeu simplifié : 
````
y ↓   x →

     0     1     2
   ┌────┬────┬────┐
0  │ D  │ →  │ T  │
   └────┴────┴────┘

D = carte Départ
→ = carte couloir (ex: connectée gauche-droite)
T = carte Trésor
```

Toutes les cartes sont reliées par leurs tunnels. 
(haut, bas, gauche, droite ne valent pas 0 là où elles sont connectées)

### Étape 1 : Appel initial

- parcourir(0, 0)

```
[Appel 1] sur (0,0)
└── Marque (0,0) comme visitée
└── Ce n’est pas un trésor
└── Cherche cartes voisines connectées  → trouve (0,1)
└── Appelle parcourir(0,1)
```

### Étape 2 : Deuxième appel

- parcourir(0,1)

```
[Appel 2] sur (0,1)
└── Marque (0,1) comme visitée
└── Ce n’est pas un trésor
└── Cherche cartes voisines connectées :
      → trouve (0,0) (déjà visitée, ignore)
      → trouve (0,2)
└── Appelle parcourir(0,2)
```

### Étape 3 : Troisième appel

- parcourir(0,3)

````
[Appel 3] sur (0,2)
└── Marque (0,2) comme visitée
└── C’est un trésor ! 
└── return true  → il existe un chemin jusqu’au trésor
```

- Chaque carte visitée est marquée visite = true, ce qui empêche de tourner en rond (boucles infinies)

```

