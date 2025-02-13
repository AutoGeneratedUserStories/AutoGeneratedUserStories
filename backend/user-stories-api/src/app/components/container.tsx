import React from 'react';
import StoryCard from './story_card'; 
import { Story } from '../models/story'; 
import { useChat } from "ai/react";
import { useState, useCallback, useEffect } from "react";
import { readStreamableValue } from "ai/rsc";
import { generate } from "../lib/actions";

interface ContainerProps {
    stories: Story[]; 
}

export default function Container(props: ContainerProps) {
    const { input, handleInputChange } = useChat();
    const [stories, setStories] = useState<Story[]>([]);

    const handleAsk = useCallback(async () => {
        try {
            const { object } = await generate(input);
            // Stream the partial responses
            for await (const partial of readStreamableValue(object)) {
            if (partial?.stories) {
                const newStories = partial.stories.map(
                (story: any) =>
                    new Story(story.name, story.description, story.acceptanceCriteria)
                );
                setStories(newStories);
            }
            }
        } catch (error) {
            console.error("Error during generation:", error);
        }
        }, [input]);
        
        const handleSubmit = useCallback(
        (event: React.FormEvent) => {
            event.preventDefault(); // Prevent the page from reloading
            handleAsk();
        },
        [handleAsk]
    );

    //Initialize stories list when page loads
    useEffect(() => {
        setStories(props.stories);
    }, [props.stories]);
    
    return (
        
        <div className="grid">
            {stories.map((story, index) => (
                <StoryCard key={index} story={story} /> 
            ))}
        <form onSubmit={handleSubmit} className="fixed inset-x-0 bottom-0 flex justify-center p-4">
        <div className="flex w-full max-w-md">
          <input
            type="text"
            className="flex-1 rounded-l border border-zinc-300 p-2"
            value={input}
            onChange={handleInputChange}
            placeholder="Describe your project..."
          />  
          <button
            type="submit"
            className="rounded-r bg-blue-600 px-4 py-2 text-white shadow transition-colors hover:bg-blue-700"
          >
            Ask
          </button>
        </div>
      </form>
      </div>
    );
};