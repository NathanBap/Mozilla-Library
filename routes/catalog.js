import express from "express";
const router = express.Router();

// Import controller modules.
import * as bookController from "../controllers/bookController.js";
import * as authorController from "../controllers/authorController.js";

/// BOOK ROUTES ///

// GET catalog home page.
router.get("/", bookController.index);

// GET and POST request for creating a Book.
router.route("/book/create")
  .get(bookController.book_create_get)
  .post(bookController.book_create_post);

// GET and POST request to delete Book.
router.route("/book/:id/delete")
  .get(bookController.book_delete_get)
  .post(bookController.book_delete_post);

// GET and POST request to update Book.
router.route("/book/:id/update")
  .get(bookController.book_update_get)
  .post(bookController.book_update_post);

// GET request for one Book.
router.get("/book/:id", bookController.book_detail);

// GET request for list of all Book items.
router.get("/books", bookController.book_list);

router.get("/books/search", bookController.book_search);
router.get("/books/search2", bookController.book_search2);

/// AUTHOR ROUTES ///

// GET and POST request for creating Author.
router.route("/author/create")
  .get(authorController.author_create_get)
  .post(authorController.author_create_post);

// GET and POST request to delete Author.
router.route("/author/:id/delete")
  .get(authorController.author_delete_get)
  .post(authorController.author_delete_post);

// GET and POST request to update Author.
router.route("/author/:id/update")
  .get(authorController.author_update_get)
  .post(authorController.author_update_post);

// GET request for one Author.
router.get("/author/:id", authorController.author_detail);

// GET request for list of all Authors.
router.get("/authors", authorController.author_list);

router.get("/authors/search", authorController.author_search);
router.get("/authors/search2", authorController.author_search2);

export default router;