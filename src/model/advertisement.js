const { Schema, model } = require('mongoose')
const mongoose = require('mongoose')

const advertisementSchema = new Schema({
    shortText: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    images: {
        type: [String],
    },
    userId: mongoose.ObjectId,
    createdAt: {
        type: Date,
    },
    updatedAt: {
        type: Date,
        default: new Date()
    },
    tags: {
        type: [String],
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
})
const Advertisement = model('Advertisement', advertisementSchema)
Advertisement.findByParam = async (params) => {
    const findAdvertisementById = await Advertisement.findById(params)
    if (findAdvertisementById) {
        if (!findAdvertisementById.isDeleted) return findAdvertisementById
        return null
    }
    const findAdvertisement = []
    findAdvertisement.push(await Advertisement.find({ shortText: /${params}/i, isDeleted: false }).exec())
    findAdvertisement.push(await Advertisement.find({ description: /${params}/i, isDeleted: false }).exec())

}
Advertisement.create = async (data) => {
    const newAdvertisement = new Advertisement(data);
    try {
        const saveAdvertisement = await newAdvertisement.save();
        console.log(saveAdvertisement)
        return saveAdvertisement
    } catch (error) {
        console.error(error);
    }
}
Advertisement.remove = async (id) => {
    await Advertisement.updateOne({ _id: id }, { isDeleted: true }, function (err) {
        if (err) return err;
    })
}
module.exports = Advertisement

// Название	Тип	Обязательное	Уникальное
// _id	ObjectId	да	да
// shortText	string	да	нет
// description	string	нет	нет
// images	string[]	нет	нет
// userId	ObjectId	да	нет
// createdAt	Date	да	нет
// updatedAt	Date	да	нет
// tags	string[]	нет	нет
// isDeleted	boolean	да	нет