// Crea una validacion para el email:
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
 
// Crea una validacion para el name que sea string y de maximo 10 caracteres
const isValidName = (name) => {
  return typeof name === "string" && name.length <= 10;
};
 
// Crea una validacion para el id que sea un numero y que users tenga un id unico para compararlo con el id que se envia en el body
const isUniqueNumericId = (id, users) => {
  return typeof id === "number" && !users.some((user) => user.id === id);
};
 
// Crea una validacion para que user tenga los 3 atributos obligatorios con  las validaciones de cada atributo y que si no cumple con alguna de las validaciones retorne un mensaje de error especificando cual es el error
const isValidUser = (user, users) => {
  const { id, name, email } = user;
 
  if (!isUniqueNumericId(id, users)) {
    return { valid: false, error: "El ID debe ser un número único" };
  }
  if (!isValidName(name)) {
    return {
      valid: false,
      error: "El nombre debe ser una cadena de texto de máximo 10 caracteres",
    };
  }
  if (!isValidEmail(email)) {
    return { valid: false, error: "El correo electrónico no es válido" };
  }
  return { valid: true };
};
 
module.exports = {
  isValidEmail,
  isValidName,
  isUniqueNumericId,
  isValidUser,
};  