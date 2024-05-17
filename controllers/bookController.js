import Book from "../model/Book.js";
import Author from "../model/Author.js";
import asyncHandler from "express-async-handler";
import { body, validationResult } from "express-validator";

// Site Home Page
const index = asyncHandler(async (req, res, next) => {
    // Get details of books, book instances, authors and genre counts (in parallel)
    const [
      numBooks,
      numAuthors,
    ] = await Promise.all([
      Book.countDocuments({}).exec(),
      Author.countDocuments({}).exec(),
    ]);

    res.render("index", {
      title: "Nathan's Local Library Home",
      book_count: numBooks,
      author_count: numAuthors,
    });
});

// Display list of all books.
const book_list = asyncHandler(async (req, res, next) => {
    const allBooks = await Book.find({}, "title author")
      .sort({ title: 1 })
      .populate("author")
      .exec();

    res.render("book_list", { title: "Book List", book_list: allBooks });
});

// Display detail page for a specific book.
const book_detail = asyncHandler(async (req, res, next) => {
    // Get details of books, book instances for specific book
    const book = await Book.findById(req.params.id).populate("author").exec();

    if (book === null) {
      // No results.
      const err = new Error("Book not found");
      err.status = 404;
      return next(err);
    }

    res.render("book_detail", {
      title: book.title,
      book: book,
    });
});

// Display book create form on GET.
const book_create_get = asyncHandler(async (req, res, next) => {
    // Get all authors, which we can use for adding to our book.
    const allAuthors = await Author.find().sort({ family_name: 1 }).exec();

    res.render("book_form", {
      title: "Create Book",
      authors: allAuthors,
    });
});

// Handle book create on POST.
const book_create_post = [
    // Validate and sanitize fields.
    body("title", "Title must not be empty.")
      .trim()
      .isLength({ min: 1 })
      .escape(),
    body("author", "Author must not be empty.")
      .trim()
      .isLength({ min: 1 })
      .escape(),
    body("summary", "Summary must not be empty.")
      .trim()
      .isLength({ min: 1 })
      .escape(),
    body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }).escape(),

    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
      // Extract the validation errors from a request.
      const errors = validationResult(req);

      // Create a Book object with escaped and trimmed data.
      const book = new Book({
        title: req.body.title,
        author: req.body.author,
        summary: req.body.summary,
        isbn: req.body.isbn,
      });

      if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/error messages.

        // Get all authors for form.
        const allAuthors = await Author.find().sort({ family_name: 1 }).exec();

        res.render("book_form", {
          title: "Create Book",
          authors: allAuthors,
          book: book,
          errors: errors.array(),
        });
      } else {
        // Data from form is valid. Save book.
        await book.save();
        res.redirect(book.url);
      }
    }),
];


// Display book delete form on GET.
const book_delete_get = asyncHandler(async (req, res, next) => {
      const book = await Book.findById(req.params.id).exec();
  
      if (book === null) {
        // No results.
        res.redirect("/catalog/books");
      }
  
      res.render("book_delete", {
        title: "Delete Book",
        book: book,
      });
});

// Handle Book delete on POST.
const book_delete_post = asyncHandler(async (req, res, next) => {
    await Book.findByIdAndDelete(req.body.bookid);
    res.redirect("/catalog/books");
});

// Display book update form on GET.
const book_update_get = asyncHandler(async (req, res, next) => {
    // Get book and authors for form.
    const [book, authors] = await Promise.all([
      Book.findById(req.params.id).populate("author").exec(),
      Author.find().sort({ family_name: 1 }).exec(),
    ]);

    if (book === null) {
      // No results.
      const err = new Error("Book not found");
      err.status = 404;
      return next(err);
    }

    res.render("book_form", {
      title: "Update Book",
      authors: authors,
      book: book,
    });
});

// Handle book update on POST.
const book_update_post = [
    // Validate and sanitize fields.
    body("title", "Title must not be empty.")
      .trim()
      .isLength({ min: 1 })
      .escape(),
    body("author", "Author must not be empty.")
      .trim()
      .isLength({ min: 1 })
      .escape(),
    body("summary", "Summary must not be empty.")
      .trim()
      .isLength({ min: 1 })
      .escape(),
    body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }).escape(),

    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
      // Extract the validation errors from a request.
      const errors = validationResult(req);

      // Create a Book object with escaped and trimmed data.
      const book = new Book({
        title: req.body.title,
        author: req.body.author,
        summary: req.body.summary,
        isbn: req.body.isbn,
        _id: req.params.id, //This is required, or a new ID will be assigned!
      });

      if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/error messages.

        // Get all authors for form.
        const authors = await Author.find().sort({ family_name: 1 }).exec();

        res.render("book_form", {
          title: "Update Book",
          authors: authors,
          book: book,
          errors: errors.array(),
        });
      } else {
        // Data from form is valid. Update the record.
        await Book.findByIdAndUpdate(req.params.id, book);
        res.redirect(book.url);
      }
    }),
];

const book_search = asyncHandler(async (req, res, next) => {
    let query = req.query.q;
    console.log("Search query in ctr: " + query)
    const books = await Book.find({ title: { $regex: query, $options: 'i' } }).populate("author").exec();
    if (query === "" || books === null) {
        res.redirect('/catalog/books');
    } else {
        res.render('book_list', { title: 'Book List', book_list: books });
    }
});

const book_search2 = asyncHandler(async (req, res, next) => {
    let query = req.query.q;
    const books = await Book.find({ title: { $regex: query, $options: 'i' } }).populate("author").exec();

	res.render('book_list_change', { book_list: books });
});


export {
  index,
  book_search,
  book_search2,
  book_list,
  book_detail,
  book_create_get,
  book_create_post,
  book_delete_get,
  book_delete_post,
  book_update_get,
  book_update_post
};