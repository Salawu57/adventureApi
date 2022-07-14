const express = require("express");
const userController = require("../controller/userController");
const authController = require("./../controller/authController");

const userRouter = express.Router();

userRouter.post("/signup", authController.signup);
userRouter.post("/login", authController.login);
userRouter.get("/logOut", authController.logout);

userRouter.post("/forgotPassword", authController.forgotPassword);
userRouter.patch("/resetPassword/:token", authController.resetPassword);

//Protect other route from this point
userRouter.use(authController.protect);

userRouter.patch(
  "/updateMyPassword",

  authController.updatePassword
);

userRouter.get(
  "/me",

  userController.getMe,
  userController.getUser
);

userRouter.patch(
  "/updateMe",
  userController.uploadUserPhoto, userController.resizeUserPhoto,
  userController.updateMe
);

userRouter.delete("/deleteMe", userController.deleteMe);

//this section route are restricted to admin
userRouter.use(authController.restrictTo("admin"));

userRouter.route("/").get(userController.getAllUsers);
userRouter
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = userRouter;
