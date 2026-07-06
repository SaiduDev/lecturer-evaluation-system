/**
 * Theme System — Dark / Light mode with localStorage persistence.
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'lecturer-eval-theme';
  const DEFAULT_THEME = 'light';

  /**
   * Get the current theme from localStorage or system preference.
   * @returns {'light'|'dark'}
   */
  function getTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return DEFAULT_THEME;
  }

  /**
   * Apply theme to the document.
   * @param {'light'|'dark'} theme
   */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    updateToggleIcons(theme);
  }

  /**
   * Update all theme toggle button icons on the page.
   * @param {'light'|'dark'} theme
   */
  function updateToggleIcons(theme) {
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.innerHTML = theme === 'dark'
        ? '<i class="fa-solid fa-sun"></i>'
        : '<i class="fa-solid fa-moon"></i>';
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      btn.setAttribute('title', theme === 'dark' ? 'Light mode' : 'Dark mode');
    });
  }

  /**
   * Toggle between light and dark themes.
   */
  function toggleTheme() {
    const current = getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  }

  /**
   * Initialize theme on page load and bind toggle buttons.
   */
  function initTheme() {
    applyTheme(getTheme());

    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.addEventListener('click', toggleTheme);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
  } else {
    initTheme();
  }

  window.getTheme = getTheme;
  window.toggleTheme = toggleTheme;
  window.applyTheme = applyTheme;
})();
