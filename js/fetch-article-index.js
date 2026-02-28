 // Function to fetch and render recent articles
 document.addEventListener("DOMContentLoaded", function () {
    function loadRecentArticles() {
    fetch(`/api/recent-articles/index`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const recentArticlesContainer = document.querySelector('#recent-articles-container');
            if (!recentArticlesContainer) {
                console.error("Element #recent-articles-container not found");
                return;
            }
            
            recentArticlesContainer.innerHTML = ''; // Clear previous content

            data.articles.forEach(article => {
                const articleElement = `
                    <div class="col-lg-4 col-md-4 col-sm-6">
                        <div class="blog__item">
                            <div class="article-image blog__item__pic">
                                    <a href="view-article.html?id=${article._id}">
                                     <img src="${article.coverImage}" data-article-id="${article._id}" alt="${article.title}">
                                    </a>
                            </div>
                            
                            <div class="blog__item__text">
                                <ul>
                                    <li><i class="fa fa-calendar-o"></i> ${new Date(article.createdAt).toLocaleDateString()}</li>
                                </ul>
                                <h5 style="text-align:right;"><a href="view-article.html?id=${article._id}">${article.title}</a></h5>
                                <p style="font-family: nafees_web_naskhshipped; font-size:18px; direction: rtl; text-align: justify;">${article.content.substring(0, 110)}...</p> <!-- Preview content -->
                            </div>
                        </div>
                    </div>
                `;
                recentArticlesContainer.innerHTML += articleElement; // Append new article element
            });
        })
        .catch(err => console.error("Error fetching recent articles: ", err));
}

loadRecentArticles(); // Call the function to load recent articles
});