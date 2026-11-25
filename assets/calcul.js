/* Mon petit cahier — moteur de calcul mental
   Génère les séries, analyse les erreurs, propose des conseils.
   Aucune dépendance : fonctionne dans le navigateur (window.Calcul) et dans Node (tests). */
(function (racine) {
  'use strict';

  // ---------- Outils ----------
  function hasard(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function choisir(liste) { return liste[Math.floor(Math.random() * liste.length)]; }
  function arrondi(x) { return Math.round(x * 1000) / 1000; }
  function egal(a, b) { return Math.abs(a - b) < 1e-9; }
  function fmt(x) { return String(arrondi(x)).replace('.', ','); }
  function melanger(t) {
    for (var i = t.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = t[i]; t[i] = t[j]; t[j] = x; }
    return t;
  }
  function lireReponse(texte) {
    if (texte === null || texte === undefined) return null;
    var t = String(texte).trim().replace(/\s+/g, '').replace(',', '.').replace('−', '-');
    if (t === '' || !/^-?\d*\.?\d+$/.test(t)) return null;
    return Number(t);
  }
  function chiffresDe(n) { return String(n).split('').reverse().map(Number); }

  var SIGNES = { add: '+', sub: '−', mul: '×', div: '÷' };
  var NOMS_OPS = { add: 'Additions', sub: 'Soustractions', mul: 'Multiplications', div: 'Divisions' };

  // ---------- Niveaux ----------
  var NIVEAUX = {
    1: { nom: 'Je reprends depuis le début', detail: 'nombres jusqu’à 20, tables de 2, 3, 5 et 10',
         add: ['add-petit'], sub: ['sub-petit'], mul: ['table-2', 'table-3', 'table-5', 'table-10'], div: ['div-table-2', 'div-table-5', 'div-table-10'] },
    2: { nom: 'Je connais un peu', detail: 'nombres jusqu’à 100, toutes les tables',
         add: ['add', 'add-retenue'], sub: ['sub', 'sub-emprunt'],
         mul: ['table-2', 'table-3', 'table-4', 'table-5', 'table-6', 'table-7', 'table-8', 'table-9'],
         div: ['div-table-2', 'div-table-3', 'div-table-4', 'div-table-5', 'div-table-6', 'div-table-7', 'div-table-8', 'div-table-9'] },
    3: { nom: 'Ça va bien', detail: 'nombres à 2 chiffres, avec retenues',
         add: ['add-retenue2'], sub: ['sub-emprunt2'], mul: ['mul-grand', 'mul-10'], div: ['div-grand', 'div-10'] },
    4: { nom: 'Je suis à l’aise', detail: 'nombres décimaux',
         add: ['dec-add'], sub: ['dec-sub'], mul: ['dec-mul', 'dec-10'], div: ['dec-div', 'dec-10d'] },
    5: { nom: 'Je veux un défi', detail: 'grands nombres et décimaux mélangés',
         add: ['add-3', 'dec-add'], sub: ['sub-3', 'dec-sub'], mul: ['mul-defi', 'dec-mul'], div: ['div-defi', 'dec-div'] }
  };

  // ---------- Générateurs par compétence ----------
  function q(op, a, b, rep, comp) {
    return { op: op, a: a, b: b, rep: arrondi(rep), comp: comp, texte: fmt(a) + ' ' + SIGNES[op] + ' ' + fmt(b) };
  }
  function avecRetenue(a, b) { var x = chiffresDe(a), y = chiffresDe(b); for (var i = 0; i < Math.max(x.length, y.length); i++) { if ((x[i] || 0) + (y[i] || 0) >= 10) return true; } return false; }
  function avecEmprunt(a, b) { var x = chiffresDe(a), y = chiffresDe(b); for (var i = 0; i < y.length; i++) { if ((x[i] || 0) < y[i]) return true; } return false; }

  var GEN = {
    'add-petit': function () { var a = hasard(2, 12), b = hasard(2, 20 - a); return q('add', a, b, a + b, 'add-petit'); },
    'sub-petit': function () { var a = hasard(6, 20), b = hasard(2, a - 1); return q('sub', a, b, a - b, 'sub-petit'); },
    'add': function () { var a, b; do { a = hasard(11, 79); b = hasard(2, 20); } while (avecRetenue(a, b) || a + b > 99); return q('add', a, b, a + b, 'add'); },
    'add-retenue': function () { var a, b; do { a = hasard(12, 88); b = hasard(3, 9); } while (!avecRetenue(a, b) || a + b > 99); return q('add', a, b, a + b, 'add-retenue'); },
    'add-retenue2': function () { var a, b; do { a = hasard(15, 79); b = hasard(13, 59); } while (!avecRetenue(a, b) || a + b > 150); return q('add', a, b, a + b, 'add-retenue2'); },
    'add-3': function () { var a, b; do { a = hasard(120, 780); b = hasard(35, 260); } while (!avecRetenue(a, b)); return q('add', a, b, a + b, 'add-3'); },
    'sub': function () { var a, b; do { a = hasard(25, 99); b = hasard(2, 19); } while (avecEmprunt(a, b)); return q('sub', a, b, a - b, 'sub'); },
    'sub-emprunt': function () { var a, b; do { a = hasard(21, 95); b = hasard(3, 9); } while (!avecEmprunt(a, b)); return q('sub', a, b, a - b, 'sub-emprunt'); },
    'sub-emprunt2': function () { var a, b; do { a = hasard(41, 98); b = hasard(12, a - 10); } while (!avecEmprunt(a, b)); return q('sub', a, b, a - b, 'sub-emprunt2'); },
    'sub-3': function () { var a, b; do { a = hasard(210, 950); b = hasard(45, 190); } while (!avecEmprunt(a, b)); return q('sub', a, b, a - b, 'sub-3'); },
    'mul-grand': function () { var a = hasard(12, 39), b = hasard(3, 6); if (a % 10 === 0) a++; return q('mul', a, b, a * b, 'mul-grand'); },
    'mul-10': function () { var a = hasard(3, 99), b = choisir([10, 100, 1000]); return Math.random() < .5 ? q('mul', a, b, a * b, 'mul-10') : q('mul', b, a, a * b, 'mul-10'); },
    'mul-defi': function () {
      var paires = [[12, 15], [25, 16], [14, 15], [25, 12], [11, 23], [15, 16], [12, 13]];
      var p = choisir(paires);
      if (Math.random() < .3) { var a = choisir([40, 60, 80, 30]), b = choisir([0.03, 0.02, 0.05]); return q('mul', a, b, arrondi(a * b), 'mul-defi'); }
      return q('mul', p[0], p[1], p[0] * p[1], 'mul-defi');
    },
    'div-grand': function () { var d = hasard(2, 6), qq = hasard(11, 30); if (d * qq > 99) { qq = Math.floor(99 / d); } return q('div', d * qq, d, qq, 'div-grand'); },
    'div-10': function () { var d = choisir([10, 100]); var qq = hasard(2, 60); return q('div', d * qq, d, qq, 'div-10'); },
    'div-defi': function () { var d = choisir([3, 4, 6, 7, 8, 12, 15]), qq = hasard(12, 45); return q('div', d * qq, d, qq, 'div-defi'); },
    'dec-add': function () { var a = hasard(11, 89), b = hasard(11, 69); if (Math.random() < .7) { while (a % 10 + b % 10 < 10) { a = hasard(11, 89); b = hasard(11, 69); } } return q('add', a / 10, b / 10, (a + b) / 10, 'dec-add'); },
    'dec-sub': function () { var a, b; do { a = hasard(25, 99); b = hasard(5, a - 5); } while (a % 10 >= b % 10 && Math.random() < .7); return q('sub', a / 10, b / 10, (a - b) / 10, 'dec-sub'); },
    'dec-mul': function () { var a = hasard(2, 9), b = hasard(2, 9); return Math.random() < .5 ? q('mul', a / 10, b, a * b / 10, 'dec-mul') : q('mul', b, a / 10, a * b / 10, 'dec-mul'); },
    'dec-10': function () { var a = hasard(12, 999) / choisir([10, 100]), b = choisir([10, 100, 1000]); return q('mul', arrondi(a), b, arrondi(a * b), 'dec-10'); },
    'dec-10d': function () { var a = hasard(3, 999), b = choisir([10, 100, 1000]); return q('div', a, b, arrondi(a / b), 'dec-10d'); },
    'dec-div': function () { var d = hasard(2, 5), qq = hasard(2, 9); var n = d * qq; return q('div', n / 10, d, qq / 10, 'dec-div'); }
  };
  // Tables : table-N (multiplication) et div-table-N (division)
  for (var t = 2; t <= 10; t++) {
    (function (n) {
      GEN['table-' + n] = function () { var m = hasard(2, 10); return Math.random() < .5 ? q('mul', n, m, n * m, 'table-' + n) : q('mul', m, n, n * m, 'table-' + n); };
      GEN['div-table-' + n] = function () { var m = hasard(2, 10); return q('div', n * m, n, m, 'div-table-' + n); };
    })(t);
  }

  function genererCompetence(comp) { return (GEN[comp] || GEN['add-petit'])(); }

  // Série normale : 10 calculs répartis sur les opérations choisies
  function serie(niveau, ops, n) {
    n = n || 10;
    var N = NIVEAUX[niveau] || NIVEAUX[1];
    var liste = [], ordre = melanger(ops.slice());
    for (var i = 0; i < n; i++) {
      var op = ordre[i % ordre.length];
      liste.push(genererCompetence(choisir(N[op])));
    }
    return eviterDoublons(melanger(liste), niveau, ops);
  }

  // Série ciblée : reprend les compétences ratées (environ 6 calculs) + 4 calculs du niveau
  function serieCiblee(niveau, ops, competences, n) {
    n = n || 10;
    if (!competences.length) return serie(niveau, ops, n);
    var nbCible = Math.min(n, Math.max(6, competences.length * 2));
    var liste = [];
    for (var i = 0; i < nbCible; i++) liste.push(genererCompetence(competences[i % competences.length]));
    var reste = serie(niveau, ops, n - nbCible);
    return eviterDoublons(melanger(liste.concat(reste)), niveau, ops);
  }

  function eviterDoublons(liste, niveau, ops) {
    var vus = {};
    return liste.map(function (x) {
      var essais = 0;
      while (vus[x.texte] && essais < 20) { x = genererCompetence(x.comp); essais++; }
      vus[x.texte] = true;
      return x;
    });
  }

  // ---------- Analyse des erreurs ----------
  function sansRetenue(a, b) { var x = chiffresDe(a), y = chiffresDe(b), r = []; for (var i = 0; i < Math.max(x.length, y.length); i++) r.push(((x[i] || 0) + (y[i] || 0)) % 10); return Number(r.reverse().join('')); }
  function petitMoinsGrand(a, b) { var x = chiffresDe(a), y = chiffresDe(b), r = []; for (var i = 0; i < x.length; i++) r.push(Math.abs((x[i] || 0) - (y[i] || 0))); return Number(r.reverse().join('')); }
  function decalageVirgule(rep, x) { var k = [10, 100, 1000]; for (var i = 0; i < k.length; i++) { if (egal(x, rep * k[i]) || egal(x, rep / k[i])) return true; } return false; }
  function entier(x) { return Math.abs(x - Math.round(x)) < 1e-9; }
  function estDecimal(qq) { return !entier(qq.a) || !entier(qq.b) || !entier(qq.rep); }

  function diagnostiquer(qq, reponse) {
    if (reponse === null || reponse === undefined || isNaN(reponse)) return 'vide';
    if (egal(reponse, qq.rep)) return 'juste';
    var a = qq.a, b = qq.b, rep = qq.rep;
    if (qq.op === 'add') {
      if (egal(reponse, a - b) || egal(reponse, b - a) || egal(reponse, a * b)) return 'signe';
      if (estDecimal(qq)) {
        var ia = Math.floor(a), ib = Math.floor(b), da = Math.round((a - ia) * 10), db = Math.round((b - ib) * 10);
        if (egal(reponse, Number((ia + ib) + '.' + (da + db))) || decalageVirgule(rep, reponse) || egal(reponse, rep - 1)) return 'virgule';
      } else if (egal(reponse, sansRetenue(a, b)) || egal(reponse, rep - 10) || egal(reponse, rep - 100)) return 'retenue';
    }
    if (qq.op === 'sub') {
      if (egal(reponse, a + b)) return 'signe';
      if (estDecimal(qq)) {
        if (decalageVirgule(rep, reponse) || egal(reponse, rep + 1) || egal(reponse, Number(String(petitMoinsGrand(Math.round(a * 10), Math.round(b * 10)) / 10)))) return 'virgule';
      } else if (egal(reponse, petitMoinsGrand(a, b)) || egal(reponse, rep + 10) || egal(reponse, rep + 100)) return 'emprunt';
    }
    if (qq.op === 'mul') {
      if (egal(reponse, a + b)) return 'signe';
      if (decalageVirgule(rep, reponse)) return 'virgule';
      if (/^table-/.test(qq.comp) || qq.comp === 'mul-grand' || qq.comp === 'mul-defi' || qq.comp === 'dec-mul') {
        if (egal(reponse, a * (b + 1)) || egal(reponse, a * (b - 1)) || egal(reponse, (a + 1) * b) || egal(reponse, (a - 1) * b) || /^table-/.test(qq.comp)) return 'table';
      }
    }
    if (qq.op === 'div') {
      if (egal(reponse, a * b) || egal(reponse, a - b)) return 'signe';
      if (decalageVirgule(rep, reponse)) return 'virgule';
      if (egal(reponse, rep + 1) || egal(reponse, rep - 1) || /^div-table-/.test(qq.comp)) return 'table-inverse';
    }
    if (Math.abs(reponse - rep) <= Math.max(2, Math.abs(rep) * 0.05)) return 'presque';
    return 'autre';
  }

  // ---------- Conseils ----------
  function astuceTable(x, y) {
    var t = Math.max(x, y), m = Math.min(x, y);
    if ((x === 7 && y === 8) || (x === 8 && y === 7)) return 'Retiens la suite « 5, 6, 7, 8 » : 56 = 7 × 8.';
    if (t === 9 || m === 9) { var autre = t === 9 ? m : t; return 'Table de 9 : 9 × ' + autre + ' = 10 × ' + autre + ' − ' + autre + ' = ' + (10 * autre) + ' − ' + autre + ' = ' + (9 * autre) + '.'; }
    if (t === 5 || m === 5) { var o = t === 5 ? m : t; return '× 5, c’est la moitié de × 10 : ' + o + ' × 10 = ' + (o * 10) + ', et la moitié fait ' + (o * 5) + '.'; }
    if (m >= 3) return 'Pars d’un calcul que tu connais : ' + t + ' × ' + (m - 1) + ' = ' + (t * (m - 1)) + ', puis ajoute encore ' + t + ' : ' + (t * m) + '.';
    return 'Récite la table de ' + t + ' jusqu’à ' + t + ' × ' + m + ' = ' + (t * m) + '.';
  }

  function methode(qq) {
    var a = qq.a, b = qq.b, rep = qq.rep;
    if (estDecimal(qq) && (qq.op === 'add' || qq.op === 'sub')) {
      var A = Math.round(a * 10), B = Math.round(b * 10);
      return 'Compte en dixièmes : ' + fmt(a) + ' = ' + A + ' dixièmes et ' + fmt(b) + ' = ' + B + ' dixièmes. ' + A + ' ' + SIGNES[qq.op] + ' ' + B + ' = ' + (qq.op === 'add' ? A + B : A - B) + ' dixièmes, donc ' + fmt(rep) + '.';
    }
    if ((qq.op === 'mul' || qq.op === 'div') && ([10, 100, 1000].indexOf(b) >= 0 || [10, 100, 1000].indexOf(a) >= 0)) {
      var k = [10, 100, 1000].indexOf(b) >= 0 ? b : a, rangs = String(k).length - 1;
      return (qq.op === 'mul' ? 'Multiplier' : 'Diviser') + ' par ' + k + ', c’est rendre le nombre ' + k + ' fois plus ' + (qq.op === 'mul' ? 'grand' : 'petit') + ' : chaque chiffre avance de ' + rangs + ' rang' + (rangs > 1 ? 's' : '') + ' vers la ' + (qq.op === 'mul' ? 'gauche' : 'droite') + '. Résultat : ' + fmt(rep) + '.';
    }
    if (qq.op === 'add') {
      var u = b % 10, d = b - u;
      if (d === 0) return 'Complète d’abord jusqu’à la dizaine : ' + a + ' + ' + (10 - a % 10) + ' = ' + (a + 10 - a % 10) + ', puis ajoute le reste. Résultat : ' + rep + '.';
      return 'Ajoute d’abord ' + d + ' : ' + a + ' + ' + d + ' = ' + (a + d) + ', puis les unités : ' + (a + d) + ' + ' + u + ' = ' + rep + '.';
    }
    if (qq.op === 'sub') {
      var u2 = b % 10, d2 = b - u2;
      if (d2 === 0) return 'Enlève en deux fois : ' + a + ' − ' + (a % 10) + ' = ' + (a - a % 10) + ', puis encore ' + (b - a % 10) + ' : ' + rep + '. Vérifie : ' + rep + ' + ' + b + ' = ' + a + '.';
      return 'Enlève d’abord ' + d2 + ' : ' + a + ' − ' + d2 + ' = ' + (a - d2) + ', puis les unités : ' + (a - d2) + ' − ' + u2 + ' = ' + rep + '.';
    }
    if (qq.op === 'mul') {
      if (estDecimal(qq)) {
        var dec = entier(a) ? b : a, ent = entier(a) ? a : b;
        return 'Calcule sans la virgule : ' + Math.round(dec * 10) + ' × ' + fmt(ent) + ' = ' + Math.round(dec * 10 * ent) + ', puis remets la virgule (1 chiffre après) : ' + fmt(rep) + '.';
      }
      if (a <= 10 && b <= 10) return astuceTable(a, b);
      var grand = Math.max(a, b), petit = Math.min(a, b), dz = grand - grand % 10;
      return 'Découpe ' + grand + ' en ' + dz + ' + ' + (grand % 10) + ' : ' + dz + ' × ' + petit + ' = ' + (dz * petit) + ', ' + (grand % 10) + ' × ' + petit + ' = ' + ((grand % 10) * petit) + ', total ' + rep + '.';
    }
    if (qq.op === 'div') {
      if (estDecimal(qq)) return 'Pense en dixièmes : ' + fmt(a) + ' = ' + Math.round(a * 10) + ' dixièmes. ' + Math.round(a * 10) + ' ÷ ' + b + ' = ' + Math.round(rep * 10) + ' dixièmes, donc ' + fmt(rep) + '.';
      if (rep <= 10) return 'Une division, c’est une table à l’envers : cherche ' + b + ' × ? = ' + a + '. Comme ' + b + ' × ' + rep + ' = ' + a + ', la réponse est ' + rep + '.';
      var dzq = rep - rep % 10;
      return 'Découpe ' + a + ' en ' + (b * dzq) + ' + ' + (a - b * dzq) + ' : ' + (b * dzq) + ' ÷ ' + b + ' = ' + dzq + ' et ' + (a - b * dzq) + ' ÷ ' + b + ' = ' + (rep - dzq) + ', total ' + rep + '.';
    }
    return '';
  }

  var INTROS = {
    vide: 'Pas de réponse, ce n’est pas grave. Voici comment faire.',
    retenue: 'La retenue t’a échappé.',
    emprunt: 'Attention à l’emprunt : on ne fait pas « le grand moins le petit » dans chaque colonne.',
    table: 'Cette table mérite un petit tour.',
    'table-inverse': 'Une division se trouve avec les tables.',
    virgule: 'Attention à la place de la virgule.',
    signe: 'Regarde bien le signe de l’opération.',
    presque: 'Tu étais tout près ! Vérifie avec l’opération inverse.',
    autre: 'Reprenons ce calcul tranquillement.'
  };

  function conseil(qq, diag) {
    var intro = INTROS[diag] || INTROS.autre;
    if (diag === 'signe') intro = 'Regarde bien le signe : ici, c’est ' + ({ add: 'une addition', sub: 'une soustraction', mul: 'une multiplication', div: 'une division' })[qq.op] + '.';
    return intro + ' ' + methode(qq);
  }

  // Quelle fiche relire selon la compétence ?
  function ficheConseillee(comp) {
    if (/^dec-|mul-defi/.test(comp)) return { slug: 'decimaux-fractions', titre: 'Décimaux et fractions' };
    return { slug: 'operations', titre: 'Les 4 opérations' };
  }

  // Bilan complet d'une série
  function bilan(questions, reponses) {
    var details = questions.map(function (qq, i) {
      var r = lireReponse(reponses[i]);
      var d = diagnostiquer(qq, r);
      return { q: qq, brut: reponses[i], reponse: r, diag: d, juste: d === 'juste', conseil: d === 'juste' ? '' : conseil(qq, d) };
    });
    var parOp = {};
    details.forEach(function (x) { var o = parOp[x.q.op] || (parOp[x.q.op] = { total: 0, justes: 0 }); o.total++; if (x.juste) o.justes++; });
    var erreurs = details.filter(function (x) { return !x.juste; });
    // Un conseil par type d'erreur en priorité, puis les autres
    var vusDiag = {}, prioritaires = [], autres = [];
    erreurs.forEach(function (x) { (vusDiag[x.diag + x.q.op] ? autres : prioritaires).push(x); vusDiag[x.diag + x.q.op] = true; });
    var competences = [];
    erreurs.forEach(function (x) { if (competences.indexOf(x.q.comp) < 0) competences.push(x.q.comp); });
    return {
      score: details.length - erreurs.length, total: details.length, details: details, parOp: parOp,
      aRevoir: prioritaires.concat(autres), competences: competences
    };
  }

  var api = {
    NIVEAUX: NIVEAUX, SIGNES: SIGNES, NOMS_OPS: NOMS_OPS,
    serie: serie, serieCiblee: serieCiblee, genererCompetence: genererCompetence,
    diagnostiquer: diagnostiquer, conseil: conseil, methode: methode, bilan: bilan,
    lireReponse: lireReponse, fmt: fmt, ficheConseillee: ficheConseillee, competences: Object.keys(GEN)
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else racine.Calcul = api;
})(this);
