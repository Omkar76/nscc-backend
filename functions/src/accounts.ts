import * as functions from "firebase-functions";
import * as express from "express";
import * as admin from "firebase-admin";
import * as acc from "./accounts";

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: false}));

admin.initializeApp();

app.get("/:uid", async (req, res)=>{
  const uid = req.params.uid;
  try {
    const user = await admin.firestore()
        .collection("accounts")
        .doc(uid)
        .get();

    if (!user.exists) {
      return res.json({success: false, message: "User does not exist"});
    }
    return res.json(user.data());
  } catch (err) {
    console.error(err);
    return res.json({success: false, message: err});
  }
});

app.patch("/:uid", async (req, res)=>{
  const uid = req.params.uid;

  try {
    await admin.firestore().collection("accounts")
        .doc(uid)
        .update(req.body);

    res.json({success: true, message: "Account updated"});
  } catch (err) {
    res.json({success: false, message: err});
  }
});

export const saveNewUserToDb = functions.auth.user().onCreate(async (user) => {
  functions.logger.info("New user created!", user);
  return admin.firestore().collection("accounts")
      .doc(user.uid)
      .create({name: user.displayName || "Anonymous", email: user.email,
        prn: null, codingProfiles: [], resumeLink: null});
});

export const accountsHandler = app;
