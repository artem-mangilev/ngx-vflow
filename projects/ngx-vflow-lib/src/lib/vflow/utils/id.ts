export function id() {
  const randomLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));

  return randomLetter + Date.now();
}
