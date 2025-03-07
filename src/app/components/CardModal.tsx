import React from "react";
import ReactDOM from "react-dom";
import { Story } from "../models/story";

interface CardModalProps {
  story: Story;
  onClose: () => void;
  onSave: (updatedStory: Story) => void;
}

export default function CardModal({ story, onClose, onSave }: CardModalProps) {
  const modalContent = (
    <div
      className="modal fade show"
      style={{
        display: "block",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit Story</h5>
            <button
              type="button"
              className="close pl-2"
              onClick={onClose}
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <form>
              <div className="form-group pb-4">
                <label htmlFor="storyName">Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="storyName"
                  value={story.name}
                  onChange={(e) => {}}
                />
              </div>
              <div className="form-group pb-4">
                <label htmlFor="storyDescription">Description</label>
                <textarea
                  className="form-control"
                  id="storyDescription"
                  rows={3}
                  value={story.description}
                  onChange={(e) => {}}
                ></textarea>
              </div>
              {/* Additional fields for acceptance criteria */}
            </form>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-primary" onClick={() => onSave(story)}>
              Save changes
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}
