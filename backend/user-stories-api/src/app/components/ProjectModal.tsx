import "bootstrap/dist/css/bootstrap.min.css"; // Correct import for Bootstrap CSS
import React, { useState } from "react";
import { Project } from "../models/project";

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
  onSave: (updatedProject: Project) => void;
}

export default function ProjectModal({ project, onClose, onSave }: ProjectModalProps) {
  const [editedName, setEditedName] = useState(project.name);
  const [editedDescription, setEditedDescription] = useState(project.description);

  const handleSave = () => {
    const updatedProject: Project = {
      ...project,
      name: editedName,
      description: editedDescription,
    };
    onSave(updatedProject);
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
            <h5 className="modal-title">Edit Project</h5>
            <button type="button" className="close" onClick={onClose} aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <form>
              {/* Editable field for the project name */}
              <div className="form-group">
                <label htmlFor="projectName">Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="projectName"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                />
              </div>
              {/* Editable field for the project description */}
              <div className="form-group">
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
