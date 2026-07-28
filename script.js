(() => {
  'use strict';

  /* ============ INTERACTIVE CANVAS BACKGROUND ============ */
  function initCuteCanvasBackground() {
    const canvas = document.createElement('canvas');
    canvas.id = 'bg-canvas';
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    // Ambient floating glow particles (Soft white, sky blue, & pastel blush glow)
    const particles = Array.from({ length: 35 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 4 + 2,
      color: [
        'rgba(255, 255, 255, ',
        'rgba(168, 200, 236, ',
        'rgba(247, 197, 204, '
      ][Math.floor(Math.random() * 3)],
      alpha: Math.random() * 0.6 + 0.2,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
    }));

    // Mouse / touch cursor trail
    const trail = [];
    function addTrailPoint(x, y) {
      if (Math.random() < 0.3) {
        trail.push({
          x,
          y,
          size: Math.random() * 12 + 8,
          alpha: 0.7,
          rotation: Math.random() * Math.PI * 2,
        });
      }
    }
    window.addEventListener('mousemove', (e) => addTrailPoint(e.clientX, e.clientY));
    window.addEventListener('touchmove', (e) => {
      const t = e.touches[0];
      if (t) addTrailPoint(t.clientX, t.clientY);
    }, { passive: true });

    // Draw paw print in soft baby blue / deep slate blue tones (NO ORANGE)
    function drawPaw(x, y, size, alpha, rotation) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      
      // Cozy slate-blue paw color that matches the baby blue background
      ctx.fillStyle = `rgba(74, 112, 156, ${alpha})`;

      // Main pad
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Toe beans
      const toes = [-0.35, -0.12, 0.12, 0.35];
      toes.forEach((angle) => {
        const tx = Math.sin(angle) * (size * 0.65);
        const ty = -Math.cos(angle) * (size * 0.65);
        ctx.beginPath();
        ctx.arc(tx, ty, size * 0.15, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    }

    function render() {
      ctx.clearRect(0, 0, width, height);

      // 1. Render ambient floating particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.shadowBlur = 12;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 2. Render mouse paw trail
      for (let i = trail.length - 1; i >= 0; i--) {
        const t = trail[i];
        drawPaw(t.x, t.y, t.size, t.alpha, t.rotation);
        t.alpha -= 0.015; // Fade out gradually
        t.y -= 0.2; // Drift up slightly
        if (t.alpha <= 0) trail.splice(i, 1);
      }

      requestAnimationFrame(render);
    }

    render();
  }

  /* ================= ENVELOPE INTRO ================= */
  const overlay = document.getElementById('envelope-overlay');
  const site = document.getElementById('site');
  let hasOpened = false;

  function openEnvelope() {
    if (hasOpened) return;
    hasOpened = true;
    overlay.classList.add('is-opening');

    setTimeout(closeOverlay, 1900);
  }

  function closeOverlay() {
    overlay.classList.add('is-closing');
    site.classList.add('is-visible');
    site.removeAttribute('aria-hidden');

    overlay.addEventListener('transitionend', () => {
      overlay.style.display = 'none';
    }, { once: true });
  }

  function skipToEnd() {
    hasOpened = true;
    overlay.classList.add('is-opening');
    closeOverlay();
  }

  if (overlay) {
    overlay.addEventListener('click', () => {
      if (!hasOpened) {
        openEnvelope();
      } else {
        skipToEnd();
      }
    });

    overlay.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!hasOpened) openEnvelope(); else skipToEnd();
      }
    });
  }

  window.addEventListener('load', () => {
    setTimeout(openEnvelope, 550);
  });

  /* ================= CAROUSEL ================= */
  const track = document.getElementById('carousel-track');
  const slides = Array.from(track ? track.children : []);
  const dotsWrap = document.getElementById('carousel-dots');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  let current = 0;
  let autoplayId = null;

  function renderDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Go to photo ${i + 1}`);
      if (i === current) dot.classList.add('active');
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });
  }

  function goTo(index) {
    if (!slides.length) return;
    current = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    if (dotsWrap) {
      Array.from(dotsWrap.children).forEach((dot, i) => {
        dot.classList.toggle('active', i === current);
      });
    }
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayId = setInterval(() => goTo(current + 1), 4500);
  }

  function stopAutoplay() {
    if (autoplayId) clearInterval(autoplayId);
  }

  if (track && slides.length) {
    renderDots();
    goTo(0);
    prevBtn && prevBtn.addEventListener('click', () => { goTo(current - 1); startAutoplay(); });
    nextBtn && nextBtn.addEventListener('click', () => { goTo(current + 1); startAutoplay(); });
    const carouselEl = document.getElementById('carousel');
    if (carouselEl) {
      carouselEl.addEventListener('mouseenter', stopAutoplay);
      carouselEl.addEventListener('mouseleave', startAutoplay);
    }
    startAutoplay();
  }

  /* ================= NOTES / CORKBOARD ================= */
  const corkboard = document.getElementById('corkboard');
  const corkboardEmpty = document.getElementById('corkboard-empty');
  const form = document.getElementById('note-form');
  const nameInput = document.getElementById('note-name');
  const messageInput = document.getElementById('note-message');
  const submitBtn = document.getElementById('note-submit');
  const statusEl = document.getElementById('form-status');

  const TILTS = ['-3deg', '-1.5deg', '1deg', '2.5deg', '-0.5deg', '1.8deg'];

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function noteCardHtml(note, index) {
    const tilt = TILTS[index % TILTS.length];
    const name = note.name ? escapeHtml(note.name) : 'Anon';
    const message = escapeHtml(note.message || '');
    return `
      <div class="note-card" style="--tilt:${tilt}">
        <p class="note-msg">${message}</p>
        <p class="note-name">— ${name}</p>
      </div>`;
  }

  function renderNotes(notes) {
    if (!corkboard) return;
    if (!notes || notes.length === 0) {
      corkboard.innerHTML = '<p class="corkboard-empty">Be the first to pin a note. 🐾</p>';
      return;
    }
    corkboard.innerHTML = notes.map(noteCardHtml).join('');
  }

  async function loadNotes() {
    try {
      const res = await fetch('/api/messages');
      if (!res.ok) throw new Error('Failed to load notes');
      const data = await res.json();
      renderNotes(data.notes);
    } catch (err) {
      if (corkboard) {
        corkboard.innerHTML = '<p class="corkboard-empty">Couldn\'t reach the corkboard right now — refresh to try again.</p>';
      }
      console.error(err);
    }
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const message = messageInput.value.trim();
      if (!message) {
        statusEl.textContent = 'Write a little something first!';
        statusEl.classList.add('is-error');
        return;
      }

      statusEl.classList.remove('is-error');
      statusEl.textContent = 'Pinning your note…';
      submitBtn.disabled = true;

      try {
        const res = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: nameInput.value.trim(), message }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Something went wrong');

        if (corkboard.querySelector('.corkboard-empty')) corkboard.innerHTML = '';
        corkboard.insertAdjacentHTML('afterbegin', noteCardHtml(data.note, 0));

        form.reset();
        statusEl.textContent = 'Pinned! Thank you. 🐾';
      } catch (err) {
        statusEl.textContent = err.message || 'Something went wrong — try again.';
        statusEl.classList.add('is-error');
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  /* ================= INITIALIZATION ================= */
  document.addEventListener('DOMContentLoaded', () => {
    initCuteCanvasBackground();
    loadNotes();
  });
})();