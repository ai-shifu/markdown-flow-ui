/**
 * Gamma-style font-size scaling system for iframe sandbox.
 *
 * Injects CSS + JS into an iframe document so that:
 * 1. A base font-size is computed from the viewport: clamp(12px, width/48, height*3%)
 * 2. The CSS variable --mdf-fs drives html/body font-size; all em children follow.
 * 3. When content overflows the viewport, a compression ratio shrinks font-size.
 * 4. ResizeObserver / MutationObserver keep everything in sync.
 */

/** Window extension for the scaling system injected into the iframe. */
export interface ScalingWindow extends Window {
  __mdf_triggerFitContent?: () => void;
  __mdf_cleanupScaling?: () => void;
}

const SCALING_CSS = `
/* Gamma-style scaling base */
:root { --mdf-fs: 16px; }

*, *::before, *::after {
  box-sizing: border-box;
  overflow-wrap: break-word;
  word-break: break-word;
}

html, body {
  font-size: var(--mdf-fs);
  overflow-x: hidden;
  overflow-y: auto;
}

/* Force sandbox content children into the em scaling chain */
.sandbox-container > * {
  height: auto !important;
  min-height: 100vh !important;
  overflow: hidden !important;
  font-size: var(--mdf-fs) !important;
}

/* Hide scrollbars inside scaled content — overflow handled by compression */
.sandbox-container *::-webkit-scrollbar { display: none; }
.sandbox-container * { scrollbar-width: none; -ms-overflow-style: none; }
`;

const SCALING_JS = `
!function() {
  var fitTimer = null;
  var baseFontSize = 16;
  var compressionRatio = 1;
  var lastCompressTime = 0;
  var MIN_FONT_PX = 8;

  function applyFs(fs) {
    document.documentElement.style.setProperty('--mdf-fs', fs + 'px');
    if (document.body) document.body.style.fontSize = fs + 'px';
  }

  function fitContent() {
    var container = document.querySelector('.sandbox-container');
    if (!container || !container.firstElementChild) return;

    var slide = container.firstElementChild;
    var viewH = document.documentElement.clientHeight;
    var viewW = document.documentElement.clientWidth;
    var naturalH = slide.offsetHeight;
    var naturalW = slide.scrollWidth;

    var overflowH = naturalH > viewH + 4;
    var overflowW = naturalW > viewW + 4;

    if (overflowH || overflowW) {
      var now = Date.now();
      if (now - lastCompressTime < 300) return;
      lastCompressTime = now;

      var ratioH = overflowH ? (viewH / naturalH) : 1;
      var ratioW = overflowW ? (viewW / naturalW) : 1;
      compressionRatio = compressionRatio * Math.min(ratioH, ratioW);
      compressionRatio = Math.max(compressionRatio, MIN_FONT_PX / baseFontSize);
      applyFs(baseFontSize * compressionRatio);

      if (baseFontSize * compressionRatio <= MIN_FONT_PX * 1.1 && viewH < 400) {
        document.documentElement.style.overflowY = 'hidden';
        if (document.body) document.body.style.overflowY = 'hidden';
      }
    } else {
      if (compressionRatio < 1 && naturalH > 0) {
        var maxRatio = viewH * compressionRatio / naturalH;
        if (maxRatio >= 1) {
          compressionRatio = 1;
        } else if (maxRatio > compressionRatio) {
          compressionRatio = maxRatio;
        }
        applyFs(baseFontSize * compressionRatio);
      }
      document.documentElement.style.overflowY = '';
      if (document.body) document.body.style.overflowY = '';
    }
  }

  function syncFs() {
    var w = document.documentElement.clientWidth;
    var h = document.documentElement.clientHeight;
    baseFontSize = Math.min(Math.max(12, w / 48), h * 0.03);
    applyFs(Math.max(baseFontSize * compressionRatio, MIN_FONT_PX));
    clearTimeout(fitTimer);
    fitTimer = setTimeout(fitContent, 60);
  }

  var rootResizeObs = null;
  if (window.ResizeObserver) {
    rootResizeObs = new ResizeObserver(syncFs);
    rootResizeObs.observe(document.documentElement);
  } else {
    window.addEventListener('resize', syncFs);
  }
  syncFs();

  var slideResizeObs = null;
  function observeSlide(slide) {
    if (!window.ResizeObserver) return;
    if (slideResizeObs) slideResizeObs.disconnect();
    slideResizeObs = new ResizeObserver(function() {
      clearTimeout(fitTimer);
      fitTimer = setTimeout(fitContent, 50);
    });
    slideResizeObs.observe(slide);
  }

  var mutationObs = null;
  function startFitObserver() {
    var c = document.querySelector('.sandbox-container');
    if (!c) return;
    mutationObs = new MutationObserver(function(mutations) {
      var hasNewContent = false;
      mutations.forEach(function(m) {
        m.addedNodes.forEach(function(node) {
          if (node.nodeType === 1 &&
              node.tagName !== 'STYLE' && node.tagName !== 'SCRIPT') {
            hasNewContent = true;
            observeSlide(node);
          }
        });
      });
      if (hasNewContent) {
        compressionRatio = 1;
        lastCompressTime = 0;
        applyFs(baseFontSize);
      }
      clearTimeout(fitTimer);
      fitTimer = setTimeout(fitContent, 80);
    });
    mutationObs.observe(c, { childList: true });
  }

  if (document.readyState !== 'loading') {
    startFitObserver();
  } else {
    document.addEventListener('DOMContentLoaded', startFitObserver);
  }

  window.__mdf_triggerFitContent = function() {
    clearTimeout(fitTimer);
    fitTimer = setTimeout(fitContent, 100);
  };

  window.__mdf_cleanupScaling = function() {
    clearTimeout(fitTimer);
    if (rootResizeObs) rootResizeObs.disconnect();
    if (slideResizeObs) slideResizeObs.disconnect();
    if (mutationObs) mutationObs.disconnect();
    window.removeEventListener('resize', syncFs);
    delete window.__mdf_triggerFitContent;
    delete window.__mdf_cleanupScaling;
  };
}();
`;

/**
 * Inject the Gamma-style font-size scaling system into an iframe document.
 * Must be called AFTER blackboard vendor libraries (Tailwind/DaisyUI/GSAP)
 * so that the scaling CSS rules take precedence.
 */
export function injectScalingSystem(doc: Document): void {
  const styleEl = doc.createElement("style");
  styleEl.id = "mdf-scaling-style";
  styleEl.textContent = SCALING_CSS;
  doc.head.appendChild(styleEl);

  const scriptEl = doc.createElement("script");
  scriptEl.id = "mdf-scaling-script";
  scriptEl.textContent = SCALING_JS;
  doc.head.appendChild(scriptEl);
}
