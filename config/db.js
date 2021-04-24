const mongoose = require("mongoose");
const CONSTANT = require("../config/constants");

// const dbUrl = "mongodb+srv://Artin:eULcce6Ja6b6HH!@cluster0.td6bj.mongodb.net/brain?retryWrites=true&w=majority";
// const dbUrl = "mongodb+srv://amina-yousuf:muryum19@realmcluster.fkouc.mongodb.net/brain?retryWrites=true&w=majority";
const dbUrl = CONSTANT.mongoURI;

const connectDB = async () => {
  try {
    await mongoose.connect(dbUrl, {
      // added to avoid bugs
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });

    console.log("MongoDB is connected!");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
