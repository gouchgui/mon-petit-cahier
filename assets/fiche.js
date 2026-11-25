/* Mon petit cahier — « Je vérifie » sur les fiches */
(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.verif-ligne').forEach(function (ligne) {
      var champ = ligne.querySelector('input');
      var res = ligne.querySelector('.res');
      var attendu = Number(ligne.dataset.rep);
      ligne.querySelector('form').addEventListener('submit', function (e) {
        e.preventDefault();
        var r = Calcul.lireReponse(champ.value);
        if (r === null) { res.textContent = 'Écris un nombre.'; res.className = 'res'; return; }
        if (Math.abs(r - attendu) < 1e-9) { res.textContent = 'Juste !'; res.className = 'res ok'; }
        else { res.textContent = 'Pas encore. Relis l’exemple et réessaie.'; res.className = 'res ko'; }
      });
      ligne.querySelector('[data-voir]').addEventListener('click', function () {
        res.textContent = 'Réponse : ' + Calcul.fmt(attendu);
        res.className = 'res';
      });
    });
  });
})();
