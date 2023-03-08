const { Schema, model } = require("mongoose");

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    contactPhone: {
        type: String,
    },
    createdAt: {
        type: Date,
        // default: new Date()
    }
});

const User = model("User", userSchema)
User.mycreate = async (data) => {
    const newUser = new User(data);
    try {
        const saveuser = await newUser.save();
        console.log(saveuser)
        return saveuser
    } catch (error) {
        console.error(error);
    }
}
User.findByEmail = async (email) => {
    const user = User.findOne({ email })
    if (user) return user
    return null
}

module.exports = User;

// email	string	да	да
// passwordHash	string	да	нет
// name	string	да	нет
// contactPhone	string	нет	нет