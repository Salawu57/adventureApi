const Tour = require('../model/tourModal');


exports.checkBody = (req, res, next)=>{
  console.log(req.body);
   
  const tour  = req.body;

  if(!tour){
    res.status(400)
    .json({
     status:"fail",
     message:"No body details found"
    })
  }
  next();
  }

exports.getAllTour = async (req, res)=>{

    try{

      let newQuery ={...req.query};


      console.log(req.query);

      const unWantedOption = ["sort","limit","page","fields"];

      unWantedOption.forEach(el => delete newQuery[el])

      let newQueryStr = JSON.stringify(newQuery);

      newQueryStr = newQueryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

      const query =  Tour.find(JSON.parse(newQueryStr));

     
      if(req.query.sort){

        let sortValue = req.query.sort;

        sortValue = sortValue.split(',').join(' ');

         query.sort(sortValue)

      }

      if(req.query.fields){

        let fieldsValue = req.query.fields;

        fieldsValue = fieldsValue.split(",").join(' ');

         query.select(fieldsValue);

      }


      if(req.query.page){

        const reqPage = req.query.page * 1 || 1 ;

        const limit = req.query.limit * 1 || 100;

        const skipValue = (reqPage - 1 ) * limit;
        
        // console.log(`${reqPage} and ${limit} with ${skipValue}`);

        query.skip(skipValue).limit(limit);

      }


      
      const tour = await query;

      res.status(200)
      .json({
       status:"success",
       results:tour.length,
       data:{
          tour
       }
      })

    }catch(err){
      res.status(400)
      .json({
       status:"failed",
       message:err
      })
    }
  
}

exports.createTour = async (req, res) => {

  try{
 
    const newTour = await Tour.create(req.body)

    res.status(201)
    .json({
     status:"success",
     data:{
        tour:newTour
     }
    })
  }catch(err){

    res.status(400)
    .json({
     status:"fail",
     message:err
    })
  }
}

exports.getTour = async (req, res) => {
  
   try{
      const tour = await Tour.findById(req.params.id)

      res.status(200)
      .json({
       status:"success",
       data:{
          tour
       }
      })

    }catch(err){
      res.status(400)
      .json({
       status:"failed",
       message:err
      })
    }
}

exports.updateTour = async (req, res) =>{
 
  try{

    console.log(req.body)

    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {new:true, runValidators:true});

    res.status(200)
    .json({
     status:"success",
     data:{
        tour: updatedTour
     }
    })

  }catch(err){
    res.status(400)
    .json({
     status:"failed",
     message:err
    })
  }
}


exports.deleteTour = async (req, res) =>{
 console.log(req.params);
 try{
    await Tour.findByIdAndDelete(req.params.id);
   res.status(204).json({
      status:"success",
      message:"Tour Deleted successful"
   })

 }catch(err){

   console.log("error =====>",err)
   res.status(400).json({
      status:"failed",
      message:err
   })

 }
}

