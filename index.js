const express = require("express");
const colors = require("colors");
const morgan = require("morgan");
const path = require("path");
const createError = require("http-errors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
require("dotenv").config();

// TODO=> import the error-Handler middleware
const errorHandler = require("./middleware/errorHandler");

// TODO=> import access token verification middleware
const { VerifyAccessToken } = require("./helpers/jwt_helper");

// TODO=> Import routes to chain them
const authRoutes = require("./controllers/userRoutesHandler");
const {
	usersRouter,
	productsRouter,
} = require("./controllers/userRoutesHandler");
const storeRoutes = require("./routes/store");
// const productRoutes = require("./router/userRoutesHandler");
const uploadeRoutes = require("./routes/uploadeRoutes");

// TODO=> Fire express server
const app = express();
app.use(morgan("dev"));

// TODO=> use middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// TODO=> some protected routes for auth users only
app.get("/api/protected", VerifyAccessToken, async (req, res, next) => {
	res.send(req.payload);
});

// TODO=> Chain all routes
//! ==> Auth routes
app.use("/api/auth", authRoutes.usersRouter);
//! ==> User-actions routes
app.use("/api/users", usersRouter);
//! ==> Product-actions routes
app.use("/api/products", productsRouter);
//! ==> Store-actions routes
app.use("/api/stores", storeRoutes);
//! ==> uploade routes
app.use("/api/uploade", uploadeRoutes);

// TODO=> when all routes don't match ..
app.use((req, res, next) => {
	//NOTE => use http-erros library instead
	next(createError.NotFound());
});

// TODO=> Erro0r handler middleware
app.use(errorHandler);

// TODO=> Listen to the port
//* Listen to PORT 5000 in development
//* Listen to fetched PORT in production
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`express server is running up on port ${PORT}..`.inverse.magenta);
});
