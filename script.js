(() => {
  'use strict';

  /* ================= CLOUDINARY CONFIGURATION ================= */
  const CLOUDINARY = {
    cloudName: 'fpdekah6',
    folder: 'memories'
  };

  /* ================= FALLBACK CONFIGURATION ================= */
  const FALLBACK = {
    enabled: true,
    folder: 'assets' // Local assets folder
  };

  /* ================= CLOUDINARY URL GENERATOR ================= */
  function getCloudinaryUrl(publicId, options = {}) {
    const {
      width = null,
      height = null,
      crop = 'fill',
      quality = 'auto',
      format = 'auto',
      gravity = 'center'
    } = options;

    let transformParts = [];
    
    if (width || height) {
      let sizeStr = '';
      if (width) sizeStr += `w_${width}`;
      if (height) sizeStr += sizeStr ? `,h_${height}` : `h_${height}`;
      transformParts.push(`c_${crop},${sizeStr}`);
    }
    
    if (quality) transformParts.push(`q_${quality}`);
    if (format) transformParts.push(`f_${format}`);
    if (gravity) transformParts.push(`g_${gravity}`);
    
    const transformString = transformParts.length ? transformParts.join(',') : '';
    
    let url = `https://res.cloudinary.com/${CLOUDINARY.cloudName}/image/upload`;
    if (transformString) url += `/${transformString}`;
    if (CLOUDINARY.folder) url += `/${CLOUDINARY.folder}`;
    url += `/${publicId}`;
    
    return url;
  }

  /* ================= FALLBACK URL GENERATOR ================= */
  function getFallbackUrl(publicId) {
    // Remove any file extension if present, fallback assumes .jpg
    const baseName = publicId.replace(/\.[^/.]+$/, '');
    return `${FALLBACK.folder}/${baseName}.jpg`;
  }

  /* ================= IMAGE LOADER WITH FALLBACK ================= */
  function createImageWithFallback(publicId, options = {}) {
    const {
      width = null,
      height = null,
      crop = 'fill',
      quality = 'auto',
      format = 'auto',
      className = '',
      alt = '',
      loading = 'lazy',
      decoding = 'async',
      sizes = '',
      srcset = ''
    } = options;

    // Generate Cloudinary URL
    const cloudinaryUrl = getCloudinaryUrl(publicId, { width, height, crop, quality, format });
    const fallbackUrl = getFallbackUrl(publicId);

    // Create image element
    const img = document.createElement('img');
    img.src = cloudinaryUrl;
    img.alt = alt || 'Memory photo';
    img.loading = loading;
    img.decoding = decoding;
    img.className = className;

    if (sizes) img.sizes = sizes;
    if (srcset) img.srcset = srcset;

    // Fallback: if Cloudinary fails, try local assets
    img.onerror = function() {
      console.warn(`⚠️ Cloudinary failed for ${publicId}, falling back to ${fallbackUrl}`);
      this.src = fallbackUrl;
      // Remove srcset since local file won't have responsive variants
      this.srcset = '';
      this.sizes = '';
    };

    return img;
  }

  /* ================= PHOTOS — GENERATED WITH CLOUDINARY ================= */
  const TOTAL_PHOTOS = 600;
  const GALLERY_PAGE_SIZE = 20;
  
  const ALL_PHOTOS = Array.from({ length: TOTAL_PHOTOS }, (_, i) => ({
    publicId: `photo_${i + 1}`,
    alt: `Memory ${i + 1}`,
    caption: ''
  }));

  const CAROUSEL_PHOTOS = ALL_PHOTOS.slice(0, 20);

  const PAW_POSITIONS = ['top-left', 'bottom-right', 'top-right', 'bottom-left'];

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

    const trail = [];
    function addTrailPoint(x, y) {
      if (Math.random() < 0.3) {
        trail.push({
          x, y,
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

    function drawPaw(x, y, size, alpha, rotation) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.fillStyle = `rgba(74, 112, 156, ${alpha})`;

      ctx.beginPath();
      ctx.arc(0, 0, size * 0.4, 0, Math.PI * 2);
      ctx.fill();

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

      for (let i = trail.length - 1; i >= 0; i--) {
        const t = trail[i];
        drawPaw(t.x, t.y, t.size, t.alpha, t.rotation);
        t.alpha -= 0.015;
        t.y -= 0.2;
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
      if (!hasOpened) openEnvelope(); else skipToEnd();
    });
    overlay.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!hasOpened) openEnvelope(); else skipToEnd();
      }
    });
  }

  /* ================= CAROUSEL ================= */
  const track = document.getElementById('carousel-track');
  const dotsWrap = document.getElementById('carousel-dots');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const carouselWrapper = document.querySelector('.carousel-track-wrapper');
  let current = 0;
  let autoplayId = null;
  let slides = [];

  /* ================= DRAG/SWIPE SUPPORT ================= */
  let startX = 0;
  let currentX = 0;
  let isDragging = false;
  let isSwiping = false;
  const SWIPE_THRESHOLD = 50;

  function initDragSupport() {
    if (!carouselWrapper || !track) return;

    carouselWrapper.addEventListener('touchstart', handleTouchStart, { passive: true });
    carouselWrapper.addEventListener('touchmove', handleTouchMove, { passive: false });
    carouselWrapper.addEventListener('touchend', handleTouchEnd, { passive: true });

    carouselWrapper.addEventListener('mousedown', handleMouseDown);
    carouselWrapper.addEventListener('mousemove', handleMouseMove);
    carouselWrapper.addEventListener('mouseup', handleMouseUp);
    carouselWrapper.addEventListener('mouseleave', handleMouseUp);
  }

  function handleTouchStart(e) {
    if (e.touches.length === 1) {
      startX = e.touches[0].clientX;
      isDragging = true;
      isSwiping = false;
      stopAutoplay();
      track.style.transition = 'none';
    }
  }

  function handleTouchMove(e) {
    if (!isDragging || e.touches.length !== 1) return;
    e.preventDefault();
    
    currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    
    if (Math.abs(diff) > 10) {
      isSwiping = true;
    }
    
    if (isSwiping) {
      const trackWidth = track.offsetWidth;
      const offset = -current * trackWidth + diff;
      track.style.transform = `translateX(${offset}px)`;
    }
  }

  function handleTouchEnd(e) {
    if (!isDragging) return;
    isDragging = false;
    
    if (isSwiping) {
      const diff = currentX - startX;
      
      if (Math.abs(diff) > SWIPE_THRESHOLD) {
        if (diff < 0) {
          goTo(current + 1);
        } else {
          goTo(current - 1);
        }
      } else {
        goTo(current);
      }
      
      track.style.transition = 'transform 0.55s cubic-bezier(.3, .7, .2, 1)';
      isSwiping = false;
    }
    
    startAutoplay();
  }

  function handleMouseDown(e) {
    startX = e.clientX;
    isDragging = true;
    isSwiping = false;
    stopAutoplay();
    track.style.transition = 'none';
  }

  function handleMouseMove(e) {
    if (!isDragging) return;
    currentX = e.clientX;
    const diff = currentX - startX;
    
    if (Math.abs(diff) > 10) {
      isSwiping = true;
    }
    
    if (isSwiping) {
      const trackWidth = track.offsetWidth;
      const offset = -current * trackWidth + diff;
      track.style.transform = `translateX(${offset}px)`;
    }
  }

  function handleMouseUp(e) {
    if (!isDragging) return;
    isDragging = false;
    
    if (isSwiping) {
      const diff = currentX - startX;
      
      if (Math.abs(diff) > SWIPE_THRESHOLD) {
        if (diff < 0) {
          goTo(current + 1);
        } else {
          goTo(current - 1);
        }
      } else {
        goTo(current);
      }
      
      track.style.transition = 'transform 0.55s cubic-bezier(.3, .7, .2, 1)';
      isSwiping = false;
    }
    
    startAutoplay();
  }

  /* ================= LIGHTBOX FUNCTIONS ================= */
  const lightboxEl = document.getElementById('gallery-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');

  function openLightbox(publicId) {
    if (!lightboxEl || !lightboxImg) return;
    
    const highResUrl = getCloudinaryUrl(publicId, {
      width: 1920,
      height: 1080,
      crop: 'limit',
      quality: 'auto',
      format: 'auto'
    });

    const img = new Image();
    img.onload = () => {
      lightboxImg.src = highResUrl;
    };
    img.onerror = function() {
      // Fallback for lightbox
      const fallbackUrl = getFallbackUrl(publicId);
      console.warn(`⚠️ Cloudinary fallback for lightbox: ${fallbackUrl}`);
      this.src = fallbackUrl;
    };
    img.src = highResUrl;
    
    lightboxEl.classList.add('is-active');
    lightboxEl.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightboxEl) return;
    lightboxEl.classList.remove('is-active');
    lightboxEl.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(() => {
      if (!lightboxEl.classList.contains('is-active')) {
        lightboxImg.src = '';
      }
    }, 300);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightboxEl && lightboxEl.classList.contains('is-active')) {
      closeLightbox();
    }
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxEl) {
    lightboxEl.addEventListener('click', (e) => {
      if (e.target === lightboxEl) closeLightbox();
    });
  }

  /* ================= BUILD CAROUSEL WITH FALLBACK ================= */
  function buildCarouselSlides() {
    if (!track) return;
    
    track.innerHTML = CAROUSEL_PHOTOS.map((p, i) => {
      const cloudinarySrc = getCloudinaryUrl(p.publicId, { width: 800, height: 600 });
      const fallbackSrc = getFallbackUrl(p.publicId);
      const srcSet = `
        ${getCloudinaryUrl(p.publicId, { width: 400, height: 300 })} 400w,
        ${getCloudinaryUrl(p.publicId, { width: 800, height: 600 })} 800w,
        ${getCloudinaryUrl(p.publicId, { width: 1200, height: 900 })} 1200w,
        ${getCloudinaryUrl(p.publicId, { width: 1600, height: 1200 })} 1600w
      `;
      
      return `
        <figure class="slide">
          <span class="peg" aria-hidden="true">📌</span>
          <div class="polaroid" data-public-id="${p.publicId}">
            <div class="polaroid-img-wrap">
              <img 
                src="${cloudinarySrc}"
                srcset="${srcSet}"
                sizes="(max-width: 600px) 400px, (max-width: 1024px) 800px, 1200px"
                alt="${p.alt || ''}" 
                class="polaroid-img" 
                loading="${i < 3 ? 'eager' : 'lazy'}"
                decoding="async"
                onerror="this.src='${fallbackSrc}'; this.srcset=''; this.sizes='';"
              />
            </div>
            <figcaption>${p.caption || ''}</figcaption>
          </div>
        </figure>
      `;
    }).join('');
    
    slides = Array.from(track.children);
    
    slides.forEach((slide) => {
      const polaroid = slide.querySelector('.polaroid');
      if (polaroid) {
        polaroid.addEventListener('click', function(e) {
          if (isSwiping) return;
          const publicId = this.getAttribute('data-public-id');
          if (publicId) openLightbox(publicId);
        });
        polaroid.style.cursor = 'pointer';
      }
    });
  }

  /* ================= CAROUSEL DOTS ================= */
  function renderDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';
    
    const totalSlides = slides.length;
    
    if (totalSlides <= 5) {
      dotsWrap.style.display = 'flex';
      
      for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', `Go to photo ${i + 1}`);
        
        if (i === 0) dot.classList.add('active');
        
        dot.addEventListener('click', () => {
          goTo(i);
          startAutoplay();
        });
        
        dotsWrap.appendChild(dot);
      }
    } else {
      dotsWrap.style.display = 'none';
    }
  }

  function updateActiveDot() {
    if (!dotsWrap) return;
    const dots = dotsWrap.children;
    const totalSlides = slides.length;
    
    if (totalSlides <= 5) {
      Array.from(dots).forEach((dot, i) => {
        dot.classList.toggle('active', i === current);
      });
    }
  }

  function goTo(index) {
    if (!slides.length) return;
    current = (index + slides.length) % slides.length;
    track.style.transition = 'transform 0.55s cubic-bezier(.3, .7, .2, 1)';
    track.style.transform = `translateX(-${current * 100}%)`;
    updateActiveDot();
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayId = setInterval(() => goTo(current + 1), 7500);
  }

  function stopAutoplay() {
    if (autoplayId) clearInterval(autoplayId);
  }

  function initCarousel() {
    buildCarouselSlides();
    if (!slides.length) return;
    renderDots();
    goTo(0);
    
    initDragSupport();
    
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

      const MAX_CHARS = 2000;
      if (message.length > MAX_CHARS) {
        statusEl.textContent = `Message is too long! Maximum ${MAX_CHARS} characters. You have ${message.length} characters.`;
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
        statusEl.classList.remove('is-error');
      } catch (err) {
        statusEl.textContent = err.message || 'Something went wrong — try again.';
        statusEl.classList.add('is-error');
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  /* ================= GALLERY MODE WITH FALLBACK ================= */
  const toggleGalleryBtn = document.getElementById('toggle-gallery-btn');
  const carouselEl = document.getElementById('carousel');
  const galleryViewEl = document.getElementById('gallery-view');
  const galleryGridEl = document.getElementById('gallery-grid');

  let isGalleryMode = false;
  let currentPage = 1;
  const totalPages = Math.ceil(TOTAL_PHOTOS / GALLERY_PAGE_SIZE);

  function createPaginationControls() {
    const existingControls = document.querySelector('.gallery-pagination');
    if (existingControls) existingControls.remove();

    const controls = document.createElement('div');
    controls.className = 'gallery-pagination';
    controls.innerHTML = `
      <button class="pagination-btn" id="gallery-prev" ${currentPage === 1 ? 'disabled' : ''}>
        ← Previous
      </button>
      <span class="pagination-info">Page ${currentPage} of ${totalPages}</span>
      <button class="pagination-btn" id="gallery-next" ${currentPage === totalPages ? 'disabled' : ''}>
        Next →
      </button>
    `;

    galleryViewEl.appendChild(controls);

    const prevBtn = controls.querySelector('#gallery-prev');
    const nextBtn = controls.querySelector('#gallery-next');

    prevBtn?.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderGalleryPage(currentPage);
      }
    });

    nextBtn?.addEventListener('click', () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderGalleryPage(currentPage);
      }
    });
  }

  function getPagePhotos(page) {
    const start = (page - 1) * GALLERY_PAGE_SIZE;
    const end = start + GALLERY_PAGE_SIZE;
    return ALL_PHOTOS.slice(start, end);
  }

  function renderGalleryPage(page) {
    if (!galleryGridEl) return;

    galleryGridEl.innerHTML = '';
    
    const pagePhotos = getPagePhotos(page);
    
    pagePhotos.forEach((p) => {
      const item = document.createElement('div');
      item.className = 'gallery-item';

      const cloudinarySrc = getCloudinaryUrl(p.publicId, { width: 400, height: 400 });
      const fallbackSrc = getFallbackUrl(p.publicId);
      const srcset = `
        ${getCloudinaryUrl(p.publicId, { width: 400, height: 400 })} 400w,
        ${getCloudinaryUrl(p.publicId, { width: 600, height: 600 })} 600w,
        ${getCloudinaryUrl(p.publicId, { width: 800, height: 800 })} 800w
      `;

      const img = document.createElement('img');
      img.src = cloudinarySrc;
      img.srcset = srcset;
      img.sizes = "(max-width: 400px) 400px, (max-width: 600px) 600px, 800px";
      img.alt = p.alt || 'Memory photo';
      img.loading = 'lazy';
      img.decoding = 'async';
      
      // Fallback on error
      img.onerror = function() {
        console.warn(`⚠️ Cloudinary fallback for gallery: ${fallbackSrc}`);
        this.src = fallbackSrc;
        this.srcset = '';
        this.sizes = '';
      };

      item.appendChild(img);
      item.addEventListener('click', () => openLightbox(p.publicId));
      galleryGridEl.appendChild(item);
    });

    const info = document.querySelector('.pagination-info');
    if (info) info.textContent = `Page ${currentPage} of ${totalPages}`;
    
    const prevBtn = document.getElementById('gallery-prev');
    const nextBtn = document.getElementById('gallery-next');
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;

    galleryViewEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function showGalleryMode() {
    isGalleryMode = true;
    currentPage = 1;
    stopAutoplay();
    carouselEl.style.display = 'none';
    galleryViewEl.removeAttribute('hidden');
    
    const oldPagination = document.querySelector('.gallery-pagination');
    if (oldPagination) oldPagination.remove();
    
    createPaginationControls();
    renderGalleryPage(1);
    
    toggleGalleryBtn.innerHTML = '<span class="btn-icon">🎠</span> Switch to Carousel Mode';
  }

  function showCarouselMode() {
    isGalleryMode = false;
    carouselEl.style.display = 'block';
    galleryViewEl.setAttribute('hidden', '');
    
    const pagination = document.querySelector('.gallery-pagination');
    if (pagination) pagination.remove();
    
    startAutoplay();
    toggleGalleryBtn.innerHTML = '<span class="btn-icon">🖼️</span> View All Photos (Gallery Mode)';
  }

  if (toggleGalleryBtn) {
    toggleGalleryBtn.addEventListener('click', () => {
      if (isGalleryMode) showCarouselMode(); else showGalleryMode();
    });
  }

  const backToCarouselBtn = document.getElementById('back-to-carousel-btn');
  if (backToCarouselBtn) backToCarouselBtn.addEventListener('click', showCarouselMode);

  /* ================= INITIALIZATION ================= */
  document.addEventListener('DOMContentLoaded', () => {
    initCuteCanvasBackground();
    initCarousel();
    loadNotes();
  });
})();