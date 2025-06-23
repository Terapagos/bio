// --- Fetch Kenmei Activity ---
async function fetchKenmeiActivity() {
  try {
    const response = await fetch('https://40d538ba-3c5f-4319-86e0-307c24da2c59-00-2ariedr1c85ip.worf.replit.dev/get-activity');

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const activities = await response.json();
    console.log("Fetched Activities:", activities);

    if (!activities || activities.length === 0) {
      document.getElementById('activity-feed').innerHTML = 'No recent activity available.';
      return;
    }

    const lastTenActivities = activities.slice(0, 8);
    const activityFeed = document.getElementById('activity-feed');
    activityFeed.innerHTML = '';

    lastTenActivities.forEach(activity => {
      const activityCard = document.createElement('div');
      activityCard.classList.add('activity-card');
      activityCard.innerHTML = `
        <img src="${activity.cover}" alt="Cover Image">
        <div class="activity-details">
          <h3>${activity.text}</h3>
          <p class="timestamp">Posted on: ${new Date(activity.timestamp).toLocaleDateString()}</p>
        </div>
      `;
      activityFeed.appendChild(activityCard);
    });

  } catch (error) {
    console.error('Error fetching activity:', error);
    document.getElementById('activity-feed').innerHTML = 'Failed to load activity. Please try again later.';
  }
}

document.addEventListener('DOMContentLoaded', fetchKenmeiActivity);

document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll(".card");
  const memberName = document.querySelector(".member-name");
  const leftArrow = document.querySelector(".nav-arrow.left");
  const rightArrow = document.querySelector(".nav-arrow.right");

  let currentIndex = 0;
  const names = [
    "MrClean", "55555555555", "6999", "Aldeanos", "Armarouge", "Boahancock",
    "Brambleghast", "Charcadet", "Dachsbun", "DRUGZ", "Gestella", "Lortelle",
    "Hancock", "Hyperdrive", "Radiru", "IronJugulis", "Eishia", "Looters",
    "Natalinoe", "Mcrib", "Mosts", "MrSatan", "N6M", "Pawmo",
    "Samer", "Shehulk", "Snippets", "Conkdor", "Stockholder", "Sylphiette",
    "Tetona", "Tristeza", "Chifune", "Unfuse", "Warring", "Westbrook",
    "Siasha", "Yammy", "Yjk", "Zaybi"
  ];

  function updateCarousel(newIndex) {
    currentIndex = (newIndex + cards.length) % cards.length;

    cards.forEach((card, i) => {
      card.classList.remove("center", "left-1", "left-2", "right-1", "right-2", "hidden");
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

  leftArrow.addEventListener("click", () => updateCarousel(currentIndex - 1));
  rightArrow.addEventListener("click", () => updateCarousel(currentIndex + 1));

  updateCarousel(0);
});