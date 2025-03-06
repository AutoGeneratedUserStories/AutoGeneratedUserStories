import "bootstrap/dist/css/bootstrap.min.css"; // Correct import for Bootstrap CSS
import React, { useState } from "react";
import { Project } from "../models/project";

interface CardModalProps {
  board: string;
  onClose: () => void;
}

export default function SaveProjectModal({ board, onClose }: CardModalProps) {
  const [editedName, setEditedName] = useState(board);

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
                id="projectName"
                value={board}
                onChange={(e) => setEditedName(e.target.value)}
              />
            </div>
          </form>
        </div>
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-danger"
          >
            Confirm Export
          </button>
        </div>
      </div>
    </div>
  </div>
}
