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

  // ---------------------------------------------------------------------------
  // 6. Console Section Switcher (Gallery vs Registrations)
  // ---------------------------------------------------------------------------
  const tabGalleryBtn = document.getElementById('tab-gallery-btn');
  const tabRegistrationsBtn = document.getElementById('tab-registrations-btn');
  const viewGallery = document.getElementById('view-gallery');
  const viewRegistrations = document.getElementById('view-registrations');

  const switchConsoleTab = (targetTab) => {
    if (targetTab === 'registrations') {
      if (tabGalleryBtn) tabGalleryBtn.classList.remove('active');
      if (tabRegistrationsBtn) tabRegistrationsBtn.classList.add('active');
      if (viewGallery) viewGallery.classList.remove('active');
      if (viewRegistrations) viewRegistrations.classList.add('active');
      renderRegistrations();
    } else {
      if (tabRegistrationsBtn) tabRegistrationsBtn.classList.remove('active');
      if (tabGalleryBtn) tabGalleryBtn.classList.add('active');
      if (viewRegistrations) viewRegistrations.classList.remove('active');
      if (viewGallery) viewGallery.classList.add('active');
      renderEvents();
    }
  };

  if (tabGalleryBtn) tabGalleryBtn.addEventListener('click', () => switchConsoleTab('gallery'));
  if (tabRegistrationsBtn) tabRegistrationsBtn.addEventListener('click', () => switchConsoleTab('registrations'));

  // ---------------------------------------------------------------------------
  // 7. Student Registrations Approval Engine
  // ---------------------------------------------------------------------------
  const REG_STORAGE_KEY = 'qc_student_registrations';
  const REG_CHANNEL_NAME = 'qc_registration_channel';

  // Broadcast Channel for live instant multi-tab communication
  let regBroadcastChannel = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      regBroadcastChannel = new BroadcastChannel(REG_CHANNEL_NAME);
      regBroadcastChannel.onmessage = (event) => {
        if (!event || !event.data) return;
        const { action, student } = event.data;
        if (action === 'NEW_REGISTRATION') {
          showToast(`New student application received from ${student ? student.fullName : 'candidate'}!`);
          renderRegistrations();
        } else if (action === 'STATUS_UPDATE') {
          renderRegistrations();
        }
      };
    }
  } catch (err) {
    console.warn('BroadcastChannel not supported in this environment', err);
  }

  // Listen to cross-tab storage changes as fallback
  window.addEventListener('storage', (e) => {
    if (e.key === REG_STORAGE_KEY) {
      renderRegistrations();
    }
  });

  const DEFAULT_REGISTRATIONS = [
    {
      id: 'APP-2026-4819',
      memberId: 'QC-2026-4819',
      fullName: 'ROHAN KUMAR',
      email: 'rohan.kumar@pydah.edu.in',
      phone: '+91 98480 22334',
      college: 'Pydah College of Engineering',
      year: '3rd Year',
      branch: 'CSE (AI & DS)',
      interest: 'AI / ML',
      statement: 'Built a local RAG assistant for our campus library. Eager to contribute to the club open-source LLM benchmarking initiative.',
      status: 'approved',
      appliedAt: Date.now() - 86400000 * 2,
      reviewedAt: Date.now() - 86400000
    },
    {
      id: 'APP-2026-7201',
      memberId: null,
      fullName: 'ANANYA SHARMA',
      email: 'ananya.s@pydah.edu.in',
      phone: '+91 99123 45678',
      college: 'Pydah College of Engineering',
      year: '2nd Year',
      branch: 'Computer Science & Engineering',
      interest: 'FULL STACK',
      statement: 'Passionate about React and TypeScript micro-frontends. Want to build high-concurrency tooling for collegiate hackathons.',
      status: 'pending',
      appliedAt: Date.now() - 3600000 * 5,
      reviewedAt: null
    },
    {
      id: 'APP-2026-9054',
      memberId: null,
      fullName: 'VAMSI KRISHNA REDDY',
      email: 'vamsi.krishna@pydah.edu.in',
      phone: '+91 94401 88992',
      college: 'Pydah College of Engineering',
      year: '3rd Year',
      branch: 'Electronics & Communication',
      interest: 'SYSTEMS',
      statement: 'Experienced with ESP32 IoT gateways and Rust firmware. Looking to bridge hardware sensors with club edge compute clusters.',
      status: 'pending',
      appliedAt: Date.now() - 3600000 * 2,
      reviewedAt: null
    },
    {
      id: 'APP-2026-3118',
      memberId: null,
      fullName: 'DIVYA TEJA',
      email: 'divya.teja@gmail.com',
      phone: '+91 97000 11223',
      college: 'Pydah College of Engineering',
      year: '1st Year',
      branch: 'Information Technology',
      interest: 'CYBERSECURITY',
      statement: 'Incomplete contact coordinates provided during initial registration submission.',
      status: 'rejected',
      appliedAt: Date.now() - 86400000 * 3,
      reviewedAt: Date.now() - 86400000 * 2
    }
  ];

  const getRegistrations = () => {
    try {
      const data = localStorage.getItem(REG_STORAGE_KEY);
      if (!data) {
        localStorage.setItem(REG_STORAGE_KEY, JSON.stringify(DEFAULT_REGISTRATIONS));
        return DEFAULT_REGISTRATIONS;
      }
      return JSON.parse(data);
    } catch (err) {
      console.error('Error reading registrations from localStorage:', err);
      return DEFAULT_REGISTRATIONS;
    }
  };

  const saveRegistrations = (list) => {
    try {
      localStorage.setItem(REG_STORAGE_KEY, JSON.stringify(list));
      // Notify other tabs
      localStorage.setItem('qc_last_reg_sync', Date.now().toString());
    } catch (err) {
      console.error('Error saving registrations to localStorage:', err);
    }
  };

  // DOM Elements for Registrations Console
  const regListEl = document.getElementById('registrations-list');
  const regSearchInput = document.getElementById('reg-search-input');
  const filterPillButtons = document.querySelectorAll('.btn-filter-pill');
  const regCountTotal = document.getElementById('reg-count-total');
  const regCountPending = document.getElementById('reg-count-pending');
  const regCountApproved = document.getElementById('reg-count-approved');
  const regCountRejected = document.getElementById('reg-count-rejected');
  const tabPendingBadge = document.getElementById('tab-pending-badge');
  const pillCountAll = document.getElementById('pill-count-all');
  const pillCountPending = document.getElementById('pill-count-pending');
  const pillCountApproved = document.getElementById('pill-count-approved');
  const pillCountRejected = document.getElementById('pill-count-rejected');
  const btnApproveAllPending = document.getElementById('btn-approve-all-pending');
  const btnManualAddStudent = document.getElementById('btn-manual-add-student');
  const btnExportRegJson = document.getElementById('btn-export-reg-json');
  const btnExportRegCsv = document.getElementById('btn-export-reg-csv');
  const btnResetRegDefaults = document.getElementById('btn-reset-reg-defaults');

  let currentRegFilter = 'all';
  let currentRegSearch = '';

  // Render Registrations
  const renderRegistrations = () => {
    const list = getRegistrations();

    // Metric Calculations
    const totalCount = list.length;
    const pendingCount = list.filter(r => r.status === 'pending').length;
    const approvedCount = list.filter(r => r.status === 'approved').length;
    const rejectedCount = list.filter(r => r.status === 'rejected').length;

    if (regCountTotal) regCountTotal.textContent = totalCount;
    if (regCountPending) regCountPending.textContent = pendingCount;
    if (regCountApproved) regCountApproved.textContent = approvedCount;
    if (regCountRejected) regCountRejected.textContent = rejectedCount;

    if (pillCountAll) pillCountAll.textContent = totalCount;
    if (pillCountPending) pillCountPending.textContent = pendingCount;
    if (pillCountApproved) pillCountApproved.textContent = approvedCount;
    if (pillCountRejected) pillCountRejected.textContent = rejectedCount;

    // Update Header Tab Badge
    if (tabPendingBadge) {
      tabPendingBadge.textContent = pendingCount;
      if (pendingCount > 0) {
        tabPendingBadge.classList.remove('badge-zero');
      } else {
        tabPendingBadge.classList.add('badge-zero');
      }
    }

    if (!regListEl) return;

    // Filtering logic
    const query = currentRegSearch.trim().toLowerCase();
    const filtered = list.filter(reg => {
      const matchFilter = currentRegFilter === 'all' || reg.status === currentRegFilter;
      const matchSearch = !query ||
        (reg.fullName && reg.fullName.toLowerCase().includes(query)) ||
        (reg.email && reg.email.toLowerCase().includes(query)) ||
        (reg.phone && reg.phone.toLowerCase().includes(query)) ||
        (reg.college && reg.college.toLowerCase().includes(query)) ||
        (reg.branch && reg.branch.toLowerCase().includes(query)) ||
        (reg.id && reg.id.toLowerCase().includes(query)) ||
        (reg.memberId && reg.memberId.toLowerCase().includes(query));
      return matchFilter && matchSearch;
    });

    if (filtered.length === 0) {
      regListEl.innerHTML = `
        <div class="empty-registrations-state">
          <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">📋</div>
          <h3 style="font-family: var(--font-heading); color: var(--color-white); font-size: 1.3rem; margin-bottom: 0.5rem;">NO APPLICATIONS FOUND</h3>
          <p style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--color-gray); margin-bottom: 1.5rem;">
            No student registration applications match the current filter [${currentRegFilter.toUpperCase()}] or search query.
          </p>
          <button type="button" class="btn-brutalist btn-secondary btn-sm" id="btn-clear-reg-filter">
            Clear Filters
          </button>
        </div>
      `;
      const btnClear = document.getElementById('btn-clear-reg-filter');
      if (btnClear) {
        btnClear.addEventListener('click', () => {
          currentRegFilter = 'all';
          currentRegSearch = '';
          if (regSearchInput) regSearchInput.value = '';
          filterPillButtons.forEach(b => b.classList.toggle('active', b.dataset.filter === 'all'));
          renderRegistrations();
        });
      }
      return;
    }

    // Build Cards HTML
    regListEl.innerHTML = filtered.map(item => {
      const isPending = item.status === 'pending';
      const isApproved = item.status === 'approved';
      const isRejected = item.status === 'rejected';

      const statusBadge = isPending
        ? `<span class="reg-status-badge status-badge-pending">⏳ Awaiting Approval</span>`
        : isApproved
        ? `<span class="reg-status-badge status-badge-approved">✓ Member Approved</span>`
        : `<span class="reg-status-badge status-badge-rejected">✕ Rejected / Revoked</span>`;

      const memberIdBadge = item.memberId
        ? `<span class="reg-member-id-tag">ID: ${escapeHtml(item.memberId)}</span>`
        : `<span style="font-family: var(--font-mono); font-size: 0.75rem; color: #fbbf24;">(Member ID unassigned)</span>`;

      const appliedDate = item.appliedAt ? new Date(item.appliedAt).toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
      }) : 'Recent';

      return `
        <div class="reg-card status-${item.status}" data-id="${escapeHtml(item.id)}">
          <div class="reg-card-head">
            <div>
              <h3 class="reg-student-name">${escapeHtml(item.fullName)}</h3>
              <div class="reg-ids-line">
                <span class="reg-app-id-tag">REF: ${escapeHtml(item.id)}</span>
                ${memberIdBadge}
              </div>
            </div>
            <div>
              ${statusBadge}
            </div>
          </div>

          <div class="reg-card-grid">
            <div class="reg-info-cell">
              <div class="reg-cell-label">Domain Track</div>
              <div class="reg-cell-val" style="color: #60a5fa;">${escapeHtml(item.interest || 'ENGINEERING')}</div>
            </div>
            <div class="reg-info-cell">
              <div class="reg-cell-label">Branch &amp; Year</div>
              <div class="reg-cell-val">${escapeHtml(item.branch || 'CSE')} • ${escapeHtml(item.year || '3rd Year')}</div>
            </div>
            <div class="reg-info-cell">
              <div class="reg-cell-label">College</div>
              <div class="reg-cell-val">${escapeHtml(item.college || 'Pydah College of Engineering')}</div>
            </div>
            <div class="reg-info-cell">
              <div class="reg-cell-label">Email Coordinate</div>
              <div class="reg-cell-val">${escapeHtml(item.email || '—')}</div>
            </div>
            <div class="reg-info-cell">
              <div class="reg-cell-label">Phone / WhatsApp</div>
              <div class="reg-cell-val">${escapeHtml(item.phone || '—')}</div>
            </div>
          </div>

          ${item.statement ? `
            <div class="reg-statement-box">
              "${escapeHtml(item.statement)}"
            </div>
          ` : ''}

          <div class="reg-card-foot">
            <div class="reg-time-stamp">
              Applied: ${appliedDate} ${item.reviewedAt ? `• Reviewed: ${new Date(item.reviewedAt).toLocaleDateString()}` : ''}
            </div>

            <div class="reg-card-actions">
              ${isPending ? `
                <button type="button" class="btn-reg-action btn-reg-approve" data-action="approve" data-id="${escapeHtml(item.id)}">
                  ✓ Approve Application
                </button>
                <button type="button" class="btn-reg-action btn-reg-reject" data-action="reject" data-id="${escapeHtml(item.id)}">
                  ✕ Reject
                </button>
              ` : isApproved ? `
                <button type="button" class="btn-reg-action btn-reg-reject" data-action="revoke" data-id="${escapeHtml(item.id)}" title="Revoke approval and return to pending">
                  ↺ Revert to Pending
                </button>
              ` : `
                <button type="button" class="btn-reg-action btn-reg-approve" data-action="approve" data-id="${escapeHtml(item.id)}">
                  ✓ Re-Approve Member
                </button>
              `}

              <button type="button" class="btn-reg-action btn-reg-preview" data-action="preview" data-id="${escapeHtml(item.id)}">
                👁️ ${isApproved ? 'View Digital Pass' : 'Preview Pass'}
              </button>
              <button type="button" class="btn-reg-action btn-reg-del" data-action="delete" data-id="${escapeHtml(item.id)}" title="Delete application record">
                🗑️
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach card action listeners
    attachCardActionHandlers();
  };

  // Card Action Handlers (Approve, Reject, Revoke, Preview, Delete)
  const attachCardActionHandlers = () => {
    if (!regListEl) return;

    regListEl.querySelectorAll('.btn-reg-action').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = btn.dataset.action;
        const id = btn.dataset.id;
        if (!action || !id) return;

        if (action === 'approve') {
          approveRegistration(id);
        } else if (action === 'reject') {
          rejectRegistration(id);
        } else if (action === 'revoke') {
          revokeRegistration(id);
        } else if (action === 'preview') {
          openStudentCardModal(id);
        } else if (action === 'delete') {
          deleteRegistration(id);
        }
      });
    });
  };

  // Approve a single registration
  const approveRegistration = (id) => {
    const list = getRegistrations();
    const student = list.find(r => r.id === id);
    if (!student) return;

    // Generate verified Member ID if not already minted
    if (!student.memberId) {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      student.memberId = `QC-2026-${randomSuffix}`;
    }

    student.status = 'approved';
    student.reviewedAt = Date.now();
    saveRegistrations(list);

    // Notify public site via BroadcastChannel
    if (regBroadcastChannel) {
      regBroadcastChannel.postMessage({
        action: 'APPROVE',
        id: student.id,
        memberId: student.memberId,
        student: student,
        timestamp: Date.now()
      });
    }

    // Also write trigger item for storage event fallback
    localStorage.setItem('qc_last_broadcast_approval', JSON.stringify({
      id: student.id,
      memberId: student.memberId,
      timestamp: Date.now()
    }));

    showToast(`✓ Approved ${student.fullName}! Official Member ID: ${student.memberId}`, 'success');
    renderRegistrations();
  };

  // Reject a registration
  const rejectRegistration = (id) => {
    const list = getRegistrations();
    const student = list.find(r => r.id === id);
    if (!student) return;

    student.status = 'rejected';
    student.reviewedAt = Date.now();
    saveRegistrations(list);

    if (regBroadcastChannel) {
      regBroadcastChannel.postMessage({
        action: 'REJECT',
        id: student.id,
        timestamp: Date.now()
      });
    }

    showToast(`Application for ${student.fullName} marked as Rejected / Revision.`, 'error');
    renderRegistrations();
  };

  // Revoke to Pending
  const revokeRegistration = (id) => {
    const list = getRegistrations();
    const student = list.find(r => r.id === id);
    if (!student) return;

    student.status = 'pending';
    student.reviewedAt = null;
    saveRegistrations(list);

    if (regBroadcastChannel) {
      regBroadcastChannel.postMessage({
        action: 'REVOKE',
        id: student.id,
        timestamp: Date.now()
      });
    }

    showToast(`Status for ${student.fullName} reverted to Pending.`);
    renderRegistrations();
  };

  // Delete registration record
  const deleteRegistration = (id) => {
    if (!confirm('Are you sure you want to permanently delete this application record?')) return;
    const list = getRegistrations();
    const filtered = list.filter(r => r.id !== id);
    saveRegistrations(filtered);
    showToast('Application record deleted.');
    renderRegistrations();
  };

  // Approve All Pending
  if (btnApproveAllPending) {
    btnApproveAllPending.addEventListener('click', () => {
      const list = getRegistrations();
      const pendingItems = list.filter(r => r.status === 'pending');
      if (pendingItems.length === 0) {
        showToast('No pending applications to approve.');
        return;
      }

      if (!confirm(`Are you sure you want to approve all ${pendingItems.length} pending student applications?`)) return;

      pendingItems.forEach(student => {
        if (!student.memberId) {
          const randomSuffix = Math.floor(1000 + Math.random() * 9000);
          student.memberId = `QC-2026-${randomSuffix}`;
        }
        student.status = 'approved';
        student.reviewedAt = Date.now();

        if (regBroadcastChannel) {
          regBroadcastChannel.postMessage({
            action: 'APPROVE',
            id: student.id,
            memberId: student.memberId,
            student: student,
            timestamp: Date.now()
          });
        }
      });

      saveRegistrations(list);
      showToast(`✓ All ${pendingItems.length} pending applications have been approved!`, 'success');
      renderRegistrations();
    });
  }

  // Filter Pills Handling
  filterPillButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterPillButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentRegFilter = btn.dataset.filter || 'all';
      renderRegistrations();
    });
  });

  // Search Input Handling
  if (regSearchInput) {
    regSearchInput.addEventListener('input', (e) => {
      currentRegSearch = e.target.value;
      renderRegistrations();
    });
  }

  // Reset Registrations Defaults
  if (btnResetRegDefaults) {
    btnResetRegDefaults.addEventListener('click', () => {
      if (confirm('Reset registrations to original sample applications? Any recent submissions will be replaced.')) {
        localStorage.setItem(REG_STORAGE_KEY, JSON.stringify(DEFAULT_REGISTRATIONS));
        showToast('Sample registrations restored.');
        renderRegistrations();
      }
    });
  }

  // Export Registrations as JSON
  if (btnExportRegJson) {
    btnExportRegJson.addEventListener('click', () => {
      const list = getRegistrations();
      const blob = new Blob([JSON.stringify(list, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quantum_coders_student_registrations_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Exported registrations JSON file.');
    });
  }

  // Export Registrations as CSV
  if (btnExportRegCsv) {
    btnExportRegCsv.addEventListener('click', () => {
      const list = getRegistrations();
      if (list.length === 0) {
        showToast('No registrations to export.', 'error');
        return;
      }

      const headers = ['Application ID', 'Member ID', 'Full Name', 'Email', 'Phone', 'College', 'Year', 'Branch', 'Interest Domain', 'Status', 'Applied At'];
      const rows = list.map(r => [
        `"${r.id || ''}"`,
        `"${r.memberId || ''}"`,
        `"${(r.fullName || '').replace(/"/g, '""')}"`,
        `"${(r.email || '').replace(/"/g, '""')}"`,
        `"${(r.phone || '').replace(/"/g, '""')}"`,
        `"${(r.college || '').replace(/"/g, '""')}"`,
        `"${(r.year || '').replace(/"/g, '""')}"`,
        `"${(r.branch || '').replace(/"/g, '""')}"`,
        `"${(r.interest || '').replace(/"/g, '""')}"`,
        `"${(r.status || '').toUpperCase()}"`,
        `"${r.appliedAt ? new Date(r.appliedAt).toISOString() : ''}"`
      ]);

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quantum_coders_members_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Exported student registrations CSV spreadsheet.');
    });
  }

  // ---------------------------------------------------------------------------
  // 8. Student Digital Card Preview Modal
  // ---------------------------------------------------------------------------
  const studentCardModal = document.getElementById('student-card-modal');
  const studentCardModalClose = document.getElementById('student-card-modal-close');
  const modalCardStatusBanner = document.getElementById('modal-card-status-banner');
  const modalCardStatusText = document.getElementById('modal-card-status-text');
  const modalCardAppId = document.getElementById('modal-card-app-id');
  const modalCardPassType = document.getElementById('modal-card-pass-type');
  const modalCardMemberTitle = document.getElementById('modal-card-member-title');
  const modalCardName = document.getElementById('modal-card-name');
  const modalCardId = document.getElementById('modal-card-id');
  const modalCardDomain = document.getElementById('modal-card-domain');
  const modalCardCollege = document.getElementById('modal-card-college');
  const modalCardBranchYear = document.getElementById('modal-card-branch-year');
  const modalCardEmail = document.getElementById('modal-card-email');
  const modalCardPhone = document.getElementById('modal-card-phone');
  const modalCardActionButtons = document.getElementById('modal-card-action-buttons');
  const btnModalPrintCard = document.getElementById('btn-modal-print-card');

  const openStudentCardModal = (id) => {
    const list = getRegistrations();
    const student = list.find(r => r.id === id);
    if (!student || !studentCardModal) return;

    const isApproved = student.status === 'approved';
    const isPending = student.status === 'pending';

    if (modalCardStatusBanner) {
      if (isApproved) {
        modalCardStatusBanner.style.background = 'rgba(16, 185, 129, 0.15)';
        modalCardStatusBanner.style.borderColor = '#10B981';
        modalCardStatusBanner.style.color = '#34D399';
        if (modalCardStatusText) modalCardStatusText.textContent = 'STATUS: ✓ VERIFIED ACTIVE MEMBER';
      } else if (isPending) {
        modalCardStatusBanner.style.background = 'rgba(245, 158, 11, 0.15)';
        modalCardStatusBanner.style.borderColor = '#F59E0B';
        modalCardStatusBanner.style.color = '#FBBF24';
        if (modalCardStatusText) modalCardStatusText.textContent = 'STATUS: ⏳ AWAITING CADRE APPROVAL';
      } else {
        modalCardStatusBanner.style.background = 'rgba(239, 68, 68, 0.15)';
        modalCardStatusBanner.style.borderColor = '#EF4444';
        modalCardStatusBanner.style.color = '#F87171';
        if (modalCardStatusText) modalCardStatusText.textContent = 'STATUS: ✕ REVISION REQUIRED / REJECTED';
      }
    }

    if (modalCardAppId) modalCardAppId.textContent = student.id;
    if (modalCardPassType) modalCardPassType.textContent = isApproved ? 'MEMBER PASS' : 'APPLICANT PASS';
    if (modalCardMemberTitle) modalCardMemberTitle.textContent = isApproved ? 'VERIFIED ACTIVE FELLOW' : 'APPLICATION UNDER REVIEW';
    if (modalCardName) modalCardName.textContent = (student.fullName || 'STUDENT NAME').toUpperCase();
    if (modalCardId) {
      modalCardId.textContent = student.memberId || student.id;
      modalCardId.style.color = isApproved ? '#34D399' : '#FBBF24';
    }
    if (modalCardDomain) modalCardDomain.textContent = (student.interest || 'ENGINEERING').toUpperCase();
    if (modalCardCollege) modalCardCollege.textContent = (student.college || 'PYDAH GROUP').toUpperCase();
    if (modalCardBranchYear) modalCardBranchYear.textContent = `${(student.branch || 'CSE').toUpperCase()} • ${(student.year || '3RD YEAR').toUpperCase()}`;
    if (modalCardEmail) modalCardEmail.textContent = student.email || '—';
    if (modalCardPhone) modalCardPhone.textContent = student.phone || '—';

    // Populate quick action buttons inside modal
    if (modalCardActionButtons) {
      if (isPending) {
        modalCardActionButtons.innerHTML = `
          <button type="button" class="btn-brutalist btn-primary btn-sm" id="btn-modal-quick-approve" style="background: #10B981; border-color: #059669; color: #fff;">
            ✓ Approve Application
          </button>
          <button type="button" class="btn-brutalist btn-secondary btn-sm" id="btn-modal-quick-reject" style="color: #f87171;">
            ✕ Reject
          </button>
        `;
        const btnQApprove = document.getElementById('btn-modal-quick-approve');
        const btnQReject = document.getElementById('btn-modal-quick-reject');
        if (btnQApprove) {
          btnQApprove.addEventListener('click', () => {
            approveRegistration(student.id);
            openStudentCardModal(student.id);
          });
        }
        if (btnQReject) {
          btnQReject.addEventListener('click', () => {
            rejectRegistration(student.id);
            openStudentCardModal(student.id);
          });
        }
      } else if (isApproved) {
        modalCardActionButtons.innerHTML = `
          <button type="button" class="btn-brutalist btn-secondary btn-sm" id="btn-modal-quick-revoke">
            ↺ Revert to Pending
          </button>
        `;
        const btnQRevoke = document.getElementById('btn-modal-quick-revoke');
        if (btnQRevoke) {
          btnQRevoke.addEventListener('click', () => {
            revokeRegistration(student.id);
            openStudentCardModal(student.id);
          });
        }
      } else {
        modalCardActionButtons.innerHTML = `
          <button type="button" class="btn-brutalist btn-primary btn-sm" id="btn-modal-quick-approve" style="background: #10B981; border-color: #059669; color: #fff;">
            ✓ Re-Approve Member
          </button>
        `;
        const btnQApprove = document.getElementById('btn-modal-quick-approve');
        if (btnQApprove) {
          btnQApprove.addEventListener('click', () => {
            approveRegistration(student.id);
            openStudentCardModal(student.id);
          });
        }
      }
    }

    studentCardModal.classList.add('active');
  };

  const closeStudentCardModal = () => {
    if (studentCardModal) studentCardModal.classList.remove('active');
  };

  if (studentCardModalClose) studentCardModalClose.addEventListener('click', closeStudentCardModal);
  if (studentCardModal) {
    studentCardModal.addEventListener('click', (e) => {
      if (e.target === studentCardModal) closeStudentCardModal();
    });
  }

  if (btnModalPrintCard) {
    btnModalPrintCard.addEventListener('click', () => {
      window.print();
    });
  }

  // ---------------------------------------------------------------------------
  // 9. Manual Student Registration Modal
  // ---------------------------------------------------------------------------
  const manualStudentModal = document.getElementById('manual-student-modal');
  const manualStudentModalClose = document.getElementById('manual-student-modal-close');
  const manualStudentModalCancel = document.getElementById('manual-student-modal-cancel');
  const manualStudentForm = document.getElementById('manual-student-form');

  const openManualStudentModal = () => {
    if (manualStudentForm) manualStudentForm.reset();
    if (manualStudentModal) manualStudentModal.classList.add('active');
  };

  const closeManualStudentModal = () => {
    if (manualStudentModal) manualStudentModal.classList.remove('active');
  };

  if (btnManualAddStudent) btnManualAddStudent.addEventListener('click', openManualStudentModal);
  if (manualStudentModalClose) manualStudentModalClose.addEventListener('click', closeManualStudentModal);
  if (manualStudentModalCancel) manualStudentModalCancel.addEventListener('click', closeManualStudentModal);
  if (manualStudentModal) {
    manualStudentModal.addEventListener('click', (e) => {
      if (e.target === manualStudentModal) closeManualStudentModal();
    });
  }

  if (manualStudentForm) {
    manualStudentForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('m-student-name').value.trim();
      const email = document.getElementById('m-student-email').value.trim();
      const phone = document.getElementById('m-student-phone').value.trim();
      const college = document.getElementById('m-student-college').value.trim();
      const year = document.getElementById('m-student-year').value;
      const branch = document.getElementById('m-student-branch').value.trim();
      const interest = document.getElementById('m-student-interest').value;
      const statement = document.getElementById('m-student-statement').value.trim();
      const status = document.getElementById('m-student-status').value;

      if (!name || !email || !phone || !college || !branch) {
        showToast('Please fill in all required fields.', 'error');
        return;
      }

      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const newAppId = `APP-2026-${randomSuffix}`;
      const newMemberId = status === 'approved' ? `QC-2026-${randomSuffix}` : null;

      const newRecord = {
        id: newAppId,
        memberId: newMemberId,
        fullName: name.toUpperCase(),
        email: email,
        phone: phone,
        college: college,
        year: year,
        branch: branch,
        interest: interest,
        statement: statement || 'Direct cadre registration.',
        status: status,
        appliedAt: Date.now(),
        reviewedAt: status === 'approved' ? Date.now() : null
      };

      const list = getRegistrations();
      list.unshift(newRecord);
      saveRegistrations(list);

      // Broadcast if approved
      if (status === 'approved' && regBroadcastChannel) {
        regBroadcastChannel.postMessage({
          action: 'APPROVE',
          id: newRecord.id,
          memberId: newRecord.memberId,
          student: newRecord,
          timestamp: Date.now()
        });
      }

      closeManualStudentModal();
      showToast(`Added student ${name} (${status.toUpperCase()})!`, 'success');
      renderRegistrations();
    });
  }

  // Check auth immediately
  checkAuth();

  // Initial Load
  renderEvents();
  renderRegistrations();
});

