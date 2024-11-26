const {CustomAPIError} = require("../errors")

const errorHandlerFunction = (err, req, res, next) => {
    if(err instanceof CustomAPIError){
        return res.status(err.statusCode).json({msg: err.message})
    }
    res.status(500).json({msg: "something went wrong!!!"})
}

module.exports = errorHandlerFunction