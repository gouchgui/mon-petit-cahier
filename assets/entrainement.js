/* Mon petit cahier — page d'entraînement */
(function () {
  'use strict';
  var C = window.Calcul;
  var $ = function (id) { return document.getElementById(id); };
  var MAX_ESSAIS = 3;

  var etat = { niveau: 2, ops: ['add', 'sub', 'mul', 'div'], chrono: false, questions: [], reponses: [], i: 0, essai: 1, competences: [], debut: 0, minuteur: null };

  // ---------- Réglages ----------
  function chargerReglages() {
    var p = Profils.actif();
    var r = p && p.reglages;
    etat.niveau = (r && r.niveau) || 2;
    etat.ops = (r && r.ops && r.ops.length) ? r.ops : ['add', 'sub', 'mul', 'div'];
    etat.chrono = !!(r && r.chrono);
    document.querySelectorAll('input[name="op"]').forEach(function (c) { c.checked = etat.ops.indexOf(c.value) >= 0; });
    $('opt-chrono').checked = etat.chrono;
    choisirNiveau(etat.niveau);
  }
  function sauverReglages() {
    Profils.modifier(function (p) { p.reglages = { niveau: etat.niveau, ops: etat.ops, chrono: etat.chrono }; });
  }

  // ---------- Pseudo ----------
  function afficherPseudo() {
    var p = Profils.actif();
    $('pseudo-choix').classList.toggle('cache', !!p);
    $('pseudo-actif').classList.toggle('cache', !p);
    $('confirmer-effacer').classList.add('cache');
    if (p) {
      $('pseudo-nom').textContent = p.nom;
    } else {
      var liste = $('pseudos-existants'); liste.innerHTML = '';
      var noms = Profils.liste();
      $('pseudos-zone').classList.toggle('cache', !noms.length);
      noms.forEach(function (nom) {
        var b = el('button', { type: 'button', class: 'btn clair', texte: nom });
        b.addEventListener('click', function () { Profils.choisir(nom); toutRafraichir(); });
        liste.appendChild(b);
      });
    }
  }

  // ---------- Mes progrès ----------
  function serieDeJours(h) {
    var jours = {}; h.forEach(function (s) { jours[s.date] = true; });
    var d = new Date(), n = 0;
    if (!jours[Dates.isoLocal(d)]) d.setDate(d.getDate() - 1);
    while (jours[Dates.isoLocal(d)]) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  function afficherProgres() {
    var p = Profils.actif(), bloc = $('progres');
    var h = (p && p.historique) || [];
    bloc.classList.toggle('cache', !p);
    if (!p) return;
    $('progres-titre').textContent = 'Les progrès de ' + p.nom;
    $('progres-vide').classList.toggle('cache', h.length > 0);
    $('progres-plein').classList.toggle('cache', h.length === 0);
    if (!h.length) return;

    var jours = {}; h.forEach(function (s) { jours[s.date] = true; });
    var n = serieDeJours(h);
    $('st-seances').textContent = h.length;
    $('st-jours').textContent = Object.keys(jours).length;
    $('st-serie').textContent = n + (n > 1 ? ' jours' : ' jour');

    // 10 dernières séances
    var graph = $('dernieres'); graph.innerHTML = '';
    h.slice(-10).forEach(function (s) {
      var col = el('div', { class: 'col', title: s.score + '/' + s.total + ' · niveau ' + s.niveau });
      col.appendChild(el('span', { class: 'col-val', texte: s.score }));
      col.appendChild(el('div', { class: 'col-zone' }, [el('div', { class: 'col-barre', style: 'height:' + Math.max(4, Math.round(100 * s.score / s.total)) + '%' })]));
      col.appendChild(el('span', { class: 'col-niv', texte: 'N' + s.niveau }));
      graph.appendChild(col);
    });
    graph.setAttribute('aria-label', 'Scores des dernières séances : ' + h.slice(-10).map(function (s) { return s.score + ' sur ' + s.total; }).join(', '));

    // Meilleur score par niveau
    var meilleurs = $('meilleurs'); meilleurs.innerHTML = '';
    for (var niv = 1; niv <= 5; niv++) {
      var deNiv = h.filter(function (s) { return s.niveau === niv; });
      var best = deNiv.length ? Math.max.apply(null, deNiv.map(function (s) { return s.score; })) : null;
      meilleurs.appendChild(el('div', { class: 'tuile' + (best === 10 ? ' parfait' : '') }, [
        el('span', { class: 'petit', texte: 'Niveau ' + niv }),
        el('b', { texte: best === null ? '–' : best + '/10' })
      ]));
    }

    // Réussite par opération sur les 20 dernières séances
    var cumul = {};
    h.slice(-20).forEach(function (s) {
      Object.keys(s.parOp || {}).forEach(function (op) {
        var c = cumul[op] || (cumul[op] = { justes: 0, total: 0 });
        c.justes += s.parOp[op].justes; c.total += s.parOp[op].total;
      });
    });
    var ops = $('progres-ops'); ops.innerHTML = '';
    ['add', 'sub', 'mul', 'div'].forEach(function (op) {
      var c = cumul[op]; if (!c) return;
      var pct = Math.round(100 * c.justes / c.total);
      ops.appendChild(el('div', {}, [
        el('div', { class: 'barre-tete' }, [el('span', { texte: C.NOMS_OPS[op] }), el('span', { texte: pct + ' % de réussite' })]),
        el('div', { class: 'barre', role: 'img', 'aria-label': pct + ' % de réussite' }, [el('div', { style: 'width:' + pct + '%' })])
      ]));
    });
  }

  function toutRafraichir() { afficherPseudo(); chargerReglages(); afficherProgres(); }
  function choisirNiveau(n) {
    etat.niveau = n;
    document.querySelectorAll('.niveaux button').forEach(function (b) {
      var v = +b.dataset.niveau;
      b.setAttribute('aria-pressed', v === n ? 'true' : 'false');
      b.classList.toggle('plein', v < n);
    });
    var N = C.NIVEAUX[n];
    $('niv-desc').textContent = 'Niveau ' + n + ' sur 5 · ' + N.nom;
    $('niv-detail').textContent = N.detail.charAt(0).toUpperCase() + N.detail.slice(1) + '.';
  }

  // ---------- Écrans ----------
  function montrer(id) {
    ['reglages', 'jeu', 'bilan'].forEach(function (x) { $(x).classList.toggle('cache', x !== id); });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function commencer(questions) {
    etat.questions = questions;
    etat.reponses = [];
    etat.i = 0;
    etat.debut = Date.now();
    clearInterval(etat.minuteur);
    $('chrono').classList.toggle('cache', !etat.chrono);
    if (etat.chrono) { etat.minuteur = setInterval(majChrono, 1000); majChrono(); }
    montrer('jeu');
    afficherQuestion();
  }

  function majChrono() {
    var s = Math.floor((Date.now() - etat.debut) / 1000);
    $('chrono').textContent = 'Temps : ' + Math.floor(s / 60) + ' min ' + String(s % 60).padStart(2, '0') + ' s';
  }

  function afficherQuestion() {
    var q = etat.questions[etat.i];
    $('numero').textContent = 'Calcul ' + (etat.i + 1) + ' sur ' + etat.questions.length;
    $('calcul').textContent = q.texte + ' = ?';
    var pts = $('points'); pts.innerHTML = '';
    etat.questions.forEach(function (_, k) {
      var p = document.createElement('i');
      if (k < etat.i) p.className = 'fait'; else if (k === etat.i) p.className = 'actuel';
      pts.appendChild(p);
    });
    var champ = $('rep');
    champ.value = '';
    champ.focus();
  }

  function valider(e) {
    e.preventDefault();
    etat.reponses.push($('rep').value);
    etat.i++;
    if (etat.i < etat.questions.length) afficherQuestion(); else terminer();
  }

  // ---------- Bilan ----------
  function terminer() {
    clearInterval(etat.minuteur);
    var b = C.bilan(etat.questions, etat.reponses);
    etat.competences = b.competences;
    var duree = Math.round((Date.now() - etat.debut) / 1000);

    // Mémoire
    Profils.modifier(function (p) {
      p.historique = (p.historique || []).concat([{ date: Dates.isoLocal(new Date()), niveau: etat.niveau, ops: etat.ops, score: b.score, total: b.total, essai: etat.essai, duree: duree, parOp: b.parOp }]).slice(-200);
    });
    afficherProgres();

    $('score').innerHTML = b.score + '<small>/' + b.total + '</small>';
    $('essai').textContent = 'Niveau ' + etat.niveau + ' · essai ' + etat.essai + ' sur ' + MAX_ESSAIS + (etat.chrono ? ' · ' + Math.floor(duree / 60) + ' min ' + String(duree % 60).padStart(2, '0') + ' s' : '');

    // Barres par opération
    var barres = $('barres'); barres.innerHTML = '';
    ['add', 'sub', 'mul', 'div'].forEach(function (op) {
      var o = b.parOp[op]; if (!o) return;
      var pct = Math.round(100 * o.justes / o.total);
      var ligne = el('div', {}, [
        el('div', { class: 'barre-tete' }, [el('span', { texte: C.NOMS_OPS[op] }), el('span', { texte: o.justes + ' sur ' + o.total })]),
        el('div', { class: 'barre', role: 'img', 'aria-label': o.justes + ' bonnes réponses sur ' + o.total }, [el('div', { style: 'width:' + pct + '%' })])
      ]);
      barres.appendChild(ligne);
    });

    // Mon petit mot
    var mot = $('mot'); mot.innerHTML = '';
    if (b.score === b.total) {
      mot.className = 'mot bravo';
      mot.appendChild(el('h3', { texte: 'Bravo, tout est juste !' }));
      mot.appendChild(el('p', { texte: etat.niveau < 5 ? 'Tu peux refaire une série pour confirmer, ou essayer le niveau ' + (etat.niveau + 1) + '.' : 'Tu maîtrises le niveau le plus difficile. Chapeau !' }));
    } else {
      mot.className = 'mot';
      mot.appendChild(el('h3', { texte: 'Mon petit mot' }));
      b.aRevoir.slice(0, 3).forEach(function (x) {
        var p = el('p');
        var fort = el('b', { texte: x.q.texte + ' = ' + C.fmt(x.q.rep) + '. ' });
        p.appendChild(fort);
        p.appendChild(document.createTextNode(x.conseil));
        mot.appendChild(p);
      });
      if (b.aRevoir.length > 3) mot.appendChild(el('p', { class: 'petit', texte: 'Les autres corrections sont dans le détail ci-dessous.' }));
    }

    // Détail des 10 calculs
    var liste = $('detail-liste'); liste.innerHTML = '';
    b.details.forEach(function (x) {
      var li = el('li');
      li.appendChild(document.createTextNode(x.q.texte + ' = '));
      if (x.juste) { li.appendChild(el('span', { class: 'ok', texte: C.fmt(x.q.rep) + ' ✓' })); }
      else {
        if (x.reponse !== null) { li.appendChild(el('span', { class: 'barre-txt', texte: String(x.brut).trim() })); li.appendChild(document.createTextNode(' ')); }
        li.appendChild(el('span', { class: 'ko', texte: C.fmt(x.q.rep) }));
        li.appendChild(el('div', { class: 'petit', texte: x.conseil }));
      }
      liste.appendChild(li);
    });

    // Boutons
    var retenter = $('retenter'), fiche = $('fiche'), finEssais = $('fin-essais');
    finEssais.classList.add('cache');
    if (b.score === b.total) {
      retenter.classList.add('cache');
      $('monter').classList.toggle('cache', etat.niveau >= 5);
    } else {
      $('monter').classList.add('cache');
      if (etat.essai < MAX_ESSAIS) {
        retenter.classList.remove('cache');
        retenter.textContent = 'Je retente · essai ' + (etat.essai + 1) + ' sur ' + MAX_ESSAIS;
      } else {
        retenter.classList.add('cache');
        finEssais.classList.remove('cache');
      }
    }
    var f = C.ficheConseillee(b.competences[0] || 'add');
    fiche.href = '../bases/' + f.slug + '/index.html';
    fiche.textContent = 'Revoir la fiche « ' + f.titre + ' »';
    fiche.classList.toggle('cache', b.score === b.total);

    montrer('bilan');
  }

  // ---------- Démarrage ----------
  document.addEventListener('DOMContentLoaded', function () {
    toutRafraichir();
    $('form-pseudo').addEventListener('submit', function (e) {
      e.preventDefault();
      var nom = $('pseudo').value.trim();
      if (!Profils.valide(nom)) { $('pseudo-alerte').textContent = 'Entre 2 et 20 caractères : lettres, chiffres, espace, tiret.'; return; }
      $('pseudo-alerte').textContent = '';
      $('pseudo').value = '';
      Profils.choisir(nom);
      toutRafraichir();
    });
    $('changer-pseudo').addEventListener('click', function () { Profils.quitter(); toutRafraichir(); });
    $('effacer-pseudo').addEventListener('click', function () { $('confirmer-effacer').classList.remove('cache'); });
    $('effacer-non').addEventListener('click', function () { $('confirmer-effacer').classList.add('cache'); });
    $('effacer-oui').addEventListener('click', function () { var p = Profils.actif(); if (p) Profils.supprimer(p.nom); toutRafraichir(); });
    document.querySelectorAll('.niveaux button').forEach(function (b) {
      b.addEventListener('click', function () { choisirNiveau(+b.dataset.niveau); sauverReglages(); });
    });
    $('form-reglages').addEventListener('submit', function (e) {
      e.preventDefault();
      etat.ops = Array.prototype.map.call(document.querySelectorAll('input[name="op"]:checked'), function (c) { return c.value; });
      etat.chrono = $('opt-chrono').checked;
      if (!Profils.actif()) { $('alerte').textContent = 'Choisis d’abord ton pseudo, tout en haut.'; $('pseudo').focus(); return; }
      if (!etat.ops.length) { $('alerte').textContent = 'Choisis au moins une opération.'; return; }
      $('alerte').textContent = '';
      sauverReglages();
      etat.essai = 1;
      commencer(C.serie(etat.niveau, etat.ops));
    });
    $('form-rep').addEventListener('submit', valider);
    $('arreter').addEventListener('click', function () { clearInterval(etat.minuteur); montrer('reglages'); });
    $('retenter').addEventListener('click', function () { etat.essai++; commencer(C.serieCiblee(etat.niveau, etat.ops, etat.competences)); });
    $('nouvelle').addEventListener('click', function () { etat.essai = 1; commencer(C.serie(etat.niveau, etat.ops)); });
    $('monter').addEventListener('click', function () { choisirNiveau(Math.min(5, etat.niveau + 1)); sauverReglages(); etat.essai = 1; commencer(C.serie(etat.niveau, etat.ops)); });
    $('changer').addEventListener('click', function () { montrer('reglages'); });
    $('voir-progres').addEventListener('click', function () { montrer('reglages'); setTimeout(function () { $('progres').scrollIntoView({ behavior: 'smooth' }); }, 50); });
  });
})();
