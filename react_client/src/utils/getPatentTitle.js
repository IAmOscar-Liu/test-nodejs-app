export const getPatentTitle = (data, setXMLData) => {
  if (data && data.attributes && data.attributes.lang === "tw") {
    // console.log(data.children[0].value);
    setXMLData((prev) => ({
      ...prev,
      utilityModelTitleData: (
        (data.children && data.children[0] && data.children[0].value) ||
        (data.children[0].children &&
          data.children[0].children[0] &&
          data.children[0].children[0].value) ||
        ""
      ).replace(/[↵\n]/g, "")
    }));
  } else if (data && data.attributes && data.attributes.lang === "en") {
    // console.log(data.children[0].value);
    setXMLData((prev) => ({
      ...prev,
      utilityModelTitleDataEn: (
        (data.children && data.children[0] && data.children[0].value) ||
        (data.children[0].children &&
          data.children[0].children[0] &&
          data.children[0].children[0].value) ||
        ""
      ).replace(/[↵\n]/g, "")
    }));
  }
  // console.log(data);
  // debugger;
};
