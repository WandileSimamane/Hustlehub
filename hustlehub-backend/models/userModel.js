// In-memory array to hold registered users
const users = [];

class UserModel {
  // Find a user by email
  static findByEmail(email) {
    return users.find((user) => user.email === email);
  }

  // Save a new user to the array
  static create(userData) {
    const newUser = {
      id: users.length + 1,
      ...userData,
      createdAt: new Date(),
    };
    users.push(newUser);
    return newUser;
  }

  // Utility method to view all users (for debugging/testing)
  static getAll() {
    return users;
  }
}

module.exports = UserModel;