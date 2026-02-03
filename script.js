// ==UserScript==
// @name         AlphaCoders Bulk Image Downloader
// @namespace    https://github.com/anytngv2/
// @version      1.1
// @description  Bulk download images from AlphaCoders
// @author       AnytngV2
// @match        https://alphacoders.com/*
// @match        https://alphacoders.com/*/wallpapers
// @icon         https://www.google.com/s2/favicons?sz=64&domain=alphacoders.com
// @grant        none
// ==/UserScript==
(function() {
    'use strict';
    
    const CONFIG = {
        delay: 1100,
        pauseAfter: 4,
        pauseDuration: 3000
    };

    function getImageSize() {
        const container = document.createElement('div');
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        const popup = document.createElement('div');
        popup.style.cssText = `
            background: #667eea;
            color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.3);
            text-align: center;
            width: 300px;
        `;
        
        popup.innerHTML = `
            <h3 style="margin-top: 0;">Image Size Filter</h3>
            <p>Set minimum dimensions (leave 0 for no filter):</p>
            <div style="margin: 20px 0;">
                <div style="margin-bottom: 10px;">
                    <label style="display: block; margin-bottom: 5px;">Min Width (px):</label>
                    <input type="number" id="minWidth" value="0" min="0" style="width: 100px; padding: 5px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px;">Min Height (px):</label>
                    <input type="number" id="minHeight" value="0" min="0" style="width: 100px; padding: 5px;">
                </div>
            </div>
            <div>
                <button id="confirmSize" style="background: #4CAF50; color: white; border: none; padding: 10px 20px; border-radius: 5px; margin-right: 10px; cursor: pointer;">Continue</button>
                <button id="skipSize" style="background: #f44336; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Skip Filter</button>
            </div>
        `;
        
        container.appendChild(popup);
        document.body.appendChild(container);
        
        return new Promise((resolve) => {
            document.getElementById('confirmSize').addEventListener('click', () => {
                const minWidth = parseInt(document.getElementById('minWidth').value) || 0;
                const minHeight = parseInt(document.getElementById('minHeight').value) || 0;
                document.body.removeChild(container);
                resolve({minWidth, minHeight});
            });
            
            document.getElementById('skipSize').addEventListener('click', () => {
                document.body.removeChild(container);
                resolve({minWidth: 0, minHeight: 0});
            });
        });
    }

    function getImageDimensionsFromCard(button) {
        const container = button.closest('.thumb-container-wallpaper-desktop, .thumb-container, .item');
        if (!container) return null;
        
        const sizeElement = container.querySelector('.thumb-info-masonry span');
        if (!sizeElement) return null;
        
        const text = sizeElement.textContent || sizeElement.innerText;
        const match = text.match(/\((\d+)x(\d+)\)/);
        
        if (match) {
            return {
                width: parseInt(match[1]),
                height: parseInt(match[2])
            };
        }
        
        return null;
    }

    function getParams(button) {
        const onclick = button.getAttribute('onclick');
        if (!onclick) return null;
        
        const match = onclick.match(/downloadContentModal\s*\(\s*'([^']+)'\s*,\s*(\d+)\s*,\s*'([^']+)'\s*,\s*(\d+)\s*\)/);
        if (match) {
            return {
                server: match[1],
                id: parseInt(match[2]),
                type: match[3],
                entryId: parseInt(match[4])
            };
        }
        return null;
    }

    function downloadItem(params, index) {
        return new Promise((resolve) => {
            const url = `https://initiate.alphacoders.com/download/${params.server}/${params.id}/${params.type}`;
            const name = `wallpaper_${index}.${params.type}`;
            
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', name);
            link.style.display = 'none';
            
            document.body.appendChild(link);
            
            setTimeout(() => {
                link.click();
                setTimeout(() => {
                    document.body.removeChild(link);
                    resolve();
                }, 100);
            }, 100);
        });
    }

    async function startDownload() {
        const sizeFilter = await getImageSize();
        
        const buttons = document.querySelectorAll('span.button.button-download[onclick*="downloadContentModal"]');
        
        if (buttons.length === 0) {
            alert('No download buttons found!');
            return;
        }
        
        const items = [];
        let filteredCount = 0;
        
        for (let i = 0; i < buttons.length; i++) {
            const params = getParams(buttons[i]);
            if (params) {
                const dimensions = getImageDimensionsFromCard(buttons[i]);
                
                if (sizeFilter.minWidth > 0 || sizeFilter.minHeight > 0) {
                    if (!dimensions || 
                        dimensions.width < sizeFilter.minWidth || 
                        dimensions.height < sizeFilter.minHeight) {
                        filteredCount++;
                        continue;
                    }
                }
                
                items.push({
                    params, 
                    index: items.length + 1,
                    dimensions: dimensions
                });
            }
        }
        
        if (items.length === 0) {
            alert(`No images found matching the criteria!\nFiltered out: ${filteredCount} images`);
            return;
        }
        
        const filterInfo = sizeFilter.minWidth > 0 || sizeFilter.minHeight > 0 
            ? `\nFilter: min ${sizeFilter.minWidth}x${sizeFilter.minHeight}px\nFiltered out: ${filteredCount} images` 
            : '';
        
        const confirmed = confirm(`Download ${items.length} image(s)?${filterInfo}`);
        if (!confirmed) return;
        
        console.log(`Downloading ${items.length} images...${filterInfo}`);
        
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const sizeInfo = item.dimensions ? ` (${item.dimensions.width}x${item.dimensions.height})` : '';
            console.log(`[${item.index}/${items.length}] Downloading...${sizeInfo}`);
            
            await downloadItem(item.params, item.index);
            
            if ((i + 1) % CONFIG.pauseAfter === 0 && i < items.length - 1) {
                console.log(`Pausing for ${CONFIG.pauseDuration/1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, CONFIG.pauseDuration));
            } else if (i < items.length - 1) {
                await new Promise(resolve => setTimeout(resolve, CONFIG.delay));
            }
        }
        
        console.log(`Download complete! ${items.length} images downloaded.`);
        alert(`Download complete!\n${items.length} images downloaded.${filterInfo}`);
    }

    function createButton() {
        if (document.getElementById('bulk-download-btn')) return;
        
        const btn = document.createElement('button');
        btn.id = 'bulk-download-btn';
        btn.textContent = 'Download All Images';
        btn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 20px;
            padding: 10px 20px;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        `;
        
        btn.addEventListener('click', startDownload);
        document.body.appendChild(btn);
    }

    createButton();
    console.log('Bulk downloader ready - click the floating button!');
})();