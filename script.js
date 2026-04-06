function updateAge() {
    const birthDate = new Date(2006, 0, 4);
    const now = new Date();
    let age = now.getFullYear() - birthDate.getFullYear();
    const m = now.getMonth() - birthDate.getMonth();
    if (m < 0 || m === 0 && now.getDate() < birthDate.getDate()) {
        age--
    }
    const ageEl = document.getElementById("age");
    if (ageEl) {
        ageEl.textContent = age
    }
}
updateAge();

function updateClock() {
    const clockEl = document.getElementById("clock");
    if (clockEl) {
        const now = new Date();
        const hm = now.toLocaleTimeString("en-US", {
            hour: "2-digit", minute: "2-digit",
            timeZone: "America/Chicago", hour12: true
        });
        const sec = now.toLocaleTimeString("en-US", {
            second: "2-digit",
            timeZone: "America/Chicago", hour12: false
        }).slice(-2);
        clockEl.innerHTML = hm + ':<span class="clock-sec">' + sec + '</span> CT';
    }
}
updateClock();
setInterval(updateClock, 1e3);

document.querySelectorAll('.nav-right a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function(e) {
        e.preventDefault();
        const targetId = this.getAttribute("href");
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: "smooth"
            })
        }
    })
});

// Copy email to clipboard
function copyEmail(e) {
    if (e) e.preventDefault();
    navigator.clipboard.writeText('sanyam@sanyamgarg.com').then(() => {
        const link = document.querySelector('.copy-email');
        if (!link) return;
        let tip = link.querySelector('.copy-tooltip');
        if (!tip) {
            tip = document.createElement('span');
            tip.className = 'copy-tooltip';
            link.appendChild(tip);
        }
        tip.textContent = 'Copied!';
        tip.classList.add('show');
        link.classList.add('flash');
        setTimeout(() => {
            tip.classList.remove('show');
            link.classList.remove('flash');
        }, 1500);
    });
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    switch(e.key.toLowerCase()) {
        case 'r': window.open('https://resume.sanyamgarg.com', '_blank'); break;
        case 'g': window.open('https://github.com/Sanyam-G', '_blank'); break;
        case 'e': copyEmail(null); break;
    }
});

// Typing effect on intro
(function() {
    const text = "UW\u2013Madison junior studying Computer Science & Data Science. I build infrastructure, backend systems, and tools that solve problems I actually have.";
    const el = document.getElementById('intro-text');
    if (!el) return;
    let i = 0;
    const speed = 18;
    function type() {
        if (i < text.length) {
            el.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        } else {
            setTimeout(() => el.classList.add('done'), 1500);
        }
    }
    type();
})();

// Guestbook (pixel stamps via Firebase, shared with blog.sanyamgarg.com)
(function() {
    const grid = document.getElementById('gb-grid');
    const palette = document.getElementById('gb-palette');
    if (!grid || !palette) return;

    let paintColor = '#1A1A1A';
    let pixels = new Array(100).fill('#F5F3EF');

    // Build 10x10 grid
    for (let i = 0; i < 100; i++) {
        const p = document.createElement('div');
        p.className = 'pixel';
        p.dataset.i = i;
        p.addEventListener('mousedown', () => paint(i, p));
        p.addEventListener('mouseenter', (e) => { if (e.buttons === 1) paint(i, p); });
        grid.appendChild(p);
    }

    // Touch support
    grid.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const t = e.touches[0];
        const el = document.elementFromPoint(t.clientX, t.clientY);
        if (el && el.classList.contains('pixel')) paint(parseInt(el.dataset.i), el);
    }, { passive: false });

    grid.addEventListener('touchstart', (e) => {
        const t = e.touches[0];
        const el = document.elementFromPoint(t.clientX, t.clientY);
        if (el && el.classList.contains('pixel')) paint(parseInt(el.dataset.i), el);
    }, { passive: true });

    function paint(i, el) {
        pixels[i] = paintColor;
        el.style.backgroundColor = paintColor;
    }

    // Palette
    palette.querySelectorAll('.gb-swatch').forEach(s => {
        s.addEventListener('click', () => {
            palette.querySelector('.active').classList.remove('active');
            s.classList.add('active');
            paintColor = s.dataset.c;
        });
    });

    // Clear
    window.clearStamp = function() {
        pixels.fill('#F5F3EF');
        Array.from(grid.children).forEach(p => p.style.backgroundColor = '');
    };

    // Submit
    window.submitStamp = function() {
        const name = document.getElementById('gb-name').value.trim();
        if (!name) { document.getElementById('gb-name').focus(); return; }
        if (pixels.every(c => c === '#F5F3EF')) return;

        if (!window._fbRef || !window._fbPush) return;

        const btn = document.querySelector('.gb-submit');
        btn.textContent = '...';
        btn.disabled = true;

        window._fbPush(window._fbRef, pixels).then(() => {
            clearStamp();
            btn.innerHTML = 'Stamp &#8599;';
            btn.disabled = false;
        }).catch(() => {
            btn.innerHTML = 'Stamp &#8599;';
            btn.disabled = false;
        });
    };

    // Load gallery from Firebase (real-time)
    function renderGallery(data) {
        const gallery = document.getElementById('gb-gallery');
        if (!gallery) return;
        if (!data) { gallery.innerHTML = '<div class="gb-empty">No stamps yet. Be the first.</div>'; return; }
        gallery.innerHTML = '';
        Object.values(data).reverse().forEach(art => {
            const stamp = document.createElement('div');
            stamp.className = 'gb-stamp';
            const g = document.createElement('div');
            g.className = 'gb-stamp-grid';
            art.forEach(c => {
                const d = document.createElement('div');
                d.className = 'gp';
                d.style.backgroundColor = c;
                g.appendChild(d);
            });
            stamp.appendChild(g);
            gallery.appendChild(stamp);
        });
    }

    function initFirebaseGallery() {
        if (!window._fbRef) return;
        const q = window._fbQuery(window._fbRef, window._fbLimitToLast(30));
        window._fbOnValue(q, (snapshot) => renderGallery(snapshot.val()));
    }

    if (window._fbRef) {
        initFirebaseGallery();
    } else {
        window.addEventListener('fb-ready', initFirebaseGallery);
    }
})();

// Sentinel live stats
(function() {
    const el = document.getElementById('sentinel-stats');
    if (!el) return;
    function update() {
        fetch('https://sentinel.sanyamgarg.com/api/stats')
            .then(r => r.json())
            .then(data => {
                el.textContent = data.total.toLocaleString() + ' attacks · ' + data.unique_ips + ' IPs · ' + data.unique_countries + ' countries · last hour';
            })
            .catch(() => {});
    }
    update();
    setInterval(update, 30000);
})();

// Dynamic section numbering (skips hidden sections)
function numberSections() {
    const labels = document.querySelectorAll('[data-section]');
    let n = 1;
    labels.forEach(label => {
        const section = label.closest('.section');
        if (section && (section.offsetParent === null || section.style.display === 'none')) return;
        label.dataset.num = String(n).padStart(2, '0');
        n++;
    });
}
numberSections();

// Country code -> flag emoji
function countryFlag(code) {
    if (!code || code.length !== 2) return '';
    return [...code.toUpperCase()].map(c =>
        String.fromCodePoint(c.charCodeAt(0) + 127397)).join('');
}

// Live cursors
(function() {
    const WS_URL = 'wss://cursors.sanyamgarg.com';
    const THROTTLE_MS = 50;
    const CURSOR_TIMEOUT = 10000;
    const COLORS = ['#f7768e','#ff9e64','#e0af68','#9ece6a','#7dcfff','#7aa2f7','#bb9af7','#f7768e'];

    let ws = null;
    let myId = null;
    let cursors = {};
    let lastSend = 0;

    function connect() {
        try { ws = new WebSocket(WS_URL); } catch(e) { return; }

        ws.onmessage = function(e) {
            let msg;
            try { msg = JSON.parse(e.data); } catch(e) { return; }

            if (msg.type === 'id') {
                myId = msg.id;
                return;
            }
            if (msg.type === 'move' && msg.id !== myId) {
                if (!cursors[msg.id]) {
                    cursors[msg.id] = createCursor(msg.id, msg.country);
                    updateVisitorCount();
                }
                const c = cursors[msg.id];
                c.el.style.left = (msg.x * window.innerWidth) + 'px';
                c.el.style.top = (msg.y * document.documentElement.scrollHeight) + 'px';
                c.el.style.opacity = '1';
                c.lastSeen = Date.now();
            }
            if (msg.type === 'leave') {
                removeCursor(msg.id);
            }
        };

        ws.onclose = function() { setTimeout(connect, 3000); };
        ws.onerror = function() { ws.close(); };
    }

    function createCursor(id, country) {
        const el = document.createElement('div');
        el.style.cssText = 'position:absolute;pointer-events:none;z-index:9999;transition:left 0.1s,top 0.1s;opacity:0;display:flex;align-items:center;gap:3px;';
        const color = COLORS[Math.abs(hashCode(id)) % COLORS.length];
        const flag = countryFlag(country);
        el.innerHTML = '<svg width="16" height="20" viewBox="0 0 16 20"><path d="M0 0L16 12L8 12L12 20L8 18L4 12L0 16Z" fill="'+color+'" stroke="#fff" stroke-width="1"/></svg>'
            + (flag ? '<span style="font-size:12px">' + flag + '</span>' : '');
        document.body.appendChild(el);
        return { el: el, lastSeen: Date.now() };
    }

    function removeCursor(id) {
        if (cursors[id]) {
            cursors[id].el.remove();
            delete cursors[id];
        }
        updateVisitorCount();
    }

    function updateVisitorCount() {
        const el = document.getElementById('visitor-count');
        if (!el) return;
        const others = Object.keys(cursors).length;
        if (others > 0) {
            el.textContent = (others + 1) + ' people on this page right now';
        } else {
            el.textContent = '';
        }
    }

    function hashCode(s) {
        let h = 0;
        for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
        return h;
    }

    document.addEventListener('mousemove', function(e) {
        const now = Date.now();
        if (now - lastSend < THROTTLE_MS || !ws || ws.readyState !== 1) return;
        lastSend = now;
        ws.send(JSON.stringify({
            type: 'move',
            x: e.pageX / window.innerWidth,
            y: e.pageY / document.documentElement.scrollHeight
        }));
    });

    setInterval(function() {
        const now = Date.now();
        for (const id in cursors) {
            if (now - cursors[id].lastSeen > CURSOR_TIMEOUT) removeCursor(id);
        }
    }, 2000);

    connect();
})();

// Ghost replay
let replayTimers = [];
let ghostCursors = {};

async function startReplay() {
    stopReplay();
    const btn = document.getElementById('replay-btn');
    btn.textContent = '⏳ Loading...';
    btn.disabled = true;

    const events = await fetch('https://cursors.sanyamgarg.com/replay')
        .then(r => r.json()).catch(() => []);

    if (!events || events.length === 0) {
        btn.textContent = '👻 Watch this week\'s visitors';
        btn.disabled = false;
        return;
    }

    btn.textContent = '✕ Stop';
    btn.disabled = false;
    btn.onclick = stopReplay;

    // Group events by visitor ID and normalize each session to start at t=0
    const sessions = {};
    events.forEach(({ t, msg }) => {
            const data = typeof msg === 'string' ? JSON.parse(msg) : msg;
        if (!data.id) return;
        if (!sessions[data.id]) sessions[data.id] = [];
        sessions[data.id].push({ t, data });
    });

    let maxSessionLength = 0;

    Object.values(sessions).forEach(session => {
        const base = session[0].t;
        session.forEach(({ t, data }) => {
            const relT = t - base;
            maxSessionLength = Math.max(maxSessionLength, relT);
            const timer = setTimeout(() => {
            if (data.type === 'move') {
                const key = 'ghost-' + data.id;
                if (!ghostCursors[key]) {
                    const el = document.createElement('div');
                    el.style.cssText = 'position:absolute;pointer-events:none;z-index:9998;transition:left 0.1s,top 0.1s;opacity:0;display:flex;align-items:center;gap:3px;';
                    const flag = countryFlag(data.country);
                    el.innerHTML = '<svg width="16" height="20" viewBox="0 0 16 20" style="opacity:0.35"><path d="M0 0L16 12L8 12L12 20L8 18L4 12L0 16Z" fill="#a9b1d6" stroke="#fff" stroke-width="1"/></svg>'
                        + (flag ? '<span style="font-size:12px;opacity:0.5">' + flag + '</span>' : '');
                    document.body.appendChild(el);
                    ghostCursors[key] = el;
                }
                const el = ghostCursors[key];
                el.style.left = (data.x * window.innerWidth) + 'px';
                el.style.top = (data.y * document.documentElement.scrollHeight) + 'px';
                el.style.opacity = '1';
            }
            if (data.type === 'leave') {
                const key = 'ghost-' + data.id;
                if (ghostCursors[key]) { ghostCursors[key].remove(); delete ghostCursors[key]; }
            }
            }, relT);
        replayTimers.push(timer);
        });
    });

    replayTimers.push(setTimeout(() => {
        stopReplay();
    }, maxSessionLength + 1500));
}

function stopReplay() {
    replayTimers.forEach(clearTimeout);
    replayTimers = [];
    Object.values(ghostCursors).forEach(el => el.remove());
    ghostCursors = {};
    const btn = document.getElementById('replay-btn');
    if (btn) {
        btn.textContent = '👻 Watch this week\'s visitors';
        btn.disabled = false;
        btn.onclick = startReplay;
    }
}

// Last.fm Logic
document.addEventListener("DOMContentLoaded", () => {
    const POLLING_INTERVAL = 5000;
    const PROGRESS_UPDATE_INTERVAL = 500;

    const lastFmContainer = document.getElementById('lastfm-container');
    const currentlyContainer = document.getElementById('currently-container');
    const trackNameEl = document.getElementById('lastfm-track-name');
    const artistNameEl = document.getElementById('lastfm-artist-name');
    const progressBarEl = document.getElementById('progress-bar-foreground');

    let progressInterval = null;

    function updateProgressBar(startTime, duration) {
        if (!duration || !startTime) {
            progressBarEl.style.width = '0%';
            return;
        };

        const elapsedTime = Date.now() - startTime;
        let progress = (elapsedTime / duration) * 100;
        progress = Math.min(progress, 100); 

        progressBarEl.style.width = `${progress}%`;
    }

    async function fetchLastFmTrack() {
        const proxyUrl = 'https://lastfm-api-proxy.sanyamg2006.workers.dev/'; 

        try {
            const response = await fetch(proxyUrl);
            const data = await response.json();

            if (data.now_playing && data.name) { 
                const trackLinkEl = document.getElementById('lastfm-track-name');
                const artistNameEl = document.getElementById('lastfm-artist-name');

                trackLinkEl.textContent = data.name;
                trackLinkEl.href = data.url;
                artistNameEl.textContent = data.artist;

                if (progressInterval) clearInterval(progressInterval);
                
                updateProgressBar(data.start_time_ms, data.duration_ms);
                
                progressInterval = setInterval(() => {
                    updateProgressBar(data.start_time_ms, data.duration_ms);
                }, PROGRESS_UPDATE_INTERVAL);

                lastFmContainer.style.display = 'flex';
                if (currentlyContainer) currentlyContainer.style.display = 'none';
                numberSections();
            } else {
                lastFmContainer.style.display = 'none';
                if (currentlyContainer) currentlyContainer.style.display = '';
                numberSections();
                if (progressInterval) clearInterval(progressInterval);
            }
        } catch (error) {
            console.error('Error fetching from proxy:', error);
            lastFmContainer.style.display = 'none';
            if (currentlyContainer) currentlyContainer.style.display = '';
            numberSections();
            if (progressInterval) clearInterval(progressInterval);
        }
    }

    fetchLastFmTrack();
    setInterval(fetchLastFmTrack, POLLING_INTERVAL);
});

// Stagger load animation
document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('.section, .identity-bar, .status-bar');
    sections.forEach((el, i) => {
        el.classList.add('stagger');
        el.style.animationDelay = (i * 60) + 'ms';
    });
});
