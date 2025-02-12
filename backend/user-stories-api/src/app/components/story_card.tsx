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
            <div className="card" style={{ width: "18rem" }}>
                <div className="card-body">
                    <h5 className="card-title">{story.name}</h5>
                    <p className="card-text">{story.description}</p>
                </div>
            </div>
        );
    }
}

export default StoryCard;