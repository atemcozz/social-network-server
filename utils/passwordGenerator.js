function generate({
  length = 16,
  capitals = true,
  symbols = false,
  numbers = true,
}) {
  let set = "abcdefghijklmnopqrstuvwxyz";
  let pass = "";
  if (capitals) {
    set += set.toUpperCase();
  }
  if (symbols) {
    set += "!@#$%^&*()-={}[]';?><,./\"_+`~";
  }
  if (numbers) {
    set += "0123456789";
  }
  for (let i = 0; i < length; i++) {
    pass += set[Math.floor(Math.random() * set.length)];
  }
  return pass;
}
module.exports = generate;
