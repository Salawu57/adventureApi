
const mongoose = require("mongoose");

process.on('uncaughtException', err =>{
    console.log(err.name);
    console.log(err);
    console.log("Uncaught exception  shutting down")
}
)
const app = require('./app');

mongoose
  .connect(process.env.DB_CONNECTION_LOCAL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log("database connection successful"));

const server = app.listen(process.env.PORT, () => {
    console.log(`Server running now on port ${process.env.PORT}..... `);
})

process.on('unhandledRejection', err => {
    console.log(err.name, err.message);
    console.log("UnhandledRejection  shutting down") 
    server.close(() => {
        process.exit(1);
    })
});



