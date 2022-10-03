const ignoreItems = ["中", "內", "的", "當", "裡面", "情形", "內容"];

export const allIgnoreThisItems = (item, thisWord) => {
  if (item === "") {
    return true;
  }

  if ((thisWord === "其中" || thisWord === "其中之") && /^者/.test(item)) {
    return true;
  }

  if (thisWord !== "該" && /^(的|之)/.test(item)) {
    return true;
  }

  if (thisWord !== "該" && ignoreItems.some((it) => it === item)) {
    return true;
  }

  return false;
};
