export const checkValidateDate = (email, password, name, isSignInForm = true) => {
  // Check for empty fields first
  if (!email) return "Please enter your email.";
  if (!password) return "Please enter your password.";
  if (!isSignInForm && !name) return "Please enter your name.";

  // Now run format validations
  const isEmailValid = /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/.test(email);
  const isPasswordValid = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/.test(password);
  const isNameValid = /^[A-Za-z\s]+$/.test(name);

  if (!isEmailValid) return "Please enter a valid email address.";
  if (!isPasswordValid)
    return `Password must contain at least 8 characters, including 
            at least one uppercase letter, one lowercase letter, and one number.`;
  if (!isSignInForm && !isNameValid) return "Please enter a valid name.";

  return null;
};