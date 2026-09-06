# RenT — Rent Tracker

RenT is a mobile-first Progressive Web App (PWA) to manage one apartment's rent, recurring services, lease information and documents.

## Current features

- Monthly tracking for **Rent**, **Mantto**, and **Casa Club**
- Default recurring service amounts: **Mantto $1,800 MXN** and **Casa Club $800 MXN**
- Paid / pending status and monthly outstanding total
- Payment date, amount, method and note
- Annual payment history
- Historical rent checks imported from the previous manual tracker
- Tenant transition notes for August / September 2026
- Tenant and lease dates
- Deposit tracking
- Outstanding administration fee tracking
- Upload and store contracts, receipts, IDs and other PDFs/images locally
- Export / import a complete JSON backup
- Offline support via service worker
- Installable as a mobile PWA
- Custom RenT app icon and logo

## Privacy

RenT is local-first. Payment and contract data are stored in the browser on the device. Uploaded documents are stored in IndexedDB. There is no cloud backend in this version.

Use **Más → Exportar respaldo** periodically because browser data can be cleared when changing devices or browser settings.

## GitHub Pages deployment

This app is static and can be hosted directly from GitHub Pages:

1. Open **Settings → Pages** in this repository.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Select **main** and **/(root)**.
4. Save and wait for the Pages URL to become available.
5. Open the URL on Android Chrome and choose **Install app** / **Add to Home screen**.

## Repository

Built as a lightweight HTML/CSS/JavaScript PWA with no external framework or backend dependency.
