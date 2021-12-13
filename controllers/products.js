// const mongoose = require("mongoose");
// const productSchema = require("../models/Product");
// const userSchema = require("../models/User");
// const { createProduct } = require("../controllers/userRoutesHandler");
// const router = require("express").Router();
// const DB_options = {
// 	useNewUrlParser: true,
// 	useUnifiedTopology: true,
// };
// // connection
// const DB_URI_1 = process.env.DB_URI_1;
// const DB_URI_3 = process.env.DB_URI_3;
// const conn1 = mongoose.createConnection(DB_URI_1, DB_options, () => {
// 	console.log(`Cluster 1  is connected successfully :D`.inverse.green);
// });
// const conn3 = mongoose.createConnection(DB_URI_3, DB_options, () => {
// 	console.log(`Cluster 3  is connected successfully :D`.inverse.green);
// });

// //! -------------------------------------------------------------------------- */
// //! -------------------------------------------------------------------------- */
// //! -------------------------------------------------------------------------- */
// //! --------------------------------- MODELS  ------------------------------- */
// //! -------------------------------------------------------------------------- */
// //! -------------------------------------------------------------------------- */
// //! -------------------------------------------------------------------------- */
// const MiddleEastUser = conn1.model("User", userSchema);
// // const Product = conn1.model("Product", productSchema);
// const EuropeUser = conn3.model("User", userSchema);
// const EuropeProduct = conn3.model("Product", productSchema);
// const MiddleEastProduct = conn1.model("Product", productSchema);

// // TODO=> get all products
// const getAllProducts = async (req, res, next) => {
// 	try {
// 		let products;
// 		const middleEast = await MiddleEastProduct.find({});
// 		console.log("error 1");
// 		const europe = await EuropeProduct.find({});
// 		console.log("error 2");

// 		middleEast.forEach((item) => products.push(item));
// 		console.log("error 3");

// 		europe.forEach((item) => products.push(item));
// 		console.log("error 4");

// 		if (!products) {
// 			return res.json("No products Are stored in the store !");
// 		} else {
// 			return res.json(products);
// 		}
// 	} catch (error) {
// 		console.log(error);
// 		next(error);
// 	}
// };

// // TODO=> get all products under specific category
// const getCategoryproducts = async (req, res, next) => {
// 	try {
// 		//! step (1) : get the desired category from url "req.params"
// 		const category = req.params.category;
// 		//! fetch all products from Product model that under this category
// 		const products = await Product.find({ category: category });
// 		//! return back the response
// 		console.log(products);
// 		return res.status(200).json(products);
// 	} catch (error) {
// 		next(error);
// 	}
// };

// //TODO=> get products of specific user
// const getUserProducts = async (req, res, next) => {
// 	try {
// 		// get user ID
// 		const { userID } = req.params;
// 		// get the user itself
// 		const user = await User.findById(userID);
// 		// get all products ids
// 		const offeredProductsIds = user.offeredProducts;
// 		const purchasedProductsIds = user.purchasedProducts;
// 		const soldProductsIds = user.soldProducts;
// 		const offered = [];
// 		const sold = [];
// 		const purchased = [];
// 		const fetchProducts = () => {};
// 		for (const id of offeredProductsIds) {
// 			offered.push(await Product.findById(id).populate("owner"));
// 		}
// 		for (const id of purchasedProductsIds) {
// 			purchased.push(await Product.findById(id).populate("owner"));
// 		}
// 		for (const id of soldProductsIds) {
// 			sold.push(await Product.findById(id).populate("owner"));
// 		}
// 		// fetchProducts();
// 		return res.status(200).json({
// 			offeredProducts: offered,
// 			purchasedProducts: purchased,
// 			soldProducts: sold,
// 		});
// 	} catch (error) {
// 		next(error);
// 	}
// };

// // TODO=> get all details of specific product
// const getProductDetails = async (req, res, next) => {
// 	try {
// 		//! step (1) : get the product id from url "req.params"
// 		const { productID } = req.params;
// 		//! fetch all products from Product model that under this category
// 		const product = await Product.findById(productID);
// 		//! return back the response
// 		console.log(product);
// 		return res.status(200).json(product);
// 	} catch (error) {
// 		next(error);
// 	}
// };

// // TODO=> update the cach field in user document after purchasing some products
// const UpdateAfterPurchasing = async (req, res, next) => {
// 	try {
// 		//! get the id of user who want to buy a productl
// 		const { userID } = req.params;
// 		//! get all all-ids-of-products, and the totalPrice from req.body
// 		const { cartItemsIds, totalPrice } = req.body;
// 		//! get the user who want to buy and update his cach to decrease it
// 		const updatedUser = await User.findById(userID);
// 		console.log("cach of fady was ", updatedUser.cach);
// 		console.log(
// 			"purchased products of buyer was ",
// 			updatedUser.purchasedProducts
// 		);
// 		updatedUser.cach -= totalPrice;
// 		//! update his purchasedProducts also :D
// 		cartItemsIds.forEach((itemId) =>
// 			updatedUser.purchasedProducts.push(itemId)
// 		);
// 		console.log("cach of fady become ", updatedUser.cach);
// 		console.log(
// 			"purchased products of buyer become ",
// 			updatedUser.purchasedProducts
// 		);
// 		updatedUser.save();

// 		//! get all products
// 		const productsOwners = [];
// 		for (const itemId of cartItemsIds) {
// 			const item = await Product.findById(itemId).populate("owner");
// 			const itemOwner = item.owner;
// 			console.log("item owner cach was ", itemOwner.cach);
// 			console.log("item owner soldProducts was ", itemOwner.soldProducts);
// 			itemOwner.cach += item.price;
// 			if (itemOwner.soldProducts.length === 0) {
// 				itemOwner.soldProducts.push(itemId);
// 				console.log("item owner soldProducts become ", itemOwner.soldProducts);
// 			} else {
// 				if (!itemOwner.soldProducts.includes(itemId)) {
// 					itemOwner.soldProducts.push(itemId);
// 					console.log(
// 						"item owner soldProducts become ",
// 						itemOwner.soldProducts
// 					);
// 				} else {
// 					console.log(" its already added into sold products array before!");
// 				}
// 			}
// 			console.log("item owner cach become ", itemOwner.cach);
// 			itemOwner.save();
// 			productsOwners.push(itemOwner);
// 		}

// 		return res.json({ updatedUser, productsOwners });
// 	} catch (error) {
// 		console.log(error.message);
// 		next(error);
// 	}
// };

// // TODO=> GET request, fetch all products of specific user
// // TODO=> /api/products/user/:userID
// // TODO=> public access api
// router.route("/user/:userID").get(getUserProducts);

// // TODO=> GET request, fetch all products from specific category
// // TODO=> /api/products/:category
// // TODO=> public access api
// router.route("/").get(getAllProducts).post();

// // TODO=> GET request, fetch all products from specific category
// // TODO=> /api/products/:category
// // TODO=> public access api
// router.route("/:category").get(getCategoryproducts);

// // TODO=> GET request, fetch all specific product information
// // TODO=> /api/products/:productID
// // TODO=> public access api
// router.route("/product-details/:productID").get(getProductDetails);

// // TODO=> PATCH request, update the cach field in user document after purchasing some products
// // TODO=> /api/cart/:userID
// // TODO=> Private access API
// router.route("/cart/:userID").patch(UpdateAfterPurchasing);

// module.exports = router;
