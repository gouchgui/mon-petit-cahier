/* Mon petit cahier — fonctions communes à toutes les pages */
(function () {
  'use strict';

  // ---------- Mémoire sur l'appareil de l'élève (rien n'est envoyé) ----------
  var CLE = 'mon-petit-cahier-v1';
  window.Memoire = {
    lire: function () {
      try { return JSON.parse(localStorage.getItem(CLE)) || {}; } catch (e) { return {}; }
    },
    ecrire: function (donnees) {
      try { localStorage.setItem(CLE, JSON.stringify(donnees)); } catch (e) { /* navigation privée : on ignore */ }
    }
  };

  // ---------- Pseudos (plusieurs élèves peuvent partager un appareil) ----------
  function cle(p) { return String(p).trim().toLowerCase(); }
  window.Profils = {
    valide: function (p) { return /^[A-Za-zÀ-ÿ0-9 _-]{2,20}$/.test(String(p).trim()); },
    liste: function () {
      var m = Memoire.lire(), pr = m.profils || {};
      return Object.keys(pr).map(function (k) { return pr[k].nom; }).sort(function (a, b) { return a.localeCompare(b, 'fr'); });
    },
    actif: function () {
      var m = Memoire.lire();
      return (m.actif && m.profils && m.profils[m.actif]) ? m.profils[m.actif] : null;
    },
    choisir: function (nom) {
      var m = Memoire.lire(); m.profils = m.profils || {};
      var k = cle(nom);
      if (!m.profils[k]) m.profils[k] = { nom: String(nom).trim(), cree: isoLocal(new Date()), historique: [], reglages: null };
      m.actif = k; Memoire.ecrire(m);
      return m.profils[k];
    },
    quitter: function () { var m = Memoire.lire(); m.actif = null; Memoire.ecrire(m); },
    supprimer: function (nom) {
      var m = Memoire.lire(), k = cle(nom);
      if (m.profils) delete m.profils[k];
      if (m.actif === k) m.actif = null;
      Memoire.ecrire(m);
    },
    modifier: function (fn) {
      var m = Memoire.lire();
      if (!m.actif || !m.profils || !m.profils[m.actif]) return;
      fn(m.profils[m.actif]); Memoire.ecrire(m);
    }
  };

  // ---------- Dates ----------
  var JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  var MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  function isoLocal(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function dateDe(iso) { var p = iso.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function joli(d) { var t = JOURS[d.getDay()] + ' ' + d.getDate() + ' ' + MOIS[d.getMonth()]; return t.charAt(0).toUpperCase() + t.slice(1); }
  window.Dates = { isoLocal: isoLocal, dateDe: dateDe, joli: joli, JOURS: JOURS };

  // ---------- Vidéos ----------
  function themeDu(iso) { var j = dateDe(iso).getDay(); return (window.THEMES || {})[j] || null; }
  function idYoutube(url) {
    var m = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/.exec(url || '');
    return m ? m[1] : null;
  }
  function videosPassees() {
    var aujourdhui = isoLocal(new Date());
    return (window.VIDEOS || []).filter(function (v) { return v.date <= aujourdhui; })
      .sort(function (a, b) { return a.date < b.date ? 1 : -1; });
  }
  function videoDuJour() {
    var aujourdhui = isoLocal(new Date());
    var liste = videosPassees();
    if (!liste.length) return null;
    return { video: liste[0], duJour: liste[0].date === aujourdhui };
  }
  window.Videos = { themeDu: themeDu, idYoutube: idYoutube, passees: videosPassees, duJour: videoDuJour };

  function el(tag, attrs, enfants) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { if (k === 'texte') n.textContent = attrs[k]; else n.setAttribute(k, attrs[k]); });
    (enfants || []).forEach(function (e) { if (e) n.appendChild(e); });
    return n;
  }
  window.el = el;

  // Remplit le bloc « Le petit plus du jour » s'il est présent sur la page
  function afficherVideo() {
    var bloc = document.getElementById('video-du-jour');
    if (!bloc) return;
    var res = videoDuJour();
    var titre = bloc.querySelector('[data-v="titre"]');
    var source = bloc.querySelector('[data-v="source"]');
    var pastille = bloc.querySelector('[data-v="pastille"]');
    var ecran = bloc.querySelector('[data-v="ecran"]');
    var quand = bloc.querySelector('[data-v="quand"]');
    if (!res) {
      titre.textContent = 'Pas encore de vidéo cette semaine.';
      source.textContent = 'Reviens demain !';
      pastille.classList.add('cache');
      return;
    }
    var v = res.video, th = themeDu(v.date);
    titre.textContent = v.titre;
    source.textContent = 'Source : ' + v.source;
    pastille.textContent = [th ? th.court : '', v.duree].filter(Boolean).join(' · ');
    if (!pastille.textContent) pastille.classList.add('cache');
    if (quand && !res.duJour) quand.textContent = 'Pas de nouvelle vidéo aujourd’hui. Voici celle du ' + joli(dateDe(v.date)).toLowerCase() + '.';
    var id = idYoutube(v.url);
    ecran.innerHTML = '';
    if (id) {
      ecran.appendChild(el('iframe', {
        src: 'https://www.youtube-nocookie.com/embed/' + id,
        title: v.titre, loading: 'lazy',
        allow: 'accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen',
        referrerpolicy: 'strict-origin-when-cross-origin'
      }));
    } else {
      var lien = el('a', { href: v.url, target: '_blank', rel: 'noopener', class: 'ecran', 'aria-label': 'Regarder la vidéo « ' + v.titre + ' » (nouvel onglet)', style: 'width:100%;height:100%;flex-direction:column;gap:10px;color:var(--violet);font-weight:800' });
      lien.innerHTML = '<span class="lecture"><svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5l12 7-12 7z" fill="#4A3F7A"></path></svg></span><span>Regarder sur le site de la source</span>';
      ecran.appendChild(lien);
    }
  }

  // Dernière séance sur l'accueil
  function afficherDerniere() {
    var bloc = document.getElementById('derniere');
    if (!bloc) return;
    var p = Profils.actif();
    if (!p) return;
    var h = p.historique || [];
    if (!h.length) { bloc.textContent = 'Bonjour ' + p.nom + ' ! Prêt pour ta première séance ?'; }
    else {
      var d = h[h.length - 1];
      bloc.textContent = 'Bonjour ' + p.nom + ' ! Ta dernière séance : ' + d.score + '/' + d.total + ' au niveau ' + d.niveau + '. On continue ?';
    }
    bloc.classList.remove('cache');
  }

  function dateDuJour() {
    document.querySelectorAll('[data-aujourdhui]').forEach(function (n) { n.textContent = joli(new Date()); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    dateDuJour(); afficherVideo(); afficherDerniere();
  });
})();
