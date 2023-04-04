class Response {
    constructor(data, success = true) {
        this.data = data;
        this.success = success;
    }
};

const checkEmail = (email) => {
    try {
        const pattern = /@gmail\.com$/;
        const emailValid = pattern.test(email);
        return emailValid;
    } catch (error) {
        console.log(error);
    }
};

module.exports = { Response, checkEmail };
