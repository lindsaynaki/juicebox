// api/utils

const requireUser = (req, res, next) => {
    // if user does not exist, send an error
    if(!req.user) {
        next({
            name: "MissingUserError",
            message: "You must be logged in to perform this action"
        });
    }
    next();
}

module.exports = {
    requireUser
}