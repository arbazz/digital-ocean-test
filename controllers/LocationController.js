const LocationModel = require("../models/Location");
const UserModel = require("../models/User");

const NumberGeneratorModel = require("../models/NumberGenerator");
const JobIdNumberGeneratorModel = require("../models/JobIdNumberGenerator");
const helper = require("../helpers/helperService");

const locationController = {

    create: async (request, response) => {

        console.log("====== Location Create API =======");
        console.log("=== Body Params: ===" + (JSON.stringify(request.body)));

        const body = JSON.parse(JSON.stringify(request.body));
        if(body.name){
            try {
                let user = new LocationModel(body);
                await user.save();
                response
                    .status(200)
                    .json({user, msg: "Location Created Successfully"});
            } catch (err) {
                console.log(err);
                response
                    .status(500)
                    .json({errors: {msg: err}});
            }
        }
        else{
            response
                .status(400)
                .json({errors:{msg: "Parameters missing"}});
        }
    },

    generateNumber: async (request, response) => {

        console.log("====== generateNumber Create API =======");
        console.log("=== Body Params: ===" + (JSON.stringify(request.body)));

        const body = JSON.parse(JSON.stringify(request.body));
        if(body.name){
            try {
                let doc = new NumberGeneratorModel(body);
                await doc.save();
                response
                    .status(200)
                    .json({doc, msg: "generate Number Created Successfully"});
            } catch (err) {
                console.log(err);
                response
                    .status(500)
                    .json({errors: {msg: err}});
            }
        }
        else{
            response
                .status(400)
                .json({errors:{msg: "Parameters missing"}});
        }
    },

    getGeneratedNumber: async (request, response) => {

        console.log("====== generate Number  API =======");

        let numberDoc = await NumberGeneratorModel.findOneAndUpdate({"name": "uuid"}, {"$inc": {"value": 1}} , {new :true} );
        console.log(numberDoc.value);
        let value = numberDoc.value;
        let sequenceNumber = (value+'').padStart(4,'0');
        console.log("sequenceNumber ====" + sequenceNumber );
        let uuid = helper.dateFormat() + '-' + sequenceNumber;
        console.log(uuid);
        response.send(uuid);
    },

    generatedNumberJobID: async (request, response) => {

        console.log("====== generate Number  API =======");

        let data = new JobIdNumberGeneratorModel({jobId:"jobId" , value:1});
        await data.save();

        response.send(data);
    },

    getAll: async (request, response) => {
        console.log("====== Location Get All API =======");

        try {

            let location = await LocationModel.find();
            if(location.length){
                return response
                    .status(200)
                    .json({location, msg: "Location Found Successfully" });
            }
            else{
                return response
                    .status(200)
                    .json({ msg: "No Location Found" });
            }

        } catch (err) {
            console.log(err);
            response
                .status(500)
                .json({errors: {msg: err}});
        }

    },

    getLocationByJodId: async (request, response) => {
        console.log("====== Location Get Location By Job Id API =======");
        console.log("=== Body Params: ===" + (JSON.stringify(request.body)));

        const body = JSON.parse(JSON.stringify(request.body));
        if(body.jobId) {
            try {
                 // get locations using jobId from user model
                let userLocations = await UserModel.findOne({jobId : body.jobId} , {locations:1});
                 console.log("this location =>",userLocations);
                let locations =[];
                userLocations = userLocations.locations;
                userLocations.map(loc=>{
                    locations.push(loc);
                });

                let location = await LocationModel.find({_id : {$in : locations}});
                if (location.length) {
                    return response
                        .status(200)
                        .json({location, msg: "Location Found Successfully"});
                } else {
                    return response
                        .status(200)
                        .json({msg: "No Location Found"});
                }

            }
            catch (err) {
                console.log(err);
                response
                    .status(500)
                    .json({errors: {msg: err}});
            }
        }
        else{
            response
                .status(400)
                .json({errors:{msg: "Parameters missing"}});
        }

    }

}

module.exports = locationController;
