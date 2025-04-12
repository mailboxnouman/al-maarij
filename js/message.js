document.querySelector('#contactForm').addEventListener('submit', async function (e) {
    e.preventDefault();
  
    const name = document.querySelector('#nameInput').value.trim();
    const email = document.querySelector('#emailInput').value.trim();
    const message = document.querySelector('#messageInput').value.trim();
  
    // Basic validation for email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('براہ کرم درست ای میل درج کریں۔');
      return; // Prevent form submission
    }
  
    // Check character limits (optional but ensures compliance)
    if (name.length > 50 || email.length > 100 || message.length > 500) {
      alert('براہ کرم یقینی بنائیں کہ آپ کی معلومات مقررہ حد میں ہیں۔');
      return; // Prevent form submission
    }
  
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, message }),
      });
  
      const result = await response.json();
  
      if (response.status === 401) {
        // Handle unauthorized status specifically
        alert('براہ کرم پیغام بھیجنے کے لیے لاگ ان کریں۔');
      } else if (response.ok) {
        alert(result.message);
        // Optionally, clear the form after successful submission
        document.querySelector('#contactForm').reset();
      } else {
        alert('Error: ' + (result.error || 'An unexpected error occurred.'));
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An unexpected error occurred.');
    }
  });
  