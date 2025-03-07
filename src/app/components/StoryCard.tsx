import "bootstrap/dist/css/bootstrap.min.css";
import { Story } from "../models/story";
import React from "react";
import CardModal from "./CardModal";

interface StoryCardProps {
  story: Story;
  onDelete?: (story: Story) => void;
}

interface StoryCardState {
  showModal: boolean;
}

class StoryCard extends React.Component<StoryCardProps, StoryCardState> {
  constructor(props: StoryCardProps) {
    super(props);
    this.state = {
      showModal: false,
    };
  }

  openModal = () => {
    this.setState({ showModal: true });
  };

  closeModal = () => {
    this.setState({ showModal: false });
  };

  handleSave = (updatedStory: Story) => {
    console.log("Updated story:", updatedStory); // TODO: Optionally notify the user
    this.props.story.acceptanceCriteria = updatedStory.acceptanceCriteria;
    this.props.story.description = updatedStory.description;
    this.props.story.name = updatedStory.name;
    this.closeModal();
  };

  handleDeleteClick = () => {
    if (this.props.onDelete) {
      this.props.onDelete(this.props.story);
    }
  };

  render() {
    const { story } = this.props;
    const { showModal } = this.state;

    return (
      <div
        id={`story-${story.name}`}
        style={{
          marginBottom: "20px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          className="card"
          style={{
            position: "relative", // Needed for absolute positioning of the delete button
            display: "flex",
            flexDirection: "column",
            width: "100%",
            padding: ".5rem",
            margin: "0rem",
            boxShadow: "0.15rem 0.10rem 0.10rem #CCCCCC",
            minWidth: "300px",
            minHeight: "200px",
          }}
        >
          {/* Delete Button in the top right corner */}
          <button
            onClick={this.handleDeleteClick}
            style={{
              position: "absolute",
              top: "0.5rem",
              right: "0.5rem",
              background: "transparent",
              border: "none",
              fontSize: "1.25rem",
              cursor: "pointer",
              color: "#dc3545", // Bootstrap danger color
            }}
            title="Delete Story"
          >
            &times;
          </button>
          
          <div className="card-body">
            <h5
              className="card-title card-link"
              style={{
                fontSize: "1.25rem",
                marginBottom: "0.5rem",
              }}
            >
              <a onClick={this.openModal} style={{ cursor: "pointer" }}>
                {story.name}
              </a>
            </h5>
            <p className="card-text" style={{ fontSize: "1rem" }}>
              {story.description}
            </p>
          </div>
        </div>

        {showModal && (
          <CardModal
            story={story}
            onClose={this.closeModal}
            onSave={this.handleSave}
          />
        )}
      </div>
    );
  }
}

export default StoryCard;
