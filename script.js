// ============================================
//  PORTFOLIO — script.js
//  Fixed: DOMContentLoaded guard, null-safety,
//  email validation, focus trap, modal a11y
//  Updated: dark-only, sticky nav, scroll progress, back-to-top,
//           PH clock, form counter + draft
//  Updated: removed subject field from email form
//  Updated: certificate carousel
// ============================================

function initPortfolio() {

  // Dark theme only (toggle removed)
  document.documentElement.setAttribute('data-theme', 'dark');
  try { localStorage.removeItem('theme'); } catch (_) {}

  // ── Toast helper ──────────────────────────────────────────────
  const toastEl = document.getElementById('toast');
  let toastTimer = null;
  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
  }

  // ── Scroll progress + back-to-top ─────────────────────────────
  const progressEl = document.getElementById('scrollProgress');
  const backTop    = document.getElementById('backTop');
  let scrollTick = false;
  function onScroll() {
    if (scrollTick) return;
    scrollTick = true;
    requestAnimationFrame(() => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      if (progressEl) progressEl.style.width = pct + '%';
      if (backTop) backTop.classList.toggle('show', window.scrollY > 500);
      scrollTick = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  backTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // ── Nav scroll-spy ────────────────────────────────────────────
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const navSections = navLinks
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);
  if (navLinks.length && navSections.length) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting || window.scrollY < 120) return;
        navLinks.forEach(a => {
          const on = a.getAttribute('href') === '#' + entry.target.id;
          a.classList.toggle('active', on);
          if (on) {
            a.setAttribute('aria-current', 'true');
            // keep active link visible in the scrollable mobile nav
            const list = a.closest('.nav-list');
            if (list && list.scrollWidth > list.clientWidth) {
              const off = a.getBoundingClientRect().left - list.getBoundingClientRect().left + list.scrollLeft;
              list.scrollTo({ left: off - (list.clientWidth - a.offsetWidth) / 2, behavior: 'smooth' });
            }
          } else {
            a.removeAttribute('aria-current');
          }
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    navSections.forEach(s => spy.observe(s));
    // No section is "current" while still in the hero
    const clearNavAtTop = () => {
      if (window.scrollY < 120) {
        navLinks.forEach(a => { a.classList.remove('active'); a.removeAttribute('aria-current'); });
      }
    };
    window.addEventListener('scroll', clearNavAtTop, { passive: true });
    clearNavAtTop();
  }

  // ── Live Philippine time ──────────────────────────────────────
  const localTimeEl = document.getElementById('localTime');
  if (localTimeEl) {
    const fmt = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Manila'
    });
    const tick = () => { localTimeEl.textContent = fmt.format(new Date()) + ' '; };
    tick();
    setInterval(tick, 30000);
  }

  // ── Scroll Reveal (bryllim-style fade-up) ─────────────────────
  const revealEls = Array.from(document.querySelectorAll('.reveal'));
  if (!('IntersectionObserver' in window)) revealEls.forEach(el => el.classList.add('visible'));
  const revealObserver = ('IntersectionObserver' in window) ? new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Once revealed, stop watching — no re-hide on scroll up
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.08,     // trigger when 8% of card is in view
      rootMargin: '0px 0px -40px 0px'  // trigger slightly before bottom edge
    }
  ) : null;

  // Observe every element with class "reveal"
  if (revealObserver) revealEls.forEach(el => revealObserver.observe(el));
  // Safety net: if the observer never fires (some mobile browsers), show everything
  setTimeout(() => revealEls.forEach(el => el.classList.add('visible')), 2500);

  // ── Smooth Scroll for anchor links ────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      // ignore bare "#" links so they don't jump to the top
      if (!href || href === '#') { e.preventDefault(); return; }
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (target.hasAttribute('tabindex')) target.focus({ preventScroll: true });
      }
    });
  });

  // ── Certificate Lightbox ──────────────────────────────────────
  const certLightbox      = document.getElementById('certLightbox');
  const certLightboxImg   = document.getElementById('certLightboxImg');
  const certLightboxTitle = document.getElementById('certLightboxTitle');
  const certLightboxClose = document.getElementById('certLightboxClose');
  const certBackdrop      = document.getElementById('certBackdrop');

  if (certLightbox && certLightboxImg && certLightboxTitle && certLightboxClose && certBackdrop) try {

    function openCertLightbox(imgSrc, title) {
      certLightboxImg.src           = imgSrc;
      certLightboxImg.alt           = title;
      certLightboxTitle.textContent = title;
      certLightbox.classList.add('open');
      document.body.style.overflow  = 'hidden';
      document.querySelector('main')?.setAttribute('aria-hidden', 'true');
      document.querySelector('header')?.setAttribute('aria-hidden', 'true');
      document.querySelector('footer')?.setAttribute('aria-hidden', 'true');
      certLightboxClose.focus();
    }

    function closeCertLightbox() {
      certLightbox.classList.remove('open');
      document.body.style.overflow = '';
      document.querySelector('main')?.removeAttribute('aria-hidden');
      document.querySelector('header')?.removeAttribute('aria-hidden');
      document.querySelector('footer')?.removeAttribute('aria-hidden');
      setTimeout(() => { if (!certLightbox.classList.contains('open')) certLightboxImg.removeAttribute('src'); }, 220);
    }

    document.querySelectorAll('.cert-card[data-cert-img]').forEach(card => {
      card.addEventListener('click', () => {
        openCertLightbox(card.dataset.certImg, card.dataset.certTitle || 'Certificate');
      });
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openCertLightbox(card.dataset.certImg, card.dataset.certTitle || 'Certificate');
        }
      });
    });

    // Prev / next inside the lightbox (buttons, arrow keys, swipe)
    const lbCards = Array.from(document.querySelectorAll('.cert-card[data-cert-img]'));
    const lbPrev = document.getElementById('certLbPrev');
    const lbNext = document.getElementById('certLbNext');
    let lbIdx = 0;
    lbCards.forEach((c, i) => c.addEventListener('click', () => { lbIdx = i; }));
    const lbStep = d => {
      if (!lbCards.length) return;
      lbIdx = (lbIdx + d + lbCards.length) % lbCards.length;
      const c = lbCards[lbIdx];
      const title = c.dataset.certTitle || 'Certificate';
      certLightboxImg.src = c.dataset.certImg;
      certLightboxImg.alt = title;
      certLightboxTitle.textContent = title;
    };
    lbPrev?.addEventListener('click', () => lbStep(-1));
    lbNext?.addEventListener('click', () => lbStep(1));
    let lbX = null;
    certLightbox.addEventListener('touchstart', e => { lbX = e.touches[0].clientX; }, { passive: true });
    certLightbox.addEventListener('touchend', e => {
      if (lbX === null) return;
      const dx = e.changedTouches[0].clientX - lbX;
      lbX = null;
      if (Math.abs(dx) > 50) lbStep(dx < 0 ? 1 : -1);
    }, { passive: true });

    certLightboxClose.addEventListener('click', closeCertLightbox);
    certBackdrop.addEventListener('click', closeCertLightbox);

    certLightbox.addEventListener('keydown', e => {
      if (e.key === 'Escape' && certLightbox.classList.contains('open')) {
        closeCertLightbox();
      }
      if (!certLightbox.classList.contains('open')) return;
      if (e.key === 'ArrowLeft')  lbStep(-1);
      if (e.key === 'ArrowRight') lbStep(1);
      if (e.key === 'Tab') {
        // trap focus across prev / next / close
        e.preventDefault();
        const f = [lbPrev, lbNext, certLightboxClose].filter(Boolean);
        const i = f.indexOf(document.activeElement);
        f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    });
  } catch (err) { console.error('Lightbox init failed:', err); }

  // ── Project Filter + Search ───────────────────────────────────
  const projSearch  = document.getElementById('projSearch');
  const projFilters = document.getElementById('projFilters');
  const projCount   = document.getElementById('projCount');
  const projEmpty   = document.getElementById('projEmpty');
  const projCards   = Array.from(document.querySelectorAll('#projectsList .project-card'));

  if (projSearch && projFilters && projCards.length) {
    let activeFilter = 'all';

    function applyProjectFilter() {
      const q = projSearch.value.trim().toLowerCase();
      let shown = 0;
      projCards.forEach(card => {
        const matchesCat  = activeFilter === 'all' || card.dataset.category === activeFilter;
        const matchesText = !q || (card.textContent + ' ' + (card.dataset.category || '')).toLowerCase().includes(q);
        const show = matchesCat && matchesText;
        card.hidden = !show;
        if (show) shown++;
      });
      if (projEmpty) projEmpty.hidden = shown > 0;
      if (projCount) {
        projCount.textContent = shown === projCards.length
          ? `${projCards.length} Projects`
          : `${shown} of ${projCards.length}`;
      }
    }

    projSearch.addEventListener('input', applyProjectFilter);
    projFilters.addEventListener('click', e => {
      const chip = e.target.closest('.proj-chip');
      if (!chip) return;
      activeFilter = chip.dataset.filter;
      projFilters.querySelectorAll('.proj-chip').forEach(c => {
        const on = c === chip;
        c.classList.toggle('active', on);
        c.setAttribute('aria-pressed', String(on));
      });
      applyProjectFilter();
    });
  }

  // ── Stat Counters ─────────────────────────────────────────────
  const statsRow = document.getElementById('statsRow');
  if (statsRow) {
    // Numbers come from the page itself, so they never go stale
    const live = {
      tech:     document.querySelectorAll('#tech .tag').length,
      projects: document.querySelectorAll('#projectsList .project-card').length,
      live:     document.querySelectorAll('#projectsList a.project-card').length,
      certs:    document.querySelectorAll('.cert-slide').length,
    };
    const statEls = Array.from(statsRow.querySelectorAll('.stat-num'));
    statEls.forEach(el => {
      const v = live[el.dataset.stat];
      if (typeof v === 'number') el.dataset.target = v;
      el.textContent = el.dataset.target;   // correct value even without animation
    });

    const noMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!noMotion) {
      const runCount = el => {
        const target = parseInt(el.dataset.target, 10) || 0;
        const duration = 1100;
        const t0 = performance.now();
        el.textContent = '0';
        const step = now => {
          const p = Math.min((now - t0) / duration, 1);
          el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));  // ease-out
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      };
      const statObserver = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) return;
        statEls.forEach(runCount);
        statObserver.disconnect();
      }, { threshold: 0.5 });
      statObserver.observe(statsRow);
    }
  }

  // ── Certificate Carousel ──────────────────────────────────────
  const certTrack = document.getElementById('certTrack');
  const certPrev  = document.getElementById('certPrev');
  const certNext  = document.getElementById('certNext');
  const certDots  = document.getElementById('certDots');
  const certCount = document.getElementById('certCount');

  if (certTrack && certPrev && certNext && certDots) try {
    const slides = Array.from(certTrack.querySelectorAll('.cert-slide'));
    const total  = slides.length;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let current = 0;

    // Fall back to the icon placeholder if a certificate image is missing
    slides.forEach(slide => {
      const img   = slide.querySelector('.cert-thumb img');
      const thumb = slide.querySelector('.cert-thumb');
      if (!img || !thumb) return;
      img.addEventListener('error', () => thumb.classList.add('no-img'));
      if (img.complete && img.naturalWidth === 0) thumb.classList.add('no-img');
    });

    // Keep labels/counts in sync with the real number of slides
    slides.forEach((s, i) => s.setAttribute('aria-label', `${i + 1} of ${total}`));
    const certBadge = document.getElementById('certBadge');
    if (certBadge) certBadge.textContent = `${total} Certs`;

    // Seamless loop: a non-interactive clone of slide 1 sits after the last slide.
    // Autoplay glides onto it, then silently jumps back to the real slide 1.
    const loopClone = slides[0].cloneNode(true);
    loopClone.classList.add('cert-clone');
    loopClone.classList.remove('cert-slide');
    loopClone.removeAttribute('data-cert-img');
    loopClone.setAttribute('aria-hidden', 'true');
    loopClone.setAttribute('tabindex', '-1');
    loopClone.addEventListener('click', () => slides[0].click());
    certTrack.appendChild(loopClone);
    const slideStep = () => (total > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : certTrack.clientWidth);
    const slideLeft = i => (i >= total ? loopClone : slides[i]).offsetLeft - certTrack.offsetLeft;

    // Build dots
    const dots = slides.map((slide, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'cert-dot';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Go to certificate ${i + 1}: ${slide.dataset.certTitle || ''}`);
      dot.addEventListener('click', () => goTo(i));
      certDots.appendChild(dot);
      return dot;
    });

    function goTo(index) {
      const smooth = reduceMotion.matches ? 'instant' : 'smooth';
      if (index > total) index = total;
      if (index < 0) {
        // Going back from slide 1: jump to the clone, then glide to the last slide
        certTrack.scrollTo({ left: slideLeft(total), behavior: 'instant' });
        requestAnimationFrame(() => certTrack.scrollTo({ left: slideLeft(total - 1), behavior: smooth }));
        return;
      }
      certTrack.scrollTo({ left: slideLeft(index), behavior: smooth });
    }

    function setActive(i) {
      current = i;
      dots.forEach((d, n) => {
        const on = n === i;
        d.classList.toggle('active', on);
        d.setAttribute('aria-selected', String(on));
      });
      // Only the visible slide is tabbable
      slides.forEach((s, n) => s.setAttribute('tabindex', n === i ? '0' : '-1'));
      if (certCount) certCount.textContent = `${i + 1} / ${total}`;
      scheduleNext();
    }

    // Track which slide is in view (rAF-throttled) and reset the loop clone
    let ticking = false, settleTimer = null;
    certTrack.addEventListener('scroll', () => {
      clearTimeout(settleTimer);
      settleTimer = setTimeout(() => {
        // Landed on the clone -> silently jump back to the real first slide
        if (certTrack.scrollLeft >= slideLeft(total) - 2) {
          certTrack.scrollTo({ left: 0, behavior: 'instant' });
          setActive(0);
        }
      }, 120);
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const i = Math.round(certTrack.scrollLeft / slideStep());
        const logical = i >= total ? 0 : Math.max(0, i);
        if (logical !== current) setActive(logical);
        ticking = false;
      });
    }, { passive: true });

    // Keep the current slide aligned when the layout resizes
    window.addEventListener('resize', () => {
      certTrack.scrollTo({ left: slideLeft(current), behavior: 'instant' });
    });

    certPrev.addEventListener('click', () => goTo(current - 1));
    certNext.addEventListener('click', () => goTo(current + 1));

    // Arrow keys while focus is inside the carousel
    document.getElementById('certCarousel')?.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(current - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); }
    });

    // ── Autoplay ──────────────────────────────────────────────
    const AUTOPLAY_MS = 3500;
    const certToggle  = document.getElementById('certToggle');
    const carouselEl  = document.getElementById('certCarousel');
    let timer = null;
    let userPaused = false;   // autoplay always starts; the pause button stops it
    let hovering = false, focusedByKeyboard = false, touching = false;
    let inView = true, pageVisible = !document.hidden;

    function canPlay() {
      return !userPaused && !hovering && !focusedByKeyboard && !touching &&
             inView && pageVisible && !certLightbox?.classList.contains('open');
    }

    function scheduleNext() {
      clearTimeout(timer);
      if (!canPlay()) return;
      timer = setTimeout(() => {
        if (canPlay()) goTo(current + 1);
        else scheduleNext();
      }, AUTOPLAY_MS);
    }

    function syncToggle() {
      if (!certToggle) return;
      const icon = certToggle.querySelector('i');
      if (icon) icon.className = userPaused ? 'ph ph-play' : 'ph ph-pause';
      certToggle.setAttribute('aria-label',
        userPaused ? 'Start automatic slideshow' : 'Pause automatic slideshow');
    }

    certToggle?.addEventListener('click', () => {
      userPaused = !userPaused;
      syncToggle();
      scheduleNext();
    });

    if (carouselEl) {
      // Pause while a mouse hovers (ignore touch "hover", which sticks)
      carouselEl.addEventListener('pointerenter', e => {
        if (e.pointerType === 'mouse') { hovering = true; scheduleNext(); }
      });
      carouselEl.addEventListener('pointerleave', e => {
        if (e.pointerType === 'mouse') { hovering = false; scheduleNext(); }
      });
      // Pause while swiping
      carouselEl.addEventListener('touchstart', () => { touching = true; scheduleNext(); }, { passive: true });
      const endTouch = () => { touching = false; scheduleNext(); };
      carouselEl.addEventListener('touchend', endTouch, { passive: true });
      carouselEl.addEventListener('touchcancel', endTouch, { passive: true });
      // Pause only for keyboard focus (mouse clicks on buttons shouldn't freeze it)
      carouselEl.addEventListener('focusin', e => {
        focusedByKeyboard = e.target.matches(':focus-visible');
        scheduleNext();
      });
      carouselEl.addEventListener('focusout', () => { focusedByKeyboard = false; scheduleNext(); });

      // Only run while the carousel is on screen
      new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        scheduleNext();
      }, { threshold: 0.3 }).observe(carouselEl);
    }

    document.addEventListener('visibilitychange', () => {
      pageVisible = !document.hidden;
      scheduleNext();
    });

    // Resume the loop after the lightbox closes
    if (certLightbox) {
      new MutationObserver(scheduleNext).observe(certLightbox, { attributes: true, attributeFilter: ['class'] });
    }

    syncToggle();
    setActive(0);   // also starts the autoplay timer
  } catch (err) { console.error('Carousel init failed:', err); }

  // ── Email Modal ───────────────────────────────────────────────
  const EMAILJS_PUBLIC_KEY  = 'zxnXGxAFBuTmETjJ9';
  const EMAILJS_SERVICE_ID  = 'service_ngtsxzc';
  const EMAILJS_TEMPLATE_ID = 'template_z4aaknd';

  const emailModal          = document.getElementById('emailModal');
  const emailModalBackdrop  = document.getElementById('emailModalBackdrop');
  const emailModalClose     = document.getElementById('emailModalClose');
  const emailSendBtn        = document.getElementById('emailSendBtn');
  const emailStatus         = document.getElementById('emailStatus');
  const emailFromField      = document.getElementById('emailFrom');
  const emailReplyField     = document.getElementById('emailReply');
  const emailMessageField   = document.getElementById('emailMessage');

  let emailModalTrigger = null;

  function getModalFocusables() {
    return Array.from(
      emailModal.querySelectorAll(
        'button:not([disabled]), input:not([disabled]):not(.hp), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );
  }

  function openEmailModal(triggerEl) {
    emailModalTrigger = triggerEl || null;
    emailModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    document.querySelector('main')?.setAttribute('aria-hidden', 'true');
    document.querySelector('header')?.setAttribute('aria-hidden', 'true');
    document.querySelector('footer')?.setAttribute('aria-hidden', 'true');
    setTimeout(() => emailFromField?.focus(), 50);
  }

  function closeEmailModal() {
    emailModal.classList.remove('open');
    document.body.style.overflow = '';
    document.querySelector('main')?.removeAttribute('aria-hidden');
    document.querySelector('header')?.removeAttribute('aria-hidden');
    document.querySelector('footer')?.removeAttribute('aria-hidden');
    if (emailStatus) {
      emailStatus.textContent = '';
      emailStatus.className   = 'email-modal-status';
    }
    if (emailModalTrigger) {
      emailModalTrigger.focus();
      emailModalTrigger = null;
    }
  }

  const openModalBtn       = document.getElementById('openEmailModal');
  const openModalBtnFooter = document.getElementById('openEmailModalFooter');

  if (openModalBtn)       openModalBtn.addEventListener('click', () => openEmailModal(openModalBtn));
  if (openModalBtnFooter) openModalBtnFooter.addEventListener('click', () => openEmailModal(openModalBtnFooter));

  if (emailModalClose)    emailModalClose.addEventListener('click', closeEmailModal);
  if (emailModalBackdrop) emailModalBackdrop.addEventListener('click', closeEmailModal);

  if (emailModal) {
    emailModal.addEventListener('keydown', e => {
      if (e.key === 'Escape' && emailModal.classList.contains('open')) {
        closeEmailModal();
        return;
      }
      if (e.key === 'Tab' && emailModal.classList.contains('open')) {
        const focusables = getModalFocusables();
        if (!focusables.length) { e.preventDefault(); return; }
        const first = focusables[0];
        const last  = focusables[focusables.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
          if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
        }
      }
    });
  }

  // ── Contact form: counter + draft persistence ────────────────
  const emailCounter = document.getElementById('emailCounter');
  const DRAFT_KEY = 'contactDraft';
  function updateCounter() {
    if (emailCounter && emailMessageField) {
      emailCounter.textContent = `${emailMessageField.value.length} / ${emailMessageField.maxLength}`;
    }
  }
  function saveDraft() {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({
        n: emailFromField?.value || '',
        e: emailReplyField?.value || '',
        m: emailMessageField?.value || ''
      }));
    } catch (_) {}
  }
  try {
    const d = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || 'null');
    if (d) {
      if (emailFromField)    emailFromField.value    = d.n || '';
      if (emailReplyField)   emailReplyField.value   = d.e || '';
      if (emailMessageField) emailMessageField.value = d.m || '';
    }
  } catch (_) {}
  [emailFromField, emailReplyField, emailMessageField].forEach(f =>
    f?.addEventListener('input', () => { updateCounter(); saveDraft(); }));
  updateCounter();

  // ── EmailJS Send ─────────────────────────────────────────────
  if (emailSendBtn) {
    emailSendBtn.addEventListener('click', () => {
      const fromName  = emailFromField?.value.trim()    || '';
      const fromEmail = emailReplyField?.value.trim()   || '';
      const message   = emailMessageField?.value.trim() || '';

      // Spam protection: hidden honeypot + 30s cooldown between sends
      if (document.getElementById('emailWebsite')?.value) return;
      let lastSent = 0;
      try { lastSent = Number(sessionStorage.getItem('lastSent')) || 0; } catch (_) {}
      if (Date.now() - lastSent < 30000) {
        showEmailStatus('<i class="ph ph-warning" aria-hidden="true"></i> Please wait a few seconds before sending another message.', 'error');
        return;
      }

      if (!fromName || !fromEmail || !message) {
        showEmailStatus(
          '<i class="ph ph-warning" aria-hidden="true"></i> Please fill in your name, email, and message.',
          'error'
        );
        if (!fromName)       emailFromField?.focus();
        else if (!fromEmail) emailReplyField?.focus();
        else                 emailMessageField?.focus();
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(fromEmail)) {
        showEmailStatus(
          '<i class="ph ph-warning" aria-hidden="true"></i> Please enter a valid email address.',
          'error'
        );
        emailReplyField?.focus();
        return;
      }

      emailSendBtn.disabled  = true;
      emailSendBtn.innerHTML = '<i class="ph ph-circle-notch spin" aria-hidden="true"></i> Sending…';
      showEmailStatus('', '');

      if (typeof emailjs === 'undefined') {
        showEmailStatus(
          '<i class="ph ph-x-circle" aria-hidden="true"></i> Email service not loaded. Please refresh and try again.',
          'error'
        );
        resetSendButton();
        return;
      }

      emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name:  fromName,
          from_email: fromEmail,
          subject:    'New message from portfolio',
          message:    message,
        },
        EMAILJS_PUBLIC_KEY
      )
      .then(() => {
        showEmailStatus(
          '<i class="ph ph-seal-check" aria-hidden="true"></i> Message sent! I\'ll get back to you soon.',
          'success'
        );
        resetSendButton();
        if (emailFromField)    emailFromField.value    = '';
        if (emailReplyField)   emailReplyField.value   = '';
        if (emailMessageField) emailMessageField.value = '';
        try { sessionStorage.removeItem(DRAFT_KEY); sessionStorage.setItem('lastSent', String(Date.now())); } catch (_) {}
        updateCounter();
        showToast('Message sent');
      })
      .catch(err => {
        console.error('EmailJS error:', err);
        const msg = (err && err.text) ? err.text : 'Failed to send. Please try again.';
        showEmailStatus(
          `<i class="ph ph-x-circle" aria-hidden="true"></i> ${msg}`,
          'error'
        );
        resetSendButton();
      });
    });
  }

  /** Helper: set status message + class */
  function showEmailStatus(html, type) {
    if (!emailStatus) return;
    emailStatus.innerHTML = html;
    emailStatus.className = 'email-modal-status' + (type ? ' ' + type : '');
  }

  /** Helper: restore send button to default state */
  function resetSendButton() {
    if (!emailSendBtn) return;
    emailSendBtn.disabled  = false;
    emailSendBtn.innerHTML = '<i class="ph ph-paper-plane-tilt" aria-hidden="true"></i> Send Message';
  }

  // ── Card spotlight (mouse only) ───────────────────────────────
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  // ── Command palette (Ctrl/⌘ + K) ──────────────────────────────
  const palette = document.getElementById('palette');
  const palInput = document.getElementById('paletteInput');
  const palList = document.getElementById('paletteList');
  if (palette && palInput && palList) {
    const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
    const hint = document.getElementById('kbdHint');
    if (hint) hint.textContent = isMac ? '⌘ K' : 'Ctrl K';

    const cmds = [
      ...navLinks.map(a => ({ label: 'Go to ' + a.textContent.trim(), icon: 'ph-hash',
        run: () => document.querySelector(a.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth' }) })),
      { label: 'Send an email',       icon: 'ph-envelope-simple',       run: () => openEmailModal(null) },
      { label: 'Schedule a meeting',  icon: 'ph-calendar-check', run: () => window.open('https://calendly.com/justine-recto/30min', '_blank', 'noopener') },
      { label: 'Search projects',     icon: 'ph-magnifying-glass', run: () => { document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' }); setTimeout(() => projSearch?.focus({ preventScroll: true }), 400); } },
      { label: 'Surprise me',        icon: 'ph-sparkle',        run: () => window.__celebrate?.() },
      { label: 'Replay tour',         icon: 'ph-cursor-click',   run: () => setTimeout(() => window.__startTour?.(), 250) },
      { label: 'Back to top',         icon: 'ph-arrow-up',       run: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
    ];
    let shown = [], sel = 0, palTrigger = null;

    function renderPalette() {
      const q = palInput.value.trim().toLowerCase();
      shown = cmds.filter(c => c.label.toLowerCase().includes(q));
      sel = Math.min(sel, Math.max(shown.length - 1, 0));
      palList.innerHTML = shown.length
        ? shown.map((c, i) => `<li role="option" data-i="${i}" aria-selected="${i === sel}"><i class="ph ${c.icon}" aria-hidden="true"></i>${c.label}</li>`).join('')
        : '<li class="palette-empty" role="option" aria-disabled="true">No matching command</li>';
      palList.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
    }
    function openPalette() {
      palTrigger = document.activeElement;
      palInput.value = ''; sel = 0; renderPalette();
      palette.classList.add('open');
      palInput.focus();
    }
    function closePalette(restore = true) {
      palette.classList.remove('open');
      if (restore) palTrigger?.focus?.();
    }
    function runCommand(i) {
      const c = shown[i];
      if (!c) return;
      closePalette(false);
      c.run();
    }

    document.getElementById('openPalette')?.addEventListener('click', openPalette);
    document.getElementById('paletteBackdrop')?.addEventListener('click', () => closePalette());
    palInput.addEventListener('input', () => { sel = 0; renderPalette(); });
    palList.addEventListener('click', e => {
      const li = e.target.closest('li[data-i]');
      if (li) runCommand(+li.dataset.i);
    });
    palette.addEventListener('keydown', e => {
      const n = shown.length || 1;
      if (e.key === 'Escape')         { closePalette(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); sel = (sel + 1) % n; renderPalette(); }
      else if (e.key === 'ArrowUp')   { e.preventDefault(); sel = (sel - 1 + n) % n; renderPalette(); }
      else if (e.key === 'Enter')     { e.preventDefault(); runCommand(sel); }
      else if (e.key === 'Tab')       { e.preventDefault(); }   // keep focus in the input
    });

    // Global shortcuts: Ctrl/⌘+K opens the menu; "/" jumps to project search
    document.addEventListener('keydown', e => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        palette.classList.contains('open') ? closePalette() : openPalette();
      } else if (e.key === '/' && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
        projSearch?.focus({ preventScroll: true });
      }
    });
  }


  // ── Typewriter (hero) ─────────────────────────────────────────
  const typedEl = document.getElementById('typed');
  if (typedEl) {
    const lines = ['designing interfaces in Figma', 'building web apps', 'learning full-stack development', 'open for collaborations'];
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { typedEl.textContent = lines[0]; }
    else {
      let li = 0, ci = 0, del = false;
      const type = () => {
        const w = lines[li];
        ci += del ? -1 : 1;
        typedEl.textContent = w.slice(0, ci);
        let wait = del ? 28 : 55;
        if (!del && ci === w.length) { del = true; wait = 1600; }
        else if (del && ci === 0) { del = false; li = (li + 1) % lines.length; wait = 350; }
        setTimeout(type, wait);
      };
      type();
    }
  }

  // ── Tech marquee (built from the Tech Stack tags) ─────────────
  const mq = document.getElementById('marqueeTrack');
  if (mq) {
    const tags = Array.from(document.querySelectorAll('#tech .tag'));
    for (let n = 0; n < 2; n++) tags.forEach(t => mq.appendChild(t.cloneNode(true)));
  }

  // ── Logo fallback if a brand icon fails to load ───────────────
  document.querySelectorAll('img.si').forEach(img => img.addEventListener('error', () => {
    const i = document.createElement('i'); i.className = 'ph ph-cpu'; i.setAttribute('aria-hidden', 'true'); img.replaceWith(i);
  }));


  // ── Avatar fallback: initials if the portrait file is missing ──
  const avImg = document.getElementById('avatarImg');
  if (avImg) {
    const miss = () => avImg.closest('.avatar')?.classList.add('no-img');
    avImg.addEventListener('error', miss);
    if (avImg.complete && avImg.naturalWidth === 0) miss();
  }

  // ── Avatar hover swap: photo → character clip (mouse hover, tap on touch) ──
  // Clip timeline: sweep-in 0.2–0.9s · hold ~1.0–3.5s · sweep-out 3.5–4.1s
  const avWrap = document.querySelector('.avatar-wrap');
  const avAlt = document.getElementById('avatarAlt');
  if (avWrap && avAlt) {
    const HOLD_END = 3.5, SWEEP_IN_DONE = 1.0;
    const calmAlt = window.matchMedia('(prefers-reduced-motion: reduce)');
    let active = false, raf = 0, resetT = 0;

    const failed = () => avWrap.classList.add('alt-failed');
    avAlt.addEventListener('error', failed);
    avAlt.querySelectorAll('source').forEach(s => s.addEventListener('error', () => {
      if (!avAlt.currentSrc) failed();
    }));

    const stop = () => { cancelAnimationFrame(raf); raf = 0; };
    const reset = () => { avAlt.pause(); try { avAlt.currentTime = 0; } catch (_) {} };

    // watch the playhead: freeze on the hold frame while the cursor is still on the avatar,
    // and finish (photo returns) once the sweep-out has played
    const watch = () => {
      const t = avAlt.currentTime;
      if (active && t >= HOLD_END) { avAlt.pause(); return; }
      if (!active && (avAlt.ended || t >= 4.05)) {
        avWrap.classList.remove('is-alt'); resetT = setTimeout(reset, 300); return;
      }
      raf = requestAnimationFrame(watch);
    };

    const enter = () => {
      if (avWrap.classList.contains('alt-failed')) return;
      active = true; clearTimeout(resetT); stop();
      avWrap.classList.add('is-alt');
      if (calmAlt.matches) { try { avAlt.currentTime = 2; } catch (_) {} return; }   // still frame, no motion
      try { avAlt.currentTime = 0; } catch (_) {}
      avAlt.play().catch(() => {});
      raf = requestAnimationFrame(watch);
    };

    const leave = () => {
      if (!active) return;
      active = false; stop();
      const t = avAlt.currentTime;
      if (calmAlt.matches || t < SWEEP_IN_DONE || avAlt.paused && t < 0.01) {
        // left before the sweep-in finished: just fade back to the photo
        avWrap.classList.remove('is-alt'); resetT = setTimeout(reset, 300); return;
      }
      if (t < HOLD_END) { try { avAlt.currentTime = HOLD_END; } catch (_) {} }   // jump to the sweep-out
      avAlt.play().catch(() => {});
      raf = requestAnimationFrame(watch);
    };

    avWrap.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') enter(); });
    avWrap.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') leave(); });

    // touch: a tap (not a drag) toggles the swap
    let downX = 0, downY = 0;
    avWrap.addEventListener('pointerdown', e => { downX = e.clientX; downY = e.clientY; });
    avWrap.addEventListener('pointerup', e => {
      if (e.pointerType === 'mouse') return;
      if (Math.hypot(e.clientX - downX, e.clientY - downY) >= 8) return;
      active ? leave() : enter();
    });
  }

  // -- Cool extras: name scramble, magnetic buttons, pixel bursts, Konami --
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)');

  // 1. Hero name "decodes" on load and again on hover
  const nameEl = document.querySelector('.hero-name');
  if (nameEl && !calm.matches) {
    const finalText = nameEl.textContent;
    const glyphs = '01<>/{}[]#$%&*+=?';
    let scrambleRaf = null;
    nameEl.setAttribute('aria-label', finalText);
    const scramble = () => {
      cancelAnimationFrame(scrambleRaf);
      nameEl.style.minWidth = nameEl.offsetWidth + 'px';   // stop layout jitter
      const start = performance.now(), dur = 700;
      const step = now => {
        const p = Math.min(1, (now - start) / dur);
        const reveal = Math.floor(p * finalText.length);
        nameEl.textContent = finalText.split('').map((ch, i) =>
          ch === ' ' || i < reveal ? ch : glyphs[Math.floor(Math.random() * glyphs.length)]).join('');
        if (p < 1) scrambleRaf = requestAnimationFrame(step);
        else { nameEl.textContent = finalText; nameEl.style.minWidth = ''; }
      };
      scrambleRaf = requestAnimationFrame(step);
    };
    setTimeout(scramble, 500);
    nameEl.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') scramble(); });
  }

  // 2. Magnetic hero buttons (mouse only)
  if (fine.matches && !calm.matches) {
    document.querySelectorAll('.cta-row .btn').forEach(btn => {
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) * 0.18;
        const y = (e.clientY - (r.top + r.height / 2)) * 0.28;
        btn.style.transform = `translate(${x}px, ${y}px)`;
      });
      btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
    });
  }

  // 3. Pixel burst (one shared canvas)
  const fx = document.createElement('canvas');
  fx.setAttribute('aria-hidden', 'true');
  Object.assign(fx.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', pointerEvents: 'none', zIndex: '3000' });
  document.body.appendChild(fx);
  const fxCtx = fx.getContext('2d');
  const fxColors = ['#f0f0f0', '#74f442', '#4285f4', '#a442f4', '#f8a000'];
  let parts = [], fxRaf = null;
  function sizeFx() {
    const d = Math.min(window.devicePixelRatio || 1, 2);
    fx.width = innerWidth * d; fx.height = innerHeight * d;
    fxCtx.setTransform(d, 0, 0, d, 0, 0);
  }
  sizeFx();
  window.addEventListener('resize', sizeFx);
  function fxLoop() {
    fxCtx.clearRect(0, 0, innerWidth, innerHeight);
    parts = parts.filter(p => p.life > 0 && p.y < innerHeight + 20);
    parts.forEach(p => {
      p.vy += 0.18; p.x += p.vx; p.y += p.vy; p.life -= 1;
      fxCtx.globalAlpha = Math.min(1, p.life / 20);
      fxCtx.fillStyle = p.c;
      fxCtx.fillRect(Math.round(p.x), Math.round(p.y), p.s, p.s);
    });
    fxRaf = parts.length ? requestAnimationFrame(fxLoop) : null;
    if (!parts.length) fxCtx.clearRect(0, 0, innerWidth, innerHeight);
  }
  function pixelBurst(x, y, n = 14, power = 1) {
    if (calm.matches) return;
    for (let i = 0; i < n; i++) {
      parts.push({
        x, y,
        vx: (Math.random() - 0.5) * 9 * power,
        vy: (-Math.random() * 7 - 2) * power,
        s: Math.random() < 0.4 ? 6 : 4,
        life: 45 + Math.random() * 35,
        c: fxColors[Math.floor(Math.random() * fxColors.length)]
      });
    }
    if (!fxRaf) fxRaf = requestAnimationFrame(fxLoop);
  }
  document.addEventListener('click', e => {
    if (!e.target.closest('.btn, .social-btn, .avatar-wrap')) return;
    pixelBurst(e.clientX, e.clientY, e.target.closest('.avatar-wrap') ? 30 : 12);
  });

  // 4. Konami code easter egg (also: command menu -> "Surprise me")
  function celebrate() {
    [0.2, 0.5, 0.8].forEach((f, i) =>
      setTimeout(() => pixelBurst(innerWidth * f, innerHeight * 0.45, 70, 1.5), i * 220));
    showToast('+30 lives unlocked \uD83C\uDFAE');
  }
  window.__celebrate = celebrate;
  const konami = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let kIdx = 0;
  document.addEventListener('keydown', e => {
    if (/input|textarea|select/i.test(e.target.tagName)) return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    kIdx = k === konami[kIdx] ? kIdx + 1 : (k === konami[0] ? 1 : 0);
    if (kIdx === konami.length) { kIdx = 0; celebrate(); }
  });

}

// Cloudflare Rocket Loader (and any deferred loading) runs this file AFTER
// DOMContentLoaded has fired, so waiting for that event means nothing ever starts.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPortfolio);
} else {
  initPortfolio();
}

// ============================================
//  GUIDED CURSOR TOUR
//  A cursor glides to each section with a chat bubble.
//  Edit GUIDE_NAME and STEPS below to change it.
// ============================================
(() => {
  const GUIDE_NAME = 'Justine';

  // sel = what to point at · idx = which match · at = [x, y] fraction of that element
  const STEPS = [
    { sel: '.hero-name',                       at: [0.75, 0.85], msg: "Hi! I'm Justine, welcome to my portfolio! \uD83D\uDC4B" },
    { sel: '#about .about-body p',             at: [0.45, 0.35], msg: "That's me \u2014 an Information Systems student who loves building for the web." },
    { sel: '#tech .tags', idx: 1,              at: [0.35, 0.5],  msg: "My toolkit: Figma for design, React, Vue, Node.js and more." },
    { sel: '#projects .project-card', idx: 1,  at: [0.82, 0.5],  msg: "Here are my projects. Click any of them to try it live!" },
    { sel: '#experience .tl-item',             at: [0.4, 0.4],   msg: "My work experience, from writing my first line of code to my immersion." },
    { sel: '#education .tl-item',              at: [0.45, 0.35], msg: "Currently pursuing a Bachelor of Science in Information Systems and serving as the 2nd Year Representative of the Information Systems Club." },
    { sel: '#certifications .cert-card',       at: [0.5, 0.4],   msg: "A few certifications in cybersecurity, data science and more." },
    { sel: '#openEmailModalFooter',            at: [0.35, 0.5],  msg: "Want to work together? Send me a message \u2014 I'd love to hear from you!", click: true },
  ];

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const pos = { x: 0, y: 0 };
  let running = false, runId = 0, target = null, raf = null, stopFn = null;

  function start() {
    if (document.querySelector('.email-modal.open, .palette.open, .cert-lightbox.open')) return;
    if (stopFn) stopFn(false);

    const my = ++runId;
    running = true;
    const alive = () => running && my === runId;

    // ── build DOM ──
    const cursor = document.createElement('div');
    cursor.className = 'tour-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    cursor.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M3 2 L3 19 L7.6 14.8 L10.6 21.5 L13.4 20.2 L10.5 13.7 L16.8 13.4 Z" fill="#fff" stroke="#0B0B0D" stroke-width="1.4" stroke-linejoin="round"/></svg>';

    const bubble = document.createElement('div');
    bubble.className = 'tour-bubble';
    bubble.setAttribute('aria-hidden', 'true');
    bubble.innerHTML = '<span class="tour-name"></span><span class="tour-text"><span class="tour-ghost"></span><span class="tour-typed"></span></span>';
    bubble.querySelector('.tour-name').textContent = GUIDE_NAME;
    const ghost = bubble.querySelector('.tour-ghost');
    const typed = bubble.querySelector('.tour-typed');

    document.body.append(cursor, bubble);

    // ── position + follow ──
    pos.x = innerWidth * 0.3; pos.y = innerHeight + 40;
    target = null;

    function pointOf() {
      if (!target) return null;
      const r = target.el.getBoundingClientRect();
      return { x: r.left + r.width * target.fx, y: r.top + r.height * target.fy };
    }
    let last = performance.now();
    function frame(now) {
      if (!alive()) return;
      const dt = Math.min(now - last, 50); last = now;
      const p = pointOf();
      if (p) {
        const k = 1 - Math.exp(-dt * 0.009);
        pos.x += (p.x - pos.x) * k;
        pos.y += (p.y - pos.y) * k;
      }
      cursor.style.transform = `translate3d(${pos.x - 3}px, ${pos.y - 2}px, 0)`;
      const bw = bubble.offsetWidth, bh = bubble.offsetHeight;
      let bx = pos.x + 10, by = pos.y - bh - 6, below = false;
      if (by < 8) { by = pos.y + 28; below = true; }
      bx = Math.max(8, Math.min(bx, innerWidth - bw - 8));
      bubble.classList.toggle('below', below);
      bubble.style.transform = `translate3d(${bx}px, ${by}px, 0)`;
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    // ── stop / interrupts ──
    const onUser = () => stop(false);
    const onKey = e => {
      if (['Escape', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key)) stop(false);
    };
    const evs = ['wheel', 'touchstart', 'mousedown'];
    evs.forEach(n => window.addEventListener(n, onUser, { passive: true, capture: true }));
    window.addEventListener('keydown', onKey, true);

    function stop(finished) {
      if (!running && !stopFn) return;
      running = false; runId++;
      cancelAnimationFrame(raf);
      evs.forEach(n => window.removeEventListener(n, onUser, { capture: true }));
      window.removeEventListener('keydown', onKey, true);
      cursor.classList.remove('on'); bubble.classList.remove('on');
      setTimeout(() => { cursor.remove(); bubble.remove(); }, 350);
      stopFn = null;
      if (finished) window.scrollTo({ top: 0, behavior: reduce.matches ? 'auto' : 'smooth' });
    }
    stopFn = stop;

    // ── helpers ──
    function settle() {
      return new Promise(res => {
        let prev = -1, stable = 0; const t0 = performance.now();
        (function chk() {
          if (!alive()) return res();
          stable = Math.abs(scrollY - prev) < 0.5 ? stable + 1 : 0;
          prev = scrollY;
          if (stable >= 8 || performance.now() - t0 > 3000) return res();
          requestAnimationFrame(chk);
        })();
      });
    }
    function arrive() {
      return new Promise(res => {
        const t0 = performance.now();
        (function chk() {
          if (!alive()) return res();
          const p = pointOf();
          if ((p && Math.hypot(p.x - pos.x, p.y - pos.y) < 6) || performance.now() - t0 > 2500) return res();
          requestAnimationFrame(chk);
        })();
      });
    }
    function click() {
      cursor.classList.remove('ping'); void cursor.offsetWidth; cursor.classList.add('ping', 'press');
      setTimeout(() => cursor.classList.remove('press'), 140);
    }
    async function say(text) {
      const chars = Array.from(text);
      ghost.textContent = text; typed.textContent = '';
      bubble.classList.add('on');
      for (let i = 1; i <= chars.length; i++) {
        if (!alive()) return;
        typed.textContent = chars.slice(0, i).join('');
        await sleep(24);
      }
    }

    // ── run ──
    (async () => {
      cursor.classList.add('on');
      await sleep(500);
      for (const step of STEPS) {
        if (!alive()) return;
        const el = document.querySelectorAll(step.sel)[step.idx || 0];
        if (!el || !el.getClientRects().length) continue;

        bubble.classList.remove('on');
        target = { el, fx: step.at[0], fy: step.at[1] };

        const r = el.getBoundingClientRect();
        const max = document.documentElement.scrollHeight - innerHeight;
        const y = Math.max(0, Math.min(max, scrollY + r.top - innerHeight * 0.45));
        if (Math.abs(y - scrollY) > 40) {
          window.scrollTo({ top: y, behavior: reduce.matches ? 'auto' : 'smooth' });
          await sleep(100);
          await settle();
        }
        if (!alive()) return;
        await arrive();
        if (!alive()) return;
        click();
        await sleep(180);
        await say(step.msg);
        if (!alive()) return;
        if (step.click) { await sleep(600); if (!alive()) return; click(); }
        await sleep(1700);
      }
      if (alive()) stop(true);
    })();
  }

  window.__startTour = start;
  document.getElementById('replayTour')?.addEventListener('click', start);

  // Plays on every page load / refresh (skipped for reduced-motion users; they can still replay it)
  if (!reduce.matches && window.matchMedia('(hover: hover) and (pointer: fine)').matches) setTimeout(start, 2600);
})();

// ============================================
//  AVATAR: pull & release (rubber-band spring)
// ============================================
(() => {
  const av = document.querySelector('.avatar-wrap');
  if (!av) return;
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)');

  // the entrance animation (fill-mode: forwards) would otherwise override inline transforms
  av.addEventListener('animationend', function done(e) {
    if (e.target !== av) return;
    av.style.animation = 'none'; av.style.opacity = '1';
    av.removeEventListener('animationend', done);
  });

  let dragging = false, sx = 0, sy = 0, x = 0, y = 0, vx = 0, vy = 0, raf = null;

  const paint = () => {
    const stretch = 1 + Math.min(Math.hypot(x, y) / 600, 0.12);
    av.style.transform = `translate(${x}px, ${y}px) rotate(${x * 0.06}deg) scale(${dragging ? 1.06 * stretch : 1})`;
  };
  // the further you pull, the harder it resists
  const rubber = d => Math.sign(d) * Math.pow(Math.abs(d), 0.78);

  av.addEventListener('pointerdown', e => {
    if (e.button !== undefined && e.button > 0) return;
    cancelAnimationFrame(raf);
    dragging = true; av.dataset.busy = '1';
    sx = e.clientX; sy = e.clientY; vx = vy = 0;
    av.setPointerCapture(e.pointerId);
    av.classList.add('grabbed');
    e.preventDefault();
  });
  av.addEventListener('pointermove', e => {
    if (!dragging) return;
    x = rubber(e.clientX - sx); y = rubber(e.clientY - sy);
    paint();
  });
  const release = () => {
    if (!dragging) return;
    dragging = false;
    av.classList.remove('grabbed');
    if (calm.matches) { x = y = 0; paint(); av.style.transform = ''; delete av.dataset.busy; return; }
    let last = performance.now();
    const step = now => {
      const dt = Math.min((now - last) / 1000, 0.032); last = now;
      const k = 190, c = 9;                       // spring stiffness / damping -> wobbly snap-back
      vx += (-k * x - c * vx) * dt; vy += (-k * y - c * vy) * dt;
      x += vx * dt; y += vy * dt;
      paint();
      if (Math.abs(x) + Math.abs(y) + Math.abs(vx) + Math.abs(vy) < 0.4) {
        x = y = 0; av.style.transform = ''; delete av.dataset.busy; return;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  };
  av.addEventListener('pointerup', release);
  av.addEventListener('pointercancel', release);
})();

// ============================================
//  MOBILE: block pinch zoom (iOS ignores user-scalable=no)
// ============================================
(() => {
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(t =>
    document.addEventListener(t, e => e.preventDefault()));
  document.addEventListener('touchmove', e => {
    if (e.touches.length > 1) e.preventDefault();
  }, { passive: false });
})();