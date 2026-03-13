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
        const options = {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            timeZone: "America/Chicago",
            hour12: true
        };
        try {
            clockEl.textContent = now.toLocaleTimeString("en-US", options) + " CT"
        } catch (e) {
            clockEl.textContent = "Time N/A"
        }
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

    events.forEach(({ t, msg }) => {
        const timer = setTimeout(() => {
            const data = JSON.parse(msg);
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
        }, t);
        replayTimers.push(timer);
    });

    const maxT = events[events.length - 1]?.t || 0;
    replayTimers.push(setTimeout(() => {
        stopReplay();
    }, maxT + 1500));
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
            } else {
                lastFmContainer.style.display = 'none';
                if (progressInterval) clearInterval(progressInterval);
            }
        } catch (error) {
            console.error('Error fetching from proxy:', error);
            lastFmContainer.style.display = 'none';
            if (progressInterval) clearInterval(progressInterval);
        }
    }

    fetchLastFmTrack();
    setInterval(fetchLastFmTrack, POLLING_INTERVAL);
});
