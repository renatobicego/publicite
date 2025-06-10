function fullNameNormalization(
  name: string,
  lastName: string,
  businessName?: string,
) {
  let fullName = name + ' ' + lastName;
  if (businessName) {
    fullName = fullName + ' ' + businessName;
  }
  return fullName
    .normalize('NFD') // Descomponer caracteres acentuados
    .replace(/[\u0300-\u036f]/g, ''); // Eliminar los diacríticos
}

export { fullNameNormalization };
