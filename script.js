// --- Fetch Kenmei Activity ---
async function fetchKenmeiActivity() {
  const activityFeed = document.getElementById('activity-feed');
  try {
    const response = await fetch('https://40d538ba-3c5f-4319-86e0-307c24da2c59-00-2ariedr1c85ip.worf.replit.dev/get-activity');
    if (!response.ok) throw new Error('Network response was not ok');
    const activities = await response.json();
    if (!activities?.length) {
      activityFeed.textContent = 'No recent activity available.';
      return;
    }
    const lastActivities = activities.slice(0, 8);
    activityFeed.innerHTML = lastActivities.map(activity => `
      <div class="activity-card">
        <img src="${activity.cover}" alt="Cover Image">
        <div class="activity-details">
          <h3>${activity.text}</h3>
          <p class="timestamp">Posted on: ${new Date(activity.timestamp).toLocaleDateString()}</p>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error fetching activity:', error);
    activityFeed.textContent = 'Failed to load activity. Please try again later.';
  }
}

// --- Carousel Logic with Swipe Support ---
function setupCarousel() {
  const carousel = document.querySelector('.carousel-container');
  const track = document.querySelector('.carousel-track');
  const cards = document.querySelectorAll('.card');
  const memberName = document.querySelector('.member-name');

  let currentIndex = 0;
  let isDragging = false;
  let startPos = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let animationID;

  const names = [
    "55555555555", "6999", "Aldeanos", "Armarouge", "BoaHancock",
    "Brambleghast", "Charcadet", "Chifune", "Conkdor", "Dachsbun",
    "DRUGZ", "Eishia", "Gestella", "Hancock", "Heartslabyul",
    "Hyperdrive", "IronJugulis", "Looters", "Lortelle", "McRib",
    "Mosts", "MrClean", "MrSatan", "N6M", "Natalinoe",
    "Pawmo", "Radiru", "Samer", "Shehulk", "Siasha",
    "Snippets", "Stockholder", "Sylphiette", "Tetona", "Tristeza",
    "Unfuse", "Westbrook", "Yammy", "YJK", "Zaybi"
  ];

  function updateCarousel(newIndex) {
    currentIndex = (newIndex + cards.length) % cards.length;
    cards.forEach((card, i) => {
      card.className = 'card';
      const offset = (i - currentIndex + cards.length) % cards.length;
      if (offset === 0) card.classList.add("center");
      else if (offset === 1) card.classList.add("right-1");
      else if (offset === 2) card.classList.add("right-2");
      else if (offset === cards.length - 1) card.classList.add("left-1");
      else if (offset === cards.length - 2) card.classList.add("left-2");
      else card.classList.add("hidden");
    });
    memberName.textContent = names[currentIndex];
  }

  track.addEventListener('mousedown', startDrag);
  track.addEventListener('touchstart', startDrag);
  track.addEventListener('mousemove', drag);
  track.addEventListener('touchmove', drag);
  track.addEventListener('mouseup', endDrag);
  track.addEventListener('mouseleave', endDrag);
  track.addEventListener('touchend', endDrag);

  function startDrag(e) {
    isDragging = true;
    startPos = getPositionX(e);
    animationID = requestAnimationFrame(animation);
  }

  function drag(e) {
    if (!isDragging) return;
    const currentPosition = getPositionX(e);
    currentTranslate = prevTranslate + currentPosition - startPos;
  }

  function endDrag() {
    cancelAnimationFrame(animationID);
    if (!isDragging) return;
    isDragging = false;
    const movedBy = currentTranslate - prevTranslate;
    if (movedBy < -100) updateCarousel(currentIndex + 1);
    else if (movedBy > 100) updateCarousel(currentIndex - 1);
    else updateCarousel(currentIndex);
    currentTranslate = 0;
    prevTranslate = 0;
  }

  function getPositionX(e) {
    return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
  }

  function animation() {
    if (isDragging) requestAnimationFrame(animation);
  }

  updateCarousel(0);
}

// --- Mini Music Player Logic ---
document.addEventListener('DOMContentLoaded', () => {
  fetchKenmeiActivity();
  setupCarousel();

  const audioPlayer = document.getElementById("audioPlayer");
  const playPauseBtn = document.getElementById("playPauseBtn");
  const playPauseIcon = document.getElementById("playPauseIcon");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const shuffleBtn = document.getElementById("shuffleBtn");
  const progressBar = document.getElementById("progressBar");
  const currentTimeDisplay = document.getElementById("currentTime");
  const totalTimeDisplay = document.getElementById("totalTime");
  const songTitleDisplay = document.getElementById("songTitle"); // ADD THIS

const songs = [
  { title: "Heroic Desire", url: "https://github.com/q7XvR9f4MZnA2pLWtk3bEoJqVHgYcK5dTRX8LUz/music/raw/main/heroic%20desire.mp3" },
  { title: "Interia", url: "https://github.com/q7XvR9f4MZnA2pLWtk3bEoJqVHgYcK5dTRX8LUz/music/raw/main/Interia.mp3" },
  { title: "The Line", url: "https://github.com/q7XvR9f4MZnA2pLWtk3bEoJqVHgYcK5dTRX8LUz/music/raw/main/The%20Line.mp3" },
  
];


  let currentSongIndex = 0;
  loadSong(currentSongIndex);

  function loadSong(index) {
    audioPlayer.src = songs[index].url;
    audioPlayer.load();
    songTitleDisplay.textContent = songs[index].title; // Update title display
  }

  function playSong() {
    audioPlayer.play();
    playPauseIcon.classList.remove("fa-play");
    playPauseIcon.classList.add("fa-pause");
  }

  function pauseSong() {
    audioPlayer.pause();
    playPauseIcon.classList.remove("fa-pause");
    playPauseIcon.classList.add("fa-play");
  }

  function togglePlayPause() {
    if (audioPlayer.paused) {
      playSong();
    } else {
      pauseSong();
    }
  }

  function nextSong() {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    loadSong(currentSongIndex);
    playSong();
  }

  function prevSong() {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    loadSong(currentSongIndex);
    playSong();
  }

  function shuffleSong() {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * songs.length);
    } while (randomIndex === currentSongIndex);
    currentSongIndex = randomIndex;
    loadSong(currentSongIndex);
    playSong();
  }

  // Event Listeners
  playPauseBtn.addEventListener("click", togglePlayPause);
  nextBtn.addEventListener("click", nextSong);
  prevBtn.addEventListener("click", prevSong);
  shuffleBtn.addEventListener("click", shuffleSong);

  audioPlayer.addEventListener("loadedmetadata", () => {
    progressBar.max = audioPlayer.duration;
    totalTimeDisplay.textContent = formatTime(audioPlayer.duration);
  });

  audioPlayer.addEventListener("timeupdate", () => {
    progressBar.value = audioPlayer.currentTime;
    currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
  });

  progressBar.addEventListener("input", () => {
    audioPlayer.currentTime = progressBar.value;
  });

  audioPlayer.addEventListener("ended", nextSong);

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  }
});