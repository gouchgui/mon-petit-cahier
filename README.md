# Mon petit cahier

Site d'entraînement au calcul mental et de révision des bases du collège, pour une classe de 2nde pro.

- **Ma séance** : 10 calculs, niveau 1 à 5, opérations au choix, analyse des erreurs et conseils, puis une nouvelle série ciblée (3 essais).
- **Revoir les bases** : 10 fiches courtes avec un exemple et 5 calculs pour vérifier.
- **Le petit plus du jour** : une vidéo courte par jour, avec un thème selon le jour de la semaine.

Le site n'a ni compte ni base de données. Les résultats restent dans le navigateur de l'élève.

## Ajouter la vidéo du jour

1. Sur GitHub, ouvrez le fichier `assets/videos.js`.
2. Cliquez sur le crayon (« Edit this file »).
3. Copiez un bloc `{ ... },` existant et collez-le à la fin de la liste.
4. Changez la date (`"AAAA-MM-JJ"`), le titre, la source, la durée et le lien.
5. Cliquez sur « Commit changes ». Le site se met à jour en une à deux minutes.

Un lien YouTube s'affiche directement dans la page. Un autre lien (Lumni, ADEME…) affiche un bouton « Regarder sur le site de la source ».

Thèmes : lundi Médias, mardi Écologie, mercredi Numérique, jeudi Société, vendredi Esprit critique.

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | Accueil |
| `entrainement/` | Page de la séance de calcul |
| `bases/` | Les 10 fiches |
| `videos/` | Programme et archives des vidéos |
| `mentions-legales/` | À compléter avec votre nom et votre établissement |
| `assets/calcul.js` | Générateur de calculs et analyse des erreurs |
| `assets/videos.js` | **La liste des vidéos (à modifier)** |
| `assets/style.css` | Couleurs et mise en page |
