/**
 * QUANTUM CODERS // EVENT GALLERY CONTROLLER
 * Vanilla JavaScript Admin System with Multi-Media & Google Drive Support
 */

document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'qc_event_gallery';

  // ---------------------------------------------------------------------------
  // 1. Google Drive & Video URL Helper
  // ---------------------------------------------------------------------------
  const parseVideoUrl = (rawUrl) => {
    if (!rawUrl) return '';
    const trimmed = rawUrl.trim();

    // Google Drive check
    // Matches https://drive.google.com/file/d/FILE_ID/view... or open?id=FILE_ID
    const gDriveMatch = trimmed.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)([a-zA-Z0-9_-]+)/);
    if (gDriveMatch && gDriveMatch[1]) {
      const fileId = gDriveMatch[1];
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }

    // YouTube check
    const ytMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}`;
    }

    // Vimeo check
    const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
    if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    return trimmed;
  };

  // ---------------------------------------------------------------------------
  // 2. Default Seed Events (Rich Multi-Media Data)
  // ---------------------------------------------------------------------------
  const DEFAULT_EVENTS = [
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
          url: '../assets/gallery/moment_1.svg',
          caption: 'Hackathon Arena & Midnight Sprints',
          isCover: true
        },
        {
          type: 'image',
          url: '../assets/gallery/moment_2.svg',
          caption: 'Mentorship Breakouts & Architecture Reviews',
          isCover: false
        },
        {
          type: 'image',
          url: '../assets/gallery/moment_3.svg',
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
          url: '../assets/gallery/moment_2.svg',
          caption: 'Hands-on Neural Network Fine-tuning',
          isCover: true
        },
        {
          type: 'image',
          url: '../assets/gallery/moment_4.svg',
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
          url: '../assets/gallery/moment_3.svg',
          caption: 'Council Roadmap & Leadership Strategy',
          isCover: true
        },
        {
          type: 'image',
          url: '../assets/gallery/moment_1.svg',
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
          url: '../assets/gallery/moment_5.svg',
          caption: 'Real-time PR Submission Tracker',
          isCover: true
        },
        {
          type: 'image',
          url: '../assets/gallery/moment_7.svg',
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
          url: '../assets/gallery/moment_4.svg',
          caption: 'Server-Driven UI & Edge Caching Lab',
          isCover: true
        },
        {
          type: 'image',
          url: '../assets/gallery/moment_8.svg',
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
          url: '../assets/gallery/moment_7.svg',
          caption: 'Poster Typography & Halftone Design Review',
          isCover: true
        },
        {
          type: 'image',
          url: '../assets/gallery/moment_2.svg',
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
          url: '../assets/gallery/moment_6.svg',
          caption: 'Inauguration & Presidential Address',
          isCover: true
        },
        {
          type: 'image',
          url: '../assets/gallery/moment_3.svg',
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
          url: '../assets/gallery/moment_8.svg',
          caption: 'Hardware Sensor Prototyping & Live Demos',
          isCover: true
        },
        {
          type: 'image',
          url: '../assets/gallery/moment_5.svg',
          caption: 'Robotics Control Dashboard',
          isCover: false
        }
      ]
    }
  ];

  // ---------------------------------------------------------------------------
  // 3. Storage Helpers
  // ---------------------------------------------------------------------------
  const getEvents = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_EVENTS));
        return DEFAULT_EVENTS;
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_EVENTS;
    } catch (e) {
      console.warn('Error reading events from localStorage:', e);
      return DEFAULT_EVENTS;
    }
  };

  const saveEvents = (events) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    updateCounters(events);
  };

  // ---------------------------------------------------------------------------
  // 4. UI Elements
  // ---------------------------------------------------------------------------
  const eventsGrid = document.getElementById('events-grid');
  const searchInput = document.getElementById('search-input');
  const categoryFilter = document.getElementById('category-filter');
  const btnNewEvent = document.getElementById('btn-new-event');
  const btnExportJson = document.getElementById('btn-export-json');
  const btnImportJson = document.getElementById('btn-import-json');
  const btnResetDefaults = document.getElementById('btn-reset-defaults');

  // Counters
  const countTotalEvents = document.getElementById('count-total-events');
  const countTotalPhotos = document.getElementById('count-total-photos');
  const countTotalVideos = document.getElementById('count-total-videos');
  const countWorkshops = document.getElementById('count-workshops');

  // Event Edit Modal
  const eventModal = document.getElementById('event-modal');
  const eventModalClose = document.getElementById('event-modal-close');
  const eventModalCancel = document.getElementById('event-modal-cancel');
  const eventForm = document.getElementById('event-form');
  const modalTitle = document.getElementById('modal-title');
  const modalSubtitle = document.getElementById('modal-subtitle');

  // Form Inputs
  const eventIdInput = document.getElementById('event-id');
  const eventTitleInput = document.getElementById('event-title');
  const eventCategoryInput = document.getElementById('event-category');
  const eventBadgeInput = document.getElementById('event-badge');
  const eventDateInput = document.getElementById('event-date');
  const eventLocationInput = document.getElementById('event-location');
  const eventGridSpanInput = document.getElementById('event-gridspan');
  const eventDescriptionInput = document.getElementById('event-description');

  // Media Manager inside Modal
  const mediaTypeSelect = document.getElementById('media-type-select');
  const mediaUrlInput = document.getElementById('media-url-input');
  const mediaFileInput = document.getElementById('media-file-input');
  const mediaCaptionInput = document.getElementById('media-caption-input');
  const btnAddMedia = document.getElementById('btn-add-media');
  const mediaItemsList = document.getElementById('media-items-list');

  // JSON Import/Export Modal
  const jsonModal = document.getElementById('json-modal');
  const jsonModalClose = document.getElementById('json-modal-close');
  const jsonTextarea = document.getElementById('json-textarea');
  const btnCopyJson = document.getElementById('btn-copy-json');
  const btnApplyImport = document.getElementById('btn-apply-import');
  const btnDownloadJson = document.getElementById('btn-download-json');

  // Toast
  const toastEl = document.getElementById('admin-toast');

  let currentEditingMedia = []; // Array of media objects for the currently open modal

  const showToast = (message, type = 'success') => {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.className = `admin-toast active toast-${type}`;
    setTimeout(() => {
      toastEl.classList.remove('active');
    }, 3800);
  };

  // ---------------------------------------------------------------------------
  // 5. Counters Update
  // ---------------------------------------------------------------------------
  const updateCounters = (events) => {
    let photos = 0;
    let videos = 0;
    let workshops = 0;

    events.forEach(e => {
      if (e.category === 'workshops') workshops++;
      if (Array.isArray(e.media)) {
        e.media.forEach(m => {
          if (m.type === 'video') videos++;
          else photos++;
        });
      }
    });

    if (countTotalEvents) countTotalEvents.textContent = events.length;
    if (countTotalPhotos) countTotalPhotos.textContent = photos;
    if (countTotalVideos) countTotalVideos.textContent = videos;
    if (countWorkshops) countWorkshops.textContent = workshops;
  };

  // ---------------------------------------------------------------------------
  // 6. Render Events Grid
  // ---------------------------------------------------------------------------
  const renderEvents = () => {
    const events = getEvents();
    updateCounters(events);

    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const filterCat = categoryFilter ? categoryFilter.value : 'all';

    const filtered = events.filter(ev => {
      const matchCat = (filterCat === 'all' || ev.category === filterCat);
      const matchQuery = !query ||
        ev.title.toLowerCase().includes(query) ||
        (ev.badge && ev.badge.toLowerCase().includes(query)) ||
        (ev.location && ev.location.toLowerCase().includes(query)) ||
        (ev.description && ev.description.toLowerCase().includes(query));
      return matchCat && matchQuery;
    });

    if (filtered.length === 0) {
      eventsGrid.innerHTML = `
        <div class="empty-gallery-state">
          <div class="empty-icon">📁</div>
          <h3 style="font-family: var(--font-heading); font-size: 1.5rem; margin-bottom: 0.5rem;">NO EVENTS FOUND</h3>
          <p style="color: var(--color-gray); margin-bottom: 1.5rem;">No club events match the current filter or search criteria.</p>
          <button class="btn-brutalist btn-primary" onclick="document.getElementById('btn-new-event').click()">
            + Create New Event
          </button>
        </div>
      `;
      return;
    }

    eventsGrid.innerHTML = filtered.map(ev => {
      // Find cover media or first image
      const coverMedia = (ev.media && ev.media.find(m => m.isCover)) || (ev.media && ev.media[0]) || { type: 'image', url: '../assets/gallery/moment_1.svg' };
      const imageCount = ev.media ? ev.media.filter(m => m.type !== 'video').length : 0;
      const videoCount = ev.media ? ev.media.filter(m => m.type === 'video').length : 0;

      // Render thumbnail mini-strip
      const miniThumbs = ev.media ? ev.media.slice(0, 5).map(m => {
        if (m.type === 'video') {
          return `<div class="mini-thumb mini-thumb-video" title="Video: ${m.caption || 'Watch'}">▶</div>`;
        }
        return `<img src="${m.url}" alt="${m.caption || ''}" class="mini-thumb">`;
      }).join('') : '';

      return `
        <div class="event-admin-card" data-id="${ev.id}">
          <div class="card-media-stage">
            <img src="${coverMedia.url}" alt="${ev.title}" class="card-cover-img" onerror="this.src='../assets/gallery/moment_1.svg'">
            <div class="card-span-badge">${ev.gridSpan || 'span-1x1'}</div>
            ${videoCount > 0 ? `<div class="card-video-indicator">▶ ${videoCount} VIDEO${videoCount > 1 ? 'S' : ''}</div>` : ''}
            <div class="card-media-count-strip">
              <span class="media-count-pill">📷 ${imageCount}</span>
              ${videoCount > 0 ? `<span class="media-count-pill" style="border-color: var(--color-purple); color: #C4B5FD;">🎥 ${videoCount}</span>` : ''}
            </div>
          </div>

          <div class="card-content-wrap">
            <div class="card-category-row">
              <span class="card-category-tag">${ev.badge || ev.category.toUpperCase()}</span>
              <span class="card-date-meta">${ev.date || '2026'}</span>
            </div>

            <h3 class="card-event-title">${ev.title}</h3>
            <div class="card-location-meta">📍 ${ev.location || 'Pydah College of Engineering'}</div>
            <p class="card-desc-snippet">${ev.description || 'No description provided.'}</p>

            ${miniThumbs ? `<div class="card-mini-strip">${miniThumbs}${ev.media.length > 5 ? `<span style="align-self: center; font-family: var(--font-mono); font-size: 0.72rem; color: var(--color-gray); padding-left: 0.3rem;">+${ev.media.length - 5}</span>` : ''}</div>` : ''}

            <div class="card-actions-row">
              <button class="btn-brutalist btn-secondary btn-sm btn-edit" data-id="${ev.id}">
                ✎ Edit Event &amp; Media
              </button>
              <button class="btn-brutalist btn-danger btn-sm btn-delete" data-id="${ev.id}">
                ✕ Delete
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach card event listeners
    eventsGrid.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => openEditModal(btn.getAttribute('data-id')));
    });

    eventsGrid.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => deleteEvent(btn.getAttribute('data-id')));
    });
  };

  // ---------------------------------------------------------------------------
  // 7. Modal & Media Builder Logic
  // ---------------------------------------------------------------------------
  const renderMediaList = () => {
    if (!mediaItemsList) return;

    if (currentEditingMedia.length === 0) {
      mediaItemsList.innerHTML = `
        <div style="padding: 1rem; text-align: center; color: var(--color-gray); font-family: var(--font-mono); font-size: 0.8rem; border: 1px dashed var(--border-light);">
          No media attached to this event yet. Add photos or Google Drive / YouTube videos above.
        </div>
      `;
      return;
    }

    mediaItemsList.innerHTML = currentEditingMedia.map((m, idx) => {
      const isVideo = m.type === 'video';
      const previewHtml = isVideo
        ? `<div class="item-video-icon">▶</div>`
        : `<img src="${m.url}" alt="" class="item-thumb-preview" onerror="this.src='../assets/gallery/moment_1.svg'">`;

      return `
        <div class="media-item-row ${m.isCover ? 'is-cover' : ''}">
          ${previewHtml}
          <div>
            <span class="item-type-badge ${isVideo ? 'badge-video' : 'badge-image'}">
              ${isVideo ? '🎥 VIDEO' : '📷 PHOTO'}
            </span>
          </div>
          <div class="item-url-text" title="${m.url}">
            <strong>${m.caption || 'Untitled Media'}</strong><br>
            <span style="opacity: 0.65;">${m.url}</span>
          </div>
          <div>
            <input type="text" class="admin-input" style="padding: 0.35rem 0.65rem; font-size: 0.8rem;" value="${m.caption || ''}" placeholder="Caption..." onchange="window.updateMediaCaption(${idx}, this.value)">
          </div>
          <div>
            <button type="button" class="cover-toggle-btn ${m.isCover ? 'active' : ''}" onclick="window.setMediaCover(${idx})">
              ${m.isCover ? '★ Cover' : 'Make Cover'}
            </button>
          </div>
          <div>
            <button type="button" class="remove-media-btn" title="Remove" onclick="window.removeMediaItem(${idx})">
              &times;
            </button>
          </div>
        </div>
      `;
    }).join('');
  };

  // Global hooks for inline onclick/onchange in modal
  window.setMediaCover = (idx) => {
    currentEditingMedia.forEach((m, i) => {
      m.isCover = (i === idx);
    });
    renderMediaList();
  };

  window.removeMediaItem = (idx) => {
    currentEditingMedia.splice(idx, 1);
    if (currentEditingMedia.length > 0 && !currentEditingMedia.some(m => m.isCover)) {
      currentEditingMedia[0].isCover = true;
    }
    renderMediaList();
  };

  window.updateMediaCaption = (idx, newCaption) => {
    if (currentEditingMedia[idx]) {
      currentEditingMedia[idx].caption = newCaption;
    }
  };

  // Add Media Item Button click
  if (btnAddMedia) {
    btnAddMedia.addEventListener('click', () => {
      const type = mediaTypeSelect.value;
      let url = mediaUrlInput.value.trim();
      const caption = mediaCaptionInput.value.trim() || (type === 'video' ? 'Event Video Recording' : 'Event Photograph');

      if (type === 'video') {
        if (!url) {
          showToast('Please enter a Google Drive video link, YouTube URL, or video stream link.', 'error');
          return;
        }
        url = parseVideoUrl(url);
      } else {
        if (!url) {
          showToast('Please enter an image URL or choose a file.', 'error');
          return;
        }
      }

      const isFirst = currentEditingMedia.length === 0;
      currentEditingMedia.push({
        type,
        url,
        caption,
        isCover: isFirst
      });

      mediaUrlInput.value = '';
      mediaCaptionInput.value = '';
      if (mediaFileInput) mediaFileInput.value = '';
      renderMediaList();
    });
  }

  // File Upload to Data URI
  if (mediaFileInput) {
    mediaFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > 2 * 1024 * 1024) {
        showToast('File size exceeds 2MB limit. For large media or videos, paste a Google Drive or cloud URL instead.', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        mediaUrlInput.value = loadEvt.target.result;
        mediaTypeSelect.value = 'image';
      };
      reader.readAsDataURL(file);
    });
  }

  // Open Create Modal
  const openCreateModal = () => {
    modalTitle.textContent = 'CREATE NEW EVENT';
    modalSubtitle.textContent = 'PUBLISH TO OFFICIAL EVENT GALLERY';
    eventIdInput.value = '';
    eventForm.reset();

    eventDateInput.value = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
    eventLocationInput.value = 'Pydah College of Engineering, Kakinada';

    currentEditingMedia = [];
    renderMediaList();

    eventModal.classList.add('active');
  };

  // Open Edit Modal
  const openEditModal = (id) => {
    const events = getEvents();
    const event = events.find(e => e.id === id);
    if (!event) return;

    modalTitle.textContent = 'EDIT EVENT DOSSIER';
    modalSubtitle.textContent = `IDENTIFIER: ${event.id}`;

    eventIdInput.value = event.id;
    eventTitleInput.value = event.title || '';
    eventCategoryInput.value = event.category || 'events';
    eventBadgeInput.value = event.badge || '';
    eventDateInput.value = event.date || '';
    eventLocationInput.value = event.location || '';
    eventGridSpanInput.value = event.gridSpan || 'span-1x1';
    eventDescriptionInput.value = event.description || '';

    currentEditingMedia = event.media ? JSON.parse(JSON.stringify(event.media)) : [];
    renderMediaList();

    eventModal.classList.add('active');
  };

  const closeModal = () => {
    eventModal.classList.remove('active');
  };

  if (eventModalClose) eventModalClose.addEventListener('click', closeModal);
  if (eventModalCancel) eventModalCancel.addEventListener('click', closeModal);
  if (eventModal) {
    eventModal.addEventListener('click', (e) => {
      if (e.target === eventModal) closeModal();
    });
  }

  // Save Event Form
  if (eventForm) {
    eventForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const id = eventIdInput.value.trim() || `EVT-${Date.now().toString().slice(-4)}`;
      const title = eventTitleInput.value.trim();
      const category = eventCategoryInput.value;
      const badge = eventBadgeInput.value.trim() || `${category.toUpperCase()} // HIGHLIGHT`;
      const date = eventDateInput.value.trim();
      const location = eventLocationInput.value.trim();
      const gridSpan = eventGridSpanInput.value;
      const description = eventDescriptionInput.value.trim();

      if (!title) {
        showToast('Please enter an event title.', 'error');
        return;
      }

      if (currentEditingMedia.length === 0) {
        if (!confirm('This event currently has no photos or videos attached. Do you want to save it anyway?')) {
          return;
        }
      }

      const events = getEvents();
      const existingIdx = events.findIndex(ev => ev.id === id);

      const eventData = {
        id,
        title,
        category,
        badge,
        date,
        location,
        gridSpan,
        description,
        media: currentEditingMedia
      };

      if (existingIdx >= 0) {
        events[existingIdx] = eventData;
        showToast(`Event "${title}" updated successfully!`);
      } else {
        events.unshift(eventData);
        showToast(`Event "${title}" created and published!`);
      }

      saveEvents(events);
      closeModal();
      renderEvents();
    });
  }

  // Delete Event
  const deleteEvent = (id) => {
    const events = getEvents();
    const event = events.find(e => e.id === id);
    if (!event) return;

    if (confirm(`Are you sure you want to delete "${event.title}" from the event gallery?`)) {
      const updated = events.filter(e => e.id !== id);
      saveEvents(updated);
      showToast(`Event "${event.title}" removed.`, 'error');
      renderEvents();
    }
  };

  // ---------------------------------------------------------------------------
  // 8. Toolbar & Filter Events
  // ---------------------------------------------------------------------------
  if (searchInput) {
    searchInput.addEventListener('input', renderEvents);
  }

  if (categoryFilter) {
    categoryFilter.addEventListener('change', renderEvents);
  }

  if (btnNewEvent) {
    btnNewEvent.addEventListener('click', openCreateModal);
  }

  if (btnResetDefaults) {
    btnResetDefaults.addEventListener('click', () => {
      if (confirm('Reset event gallery to default curated multi-media events? This will restore the original demo events.')) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_EVENTS));
        showToast('Gallery reset to default seed events.');
        renderEvents();
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 9. JSON Import & Export Tools
  // ---------------------------------------------------------------------------
  const openJsonModal = (isExport = true) => {
    const events = getEvents();
    jsonTextarea.value = JSON.stringify(events, null, 2);
    jsonModal.classList.add('active');
  };

  const closeJsonModal = () => {
    jsonModal.classList.remove('active');
  };

  if (btnExportJson) {
    btnExportJson.addEventListener('click', () => openJsonModal(true));
  }

  if (btnImportJson) {
    btnImportJson.addEventListener('click', () => openJsonModal(false));
  }

  if (jsonModalClose) {
    jsonModalClose.addEventListener('click', closeJsonModal);
  }

  if (btnCopyJson) {
    btnCopyJson.addEventListener('click', () => {
      navigator.clipboard.writeText(jsonTextarea.value).then(() => {
        showToast('JSON copied to clipboard!');
      });
    });
  }

  if (btnDownloadJson) {
    btnDownloadJson.addEventListener('click', () => {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonTextarea.value);
      const dlAnchor = document.createElement('a');
      dlAnchor.setAttribute('href', dataStr);
      dlAnchor.setAttribute('download', `quantum_coders_events_${Date.now()}.json`);
      document.body.appendChild(dlAnchor);
      dlAnchor.click();
      dlAnchor.remove();
      showToast('JSON file downloaded!');
    });
  }

  if (btnApplyImport) {
    btnApplyImport.addEventListener('click', () => {
      try {
        const parsed = JSON.parse(jsonTextarea.value);
        if (!Array.isArray(parsed)) {
          showToast('Invalid JSON: Must be an array of event objects.', 'error');
          return;
        }
        saveEvents(parsed);
        showToast(`Imported ${parsed.length} events successfully!`);
        closeJsonModal();
        renderEvents();
      } catch (err) {
        showToast('Invalid JSON syntax: ' + err.message, 'error');
      }
    });
  }

  // Auto-switch URL field placeholder based on type
  if (mediaTypeSelect) {
    mediaTypeSelect.addEventListener('change', () => {
      if (mediaTypeSelect.value === 'video') {
        mediaUrlInput.placeholder = 'Paste Google Drive video share link or YouTube embed URL...';
      } else {
        mediaUrlInput.placeholder = 'https://... or select local file below';
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Security Clearance Gate Logic
  // ---------------------------------------------------------------------------
  const AUTH_KEY = 'qc_admin_auth';
  const VALID_KEYS = ['quantum2026', 'pydah2026'];
  const securityGate = document.getElementById('security-gate');
  const securityForm = document.getElementById('security-form');
  const adminPasscode = document.getElementById('admin-passcode');
  const securityError = document.getElementById('security-error');
  const btnLockConsole = document.getElementById('btn-lock-console');

  const checkAuth = () => {
    if (sessionStorage.getItem(AUTH_KEY) === 'true') {
      if (securityGate) securityGate.classList.add('unlocked');
    } else {
      if (securityGate) securityGate.classList.remove('unlocked');
      if (adminPasscode) {
        setTimeout(() => adminPasscode.focus(), 150);
      }
    }
  };

  if (securityForm) {
    securityForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const entered = (adminPasscode ? adminPasscode.value : '').trim();
      if (VALID_KEYS.includes(entered)) {
        sessionStorage.setItem(AUTH_KEY, 'true');
        if (securityError) securityError.classList.remove('visible');
        if (securityGate) securityGate.classList.add('unlocked');
        showToast('Access Granted. Welcome to Cadre Command.');
        if (adminPasscode) adminPasscode.value = '';
      } else {
        if (securityError) securityError.classList.add('visible');
        if (adminPasscode) {
          adminPasscode.value = '';
          adminPasscode.focus();
        }
        showToast('Access Denied: Invalid Security Key', 'error');
      }
    });
  }

  if (btnLockConsole) {
    btnLockConsole.addEventListener('click', () => {
      sessionStorage.removeItem(AUTH_KEY);
      if (securityGate) securityGate.classList.remove('unlocked');
      if (securityError) securityError.classList.remove('visible');
      if (adminPasscode) {
        adminPasscode.value = '';
        adminPasscode.focus();
      }
      showToast('Console Locked.');
    });
  }

  // Check auth immediately
  checkAuth();

  // Initial Load
  renderEvents();
});
