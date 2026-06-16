# LifeLink — Hospital Organ Donation Platform

A static website (HTML, CSS, JavaScript) for a hospital organ donation platform. Donors register via a consent form with health details; hospitals can locate nearby hospitals with organs in stock and access donor details (hospital-only).

## Pages

- **Home** — Title, Abstract, Mission & Vision, Goal
- **About Us** — Main purpose of the project
- **FAQs** — Basic frequently asked questions (accordion)
- **Guidelines** — Open-source guidelines (WHO/NOTTO-style) for eligibility and ethics
- **Our Team** — Team members
- **Live Organ** — Map of nearby hospitals (organs in stock), filter panel (Organ donor details, Blood donor details, Registration, Donations), hospital-only access
- **Consent form** — Donor registration with health details

## How to run

1. Open the project folder in your editor.
2. **Option A:** Open `index.html` in a browser (file://). Note: `fetch()` for `data/donors.json` and `data/hospitals.json` may be blocked by some browsers when using file:// — use a local server if so.
3. **Option B (recommended):** Use a local server, e.g.:
   - VS Code: install “Live Server” and “Open with Live Server” on `index.html`.
   - Or run: `npx serve .` or `python -m http.server 8000` in the project folder, then open `http://localhost:8000`.

## Google Maps (Live Organ page)

The Live Organ page can show a map of hospitals with organs in stock.

1. Get a [Google Maps JavaScript API key](https://developers.google.com/maps/documentation/javascript/get-api-key).
2. Enable **Maps JavaScript API** for that key.
3. Open `live-organ.html` and replace `YOUR_GOOGLE_MAPS_API_KEY` in the script tag with your key:
   ```html
   <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_KEY&callback=initMap" async defer></script>
   ```
4. If you do not add a key, the page still works: it shows a list of nearby hospitals with organs in stock instead of the map.

## Hospital-only access (demo)

On the **Live Organ** page, full donor details and “Enter donor details” / “Check availability” are only shown after **hospital verification**.

- **Demo PIN:** `hospital123`
- Enter the PIN and click **Verify** to see hospital-only sections.

## Data

- **data/donors.json** — Sample organ donors (used on Live Organ).
- **data/hospitals.json** — Sample hospitals with lat/lng and organs in stock (used for the map/list).
- New registrations from the **Consent form** are stored in the browser’s **localStorage** (key: `lifelink_donors`) and appear in the Live Organ donor list for that browser.

## Tech

- HTML5, CSS3, JavaScript (no build step).
- No backend; all data is from JSON files and localStorage/sessionStorage for the demo.

## License

Use as needed for the project. Guidelines content is adapted from public WHO/NOTTO-style sources; cite them when reusing.
