const songInput = document.getElementById('songInput');
const addBtn = document.getElementById('addBtn');
const counter = document.getElementById('counter');
const shuffleBtn = document.getElementById('shuffleBtn');
const reverseBtn = document.getElementById('reverseBtn');
const clearBtn = document.getElementById('clearBtn');
const playlist = document.getElementById('playlist');

const songs = [];

function addSong() {

    const title = songInput.value.trim();
    if (!title) return;
    songs.push(title);
    songInput.value = '';

    render();
}

function render() {

  playlist.innerHTML = '';   

  for (let i = 0; i < songs.length; i++) {

    playlist.innerHTML += `
    <li class="list-group-item d-flex justify-content-between align-items-center">
        ${songs[i]}
        <button class="btn btn-sm btn-outline-danger" data-index="${i}">Remove</button>
    </li>`;

    }
  
    counter.textContent = `Songs in playlist: ${songs.length}`;

    const preview = songs.slice(0, 3);   // first 3 songs as a NEW array
    console.log('Preview of top 3 songs:');
    for (const song of preview) {
      console.log(`- ${song}`);
    }

}

function shuffleSongs() {

  for (let i = songs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [songs[i], songs[j]] = [songs[j], songs[i]];
  }

  render();
}

function reverseSongs() {
  songs.reverse();
  render();
}

function clearSongs() {
  songs.length = 0;
  render();
}

addBtn.addEventListener('click', addSong);

shuffleBtn.addEventListener('click', shuffleSongs);

reverseBtn.addEventListener('click', reverseSongs);

clearBtn.addEventListener('click', clearSongs);

playlist.addEventListener('click', function(event) {

  if (event.target.matches('button[data-index]')) {

    const index = Number(event.target.dataset.index);
    songs.splice(index, 1);
    render();

  }
  
});