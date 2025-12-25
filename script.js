// --- Fetch Kenmei Activity ---
async function fetchKenmeiActivity() {
  const activityFeed = document.getElementById('activity-feed');
  try {
    const response = await fetch('https://bio-backend.fly.dev/get-activity');
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

// --- Mini Music Player Logic ---
function setupMusicPlayer() {
  const playPauseBtn = document.getElementById("playPauseBtn");
  const playPauseIcon = document.getElementById("playPauseIcon");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const shuffleBtn = document.getElementById("shuffleBtn");
  const progressBar = document.getElementById("progressBar");
  const currentTimeDisplay = document.getElementById("currentTime");
  const totalTimeDisplay = document.getElementById("totalTime");
  const songTitleDisplay = document.getElementById("songTitle");

  const songs = [
    { title: "Heroic Desire", url: "https://github.com/q7XvR9f4MZnA2pLWtk3bEoJqVHgYcK5dTRX8LUz/music/raw/main/heroic%20desire.mp3" },
    { title: "Interia", url: "https://github.com/q7XvR9f4MZnA2pLWtk3bEoJqVHgYcK5dTRX8LUz/music/raw/main/Interia.mp3" },
    { title: "Eternity", url: "https://github.com/q7XvR9f4MZnA2pLWtk3bEoJqVHgYcK5dTRX8LUz/music/raw/main/Eternity.mp3" },
    { title: "The Line", url: "https://github.com/q7XvR9f4MZnA2pLWtk3bEoJqVHgYcK5dTRX8LUz/music/raw/main/The%20Line.mp3" }
  ];

  const audioElements = songs.map(song => {
    const audio = new Audio(song.url);
    audio.preload = "auto";
    return audio;
  });

  let currentSongIndex = 0;
  let isPlaying = false;

  function updateSongDisplay() {
    songTitleDisplay.textContent = songs[currentSongIndex].title;
  }

  function updatePlayPauseIcon() {
    if (isPlaying) {
      playPauseIcon.classList.remove("fa-play");
      playPauseIcon.classList.add("fa-pause");
    } else {
      playPauseIcon.classList.remove("fa-pause");
      playPauseIcon.classList.add("fa-play");
    }
  }

  function playCurrentSong() {
    audioElements[currentSongIndex].play().catch(err => console.error("Play failed:", err));
    isPlaying = true;
    updatePlayPauseIcon();
  }

  function pauseCurrentSong() {
    audioElements[currentSongIndex].pause();
    isPlaying = false;
    updatePlayPauseIcon();
  }

  function togglePlayPause() {
    if (isPlaying) {
      pauseCurrentSong();
    } else {
      playCurrentSong();
    }
  }

  function changeSong(newIndex) {
    pauseCurrentSong();
    audioElements[currentSongIndex].currentTime = 0;
    currentSongIndex = (newIndex + songs.length) % songs.length;
    updateSongDisplay();
    const currentAudio = audioElements[currentSongIndex];
    progressBar.max = currentAudio.duration;
    totalTimeDisplay.textContent = formatTime(currentAudio.duration);
    if (isPlaying) playCurrentSong();
  }

  playPauseBtn.addEventListener("click", togglePlayPause);
  nextBtn.addEventListener("click", () => changeSong(currentSongIndex + 1));
  prevBtn.addEventListener("click", () => changeSong(currentSongIndex - 1));
  shuffleBtn.addEventListener("click", () => {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * songs.length);
    } while (randomIndex === currentSongIndex);
    changeSong(randomIndex);
  });

  audioElements.forEach((audio, index) => {
    audio.addEventListener("loadedmetadata", () => {
      if (index === currentSongIndex) {
        progressBar.max = audio.duration;
        totalTimeDisplay.textContent = formatTime(audio.duration);
      }
    });
    audio.addEventListener("timeupdate", () => {
      if (index === currentSongIndex) {
        progressBar.value = audio.currentTime;
        currentTimeDisplay.textContent = formatTime(audio.currentTime);
      }
    });
    audio.addEventListener("ended", () => {
      changeSong(currentSongIndex + 1);
    });
  });

  progressBar.addEventListener("input", () => {
    audioElements[currentSongIndex].currentTime = progressBar.value;
  });

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  }

  updateSongDisplay();
  updatePlayPauseIcon();
}
async function fetchLanyardStatus() {
  try {
    const res = await fetch('https://api.lanyard.rest/v1/users/313316940238028800');
    const data = await res.json();

    const statusDiv = document.getElementById('activity-status');
    
    if (data.success && data.data) {
      if (data.data.activities.length > 0) {
        // Get the first activity
        const activity = data.data.activities[0];
        const activityName = activity.name;

        statusDiv.textContent = `Playing ${activityName}`;
      } else {
        statusDiv.textContent = 'Offline';
      }
    } else {
      statusDiv.textContent = 'Offline';
    }
  } catch (err) {
    console.error(err);
    document.getElementById('activity-status').textContent = 'Offline';
  }
}

// Call it once on page load
fetchLanyardStatus();

// --- Initialize everything ---
document.addEventListener('DOMContentLoaded', () => {
  fetchKenmeiActivity();
  setupMusicPlayer();
});

