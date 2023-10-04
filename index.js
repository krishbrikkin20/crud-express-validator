const express = require('express')
const mongoose = require('mongoose')
const { query, matchedData, body, validationResult } = require('express-validator');

const app = express()
const PORT = 3000

mongoose.connect('mongodb://127.0.0.1:27017/crud-03-10-2023', {
    useNewUrlParser: true
}).then(console.log(`db connected`))

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    }
})

const User = mongoose.model('user', userSchema)

app.use(express.json())

app.get('/', (req, res) => {
    res.render('home page')
})

const nameValidation = () => {
    return body('name').notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
        .matches(/^[A-Za-z\s]+$/).withMessage('Name must contain only letters and spaces')
    body('email').trim().isEmail().withMessage('Please enter valid email')
}
const emailValidation = () => {
    return body('email').trim().isEmail().withMessage('Please enter valid email')
}
const passwordValidation = () => {
    return body('password').notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character')
}
const phoneValidation = () => {
    return body('phone').notEmpty().withMessage('Phone number is required')
    .isNumeric().withMessage('Phone number must contain only numeric characters')
    .isLength({ min: 10, max: 10 }).withMessage('Phone number must be 10 digits')
}

app.post('/create', nameValidation(), emailValidation(), passwordValidation(), phoneValidation(), async (req, res) => {
    try {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(404).json({
                errors: result.array(),
            })
        }
        const { name, email, password, phone } = req.body
        const user = await User.create({ name, email, password, phone })

        res.status(200).json({
            message: `user created successfully`,
            user
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: `server error`
        })
    }
})

app.get('/get-all', async (req, res) => {
    try {
        const users = await User.find()

        res.status(200).json({
            message: `get all users`,
            users
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: `server error`
        })
    }
})

// ! using params
app.get('/get-one/:id', async (req, res) => {
    try {
        const id = req.params.id
        const user = await User.findById(id)

        res.status(200).json({
            message: `user find successfully`,
            user
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: `server error`
        })
    }
})

// ! using query
app.get('/get-one-query', query('id').notEmpty().withMessage('Id is Required...'), async (req, res) => {
    try {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(404).json({
                errors: result.array(),
            })
        }
        const { id } = matchedData(req)
        const user = await User.findById(id)

        res.status(200).json({
            message: `user find successfully`,
            user
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: `server error`
        })
    }
})

// ! update user
app.put('/update/:id', async (req, res) => {
    try {
        const id = req.params.id
        const userData = req.body
        const user = await User.findByIdAndUpdate(id, { ...userData }, { new: true })

        res.status(200).json({
            message: `user update successfully`,
            user
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: `server error`
        })
    }
})

// ! delete user
app.delete('/delete/:id', async (req, res) => {
    try {
        const id = req.params.id
        const user = await User.findByIdAndDelete(id)

        res.status(200).json({
            message: `user delete successfully`,
            user
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: `server error`
        })
    }
})

app.listen(PORT, () => {
    console.log(`server running at ${PORT}`)
})