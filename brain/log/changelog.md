# Changelog

Chronological log of shipped work, milestones, and notable decisions.
Add an entry every time something ships or a significant decision is made.

## Format

```
## YYYY-MM-DD — [title]
- What shipped / what was decided
- PR: #N or commit: `abc1234`
- Notes / follow-ups
```

---

## 2025-06 — Project started

- Arkie concept defined: sunny spot finder for Northern European cities
- Tech stack chosen: React + Cesium + Google Places API + Vercel

---

## 2025 — Core map features shipped

- `core` — Cesium globe with OSM buildings + terrain + real-time sun lighting
- `core` — Place list + detail card (swipe up pattern)
- `core` — Filter: open/closed, outdoor seating, sunny/shade
- `core` — Show current location on map
- `core` — Show Berlin as default when no GPS
- `core` — Date & time picker for planning ahead
- `core` — Legal pages (privacy policy + ToS, GDPR compliant)

---

## 2025 — Cache-first query strategy (ADR-001)

- `3da6281` — debounce nearby places 400ms
- `a82e8d5` — snap bounds to ~100m grid
- `4a88e1d` — staleTime Infinity
- `8236094` — remove no-store header from place detail

---

## 2025 — Zoom + interaction fixes

- `c96541e` — restore pinch zoom on mobile, center-based mouse wheel zoom
- `6142537` — fix SwipeUp iOS Safari bugs + Playwright e2e suite added

---

## 2025 — Architecture

- `c26af50` — migrate state management to Zustand (ADR-002)
- `6ea16d4` — add CLAUDE.md

---

## 2025-11 — Beta launch

- Beta testing programme started (10–15 friends & family testers)
- WhatsApp community set up for feedback

---

## 2025 — Feature completions

- `d29a8f1` — sunny places filter
- `8fea625` — show only places with operational status (hide permanently closed)
- `1234781` — remove duplicate book button
- `bf070e0` — put buttons in one line
- `83e3fe0` — fix "closes soon" showing wrong when next day
- `209c162` — generate translation table for review

---

## 2025 — Analytics & tracking

- `b2d63ef` — PostHog analytics added
- `304ab50` — Vercel analytics (later removed)
- `8d208c7` — remove Vercel analytics (`8d208c7`)

---

## 2025 — UI polish

- `a3a2a5d` — improve date and time visibility
- `ecd2a50` — change date display to 2-digit format
- `63f3934` — small interface adjustments

---

## 2025 — Install prompt / PWA

- `0b60a93` — convert site to PWA
- `59f9b6d` — add onboarding / install prompt
- `b737da9` — update install prompt counter logic
- `0b60a93` — add preview setup

---

## 2026-04 — Social content (beta tester recruitment)

- Posts published 02–06 April 2026 (see `brain/research/beta-feedback.md`)

---

## 2026 — PWA icons + Android

- `7336617` — add PWA icons
- `079c28d` — fix PWA setup
- `222491b` — add maskable icon for Android
- `69a8cf6` — change Android PWA bar colors

---

_Add new entries below this line as work ships._
