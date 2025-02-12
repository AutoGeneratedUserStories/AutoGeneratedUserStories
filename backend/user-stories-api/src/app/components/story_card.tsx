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
                    {story.acceptanceCriteria.length > 0 && ( 
                        <div>
                            <h6>Acceptance Criteria:</h6>
                            <ul className="list-unstyled">
                                {story.acceptanceCriteria.map((criteria, index) => (
                                    <li key={index}>{criteria}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default StoryCard;