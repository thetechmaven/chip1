import validator from 'validator';

export const isEmail = (email: string) => {
  if (!validator.isEmail(email)) {
    throw new Error('Invalid Email');
  }
};

export const isPasswordValid = (password: string) => {
  if (password.length < 6 || password.length > 32) {
    throw new Error('Password length should be 6-32 alphanumeric characters');
  }
  if (!(/[a-zA-Z]/.test(password) && /[0-9]/.test(password))) {
    throw new Error(
      'Password should contain atleast one number and one alphabet'
    );
  }
};

export const isNameValid = (name: string) => {
  if (/[0-9]/.test(name)) {
    throw new Error('Name should only contain alphabets');
  }
  if (name.length === 0) {
    throw new Error('Name should contain atleast one character');
  }
};
