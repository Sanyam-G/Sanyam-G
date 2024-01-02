document.getElementById('addNote').addEventListener('click', addNewNote);

function addNewNote() {
    const noteContainer = document.createElement('div');
    noteContainer.classList.add('note');
    noteContainer.style.left = '50px'; // Default position
    noteContainer.style.top = '100px'; // Default position

    const textArea = document.createElement('textarea');
    noteContainer.appendChild(textArea);

    const deleteBtn = document.createElement('div');
    deleteBtn.textContent = 'X';
    deleteBtn.classList.add('delete');
    deleteBtn.onclick = function() {
        noteContainer.remove();
    };
    noteContainer.appendChild(deleteBtn);

    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.classList.add('color-picker');
    colorInput.oninput = function() {
        noteContainer.style.backgroundColor = colorInput.value;
    };
    noteContainer.appendChild(colorInput);

    const fontSelector = document.createElement('select');
    fontSelector.classList.add('font-picker');
    const fonts = ["Arial", "Verdana", "Times New Roman", "Courier New", "Trebuchet MS"];
    fonts.forEach(font => {
        const option = document.createElement('option');
        option.value = font;
        option.textContent = font;
        fontSelector.appendChild(option);
    });
    fontSelector.onchange = function() {
        textArea.style.fontFamily = fontSelector.value;
    };
    fontSelector.onmousedown = function(e) {
        e.stopPropagation();
    };
    noteContainer.appendChild(fontSelector);

    document.getElementById('notesContainer').appendChild(noteContainer);

    // Draggable functionality
    noteContainer.addEventListener('mousedown', function(e) {
        e.preventDefault();
        let offsetX = e.clientX - noteContainer.getBoundingClientRect().left;
        let offsetY = e.clientY - noteContainer.getBoundingClientRect().top;

        function mouseMoveHandler(e) {
            noteContainer.style.left = (e.clientX - offsetX) + 'px';
            noteContainer.style.top = (e.clientY - offsetY) + 'px';
        }

        function reset() {
            window.removeEventListener('mousemove', mouseMoveHandler);
            window.removeEventListener('mouseup', reset);
        }

        window.addEventListener('mousemove', mouseMoveHandler);
        window.addEventListener('mouseup', reset);
    });
}
