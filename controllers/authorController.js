import Author from "../model/Author.js";
import Book from "../model/Book.js";
import asyncHandler from "express-async-handler";
import { body, validationResult } from "express-validator";

// Display list of all Authors.
const author_list = asyncHandler(async (req, res, next) => {
    const allAuthors = await Author.find().sort({ family_name: 1 }).exec();
    res.render("author_list", {
      title: "Author List",
      author_list: allAuthors,
    });
});

// Display detail page for a specific Author.
const author_detail = asyncHandler(async (req, res, next) => {
    // Get details of author and all their books (in parallel)
    const [author, allBooksByAuthor] = await Promise.all([
      Author.findById(req.params.id).exec(),
      Book.find({ author: req.params.id }, "title summary").exec(),
    ]);

    if (author === null) {
      // No results.
      const err = new Error("Author not found");
      err.status = 404;
      return next(err);
    }

    res.render("author_detail", {
      title: "Author Detail",
      author: author,
      author_books: allBooksByAuthor,
    });
});

// Display Author create form on GET.
const author_create_get = asyncHandler(async (req, res, next) => {
    res.render("author_form", { title: "Create Author" });
});

// Handle Author create on POST.
const author_create_post = [
  // Validate and sanitize fields.
  body("first_name")
    .trim()
    .isLength({ min: 1, max: Author.schema.paths.first_name.options.maxLength})
    .escape()
    .withMessage(`First name must be specified or is too long (max ${Author.schema.paths.first_name.options.maxLength}).`)
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters."),
  body("family_name")
    .trim()
    .isLength({ min: 1, max: Author.schema.paths.family_name.options.maxLength})
    .escape()
    .withMessage(`Family name must be specified or is too long (max ${Author.schema.paths.family_name.options.maxLength}).`)
    .isAlphanumeric()
    .withMessage("Family name has non-alphanumeric characters."),
  body("date_of_birth", "Invalid date of birth")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),
  body("date_of_death", "Invalid date of death")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create Author object with escaped and trimmed data
    const author = new Author({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render("author_form", {
        title: "Create Author",
        author: author,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.
      try {
        // Save author.
        await author.save();
        // Redirect to new author record.
        res.redirect(author.url);
      } catch (err) {
        // Handle the error. This could be due to a validation error or other issues.
        // Render a custom error page or handle the error as needed.
        res.render('error', { message: 'There was an error saving the author.', error: err });
      }
    }
  }),
];


// Display Author delete form on GET.
const author_delete_get = asyncHandler(async (req, res, next) => {
    // Get details of author and all their books (in parallel)
    const [author, allBooksByAuthor] = await Promise.all([
      Author.findById(req.params.id).exec(),
      Book.find({ author: req.params.id }, "title summary").exec(),
    ]);

    if (author === null) {
      // No results.
      res.redirect("/catalog/authors");
    }

    res.render("author_delete", {
      title: "Delete Author",
      author: author,
      author_books: allBooksByAuthor,
    });
});

// Handle Author delete on POST.
const author_delete_post = asyncHandler(async (req, res, next) => {
    // Get details of author and all their books (in parallel)
    const [author, allBooksByAuthor] = await Promise.all([
      Author.findById(req.params.id).exec(),
      Book.find({ author: req.params.id }, "title summary").exec(),
    ]);

    if (allBooksByAuthor.length > 0) {
      // Author has books. Render in same way as for GET route.
      res.render("author_delete", {
        title: "Delete Author",
        author: author,
        author_books: allBooksByAuthor,
      });
      return;
    } else {
      // Author has no books. Delete object and redirect to the list of authors.
      await Author.findByIdAndDelete(req.body.authorid);
      res.redirect("/catalog/authors");
    }
});

// Display author update form on GET.
const author_update_get = asyncHandler(async (req, res, next) => {
    const author = await Author.findById(req.params.id).exec();

    if (author === null) {
      // No results.
      const err = new Error("Author not found");
      err.status = 404;
      return next(err);
    }

    res.render("author_form", {
      title: "Update Author",
      author: author,
    });
});

// Handle author update on POST.
const author_update_post = [
  // Validate and sanitize fields.
  body("first_name", `First name must not be empty or is too long (max ${Author.schema.paths.first_name.options.maxLength}).`)
    .trim()
    .isLength({ min: 1, max: Author.schema.paths.first_name.options.maxLength })
    .escape(),
  body("family_name", `Family name must not be empty or is too long (max ${Author.schema.paths.family_name.options.maxLength}).`)
    .trim()
    .isLength({ min: 1, max: Author.schema.paths.family_name.options.maxLength })
    .escape(),
  body("date_of_birth", "Date of birth must not be empty.")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  body("date_of_death", "Date of death must not be empty.")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create an Author object with escaped and trimmed data.
    const author = new Author({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
      _id: req.params.id, //This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      res.render("author_form", {
        title: "Update Author",
        author: author,
        errors: errors.array(),
      });
    } else {
      // Data from form is valid. Update the record.
      await Author.findByIdAndUpdate(req.params.id, author);
      res.redirect(author.url);
    }
  }),
];

const author_search = asyncHandler(async (req, res, next) => {
    let query = req.query.q;
	const authors = await Author.find({
		$or: [
			{ first_name: { $regex: query, $options: 'i' } },
			{ family_name: { $regex: query, $options: 'i' } }
		]
		}).exec();	
    if (query === "" || authors === null) {
        res.redirect('/catalog/authors');
    } else {
        res.render('author_list', { title: 'Author List', author_list: authors });
    }
});

const author_search2 = asyncHandler(async (req, res, next) => {
    let query = req.query.q;
	const authors = await Author.find({
		$or: [
			{ first_name: { $regex: query, $options: 'i' } },
			{ family_name: { $regex: query, $options: 'i' } }
		]
		}).exec();	

	res.render('author_list_change', { author_list: authors });
});

export {
  author_list,
  author_detail,
  author_create_get,
  author_create_post,
  author_delete_get,
  author_delete_post,
  author_update_get,
  author_update_post,
  author_search,
  author_search2
};