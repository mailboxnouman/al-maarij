document.addEventListener('DOMContentLoaded', async function () {
    try {
      // Fetch the messages when the admin page is loaded
      const response = await fetch('/api/contact/messages', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      const result = await response.json();
  
      if (response.ok) {
        const messages = result.messages;
        const tableBody = document.querySelector('#messagesTable tbody');
        tableBody.innerHTML = ''; // Clear any existing rows
  
        // Loop through each message and append it to the table
        messages.forEach((message) => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td class="align-middle">${message.name}</td>
            <td class="align-middle">${message.email}</td>
            <td class="align-middle">${message.message}</td>
          `;
          tableBody.appendChild(row);
        });
      } else {
        alert('Error fetching messages: ' + result.error);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      alert('An unexpected error occurred while fetching messages.');
    }
  });
  