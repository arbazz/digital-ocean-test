const EmployeeTypeModel = require("../models/EmployeeType");

const employeeTypeController = {

    create: async (request, response) => {

        console.log("====== Type Create API =======");
        console.log("=== Body Params: ===" + (JSON.stringify(request.body)));

        const body = JSON.parse(JSON.stringify(request.body));
        if(body.name){
            try {
                let user = new EmployeeTypeModel(body);
                await user.save();
                response
                    .status(200)
                    .json({user, msg: "Employee type Created Successfully"});
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

        console.log("====== Employee type Get All API =======");

        try {

            let type = await EmployeeTypeModel.find();
            if(type.length){
                return response
                    .status(200)
                    .json({type, msg: "Employee type Found Successfully" });
            }
            else{
                return response
                    .status(200)
                    .json({ msg: "No Employee type Found" });
            }

        } catch (err) {
            console.log(err);
            response
                .status(500)
                .json({errors: {msg: err}});
        }

    }

}

module.exports = employeeTypeController;
