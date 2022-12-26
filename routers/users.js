const {User} = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


router.get(`/`, async (req, res) => {
    const userList = await User.find().select("-passwordHash")

    if (!userList) {
        res.status(500).json({ sucess: false })
    }
    res.send(userList);
})



router.get(`/:id`, async (req, res) => {
    const users = await User.findById(req.params.id).select("-passwordHash");

    if (!users) {
        res.status(500).json({message:"the user with the given id was not found"})
    }
    res.status(200).send(users);
})



router.post(`/`, async (req, res) => {
    let users = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })
    users = await users.save();

    if (!users)
        return res.status(400).send("the user cannot be registered!")
    
    res.send(users)
})



router.put(`/:id`, async (req, res) => {

    const userExist = await User.findById(req.params.id);
    let newPassword
    if (req.body.password) {
        newPassword = bcrypt.hashSync(req.body.password, 10);
    } else {
        newPassword = userExist.passwordHash;
    }

    const users = await User.findByIdAndUpdate(
        req.params.id,
        {
        name: req.body.name,
        email: req.body.email,
        passwordHash: newPassword,
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country 
        },
        { new: true }
    )
    if (!users) 
        return res.status(400).send("the user cannot be created!")
    
        res.send(users)
})



router.post(`/login`, async (req, res) => {
    let users = await User.findOne({ email: req.body.email });
    const secret = process.env.secret;
    if (!users) {
        return res.status(400).send("the user not found")
    }
    if (users && bcrypt.compareSync(req.body.password, users.passwordHash)) {
        const token = jwt.sign(
            {
                userId: users.id
            },
            secret,
            { expiresIn: '1w' }
        )
        res.status(200).send({user: users.email, token: token});
    } else {
        res.status(400).send({message:"password is wrong"});
    }
})



router.post('/register', async (req,res)=>{
    let users = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
       
    })
    users = await users.save();

    if(!users)
    return res.status(400).send('the user cannot be created!')

    res.send(users);
})


router.delete('/:id', (req, res)=>{
    User.findByIdAndRemove(req.params.id).then(users =>{
        if(users) {
            return res.status(200).json({success: true, message: 'the user is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "user not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

router.get(`/get/count`, async (req, res) =>{
    const userCount = await User.countDocuments((count) => count)

    if(!userCount) {
        res.status(500).json({success: false})
    } 
    res.send({
        userCount: userCount
    });
})


module.exports = router;