const express = require('express');

require('./db/mongoose');

const app = express();

const userRouter = require('./router/user');
const taskRouter = require('./router/task');

const port = process.env.PORT;

app.use(express.json());

app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
    console.log('Server dang chay port ', port);
})