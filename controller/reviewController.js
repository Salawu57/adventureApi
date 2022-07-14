const Review = require('./../model/reviewModel');
const factory = require('./handlerFactory');
// const catchAsync = require('./../utils/catchAsync');


// create a middleware function for pre setting values 
exports.setTourUserIds = (req, res, next) => {
    if(!req.body.tour) req.body.tour = req.params.tourId;
    if(!req.body.user) req.body.user = req.user.id;

    next();
}

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteOne = factory.deleteOne(Review);




// exports.getAllReviews = catchAsync(async (req, res, next) =>{
//     let filter ={};

//     if(req.params.tourId) filter = {tour:req.params.tourId};

//     const reviews = await Review.find(filter);

//     res.status(200).json({
//         status:'success',
//         results:reviews.length,
//         data:{
//             reviews
//         }
//     });
// });


// exports.createReview = catchAsync(async (req, res, next) => {

//     const newReview = await Review.create(req.body);

//     res.status(201).json({
//         status:'success',
//         data:{
//             review: newReview
//         }
//     });
// });



