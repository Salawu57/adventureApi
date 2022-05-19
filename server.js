const app = require('./app');


console.log(process.env);

console.log("Am in ");

app.listen(process.env.PORT, () =>{
    console.log(`Server running now on port ${process.env.PORT}..... `);
})