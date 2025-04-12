document.addEventListener("DOMContentLoaded", function () {
    const searchForm = document.getElementById('searchForm');
    let currentPage = 1;

    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const query = document.getElementById('searchQuery').value.trim();
        if (query) {
            window.location.href = `search.html?query=${encodeURIComponent(query)}&page=1`;
        }
    });

    // Function to fetch and render search results
    function loadSearchResults(query, page) {
        fetch(`/api/search?query=${encodeURIComponent(query)}&page=${page}`)
            .then(response => response.json())
            .then(data => {
                const articlesContainer = document.getElementById('searchArticles');
                const resultInfo = document.getElementById('searchResultInfo');
    
                if (!articlesContainer || !resultInfo) return;
    
                articlesContainer.innerHTML = '';
    
                if (data.articles.length > 0) {
                   // Check if only one article was found
                    if (data.totalArticles === 1) {
                        resultInfo.textContent = `آپ کی تلاش کے مطابق 1 مضمون ملا ہے`;
                    } else {
                        // If more than one article is found
                        resultInfo.textContent = `آپ کی تلاش کے مطابق ${data.totalArticles} مضامین ملے ہیں`;
                    }
                    data.articles.forEach(article => {
                        const articleElement = `
                            <div class="col-lg-6 col-md-6 col-sm-6">
                                <div class="blog__item animate__animated animate__bounceInUp">
                                    <div class="article-image blog__item__pic">
                                        <a href="view-article.html?id=${article._id}">
                                            <img src="uploads/${article.coverImage}" data-article-id="${article._id}" alt="${article.title}">
                                        </a>
                                    </div>
                                    <div class="blog__item__text">
                                        <ul>
                                            <li><i class="fa fa-calendar-o"></i> ${new Date(article.createdAt).toDateString()}</li>
                                        </ul>
                                        <h5 style="text-align:right;"><a href="view-article.html?id=${article._id}">${article.title}</a></h5>
                                        <p style="font-family: nafees_web_naskhshipped; direction: rtl; text-align: justify; font-size:18px;">${article.content ? article.content.substring(0, 160) : ''}...</p>
                                        <a href="view-article.html?id=${article._id}" class="btn btn-success" style="background-color: #7FAD39; border:none;">مزید پڑھیں</a>
                                    </div>
                                </div>
                            </div>
                        `;
                        articlesContainer.innerHTML += articleElement;
                    });
    
                    updatePagination(data.totalPages, data.currentPage, query);
                } else {
                    // Display a message if no articles were found
                    resultInfo.textContent = 'آپ کی تلاش کے مطابق کوئی مضمون نہیں ملا';
                }
            })
            .catch(err => console.error("Error fetching search results: ", err));
    }

    // Function to fetch and render recent articles
    function loadRecentArticles() {
        fetch(`/api/recent-articles`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const recentArticlesContainer = document.querySelector('.blog__sidebar__recent');
                if (!recentArticlesContainer) {
                    console.error("Element .blog__sidebar__recent not found");
                    return;
                }

                recentArticlesContainer.innerHTML = ''; // Clear previous content

                data.articles.forEach(article => {
                    const articleElement = `
                        <a href="view-article.html?id=${article._id}" class="blog__sidebar__recent__item" style="display: flex; align-items: center; margin-bottom: 15px;">
                            <div class="blog__sidebar__recent__item__pic" style="flex: 0 0 80px; height: 80px; overflow: hidden; margin-right: 10px;">
                                <img style="object-fit:cover; height:100%;" src="uploads/${article.coverImage}" alt="${article.title}" style="width: 100%; height: auto;" onerror="this.src='default.jpg';">
                            </div>
                            <div class="blog__sidebar__recent__item__text">
                                <h6 style="margin: 0; font-size: 14px;">${article.title}</h6>
                                <span style="font-size: 12px; color: #888;">${new Date(article.createdAt).toDateString()}</span>
                            </div>
                        </a>
                    `;
                    recentArticlesContainer.innerHTML += articleElement; // Append new article element
                });
            })
            .catch(err => console.error("Error fetching recent articles: ", err));
    }

    // Function to update pagination buttons
    function updatePagination(totalPages, currentPage, query) {
        const pagination = document.getElementById('pagination');
        if (!pagination) return;
        
        pagination.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('a');
            pageButton.href = `#`;
            pageButton.textContent = i;
            pageButton.classList.add("pagination-btn");
            pageButton.dataset.page = i;

            if (i === currentPage) {
                pageButton.style.backgroundColor = "#7FAD39";
                pageButton.style.color = "white";
                pageButton.style.borderColor = "#7FAD39";
            }

            pageButton.addEventListener("click", function (event) {
                event.preventDefault();
                loadSearchResults(query, i);
                document.getElementById('scrollUp').scrollIntoView({ behavior: 'smooth', block: 'start' });
            });

            pagination.appendChild(pageButton);
        }
    }

    // Check for query in URL and load results
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('query');
    const page = parseInt(urlParams.get('page')) || 1;

    if (query) {
        loadSearchResults(query, page);
    }
    loadRecentArticles(); // Load recent articles
});
