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

  if (cursorDot && cursorRing) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let isCursorActive = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isCursorActive) {
        cursorDot.style.opacity = '1';
        cursorRing.style.opacity = '1';
        isCursorActive = true;
      }

      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    });

    // Smooth spring trailing for ring
    const renderCursor = () => {
      ringX += (mouseX - ringX) * 0.2;
      ringY += (mouseY - ringY) * 0.2;
      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top = `${ringY}px`;
      requestAnimationFrame(renderCursor);
    };
    requestAnimationFrame(renderCursor);

    // Interactive Hover Triggers
    const hoverTargets = document.querySelectorAll(
      'a, button, [data-cursor], .team-id-card, .gallery-item, .mission-card, .editorial-input, .editorial-select, .editorial-textarea, .cal-day-cell, .cal-event-chip'
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

    // On touchstart, hide custom cursor to prevent lingering on mobile tap
    window.addEventListener('touchstart', () => {
      cursorDot.style.opacity = '0';
      cursorRing.style.opacity = '0';
      isCursorActive = false;
    }, { passive: true });
  }

  // ----------------------------------------------------------------------------
  // 2. Navigation & Fullscreen Mobile Menu Controller
  // ----------------------------------------------------------------------------
  const menuTrigger = document.getElementById('menu-trigger');
  const mobileOverlay = document.getElementById('mobile-nav-overlay');
  const mobileLinks = document.querySelectorAll('[data-nav-close]');

  const toggleMobileMenu = (open) => {
    if (!mobileOverlay || !menuTrigger) return;
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
    menuTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleMobileMenu();
    });

    const mobileCloseBtn = document.getElementById('mobile-nav-close');
    if (mobileCloseBtn) {
      mobileCloseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleMobileMenu(false);
      });
    }

    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => {
        toggleMobileMenu(false);
      });
    });

    // Close when tapping on overlay backdrop itself (outside links/content)
    mobileOverlay.addEventListener('click', (e) => {
      if (e.target === mobileOverlay) {
        toggleMobileMenu(false);
      }
    });

    // Mobile Find Pass Quick Action
    const mobileFindPassBtn = document.getElementById('mobile-btn-find-pass');
    if (mobileFindPassBtn) {
      mobileFindPassBtn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleMobileMenu(false);
        const findPassModal = document.getElementById('find-pass-modal');
        if (findPassModal) {
          findPassModal.classList.add('active');
          findPassModal.setAttribute('aria-hidden', 'false');
          document.body.style.overflow = 'hidden';
        }
      });
    }

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

  if (heroSection) {
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
      { threshold: 0.15 }
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
  // 7. Dynamic Multi-Media Event Gallery (localStorage & Seed Sync)
  // ----------------------------------------------------------------------------
  const GALLERY_STORAGE_KEY = 'qc_event_gallery';

  const DEFAULT_GALLERY_EVENTS = [
    {
      id: 'EVT-001',
      title: 'Quantum Hack 2026: 36h Sprint',
      category: 'events',
      badge: 'EVENTS // FLAGSHIP',
      date: 'MARCH 14 — 16, 2026',
      location: 'Pydah Main Auditorium & High-Compute Labs',
      description: 'The flagship 36-hour non-stop collegiate hackathon bringing together 240+ engineers building distributed systems, AI copilots, and autonomous agents under real-world pressure.',
      gridSpan: 'span-2x2',
      media: [
        {
          type: 'image',
          url: 'assets/gallery/moment_1.svg',
          caption: 'Hackathon Arena & Midnight Sprints',
          isCover: true
        },
        {
          type: 'image',
          url: 'assets/gallery/moment_2.svg',
          caption: 'Mentorship Breakouts & Architecture Reviews',
          isCover: false
        },
        {
          type: 'image',
          url: 'assets/gallery/moment_3.svg',
          caption: 'Final Demo Pitch Showcase',
          isCover: false
        },
        {
          type: 'video',
          url: 'https://drive.google.com/file/d/1demoQuantumHackReel/preview',
          caption: 'Official Quantum Hack 2026 Highlight Reel (Google Drive Stream)',
          isCover: false
        }
      ]
    },
    {
      id: 'EVT-002',
      title: 'Generative AI & LLM Systems Lab',
      category: 'workshops',
      badge: 'WORKSHOPS // APPLIED AI',
      date: 'FEBRUARY 22, 2026',
      location: 'Advanced Computing Lab 03',
      description: 'Hands-on masterclass covering local model quantization, vector databases (RAG), and fine-tuning open-source LLMs on bespoke datasets.',
      gridSpan: 'span-2x1',
      media: [
        {
          type: 'image',
          url: 'assets/gallery/moment_2.svg',
          caption: 'Hands-on Neural Network Fine-tuning',
          isCover: true
        },
        {
          type: 'image',
          url: 'assets/gallery/moment_4.svg',
          caption: 'Vector Embeddings Architecture Walkthrough',
          isCover: false
        },
        {
          type: 'video',
          url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          caption: 'Workshop Keynote & Code Walkthrough',
          isCover: false
        }
      ]
    },
    {
      id: 'EVT-003',
      title: 'Core Council Strategy Summit',
      category: 'team',
      badge: 'TEAM // COUNCIL',
      date: 'JANUARY 18, 2026',
      location: 'Pydah Innovation Boardroom',
      description: 'The annual leadership retreat to formulate the academic syllabus, event roadmap, and internal open-source engineering initiatives.',
      gridSpan: 'span-1x2',
      media: [
        {
          type: 'image',
          url: 'assets/gallery/moment_3.svg',
          caption: 'Council Roadmap & Leadership Strategy',
          isCover: true
        },
        {
          type: 'image',
          url: 'assets/gallery/moment_1.svg',
          caption: 'Whiteboard System Architecture',
          isCover: false
        }
      ]
    },
    {
      id: 'EVT-004',
      title: 'Open Source Community Sprint',
      category: 'activities',
      badge: 'ACTIVITIES // FOSS',
      date: 'FEBRUARY 08, 2026',
      location: 'Open Common Area & Virtual Meet',
      description: 'A global contribution day where club members submitted 35+ pull requests to notable open-source repositories and club utilities.',
      gridSpan: 'span-1x1',
      media: [
        {
          type: 'image',
          url: 'assets/gallery/moment_5.svg',
          caption: 'Real-time PR Submission Tracker',
          isCover: true
        },
        {
          type: 'image',
          url: 'assets/gallery/moment_7.svg',
          caption: 'Pair Programming & Git Conflict Resolution',
          isCover: false
        }
      ]
    },
    {
      id: 'EVT-005',
      title: 'Advanced Web Architecture Jam',
      category: 'workshops',
      badge: 'WORKSHOPS // WEB TECH',
      date: 'MARCH 02, 2026',
      location: 'Software Engineering Lab 01',
      description: 'Deep dive into performant web mechanics: micro-frontends, edge computing workers, web assembly, and zero-framework brutalist styling.',
      gridSpan: 'span-2x1',
      media: [
        {
          type: 'image',
          url: 'assets/gallery/moment_4.svg',
          caption: 'Server-Driven UI & Edge Caching Lab',
          isCover: true
        },
        {
          type: 'image',
          url: 'assets/gallery/moment_8.svg',
          caption: 'Profiling Web Vitals in DevTools',
          isCover: false
        },
        {
          type: 'video',
          url: 'https://drive.google.com/file/d/1demoWebArchStream/preview',
          caption: 'Web Performance Benchmark Demo (Google Drive)',
          isCover: false
        }
      ]
    },
    {
      id: 'EVT-006',
      title: 'Brutalist UI/UX Design Slam',
      category: 'activities',
      badge: 'ACTIVITIES // CREATIVE',
      date: 'FEBRUARY 28, 2026',
      location: 'Creative Media Studio',
      description: 'Speed design challenge centered around editorial brutalism, physical card textures, halftones, and high-impact typography.',
      gridSpan: 'span-1x1',
      media: [
        {
          type: 'image',
          url: 'assets/gallery/moment_7.svg',
          caption: 'Poster Typography & Halftone Design Review',
          isCover: true
        },
        {
          type: 'image',
          url: 'assets/gallery/moment_2.svg',
          caption: 'Digital Texture Workshop',
          isCover: false
        }
      ]
    },
    {
      id: 'EVT-007',
      title: 'Annual Tech Nexus Keynote',
      category: 'events',
      badge: 'EVENTS // ANNUAL SUMMIT',
      date: 'JANUARY 30, 2026',
      location: 'Pydah Central Auditorium',
      description: 'The premier technical assembly inaugurating the 2026 engineering chapters with visionary guest keynotes from enterprise software leaders.',
      gridSpan: 'span-2x1',
      media: [
        {
          type: 'image',
          url: 'assets/gallery/moment_6.svg',
          caption: 'Inauguration & Presidential Address',
          isCover: true
        },
        {
          type: 'image',
          url: 'assets/gallery/moment_3.svg',
          caption: 'Keynote Panel on Decentralized Intelligence',
          isCover: false
        },
        {
          type: 'video',
          url: 'https://drive.google.com/file/d/1demoTechNexusKeynote/preview',
          caption: 'Full Keynote Recording (Google Drive Cloud Stream)',
          isCover: false
        }
      ]
    },
    {
      id: 'EVT-008',
      title: 'Autumn Prototype Expo',
      category: 'events',
      badge: 'EVENTS // DEMO DAY',
      date: 'OCTOBER 24, 2025',
      location: 'Engineering Showcase Quad',
      description: 'Exhibition of autonomous rovers, IoT sensory devices, and student-built production web apps presented to faculty and industry sponsors.',
      gridSpan: 'span-1x1',
      media: [
        {
          type: 'image',
          url: 'assets/gallery/moment_8.svg',
          caption: 'Hardware Sensor Prototyping & Live Demos',
          isCover: true
        },
        {
          type: 'image',
          url: 'assets/gallery/moment_5.svg',
          caption: 'Robotics Control Dashboard',
          isCover: false
        }
      ]
    }
  ];

  const loadGalleryEvents = () => {
    try {
      const stored = localStorage.getItem(GALLERY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Adjust paths for main index if imported from admin relative
          return parsed.map(ev => ({
            ...ev,
            media: ev.media ? ev.media.map(m => ({
              ...m,
              url: m.url.startsWith('../') ? m.url.replace('../', '') : m.url
            })) : []
          }));
        }
      }
    } catch (e) {
      console.warn('Error reading gallery from localStorage:', e);
    }
    return DEFAULT_GALLERY_EVENTS;
  };

  const galleryEvents = loadGalleryEvents();
  const galleryGrid = document.getElementById('gallery-grid');
  const filterPills = document.querySelectorAll('.filter-pill');

  // Render dynamic gallery tiles into #gallery-grid
  if (galleryGrid) {
    galleryGrid.innerHTML = galleryEvents.map((ev, eventIdx) => {
      const cover = (ev.media && ev.media.find(m => m.isCover)) || (ev.media && ev.media[0]) || { url: 'assets/gallery/moment_1.svg' };
      const imageCount = ev.media ? ev.media.filter(m => m.type !== 'video').length : 0;
      const videoCount = ev.media ? ev.media.filter(m => m.type === 'video').length : 0;
      const totalMedia = ev.media ? ev.media.length : 1;

      // Badge pill if multi-media
      let mediaPillHtml = '';
      if (totalMedia > 1) {
        mediaPillHtml = `
          <div class="gallery-media-pill-badge" title="${totalMedia} media files available">
            <span>📷 ${imageCount}</span>
            ${videoCount > 0 ? `<span style="color: var(--color-purple); font-weight: bold;">• 🎥 ${videoCount}</span>` : ''}
          </div>
        `;
      } else if (videoCount === 1) {
        mediaPillHtml = `
          <div class="gallery-media-pill-badge" style="border-color: var(--color-purple); color: var(--color-purple);">
            <span>🎥 VIDEO</span>
          </div>
        `;
      }

      return `
        <div class="gallery-item ${ev.gridSpan || 'span-1x1'}" data-category="${ev.category}" data-event-idx="${eventIdx}" data-cursor="VIEW">
          ${mediaPillHtml}
          <img src="${cover.url}" alt="${ev.title}" class="gallery-img" loading="lazy" onerror="this.src='assets/gallery/moment_1.svg'">
          <div class="gallery-overlay">
            <div class="gallery-overlay-cat">${ev.badge || ev.category.toUpperCase()}</div>
            <h3 class="gallery-overlay-title">${ev.title}</h3>
          </div>
        </div>
      `;
    }).join('');
  }

  // Category Filtering
  const galleryItemNodes = document.querySelectorAll('.gallery-item');
  filterPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      filterPills.forEach((p) => {
        p.classList.remove('active');
        p.setAttribute('aria-selected', 'false');
      });
      pill.classList.add('active');
      pill.setAttribute('aria-selected', 'true');

      const selectedFilter = pill.getAttribute('data-filter');

      galleryItemNodes.forEach((item) => {
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
  // 8. Fullscreen Multi-Media Lightbox (Supports Multiple Images & Google Drive Videos)
  // ----------------------------------------------------------------------------
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxVideoFrame = document.getElementById('lightbox-video-frame');
  const lightboxIframe = document.getElementById('lightbox-iframe');
  const lightboxVideo = document.getElementById('lightbox-video');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxCat = document.getElementById('lightbox-cat');
  const lightboxCounter = document.getElementById('lightbox-counter-badge');
  const lightboxCaption = document.getElementById('lightbox-caption-text');
  const lightboxFilmstrip = document.getElementById('lightbox-filmstrip-bar');
  const lightboxCloseBtn = document.getElementById('lightbox-close-btn');
  const lightboxPrevBtn = document.getElementById('lightbox-prev-btn');
  const lightboxNextBtn = document.getElementById('lightbox-next-btn');

  let currentActiveEvent = null;
  let currentActiveMediaIdx = 0;

  const updateMediaStage = (mediaIdx) => {
    if (!currentActiveEvent || !currentActiveEvent.media || currentActiveEvent.media.length === 0) return;

    currentActiveMediaIdx = mediaIdx;
    const media = currentActiveEvent.media[mediaIdx];
    if (!media) return;

    // Update Counter & Titles
    if (lightboxCounter) {
      lightboxCounter.textContent = `MEDIA ${mediaIdx + 1} OF ${currentActiveEvent.media.length}`;
    }
    if (lightboxTitle) lightboxTitle.textContent = currentActiveEvent.title;
    if (lightboxCat) lightboxCat.textContent = currentActiveEvent.badge || currentActiveEvent.category.toUpperCase();
    if (lightboxCaption) {
      lightboxCaption.textContent = media.caption || currentActiveEvent.description || '';
    }

    // Render Image vs Video
    if (media.type === 'video') {
      if (lightboxImg) lightboxImg.style.display = 'none';
      if (lightboxVideoFrame) lightboxVideoFrame.style.display = 'flex';

      const isDirectVideo = media.url.endsWith('.mp4') || media.url.endsWith('.webm') || media.url.endsWith('.ogg');
      if (isDirectVideo) {
        if (lightboxIframe) {
          lightboxIframe.src = '';
          lightboxIframe.style.display = 'none';
        }
        if (lightboxVideo) {
          lightboxVideo.src = media.url;
          lightboxVideo.style.display = 'block';
        }
      } else {
        // Embed Player (Google Drive preview, YouTube, Vimeo)
        if (lightboxVideo) {
          lightboxVideo.pause();
          lightboxVideo.src = '';
          lightboxVideo.style.display = 'none';
        }
        if (lightboxIframe) {
          lightboxIframe.src = media.url;
          lightboxIframe.style.display = 'block';
        }
      }
    } else {
      // Photo Image
      if (lightboxVideoFrame) {
        lightboxVideoFrame.style.display = 'none';
        if (lightboxIframe) lightboxIframe.src = '';
        if (lightboxVideo) {
          lightboxVideo.pause();
          lightboxVideo.src = '';
        }
      }
      if (lightboxImg) {
        lightboxImg.src = media.url;
        lightboxImg.alt = media.caption || currentActiveEvent.title;
        lightboxImg.style.display = 'block';
      }
    }

    // Update Active Thumbnail in Filmstrip
    if (lightboxFilmstrip) {
      const thumbs = lightboxFilmstrip.querySelectorAll('.filmstrip-thumb-btn');
      thumbs.forEach((t, i) => {
        if (i === mediaIdx) t.classList.add('active');
        else t.classList.remove('active');
      });
    }
  };

  const openEventLightbox = (eventIdx) => {
    currentActiveEvent = galleryEvents[eventIdx];
    if (!currentActiveEvent) return;

    // Render Filmstrip
    if (lightboxFilmstrip) {
      if (currentActiveEvent.media && currentActiveEvent.media.length > 1) {
        lightboxFilmstrip.style.display = 'flex';
        lightboxFilmstrip.innerHTML = currentActiveEvent.media.map((m, idx) => {
          if (m.type === 'video') {
            return `
              <button type="button" class="filmstrip-thumb-btn filmstrip-video-btn ${idx === 0 ? 'active' : ''}" data-idx="${idx}" title="${m.caption || 'Video'}">
                ▶ VIDEO
              </button>
            `;
          }
          return `
            <img src="${m.url}" alt="${m.caption || ''}" class="filmstrip-thumb-btn filmstrip-item ${idx === 0 ? 'active' : ''}" data-idx="${idx}" onerror="this.src='assets/gallery/moment_1.svg'">
          `;
        }).join('');

        lightboxFilmstrip.querySelectorAll('.filmstrip-thumb-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-idx'), 10);
            updateMediaStage(idx);
          });
        });
      } else {
        lightboxFilmstrip.style.display = 'none';
      }
    }

    // Find cover index or start at 0
    let startIdx = 0;
    if (currentActiveEvent.media) {
      const coverIdx = currentActiveEvent.media.findIndex(m => m.isCover);
      if (coverIdx >= 0) startIdx = coverIdx;
    }

    updateMediaStage(startIdx);

    if (lightboxModal) {
      lightboxModal.classList.add('active');
      lightboxModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  };

  const closeLightbox = () => {
    if (!lightboxModal) return;
    lightboxModal.classList.remove('active');
    lightboxModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    // Stop video / iframe playback
    if (lightboxIframe) lightboxIframe.src = '';
    if (lightboxVideo) {
      lightboxVideo.pause();
      lightboxVideo.src = '';
    }
  };

  const nextMediaItem = () => {
    if (!currentActiveEvent || !currentActiveEvent.media || currentActiveEvent.media.length === 0) return;
    const nextIdx = (currentActiveMediaIdx + 1) % currentActiveEvent.media.length;
    updateMediaStage(nextIdx);
  };

  const prevMediaItem = () => {
    if (!currentActiveEvent || !currentActiveEvent.media || currentActiveEvent.media.length === 0) return;
    const prevIdx = (currentActiveMediaIdx - 1 + currentActiveEvent.media.length) % currentActiveEvent.media.length;
    updateMediaStage(prevIdx);
  };

  // Attach card click handlers
  galleryItemNodes.forEach(item => {
    item.addEventListener('click', () => {
      const eventIdx = parseInt(item.getAttribute('data-event-idx'), 10);
      openEventLightbox(eventIdx);
    });
  });

  if (lightboxModal) {
    if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);
    if (lightboxNextBtn) lightboxNextBtn.addEventListener('click', nextMediaItem);
    if (lightboxPrevBtn) lightboxPrevBtn.addEventListener('click', prevMediaItem);

    // Close on click outside
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) closeLightbox();
    });

    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      if (!lightboxModal.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextMediaItem();
      if (e.key === 'ArrowLeft') prevMediaItem();
    });

    // Touch Swipe
    let tStartX = 0;
    let tEndX = 0;
    lightboxModal.addEventListener('touchstart', (e) => {
      tStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    lightboxModal.addEventListener('touchend', (e) => {
      tEndX = e.changedTouches[0].screenX;
      const delta = tEndX - tStartX;
      if (Math.abs(delta) > 50) {
        if (delta < 0) nextMediaItem();
        else prevMediaItem();
      }
    }, { passive: true });
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
    regForm.addEventListener('submit', async (e) => {
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

      // ----------------------------------------------------------------------
      // Registration Submission with Online Supabase Pipeline
      // ----------------------------------------------------------------------
      const REG_STORAGE_KEY = 'qc_student_registrations';
      const REG_CHANNEL_NAME = 'qc_registration_channel';

      const inputStatement = document.getElementById('reg-statement');
      const randomIdSuffix = Math.floor(1000 + Math.random() * 9000);
      const generatedAppId = `APP-2026-${randomIdSuffix}`;

      const newRegistration = {
        id: generatedAppId,
        memberId: null, // Assigned only after Admin Approval
        fullName: inputName.value.trim().toUpperCase(),
        email: inputEmail.value.trim(),
        phone: inputPhone.value.trim(),
        college: inputCollege.value.trim(),
        year: inputYear.value,
        branch: inputBranch.value.trim(),
        interest: inputInterest.value,
        statement: inputStatement ? inputStatement.value.trim() : '',
        status: 'pending', // Awaiting Admin Approval!
        appliedAt: Date.now(),
        reviewedAt: null
      };

      // 1. Submit online to Supabase via serverless API
      try {
        const res = await fetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRegistration)
        });
        if (res.ok) {
          const serverRec = await res.json();
          if (serverRec) {
            Object.assign(newRegistration, serverRec);
          }
        }
      } catch (netErr) {
        console.warn('API /api/students network notice, proceeding:', netErr);
      }

      // 2. Cache in session/localStorage so the student's browser immediately tracks this ID
      try {
        let existingList = [];
        const stored = localStorage.getItem(REG_STORAGE_KEY);
        if (stored) {
          existingList = JSON.parse(stored);
        }
        const filtered = existingList.filter(r => r.id !== newRegistration.id);
        filtered.unshift(newRegistration);
        localStorage.setItem(REG_STORAGE_KEY, JSON.stringify(filtered));
        localStorage.setItem('qc_current_user_app_id', newRegistration.id);
      } catch (err) {
        console.error('Local cache error:', err);
      }

      // 3. Broadcast to Admin Panel via BroadcastChannel
      try {
        if (typeof BroadcastChannel !== 'undefined') {
          const channel = new BroadcastChannel(REG_CHANNEL_NAME);
          channel.postMessage({
            action: 'NEW_REGISTRATION',
            student: newRegistration,
            timestamp: Date.now()
          });
        }
      } catch (err) {
        console.warn('BroadcastChannel notice:', err);
      }

      // Render the Pending Card State
      currentActiveRegistration = newRegistration;
      renderCardFromRecord(newRegistration);

      // Transition to Result Container
      regFormBox.style.display = 'none';
      membershipResult.classList.add('active');
      membershipResult.scrollIntoView({ behavior: 'smooth', block: 'center' });

      showToast(`Application submitted online! Awaiting Admin Approval.`);
    });
  }

  // ----------------------------------------------------------------------------
  // 10. Student Membership Pass Engine: Reactive Pending vs Approved States
  // ----------------------------------------------------------------------------
  const digitalCard = document.getElementById('interactive-digital-card');
  const printBtn = document.getElementById('btn-print-card');
  const resetFormBtn = document.getElementById('btn-reset-form');
  const btnCheckApprovalStatus = document.getElementById('btn-check-approval-status');

  const cardStatusBanner = document.getElementById('reg-status-banner');
  const statusBannerIcon = document.getElementById('status-banner-icon');
  const statusBannerTitle = document.getElementById('status-banner-title');
  const statusBannerDesc = document.getElementById('status-banner-desc');

  const cardPassType = document.getElementById('card-display-pass-type');
  const cardStatusTag = document.getElementById('card-display-status-tag');
  const cardName = document.getElementById('card-display-name');
  const cardIdLabel = document.getElementById('card-display-id-label');
  const cardId = document.getElementById('card-display-id');
  const cardDomain = document.getElementById('card-display-domain');
  const cardCollege = document.getElementById('card-display-college');
  const cardValidity = document.getElementById('card-display-validity');
  const cardPendingNotice = document.getElementById('card-pending-notice');

  let currentActiveRegistration = null;

  // Render card based on registration record data and status
  const renderCardFromRecord = (reg) => {
    if (!reg) return;
    currentActiveRegistration = reg;

    const isApproved = reg.status === 'approved';
    const isPending = reg.status === 'pending';

    if (cardName) cardName.textContent = (reg.fullName || 'YOUR NAME').toUpperCase();
    if (cardDomain) cardDomain.textContent = (reg.interest || 'ENGINEERING').toUpperCase();
    if (cardCollege) cardCollege.textContent = (reg.college || 'PYDAH GROUP').toUpperCase();

    if (isApproved) {
      // Banner -> Approved Emerald
      if (cardStatusBanner) {
        cardStatusBanner.className = 'card-status-banner card-status-banner-approved';
      }
      if (statusBannerIcon) statusBannerIcon.textContent = '✓';
      if (statusBannerTitle) statusBannerTitle.textContent = 'APPLICATION OFFICIALLY APPROVED // CADRE CREDENTIALS ACTIVE';
      if (statusBannerDesc) {
        statusBannerDesc.innerHTML = `Welcome to <strong>Quantum Coders</strong>! Your application was officially approved by the admin. Your verified Member ID <code>${reg.memberId || 'QC-2026-ACTIVE'}</code> has been minted and your official 3D pass is active.`;
      }

      // Card Fields -> Approved State
      if (cardPassType) cardPassType.textContent = 'MEMBER PASS';
      if (cardStatusTag) {
        cardStatusTag.textContent = 'VERIFIED ACTIVE FELLOW';
        cardStatusTag.style.color = 'var(--color-blue)';
      }
      if (cardIdLabel) cardIdLabel.textContent = 'MEMBER ID';
      if (cardId) {
        cardId.textContent = reg.memberId || 'QC-2026-ACTIVE';
        cardId.style.color = '#34D399';
      }
      if (cardValidity) cardValidity.textContent = '2026 — 2027';
      if (cardPendingNotice) cardPendingNotice.style.display = 'none';

      // Action buttons
      if (btnCheckApprovalStatus) btnCheckApprovalStatus.style.display = 'none';
      if (printBtn) printBtn.style.display = 'inline-block';
    } else if (isPending) {
      // Banner -> Pending Amber
      if (cardStatusBanner) {
        cardStatusBanner.className = 'card-status-banner card-status-banner-pending';
      }
      if (statusBannerIcon) statusBannerIcon.textContent = '⏳';
      if (statusBannerTitle) statusBannerTitle.textContent = 'APPLICATION SUBMITTED // AWAITING CADRE APPROVAL';
      if (statusBannerDesc) {
        statusBannerDesc.innerHTML = `Your application <code>${reg.id}</code> is currently <strong>awaiting approval by the admin in the Admin Panel</strong>. Once the admin clicks approve, this card will automatically activate in real time.`;
      }

      // Card Fields -> Pending State
      if (cardPassType) cardPassType.textContent = 'APPLICANT PASS';
      if (cardStatusTag) {
        cardStatusTag.textContent = 'APPLICATION STATUS: PENDING CADRE REVIEW';
        cardStatusTag.style.color = '#FBBF24';
      }
      if (cardIdLabel) cardIdLabel.textContent = 'APPLICATION REF';
      if (cardId) {
        cardId.textContent = reg.id;
        cardId.style.color = '#FBBF24';
      }
      if (cardValidity) cardValidity.textContent = 'PENDING APPROVAL';
      if (cardPendingNotice) cardPendingNotice.style.display = 'flex';

      // Action buttons
      if (btnCheckApprovalStatus) btnCheckApprovalStatus.style.display = 'inline-block';
      if (printBtn) printBtn.style.display = 'none';
    } else {
      // Rejected State
      if (cardStatusBanner) {
        cardStatusBanner.className = 'card-status-banner card-status-banner-rejected';
      }
      if (statusBannerIcon) statusBannerIcon.textContent = '✕';
      if (statusBannerTitle) statusBannerTitle.textContent = 'APPLICATION REVISION REQUIRED';
      if (statusBannerDesc) {
        statusBannerDesc.innerHTML = `Your registration was not approved or requires revision. Please reach out to the club cadre or submit a revised application.`;
      }
      if (cardPassType) cardPassType.textContent = 'REVISION REQUIRED';
      if (cardPendingNotice) cardPendingNotice.style.display = 'none';
      if (btnCheckApprovalStatus) btnCheckApprovalStatus.style.display = 'inline-block';
      if (printBtn) printBtn.style.display = 'none';
    }
  };

  // Check Approval Status manually from Cloud Supabase
  const checkCurrentApprovalStatus = async (showFeedback = true) => {
    let appId = currentActiveRegistration ? currentActiveRegistration.id : localStorage.getItem('qc_current_user_app_id');
    if (!appId) {
      if (showFeedback) showToast('No active application found. Please register first.');
      return;
    }

    let updated = null;

    // 1. Query online API /api/students
    try {
      const res = await fetch(`/api/students?id=${encodeURIComponent(appId)}`);
      if (res.ok) {
        updated = await res.json();
      }
    } catch (e) {}

    // 2. Direct Supabase Client fallback
    if (!updated && window.QC_SUPABASE && window.QC_SUPABASE.isConfigured()) {
      try {
        const client = window.QC_SUPABASE.getClient();
        if (client) {
          const { data } = await client.from('club_members').select('*').or(`id.eq.${appId},member_id.eq.${appId}`).maybeSingle();
          if (data) {
            updated = {
              id: data.id,
              memberId: data.member_id,
              fullName: data.full_name,
              email: data.email,
              phone: data.phone,
              college: data.college,
              year: data.year,
              branch: data.branch,
              interest: data.interest,
              statement: data.statement,
              status: data.status,
              appliedAt: new Date(data.applied_at).getTime(),
              reviewedAt: data.reviewed_at ? new Date(data.reviewed_at).getTime() : null
            };
          }
        }
      } catch (e) {}
    }

    // 3. Local fallback if offline
    if (!updated) {
      try {
        const list = JSON.parse(localStorage.getItem('qc_student_registrations') || '[]');
        updated = list.find(r => r.id === appId);
      } catch (e) {}
    }

    if (updated) {
      const wasPending = currentActiveRegistration && currentActiveRegistration.status === 'pending';
      currentActiveRegistration = updated;
      renderCardFromRecord(updated);

      if (updated.status === 'approved') {
        if (wasPending || showFeedback) {
          showToast(`🎉 APPROVED! Member ID: ${updated.memberId} is active!`, 'success');
        }
      } else if (updated.status === 'pending') {
        if (showFeedback) {
          showToast(`⏳ Status: Still awaiting admin approval in Admin Panel.`);
        }
      } else {
        if (showFeedback) {
          showToast(`✕ Status: Application marked for revision.`);
        }
      }
    } else if (showFeedback) {
      showToast('Application not found. Please verify your reference ID.');
    }
  };

  if (btnCheckApprovalStatus) {
    btnCheckApprovalStatus.addEventListener('click', () => {
      checkCurrentApprovalStatus(true);
    });
  }

  // Real-time listener for Admin Approval via BroadcastChannel & Storage Event
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const clientRegChannel = new BroadcastChannel('qc_registration_channel');
      clientRegChannel.onmessage = (event) => {
        if (!event || !event.data) return;
        const { action, id, memberId, student } = event.data;

        if (action === 'APPROVE') {
          if (currentActiveRegistration && currentActiveRegistration.id === id) {
            currentActiveRegistration.status = 'approved';
            currentActiveRegistration.memberId = memberId;
            renderCardFromRecord(currentActiveRegistration);
            showToast(`🎉 Congratulations! Your application has been approved by the Admin!`);
          }
        } else if (action === 'REJECT' || action === 'REVOKE') {
          if (currentActiveRegistration && currentActiveRegistration.id === id) {
            checkCurrentApprovalStatus(false);
          }
        }
      };
    }
  } catch (err) {
    console.warn('BroadcastChannel error in client:', err);
  }

  // Cross-tab storage event sync
  window.addEventListener('storage', (e) => {
    if (e.key === 'qc_student_registrations' || e.key === 'qc_last_broadcast_approval') {
      checkCurrentApprovalStatus(false);
    }
  });

  // Also check periodically in background every 3.5 seconds if on screen
  setInterval(() => {
    if (membershipResult && membershipResult.classList.contains('active') && currentActiveRegistration && currentActiveRegistration.status === 'pending') {
      checkCurrentApprovalStatus(false);
    }
  }, 3500);

  // Status Lookup Modal
  const statusLookupModal = document.getElementById('status-lookup-modal');
  const btnOpenStatusLookup = document.getElementById('btn-open-status-lookup');
  const statusLookupModalClose = document.getElementById('status-lookup-modal-close');
  const statusLookupCancel = document.getElementById('status-lookup-cancel');
  const statusLookupForm = document.getElementById('status-lookup-form');
  const lookupInput = document.getElementById('lookup-input');
  const lookupErrorMsg = document.getElementById('lookup-error-msg');

  const openStatusLookupModal = () => {
    if (statusLookupForm) statusLookupForm.reset();
    if (lookupErrorMsg) lookupErrorMsg.style.display = 'none';

    // Autofill with last application ID or email if available
    const lastAppId = localStorage.getItem('qc_current_user_app_id');
    if (lastAppId && lookupInput) {
      lookupInput.value = lastAppId;
    }

    if (statusLookupModal) {
      statusLookupModal.style.display = 'flex';
      statusLookupModal.classList.add('active');
    }
  };

  const closeStatusLookupModal = () => {
    if (statusLookupModal) {
      statusLookupModal.classList.remove('active');
      statusLookupModal.style.display = 'none';
    }
  };

  if (btnOpenStatusLookup) btnOpenStatusLookup.addEventListener('click', openStatusLookupModal);
  if (statusLookupModalClose) statusLookupModalClose.addEventListener('click', closeStatusLookupModal);
  if (statusLookupCancel) statusLookupCancel.addEventListener('click', closeStatusLookupModal);
  if (statusLookupModal) {
    statusLookupModal.addEventListener('click', (e) => {
      if (e.target === statusLookupModal) closeStatusLookupModal();
    });
  }

  if (statusLookupForm) {
    statusLookupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const val = (lookupInput ? lookupInput.value : '').trim().toLowerCase();
      if (!val) return;

      let found = null;

      // 1. Query online API /api/students
      try {
        const res = await fetch(`/api/students?query=${encodeURIComponent(val)}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            found = data[0];
          } else if (data && data.id) {
            found = data;
          }
        }
      } catch (err) {}

      // 2. Direct Supabase query
      if (!found && window.QC_SUPABASE && window.QC_SUPABASE.isConfigured()) {
        try {
          const client = window.QC_SUPABASE.getClient();
          if (client) {
            const { data } = await client.from('club_members')
              .select('*')
              .or(`id.ilike.%${val}%,member_id.ilike.%${val}%,email.ilike.%${val}%,phone.ilike.%${val}%`)
              .limit(1);
            if (data && data.length > 0) {
              const d = data[0];
              found = {
                id: d.id,
                memberId: d.member_id,
                fullName: d.full_name,
                email: d.email,
                phone: d.phone,
                college: d.college,
                year: d.year,
                branch: d.branch,
                interest: d.interest,
                statement: d.statement,
                status: d.status,
                appliedAt: new Date(d.applied_at).getTime(),
                reviewedAt: d.reviewed_at ? new Date(d.reviewed_at).getTime() : null
              };
            }
          }
        } catch (e) {}
      }

      // 3. Local fallback
      if (!found) {
        try {
          const list = JSON.parse(localStorage.getItem('qc_student_registrations') || '[]');
          found = list.find(r =>
            (r.id && r.id.toLowerCase() === val) ||
            (r.email && r.email.toLowerCase() === val) ||
            (r.memberId && r.memberId.toLowerCase() === val)
          );
        } catch (err) {}
      }

      if (found) {
        localStorage.setItem('qc_current_user_app_id', found.id);
        closeStatusLookupModal();
        regFormBox.style.display = 'none';
        membershipResult.classList.add('active');
        renderCardFromRecord(found);
        membershipResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
        showToast(`Loaded application for ${found.fullName}!`);
      } else {
        if (lookupErrorMsg) {
          lookupErrorMsg.textContent = 'No application found online with this email or Application ID. Please verify or register anew.';
          lookupErrorMsg.style.display = 'block';
        }
      }
    });
  }

  const hasTouch = 'ontouchstart' in window || (navigator.maxTouchPoints > 0);

  // 3D Tilt Physics for digital card
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
  // 11. Contact Form Handler & Google Apps Script Integration
  // ----------------------------------------------------------------------------
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzSwhqJZShmVRZgXhvvKmts7yXLPdK6BN3-PMdUk0l_ye4T2vR49E1SGIKalrO2ysfY/exec';

  const contactForm = document.querySelector('#contact-form') || document.querySelector('#contact-quick-form');
  const contactName = document.getElementById('contact-name');
  const contactEmail = document.getElementById('contact-email');
  const contactMsg = document.getElementById('contact-message');
  const contactSubmitBtn = document.getElementById('contact-submit-btn');

  const contactErrName = document.getElementById('contact-err-name');
  const contactErrEmail = document.getElementById('contact-err-email');
  const contactErrMsg = document.getElementById('contact-err-message');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      let hasError = false;

      const nameVal = (contactName ? contactName.value : (e.target.name ? e.target.name.value : '')).trim();
      const emailVal = (contactEmail ? contactEmail.value : (e.target.email ? e.target.email.value : '')).trim();
      const messageVal = (contactMsg ? contactMsg.value : (e.target.message ? e.target.message.value : '')).trim();

      if (!nameVal) {
        if (contactErrName) contactErrName.style.display = 'block';
        hasError = true;
      } else {
        if (contactErrName) contactErrName.style.display = 'none';
      }

      if (!emailVal || !validateEmail(emailVal)) {
        if (contactErrEmail) contactErrEmail.style.display = 'block';
        hasError = true;
      } else {
        if (contactErrEmail) contactErrEmail.style.display = 'none';
      }

      if (!messageVal) {
        if (contactErrMsg) contactErrMsg.style.display = 'block';
        hasError = true;
      } else {
        if (contactErrMsg) contactErrMsg.style.display = 'none';
      }

      if (hasError) return;

      const payload = {
        name: nameVal,
        email: emailVal,
        message: messageVal
      };

      // Button loading state
      const originalBtnText = contactSubmitBtn ? contactSubmitBtn.innerHTML : 'Send Message →';
      if (contactSubmitBtn) {
        contactSubmitBtn.disabled = true;
        contactSubmitBtn.innerHTML = 'Transmitting... <span class="btn-arrow">⏳</span>';
      }

      try {
        const res = await fetch(SCRIPT_URL, {
          method: 'POST',
          // text/plain avoids the CORS preflight that Apps Script can't handle
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });

        let result = {};
        try {
          result = await res.json();
        } catch (jsonErr) {
          // If Apps Script returns raw text or HTML redirect
          result = { status: 'success' };
        }

        if (result.status === 'success' || result.result === 'success') {
          showToast('Submitted successfully! Your message was received.');
          alert('Submitted successfully!');
          e.target.reset();
        } else {
          showToast('Error: ' + (result.message || 'Submission failed.'));
          alert('Error: ' + (result.message || 'Submission failed.'));
        }
      } catch (err) {
        console.error('Apps Script submission error:', err);
        showToast('Something went wrong. Please check your connection and try again.');
        alert('Something went wrong. Try again.');
      } finally {
        if (contactSubmitBtn) {
          contactSubmitBtn.disabled = false;
          contactSubmitBtn.innerHTML = originalBtnText;
        }
      }
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
  // Google Drive Embedded Video Section Controller (Multi-Video Config)
  // ----------------------------------------------------------------------------
  const DRIVE_VIDEOS = [
    {
      id: 'FILE_ID_HERE', // <-- Replace with your Google Drive File ID
      title: 'PROJECT_NAME demo',
      label: 'Featured Demo'
    }
    // To support multiple videos, simply add more entries:
    // { id: 'ANOTHER_FILE_ID', title: 'ReconX Project Demo', label: 'ReconX' }
  ];

  const driveIframe = document.getElementById('drive-video-iframe');
  const driveTitle = document.getElementById('drive-video-title');
  const driveTabsContainer = document.getElementById('drive-video-tabs');

  if (driveIframe && Array.isArray(DRIVE_VIDEOS) && DRIVE_VIDEOS.length > 0) {
    const setDriveVideo = (videoObj) => {
      // Must use /preview format for embedding
      driveIframe.src = `https://drive.google.com/file/d/${videoObj.id}/preview`;
      driveIframe.title = `${videoObj.title} - Google Drive Video Player`;
      if (driveTitle) driveTitle.textContent = videoObj.title;
    };

    // Set first video
    setDriveVideo(DRIVE_VIDEOS[0]);

    // If multiple videos exist, render interactive switch tabs
    if (DRIVE_VIDEOS.length > 1 && driveTabsContainer) {
      driveTabsContainer.style.display = 'flex';
      driveTabsContainer.innerHTML = DRIVE_VIDEOS.map((vid, idx) => `
        <button type="button" class="drive-tab-btn ${idx === 0 ? 'active' : ''}" data-idx="${idx}">
          ▶ ${vid.label || vid.title}
        </button>
      `).join('');

      driveTabsContainer.querySelectorAll('.drive-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          driveTabsContainer.querySelectorAll('.drive-tab-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const idx = parseInt(btn.dataset.idx, 10);
          if (DRIVE_VIDEOS[idx]) {
            setDriveVideo(DRIVE_VIDEOS[idx]);
          }
        });
      });
    }
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

  // ----------------------------------------------------------------------------
  // Hidden Stealth Admin Triggers (Ctrl+Shift+A or Triple-Click Copyright)
  // ----------------------------------------------------------------------------
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
      e.preventDefault();
      window.location.href = 'admin/index.html';
    }
  });

  const secretTrigger = document.getElementById('footer-secret-trigger');
  if (secretTrigger) {
    let clickCount = 0;
    let clickTimer = null;
    secretTrigger.addEventListener('click', () => {
      clickCount++;
      clearTimeout(clickTimer);
      if (clickCount >= 3) {
        clickCount = 0;
        window.location.href = 'admin/index.html';
      } else {
        clickTimer = setTimeout(() => {
          clickCount = 0;
        }, 1200);
      }
    });
  }

  // ----------------------------------------------------------------------------
  // 12. Global Website Section Toggles Controller
  // ----------------------------------------------------------------------------
  const initSectionToggles = async () => {
    try {
      const res = await fetch('/api/sections');
      if (!res.ok) return;
      const sectionsMap = await res.json();

      Object.entries(sectionsMap).forEach(([secKey, isEnabled]) => {
        // Find DOM section (e.g. #calendar, #gallery, #team, #register, #contact, #about, #home)
        let targetSec = document.getElementById(secKey);
        if (!targetSec && secKey === 'events') targetSec = document.getElementById('calendar');

        if (targetSec) {
          if (!isEnabled) {
            targetSec.style.display = 'none';
          } else {
            targetSec.style.display = '';
          }
        }

        // Hide navigation links (both desktop and mobile)
        const navLinks = document.querySelectorAll(`[data-section="${secKey}"]`);
        navLinks.forEach((link) => {
          if (!isEnabled) {
            link.style.display = 'none';
          } else {
            link.style.display = '';
          }
        });
      });
    } catch (err) {
      console.info('[Quantum Coders] Using default section visibility layout.');
    }
  };
  initSectionToggles();

  // ----------------------------------------------------------------------------
  // 13. Interactive Monthly Event Calendar & Sprints Engine
  // ----------------------------------------------------------------------------
  let calendarEvents = [];
  let currentCalDate = new Date(); // Current viewing month

  const calMonthYearTitle = document.getElementById('cal-month-year-title');
  const calDaysGrid = document.getElementById('calendar-days-grid');
  const calPrevBtn = document.getElementById('cal-prev-month');
  const calNextBtn = document.getElementById('cal-next-month');
  const calTodayBtn = document.getElementById('cal-today-btn');
  const upcomingCardsGrid = document.getElementById('upcoming-events-cards');

  const escapeHtml = (str) => {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const extractDateString = (raw) => {
    if (!raw) return new Date().toISOString().split('T')[0];
    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      if (trimmed.includes('T')) return trimmed.split('T')[0];
      if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.substring(0, 10);
      const ddmmyyyy = trimmed.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
      if (ddmmyyyy) {
        return `${ddmmyyyy[3]}-${ddmmyyyy[2].padStart(2, '0')}-${ddmmyyyy[1].padStart(2, '0')}`;
      }
    }
    try {
      const d = new Date(raw);
      if (!isNaN(d.getTime())) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      }
    } catch (e) {}
    return new Date().toISOString().split('T')[0];
  };

  const normalizeEvent = (e) => {
    if (!e) return null;
    const name = e.name || e.title || 'Quantum Coders Sprint';
    const date = extractDateString(e.date || e.event_date);
    const maximum_slots = parseInt(e.maximum_slots ?? e.max_capacity ?? 100, 10) || 100;
    const event_type = (e.event_type || e.category || 'WORKSHOP').toUpperCase();
    const banner_url = e.banner_url || e.cover_image || 'images/event%20images/Pydah%20hackathon.png';
    const is_calendar_visible = e.is_calendar_visible !== false;
    const is_registration_open = e.deleted_at ? false : (e.is_registration_open !== false && e.status !== 'CANCELLED');

    return {
      ...e,
      id: String(e.id || e.event_code || `evt-${Date.now()}`),
      name,
      title: name,
      date,
      event_date: date,
      maximum_slots,
      max_capacity: maximum_slots,
      event_type,
      category: event_type.toLowerCase(),
      banner_url,
      cover_image: banner_url,
      status: e.status || 'PUBLISHED',
      is_published: true, // Show all active events by default so user-added Supabase events are never hidden
      is_calendar_visible,
      is_registration_open,
      venue: e.venue || e.location || 'Campus Auditorium',
      start_time: e.start_time || '10:00:00',
      end_time: e.end_time || '18:00:00',
      description: e.description || '',
      confirmed_count: parseInt(e.confirmed_count || 0, 10),
      remaining_slots: e.remaining_slots !== undefined ? e.remaining_slots : Math.max(0, maximum_slots - (e.confirmed_count || 0))
    };
  };

  const renderCalendar = () => {
    if (!calDaysGrid || !calMonthYearTitle) return;

    const year = currentCalDate.getFullYear();
    const month = currentCalDate.getMonth(); // 0-indexed

    const monthNames = [
      'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
      'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
    ];
    calMonthYearTitle.textContent = `${monthNames[month]} ${year}`;

    // Render Quick Month Navigation Pills for all months with events
    let quickPillsWrap = document.getElementById('cal-months-quick-pills');
    if (!quickPillsWrap && calTodayBtn && calTodayBtn.parentElement) {
      quickPillsWrap = document.createElement('div');
      quickPillsWrap.id = 'cal-months-quick-pills';
      quickPillsWrap.style.cssText = 'display: inline-flex; gap: 0.35rem; flex-wrap: wrap; margin-left: 0.6rem; align-items: center;';
      calTodayBtn.parentElement.appendChild(quickPillsWrap);
    }

    if (quickPillsWrap) {
      quickPillsWrap.innerHTML = '';
      const monthsMap = new Map();
      calendarEvents.forEach((ev) => {
        if (!ev || ev.deleted_at || ev.status === 'CANCELLED' || ev.is_calendar_visible === false) return;
        const d = extractDateString(ev.date || ev.event_date);
        if (!d) return;
        const [y, m] = d.split('-').map(Number);
        if (!y || !m) return;
        const key = `${y}-${m}`;
        monthsMap.set(key, (monthsMap.get(key) || 0) + 1);
      });

      // Sort months chronologically
      const sortedKeys = Array.from(monthsMap.keys()).sort((a, b) => {
        const [y1, m1] = a.split('-').map(Number);
        const [y2, m2] = b.split('-').map(Number);
        return y1 !== y2 ? y1 - y2 : m1 - m2;
      });

      sortedKeys.forEach((key) => {
        const count = monthsMap.get(key);
        const [y, m] = key.split('-').map(Number);
        const isCurrentView = y === year && (m - 1) === month;
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = `btn-brutalist btn-sm ${isCurrentView ? 'btn-primary' : 'btn-secondary'}`;
        pill.style.cssText = 'padding: 0.25rem 0.55rem; font-size: 0.68rem; border-radius: 3px; cursor: pointer; display: inline-flex; align-items: center; gap: 0.25rem;';
        pill.innerHTML = `📅 ${monthNames[m - 1].slice(0, 3)} '${String(y).slice(-2)} <span style="opacity: 0.85; font-weight: 700;">(${count})</span>`;
        pill.title = `View events in ${monthNames[m - 1]} ${y}`;
        pill.addEventListener('click', () => {
          currentCalDate = new Date(y, m - 1, 1);
          renderCalendar();
        });
        quickPillsWrap.appendChild(pill);
      });
    }

    // First day of month (0 = Sun, 1 = Mon, ...)
    const firstDayIndex = new Date(year, month, 1).getDay();
    // Total days in current month
    const totalDays = new Date(year, month + 1, 0).getDate();

    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
    const todayDate = today.getDate();

    calDaysGrid.innerHTML = '';

    // Empty cells before first day
    for (let i = 0; i < firstDayIndex; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'cal-day-cell cal-day-empty';
      calDaysGrid.appendChild(emptyCell);
    }

    // Days of current month
    for (let day = 1; day <= totalDays; day++) {
      const cell = document.createElement('div');
      cell.className = 'cal-day-cell';
      if (isCurrentMonth && day === todayDate) {
        cell.classList.add('cal-day-today');
      }

      // Date number
      const numSpan = document.createElement('div');
      numSpan.className = 'cal-day-num';
      numSpan.textContent = day;
      cell.appendChild(numSpan);

      // Event container
      const eventsWrap = document.createElement('div');
      eventsWrap.className = 'cal-events-container';

      // Find events matching this date (YYYY-MM-DD)
      const dayFormatted = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = calendarEvents.filter((e) => {
        if (!e || e.deleted_at || e.status === 'CANCELLED') return false;
        if (e.is_calendar_visible === false) return false;
        const evDate = extractDateString(e.date || e.event_date);
        return evDate === dayFormatted;
      });

      dayEvents.forEach((ev) => {
        const chip = document.createElement('div');
        const typeClass = (ev.event_type || 'workshop').toLowerCase().replace(/\s+/g, '-');
        chip.className = `cal-event-chip cal-chip-${typeClass}`;
        chip.textContent = `${ev.start_time ? ev.start_time.substring(0, 5) : ''} ${ev.name || ev.title}`;
        chip.title = `${ev.name || ev.title} (${ev.venue || 'Auditorium'}) - Click to view pass`;
        chip.addEventListener('click', (e) => {
          e.stopPropagation();
          window.location.href = `event.html?id=${encodeURIComponent(ev.id)}`;
        });
        eventsWrap.appendChild(chip);
      });

      cell.appendChild(eventsWrap);

      // Clicking day cell with events opens event pass directly
      if (dayEvents.length > 0) {
        cell.style.cursor = 'pointer';
        cell.addEventListener('click', () => {
          window.location.href = `event.html?id=${encodeURIComponent(dayEvents[0].id)}`;
        });
      }

      calDaysGrid.appendChild(cell);
    }
  };

  let activeCategoryFilter = 'ALL';

  const initUpcomingEventsCategoryFilters = () => {
    const filterContainer = document.getElementById('upcoming-events-category-filters');
    if (!filterContainer) return;
    const buttons = filterContainer.querySelectorAll('button[data-category]');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategoryFilter = (btn.getAttribute('data-category') || 'ALL').toUpperCase();
        renderUpcomingEvents(calendarEvents);
      });
    });
  };

  const renderUpcomingEvents = (events) => {
    if (!upcomingCardsGrid) return;
    upcomingCardsGrid.innerHTML = '';

    let published = (events || []).filter((e) => {
      if (!e || e.deleted_at || e.status === 'CANCELLED') return false;
      return true;
    });

    if (activeCategoryFilter !== 'ALL') {
      published = published.filter((e) => {
        const type = (e.event_type || e.category || '').toUpperCase();
        return type.includes(activeCategoryFilter);
      });
    }

    if (published.length === 0) {
      const catLabel = activeCategoryFilter === 'ALL' ? '' : ` ${activeCategoryFilter}`;
      upcomingCardsGrid.innerHTML = `<p style="color: var(--color-gray); font-family: var(--font-mono); font-size: 0.85rem; padding: 2.5rem; border: 1.5px dashed var(--border-medium); border-radius: 6px; grid-column: 1 / -1; text-align: center;">No upcoming${escapeHtml(catLabel)} public sprints currently scheduled. Visit the Admin Console to schedule a sprint.</p>`;
      return;
    }

    // Sort upcoming events: scheduled date ascending
    published.sort((a, b) => {
      const da = extractDateString(a.date || a.event_date);
      const db = extractDateString(b.date || b.event_date);
      return da.localeCompare(db);
    });

    published.forEach((ev) => {
      const card = document.createElement('div');
      card.className = 'upcoming-event-card';

      const maxSlots = ev.maximum_slots || ev.max_capacity || 100;
      const conf = ev.confirmed_count || 0;
      const remaining = ev.remaining_slots !== undefined ? ev.remaining_slots : Math.max(0, maxSlots - conf);
      const isFull = ev.is_full || remaining === 0;
      const title = ev.title || ev.name || 'Quantum Coders Sprint';
      const eventDate = extractDateString(ev.date || ev.event_date);
      const cover = ev.banner_url || ev.cover_image || 'images/event%20images/Pydah%20hackathon.png';
      const typeDisplay = (ev.event_type || 'WORKSHOP').toUpperCase();

      card.innerHTML = `
        <img src="${cover}" alt="${escapeHtml(title)}" class="ue-card-banner" onerror="this.src='images/event%20images/Pydah%20hackathon.png'">
        <div class="ue-card-content">
          <div class="ue-badges-row">
            <span class="section-tag" style="background: var(--color-blue); color: #fff; margin: 0; font-size: 0.65rem;">
              ${escapeHtml(typeDisplay)}
            </span>
            <span class="section-tag" style="background: ${isFull ? 'rgba(251,191,36,0.15)' : 'rgba(16,185,129,0.15)'}; color: ${isFull ? '#fbbf24' : '#34d399'}; border-color: ${isFull ? '#fbbf24' : '#10b981'}; margin: 0; font-size: 0.65rem;">
              ${isFull ? 'WAITLIST AVAILABLE' : 'REGISTRATION OPEN'}
            </span>
          </div>

          <h4 class="ue-card-title">${escapeHtml(title)}</h4>
          <p class="ue-card-desc">${escapeHtml(ev.description || 'Join this intensive Quantum Coders sprint session.')}</p>

          <div class="ue-card-meta-list">
            <div><span>📅</span> <strong>${escapeHtml(eventDate)}</strong> • ${ev.start_time ? ev.start_time.substring(0, 5) : '10:00 AM'}</div>
            <div><span>📍</span> ${escapeHtml(ev.venue || 'Campus Auditorium')}</div>
          </div>

          <div class="ue-card-footer">
            <span class="ue-slots-pill">
              ${isFull ? 'WAITLIST' : `${remaining} SLOTS LEFT`}
            </span>
            <a href="event.html?id=${encodeURIComponent(ev.id)}" class="btn-brutalist btn-primary btn-sm" data-cursor="JOIN">
              ${isFull ? 'Join Waitlist →' : 'Register Pass →'}
            </a>
          </div>
        </div>
      `;
      upcomingCardsGrid.appendChild(card);
    });
  };

  // Fetch Events from Supabase -> API -> LocalStorage -> Seeds
  const loadEventsData = async (targetMonthDate = null) => {
    let loaded = [];

    // Tier 1: Supabase live client if configured
    if (window.QC_SUPABASE && typeof window.QC_SUPABASE.getEvents === 'function' && window.QC_SUPABASE.isConfigured()) {
      try {
        const supaEvents = await window.QC_SUPABASE.getEvents();
        if (Array.isArray(supaEvents) && supaEvents.length > 0) {
          loaded = supaEvents;
          console.log('[Quantum Coders] Loaded', loaded.length, 'events live from Supabase.');
        }
      } catch (err) {
        console.warn('[Quantum Coders] Supabase direct event fetch failed:', err);
      }
    }

    // Tier 2: Vercel serverless /api/events endpoint
    if (!loaded.length) {
      try {
        const res = await fetch('/api/events');
        if (res.ok) {
          const apiEvents = await res.json();
          if (Array.isArray(apiEvents) && apiEvents.length > 0) {
            loaded = apiEvents;
          }
        }
      } catch (e) {
        // Offline or static server
      }
    }

    // Tier 3: Always check shared local storage catalog and merge any newly added/edited events
    try {
      const stored = localStorage.getItem('qc_events_catalog');
      if (stored) {
        const parsedStored = JSON.parse(stored);
        if (Array.isArray(parsedStored) && parsedStored.length > 0) {
          const existingIds = new Set(loaded.map((e) => String(e.id || e.event_code || '')));
          parsedStored.forEach((localEv) => {
            if (!localEv || localEv.deleted_at) return;
            const k = String(localEv.id || localEv.event_code || '');
            if (!existingIds.has(k)) {
              loaded.push(localEv);
              existingIds.add(k);
            }
          });
        }
      }
    } catch (e) {}

    // Tier 4: Also check qc_events (Gallery moments console) in case event was created there
    try {
      const galleryEventsStored = localStorage.getItem('qc_events');
      if (galleryEventsStored) {
        const parsedGallery = JSON.parse(galleryEventsStored);
        if (Array.isArray(parsedGallery) && parsedGallery.length > 0) {
          const existingIds = new Set(loaded.map((e) => String(e.id || e.event_code || '')));
          parsedGallery.forEach((galEv) => {
            if (!galEv || !galEv.title) return;
            const k = String(galEv.id || '');
            if (!existingIds.has(k)) {
              loaded.push({
                id: galEv.id,
                name: galEv.title,
                title: galEv.title,
                date: galEv.date || new Date().toISOString().split('T')[0],
                event_date: galEv.date,
                venue: galEv.location || 'Campus Auditorium',
                description: galEv.description || '',
                banner_url: (galEv.media && galEv.media[0] && galEv.media[0].url) || 'images/event%20images/Pydah%20hackathon.png',
                cover_image: (galEv.media && galEv.media[0] && galEv.media[0].url) || 'images/event%20images/Pydah%20hackathon.png',
                category: galEv.category || 'Workshop',
                event_type: galEv.category || 'Workshop',
                maximum_slots: 100,
                is_published: true,
                is_calendar_visible: true,
                status: 'PUBLISHED'
              });
              existingIds.add(k);
            }
          });
        }
      }
    } catch (e) {}

    // Tier 5: Fallback to seed events if catalog is completely empty
    if (!loaded.length) {
      loaded = [
        {
          id: 'evt-001',
          name: 'Deep Dive into LLMs & Agentic Systems',
          title: 'Deep Dive into LLMs & Agentic Systems',
          event_type: 'Workshop',
          banner_url: 'images/event%20images/Pydah%20hackathon.png',
          date: '2026-04-10',
          event_date: '2026-04-10',
          start_time: '10:00:00',
          end_time: '16:00:00',
          venue: 'High-Compute AI Lab & Auditorium',
          maximum_slots: 100,
          confirmed_count: 73,
          is_published: true,
          is_calendar_visible: true,
          is_registration_open: true,
          description: 'Hands-on architectural seminar and coding sprint exploring autonomous agentic workflows and local open-source LLM inference.'
        },
        {
          id: 'evt-002',
          name: 'Quantum Hack 2026: 36h Sprint',
          title: 'Quantum Hack 2026: 36h Sprint',
          event_type: 'Hackathon',
          banner_url: 'images/event%20images/Pydah%20hackathon%201.png',
          date: '2026-04-24',
          event_date: '2026-04-24',
          start_time: '09:00:00',
          end_time: '21:00:00',
          venue: 'Pydah Main Auditorium & Computing Centre',
          maximum_slots: 80,
          confirmed_count: 52,
          is_published: true,
          is_calendar_visible: true,
          is_registration_open: true,
          description: 'The flagship annual 36-hour hackathon bringing together builders, systems engineers, and designers across Andhra Pradesh.'
        }
      ];
    }

    // Filter out deleted events from persistent deletion registry
    let deletedSet = new Set();
    try {
      deletedSet = new Set(JSON.parse(localStorage.getItem('qc_deleted_event_ids') || '[]'));
    } catch (e) {}

    loaded = loaded.filter(e => e && !e.deleted_at && !deletedSet.has(String(e.id)) && !deletedSet.has(String(e.event_code)));

    // Normalize all events
    calendarEvents = loaded.map(normalizeEvent).filter(Boolean);

    // Auto-focus calendar view:
    if (targetMonthDate instanceof Date && !isNaN(targetMonthDate.getTime())) {
      currentCalDate = new Date(targetMonthDate.getFullYear(), targetMonthDate.getMonth(), 1);
    } else {
      const curYear = currentCalDate.getFullYear();
      const curMonth = currentCalDate.getMonth();
      const hasEventsInCurMonth = calendarEvents.some((ev) => {
        if (!ev.date) return false;
        const [y, m] = ev.date.split('-').map(Number);
        return y === curYear && m === (curMonth + 1);
      });

      if (!hasEventsInCurMonth && calendarEvents.length > 0) {
        const todayStr = new Date().toISOString().split('T')[0];
        const upcomingEvent = calendarEvents.find((ev) => (ev.date || ev.event_date || '') >= todayStr) || calendarEvents[0];
        const targetDateStr = upcomingEvent ? (upcomingEvent.date || upcomingEvent.event_date) : null;
        if (targetDateStr) {
          const [y, m] = targetDateStr.split('-').map(Number);
          if (y && m) {
            currentCalDate = new Date(y, m - 1, 1);
          }
        }
      }
    }

    initUpcomingEventsCategoryFilters();
    renderCalendar();
    renderUpcomingEvents(calendarEvents);
    initUpcomingEventPopup();
  };

  // ----------------------------------------------------------------------------
  // 13.5 Automatic Upcoming Event Announcement Popup Modal
  // ----------------------------------------------------------------------------
  let hasShownUpcomingPopup = false;
  const initUpcomingEventPopup = () => {
    if (hasShownUpcomingPopup) return;
    const popupModal = document.getElementById('upcoming-event-popup-modal');
    if (!popupModal) return;

    const popupCloseBtn = document.getElementById('popup-event-close-btn');
    const popupDismissBtn = document.getElementById('popup-event-dismiss-btn');
    const popupActionBtn = document.getElementById('popup-event-action-btn');
    const popupBanner = document.getElementById('popup-event-banner');
    const popupBadge = document.getElementById('popup-event-badge');
    const popupStatusPill = document.getElementById('popup-event-status-pill');
    const popupTitle = document.getElementById('popup-event-title');
    const popupDesc = document.getElementById('popup-event-desc');
    const popupDateTime = document.getElementById('popup-event-datetime');
    const popupVenue = document.getElementById('popup-event-venue');
    const popupSlots = document.getElementById('popup-event-slots');

    const closePopup = () => {
      popupModal.classList.remove('active');
      popupModal.style.display = 'none';
    };

    if (popupCloseBtn) popupCloseBtn.addEventListener('click', closePopup);
    if (popupDismissBtn) popupDismissBtn.addEventListener('click', closePopup);
    popupModal.addEventListener('click', (e) => {
      if (e.target === popupModal) closePopup();
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && popupModal.classList.contains('active')) {
        closePopup();
      }
    });

    const todayStr = new Date().toISOString().split('T')[0];
    const publishedEvents = (calendarEvents || []).filter((e) => {
      if (!e || e.deleted_at) return false;
      if (e.status === 'DRAFT' || e.is_published === false) return false;
      return true;
    });

    if (publishedEvents.length === 0) return;

    publishedEvents.sort((a, b) => {
      const da = extractDateString(a.date || a.event_date);
      const db = extractDateString(b.date || b.event_date);
      return da.localeCompare(db);
    });

    const upcomingEv = publishedEvents.find((e) => extractDateString(e.date || e.event_date) >= todayStr) || publishedEvents[0];
    if (!upcomingEv) return;

    const maxSlots = upcomingEv.maximum_slots || upcomingEv.max_capacity || 100;
    const conf = upcomingEv.confirmed_count || 0;
    const remaining = upcomingEv.remaining_slots !== undefined ? upcomingEv.remaining_slots : Math.max(0, maxSlots - conf);
    const isFull = upcomingEv.is_full || remaining === 0;
    const title = upcomingEv.title || upcomingEv.name || 'Quantum Coders Sprint';
    const evDate = extractDateString(upcomingEv.date || upcomingEv.event_date);
    const cover = upcomingEv.banner_url || upcomingEv.cover_image || 'images/event%20images/Pydah%20hackathon.png';
    const typeDisplay = (upcomingEv.event_type || upcomingEv.category || 'WORKSHOP').toUpperCase();

    if (popupTitle) popupTitle.textContent = title;
    if (popupDesc) popupDesc.textContent = upcomingEv.description || 'Join this intensive technical sprint session hosted by Quantum Coders at Pydah College of Engineering.';
    if (popupBanner) {
      popupBanner.src = cover;
      popupBanner.alt = title;
    }
    if (popupBadge) popupBadge.textContent = typeDisplay;
    if (popupStatusPill) {
      popupStatusPill.textContent = isFull ? 'WAITLIST AVAILABLE' : 'REGISTRATION OPEN';
      popupStatusPill.style.background = isFull ? 'rgba(251,191,36,0.9)' : 'rgba(16,185,129,0.9)';
    }
    if (popupDateTime) {
      popupDateTime.textContent = `${evDate} • ${upcomingEv.start_time ? upcomingEv.start_time.substring(0, 5) : '10:00 AM'}`;
    }
    if (popupVenue) {
      popupVenue.textContent = upcomingEv.venue || 'Campus Auditorium';
    }
    if (popupSlots) {
      popupSlots.textContent = isFull ? 'WAITLIST' : `${remaining} SLOTS LEFT`;
      popupSlots.style.color = isFull ? '#fbbf24' : '#38bdf8';
    }
    if (popupActionBtn) {
      popupActionBtn.href = `event.html?id=${encodeURIComponent(upcomingEv.id)}`;
      popupActionBtn.textContent = isFull ? 'Join Waitlist →' : 'Register Entry Pass →';
    }

    hasShownUpcomingPopup = true;
    setTimeout(() => {
      popupModal.style.display = 'flex';
      popupModal.classList.add('active');
    }, 700);
  };

  // Live Cross-Tab Synchronization
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      const qcEventsChannel = new BroadcastChannel('qc_events_channel');
      qcEventsChannel.onmessage = (msg) => {
        if (!msg || !msg.data) return;
        const { action, type, event } = msg.data;
        if (
          action === 'EVENT_UPDATED' || type === 'QC_EVENT_UPDATE' ||
          action === 'EVENT_DELETED' || type === 'QC_EVENT_DELETE'
        ) {
          console.log('[Quantum Coders] Live event update received from admin:', action || type);
          let targetDate = null;
          if (event && (event.date || event.event_date)) {
            const evDate = extractDateString(event.date || event.event_date);
            const [y, m] = evDate.split('-').map(Number);
            if (y && m) {
              targetDate = new Date(y, m - 1, 1);
            }
          }
          loadEventsData(targetDate);
        }
      };
    } catch (e) {}
  }

  window.addEventListener('storage', (e) => {
    if (e.key === 'qc_events_catalog' || e.key === 'qc_events' || e.key === 'qc_supabase_url') {
      let targetDate = null;
      try {
        if (e.newValue) {
          const arr = JSON.parse(e.newValue);
          if (Array.isArray(arr) && arr.length > 0) {
            const firstEv = arr[0];
            const d = extractDateString(firstEv.date || firstEv.event_date);
            const [y, m] = d.split('-').map(Number);
            if (y && m) targetDate = new Date(y, m - 1, 1);
          }
        }
      } catch (err) {}
      loadEventsData(targetDate);
    }
  });

  window.addEventListener('qc_events_updated', (e) => {
    let targetDate = null;
    if (e.detail && e.detail.date) {
      const [y, m] = extractDateString(e.detail.date).split('-').map(Number);
      if (y && m) targetDate = new Date(y, m - 1, 1);
    }
    loadEventsData(targetDate);
  });

  window.addEventListener('qc_supabase_connected', () => {
    console.log('[Quantum Coders] Supabase connected online, reloading events.');
    loadEventsData();
  });

  loadEventsData();

  if (calPrevBtn) {
    calPrevBtn.addEventListener('click', () => {
      currentCalDate.setMonth(currentCalDate.getMonth() - 1);
      renderCalendar();
    });
  }

  if (calNextBtn) {
    calNextBtn.addEventListener('click', () => {
      currentCalDate.setMonth(currentCalDate.getMonth() + 1);
      renderCalendar();
    });
  }

  if (calTodayBtn) {
    calTodayBtn.addEventListener('click', () => {
      currentCalDate = new Date();
      renderCalendar();
    });
  }

  // ----------------------------------------------------------------------------
  // 14. Find / Retrieve / Cancel Event Pass Engine (Phone + OTP)
  // ----------------------------------------------------------------------------
  const findPassModal = document.getElementById('find-pass-modal');
  const navFindPassBtn = document.getElementById('nav-btn-find-pass');
  const calFindPassBtn = document.getElementById('cal-open-find-pass-btn');
  const closeFindModalBtn = document.getElementById('find-pass-modal-close');

  const openFindPassModal = () => {
    if (!findPassModal) return;
    findPassModal.classList.add('active');
    document.getElementById('otp-step-phone').style.display = 'block';
    document.getElementById('otp-step-verify').style.display = 'none';
    document.getElementById('otp-step-results').style.display = 'none';
    const err1 = document.getElementById('find-phone-error');
    if (err1) err1.style.display = 'none';
    const err2 = document.getElementById('find-otp-error');
    if (err2) err2.style.display = 'none';
  };

  if (navFindPassBtn) navFindPassBtn.addEventListener('click', openFindPassModal);
  if (calFindPassBtn) calFindPassBtn.addEventListener('click', openFindPassModal);
  if (closeFindModalBtn) {
    closeFindModalBtn.addEventListener('click', () => {
      findPassModal.classList.remove('active');
    });
  }
  if (findPassModal) {
    findPassModal.addEventListener('click', (e) => {
      if (e.target === findPassModal) findPassModal.classList.remove('active');
    });
  }

  let userSearchPhone = '';

  const sendFindOtpBtn = document.getElementById('btn-send-find-otp');
  if (sendFindOtpBtn) {
    sendFindOtpBtn.addEventListener('click', async () => {
      const phoneInput = document.getElementById('find-phone-input');
      const err = document.getElementById('find-phone-error');
      if (!phoneInput) return;
      const phone = phoneInput.value.trim();

      if (phone.length < 10) {
        if (err) {
          err.textContent = 'Please enter a valid 10-digit mobile number.';
          err.style.display = 'block';
        }
        return;
      }

      userSearchPhone = phone;
      sendFindOtpBtn.disabled = true;
      sendFindOtpBtn.textContent = 'SENDING OTP...';

      try {
        const res = await fetch('/api/otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'send', phone, purpose: 'RETRIEVE_PASS' })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to send OTP');

        document.getElementById('otp-step-phone').style.display = 'none';
        document.getElementById('otp-step-verify').style.display = 'block';
        const displayPhone = document.getElementById('otp-phone-display');
        if (displayPhone) displayPhone.textContent = phone;

        if (data.dev_preview_code) {
          const devPill = document.getElementById('dev-otp-pill');
          if (devPill) {
            devPill.textContent = `Dev/Testing Verification Code: ${data.dev_preview_code}`;
            devPill.style.display = 'block';
          }
        }
        showToast('Verification code dispatched successfully!');
      } catch (e) {
        if (err) {
          err.textContent = e.message;
          err.style.display = 'block';
        }
      } finally {
        sendFindOtpBtn.disabled = false;
        sendFindOtpBtn.textContent = 'SEND 6-DIGIT VERIFICATION CODE →';
      }
    });
  }

  const verifyFindOtpBtn = document.getElementById('btn-verify-find-otp');
  if (verifyFindOtpBtn) {
    verifyFindOtpBtn.addEventListener('click', async () => {
      const otpInput = document.getElementById('find-otp-input');
      const err = document.getElementById('find-otp-error');
      if (!otpInput) return;
      const otp = otpInput.value.trim();

      if (otp.length < 4) {
        if (err) {
          err.textContent = 'Please enter the verification code.';
          err.style.display = 'block';
        }
        return;
      }

      verifyFindOtpBtn.disabled = true;
      verifyFindOtpBtn.textContent = 'VERIFYING...';

      try {
        const res = await fetch('/api/otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'verify',
            phone: userSearchPhone,
            otp,
            purpose: 'RETRIEVE_PASS'
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Verification failed');

        document.getElementById('otp-step-verify').style.display = 'none';
        document.getElementById('otp-step-results').style.display = 'block';

        const list = document.getElementById('student-passes-list');
        if (list) {
          list.innerHTML = '';
          const passes = data.passes || [];
          if (passes.length === 0) {
            list.innerHTML = '<p style="color: var(--color-gray); font-size: 0.88rem;">No active passes found for this number.</p>';
          } else {
            passes.forEach((p) => {
              const item = document.createElement('div');
              item.style.cssText = 'background: rgba(255,255,255,0.04); border: 1px solid var(--border-subtle); border-radius: 6px; padding: 1rem; text-align: left;';
              item.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.35rem;">
                  <strong style="color: #fff; font-size: 1rem;">${p.event ? p.event.name : 'Event'}</strong>
                  <span style="font-family: var(--font-mono); font-size: 0.72rem; color: ${p.status === 'CONFIRMED' ? '#34d399' : '#fbbf24'}; font-weight: 700;">${p.status}</span>
                </div>
                <div style="font-family: var(--font-mono); font-size: 0.78rem; color: var(--color-gray); margin-bottom: 0.75rem;">
                  Pass ID: <span style="color: var(--color-blue); font-weight: 700;">${p.registration_id}</span> • ${p.name}
                </div>
                <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                  <a href="event.html?id=${encodeURIComponent((p.event && p.event.id) || '')}" class="btn-brutalist btn-secondary btn-sm">
                    View Event Details
                  </a>
                  <button type="button" class="btn-brutalist btn-outline btn-sm" style="color: #f87171; border-color: #ef4444;" onclick="cancelRegistrationFromHome('${p.registration_id}')">
                    Cancel Pass
                  </button>
                </div>
              `;
              list.appendChild(item);
            });
          }
        }
      } catch (e) {
        if (err) {
          err.textContent = e.message;
          err.style.display = 'block';
        }
      } finally {
        verifyFindOtpBtn.disabled = false;
        verifyFindOtpBtn.textContent = 'VERIFY & ACCESS PASSES →';
      }
    });
  }

  const otpBackBtn = document.getElementById('btn-otp-back');
  if (otpBackBtn) {
    otpBackBtn.addEventListener('click', () => {
      document.getElementById('otp-step-verify').style.display = 'none';
      document.getElementById('otp-step-phone').style.display = 'block';
    });
  }

  window.cancelRegistrationFromHome = async (rid) => {
    if (!confirm(`Are you sure you want to cancel pass ${rid}? This immediately invalidates your pass and transfers your slot to the next waitlisted student.`)) {
      return;
    }

    const otp = prompt('Enter the 6-digit verification code to confirm cancellation:');
    if (!otp) return;

    try {
      const res = await fetch('/api/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          phone: userSearchPhone,
          otp,
          purpose: 'CANCEL_REGISTRATION',
          registration_id: rid
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cancellation failed');
      showToast(`Pass ${rid} cancelled successfully.`, 'success');
      findPassModal.classList.remove('active');
      loadEventsData();
    } catch (e) {
      alert(`Cancellation error: ${e.message}`);
    }
  };
});


