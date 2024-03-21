const bcrypt = require("bcrypt");
const { sendMail } = require("../utitility/nodeMailer.js");
const usermodel = require("../modals/usermodal");
const jwt = require('jsonwebtoken');
const {JWT_KEY} = require("../secrets")
function protectroute(req, res, next) {
    if (req.cookies.Loggedin) {
        // var decoded = jwt.verify(req.cookies.Loggedin, JWT_KEY);
        jwt.verify(req.cookies.Loggedin, JWT_KEY, function (err, decoded) {
            if (err) {
                return res.redirect("/user/login")
            }
            else {
                // console.log(decoded) // bar
                next();
            }

        });


    }
    else {
        return res.redirect("/user/login")
    }
}

//done


//done
module.exports.getuserProfile = async function getuserProfile(request, context) {
  // fetch user from mongo db
  let data = await request.json();
  console.log("mydata is", data);
  let email = data.email;
  let user = await usermodel.findOne({email:email});
  // console.log(user)
  if (user) {
    return { status: 200, jsonBody: {"message":user} };
  } else {
    return {
      status: 404,
      jsonBody: { message: "user Not found" },
    };
  }
};

module.exports.getAllusers = async function getAllusers(request, context) {
  // fetch users from mongo db

  try {
    let allusers = await usermodel.find();
    if (allusers) {
      // console.log(allusers)
      return { status: 200, jsonBody: allusers };
    } else {
      return { message: "users not found" };
    }
  } catch (err) {
    return { message: err };
  }
};
//done
module.exports.updateuser = async function updateuser(request, context) {
  let data = await request.json();
  console.log("mydata is", data);
  const email=request.query.get("email")
  // return
  try {
    
    let user = await usermodel.findOne({email:email});
    let datatobeupdated = data;
    if (user) {
      const keys = [];
      for (let key in datatobeupdated) {
        keys.push(key);
      }

      for (let i = 0; i < keys.length; i++) {
        user[keys[i]] = datatobeupdated[keys[i]];
      }

      const updateddoc = await user.save();
      return {
        status: 200,
        jsonBody: { message: "user Updated Successfully", "updateddata": updateddoc },
      };
     
    
    } else {
      return {
        status: 404,
        jsonBody: { message: "user Not found" },
      };
    }
  } catch (err) {
    return {
      status: 500,
      jsonBody: { message: err },
    };
  }
  // let user = await usermodel.findOneAndUpdate({ id:uid }, req.body)
};

module.exports.deleteuser = async function deleteuser(req, context) {
  let data = await req.json();
  console.log("mydata is", data);
  try {
    let email = data.email;
    let user = await usermodel.findOneAndDelete({ email: email });
    if (user)
      return {
        status: 200,
        jsonBody: { message: "user Deleted Successfully", "userdata": user },
      };
    else {
        return {
            status: 404,
            jsonBody: { message: "user Not found" },
          };
    }
  } catch (err) {
    return {
        status: 404,
        jsonBody: { message: "Delete Failed", "message": err },
      };
  }
};
//done
module.exports.updateProfileImage = async function updateProfileImage(
  req,
  res,
  next
) {
  if (!req.file) {
    return res.status(500).send("No image file provided.");
  } else {
    console.log(req.file.path);
    console.log(req.body);
    next();
    // res.sendFile(req.file.path)
  }
};
module.exports.Signup = async function Signup(req, context) {
  let data = await req.json();
  console.log("mydata is", data);
  try {
    let user = await usermodel.create({
      name: data.name,
      email: data.email,
      password: data.password,
    });

    if (user) {
      // sendMail("signup", user);
      return { status: 200, jsonBody: user };
    }
  } catch (err) {
    return { status: 404, jsonBody: { message: err } };
  }
};
module.exports.Login = async function Login(req, context) {
  let data = await req.json();
  console.log("mydata is", data);

  try {
    let user = await usermodel.findOne({ email: data.email }).exec();
    if (user) {
      let checkPasswordResult = await bcrypt.compare(
        data.password,
        user.password
      );

      if (checkPasswordResult) {
        return { status: 200, jsonBody: user };
      } else {
        // console.log("error in password");
        return { status: 404, jsonBody: { message: "Invalid Login/Password" } };
      }
    } else {
      return { status: 404, jsonBody: { message: "Invalid Login/Password" } };
    }
  } catch (err) {
    return { status: 500, jsonBody: { message: "Internal Error" } };
  }
};

module.exports.resetpwd = async function resetpwd(request, context) {
  let data = await request.json();
  console.log("mydata is", data);
  const token=request.query.get("token")
  console.log(token)
  // return
  try {
   
    // console.log(token)
    let { password, confirmPassword } = data;
    if(password !=confirmPassword)
    return { status: 404, jsonBody: { message: "password doesnt match" } };

    jwt.verify(token, JWT_KEY, async function (err, decoded) {
      if (err) {
        return { status: 400, jsonBody: { message: "Token expired" } };
      } else {
        console.log(decoded)
        const user = await usermodel.findOne({ resetToken: token });
        if (user == null) {
          return { status: 404, jsonBody: { message: "Invalid Token" } };
        }
        // console.log(user);
        user.password = password;
        user.resetToken = "";
        const updatedpassworddoc = await user.save();
        // console.log(updatedpassworddoc)
        return { status: 200, jsonBody: { message: "Invalid Login/Password" ,"user":updatedpassworddoc} };
      }
    });
  } catch (err) {
    return { status: 505, jsonBody: { message: "Server error" ,"error":err} };
  }
};

module.exports.forgetpassword = async function forgetpassword(request, context) {
  const email=request.query.get("email")
  console.log(email)

  try {
    const user = await usermodel.findOne({ email });

    if (user === null) {
      return { status: 404, jsonBody: { message: "Email ID not found" } };
    } else {
      const resetToken = user.createResetToken();
      console.log(resetToken);
      let resetPasswordLink = `${request.protocol}://${request.hostname}:${request.socket.localPort}/user/resetpassword/${resetToken}`;
      let obj = {
        resetPasswordLink: resetPasswordLink,
        email: email,
      };
     
      sendMail("resetpassword", obj);
      return { status: 200, jsonBody: { message: "Mail has been sent to the registered mail" } };
    }
  } catch (err) {
    return { status: 500, jsonBody: { message: "Internal Error" } };
  }
};