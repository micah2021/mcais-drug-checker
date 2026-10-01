# MCAIS Nigeria Drug Checker

Nigeria-focused pilot web app for medicine safety awareness.

## Phase 1 (implemented in this PR)

### 1) Verification hardening
- NAFDAC code input normalization/validation
- Explicit verification statuses: `authentic`, `suspect`, `unknown`, `pending_review`
- Optional packaging image hook with metadata capture and manual-review-ready status
- Basic anti-abuse checks (input length, image MIME/type, size limits)

### 2) Report Fake workflow
- User report form for suspected fake drugs
- Supported fields:
  - Product name (required)
  - NAFDAC code (optional)
  - Location text and optional coordinates
  - Description (required)
  - Optional photo
  - Reporter contact (optional)
- Reports are persisted to browser storage for pilot use
- New reports default to moderation state `pending`

### 3) Crowd-sourced alert layer
- Public-safe incident points exposed to UI via map/list-ready data shape
- Alerts list shows moderation tags (`pending`, `verified`, `rejected`)
- Minimal internal moderation toggle to update report state

### 4) Pilot readiness polish
- Event logging via `console.info` for key workflows:
  - `verification_request`
  - `fake_drug_report_submitted`
- UX copy tuned for Nigerian context while avoiding over-claiming certainty

## Phase 2 scaffolding (placeholder only)
- Stockist model placeholder (`name`, `coordinates`, `verification_status`, `last_verified_at`)
- Stockist query service boundary placeholder for nearest-stockist lookup
- Admin validation hooks prepared for reports and stockists

## Phase 3 scaffolding (placeholder only)
- SMS command design placeholder:
  - `CHECK <code>`
  - `REPORT <code> <location> <description>`

## Local development

Install dependencies:

```bash
npm install
```

Start app:

```bash
npm start
```

Run tests:

```bash
npm test -- --watchAll=false
```

Build:

```bash
npm run build
```

## Notes
- Current report persistence is local browser storage for pilot/demo use.
- Production deployments should connect these flows to a backend API and moderated datastore.
