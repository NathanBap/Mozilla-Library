// Require Mongoose
import mongoose from 'mongoose';
const { SchemaTypes, model } = mongoose;

// Define a schema
const Schema = mongoose.Schema;

const BookSchema = new Schema({
    title: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "Author", required: true },
    summary: { type: String, required: true },
    isbn: { type: String, required: true },
});

// Virtual for book's URL
BookSchema.virtual("url").get(function () {
    // We don't use an arrow function as we'll need the this object
    return `/catalog/book/${this._id}`;
});

// Compile model from schema
const Book = model('Book', BookSchema);
export default Book;