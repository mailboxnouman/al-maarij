document.addEventListener("DOMContentLoaded", async function () {
    await checkAuthStatus();
    await checkAuthorization();
});

async function checkAuthStatus() {
    try {
        const response = await fetch('/isAuthenticated');
        const data = await response.json();

        // Update login/logout button
        document.querySelectorAll('.authButton').forEach(button => {
            if (data.isAuthenticated) {
                button.innerHTML = `<i class="fa fa-user"></i> لاگ آوٹ - ${data.displayName}`;
                button.onclick = async () => {
                    await fetch('/logout', { method: 'GET' });
                    window.location.reload();
                };
            } else {
                button.innerHTML = '<i class="fa fa-user"></i> لاگ ان';
                button.onclick = () => window.location.href = '/auth/google';
            }
        });

    } catch (error) {
        console.error('Error checking auth status:', error);
    }
} 
async function checkAuthorization() {
    try {
        const response = await fetch('/isAuthorized');
        const data = await response.json();


        // Show or hide all elements with the class 'admin-panel'
        const adminPanels = document.querySelectorAll('.admin-panel'); // Use class name

        adminPanels.forEach(adminPanel => {
            if (data.isAuthorized) {
                adminPanel.style.display = "inline-block"; // Show admin panel
            } else {
                adminPanel.style.display = "none"; // Hide admin panel
            }
        });
    } catch (error) {
        console.error('Error checking authorization status:', error);
    }
}

// Fetch and render favorite articles dynamically
function loadFavoriteArticles() {
    $.get('/api/admin/favorite-articles', function(favoriteArticles) {
        const $favoriteList = $('.hero__categories ul');
        $favoriteList.empty(); // Clear the existing list
        
        favoriteArticles.forEach(article => {
            $favoriteList.append(`
                <li>
                    <a style=" text-align:right; letter-spacing:0.5px;  margin-right: 10px;" href="/view-article.html?id=${article._id}">${article.title}</a>
                </li>
            `);
        });
    }).fail(function() {
        console.error("Error fetching favorite articles.");
    });
}

function updateDate() {
    // Define Urdu month names
    const urduMonths = [
        "جنوری", "فروری", "مارچ", "اپریل", "مئی", "جون",
        "جولائی", "اگست", "ستمبر", "اکتوبر", "نومبر", "دسمبر"
    ];

    // Get the current date
    const currentDate = moment();

    // Get the day, month (0-based index), and year
    const day = currentDate.date(); // Get day of the month
    const month = currentDate.month(); // Get month (0-11)
    const year = currentDate.year(); // Get year

    // Format the date in "DD Month YYYY" format
    const formattedDate = `${day} ${urduMonths[month]} ${year}`;

    // Select all elements with the class 'header__cart__price'
    const dateElements = document.querySelectorAll('.header__cart__price span');

    // Update the text content of each element
    dateElements.forEach((element) => {
        element.textContent = formattedDate;
    });

}

searchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    console.log("Search form submitted");
    const query = document.getElementById('searchQuery').value.trim();
    if (query) {
        console.log(`Redirecting to: search.html?query=${encodeURIComponent(query)}&page=1`);
        window.location.href = `search.html?query=${encodeURIComponent(query)}&page=1`;
    }
});

// Call the function to set the initial date
updateDate();
// Load favorite articles on page load
loadFavoriteArticles();
