// Multimedia JavaScript - Lazy Loading, Caching, and Interactivity

document.addEventListener('DOMContentLoaded', function() {
    // Initialize lazy loading
    initLazyLoading();
    
    // Setup browser cache headers
    setupCaching();
    
    // Analytics tracking
    trackMediaInteraction();
});

/**
 * Initialize Lazy Loading for Videos and Audio
 */
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const mediaElements = document.querySelectorAll('.lazy-video, .lazy-audio');
        
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const media = entry.target;
                    
                    // Load the source
                    if (media.dataset.src) {
                        media.src = media.dataset.src;
                    }
                    
                    // For video/audio with source tags
                    const sources = media.querySelectorAll('source');
                    sources.forEach(source => {
                        if (source.dataset.src) {
                            source.src = source.dataset.src;
                        }
                    });
                    
                    // Reload media
                    media.load();
                    
                    // Remove lazy class and observer
                    media.classList.remove('lazy-video', 'lazy-audio');
                    observer.unobserve(media);
                }
            });
        }, {
            rootMargin: '50px'
        });
        
        mediaElements.forEach(media => observer.observe(media));
    } else {
        // Fallback for browsers without IntersectionObserver
        const mediaElements = document.querySelectorAll('.lazy-video, .lazy-audio');
        mediaElements.forEach(media => {
            if (media.dataset.src) {
                media.src = media.dataset.src;
                media.load();
            }
        });
    }
}

/**
 * Setup Browser Caching
 * Note: Actual caching is handled by .htaccess and HTTP headers
 * This function sets cache metadata in localStorage
 */
function setupCaching() {
    const cacheKey = 'multimedia-cache-v1';
    const cacheExpiry = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    // Get current cache metadata
    let cacheData = JSON.parse(localStorage.getItem(cacheKey)) || {};
    const currentTime = Date.now();
    
    // Check if cache is expired
    if (cacheData.timestamp && (currentTime - cacheData.timestamp) > cacheExpiry) {
        localStorage.removeItem(cacheKey);
        cacheData = {};
    }
    
    // Update cache metadata
    cacheData.timestamp = currentTime;
    cacheData.mediaLoaded = {
        videos: document.querySelectorAll('video').length,
        audio: document.querySelectorAll('audio').length
    };
    
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
}

/**
 * Track Media Interactions
 */
function trackMediaInteraction() {
    const videos = document.querySelectorAll('video');
    const audios = document.querySelectorAll('audio');
    
    videos.forEach(video => {
        video.addEventListener('play', () => {
            logInteraction('video_play', video.parentElement.parentElement.querySelector('h3').textContent);
        });
        
        video.addEventListener('pause', () => {
            logInteraction('video_pause', video.parentElement.parentElement.querySelector('h3').textContent);
        });
    });
    
    audios.forEach(audio => {
        audio.addEventListener('play', () => {
            logInteraction('audio_play', audio.parentElement.parentElement.querySelector('h3').textContent);
        });
        
        audio.addEventListener('pause', () => {
            logInteraction('audio_pause', audio.parentElement.parentElement.querySelector('h3').textContent);
        });
    });
}

/**
 * Log User Interactions
 */
function logInteraction(action, mediaTitle) {
    const interactionKey = 'multimedia-interactions';
    let interactions = JSON.parse(localStorage.getItem(interactionKey)) || [];
    
    interactions.push({
        action: action,
        media: mediaTitle,
        timestamp: new Date().toISOString()
    });
    
    // Keep only last 50 interactions
    if (interactions.length > 50) {
        interactions = interactions.slice(-50);
    }
    
    localStorage.setItem(interactionKey, JSON.stringify(interactions));
}

/**
 * Download Resources Function
 */
function downloadMultimediaResources() {
    const resources = {
        videos: Array.from(document.querySelectorAll('.media-card h3')).map(h => h.textContent),
        audios: Array.from(document.querySelectorAll('.audio-card h3')).map(h => h.textContent)
    };
    
    const dataStr = JSON.stringify(resources, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'multimedia-resources.json';
    link.click();
    
    URL.revokeObjectURL(url);
}

/**
 * Preload Adjacent Media
 */
function preloadAdjacentMedia() {
    const mediaCards = document.querySelectorAll('.media-card');
    
    mediaCards.forEach((card, index) => {
        // Get the video/audio in this card
        const media = card.querySelector('video, audio');
        
        // Preload next media when this one is playing
        if (media) {
            media.addEventListener('play', () => {
                if (index + 1 < mediaCards.length) {
                    const nextMedia = mediaCards[index + 1].querySelector('video, audio');
                    if (nextMedia && nextMedia.preload !== 'auto') {
                        nextMedia.preload = 'metadata';
                    }
                }
            });
        }
    });
}

/**
 * Initialize Preloading on Page Load
 */
window.addEventListener('load', () => {
    preloadAdjacentMedia();
});

/**
 * Performance Monitoring
 */
function monitorPerformance() {
    if (window.performance && window.performance.timing) {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        
        console.log('Page Load Time: ' + pageLoadTime + 'ms');
        
        // Store performance metrics
        localStorage.setItem('page-load-time', pageLoadTime);
    }
}

window.addEventListener('load', monitorPerformance);

/**
 * Optimize Media Loading Based on Connection Speed
 */
function optimizeForConnection() {
    if (navigator.connection) {
        const connection = navigator.connection;
        const effectiveType = connection.effectiveType;
        
        // Adjust video quality based on connection
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            if (effectiveType === '4g') {
                video.setAttribute('preload', 'auto');
            } else if (effectiveType === '3g') {
                video.setAttribute('preload', 'metadata');
            } else {
                video.setAttribute('preload', 'none');
            }
        });
    }
}

optimizeForConnection();

/**
 * Handle Network Status Changes
 */
window.addEventListener('online', () => {
    console.log('Online - resuming media playback');
    // Resume playback when back online
});

window.addEventListener('offline', () => {
    console.log('Offline - pausing media');
    // Pause playback when offline
    document.querySelectorAll('video, audio').forEach(media => {
        media.pause();
    });
});

/**
 * Service Worker Registration (for PWA support)
 */
if ('serviceWorker' in navigator) {
    // Uncomment when service worker is available
    // navigator.serviceWorker.register('sw.js').catch(err => console.log('SW registration failed'));
}
