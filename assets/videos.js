/* =========================================================
   LES VIDÉOS DU JOUR — c'est le seul fichier à modifier
   pour ajouter une vidéo.

   Pour ajouter une vidéo, copiez un bloc { ... }, collez-le
   dans la liste et changez :
     date   : le jour où elle apparaît, au format "AAAA-MM-JJ"
     titre  : le titre affiché aux élèves
     source : qui l'a produite (Lumni, CLEMI, ADEME…)
     duree  : par exemple "8 min" (ou laissez "")
     url    : le lien de la vidéo (YouTube ou page du site)
   N'oubliez pas la virgule entre deux blocs.

   Le thème est choisi automatiquement selon le jour :
   lundi Médias, mardi Écologie, mercredi Numérique,
   jeudi Société, vendredi Esprit critique.
   ========================================================= */

window.THEMES = {
  1: { nom: 'Médias et information', court: 'Médias' },
  2: { nom: 'Écologie', court: 'Écologie' },
  3: { nom: 'Numérique', court: 'Numérique' },
  4: { nom: 'Société', court: 'Société' },
  5: { nom: 'Esprit critique', court: 'Esprit critique' }
};

window.VIDEOS = [
  {
    date: "2026-11-26",
    titre: "Changer nos comportements pour un mode de vie plus durable",
    source: "ADEME",
    duree: "3 min",
    url: "https://agirpourlatransition.ademe.fr/acteurs-education/enseigner/catalogue/sensibilisez-etudiants-changements-comportements-mode-vie-plus-durable"
  },
  {
    date: "2026-11-27",
    titre: "S.P.A.M. : les journalistes sont-ils là pour nous influencer ?",
    source: "Lumni Enseignement (INA, CLEMI)",
    duree: "",
    url: "https://enseignants.lumni.fr/fiche-media/00000005747"
  },
  {
    date: "2026-11-30",
    titre: "Les clés des médias",
    source: "Lumni",
    duree: "2 min par épisode",
    url: "https://www.lumni.fr/programme/les-cles-des-medias"
  },
  {
    date: "2026-12-01",
    titre: "Comprendre le changement climatique",
    source: "ADEME",
    duree: "4 min",
    url: "https://agirpourlatransition.ademe.fr/acteurs-education/enseigner/video-courte-comprendre-changement-climatique"
  },
  {
    date: "2026-12-02",
    titre: "La sobriété numérique expliquée par des scientifiques",
    source: "UVED, avec l’ADEME",
    duree: "5 à 10 min par vidéo",
    url: "https://agirpourlatransition.ademe.fr/acteurs-education/se-former/catalogue/parcours-formation-sobriete-numerique"
  },
  {
    date: "2026-12-03",
    titre: "S’engager pour l’environnement dès 16 ans : bénévolat, service civique, volontariat",
    source: "ADEME (ConsoMag)",
    duree: "",
    url: "https://agirpourlatransition.ademe.fr/acteurs-education/enseigner/video-comment-les-etudiants-peuvent-sengager-ecologiquement"
  }
];
