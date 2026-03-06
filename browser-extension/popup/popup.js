// Koby Browser Extension - Popup Script

const $ = (s) => document.querySelector(s);

// Views
const loginView = $('#login-view');
const saveView = $('#save-view');
const loadingView = $('#loading-view');

// State
let apiBase = '';
let token = '';
let collections = [];
let currentTab = null;
let suggestedTags = [];

// ─── Init ───

document.addEventListener('DOMContentLoaded', init);

async function init() {
  showView('loading');

  // Load stored credentials
  const stored = await chrome.storage.local.get(['apiBase', 'token', 'user']);
  apiBase = stored.apiBase || '';
  token = stored.token || '';

  if (apiBase && token) {
    // Verify token is still valid
    try {
      await apiFetch('/api/auth/me');
      await loadSaveView();
    } catch {
      // Token expired
      await chrome.storage.local.remove(['token', 'user']);
      token = '';
      showView('login');
      if (apiBase) $('#api-base').value = apiBase;
    }
  } else {
    showView('login');
    if (apiBase) $('#api-base').value = apiBase;
  }
}

// ─── View Management ───

function showView(name) {
  loginView.style.display = name === 'login' ? 'block' : 'none';
  saveView.style.display = name === 'save' ? 'block' : 'none';
  loadingView.style.display = name === 'loading' ? 'flex' : 'none';
}

// ─── API Helper ───

async function apiFetch(path, options = {}) {
  const url = apiBase.replace(/\/$/, '') + path;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

// ─── Login ───

$('#login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = $('#login-btn');
  const errorEl = $('#login-error');
  errorEl.style.display = 'none';

  apiBase = $('#api-base').value.trim().replace(/\/$/, '');
  const email = $('#login-email').value.trim();
  const password = $('#login-password').value;

  if (!apiBase || !email || !password) return;

  btn.disabled = true;
  btn.textContent = 'Signing in...';

  try {
    const url = apiBase + '/api/auth/login';
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = {}; }

    if (!res.ok) throw new Error(data.message || `Login failed (${res.status})`);
    if (!data.token) throw new Error('Invalid response from server');

    token = data.token;
    await chrome.storage.local.set({ apiBase, token, user: data.user });
    await loadSaveView();
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.style.display = 'block';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Sign In';
  }
});

// ─── Logout ───

$('#logout-btn').addEventListener('click', async () => {
  await chrome.storage.local.remove(['token', 'user']);
  token = '';
  collections = [];
  showView('login');
  if (apiBase) $('#api-base').value = apiBase;
});

// ─── Save View ───

async function loadSaveView() {
  showView('loading');

  try {
    // Check if opened from right-click context menu
    const { pendingBookmark } = await chrome.storage.local.get('pendingBookmark');
    if (pendingBookmark) {
      await chrome.storage.local.remove('pendingBookmark');
    }

    // Get current tab info as fallback
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Use pending bookmark data if available, otherwise use current tab
    const pageUrl = pendingBookmark?.url || tab?.url || '';
    const pageTitle = pendingBookmark?.title || tab?.title || '';
    const pageFavicon = pendingBookmark?.favicon || tab?.favIconUrl || `https://www.google.com/s2/favicons?domain=${new URL(pageUrl).hostname}&sz=64`;

    // Store as currentTab-like object for save handler
    currentTab = { url: pageUrl, title: pageTitle, favIconUrl: pageFavicon };

    // Load collections
    collections = await apiFetch('/api/collections');

    // Populate UI
    $('#page-favicon').src = pageFavicon;
    $('#page-title').textContent = pageTitle;
    $('#page-url').textContent = pageUrl;
    $('#bookmark-title').value = pageTitle;
    $('#bookmark-desc').value = '';
    $('#bookmark-tags').value = '';

    // Populate collection dropdown
    const select = $('#bookmark-collection');
    select.innerHTML = '';
    collections.forEach((c) => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.icon || '📁'} ${c.name}`;
      select.appendChild(opt);
    });

    // Check for duplicates
    await checkDuplicate(pageUrl);

    // Fetch meta + suggested tags
    fetchMetaAndTags(pageUrl);

    // Reset states
    $('#save-success').style.display = 'none';
    $('#save-form').style.display = 'block';
    $('#save-error').style.display = 'none';

    showView('save');
  } catch (err) {
    console.error('Failed to load save view:', err);
    showView('login');
  }
}

async function checkDuplicate(url) {
  const warningEl = $('#duplicate-warning');
  warningEl.style.display = 'none';

  try {
    const bookmarks = await apiFetch('/api/bookmarks');
    const existing = bookmarks.find((b) => b.url === url);
    if (existing) {
      const col = collections.find((c) => c.id === existing.collection_id);
      const colName = col ? `${col.icon || '📁'} ${col.name}` : 'Unknown';
      $('#duplicate-text').textContent = `Already saved in: ${colName}`;
      warningEl.style.display = 'flex';
    }
  } catch {
    // Silently ignore duplicate check errors
  }
}

async function fetchMetaAndTags(url) {
  try {
    const meta = await apiFetch(`/api/bookmarks/fetch-meta?url=${encodeURIComponent(url)}`);
    // Update title if we got a better one
    if (meta.title && !$('#bookmark-title').value) {
      $('#bookmark-title').value = meta.title;
    }
    // Show suggested tags
    if (meta.suggestedTags && meta.suggestedTags.length > 0) {
      suggestedTags = meta.suggestedTags;
      renderSuggestedTags();
    }
  } catch {
    // Meta fetch is optional
  }
}

function renderSuggestedTags() {
  const container = $('#suggested-tags');
  const list = $('#suggested-tags-list');
  const currentTags = $('#bookmark-tags').value
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  const unused = suggestedTags.filter((t) => !currentTags.includes(t));
  if (unused.length === 0) {
    container.style.display = 'none';
    return;
  }

  list.innerHTML = '';
  unused.forEach((tag) => {
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'tag-pill';
    pill.textContent = `+ ${tag}`;
    pill.addEventListener('click', () => {
      const input = $('#bookmark-tags');
      const tags = input.value
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      tags.push(tag);
      input.value = tags.join(', ');
      renderSuggestedTags();
    });
    list.appendChild(pill);
  });
  container.style.display = 'flex';
}

// ─── Save Bookmark ───

$('#save-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = $('#save-btn');
  const errorEl = $('#save-error');
  errorEl.style.display = 'none';

  const title = $('#bookmark-title').value.trim();
  const collectionId = $('#bookmark-collection').value;
  const description = $('#bookmark-desc').value.trim();
  const tags = $('#bookmark-tags').value
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  if (!title || !collectionId) return;

  btn.disabled = true;
  btn.textContent = 'Saving...';

  try {
    const faviconUrl =
      currentTab.favIconUrl ||
      `https://www.google.com/s2/favicons?domain=${new URL(currentTab.url).hostname}&sz=64`;

    await apiFetch('/api/bookmarks', {
      method: 'POST',
      body: JSON.stringify({
        title,
        url: currentTab.url,
        description,
        collection_id: collectionId,
        favicon: faviconUrl,
        tags,
        is_pinned: false,
      }),
    });

    // Show success
    $('#save-form').style.display = 'none';
    $('#duplicate-warning').style.display = 'none';
    $('#suggested-tags').style.display = 'none';
    $('#save-success').style.display = 'block';
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.style.display = 'block';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save Bookmark';
  }
});

// Save another
$('#save-another-btn').addEventListener('click', () => {
  loadSaveView();
});
