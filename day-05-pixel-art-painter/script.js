const grid = document.getElementById('grid');
const colorPicker = document.getElementById('colorPicker');
const clearBtn = document.getElementById('clearBtn');
const saveBtn = document.getElementById('saveBtn');
const colorPalette = document.getElementById('colorPalette');

let currentColor = colorPicker.value;
let isDrawing = false;

function buildGrid() {
  for (let i = 0; i < 256; i++) {
    const cell = document.createElement('div');   // 1. build the brick, name it 'cell'
    cell.classList.add('cell');
    cell.setAttribute('draggable', 'false');                    // 2. add a class to that brick
    grid.appendChild(cell);                         // 3. grid, attach the brick
  }
}

buildGrid();
loadArt();

function loadArt() {
  const saved = localStorage.getItem('pixelArt');
  if (!saved) return;   // nothing saved yet — bail
  const colors = JSON.parse(saved);   // string back into an array
  const cells = grid.querySelectorAll('.cell');
  for (let i = 0; i < cells.length; i++) {
    cells[i].style.backgroundColor = colors[i];
  }
}

grid.addEventListener('mousedown', function(event) {

  isDrawing = true;

  if (event.target.classList.contains('cell')) {
    event.target.style.backgroundColor = currentColor;
  }

});

grid.addEventListener('mouseover', function(event) {

  if (isDrawing && event.target.classList.contains('cell')) {
    event.target.style.backgroundColor = currentColor;
  }

});

document.addEventListener('mouseup', function() {
  isDrawing = false;
});


colorPicker.addEventListener('input', function(event) {
  currentColor = event.target.value;
});

colorPalette.addEventListener('click', function(event) {
  if (event.target.dataset.color) {
    currentColor = event.target.dataset.color;
    colorPicker.value = event.target.dataset.color;
  }
});

const cells = grid.querySelectorAll('.cell');



clearBtn.addEventListener('click', function clearGrid() {
  const cells = grid.querySelectorAll('.cell');
  for (const cell of cells) {
    cell.style.backgroundColor = '#ffffff';
  }
});

saveBtn.addEventListener('click', function saveArt() {
  const cells = grid.querySelectorAll('.cell');
  const colors = [];
  for (const cell of cells) {
    colors.push(cell.style.backgroundColor);
  }
  localStorage.setItem('pixelArt', JSON.stringify(colors));
});