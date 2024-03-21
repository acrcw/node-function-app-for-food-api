const bcrypt = require("bcrypt");
const usermodel = require("../modals/usermodal");
module.exports.setcookies = function setcookies(req, res) {
  // res.setHeader("set-cookie", "isLoggedin=false")
  res.cookie("isLoggedin", false, {
    maxAge: 1000 * 60,
    secure: true,
    httpOnly: true,
  }); // httponly to prevent acess from frontend
  res.send("cookie has been set");
};
module.exports.getcookies = function getcookies(req, res) {
  let cookies = req.cookies;
  console.log(cookies);
  res.send("cookies received");
};
//done
module.exports.postuser = function postuser(request, context) {
  console.log(request);
  users = req.body;
  res.json({
    message: "data recieved",
    user: req.body,
  });
};

//done
module.exports.getuserProfile = async function getuserProfile(req, res) {
  // fetch user from mongo db
  let uid = req.id;
  let user = await usermodel.findById(uid);
  // console.log(user)
  if (user) {
    res.json({ message: "user data found", data: user });
  } else {
    res.status(403).json({ message: "user not found" });
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
module.exports.updateuser = async function updateuser(req, res) {
  // console.log('req body data', req.body);
  //update data in users object
  try {
    let uid = req.params.id;
    // console.log(uid);
    let user = await usermodel.findById(uid);
    let datatobeupdated = req.body;
    if (user) {
      const keys = [];
      for (let key in datatobeupdated) {
        keys.push(key);
      }

      for (let i = 0; i < keys.length; i++) {
        user[keys[i]] = datatobeupdated[keys[i]];
      }

      const updateddoc = await user.save();
      res.json({
        message: "user updated",
        user: updateddoc,
      });
      // res.redirect("/user/login")
    } else {
      res.json({
        message: "user not found",
      });
    }
  } catch (err) {
    res.json({
      message: err,
    });
  }
  // let user = await usermodel.findOneAndUpdate({ id:uid }, req.body)
};

module.exports.deleteuser = async function deleteuser(req, context) {
  let data = await req.json();
  console.log("mydata is", data);
  try {
    let uid = data.id;
    let user = await usermodel.findOneAndDelete({ _id: uid });
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
