const multer = require("multer");
const sharp = require("sharp");
const { query } = require("express");
const Tour = require("../model/tourModal");
// const APIFEATURES = require('../utils/apiFeature');
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");

exports.checkBody = (req, res, next) => {
  const tour = req.body;

  if (!tour) {
    res.status(400).json({
      status: "fail",
      message: "No body details found",
    });
  }
  next();
};

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};
//save image from form to the specified destination without configuration
// const upload = multer({dest:'public/img/users'});

//save image from form to the specified destination with configuration
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

//for mixed images uploading
exports.uploadTourImages = upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 3 },
]);

// for one image uploading
// upload.single('image')

// for multiple with thesame name
// upload.array('image')

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  //Cover image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  //Images tours
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );

  next();
});

exports.aliasTopTour = (req, res, next) => {
  req.query.limit = 5;
  req.query.fields = "name,price,ratingsAverage,summary,difficulty";
  req.query.sort = "-ratingsAverage,price";
  next();
};

exports.getAllTour = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: "reviews" });
exports.createTour = factory.createOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
exports.updateTour = factory.updateOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: "$difficulty" },
        numTour: { $sum: 1 },
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match:{_id:{$ne:'EASY'}}
    // }
  ]);

  res.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      $unwind: "$startDates",
    },

    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numTourStarts: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    {
      $addFields: { month: "$_id" },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      plan,
    },
  });
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;

  const [lat, lng] = latlng.split(",");

  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        "Please provide longtitude and latitude in the format lat,lng",
        400
      )
    );
  }
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistance = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;

  const [lat, lng] = latlng.split(",");

  const multiplier = unit === "mi" ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        "Please provide longtitude and latitude in the format lat,lng",
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      //always have to be the first stage in the aggregate pipeline
      $geoNear: {
        near: {
          type: "point",
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: "distance",
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      data: distances,
    },
  });
});

// exports.getAllTour = catchAsync(

//   async (req, res, next)=>{

//       const features = new APIFEATURES(Tour.find(), req.query)
//       .filter()
//       .sort()
//       .limitFields()
//       .paginate();

//       const tour = await features.query;

//       res.status(200)
//       .json({
//        status:"success",
//        results:tour.length,
//        data:{
//           tour
//        }
//       })

//     }
// )

// exports.createTour = catchAsync(async (req, res, next) => {

//     const newTour = await Tour.create(req.body)

//     res.status(201)
//     .json({
//      status:"success",
//      data:{
//         tour:newTour
//      }
//     })
//   }
// );

// exports.getTour = catchAsync(

//   async (req, res, next) => {

//        const tour = await Tour.findById(req.params.id).populate('reviews');

//        if(!tour){

//          return next(new AppError(`No tour found with the id: ${req.params.id}`, 404));
//        }

//        res.status(200)
//        .json({
//         status:"success",
//         data:{
//            tour
//         }
//        })

//      }

// )

// exports.updateTour = catchAsync( async (req, res, next) =>{

//       console.log(req.body)

//       const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {new:true, runValidators:true});

//       if(!updatedTour){
//         return next(new AppError(`No tour found with the id: ${req.params.id}`, 404));
//       }

//       res.status(200)
//       .json({
//        status:"success",
//        data:{
//           tour: updatedTour
//        }
//       })
//     }
// )

// exports.deleteTour = catchAsync(

//   async (req, res, next) =>{

//     console.log(req.params);

//        const tour = await Tour.findByIdAndDelete(req.params.id);

//        if(!tour){
//         return next(new AppError(`No tour found with the id: ${req.params.id}`, 404));
//       }

//       res.status(204).json({
//          status:"success",
//          data: null
//       })

//     }
// )
