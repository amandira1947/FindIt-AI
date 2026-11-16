# FindIt AI — Frontend Starter

A responsive HTML/CSS/JavaScript starter for a Lost-and-Found Matching Agent.

## Included in this first stage
- Responsive blue dashboard design
- Lost-item and found-item reporting form
- Image upload preview and basic image compression
- Browser-local report storage using localStorage
- Search and filter for reports
- Basic rule-based matching suggestions using item name, description, category, colour, location and date
- Match review message

## Important limitations
This is the **frontend demo stage**. Reports are saved only in the current browser on the current device.
- It does not yet have real user accounts or a shared cloud database.
- The similarity percentage is a simple heuristic, not a trained AI confidence score.
- Uploaded images are displayed, but the app does not yet understand or compare image contents.
- Location matching currently compares the location text. It does not use GPS or a map.
- Do not use this demo to publish sensitive item details or private contact information.

These capabilities will be added in later stages with a Python backend, Supabase, AI text/image matching and optional location services.

## Run the project

### Option A — VS Code with Live Server
1. Extract the ZIP file.
2. Open the `findit_ai_frontend` folder in VS Code.
3. Install the **Live Server** extension.
4. Right-click `index.html` and choose **Open with Live Server**.

### Option B — Python local server
1. Install Python 3 if it is not already installed.
2. Open a terminal in this folder.
3. Run:

   ```bash
   python -m http.server 8000
   ```

4. Open `http://localhost:8000` in your browser.

## Test it
1. Click **I lost something** and submit a sample lost report.
2. Click **I found something** and submit a similar found report.
3. Open **Possible matches** to see the suggested pair.
4. Open **All reports** to search and filter reports.
5. Refresh the browser. Your demo reports should remain in that browser.

## Project files
- `index.html` — page structure and forms
- `style.css` — visual design and responsive layout
- `script.js` — navigation, image preview, local storage and demo matching
