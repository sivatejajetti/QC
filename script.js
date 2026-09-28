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

    const mobileCloseBtn = document.getElementById('mobile-nav-close');
    if (mobileCloseBtn) {
      mobileCloseBtn.addEventListener('click', () => toggleMobileMenu(false));
    }

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

      // ----------------------------------------------------------------------
      // Registration Submission with Admin Approval Pipeline
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

      // Save to localStorage registrations array
      try {
        let existingList = [];
        const stored = localStorage.getItem(REG_STORAGE_KEY);
        if (stored) {
          existingList = JSON.parse(stored);
        }
        existingList.unshift(newRegistration);
        localStorage.setItem(REG_STORAGE_KEY, JSON.stringify(existingList));
        localStorage.setItem('qc_current_user_app_id', generatedAppId);
      } catch (err) {
        console.error('Failed to save registration:', err);
      }

      // Broadcast to Admin Panel via BroadcastChannel
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
        console.warn('BroadcastChannel error:', err);
      }

      // Render the Pending Card State
      currentActiveRegistration = newRegistration;
      renderCardFromRecord(newRegistration);

      // Transition to Result Container
      regFormBox.style.display = 'none';
      membershipResult.classList.add('active');
      membershipResult.scrollIntoView({ behavior: 'smooth', block: 'center' });

      showToast(`Application submitted! Awaiting Admin Approval in Admin Panel.`);
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

  // Check Approval Status manually
  const checkCurrentApprovalStatus = (showFeedback = true) => {
    if (!currentActiveRegistration) {
      const savedAppId = localStorage.getItem('qc_current_user_app_id');
      if (savedAppId) {
        try {
          const list = JSON.parse(localStorage.getItem('qc_student_registrations') || '[]');
          const found = list.find(r => r.id === savedAppId);
          if (found) currentActiveRegistration = found;
        } catch (e) {}
      }
    }

    if (!currentActiveRegistration) {
      if (showFeedback) showToast('No active application found. Please register first.');
      return;
    }

    // Refresh from localStorage
    try {
      const list = JSON.parse(localStorage.getItem('qc_student_registrations') || '[]');
      const updated = list.find(r => r.id === currentActiveRegistration.id);
      if (updated) {
        const wasPending = currentActiveRegistration.status === 'pending';
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
      }
    } catch (err) {
      console.error(err);
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

    if (statusLookupModal) statusLookupModal.classList.add('active');
  };

  const closeStatusLookupModal = () => {
    if (statusLookupModal) statusLookupModal.classList.remove('active');
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
    statusLookupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = (lookupInput ? lookupInput.value : '').trim().toLowerCase();
      if (!val) return;

      try {
        const list = JSON.parse(localStorage.getItem('qc_student_registrations') || '[]');
        const found = list.find(r =>
          (r.id && r.id.toLowerCase() === val) ||
          (r.email && r.email.toLowerCase() === val) ||
          (r.memberId && r.memberId.toLowerCase() === val)
        );

        if (found) {
          closeStatusLookupModal();
          regFormBox.style.display = 'none';
          membershipResult.classList.add('active');
          renderCardFromRecord(found);
          membershipResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
          showToast(`Loaded application for ${found.fullName}!`);
        } else {
          if (lookupErrorMsg) {
            lookupErrorMsg.textContent = 'No application found with this email or Application ID. Please verify or register anew.';
            lookupErrorMsg.style.display = 'block';
          }
        }
      } catch (err) {
        console.error(err);
      }
    });
  }

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
  // 12. Ceremonial Launch Mode Controller (Multi-Device Realtime Sync)
  // ----------------------------------------------------------------------------
  const launchOverlay = document.getElementById('launch-mode-overlay');
  const launchCoreBtn = document.getElementById('launch-core-button');
  const launchExitBtn = document.getElementById('launch-exit-btn');
  const launchResetBtn = document.getElementById('launch-reset-btn');
  const footerLaunchBtn = document.getElementById('footer-launch-trigger');
  const launchHud = document.getElementById('launch-hud-overlay');
  const launchHudStatus = document.getElementById('launch-hud-status');
  const launchHudCount = document.getElementById('launch-hud-countdown');
  const launchHudBar = document.getElementById('launch-hud-bar');
  const launchCelebrateCard = document.getElementById('launch-celebrate-card');
  const launchCanvas = document.getElementById('launch-canvas');

  const LAUNCH_SYNC_TOPIC = 'qc-pydah-launch-sriram-2026';
  let isLaunching = false;
  let animFrameId = null;
  let confettiParticles = [];
  let ambientParticles = [];
  let warpStars = [];
  let shockwaves = [];
  let supernovaFlash = { active: false, radius: 0, maxRadius: 0, alpha: 0, spikeAngle: 0 };
  let warpSpeed = 0;
  let targetWarpSpeed = 0;
  let lastRemoteTriggerTime = 0;

  // Web Audio Synthesizer Engine (Self-contained, zero external audio assets)
  let sharedAudioCtx = null;
  const getAudioContext = () => {
    try {
      if (!sharedAudioCtx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) sharedAudioCtx = new AudioCtx();
      }
      if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
        sharedAudioCtx.resume();
      }
      return sharedAudioCtx;
    } catch (e) {
      return null;
    }
  };

  // Pre-unlock audio on any user interaction (essential for laptop/projector audio)
  const unlockAudioOnce = () => {
    getAudioContext();
  };
  window.addEventListener('click', unlockAudioOnce, { once: true });
  window.addEventListener('touchstart', unlockAudioOnce, { once: true });
  window.addEventListener('keydown', unlockAudioOnce, { once: true });

  // 1. High-Tech Countdown Laser Blip
  const playCountdownBlip = (count) => {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const freqs = { 5: 587, 4: 659, 3: 784, 2: 988, 1: 1318 };
      const baseFreq = freqs[count] || 880;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.12);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.24);
    } catch (err) {}
  };

  // 2. Escalating Reactor Core Hyperdrive Charge (Scaled for 5-Second Countdown)
  const playReactorCharge = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(80, now);
      osc1.frequency.exponentialRampToValueAtTime(880, now + 5.2);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(160, now);
      osc2.frequency.exponentialRampToValueAtTime(1760, now + 5.2);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, now);
      filter.frequency.exponentialRampToValueAtTime(4500, now + 5.2);
      filter.Q.setValueAtTime(5, now);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.32, now + 1.0);
      gain.gain.linearRampToValueAtTime(0.55, now + 4.8);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 5.4);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 5.5);
      osc2.stop(now + 5.5);
    } catch (err) {
      console.warn('Audio charge error:', err);
    }
  };

  // 3. Supernova 808 Sub-Bass Impact Boom & White Noise Detonation
  const playExplosionBoom = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;

      // Heavy 808 Sub-bass drop
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(180, now);
      subOsc.frequency.exponentialRampToValueAtTime(32, now + 1.4);

      subGain.gain.setValueAtTime(0.85, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 1.5);

      // Noise crackle burst (rocket launch ignition roar)
      const bufferSize = ctx.sampleRate * 0.8;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(1200, now);
      noiseFilter.frequency.exponentialRampToValueAtTime(180, now + 0.8);
      noiseFilter.Q.setValueAtTime(2.5, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.4, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      whiteNoise.start(now);
      whiteNoise.stop(now + 0.85);
    } catch (err) {}
  };

  // 4. Celebratory Triumphant Polyphonic Fanfare Chord Progression
  const playLaunchFanfare = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;

      // C-Major 9th celebratory fanfare arpeggio
      const notes = [
        { freq: 523.25, time: 0.00, gain: 0.28 }, // C5
        { freq: 659.25, time: 0.07, gain: 0.28 }, // E5
        { freq: 783.99, time: 0.14, gain: 0.30 }, // G5
        { freq: 987.77, time: 0.21, gain: 0.30 }, // B5
        { freq: 1046.5, time: 0.28, gain: 0.35 }, // C6
        { freq: 1318.5, time: 0.35, gain: 0.32 }, // E6
        { freq: 1567.9, time: 0.42, gain: 0.28 }  // G6
      ];

      notes.forEach((item) => {
        const osc = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(item.freq, now + item.time);

        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(item.freq * 1.004, now + item.time); // rich chorus detune

        gain.gain.setValueAtTime(0.001, now + item.time);
        gain.gain.linearRampToValueAtTime(item.gain, now + item.time + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + item.time + 2.5);

        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + item.time);
        osc2.start(now + item.time);
        osc.stop(now + item.time + 2.6);
        osc2.stop(now + item.time + 2.6);
      });
    } catch (err) {
      console.warn('Fanfare audio error:', err);
    }
  };

  // ============================================================================
  // CINEMATIC CANVAS VFX SYSTEM (WARP SPEED, SHOCKWAVES, 3D RIBBONS)
  // ============================================================================
  const initCanvas = () => {
    if (!launchCanvas) return;
    launchCanvas.width = window.innerWidth;
    launchCanvas.height = window.innerHeight;
  };

  const initWarpStars = () => {
    warpStars = [];
    const count = 220;
    const w = window.innerWidth;
    const h = window.innerHeight;
    for (let i = 0; i < count; i++) {
      warpStars.push({
        x: (Math.random() - 0.5) * w * 2,
        y: (Math.random() - 0.5) * h * 2,
        z: Math.random() * 1000 + 1,
        pz: 1000,
        color: Math.random() > 0.3 ? '#60a5fa' : (Math.random() > 0.5 ? '#a855f7' : '#ffffff')
      });
    }
  };

  const initAmbientDust = () => {
    ambientParticles = [];
    const count = window.innerWidth <= 768 ? 25 : 55;
    for (let i = 0; i < count; i++) {
      ambientParticles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2.2 + 1,
        color: Math.random() > 0.5 ? 'rgba(96, 165, 250, 0.55)' : 'rgba(168, 85, 247, 0.55)'
      });
    }
  };

  // Add a sonic shockwave ring expanding from center
  const emitShockwave = (color = '#3b82f6', maxR = null, lineWidth = 4) => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    shockwaves.push({
      x: cx,
      y: cy,
      radius: 10,
      maxRadius: maxR || Math.max(window.innerWidth, window.innerHeight) * 0.85,
      speed: (maxR ? 16 : 24),
      lineWidth: lineWidth,
      color: color,
      alpha: 1
    });
  };

  // Trigger Blinding Supernova Whiteout Flare
  const triggerSupernovaFlash = () => {
    supernovaFlash.active = true;
    supernovaFlash.radius = 10;
    supernovaFlash.maxRadius = Math.max(window.innerWidth, window.innerHeight) * 1.35;
    supernovaFlash.alpha = 1;
    supernovaFlash.spikeAngle = 0;
  };

  // 3D Metallic Ribbon & Quantum Crystal Confetti System (450+ particles)
  const createConfettiExplosion = (centerX, centerY) => {
    const cx = centerX || window.innerWidth / 2;
    const cy = centerY || window.innerHeight / 2;

    const colors = [
      '#3b82f6', '#60a5fa', '#93c5fd', // Electric Blue
      '#fbbf24', '#f59e0b', '#fef08a', // Metallic Gold
      '#a855f7', '#c084fc', '#e879f9', // Neon Violet
      '#34d399', '#10b981',             // Emerald Cyber
      '#f43f5e', '#ffffff'              // Ruby & Diamond
    ];

    const count = window.innerWidth <= 480 ? 240 : 450;
    confettiParticles = [];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 24 + 6;
      const type = Math.random() > 0.5 ? 'ribbon' : (Math.random() > 0.4 ? 'metallic-rect' : 'diamond');

      confettiParticles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 8,
        width: Math.random() * 10 + 6,
        length: Math.random() * 20 + 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        angle: Math.random() * Math.PI * 2,
        angleSpeed: (Math.random() - 0.5) * 0.25,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.12 + 0.05,
        drag: 0.945,
        gravity: 0.28,
        opacity: 1,
        decay: Math.random() * 0.0035 + 0.002,
        type: type
      });
    }
  };

  // Secondary firework burst (pops celebratory embers in top corners)
  const triggerSecondaryBurst = (x, y, color = '#fbbf24') => {
    const burstCount = 45;
    for (let i = 0; i < burstCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 10 + 3;
      confettiParticles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        width: Math.random() * 6 + 4,
        length: Math.random() * 8 + 4,
        color: color,
        angle: Math.random() * Math.PI * 2,
        angleSpeed: (Math.random() - 0.5) * 0.3,
        wobble: Math.random() * Math.PI,
        wobbleSpeed: 0.1,
        drag: 0.93,
        gravity: 0.25,
        opacity: 1,
        decay: Math.random() * 0.007 + 0.004,
        type: 'diamond'
      });
    }
  };

  // Main 60fps Canvas Render Loop
  const renderParticles = () => {
    if (!launchCanvas) return;
    const ctx = launchCanvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, launchCanvas.width, launchCanvas.height);
    const w = launchCanvas.width;
    const h = launchCanvas.height;
    const cx = w / 2;
    const cy = h / 2;

    // 1. Render Speed-of-Light Hyperdrive Warp Stars
    if (warpStars.length > 0 && warpSpeed > 0.05) {
      ctx.save();
      for (let i = 0; i < warpStars.length; i++) {
        const star = warpStars[i];
        star.pz = star.z;
        star.z -= warpSpeed;

        if (star.z <= 0) {
          star.z = 1000;
          star.pz = 1000;
          star.x = (Math.random() - 0.5) * w * 2;
          star.y = (Math.random() - 0.5) * h * 2;
        }

        const sx = (star.x / star.z) * (w / 2) + cx;
        const sy = (star.y / star.z) * (h / 2) + cy;
        const px = (star.x / star.pz) * (w / 2) + cx;
        const py = (star.y / star.pz) * (h / 2) + cy;

        const starAlpha = Math.min(1, (1000 - star.z) / 400);

        if (sx >= 0 && sx <= w && sy >= 0 && sy <= h) {
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(sx, sy);
          ctx.strokeStyle = star.color;
          ctx.globalAlpha = starAlpha;
          ctx.lineWidth = Math.min(3.5, (1000 - star.z) / 250);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    // 2. Render Ambient Dust with Constellation Threads
    if (ambientParticles.length > 0 && warpSpeed < 5) {
      ctx.save();
      for (let i = 0; i < ambientParticles.length; i++) {
        const p = ambientParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Connect nearby dust with delicate cyan filaments
        for (let j = i + 1; j < ambientParticles.length; j++) {
          const p2 = ambientParticles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 85) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(96, 165, 250, ${(1 - dist / 85) * 0.18})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      ctx.restore();
    }

    // 3. Render Expanding Sonic Shockwave Rings
    if (shockwaves.length > 0) {
      ctx.save();
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += sw.speed;
        sw.alpha = Math.max(0, 1 - sw.radius / sw.maxRadius);

        if (sw.radius >= sw.maxRadius || sw.alpha <= 0) {
          shockwaves.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = sw.color;
        ctx.globalAlpha = sw.alpha;
        ctx.lineWidth = sw.lineWidth * sw.alpha;
        ctx.shadowColor = sw.color;
        ctx.shadowBlur = 18;
        ctx.stroke();
      }
      ctx.restore();
    }

    // 4. Render Supernova Whiteout Flare & Diffraction Starburst
    if (supernovaFlash.active) {
      ctx.save();
      supernovaFlash.radius += 45;
      supernovaFlash.alpha = Math.max(0, 1 - supernovaFlash.radius / supernovaFlash.maxRadius);
      supernovaFlash.spikeAngle += 0.04;

      if (supernovaFlash.alpha <= 0) {
        supernovaFlash.active = false;
      } else {
        // Radial Plasma Flare
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, supernovaFlash.radius);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${supernovaFlash.alpha})`);
        gradient.addColorStop(0.3, `rgba(147, 197, 253, ${supernovaFlash.alpha * 0.8})`);
        gradient.addColorStop(0.7, `rgba(168, 85, 247, ${supernovaFlash.alpha * 0.4})`);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        // 8-Point Diffraction Spikes
        ctx.translate(cx, cy);
        ctx.rotate(supernovaFlash.spikeAngle);
        ctx.strokeStyle = `rgba(255, 255, 255, ${supernovaFlash.alpha * 0.9})`;
        ctx.lineWidth = 3;
        ctx.shadowColor = '#60a5fa';
        ctx.shadowBlur = 25;

        for (let s = 0; s < 8; s++) {
          const spikeLen = supernovaFlash.radius * (s % 2 === 0 ? 0.9 : 0.5);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(spikeLen, 0);
          ctx.stroke();
          ctx.rotate(Math.PI / 4);
        }
      }
      ctx.restore();
    }

    // 5. Render 3D Ribbon & Metallic Confetti System
    if (confettiParticles.length > 0) {
      for (let i = confettiParticles.length - 1; i >= 0; i--) {
        const p = confettiParticles[i];
        p.vx *= p.drag;
        p.vy *= p.drag;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.angleSpeed;
        p.wobble += p.wobbleSpeed;
        p.opacity -= p.decay;

        if (p.opacity <= 0 || p.y > h + 70) {
          confettiParticles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.globalAlpha = Math.max(0, p.opacity);

        const cosWobble = Math.cos(p.wobble);

        if (p.type === 'ribbon') {
          // 3D Fluttering Ribbon Quad
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.moveTo(-p.width / 2 * cosWobble, -p.length / 2);
          ctx.lineTo(p.width / 2 * cosWobble, -p.length / 2 + 4);
          ctx.lineTo(p.width / 2 * cosWobble, p.length / 2);
          ctx.lineTo(-p.width / 2 * cosWobble, p.length / 2 - 4);
          ctx.closePath();
          ctx.fill();

          // Shiny specular highlight stripe
          if (cosWobble > 0.4) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.fillRect(-p.width / 4 * cosWobble, -p.length / 2, (p.width / 2) * cosWobble, p.length);
          }
        } else if (p.type === 'diamond') {
          // Quantum Crystal Diamond
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.moveTo(0, -p.width);
          ctx.lineTo(p.width * cosWobble, 0);
          ctx.lineTo(0, p.width);
          ctx.lineTo(-p.width * cosWobble, 0);
          ctx.closePath();
          ctx.fill();
        } else {
          // Metallic Foil Square
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.width / 2 * cosWobble, -p.length / 4, p.width * cosWobble, p.length / 2);
        }

        ctx.restore();
      }
    }

    // Smoothly interpolate warp speed toward target
    warpSpeed += (targetWarpSpeed - warpSpeed) * 0.08;

    animFrameId = requestAnimationFrame(renderParticles);
  };

  // Open Launch Mode UI
  const openLaunchMode = () => {
    if (!launchOverlay) return;
    initCanvas();
    initAmbientDust();
    initWarpStars();
    isLaunching = false;
    warpSpeed = 0;
    targetWarpSpeed = 0;
    shockwaves = [];
    supernovaFlash.active = false;

    // Reset overlay elements
    launchOverlay.classList.remove('launching-exit', 'shaking');
    if (launchHud) launchHud.classList.remove('active');
    if (launchCelebrateCard) launchCelebrateCard.classList.remove('active');
    if (launchHudBar) launchHudBar.style.width = '0%';
    if (launchCoreBtn) {
      launchCoreBtn.disabled = false;
      launchCoreBtn.style.pointerEvents = 'auto';
    }

    // Check URL parameters for explicit mode overrides or auto-detect by screen width
    const currentParams = new URLSearchParams(window.location.search);
    launchOverlay.classList.remove('mode-screen', 'mode-controller');
    if (currentParams.get('mode') === 'screen' || currentParams.has('screen') || currentParams.get('launch') === 'screen') {
      launchOverlay.classList.add('mode-screen');
    } else if (currentParams.get('mode') === 'controller' || currentParams.has('mobile') || currentParams.get('launch') === 'mobile') {
      launchOverlay.classList.add('mode-controller');
    } else {
      // Automatic detection: desktop / laptop screen -> clean info panel; mobile device -> launch controller
      if (window.innerWidth >= 993) {
        launchOverlay.classList.add('mode-screen');
      } else {
        launchOverlay.classList.add('mode-controller');
      }
    }

    launchOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    void launchOverlay.offsetWidth;
    launchOverlay.classList.add('active');
    launchOverlay.setAttribute('aria-hidden', 'false');

    if (!animFrameId) {
      animFrameId = requestAnimationFrame(renderParticles);
    }
  };

  // Close / Exit Launch Mode UI
  const exitLaunchMode = () => {
    if (!launchOverlay) return;
    launchOverlay.classList.remove('active');
    launchOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    setTimeout(() => {
      launchOverlay.style.display = 'none';
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
      confettiParticles = [];
      ambientParticles = [];
    }, 400);

    if (window.location.search.includes('launch') || window.location.hash.includes('launch')) {
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  };

  // Reset launch state across all connected devices
  const resetLaunchState = (broadcast = true) => {
    isLaunching = false;
    sessionStorage.removeItem('qc_launched_by_sriram');
    openLaunchMode();

    if (broadcast) {
      broadcastLaunchSignal('reset');
    }
  };

  // ----------------------------------------------------------------------------
  // Realtime Cross-Device Synchronization Engine
  // ----------------------------------------------------------------------------
  const broadcastLaunchSignal = (action = 'launch') => {
    const payload = JSON.stringify({
      action: action,
      by: 'Sriram Sir',
      timestamp: Date.now()
    });

    // 1. Cloud PubSub Push via ntfy.sh (synchronizes mobile <-> laptop / Vercel in real-time)
    fetch(`https://ntfy.sh/${LAUNCH_SYNC_TOPIC}`, {
      method: 'POST',
      body: payload,
      headers: {
        'Title': 'Quantum Coders Launch Event',
        'Priority': 'urgent',
        'Tags': 'rocket,tada'
      }
    }).catch((err) => console.warn('Sync broadcast notice:', err));

    // 2. BroadcastChannel for instant local cross-tab testing
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('qc_launch_channel');
        bc.postMessage({ action: action, by: 'Sriram Sir', timestamp: Date.now() });
        bc.close();
      }
    } catch (e) {}

    // 3. LocalStorage event as browser fallback
    try {
      localStorage.setItem('qc_launch_event_sync', JSON.stringify({ action: action, by: 'Sriram Sir', timestamp: Date.now() }));
    } catch (e) {}
  };

  const handleIncomingSignal = (data) => {
    if (!data || !data.action) return;

    if (data.action === 'launch') {
      const now = Date.now();
      if (now - lastRemoteTriggerTime < 8000) return; // Prevent duplicate multi-triggers
      lastRemoteTriggerTime = now;

      console.log('⚡ [SYNC] REMOTE LAUNCH SIGNAL RECEIVED FROM SRIRAM SIR!');

      // If this screen is not already launching, initiate the sequence!
      if (!isLaunching) {
        if (!launchOverlay.classList.contains('active')) {
          openLaunchMode();
        }
        initiateLaunchSequence(true); // true = remote trigger
      }
    } else if (data.action === 'reset') {
      console.log('🔄 [SYNC] REMOTE RESET SIGNAL RECEIVED!');
      resetLaunchState(false);
    }
  };

  const startRealtimeSyncListeners = () => {
    // A. Server-Sent Events (SSE) via ntfy.sh
    try {
      if (typeof EventSource !== 'undefined') {
        const sse = new EventSource(`https://ntfy.sh/${LAUNCH_SYNC_TOPIC}/sse`);
        sse.onmessage = (e) => {
          try {
            const raw = JSON.parse(e.data);
            if (raw && raw.message) {
              try {
                const inner = JSON.parse(raw.message);
                handleIncomingSignal(inner);
              } catch (_) {
                if (raw.message.includes('launch')) handleIncomingSignal({ action: 'launch' });
              }
            } else if (raw && raw.action) {
              handleIncomingSignal(raw);
            }
          } catch (_) {
            if (e.data && e.data.includes('launch')) handleIncomingSignal({ action: 'launch' });
          }
        };
        sse.onerror = () => {
          // EventSource auto-reconnects natively
        };
      }
    } catch (err) {
      console.warn('SSE sync listener warning:', err);
    }

    // B. BroadcastChannel for local cross-tab testing
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('qc_launch_channel');
        bc.onmessage = (e) => {
          if (e.data) handleIncomingSignal(e.data);
        };
      }
    } catch (e) {}

    // C. LocalStorage sync fallback
    window.addEventListener('storage', (e) => {
      if (e.key === 'qc_launch_event_sync' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          handleIncomingSignal(parsed);
        } catch (err) {}
      }
    });
  };

  // Initiate Launch Sequence (Works on both Phone and Laptop simultaneously)
  const initiateLaunchSequence = (isRemote = false) => {
    if (isLaunching) return;
    isLaunching = true;

    // If triggered locally by pressing the button, broadcast signal to laptop/projector!
    if (!isRemote) {
      broadcastLaunchSignal('launch');
    }

    // 1. Audio and Haptics: Begin Reactor Ramp & Warp Speed
    playReactorCharge();
    targetWarpSpeed = 8;
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 150]);
    }

    // 2. Lock Button & Trigger Screen Shake
    if (launchCoreBtn) {
      launchCoreBtn.disabled = true;
      launchCoreBtn.style.pointerEvents = 'none';
    }
    launchOverlay.classList.add('shaking');

    // 3. Show Countdown HUD
    if (launchHud) launchHud.classList.add('active');

    const launchHudGhost = document.getElementById('launch-hud-count-ghost');

    // Progress Bar Animation (0% to 100% over 5.4s)
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 1.0;
      if (launchHudBar) launchHudBar.style.width = `${Math.min(100, progress)}%`;
      if (progress >= 100) clearInterval(progressInterval);
    }, 54);

    // Initial Authenticating Status
    if (launchHudStatus) launchHudStatus.textContent = 'AUTHENTICATING: SRIRAM SIR...';
    if (launchHudCount) launchHudCount.textContent = '5';
    if (launchHudGhost) launchHudGhost.textContent = '5';

    // Countdown Step 5: T = 0.5s
    setTimeout(() => {
      if (launchHudStatus) launchHudStatus.textContent = 'QUANTUM CORE ENGAGED...';
      if (launchHudCount) launchHudCount.textContent = '5';
      if (launchHudGhost) launchHudGhost.textContent = '5';
      playCountdownBlip(5);
      emitShockwave('#3b82f6', 200, 3);
      targetWarpSpeed = 10;
      if (navigator.vibrate) navigator.vibrate(40);
    }, 500);

    // Countdown Step 4: T = 1.5s
    setTimeout(() => {
      if (launchHudStatus) launchHudStatus.textContent = 'CALIBRATING HYPERDRIVE FLUX...';
      if (launchHudCount) launchHudCount.textContent = '4';
      if (launchHudGhost) launchHudGhost.textContent = '4';
      playCountdownBlip(4);
      emitShockwave('#60a5fa', 280, 3);
      targetWarpSpeed = 16;
      if (navigator.vibrate) navigator.vibrate(50);
    }, 1500);

    // Countdown Step 3: T = 2.5s
    setTimeout(() => {
      if (launchHudStatus) launchHudStatus.textContent = 'STABILIZING POWER GRIDS...';
      if (launchHudCount) launchHudCount.textContent = '3';
      if (launchHudGhost) launchHudGhost.textContent = '3';
      playCountdownBlip(3);
      emitShockwave('#a855f7', 360, 4);
      targetWarpSpeed = 22;
      if (navigator.vibrate) navigator.vibrate(60);
    }, 2500);

    // Countdown Step 2: T = 3.5s
    setTimeout(() => {
      if (launchHudStatus) launchHudStatus.textContent = 'WARPING SPACE-TIME: 80%...';
      if (launchHudCount) launchHudCount.textContent = '2';
      if (launchHudGhost) launchHudGhost.textContent = '2';
      playCountdownBlip(2);
      emitShockwave('#c084fc', 440, 4);
      targetWarpSpeed = 30;
      if (navigator.vibrate) navigator.vibrate(75);
    }, 3500);

    // Countdown Step 1: T = 4.5s
    setTimeout(() => {
      if (launchHudStatus) launchHudStatus.textContent = 'FINAL OVERDRIVE IGNITION...';
      if (launchHudCount) launchHudCount.textContent = '1';
      if (launchHudGhost) launchHudGhost.textContent = '1';
      playCountdownBlip(1);
      emitShockwave('#fbbf24', 520, 5);
      targetWarpSpeed = 40;
      if (navigator.vibrate) navigator.vibrate(100);
    }, 4500);

    // T = 5.4s: 🚀 BLAST OFF! (SUPERNOVA DETONATION & TRIUMPHANT FANFARE)
    setTimeout(() => {
      targetWarpSpeed = 0;
      launchOverlay.classList.remove('shaking');
      if (launchHudCount) launchHudCount.textContent = '🚀';
      if (launchHudGhost) launchHudGhost.textContent = '🚀';
      if (launchHudStatus) launchHudStatus.textContent = 'STATUS: 100% ONLINE!';

      // 1. Supernova Detonation Sound & Fanfare
      playExplosionBoom();
      playLaunchFanfare();
      if (navigator.vibrate) {
        navigator.vibrate([200, 80, 200, 80, 500]);
      }

      // 2. Blinding Supernova Whiteout Flare
      triggerSupernovaFlash();

      // 3. Chromatic Shockwave Blast (Triple Concentric Rings)
      emitShockwave('#3b82f6', null, 8);
      setTimeout(() => emitShockwave('#fbbf24', null, 6), 80);
      setTimeout(() => emitShockwave('#a855f7', null, 5), 160);

      // 4. 450+ 3D Metallic Ribbon & Crystal Confetti Explosion
      const rect = launchCoreBtn ? launchCoreBtn.getBoundingClientRect() : null;
      const blastX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
      const blastY = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
      createConfettiExplosion(blastX, blastY);

      // 5. Hide HUD & Display Grand Celebration Proclamation Card
      setTimeout(() => {
        if (launchHud) launchHud.classList.remove('active');
        if (launchCelebrateCard) launchCelebrateCard.classList.add('active');
      }, 350);

      // 6. Secondary Celebration Firework Bursts during proclamation
      setTimeout(() => {
        triggerSecondaryBurst(window.innerWidth * 0.22, window.innerHeight * 0.32, '#fbbf24');
      }, 1000);

      setTimeout(() => {
        triggerSecondaryBurst(window.innerWidth * 0.78, window.innerHeight * 0.32, '#60a5fa');
      }, 2000);

      setTimeout(() => {
        triggerSecondaryBurst(window.innerWidth * 0.50, window.innerHeight * 0.24, '#a855f7');
      }, 3000);

      setTimeout(() => {
        triggerSecondaryBurst(window.innerWidth * 0.30, window.innerHeight * 0.40, '#fbbf24');
      }, 4200);
    }, 5400);

    // T = 11.2s: Cinematic Hyperspace Warp Wipe into the Live Website
    setTimeout(() => {
      launchOverlay.classList.add('launching-exit');

      // T = 12.3s: Final cleanup, show toast & commemorative banner
      setTimeout(() => {
        launchOverlay.style.display = 'none';
        launchOverlay.classList.remove('active', 'launching-exit');
        launchOverlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        isLaunching = false;

        // Commemorate in Hero ESTD Badge
        const heroBadge = document.querySelector('.hero-badge');
        if (heroBadge) {
          heroBadge.innerHTML = '<span class="accent-dot"></span><span>ESTD. 2026 // INAUGURATED BY Dr M VeeraBhadra Rao Sir, Dr Surya Prakash Sir, Dr Ravi Kumar Sir </span>';
          heroBadge.style.boxShadow = '0 0 25px rgba(251, 191, 36, 0.7)';
        }

        // Display Celebratory Toast Banner
        let toastEl = document.getElementById('launch-celebratory-toast');
        if (!toastEl) {
          toastEl = document.createElement('div');
          toastEl.id = 'launch-celebratory-toast';
          toastEl.className = 'launch-celebratory-toast';
          toastEl.innerHTML = `
            <span class="launch-toast-badge">OFFICIAL LAUNCH</span>
            <span>INAUGURATED BY Dr M VeeraBhadra Rao Sir, Dr P Surya Prakash Sir & Mr K Ravi Kumar Sir • QUANTUM CODERS IS LIVE!</span>
          `;
          document.body.appendChild(toastEl);
        }

        requestAnimationFrame(() => {
          toastEl.classList.add('active');
          setTimeout(() => {
            toastEl.classList.remove('active');
          }, 8000);
        });

        // Store launch acknowledgment
        try {
          sessionStorage.setItem('qc_launched_by_sriram', 'true');
        } catch (e) {}
      }, 1100);
    }, 11200);
  };

  // Event Listeners for Launch Mode
  if (launchCoreBtn) {
    launchCoreBtn.addEventListener('click', (e) => {
      e.preventDefault();
      initiateLaunchSequence(false); // local click
    });
  }

  if (launchExitBtn) {
    launchExitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      exitLaunchMode();
    });
  }

  if (launchResetBtn) {
    launchResetBtn.addEventListener('click', (e) => {
      e.preventDefault();
      resetLaunchState(true);
    });
  }

  if (footerLaunchBtn) {
    footerLaunchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openLaunchMode();
    });
  }

  // Keyboard Shortcuts for Presentation & Rehearsal
  window.addEventListener('keydown', (e) => {
    if (launchOverlay && launchOverlay.classList.contains('active')) {
      if (e.key === 'Escape') {
        exitLaunchMode();
      } else if (e.shiftKey && (e.key === 'R' || e.key === 'r')) {
        resetLaunchState(true);
      }
    }
  });

  window.addEventListener('resize', () => {
    if (launchCanvas && launchOverlay && launchOverlay.classList.contains('active')) {
      launchCanvas.width = window.innerWidth;
      launchCanvas.height = window.innerHeight;
    }
  });

  // Start real-time sync listeners immediately (listens for Sriram Sir's remote launch)
  startRealtimeSyncListeners();

  // Auto-launch via URL query parameter or hash: ?launch=true or #launch
  const urlParams = new URLSearchParams(window.location.search);
  const hasLaunchParam = urlParams.has('launch') || urlParams.get('mode') === 'launch' || window.location.hash.toLowerCase().includes('launch');

  if (hasLaunchParam) {
    setTimeout(() => {
      openLaunchMode();
    }, 200);
  }

  // Global helpers for easy console testing or external triggering
  window.openLaunchMode = openLaunchMode;
  window.triggerRemoteLaunch = () => broadcastLaunchSignal('launch');
  window.resetRemoteLaunch = () => resetLaunchState(true);
});

