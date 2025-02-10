'use client';

import { useChat } from 'ai/react';
import { useState } from 'react';
import { generate } from './actions';
import { readStreamableValue } from 'ai/rsc';


export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  // return (
  //   <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
  //     {messages.map(m => (
  //       <div key={m.id} className="whitespace-pre-wrap">
  //         {m.role === 'user' ? 'User: ' : 'AI: '}
  //         {m.content}
  //       </div>
  //     ))}

  //     <form onSubmit={handleSubmit}>
  //       <input
  //         className="fixed dark:bg-zinc-900 bottom-0 w-full max-w-md p-2 mb-8 border border-zinc-300 dark:border-zinc-800 rounded shadow-xl"
  //         value={input}
  //         placeholder="Say something..."
  //         onChange={handleInputChange}
  //       />
  //     </form>
  //   </div>
  // );

  const [generation, setGeneration] = useState<string>('');

  return (
    <div>
      <pre className="p-4">{generation}</pre>
      <div className="fixed bottom-0 inset-x-0 p-4 flex justify-center">
        <div className="flex w-full max-w-md">
          <input
            className="flex-1 dark:bg-zinc-900 p-2 border border-zinc-300 dark:border-zinc-800 rounded-l shadow outline-none"
            value={input}
            placeholder="Say something..."
            onChange={handleInputChange}
          />
          <button
            onClick={async () => {
              const { object } = await generate(input);
              
              for await (const partialObject of readStreamableValue(object)) {
                if (partialObject) {
                  setGeneration(JSON.stringify(partialObject.stories, null, 2));
                }
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-r shadow hover:bg-blue-700 transition-colors"
          >
            Ask
          </button>
        </div>
      </div>
    </div>
  );
  
}