const { query } = require('express');
const Tour = require('../model/tourModal');
const APIFEATURES = require('../utils/apiFeature');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync')


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

  exports.aliasTopTour = (req, res, next) => {
   req.query.limit = 5;
   req.query.fields = "name,price,ratingsAverage,summary,difficulty";
   req.query.sort="-ratingsAverage,price";
   next();
  };



exports.getAllTour = catchAsync(

  async (req, res, next)=>{

      const features = new APIFEATURES(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

      const tour = await features.query;

      res.status(200)
      .json({
       status:"success",
       results:tour.length,
       data:{
          tour
       }
      })

    }
)



exports.createTour = catchAsync(async (req, res, next) => {

    const newTour = await Tour.create(req.body)

    res.status(201)
    .json({
     status:"success",
     data:{
        tour:newTour
     }
    })
  }
);



exports.getTour = catchAsync(

  async (req, res, next) => {

       const tour = await Tour.findById(req.params.id)

       if(!tour){
         return next(new AppError(`No tour found with the id: ${req.params.id}`, 404));
       }
 
       res.status(200)
       .json({
        status:"success",
        data:{
           tour
        }
       })
 
     }

)




exports.updateTour = catchAsync( async (req, res, next) =>{
 
      console.log(req.body)
  
      const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {new:true, runValidators:true});


      if(!updatedTour){
        return next(new AppError(`No tour found with the id: ${req.params.id}`, 404));
      }
  
      res.status(200)
      .json({
       status:"success",
       data:{
          tour: updatedTour
       }
      })
    }
)



exports.deleteTour = catchAsync(

  async (req, res, next) =>{

    console.log(req.params);
   
       const tour = await Tour.findByIdAndDelete(req.params.id);

       if(!tour){
        return next(new AppError(`No tour found with the id: ${req.params.id}`, 404));
      }

      res.status(204).json({
         status:"success",
         data: null
      })
   
    }
)




exports.getTourStats = catchAsync(

  async (req, res, next) => {
 
      const stats = await Tour.aggregate([
        {
          $match : {ratingsAverage:{$lte:3}}
        },
        {
          $group:{
            _id:{$toUpper: '$difficulty'},
            numTour:{$sum:1},
            avgRating:{$avg:'$ratingsAverage'},
            avgPrice:{$avg:'$price'},
            minPrice:{$min:'$price'},
            maxPrice:{$max:'$price'},
          }
        },
        {
          $sort:{avgPrice: 1}
        },
        // {
        //   $match:{_id:{$ne:'EASY'}}
        // }
       
      ])
    
      res.status(200).json({
        status:'success',
        data:{
          stats
        }
      })
    }
)


exports.getMonthlyPlan = catchAsync(

  async (req, res, next) => {

      const year = req.params.year * 1;
  
      const plan = await Tour.aggregate([
      
        {
          $unwind:'$startDates'
        },
        
        {
          $match:{
            startDates:{
              $gte: new Date(`${year}-01-01`),
              $lte: new Date(`${year}-12-31`),
            }
          }
        },
        {
          $group:{
            _id:{$month:'$startDates'},
            numTourStarts:{$sum: 1},
            tours:{$push: '$name'}
          }
        },
        {
          $addFields:{ month: '$_id'}
        },
        {
          $project:{
            _id: 0
          }
        },
        {
          $sort:{numTourStarts: -1}
        },
        {
          $limit: 12
        }
       
      ]);
  
      res.status(200).json({
        status:'success',
        data:{
          plan
        }
      })
    }

)



