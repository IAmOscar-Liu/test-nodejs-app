import React from "react";
import deleteIcon from "../assets/delete_icon.png";

const EditingNewClaimTextArea = ({ editingZoneValue, setEditingZoneValue }) => {
  const handleAddingSentence = (e, idx) => {
    setEditingZoneValue((prev) => ({
      ...prev,
      content: prev.content
        .split(`@##@`)
        .map((sentence, _i) => {
          if (_i === idx) {
            return e.target.value;
          }
          return sentence;
        })
        .join(`@##@`)
    }));
  };

  const handleDeletingSentence = (idx) => {
    setEditingZoneValue((prev) => ({
      ...prev,
      content: prev.content
        .split(`@##@`)
        .filter((sentence, _i) => _i !== idx)
        .join(`@##@`)
    }));
  };

  return (
    <>
      {editingZoneValue.content.split(`@##@`).map((sentence, idx) => (
        <div
          key={idx}
          style={{ width: "100%", display: "flex", marginBottom: "0.2em" }}
        >
          {editingZoneValue.content.split(`@##@`).length > 1 && (
            <span style={{ minWidth: 45, paddingRight: "0.5em" }}>
              {editingZoneValue.claimNum}-{idx + 1}
              <br />{" "}
              <img
                style={{ width: 20, height: 20 }}
                src={deleteIcon}
                alt="delete"
                onClick={() => handleDeletingSentence(idx)}
              />
            </span>
          )}
          <textarea
            style={{
              flexGrow: 1,
              height:
                editingZoneValue.content.split(`@##@`).length > 1 ? 100 : 200,
              fontSize: "1.1em"
            }}
            value={sentence}
            onChange={(e) => handleAddingSentence(e, idx)}
          />
        </div>
      ))}
      <button
        style={{ width: "12%", fontSize: "0.95em", marginLeft: "85%" }}
        onClick={() =>
          setEditingZoneValue((prev) => ({
            ...prev,
            content: prev.content + `@##@`
          }))
        }
      >
        新增段句
      </button>
    </>
  );
};

export default EditingNewClaimTextArea;
