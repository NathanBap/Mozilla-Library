document.addEventListener('DOMContentLoaded', function() {
    var searchAuthorsElement = document.getElementById('search');
    if (searchAuthorsElement) {
        searchAuthorsElement.addEventListener('keyup', function() {
            console.log("input : " + this.value);
            var query = this.value;
            fetch('/catalog/books/search2?q=' + encodeURIComponent(query))
                .then(response => response.text())
                .then(data => {
                    document.getElementById('book-list').innerHTML = data;
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        });
    }
});

document.getElementById('searchAuthors').addEventListener('keyup', function() {
    console.log("input : " + this.value);
    var query = this.value;
    fetch('/catalog/authors/search2?q=' + encodeURIComponent(query))
        .then(response => response.text()) // use response.text() instead of response.json()
        .then(data => {
        document.getElementById('author_list').innerHTML = data; // insert the response HTML into the 'book-list' element
    })
        .catch(error => {
        console.error('Error:', error); // log any errors
    });
});