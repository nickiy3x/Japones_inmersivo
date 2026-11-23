const vectorIcon = (()=>{
  const s=(p,o={})=>`<svg width="${o.s||24}" height="${o.s||24}" viewBox="0 0 24 24" fill="${o.f||'none'}" stroke="currentColor" stroke-width="${o.w||2}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const P={
    back:'<path d="M15 18l-6-6 6-6"/>',
    close:'<path d="M18 6L6 18M6 6l12 12"/>',
    chev:'<path d="M9 18l6-6-6-6"/>',
    play:'<path d="M7 5l12 7-12 7z" fill="currentColor" stroke="none"/>',
    turtle:'<path d="M3 15c0-4 3.5-7 8-7s8 3 8 7H3z"/><path d="M19 15h2l-1-3"/><path d="M6 15v3M16 15v3"/><path d="M8 8.5l3 6.5 3-6.5"/>',
    mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/>',
    kb:'<rect x="2" y="6" width="20" height="12" rx="3"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>',
    send:'<path d="M5 12h14M13 6l6 6-6 6"/>',
    bulb:'<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0012 3z"/>',
    layers:'<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>',
    expand:'<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>',
    door:'<path d="M5 21V4a1 1 0 011-1h12a1 1 0 011 1v17"/><path d="M3 21h18M14 12h.01"/>',
    book:'<path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2V5z"/><path d="M4 19a2 2 0 012-2h13"/>',
    egg:'<path d="M12 3c3.5 0 7 6 7 10a7 7 0 01-14 0c0-4 3.5-10 7-10z"/>',
    bowl:'<path d="M3 11h18a9 9 0 01-18 0z"/><path d="M8 7c0-1 1-1.5 1-2.5M12 7c0-1 1-1.5 1-2.5M16 7c0-1 1-1.5 1-2.5"/><path d="M9 20h6"/>',
    yen:'<path d="M6 3l6 8 6-8M12 11v10M7 13h10M7 17h10"/>',
    check:'<path d="M5 12.5l4.5 4.5L19 7"/>',
    star:'<path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.3l-5.6 2.9 1.1-6.3L2.9 9.5l6.3-.9z"/>',
    flame:'<path d="M12 22c4 0 7-2.7 7-6.8 0-3.5-2.4-5.6-3.5-7.7-.6 1.7-1.6 2.8-2.7 3.2.3-3.3-1-6.4-3.8-8.7.2 3.2-2 5.4-3.5 7.4C4.4 11.2 5 13.6 5 15.2 5 19.3 8 22 12 22z"/>',
    cap:'<path d="M2 9l10-5 10 5-10 5L2 9z"/><path d="M6 11v5c3 2.5 9 2.5 12 0v-5"/>',
    chat:'<path d="M21 12a8 8 0 01-11.8 7L4 20.5 5.5 16A8 8 0 1121 12z"/>',
    dict:'<path d="M4 4h10a4 4 0 014 4v12H8a4 4 0 01-4-4V4z"/><path d="M8 8h6M8 12h4"/>',
    user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/>',
    search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    pen:'<path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/>',
    mask:'<path d="M4 6c3 1.5 13 1.5 16 0v6a8 8 0 01-16 0V6z"/><path d="M8.5 11h1M14.5 11h1M9 15c1.5 1 4.5 1 6 0"/>',
    brief:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M3 13h18"/>',
    lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/>',
    bookmark:'<path d="M6 3h12v18l-6-4-6 4V3z"/>',
    sound:'<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 8a5 5 0 010 8"/>',
    refresh:'<path d="M20 11a8 8 0 10-2.3 5.7M20 4v7h-7"/>',
    home:'<path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z"/>',
    palette:'<path d="M12 3a9 9 0 100 18c1.2 0 1.6-.8 1.6-1.6 0-1.2-1-1.4-1-2.4 0-.9.7-1.6 1.6-1.6H17a4 4 0 004-4C21 6.6 17 3 12 3z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7" r="1"/>',
    code:'<path d="M8 8l-5 4 5 4M16 8l5 4-5 4M14 4l-4 16"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    sparkle:'<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/>',
    globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>',
    bell:'<path d="M6 8a6 6 0 0112 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 20a2 2 0 004 0"/>',
    logout:'<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>',
  };
  const f=(n,o)=>s(P[n]||'',o);
  f.fill=(n,o={})=>s(P[n],Object.assign({f:'currentColor',w:1.5},o));
  return f;
})();

const I = vectorIcon;
