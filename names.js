// Corrige nomes próprios no texto em inglês usando o glossário da igreja (glossario.json).
// Ex.: "Pastor Ceri", "Pastor Therese" -> "Pastor Cerise"; "Pastor Marco" -> "Pastor Márcio".
(function(){
  const strip = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  function lev(a, b){
    const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
    let prev = Array.from({ length: n + 1 }, (_, j) => j);
    for (let i = 1; i <= m; i++) {
      const cur = [i];
      for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return prev[n];
  }
  let names = [];   // nomes canônicos (primeiro nome), ex. "Cerise"
  function setGlossary(g){
    const set = new Set();
    for (const raw of (g && g.nomes) || []) {
      const base = raw.replace(/\s*\(.*\)\s*$/, '').trim();
      const nm = base.replace(/^(Pastora|Pastor|Irmã|Irmão|Pr\.?|Pra\.?)\s+/i, '').trim();
      if (nm) set.add(nm.split(/\s+/)[0]);
    }
    names = [...set];
  }
  function best(word){
    const w = strip(word); if (!w) return null;
    let pick = null, score = 0, second = 0;
    for (const n of names) {
      const t = strip(n);
      let sc = 1 - lev(w, t) / Math.max(w.length, t.length);
      if (w.length >= 2 && w.length <= 4 && t.startsWith(w)) sc = Math.max(sc, 0.75);
      if (sc > score) { second = score; score = sc; pick = n; } else if (sc > second) second = sc;
    }
    return { pick, score, margin: score - second };
  }
  const COMMON = new Set(['christ','christian','god','lord','jesus','spirit','father','king','word','amen','grace','mark','john','luke','james','paul','peter','mary','david','moses','abraham','sarah','israel','church','sister','brother']);
  function fixNames(text){
    if (!text || !names.length) return text;
    // 1) Depois de um título: limiar mais baixo.
    text = text.replace(/\b(Pastor|Pastora|Pastors|Sister|Brother|Ps\.)\s+([A-Z][A-Za-zÀ-ÿ]*)/g, (all, title, word) => {
      if (COMMON.has(word.toLowerCase())) return all;
      const b = best(word);
      return (b && b.score >= 0.45 && b.margin >= 0.08) ? (title === 'Pastora' ? 'Pastor' : title) + ' ' + b.pick : all;
    });
    // 2) Nome solto: só quando é muito parecido.
    text = text.replace(/\b([A-Z][a-zà-ÿ]{3,})\b/g, (all, word) => {
      if (COMMON.has(word.toLowerCase())) return all;
      const b = best(word);
      return (b && b.score >= 0.75 && b.margin >= 0.15 && strip(word) !== strip(b.pick)) ? b.pick : all;
    });
    return text;
  }
  window.AlcanceNames = { setGlossary, fixNames };
  fetch('glossario.json', { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(g => { if (g) setGlossary(g); }).catch(() => {});
})();
