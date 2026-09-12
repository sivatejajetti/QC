/**
 * ==============================================================================
 * QUANTUM CODERS // MASTER INTERACTION ENGINE
 * VANILLA JAVASCRIPT (ZERO FRAMEWORKS)
 *
 * Modules:
 * 1. Custom Cursor Engine (Desktop with Dynamic Action Labels)
 * 2. Navigation & Fullscreen Mobile Menu Controller
 * 3. Navbar Scroll Elevation & Active Section Spy
 * 4. Hero 3D Parallax & Geometric Motion
 * 5. Animated Statistics Counter (IntersectionObserver)
 * 6. Kinetic Words Scroll Stream
 * 7. Gallery Category Filter & Asymmetric Grid Transitions
 * 8. Fullscreen Lightbox with Keyboard & Touch Gesture Controls
 * 9. Registration Form Validation & Real-time Field Sanity
 * 10. Digital Membership Card Generator & 3D Tilt Physics
 * 11. Contact Form Handler & Toast Feedback Dispatcher
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ----------------------------------------------------------------------------
  // 1. Custom Cursor Engine
  // ----------------------------------------------------------------------------
  const cursorDot = document.getElementById('cursor-dot');
  const cursorRing = document.getElementById('cursor-ring');
  const cursorText = document.getElementById('cursor-text');
  const hasTouch = window.matchMedia('(hover: none) or (max-width: 992px)').matches;

  if (!hasTouch && cursorDot && cursorRing) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    });

    // Smooth spring trailing for ring
    const renderCursor = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top = `${ringY}px`;
      requestAnimationFrame(renderCursor);
    };
    requestAnimationFrame(renderCursor);

    // Interactive Hover Triggers
    const hoverTargets = document.querySelectorAll(
      'a, button, [data-cursor], .team-id-card, .gallery-item, .mission-card, .editorial-input, .editorial-select, .editorial-textarea'
    );

    hoverTargets.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        cursorRing.classList.add('cursor-active');
        const customLabel = el.getAttribute('data-cursor') || 'OPEN';
        if (cursorText) cursorText.textContent = customLabel;
      });

      el.addEventListener('mouseleave', () => {
        cursorRing.classList.remove('cursor-active');
        if (cursorText) cursorText.textContent = 'EXPLORE';
      });
    });
  }

  // ----------------------------------------------------------------------------
  // 2. Navigation & Fullscreen Mobile Menu Controller
  // ----------------------------------------------------------------------------
  const menuTrigger = document.getElementById('menu-trigger');
  const mobileOverlay = document.getElementById('mobile-nav-overlay');
  const mobileLinks = document.querySelectorAll('[data-nav-close]');

  const toggleMobileMenu = (open) => {
    const shouldOpen = open !== undefined ? open : !mobileOverlay.classList.contains('active');
    if (shouldOpen) {
      menuTrigger.classList.add('active');
      menuTrigger.setAttribute('aria-expanded', 'true');
      mobileOverlay.classList.add('active');
      mobileOverlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    } else {
      menuTrigger.classList.remove('active');
      menuTrigger.setAttribute('aria-expanded', 'false');
      mobileOverlay.classList.remove('active');
      mobileOverlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  };

  if (menuTrigger && mobileOverlay) {
    menuTrigger.addEventListener('click', () => toggleMobileMenu());

    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => toggleMobileMenu(false));
    });

    // Close on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileOverlay.classList.contains('active')) {
        toggleMobileMenu(false);
      }
    });
  }

  // ----------------------------------------------------------------------------
  // 3. Navbar Scroll Elevation & Active Section Spy
  // ----------------------------------------------------------------------------
  const siteHeader = document.getElementById('site-header');
  const navLinks = document.querySelectorAll('.desktop-nav .nav-link');
  const sections = document.querySelectorAll('main > section');

  const onScrollHandler = () => {
    const scrollY = window.scrollY;

    // Header compact style on scroll
    if (siteHeader) {
      if (scrollY > 50) {
        siteHeader.classList.add('scrolled');
      } else {
        siteHeader.classList.remove('scrolled');
      }
    }

    // Scroll spy for current section
    let currentId = '';
    sections.forEach((sec) => {
      const sectionTop = sec.offsetTop - 120;
      const sectionHeight = sec.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentId = sec.getAttribute('id');
      }
    });

    if (currentId) {
      navLinks.forEach((link) => {
        if (link.getAttribute('href') === `#${currentId}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  };

  window.addEventListener('scroll', onScrollHandler, { passive: true });

  // ----------------------------------------------------------------------------
  // 4. Hero 3D Parallax & Geometric Motion
  // ----------------------------------------------------------------------------
  const heroSection = document.getElementById('home');
  const heroCardInner = document.getElementById('hero-card-inner');
  const heroShapes = document.querySelectorAll('.hero-abstract-shape');

  if (heroSection && !hasTouch) {
    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      // Card 3D tilt (if present)
      if (heroCardInner) {
        const rotX = (y / rect.height) * -16;
        const rotY = (x / rect.width) * 16;
        heroCardInner.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale(1.02)`;
      }

      // Subtle parallax on background shapes
      heroShapes.forEach((shape) => {
        const speed = parseFloat(shape.getAttribute('data-speed')) || 0.03;
        const sX = x * speed;
        const sY = y * speed;
        shape.style.transform = `translate(${sX.toFixed(1)}px, ${sY.toFixed(1)}px)`;
      });
    });

    heroSection.addEventListener('mouseleave', () => {
      if (heroCardInner) {
        heroCardInner.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
      }
      heroShapes.forEach((shape) => {
        shape.style.transform = 'translate(0px, 0px)';
      });
    });
  }

  // ----------------------------------------------------------------------------
  // 5. Animated Statistics Counter (IntersectionObserver)
  // ----------------------------------------------------------------------------
  const statNumbers = document.querySelectorAll('.stat-number');
  let statsCounted = false;

  const animateCounter = (el) => {
    const target = parseInt(el.getAttribute('data-target'), 10) || 0;
    const duration = 1800; // ms
    const startTime = performance.now();

    const updateCount = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quartic
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      const currentVal = Math.floor(easeProgress * target);

      el.textContent = currentVal;

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        el.textContent = target;
      }
    };

    requestAnimationFrame(updateCount);
  };

  const statsStrip = document.getElementById('stats-strip');
  if (statsStrip && statNumbers.length > 0) {
    const statsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !statsCounted) {
            statsCounted = true;
            statNumbers.forEach((numEl) => animateCounter(numEl));
          }
        });
      },
      { threshold: 0.35 }
    );

    statsObserver.observe(statsStrip);
  }

  // ----------------------------------------------------------------------------
  // 6. Kinetic Words Scroll Stream
  // ----------------------------------------------------------------------------
  const kineticWords = document.querySelectorAll('.kinetic-word');
  if (kineticWords.length > 0) {
    let wordIdx = 0;
    setInterval(() => {
      kineticWords.forEach((kw) => kw.classList.remove('active'));
      kineticWords[wordIdx].classList.add('active');
      wordIdx = (wordIdx + 1) % kineticWords.length;
    }, 2400);

    kineticWords.forEach((kw) => {
      kw.addEventListener('mouseenter', () => {
        kineticWords.forEach((w) => w.classList.remove('active'));
        kw.classList.add('active');
      });
    });
  }

  // ----------------------------------------------------------------------------
  // 7. Gallery Category Filter & Asymmetric Grid Transitions
  // ----------------------------------------------------------------------------
  const filterPills = document.querySelectorAll('.filter-pill');
  const galleryItems = document.querySelectorAll('.gallery-item');

  filterPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      // Set active pill
      filterPills.forEach((p) => {
        p.classList.remove('active');
        p.setAttribute('aria-selected', 'false');
      });
      pill.classList.add('active');
      pill.setAttribute('aria-selected', 'true');

      const selectedFilter = pill.getAttribute('data-filter');

      galleryItems.forEach((item) => {
        const itemCategory = item.getAttribute('data-category');
        if (selectedFilter === 'all' || itemCategory === selectedFilter) {
          item.style.display = '';
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          }, 20);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.95)';
          setTimeout(() => {
            item.style.display = 'none';
          }, 250);
        }
      });
    });
  });

  // ----------------------------------------------------------------------------
  // 8. Fullscreen Lightbox with Keyboard & Touch Gesture Controls
  // ----------------------------------------------------------------------------
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxCat = document.getElementById('lightbox-cat');
  const lightboxCloseBtn = document.getElementById('lightbox-close-btn');
  const lightboxPrevBtn = document.getElementById('lightbox-prev-btn');
  const lightboxNextBtn = document.getElementById('lightbox-next-btn');

  // Collect image data
  const galleryData = [];
  galleryItems.forEach((item, idx) => {
    const img = item.querySelector('.gallery-img');
    const title = item.querySelector('.gallery-overlay-title');
    const cat = item.querySelector('.gallery-overlay-cat');

    galleryData.push({
      src: img ? img.getAttribute('src') : '',
      alt: img ? img.getAttribute('alt') : 'Quantum Coders Moment',
      title: title ? title.textContent : 'Event Showcase',
      cat: cat ? cat.textContent : 'ARCHIVE',
      category: item.getAttribute('data-category')
    });

    item.addEventListener('click', () => {
      openLightbox(idx);
    });
  });

  let currentLightboxIdx = 0;

  const getVisibleIndices = () => {
    const activeFilter = document.querySelector('.filter-pill.active')?.getAttribute('data-filter') || 'all';
    const visible = [];
    galleryData.forEach((d, i) => {
      if (activeFilter === 'all' || d.category === activeFilter) {
        visible.push(i);
      }
    });
    return visible.length > 0 ? visible : [0];
  };

  const updateLightboxContent = (index) => {
    currentLightboxIdx = index;
    const data = galleryData[index];
    if (!data) return;

    lightboxImg.src = data.src;
    lightboxImg.alt = data.alt;
    lightboxTitle.textContent = data.title;
    lightboxCat.textContent = data.cat;
  };

  const openLightbox = (index) => {
    updateLightboxContent(index);
    lightboxModal.classList.add('active');
    lightboxModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightboxModal.classList.remove('active');
    lightboxModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  const nextLightboxImg = () => {
    const visible = getVisibleIndices();
    const curPos = visible.indexOf(currentLightboxIdx);
    const nextPos = (curPos + 1) % visible.length;
    updateLightboxContent(visible[nextPos]);
  };

  const prevLightboxImg = () => {
    const visible = getVisibleIndices();
    const curPos = visible.indexOf(currentLightboxIdx);
    const prevPos = (curPos - 1 + visible.length) % visible.length;
    updateLightboxContent(visible[prevPos]);
  };

  if (lightboxModal) {
    lightboxCloseBtn.addEventListener('click', closeLightbox);
    lightboxNextBtn.addEventListener('click', nextLightboxImg);
    lightboxPrevBtn.addEventListener('click', prevLightboxImg);

    // Close when clicking modal backdrop
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        closeLightbox();
      }
    });

    // Keyboard Navigation: Escape, ArrowLeft, ArrowRight
    window.addEventListener('keydown', (e) => {
      if (!lightboxModal.classList.contains('active')) return;

      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextLightboxImg();
      if (e.key === 'ArrowLeft') prevLightboxImg();
    });

    // Touch Swipe Gesture Support
    let touchStartX = 0;
    let touchEndX = 0;

    lightboxModal.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightboxModal.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    const handleSwipe = () => {
      const delta = touchEndX - touchStartX;
      if (Math.abs(delta) > 50) {
        if (delta < 0) nextLightboxImg();
        else prevLightboxImg();
      }
    };
  }

  // ----------------------------------------------------------------------------
  // 9. Registration Form Validation & Real-time Field Sanity
  // ----------------------------------------------------------------------------
  const regForm = document.getElementById('club-registration-form');
  const regFormBox = document.getElementById('register-form-box');
  const membershipResult = document.getElementById('membership-result-container');

  // Input elements
  const inputName = document.getElementById('reg-fullname');
  const inputEmail = document.getElementById('reg-email');
  const inputPhone = document.getElementById('reg-phone');
  const inputCollege = document.getElementById('reg-college');
  const inputYear = document.getElementById('reg-year');
  const inputBranch = document.getElementById('reg-branch');
  const inputInterest = document.getElementById('reg-interest');

  // Groups
  const groupName = document.getElementById('group-fullname');
  const groupEmail = document.getElementById('group-email');
  const groupPhone = document.getElementById('group-phone');
  const groupCollege = document.getElementById('group-college');
  const groupYear = document.getElementById('group-year');
  const groupBranch = document.getElementById('group-branch');
  const groupInterest = document.getElementById('group-interest');

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone) => {
    return /^[0-9+-\s()]{10,15}$/.test(phone.trim());
  };

  const setGroupError = (group, hasError) => {
    if (hasError) {
      group.classList.add('has-error');
    } else {
      group.classList.remove('has-error');
    }
  };

  // Real-time input clear error
  [inputName, inputEmail, inputPhone, inputCollege, inputYear, inputBranch, inputInterest].forEach((inp) => {
    if (!inp) return;
    inp.addEventListener('input', () => {
      const group = inp.closest('.form-group');
      if (group) setGroupError(group, false);
    });
    inp.addEventListener('change', () => {
      const group = inp.closest('.form-group');
      if (group) setGroupError(group, false);
    });
  });

  if (regForm) {
    regForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let isValid = true;

      // Validate Full Name
      if (!inputName.value.trim() || inputName.value.trim().length < 2) {
        setGroupError(groupName, true);
        isValid = false;
      } else {
        setGroupError(groupName, false);
      }

      // Validate Email
      if (!inputEmail.value.trim() || !validateEmail(inputEmail.value.trim())) {
        setGroupError(groupEmail, true);
        isValid = false;
      } else {
        setGroupError(groupEmail, false);
      }

      // Validate Phone
      if (!inputPhone.value.trim() || !validatePhone(inputPhone.value.trim())) {
        setGroupError(groupPhone, true);
        isValid = false;
      } else {
        setGroupError(groupPhone, false);
      }

      // Validate College
      if (!inputCollege.value.trim()) {
        setGroupError(groupCollege, true);
        isValid = false;
      } else {
        setGroupError(groupCollege, false);
      }

      // Validate Year
      if (!inputYear.value) {
        setGroupError(groupYear, true);
        isValid = false;
      } else {
        setGroupError(groupYear, false);
      }

      // Validate Branch
      if (!inputBranch.value.trim()) {
        setGroupError(groupBranch, true);
        isValid = false;
      } else {
        setGroupError(groupBranch, false);
      }

      // Validate Interest
      if (!inputInterest.value) {
        setGroupError(groupInterest, true);
        isValid = false;
      } else {
        setGroupError(groupInterest, false);
      }

      if (!isValid) {
        showToast('Please correct the highlighted fields before submitting.');
        return;
      }

      // Generate Member ID (e.g. QC-2026-4819)
      const randomIdSuffix = Math.floor(1000 + Math.random() * 9000);
      const generatedMemberId = `QC-2026-${randomIdSuffix}`;

      // Populate Digital Card
      const cardName = document.getElementById('card-display-name');
      const cardId = document.getElementById('card-display-id');
      const cardDomain = document.getElementById('card-display-domain');
      const cardCollege = document.getElementById('card-display-college');

      if (cardName) cardName.textContent = inputName.value.trim().toUpperCase();
      if (cardId) cardId.textContent = generatedMemberId;
      if (cardDomain) cardDomain.textContent = inputInterest.value.toUpperCase();
      if (cardCollege) cardCollege.textContent = inputCollege.value.trim().toUpperCase();

      // Transition to Success State
      regFormBox.style.display = 'none';
      membershipResult.classList.add('active');

      // Scroll smoothly to membership result
      membershipResult.scrollIntoView({ behavior: 'smooth', block: 'center' });

      showToast(`Welcome ${inputName.value.trim()}! Your ID ${generatedMemberId} is active.`);
    });
  }

  // ----------------------------------------------------------------------------
  // 10. Digital Membership Card Generator & 3D Tilt Physics
  // ----------------------------------------------------------------------------
  const digitalCard = document.getElementById('interactive-digital-card');
  const printBtn = document.getElementById('btn-print-card');
  const resetFormBtn = document.getElementById('btn-reset-form');

  if (digitalCard && !hasTouch) {
    digitalCard.addEventListener('mousemove', (e) => {
      const rect = digitalCard.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const rotX = (y / rect.height) * -22;
      const rotY = (x / rect.width) * 22;

      digitalCard.style.transform = `perspective(1200px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale(1.03)`;
      digitalCard.style.boxShadow = `${-rotY}px ${rotX + 35}px 70px rgba(0,0,0,0.9), 0 0 35px rgba(59, 130, 246, 0.4)`;
    });

    digitalCard.addEventListener('mouseleave', () => {
      digitalCard.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1)';
      digitalCard.style.boxShadow = '0 35px 70px rgba(0, 0, 0, 0.9), 0 0 30px rgba(59, 130, 246, 0.25)';
    });
  }

  // Print Card
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // Reset & Register Another Member
  if (resetFormBtn) {
    resetFormBtn.addEventListener('click', () => {
      regForm.reset();
      membershipResult.classList.remove('active');
      regFormBox.style.display = '';
      regFormBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // ----------------------------------------------------------------------------
  // 11. Contact Form Handler & Toast Feedback Dispatcher
  // ----------------------------------------------------------------------------
  const contactForm = document.getElementById('contact-quick-form');
  const contactName = document.getElementById('contact-name');
  const contactEmail = document.getElementById('contact-email');
  const contactMsg = document.getElementById('contact-message');

  const contactErrName = document.getElementById('contact-err-name');
  const contactErrEmail = document.getElementById('contact-err-email');
  const contactErrMsg = document.getElementById('contact-err-message');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let hasError = false;

      if (!contactName.value.trim()) {
        contactErrName.style.display = 'block';
        hasError = true;
      } else {
        contactErrName.style.display = 'none';
      }

      if (!contactEmail.value.trim() || !validateEmail(contactEmail.value.trim())) {
        contactErrEmail.style.display = 'block';
        hasError = true;
      } else {
        contactErrEmail.style.display = 'none';
      }

      if (!contactMsg.value.trim()) {
        contactErrMsg.style.display = 'block';
        hasError = true;
      } else {
        contactErrMsg.style.display = 'none';
      }

      if (hasError) return;

      // Success Feedback
      showToast('Message transmitted to Quantum Coders council. We will reach out soon!');
      contactForm.reset();
    });
  }

  // Toast Notification Utility
  const toastNotice = document.getElementById('toast-notice');
  let toastTimeout;

  function showToast(msg) {
    if (!toastNotice) return;
    toastNotice.textContent = msg;
    toastNotice.classList.add('active');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toastNotice.classList.remove('active');
    }, 4500);
  }

  // ----------------------------------------------------------------------------
  // 12. 3D Tiered Cadre Deck Controller (Synchronized Pop-out & Layered Slabs)
  // ----------------------------------------------------------------------------
  const cadreStage = document.getElementById('cadre-deck-stage');
  const btnViewDeck = document.getElementById('btn-view-deck');
  const btnViewGrid = document.getElementById('btn-view-grid');
  const cadreCards = document.querySelectorAll('.cadre-fan-card');
  const cadreSlabs = document.querySelectorAll('.cadre-bg-slab');

  if (cadreStage && cadreCards.length > 0) {
    const activateMember = (idx) => {
      if (!cadreStage.classList.contains('grid-mode') && window.innerWidth > 992) {
        cadreStage.classList.add('has-active-card');
        const card = cadreStage.querySelector(`.cadre-fan-card[data-index="${idx}"]`);
        const slab = cadreStage.querySelector(`.cadre-bg-slab[data-index="${idx}"]`);
        if (card) card.classList.add('is-active-card');
        if (slab) slab.classList.add('is-active-slab');
      }
    };

    const deactivateMember = (idx) => {
      cadreStage.classList.remove('has-active-card');
      const card = cadreStage.querySelector(`.cadre-fan-card[data-index="${idx}"]`);
      const slab = cadreStage.querySelector(`.cadre-bg-slab[data-index="${idx}"]`);
      if (card) card.classList.remove('is-active-card');
      if (slab) slab.classList.remove('is-active-slab');
    };

    // Card Hover & Click Listeners
    cadreCards.forEach((card) => {
      const idx = card.getAttribute('data-index');

      card.addEventListener('mouseenter', () => activateMember(idx));
      card.addEventListener('mouseleave', () => deactivateMember(idx));

      // Clicking card background navigates to dossier link
      card.addEventListener('click', (e) => {
        if (!e.target.closest('a')) {
          const dossierLink = card.querySelector('a');
          if (dossierLink) dossierLink.click();
        }
      });
    });

    // Slab Hover & Click Listeners
    cadreSlabs.forEach((slab) => {
      const idx = slab.getAttribute('data-index');

      slab.addEventListener('mouseenter', () => activateMember(idx));
      slab.addEventListener('mouseleave', () => deactivateMember(idx));

      slab.addEventListener('click', () => {
        const card = cadreStage.querySelector(`.cadre-fan-card[data-index="${idx}"]`);
        if (card) {
          const dossierLink = card.querySelector('a');
          if (dossierLink) dossierLink.click();
        }
      });
    });

    // View Mode Switcher (Desktop toggle)
    if (btnViewDeck && btnViewGrid) {
      btnViewDeck.addEventListener('click', () => {
        btnViewDeck.classList.add('active');
        btnViewGrid.classList.remove('active');
        cadreStage.classList.remove('grid-mode');
      });

      btnViewGrid.addEventListener('click', () => {
        btnViewGrid.classList.add('active');
        btnViewDeck.classList.remove('active');
        cadreStage.classList.add('grid-mode');
      });
    }

    // Auto-detection: Mobile shows Expanded Grid, Desktop shows 3D Cadre Deck
    const handleCadreResponsiveMode = () => {
      const isMobile = window.innerWidth <= 992;
      if (isMobile) {
        cadreStage.classList.add('grid-mode');
        if (btnViewGrid) btnViewGrid.classList.add('active');
        if (btnViewDeck) btnViewDeck.classList.remove('active');
      } else {
        cadreStage.classList.remove('grid-mode');
        if (btnViewDeck) btnViewDeck.classList.add('active');
        if (btnViewGrid) btnViewGrid.classList.remove('active');
      }
    };

    handleCadreResponsiveMode();
    window.addEventListener('resize', handleCadreResponsiveMode);
  }
});
