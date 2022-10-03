import React from "react";
import deleteIcon from "../assets/delete_icon.png";

const ClaimEditingForm = ({ num, editingZoneValue, setEditingZoneValue }) => {
  const handleSentenceChange = (e, idx) => {
    setEditingZoneValue(
      editingZoneValue
        .split(`@##@`)
        .map((sentence, _i) => {
          if (idx === _i) {
            return e.target.value;
          }
          return sentence;
        })
        .join(`@##@`)
    );
  };

  const handleSentenceDeleting = (idx) => {
    setEditingZoneValue(
      editingZoneValue
        .split(`@##@`)
        .filter((sentence, _i) => idx !== _i)
        .join(`@##@`)
    );
  };

  return (
    <>
      {editingZoneValue.split(`@##@`).map((sentence, idx) => (
        <div
          key={idx}
          style={{ width: "100%", display: "flex", marginBottom: "0.2em" }}
        >
          {editingZoneValue.split("@##@").length > 1 && (
            <span style={{ backgroundColor: "initial", paddingRight: "0.5em" }}>
              {num}-{idx + 1}
              <br />{" "}
              <img
                src={deleteIcon}
                alt="delete"
                style={{ width: 20, height: 20 }}
                onClick={() => handleSentenceDeleting(idx)}
              />
            </span>
          )}
          <textarea
            style={{
              flexGrow: 1,
              height: editingZoneValue.split(`@##@`).length > 1 ? 100 : 200,
              fontSize: "1.1em"
            }}
            value={sentence}
            onChange={(e) => handleSentenceChange(e, idx)}
          />
        </div>
      ))}
      <button
        style={{ width: "12%", fontSize: "0.75em", marginLeft: "85%" }}
        onClick={() => setEditingZoneValue((prev) => prev + `@##@`)}
      >
        新增段句
      </button>
    </>
  );
};

export default ClaimEditingForm;

/**
 *               value={editingZoneValue}
              onChange={(e) => setEditingZoneValue(e.target.value)}
 */
