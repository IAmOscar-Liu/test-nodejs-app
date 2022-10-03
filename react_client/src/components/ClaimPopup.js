import React, { useState, useEffect, useRef } from "react";
import Popup from "reactjs-popup";

const ClaimPopup = ({
  isPopupOpen,
  toggleIsPopupOpen,
  popupStart,
  popupEnd,
  setPopupStart,
  setPopupEnd,
  popupIndex,
  popupAvailableContent,
  handleUpdateMatch,
  popupItem,
  popupFullValue
}) => {
  const availableContent = popupAvailableContent?.content;
  const availableContentStartAt = popupAvailableContent?.startAt;
  const dispStr = availableContent
    ? availableContent.split("").map((char, charIdx) => (
        <span
          key={charIdx + availableContentStartAt}
          className={
            charIdx + availableContentStartAt >= popupStart &&
            charIdx + availableContentStartAt < popupEnd
              ? "highlight-char"
              : ""
          }
        >
          {char}
        </span>
      ))
    : "";

  const selectedStr = availableContent
    ? availableContent.slice(
        popupStart - availableContentStartAt,
        popupEnd - availableContentStartAt
      )
    : "";

  const [correspondedStr, setCorrespondedStr] = useState("");
  const [preserveValue, setPreserveValue] = useState(false);
  const isPopupOpenRef = useRef(isPopupOpen);

  useEffect(() => {
    // console.log("popup last value: ", isPopupOpenRef.current);
    // console.log("popup current value: ", isPopupOpen);
    // console.log("selectedStr: ", selectedStr);
    if (isPopupOpenRef.current !== isPopupOpen) {
      // we open or close popup
      setPreserveValue(false);
      setCorrespondedStr(popupFullValue || popupItem || selectedStr);
    } else {
      // console.log("reset here");
      setCorrespondedStr(selectedStr);
    }
    isPopupOpenRef.current = isPopupOpen;
  }, [popupStart, popupEnd, isPopupOpen]);

  const handleStartMove = (dir) => {
    const startMin = availableContentStartAt;
    const startMax = popupEnd - 1;
    if (dir === 1 && popupStart + 1 <= startMax) {
      setPopupStart((prev) => prev + 1);
    } else if (dir === -1 && popupStart - 1 >= startMin) {
      setPopupStart((prev) => prev - 1);
    }
  };

  const handleEndMove = (dir) => {
    const endMin = popupStart + 1;
    const endMax = availableContentStartAt + availableContent.length;
    if (dir === 1 && popupEnd + 1 <= endMax) {
      setPopupEnd((prev) => prev + 1);
    } else if (dir === -1 && popupEnd - 1 >= endMin) {
      setPopupEnd((prev) => prev - 1);
    }
  };

  return (
    <Popup
      open={isPopupOpen}
      closeOnDocumentClick
      onClose={() => toggleIsPopupOpen(false)}
    >
      <div className="popup">
        <p style={{ alignSelf: "center", fontSize: "1.1em", fontWeight: 700 }}>
          修正元件名稱
        </p>
        <p>
          可選擇的文字:{" "}
          <button className="arrow-btn" onClick={() => handleStartMove(-1)}>
            &#8249;
          </button>
          <button className="arrow-btn" onClick={() => handleStartMove(1)}>
            &#8250;
          </button>{" "}
          {dispStr}{" "}
          <button className="arrow-btn" onClick={() => handleEndMove(-1)}>
            &#8249;
          </button>
          <button className="arrow-btn" onClick={() => handleEndMove(1)}>
            &#8250;
          </button>
        </p>
        <p>選取的文字: {selectedStr}</p>
        <p>
          對應的元件名稱:{" "}
          <input
            type="text"
            value={correspondedStr}
            onChange={(e) => setCorrespondedStr(e.target.value.trim())}
          />
          <button onClick={() => setCorrespondedStr(selectedStr)}>承上</button>
        </p>
        <p>
          <label>
            套用至全部元件&nbsp;
            <input
              type="checkbox"
              style={{
                width: 18,
                height: 18,
                transform: "translateY(3px)"
              }}
              checked={preserveValue}
              onChange={() => setPreserveValue((prev) => !prev)}
            />
          </label>
        </p>
        <p style={{ alignSelf: "center" }}>
          <button
            className="util-btn"
            onClick={() => {
              handleUpdateMatch({
                popupIndex,
                start: popupStart,
                end: popupEnd,
                value: selectedStr,
                fullValue:
                  correspondedStr === selectedStr ? null : correspondedStr,
                preserveValue
              });
              toggleIsPopupOpen(false);
            }}
          >
            確定
          </button>
          <button className="util-btn" onClick={() => toggleIsPopupOpen(false)}>
            取消
          </button>
        </p>
      </div>
    </Popup>
  );
};

export default ClaimPopup;
