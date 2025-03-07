import "bootstrap/dist/css/bootstrap.min.css"; // Correct import for Bootstrap CSS
import React, { useState } from "react";
import { Project } from "../models/project";

interface ExportModalProps {
  project: Project;
  board: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ExportModal({ project, board, onClose, onConfirm }: ExportModalProps) {
  const [editedName, setEditedName] = useState(board);

  return (
    <div
      className="modal fade show"
      id="exampleModal"
      style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }} // Display modal with backdrop
    >
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Export to Trello</h5>
          </div>
          <div className="modal-body">
            <form>
              {/* Editable field for the board name */}
              <div className="form-group pb-4">
                <label htmlFor="projectName">Board Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Give your project a name..."
                  id="projectName"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                />
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-danger"
              onClick={onClose}
            >
              Exit
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={onConfirm}
            >
              Confirm Export
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
