const app = require('./app');

app.listen(process.env.PORT, () =>{
    console.log(`Server running now on port ${process.env.PORT}..... `);
})