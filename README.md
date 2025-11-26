**Project Overview**

This is "Happy Notes" — a lightweight, client-side notes web app designed for fast note-taking and easy browsing. Notes are represented as colorful cards with features like pinning, starring, searching, and grouping by year/month. Data is stored locally in the browser using `localStorage`, making the app simple to run without a server.

**Quick Features**
- **Add / Edit / Delete Notes:** Create notes with a title and body, edit existing notes, or delete them.
- **Colorful Cards:** Choose a pastel background color for each note to make the UI friendly and scannable.
- **Pin & Star:** Pin important notes to the top of their month; star notes for emphasis.
- **Search:** Live search by title and body.
- **Grouping:** Notes are grouped by **Year** and then by **Month** for quick browsing.
- **Animations & Micro-interactions:** Subtle entry animations, hover reveals, and button effects.
- **Local Persistence:** Notes are saved in `localStorage` under the key `notes_app_v1`.

**Files (What’s in the project)**
- **`index.html`**: Main UI markup and app shell.
- **`style.css`**: All visual styles, layout, grouping headers, and animations.
- **`app.js`**: App logic — data model, rendering, event handling, and localStorage persistence.
- **`README.md`**: Project documentation and usage instructions.

**How to Run (Development / Local)**n+- Open the folder and double-click `index.html` OR run a local server.

From PowerShell (recommended when testing):
```powershell
# from the project folder
Start-Process .\index.html
# or serve with Python's simple HTTP server
python -m http.server 8000
# then open http://localhost:8000 in a browser
```

**Usage Notes**
- Click `Add Note` after entering a title/body. Use Ctrl/Cmd+Enter in the body to quickly save.
- Click the small color swatches to pick a background color for a note.
- Pin (`📌`) and Star (`⭐`) are available on each card. Pinned and starred notes appear first inside their month.
- Notes are grouped under year and month headers. Each month shows a count of notes.

**Data Model**
Each note is stored as a JSON object with this shape:

```json
{
	"id": "<unique-id>",
	"title": "...",
	"body": "...",
	"color": "#...",
	"created": 1680000000000,
	"updated": 1680000000000,
	"pinned": false,
	"starred": false
}
```

Notes are stored in `localStorage` as an array under the key `notes_app_v1`.

**Development Notes**
- The main rendering function is `renderNotes()` in `app.js`. It reads the notes array, filters by search, groups by year and month, sorts notes within each month (pinned → starred → newest), and renders DOM nodes using the `<template id="noteTemplate">` in `index.html`.
- To change grouping behavior (for example, group by `updated` instead of `created`), update the grouping key in `renderNotes()`.
- Color palette and UI constants are defined near the top of `app.js` and `style.css`.

**Extending the App — Suggested Next Features**
- **Tags & Filters:** Add tag input and filter UI to categorize notes.
- **Markdown Support & Preview:** Use `marked.js` to allow formatted notes with live preview.
- **Export / Import JSON:** Add buttons to export the `notes_app_v1` JSON and import it back.
- **Image Attachments:** Add an upload/drag-and-drop area and store images as data URLs or in IndexedDB.
- **Trash & Versioning:** Implement a soft-delete trash and basic version history to undo changes.
- **PWA & Offline:** Add a Web App Manifest and Service Worker; migrate storage to IndexedDB for offline reliability and larger storage.
- **Cloud Sync:** Add Firebase Auth + Firestore for cross-device sync.

**Accessibility & Keyboard Shortcuts**
- Current app includes basic keyboard support: `Ctrl/Cmd+Enter` to save while editing the note body.
- Suggested accessibility improvements: Add ARIA labels to interactive elements, ensure color contrast, add focus-visible styles, and provide keyboard shortcuts (e.g., `N` to create a new note, `/` to focus search).

**Design Decisions & Tradeoffs**
- LocalStorage was chosen for simplicity. It is easy to use and requires no backend, but has size limits (~5–10MB depending on browser) and is device-local only.
- For medium/large data or attachments, migrating to IndexedDB or a backend service is recommended.

**Roadmap**
- Small/Quick: Tags, Markdown preview, Export/Import, SVG icons.
- Medium: Image attachments, drag-and-drop ordering, Trash and versioning, keyboard shortcuts + accessibility polish.
- Advanced: PWA (offline), Firebase sync (cloud), and user accounts.

**Troubleshooting**
- If notes disappear, check browser `localStorage` for the key `notes_app_v1` (DevTools → Application → Local Storage).
- If the page looks unstyled, ensure `style.css` is present in the same folder as `index.html` and the font link (Google Fonts) can be loaded.

**License & Attribution**
- This project is provided without a license file. If you want an open-source license added (MIT/Apache), tell me which and I’ll add it.

**Contact / Next Steps**
- Tell me which feature from the Roadmap you’d like next and I’ll implement it: Tags & Filters, Markdown preview, Export/Import JSON, or Image attachments.

---
Generated by your assistant — happy to extend or convert this into a developer-oriented CONTRIBUTING guide if you plan to add more features.
