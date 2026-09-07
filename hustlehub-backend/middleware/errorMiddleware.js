//catches errors and shows status codes
const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // Log raw stack trace on server terminal only

    const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

    res.status(statusCode).json({
        success: false,
        message: statusCode === 500 ? "An internal server error occurred." : err.message
    });
};

module.exports = errorHandler;