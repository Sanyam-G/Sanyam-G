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

document.addEventListener("mousemove", function(e) {
    const sparkle = document.createElement("div");
    sparkle.classList.add("sparkle");
    sparkle.style.left = e.pageX - 3 + "px";
    sparkle.style.top = e.pageY - 3 + "px";
    document.body.appendChild(sparkle);
    setTimeout(() => {
        sparkle.remove()
    }, 800)
});

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