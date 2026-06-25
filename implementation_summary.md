# Ustad Bukhari Poetry Web Application — Complete Implementation Guide

This guide documents the setup, execution, and development process of the **Ustad Bukhari Sindhi Poetry** web application, designed for students learning React.

---

## 🛠️ Step-by-Step Installation & Commands Run

Here is the exact sequence of commands executed on the terminal to set up and verify the React + Vite development environment:

### 1. Environment Verification
Ensure Node.js and NPM are installed on the system:
```bash
node --version
npm --version
```
*Output in this workspace:* Node `v25.2.1` and NPM `11.6.2`.

### 2. Researching the Boilerplate Options
Before starting, we inspected the official Vite scaffolding options:
```bash
npx -y create-vite --help
```
This showed the available templates, including `react` (JavaScript) and `react-ts` (TypeScript). Since JavaScript was requested, we selected the `react` template.

### 3. Scaffolding the React Project
Because the workspace directory `/home/sajjad/bukhari` already contained important folders like `resources/` and the ruleset `AGENT.md`, running `create-vite` directly on the root might have caused conflicts. 

To prevent data loss, we scaffolded the Vite boilerplate in a temporary folder:
```bash
npx -y create-vite temp-vite --template react --no-interactive
```
Then, we moved all generated files up to the root folder and cleaned up the temporary directory:
```bash
mv temp-vite/package.json temp-vite/vite.config.js temp-vite/index.html temp-vite/.oxlintrc.json temp-vite/.gitignore temp-vite/public temp-vite/src .
rm -rf temp-vite
```

### 4. Installing External Libraries (Dependencies)
Next, we installed the necessary React libraries:
- `lucide-react`: For the modern responsive icons used throughout the app (bookmark, copy, shuffle, etc.).
```bash
npm install lucide-react
```

### 5. Font Assets Placement
To use the custom Sindhi/Arabic typography (`SF-Arabic.ttf`), we moved the font file into the `public/` folder so it could be served directly to the browser:
```bash
cp resources/SF-Arabic.ttf public/SF-Arabic.ttf
```

### 6. Parsing the Text Poetry Database
The raw data is stored in `resources/all_poetry_data.txt`. We created a Node.js parser script `resources/parse_poetry.cjs` that groups the text lines into 4-line stanzas. We executed the script to generate `src/poetry.json`:
```bash
node resources/parse_poetry.cjs
```
This parsed **805 couplets** and made them importable directly into React.

### 7. Verifying the Production Build
To make sure there were no compilation or syntax errors, we tested the production bundler:
```bash
npm run build
```
This compiled all JS, JSX, CSS, and font files into highly optimized chunks in a `dist/` directory successfully.

### 8. Running the Development Server
Finally, we launched Vite's local hot-reloading dev server to test the app in the browser:
```bash
npm run dev
```
The application is running at **[http://localhost:5173/](http://localhost:5173/)**.

---

## 🎨 Design System & Implementation Details

Here is an overview of what each file does:

### 📄 HTML Entry Point: `index.html`
We set the document parameters:
* Language code to `sd` (Sindhi).
* Layout direction to `dir="rtl"` (Right-to-Left).
* Added search-friendly SEO headers (Meta description, author, and keywords for Ustad Bukhari).
* Title set to `استاد بخاريءَ جا چوسٽا - Ustad Bukhari Poetry` to accurately represent Ustad Bukhari's famous 4-line stanzas.

### ⚛️ Core Logic: `src/App.jsx`
Manages the application state:
* **Couplet State**: Remembers the current couplet index (`currentIndex`) and triggers line-by-line animations on change using a key refresher (`animateKey`).
* **Bookmarks State**: Persists favorite couplet IDs to the browser's `localStorage`.
* **Theme State**: Toggles between `light`, `dark`, and `sepia` themes by updating the `data-theme` attribute on the HTML node.

### 🎨 Stylesheet: `src/index.css`
A fully-responsive CSS system containing:
* `@font-face` binding for the local `SF-Arabic` font.
* Custom global layout rules supporting smooth background transitions.
* **Animated Glow Spots**: Moving gradients in the background that add visual elegance.
* **Container Queries & Shrinking text**: 
  - The `.poetry-lines` uses CSS `container-type: inline-size` layout.
  - The `.poetry-line` uses `font-size: min(1.95rem, 5.8cqw);` and `white-space: nowrap;`. This forces the lines to never wrap, and automatically scales them down to fit perfectly on any phone screen.
* **Circular Actions Tray**: A centered action bar using circular hover-animated buttons (Heart, Copy, Share) flanking a larger central Shuffle button.
* **Mobile Media Queries**: Optimized spacing and sizes for header and cards below `600px` width.
