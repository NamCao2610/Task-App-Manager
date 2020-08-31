const express = require('express');

const router = new express.Router();

const User = require('../models/user');

const { sendWelcomeMail, sendByeMail } = require('../emails/account');

const auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');

//Dang ki thanh vien moi
router.post('/users', async (req, res) => {
    const user = new User(req.body);

    try {

        await user.save();
        sendWelcomeMail(user.email, user.name)
        const token = await user.createToken();

        res.status(201).send({ user, token });

    } catch (e) {
        res.status(400).send(e.message);
    }
})

//Dang nhap thanh vien
router.post('/users/login', async (req, res) => {

    try {

        const user = await User.LoginAsEmailAndPassword(req.body.email, req.body.password);
        const token = await user.createToken();

        res.status(200).send({ user, token });

    } catch (e) {
        res.status(400).send(e.message);
    }
})

//Xem all User
router.get('/users', async (req, res) => {
    try {

        const user = await User.find({});

        res.send(user);

    } catch (e) {
        res.status(500).send(e.message);
    }
})

//Xem user dang dang nhap
router.get('/users/me', auth, async (req, res) => {

    res.send(req.user);
})

//Logout user 
router.post('/users/logout', auth, async (req, res) => {

    try {

        req.user.tokens.pop();

        await req.user.save();

        res.status(200).send({ success: 'Logout thanh cong' });

    } catch (e) {
        res.status(400).send(e.message);
    }

})

//LOgout All
router.post('/users/logoutAll', auth, async (req, res) => {
    try {

        req.user.tokens = undefined;

        await req.user.save();

        res.send({ sucess: 'Logout All thanh cong' });

    } catch (e) {
        res.staus(400).send(e.message);
    }
})

//Update user
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowUpdates = ["name", "email", "password", "age"];
    const isMatch = updates.every(update => allowUpdates.includes(update));
    if (!isMatch) {
        return res.status(404).send('Not found user');
    }
    try {

        updates.forEach(update => {
            return req.user[update] = req.body[update]
        })

        await req.user.save();

        res.send(req.user);

    } catch (e) {
        res.status(400).send(e.message);
    }
})

//Delete User
router.delete('/users/me', auth, async (req, res) => {
    try {

        await req.user.remove();
        sendByeMail(req.user.email, req.user.name);
        res.status(200).send({ success: 'Xoa thanh cong' });

    } catch (e) {
        res.status(500).send(e.message);
    }
})

//Upload avatar
const upload = multer({
    limits: {
        fileSize: 1000000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            cb(new Error('You must upload file jpg jpeg png'));
        }

        cb(undefined, true);
    }
})

//Upload ho so avatar
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();

    req.user.avatar = buffer;

    await req.user.save();

    res.send({ success: 'Upload thanh cong' });
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message });
})

//Delete avatar
router.delete('/users/me/avatar', auth, async (req, res) => {

    try {

        req.user.avatar = undefined;

        await req.user.save();

        res.send({ success: 'Xoa thanh cong' });

    } catch (e) {
        res.status(500).send(e.message);
    }

})

//Get avatar
router.get('/users/:id/avatar', async (req, res) => {

    try {

        const user = await User.findById(req.params.id);

        if (!user || !user.avatar) {
            throw new Error('Khong co user nay hoac user nay ko chua avatar');
        }

        res.set('Content-Type', 'image/jpg');

        res.send(user.avatar);

    } catch (e) {
        res.status(500).send(e.message);
    }
})


module.exports = router;