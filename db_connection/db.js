const { default: mongoose } = require("mongoose")

async function connect(url){
    try {
        const db = await mongoose.connect(url)
        if(!db){
            console.log("unable to connect!");
            return;
        }
        console.log("database connected successfully.")
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = { connect }