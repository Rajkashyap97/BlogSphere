/**
 * BlogSphere - Sprint 10 Frontend Application Logic
 * Integrates with Express REST API and MongoDB Atlas.
 */

// Dynamically determine API Base URL
// Defaults to current origin if served from Express backend, or fallback to port 5000

const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? (window.location.port === '5000' ? '' : 'http://localhost:5000')
  : 'https://blogsphere-qh5i.onrender.com';


// Application State
const state = {
  posts: [],
  users: [],
  activeTab: 'all', // 'all' or 'top'
  postToDelete: null
};

// DOM Elements
const elements = {
  connectionStatus: document.getElementById('connectionStatus'),
  toastContainer: document.getElementById('toastContainer'),
  tabAllPosts: document.getElementById('tabAllPosts'),
  tabTopPosts: document.getElementById('tabTopPosts'),
  postCountBadge: document.getElementById('postCountBadge'),
  refreshBtn: document.getElementById('refreshBtn'),
  viewTitle: document.getElementById('viewTitle'),
  viewDescription: document.getElementById('viewDescription'),
  loadingState: document.getElementById('loadingState'),
  errorState: document.getElementById('errorState'),
  errorMessage: document.getElementById('errorMessage'),
  retryBtn: document.getElementById('retryBtn'),
  emptyState: document.getElementById('emptyState'),
  emptyCreateBtn: document.getElementById('emptyCreateBtn'),
  postsGrid: document.getElementById('postsGrid'),

  // Modals & Buttons
  openPostModalBtn: document.getElementById('openPostModalBtn'),
  postModal: document.getElementById('postModal'),
  closePostModal: document.getElementById('closePostModal'),
  cancelPostBtn: document.getElementById('cancelPostBtn'),
  createPostForm: document.getElementById('createPostForm'),
  postTitle: document.getElementById('postTitle'),
  postAuthorSelect: document.getElementById('postAuthorSelect'),
  postContent: document.getElementById('postContent'),
  createPostError: document.getElementById('createPostError'),
  submitPostBtn: document.getElementById('submitPostBtn'),
  quickAddAuthorBtn: document.getElementById('quickAddAuthorBtn'),

  // User Modal
  openUserModalBtn: document.getElementById('openUserModalBtn'),
  userModal: document.getElementById('userModal'),
  closeUserModal: document.getElementById('closeUserModal'),
  closeUserModalFooterBtn: document.getElementById('closeUserModalFooterBtn'),
  createUserForm: document.getElementById('createUserForm'),
  userName: document.getElementById('userName'),
  userEmail: document.getElementById('userEmail'),
  createUserError: document.getElementById('createUserError'),
  userList: document.getElementById('userList'),
  userCount: document.getElementById('userCount'),
  userListLoading: document.getElementById('userListLoading'),

  // Delete Modal
  deleteModal: document.getElementById('deleteModal'),
  closeDeleteModal: document.getElementById('closeDeleteModal'),
  cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),
  confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
  deletePostTitle: document.getElementById('deletePostTitle')
};

// ==========================================
// Toast Notifications
// ==========================================
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ==========================================
// Health & Connection Check
// ==========================================
async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/api/health`);
    if (res.ok) {
      elements.connectionStatus.className = 'status-pill status-online';
      elements.connectionStatus.querySelector('.status-text').textContent = 'Atlas Connected';
      return true;
    }
    throw new Error('Health check returned non-200');
  } catch (err) {
    elements.connectionStatus.className = 'status-pill status-error';
    elements.connectionStatus.querySelector('.status-text').textContent = 'Backend Offline';
    return false;
  }
}

// ==========================================
// Fetch Posts & Populate UI
// ==========================================
async function fetchPosts() {
  showLoading();
  elements.errorState.classList.add('hidden');
  elements.emptyState.classList.add('hidden');
  elements.postsGrid.classList.add('hidden');

  const endpoint = state.activeTab === 'top'
    ? `${API_BASE}/posts/recent/top`
    : `${API_BASE}/posts`;

  try {
    const res = await fetch(endpoint);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error ${res.status}`);
    }

    const data = await res.json();
    state.posts = data;

    hideLoading();
    checkBackendHealth();
    renderPosts();
  } catch (error) {
    hideLoading();
    showError(error.message);
    checkBackendHealth();
  }
}

function renderPosts() {
  elements.postsGrid.innerHTML = '';

  if (state.activeTab === 'all') {
    elements.postCountBadge.textContent = state.posts.length;
    elements.viewTitle.textContent = 'All Published Posts';
    elements.viewDescription.textContent = 'Displaying all documents persisted in MongoDB Atlas, populated with relational author profiles.';
  } else {
    elements.viewTitle.textContent = 'Top 3 Most Recent Posts';
    elements.viewDescription.textContent = 'Filtered & sorted directly via MongoDB query: Post.find().sort({ createdAt: -1 }).limit(3).';
  }

  if (!state.posts || state.posts.length === 0) {
    elements.emptyState.classList.remove('hidden');
    elements.postsGrid.classList.add('hidden');
    return;
  }

  elements.emptyState.classList.add('hidden');
  elements.postsGrid.classList.remove('hidden');

  state.posts.forEach(post => {
    const card = createPostCard(post);
    elements.postsGrid.appendChild(card);
  });
}

function createPostCard(post) {
  const card = document.createElement('article');
  card.className = 'post-card';
  card.dataset.id = post._id;

  // Extract author info (via Mongoose populate)
  const author = post.authorId || {};
  const authorName = author.name || 'Anonymous User';
  const authorEmail = author.email || 'No email provided';
  const authorInitial = authorName.charAt(0).toUpperCase();

  const formattedDate = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Recently';

  card.innerHTML = `
    <div>
      <div class="post-card-header">
        <h3 class="post-title">${escapeHTML(post.title)}</h3>
        <button class="post-delete-btn" title="Delete Post" aria-label="Delete Post" data-id="${post._id}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
      <p class="post-content">${escapeHTML(post.content)}</p>
    </div>
    <footer class="post-footer">
      <div class="author-info">
        <div class="author-avatar">${authorInitial}</div>
        <div class="author-details">
          <span class="author-name">${escapeHTML(authorName)}</span>
          <span class="author-email">${escapeHTML(authorEmail)}</span>
        </div>
      </div>
      <time class="post-date">${formattedDate}</time>
    </footer>
  `;

  // Attach delete button handler
  const deleteBtn = card.querySelector('.post-delete-btn');
  deleteBtn.addEventListener('click', () => {
    state.postToDelete = post;
    elements.deletePostTitle.textContent = `"${post.title}"`;
    elements.deleteModal.classList.remove('hidden');
  });

  return card;
}

// ==========================================
// Fetch & Populate Users
// ==========================================
async function fetchUsers() {
  try {
    elements.userListLoading.classList.remove('hidden');
    const res = await fetch(`${API_BASE}/users`);
    if (!res.ok) throw new Error('Failed to load users');

    const users = await res.json();
    state.users = users;

    populateAuthorSelect();
    renderUserList();
  } catch (error) {
    console.warn('[BlogSphere] Could not fetch users:', error.message);
  } finally {
    elements.userListLoading.classList.add('hidden');
  }
}

function populateAuthorSelect() {
  const select = elements.postAuthorSelect;
  const currentVal = select.value;
  select.innerHTML = '<option value="" disabled selected>Select an author...</option>';

  state.users.forEach(user => {
    const opt = document.createElement('option');
    opt.value = user._id;
    opt.textContent = `${user.name} (${user.email})`;
    select.appendChild(opt);
  });

  if (currentVal && state.users.some(u => u._id === currentVal)) {
    select.value = currentVal;
  } else if (state.users.length > 0) {
    select.value = state.users[0]._id;
  }
}

function renderUserList() {
  elements.userCount.textContent = state.users.length;
  elements.userList.innerHTML = '';

  if (state.users.length === 0) {
    elements.userList.innerHTML = '<li class="user-list-item"><span>No registered users yet.</span></li>';
    return;
  }

  state.users.forEach(user => {
    const li = document.createElement('li');
    li.className = 'user-list-item';
    li.innerHTML = `
      <div>
        <div class="u-name">${escapeHTML(user.name)}</div>
        <div class="u-email">${escapeHTML(user.email)}</div>
      </div>
      <div class="u-id">${user._id}</div>
    `;
    elements.userList.appendChild(li);
  });
}

// ==========================================
// Create Post Action
// ==========================================
async function handleCreatePost(e) {
  e.preventDefault();
  elements.createPostError.classList.add('hidden');

  const title = elements.postTitle.value.trim();
  const authorId = elements.postAuthorSelect.value;
  const content = elements.postContent.value.trim();

  if (!title || !authorId || !content) {
    elements.createPostError.textContent = 'Please fill out all required fields.';
    elements.createPostError.classList.remove('hidden');
    return;
  }

  elements.submitPostBtn.disabled = true;
  elements.submitPostBtn.textContent = 'Saving to Atlas...';

  try {
    const res = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, authorId })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to create post');
    }

    showToast('Post created successfully in MongoDB Atlas!', 'success');
    elements.createPostForm.reset();
    elements.postModal.classList.add('hidden');
    fetchPosts();
  } catch (error) {
    elements.createPostError.textContent = error.message;
    elements.createPostError.classList.remove('hidden');
  } finally {
    elements.submitPostBtn.disabled = false;
    elements.submitPostBtn.textContent = 'Publish Post';
  }
}

// ==========================================
// Create User Action
// ==========================================
async function handleCreateUser(e) {
  e.preventDefault();
  elements.createUserError.classList.add('hidden');

  const name = elements.userName.value.trim();
  const email = elements.userEmail.value.trim();

  if (!name || !email) {
    elements.createUserError.textContent = 'Please provide both name and email.';
    elements.createUserError.classList.remove('hidden');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to create user');
    }

    showToast(`User "${data.name}" created!`, 'success');
    elements.userName.value = '';
    elements.userEmail.value = '';
    await fetchUsers();
  } catch (error) {
    elements.createUserError.textContent = error.message;
    elements.createUserError.classList.remove('hidden');
  }
}

// ==========================================
// Delete Post Action
// ==========================================
async function handleDeletePost() {
  if (!state.postToDelete) return;

  const postId = state.postToDelete._id;
  elements.confirmDeleteBtn.disabled = true;
  elements.confirmDeleteBtn.textContent = 'Deleting...';

  try {
    const res = await fetch(`${API_BASE}/posts/${postId}`, {
      method: 'DELETE'
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to delete post');
    }

    showToast('Post deleted from MongoDB Atlas', 'success');
    elements.deleteModal.classList.add('hidden');
    state.postToDelete = null;

    // Refresh list
    fetchPosts();
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    elements.confirmDeleteBtn.disabled = false;
    elements.confirmDeleteBtn.textContent = 'Delete Document';
  }
}

// ==========================================
// Loading & Error State Helpers
// ==========================================
function showLoading() {
  elements.loadingState.classList.remove('hidden');
}

function hideLoading() {
  elements.loadingState.classList.add('hidden');
}

function showError(msg) {
  elements.errorMessage.textContent = msg || 'Could not load data from MongoDB Atlas';
  elements.errorState.classList.remove('hidden');
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}

// ==========================================
// Event Listeners Initialization
// ==========================================
function initEvents() {
  // Tabs
  elements.tabAllPosts.addEventListener('click', () => {
    state.activeTab = 'all';
    elements.tabAllPosts.classList.add('active');
    elements.tabTopPosts.classList.remove('active');
    fetchPosts();
  });

  elements.tabTopPosts.addEventListener('click', () => {
    state.activeTab = 'top';
    elements.tabTopPosts.classList.add('active');
    elements.tabAllPosts.classList.remove('active');
    fetchPosts();
  });

  // Refresh
  elements.refreshBtn.addEventListener('click', () => {
    fetchPosts();
    fetchUsers();
  });

  elements.retryBtn.addEventListener('click', () => {
    fetchPosts();
    fetchUsers();
  });

  // Post Modal open/close
  elements.openPostModalBtn.addEventListener('click', () => {
    elements.createPostError.classList.add('hidden');
    elements.postModal.classList.remove('hidden');
  });

  elements.emptyCreateBtn.addEventListener('click', () => {
    elements.createPostError.classList.add('hidden');
    elements.postModal.classList.remove('hidden');
  });

  elements.closePostModal.addEventListener('click', () => {
    elements.postModal.classList.add('hidden');
  });

  elements.cancelPostBtn.addEventListener('click', () => {
    elements.postModal.classList.add('hidden');
  });

  elements.createPostForm.addEventListener('submit', handleCreatePost);

  // User Modal open/close
  elements.openUserModalBtn.addEventListener('click', () => {
    elements.createUserError.classList.add('hidden');
    elements.userModal.classList.remove('hidden');
    fetchUsers();
  });

  elements.quickAddAuthorBtn.addEventListener('click', () => {
    elements.createUserError.classList.add('hidden');
    elements.userModal.classList.remove('hidden');
    fetchUsers();
  });

  elements.closeUserModal.addEventListener('click', () => {
    elements.userModal.classList.add('hidden');
  });

  elements.closeUserModalFooterBtn.addEventListener('click', () => {
    elements.userModal.classList.add('hidden');
  });

  elements.createUserForm.addEventListener('submit', handleCreateUser);

  // Delete Modal
  elements.closeDeleteModal.addEventListener('click', () => {
    elements.deleteModal.classList.add('hidden');
    state.postToDelete = null;
  });

  elements.cancelDeleteBtn.addEventListener('click', () => {
    elements.deleteModal.classList.add('hidden');
    state.postToDelete = null;
  });

  elements.confirmDeleteBtn.addEventListener('click', handleDeletePost);
}

// Initial Boot
document.addEventListener('DOMContentLoaded', () => {
  initEvents();
  checkBackendHealth();
  fetchUsers().then(() => fetchPosts());
});

