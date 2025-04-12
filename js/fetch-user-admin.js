// Fetch users from the server and render them dynamically
async function fetchAndRenderUsers() {
    try {
      const response = await fetch('/api/admin/users');
      const users = await response.json();
  
      const userSection = document.getElementById('user-section');
  
      // Create a responsive layout using flexbox/grid with three columns on larger screens
      const userList = document.createElement('div');
      userList.className = 'user-list';
      userList.style.display = 'grid';
      userList.style.gridTemplateColumns = 'repeat(auto-fit, minmax(300px, 1fr))';
      userList.style.gap = '20px';
  
      users.forEach(user => {
        // Create the user card element
        const userCard = document.createElement('div');
        userCard.className = 'user-list-item';
        userCard.style.border = '1px solid #ddd';
        userCard.style.padding = '15px';
        userCard.style.borderRadius = '8px';
        userCard.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
  
        userCard.innerHTML = `
          <div>
            <img src="${user.profilePicture || './img/default-profile.jpg'}" alt="${user.name}" class="list-item-image" style="width: 50px; border-radius: 50%;">
          </div>
          <div class="list-item-content" style="margin-top: 10px;">
            <h4>${user.displayName}</h4>
            <p>${user.googleId}</p>
          </div>
        `;
  
        userList.appendChild(userCard);
      });
  
      userSection.appendChild(userList);
    } catch (error) {
      console.error('Error fetching user data:', error);
      const errorMsg = document.createElement('p');
      errorMsg.textContent = 'Failed to load user data.';
      userSection.appendChild(errorMsg);
    }
  }
  
  // Call the function when the page loads
  document.addEventListener('DOMContentLoaded', fetchAndRenderUsers);
  