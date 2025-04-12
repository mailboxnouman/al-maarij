var googleTranslateElementInstance;

        function googleTranslateElementInit() {
            googleTranslateElementInstance = new google.translate.TranslateElement({
                pageLanguage: 'ur', // Default language is Urdu
                includedLanguages: 'en,ar', // Include English, Arabic, and Urdu
                layout: google.translate.TranslateElement.InlineLayout.SIMPLE
            }, 'google_translate_element');

            // Change the "Select Language" text to "Change Language"
            setTimeout(function () {
                var langButton = document.querySelector('#google_translate_element .goog-te-gadget-simple');
                if (langButton) {
                    langButton.querySelector('span').textContent = 'Language'; // Change the text
                }
            }, 10); // Wait for the widget to load
        }

        // Load Google Translate widget
        function loadGoogleTranslateWidget() {
            var script = document.createElement('script');
            script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
            document.body.appendChild(script);
        }

        // Initialize the widget after the window is loaded
        window.onload = function () {
            loadGoogleTranslateWidget();
        };