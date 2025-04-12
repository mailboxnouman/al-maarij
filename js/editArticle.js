$(document).ready(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id'); // Get the article ID from the URL parameters

    // Fetch article data based on the ID
    if (articleId) {
        $.get(`/api/admin/articles/${articleId}`, function(article) {
            // Populate the form fields with the article data
            $('#article-title').val(article.title);
            $('#article-hashtags').val(article.hashtags.join(', ')); // Assuming hashtags are stored as an array
            $('#article-category').val(article.category);
            $('#article-content').val(article.content);
            $('#article-author').val(article.author);
        }).fail(function() {
            console.error("Error fetching article data.");
        });
    }

    // Handle form submission for editing the article
    $('#edit-article-form').submit(function(event) {
        event.preventDefault(); // Prevent default form submission

        const formData = new FormData(this); // Gather form data, including file uploads if any
    
        $.ajax({
            type: 'POST',
            url: `/edit-article/${articleId}`, // Include the article ID in the URL
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                alert('آرٹیکل اپڈیٹ ہو گیا ہے'); // Alert on success
                window.location.href = '/admin'; // Redirect to admin page
            },
            error: function(xhr, status, error) {
                alert('Error updating article'); // Alert on error
                console.error('آرٹیکل اپڈیٹ نہیں ہو سکا:', error);
            }
        });
    });
    
});
