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
  const [editedAcceptanceCriteria, setEditedAcceptanceCriteria] = useState<string[]>(story.acceptanceCriteria || []);

  const handleCriteriaUpdate = (index: number, updatedCriteria: string) => {
    const newCriteria = [...editedAcceptanceCriteria];
    newCriteria[index] = updatedCriteria;
    setEditedAcceptanceCriteria(newCriteria);
  };

  console.log("Story received:", story);
  console.log("Acceptance criteria:", editedAcceptanceCriteria);

  const handleSave = () => {
    const updatedStory: Story = {
      ...story,
      name: editedName,
      description: editedDescription,
      acceptanceCriteria: editedAcceptanceCriteria,
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
            <button type="button" className="close pl-2" onClick={onClose} aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <form>
              {/* Editable field for the story name */}
              <div className="form-group pb-4">
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
              <div className="form-group pb-4">
                <label htmlFor="storyDescription">Description</label>
                <textarea
                  className="form-control"
                  id="storyDescription"
                  rows={3}
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                ></textarea>
              </div>
              {/* Editable field for the Acceptance Criteria */}
              <div className="form-group pb-2">
                <label>Acceptance Criteria</label>
                  <div className="p-4 border">
                  {editedAcceptanceCriteria.map((criteria, index) => (
                    <div key={index}>
                      <label htmlFor={`acceptanceCriteria-${index}`}>Criteria {index + 1}</label>
                      <textarea
                        className="form-control"
                        id={`acceptanceCriteria-${index}`}
                        rows={3}
                        value={criteria}
                        onChange={(e) => handleCriteriaUpdate(index, e.target.value)}
                      ></textarea>
                    </div>
                  ))}
                </div>
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
