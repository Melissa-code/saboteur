# Documentation technique (Jeu du Saboteur)

## 1. Architecture du projet

Le projet suit une architecture MVC (Model-View-Controller) stricte pour séparer les responsabilités :

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   View.js   │◄─────│Controller.js │─────►│  Game.js    │
│  (Canvas)   │      │  (Clics)     │      │  (Logique)  │
└─────────────┘      └──────────────┘      └─────────────┘
Affichage            Interactions          État du jeu
```

**Model** (Game.js, Card.js, CardFactory, Player.js, Cible.js)
→ gère l'état du jeu, les règles et la logique métier

**View** (View.js)
→ affiche le jeu sur Canvas, gère le rendu visuel

**Controller** (Controller.js)
→ capture les clics, traduit les interactions en actions

---

## 2. Classes et POO 

#### 2.1. Hiérarchie des cartes

```
Card (classe parent abstraite)
├── CarteChemin (cartes tunnel)
│   └── Propriétés: haut, droite, bas, gauche, rotated, image, devoile = true, tresor = null
└── CarteAction 
    └── Propriétés: titreAction, image
```

#### 2.2. Héritage 

Toutes les cartes héritent de Card qui contient l'image de base.

```
class Card {
  constructor(image) {
    this.image = image;
  }
}

class CarteChemin extends Card {
  constructor(image, haut, droite, bas, gauche...) {
    super(image); // Appel au constructeur parent
    this.haut = haut; 
    ...
  }
}
```

#### 2.3. Factory Pattern

CardFactory.js utilise le pattern Factory pour créer les cartes :

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
**Avantage** : Centralise la création des cartes et facile à maintenir.

#### 2.4. Observer Pattern

**Le problème à résoudre :** "Comment mettre à jour l'affichage quand le joueur joue une carte ?" 

**Solutions d'abord proposées :**
- Vérifier en boucle toutes les 1/2 secondes avec `setInterval` mais l'interface tremble et gaspillage CPU, 
- Recharger la page quand l'autre joueur joue. 

**Solution adoptée :** 
- Communication entre Model et View via des événements :

```
// Dans Game.js (Model) Game hérite d'EventTarget (événement JS)
class Game extends EventTarget {
  constructor() {
    super(); // active le système d'événements 
    // ...
    notifierCible(cible); // le joueur pose une carte
    // ...
    this.dispatchEvent(new Event("change")); // notifie le changement à la Vue
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
**Avantages** : couplage faible : le Model ne connaît pas la View, et extensibilité : possibilité d'avoir plusieurs Views, Loggers...
```
Par exemple:
┌─────────┐
│  Game   │─────→ "change!" (signal)
└─────────┘           │
                      ├──→ View écoute et réagit
                      ├──→ Logger écoute et réagit  
                      └──→ Sound écoute et réagit
```

**Résultats :** 
- Mise à jour en <16ms au lieu de 500-2000ms avec reload, 
- Interface fluide, pas de clignotement
- Redessine uniquement quand nécessaire (économie CPU).

C'est pour cela que les applications web modernes (React, Vue, Angular) utilisent toutes ce pattern : elles ne rechargent jamais la page, elles écoutent les changements et mettent à jour juste ce qui a changé.


--- 

## 3. Algorithmes clés

#### 3.1. Vérifier les connexions pour placer une carte

**Problème** : Vérifier qu'une carte chemin peut être posée (connexions valides avec ses voisines sur le plateau de jeu)
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


#### 3.2. Rechercher le chemin (DFS : Depth First Search)

**Problème** : trouver s'il existe un chemin du départ au trésor sans interruption

**Algorithme de récursivité** avec méthode parcourir() :
```
parcourir(y, x) {
  const carte = this.matrix[y][x];
  carte.visite = true; 
  ...
  return true/false
}
```
- Complexité : O(n) où n = nombre de cartes sur le plateau
- Optimisation : utilisation de `carte.visite` pour éviter de revisiter les mêmes cartes

**Explication :**

- Le plateau de jeu simplifié : 
```
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

##### Étape 1 : Appel initial 
```
// parcourir(0, 0)
[Appel 1] sur (0,0)
└── Marque (0,0) comme visitée
└── Ce n’est pas un trésor
└── Cherche cartes voisines connectées  → trouve (0,1)
└── Appelle parcourir(0,1)
```

##### Étape 2 : Deuxième appel
```
// parcourir(0,1)
[Appel 2] sur (0,1)
└── Marque (0,1) comme visitée
└── Ce n’est pas un trésor
└── Cherche cartes voisines connectées :
      → trouve (0,0) (déjà visitée, ignore)
      → trouve (0,2)
└── Appelle parcourir(0,2)
```

##### Étape 3 : Troisième appel 
```
// parcourir(0,2)
[Appel 3] sur (0,2)
└── Marque (0,2) comme visitée
└── C’est un trésor ! 
└── return true  → il existe un chemin jusqu’au trésor
```

Chaque carte visitée est marquée `visite = true`, ce qui empêche de tourner en rond (avec des boucles infinies)


#### 3.3. Mélange équitable (Fisher-Yates)

**Problème** : Mélanger la pioche de manière aléatoire et équitable
```
static shuffleCartes() {
  let pioche = [...cartesAction, ...cartesChemin];
  
  // Algorithme de Fisher-Yates
  for (let i = pioche.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pioche[i], pioche[j]] = [pioche[j], pioche[i]]; // Swap
  }
  
  return pioche;
}
```
**Pourquoi Fisher-Yates ?**

- Distribution parfaitement aléatoire
- Chaque permutation a la même probabilité
- O(n) en temps, O(1) en espace


#### 3.4. Rotation de carte avec Canvas

**Problème** : Faire tourner une image de 180° sur Canvas

**Solution** : Translate → Rotate → Draw → Restore
```
// View.js
drawImageRotated(image, x, y, width, height, rotation) {
  if (rotation === 0) {
    this.ctx.drawImage(image, x, y, width, height);
  } else {
    this.ctx.save();                                                // 1. sauvegarde l'état
    this.ctx.translate(x + width/2, y + height/2);                  // 2. déplace l'origine au centre
    this.ctx.rotate(rotation);                                      // 3. tourne (Math.PI = 180°)
    this.ctx.drawImage(image, -width/2, -height/2, width, height);  // 4. dessine
    this.ctx.restore();                                             // 5. restaure l'état
  }
}
```
**Pourquoi cette complexité ?**

Canvas tourne tout le système de coordonnées, pas juste l'image. Il faut donc :
- Déplacer l'origine au centre de l'image
- Tourner le système
- Dessiner l'image depuis le centre
- Remettre le système comme avant (pour ne pas affecter les autres dessins)

---

## 4. Structures de données

#### 4.1. Matrice du plateau de jeu
```
this.matrix = [
  ...
  [CarteDépart, null, null, null, null, null, null, null, CarteBut],
  ...
];
```
**Choix** : Array 2D plutôt qu'un objet
**Avantage** : Accès O(1), facile de vérifier les voisins avec matrix[y+1][x+1]


#### 4.2 État du joueur
```
// PLayer.js
class Player {
  constructor(id) {
    this.id = id;
    this.cartes = [carte1, carte2, carte3, carte4, carte5];   // main du joueur
    this.cartesBloquent = [];                                 // ses outils cassés
  }
}
```

## 5. Responsive design

#### Détection et adaptation
```
// View.js
initializeZones() {
  this.isMobile = window.innerWidth < 600;
  
  if (this.isMobile) {
    // Layout vertical : plateau au-dessus, mains en-dessous
    this.zones.gameBoard = { x: 0, y: 0, width: W, height: H };
    this.zones.playerCards = { x: 0, y: H + margin, ... };
  } else {
    // Layout horizontal : plateau à gauche, mains à droite
    this.zones.gameBoard = { x: 0, y: 0, width: W, height: H };
    this.zones.playerCards = { x: W + spacing, y: 0, ... };
  }
}
```
**Breakpoint** : 600px (standard mobile/tablette)

---

## 6. Points d'amélioration possibles

- **Performances**: cache des images pré-chargées
- **Architecture**: tests unitaires 
- **Algorithmes**: compression du state pour sauvegarde

---

## 7. Concepts utilisés

- **POO** : héritage, encapsulation, polymorphisme
- **Design Patterns** : MVC, Factory, Observer
- **Algorithmes** : DFS, Fisher-Yates,  shuffle
- **Canvas API** : Transformations 2D (rotate, translate)
- **Events**: EventTarget, addEventListener
- **ES6+** : classes, modules, arrow functions, destructuring
- **Responsive** : media queries, layout adaptatif
