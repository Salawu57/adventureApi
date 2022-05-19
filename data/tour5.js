const Tour = require('./../model/tourModal');
const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({path:'./config.env'});


mongoose.connect(process.env.DB_CONNECTION_LOCAL, {
  useNewUrlParser:true,
  useCreateIndex:true,
  useFindAndModify:false,
  useUnifiedTopology: true
}).then(() => console.log('database connection successful'))


const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));


const importData = async () => {

try{

  await Tour.create(tours);

  console.log("Data import successful")

}catch(err){

  console.log(err)

}

process.exit();

}

if(process.argv[2] === '--import'){

   importData();

}

// const viewTours = () => console.log(toursJson);


// const importTour = () => {
  
//   const tours  = new Tour(toursJson);

//   tours.save().then(() => console.log("Tours saved successful")).catch(err => console.log(err));
 
//   console.log(toursJson);


//   process.exit();

// }

// console.log(process.argv);


// if(process.argv[2] === '--import'){
//   importTour(toursJson)
 
// }
