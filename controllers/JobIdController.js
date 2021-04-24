const JobIdModel = require("../models/JobId");
const UserModel = require("../models/User");
const JobIdNumberGeneratorModel = require("../models/JobIdNumberGenerator");

const jobIdController = {
        // for testing
    // create: async (request, response) => {
    //
    //     console.log("====== JobId Create API =======");
    //     console.log("=== Body Params: ===" + (JSON.stringify(request.body)));
    //
    //         try {
    //             let numberDoc = await JobIdNumberGeneratorModel.findOneAndUpdate({"jobId": "jobId"}, {"$inc": {"value": 1}} , {new :true} );
    //             let value = numberDoc.value;
    //             let jobId = (value+'').padStart(3,'0');
    //             console.log("jobId ===== " + jobId);
    //
    //             let data = {
    //                 user: "6020e954b8e48a26bcd52872",
    //                 value: jobId
    //             }
    //
    //             data = new JobIdModel(data);
    //             await data.save();
    //             response
    //                 .status(200)
    //                 .json({data, msg: "JobId Created Successfully"});
    //         } catch (err) {
    //             console.log(err);
    //             response
    //                 .status(500)
    //                 .json({errors: {msg: err}});
    //         }
    // },

    getAll: async (request, response) => {

        console.log("====== JobId Get All API =======");

        try {

            let data = await JobIdModel.find();
            if(data.length){
                return response
                    .status(200)
                    .json({data, msg: "JobId Found Successfully" });
            }
            else{
                return response
                    .status(200)
                    .json({ msg: "No JobId type Found" });
            }

        } catch (err) {
            console.log(err);
            response
                .status(500)
                .json({errors: {msg: err}});
        }

    }

}

module.exports = jobIdController;
