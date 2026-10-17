'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { CONSENT_EVENT, readConsent, type Consent } from '@/lib/consent';

// The marketing tags (GTM, Meta, Spotify) load only after the visitor accepts cookies in the
// banner (CookieConsent); until then nothing here runs. The Reddit pixel runs inside GTM, whose
// Reddit tag has the account's real pixel ID (a copy that used to sit here had a typo in the ID,
// so its events went nowhere, and fixing it would have counted every visit twice).
// The tags are about 2.4 MB of script. On phones they used to run straight after 'load'
// (lazyOnload gets no idle phase on iOS), which is exactly when people make their first scrolls.
// Touch devices now wait for a pause: no scrolling for 1.5s after load, the first tap (so a
// visitor who taps straight through is still counted on this page), or 6s after the page was
// opened, whichever comes first. Desktop adds them after load (or 3s in, if photos are still
// loading), as before. Visits from an ad or campaign link (utm_*, gclid, fbclid, rdt_cid...) get
// them straight away, so attribution sees the landing URL.
const QUIET_MS = 1500;
const TOUCH_CAP_MS = 6000;
const DESKTOP_CAP_MS = 3000;
const CAMPAIGN = /[?&](utm_[a-z]+|gclid|gbraid|wbraid|fbclid|rdt_cid|msclkid|ttclid)=/i;

// Waits for the moment described above, then calls show() once, when the browser is idle.
// Returns a cleanup.
function schedule(show: () => void): () => void {
  const campaign = CAMPAIGN.test(window.location.search);
  const touch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  let quietTimer: ReturnType<typeof setTimeout> | undefined;
  let capTimer: ReturnType<typeof setTimeout> | undefined;
  let fallbackTimer: ReturnType<typeof setTimeout> | undefined;
  let idleId: number | undefined;
  let due = false;

  // Runs once: stop watching, then add the tags when the browser is next idle.
  const inject = () => {
    if (due) return;
    due = true;
    clearTimeout(quietTimer);
    clearTimeout(capTimer);
    window.removeEventListener('scroll', onScroll, true);
    window.removeEventListener('pointerdown', inject, true);
    window.removeEventListener('load', onLoad);
    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(show, { timeout: 2000 });
    } else {
      fallbackTimer = setTimeout(show, 150); // Safari has no requestIdleCallback
    }
  };

  // Every scroll restarts the quiet period. Captured, so scrolling inside the page's own
  // scrollers counts too (their scroll events don't bubble).
  const onScroll = () => {
    clearTimeout(quietTimer);
    quietTimer = setTimeout(inject, QUIET_MS);
  };

  const onLoad = () => {
    if (!touch) {
      inject();
      return;
    }
    quietTimer = setTimeout(inject, QUIET_MS);
    window.addEventListener('scroll', onScroll, { capture: true, passive: true });
  };

  // The caps count from when the page was opened, so slow photos can't hold the tags back.
  const sinceOpen = performance.now();
  if (campaign) {
    inject();
  } else {
    capTimer = setTimeout(inject, Math.max(0, (touch ? TOUCH_CAP_MS : DESKTOP_CAP_MS) - sinceOpen));
    if (touch) window.addEventListener('pointerdown', inject, { capture: true, passive: true });
    if (document.readyState === 'complete') onLoad();
    else window.addEventListener('load', onLoad, { once: true });
  }

  return () => {
    window.removeEventListener('load', onLoad);
    window.removeEventListener('scroll', onScroll, true);
    window.removeEventListener('pointerdown', inject, true);
    clearTimeout(quietTimer);
    clearTimeout(capTimer);
    clearTimeout(fallbackTimer);
    if (idleId !== undefined) window.cancelIdleCallback(idleId);
  };
}

export default function DeferredTags() {
  const [ready, setReady] = useState(false);

  // Only once the visitor has accepted: straight away if they did on an earlier visit, or the
  // moment they press Accept in the banner.
  useEffect(() => {
    let stop: (() => void) | undefined;
    const start = () => {
      if (!stop) stop = schedule(() => setReady(true));
    };
    if (readConsent() === 'granted') start();
    const onConsent = (e: Event) => {
      if ((e as CustomEvent<Consent>).detail === 'granted') start();
    };
    window.addEventListener(CONSENT_EVENT, onConsent);
    return () => {
      window.removeEventListener(CONSENT_EVENT, onConsent);
      stop?.();
    };
  }, []);

  // Nothing renders until the tags are due; then each <Script> adds its snippet once (by id).
  return (
    ready && (
      <>
        {/* 🟡 GOOGLE TAG MANAGER */}
        <Script id="gtm-head" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id=GTM-PWNN6NGL'+dl;
            f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-PWNN6NGL');
          `}
        </Script>

        {/* 🔵 META PIXEL */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '2096190511177765');
            fbq('track', 'PageView');
          `}
        </Script>

        {/* 🟢 SPOTIFY PIXEL */}
        <Script id="spotify-pixel" strategy="afterInteractive">
          {`
            (function(w, d){
              var id='spdt-capture', n='script';
              if (!d.getElementById(id)) {
                w.spdt =
                  w.spdt ||
                  function() {
                    (w.spdt.q = w.spdt.q || []).push(arguments);
                  };
                var e = d.createElement(n); e.id = id; e.async=1;
                e.src = 'https://pixel.byspotify.com/ping.min.js';
                var s = d.getElementsByTagName(n)[0];
                s.parentNode.insertBefore(e, s);
              }
              w.spdt('conf', { key: '21575df569e94d379a6107e35a8d3553' });
              w.spdt('view');
            })(window, document);
          `}
        </Script>
      </>
    )
  );
}
