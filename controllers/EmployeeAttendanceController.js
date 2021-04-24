const EmployeeAttendanceModel = require("../models/EmployeeAttendance");
const EmployeeModel = require("../models/Employee");
const UserModel = require("../models/User");
const PatientModel = require("../models/Patient");
const helper = require("../helpers/helperService");

const locationController = {

    checkIn: async (request, response) => {

        console.log("====== CheckIn API =======");
        console.log("=== Body Params: ===" + (JSON.stringify(request.body)));

        const body = JSON.parse(JSON.stringify(request.body));
        if(body.checkInDate && body.employeeId){
            try {
                // check if checkIn mark already
                let startDate = Date.now();
                let endDate = helper.nextDate(startDate);
                let attendance  = await EmployeeAttendanceModel.findOne({ employeeId : body.employeeId, "createdDate" : {"$gte" : startDate , "$lt" : endDate}}).exec();
                if(!attendance){
                    let employeeAttendance = {
                        checkInDate : body.checkInDate,
                        employeeId : body.employeeId,
                        status:"CheckIn"
                    }
                    let data = new EmployeeAttendanceModel(employeeAttendance);
                    await data.save();
                    response
                        .status(200)
                        .json({data, msg: "CheckIn mark Successfully"});
                }
                else{
                    response
                        .status(400)
                        .json({ msg: "CheckIn already mark"});
                }
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

    checkOut: async (request, response) => {

        console.log("====== CheckOut API =======");
        console.log("=== Body Params: ===" + (JSON.stringify(request.body)));

        const body = JSON.parse(JSON.stringify(request.body));
        if(body.checkOutDate && body.employeeId  && body.id){
            try {
                let doc =  await EmployeeAttendanceModel.findOne({_id: body.id});
                if(doc){
                    if(doc.status == 'CheckOut'){
                        response
                            .status(400)
                            .json({msg: "CheckOut mark already"});
                    }
                    else{
                        let checkInTime = doc.checkInDate;
                        let checkOutTime = body.checkOutDate;
                        let hours = Math.abs(checkOutTime - checkInTime) / 36e5;
                        hours = hours - doc.breakHours;
                        let employeeAttendance = {
                            checkOutDate : body.checkOutDate,
                            totalHours : hours,
                            status:'CheckOut'
                        }

                        let updated =  await EmployeeAttendanceModel.findOneAndUpdate({_id: body.id},
                            {  status:'CheckOut' , checkOutDate : body.checkOutDate,  totalHours : hours },  {new: true} );

                        response
                            .status(200)
                            .json({updated, msg: "CheckOut mark Successfully"});
                    }
                }
                else{
                    response
                        .status(400)
                        .json({errors:{msg: "Invalid Checkout"}});
                }
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

    breakIn: async (request, response) => {

        console.log("====== BreakIn API =======");
        console.log("=== Body Params: ===" + (JSON.stringify(request.body)));

        const body = JSON.parse(JSON.stringify(request.body));

        if(body.breakInDate && body.employeeId  && body.id){
            try {
                let doc =  await EmployeeAttendanceModel.findOne({_id: body.id});
                if(doc){
                    if(doc.status == 'BreakIn' ){
                        response
                            .status(400)
                            .json({errors:{msg: "BreakIn already mark"}});
                    }
                    else{

                        let updated =  await EmployeeAttendanceModel.findOneAndUpdate({_id: body.id},
                            {  status:'BreakIn', $push: { breakInDate: [body.breakInDate] } },  {new: true});
                        response
                            .status(200)
                            .json({updated, msg: "BreakIn mark Successfully"});
                    }
                }
                else{
                    response
                        .status(400)
                        .json({errors:{msg: "Invalid BreakIn"}});
                }
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

    breakOut: async (request, response) => {

        console.log("====== BreakOut API =======");
        console.log("=== Body Params: ===" + (JSON.stringify(request.body)));

        const body = JSON.parse(JSON.stringify(request.body));

        if(body.breakOutDate && body.employeeId  && body.id){
            try {
                let doc =  await EmployeeAttendanceModel.findOne({_id: body.id});
                if(doc){
                    if(doc.status == 'BreakOut' ){
                        response
                            .status(400)
                            .json({errors:{msg: "BreakOut already mark"}});
                    }
                    else{
                        // calculate break hours
                        let breakInDate = doc.breakInDate.pop();
                        let breakOutDate = body.breakOutDate;
                        let breakHours = Math.abs(breakOutDate - breakInDate) / 36e5;
                        if(doc.breakHours){
                            breakHours = breakHours +doc.breakHours;
                        }

                        let updated =  await EmployeeAttendanceModel.findOneAndUpdate({_id: body.id},
                            {  status:'BreakOut' , breakHours: breakHours ,$push: { breakOutDate: [body.breakOutDate] } },  {new: true} );
                        response
                            .status(200)
                            .json({updated, msg: "BreakOut mark Successfully"});
                    }
                }
                else{
                    response
                        .status(400)
                        .json({errors:{msg: "Invalid BreakOut"}});
                }
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

    getTodayAttendance :async (request, response) =>{

        console.log("====== Today Attendance API =======");
        console.log("=== Request Params: ===" + (JSON.stringify(request.params)));



        let employeeId= request.params.id;
        let startDate = new Date();
        startDate.setHours(0);
        startDate.setMinutes(0);
        startDate.setSeconds(0);
        let endDate = helper.nextDate(startDate)
        endDate = new Date(endDate);
        endDate.setHours(0);
        endDate.setMinutes(0);
        endDate.setSeconds(0);

        console.log("startDate ===  " + startDate + " endDate =======  " + endDate)
        let attendance  = await EmployeeAttendanceModel.findOne({ employeeId : employeeId, "createdDate" : {"$gte" : startDate , "$lt" : endDate}}).exec();
        console.log(attendance);
        if(attendance){
            response
                .status(200)
                .json({attendance, msg: "Employee attendance found successfully"});
        }
        else{
            response
                .status(400)
                .json({msg: "No Employee attendance found"});
        }
    },

    getMonthlyAttendance :async (request, response) =>{

        console.log("====== Monthly Attendance API =======");
        const body = JSON.parse(JSON.stringify(request.body));

        if (body.month && body.employeeId) {
            try{
                let employeeId= body.employeeId ;
                let date = new Date();
                let month = Number(body.month);
                let nextmonth = Number(month+1);
                if (nextmonth < 10) {
                    nextmonth = `0${nextmonth}`;
                }
                if (month < 10) {
                    month = `0${month}`;
                }

                let startDate = `${date.getFullYear()}-${month}-01`;
                let endDate = `${date.getFullYear()}-${nextmonth}-01`;
                console.log("startDate ==== "+ startDate + ' ====== endDate===== '+ endDate );

                let attendance  = await EmployeeAttendanceModel.find({ employeeId : employeeId, "createdDate" : {"$gte" : startDate , "$lt" : endDate}}).exec();
                if(attendance){
                    response
                        .status(200)
                        .json({attendance, msg: "Employee attendance found successfully"});
                }
                else{
                    response
                        .status(400)
                        .json({msg: "No Employee attendance found"});
                }
            } catch (err) {
                console.log(err);
                response
                    .status(500)
                    .json({errors: {msg: err}});
            }
        }
        else {
            response
                .status(500)
                .json({errors: {msg: "parameters are missing"}});
        }
    },

    getEmployeeHours: async (request, response) => {

        console.log("====== Get Emp hours API =======");
        console.log("=== Body Params: ===" + (JSON.stringify(request.body)));

        const body = JSON.parse(JSON.stringify(request.body));

        if (body.startDate && body.endDate ) {
            try {
                let startDate = body.startDate;
                let endDate = body.endDate;

                console.log("startDate === " + startDate + " endDate ====== " + endDate);

                let user = await UserModel.findById(request.user.id);
                console.log("Admin Type is ====== "+ user.type);
                console.log("Admin Id is ====== "+ user._id);

                let allEmployees;
                if(user.type == "Super Admin"){
                     allEmployees = await EmployeeModel.find({type: {$ne: '602217d598d003000450cf55'} } );
                }
                else{
                     allEmployees = await EmployeeModel.find({type: {$ne: '602217d598d003000450cf55'} , createdBy: user._id } );
                }

                if(allEmployees.length){
                    let data = await Promise.all(
                        allEmployees.map(async emp => {
                            let name = emp.firstname + ' '+ emp.lastname;
                            let employee = { name: name , id: emp._id };
                            let hours  = await EmployeeAttendanceModel.find({employeeId : emp._id ,"createdDate" : {"$gte" : startDate , "$lte" : endDate }}).exec();
                            return { employee  : employee , hours: hours };
                        })
                    );
                    return response
                        .status(200)
                        .json({data, msg: "Employee Hours Found" });
                }
                else{
                    return response
                        .status(400)
                        .json({ msg: "No Employee Found" });
                }

            } catch (err) {
                console.log(err);
                response
                    .status(500)
                    .json({errors: {msg: err}});
            }
        }
        else {
            response
                .status(500)
                .json({errors: {msg: "parameters are missing"}});
        }
    },

    getEmployeePerformance: async (request, response) => {

        console.log("====== Get Employee Performance  API =======");
        console.log("=== Body Params: ===" + (JSON.stringify(request.body)));

        const body = JSON.parse(JSON.stringify(request.body));

        if (body.startDate && body.endDate ) {
            try {
                let startDate = body.startDate;
                let endDate = body.endDate;

                console.log("startDate === " + startDate + " endDate ====== " + endDate);

                let user = await UserModel.findById(request.user.id);
                console.log("Admin Type is ====== "+ user.type);
                console.log("Admin Id is ====== "+ user._id);

                let allEmployees;
                if(user.type == "Super Admin"){
                    allEmployees = await EmployeeModel.find({type: {$ne: '602217d598d003000450cf55'} } );
                }
                else{
                    allEmployees = await EmployeeModel.find({type: {$ne: '602217d598d003000450cf55'} , createdBy: user._id } );
                }

                if(allEmployees.length){
                    let data = await Promise.all(
                        allEmployees.map(async emp => {
                            let name = emp.firstname + ' '+ emp.lastname;
                            let employee = { name: name , id: emp._id, location: emp.location };
                            let TotalCreatedPatients  = await PatientModel.find({createdBy : emp._id ,"createdDate" : {"$gte" : startDate , "$lte" : endDate }}).exec();
                            let TotalTestedPatients  = await PatientModel.find({testedBy : emp._id ,"createdDate" : {"$gte" : startDate , "$lte" : endDate }}).exec();
                            return { employee  : employee , TotalCreatedPatient: TotalCreatedPatients  , TotalTestedPatient: TotalTestedPatients };
                        })
                    );
                    return response
                        .status(200)
                        .json({data, msg: "Employee Performance Found" });
                }
                else{
                    return response
                        .status(200)
                        .json({ msg: "No Employee Found" });
                }
            } catch (err) {
                console.log(err);
                response
                    .status(500)
                    .json({errors: {msg: err}});
            }
        }
        else {
            response
                .status(500)
                .json({errors: {msg: "parameters are missing"}});
        }
    },

}

module.exports = locationController;
