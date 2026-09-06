# RenT — Rent Tracker

RenT is a mobile-first Progressive Web App (PWA) for managing rent, recurring property services, lease information, promissory-note schedules, and local documents.

## RenT v1.1

- Separates **money to collect from the tenant** from **services the owner needs to pay**.
- Supports a **first payment made of first rent + security deposit**, with no promissory note for that first payment.
- Generates the remaining promissory-note schedule dynamically from the lease start date, rent due day, and number of notes.
- Tracks **Mantto** and **Casa Club** independently without adding them again to the tenant receivable when they are already included in the monthly rent.
- Tracks payment date, amount, method and notes.
- Shows yearly history, deposit status, administration fee status, and contract dates.
- Stores contracts, receipts, IDs and other PDFs/images locally in IndexedDB.
- Exports a complete JSON backup.
- Imports either a complete backup or a **private RenTConfig JSON** that updates contract settings without deleting existing payments or documents.
- Works offline and can be installed as a PWA.

## Privacy

The public repository contains only generic application code. Tenant names, contact details, contract values, payment history, receipts, and uploaded documents are intended to stay in the browser on the user's device.

For a real lease, load the private data through **Más → Importar respaldo o configuración**. Do not commit the private configuration JSON or lease documents to this public repository.

Use **Más → Exportar respaldo** periodically because local browser data can be cleared when changing devices or browser settings.

## GitHub Pages deployment

This app is static and can be hosted directly from GitHub Pages using `main` and `/(root)`. On Android Chrome, open the Pages URL and choose **Install app** / **Add to Home screen**.

## Technology

Lightweight HTML, CSS and JavaScript PWA with no external framework or cloud backend.
