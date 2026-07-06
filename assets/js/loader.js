/**
 * Global Loader Component
 * Appears during ALL API requests, blocks interaction, auto-hides on response.
 */

(function () {
  'use strict';

  let requestCount = 0;
  let loaderEl = null;

  /**
   * Creates the loader DOM element if it doesn't exist.
   */
  function ensureLoader() {
    if (loaderEl) return loaderEl;

    loaderEl = document.createElement('div');
    loaderEl.className = 'global-loader';
    loaderEl.setAttribute('role', 'alert');
    loaderEl.setAttribute('aria-live', 'assertive');
    loaderEl.setAttribute('aria-busy', 'false');
    loaderEl.innerHTML = `
      <div class="global-loader__content">
        <div class="global-loader__spinner" aria-hidden="true"></div>
        <p class="global-loader__text">Loading, please wait...</p>
      </div>
    `;
    document.body.appendChild(loaderEl);
    return loaderEl;
  }

  /**
   * Show the global loader overlay.
   * Uses a counter to handle concurrent API requests.
   */
  function showLoader() {
    const el = ensureLoader();
    requestCount += 1;

    if (requestCount === 1) {
      el.classList.add('is-visible');
      el.setAttribute('aria-busy', 'true');
      document.body.style.overflow = 'hidden';
    }
  }

  /**
   * Hide the global loader overlay.
   * Only hides when all pending requests complete.
   */
  function hideLoader() {
    if (requestCount > 0) {
      requestCount -= 1;
    }

    if (requestCount <= 0) {
      requestCount = 0;
      if (loaderEl) {
        loaderEl.classList.remove('is-visible');
        loaderEl.setAttribute('aria-busy', 'false');
      }
      document.body.style.overflow = '';
    }
  }

  /**
   * Force-hide loader (e.g. on fatal errors).
   */
  function resetLoader() {
    requestCount = 0;
    if (loaderEl) {
      loaderEl.classList.remove('is-visible');
      loaderEl.setAttribute('aria-busy', 'false');
    }
    document.body.style.overflow = '';
  }

  window.showLoader = showLoader;
  window.hideLoader = hideLoader;
  window.resetLoader = resetLoader;
})();
