'use client';

import { ArrowRight } from 'lucide-react';

export default function Security() {
  return (
    <section className="sec-section">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=DM+Sans:wght@300;400;500&display=swap');

        .sec-section {
          background: #FFFFFF;
          font-family: 'DM Sans', sans-serif;
          font-weight: 300;
          position: relative;
          overflow: hidden;
        }
        .sec-wrap {
          max-width: 1280px;
          margin: 0 auto;
        }

        /* ── HEADER ── */
        .sec-header {
          padding: 64px 24px 0;
          margin-bottom: 48px;
        }
        .sec-header-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        .sec-eyebrow {
          font-size: 1rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #b8924a;
          font-weight: 600;
          display: block;
          margin-bottom: 18px;
        }
        .sec-h2 {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 600;
          line-height: 0.97;
          letter-spacing: -0.02em;
          color: #1a1410;
          margin: 0;
          font-size: 2.6rem;
        }
        .sec-header-p {
          font-size: 1rem;
          line-height: 1.78;
          color: #3d3428;
          margin: 0;
        }

        /* ── PROMISE BLOCK ── */
        .sec-promise {
          padding: 48px 24px;
          border-top: 2px solid rgba(26,20,16,0.2);
        }
        .sec-promise-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
        }
        .sec-promise-h3 {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 500;
          line-height: 1.1;
          letter-spacing: -0.02em;
          color: #1a1410;
          margin: 0 0 16px;
          font-size: 1.6rem;
        }
        .sec-promise-p {
          font-size: 0.95rem;
          line-height: 1.75;
          color: #2e2820;
          margin: 0;
        }

        /* ── PRIVACY LISTS ── */
        .sec-privacy {
          padding: 48px 24px;
          border-top: 2px solid rgba(26,20,16,0.2);
          border-bottom: 2px solid rgba(26,20,16,0.2);
        }
        .sec-privacy-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px;
        }
        .sec-list-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 600;
          font-size: 1.4rem;
          margin: 0 0 20px;
          color: #1a1410;
        }
        .sec-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .sec-list li {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid rgba(26,20,16,0.08);
          font-size: 0.92rem;
          color: #1a1410;
        }
        .sec-x {
          color: #c45c5c;
          font-size: 1rem;
          font-weight: 700;
          flex-shrink: 0;
          width: 16px;
          text-align: center;
        }
        .sec-check {
          color: #b8924a;
          font-size: 1rem;
          font-weight: 700;
          flex-shrink: 0;
          width: 16px;
          text-align: center;
        }

        /* ── CTA ── */
        .sec-cta {
          padding: 48px 24px 64px;
          text-align: center;
        }
        .sec-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem;
          font-weight: 500;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          color: #faf8f4;
          background: #1a1410;
          padding: 14px 32px;
          text-decoration: none;
          transition: background 0.22s;
          border: none;
          cursor: pointer;
        }
        .sec-btn:hover { background: #b8924a; }

        /* ══════════════════════════════
           TABLET ≥ 640px
        ══════════════════════════════ */
        @media (min-width: 640px) {
          .sec-header { padding: 80px 40px 0; margin-bottom: 56px; }
          .sec-h2 { font-size: 3.4rem; }
          .sec-header-p { font-size: 1.05rem; }
          .sec-promise { padding: 52px 40px; }
          .sec-promise-h3 { font-size: 1.9rem; }
          .sec-promise-p { font-size: 1rem; }
          .sec-privacy { padding: 52px 40px; }
          .sec-privacy-grid { grid-template-columns: 1fr 1fr; gap: 48px; }
          .sec-cta { padding: 52px 40px 80px; }
          .sec-btn { font-size: 0.82rem; padding: 15px 34px; }
        }

        /* ══════════════════════════════
           LAPTOP ≥ 900px
        ══════════════════════════════ */
        @media (min-width: 900px) {
          .sec-header { padding: 100px 56px 0; margin-bottom: 64px; }
          .sec-header-grid {
            grid-template-columns: 1fr 1fr;
            gap: 56px;
            align-items: end;
          }
          .sec-h2 { font-size: 4.2rem; }
          .sec-header-p { font-size: 1.08rem; max-width: 40ch; }
          .sec-eyebrow { font-size: 1.15rem; }
          .sec-promise { padding: 60px 56px; }
          .sec-promise-grid { grid-template-columns: 1fr 1fr; gap: 56px; align-items: start; }
          .sec-promise-h3 { font-size: 2rem; }
          .sec-promise-p { font-size: 1.02rem; max-width: 48ch; }
          .sec-privacy { padding: 60px 56px; }
          .sec-privacy-grid { gap: 56px; }
          .sec-list-title { font-size: 1.6rem; }
          .sec-list li { font-size: 0.95rem; padding: 12px 0; }
          .sec-cta { padding: 60px 56px 100px; }
        }

        /* ══════════════════════════════
           DESKTOP ≥ 1200px
        ══════════════════════════════ */
        @media (min-width: 1200px) {
          .sec-header { padding: 128px 72px 0; margin-bottom: 80px; }
          .sec-header-grid { gap: 80px; }
          .sec-h2 { font-size: 5.4rem; }
          .sec-header-p { font-size: 1.12rem; max-width: 42ch; }
          .sec-eyebrow { font-size: 1.2rem; margin-bottom: 24px; }
          .sec-promise { padding: 80px 72px; }
          .sec-promise-grid { gap: 80px; }
          .sec-promise-h3 { font-size: 2.2rem; }
          .sec-promise-p { font-size: 1.06rem; }
          .sec-privacy { padding: 80px 72px; }
          .sec-privacy-grid { gap: 80px; }
          .sec-list-title { font-size: 1.8rem; }
          .sec-list li { font-size: 1rem; }
          .sec-cta { padding: 72px 72px 128px; }
          .sec-btn { font-size: 0.85rem; padding: 16px 40px; }
        }

        /* ══════════════════════════════
           XL ≥ 1536px
        ══════════════════════════════ */
        @media (min-width: 1536px) {
          .sec-header { padding: 144px 96px 0; margin-bottom: 96px; }
          .sec-header-grid { gap: 96px; }
          .sec-h2 { font-size: 6.2rem; }
          .sec-header-p { font-size: 1.18rem; max-width: 44ch; }
          .sec-eyebrow { font-size: 1.3rem; }
          .sec-promise { padding: 96px 96px; }
          .sec-promise-grid { gap: 96px; }
          .sec-promise-h3 { font-size: 2.5rem; }
          .sec-promise-p { font-size: 1.12rem; }
          .sec-privacy { padding: 96px 96px; }
          .sec-privacy-grid { gap: 96px; }
          .sec-list-title { font-size: 2rem; }
          .sec-list li { font-size: 1.06rem; }
          .sec-cta { padding: 80px 96px 144px; }
        }
      `}</style>

      <div className="sec-wrap">

        {/* ── HEADER ── */}
        <div className="sec-header">
          <div className="sec-header-grid">
            <div>
              <span className="sec-eyebrow">Security & Privacy</span>
              <h2 className="sec-h2">
                Your memories are
                <br />
                <em style={{ fontStyle: 'italic', color: '#b8924a' }}>not a rented space.</em>
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '6px' }}>
              <p className="sec-header-p">
                What belongs to your family stays with your family.
                No surprises, no hidden terms, no strings attached.
              </p>
            </div>
          </div>
        </div>

        {/* ── PROMISE ── */}
        <div className="sec-promise">
          <div className="sec-promise-grid">
            <div>
              <h3 className="sec-promise-h3">
                Stop paying? Your memories stay.
              </h3>
              <p className="sec-promise-p">
                You should never have to keep paying just to hold onto
                your own history. If your plan changes, your library
                stays exactly where it is. Creation pauses — nothing
                gets deleted.
              </p>
            </div>
            <div>
              <h3 className="sec-promise-h3">
                Built to last generations.
              </h3>
              <p className="sec-promise-p">
                Your files stay accessible as technology evolves.
                And when you want something physical, your digital
                library becomes a printed book, a canvas, or a framed
                photo — made to outlast any server.
              </p>
            </div>
          </div>
        </div>

        {/* ── PRIVACY LISTS ── */}
        <div className="sec-privacy">
          <div className="sec-privacy-grid">
            <div>
              <h3 className="sec-list-title">We will never</h3>
              <ul className="sec-list">
                <li><span className="sec-x">×</span> Sell your data</li>
                <li><span className="sec-x">×</span> Show advertisements</li>
                <li><span className="sec-x">×</span> Use public feeds or profiles</li>
                <li><span className="sec-x">×</span> Share your content with third parties</li>
              </ul>
            </div>
            <div>
              <h3 className="sec-list-title">Built for</h3>
              <ul className="sec-list">
                <li><span className="sec-check">✓</span> Private family libraries</li>
                <li><span className="sec-check">✓</span> Full family control over access</li>
                <li><span className="sec-check">✓</span> Long-term continuity and preservation</li>
                <li><span className="sec-check">✓</span> Funded by families, not advertisers</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="sec-cta">
          <a href="/how-it-works" className="sec-btn">
            See how it works <ArrowRight size={14} />
          </a>
        </div>

      </div>
    </section>
  );
}