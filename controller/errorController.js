
exports = (error, req, res, next)=>{
    res.statusCode = error.statusCode || 500
    res.status(res.statusCode).json({
        success:false,
        error:error.message
    })
}
