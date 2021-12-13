// TODO=> require http-errors to send the error to the error handler middleware
const createError = require("http-errors");

// TODO=> import ErrorResponse class to create our own custom error
const ErrorResponse = require("../helpers/errorResponse");

// TODO=> require User database model
const { User } = require("../models/User");

// TODO=> import jwt related functions and handlers
const {
	generateToken,
	SignAccessToken,
	SignRefreshToken,
	VerifyRefreshToken,
} = require("../helpers/jwt_helper");

// TODO=> require auth schema to validate the incoming requests data
const { authSchema } = require("../helpers/schemas_validation");

//! ---------------------------- Register New User --------------------------- */
exports.register = async (req, res, next) => {
	try {
		// TODO (1) : get the email and password from body of request
		const { email, password } = req.body;

		// TODO (2) : Create a new instance of this resource and save it in the database
		const newUser = await User.create(req.body);

		// TODO (3) : create access token
		// const accessToken = await SignAccessToken(newUser.id);
		// const refreshToken = await SignRefreshToken(newUser.id);
		const token = generateToken(newUser._id);

		// TODO (4) : send back the response to client-side
		res.status(200).json({
			username: newUser.username,
			region: newUser.region,
			id: newUser._id,
			cach: newUser.cach + newUser.income,
			email: newUser.email,
			purchasedProducts: newUser.purchasedProducts,
			soldProducts: newUser.soldProducts,
			offeredProducts: newUser.offeredProducts,
			token: token,
		});
	} catch (error) {
		next(error);
	}
};
//! -------------------------------------------------------------------------- */

//! --------------------------- Login route handler -------------------------- */
exports.login = async (req, res, next) => {
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
		const user = await User.findOne({ email: email })
			.populate("offeredProducts")
			.populate("purchasedProducts")
			.populate("soldProducts");

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
					token: token,
				});
			}
		}
	} catch (error) {
		next(error);
	}
};
//! -------------------------------------------------------------------------- */

//! ----------------------- refresh token route handler ---------------------- */
exports.refreshToken = async (req, res, next) => {
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
//! -------------------------------------------------------------------------- */

exports.logout = async (req, res, next) => {
	res.json("logout");
};

// get tokens from model
// create cookie
// send response
const SendTokenResponseInCookie = (User, res) => {};
