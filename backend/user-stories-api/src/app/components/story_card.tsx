import 'bootstrap/dist/css/bootstrap.min.css'; // Correct import for Bootstrap CSS
import { Story } from '../models/story';
import React from 'react';

interface StoryCardProps {
    story: Story;
}

class StoryCard extends React.Component<StoryCardProps> {
    render() {
        const { story } = this.props;

        return (
            <div className="card" style={{ width: "56rem", padding: "0.5rem", margin: "0.5rem", boxShadow: "0.20rem 0.15rem 0.10rem #888888" }}>
                <div className="card-body">
                    <h5 className="card-title">{story.name}</h5>
                    <p className="card-text">{story.description}</p>
                </div>
            </div>
        );
    }
}

export default StoryCard;