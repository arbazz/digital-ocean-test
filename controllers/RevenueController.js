const RevenueModel = require("../models/Revenue");
const helper = require("../helpers/helperService");

const revenueController = {

    getTotalRevenue: async (request, response) => {

        console.log("======Get Total Revenue API =======");

            try {
                let totalRevenue;
                let startDate = new Date();
                let endDate = helper.nextDate(startDate);
                let thisMonthDate = helper.getThisMonthFirstDate(startDate);
                let nextMonthDate = helper.getNextMonthFirstDate(startDate);

                console.log("startDate === " + startDate + " endDate ====== " + endDate);
                console.log("thisMonthDate === " + thisMonthDate + " nextMonthDate ====== " + nextMonthDate);

                totalRevenue.DailyRevenue  = await RevenueModel.find({ "createdDate" : {"$gte" : startDate , "$lt" : endDate}}).count().exec();
                totalRevenue.weeklyRevenue  = await RevenueModel.find({ "createdDate" : {$gte: new Date(new Date() - 7 * 60 * 60 * 24 * 1000)} }).count().exec();
                totalRevenue.monthlyRevenue  = await RevenueModel.find({ "createdDate" : {"$gte": thisMonthDate, "$lt": nextMonthDate }}).count().exec();

                return response
                    .status(200)
                    .json({totalRevenue, msg: "Total Revenue found successfully"});
            } catch (err) {
                console.log(err);
                response
                    .status(500)
                    .json({errors: {msg: err}});
            }

    },

    getMonthlyRevenue: async (request, response) => {

        console.log("======Get Total Revenue API =======");

            try {
                let totalRevenue;
                let startDate = new Date();
                let endDate = helper.nextDate(startDate);
                let thisMonthDate = helper.getThisMonthFirstDate(startDate);
                let nextMonthDate = helper.getNextMonthFirstDate(startDate);

                console.log("startDate === " + startDate + " endDate ====== " + endDate);
                console.log("thisMonthDate === " + thisMonthDate + " nextMonthDate ====== " + nextMonthDate);

                totalRevenue.DailyRevenue  = await RevenueModel.find({ "createdDate" : {"$gte" : startDate , "$lt" : endDate}}).count().exec();
                totalRevenue.weeklyRevenue  = await RevenueModel.find({ "createdDate" : {$gte: new Date(new Date() - 7 * 60 * 60 * 24 * 1000)} }).count().exec();
                totalRevenue.monthlyRevenue  = await RevenueModel.find({ "createdDate" : {"$gte": thisMonthDate, "$lt": nextMonthDate }}).count().exec();

                return response
                    .status(200)
                    .json({totalRevenue, msg: "Total Revenue found successfully"});
            } catch (err) {
                console.log(err);
                response
                    .status(500)
                    .json({errors: {msg: err}});
            }

    }

}

module.exports = revenueController;

