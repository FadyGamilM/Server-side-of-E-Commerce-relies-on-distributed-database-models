// const router = require("express").Router();

// //* import routes handlers
// const {
// 	depositeCach,
// 	visitProfile,
// 	createProduct,
// 	getUserProfile,
// 	follow,
// 	listAllUsers,
// } = require("../controllers/userRoutesHandler");

// //! ------------ import authorization protection to protect routes ----------- */
// const { protect } = require("../middleware/authorizationMiddleware");
// //! -------------------------------------------------------------------------- */
// // TODO=> list all users GET
// router.route("/").get(listAllUsers);

// //TODO=> user want to follow another user
// router.route("/:follower/follow/:followed").get(follow);

// // TODO=> route to enable user to deposite money to his account
// router.route("/:userID/cach-deposite").post(depositeCach);

// // // TODO=> (protected) route to fetch all info required at point vii, to be shown in profile
// // router.route("/profile").get(protect, getUserProfile);

// // TODO=> route to fetch all info required at point vii, to be shown in profile
// router.route("/:userID").get(visitProfile);

// // TODO=> route to create new product by specific user
// router.route("/:userID/product").post(createProduct);

// module.exports = router;
