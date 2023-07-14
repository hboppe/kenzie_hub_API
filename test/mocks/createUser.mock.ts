export const createUserMock = {
  validInfo: {
    name: 'user-name',
    email: 'valid@email.com',
    password: 'password@123',
    bio: 'bio',
    contact: '5556788080',
    module: 'Module 1',
  },
  duplicatedEmail: {
    name: 'Valid User',
    email: 'invalid@email.com',
    password: 'password@123',
    bio: 'bio',
    contact: '5556788080',
    module: 'Module 1',
  },
  invalidInfo: {
    name: 'Invalid User',
    email: 'invalid@email.com',
    password: 'password@123',
    bio: 'bio',
    contact: '5556788080',
    module: 'Module 1',
  },
  createdUser: {
    id: '6a76df3e-2647-4d63-845f-77651206efc9',
    name: 'User1',
    email: 'email1@email.com',
    bio: 'Bio1',
    contact: '5406789078',
    module: 'module 1'
  }
};
