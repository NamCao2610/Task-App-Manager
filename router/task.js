const express = require('express');

const router = new express.Router();

const Task = require('../models/task');
const auth = require('../middleware/auth');

//Them task moi cho user dang nhap
router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    });

    try {

        await task.save();
        res.send(task);

    } catch (e) {
        res.statua(400).send(e.message);
    }
})

//Doc task user dang nhap
router.get('/tasks', auth, async (req, res) => {

    const match = {};
    const sort = {};

    if (req.query.completed) {
        match.completed = req.query.completed === true
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(":");
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    try {

        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();

        res.send(req.user.tasks);

    } catch (e) {
        res.status(500).send(e.message);
    }
})

//Lay task bang id
router.get('/tasks/:id', auth, async (req, res) => {
    try {

        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });

        if (!task) {
            return res.status(404).send('Not found task');
        }

        res.status(200).send(task);

    } catch (e) {
        res.status(500).send(e.message);
    }
})

//Update task
router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowUpdates = ["description", "completed"]
    const isMatch = updates.every(update => allowUpdates.includes(update));
    if (!isMatch) {
        return res.status(404).send('Khong trung khop voi du lieu');
    }
    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })
        if (!task) {
            throw new Error('Khong tim thay task');
        }
        updates.forEach(update => task[update] = req.body[update]);
        await task.save();
        res.send(task);
    } catch (e) {
        res.status(400).send(e.message);
    }
})

//Delete task
router.delete('/tasks/:id', auth, async (req, res) => {
    try {

        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
        if (!task) {
            throw new Error('Khong tim thay task');
        }

        res.send({ success: 'Xoa thanh cong' });

    } catch (e) {
        res.status(500).send(e.message);
    }
})


module.exports = router;