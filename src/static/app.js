document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");
  const template = document.getElementById("activity-template");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message and previous items
      activitiesList.innerHTML = "";

      // Reset select options (keep placeholder)
      Array.from(activitySelect.options)
        .slice(1)
        .forEach((opt) => opt.remove());

      // Populate activities list using template
      Object.entries(activities).forEach(([name, details]) => {
        const clone = template.content.cloneNode(true);
        const card = clone.querySelector(".activity-card");
        clone.querySelector(".activity-name").textContent = name;
        clone.querySelector(".activity-description").textContent = details.description;
        clone.querySelector(".activity-schedule").innerHTML = `<strong>Schedule:</strong> ${details.schedule}`;
        clone.querySelector(".activity-spots-count").textContent = details.max_participants;

        const spotsLeft = details.max_participants - details.participants.length;
        const availabilityP = document.createElement("p");
        availabilityP.innerHTML = `<strong>Availability:</strong> ${spotsLeft} spots left`;
        card.appendChild(availabilityP);

        const participantsDiv = clone.querySelector(".participants");
        const participantsList = clone.querySelector(".participants-list");
        participantsList.innerHTML = "";

        if (details.participants && details.participants.length > 0) {
          participantsDiv.classList.remove("empty");
          details.participants.forEach((email) => {
            const li = document.createElement("li");
            li.textContent = email;
            participantsList.appendChild(li);
          });
        } else {
          participantsDiv.classList.add("empty");
          const li = document.createElement("li");
          li.textContent = "Keine Teilnehmer bisher.";
          li.className = "placeholder";
          participantsList.appendChild(li);
        }

        activitiesList.appendChild(clone);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
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
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "message success";
        signupForm.reset();
        // Refresh activities to show updated participants
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "message error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "message error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
