function updateAge() {
    const birthDate = new Date(2006, 0, 4);
    const now = new Date();
    let age = now.getFullYear() - birthDate.getFullYear();
    const m = now.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) {
        age--;
    }
    const ageEl = document.getElementById('age');
    if (ageEl) {
        ageEl.textContent = age;
    }
}
updateAge();

function updateYear() {
    const standingEl = document.getElementById('standing');
    if (standingEl) {
        standingEl.textContent = "Junior";
    }
}
updateYear();

function updateClock() {
    const clockEl = document.getElementById('clock');
    if (clockEl) {
        const now = new Date();
        const options = { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'America/Chicago', hour12: true };
        try {
            clockEl.textContent = now.toLocaleTimeString('en-US', options) + " CT";
        } catch (e) {
            clockEl.textContent = "Time N/A";
        }
    }
}
updateClock();
setInterval(updateClock, 1000);

document.addEventListener('mousemove', function(e) {
    const sparkle = document.createElement('div');
    sparkle.classList.add('sparkle');
    sparkle.style.left = (e.pageX - 3) + 'px';
    sparkle.style.top = (e.pageY - 3) + 'px';
    document.body.appendChild(sparkle);
    setTimeout(() => {
        sparkle.remove();
    }, 800);
});

document.querySelectorAll('.nav-right a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});
