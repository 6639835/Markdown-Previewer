// DOM elements
const editor = document.getElementById('editor');
const preview = document.getElementById('preview');
const themeToggle = document.getElementById('theme-toggle');
const fullscreenToggle = document.getElementById('fullscreen-toggle');
const previewMode = document.getElementById('preview-mode');
const copyMarkdown = document.getElementById('copy-markdown');
const copyHtml = document.getElementById('copy-html');
const importFile = document.getElementById('import-file');
const downloadMd = document.getElementById('download-md');
const downloadHtml = document.getElementById('download-html');
const downloadPdf = document.getElementById('download-pdf');
const simplePdfExportBtn = document.getElementById('simple-pdf-export');
const clearEditor = document.getElementById('clear-editor');
const counterElement = document.getElementById('counter');
const notification = document.getElementById('notification');
const toolbarButtons = document.querySelectorAll('.toolbar button[data-action]');
const wrapToggle = document.getElementById('wrap-toggle');
const focusMode = document.getElementById('focus-mode');
const fileDropArea = document.getElementById('file-drop-area');
const fileInput = document.getElementById('file-input');
const shortcutsModal = document.getElementById('shortcuts-modal');
const showShortcuts = document.getElementById('show-shortcuts');
const closeModal = document.querySelector('.modal .close');
const refreshMermaid = document.getElementById('refresh-mermaid');
const toggleTocButton = document.getElementById('toggle-toc');
const tocSidebar = document.getElementById('toc-sidebar');
const closeTocButton = document.getElementById('close-toc');
const tocContent = document.getElementById('toc-content');
const spellCheckToggle = document.getElementById('spell-check-toggle');
const loadingOverlay = document.getElementById('loading-overlay');
const loadingMessage = document.getElementById('loading-message');

// Loading overlay functions
function showLoading(message = 'Processing...') {
    loadingMessage.textContent = message;
    loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    loadingOverlay.classList.add('hidden');
}

// Markdown Previewer class for better organization
class MarkdownPreviewer {
    constructor() {
        // Initialize libraries
        this.initializeMermaid();
        this.initializeMarked();
    }
    
    // Initialize Mermaid diagram library
    initializeMermaid() {
        mermaid.initialize({
            startOnLoad: true,
            theme: 'default',
            securityLevel: 'loose',
            fontFamily: 'monospace',
            fontSize: 14,
            flowchart: {
                useMaxWidth: true,
                htmlLabels: true
            },
            sequence: {
                useMaxWidth: true,
                htmlLabels: true,
                diagramMarginX: 50,
                diagramMarginY: 10,
                boxMargin: 10,
                noteMargin: 10,
                messageMargin: 35
            },
            gantt: {
                useMaxWidth: true
            },
            er: {
                useMaxWidth: true
            }
        });
    }
    
    // Initialize Marked markdown parser
    initializeMarked() {
        marked.setOptions({
            breaks: true,
            gfm: true,
            headerIds: true,
            mangle: false,
            smartLists: true,
            smartypants: true,
            highlight: function(code, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return hljs.highlight(code, { language: lang }).value;
                    } catch (e) {
                        console.error(e);
                    }
                }
                return code;
            }
        });
        
        this.setupCustomRenderer();
    }
    
    // Setup custom renderer for math and diagrams
    setupCustomRenderer() {
        const renderer = new marked.Renderer();
        const originalCodeRenderer = renderer.code.bind(renderer);
        const originalHeadingRenderer = renderer.heading.bind(renderer);
        const originalInlineCodeRenderer = renderer.codespan.bind(renderer);
        
        // Override heading renderer for better TOC support
        renderer.heading = function(text, level, raw) {
            if (raw === undefined || raw === null) {
                raw = text || '';
            }
            
            const id = String(raw).toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/--+/g, '-');
            
            return originalHeadingRenderer(text, level, raw, {
                id: `heading-${id}`
            });
        };
        
        // Override code renderer for math and diagrams
        renderer.code = function(code, language, isEscaped) {
            if (language === 'math') {
                try {
                    return `<div class="math-block">${katex.renderToString(code, {
                        displayMode: true,
                        throwOnError: false,
                        output: 'html'
                    })}</div>`;
                } catch (e) {
                    console.error('KaTeX error:', e);
                    return `<div class="math-error">Error rendering equation: ${e.message}</div>`;
                }
            } else if (language === 'mermaid') {
                try {
                    const diagramId = 'mermaid-diagram-' + Math.random().toString(36).substring(2, 10);
                    return `<div class="mermaid" id="${diagramId}">${code}</div>`;
                } catch (e) {
                    console.error('Mermaid error:', e);
                    return `<div class="mermaid-error">Error rendering diagram: ${e.message}</div>`;
                }
            }
            
            if (language && hljs.getLanguage(language)) {
                try {
                    const highlighted = hljs.highlight(code, { language }).value;
                    return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`;
                } catch (e) {
                    console.error('Highlight.js error:', e);
                }
            }
            
            return originalCodeRenderer(code, language, isEscaped);
        };
        
        // Override inline code renderer for inline math
        renderer.codespan = function(code) {
            if (typeof code === 'string' && code.startsWith('$') && code.endsWith('$')) {
                try {
                    const equation = code.substring(1, code.length - 1);
                    return katex.renderToString(equation, {
                        displayMode: false,
                        throwOnError: false
                    });
                } catch (e) {
                    console.error('KaTeX inline error:', e);
                    return `<span class="math-error">Error rendering equation</span>`;
                }
            }
            
            return originalInlineCodeRenderer(code);
        };
        
        // Set the custom renderer
        marked.setOptions({ renderer });
    }
}

// Initialize the Markdown Previewer
const markdownPreviewer = new MarkdownPreviewer();

// Default markdown example to display when the page loads
const defaultMarkdown = `# Enhanced Markdown Previewer

## New Features

This enhanced previewer now supports:

### Math Equations

Inline math: $E = mc^2$

Block math:

\`\`\`math
\\frac{d}{dx}\\left( \\int_{0}^{x} f(u)\\,du\\right)=f(x)
\`\`\`

### Diagrams

Simple flowchart:

\`\`\`mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
\`\`\`

Sequence diagram:

\`\`\`mermaid
sequenceDiagram
    participant Alice
    participant Bob
    Alice->>John: Hello John, how are you?
    loop Healthcheck
        John->>John: Fight against hypochondria
    end
    Note right of John: Rational thoughts <br/>prevail!
    John-->>Alice: Great!
    John->>Bob: How about you?
    Bob-->>John: Jolly good!
\`\`\`

### Code with Syntax Highlighting

\`\`\`javascript
// This code is highlighted
function greeting(name) {
  return \`Hello, \${name}!\`;
}
console.log(greeting('World'));
\`\`\`

### All Previous Features

- Headers (H1-H6)
- *Italic* and **Bold** text
- Lists (ordered and unordered)
- [Links](https://example.com)
- Images
- Blockquotes
- Tables
- Task Lists
  - [x] Completed task
  - [ ] Incomplete task

### Keyboard Shortcuts

Press the keyboard icon in the top-right to see all available shortcuts.

### Focus Mode

Try the focus mode for distraction-free writing!

### Table of Contents

This document now includes an automatic table of contents!
Press the list icon in the header or use Ctrl+T to toggle it.

#### Sub-heading 1

Some content under sub-heading 1.

#### Sub-heading 2

Some content under sub-heading 2.

##### Deeper Level

Even deeper content.

###### Deepest Level

The deepest content.
`;

// Function to generate a Table of Contents from the preview content
function generateTOC() {
    // Cache DOM selections
    const headings = preview.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    // Early return for empty documents
    if (headings.length === 0) {
        tocContent.innerHTML = '<p>No headings found in document</p>';
        return;
    }
    
    // Use document fragment for better performance
    const fragment = document.createDocumentFragment();
    const toc = document.createElement('ul');
    fragment.appendChild(toc);
    
    let currentLevel = 0;
    let currentList = toc;
    const listStack = [toc];
    
    // Map for faster lookup of heading elements by ID
    const headingMap = new Map();
    
    // Pre-process headings to ensure all have IDs
    headings.forEach(heading => {
        if (!heading.id) {
            const headingId = `heading-${Math.random().toString(36).substring(2, 10)}`;
            heading.id = headingId;
        }
        headingMap.set(heading.id, heading);
    });
    
    headings.forEach((heading) => {
        // Get heading level (h1 = 1, h2 = 2, etc.)
        const level = parseInt(heading.tagName.charAt(1));
        const headingId = heading.id;
        
        // Create the list item with efficient approaches
        const item = document.createElement('li');
        const link = document.createElement('a');
        
        // Use textContent instead of innerHTML for better performance and security
        link.textContent = heading.textContent;
        link.href = `#${headingId}`;
        link.className = `h${level}`;
        
        // More efficient event handler with better scroll behavior
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Scroll to heading with smooth behavior
            heading.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
            
            // Highlight the heading temporarily using classList
            heading.classList.add('highlight');
            setTimeout(() => {
                heading.classList.remove('highlight');
            }, 2000);
            
            // On mobile, close the TOC after clicking
            if (window.innerWidth <= 768) {
                toggleTOC();
            }
        });
        
        item.appendChild(link);
        
        // Handle nesting of headings with improved logic
        if (level > currentLevel) {
            // Go deeper - create a new nested list
            const nestedList = document.createElement('ul');
            if (listStack[listStack.length - 1].lastChild) {
                listStack[listStack.length - 1].lastChild.appendChild(nestedList);
                listStack.push(nestedList);
                currentList = nestedList;
            } else {
                // Handle edge case where there's no last child
                const tempItem = document.createElement('li');
                listStack[listStack.length - 1].appendChild(tempItem);
                tempItem.appendChild(nestedList);
                listStack.push(nestedList);
                currentList = nestedList;
            }
        } else if (level < currentLevel) {
            // Go up - pop back to appropriate level
            const steps = currentLevel - level;
            for (let i = 0; i < steps; i++) {
                if (listStack.length > 1) { // Ensure we don't pop the root list
                    listStack.pop();
                }
            }
            currentList = listStack[listStack.length - 1];
        }
        
        // Add the item to the current list
        currentList.appendChild(item);
        currentLevel = level;
    });
    
    // Update the DOM once with the entire fragment
    tocContent.innerHTML = '';
    tocContent.appendChild(fragment);
}

// Function to toggle the TOC sidebar
function toggleTOC() {
    tocSidebar.classList.toggle('toc-hidden');
    document.querySelector('main').classList.toggle('with-toc');
    
    // Generate TOC if it's empty and the sidebar is visible
    if (!tocSidebar.classList.contains('toc-hidden') && tocContent.children.length === 0) {
        generateTOC();
    }
}

// Function to render mermaid diagrams
function renderMermaidDiagrams() {
    try {
        // Clear previous renderings to avoid duplicates
        const mermaidDivs = document.querySelectorAll('.mermaid');
        mermaidDivs.forEach(div => {
            if (div.hasAttribute('data-processed')) {
                div.removeAttribute('data-processed');
            }
        });
        
        // Reinitialize mermaid with current theme
        const isDarkTheme = document.body.classList.contains('dark-theme');
        mermaid.initialize({
            startOnLoad: false,
            theme: isDarkTheme ? 'dark' : 'default',
            securityLevel: 'loose',
            fontFamily: 'monospace',
            fontSize: 14,
            flowchart: {
                useMaxWidth: true,
                htmlLabels: true
            }
        });
        
        // Re-render diagrams
        mermaid.init(undefined, '.mermaid');
        showNotification('Diagrams refreshed');
    } catch (e) {
        console.error('Mermaid re-rendering error:', e);
        showNotification('Error refreshing diagrams: ' + e.message, true);
    }
}

// Function to convert markdown to HTML
function renderMarkdown() {
    try {
        // Use requestAnimationFrame for better performance
        window.requestAnimationFrame(() => {
            // Convert markdown to HTML
            const rawHtml = marked.parse(editor.value);
            
            // Sanitize the HTML to prevent XSS attacks - pre-configure for better performance
            const sanitizerConfig = {
                USE_PROFILES: { html: true },
                ADD_ATTR: ['target', 'checked', 'id'],
                ADD_TAGS: ['mjx-container', 'mjx-assistive-mml', 'svg', 'path', 'line', 'polygon', 'g', 'text', 'rect', 'circle', 'foreignObject']
            };
            
            const sanitizedHtml = DOMPurify.sanitize(rawHtml, sanitizerConfig);
            
            // Update preview with sanitized HTML
            preview.innerHTML = sanitizedHtml;
            
            // Use Promise.all for parallel async tasks
            Promise.all([
                // Render math elements
                new Promise(resolve => {
                    try {
                        renderMathInElement(preview, {
                            delimiters: [
                                {left: '$$', right: '$$', display: true},
                                {left: '$', right: '$', display: false}
                            ],
                            throwOnError: false,
                            output: 'html'
                        });
                    } catch (mathError) {
                        console.error('Math rendering error:', mathError);
                    }
                    resolve();
                }),
                
                // Render mermaid diagrams
                new Promise(resolve => {
                    try {
                        mermaid.contentLoaded();
                        const mermaidDivs = document.querySelectorAll('.mermaid');
                        if (mermaidDivs.length > 0) {
                            mermaid.init(undefined, mermaidDivs);
                        }
                    } catch (e) {
                        console.error('Mermaid init error:', e);
                    }
                    resolve();
                }),
                
                // Apply syntax highlighting to code blocks
                new Promise(resolve => {
                    try {
                        document.querySelectorAll('pre code').forEach((block) => {
                            hljs.highlightElement(block);
                        });
                    } catch (highlightError) {
                        console.error('Syntax highlighting error:', highlightError);
                    }
                    resolve();
                }),
                
                // Process external links
                new Promise(resolve => {
                    const links = preview.querySelectorAll('a');
                    if (links.length > 0) {
                        links.forEach(link => {
                            if (link.hostname !== window.location.hostname) {
                                link.setAttribute('target', '_blank');
                                link.setAttribute('rel', 'noopener noreferrer');
                            }
                        });
                    }
                    resolve();
                }),
                
                // Process task list checkboxes
                new Promise(resolve => {
                    const checkboxes = preview.querySelectorAll('input[type="checkbox"]');
                    if (checkboxes.length > 0) {
                        checkboxes.forEach(checkbox => {
                            checkbox.disabled = false;
                            checkbox.addEventListener('change', () => {
                                const markdown = editor.value;
                                const taskRegex = new RegExp(`- \\[([ x])\\]`, 'g');
                                let match;
                                let count = 0;
                                let targetIndex = -1;

                                // Find the specific checkbox that was clicked
                                while ((match = taskRegex.exec(markdown)) !== null) {
                                    if (count === Array.from(checkboxes).indexOf(checkbox)) {
                                        targetIndex = match.index;
                                        break;
                                    }
                                    count++;
                                }

                                if (targetIndex !== -1) {
                                    // Update the markdown text
                                    const newMarkdown = 
                                        markdown.substring(0, targetIndex + 3) + 
                                        (checkbox.checked ? 'x' : ' ') + 
                                        markdown.substring(targetIndex + 4);
                                    
                                    // Update the editor
                                    editor.value = newMarkdown;
                                    saveToLocalStorage();
                                }
                            });
                        });
                    }
                    resolve();
                })
            ]).then(() => {
                // Update word and character count
                updateCounter();
                
                // Update the Table of Contents if it's visible
                if (!tocSidebar.classList.contains('toc-hidden')) {
                    generateTOC();
                }
            });
        });
    } catch (error) {
        console.error('Error rendering markdown:', error);
        preview.innerHTML = `<div class="error">Error rendering markdown: ${error.message}</div>`;
    }
}

// Function to handle toolbar action to insert a TOC
function insertTOC() {
    const cursorPos = editor.selectionStart;
    const textBefore = editor.value.substring(0, cursorPos);
    const textAfter = editor.value.substring(cursorPos);
    
    // Insert TOC marker at cursor position
    const tocMarker = `## Table of Contents\n\n[TOC]\n\n`;
    editor.value = textBefore + tocMarker + textAfter;
    
    // Update the preview
    renderMarkdown();
    
    // Set cursor position after the inserted TOC
    editor.selectionStart = editor.selectionEnd = cursorPos + tocMarker.length;
    editor.focus();
    
    // Show notification
    showNotification('TOC marker inserted. Document headings will be displayed here.');
}

// Function to toggle theme
function toggleTheme() {
    const body = document.body;
    const isDarkTheme = body.classList.toggle('dark-theme');
    
    // Update icon
    const icon = themeToggle.querySelector('i');
    if (isDarkTheme) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
        
        // Update mermaid theme
        mermaid.initialize({
            theme: 'dark'
        });
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
        
        // Update mermaid theme
        mermaid.initialize({
            theme: 'default'
        });
    }
    
    // Re-render for diagrams to update with new theme
    renderMarkdown();
    
    // Save preference to local storage
    localStorage.setItem('darkTheme', isDarkTheme);
}

// Function to toggle fullscreen
function toggleFullscreen(container) {
    const isFullscreen = container.classList.toggle('fullscreen');
    
    // Update icon
    const icon = fullscreenToggle.querySelector('i');
    if (isFullscreen) {
        icon.classList.remove('fa-expand');
        icon.classList.add('fa-compress');
    } else {
        icon.classList.remove('fa-compress');
        icon.classList.add('fa-expand');
    }
}

// Function to toggle focus mode
function toggleFocusMode() {
    const body = document.body;
    const isFocusMode = body.classList.toggle('focus-mode');
    
    // Update icon
    const icon = focusMode.querySelector('i');
    if (isFocusMode) {
        icon.classList.remove('fa-glasses');
        icon.classList.add('fa-eye');
        showNotification('Focus mode enabled. Hover over UI elements to reveal them.');
    } else {
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-glasses');
        showNotification('Focus mode disabled.');
    }
    
    // Save preference to local storage
    localStorage.setItem('focusMode', isFocusMode);
}

// Function to toggle word wrap
function toggleWordWrap() {
    const isWrapped = editor.classList.toggle('wrap');
    const isNoWrap = editor.classList.toggle('nowrap');
    
    // Update icon
    const icon = wrapToggle.querySelector('i');
    if (isWrapped) {
        icon.classList.remove('fa-align-left');
        icon.classList.add('fa-align-justify');
        showNotification('Word wrap enabled.');
    } else {
        icon.classList.remove('fa-align-justify');
        icon.classList.add('fa-align-left');
        showNotification('Word wrap disabled.');
    }
    
    // Save preference to local storage
    localStorage.setItem('wordWrap', isWrapped);
}

// Function to toggle preview mode
function togglePreviewMode() {
    const editorContainer = document.querySelector('.editor-container');
    const previewContainer = document.querySelector('.preview-container');
    const icon = previewMode.querySelector('i');
    
    if (editorContainer.style.display === 'none') {
        // Show both
        editorContainer.style.display = 'flex';
        previewContainer.style.flex = '1';
        icon.classList.remove('fa-edit');
        icon.classList.add('fa-desktop');
    } else if (previewContainer.style.flex === '2') {
        // Show only preview
        editorContainer.style.display = 'none';
        previewContainer.style.flex = '1';
        icon.classList.remove('fa-desktop');
        icon.classList.add('fa-edit');
    } else {
        // Show more preview
        editorContainer.style.flex = '1';
        previewContainer.style.flex = '2';
        icon.classList.remove('fa-edit');
        icon.classList.add('fa-desktop');
    }
    
    // Save preference to local storage
    localStorage.setItem('previewMode', editorContainer.style.display === 'none' ? 'preview-only' : 
                                       previewContainer.style.flex === '2' ? 'preview-focus' : 'split');
}

// Function to show notification
function showNotification(message, isError = false) {
    notification.textContent = message;
    notification.classList.add('show');
    
    if (isError) {
        notification.classList.add('error');
    } else {
        notification.classList.remove('error');
    }
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Function to copy text to clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showNotification('Copied to clipboard!');
    } catch (err) {
        console.error('Failed to copy: ', err);
        showNotification('Failed to copy to clipboard', true);
    }
}

// Function to download text as file
function downloadFile(text, filename) {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification(`Downloaded ${filename}`);
}

// Function to export as PDF
async function exportToPDF() {
    try {
        showLoading('Generating PDF...');
        
        // Create PDF export container outside the DOM for better performance
        const exportElement = document.createElement('div');
        exportElement.classList.add('pdf-export');
        
        // Clone the preview content instead of using innerHTML for better performance
        const previewClone = preview.cloneNode(true);
        exportElement.appendChild(previewClone);
        
        // Use a more optimized approach for SVGs/diagrams
        const processMermaidDiagrams = async () => {
            const diagrams = exportElement.querySelectorAll('.mermaid svg');
            if (diagrams.length === 0) return;
            
            // Process diagrams in parallel using Promise.all
            await Promise.all(Array.from(diagrams).map(async (svg) => {
                try {
                    // Create canvas with appropriate size
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Get computed dimensions for better accuracy
                    const svgRect = svg.getBoundingClientRect();
                    canvas.width = svgRect.width || 600;
                    canvas.height = svgRect.height || 400;
                    
                    // Convert SVG to blob and create URL efficiently
                    const svgData = new XMLSerializer().serializeToString(svg);
                    const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
                    const url = URL.createObjectURL(svgBlob);
                    
                    // Load image and draw to canvas
                    return new Promise((resolve) => {
                        const img = new Image();
                        img.onload = () => {
                            ctx.drawImage(img, 0, 0);
                            URL.revokeObjectURL(url); // Clean up resources
                            svg.parentNode.replaceChild(canvas, svg);
                            resolve();
                        };
                        img.onerror = () => {
                            console.error('Error loading SVG image');
                            URL.revokeObjectURL(url);
                            resolve();
                        };
                        img.src = url;
                    });
                } catch (e) {
                    console.error('Error converting SVG:', e);
                }
            }));
        };
        
        // Process diagrams
        await processMermaidDiagrams();
        
        // Apply optimized CSS
        const style = document.createElement('style');
        style.textContent = `
            .pdf-export {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                padding: 20px;
            }
            .pdf-export h1, .pdf-export h2 {
                border-bottom: 1px solid #eaecef;
                padding-bottom: 0.3em;
            }
            .pdf-export pre {
                background-color: #f6f8fa;
                padding: 16px;
                border-radius: 3px;
                white-space: pre-wrap;
                overflow-wrap: break-word;
            }
            .pdf-export code {
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
                background-color: rgba(27, 31, 35, 0.05);
                border-radius: 3px;
                padding: 0.2em 0.4em;
                font-size: 85%;
            }
            .pdf-export blockquote {
                padding: 0 1em;
                color: #6a737d;
                border-left: 0.25em solid #dfe2e5;
            }
            .pdf-export table {
                border-collapse: collapse;
                width: 100%;
                table-layout: fixed;
                margin-bottom: 1rem;
            }
            .pdf-export table th, .pdf-export table td {
                padding: 8px 15px;
                border: 1px solid #dfe2e5;
                word-break: break-word;
            }
            .pdf-export table tr:nth-child(2n) {
                background-color: #f6f8fa;
            }
            .pdf-export img, .pdf-export canvas {
                max-width: 100%;
                height: auto;
            }
            .pdf-export .katex, .pdf-export .katex-display {
                font-size: 1.1em;
            }
        `;
        exportElement.appendChild(style);
        
        // Add to document hidden
        exportElement.style.position = 'absolute';
        exportElement.style.left = '-9999px';
        document.body.appendChild(exportElement);
        
        // Optimized html2pdf options
        const options = {
            margin: [15, 15],
            filename: 'markdown-export.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2,
                logging: false, 
                letterRendering: true,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff'
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait',
                compress: true
            },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };
        
        try {
            // Generate PDF with a small timeout to ensure DOM is ready
            await new Promise(resolve => setTimeout(resolve, 100));
            await html2pdf().from(exportElement).set(options).save();
            
            // Clean up
            document.body.removeChild(exportElement);
            hideLoading();
            showNotification('PDF downloaded successfully!');
        } catch (innerError) {
            console.error('PDF generation error:', innerError);
            document.body.removeChild(exportElement);
            hideLoading();
            showNotification('Failed to generate PDF. Try with less complex content.', true);
        }
        
    } catch (error) {
        console.error('PDF export error:', error);
        hideLoading();
        showNotification('Failed to export PDF', true);
    }
}

// Function to handle file upload
function handleFileUpload(file) {
    if (file) {
        showLoading('Importing file...');
        const reader = new FileReader();
        reader.onload = function(e) {
            editor.value = e.target.result;
            renderMarkdown();
            saveToLocalStorage();
            hideLoading();
            showNotification(`File "${file.name}" imported successfully.`);
        };
        reader.onerror = function() {
            hideLoading();
            showNotification('Error reading file.', true);
        };
        reader.readAsText(file);
    }
}

// Function to save to local storage
function saveToLocalStorage() {
    localStorage.setItem('markdown', editor.value);
}

// Function to load from local storage
function loadFromLocalStorage() {
    // Load markdown content
    const savedMarkdown = localStorage.getItem('markdown');
    if (savedMarkdown) {
        editor.value = savedMarkdown;
    } else {
        editor.value = defaultMarkdown;
    }
    
    // Load theme preference
    if (localStorage.getItem('darkTheme') === 'true') {
        toggleTheme();
    }
    
    // Load focus mode preference
    if (localStorage.getItem('focusMode') === 'true') {
        toggleFocusMode();
    }
    
    // Load word wrap preference
    if (localStorage.getItem('wordWrap') === 'true') {
        toggleWordWrap();
    } else {
        // Default to wrapped
        editor.classList.add('wrap');
    }
    
    // Load spell check preference
    if (localStorage.getItem('spellCheck') === 'true') {
        editor.spellcheck = true;
        spellCheckToggle.classList.add('active');
    } else if (localStorage.getItem('spellCheck') === 'false') {
        editor.spellcheck = false;
        spellCheckToggle.classList.remove('active');
    } else {
        // Default state (browser default)
        editor.spellcheck = true;
    }
    
    // Load preview mode preference
    const previewModePreference = localStorage.getItem('previewMode');
    if (previewModePreference) {
        const editorContainer = document.querySelector('.editor-container');
        const previewContainer = document.querySelector('.preview-container');
        const icon = previewMode.querySelector('i');
        
        if (previewModePreference === 'preview-only') {
            editorContainer.style.display = 'none';
            previewContainer.style.flex = '1';
            icon.classList.remove('fa-desktop');
            icon.classList.add('fa-edit');
        } else if (previewModePreference === 'preview-focus') {
            editorContainer.style.flex = '1';
            previewContainer.style.flex = '2';
            icon.classList.remove('fa-edit');
            icon.classList.add('fa-desktop');
        }
    }
    
    renderMarkdown();
}

// Function to insert text at cursor position
function insertAtCursor(before, after = '') {
    const startPos = editor.selectionStart;
    const endPos = editor.selectionEnd;
    const selectedText = editor.value.substring(startPos, endPos);
    const newText = before + selectedText + after;
    
    editor.value = 
        editor.value.substring(0, startPos) + 
        newText + 
        editor.value.substring(endPos);
    
    editor.focus();
    
    // Set new cursor position
    if (selectedText.length === 0) {
        // Place cursor between tags if no selection
        editor.selectionStart = startPos + before.length;
        editor.selectionEnd = startPos + before.length;
    } else {
        // Select the newly formatted text
        editor.selectionStart = startPos;
        editor.selectionEnd = startPos + newText.length;
    }
    
    // Trigger update
    editor.dispatchEvent(new Event('input'));
}

// Function to update word and character count
function updateCounter() {
    const text = editor.value;
    const charCount = text.length;
    const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    counterElement.textContent = `${charCount} characters, ${wordCount} words`;
}

// Function to handle toolbar actions
function handleToolbarAction(action) {
    // Get cursor position
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selectedText = editor.value.substring(start, end);
    
    // Determine what to insert based on the action
    let insertBefore = '';
    let insertAfter = '';
    let newCursorPos = start;
    
    switch (action) {
        case 'bold':
            insertBefore = '**';
            insertAfter = '**';
            break;
        case 'italic':
            insertBefore = '*';
            insertAfter = '*';
            break;
        case 'strikethrough':
            insertBefore = '~~';
            insertAfter = '~~';
            break;
        case 'heading':
            // Check if we're at the beginning of a line
            const prevChar = start > 0 ? editor.value.charAt(start - 1) : '\n';
            if (prevChar === '\n' || start === 0) {
                insertBefore = '## ';
            } else {
                insertBefore = '\n## ';
            }
            break;
        case 'link':
            if (selectedText) {
                insertBefore = '[';
                insertAfter = '](url)';
            } else {
                insertBefore = '[link text](url)';
            }
            break;
        case 'image':
            insertBefore = '![alt text](image-url)';
            break;
        case 'code':
            insertBefore = '`';
            insertAfter = '`';
            break;
        case 'codeblock':
            insertBefore = '```\n';
            insertAfter = '\n```';
            break;
        case 'list':
            insertBefore = '- ';
            break;
        case 'numbered-list':
            insertBefore = '1. ';
            break;
        case 'task':
            insertBefore = '- [ ] ';
            break;
        case 'quote':
            insertBefore = '> ';
            break;
        case 'hr':
            insertBefore = '\n---\n';
            break;
        case 'table':
            insertBefore = '| Header 1 | Header 2 | Header 3 |\n| --- | --- | --- |\n| Row 1, Col 1 | Row 1, Col 2 | Row 1, Col 3 |\n| Row 2, Col 1 | Row 2, Col 2 | Row 2, Col 3 |';
            break;
        case 'math':
            insertBefore = '```math\n';
            insertAfter = '\n```';
            break;
        case 'diagram':
            insertBefore = '```mermaid\ngraph TD\n    A[Start] --> B[End]\n```';
            break;
        case 'toc':
            insertTOC();
            return; // Early return as insertTOC handles everything
        default:
            return; // Unknown action
    }
    
    // Update the editor value
    if (selectedText) {
        editor.value = editor.value.substring(0, start) + insertBefore + selectedText + insertAfter + editor.value.substring(end);
        newCursorPos = end + insertBefore.length + insertAfter.length;
    } else {
        editor.value = editor.value.substring(0, start) + insertBefore + insertAfter + editor.value.substring(end);
        newCursorPos = start + insertBefore.length;
    }
    
    // Update the preview
    renderMarkdown();
    
    // Set the cursor position
    editor.focus();
    editor.selectionStart = editor.selectionEnd = newCursorPos;
}

// Function to handle keyboard shortcuts
function handleKeyboardShortcut(e) {
    // Ctrl+S - Save to local storage
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveToLocalStorage();
        showNotification('Content saved to local storage');
    }
    
    // Ctrl+Shift+C - Copy markdown
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        copyToClipboard(editor.value);
    }
    
    // F11 - Toggle focus mode
    if (e.key === 'F11') {
        e.preventDefault();
        toggleFocusMode();
    }
    
    // Ctrl+T - Toggle TOC
    if (e.ctrlKey && e.key === 't') {
        e.preventDefault();
        toggleTOC();
    }
    
    // Toolbar shortcuts
    if (e.ctrlKey) {
        const shortcutMapping = {
            'b': 'bold',
            'i': 'italic',
            'h': 'heading',
            'k': 'link',
            '`': 'code',
            'u': 'list',
            'o': 'numbered-list',
            'q': 'quote'
        };
        
        if (shortcutMapping[e.key]) {
            e.preventDefault();
            handleToolbarAction(shortcutMapping[e.key]);
        }
    }
}

// Debounce function to limit how often a function runs
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// Initialize event listeners
window.addEventListener('DOMContentLoaded', () => {
    // Load content from local storage or use default
    loadFromLocalStorage();
    
    // Focus cursor at the end of the textarea
    editor.focus();
    editor.setSelectionRange(editor.value.length, editor.value.length);
    
    // Set up event listeners with debouncing for better performance
    const debouncedRender = debounce(() => {
        renderMarkdown();
        saveToLocalStorage();
    }, 300); // 300ms debounce time
    
    editor.addEventListener('input', debouncedRender);
    
    // Handle tab key in editor (insert tab instead of changing focus)
    editor.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            
            // Get cursor position
            const start = editor.selectionStart;
            const end = editor.selectionEnd;
            
            // Insert tab at cursor position
            editor.value = editor.value.substring(0, start) + '  ' + editor.value.substring(end);
            
            // Move cursor after the inserted tab
            editor.selectionStart = editor.selectionEnd = start + 2;
            
            // Trigger update
            editor.dispatchEvent(new Event('input'));
        }
    });
    
    // Global keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcut);
    
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Fullscreen toggle
    fullscreenToggle.addEventListener('click', () => {
        const container = document.querySelector('.container');
        toggleFullscreen(container);
    });
    
    // Focus mode toggle
    focusMode.addEventListener('click', toggleFocusMode);
    
    // Word wrap toggle
    wrapToggle.addEventListener('click', toggleWordWrap);
    
    // Preview mode toggle
    previewMode.addEventListener('click', togglePreviewMode);
    
    // TOC toggle
    toggleTocButton.addEventListener('click', toggleTOC);
    closeTocButton.addEventListener('click', toggleTOC);
    
    // Copy markdown button
    copyMarkdown.addEventListener('click', () => {
        copyToClipboard(editor.value);
    });
    
    // Copy HTML button
    copyHtml.addEventListener('click', () => {
        copyToClipboard(preview.innerHTML);
    });
    
    // Import file button
    importFile.addEventListener('click', () => {
        fileInput.click();
    });
    
    // File input change handler
    fileInput.addEventListener('change', (e) => {
        handleFileUpload(e.target.files[0]);
    });
    
    // Download markdown button
    downloadMd.addEventListener('click', (e) => {
        e.preventDefault();
        downloadFile(editor.value, 'markdown.md');
    });
    
    // Download HTML button
    downloadHtml.addEventListener('click', (e) => {
        e.preventDefault();
        downloadFile(preview.innerHTML, 'preview.html');
    });
    
    // Download PDF button
    downloadPdf.addEventListener('click', (e) => {
        e.preventDefault();
        exportToPDF();
    });
    
    // Simple PDF export button
    simplePdfExportBtn.addEventListener('click', (e) => {
        e.preventDefault();
        simplePdfExport();
    });
    
    // Refresh Mermaid diagrams button
    refreshMermaid.addEventListener('click', refreshAllRendering);
    
    // Change the tooltip to match the new functionality
    refreshMermaid.title = "Refresh All Content (Math, Diagrams, Code)";
    
    // Clear editor button
    clearEditor.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear the editor? This action cannot be undone.')) {
            editor.value = '';
            editor.dispatchEvent(new Event('input'));
        }
    });
    
    // Toolbar buttons
    toolbarButtons.forEach(button => {
        button.addEventListener('click', () => {
            handleToolbarAction(button.dataset.action);
        });
    });
    
    // File drag and drop handling
    document.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileDropArea.classList.remove('file-drop-inactive');
        fileDropArea.classList.add('file-drop-active');
    });
    
    document.addEventListener('dragleave', (e) => {
        if (!e.relatedTarget || e.relatedTarget === document.documentElement) {
            fileDropArea.classList.remove('file-drop-active');
            fileDropArea.classList.add('file-drop-inactive');
        }
    });
    
    document.addEventListener('drop', (e) => {
        e.preventDefault();
        fileDropArea.classList.remove('file-drop-active');
        fileDropArea.classList.add('file-drop-inactive');
        
        if (e.dataTransfer.files.length) {
            const file = e.dataTransfer.files[0];
            if (file.type === 'text/markdown' || file.type === 'text/plain' || file.name.endsWith('.md')) {
                handleFileUpload(file);
            } else {
                showNotification('Please drop a Markdown (.md) or text file.', true);
            }
        }
    });
    
    // Keyboard shortcuts modal
    showShortcuts.addEventListener('click', () => {
        shortcutsModal.style.display = 'block';
    });
    
    closeModal.addEventListener('click', () => {
        shortcutsModal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === shortcutsModal) {
            shortcutsModal.style.display = 'none';
        }
    });
    
    // Spell check toggle
    spellCheckToggle.addEventListener('click', toggleSpellCheck);
});

function simplePdfExport() {
  const printWindow = window.open('', '_blank');
  
  // Create a styled document with just the preview content
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Markdown Export</title>
      <style>
        body { font-family: system-ui, sans-serif; line-height: 1.6; padding: 2cm; }
        pre { background: #f5f5f5; padding: 1em; border-radius: 4px; overflow-x: auto; }
        code { background: #f5f5f5; padding: 0.2em 0.4em; border-radius: 3px; }
        img, canvas { max-width: 100%; }
        @media print { @page { margin: 2cm; } }
      </style>
    </head>
    <body>
      ${preview.innerHTML}
    </body>
    </html>
  `);
  
  // Wait for content to load then print
  printWindow.document.close();
  printWindow.addEventListener('load', function() {
    printWindow.print();
    printWindow.close();
  });
}

// Function to refresh all rendered content
function refreshAllRendering() {
    try {
        showLoading('Refreshing content...');
        
        // Force re-render markdown
        renderMarkdown();
        
        // Use Promise.all for better performance
        Promise.all([
            // Force re-render math
            new Promise(resolve => {
                try {
                    renderMathInElement(preview, {
                        delimiters: [
                            {left: '$$', right: '$$', display: true},
                            {left: '$', right: '$', display: false}
                        ],
                        throwOnError: false,
                        output: 'html'
                    });
                    console.log('Math re-rendered');
                } catch (e) {
                    console.error('Math re-render error:', e);
                }
                resolve();
            }),
            
            // Force re-render mermaid diagrams
            new Promise(resolve => {
                try {
                    mermaid.contentLoaded();
                    const mermaidDivs = document.querySelectorAll('.mermaid');
                    mermaid.init(undefined, mermaidDivs);
                    console.log('Mermaid diagrams re-rendered');
                } catch (e) {
                    console.error('Mermaid re-render error:', e);
                }
                resolve();
            }),
            
            // Force re-highlight code blocks
            new Promise(resolve => {
                try {
                    document.querySelectorAll('pre code').forEach((block) => {
                        hljs.highlightElement(block);
                    });
                    console.log('Code highlighting re-applied');
                } catch (e) {
                    console.error('Highlight error:', e);
                }
                resolve();
            })
        ]).then(() => {
            hideLoading();
            showNotification('Content refreshed');
        });
    } catch (e) {
        console.error('Refresh error:', e);
        hideLoading();
        showNotification('Error refreshing content: ' + e.message, true);
    }
}

// Function to toggle spell check
function toggleSpellCheck() {
    const isSpellCheckEnabled = editor.spellcheck;
    editor.spellcheck = !isSpellCheckEnabled;
    
    // Update button appearance
    if (editor.spellcheck) {
        spellCheckToggle.classList.add('active');
        showNotification('Spell check enabled');
    } else {
        spellCheckToggle.classList.remove('active');
        showNotification('Spell check disabled');
    }
    
    // Save preference to local storage
    localStorage.setItem('spellCheck', editor.spellcheck);
    
    // Force editor to re-render to reflect spell check state
    // This is done by briefly detaching and reattaching the editor
    const parent = editor.parentNode;
    const nextSibling = editor.nextSibling;
    parent.removeChild(editor);
    setTimeout(() => {
        parent.insertBefore(editor, nextSibling);
        editor.focus();
    }, 10);
}