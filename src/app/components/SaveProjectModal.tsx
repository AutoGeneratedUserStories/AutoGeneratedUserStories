import "bootstrap/dist/css/bootstrap.min.css"; // Correct import for Bootstrap CSS
import React, { useState } from "react";
import { Project } from "../models/project";

interface CardModalProps {
  project: Project;
  onClose: () => void;
  onConfirm: (updatedProject: Project) => void;
}

export default function SaveProjectModal({ project, onClose, onConfirm }: CardModalProps) {
  const [editedName, setEditedName] = useState(project.name);
  const [editedDescription, setEditedDescription] = useState(project.description);
  // const [editedStories, setEditedStories] = useState<Story[]>(project.stories || []);

  // const handleConfirm = () => {
  //   const updatedProject: Project = {
  //     ...project,
  //     name: editedName,
  //     description: editedDescription
  //   };
  //   onConfirm(updatedProject);
  // };

  return (
    <div
      className="modal fade show"
      id="exampleModal"
      style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }} // Display modal with backdrop
    >
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit Project Name and Description</h5>
            {/* dont think we need a close button? */}
            {/* <button type="button" className="close pl-2" onClick={onClose} aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button> */}
          </div>
          <div className="modal-body">
            <form>
              {/* Editable field for the story name */}
              <div className="form-group pb-4">
                <label htmlFor="projectName">Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="projectName"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                />
              </div>
              {/* Editable field for the story description */}
              <div className="form-group pb-4">
                <label htmlFor="projectDescription">Description</label>
                <textarea
                  className="form-control"
                  id="projectDescription"
                  rows={3}
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                ></textarea>
              </div>
            </form>
          </div>
          <div className="modal-footer">
          <button
              type="button"
              className="btn btn-primary"
              onClick={() => onConfirm({ ...project, name: editedName, description: editedDescription })}
            >
              Confirm Save
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
