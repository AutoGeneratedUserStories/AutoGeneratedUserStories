import "bootstrap/dist/css/bootstrap.min.css"; // Correct import for Bootstrap CSS
import { Story } from "../models/story";
import React from "react";
import CardModal from "./CardModal";

interface StoryCardProps {
  story: Story;
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
            display: "flex",
            flexDirection: "column",
            width: "100%",
            padding: "1rem",
            margin: "1rem",
            boxShadow: "0.20rem 0.15rem 0.10rem #888888",
            minWidth: "300px",
            minHeight: "200px",
          }}
        >
          <div className="card-body">
            <h5
              className="card-title"
              style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}
            >
              <a onClick={this.openModal} style={{ cursor: "pointer" }}>
                {story.name}
              </a>
            </h5>
            <p className="card-text" style={{ fontSize: "1.2rem" }}>
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
