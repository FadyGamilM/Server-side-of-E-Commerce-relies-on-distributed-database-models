const {
	getCategoryproducts,
	getProductDetails,
	getAllProducts,
	UpdateAfterPurchasing,
	getUserProducts,
} = require("../controllers/products");
const { createProduct } = require("../controllers/userRoutesHandler");

const router = require("express").Router();

// TODO=> GET request, fetch all products of specific user
// TODO=> /api/products/user/:userID
// TODO=> public access api
router.route("/user/:userID").get(getUserProducts);

// TODO=> GET request, fetch all products from specific category
// TODO=> /api/products/:category
// TODO=> public access api
router.route("/").get(getAllProducts).post();

// TODO=> GET request, fetch all products from specific category
// TODO=> /api/products/:category
// TODO=> public access api
router.route("/:category").get(getCategoryproducts);

// TODO=> GET request, fetch all specific product information
// TODO=> /api/products/:productID
// TODO=> public access api
router.route("/product-details/:productID").get(getProductDetails);

// TODO=> PATCH request, update the cach field in user document after purchasing some products
// TODO=> /api/cart/:userID
// TODO=> Private access API
router.route("/cart/:userID").patch(UpdateAfterPurchasing);

module.exports = router;
