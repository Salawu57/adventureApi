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
      const tour = await Tour.find();

      res.status(200)
      .json({
       status:"success",
       length:tour.length,
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

