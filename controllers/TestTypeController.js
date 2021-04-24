const TestTypeModel = require("../models/TestType");

const testTypeController = {

    create: async (request, response) => {

        console.log("====== Test Type Create API =======");
        console.log("=== Body Params: ===" + (JSON.stringify(request.body)));

        const body = JSON.parse(JSON.stringify(request.body));
        if(body.name && body.time && body.price){
            try {
                let user = new TestTypeModel(body);
                await user.save();
                response
                    .status(200)
                    .json({user, msg: "Test type Created Successfully"});
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
                .json({errors: {msg: "Parameters missing"}});
        }
    },

    getAll: async (request, response) => {

        console.log("====== Test type Get All API =======");

        try {

            let type = await TestTypeModel.find();
            if(type.length){
                return response
                    .status(200)
                    .json({type, msg: "Test type Found Successfully" });
            }
            else{
                return response
                    .status(200)
                    .json({ msg: "No Test type Found" });
            }

        } catch (err) {
            console.log(err);
            response
                .status(500)
                .json({errors: {msg: err}});
        }

    }

}

module.exports = testTypeController;
