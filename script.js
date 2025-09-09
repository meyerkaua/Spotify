console.log("App carregado e pronto!");

// ----- Variáveis globais -----
const audio = new Audio();
let currentSong = null;
let isPlaying = false;

// Lista de músicas
const songs = Array.from(document.querySelectorAll(".song"));

// Mini Player
const miniPlayer = document.getElementById("mini-player");
const miniCover = document.getElementById("mini-cover");
const miniTitle = document.getElementById("mini-title");
const miniArtist = document.getElementById("mini-artist");
const miniPlay = document.getElementById("mini-play");
const miniPrev = document.getElementById("mini-prev");
const miniNext = document.getElementById("mini-next");
const miniProgress = document.getElementById("mini-progress");
const miniCurrent = document.getElementById("mini-current");
const miniTotal = document.getElementById("mini-total");

// Fila
const queueBtn = document.getElementById("open-queue");
const queueContainer = document.getElementById("queue-container");
const closeQueueBtn = document.getElementById("close-queue");
const queueList = document.getElementById("queue-list");
const queue = [];

// ----- Funções auxiliares -----
function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec < 10 ? "0" : ""}${sec}`;
}

function updateUI(song) {
  const cover = song.querySelector("img").src;
  const title = song.querySelector("strong").textContent;
  const artist = song.querySelector("span").textContent;

  miniCover.src = cover;
  miniTitle.textContent = title;
  miniArtist.textContent = artist;

  miniPlayer.classList.remove("hidden");
  updateSongHighlight();
}

function updateSongHighlight() {
  songs.forEach(s => {
    const titleEl = s.querySelector("strong");
    const playBtn = s.querySelector(".play-btn");
    if (s === currentSong) {
      titleEl.style.color = "#1DB954";
      playBtn.textContent = isPlaying ? "⏸" : "▶";
    } else {
      titleEl.style.color = "#fff";
      playBtn.textContent = "▶";
    }
  });
}

// ----- Tocar música -----
function playSong(song) {
  if (currentSong) currentSong.classList.remove("playing");

  currentSong = song;
  audio.src = song.dataset.src;
  audio.currentTime = 0;
  audio.play();
  isPlaying = true;

  song.classList.add("playing");
  miniPlay.textContent = "⏸";
  updateUI(song);
}

function pauseSong() {
  audio.pause();
  isPlaying = false;
  miniPlay.textContent = "▶";
  updateSongHighlight();
}

function togglePlay(song) {
  if (!song) return;
  if (isPlaying && currentSong === song) {
    pauseSong();
  } else if (currentSong === song) {
    audio.play();
    isPlaying = true;
    miniPlay.textContent = "⏸";
    updateSongHighlight();
  } else {
    playSong(song);
  }
}

// ----- Próxima/Anterior música -----
function playNext() {
  if (queue.length > 0) {
    // Toca a próxima música da fila
    const nextSong = queue.shift();
    playSong(nextSong);
    renderQueue();
  } else {
    // Aleatório quando a fila acabar
    if (!currentSong) return;
    let remainingSongs = songs.filter(s => s !== currentSong);
    const nextSong = remainingSongs[Math.floor(Math.random() * remainingSongs.length)];
    playSong(nextSong);
  }
}

function playPrev() {
  playNext(); // mantém aleatório mesmo ao voltar
}

// ----- Atualizar progress bar -----
audio.addEventListener("loadedmetadata", () => {
  miniProgress.max = audio.duration;
  miniTotal.textContent = formatTime(audio.duration);
});

audio.addEventListener("timeupdate", () => {
  miniProgress.value = audio.currentTime;
  miniCurrent.textContent = formatTime(audio.currentTime);
});

miniProgress.addEventListener("input", () => (audio.currentTime = miniProgress.value));

// ----- Eventos dos botões da lista -----
songs.forEach(song => {
  const playBtn = song.querySelector(".play-btn");
  const queueButton = song.querySelector(".queue-btn");

  // Tocar ao clicar em qualquer área da música, exceto fila
  song.addEventListener("click", e => {
    if (e.target === queueButton) return;
    togglePlay(song);
  });

  playBtn.addEventListener("click", e => {
    e.stopPropagation();
    togglePlay(song);
  });

  queueButton.addEventListener("click", e => {
    e.stopPropagation();
    queue.push(song);
    renderQueue();
  });
});

// ----- Mini player -----
miniPlay.addEventListener("click", () => togglePlay(currentSong));
miniPrev.addEventListener("click", playPrev);
miniNext.addEventListener("click", playNext);

// ----- Fila -----
function renderQueue() {
  queueList.innerHTML = "";
  queue.forEach((song, i) => {
    const li = document.createElement("li");
    li.textContent = song.querySelector("strong").textContent;
    const removeBtn = document.createElement("span");
    removeBtn.textContent = "✖";
    removeBtn.classList.add("remove-queue");
    removeBtn.addEventListener("click", () => {
      queue.splice(i, 1);
      renderQueue();
    });
    li.appendChild(removeBtn);
    queueList.appendChild(li);
  });
}

// Alterna a visualização da fila
const queueToggleBtn = document.getElementById("open-queue");
queueToggleBtn.addEventListener("click", () => {
  queueContainer.classList.toggle("visible");
});
closeQueueBtn.addEventListener("click", () => {
  queueContainer.classList.remove("visible");
});

// ----- Inicia música aleatória -----
window.addEventListener("DOMContentLoaded", () => {
  const firstSong = songs[Math.floor(Math.random() * songs.length)];
  playSong(firstSong);
});

// ----- Próxima música ao terminar -----
audio.addEventListener("ended", playNext);
