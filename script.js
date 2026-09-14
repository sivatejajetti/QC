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
});
