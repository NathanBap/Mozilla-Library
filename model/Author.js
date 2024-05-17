// Require Mongoose
import mongoose from 'mongoose';
import { DateTime } from 'luxon';
const { SchemaTypes, model } = mongoose;

// Define a schema
const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
    first_name: { type: String, required: true, maxLength: 100 },
    family_name: { type: String, required: true, maxLength: 100 },
    date_of_birth: { type: Date },
    date_of_death: { type: Date },
});

// Virtual for author's full name
AuthorSchema.virtual("name").get(function() {
    let fullname = "";
    if (this.first_name && this.family_name) {
      fullname = `${this.family_name} ${this.first_name}`;
    }
  
    return fullname;
});
  
// Virtual for author's URL
AuthorSchema.virtual("url").get(function () {
    // We don't use an arrow function as we'll need the this object
    return `/catalog/author/${this._id}`;
});
AuthorSchema.virtual("date_of_birth_formatted").get(function () {
    return this.date_of_birth ? DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED) : '';
});
AuthorSchema.virtual("date_of_death_formatted").get(function () {
    return this.date_of_death ? DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED) : '';
});
AuthorSchema.virtual("date_of_birth_form").get(function () {
    return this.date_of_birth ? DateTime.fromJSDate(this.date_of_birth).toISODate() : '';
});
AuthorSchema.virtual("date_of_death_form").get(function () {
    return this.date_of_death ? DateTime.fromJSDate(this.date_of_death).toISODate() : '';
});
  

// Compile model from schema
const Author = model('Author', AuthorSchema);
export default Author;