import "bootstrap/dist/css/bootstrap.min.css"; // Correct import for Bootstrap CSS
import React, { useState } from "react";
import { Story } from "../models/story";

interface CardModalProps {
  story: Story;
  onClose: () => void;
  onSave: (updatedStory: Story) => void;
}

export default function CardModal({ story, onClose, onSave }: CardModalProps) {
  const [editedName, setEditedName] = useState(story.name);
  const [editedDescription, setEditedDescription] = useState(story.description);
  const [editedAcceptanceCriteria, setEditedAcceptanceCriteria] = useState(story.acceptanceCriteria);

  const handleSave = () => {
    const updatedStory: Story = {
      ...story,
      name: editedName,
      description: editedDescription,
    };
    onSave(updatedStory);
  };

  return (
    <div
      className="modal fade show"
      id="exampleModal"
      style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }} // Display modal with backdrop
    >
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit Story</h5>
            <button type="button" className="close" onClick={onClose} aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <form>
              {/* Editable field for the story name */}
              <div className="form-group">
                <label htmlFor="storyName">Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="storyName"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                />
              </div>
              {/* Editable field for the story description */}
              <div className="form-group">
                <label htmlFor="storyDescription">Description</label>
                <textarea
                  className="form-control"
                  id="storyDescription"
                  rows={3}
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                ></textarea>
              </div>
              {/* Editable field for each acceptance criteria */}
              <div className="form-group">
                <label htmlFor="acceptanceCriteria"></label>
                {story.acceptanceCriteria?.map((value) => {
                  return <p>{value}</p>
                })}
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-primary" onClick={handleSave}>
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
}
