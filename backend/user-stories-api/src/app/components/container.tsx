import React from "react";
import StoryCard from "./StoryCard";
import { Story } from "../models/story";

interface ContainerProps {
  stories: Story[];
}

const Container: React.FC<ContainerProps> = ({ stories }) => {
  return (
    <div className="grid">
      {stories.map((story, index) => (
        <StoryCard key={index} story={story} />
      ))}
    </div>
  );
};

export default Container;
