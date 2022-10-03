import { pickColor } from "../dict/elementColors";
import { stringToUnicode } from "./stringToUnicode";

export const buildElementColorMap = ({
  descriptionOfElementMap,
  elementColorMap,
  utilityModelTitle
}) => {
  if (utilityModelTitle && utilityModelTitle !== "") {
    elementColorMap[
      stringToUnicode(utilityModelTitle.replace(/[↵\n]/g, "").trim())
    ] = {
      value: utilityModelTitle.replace(/[↵\n]/g, "").trim(),
      // color: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
      //   Math.random() * 255
      // )}, ${Math.floor(Math.random() * 255)}, .7)`
      color: pickColor(Object.keys(elementColorMap).length)
    };
  }

  Object.keys(descriptionOfElementMap).forEach((key) => {
    if (
      elementColorMap[stringToUnicode(descriptionOfElementMap[key].values[0])]
    ) {
      return;
    }
    elementColorMap[stringToUnicode(descriptionOfElementMap[key].values[0])] = {
      value: descriptionOfElementMap[key].values[0],
      // color: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
      //   Math.random() * 255
      // )}, ${Math.floor(Math.random() * 255)}, .7)`
      color: pickColor(Object.keys(elementColorMap).length)
    };
  });
};
