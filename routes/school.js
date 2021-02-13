const Router = require("express").Router;
const mongodb = require("mongodb");
const db = require("../db");
const ObjectId = mongodb.ObjectId;
const validate = require("../validator/validator");
const { body } = require("express-validator");
const router = Router();
let guid = () => {
  let s4 = () => {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  };
  return "SCH-" + s4().toUpperCase();
};

router.get("/get", async (req, res, next) => {
  try {
    const schools = await db.getDb().db().collection("school").find().toArray();
    res.status(200).json({ status: true, content: { data: schools } });
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
router.get("/:_id/students", async (req, res, next) => {
  const id =new ObjectId(req.params._id);
  try {
    const students = await db
      .getDb()
      .db()
      .collection("user")
      .find({ schoolId: id })
      .toArray();
    res.status(200).json({ status: true, content: { data: students } });
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
  "/:_id",
  validate([
    body("name").isString().notEmpty(),
    body("city").isString().notEmpty(),
    body("state").isString().notEmpty(),
    body("country").isString().notEmpty(),
  ]),
  async (req, res, next) => {
    const { name, city, state, country } = req.body;
    const newSchool = {
      _id: new ObjectId(req.params._id),
      public_id: guid(),
      name: name,
      city: city,
      state: state,
      country: country,
      created: new Date(),
      updated: null,
    };
    try {
      const nSchool = await db
        .getDb()
        .db()
        .collection("school")
        .insertOne(newSchool);

      res.status(201).json({ status: true });
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
  }
);

module.exports = router;
