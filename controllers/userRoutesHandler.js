/* --------------------------------- schemas -------------------------------- */
const userSchema = require("../models/User");
const productSchema = require("../models/Product");
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
const mongoose = require("mongoose");
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
const router = require("express").Router();
const productsRouter = require("express").Router();
/* -------------------------------------------------------------------------- */

//! ------------ import authorization protection to protect routes ----------- */
const { protect } = require("../middleware/authorizationMiddleware");
//! -------------------------------------------------------------------------- */

// TODO=> import jwt related functions and handlers
const {
	generateToken,
	SignAccessToken,
	SignRefreshToken,
	VerifyRefreshToken,
} = require("../helpers/jwt_helper");

// TODO=> require http-errors to send the error to the error handler middleware
const createError = require("http-errors");

// TODO=> import ErrorResponse class to create our own custom error
const ErrorResponse = require("../helpers/errorResponse");

// TODO=> connect to mongodb cloud
const DB_options = {
	useNewUrlParser: true,
	useUnifiedTopology: true,
};
// connection
const DB_URI_1 = process.env.DB_URI_1;
const DB_URI_3 = process.env.DB_URI_3;
const conn1 = mongoose.createConnection(DB_URI_1, DB_options, () => {
	console.log(`Cluster 1  is connected successfully :D`.inverse.green);
});
const conn3 = mongoose.createConnection(DB_URI_3, DB_options, () => {
	console.log(`Cluster 3  is connected successfully :D`.inverse.green);
});

//! -------------------------------------------------------------------------- */
//! -------------------------------------------------------------------------- */
//! -------------------------------------------------------------------------- */
//! --------------------------------- MODELS  ------------------------------- */
//! -------------------------------------------------------------------------- */
//! -------------------------------------------------------------------------- */
//! -------------------------------------------------------------------------- */
const MiddleEastUser = conn1.model("User", userSchema);
// const Product = conn1.model("Product", productSchema);
const EuropeUser = conn3.model("User", userSchema);
const EuropeProduct = conn3.model("Product", productSchema);
const MiddleEastProduct = conn1.model("Product", productSchema);

//! -------------------------------------------------------------------------- */
//! -------------------------------------------------------------------------- */
//! -------------------------------------------------------------------------- */
//! --------------------------------- CONTROLLERS -------------------------- */
//! -------------------------------------------------------------------------- */
//! -------------------------------------------------------------------------- */
//! -------------------------------------------------------------------------- */

// TODO=> POST request, to add cach to your wallet
const depositeCach = async (req, res, next) => {
	try {
		//! get user with given user id that passed at url
		const userID = req.params.userID;
		//! search about this user on both middle*east and europe cluster
		let user = await MiddleEastUser.findById(userID);
		if (!user) {
			user = await EuropeUser.findById(userID);
		}
		//! receive the cach from req.body
		const money = Number(req.body.cach);
		//! save it inside the cach field
		user.cach = Number(user.cach) + money;
		//! save the updation
		await user.save();
		//! return the response to end the request cycle
		return res.status(200).json(user.cach);
	} catch (error) {
		next(error);
	}
};

// TODO=> GET request, to fetch user info at his/her profile
const visitProfile = async (req, res, next) => {
	try {
		//! get userid from url
		const userID = req.params.userID;
		//! fetch the user instance with given id

		let user = await MiddleEastUser.findById(userID)
			.populate("purchasedProducts")
			.populate("soldProducts")
			.populate("offeredProducts");
		if (!user) {
			user = await EuropeUser.findById(userID)
				.populate("purchasedProducts")
				.populate("soldProducts")
				.populate("offeredProducts");
		}
		if (!user) {
			//! check if there is any user with this id or not
			return res.status(401).json({
				error: "no user with this id",
			});
		}
		//! send the response with all required data
		return res.status(200).json({
			id: user._id,
			email: user.email,
			username: user.username,
			region: user.region,
			cach: user.cach,
			purchasedProducts: user.purchasedProducts,
			soldProducts: user.soldProducts,
			offeredProducts: user.offeredProducts,
			follow: user.follow,
			followedBy: user.followedBy,
		});
	} catch (error) {
		next(error);
	}
};

// // TODO=> POST request, to create new product by specific user
// const createProduct = async (req, res, next) => {
// 	try {
// 		const newProduct = req.body;
// 		const userID = req.params.userID;
// 		const newProductInstance = await Product.create({
// 			...newProduct,
// 			owner: userID,
// 		});
// 		console.log("[NEW PRODUCT] => ", newProductInstance);
// 		//! check where is the host of this user
// 		let user = await MiddleEastUser.findById(userID);
// 		console.log("[Product Owner] => ", user);
// 		if (!user) {
// 			user = await EuropeUser.findById(userID);
// 			console.log("[Product Owner] => ", user);
// 		}

// 		let userRegion = user.region;
// 		console.log("[Product Owner region] => ", userRegion);

// 		if (userRegion === "Middle East") {
// 			user = await MiddleEastUser.findByIdAndUpdate(
// 				{ _id: userID },
// 				{ $push: { offeredProducts: newProductInstance } },
// 				{ new: true }
// 			);
// 			console.log("[Product Owner after creating] => ", user);
// 			user.save();
// 		} else if (userRegion === "Europe") {
// 			user = await EuropeUser.findByIdAndUpdate(
// 				{ _id: userID },
// 				{ $push: { offeredProducts: newProductInstance } },
// 				{ new: true }
// 			);
// 			console.log("[Product Owner after creating] => ", user);
// 			user.save();
// 		}

// 		return res.status(201).json(newProductInstance);
// 	} catch (error) {
// 		next(error);
// 	}
// };

// TODO=> POST request, to create new product by specific user
const createProduct = async (req, res, next) => {
	try {
		const newProduct = req.body;
		const userID = req.params.userID;

		// //! check where is the host of this user
		let user = await MiddleEastUser.findById(userID);
		if (!user) {
			user = await EuropeUser.findById(userID);
		}
		let userRegion = user.region;
		let product;
		if (userRegion === "Middle East") {
			product = await MiddleEastProduct.create({
				...newProduct,
				owner: userID,
			});
			user = await MiddleEastUser.findByIdAndUpdate(
				{ _id: userID },
				{ $push: { offeredProducts: product } },
				{ new: true }
			);
			console.log("[Product Owner after creating] => ", user);
			user.save();
		} else if (userRegion === "Europe") {
			product = await EuropeProduct.create({
				...newProduct,
				owner: userID,
			});

			user = await EuropeUser.findByIdAndUpdate(
				{ _id: userID },
				{ $push: { offeredProducts: product } },
				{ new: true }
			);
			console.log("[Product Owner after creating] => ", user);
			user.save();
		}

		return res.status(201).json(product);
	} catch (error) {
		next(error);
	}
};

//TODO=> user follow another user
const follow = async (req, res, next) => {
	try {
		// get users ids
		const { follower, followed } = req.params;
		console.log(
			"id of user who need to follow is : ",
			follower,
			" , and he need to follow a user with id : ",
			followed
		);

		//! get follower user document
		let followerUser = await MiddleEastUser.findById(follower)
			.populate("offeredProducts")
			.populate("purchasedProducts")
			.populate("soldProducts");
		if (!followerUser) {
			followerUser = await EuropeUser.findById(follower)
				.populate("offeredProducts")
				.populate("purchasedProducts")
				.populate("soldProducts");
		}
		let followerUserRegion = followerUser.region;
		//! get followed user document
		let followedUser = await MiddleEastUser.findById(followed)
			.populate("offeredProducts")
			.populate("purchasedProducts")
			.populate("soldProducts");
		if (!followedUser) {
			followedUser = await EuropeUser.findById(followed)
				.populate("offeredProducts")
				.populate("purchasedProducts")
				.populate("soldProducts");
		}
		let followedUserRegion = followedUser.region;

		if (mongoose.Types.ObjectId(followed).equals(followerUser.follow[0])) {
			console.log("YEEEEEEES");
		}
		console.log(mongoose.Types.ObjectId(followed), followerUser.follow[0]);

		const isFollowedBefore = followerUser.follow.find((item) =>
			mongoose.Types.ObjectId(followed).equals(item)
		);
		console.log("is followed before checking result is, ", isFollowedBefore);

		//if its followed before, don't push it again
		//else:
		if (!isFollowedBefore) {
			// follower user need to follow followed user
			// so follower user will have the id of followed user inside his follow array
			followerUser.follow.push(followed);
			// add the followed's offeredProducts into follower's offeredProducts
			followedUser.offeredProducts.forEach((item) => {
				followerUser.offeredProducts.push(item);
			});
			followerUser.save();
			console.log(
				"follower offered products now are ",
				followerUser.offeredProducts
			);
			// followerUser.offeredProducts.push(followedUser.offeredProducts);
			// so followed user will have the id of follower user inside his followedBy array
			followedUser.followedBy.push(follower);
			followedUser.save();
			// return the response
		} else {
			console.log("its already followed before");
		}
		return res.status(200).json({
			followerUser,
			followedUser,
		});
	} catch (error) {
		console.log(error);
		next(error);
	}
};

//TODO=> list all users
const listAllUsers = async (req, res, next) => {
	try {
		let users = [];
		const middleEast = await MiddleEastUser.find({});
		const europe = await EuropeUser.find({});
		middleEast.forEach((user) => users.push(user));
		europe.forEach((user) => users.push(user));

		if (!users) {
			return res.json("No Users Are Registered !");
		} else {
			return res.json(users);
		}
	} catch (error) {
		next(error);
	}
};

// TODO=> Register a new user
const register = async (req, res, next) => {
	try {
		// TODO (1) : get the email and password from body of request
		const { email, password } = req.body;

		// TODO (2) : take the region and specify which cluster to save on
		const userRegion = req.body.region;
		let newUser;
		if (userRegion === "Middle East") {
			// TODO (3) : Create a new instance of this resource and save it in the database
			newUser = await MiddleEastUser.create(req.body);
		} else if (userRegion === "Europe") {
			// TODO (3) : Create a new instance of this resource and save it in the database
			newUser = await EuropeUser.create(req.body);
		}

		// TODO (4) : create access token
		// const accessToken = await SignAccessToken(newUser.id);
		// const refreshToken = await SignRefreshToken(newUser.id);
		const token = generateToken(newUser._id);

		// TODO (5) : send back the response to client-side
		res.status(200).json({
			username: newUser.username,
			region: newUser.region,
			id: newUser._id,
			cach: newUser.cach + newUser.income,
			email: newUser.email,
			purchasedProducts: newUser.purchasedProducts,
			soldProducts: newUser.soldProducts,
			offeredProducts: newUser.offeredProducts,
			follow: newUser.follow,
			followedBy: newUser.followedBy,
			token: token,
		});
	} catch (error) {
		console.log(error);
		next(error);
	}
};

// TODO=>  Login route handler
const login = async (req, res, next) => {
	try {
		// TODO (1) : recieve email and password from req.body
		const { email, password } = req.body;
		// TODO (2) : check if email or password are missings
		if (!email) {
			return res.status(401).json({
				error: "email is required",
			});
		}
		if (!password) {
			return res.status(401).json({
				error: "password is required",
			});
		}
		// TODO (2) : check if this email is saved in database before or not
		let user = await MiddleEastUser.findOne({ email: email })
			.populate("offeredProducts")
			.populate("purchasedProducts")
			.populate("soldProducts");

		if (!user) {
			user = await EuropeUser.findOne({ email: email })
				.populate("offeredProducts")
				.populate("purchasedProducts")
				.populate("soldProducts");
		}

		if (!user) {
			return res.status(401).json({
				error: "invalid credentials, provided email is wrong",
			});
		} else {
			// TODO (3) : check if the password match or not
			const isPasswordMatch = await user.isValidPassword(password);
			if (!isPasswordMatch) {
				return res.status(401).json({
					error: "invalid credentials, provided password is wrong",
				});
			} else {
				// TODO (4) : finally send the successful response back
				// const accessToken = await SignAccessToken(user.id);
				// const refreshToken = await SignRefreshToken(user.id);
				const token = generateToken(user._id);
				return res.status(200).json({
					username: user.username,
					region: user.region,
					id: user._id,
					cach: user.cach + user.income,
					email: user.email,
					purchasedProducts: user.purchasedProducts,
					soldProducts: user.soldProducts,
					offeredProducts: user.offeredProducts,
					follow: user.follow,
					followedBy: user.followedBy,
					token: token,
				});
			}
		}
	} catch (error) {
		console.log(error);
		next(error);
	}
};

// TODO=> refresh token route handler
const refreshToken = async (req, res, next) => {
	try {
		const { refreshToken } = req.body;
		if (!refreshToken) {
			return res.status(400).json({
				error: "refresh token is missing",
			});
		} else {
			// get the userid
			const userId = await VerifyRefreshToken(refreshToken);
			// now you can generate a new pair of access token and refresh token
			const newAccessToken = await SignAccessToken(userId);
			const newRefreshToken = await SignRefreshToken(userId);
			return res.status(200).json({
				data: {
					accessToken: newAccessToken,
					refreshToken: newRefreshToken,
				},
			});
		}
	} catch (error) {
		next(error);
	}
};

// TODO=> Logout
const logout = async (req, res, next) => {
	res.json("logout");
};

// get tokens from model
// create cookie
// send response
const SendTokenResponseInCookie = (User, res) => {};

// TODO=> get all products
const getAllProducts = async (req, res, next) => {
	let products = [];
	try {
		const middleEast = await MiddleEastProduct.find({});
		const europe = await EuropeProduct.find({});
		middleEast.forEach((item) => products.push(item));
		europe.forEach((item) => products.push(item));
		if (!products) {
			return res.json("No products Are stored in the store !");
		} else {
			return res.json(products);
		}
	} catch (error) {
		console.log(error);
		next(error);
	}
};

// TODO=> get all products under specific category
const getCategoryproducts = async (req, res, next) => {
	let products = [];
	try {
		//! step (1) : get the desired category from url "req.params"
		const category = req.params.category;
		const middleEast = await MiddleEastProduct.find({});
		const europe = await EuropeProduct.find({});
		middleEast.forEach((item) => {
			if (item.category === category) {
				products.push(item);
			}
		});
		europe.forEach((item) => {
			if (item.category === category) {
				products.push(item);
			}
		});
		//! return back the response
		console.log(products);
		return res.status(200).json(products);
	} catch (error) {
		next(error);
	}
};

//TODO=> get products of specific user
const getUserProducts = async (req, res, next) => {
	try {
		// get user ID
		const { userID } = req.params;
		let userRegion;
		// get the user itself
		let user = await MiddleEastUser.findById(userID);
		if (!user) {
			user = await EuropeUser.findById(userID);
		}
		userRegion = user.region;
		// get all products ids
		const offeredProductsIds = user.offeredProducts;
		const purchasedProductsIds = user.purchasedProducts;
		const soldProductsIds = user.soldProducts;
		const offered = [];
		const sold = [];
		const purchased = [];
		const fetchProducts = () => {};
		if (userRegion === "Europe") {
			for (const id of offeredProductsIds) {
				offered.push(await EuropeProduct.findById(id).populate("owner"));
			}
			for (const id of purchasedProductsIds) {
				purchased.push(await EuropeProduct.findById(id).populate("owner"));
			}
			for (const id of soldProductsIds) {
				sold.push(await EuropeProduct.findById(id).populate("owner"));
			}
		} else if (userRegion === "Middle East") {
			for (const id of offeredProductsIds) {
				offered.push(await MiddleEastProduct.findById(id).populate("owner"));
			}
			for (const id of purchasedProductsIds) {
				purchased.push(await MiddleEastProduct.findById(id).populate("owner"));
			}
			for (const id of soldProductsIds) {
				sold.push(await MiddleEastProduct.findById(id).populate("owner"));
			}
		}

		// fetchProducts();
		return res.status(200).json({
			offeredProducts: offered,
			purchasedProducts: purchased,
			soldProducts: sold,
		});
	} catch (error) {
		next(error);
	}
};

// TODO=> get all details of specific product
const getProductDetails = async (req, res, next) => {
	try {
		//! step (1) : get the product id from url "req.params"
		const { productID } = req.params;
		let product = await MiddleEastProduct.findById(productID);
		if (!product) {
			product = await EuropeProduct.findById(productID);
		}
		if (!product) {
			return res.json([]);
		} else {
			//! return back the response
			console.log(product);
			return res.status(200).json(product);
		}
	} catch (error) {
		next(error);
	}
};

// TODO=> update the cach field in user document after purchasing some products
const UpdateAfterPurchasing = async (req, res, next) => {
	try {
		//! get the id of user who want to buy a productl
		const { userID } = req.params;
		//! get all all-ids-of-products, and the totalPrice from req.body
		const { cartItemsIds, totalPrice } = req.body;
		//! get the user who want to buy and update his cach to decrease it
		let updatedUser = await MiddleEastUser.findById(userID);
		if (!updatedUser) {
			updatedUser = await EuropeUser.findById(userID);
		}
		console.log("cach of fady was ", updatedUser.cach);
		console.log(
			"purchased products of buyer was ",
			updatedUser.purchasedProducts
		);
		updatedUser.cach -= totalPrice;
		//! update his purchasedProducts also :D
		cartItemsIds.forEach((itemId) =>
			updatedUser.purchasedProducts.push(itemId)
		);
		console.log("cach of fady become ", updatedUser.cach);
		console.log(
			"purchased products of buyer become ",
			updatedUser.purchasedProducts
		);
		updatedUser.save();

		//! get all products
		const productsOwners = [];
		for (const itemId of cartItemsIds) {
			let item = await MiddleEastProduct.findById(itemId).populate("owner");
			if (!item) {
				item = await EuropeProduct.findById(itemId).populate("owner");
			}
			const itemOwner = item.owner;
			console.log("item owner cach was ", itemOwner.cach);
			console.log("item owner soldProducts was ", itemOwner.soldProducts);
			itemOwner.cach += item.price;
			if (itemOwner.soldProducts.length === 0) {
				itemOwner.soldProducts.push(itemId);
				console.log("item owner soldProducts become ", itemOwner.soldProducts);
			} else {
				if (!itemOwner.soldProducts.includes(itemId)) {
					itemOwner.soldProducts.push(itemId);
					console.log(
						"item owner soldProducts become ",
						itemOwner.soldProducts
					);
				} else {
					console.log(" its already added into sold products array before!");
				}
			}
			console.log("item owner cach become ", itemOwner.cach);
			itemOwner.save();
			productsOwners.push(itemOwner);
		}

		return res.json({ updatedUser, productsOwners });
	} catch (error) {
		console.log(error.message);
		next(error);
	}
};

//! -------------------------------------------------------------------------- */
//! -------------------------------------------------------------------------- */
//! -------------------------------------------------------------------------- */
//! --------------------------------- ROUTERS -------------------------------- */
//! -------------------------------------------------------------------------- */
//! -------------------------------------------------------------------------- */
//! -------------------------------------------------------------------------- */

// TODO=> list all users GET
router.route("/").get(listAllUsers);

//TODO=> user want to follow another user
router.route("/:follower/follow/:followed").get(follow);

// TODO=> route to enable user to deposite money to his account
router.route("/:userID/cach-deposite").post(depositeCach);

// // TODO=> (protected) route to fetch all info required at point vii, to be shown in profile
// router.route("/profile").get(protect, getUserProfile);

// TODO=> route to fetch all info required at point vii, to be shown in profile
router.route("/:userID").get(visitProfile);

// TODO=> route to create new product by specific user
router.route("/:userID/product").post(createProduct);

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").post(logout);
router.route("/refresh-token").post(refreshToken);

// TODO=> GET request, fetch all products of specific user
// TODO=> /api/products/user/:userID
// TODO=> public access api
productsRouter.route("/user/:userID").get(getUserProducts);

// TODO=> GET request, fetch all products from specific category
// TODO=> /api/products/:category
// TODO=> public access api
productsRouter.route("/").get(getAllProducts).post();

// TODO=> GET request, fetch all products from specific category
// TODO=> /api/products/:category
// TODO=> public access api
productsRouter.route("/:category").get(getCategoryproducts);

// TODO=> GET request, fetch all specific product information
// TODO=> /api/products/:productID
// TODO=> public access api
productsRouter.route("/product-details/:productID").get(getProductDetails);

// TODO=> PATCH request, update the cach field in user document after purchasing some products
// TODO=> /api/cart/:userID
// TODO=> Private access API
productsRouter.route("/cart/:userID").patch(UpdateAfterPurchasing);

module.exports = { usersRouter: router, productsRouter };
