export const stringToUnicode = (str) => {
  let unicodeStr = "";
  for (let i = 0; i < str.length; i++) {
    unicodeStr += str.charCodeAt(i).toString(16);
  }
  return unicodeStr;
};
