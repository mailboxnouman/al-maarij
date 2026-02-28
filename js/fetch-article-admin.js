$(document).ready(function () {
    // Variable to store the MixItUp instance
    let mixer = null;

    // Function to initialize MixItUp
    function initializeMixItUp() {
        if (mixer) {
            mixer.destroy(); // Clean up any existing instance to prevent duplicates
        }
        mixer = mixitup('#articles-container', {
            selectors: {
                target: '.mix'
            },
            animation: {
                duration: 300
            }
        });
    }

    // Fetch articles from the server
    $.get('/api/admin/articles', function (articles) {
        // console.log("Fetched articles:", articles); // Log articles for debugging

        // Function to render articles
        function renderArticles(articlesToRender) {
            $('#articles-container').empty(); // Clear previous articles
            articlesToRender.forEach(function (article) {
                // Log category class to verify it's correct
                $('#articles-container').append(`
                     <div class="col-lg-3 col-md-4 col-sm-6 mix ${article.category}">
                <div class="featured__item">
                    <div class="featured__item__pic set-bg" 
                         style="background-image: url('${article.coverImage}');">
                        <ul class="featured__item__pic__hover">
                            <li><a href="#" class="favorite-btn" data-article-id="${article._id}" data-sequence="${article.favoriteSequence || ''}">
                                 <i class="fa fa-heart" style="color: ${article.isFavorite ? 'red' : 'black'};">
                                 <span class="favorite-sequence">${article.favoriteSequence || ''}</span>
                                 </i>
                            </a></li>   
                            <li><a href="/editArticle.html?id=${article._id}" class="edit-btn"><i class="fa fa-edit"></i></a></li>
                            <li><a href="/delete/${article._id}"><i class="fa fa-trash"></i></a></li>
                        </ul>
                    </div>
                    <div class="featured__item__text">
                        <h5><a style="color:black !important;" href="/view-article.html?id=${article._id}">${article.title}</a></h5> <!-- Redirect title click to viewArticle -->
                        <p>${new Date(article.createdAt).toDateString()}</p>
                        <p style="font-family: nafees_web_naskhshipped; font-size:18px; direction: rtl; text-align: justify; ">${article.content.substring(0, 118)}...</p>
                    </div>
                </div>
            </div>
                `);
            });

          
        }

        // Render all articles initially
        renderArticles(articles);

        // Initialize MixItUp once after rendering
        initializeMixItUp();

        // Event listener for filter buttons
        $('.filter-button').on('click', function () {
            const filterValue = $(this).attr('data-filter');
            // console.log("Filter value selected:", filterValue);

            // Ensure MixItUp filters with the selected category
            if (mixer) {
                mixer.filter(filterValue).then(function (state) {
                    // console.log("Filtered items count:", state.totalShow);

                    // Additional check if no items are visible after filter
                    if (state.totalShow === 0) {
                        // console.log("No items displayed after selection. Verify elements have correct classes for:", filterValue);

                        // Re-render articles to ensure filtering works
                        renderArticles(articles);
                        initializeMixItUp(); // Reinitialize MixItUp
                        mixer.filter(filterValue);
                    }
                });
            }
        });

        // Filtering logic with controls for category highlighting
        $('.featured__controls ul li').click(function () {
            const filterValue = $(this).attr('data-filter');
            // console.log("Filter value selected for controls:", filterValue);

            $('.featured__controls ul li').removeClass('active'); // Remove active class from all
            $(this).addClass('active'); // Add active class to clicked item

            // Apply filter through MixItUp if initialized
            if (mixer) {
                mixer.filter(filterValue).then(function (state) {
                    // console.log("Filtered items after controls selection:", state.totalShow);
                    // console.log("Elements with class match after filter:", $(`#articles-container .mix${filterValue}`).length);

                    // Additional log if no items are displayed
                    if (state.totalShow === 0) {
                        // console.log("No items displayed after selection. Verify elements have correct classes for:", filterValue);

                        // Re-render articles to ensure filtering works
                        renderArticles(articles);
                        initializeMixItUp(); // Reinitialize MixItUp
                        mixer.filter(filterValue);
                    }
                });
            }
        });
    }).fail(function () {
        console.error("Error fetching articles.");
    });
    // Track favorite articles with a maximum limit
    let maxFavorites = 11;

    $(document).on('click', '.favorite-btn', function (e) {
        e.preventDefault();
        const $button = $(this);
        const articleId = $button.data('article-id');

        // Send AJAX request to toggle favorite status
        $.ajax({
            type: 'POST',
            url: '/api/admin/articles/favorite',
            data: JSON.stringify({ articleId: articleId }),
            contentType: 'application/json',
            success: function (response) {
                if (response.success) {
                    updateFavoriteUI(response.favorites);
                } else {
                    alert(response.message); // Display prompt if max limit reached
                }
            },
            error: function () {
                console.error("Error updating favorite status.");
            }
        });
    });

    function updateFavoriteUI(favorites) {
        $('.favorite-btn').each(function () {
            const $button = $(this);
            const articleId = $button.data('article-id');
            const favorite = favorites.find(fav => fav._id === articleId);

            if (favorite) {
                $button.find('i').css('color', 'red');
                $button.find('.favorite-sequence').text(favorite.sequence);
                $button.data('sequence', favorite.sequence);
            } else {
                $button.find('i').css('color', 'black');
                $button.find('.favorite-sequence').text('');
                $button.data('sequence', '');
            }
        });
    }
    async function toggleFavorite(articleId) {
        try {
            const response = await fetch('/api/admin/articles/favorite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ articleId }),
            });
            const data = await response.json();

            if (data.success) {
                // Reset all favorite sequence displays
                document.querySelectorAll('.favorite-sequence').forEach(seq => seq.style.display = 'none');

                // Update favorite sequence for each favorite
                data.favorites.forEach((fav, index) => {
                    const articleElement = document.querySelector(`.article[data-id="${fav._id}"]`);
                    if (articleElement) {
                        const sequenceEl = articleElement.querySelector('.favorite-sequence');
                        sequenceEl.textContent = index + 1;
                        sequenceEl.style.display = 'block';
                    }
                });
            }
        } catch (error) {
            console.error('Error updating favorite:', error);
        }
    }


    // Fetch and render favorite articles dynamically
    function loadFavoriteArticles() {
        $.get('/api/admin/favorite-articles', function (favoriteArticles) {
            const $favoriteList = $('.hero__categories ul');
            $favoriteList.empty(); // Clear the existing list

            favoriteArticles.forEach(article => {
                $favoriteList.append(`
                    <li>
                        <a href="/view-article.html?id=${article._id}">${article.title}</a>
                    </li>
                `);
            });
        }).fail(function () {
            console.error("Error fetching favorite articles.");
        });
    }

    // Load favorite articles on page load
    loadFavoriteArticles();

});