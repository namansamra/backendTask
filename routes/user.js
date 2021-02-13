const Router = require("express").Router;
const db = require("../db");
const mongodb = require("mongodb");
const ObjectId = mongodb.ObjectId;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const validate = require("../validator/validator");
const router = Router();
const { body } = require("express-validator");
const phone = require('phone')
const createToken = (payload) => {
  return jwt.sign(payload, "secret", { expiresIn: "5h" });
};



router.get("/get", async (req, res, next) => {
  try {
    let users = await db.getDb().db().collection("user").find().toArray();
    res.status(200).json({ status: true, data: users });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false,
      errors: [
        {
          message: "Something went wrong.",
        },
      ],
    });
  }
});
router.patch("/get/:_id", async (req, res, next) => {
  console.log(req.params._id)
  const schoolId =new ObjectId(req.body.schoolId);
  try {
    let user = await db
      .getDb()
      .db()
      .collection("user")
      .update(
        { _id: new ObjectId( req.params._id )},
        {
          $set: {
            schoolId: schoolId,
          },
        },
        function (err, res) {
          console.log(res.message)
          if (err) throw err;
        }
      );
    res.status(200).json({ status: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false,
      errors: [
        {
          message: "Something went wrong.",
        },
      ],
    });
  }
});

router.post(
  "/signin",
  validate([body("email").isEmail(), body("password").isLength({ min: 6 })]),
  async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    try {
      const user = await db
        .getDb()
        .db()
        .collection("user")
        .findOne({ email: email });

      if (!user) throw Error();
      const matched = await bcrypt.compare(password, user.password);

      if (matched) {
        console.log("authentication successful");
        const token = createToken({});
        delete user.password;
        res.status(200).json({
          status: true,
          content: [
            {
              data: user,
              token: token,
            },
          ],
        });
      } else {
        throw Error();
      }
    } catch (err) {
      console.log(err);
      res.status(401).json({
        status: false,
        errors: [
          {
            message: "Something went wrong.",
          },
        ],
      });
    }
  }
);

router.post(
  "/signup",
  validate([
    body("first_name").isString().notEmpty(),
    body("last_name").isString().notEmpty(),
    body("mobile").notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
  ]),
  async (req, res, next) => {
    const { first_name, last_name, mobile, email, password } = req.body;
    try {
      let user = await db
        .getDb()
        .db()
        .collection("user")
        .findOne({ $or: [{ email: email }, { mobile: mobile }] });
      if (user) {
        //User already exists
        console.log(user);
        throw Error();
      }
      const hashedPW = await bcrypt.hash(password, 12);
      const mobileRes= phone(mobile);
      if (mobileRes.length == 0) {
        throw Error();
      }
      const nUser = await db.getDb().db().collection("user").insertOne({
        first_name: first_name,
        last_name: last_name,
        email: email,
        mobile: mobileRes[0],
        password: hashedPW,
        created: new Date(),
        updated: null,
      });

      // console.log(nUser.ops);

      const payload = {
        user: nUser.ops[0],
      };
      console.log(payload);
      const token = createToken(payload);
      res.status(201).json({ status: true });
    } catch (err) {
      console.log(err);
      res.status(401).json({
        status: false,
        errors: [
          {
            message: "Something went wrong.",
          },
        ],
      });
    }
  }
);


module.exports = router;
