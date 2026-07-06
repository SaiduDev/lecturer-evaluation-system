/**
 * UI Module — Reusable components and utilities.
 * Card, Button, Modal, Star Rating, Toast, validation, sanitization.
 */

(function () {
  'use strict';

  /* ============================================
     SANITIZATION & VALIDATION
     ============================================ */

  /**
   * Sanitize text input to prevent HTML injection.
   * @param {string} str
   * @returns {string}
   */
  function sanitizeInput(str) {
    if (typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Strip HTML tags from string.
   * @param {string} str
   * @returns {string}
   */
  function stripHtml(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/<[^>]*>/g, '');
  }

  /**
   * Validate that a string is not empty after trimming.
   * @param {string} value
   * @returns {boolean}
   */
  function isNotEmpty(value) {
    return typeof value === 'string' && value.trim().length > 0;
  }

  /**
   * Validate email format.
   * @param {string} email
   * @returns {boolean}
   */
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * Debounce function to prevent double submissions.
   * @param {Function} fn
   * @param {number} delay
   * @returns {Function}
   */
  function debounce(fn, delay) {
    let timer = null;
    return function () {
      const context = this;
      const args = arguments;
      if (timer) clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(context, args);
      }, delay);
    };
  }

  /**
   * Disable a button and add loading state.
   * @param {HTMLButtonElement} btn
   */
  function setButtonLoading(btn, loading) {
    if (!btn) return;
    btn.disabled = loading;
    btn.classList.toggle('is-loading', loading);
    if (loading) {
      btn.dataset.originalText = btn.textContent;
      btn.textContent = 'Please wait...';
    } else if (btn.dataset.originalText) {
      btn.textContent = btn.dataset.originalText;
    }
  }

  /**
   * Get initials from a name string.
   * @param {string} name
   * @returns {string}
   */
  function getInitials(name) {
    if (!name) return '?';
    return name
      .split(' ')
      .map(function (part) { return part[0]; })
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  /**
   * Format number to fixed decimal places.
   * @param {number} num
   * @param {number} decimals
   * @returns {string}
   */
  function formatNumber(num, decimals) {
    if (num === null || num === undefined || isNaN(num)) return '0';
    return Number(num).toFixed(decimals !== undefined ? decimals : 1);
  }

  /**
   * Safely parse URL query parameters.
   * @returns {URLSearchParams}
   */
  function getQueryParams() {
    return new URLSearchParams(window.location.search);
  }

  /* ============================================
     TOAST NOTIFICATIONS
     ============================================ */

  let toastContainer = null;

  function ensureToastContainer() {
    if (toastContainer) return toastContainer;
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    toastContainer.setAttribute('aria-live', 'polite');
    document.body.appendChild(toastContainer);
    return toastContainer;
  }

  /**
   * Show a toast notification.
   * @param {string} message
   * @param {'success'|'error'|'warning'|'info'} type
   * @param {number} duration - Auto-dismiss in ms (0 = no auto dismiss)
   */
  function showToast(message, type, duration) {
    type = type || 'info';
    duration = duration !== undefined ? duration : 4000;

    const container = ensureToastContainer();
    const toast = document.createElement('div');
    toast.className = 'toast toast--' + type;
    toast.innerHTML =
      '<span class="toast__message">' + sanitizeInput(message) + '</span>' +
      '<button class="toast__close" aria-label="Dismiss">&times;</button>';

    const closeBtn = toast.querySelector('.toast__close');
    closeBtn.addEventListener('click', function () {
      toast.remove();
    });

    container.appendChild(toast);

    if (duration > 0) {
      setTimeout(function () {
        if (toast.parentNode) toast.remove();
      }, duration);
    }
  }

  /* ============================================
     MODAL SYSTEM
     ============================================ */

  /**
   * Open a modal dialog.
   * @param {{ title: string, content: string|HTMLElement, footer?: string|HTMLElement, onClose?: Function }} options
   * @returns {{ close: Function, overlay: HTMLElement }}
   */
  function openModal(options) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    const modal = document.createElement('div');
    modal.className = 'modal';

    const header = document.createElement('div');
    header.className = 'modal__header';
    header.innerHTML =
      '<h3 class="modal__title">' + sanitizeInput(options.title || 'Dialog') + '</h3>' +
      '<button class="modal__close" aria-label="Close">&times;</button>';

    const body = document.createElement('div');
    body.className = 'modal__body';
    if (typeof options.content === 'string') {
      body.innerHTML = options.content;
    } else if (options.content instanceof HTMLElement) {
      body.appendChild(options.content);
    }

    modal.appendChild(header);
    modal.appendChild(body);

    if (options.footer) {
      const footer = document.createElement('div');
      footer.className = 'modal__footer';
      if (typeof options.footer === 'string') {
        footer.innerHTML = options.footer;
      } else if (options.footer instanceof HTMLElement) {
        footer.appendChild(options.footer);
      }
      modal.appendChild(footer);
    }

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(function () {
      overlay.classList.add('is-open');
    });

    function closeModal() {
      overlay.classList.remove('is-open');
      setTimeout(function () {
        overlay.remove();
        document.body.style.overflow = '';
        if (options.onClose) options.onClose();
      }, 300);
    }

    header.querySelector('.modal__close').addEventListener('click', closeModal);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });

    document.addEventListener('keydown', function escHandler(e) {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', escHandler);
      }
    });

    return { close: closeModal, overlay: overlay };
  }

  /**
   * Confirm dialog shorthand.
   * @param {string} message
   * @param {Function} onConfirm
   * @param {string} title
   */
  function confirmDialog(message, onConfirm, title) {
    const footer = document.createElement('div');
    footer.style.display = 'flex';
    footer.style.gap = '8px';
    footer.style.justifyContent = 'flex-end';

    const cancelBtn = createButton('Cancel', 'secondary', function () {
      modal.close();
    });
    const confirmBtn = createButton('Confirm', 'danger', function () {
      modal.close();
      onConfirm();
    });

    footer.appendChild(cancelBtn);
    footer.appendChild(confirmBtn);

    const modal = openModal({
      title: title || 'Confirm Action',
      content: '<p>' + sanitizeInput(message) + '</p>',
      footer: footer
    });

    return modal;
  }

  /* ============================================
     BUTTON COMPONENT
     ============================================ */

  /**
   * Create a button element.
   * @param {string} text
   * @param {'primary'|'secondary'|'success'|'danger'|'ghost'} variant
   * @param {Function} onClick
   * @param {{ size?: string, block?: boolean, icon?: string, type?: string }} opts
   * @returns {HTMLButtonElement}
   */
  function createButton(text, variant, onClick, opts) {
    opts = opts || {};
    const btn = document.createElement('button');
    btn.type = opts.type || 'button';
    btn.className = 'btn btn--' + (variant || 'primary');
    if (opts.size) btn.classList.add('btn--' + opts.size);
    if (opts.block) btn.classList.add('btn--block');
    btn.textContent = text;
    if (opts.icon) btn.textContent = opts.icon + ' ' + text;
    if (onClick) btn.addEventListener('click', onClick);
    return btn;
  }

  /* ============================================
     CARD COMPONENT
     ============================================ */

  /**
   * Create a card element.
   * @param {{ title?: string, subtitle?: string, body?: string|HTMLElement, footer?: string|HTMLElement, hover?: boolean, clickable?: boolean, onClick?: Function, icon?: string }} opts
   * @returns {HTMLElement}
   */
  function createCard(opts) {
    opts = opts || {};
    const card = document.createElement('div');
    card.className = 'card';
    if (opts.hover) card.classList.add('card--hover');
    if (opts.clickable) card.classList.add('card--clickable');

    if (opts.icon) {
      const iconEl = document.createElement('div');
      iconEl.className = 'card__icon';
      if (opts.icon instanceof HTMLElement) {
        iconEl.appendChild(opts.icon);
      } else {
        iconEl.innerHTML = opts.icon;
      }
      card.appendChild(iconEl);
    }

    if (opts.title || opts.subtitle) {
      const header = document.createElement('div');
      header.className = 'card__header';
      if (opts.title) {
        const titleEl = document.createElement('h3');
        titleEl.className = 'card__title';
        titleEl.textContent = opts.title;
        header.appendChild(titleEl);
      }
      if (opts.subtitle) {
        const subEl = document.createElement('p');
        subEl.className = 'card__subtitle';
        subEl.textContent = opts.subtitle;
        header.appendChild(subEl);
      }
      card.appendChild(header);
    }

    if (opts.body) {
      const bodyEl = document.createElement('div');
      bodyEl.className = 'card__body';
      if (typeof opts.body === 'string') {
        bodyEl.innerHTML = opts.body;
      } else {
        bodyEl.appendChild(opts.body);
      }
      card.appendChild(bodyEl);
    }

    if (opts.footer) {
      const footerEl = document.createElement('div');
      footerEl.className = 'card__footer';
      if (typeof opts.footer === 'string') {
        footerEl.innerHTML = opts.footer;
      } else {
        footerEl.appendChild(opts.footer);
      }
      card.appendChild(footerEl);
    }

    if (opts.onClick) {
      card.addEventListener('click', opts.onClick);
    }

    return card;
  }

  /* ============================================
     STAR RATING COMPONENT
     ============================================ */

  /**
   * Create an interactive star rating component.
   * @param {{ name: string, label: string, readonly?: boolean, value?: number, onChange?: Function }} opts
   * @returns {HTMLElement}
   */
  function createStarRating(opts) {
    const container = document.createElement('div');
    container.className = 'rating-question';
    container.dataset.question = opts.name;

    const label = document.createElement('label');
    label.className = 'rating-question__label';
    label.textContent = opts.label;
    container.appendChild(label);

    const starsWrap = document.createElement('div');
    starsWrap.className = 'star-rating' + (opts.readonly ? ' star-rating--readonly' : '');
    starsWrap.setAttribute('role', 'radiogroup');
    starsWrap.setAttribute('aria-label', opts.label);

    let currentValue = opts.value || 0;
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.name = opts.name;
    hiddenInput.value = currentValue;

    const stars = [];

    function updateStars(value) {
      stars.forEach(function (star, i) {
        star.classList.toggle('active', i < value);
      });
      hiddenInput.value = value;
      container.classList.toggle('is-valid', value > 0);
      if (opts.onChange) opts.onChange(value);
    }

    for (let i = 1; i <= 5; i++) {
      const star = document.createElement('button');
      star.type = 'button';
      star.className = 'star-rating__star';
      star.innerHTML = '&#9733;';
      star.setAttribute('aria-label', i + ' star' + (i > 1 ? 's' : ''));
      star.dataset.value = i;

      if (!opts.readonly) {
        star.addEventListener('click', function () {
          currentValue = i;
          updateStars(i);
        });

        star.addEventListener('mouseenter', function () {
          stars.forEach(function (s, idx) {
            s.classList.toggle('hover-preview', idx < i);
          });
        });

        star.addEventListener('mouseleave', function () {
          stars.forEach(function (s) {
            s.classList.remove('hover-preview');
          });
        });
      }

      stars.push(star);
      starsWrap.appendChild(star);
    }

    starsWrap.addEventListener('mouseleave', function () {
      updateStars(currentValue);
    });

    if (currentValue > 0) updateStars(currentValue);

    container.appendChild(starsWrap);
    container.appendChild(hiddenInput);

    container.getValue = function () {
      return parseInt(hiddenInput.value, 10) || 0;
    };

    return container;
  }

  /* ============================================
     BAR CHART HELPER
     ============================================ */

  /**
   * Render a horizontal bar chart.
   * @param {HTMLElement} container
   * @param {Array<{ label: string, value: number }>} data
   * @param {number} maxValue
   */
  function renderBarChart(container, data, maxValue) {
    container.innerHTML = '';
    container.className = 'bar-chart';

    if (!data || data.length === 0) {
      container.innerHTML = '<p class="text-muted text-center">No data available</p>';
      return;
    }

    const max = maxValue || Math.max.apply(null, data.map(function (d) { return d.value; }));

    data.forEach(function (item) {
      const pct = max > 0 ? (item.value / max) * 100 : 0;
      const row = document.createElement('div');
      row.className = 'bar-chart__item';
      row.innerHTML =
        '<span class="bar-chart__label">' + sanitizeInput(item.label) + '</span>' +
        '<div class="bar-chart__track"><div class="bar-chart__fill" style="width:0%"></div></div>' +
        '<span class="bar-chart__value">' + formatNumber(item.value, 1) + '</span>';
      container.appendChild(row);

      requestAnimationFrame(function () {
        row.querySelector('.bar-chart__fill').style.width = pct + '%';
      });
    });
  }

  /**
   * Render star rating distribution chart.
   * @param {HTMLElement} container
   * @param {Object|Array} distribution - { 1: n, 2: n, ... } or array
   */
  function renderRatingDistribution(container, distribution) {
    container.innerHTML = '';
    container.className = 'rating-distribution';

    let counts = distribution;
    if (Array.isArray(distribution)) {
      counts = {};
      distribution.forEach(function (val, i) {
        counts[i + 1] = val;
      });
    }

    const total = Object.values(counts).reduce(function (sum, n) { return sum + n; }, 0);

    for (let star = 5; star >= 1; star--) {
      const count = counts[star] || 0;
      const pct = total > 0 ? (count / total) * 100 : 0;
      const row = document.createElement('div');
      row.className = 'rating-bar';
      row.innerHTML =
        '<span class="rating-bar__stars">' + '&#9733;'.repeat(star) + '</span>' +
        '<div class="rating-bar__track"><div class="rating-bar__fill" style="width:0%"></div></div>' +
        '<span class="rating-bar__count">' + count + '</span>';
      container.appendChild(row);

      requestAnimationFrame(function () {
        row.querySelector('.rating-bar__fill').style.width = pct + '%';
      });
    }
  }

  /* ============================================
     ADMIN LAYOUT HELPERS
     ============================================ */

  /**
   * Protect admin pages — redirect to login if not authenticated.
   */
  function requireAdminAuth() {
    if (!window.API.isAuthenticated()) {
      window.location.href = 'admin-login.html';
      return false;
    }
    return true;
  }

  /**
   * Initialize admin sidebar navigation and mobile toggle.
   * @param {string} activePage - Current page identifier
   */
  function initAdminSidebar(activePage) {
    const sidebar = document.querySelector('.admin-sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    const toggle = document.querySelector('.sidebar-toggle');

    document.querySelectorAll('.admin-nav__link').forEach(function (link) {
      if (link.dataset.page === activePage) {
        link.classList.add('active');
      }
    });

    if (toggle && sidebar) {
      toggle.addEventListener('click', function () {
        sidebar.classList.toggle('is-open');
        if (overlay) overlay.classList.toggle('is-visible');
      });
    }

    if (overlay && sidebar) {
      overlay.addEventListener('click', function () {
        sidebar.classList.remove('is-open');
        overlay.classList.remove('is-visible');
      });
    }

    const closeButton = document.querySelector('.sidebar-close');
    if (closeButton && overlay && sidebar) {
      closeButton.addEventListener('click', function () {
        sidebar.classList.remove('is-open');
        overlay.classList.remove('is-visible');
      });
    }

    const logoutBtn = document.querySelector('[data-logout]');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function () {
        window.API.clearAuthToken();
        showToast('Logged out successfully', 'success');
        setTimeout(function () {
          window.location.href = 'admin-login.html';
        }, 800);
      });
    }
  }

  /**
   * Show form field error.
   * @param {HTMLElement} input
   * @param {string} message
   */
  function showFieldError(input, message) {
    input.classList.add('is-error');
    let errorEl = input.parentNode.querySelector('.form-error');
    if (!errorEl) {
      errorEl = document.createElement('p');
      errorEl.className = 'form-error';
      input.parentNode.appendChild(errorEl);
    }
    errorEl.textContent = message;
  }

  /**
   * Clear form field error.
   * @param {HTMLElement} input
   */
  function clearFieldError(input) {
    input.classList.remove('is-error');
    const errorEl = input.parentNode.querySelector('.form-error');
    if (errorEl) errorEl.remove();
  }

  /* ============================================
     EXPORTS
     ============================================ */

  window.UI = {
    sanitizeInput,
    stripHtml,
    isNotEmpty,
    isValidEmail,
    debounce,
    setButtonLoading,
    getInitials,
    formatNumber,
    getQueryParams,
    showToast,
    openModal,
    confirmDialog,
    createButton,
    createCard,
    createStarRating,
    renderBarChart,
    renderRatingDistribution,
    requireAdminAuth,
    initAdminSidebar,
    showFieldError,
    clearFieldError
  };
})();
