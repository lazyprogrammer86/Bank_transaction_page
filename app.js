//jshint esversion:6
////////////////////////required from npm///////////////////////
require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const uuid = require("uuid");
const app = express();


///////////////seting ejs bodyparser and public file///////////////////
app.use(bodyParser.urlencoded({
    extended: true
}));
app.set("view engine", "ejs");
app.use(express.static("public"));
//////////////////mongoDB connection////////////////
mongoose.connect("mongodb://localhost:27017/bankingDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
////////////////mongoose models///////////////////////
const accountSchema = new mongoose.Schema({
    fname: String,
    lname: String,
    accNumber: String,
    email: String,
    balance: Number
});
const Account = new mongoose.model("Account", accountSchema);

const sfSchema = new mongoose.Schema({
    balance: String
});
const Sfacc = new mongoose.model("Sfacc", sfSchema);

const transactionSchema = mongoose.Schema({
    accNumber: String,
    fname: String,
    lname: String,
    email: String,
    amount: Number
});
const History = new mongoose.model("History", transactionSchema);

const bankSchema = new mongoose.Schema({
    sf: sfSchema,
    acc: [accountSchema],
    transaction: [transactionSchema]
});
const Bank = new mongoose.model("Bank", bankSchema);


//////////////////get requests////////////////////
app.get("/", (req, res) => {
    Bank.find({}, (err, foundAccount) => {
        if (err) {
            console.log(err);
            res.writeHead(301, {
                Location: 'http://google.com'
            });
            res.end();
        } else {
            res.render("accounts", {
                title: "Accounts Page",
                sfbal: foundAccount[0].sf.balance,
                account: foundAccount[0].acc
            });
        }
    })

});
app.get("/pay", (req, res) => {
    Bank.find({}, (err, foundBank) => {

        if (err) {
            console.log(err);
        } else if (foundBank) {
            res.render("pay", {
                title: "Payment-Gateway",
                paywarn: "",
                avblnce:foundBank[0].sf.balance,
                details: foundBank[0].acc
            });
        }
    });

});

app.get("/history", (req, res) => {
    res.render("history", {
        title: "Transaction-History"
    });
});

////////////////////post requests//////////////////

app.post("/pay",(req,res)=>{
    const accNUm= req.body.accNum;
    const amt = Number(req.body.amount);
    let upsfamt=0;
    let upusramt = 0;
    Bank.findOne({},(err,foundBank)=>{
        if(err){
            console.log(err);
        }else if(foundBank){
            foundBank.sf.balance - amt;
            foundBank.save();
        }
        // console.log(foundBank);
    });
});
/////////////////////test code///////////////////

function errorHandler(err, req, res, next) {
    if (err) {
        console.log(err);
        res.send(err);
    }
}

app.use(errorHandler);

////////////////port connection///////////////////////
app.listen(3000, () => {
    console.log("listening on port 3000");
});
