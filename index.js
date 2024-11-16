import { ApolloServer } from "@apollo/server";
//import { ApolloServerPluginCacheControlDisabled } from '@apollo/server/plugin/disabled';
import { startStandaloneServer } from "@apollo/server/standalone";
// types
import { typeDefs } from "./schema.js";
import db from "./_db.js";
//server set up
//console.log('type defs',typeDefs);
const resolvers = {
  Query: {
    games() {
      return db.games;
    },
    reviews() {
      return db.reviews;
    },
    game(_, arg) {
      return db.games.find((game) => game.id === arg.id);
    },
    author(_, arg) {
      return db.authors.find((author) => author.id === arg.id);
    },
    authors() {
      return db.authors;
    },
    review(_, arg) {
      return db.reviews.find((review) => review.id === arg.id);
    },
  },
  Game: {
    reviews(parent) {
      return db.reviews.filter((review) => review.game_id === parent.id);
    },
  },
  Author: {
    reviews(parent) {
      return db.reviews.filter((r) => r.game_id === parent.id);
    },
  },
  Review: {
    author(parent) {
      return db.authors.find((a) => a.id === parent.author_id);
    },
    game(parent) {
      return db.games.find((g) => g.id === parent.game_id);
    },
  },
  Mutation: {
    deleteGame(_, arg) {
      db.games = db.games.filter((g) => g.id !== arg.id);

      return db.games;
    },
    addGame(_, args){
      let game={
        ...args.game,
        id:Math.floor(Math.random()*1000).toString()
      }
      db.games.push(game)
      return game
    },
    updateGame(_,args){
      db.games=db.games.map((g)=>{
        if(g.id===args.id){
          return {...g, ...args.edits}
        }
        return g
      })
      return db.games.find((g)=>g.id===args.id)
    }

  },
};
const server = new ApolloServer({
  typeDefs,
  //resolvers property
  resolvers,
  //
});
const startServer = async () => {
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });
  console.log(`server ready at ${url}`);
};
startServer();
