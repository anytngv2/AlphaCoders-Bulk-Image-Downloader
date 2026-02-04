# AlphaCoders Bulk Image Downloader

This userscript allows you to bulk download images from AlphaCoders.com.

## Installation

### Option 1: Using Tampermonkey (Recommended)

1. Install the [Tampermonkey extension](https://www.tampermonkey.net/) for your browser (Chrome, Firefox, etc.).
2. Open Tampermonkey and create a new script.
3. Copy and paste the entire contents of `script.js` into the script editor.
4. Save the script.

### Option 2: Manual Injection

1. Navigate to an AlphaCoders page with wallpapers (e.g., https://wall.alphacoders.com/).
2. Open your browser's developer console (F12 or right-click > Inspect > Console).
3. Copy and paste the entire contents of `script.js` into the console.
4. Press Enter to execute the script.

## Usage

1. On an AlphaCoders wallpapers page, a floating "Download All Images" button will appear in the bottom-right corner.
2. Click the button to start the download process.
3. A popup will appear asking for minimum image size filters (optional). Set the minimum width and height in pixels, or skip to download all images.
4. Confirm the download. The script will download images one by one with delays to avoid overloading the server.
5. Images will be saved to your default download folder with names like `wallpaper_1.jpg`, `wallpaper_2.png`, etc.

## Configuration

You can modify the `CONFIG` object in the script to adjust:
- `delay`: Time between downloads (in milliseconds, default 1100).
- `pauseAfter`: Number of downloads before a longer pause (default 4).
- `pauseDuration`: Duration of the longer pause (in milliseconds, default 3000).

## Notes

- This script respects the site's rate limits by adding delays between downloads.
- Make sure to comply with AlphaCoders' terms of service.

- The script only works on pages that match the `@match` directives in the userscript header.
