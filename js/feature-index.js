$(document).ready(function () {
    let allArticles = [];
    const articlesPerPage = 8;
    let currentPage = 1;

    // Initial fetch for all articles
    fetchArticles();

    // Function to fetch articles, with optional category filtering
    function fetchArticles(category = 'all') {
        $.get(`/api/public/articles/category?category=${category}`, function (articles) {
            allArticles = articles;
            currentPage = 1; // Reset to first page on new fetch
            setupPagination(allArticles.length);
            renderArticles();
        }).fail(function () {
            console.error("Error fetching articles.");
        });
    }

    // Render articles with pagination
    function renderArticles() {
        $('#articles-container').empty();
        const start = (currentPage - 1) * articlesPerPage;
        const paginatedArticles = allArticles.slice(start, start + articlesPerPage);
    
        paginatedArticles.forEach(function (article) {
            if (article.category) {
                $('#articles-container').append(`
                    <div class="col-lg-3 col-md-4 col-sm-6 mix ${article.category}">
                        <div class="featured__item animate__animated animate__zoomInDown">
                            <div class="featured__item__pic set-bg" style="background-image: url('${article.coverImage}');">
                                <ul class="featured__item__pic__hover">
                                    <li><a href="/view-article.html?id=${article._id}">
                                        <i class="fa fa-book"></i>
                                        <span style="font-size:15px; color:black; background-color:white; border-radius:25px; position:absolute; top:-60px; right:82px; width:100px;">مزید پڑھیں</span>
                                    </a></li>
                                </ul>
                            </div>
                            <div class="featured__item__text">
                                <h5><a style="color:black !important;" href="/view-article.html?id=${article._id}">${article.title}</a></h5>
                                <p>${new Date(article.createdAt).toLocaleDateString()}</p>
                                <p style="font-family: nafees_web_naskhshipped; font-size:18px; direction: rtl; text-align: justify;">${article.content.substring(0, 118)}...</p>
                            </div>
                        </div>
                    </div>
                `);
            }
        });
    
        // Reapply animation after elements are rendered
        $('.featured__item').removeClass('animate__animated animate__zoomInDown');
        setTimeout(() => {
            $('.featured__item').addClass('animate__animated animate__zoomInDown');
        }, 0);
    }
    

    // Setup pagination
    function setupPagination(totalArticles) {
        $('#pagination-container').empty();
        const totalPages = Math.ceil(totalArticles / articlesPerPage);

        for (let i = 1; i <= totalPages; i++) {
            $('#pagination-container').append(`
                 <div id="pagination" class="product__pagination ">
                       <a href="#scrollUp" style="cursor:pointer; display:inline-block; margin-right:10px;" class="pagination-btn" data-page="${i}">${i}</a>
                     </div>
            `);
        }

        $('.pagination-btn').on('click', function () {
            currentPage = $(this).data('page');
            renderArticles();
        });
    }

    // Filter articles by category on radio selection
    $('input[name="filter"]').on('change', function () {
        const selectedCategory = this.id;
        fetchArticles(selectedCategory); // Fetch articles for the selected category
    });
});

// $(document).ready(function () {
//     let mixer = null;
//     let allArticles = [];
//     const articlesPerPage = 8;
//     let currentPage = 1;

//     // Initialize MixItUp
//     function initializeMixItUp() {
//         if (mixer) {
//             mixer.destroy();
//         }
//         mixer = mixitup('#articles-container', {
//             selectors: {
//                 target: '.mix'
//             },
//             animation: {
//                 duration: 300
//             }
//         });
//     }

//     // Fetch articles from the server
//     $.get('/api/public/articles', function (articles) {
//         allArticles = articles;
//         renderArticles(); // Render initially fetched articles
//         setupPagination(allArticles.length); // Setup pagination after articles are fetched
//     }).fail(function () {
//         console.error("Error fetching articles.");
//     });
   

//     // Render articles with pagination
//     function renderArticles() {
//         $('#articles-container').empty();
//         const start = (currentPage - 1) * articlesPerPage;
//         const paginatedArticles = allArticles.slice(start, start + articlesPerPage);

//         paginatedArticles.forEach(function (article) {
//             if (article.category) {
//                 $('#articles-container').append(`
//                     <div class="col-lg-3 col-md-4 col-sm-6 mix ${article.category}">
//                         <div class="featured__item">
//                             <div class="featured__item__pic set-bg" style="background-image: url('/uploads/${article.coverImage}');">
//                                 <ul class="featured__item__pic__hover">
//                                     <li><a href="/view-article.html?id=${article._id}"><i style="position:relative;" class="fa fa-book"></i><span style="font-size:15px; color:black; background-color:white; border-radius:25px; position:absolute; top:-60px; right:82px; width:100px;">مزید پڑھیں</span></a></li>
//                                 </ul>
//                             </div>
//                             <div class="featured__item__text">
//                         <h5><a style="color:black !important;" href="/view-article.html?id=${article._id}">${article.title}</a></h5> <!-- Redirect title click to viewArticle -->
//                                 <p>${new Date(article.createdAt).toDateString()}</p>
//                                 <p style="font-family: nafees_web_naskhshipped; font-size:18px; direction: rtl; text-align: justify;">${article.content.substring(0, 118)}...</p>
//                             </div>
//                         </div>
//                     </div>
//                 `);
//             }
//         });
//         initializeMixItUp();
//     }
    
//     // Pagination setup
//     function setupPagination(totalArticles) {
//         $('#pagination-container').empty();
//         const totalPages = Math.ceil(totalArticles / articlesPerPage);

//         for (let i = 1; i <= totalPages; i++) {
//             $('#pagination-container').append(`
//                 <div id="pagination" class="product__pagination ">
//                        <a href="#scrollUp" style="cursor:pointer; display:inline-block; margin-right:10px;" class="pagination-btn" data-page="${i}">${i}</a>
//                     </div>
//             `);
//         }

//         $('.pagination-btn').on('click', function () {
//             currentPage = $(this).data('page');
//             renderArticles();
//         });
//     }

//     // Filter buttons functionality
//     $('.filter-button').on('click', function () {
//         const filterValue = $(this).attr('data-filter');
//         if (mixer) {
//             mixer.filter(filterValue).then(function (state) {
//                 if (state.totalShow === 0) {
//                     renderArticles(allArticles);
//                     initializeMixItUp();
//                     mixer.filter(filterValue);
//                 }
//             });
//         }
//     });

//     // Filter controls with category highlighting
//     $('.featured__controls ul li').click(function () {
//         const filterValue = $(this).attr('data-filter');
//         $('.featured__controls ul li').removeClass('active');
//         $(this).addClass('active');
//         if (mixer) {
//             mixer.filter(filterValue).then(function (state) {
//                 if (state.totalShow === 0) {
//                     renderArticles(allArticles);
//                     initializeMixItUp();
//                     mixer.filter(filterValue);
//                 }
//             });
//         }
//     });
// });
