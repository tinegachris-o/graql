const express = require("express");
const app = express();
require("dotenv").config();
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  graphql,
  GraphQLInt,

  GraphQLNonNull,
} = require("graphql");

const expressGraphQL = require("express-graphql").graphqlHTTP;
// data from grap ql

const authors = [
  { id: 1, name: "J. K. Rowling" },
  { id: 2, name: "J. R. R. Tolkien" },
  { id: 3, name: "Brent Weeks" },
];

const books = [
  { id: 1, name: "Harry Potter and the Chamber of Secrets", authorId: 1 },
  { id: 2, name: "Harry Potter and the Prisoner of Azkaban", authorId: 1 },
  { id: 3, name: "Harry Potter and the Goblet of Fire", authorId: 1 },
  { id: 4, name: "The Fellowship of the Ring", authorId: 2 },
  { id: 5, name: "The Two Towers", authorId: 2 },
  { id: 6, name: "The Return of the King", authorId: 2 },
  { id: 7, name: "The Way of Shadows", authorId: 3 },
  { id: 8, name: "Beyond the Shadows", authorId: 3 },
];

const BookType = new GraphQLObjectType({
  name: "Book",
  description: "Thisrepresent a book written By Author Chris",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    authorId: { type: new GraphQLNonNull(GraphQLInt) },
    author: {
      type: AuthorType,
      resolve: (book) => {
        return authors.find((author) => author.id === book.authorId);
      },
    },
  }),
});

//authors
const AuthorType = new GraphQLObjectType({
  name: "Author",
  description: "Thisrepresent an Author A Book Chris",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    books: {
      type: new GraphQLList(BookType),
      description: "List of books by the author",
      resolve: (author) => {
        return books.filter((book) => book.authorId === author.id);
      },
    },
  }),
});

// Define your GraphQL schema
const RootQueryType = new GraphQLObjectType({
  name: "Query",
  description: "Root Query",
  fields: () => ({
    books: {
      type: new GraphQLList(BookType),
      description: "LIST OF BOOK TYPES",
      resolve: () => books,
    },
    // single book
    book: {
      type: BookType,
      description: "SINGLE BOOK TYPES",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parents, args) => books.find((book) => book.id === args.id),
    },
    // single Author

    author: {
      type: AuthorType,
      description: "SINGLE AUTHOR",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (_, args) => authors.find((author) => author.id === args.id),
    },
    //list of authors
    authors: {
      type: new GraphQLList(AuthorType),
      description: "LIST OF ALL AUTHORS",
      resolve: () => authors,
    },
  }),
});
// Root mutation Type
const RootMutationType = new GraphQLObjectType({
  name: "Mutation",
  description: "Root mutation",

  fields: () => ({
    addBook: {
      type: BookType,
      descriprition: "Add A Book",
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },

        authorId: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: (parent, args) => {
        const book = {
          id: books.length + 1,
          name: args.name,
          authorId: args.authorId,
        };
        books.push(book);
        return book;
      },
    },
    //add an Author
    addAuthor: {
      type: AuthorType,
      description: "Add An Author",
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
      },

      resolve: (parent, args) => {
        const author = { id: authors.length + 1, name: args.name };
        authors.push(author);
        return author;
      },
    },
    //update Author
  //delete A Book

  deleteBook: {
    type: BookType,
    description: "deletion of a book",
    args: {
      id: { type: GraphQLNonNull(GraphQLInt) },
    },
    resolve: (parent, args) => {
      const bookIndex = books.findIndex((b) => b.id === args.id);
      if (bookIndex === -1) {
        throw new Error("book not found");
      }
      //remove book and return it
      const [deletedBook] = books.splice(bookIndex, 1);
      return deletedBook;
    },
  },
  //update a book 
    updateBook: {
      type: BookType,
      description: "update book name or author or both",
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) }, // ID of the book to update

        name: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: (parent, args) => {
        //find book id
        const book = books.find((b) => b.id === args.id);
        if (!book) {
          throw new Error("Book not found");
        }
        if (args.name) {
          book.name = args.name;
        }
        if (args.authorId) {
          const authorExists = authors.some(
            (author) => author.id === args.authorId
          );
          if (!authorExists) {
            throw new Error("Author with specific id not found");
          }
          book.authorId = args.authorId;
        }
        return book;
      },
    },
  }),

});

// schema set up
const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
});

// Set up the /graphql route with express-graphql middleware
app.use(
  "/graphql",
  expressGraphQL({
    schema: schema,
    graphiql: true, // This enables the GraphiQL UI for testing GraphQL queries
  })
);

// Get port from environment variable or default to 4000
let port = process.env.PORT || 4000;

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
