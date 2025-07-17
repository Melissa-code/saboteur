# Jeu du Saboteur 

## 1. règles du jeu:

- cartes chemin
- cartes rôles cachés

- le plateau de jeu commence avec une case de **départ**
- et des **cartes objectifs** à l'aurte bout 

- les joueurs choisissent des **cartes chemin** (ligne, virage, croisement)
- les posent pour connecter le départ à l'un des objectifs

- les **Saboteurs** perturbent la construction du chemin 
- les **Chercheurs** créent un chemin vers l'or

- Gestion de cartes: pose, rotztion, types
- rôles cachés: chercheurs/saboteurs 
- Logique de victoire: atteindre l'objectif/empêcher cela

---

## 2. But du jeu :

- Nains chercheurs d'or
- Nains saboteurs qui veulent empêcher les autres de trouver l'or
- On part d'une case au centre (départ) 
- Le but: atteindre une des 3 faces cachées (une carte contient le trésor)
- on pose les cartes chemin sur le plateau de jeu pour y arriver 

---

## 3. Architecture du jeu

### Le Modèle de données (Model)
- le plateau de jeu (array 2D)
- les cartes de chaque joueur
- les rôles des joueurs
- l'état du jeu (en cours ou terminé)
- les objectifs (cartes cachées)
- le joueur courant 

### L'affichage du jeu (View)

- l'affichage du plateau de jeu: case de départ, les cases, case objectif
- l'affichage des cartes: montre les cartes que le joueur peut poser
- l'affichage du joueur s'il est chercheur ou saboteur 
- indique la carte sélectionnée par le joueur
- des informations de l'état du jeu
- Elle est mise à jour à chaque action

### Le contrôleur (Controller)

- Gère la logique du jeu, les actions du joueur
- sélectionne une carte et la poser
- vérifie si la pose est valide (ex: connecter des chemins)
- change de joueur après chaque tour 
- vérifie si victoire ?
- gère les rôles cachés 

### Etats du jeu 

- **en cours**: le jeu avance 
- **gagné**: chemin valide jusqu'à l'objectif 
- **perdu**: saboteur empêche de finir le chemin

---

## 4. Les étapes du jeu 

### L'initialisation 

- Crée le plateu de jeu vide (9*15)
- Distribue les cartes aux joueurs 
- Attribue un rôle aux joueurs 
- Place la carte de départ 
- Place les objectifs 

### Le début du tour 

- le joueur courant choisit une carte
- soit il peut poser la carte , soit il passe son tour 

### la validation des actions 

- il faut vérifier que la carte posée est valide
- si oui, mettre l'état du jeu à jour (refresh)

### Le tour suivant 

- on change de joueur 

### Vérifier si victoire ou défaite 

- Vérifie si un des joueurs a attient un objectif 
- Annonce si un joueur a gagné 

--- 
#### Variables de positionnement relatif

Ce sont des constantes qui définissent les zones et leurs positions sur le canvas de manière structurée. Définition des coordonnées de chaque zone.
--- 

## 5. Les tests

- Avant de coder, penser aux tests ?

### Tests de logique

- Vérifie que les cartes sont posées correctement 
- Vérifie que les chemins sont connectés 

### Tests de victoire 

- vérifie qu'un joueur a gagné 

### Tests de rotation

- Vérifier que les cartes peuvent être tournées correctement 

## Factory 

- CardFactory gère la création et la préparation des cartes (centralise la logique)