window.__adminLoaded = true;

/**
 * QUANTUM CODERS // EVENT GALLERY CONTROLLER
 * Vanilla JavaScript Admin System with Multi-Media & Google Drive Support
 */

const initAdmin = () => {
  const STORAGE_KEY = 'qc_event_gallery';

  // Helper to safely escape HTML in rendered templates
  const escapeHtml = (str) => {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  // ---------------------------------------------------------------------------
  // 0. System Toast & Security Clearance Gate Logic (First Priority)
  // ---------------------------------------------------------------------------
  const toastEl = document.getElementById('admin-toast');
  const showToast = (message, type = 'success') => {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.className = `admin-toast active toast-${type}`;
    setTimeout(() => {
      toastEl.classList.remove('active');
    }, 3800);
  };
  window.showToast = showToast;

  const AUTH_KEY = 'qc_admin_auth';
  const VALID_KEYS = [
    'quantum2026', 'quantum', 'pydah2026', 'pydah', 
    'admin2026', 'admin', 'qc2026', 'qc', 'quantumcoders'
  ];
  const securityGate = document.getElementById('security-gate');
  const securityForm = document.getElementById('security-form');
  const adminPasscode = document.getElementById('admin-passcode');
  const securityError = document.getElementById('security-error');
  const securityLockNotice = document.getElementById('security-lock-notice');
  const btnLockConsole = document.getElementById('btn-lock-console');

  const lockConsole = (showNotice = false) => {
    sessionStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem('qc_admin_authenticated');
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem('qc_admin_authenticated');
    document.body.classList.remove('auth-cleared');

    if (securityGate) {
      securityGate.classList.remove('unlocked');
      securityGate.style.removeProperty('display');
      securityGate.style.display = 'flex';
    }
    if (securityError) {
      securityError.classList.remove('visible');
    }
    if (securityLockNotice) {
      securityLockNotice.style.display = showNotice ? 'block' : 'none';
    }
    if (adminPasscode) {
      adminPasscode.value = '';
      setTimeout(() => adminPasscode.focus(), 120);
    }
  };

  const unlockConsole = () => {
    sessionStorage.setItem(AUTH_KEY, 'true');
    sessionStorage.setItem('qc_admin_authenticated', 'true');
    document.body.classList.add('auth-cleared');
    if (securityGate) {
      securityGate.classList.add('unlocked');
      securityGate.style.setProperty('display', 'none', 'important');
    }
    if (securityError) {
      securityError.classList.remove('visible');
    }
    if (securityLockNotice) {
      securityLockNotice.style.display = 'none';
    }
    if (adminPasscode) {
      adminPasscode.value = '';
    }
  };

  const checkAuth = () => {
    // Purge persistent local storage to enforce lock gate
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem('qc_admin_authenticated');

    const params = new URLSearchParams(window.location.search);
    if (params.get('lock') === 'true' || window.location.hash === '#lock') {
      lockConsole(true);
      return;
    }

    if (sessionStorage.getItem(AUTH_KEY) === 'true') {
      unlockConsole();
    } else {
      lockConsole(false);
    }
  };

  if (securityForm) {
    securityForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const entered = (adminPasscode ? adminPasscode.value : '').trim().toLowerCase();
      const customKey = (localStorage.getItem('qc_admin_custom_passcode') || '').trim().toLowerCase();
      if (VALID_KEYS.includes(entered) || (customKey && entered === customKey)) {
        unlockConsole();
        showToast('Access Granted. Welcome to Cadre Command.', 'success');
      } else {
        document.body.classList.remove('auth-cleared');
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
    btnLockConsole.addEventListener('click', (e) => {
      e.preventDefault();
      lockConsole(true);
      showToast('Console Locked. Re-authentication required.');
    });
  }

  // Keyboard shortcut: Alt+L to quickly lock console
  window.addEventListener('keydown', (e) => {
    if (e.altKey && (e.key === 'l' || e.key === 'L')) {
      e.preventDefault();
      lockConsole(true);
      showToast('Console Locked [Alt+L].');
    }
  });

  // Enforce lock state immediately before anything else
  checkAuth();

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

  let currentEditingMedia = []; // Array of media objects for the currently open modal

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

      // Also bridge and mirror into the operational event catalog & Supabase
      try {
        const coverUrl = (currentEditingMedia && currentEditingMedia[0] && currentEditingMedia[0].url) || 'images/event%20images/Pydah%20hackathon.png';
        const catalogEvents = getEventsFromStorage() || [];
        const existingCatIdx = catalogEvents.findIndex(ce => String(ce.id) === String(id));
        const catalogEntry = normalizeEvent({
          id,
          name: title,
          title,
          category,
          event_type: category.charAt(0).toUpperCase() + category.slice(1),
          date: date || new Date().toISOString().split('T')[0],
          event_date: date || new Date().toISOString().split('T')[0],
          venue: location || 'Campus Auditorium',
          description,
          banner_url: coverUrl,
          cover_image: coverUrl,
          maximum_slots: 100,
          status: 'PUBLISHED',
          is_published: true,
          is_calendar_visible: true,
          is_registration_open: true
        });

        if (existingCatIdx >= 0) {
          catalogEvents[existingCatIdx] = catalogEntry;
        } else {
          catalogEvents.unshift(catalogEntry);
        }
        saveEventsToStorage(catalogEvents);

        // Sync with API & Supabase
        if (window.QC_SUPABASE && window.QC_SUPABASE.upsertEvent) {
          window.QC_SUPABASE.upsertEvent(catalogEntry);
        }

        if (typeof BroadcastChannel !== 'undefined') {
          const bc = new BroadcastChannel('qc_events_channel');
          bc.postMessage({
            action: 'EVENT_UPDATED',
            type: 'QC_EVENT_UPDATE',
            event: catalogEntry,
            timestamp: Date.now()
          });
        }
      } catch (err) {}

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
  // 6. Console Section Switcher (8 Operational Views)
  // ---------------------------------------------------------------------------
  const TABS_CONFIG = [
    { id: 'dashboard', btnId: 'tab-dashboard-btn', viewId: 'view-dashboard', onActivate: () => loadDashboardStats() },
    { id: 'events', btnId: 'tab-events-btn', viewId: 'view-events', onActivate: () => loadAdminEvents() },
    { id: 'event-reg', btnId: 'tab-event-reg-btn', viewId: 'view-event-registrations', onActivate: () => loadEventPasses() },
    { id: 'scanner', btnId: 'tab-scanner-btn', viewId: 'view-scanner', onActivate: () => {} },
    { id: 'attendance', btnId: 'tab-attendance-btn', viewId: 'view-attendance', onActivate: () => loadAttendanceRegister() },
    { id: 'gallery', btnId: 'tab-gallery-btn', viewId: 'view-gallery', onActivate: () => renderEvents() },
    { id: 'registrations', btnId: 'tab-registrations-btn', viewId: 'view-registrations', onActivate: () => fetchClubRegistrations() },
    { id: 'settings', btnId: 'tab-settings-btn', viewId: 'view-settings', onActivate: () => loadSectionToggles() }
  ];

  let currentActiveTab = 'dashboard';

  const switchConsoleTab = (targetTabId) => {
    currentActiveTab = targetTabId;
    TABS_CONFIG.forEach(tab => {
      const btn = document.getElementById(tab.btnId);
      const view = document.getElementById(tab.viewId);
      const isActive = tab.id === targetTabId;

      if (btn) btn.classList.toggle('active', isActive);
      if (view) view.classList.toggle('active', isActive);

      if (isActive && typeof tab.onActivate === 'function') {
        tab.onActivate();
      }
    });

    // If leaving scanner tab, stop camera to save battery
    if (targetTabId !== 'scanner' && typeof stopCameraScanner === 'function') {
      stopCameraScanner();
    }
  };
  window.switchConsoleTab = switchConsoleTab;

  TABS_CONFIG.forEach(tab => {
    const btn = document.getElementById(tab.btnId);
    if (btn) {
      btn.addEventListener('click', () => switchConsoleTab(tab.id));
    }
  });

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

  const DEFAULT_REGISTRATIONS = [];

  let adminClubMembersCache = [];

  const getRegistrations = () => {
    if (adminClubMembersCache.length > 0) return adminClubMembersCache;
    try {
      const data = localStorage.getItem(REG_STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {}
    return DEFAULT_REGISTRATIONS;
  };

  const saveRegistrations = (list) => {
    adminClubMembersCache = list;
    try {
      localStorage.setItem(REG_STORAGE_KEY, JSON.stringify(list));
      localStorage.setItem('qc_last_reg_sync', Date.now().toString());
    } catch (err) {
      console.error('Error saving registrations locally:', err);
    }
  };

  const fetchClubRegistrations = async () => {
    let list = [];

    // 1. Direct Supabase Query if configured
    if (window.QC_SUPABASE && window.QC_SUPABASE.isConfigured()) {
      try {
        const client = window.QC_SUPABASE.getClient();
        if (client) {
          const { data, error } = await client
            .from('club_members')
            .select('*')
            .order('applied_at', { ascending: false });

          if (!error && Array.isArray(data) && data.length > 0) {
            list = data.map(d => ({
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
              appliedAt: d.applied_at ? new Date(d.applied_at).getTime() : Date.now(),
              reviewedAt: d.reviewed_at ? new Date(d.reviewed_at).getTime() : null
            }));
          }
        }
      } catch (err) {
        console.warn('Supabase club members query:', err);
      }
    }

    // 2. Serverless API Endpoint /api/students
    if (list.length === 0) {
      try {
        const res = await fetch('/api/students');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            list = data;
          }
        }
      } catch (err) {}
    }

    // 4. Default Seed Registrations if empty
    if (list.length === 0) {
      list = DEFAULT_REGISTRATIONS;
    }

    adminClubMembersCache = list;
    renderRegistrations();
    return list;
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

  // Approve a single registration online
  const approveRegistration = async (id) => {
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

    // 1. Persist online to Supabase via serverless API
    try {
      await fetch('/api/students', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: student.id,
          status: 'approved',
          memberId: student.memberId
        })
      });
    } catch (e) {
      console.warn('API error approving student:', e);
    }

    // 2. Direct Supabase Client fallback
    if (window.QC_SUPABASE && window.QC_SUPABASE.isConfigured()) {
      try {
        const client = window.QC_SUPABASE.getClient();
        if (client) {
          await client.from('club_members').update({
            status: 'approved',
            member_id: student.memberId,
            reviewed_at: new Date().toISOString()
          }).eq('id', student.id);
        }
      } catch (e) {}
    }

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

  // Reject a registration online
  const rejectRegistration = async (id) => {
    const list = getRegistrations();
    const student = list.find(r => r.id === id);
    if (!student) return;

    student.status = 'rejected';
    student.reviewedAt = Date.now();
    saveRegistrations(list);

    // 1. Persist online
    try {
      await fetch('/api/students', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: student.id, status: 'rejected' })
      });
    } catch (e) {}

    // 2. Direct Supabase
    if (window.QC_SUPABASE && window.QC_SUPABASE.isConfigured()) {
      try {
        const client = window.QC_SUPABASE.getClient();
        if (client) {
          await client.from('club_members').update({
            status: 'rejected',
            reviewed_at: new Date().toISOString()
          }).eq('id', student.id);
        }
      } catch (e) {}
    }

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

  // Revoke to Pending online
  const revokeRegistration = async (id) => {
    const list = getRegistrations();
    const student = list.find(r => r.id === id);
    if (!student) return;

    student.status = 'pending';
    student.reviewedAt = null;
    saveRegistrations(list);

    // 1. Persist online
    try {
      await fetch('/api/students', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: student.id, status: 'pending' })
      });
    } catch (e) {}

    // 2. Direct Supabase
    if (window.QC_SUPABASE && window.QC_SUPABASE.isConfigured()) {
      try {
        const client = window.QC_SUPABASE.getClient();
        if (client) {
          await client.from('club_members').update({
            status: 'pending',
            reviewed_at: null
          }).eq('id', student.id);
        }
      } catch (e) {}
    }

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

  // Delete registration record online
  const deleteRegistration = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this application record from the cloud database?')) return;

    // 1. Delete online
    try {
      await fetch(`/api/students?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    } catch (e) {}

    // 2. Direct Supabase
    if (window.QC_SUPABASE && window.QC_SUPABASE.isConfigured()) {
      try {
        const client = window.QC_SUPABASE.getClient();
        if (client) await client.from('club_members').delete().eq('id', id);
      } catch (e) {}
    }

    const list = getRegistrations();
    const filtered = list.filter(r => r.id !== id);
    saveRegistrations(filtered);
    showToast('Application record deleted from database.');
    renderRegistrations();
  };

  // Approve All Pending online
  if (btnApproveAllPending) {
    btnApproveAllPending.addEventListener('click', async () => {
      const list = getRegistrations();
      const pendingItems = list.filter(r => r.status === 'pending');
      if (pendingItems.length === 0) {
        showToast('No pending applications to approve.');
        return;
      }

      if (!confirm(`Are you sure you want to approve all ${pendingItems.length} pending student applications?`)) return;

      for (const student of pendingItems) {
        if (!student.memberId) {
          const randomSuffix = Math.floor(1000 + Math.random() * 9000);
          student.memberId = `QC-2026-${randomSuffix}`;
        }
        student.status = 'approved';
        student.reviewedAt = Date.now();

        try {
          await fetch('/api/students', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: student.id,
              status: 'approved',
              memberId: student.memberId
            })
          });
        } catch (e) {}

        if (regBroadcastChannel) {
          regBroadcastChannel.postMessage({
            action: 'APPROVE',
            id: student.id,
            memberId: student.memberId,
            student: student,
            timestamp: Date.now()
          });
        }
      }

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
  window.openStudentCardModal = openStudentCardModal;

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

  // ---------------------------------------------------------------------------
  // 10. ADVANCED EVENT MANAGEMENT SYSTEM (Vercel API + Supabase Hybrid)
  // ---------------------------------------------------------------------------

  // Local state cache for fast interactive UI
  let adminEventsCache = [];
  let adminRegistrationsCache = [];
  let html5QrScanner = null;
  let isCameraScanning = false;
  let currentCameraFacing = 'environment';
  let sessionCheckins = [];

  // Helper: Format date string
  const formatEventDate = (dStr) => {
    if (!dStr) return 'TBA';
    try {
      const d = new Date(dStr);
      if (isNaN(d.getTime())) return dStr;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dStr;
    }
  };

  // Helper: Format 12-hour time
  const formatEventTime = (tStr) => {
    if (!tStr) return '';
    try {
      const [h, m] = tStr.split(':');
      const hour = parseInt(h, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedH = hour % 12 || 12;
      return `${formattedH}:${m || '00'} ${ampm}`;
    } catch {
      return tStr;
    }
  };

  // ---------------------------------------------------------------------------
  // ---------------------------------------------------------------------------
  // 10.1 API Fetchers, Supabase Sync & Hybrid Fallbacks
  // ---------------------------------------------------------------------------
  const EVENTS_STORAGE_KEY = 'qc_events_catalog';

  const DEFAULT_EVENTS_CATALOG = [];

  const normalizeEvent = (ev) => {
    if (!ev) return null;
    const title = ev.title || ev.name || 'Untitled Event';
    const date = ev.date || ev.event_date || '';
    const category = (ev.category || ev.event_type || 'Workshop').toLowerCase();
    const event_type = ev.event_type || (category.charAt(0).toUpperCase() + category.slice(1));
    const capacity = parseInt(ev.max_capacity || ev.maximum_slots, 10) || 100;
    const banner = ev.banner_url || ev.cover_image || 'images/event%20images/Pydah%20hackathon.png';
    const isPublished = ev.is_published !== undefined ? Boolean(ev.is_published) : (ev.status === 'PUBLISHED' || ev.status === 'REGISTRATION OPEN');
    const isCalendarVisible = ev.is_calendar_visible !== false;

    return {
      ...ev,
      id: ev.id || `evt-${Date.now()}`,
      name: title,
      title: title,
      date: date,
      event_date: date,
      category: category,
      event_type: event_type,
      badge: ev.badge || `${category.toUpperCase()} // 2026`,
      max_capacity: capacity,
      maximum_slots: capacity,
      banner_url: banner,
      cover_image: banner,
      venue: ev.venue || 'Campus Auditorium',
      start_time: ev.start_time || '10:00:00',
      end_time: ev.end_time || '18:00:00',
      description: ev.description || '',
      status: ev.status || (isPublished ? 'PUBLISHED' : 'DRAFT'),
      is_published: isPublished,
      is_calendar_visible: isCalendarVisible,
      is_registration_open: ev.is_registration_open !== false,
      confirmed_count: ev.confirmed_count || 0,
      waitlist_count: ev.waitlist_count || 0,
      remaining_slots: Math.max(0, capacity - (ev.confirmed_count || 0))
    };
  };

  const getEventsFromStorage = () => {
    try {
      const data = localStorage.getItem(EVENTS_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed.map(normalizeEvent);
      }
    } catch (e) {}
    return null;
  };

  const saveEventsToStorage = (events) => {
    try {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
      localStorage.setItem('qc_events_updated_at', Date.now().toString());
    } catch (e) {}
  };

  const getDeletedEventIds = () => {
    try {
      return new Set(JSON.parse(localStorage.getItem('qc_deleted_event_ids') || '[]'));
    } catch (e) {
      return new Set();
    }
  };

  const fetchEventsData = async () => {
    let eventsList = [];

    // 1. Direct Supabase Client if configured
    if (window.QC_SUPABASE && window.QC_SUPABASE.isConfigured()) {
      try {
        const supaEvents = await window.QC_SUPABASE.getEvents();
        if (Array.isArray(supaEvents) && supaEvents.length > 0) {
          eventsList = supaEvents.map(normalizeEvent);
        }
      } catch (err) {
        console.warn('[Quantum Coders] Supabase client fetch error:', err);
      }
    }

    // 2. Serverless API Endpoint
    if (eventsList.length === 0) {
      try {
        const res = await fetch('/api/events?admin=true');
        if (res.ok) {
          const data = await res.json();
          const rawList = Array.isArray(data) ? data : (data.events || []);
          if (rawList.length > 0) {
            eventsList = rawList.map(normalizeEvent);
          }
        }
      } catch (err) {
        console.warn('API /api/events offline, falling back to local storage:', err);
      }
    }

    // 3. Merge with Local Storage so newly created/edited events are never wiped out
    // 3. Filter out deleted
    eventsList = eventsList.filter(e => e && !e.deleted_at);

    // 4. Default Seed Catalog if completely empty
    if (eventsList.length === 0) {
      eventsList = DEFAULT_EVENTS_CATALOG.map(normalizeEvent).filter(e => e && !e.deleted_at);
    }

    adminEventsCache = eventsList;
    return eventsList;
  };

  // ---------------------------------------------------------------------------
  // 10.2 Dashboard Telemetry Controller
  // ---------------------------------------------------------------------------
  const loadDashboardStats = async () => {
    let stats = {
      totalEvents: 0,
      totalRegistrations: 0,
      confirmedPasses: 0,
      waitlistQueue: 0,
      gateCheckins: 0,
      attendanceRate: '0%',
      openCapacity: 0,
      studentCadre: getRegistrations().length
    };

    try {
      const res = await fetch('/api/admin-stats');
      if (res.ok) {
        const data = await res.json();
        const d = data.stats || data;
        stats.totalEvents = d.total_events !== undefined ? d.total_events : (d.totalEvents || stats.totalEvents);
        stats.totalRegistrations = d.total_registrations !== undefined ? d.total_registrations : (d.totalRegistrations || stats.totalRegistrations);
        stats.confirmedPasses = d.confirmed_registrations !== undefined ? d.confirmed_registrations : (d.confirmedPasses || stats.confirmedPasses);
        stats.waitlistQueue = d.waitlisted_students !== undefined ? d.waitlisted_students : (d.waitlistQueue || stats.waitlistQueue);
        stats.gateCheckins = d.attendance_count !== undefined ? d.attendance_count : (d.gateCheckins || stats.gateCheckins);
        stats.openCapacity = d.available_slots !== undefined ? d.available_slots : (d.openCapacity || stats.openCapacity);
        stats.studentCadre = d.student_cadre !== undefined ? d.student_cadre : stats.studentCadre;
        if (stats.confirmedPasses > 0) {
          stats.attendanceRate = Math.round((stats.gateCheckins / stats.confirmedPasses) * 100) + '%';
        }
      }
    } catch (err) {
      console.warn('Admin stats endpoint offline, calculating from local memory:', err);
      const events = await fetchEventsData();
      stats.totalEvents = events.length;
      let totalCapacity = 0;
      let totalRegs = 0;
      let confirmed = 0;
      let waitlist = 0;

      events.forEach(ev => {
        totalCapacity += (ev.max_capacity || 100);
        totalRegs += (ev.total_registered || 0);
        confirmed += (ev.confirmed_count || 0);
        waitlist += (ev.waitlist_count || 0);
      });

      stats.totalRegistrations = totalRegs;
      stats.confirmedPasses = confirmed;
      stats.waitlistQueue = waitlist;
      stats.openCapacity = Math.max(0, totalCapacity - confirmed);
    }

    // Populate DOM KPIs
    const setElemText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setElemText('kpi-total-events', stats.totalEvents);
    setElemText('kpi-total-regs', stats.totalRegistrations);
    setElemText('kpi-confirmed-passes', stats.confirmedPasses);
    setElemText('kpi-waitlist-queue', stats.waitlistQueue);
    setElemText('kpi-checkins-count', stats.gateCheckins);
    setElemText('kpi-attendance-rate', stats.attendanceRate);
    setElemText('kpi-open-capacity', stats.openCapacity);
    setElemText('kpi-cadre-members', stats.studentCadre || getRegistrations().length);

    // Populate upcoming events list
    const upcomingListEl = document.getElementById('dash-upcoming-events-list');
    if (upcomingListEl) {
      const events = await fetchEventsData();
      if (!events || events.length === 0) {
        upcomingListEl.innerHTML = `
          <div style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--color-gray); padding: 1.5rem; text-align: center; border: 1px dashed var(--border-light);">
            No sprints scheduled yet. Click "+ Create Event" to schedule the first one.
          </div>
        `;
      } else {
        upcomingListEl.innerHTML = events.slice(0, 4).map(ev => {
          const confirmed = ev.confirmed_count || 0;
          const maxSlots = ev.max_capacity || 100;
          const percent = Math.min(100, Math.round((confirmed / maxSlots) * 100));

          const title = ev.title || ev.name || 'Untitled Event';
          const eventDate = ev.event_date || ev.date || '';

          return `
            <div class="dash-event-item">
              <div class="dash-event-top">
                <div>
                  <span class="activity-badge" style="background: rgba(59, 130, 246, 0.15); color: #60A5FA; margin-bottom: 0.3rem; display: inline-block;">
                    ${ev.badge || (ev.category || 'WORKSHOP').toUpperCase()}
                  </span>
                  <h4 class="dash-event-title">${escapeHtml(title)}</h4>
                  <div style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--color-gray); margin-top: 0.2rem;">
                    📅 ${formatEventDate(eventDate)} • ⏰ ${formatEventTime(ev.start_time)} • 📍 ${escapeHtml(ev.venue || 'Campus')}
                  </div>
                </div>
                <button type="button" class="btn-brutalist btn-secondary btn-sm" onclick="switchConsoleTab('event-reg'); filterPassesByEvent('${ev.id}')">
                  Passes (${confirmed}) →
                </button>
              </div>

              <div class="capacity-track" style="height: 6px;">
                <div class="capacity-fill ${percent >= 100 ? 'fill-full' : percent >= 80 ? 'fill-warning' : ''}" style="width: ${percent}%;"></div>
              </div>
              <div style="display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 0.7rem; color: #9CA3AF;">
                <span>${confirmed} / ${maxSlots} Registered (${percent}%)</span>
                <span>${Math.max(0, maxSlots - confirmed)} Slots Left</span>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // Populate Activity Stream
    const activityEl = document.getElementById('dash-activity-log');
    if (activityEl) {
      if (sessionCheckins.length === 0) {
        activityEl.innerHTML = `
          <div class="dash-activity-item" style="border-left: 3px solid var(--color-green);">
            <div style="font-size: 1.2rem;">🟢</div>
            <div>
              <div style="font-family: var(--font-heading); font-size: 0.95rem; color: #FFFFFF;">GATE SCANNER READY</div>
              <div style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--color-gray);">Camera optical receiver is primed for attendee pass verification.</div>
            </div>
          </div>
          <div class="dash-activity-item" style="border-left: 3px solid var(--color-blue);">
            <div style="font-size: 1.2rem;">⚡</div>
            <div>
              <div style="font-family: var(--font-heading); font-size: 0.95rem; color: #FFFFFF;">SYSTEM HYBRID CLOUD ACTIVE</div>
              <div style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--color-gray);">Serverless APIs &amp; local mirrors synchronized.</div>
            </div>
          </div>
        `;
      } else {
        activityEl.innerHTML = sessionCheckins.slice(0, 5).map(item => `
          <div class="dash-activity-item" style="border-left: 3px solid ${item.isDuplicate ? '#EF4444' : '#10B981'};">
            <div style="font-size: 1.1rem;">${item.isDuplicate ? '⚠️' : '✓'}</div>
            <div style="flex: 1;">
              <div style="display: flex; justify-content: space-between; font-family: var(--font-heading); font-size: 0.92rem;">
                <span style="color: #FFFFFF;">${escapeHtml(item.name)}</span>
                <span style="font-family: var(--font-mono); font-size: 0.7rem; color: #9CA3AF;">${item.time}</span>
              </div>
              <div style="font-family: var(--font-mono); font-size: 0.72rem; color: ${item.isDuplicate ? '#F87171' : 'var(--color-gray)'};">
                ${escapeHtml(item.event)} • ${item.isDuplicate ? 'Duplicate scan detected' : 'Gate check-in recorded'}
              </div>
            </div>
          </div>
        `).join('');
      }
    }
  };

  // Dashboard Action buttons
  const dashBtnCreateEvent = document.getElementById('dash-btn-create-event');
  const dashBtnOpenScanner = document.getElementById('dash-btn-open-scanner');
  const dashBtnExportAll = document.getElementById('dash-btn-export-all');

  if (dashBtnCreateEvent) dashBtnCreateEvent.addEventListener('click', () => openCreateEventModal());
  if (dashBtnOpenScanner) dashBtnOpenScanner.addEventListener('click', () => {
    switchConsoleTab('scanner');
    setTimeout(() => startCameraScanner(), 300);
  });
  if (dashBtnExportAll) dashBtnExportAll.addEventListener('click', () => {
    window.open('/api/admin-export?type=full_report', '_blank');
  });

  // ---------------------------------------------------------------------------
  // 10.3 Event Management CRUD Controller (view-events)
  // ---------------------------------------------------------------------------
  const eventsMgmtGrid = document.getElementById('events-mgmt-grid');
  const eventMgmtSearch = document.getElementById('event-mgmt-search');
  const eventCrudModal = document.getElementById('event-crud-modal');
  const eventCrudModalClose = document.getElementById('event-crud-modal-close');
  const eventCrudModalCancel = document.getElementById('event-crud-modal-cancel');
  const eventCrudForm = document.getElementById('event-crud-form');
  const btnCreateEventModal = document.getElementById('btn-create-event-modal');
  const customFieldsBuilderList = document.getElementById('custom-fields-builder-list');
  const btnAddCustomField = document.getElementById('btn-add-custom-field');
  const eventEditWarningBox = document.getElementById('event-edit-warning-box');
  const eventEditWarningMsg = document.getElementById('event-edit-warning-msg');

  let activeEventFilter = 'all';
  let activeEventSearch = '';
  let editingCustomFields = [];

  const loadAdminEvents = async () => {
    const events = await fetchEventsData();
    renderAdminEventsGrid(events);
  };

  const renderAdminEventsGrid = (events) => {
    if (!eventsMgmtGrid) return;

    const query = activeEventSearch.toLowerCase().trim();
    const filtered = (events || []).filter(ev => {
      if (!ev) return false;
      const title = (ev.title || ev.name || '').toLowerCase();
      const badge = (ev.badge || '').toLowerCase();
      const venue = (ev.venue || '').toLowerCase();
      const desc = (ev.description || '').toLowerCase();
      const matchFilter = activeEventFilter === 'all' || ev.status === activeEventFilter;
      const matchQuery = !query ||
        title.includes(query) ||
        badge.includes(query) ||
        venue.includes(query) ||
        desc.includes(query);
      return matchFilter && matchQuery;
    });

    if (filtered.length === 0) {
      eventsMgmtGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; border: 1.5px dashed var(--border-medium); border-radius: 4px;">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📅</div>
          <h3 style="font-family: var(--font-heading); font-size: 1.3rem;">NO EVENTS FOUND</h3>
          <p style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--color-gray); margin-bottom: 1.25rem;">
            No events match the selected criteria [${activeEventFilter.toUpperCase()}].
          </p>
          <button type="button" class="btn-brutalist btn-primary" onclick="openCreateEventModal()">
            + Create New Event
          </button>
        </div>
      `;
      return;
    }

    eventsMgmtGrid.innerHTML = filtered.map(ev => {
      const confirmed = ev.confirmed_count || 0;
      const maxSlots = ev.max_capacity || ev.maximum_slots || 100;
      const percent = Math.min(100, Math.round((confirmed / maxSlots) * 100));
      const remaining = Math.max(0, maxSlots - confirmed);
      const isDraft = ev.status === 'DRAFT';
      const isCompleted = ev.status === 'COMPLETED';
      const isCancelled = ev.status === 'CANCELLED';

      let statusBadgeClass = 'badge-confirmed';
      if (isDraft) statusBadgeClass = 'badge-absent';
      if (isCancelled) statusBadgeClass = 'badge-cancelled';
      if (isCompleted) statusBadgeClass = 'badge-waitlist';

      const coverImg = ev.cover_image || ev.banner_url || '../assets/gallery/moment_1.svg';
      const title = ev.title || ev.name || 'Untitled Event';
      const eventDate = ev.event_date || ev.date || '';

      return `
        <div class="event-mgmt-card" data-event-id="${ev.id}">
          <img src="${coverImg}" alt="${escapeHtml(title)}" class="event-mgmt-cover" onerror="this.src='../assets/gallery/moment_1.svg'">
          <div class="event-mgmt-body">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span class="activity-badge" style="background: rgba(59, 130, 246, 0.15); color: #60A5FA;">
                ${ev.badge || (ev.category || 'WORKSHOP').toUpperCase()}
              </span>
              <span class="status-badge ${statusBadgeClass}">${ev.status || 'PUBLISHED'}</span>
            </div>

            <h3 style="font-family: var(--font-heading); font-size: 1.25rem; margin-bottom: 0.4rem; color: #FFFFFF;">
              ${escapeHtml(title)}
            </h3>

            <div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--color-gray); margin-bottom: 0.8rem;">
              📅 ${formatEventDate(eventDate)} • ⏰ ${formatEventTime(ev.start_time)}<br>
              📍 ${escapeHtml(ev.venue || 'Pydah Main Campus')}
            </div>

            <!-- Capacity Progress Tracker -->
            <div class="capacity-tracker-wrap">
              <div class="capacity-labels">
                <span>Registration Capacity</span>
                <strong style="color: ${remaining === 0 ? '#EF4444' : '#10B981'};">${confirmed} / ${maxSlots}</strong>
              </div>
              <div class="capacity-track">
                <div class="capacity-fill ${percent >= 100 ? 'fill-full' : percent >= 80 ? 'fill-warning' : ''}" style="width: ${percent}%;"></div>
              </div>
              <div style="display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 0.68rem; color: #9CA3AF; margin-top: 0.35rem;">
                <span>${percent}% Filled</span>
                <span>${remaining} Slots Left</span>
              </div>
            </div>

            <div style="display: flex; gap: 0.4rem; flex-wrap: wrap; margin-top: auto; padding-top: 0.75rem; border-top: 1px solid var(--border-light);">
              <button type="button" class="btn-brutalist btn-secondary btn-sm btn-edit-event" data-id="${ev.id}">
                ✎ Edit
              </button>
              <button type="button" class="btn-brutalist btn-secondary btn-sm btn-passes-event" data-id="${ev.id}" onclick="switchConsoleTab('event-reg'); filterPassesByEvent('${ev.id}')">
                🎟️ Passes (${confirmed})
              </button>
              <a href="../event.html?id=${encodeURIComponent(ev.id)}" target="_blank" class="btn-brutalist btn-secondary btn-sm" title="View Public Landing Page">
                👁️ View ↗
              </a>
              <button type="button" class="btn-brutalist btn-danger btn-sm btn-delete-event" data-id="${ev.id}" style="margin-left: auto;" title="Soft Delete Event">
                🗑️
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  };

  // Event Delegation for Event Cards Actions (Edit, Delete, Passes)
  if (eventsMgmtGrid) {
    eventsMgmtGrid.addEventListener('click', (e) => {
      const editBtn = e.target.closest('.btn-edit-event');
      if (editBtn) {
        e.preventDefault();
        e.stopPropagation();
        openEditEventModal(editBtn.dataset.id);
        return;
      }
      const deleteBtn = e.target.closest('.btn-delete-event');
      if (deleteBtn) {
        e.preventDefault();
        e.stopPropagation();
        deleteEventRecord(deleteBtn.dataset.id);
        return;
      }
      const passesBtn = e.target.closest('.btn-passes-event');
      if (passesBtn) {
        e.preventDefault();
        e.stopPropagation();
        switchConsoleTab('event-reg');
        filterPassesByEvent(passesBtn.dataset.id);
        return;
      }
    });
  }

  // Filter Buttons on Events tab
  document.querySelectorAll('[data-event-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-event-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeEventFilter = btn.dataset.eventFilter;
      loadAdminEvents();
    });
  });

  if (eventMgmtSearch) {
    eventMgmtSearch.addEventListener('input', (e) => {
      activeEventSearch = e.target.value;
      loadAdminEvents();
    });
  }

  // Dynamic Custom Questions Builder inside Modal
  const renderCustomFieldsBuilder = () => {
    if (!customFieldsBuilderList) return;

    if (editingCustomFields.length === 0) {
      customFieldsBuilderList.innerHTML = `
        <div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--color-gray); padding: 0.75rem; text-align: center; border: 1px dashed var(--border-light);">
          No custom questions added. Click "+ Add Custom Question" to collect additional data from registrants.
        </div>
      `;
      return;
    }

    customFieldsBuilderList.innerHTML = editingCustomFields.map((field, idx) => `
      <div style="display: flex; gap: 0.5rem; align-items: center; background: #141419; border: 1px solid var(--border-light); padding: 0.6rem; border-radius: 2px;">
        <input type="text" class="admin-input field-label-input" value="${escapeHtml(field.field_label || '')}" placeholder="Question text (e.g. GitHub Profile / Team Name)..." data-index="${idx}" style="flex: 2; padding: 0.4rem 0.6rem; font-size: 0.82rem;" required>
        
        <select class="admin-select field-type-select" data-index="${idx}" style="flex: 1; padding: 0.4rem 0.6rem; font-size: 0.82rem;">
          <option value="text" ${field.field_type === 'text' ? 'selected' : ''}>Text</option>
          <option value="select" ${field.field_type === 'select' ? 'selected' : ''}>Dropdown (Options)</option>
          <option value="number" ${field.field_type === 'number' ? 'selected' : ''}>Number</option>
          <option value="checkbox" ${field.field_type === 'checkbox' ? 'selected' : ''}>Checkbox</option>
        </select>

        ${field.field_type === 'select' ? `
          <input type="text" class="admin-input field-options-input" value="${escapeHtml((field.options || []).join(', '))}" placeholder="Options separated by comma..." data-index="${idx}" style="flex: 2; padding: 0.4rem 0.6rem; font-size: 0.82rem;">
        ` : ''}

        <label style="display: flex; align-items: center; gap: 0.25rem; font-family: var(--font-mono); font-size: 0.72rem; cursor: pointer; white-space: nowrap;">
          <input type="checkbox" class="field-required-checkbox" data-index="${idx}" ${field.is_required ? 'checked' : ''}>
          Req
        </label>

        <button type="button" class="btn-brutalist btn-danger btn-sm field-remove-btn" data-index="${idx}" style="padding: 0.4rem 0.6rem;">
          ✕
        </button>
      </div>
    `).join('');

    // Attach row listeners
    customFieldsBuilderList.querySelectorAll('.field-label-input').forEach(inp => {
      inp.addEventListener('input', (e) => {
        editingCustomFields[parseInt(e.target.dataset.index, 10)].field_label = e.target.value;
      });
    });

    customFieldsBuilderList.querySelectorAll('.field-type-select').forEach(sel => {
      sel.addEventListener('change', (e) => {
        editingCustomFields[parseInt(e.target.dataset.index, 10)].field_type = e.target.value;
        renderCustomFieldsBuilder();
      });
    });

    customFieldsBuilderList.querySelectorAll('.field-options-input').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.index, 10);
        editingCustomFields[idx].options = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
      });
    });

    customFieldsBuilderList.querySelectorAll('.field-required-checkbox').forEach(chk => {
      chk.addEventListener('change', (e) => {
        editingCustomFields[parseInt(e.target.dataset.index, 10)].is_required = e.target.checked;
      });
    });

    customFieldsBuilderList.querySelectorAll('.field-remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.dataset.index, 10);
        editingCustomFields.splice(idx, 1);
        renderCustomFieldsBuilder();
      });
    });
  };

  if (btnAddCustomField) {
    btnAddCustomField.addEventListener('click', () => {
      editingCustomFields.push({
        field_name: `custom_${Date.now()}`,
        field_label: '',
        field_type: 'text',
        is_required: false,
        options: []
      });
      renderCustomFieldsBuilder();
    });
  }

  // Open Create Event Modal
  const openCreateEventModal = () => {
    if (!eventCrudModal || !eventCrudForm) return;
    eventCrudForm.reset();
    document.getElementById('crud-event-id').value = '';
    document.getElementById('crud-modal-title').textContent = 'CREATE NEW EVENT';

    const todayStr = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('crud-event-date');
    if (dateInput && !dateInput.value) dateInput.value = todayStr;
    const startTimeInput = document.getElementById('crud-event-start-time');
    if (startTimeInput && !startTimeInput.value) startTimeInput.value = '10:00';
    const endTimeInput = document.getElementById('crud-event-end-time');
    if (endTimeInput && !endTimeInput.value) endTimeInput.value = '18:00';

    if (eventEditWarningBox) eventEditWarningBox.style.display = 'none';

    editingCustomFields = [];
    renderCustomFieldsBuilder();
    eventCrudModal.classList.add('active');
    eventCrudModal.style.display = 'flex';
  };
  window.openCreateEventModal = openCreateEventModal;

  // Open Edit Event Modal
  const openEditEventModal = async (eventId) => {
    const events = await fetchEventsData();
    const event = (events || []).find(e => String(e.id) === String(eventId)) ||
                  (adminEventsCache || []).find(e => String(e.id) === String(eventId)) ||
                  (getEventsFromStorage() || []).find(e => String(e.id) === String(eventId));
    
    if (!event || !eventCrudModal) {
      showToast('Event details not found', 'error');
      return;
    }

    document.getElementById('crud-event-id').value = event.id;
    document.getElementById('crud-modal-title').textContent = 'EDIT EVENT CONFIGURATION';
    document.getElementById('crud-event-title').value = event.title || event.name || '';
    document.getElementById('crud-event-category').value = (event.category || event.event_type || 'hackathon').toLowerCase();
    document.getElementById('crud-event-badge').value = event.badge || '';
    document.getElementById('crud-event-date').value = event.event_date ? event.event_date.slice(0, 10) : (event.date ? event.date.slice(0, 10) : '');
    document.getElementById('crud-event-start-time').value = event.start_time || '10:00';
    document.getElementById('crud-event-end-time').value = event.end_time || '18:00';
    document.getElementById('crud-event-venue').value = event.venue || '';
    document.getElementById('crud-event-capacity').value = event.max_capacity || event.maximum_slots || 100;
    document.getElementById('crud-event-desc').value = event.description || '';
    document.getElementById('crud-event-cover').value = event.cover_image || event.banner_url || '';
    document.getElementById('crud-event-status').value = event.status || 'PUBLISHED';

    // Show Critical Edit Warning if registrations exist
    const confirmedCount = event.confirmed_count || 0;
    if (confirmedCount > 0 && eventEditWarningBox) {
      eventEditWarningBox.style.display = 'block';
      if (eventEditWarningMsg) {
        eventEditWarningMsg.textContent = `Warning: This event has ${confirmedCount} confirmed attendee passes. Altering date, venue, or reducing capacity will automatically update their live digital passes.`;
      }
    } else if (eventEditWarningBox) {
      eventEditWarningBox.style.display = 'none';
    }

    // Load custom fields
    editingCustomFields = (event.custom_fields && Array.isArray(event.custom_fields))
      ? JSON.parse(JSON.stringify(event.custom_fields))
      : [];
    renderCustomFieldsBuilder();

    eventCrudModal.classList.add('active');
    eventCrudModal.style.display = 'flex';
  };
  window.openEditEventModal = openEditEventModal;

  const closeEventCrudModal = () => {
    if (eventCrudModal) {
      eventCrudModal.classList.remove('active');
      eventCrudModal.style.display = 'none';
    }
  };

  if (btnCreateEventModal) btnCreateEventModal.addEventListener('click', openCreateEventModal);
  if (eventCrudModalClose) eventCrudModalClose.addEventListener('click', closeEventCrudModal);
  if (eventCrudModalCancel) eventCrudModalCancel.addEventListener('click', closeEventCrudModal);
  if (eventCrudModal) {
    eventCrudModal.addEventListener('click', (e) => {
      if (e.target === eventCrudModal) closeEventCrudModal();
    });
  }

  // Handle Event CRUD Form Submit
  if (eventCrudForm) {
    eventCrudForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const eventId = document.getElementById('crud-event-id').value;
      const title = document.getElementById('crud-event-title').value.trim();
      const category = document.getElementById('crud-event-category').value;
      const badge = document.getElementById('crud-event-badge').value.trim();
      const eventDate = document.getElementById('crud-event-date').value;
      const startTime = document.getElementById('crud-event-start-time').value;
      const endTime = document.getElementById('crud-event-end-time').value;
      const venue = document.getElementById('crud-event-venue').value.trim();
      const capacity = parseInt(document.getElementById('crud-event-capacity').value, 10);
      const description = document.getElementById('crud-event-desc').value.trim();
      const coverImage = document.getElementById('crud-event-cover').value.trim();
      const status = document.getElementById('crud-event-status').value;

      if (!title || !eventDate || !startTime || !venue || !capacity) {
        showToast('Please fill in all required fields.', 'error');
        return;
      }

      const mapEventType = (type) => {
        const t = (type || '').toLowerCase();
        if (t.includes('hack')) return 'Hackathon';
        if (t.includes('comp') || t.includes('contest')) return 'Competition';
        if (t.includes('seminar')) return 'Seminar';
        if (t.includes('webinar')) return 'Webinar';
        if (t.includes('meeting') || t.includes('club')) return 'Club Meeting';
        if (t.includes('other')) return 'Other';
        return 'Workshop';
      };

      const generateUuid = () => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
          return crypto.randomUUID();
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = (Math.random() * 16) | 0;
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
      };

      const isNewEvent = !eventId;
      const resolvedId = eventId || generateUuid();

      const normPayload = normalizeEvent({
        id: resolvedId,
        _isNew: isNewEvent,
        is_new_event: isNewEvent,
        name: title,
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        category,
        event_type: mapEventType(category),
        badge: badge || `${category.toUpperCase()} // 2026`,
        date: eventDate,
        event_date: eventDate,
        start_time: startTime.length === 5 ? `${startTime}:00` : startTime,
        end_time: (endTime && endTime.length === 5) ? `${endTime}:00` : (endTime || '18:00:00'),
        venue,
        maximum_slots: capacity,
        max_capacity: capacity,
        description,
        banner_url: coverImage || 'images/event%20images/Pydah%20hackathon.png',
        cover_image: coverImage || 'images/event%20images/Pydah%20hackathon.png',
        status,
        is_published: status !== 'DRAFT',
        is_calendar_visible: true,
        is_registration_open: status !== 'DRAFT' && status !== 'REGISTRATION CLOSED',
        registration_deadline: new Date(eventDate + 'T23:59:59Z').toISOString(),
        custom_fields: editingCustomFields
      });

      // 1. If Supabase is connected, sync to Postgres
      if (window.QC_SUPABASE && window.QC_SUPABASE.isConfigured()) {
        try {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(normPayload.id);
          const dbObj = {
            _isNew: isNewEvent,
            is_new_event: isNewEvent,
            ...(isUuid ? { id: normPayload.id } : {}),
            event_code: (normPayload.slug || normPayload.id || `QC-${Date.now()}`).toUpperCase().substring(0, 50),
            name: normPayload.name,
            description: normPayload.description || 'Quantum Coders Event',
            event_type: mapEventType(normPayload.event_type),
            banner_url: normPayload.banner_url,
            date: normPayload.date,
            start_time: normPayload.start_time,
            end_time: normPayload.end_time || '18:00:00',
            venue: normPayload.venue,
            maximum_slots: normPayload.maximum_slots,
            registration_deadline: normPayload.registration_deadline || new Date(normPayload.date + 'T23:59:59Z').toISOString(),
            status: normPayload.status,
            is_published: normPayload.is_published,
            is_calendar_visible: normPayload.is_calendar_visible,
            is_registration_open: normPayload.is_registration_open,
            is_pass_enabled: true,
            is_gallery_enabled: true
          };
          const savedRow = await window.QC_SUPABASE.upsertEvent(dbObj);
          if (savedRow && savedRow.id) {
            normPayload.id = savedRow.id;
          }
          console.log('[Quantum Coders] Event synced to Supabase database successfully.');
        } catch (err) {
          console.warn('[Quantum Coders] Supabase direct sync error:', err);
        }
      }

      // 2. Call Vercel API endpoint
      try {
        const res = await fetch('/api/events', {
          method: isNewEvent ? 'POST' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(normPayload)
        });
        if (res.ok) {
          const created = await res.json();
          if (created && created.id) {
            normPayload.id = created.id;
          }
        }
      } catch (err) {
        console.info('API /api/events offline, continuing with local shared storage.');
      }

      // 3. Save to shared localStorage (guarantees Home page sees it immediately!)
      const allEvents = getEventsFromStorage() || DEFAULT_EVENTS_CATALOG.map(normalizeEvent);
      if (eventId) {
        const idx = allEvents.findIndex(e => String(e.id) === String(eventId));
        if (idx !== -1) allEvents[idx] = normPayload;
        else allEvents.unshift(normPayload);
      } else {
        allEvents.unshift(normPayload);
      }
      saveEventsToStorage(allEvents);
      adminEventsCache = allEvents;

      // 4. Broadcast instant event update to Home page & other tabs
      try {
        if (typeof BroadcastChannel !== 'undefined') {
          const bc = new BroadcastChannel('qc_events_channel');
          bc.postMessage({ 
            action: 'EVENT_UPDATED', 
            type: 'QC_EVENT_UPDATE', 
            event: normPayload, 
            timestamp: Date.now() 
          });
        }
      } catch (e) {}

      showToast(isNewEvent ? 'Event created and published across website!' : 'Event updated and published across website!', 'success');
      closeEventCrudModal();
      renderAdminEventsGrid(adminEventsCache);
      loadDashboardStats();
    });
  }

  // Permanently Delete Event
  const deleteEventRecord = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event? This will archive it and remove it from the public calendar.')) return;

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(eventId);
    const nowIso = new Date().toISOString();

    // 1. Try Supabase deletion by UUID or event_code
    if (window.QC_SUPABASE && window.QC_SUPABASE.isConfigured()) {
      try {
        const client = window.QC_SUPABASE.getClient();
        if (client) {
          if (isUuid) {
            await client.from('events').update({ deleted_at: nowIso, status: 'CANCELLED' }).eq('id', eventId);
            await client.from('events').delete().eq('id', eventId);
          } else {
            const code = String(eventId).toUpperCase();
            await client.from('events').update({ deleted_at: nowIso, status: 'CANCELLED' }).eq('event_code', code);
            await client.from('events').delete().eq('event_code', code);
          }
        }
      } catch (e) {
        console.warn('Supabase event delete warning:', e);
      }
    }

    // 2. Try Serverless API
    try {
      await fetch(`/api/events?id=${encodeURIComponent(eventId)}`, { method: 'DELETE' });
    } catch (err) {}

    // Update in-memory cache
    const allEvents = (adminEventsCache || []).filter(e => String(e.id) !== String(eventId) && String(e.event_code) !== String(eventId));
    adminEventsCache = allEvents;

    // 5. Broadcast removal
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('qc_events_channel');
        bc.postMessage({ 
          action: 'EVENT_DELETED', 
          type: 'QC_EVENT_DELETE', 
          id: eventId, 
          timestamp: Date.now() 
        });
      }
    } catch (e) {}

    showToast('Event permanently deleted.', 'error');
    renderAdminEventsGrid(adminEventsCache);
    loadDashboardStats();
  };
  window.deleteEventRecord = deleteEventRecord;

  // ---------------------------------------------------------------------------
  // 10.4 Event Passes & Registrations Controller (view-event-registrations)
  // ---------------------------------------------------------------------------
  const eventRegFilterSelect = document.getElementById('event-reg-filter-select');
  const eventRegSearch = document.getElementById('event-reg-search');
  const eventPassesTbody = document.getElementById('event-passes-tbody');
  const btnExportPassesCsv = document.getElementById('btn-export-passes-csv');
  const btnExportWaitlistCsv = document.getElementById('btn-export-waitlist-csv');
  const tabEventRegBadge = document.getElementById('tab-event-reg-badge');

  let activePassFilter = 'all';
  let activePassSearch = '';
  let activePassEventId = 'all';

  const DEFAULT_EVENT_PASSES_SEED = [];

  const loadEventPasses = async () => {
    const events = await fetchEventsData();

    // Populate dropdown
    if (eventRegFilterSelect) {
      const currentVal = eventRegFilterSelect.value;
      eventRegFilterSelect.innerHTML = `<option value="all">-- All Events (${events.length}) --</option>` +
        events.map(ev => `<option value="${ev.id}">${escapeHtml(ev.title || ev.name)}</option>`).join('');
      if (activePassEventId && activePassEventId !== 'all') {
        eventRegFilterSelect.value = activePassEventId;
      } else if (currentVal && currentVal !== 'all') {
        eventRegFilterSelect.value = currentVal;
      }
    }

    let passes = [];

    // 1. Direct Supabase query if configured
    if (window.QC_SUPABASE && window.QC_SUPABASE.isConfigured()) {
      try {
        const client = window.QC_SUPABASE.getClient();
        if (client) {
          let q = client.from('registrations').select('*').order('registered_at', { ascending: false });
          if (activePassEventId && activePassEventId !== 'all') {
            q = q.eq('event_id', activePassEventId);
          }
          const { data, error } = await q;
          if (!error && Array.isArray(data)) {
            passes = data.map(reg => {
              const matchedEv = events.find(ev => String(ev.id) === String(reg.event_id) || String(ev.event_code) === String(reg.event_id));
              return {
                ...reg,
                events: matchedEv || reg.events || { name: 'Quantum Event', date: '', venue: '' }
              };
            });
          }
        }
      } catch (err) {
        console.warn('Supabase pass query notice:', err);
      }
    }

    // 2. Try Serverless /api/register endpoint if Supabase direct returned empty
    if (passes.length === 0) {
      try {
        const regUrl = activePassEventId === 'all' ? '/api/register' : `/api/register?event_id=${encodeURIComponent(activePassEventId)}`;
        const res = await fetch(regUrl);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            passes = data.map(reg => {
              const matchedEv = events.find(ev => String(ev.id) === String(reg.event_id) || String(ev.event_code) === String(reg.event_id));
              return {
                ...reg,
                events: matchedEv || reg.events || { name: 'Quantum Event', date: '', venue: '' }
              };
            });
          }
        }
      } catch (err) {}
    }

    adminRegistrationsCache = passes;
    renderEventPassesTable();
  };

  window.filterPassesByEvent = (eventId) => {
    activePassEventId = eventId;
    if (eventRegFilterSelect) eventRegFilterSelect.value = eventId;
    loadEventPasses();
  };

  if (eventRegFilterSelect) {
    eventRegFilterSelect.addEventListener('change', (e) => {
      activePassEventId = e.target.value;
      loadEventPasses();
    });
  }

  // Filter pills on passes tab
  document.querySelectorAll('[data-pass-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-pass-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activePassFilter = btn.dataset.passFilter;
      renderEventPassesTable();
    });
  });

  if (eventRegSearch) {
    eventRegSearch.addEventListener('input', (e) => {
      activePassSearch = e.target.value;
      renderEventPassesTable();
    });
  }

  const renderEventPassesTable = () => {
    if (!eventPassesTbody) return;

    const query = activePassSearch.toLowerCase().trim();
    const list = adminRegistrationsCache || [];

    // Filter by activePassEventId first
    const eventScopedList = list.filter(reg => {
      if (activePassEventId === 'all') return true;
      return String(reg.event_id) === String(activePassEventId) || 
             String(reg.eventId) === String(activePassEventId);
    });

    const totalCount = eventScopedList.length;
    const confirmedCount = eventScopedList.filter(r => r.status === 'CONFIRMED').length;
    const waitlistCount = eventScopedList.filter(r => r.status === 'WAITLIST').length;
    const cancelledCount = eventScopedList.filter(r => r.status === 'CANCELLED').length;

    // Update Counter strip
    const setEl = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    setEl('reg-stat-total', totalCount);
    setEl('reg-stat-confirmed', confirmedCount);
    setEl('reg-stat-waitlist', waitlistCount);
    setEl('reg-stat-cancelled', cancelledCount);

    if (tabEventRegBadge) {
      tabEventRegBadge.textContent = totalCount;
      tabEventRegBadge.classList.toggle('badge-zero', totalCount === 0);
    }

    const filtered = eventScopedList.filter(reg => {
      const matchFilter = activePassFilter === 'all' || reg.status === activePassFilter;
      const matchSearch = !query ||
        (reg.full_name && reg.full_name.toLowerCase().includes(query)) ||
        (reg.phone && reg.phone.includes(query)) ||
        (reg.email && reg.email.toLowerCase().includes(query)) ||
        (reg.registration_id && reg.registration_id.toLowerCase().includes(query)) ||
        (reg.event_title && reg.event_title.toLowerCase().includes(query));
      return matchFilter && matchSearch;
    });

    if (filtered.length === 0) {
      eventPassesTbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 2.5rem; color: var(--color-gray); font-family: var(--font-mono);">
            No attendee passes found for current filter [${activePassFilter.toUpperCase()}].
          </td>
        </tr>
      `;
      return;
    }

    eventPassesTbody.innerHTML = filtered.map(item => {
      let badgeClass = 'badge-confirmed';
      if (item.status === 'WAITLIST') badgeClass = 'badge-waitlist';
      if (item.status === 'CANCELLED') badgeClass = 'badge-cancelled';

      const regDate = item.registered_at
        ? new Date(item.registered_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        : 'Recent';

      return `
        <tr>
          <td>
            <span class="reg-id-pill">${escapeHtml(item.registration_id)}</span>
          </td>
          <td>
            <strong style="color: #FFFFFF;">${escapeHtml(item.full_name)}</strong>
          </td>
          <td>
            <div style="font-family: var(--font-mono); font-size: 0.78rem;">${escapeHtml(item.phone)}</div>
            <div style="font-size: 0.72rem; color: var(--color-gray);">${escapeHtml(item.email || '')}</div>
          </td>
          <td>
            <span style="font-size: 0.8rem; color: #D1D5DB;">${escapeHtml(item.event_title || 'Sprint')}</span>
          </td>
          <td>
            <span class="status-badge ${badgeClass}">${item.status}</span>
          </td>
          <td style="font-family: var(--font-mono); font-size: 0.8rem;">
            ${item.status === 'CONFIRMED' ? `Slot #${item.slot_number || 1}` : item.status === 'WAITLIST' ? `Queue #${item.waitlist_number || 1}` : '—'}
          </td>
          <td style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--color-gray);">
            ${regDate}
          </td>
          <td style="text-align: right; white-space: nowrap;">
            ${item.status === 'WAITLIST' ? `
              <button type="button" class="btn-brutalist btn-primary btn-sm btn-promote-pass" data-id="${item.id}" style="padding: 0.35rem 0.65rem; font-size: 0.72rem; background: #10B981; border-color: #059669;">
                ✓ Promote
              </button>
            ` : ''}
            <button type="button" class="btn-brutalist btn-secondary btn-sm btn-view-pass" data-reg-id="${item.registration_id}" style="padding: 0.35rem 0.65rem; font-size: 0.72rem;">
              🎫 Pass
            </button>
            <button type="button" class="btn-brutalist btn-danger btn-sm btn-delete-pass" data-id="${item.id || item.registration_id}" style="padding: 0.35rem 0.65rem; font-size: 0.72rem; margin-left: 0.25rem;" title="Delete Pass Record">
              🗑️
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Attach listeners
    eventPassesTbody.querySelectorAll('.btn-promote-pass').forEach(btn => {
      btn.addEventListener('click', () => promoteWaitlistPass(btn.dataset.id));
    });

    eventPassesTbody.querySelectorAll('.btn-view-pass').forEach(btn => {
      btn.addEventListener('click', () => openAdminPassModal(btn.dataset.regId));
    });

    eventPassesTbody.querySelectorAll('.btn-delete-pass').forEach(btn => {
      btn.addEventListener('click', () => deleteEventPass(btn.dataset.id));
    });
  };

  // Permanently Delete Registration Pass
  const deleteEventPass = async (regId) => {
    const item = adminRegistrationsCache.find(r => String(r.id) === String(regId) || String(r.registration_id) === String(regId));
    if (!item) return;

    if (!confirm(`Are you sure you want to permanently delete pass ${item.registration_id} (${item.full_name || item.name})?`)) return;

    // 1. Delete from Supabase public.registrations
    if (window.QC_SUPABASE && window.QC_SUPABASE.isConfigured()) {
      try {
        const client = window.QC_SUPABASE.getClient();
        if (client) {
          await client.from('registrations').delete().or(`id.eq.${item.id},registration_id.eq.${item.registration_id}`);
        }
      } catch (err) {
        console.warn('Supabase delete registration error:', err);
      }
    }

    // 2. Delete via API /api/register
    try {
      await fetch(`/api/register?id=${encodeURIComponent(item.id || item.registration_id)}`, { method: 'DELETE' });
    } catch (e) {}

    // 3. Delete from LocalStorage
    try {
      const storedCatalog = localStorage.getItem('qc_registrations_catalog');
      if (storedCatalog) {
        let parsed = JSON.parse(storedCatalog);
        if (Array.isArray(parsed)) {
          parsed = parsed.filter(r => String(r.id) !== String(item.id) && String(r.registration_id) !== String(item.registration_id));
          localStorage.setItem('qc_registrations_catalog', JSON.stringify(parsed));
        }
      }
    } catch (e) {}

    // 4. Update in-memory cache
    adminRegistrationsCache = adminRegistrationsCache.filter(r => String(r.id) !== String(item.id) && String(r.registration_id) !== String(item.registration_id));

    showToast(`Deleted registration pass ${item.registration_id}.`, 'success');
    renderEventPassesTable();
    loadDashboardStats();
  };

  // Promote Waitlist pass to Confirmed
  const promoteWaitlistPass = async (regDbId) => {
    const item = adminRegistrationsCache.find(r => r.id === regDbId);
    if (!item) return;

    if (!confirm(`Promote ${item.full_name} from waitlist to Confirmed slot?`)) return;

    item.status = 'CONFIRMED';
    showToast(`✓ Promoted ${item.full_name} to Confirmed!`, 'success');
    renderEventPassesTable();
    loadDashboardStats();
  };

  const btnPushPassesSupabase = document.getElementById('btn-push-passes-supabase');
  if (btnPushPassesSupabase) {
    btnPushPassesSupabase.addEventListener('click', async () => {
      if (!window.QC_SUPABASE || !window.QC_SUPABASE.isConfigured()) {
        showToast('Supabase is not connected. Enter Project URL & Anon Key and click "Connect & Save".', 'error');
        return;
      }

      btnPushPassesSupabase.disabled = true;
      btnPushPassesSupabase.textContent = 'Pushing Passes...';

      let pushed = 0;
      try {
        const localRegs = JSON.parse(localStorage.getItem('qc_registrations_catalog') || '[]');
        const localEvents = JSON.parse(localStorage.getItem('qc_events_catalog') || '[]');
        for (const r of localRegs) {
          const evMatch = localEvents.find(e => String(e.id) === String(r.event_id)) || { id: r.event_id, title: 'Quantum Coders Sprint' };
          const res = await window.QC_SUPABASE.submitEventRegistration(r, evMatch);
          if (res && res.success) pushed++;
        }
      } catch (err) {
        console.warn('Push passes exception:', err);
      }

      btnPushPassesSupabase.disabled = false;
      btnPushPassesSupabase.textContent = '⚡ Push Local Passes to Supabase';
      showToast(`Pushed ${pushed} passes to Supabase 'registrations' table!`, 'success');
      loadEventPasses();
    });
  }

  // CSV Exporters
  if (btnExportPassesCsv) {
    btnExportPassesCsv.addEventListener('click', () => {
      const eventParam = activePassEventId !== 'all' ? `&eventId=${activePassEventId}` : '';
      window.open(`/api/admin-export?type=registrations${eventParam}`, '_blank');
    });
  }

  if (btnExportWaitlistCsv) {
    btnExportWaitlistCsv.addEventListener('click', () => {
      const eventParam = activePassEventId !== 'all' ? `&eventId=${activePassEventId}` : '';
      window.open(`/api/admin-export?type=waitlist${eventParam}`, '_blank');
    });
  }

  // ---------------------------------------------------------------------------
  // 10.5 Admin Pass Viewer Modal
  // ---------------------------------------------------------------------------
  const adminPassModal = document.getElementById('admin-pass-modal');
  const adminPassModalClose = document.getElementById('admin-pass-modal-close');
  const adminModalPassCard = document.getElementById('admin-modal-pass-card');
  const btnPrintAdminPass = document.getElementById('btn-print-admin-pass');

  const openAdminPassModal = (registrationId) => {
    const reg = adminRegistrationsCache.find(r => r.registration_id === registrationId);
    if (!reg || !adminPassModal || !adminModalPassCard) return;

    const qrData = JSON.stringify({
      reg_id: reg.registration_id,
      phone: reg.phone,
      event_id: reg.event_id,
      hash: reg.verification_hash || 'SECURE_HASH'
    });

    adminModalPassCard.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1.5px dashed var(--border-medium); padding-bottom: 1rem; margin-bottom: 1rem;">
        <div>
          <div style="font-family: var(--font-mono); font-size: 0.68rem; color: var(--color-blue); letter-spacing: 0.15em;">QUANTUM CODERS // EVENT PASS</div>
          <h3 style="font-family: var(--font-heading); font-size: 1.3rem; margin: 0.2rem 0; color: #FFFFFF;">${escapeHtml(reg.event_title || 'Sprint')}</h3>
        </div>
        <span class="reg-id-pill" style="font-size: 0.85rem;">${escapeHtml(reg.registration_id)}</span>
      </div>

      <div style="display: flex; gap: 1.5rem; align-items: center; margin-bottom: 1rem;">
        <div id="admin-pass-qr-canvas" style="background: #FFFFFF; padding: 8px; border-radius: 4px; width: 130px; height: 130px; display: flex; align-items: center; justify-content: center;"></div>
        <div>
          <div style="font-family: var(--font-heading); font-size: 1.2rem; color: #FFFFFF;">${escapeHtml(reg.full_name)}</div>
          <div style="font-family: var(--font-mono); font-size: 0.78rem; color: var(--color-gray); margin-top: 0.2rem;">${escapeHtml(reg.phone)}</div>
          <div style="margin-top: 0.5rem;">
            <span class="status-badge ${reg.status === 'CONFIRMED' ? 'badge-confirmed' : 'badge-waitlist'}">${reg.status}</span>
            <span style="font-family: var(--font-mono); font-size: 0.75rem; color: #9CA3AF; margin-left: 0.5rem;">
              ${reg.status === 'CONFIRMED' ? `Slot #${reg.slot_number || 1}` : `Waitlist #${reg.waitlist_number || 1}`}
            </span>
          </div>
        </div>
      </div>

      <div style="font-family: var(--font-mono); font-size: 0.68rem; color: var(--color-gray); border-top: 1px solid var(--border-light); padding-top: 0.75rem; display: flex; justify-content: space-between;">
        <span>PRESIDENT: PRAVEEN</span>
        <span>VERIFIED PASS // PYDAH CE</span>
      </div>
    `;

    // Render QR Code inside modal
    setTimeout(() => {
      const qrContainer = document.getElementById('admin-pass-qr-canvas');
      if (qrContainer && typeof QRCode !== 'undefined') {
        qrContainer.innerHTML = '';
        QRCode.toCanvas(qrData, { width: 114, margin: 1 }, (err, canvas) => {
          if (!err && canvas) qrContainer.appendChild(canvas);
        });
      }
    }, 60);

    adminPassModal.classList.add('active');
    adminPassModal.style.display = 'flex';
  };
  window.openAdminPassModal = openAdminPassModal;

  const closeAdminPassModal = () => {
    if (adminPassModal) {
      adminPassModal.classList.remove('active');
      adminPassModal.style.display = 'none';
    }
  };

  if (adminPassModalClose) adminPassModalClose.addEventListener('click', closeAdminPassModal);
  if (adminPassModal) {
    adminPassModal.addEventListener('click', (e) => {
      if (e.target === adminPassModal) closeAdminPassModal();
    });
  }
  if (btnPrintAdminPass) {
    btnPrintAdminPass.addEventListener('click', () => window.print());
  }

  // ---------------------------------------------------------------------------
  // 10.6 QR Scanner & Camera Validation Controller (view-scanner)
  // ---------------------------------------------------------------------------
  const btnToggleScanner = document.getElementById('btn-toggle-scanner');
  const btnSwitchCamera = document.getElementById('btn-switch-camera');
  const cameraStatusPill = document.getElementById('camera-status-pill');
  const viewportPlaceholder = document.getElementById('viewport-placeholder');
  const manualVerifyForm = document.getElementById('manual-verify-form');
  const manualVerifyInput = document.getElementById('manual-verify-input');
  const scanResultCard = document.getElementById('scan-result-card');
  const scanStatusChip = document.getElementById('scan-status-chip');
  const scanResultBody = document.getElementById('scan-result-body');
  const scanResultFooter = document.getElementById('scan-result-footer');
  const sessionCheckinCount = document.getElementById('session-checkin-count');
  const sessionCheckinsList = document.getElementById('session-checkins-list');

  // Start Camera Scanner
  const startCameraScanner = async () => {
    if (isCameraScanning) return;

    if (typeof Html5Qrcode === 'undefined') {
      showToast('Camera QR library not loaded. Please use manual entry.', 'error');
      return;
    }

    try {
      if (viewportPlaceholder) viewportPlaceholder.style.display = 'none';
      if (!html5QrScanner) {
        html5QrScanner = new Html5Qrcode('qr-camera-viewport');
      }

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      await html5QrScanner.start(
        { facingMode: currentCameraFacing },
        config,
        (decodedText) => onQrCodeScanned(decodedText),
        (errorMessage) => {} // ignore frame scan errors
      );

      isCameraScanning = true;
      if (btnToggleScanner) btnToggleScanner.textContent = '⏹ Stop Camera';
      if (btnSwitchCamera) btnSwitchCamera.style.display = 'inline-flex';
      if (cameraStatusPill) {
        cameraStatusPill.textContent = 'CAMERA STREAMING';
        cameraStatusPill.style.color = '#10B981';
      }
      showToast('Camera active. Point at attendee QR code.', 'success');
    } catch (err) {
      console.error('Error starting camera scanner:', err);
      showToast(`Camera permission error: ${err.message || 'Check browser permissions'}`, 'error');
      if (viewportPlaceholder) viewportPlaceholder.style.display = 'block';
    }
  };

  // Stop Camera Scanner
  const stopCameraScanner = async () => {
    if (!isCameraScanning || !html5QrScanner) return;
    try {
      await html5QrScanner.stop();
      isCameraScanning = false;
      if (btnToggleScanner) btnToggleScanner.textContent = '📷 Start Camera Scanner';
      if (btnSwitchCamera) btnSwitchCamera.style.display = 'none';
      if (cameraStatusPill) {
        cameraStatusPill.textContent = 'CAMERA IDLE';
        cameraStatusPill.style.color = 'var(--color-gray)';
      }
      if (viewportPlaceholder) viewportPlaceholder.style.display = 'block';
    } catch (err) {
      console.warn('Error stopping camera:', err);
    }
  };
  window.startCameraScanner = startCameraScanner;
  window.stopCameraScanner = stopCameraScanner;

  if (btnToggleScanner) {
    btnToggleScanner.addEventListener('click', () => {
      if (isCameraScanning) {
        stopCameraScanner();
      } else {
        startCameraScanner();
      }
    });
  }

  if (btnSwitchCamera) {
    btnSwitchCamera.addEventListener('click', async () => {
      currentCameraFacing = currentCameraFacing === 'environment' ? 'user' : 'environment';
      await stopCameraScanner();
      await startCameraScanner();
    });
  }

  // Verification Logic on Scan / Lookup
  const onQrCodeScanned = async (decodedText) => {
    // Briefly pause camera
    try {
      if (html5QrScanner && html5QrScanner.pause) {
        html5QrScanner.pause(true);
      }
    } catch {}

    await verifyAttendeePass(decodedText, false);

    // Auto resume scanner after 3 seconds
    setTimeout(() => {
      try {
        if (html5QrScanner && html5QrScanner.resume) {
          html5QrScanner.resume();
        }
      } catch {}
    }, 3200);
  };

  const verifyAttendeePass = async (queryPayload, adminConfirmed = false) => {
    if (scanStatusChip) {
      scanStatusChip.textContent = 'VERIFYING...';
      scanStatusChip.style.color = '#F59E0B';
    }

    let payload = { admin_confirmed: adminConfirmed };
    // Check if JSON payload
    try {
      const parsed = JSON.parse(queryPayload);
      payload = { ...payload, ...parsed };
    } catch {
      // String ID or Phone
      if (queryPayload.length === 10 && /^\d+$/.test(queryPayload)) {
        payload.phone = queryPayload;
      } else {
        payload.registration_id = queryPayload.trim();
      }
    }

    try {
      const res = await fetch('/api/verify-pass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      displayScanVerificationResult(data, queryPayload);
    } catch (err) {
      console.warn('Verification API offline, running client fallback check:', err);
      clientFallbackVerify(queryPayload, adminConfirmed);
    }
  };

  const displayScanVerificationResult = (data, originalQuery) => {
    if (!scanResultBody) return;

    if (data.duplicate_checkin) {
      // DUPLICATE DETECTED
      if (scanStatusChip) {
        scanStatusChip.textContent = 'DUPLICATE ALERT';
        scanStatusChip.style.color = '#EF4444';
      }

      scanResultBody.innerHTML = `
        <div class="duplicate-alert-banner">
          <div style="font-family: var(--font-heading); font-size: 1.2rem; color: #EF4444; margin-bottom: 0.35rem;">
            ⚠️ DUPLICATE CHECK-IN DETECTED!
          </div>
          <div style="font-family: var(--font-mono); font-size: 0.8rem; color: #FCA5A5; line-height: 1.5;">
            Attendee <strong>${escapeHtml(data.registration.full_name)}</strong> was ALREADY checked in at 
            <strong>${data.existing_checkin.checked_in_at ? new Date(data.existing_checkin.checked_in_at).toLocaleTimeString() : 'Earlier'}</strong>!
          </div>
        </div>

        <div style="padding: 1rem; background: #141419; border: 1px solid var(--border-medium); border-radius: 2px;">
          <div style="font-family: var(--font-heading); font-size: 1.15rem; color: #FFFFFF;">${escapeHtml(data.registration.full_name)}</div>
          <div style="font-family: var(--font-mono); font-size: 0.78rem; color: var(--color-gray); margin: 0.25rem 0;">
            ${escapeHtml(data.registration.registration_id)} • ${escapeHtml(data.registration.phone)}
          </div>
          <div style="font-family: var(--font-mono); font-size: 0.75rem; color: #9CA3AF;">
            Event: ${escapeHtml(data.event.title)} (Slot #${data.registration.slot_number || 1})
          </div>
        </div>
      `;

      if (scanResultFooter) {
        scanResultFooter.style.display = 'flex';
        scanResultFooter.innerHTML = `
          <button type="button" class="btn-brutalist btn-primary" id="btn-force-checkin" style="width: 100%; justify-content: center; background: #DC2626; border-color: #B91C1C;">
            ⚠️ Admin Override: Confirm Re-Admit
          </button>
        `;
        document.getElementById('btn-force-checkin').addEventListener('click', () => {
          verifyAttendeePass(originalQuery, true);
        });
      }

      recordSessionCheckin({
        name: data.registration.full_name,
        event: data.event.title,
        time: new Date().toLocaleTimeString(),
        isDuplicate: true
      });
      return;
    }

    if (data.success && data.registration) {
      // SUCCESSFUL CHECK-IN
      if (scanStatusChip) {
        scanStatusChip.textContent = '✓ VERIFIED PRESENT';
        scanStatusChip.style.color = '#10B981';
      }

      scanResultBody.innerHTML = `
        <div style="padding: 1.25rem; background: rgba(16, 185, 129, 0.12); border: 2px solid #10B981; border-radius: 4px; margin-bottom: 1rem; text-align: center;">
          <div style="font-size: 2.5rem; margin-bottom: 0.35rem;">✓</div>
          <div style="font-family: var(--font-heading); font-size: 1.3rem; color: #34D399; margin-bottom: 0.2rem;">
            CHECK-IN CONFIRMED
          </div>
          <div style="font-family: var(--font-mono); font-size: 0.78rem; color: #A7F3D0;">
            Recorded at ${new Date().toLocaleTimeString()}
          </div>
        </div>

        <div style="padding: 1.25rem; background: #141419; border: 1px solid var(--border-medium); border-radius: 2px;">
          <div style="font-family: var(--font-heading); font-size: 1.3rem; color: #FFFFFF;">${escapeHtml(data.registration.full_name)}</div>
          <div style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--color-blue); margin: 0.3rem 0;">
            PASS: ${escapeHtml(data.registration.registration_id)} • SLOT #${data.registration.slot_number || 1}
          </div>
          <div style="font-family: var(--font-mono); font-size: 0.78rem; color: var(--color-gray);">
            ${escapeHtml(data.event.title)}<br>
            Phone: ${escapeHtml(data.registration.phone)}
          </div>
        </div>
      `;

      if (scanResultFooter) scanResultFooter.style.display = 'none';

      recordSessionCheckin({
        name: data.registration.full_name,
        event: data.event.title,
        time: new Date().toLocaleTimeString(),
        isDuplicate: false
      });
      loadDashboardStats();
      return;
    }

    // ERROR / WAITLIST / CANCELLED
    if (scanStatusChip) {
      scanStatusChip.textContent = 'CHECK-IN BLOCKED';
      scanStatusChip.style.color = '#EF4444';
    }

    scanResultBody.innerHTML = `
      <div style="padding: 1.25rem; background: rgba(239, 68, 68, 0.12); border: 1.5px solid #EF4444; border-radius: 4px; text-align: center;">
        <div style="font-size: 2.5rem; margin-bottom: 0.35rem;">🚫</div>
        <div style="font-family: var(--font-heading); font-size: 1.2rem; color: #EF4444; margin-bottom: 0.4rem;">
          ${escapeHtml(data.message || 'Pass verification rejected')}
        </div>
        <p style="font-family: var(--font-mono); font-size: 0.78rem; color: #FCA5A5;">
          ${data.status === 'WAITLIST' ? 'Attendee is currently on the waitlist. Promote to Confirmed slot before check-in.' : 'Please inspect registration status in the Passes tab.'}
        </p>
      </div>
    `;
    if (scanResultFooter) scanResultFooter.style.display = 'none';
  };

  // Client Fallback Check
  const clientFallbackVerify = (query, adminConfirmed) => {
    const list = adminRegistrationsCache || [];
    const q = query.trim().toUpperCase();
    const reg = list.find(r => r.registration_id === q || r.phone === q);

    if (!reg) {
      displayScanVerificationResult({ success: false, message: 'Registration record not found.' }, query);
      return;
    }

    // Check if already checked in locally
    const existing = sessionCheckins.find(c => c.name === reg.full_name && !c.isDuplicate);
    if (existing && !adminConfirmed) {
      displayScanVerificationResult({
        duplicate_checkin: true,
        registration: reg,
        event: { title: reg.event_title || 'Sprint' },
        existing_checkin: { checked_in_at: Date.now() - 60000 }
      }, query);
      return;
    }

    displayScanVerificationResult({
      success: true,
      registration: reg,
      event: { title: reg.event_title || 'Sprint' }
    }, query);
  };

  const recordSessionCheckin = (item) => {
    sessionCheckins.unshift(item);
    if (sessionCheckinCount) sessionCheckinCount.textContent = `${sessionCheckins.length} Verified`;
    if (sessionCheckinsList) {
      sessionCheckinsList.innerHTML = sessionCheckins.slice(0, 10).map(c => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.45rem 0.65rem; background: #141419; border-left: 2px solid ${c.isDuplicate ? '#EF4444' : '#10B981'}; font-family: var(--font-mono); font-size: 0.72rem;">
          <span style="color: #FFFFFF;">${escapeHtml(c.name)}</span>
          <span style="color: #9CA3AF;">${c.time}</span>
        </div>
      `).join('');
    }
  };

  // Manual Verify Form
  if (manualVerifyForm) {
    manualVerifyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = (manualVerifyInput ? manualVerifyInput.value : '').trim();
      if (!val) return;
      verifyAttendeePass(val, false);
      if (manualVerifyInput) manualVerifyInput.value = '';
    });
  }

  // ---------------------------------------------------------------------------
  // 10.7 Attendance Register Controller (view-attendance)
  // ---------------------------------------------------------------------------
  const attendanceEventSelect = document.getElementById('attendance-event-select');
  const attendanceSearchInput = document.getElementById('attendance-search-input');
  const attendanceTbody = document.getElementById('attendance-tbody');
  const btnExportAttendanceCsv = document.getElementById('btn-export-attendance-csv');

  let activeAttFilter = 'all';
  let activeAttSearch = '';
  let activeAttEventId = 'all';

  const loadAttendanceRegister = async () => {
    const events = await fetchEventsData();
    if (attendanceEventSelect) {
      const cur = attendanceEventSelect.value;
      attendanceEventSelect.innerHTML = `<option value="all">-- All Events (${events.length}) --</option>` +
        events.map(ev => `<option value="${ev.id}">${escapeHtml(ev.title)}</option>`).join('');
      if (cur && cur !== 'all') attendanceEventSelect.value = cur;
    }

    renderAttendanceTable();
  };

  if (attendanceEventSelect) {
    attendanceEventSelect.addEventListener('change', (e) => {
      activeAttEventId = e.target.value;
      renderAttendanceTable();
    });
  }

  document.querySelectorAll('[data-att-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-att-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeAttFilter = btn.dataset.attFilter;
      renderAttendanceTable();
    });
  });

  if (attendanceSearchInput) {
    attendanceSearchInput.addEventListener('input', (e) => {
      activeAttSearch = e.target.value;
      renderAttendanceTable();
    });
  }

  const renderAttendanceTable = () => {
    if (!attendanceTbody) return;

    let list = (adminRegistrationsCache || []).filter(r => r.status === 'CONFIRMED');
    if (activeAttEventId !== 'all') {
      list = list.filter(r => r.event_id === activeAttEventId);
    }

    const query = activeAttSearch.toLowerCase().trim();
    const totalReg = list.length;
    // Map with checked in state from session
    const checkedInNames = new Set(sessionCheckins.map(s => s.name));
    const presentCount = list.filter(r => r.is_present || checkedInNames.has(r.full_name)).length;
    const absentCount = Math.max(0, totalReg - presentCount);
    const turnoutRate = totalReg > 0 ? Math.round((presentCount / totalReg) * 100) : 0;

    const setE = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.textContent = v;
    };
    setE('att-count-registered', totalReg);
    setE('att-count-present', presentCount);
    setE('att-count-absent', absentCount);
    setE('att-count-rate', `${turnoutRate}%`);

    const filtered = list.filter(item => {
      const isPresent = item.is_present || checkedInNames.has(item.full_name);
      const matchFilter = activeAttFilter === 'all' ||
        (activeAttFilter === 'PRESENT' && isPresent) ||
        (activeAttFilter === 'ABSENT' && !isPresent);

      const matchSearch = !query ||
        item.full_name.toLowerCase().includes(query) ||
        item.phone.includes(query) ||
        item.registration_id.toLowerCase().includes(query);

      return matchFilter && matchSearch;
    });

    if (filtered.length === 0) {
      attendanceTbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 2.5rem; color: var(--color-gray); font-family: var(--font-mono);">
            No attendance records match filter.
          </td>
        </tr>
      `;
      return;
    }

    attendanceTbody.innerHTML = filtered.map(item => {
      const isPresent = item.is_present || checkedInNames.has(item.full_name);
      const statusBadge = isPresent
        ? `<span class="status-badge badge-present">✓ PRESENT</span>`
        : `<span class="status-badge badge-absent">ABSENT</span>`;

      return `
        <tr>
          <td><span class="reg-id-pill">${escapeHtml(item.registration_id)}</span></td>
          <td><strong style="color: #FFFFFF;">${escapeHtml(item.full_name)}</strong></td>
          <td style="font-family: var(--font-mono); font-size: 0.75rem;">${escapeHtml(item.phone)}</td>
          <td style="font-size: 0.78rem; color: #D1D5DB;">${escapeHtml(item.event_title || 'Sprint')}</td>
          <td>${statusBadge}</td>
          <td style="font-family: var(--font-mono); font-size: 0.75rem; color: #9CA3AF;">
            ${isPresent ? 'Verified Today' : '—'}
          </td>
          <td style="font-family: var(--font-mono); font-size: 0.72rem; color: #9CA3AF;">
            ${isPresent ? 'QR_SCANNER' : '—'}
          </td>
          <td style="text-align: right;">
            <button type="button" class="btn-brutalist btn-secondary btn-sm btn-toggle-presence" data-name="${escapeHtml(item.full_name)}" style="padding: 0.35rem 0.65rem; font-size: 0.72rem;">
              ${isPresent ? 'Mark Absent' : '✓ Mark Present'}
            </button>
          </td>
        </tr>
      `;
    }).join('');

    attendanceTbody.querySelectorAll('.btn-toggle-presence').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.dataset.name;
        if (checkedInNames.has(name)) {
          sessionCheckins = sessionCheckins.filter(s => s.name !== name);
        } else {
          sessionCheckins.unshift({
            name,
            event: 'Manual Entry',
            time: new Date().toLocaleTimeString(),
            isDuplicate: false
          });
        }
        renderAttendanceTable();
        loadDashboardStats();
      });
    });
  };

  if (btnExportAttendanceCsv) {
    btnExportAttendanceCsv.addEventListener('click', (e) => {
      e.preventDefault();
      let list = (adminRegistrationsCache || []).filter(r => r.status === 'CONFIRMED');
      if (activeAttEventId !== 'all') {
        list = list.filter(r => r.event_id === activeAttEventId);
      }
      const checkedInNames = new Set(sessionCheckins.map(s => s.name));

      if (list.length === 0) {
        showToast('No confirmed attendee records to export.', 'error');
        return;
      }

      const headers = ['Registration ID', 'Attendee Name', 'Phone', 'Email', 'Event', 'Attendance Status', 'Verified Method', 'Timestamp'];
      const rows = list.map(r => {
        const isPresent = r.is_present || checkedInNames.has(r.full_name);
        return [
          `"${r.registration_id || ''}"`,
          `"${(r.full_name || '').replace(/"/g, '""')}"`,
          `"${r.phone || ''}"`,
          `"${r.email || ''}"`,
          `"${(r.event_title || '').replace(/"/g, '""')}"`,
          `"${isPresent ? 'PRESENT' : 'ABSENT'}"`,
          `"${isPresent ? 'QR_SCANNER' : 'NONE'}"`,
          `"${isPresent ? new Date().toISOString() : ''}"`
        ];
      });

      downloadCsvData(`qc_attendance_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
      showToast(`✓ Exported attendance register for ${list.length} attendees!`, 'success');
    });
  }

  // ---------------------------------------------------------------------------
  // 10.8 Website Section Controls Controller (view-settings)
  // ---------------------------------------------------------------------------
  const sectionTogglesContainer = document.getElementById('section-toggles-container');
  const btnSaveSectionsConfig = document.getElementById('btn-save-sections-config');
  const btnCopySchemaSql = document.getElementById('btn-copy-schema-sql');

  const SECTIONS_METADATA = [
    { key: 'hero', name: '01. HERO INTRO', desc: 'Main landing visual, badge, and primary CTA banner' },
    { key: 'about', name: '02. ABOUT // CADRE DIRECTIVE', desc: 'Core mission, vision, and principles dossier' },
    { key: 'events', name: '03. UPCOMING SPRINTS', desc: 'Next scheduled bootcamps, dates, and venues' },
    { key: 'calendar', name: '03.5 MONTHLY CALENDAR', desc: 'Interactive monthly grid view of scheduled club sprints' },
    { key: 'gallery', name: '04. GALLERY ARCHIVES', desc: 'Multi-image photos and embedded video moments' },
    { key: 'cadre', name: '05. CADRE ADMISSIONS', desc: 'Student member application intake form' },
    { key: 'team', name: '06. CORE CADRE TEAM', desc: 'President, Vice President, and Lead profiles' },
    { key: 'achievements', name: '07. ACHIEVEMENTS & METRICS', desc: 'Hackathon podiums and track record numbers' },
    { key: 'contact', name: '08. CONTACT & COORDINATES', desc: 'Email, campus address, and WhatsApp leads' }
  ];

  let currentSectionsState = {};

  const loadSectionToggles = async () => {
    if (!sectionTogglesContainer) return;

    try {
      const res = await fetch('/api/sections');
      if (res.ok) {
        const data = await res.json();
        if (data.sections) {
          currentSectionsState = data.sections;
        }
      }
    } catch {
      // Local fallback
      try {
        const saved = localStorage.getItem('qc_section_toggles');
        if (saved) currentSectionsState = JSON.parse(saved);
      } catch {}
    }

    sectionTogglesContainer.innerHTML = SECTIONS_METADATA.map(sec => {
      const isVisible = currentSectionsState[sec.key] !== false; // default true
      return `
        <div class="section-toggle-item">
          <div>
            <div style="font-family: var(--font-heading); font-size: 1rem; color: #FFFFFF;">${sec.name}</div>
            <div style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--color-gray);">${sec.desc}</div>
          </div>
          <label class="toggle-switch-label">
            <input type="checkbox" class="toggle-checkbox sec-toggle" data-key="${sec.key}" ${isVisible ? 'checked' : ''}>
          </label>
        </div>
      `;
    }).join('');
  };

  if (btnSaveSectionsConfig) {
    btnSaveSectionsConfig.addEventListener('click', async () => {
      const updated = {};
      document.querySelectorAll('.sec-toggle').forEach(chk => {
        updated[chk.dataset.key] = chk.checked;
      });

      try {
        await fetch('/api/sections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sections: updated })
        });
      } catch (err) {
        console.warn('API error saving sections, storing locally:', err);
      }

      localStorage.setItem('qc_section_toggles', JSON.stringify(updated));
      localStorage.setItem('qc_sections_updated_at', Date.now().toString());

      // Broadcast to other tabs
      try {
        const ch = new BroadcastChannel('qc_section_channel');
        ch.postMessage({ action: 'UPDATE_SECTIONS', sections: updated });
      } catch {}

      showToast('Section visibility preferences updated successfully.');
    });
  }

  // Copy Schema SQL helper
  if (btnCopySchemaSql) {
    btnCopySchemaSql.addEventListener('click', async () => {
      let fullSql = '';
      try {
        const res = await fetch('../supabase/schema.sql');
        if (res.ok) fullSql = await res.text();
      } catch (e) {}

      if (!fullSql) {
        try {
          const res = await fetch('/supabase/schema.sql');
          if (res.ok) fullSql = await res.text();
        } catch (e) {}
      }

      if (!fullSql) {
        fullSql = `-- ==============================================================================
-- QUANTUM CODERS // SUPABASE POSTGRESQL INITIALIZATION SCRIPT
-- Run this in your Supabase Project -> SQL Editor -> New Query -> Run
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    event_type TEXT NOT NULL DEFAULT 'Workshop',
    banner_url TEXT,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    venue TEXT NOT NULL,
    organizer TEXT NOT NULL DEFAULT 'Quantum Coders',
    eligibility TEXT NOT NULL DEFAULT 'Open to all students',
    maximum_slots INTEGER NOT NULL DEFAULT 100,
    registration_deadline TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'PUBLISHED',
    is_published BOOLEAN NOT NULL DEFAULT true,
    is_registration_open BOOLEAN NOT NULL DEFAULT true,
    is_calendar_visible BOOLEAN NOT NULL DEFAULT true,
    is_pass_enabled BOOLEAN NOT NULL DEFAULT true,
    is_gallery_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    deleted_at TIMESTAMPTZ NULL
);

CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id TEXT UNIQUE NOT NULL,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    section TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    year TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'CONFIRMED',
    registration_type TEXT NOT NULL DEFAULT 'STANDARD',
    custom_responses JSONB DEFAULT '{}'::jsonb,
    verification_hash TEXT NOT NULL,
    registered_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    cancelled_at TIMESTAMPTZ NULL
);

CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    registration_id TEXT NOT NULL REFERENCES public.registrations(registration_id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    check_in_time TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    status TEXT NOT NULL DEFAULT 'PRESENT',
    checked_in_by TEXT NOT NULL DEFAULT 'Admin Scanner',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.website_sections (
    section_key TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read events" ON public.events FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Allow anon write events" ON public.events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access on registrations" ON public.registrations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access on attendance" ON public.attendance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access on website_sections" ON public.website_sections FOR ALL USING (true) WITH CHECK (true);`;
      }

      try {
        await navigator.clipboard.writeText(fullSql);
        showToast('✓ Complete SQL Schema copied to clipboard! Paste & run in Supabase SQL Editor.', 'success');
      } catch (e) {
        showToast('Please open supabase/schema.sql file in the project folder.');
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 10.9 Supabase Cloud Database Connection Controller
  // ---------------------------------------------------------------------------
  const formSupabaseCfg = document.getElementById('form-supabase-config');
  const cfgSupabaseUrl = document.getElementById('cfg-supabase-url');
  const cfgSupabaseKey = document.getElementById('cfg-supabase-key');
  const supabaseLiveBadge = document.getElementById('supabase-live-badge');
  const supabaseFeedback = document.getElementById('supabase-test-feedback');
  const btnTestSupabaseCfg = document.getElementById('btn-test-supabase-cfg');
  const btnDisconnectSupabase = document.getElementById('btn-disconnect-supabase');
  const sysDbStatus = document.getElementById('sys-db-status');

  const updateSupabaseBadge = (isConnected, message = '', isMissingSchema = false) => {
    if (supabaseLiveBadge) {
      if (isConnected) {
        supabaseLiveBadge.textContent = '🟢 CONNECTED (LIVE POSTGRES)';
        supabaseLiveBadge.style.background = 'rgba(16, 185, 129, 0.15)';
        supabaseLiveBadge.style.color = '#34D399';
        supabaseLiveBadge.style.borderColor = '#10B981';
      } else if (isMissingSchema) {
        supabaseLiveBadge.textContent = '🟡 TABLES NOT CREATED';
        supabaseLiveBadge.style.background = 'rgba(245, 158, 11, 0.15)';
        supabaseLiveBadge.style.color = '#FBBF24';
        supabaseLiveBadge.style.borderColor = '#F59E0B';
      } else {
        supabaseLiveBadge.textContent = '⚪ LOCAL / DISCONNECTED';
        supabaseLiveBadge.style.background = 'rgba(100, 116, 139, 0.15)';
        supabaseLiveBadge.style.color = '#94A3B8';
        supabaseLiveBadge.style.borderColor = '#475569';
      }
    }
    if (sysDbStatus) {
      sysDbStatus.textContent = isConnected ? 'SUPABASE LIVE POSTGRES' : (isMissingSchema ? 'SUPABASE (NEEDS SCHEMA)' : 'LOCAL STORAGE PIPELINE');
      sysDbStatus.style.color = isConnected ? '#34D399' : (isMissingSchema ? '#FBBF24' : '#9CA3AF');
    }
    if (supabaseFeedback && message) {
      supabaseFeedback.style.display = 'block';
      supabaseFeedback.style.background = isConnected 
        ? 'rgba(16, 185, 129, 0.12)' 
        : (isMissingSchema ? 'rgba(245, 158, 11, 0.12)' : 'rgba(239, 68, 68, 0.12)');
      supabaseFeedback.style.color = isConnected 
        ? '#34D399' 
        : (isMissingSchema ? '#FBBF24' : '#F87171');
      supabaseFeedback.style.border = `1px solid ${isConnected ? '#10B981' : (isMissingSchema ? '#F59E0B' : '#EF4444')}`;

      if (isMissingSchema) {
        supabaseFeedback.innerHTML = `
          <div style="font-weight: 700; margin-bottom: 0.35rem; display: flex; align-items: center; gap: 0.4rem;">
            <span>⚠️</span> <span>DATABASE TABLES NOT CREATED YET</span>
          </div>
          <div style="margin-bottom: 0.65rem; line-height: 1.4; color: #FDE68A;">
            ${escapeHtml(message)}
          </div>
          <button type="button" class="btn-brutalist btn-primary btn-sm" id="btn-feedback-copy-sql" style="padding: 0.35rem 0.75rem; font-size: 0.75rem; background: #F59E0B; border-color: #D97706; color: #000; font-weight: 700;">
            📋 Copy SQL Migration Script
          </button>
        `;
        const btnFeedCopy = document.getElementById('btn-feedback-copy-sql');
        if (btnFeedCopy) {
          btnFeedCopy.addEventListener('click', () => {
            const btnCopy = document.getElementById('btn-copy-schema-sql');
            if (btnCopy) btnCopy.click();
          });
        }
      } else {
        supabaseFeedback.textContent = message;
      }
    }
  };

  // Populate existing credentials on load
  const initSupabaseSettingsView = async () => {
    if (window.QC_SUPABASE) {
      const url = window.QC_SUPABASE.getUrl();
      const key = window.QC_SUPABASE.getAnonKey();
      if (cfgSupabaseUrl && url && !url.includes('your-supabase-project')) {
        cfgSupabaseUrl.value = url;
      }
      if (cfgSupabaseKey && key && !key.includes('your-public-anon-key')) {
        cfgSupabaseKey.value = key;
      }
      if (window.QC_SUPABASE.isConfigured()) {
        const testRes = await window.QC_SUPABASE.testConnection();
        updateSupabaseBadge(testRes.ok, testRes.message, testRes.isMissingSchema);
      } else {
        updateSupabaseBadge(false);
      }
    }
  };

  if (formSupabaseCfg) {
    formSupabaseCfg.addEventListener('submit', async (e) => {
      e.preventDefault();
      const url = cfgSupabaseUrl ? cfgSupabaseUrl.value.trim() : '';
      const key = cfgSupabaseKey ? cfgSupabaseKey.value.trim() : '';

      if (!url || !key) {
        showToast('Please enter both Supabase URL and Anon Key.', 'error');
        return;
      }

      if (window.QC_SUPABASE) {
        const res = window.QC_SUPABASE.saveCredentials(url, key);
        if (res.success) {
          const testRes = await window.QC_SUPABASE.testConnection();
          updateSupabaseBadge(testRes.ok, testRes.message, testRes.isMissingSchema);
          showToast(
            testRes.ok 
              ? 'Supabase connected successfully!' 
              : (testRes.isMissingSchema ? 'Supabase connected! Tables need to be created in SQL Editor.' : testRes.message),
            testRes.ok ? 'success' : (testRes.isMissingSchema ? 'info' : 'error')
          );
          // Reload events from Supabase if ok
          if (testRes.ok) {
            const client = window.QC_SUPABASE.getClient();
            if (client) {
              const { count, error } = await client.from('events').select('*', { count: 'exact', head: true }).is('deleted_at', null);
              if (!error && (count === 0 || count === null)) {
                await pushAllEventsToSupabase();
              }
            }
            await fetchEventsData();
            renderAdminEventsGrid(adminEventsCache);
            loadDashboardStats();
          }
        } else {
          showToast(res.message, 'error');
          updateSupabaseBadge(false, res.message);
        }
      }
    });
  }

  const btnPushEventsSupabase = document.getElementById('btn-push-events-supabase');

  const pushAllEventsToSupabase = async () => {
    if (!window.QC_SUPABASE || !window.QC_SUPABASE.isConfigured()) {
      showToast('Supabase is not configured yet. Please enter your Project URL and Anon Key above and click "Connect & Save".', 'error');
      return { success: false };
    }

    const client = window.QC_SUPABASE.getClient();
    if (!client) return { success: false };

    if (btnPushEventsSupabase) {
      btnPushEventsSupabase.disabled = true;
      btnPushEventsSupabase.textContent = 'Pushing Events...';
    }

    const eventsToPush = getEventsFromStorage() || DEFAULT_EVENTS_CATALOG.map(normalizeEvent);
    let pushedCount = 0;

    for (const ev of eventsToPush) {
      if (!ev || ev.deleted_at) continue;
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(ev.id);
      const dbRow = {
        ...(isUuid ? { id: ev.id } : {}),
        event_code: (ev.slug || ev.event_code || ev.id || `QC-${Date.now()}`).toUpperCase().substring(0, 50),
        name: ev.name || ev.title || 'Quantum Coders Sprint',
        description: ev.description || 'Quantum Coders Technical Event',
        event_type: mapEventType(ev.event_type || ev.category),
        banner_url: ev.banner_url || ev.cover_image || 'images/event%20images/Pydah%20hackathon.png',
        date: ev.date || ev.event_date || '2026-04-10',
        start_time: ev.start_time ? (ev.start_time.length === 5 ? `${ev.start_time}:00` : ev.start_time) : '10:00:00',
        end_time: ev.end_time ? (ev.end_time.length === 5 ? `${ev.end_time}:00` : ev.end_time) : '18:00:00',
        venue: ev.venue || 'Campus Auditorium',
        maximum_slots: ev.maximum_slots || ev.max_capacity || 100,
        registration_deadline: ev.registration_deadline || new Date((ev.date || '2026-04-10') + 'T23:59:59Z').toISOString(),
        status: ev.status || (ev.is_published ? 'REGISTRATION OPEN' : 'DRAFT'),
        is_published: ev.is_published !== false,
        is_calendar_visible: ev.is_calendar_visible !== false,
        is_registration_open: ev.is_registration_open !== false,
        is_pass_enabled: true,
        is_gallery_enabled: true
      };

      try {
        const { data, error } = await client.from('events').upsert([dbRow], { onConflict: 'event_code' }).select();
        if (!error) pushedCount++;
        else console.warn('Supabase push error for row:', error.message);
      } catch (err) {
        console.warn('Supabase push exception:', err);
      }
    }

    if (btnPushEventsSupabase) {
      btnPushEventsSupabase.disabled = false;
      btnPushEventsSupabase.textContent = '⚡ Push Events to Supabase Table Now';
    }

    showToast(`Successfully pushed ${pushedCount} events to Supabase 'events' table!`, 'success');
    return { success: true, count: pushedCount };
  };

  if (btnPushEventsSupabase) {
    btnPushEventsSupabase.addEventListener('click', pushAllEventsToSupabase);
  }

  if (btnTestSupabaseCfg) {
    btnTestSupabaseCfg.addEventListener('click', async () => {
      if (!window.QC_SUPABASE || !window.QC_SUPABASE.isConfigured()) {
        showToast('Supabase is not configured yet. Enter credentials and click "Connect & Save".', 'error');
        return;
      }
      btnTestSupabaseCfg.disabled = true;
      btnTestSupabaseCfg.textContent = 'Testing...';
      const testRes = await window.QC_SUPABASE.testConnection();
      btnTestSupabaseCfg.disabled = false;
      btnTestSupabaseCfg.textContent = '🔍 Test Connection';
      updateSupabaseBadge(testRes.ok, testRes.message, testRes.isMissingSchema);
      showToast(
        testRes.ok 
          ? 'Supabase connection verified!' 
          : (testRes.isMissingSchema ? 'Supabase connected! Tables not found. Click "Copy SQL Migration Script" below.' : testRes.message),
        testRes.ok ? 'success' : (testRes.isMissingSchema ? 'info' : 'error')
      );
      if (testRes.ok) {
        const client = window.QC_SUPABASE.getClient();
        if (client) {
          const { count } = await client.from('events').select('*', { count: 'exact', head: true }).is('deleted_at', null);
          if (count === 0) {
            await pushAllEventsToSupabase();
          }
        }
      }
    });
  }

  if (btnDisconnectSupabase) {
    btnDisconnectSupabase.addEventListener('click', () => {
      if (confirm('Disconnect Supabase? The website will revert to local storage.')) {
        if (window.QC_SUPABASE) {
          window.QC_SUPABASE.saveCredentials('', '');
        }
        if (cfgSupabaseUrl) cfgSupabaseUrl.value = '';
        if (cfgSupabaseKey) cfgSupabaseKey.value = '';
        updateSupabaseBadge(false, 'Disconnected from Supabase.');
        showToast('Supabase disconnected. Switched to local storage.');
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 11. INITIAL LOAD & ORCHESTRATION
  // ---------------------------------------------------------------------------
  // Switch to Dashboard as default view
  switchConsoleTab('dashboard');

  // Load existing gallery events, student registrations, and Supabase telemetry
  renderEvents();
  fetchClubRegistrations();
  initSupabaseSettingsView();

  window.addEventListener('qc_supabase_connected', async () => {
    console.log('[Quantum Coders Admin] Online Supabase connection confirmed. Refreshing telemetry & data.');
    initSupabaseSettingsView();
    await fetchEventsData();
    renderAdminEventsGrid(adminEventsCache);
    await fetchClubRegistrations();
    loadDashboardStats();
  });
};

// Immediate or Deferred Execution Engine
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdmin);
} else {
  initAdmin();
}
