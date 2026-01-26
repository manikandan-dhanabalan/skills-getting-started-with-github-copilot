document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Generate participants list
        const participantsList = details.participants.length
          ? `<ul>${details.participants.map(participant => `<li>${participant}</li>`).join("")}</ul>`
          : "<p>No participants yet.</p>";

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants">
            <strong>Participants:</strong>
            ${participantsList}
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);

        // Add delete icon next to each participant
        const participantsContainer = activityCard.querySelector(".participants ul");
        if (participantsContainer) {
          participantsContainer.querySelectorAll("li").forEach((li) => {
            const deleteIcon = document.createElement("span");
            deleteIcon.textContent = "🗑️";
            deleteIcon.style.cursor = "pointer";
            deleteIcon.style.marginLeft = "10px";

            deleteIcon.addEventListener("click", async () => {
              const email = li.textContent.replace("🗑️", "").trim();
              try {
                const unregisterResponse = await fetch(`/activities/${name}/unregister`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email }),
                });

                if (unregisterResponse.ok) {
                  li.remove();
                  alert(`${email} has been unregistered from ${name}`);
                } else {
                  alert(`Failed to unregister ${email}.`);
                }
              } catch (error) {
                console.error("Error unregistering participant:", error);
                alert("An error occurred while trying to unregister the participant.");
              }
            });

            li.appendChild(deleteIcon);
          });
        }
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activityName = document.getElementById("activity").value;

    try {
      const response = await fetch(`/activities/${activityName}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const activityCard = Array.from(activitiesList.children).find(
          (card) => card.querySelector("h4").textContent === activityName
        );

        if (activityCard) {
          const participantsContainer = activityCard.querySelector(".participants ul");
          if (participantsContainer) {
            const newParticipant = document.createElement("li");
            newParticipant.textContent = email;

            const deleteIcon = document.createElement("span");
            deleteIcon.textContent = "🗑️";
            deleteIcon.style.cursor = "pointer";
            deleteIcon.style.marginLeft = "10px";

            deleteIcon.addEventListener("click", async () => {
              try {
                const unregisterResponse = await fetch(`/activities/${activityName}/unregister`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email }),
                });

                if (unregisterResponse.ok) {
                  newParticipant.remove();
                  alert(`${email} has been unregistered from ${activityName}`);
                } else {
                  alert(`Failed to unregister ${email}.`);
                }
              } catch (error) {
                console.error("Error unregistering participant:", error);
                alert("An error occurred while trying to unregister the participant.");
              }
            });

            newParticipant.appendChild(deleteIcon);
            participantsContainer.appendChild(newParticipant);
          }
        }

        alert(`Successfully signed up ${email} for ${activityName}`);
        signupForm.reset();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.detail}`);
      }
    } catch (error) {
      console.error("Error signing up participant:", error);
      alert("An error occurred while trying to sign up the participant.");
    }
  });

  // Initialize app
  fetchActivities();
});
