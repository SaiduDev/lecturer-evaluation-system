/**
 * API Module — Centralized backend communication via Fetch API.
 * All requests show/hide the global loader automatically.
 */

const BASE_URL = 'https://lecturer-evaluation-backend.onrender.com/evaluation/system';

const AUTH_TOKEN_KEY = 'adminAuthToken';

/**
 * Get stored admin auth token.
 * @returns {string|null}
 */
function getAuthToken() {
  return sessionStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Store admin auth token.
 * @param {string} token
 */
function setAuthToken(token) {
  sessionStorage.setItem(AUTH_TOKEN_KEY, token);
}

/**
 * Remove admin auth token (logout).
 */
function clearAuthToken() {
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
}

/**
 * Check if admin is authenticated.
 * @returns {boolean}
 */
function isAuthenticated() {
  return !!getAuthToken();
}

/**
 * Core fetch wrapper with loader, error handling, and auth headers.
 * @param {string} endpoint - API path (without BASE_URL)
 * @param {RequestInit} options - Fetch options
 * @param {boolean} requireAuth - Whether to attach auth token
 * @returns {Promise<any>}
 */
async function apiRequest(endpoint, options = {}, requireAuth = false) {
  showLoader();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (requireAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
    }
  }

  try {
    const response = await fetch(BASE_URL + endpoint, {
      ...options,
      headers
    });

    let data = null;
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = text ? { message: text } : null;
    }

    if (!response.ok) {
      const message =
        (data && (data.message || data.error)) ||
        'Request failed with status ' + response.status;
      throw new Error(message);
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please check your connection.');
    }
    throw error;
  } finally {
    hideLoader();
  }
}

/* ============================================
   AUTH
   ============================================ */

/**
 * Admin login — POST /admin/login
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ token: string, admin?: object }>}
 */
async function loginAdmin(credentials) {
  return apiRequest('/admin/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
}

/* ============================================
   DEPARTMENTS
   ============================================ */

/**
 * Fetch all departments for student selection page.
 * GET /departments
 * @returns {Promise<Array>}
 */
async function getDepartments() {
  return apiRequest('/api/department');
}

/**
 * Create new department (Admin only).
 * POST /departments
 * @param {{ name: string, description?: string }} data
 * @returns {Promise<object>}
 */
async function createDepartment(data) {
  return apiRequest('/api/addDepartment', {
    method: 'POST',
    body: JSON.stringify(data)
  }, true);
}

/**
 * Update department details.
 * PUT /departments/:id
 * @param {number|string} id
 * @param {{ name: string, description?: string }} data
 * @returns {Promise<object>}
 */
async function updateDepartment(id, data) {
  return apiRequest('/api/editDepartment/' + id, {
    method: 'PUT',
    body: JSON.stringify(data)
  }, true);
}

/**
 * Delete department permanently.
 * DELETE /departments/:id
 * @param {number|string} id
 * @returns {Promise<object>}
 */
async function deleteDepartment(id) {
  return apiRequest('/api/deleteDepartment/' + id, {
    method: 'DELETE'
  }, true);
}

/* ============================================
   LECTURERS
   ============================================ */

/**
 * Fetch lecturers by department selection.
 * GET /departments/:departmentId/lecturers
 * @param {number|string} departmentId
 * @returns {Promise<Array>}
 */
async function getLecturersByDepartment(departmentId) {
  return apiRequest('/departments/' + departmentId + '/lecturers');
}

/**
 * Fetch all lecturers (Admin).
 * GET /lecturers
 * @returns {Promise<Array>}
 */
async function getAllLecturers() {
  return apiRequest('/lecturers', {}, true);
}

/**
 * Add lecturer (Admin).
 * POST /lecturers
 * @param {{ lecturer_name: string, email?: string, department_id: number }} data
 * @returns {Promise<object>}
 */
async function createLecturer(data) {
  return apiRequest('/create/lecturer', {
    method: 'POST',
    body: JSON.stringify(data)
  }, true);
}

/**
 * Delete lecturer.
 * DELETE /lecturers/:id
 * @param {number|string} id
 * @returns {Promise<object>}
 */
async function deleteLecturer(id) {
  return apiRequest('/lecturer/delete/' + id, {
    method: 'DELETE'
  }, true);
}

/* ============================================
   EVALUATIONS
   ============================================ */

/**
 * Submit anonymous evaluation for lecturer.
 * POST /evaluations
 * @param {{
 *   lecturer_id: number,
 *   clarity: number,
 *   knowledge: number,
 *   punctuality: number,
 *   communication: number,
 *   overall: number,
 *   comment: string
 * }} data
 * @returns {Promise<object>}
 */
async function submitEvaluation(data) {
  return apiRequest('/evaluation/submit', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

/* ============================================
   ANALYTICS
   ============================================ */

/**
 * Fetch admin dashboard stats.
 * GET /analytics/dashboard
 * @returns {Promise<object>}
 */
async function getDashboardAnalytics() {
  return apiRequest('/analytics/dashboard', {}, true);
}

/**
 * Fetch detailed analytics data.
 * GET /analytics
 * @returns {Promise<object>}
 */
async function getAnalytics() {
  return apiRequest('/analytics/', {}, true);
}

/* ============================================
   EXPORTS (global for vanilla JS pages)
   ============================================ */

window.API = {
  BASE_URL,
  getAuthToken,
  setAuthToken,
  clearAuthToken,
  isAuthenticated,
  loginAdmin,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getLecturersByDepartment,
  getAllLecturers,
  createLecturer,
  deleteLecturer,
  submitEvaluation,
  getDashboardAnalytics,
  getAnalytics
};
