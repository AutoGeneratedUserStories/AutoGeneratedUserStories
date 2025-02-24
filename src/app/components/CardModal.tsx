import "bootstrap/dist/css/bootstrap.min.css"; // Correct import for Bootstrap CSS
import React, { useState } from "react";
import { Story } from "../models/story";

interface CardModalProps {
  story: Story;
  onClose: () => void;
  onSave: (updatedStory: Story) => void;
}

interface AcceptanceCriteriaElementProps {
  criteria: string,
  onUpdate: (updatedCriteria: string) => void;
}

function AcceptanceCriteriaElement({ criteria, onUpdate }: AcceptanceCriteriaElementProps) {
  const [editedCriteria, setEditedCriteria] = useState(criteria);
  
  const handleUpdate = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const updatedCriteria = e.target.value;
    setEditedCriteria(updatedCriteria);
    onUpdate(updatedCriteria)
  }

  return (
    <div>
      <textarea
        className="form-control"
        id="storyCriteria"
        rows={3}
        value={editedCriteria}
        onChange={handleUpdate}
      ></textarea>
    </div>
  )
}

export default function CardModal({ story, onClose, onSave }: CardModalProps) {
  const [editedName, setEditedName] = useState(story.name);
  const [editedDescription, setEditedDescription] = useState(story.description);
  const [editedAcceptanceCriteria, setEditedAcceptanceCriteria] = useState<string[]>(story.acceptanceCriteria || []);

  const handleSave = () => {
    const updatedStory: Story = {
      ...story,
      name: editedName,
      description: editedDescription,
      acceptanceCriteria: editedAcceptanceCriteria,
    };
    onSave(updatedStory);
  };

  const handleCriteriaUpdate = (index: number, updatedCriteria: string) => {
    const updatedCriteriaList = [...editedAcceptanceCriteria];
    updatedCriteriaList[index] = updatedCriteria;
    setEditedAcceptanceCriteria(updatedCriteriaList)
  }

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
                      <AcceptanceCriteriaElement 
                        key={index}
                        criteria={criteria} 
                        onUpdate={(updatedCriteria) => {
                          handleCriteriaUpdate(index, updatedCriteria)
                        }}
                      />
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
