// const dotenv = require("dotenv").config();
// const mongoose = require("mongoose");

// const DB_options = {
// 	useNewUrlParser: true,
// 	useUnifiedTopology: true,
// };

// const DB_URI = process.env.DB_URI;

// // TODO=> connect to mongodb cloud
// const DB_URI_1 = process.env.DB_URI_1;
// const DB_URI_2 = process.env.DB_URI_2;
// const conn1 = mongoose.createConnection(DB_URI_1, DB_options, () => {
// 	console.log(`Cluster 1  is connected successfully :D`.inverse.green);
// });
// const conn2 = mongoose.createConnection(DB_URI_2, DB_options, () => {
// 	console.log(`Cluster 2  is connected successfully :D`.inverse.green);
// });
// const DB_URI_3 = process.env.DB_URI_3;
// const conn3 = mongoose.createConnection(DB_URI_3, DB_options, () => {
// 	console.log(`Cluster 3  is connected successfully :D`.inverse.green);
// });

// module.exports = {
// 	conn1,
// 	conn2,
// 	conn3,
// };
