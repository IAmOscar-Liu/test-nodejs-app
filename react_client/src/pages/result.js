import React, { useContext, useEffect, useRef } from "react";
import { EssentialDataContextProvider } from "../contexts/EssentialDataContext";
import { getPathName } from "../utils/getPathName";

const Result = () => {
  const [essentialData, setEssentialData] = useContext(
    EssentialDataContextProvider
  );
  const resultContentRef = useRef();

  useEffect(() => {
    setEssentialData((prev) => ({
      ...prev,
      pathName: getPathName()
    }));
  }, []);

  useEffect(() => {
    if (
      !essentialData.isProcessing &&
      essentialData.abstractContent.length !== 0
    ) {
      let htmlContent = "";

      // title
      if (essentialData.allErrors.title.length !== 0) {
        htmlContent += `<p class="p-title">【新型名稱】</p>`;
        htmlContent += essentialData.allErrors.title
          .map(
            ({ message }, idx) =>
              `<p class="result-content-paragraph" data-idx="${
                idx + 1
              }">${message}</p>`
          )
          .join("");
      }

      // descriptionOfElementMap
      if (essentialData.allErrors.descriptionOfElementMap.length !== 0) {
        htmlContent += `<p class="p-title">【符號說明】</p>`;
        htmlContent += essentialData.allErrors.descriptionOfElementMap
          .map(
            ({ message }, idx) =>
              `<p class="result-content-paragraph" data-idx="${
                idx + 1
              }">${message}</p>`
          )
          .join("");
      }

      // figureOfDrawingsMap
      if (essentialData.allErrors.figureOfDrawingsMap.length !== 0) {
        htmlContent += `<p class="p-title">【代表圖之符號簡單說明】</p>`;
        htmlContent += essentialData.allErrors.figureOfDrawingsMap
          .map(
            ({ message }, idx) =>
              `<p class="result-content-paragraph" data-idx="${
                idx + 1
              }">${message}</p>`
          )
          .join("");
      }

      // allDisclosureParagraphDetails
      if (essentialData.allErrors.allDisclosureParagraphDetails.length !== 0) {
        htmlContent += `<p class="p-title">【新型內容】</p>`;
        htmlContent += essentialData.allErrors.allDisclosureParagraphDetails
          .map(
            ({ message }, idx) =>
              `<p class="result-content-paragraph" data-idx="${
                idx + 1
              }">${message}</p>`
          )
          .join("");
      }

      // allModeForInventionParagraphDetails
      if (
        essentialData.allErrors.allModeForInventionParagraphDetails.length !== 0
      ) {
        htmlContent += `<p class="p-title">【實施方式】</p>`;
        htmlContent += essentialData.allErrors.allModeForInventionParagraphDetails
          .map(
            ({ message }, idx) =>
              `<p class="result-content-paragraph" data-idx="${
                idx + 1
              }">${message}</p>`
          )
          .join("");
      }

      // allClaimsDetails
      if (essentialData.allErrors.allClaimsDetails.length !== 0) {
        htmlContent += `<p class="p-title">【申請專利範圍】</p>`;
        htmlContent += essentialData.allErrors.allClaimsDetails
          .map(
            ({ message }, idx) =>
              `<p class="result-content-paragraph" data-idx="${
                idx + 1
              }">${message}</p>`
          )
          .join("");
      }

      // system
      if (essentialData.allErrors.system.length !== 0) {
        htmlContent += `<p class="p-title">【系統無法判別之錯誤】</p>`;
        htmlContent += essentialData.allErrors.system
          .map(
            ({ message }, idx) =>
              `<p class="result-content-paragraph" data-idx="${
                idx + 1
              }">${message}</p>`
          )
          .join("");
      }

      if (htmlContent) {
        resultContentRef.current.innerHTML =
          "<div>" +
          `<strong style="
              display: block; 
              text-align: center; 
              margin-bottom: 10px;
              font-size: 1.2em;
              font-weight: 700;
              color: red;
          ">&#9888;本分析結果僅供參考，審查官引用時應再次確認每項所對應的內容是否正確</strong>` +
          htmlContent +
          "</div>";
      } else {
        resultContentRef.current.innerHTML = `<div><h3>本案未檢查到任何錯誤</h3></div>`;
      }
    }
  }, [essentialData]);

  return (
    <>
      <section className="title-section">
        <h1>分析結果</h1>
      </section>
      <section ref={resultContentRef} className="result-content">
        <h3>
          {essentialData.isProcessing
            ? "Processing..."
            : "No data passed in yet."}
        </h3>
      </section>
    </>
  );
};

export default Result;

/*
    <>
      <h1>分析結果</h1>
      <section className="result-content">
        <div>
          <p>【符號說明】</p>
          <p className="result-content-paragraph" data-idx="1">
            依專利法施行細則第45條準用第22條第1項之規定：「說明書、申請專利範圍及摘要中之技術用語及符號應一致。」本案「說明書」內容之記載未依前開規定之格式撰寫（段落編號【　】第　、　行
            ／ 第　頁第　、　行之構件「　（　）」，與「符號說明」 ／
            及「代表圖之符號簡單說明」所述之構件「　（　）」，其名稱用語 ／
            符號不一致），應予修正。查違反專利法第120條準用第26條第4項之規定。【摘要、說明書及圖式其餘部分請一併確認及修正】
          </p>
          <p>【申請專利範圍】</p>
          <p className="result-content-paragraph" data-idx="1">
            依專利法施行細則第45條準用第18條第6項之規定：「獨立項或附屬項之文字敘述，應以單句為之。」本案「申請專利範圍」第　項內容之記載未依前開規定之格式撰寫（文字敘述未以單句為之
            ／
            ，於句中出現句點為不當之處），應予修正。查違反專利法第120條準用第26條第4項之規定。
          </p>
          <p className="result-content-paragraph" data-idx="2">
            依專利法施行細則第45條準用第18條第1項之規定：「…。獨立項、附屬項，應以其依附關係，依序以阿拉伯數字編號排列。」本案「申請專利範圍」第　項內容之記載未依前開規定之格式撰寫（該項第　行所述之技術特徵「　」，於所依附申請專利範圍第　項中未揭示此技術特徵，係不當依附），應予修正。查違反專利法第120條準用第26條第4項之規定。【摘要、說明書其餘部分請一併確認及修正】
          </p>
        </div>
      </section>
    </>
*/
