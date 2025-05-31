// Update Age Based on Birthdate (January 4, 2006)
function updateAge() {
    const birthDate = new Date(2006, 0, 4);
    const now = new Date();
    let age = now.getFullYear() - birthDate.getFullYear();
    const m = now.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) {
        age--;
    }
    document.getElementById('age').textContent = age;
}
updateAge();

// Update "Year" Based on College Start (Fall 2023)
function updateYear() {
    const startYear = 2023, startMonth = 5;
    const now = new Date();
    let diffYears = now.getFullYear() - startYear;
    if (now.getMonth() + 1 < startMonth) diffYears--;

    let year;
    if (diffYears < 0) year = "Not yet started";
    else if (diffYears === 0) year = "Freshman";
    else if (diffYears === 1) year = "Sophomore";
    else if (diffYears === 2) year = "Junior";
    else year = "Senior";

    const standingEl = document.getElementById('standing');
    if (standingEl) standingEl.textContent = year;
}
updateYear();

// Clock Widget – Always show time in Madison, WI (America/Chicago)
function updateClock() {
    const clockEl = document.getElementById('clock');
    const now = new Date();
    const options = { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'America/Chicago' };
    clockEl.textContent = now.toLocaleTimeString('en-US', options);
}
updateClock();
setInterval(updateClock, 1000);

// Modal Functionality for Project Details
function openModal(projectId) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    let content = '';
    if (projectId === 'project1') {
        content = `
      <h3>Interactive Graph Visualizer</h3>
      <p><strong>Duration:</strong> Sept 2024 – Dec 2024</p>
      <p>
        Developed a tool using HTML5 Canvas to visualize graph algorithms (DFS, BFS, Shortest Path) with 95% test coverage.
      </p>
    `;
    } else if (projectId === 'project2') {
        content = `
      <h3>SPlanner Mobile App</h3>
      <p><strong>Duration:</strong> Mar 2022 – Dec 2023</p>
      <p>
        Built a Flutter‑based task management application featuring dynamic scheduling and Firebase authentication.
      </p>
    `;
    }
    modalBody.innerHTML = content;
    modal.classList.add('active');
}
function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

// Sparkling Cursor Effect
document.addEventListener('mousemove', function(e) {
    const sparkle = document.createElement('div');
    sparkle.classList.add('sparkle');
    sparkle.style.left = (e.pageX - 4) + 'px';
    sparkle.style.top = (e.pageY - 4) + 'px';
    document.body.appendChild(sparkle);
    setTimeout(() => {
        sparkle.remove();
    }, 1000);
});
