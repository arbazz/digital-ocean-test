const CustomOffer = require("../models/CustomOffer");

var ObjectId = require('mongodb').ObjectId;

const CustomOFferController = {

    getAll: async (request, response) => {

        console.log("====== CustomOffer Get All API =======");

        try {

            let data = await CustomOffer.find();
            if (data.length) {
                return response
                    .status(200)
                    .json({ data, msg: "CustomOFfer Found Successfully" });
            }
            else {
                return response
                    .status(200)
                    .json({ msg: "No CustomOFfer Found" });
            }

        } catch (err) {
            console.log(err);
            response
                .status(500)
                .json({ errors: { msg: err } });
        }

    },

    AddOffer: async (req, res) => {
        console.log("====Adding new Custom Offer");

        const body = req.body;

        const data = {
            totalQuantity: body.quantity,
            quantity: body.quantity,
            lastname: body.lastname,
            firstname: body.firstname,
            email: body.email,
            testType: body.testType,
        };

        try {
            if (data.totalQuantity && data.lastname && data.firstname && data.email && data.testType) {
                let offer = new CustomOffer(data);
                await offer.save();
                offer.promo = "PR-" + String(offer._id).substr(String(offer._id).length - 8);
                const newOffer = await CustomOffer.findOneAndUpdate(
                    { _id: offer._id },
                    { $set: { promo: offer.promo } },
                    { new: true }
                )
                console.log(newOffer)
                res
                    .status(200)
                    .json({ offer: newOffer, msg: "offer added Successfully" });
            } else {
                res
                    .status(400)
                    .json({ errors: { msg: "Parameters missing" } });
            }
        } catch (err) {
            console.log(err);
            res.status(500)
                .json({ errors: { msg: err } });
        }
    },

    verifyId: async (request, response) => {

        console.log("====== Verifying id API =======");
        // const id = JSON.parse(body)
        try {
            const body = request.body

            console.log(body._id)
            let id = body._id
            let data = await
                CustomOffer.findOne({ 'promo': id }, (error, doc) => {

                });
            if (data._id) {
                return response
                    .status(200)
                    .json({ data, msg: "Id Found Successfully" });
            }
            else {
                return response
                    .status(200)
                    .json({ msg: "No Id Found" });
            }

        } catch (err) {
            console.log(err);
            response
                .status(500)
                .json({ errors: { msg: err } });
        }

    },

    addPatient: async (req, res) => {
        try {
            console.log("====== update conunt =======");
            const body = req.body
            let id = body._id
            const data = await CustomOffer.findOneAndUpdate(
                { _id: id },
                { $inc: { quantity: -1 } },
                { new: true }
            );
            if (data._id) {
                return res
                    .status(200)
                    .json({ data, msg: "updated" });
            }
            else {
                return res
                    .status(200)
                    .json({ msg: "Failed to update" });
            }
        } catch (err) {
            console.log(err);
            res
                .status(500)
                .json({ errors: { msg: err } });
        }
    },
    getById: async (req, res) => {
        try {
            console.log("====== update conunt =======");
            const body = req.body
            let id = body._id
            const data = await CustomOffer.findOne(
                { _id: id }
            );
            if (data._id) {
                return res
                    .status(200)
                    .json({ data, msg: "found" });
            }
            else {
                return res
                    .status(200)
                    .json({ msg: "Failed to found" });
            }
        } catch (err) {
            console.log(err);
            res
                .status(500)
                .json({ errors: { msg: err } });
        }
    }
};


module.exports = CustomOFferController;
