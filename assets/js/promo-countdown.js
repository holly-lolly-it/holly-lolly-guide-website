(function () {
  var END_TIME = new Date('2026-06-01T00:00:00+03:00').getTime();

  var expiredMessages = {
    ru: 'Акция завершена',
    en: 'Offer ended'
  };

  function getLocale() {
    var lang = (document.documentElement.lang || 'ru').toLowerCase();
    return lang.indexOf('en') === 0 ? 'en' : 'ru';
  }

  function pad(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function render(wrappers) {
    var diff = Math.max(0, END_TIME - Date.now());
    var days = Math.floor(diff / 86400000);
    var hours = Math.floor((diff / 3600000) % 24);
    var minutes = Math.floor((diff / 60000) % 60);
    var seconds = Math.floor((diff / 1000) % 60);
    var values = { days: days, hours: hours, minutes: minutes, seconds: seconds };
    var expired = diff === 0;
    var locale = getLocale();

    wrappers.forEach(function (wrapper) {
      var messageEl = wrapper.querySelector('[data-countdown-message]');
      if (messageEl && expired) {
        messageEl.textContent = expiredMessages[locale];
      }

      Object.keys(values).forEach(function (unit) {
        var els = wrapper.querySelectorAll('[data-unit="' + unit + '"]');
        var next = pad(values[unit]);
        els.forEach(function (el) {
          if (el.textContent !== next) {
            el.textContent = next;
            if (el.classList.contains('countdown-number')) {
              el.classList.remove('tick');
              void el.offsetWidth;
              el.classList.add('tick');
            }
          }
        });
      });
    });

    return !expired;
  }

  function initSticky(stickyWrapper) {
    var host = stickyWrapper.closest('.countdown-sticky-host');
    if (!host) return;

    // Watch the hero section, not a sentinel inside the card.
    // The sentinel-inside-card approach fails on mobile because the card
    // is taller than the viewport, so the sentinel starts below the fold
    // and the observer fires "not intersecting" immediately on load.
    var heroSection = host.closest('#hero-section');
    if (!heroSection) return;

    function applySticky() {
      // Capture natural height before the compact sticky styles shrink it.
      if (!host.dataset.stickyHeight) {
        host.dataset.stickyHeight = String(stickyWrapper.offsetHeight);
      }
      host.style.minHeight = host.dataset.stickyHeight + 'px';
      stickyWrapper.classList.add('countdown-wrapper--sticky');
    }

    function removeSticky() {
      stickyWrapper.classList.remove('countdown-wrapper--sticky');
      host.style.minHeight = '';
      delete host.dataset.stickyHeight;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            removeSticky();
          } else {
            applySticky();
          }
        });
      },
      { root: null, rootMargin: '0px', threshold: 0 }
    );

    observer.observe(heroSection);

    window.addEventListener('resize', function () {
      // Recapture height on resize when not yet sticky.
      if (!stickyWrapper.classList.contains('countdown-wrapper--sticky')) {
        delete host.dataset.stickyHeight;
      }
    });
  }

  function initFanSticky() {
    var fans = document.querySelectorAll('[data-fan-sticky]');
    if (!fans.length || typeof IntersectionObserver === 'undefined') return;

    fans.forEach(function (fan) {
      var sentinel = fan.nextElementSibling;
      if (!sentinel || !sentinel.classList.contains('hero-discount-fan-sentinel')) return;

      // Sticky: show fixed fan when hero section leaves viewport.
      var heroSection = document.getElementById('hero-section');
      if (heroSection) {
        var stickyObserver = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                fan.classList.remove('hero-discount-fan--sticky');
              } else {
                fan.classList.add('hero-discount-fan--sticky');
              }
            });
          },
          { root: null, rootMargin: '0px', threshold: 0 }
        );
        stickyObserver.observe(heroSection);
      }

      // Hide: slide the fan out when the telegram CTA section comes into view.
      var telegramSection = document.getElementById('telegram');
      if (telegramSection) {
        var hideObserver = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                fan.classList.add('hero-discount-fan--hidden');
              } else {
                fan.classList.remove('hero-discount-fan--hidden');
              }
            });
          },
          { root: null, rootMargin: '0px', threshold: 0.05 }
        );
        hideObserver.observe(telegramSection);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initFanSticky();

    var wrappers = document.querySelectorAll('[data-countdown]');
    if (!wrappers.length) return;

    render(wrappers);

    wrappers.forEach(function (wrapper) {
      if (wrapper.hasAttribute('data-countdown-sticky')) {
        initSticky(wrapper);
      }
    });

    setInterval(function () {
      render(wrappers);
    }, 1000);
  });
})();
