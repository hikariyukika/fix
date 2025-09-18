// Helper: select
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

// COUNTDOWN
function startCountdown() {
  const hero = $('#cover');
  if (!hero) return;
  const dateAttr = hero.getAttribute('data-date');
  const targetDate = dateAttr ? new Date(dateAttr) : null;
  if (!targetDate || isNaN(targetDate.getTime())) return;

  const daysEl = $('#cd-days');
  const hoursEl = $('#cd-hours');
  const minsEl = $('#cd-mins');
  const secsEl = $('#cd-secs');

  const tick = () => {
    const now = new Date();
    const diff = Math.max(0, targetDate.getTime() - now.getTime());

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minsEl.textContent = String(mins).padStart(2, '0');
    secsEl.textContent = String(secs).padStart(2, '0');
  };

  tick();
  setInterval(tick, 1000);
}

// GATE (Pembuka Undangan)
function initInviteGate() {
  const gate = document.querySelector('[data-gate]');
  const openButtons = $$('[data-open-invite]');
  if (!gate || openButtons.length === 0) return;

  const openedKey = 'inviteOpened';
  const isOpenedBefore = localStorage.getItem(openedKey) === '1';

  const lockScroll = () => { document.documentElement.style.overflow = 'hidden'; document.body.style.overflow = 'hidden'; };
  const unlockScroll = () => { document.documentElement.style.overflow = ''; document.body.style.overflow = ''; };

  const openInvite = () => {
    gate.classList.add('hide');
    unlockScroll();
    localStorage.setItem(openedKey, '1');
    const profiles = $('#profiles');
    profiles?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!isOpenedBefore) {
    gate.classList.remove('hide');
    lockScroll();
  } else {
    gate.classList.add('hide');
    unlockScroll();
  }

  openButtons.forEach(btn => btn.addEventListener('click', openInvite));
}

// OPEN MAPS
function initOpenMaps() {
  const mapsButtons = $$('[data-open-maps]');
  if (mapsButtons.length > 0) {
    const url = $('#cover')?.getAttribute('data-maps-url');
    const openMaps = (e) => {
      e.preventDefault();
      if (url) window.open(url, '_blank');
    };
    mapsButtons.forEach(btn => btn.addEventListener('click', openMaps));
  }

  // Handle event-specific maps buttons
  const eventMapsButtons = $$('[data-open-maps-event]');
  if (eventMapsButtons.length > 0) {
    const openEventMaps = (e) => {
      e.preventDefault();
      const url = e.target.getAttribute('data-open-maps-event');
      if (url) window.open(url, '_blank');
    };
    eventMapsButtons.forEach(btn => btn.addEventListener('click', openEventMaps));
  }
}

// SMOOTH SCROLL
function initSmoothScroll() {
  $$('[data-scroll-to]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-scroll-to');
      if (!target) return;
      const el = document.querySelector(target);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

// LIGHTBOX (sederhana)
function initLightbox() {
  const links = $$('[data-lightbox]');
  if (links.length === 0) return;

  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.85);display:none;place-items:center;z-index:50;padding:20px;';

  const img = document.createElement('img');
  img.style.cssText = 'max-width:95vw;max-height:90vh;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.6)';

  overlay.appendChild(img);
  document.body.appendChild(overlay);

  overlay.addEventListener('click', () => overlay.style.display = 'none');
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') overlay.style.display = 'none'; });

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href');
      if (!href) return;
      img.src = href;
      overlay.style.display = 'grid';
    });
  });
}

// REVEAL ON SCROLL
function initReveal() {
  const observed = $$('[data-observe]');
  if (observed.length === 0) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  observed.forEach(el => io.observe(el));
}

// RSVP (localStorage)
function initRsvp() {
  const form = $('#rsvp-form');
  const totalEl = $('#rsvp-total');
  if (!form || !totalEl) return;

  const LS_KEY = 'rsvpEntries';
  const loadEntries = () => { try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; } };
  const saveEntries = (arr) => localStorage.setItem(LS_KEY, JSON.stringify(arr));
  const calcTotal = (arr) => arr.reduce((acc, it) => acc + (Number(it.count) || 0), 0);
  const refreshTotal = () => {
    const entries = loadEntries();
    totalEl.textContent = `Total orang yang akan datang: ${calcTotal(entries)}`;
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#rsvp-name').value.trim();
    const count = Number($('#rsvp-count').value);
    if (!name || !count) return;

    const entries = loadEntries();
    entries.push({ name, count, at: Date.now() });
    saveEntries(entries);
    form.reset();
    refreshTotal();
    alert('Terima kasih, konfirmasi Anda sudah tercatat.');
  });

  refreshTotal();
}

// COPY TO CLIPBOARD (Gift)
function initCopy() {
  const buttons = $$('[data-copy]');
  if (buttons.length === 0) return;
  buttons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const text = btn.getAttribute('data-copy');
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = 'Tersalin!';
        setTimeout(() => { btn.textContent = 'Salin Nomor'; }, 1200);
      } catch (e) {
        alert('Gagal menyalin. Silakan salin manual.');
      }
    });
  });
}

function startSnow() {
  const snowContainer = document.createElement('div');
  snowContainer.id = 'snow-container';
  snowContainer.style.cssText = `
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    pointer-events: none;
    z-index: 9999;
    overflow: hidden;
  `;
  document.body.appendChild(snowContainer);

  const createSnowflake = () => {
    const snowflake = document.createElement('div');
    snowflake.classList.add('snowflake');
    snowflake.style.cssText = `
      position: absolute;
      top: -10px;
      background: white;
      border-radius: 50%;
      opacity: 0.8;
      pointer-events: none;
      user-select: none;
      width: ${Math.random() * 8 + 2}px;
      height: ${Math.random() * 8 + 2}px;
      left: ${Math.random() * window.innerWidth}px;
      animation: fall ${Math.random() * 5 + 5}s linear infinite;
      animation-delay: ${Math.random() * 5}s;
    `;
    snowContainer.appendChild(snowflake);

    setTimeout(() => {
      snowflake.remove();
    }, 10000);
  };

  setInterval(createSnowflake, 200);
}

function playMusic() {
  const music = document.getElementById('wedding-music');
  if (music) {
    music.volume = 0.5;
    music.play().catch(() => {
      // Autoplay might be blocked, user interaction needed
    });
  }
}

// INIT
window.addEventListener('DOMContentLoaded', () => {
  startCountdown();
  initInviteGate();
  initOpenMaps();
  initSmoothScroll();
  initLightbox();
  initReveal();
  initRsvp();
  initCopy();

  // Add snow and music when invite is opened
  const openButtons = document.querySelectorAll('[data-open-invite]');
  openButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      startSnow();
      playMusic();
    });
  });
});
