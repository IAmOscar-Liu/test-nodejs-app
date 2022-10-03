export const fullCharToHalf = (_content) => {
  const content = _content.split("");
  // console.log("content length: ", content.length);
  let itrStart = 0;
  let newContent = "";
  while (itrStart <= content.length) {
    let itrEnd = itrStart + 10000;
    itrEnd = itrEnd > content.length ? content.length : itrEnd;
    for (let i = itrStart; i < itrEnd; i++) {
      // number 0-9 full: 65296-65305
      // lowercase a-z full : 65345－65370
      // uppercase A-Z full: ６5313 - 65338
      if (
        content[i].charCodeAt(0) >= 65296 &&
        content[i].charCodeAt(0) <= 65305
      ) {
        newContent += content[i].charCodeAt(0) - 65296 + "";
      } else if (
        content[i].charCodeAt(0) >= 65345 &&
        content[i].charCodeAt(0) <= 65370
      ) {
        newContent += String.fromCharCode(content[i].charCodeAt(0) - 65248);
      } else if (
        content[i].charCodeAt(0) >= 65313 &&
        content[i].charCodeAt(0) <= 65338
      ) {
        newContent += String.fromCharCode(content[i].charCodeAt(0) - 65248);
      } else if (content[i] === "＇" || content[i] === "’") {
        newContent += "'";
      } else if (content[i] === "（") {
        newContent += "(";
      } else if (content[i] === "）") {
        newContent += ")";
      } else {
        newContent += content[i];
      }
    }
    itrStart += 10000;
  }

  return newContent;
};
