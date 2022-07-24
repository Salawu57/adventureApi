const mongoose = require("mongoose");

process.on("uncaughtException", (err) => {
  console.log(err.name);
  console.log(err);
  console.log("Uncaught exception  shutting down");
});
const app = require("./app");
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

//Connection to Host
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => {
    console.log("database connection successful");
  });

//Connection to localDatabase
// mongoose
//   .connect(process.env.DB_CONNECTION_LOCAL, {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useFindAndModify: false,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("database connection successful"));

const server = app.listen(process.env.PORT, () => {
  console.log(`Server running now on port ${process.env.PORT}..... `);
});

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("UnhandledRejection  shutting down");
  server.close(() => {
    process.exit(1);
  });
});

// handling automatic shutdown from heroku -> to ensure all request end properly 
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('🔥 process terminated')
  })
})
