// Fetch recent activity from the backend server (Replit)
async function fetchKenmeiActivity() {
  try {
    const response = await fetch('https://40d538ba-3c5f-4319-86e0-307c24da2c59-00-2ariedr1c85ip.worf.replit.dev/get-activity');
    
    // Check if the response is valid
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const activities = await response.json();
    console.log("Fetched Activities:", activities); // Debugging log to check the response

    // Check if there are any activities
    if (!activities || activities.length === 0) {
      console.warn('No recent activities found in the response.');
      document.getElementById('activity-feed').innerHTML = 'No recent activity available.';
      return;
    }

    // Limit to the last 10 activities (most recent)
    const lastTenActivities = activities.slice(0, 10);

    // Display the activity items
    const activityFeed = document.getElementById('activity-feed');
    activityFeed.innerHTML = ''; // Clear any loading text
    
    lastTenActivities.forEach(activity => {
      const activityCard = document.createElement('div');
      activityCard.classList.add('activity-card');
      
      // Adding content to each activity card without "View Series" link
      activityCard.innerHTML = `
        <img src="${activity.cover}" alt="Cover Image">
        <div class="activity-details">
          <h3>${activity.text}</h3>
          <p class="timestamp">Posted on: ${new Date(activity.timestamp).toLocaleDateString()}</p>
          <!-- Removed the View Series link -->
        </div>
      `;
      activityFeed.appendChild(activityCard);
    });
    
  } catch (error) {
    console.error('Error fetching activity:', error);
    document.getElementById('activity-feed').innerHTML = 'Failed to load activity. Please try again later.';
  }
}

// Fetch and display the activity when the page loads
document.addEventListener('DOMContentLoaded', fetchKenmeiActivity);
