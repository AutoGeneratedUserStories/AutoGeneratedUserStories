import 'bootstrap.min.css';
import { Story } from '../models/story';
import React from 'react';



interface StoryCardProps{

}

interface StoryCardState{
    story: Story;
}

class StoryCard extends React.Component<StoryCardProps, StoryCardState>{
    constructor(state: StoryCardState){
        super(state);
    }

    render() {
        return (        
        <div className="card" style={{width: "18rem"}}>
            <div className="card-body">
                <h5 className="card-title">Story name</h5>
                    <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                <a href="#" className="btn btn-primary">Awesome</a>
            </div>
        </div>
        )
    }
}

