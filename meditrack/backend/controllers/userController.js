/* eslint-disable no-unused-vars */
const { Medication, Patient, User } = require('../models/models');

const loginController = {
  // Create a new user in the Database
  // Their information will be sent in the request body
  // This should send the created user
  async createUser(req, res, next) {
    const { firstName, lastName, email, password } = req.body;
    console.log(req.body);
    console.log('createUser fired');
    if (!firstName || !lastName || !email || !password)
      return res.status(400).json({ error: 'Did not receive first name and/or last name'});

      // const userExists = await User.findOne({ email })



      User.findOne({ email: email })
      .then((user)=>{
        if (user) {
          res.status(400)
          // throw new Error('User already exists')
          return next('User already exists');
        } else {
          const newUser = new User({
            firstName,
            lastName,
            email,
            password,
          });
      
          newUser.save()
            .then(() => {
              res.locals.newUser = newUser;
              next();
              // res.status(200).json(newUser);
            })
            .catch((err) => {
              return res.status(400).json({error: 'failed to create new user   ' + err});
            });
        }
          // console.log("Result :", user);
      })
      // .catch((err)=>{
      //     console.log(err);
      // });


  
  },

  // Get a user from the database and send it in the response
  // Their first name will be in the request parameter 'name'
  // This should send the found user

  async getUser(req, res, next) {
    const { email, password } = req.body;
    User.findOne({ email: email, password: password })
    .then((user) => {
      if  (!user)
        return next({ error: 'Error in userModel.getuser: Could not find user'});
      console.log("Successfully logged in!")
      res.locals.user = user;
      return next();
    })
    .catch((err) => {
      return next(err)
    })
  //     (err, User) => {
  //     console.log(User)
  //     if  (err || !User)
  //       return res.status(400).json({ error: 'Error in userModel.getuser: Could not find user'});
  //     res.status(200).json(User);
  //     console.log(User);
  //     return next();
  //   };
  },

  async getPatients(req, res, next) {
    const { email } = req.params;
    User.findOne({ email: email })
    .then((user) => {
      if  (!user)
        return next({ error: 'Error in userModel.getuser: Could not find user'});
      console.log("Successfully logged in!")
      res.locals.userPatients = user;
      // console.log(res.locals.userPatients);
      return next();
    })
  },

//   // Get a user from the database and update the user
//   // The user's first name will be in the request parameter 'name'
//   // The user's new first name will be in the request body
// const data = await  user.findOneAndUpdate({firstName: req.params.name}, {firstName: req.body.firstName});
//     if (data !== null) return next();
//     if (data === null) return next(400);

  // async updateUser(req, res, next) {
    

  // await User.updateOne(
  //   {email: email},
  //   { $push: { patients: { newPatient } } },
  //   { new: true },
  //   (err, updatedUser) => {
  //     if (err) {
  //       // handle error
  //       console.log('an err occurred');
  //     }
  //     res.json(updatedUser.patients);
  //   }
  // );
  // },
  // Delete a user from the database
  // The user's email name will be sent in the request parameter 'email'
  // This should send a success status code
  async deleteUser(req, res, next) {
    const { email } = req.params;
    const data = await User.deleteOne({ email: email}); // returns {deletedCount: 1}
    console.log(data)
    if (data.deletedCount === 0) return next(400);
    if (data) return next();
  },
};

module.exports = { loginController };
