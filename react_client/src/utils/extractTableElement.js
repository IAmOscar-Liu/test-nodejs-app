export const extractTableElement = (element) => {
  if (element.type === "text" && element.value.length > 0) {
    return element.value;
  } else if (element.name === "br") {
    return `<br/>`;
  } else if (
    (element.name === "sub" || element.name === "sup") &&
    element.value === "" &&
    element.children.length > 0 &&
    element.children[0].value.length > 0
  ) {
    return element.children[0].value.replace(/[↵\n]/g, "").trim();
  } else if (element.children.length > 0) {
    return (
      `<${
        element.name.toLowerCase() === "table"
          ? 'table border="1"'
          : element.name
      }>` +
      element.children.map((child) => extractTableElement(child)).join("") +
      `</${element.name}>`
    );
  }
  return "";
};

export const extractTableElement_v2 = (element) => {
  if (element.type === "text" && element.value.length > 0) {
    return element.value.replace(/[↵\n]/g, "").trim();
  } else if (
    (element.name === "sub" || element.name === "sup") &&
    element.value === "" &&
    element.children.length > 0 &&
    element.children[0].value.length > 0
  ) {
    return element.children[0].value.replace(/[↵\n]/g, "").trim();
  } else if (element.children.length > 0) {
    return element.children
      .map((child) => extractTableElement_v2(child))
      .join(" ");
  }
  return "";
};
