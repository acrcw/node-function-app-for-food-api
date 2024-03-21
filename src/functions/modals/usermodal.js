const mongoose = require("mongoose");
const emailval = require("email-validator");
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken');
const { JWT_KEY } = require("../secrets.js")
mongoose.connect("mongodb+srv://joban:yzSJge5kJQHr4mw5@cloudcluster.qvkdum5.mongodb.net/?retryWrites=true&w=majority").then(function (db) {
    console.log("db connected");
    // console.log(db);
}).catch(function (err) {
    console.log(err);
})
const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: [true, "Email Already In Use"],
        validate: function () {
            return emailval.validate(this.email)
        }
    },
    password: {
        type: String,
        required: true,
        minLength: [8, "Password min length is 8"]
    },
    role: {
        type: String,
        enum: ['admin', 'user', 'owner', 'delivery'],
        default: "user"
    },
    resetToken: {
        type: String,
        default:""
    }
}

)


//hooks
//pre hook  // fires before save event
// userSchema.pre("save", function () {
//     console.log("before savinf in db", this)
// })
//post hook // fires after save event
// userSchema.post("save", function (doc) {
//     console.log("after saving in db", doc)
// })


userSchema.pre('save', function (next) { // pre hook encrypts the password
   
    if (this.resetToken != "") {
        // Do not proceed with the hook, return early
        return next();
    }

    bcrypt.hash(this.password, 10, (err, hash) => {
        if (err) {
            console.error(err);
            return next(err);
        }

        this.password = hash;
        // console.log(this.password);
        next();
    });
});
//reset token
userSchema.methods.createResetToken = function () {
    
    console.log("creating token")
    let token = jwt.sign({ payload: this.email }, JWT_KEY, { expiresIn: 5 * 60 });
    this.resetToken = token
    this.save();
    return this.resetToken;
}


//model

const usermodel = mongoose.model("usermodel", userSchema)
module.exports = usermodel