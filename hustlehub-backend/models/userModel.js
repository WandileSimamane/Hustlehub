const users = [];

exports.findUserByEmail = (email) => {
    return users.find(user => user.email === email);
};

exports.createUser = (userData) => {
    const newUser = {
        id: Date.now().toString(), // Simple unique ID generator
        ...userData
    };
    users.push(newUser);
    return newUser;
};

module.exports = users;