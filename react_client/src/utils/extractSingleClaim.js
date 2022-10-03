import { checkClaim } from "./checkClaims";

export const extractSingleClaim = (index, claims, claim, newContent) => {
  if (newContent !== "") {
    const content = removeEmptySentence(newContent);
    claims.push({
      num: index + 1,
      ...checkClaim(claims, content, index + 1)
    });
  } else if (
    claim.children[0].children.length === 1 &&
    claim.children[0].children[0].type === "text" &&
    claim.children[0].children[0].children.length === 0
  ) {
    const content = removeEmptySentence(claim.children[0].children[0].value)
      .replace(/\n/g, "")
      .trim();
    claims.push({
      num: index + 1,
      ...checkClaim(claims, content, index + 1)
    });
  } else if (
    claim.children.length > 1 &&
    claim.children.every((el) => el.name === "claim-text") &&
    claim.children.every((el) => el.children.length > 0)
  ) {
    let content = "";
    for (let x = 0; x < claim.children.length; x++) {
      claim.children[x].children.forEach((el) => {
        if (el.type === "text" && el.children.length === 0) {
          content += el.value;
        } else if (
          (el.name === "sub" || el.name === "sub") &&
          el.value === "" &&
          el.children.length > 0 &&
          el.children[0].value.length > 0
        ) {
          content += el.children[0].value.replace(/[↵\n]/g, "").trim();
        } else if (el.name === "br" && el.type === "element") {
          // content += `<br/>`;
          content += `@##@`;
        }
      });
    }
    content = removeEmptySentence(content).replace(/[↵\n]/g, "").trim();
    claims.push({
      num: index + 1,
      ...checkClaim(claims, content, index + 1)
    });
  } else {
    let content = "";
    claim.children[0].children.forEach((el) => {
      if (el.type === "text" && el.children.length === 0) {
        content += el.value;
      } else if (
        (el.name === "sub" || el.name === "sub") &&
        el.value === "" &&
        el.children.length > 0 &&
        el.children[0].value.length > 0
      ) {
        content += el.children[0].value.replace(/[↵\n]/g, "").trim();
      } else if (el.name === "br" && el.type === "element") {
        // content += `<br/>`;
        content += `@##@`;
      }
    });
    content = removeEmptySentence(content).replace(/\n/g, "").trim();
    claims.push({
      num: index + 1,
      ...checkClaim(claims, content, index + 1)
    });
  }
};

const removeEmptySentence = (content) =>
  content
    .split("@##@")
    .filter((s) => s.trim() !== "")
    .join("@##@");
