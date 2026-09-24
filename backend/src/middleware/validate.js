const validateRequiredFields = (fields) => {
    return (req, res, next) => {
        const missingFields = fields.filter((field) => {
            return !req.body[field];
        });

        if (missingFields.length > 0) {
            return res.status(400).json({
                error: "Missing required fields",
                fields: missingFields
            });
        }

        next();
    };
};

module.exports = validateRequiredFields;