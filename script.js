document.addEventListener("DOMContentLoaded", () => {
  console.log("App carregado e pronto para uso offline!");

  // ====== Variáveis ======
  const audio = new Audio();
  let currentSong = null;
  let isPlaying = false;
  const songs = Array.from(document.querySelectorAll(".song"));

  // Mini player
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

  // Fullscreen player
  const fullscreen = document.getElementById("fullscreen-player");
  const fsPlay = document.getElementById("fs-play");
  const fsPrev = document.getElementById("prev");
  const fsNext = document.getElementById("next");
  const fsCover = document.getElementById("fs-cover");
  const fsTitle = document.getElementById("fs-title");
  const fsArtist = document.getElementById("fs-artist");
  const fsProgress = document.getElementById("progress");
  const fsCurrent = document.getElementById("current-time");
  const fsTotal = document.getElementById("total-time");
  const fsClose = document.getElementById("close-fullscreen");

  // Fila de reprodução
  const queue = [];
  const queueList = document.getElementById("queue-list");
  const openQueueBtn = document.getElementById("open-queue");
  const closeQueueBtn = document.getElementById("close-queue");
  const queueContainer = document.getElementById("queue-container");

  // Botões playlist
  const playAllBtn = document.getElementById("play-all");
  const shuffleBtn = document.getElementById("shuffle");

  let shuffleMode = false;
  let shuffledSongs = [];

  // ====== Funções ======
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

    fsCover.src = cover;
    fsTitle.textContent = title;
    fsArtist.textContent = artist;

    miniPlayer.classList.remove("hidden");
  }

  function playSong(song) {
    if (currentSong) {
      currentSong.classList.remove("playing");
      currentSong.querySelector(".play-btn").textContent = "▶";
    }

    currentSong = song;
    audio.src = song.dataset.src;
    audio.currentTime = 0;
    audio.play();
    isPlaying = true;

    song.classList.add("playing");
    song.querySelector(".play-btn").textContent = "⏸";
    miniPlay.textContent = "⏸";
    fsPlay.textContent = "⏸";

    updateUI(song);
  }

  function pauseSong() {
    audio.pause();
    isPlaying = false;
    if (currentSong) currentSong.querySelector(".play-btn").textContent = "▶";
    miniPlay.textContent = "▶";
    fsPlay.textContent = "▶";
  }

  function togglePlay(song) {
    if (!song) return;
    if (isPlaying && currentSong === song) pauseSong();
    else if (currentSong === song) {
      audio.play();
      isPlaying = true;
      song.querySelector(".play-btn").textContent = "⏸";
      miniPlay.textContent = "⏸";
      fsPlay.textContent = "⏸";
    } else playSong(song);
  }

  function playNext() {
    if (!currentSong) return;
    const idx = songs.indexOf(currentSong);
    if (idx < songs.length - 1) playSong(songs[idx + 1]);
  }

  function playPrev() {
    if (!currentSong) return;
    const idx = songs.indexOf(currentSong);
    if (idx > 0) playSong(songs[idx - 1]);
    else audio.currentTime = 0;
  }

  function renderQueue() {
    queueList.innerHTML = "";
    queue.forEach((song, index) => {
      const li = document.createElement("li");
      li.textContent = song.querySelector("strong").textContent;

      const removeBtn = document.createElement("span");
      removeBtn.textContent = "✖";
      removeBtn.classList.add("remove-queue");
      removeBtn.addEventListener("click", () => {
        queue.splice(index, 1);
        renderQueue();
      });

      li.appendChild(removeBtn);
      queueList.appendChild(li);
    });
  }

  function playNextFromQueue() {
    if (queue.length > 0) {
      const nextSong = queue.shift();
      playSong(nextSong);
      renderQueue();
    } else playNextFromPlaylist();
  }

  function playNextFromPlaylist() {
    if (shuffleMode) {
      if (shuffledSongs.length === 0) return;
      playSong(shuffledSongs.shift());
    } else playNext();
  }

  // ====== Eventos ======

  // Eventos da playlist
  songs.forEach(song => {
    song.querySelector(".play-btn").addEventListener("click", () => togglePlay(song));
    song.querySelector("img").addEventListener("click", () => {
      if (!currentSong) playSong(song);
      fullscreen.classList.remove("hidden");
      updateUI(song);
    });
    song.querySelector(".queue-btn").addEventListener("click", () => {
      queue.push(song);
      renderQueue();
    });
  });

  // Mini player
  miniPlay.addEventListener("click", () => togglePlay(currentSong));
  miniPrev.addEventListener("click", () => playPrev());
  miniNext.addEventListener("click", playNextFromQueue);
  miniCover.addEventListener("click", () => {
    if (!currentSong) return;
    fullscreen.classList.remove("hidden");
    updateUI(currentSong);
  });

  // Fullscreen player
  fsPlay.addEventListener("click", () => togglePlay(currentSong));
  fsPrev.addEventListener("click", () => playPrev());
  fsNext.addEventListener("click", () => playNextFromQueue);
  fsClose.addEventListener("click", () => fullscreen.classList.remove("active"));

  // Progresso
  audio.addEventListener("loadedmetadata", () => {
    fsProgress.max = audio.duration;
    miniProgress.max = audio.duration;
    fsTotal.textContent = formatTime(audio.duration);
    miniTotal.textContent = formatTime(audio.duration);
  });

  audio.addEventListener("timeupdate", () => {
    fsProgress.value = audio.currentTime;
    miniProgress.value = audio.currentTime;
    fsCurrent.textContent = formatTime(audio.currentTime);
    miniCurrent.textContent = formatTime(audio.currentTime);
  });

  fsProgress.addEventListener("input", () => (audio.currentTime = fsProgress.value));
  miniProgress.addEventListener("input", () => (audio.currentTime = miniProgress.value));

  // Fim da música
  audio.addEventListener("ended", () => {
    if (queue.length > 0) playNextFromQueue();
    else playNextFromPlaylist();
  });

  // Botão "Tocar Tudo"
  playAllBtn.addEventListener("click", () => {
    if (shuffleMode) {
      shuffledSongs = [...songs].sort(() => Math.random() - 0.5);
      playSong(shuffledSongs.shift());
    } else playSong(songs[0]);
  });

  // Shuffle
  shuffleBtn.addEventListener("click", () => {
    shuffleMode = !shuffleMode;
    shuffleBtn.classList.toggle("active", shuffleMode);
    if (shuffleMode) shuffledSongs = [...songs].sort(() => Math.random() - 0.5);
  });

  // Abrir/fechar fila
  openQueueBtn.addEventListener("click", () => queueContainer.classList.add("visible"));
  closeQueueBtn.addEventListener("click", () => queueContainer.classList.remove("visible"));
});
