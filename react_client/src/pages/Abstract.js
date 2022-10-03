import React, { useContext, useEffect, useRef } from "react";
import { EssentialDataContextProvider } from "../contexts/EssentialDataContext";
import { getPathName } from "../utils/getPathName";

const Abstract = () => {
  const [essentialData, setEssentialData] = useContext(
    EssentialDataContextProvider
  );
  const abstractContentRef = useRef();

  useEffect(() => {
    setEssentialData((prev) => ({ ...prev, pathName: getPathName() }));
  }, []);

  useEffect(() => {
    if (
      !essentialData.isProcessing &&
      essentialData.abstractContent.length !== 0
    ) {
      let htmlContent = `<p>【中文新型名稱】 ${essentialData.utilityModelTitle}</p>`;
      if (essentialData.utilityModelTitleEn !== "") {
        htmlContent += `<p>【英文新型名稱】 ${essentialData.utilityModelTitleEn}</p>`;
      }

      htmlContent += `<div><p>【中文】</p>${essentialData.abstractContent
        .filter((paragraph) => paragraph !== "")
        .map(
          (paragraph) =>
            `<p class="abstract-content-paragraph">${paragraph}</p>`
        )
        .join("")}</div>`;
      if (
        essentialData.abstractContentEn.filter((paragraph) => paragraph !== "")
          .length > 0
      ) {
        htmlContent += `<div><p>【英文】</p>${essentialData.abstractContentEn
          .filter((paragraph) => paragraph !== "")
          .map(
            (paragraph) =>
              `<p class="abstract-content-paragraph">${paragraph}</p>`
          )
          .join("")}</div>`;
      }

      htmlContent += `<h1>技術領域</h1>`;
      if (essentialData.technicalField.length > 0) {
        htmlContent += `<div>${essentialData.technicalField
          .map(
            (paragraph) =>
              `<p class="abstract-content-paragraph">${
                paragraph.general !== "" ? "【" + paragraph.general + "】" : ""
              }${paragraph.singlePara}</p>`
          )
          .join("")}</div>`;
      }

      htmlContent += `<h1>先前技術</h1>`;
      if (essentialData.backgroundArt.length > 0) {
        htmlContent += `<div>${essentialData.backgroundArt
          .map(
            (paragraph) =>
              `<p class="abstract-content-paragraph">${
                paragraph.general !== "" ? "【" + paragraph.general + "】" : ""
              }${paragraph.singlePara}</p>`
          )
          .join("")}</div>`;
      }

      abstractContentRef.current.innerHTML = htmlContent;
    }
  }, [essentialData]);

  return (
    <>
      <section className="title-section">
        <h1>摘要</h1>
      </section>
      <section ref={abstractContentRef} className="abstract-content">
        <h3>
          {essentialData.isProcessing
            ? "Processing..."
            : "No data passed in yet."}
        </h3>
      </section>
    </>
  );
};

export default Abstract;
