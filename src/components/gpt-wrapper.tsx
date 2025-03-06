import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {type Node, type Edge } from '@xyflow/react';
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { Button } from './ui/button';

// Define a Zod schema for the Position object
const PositionSchema = z.object({
    x: z.number(),
    y: z.number(),
  });
  
  // Define a Zod schema for the Node object based on React Flow's Node interface
  const NodeSchema = z.object({
    id: z.string(),
    type: z.string().optional(), 
    position: PositionSchema,
    data: z.object({
      label: z.string(),
    }),
  });
  
  // Define a Zod schema for the Edge object based on React Flow's Edge interface
  const EdgeSchema = z.object({
    id: z.string(),
    source: z.string(),
    target: z.string(),
    label: z.string().optional(),
  });
  
  // Define a schema for the full response structure
  const FlowResponseSchema = z.object({
    nodes: z.array(NodeSchema),
    edges: z.array(EdgeSchema),
  });

export type CachedQuery = {prompt: string, json: string};

type GPTWrapperProps = {
    addQueryToCache: (query: CachedQuery) => void;
    setDslResponse: (data: { nodes: Node[]; edges: Edge[] }) => void;
    replayedQuery?: CachedQuery | null;
  };

function GPTWrapper({ addQueryToCache, setDslResponse, replayedQuery }: GPTWrapperProps) {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isOutputVisible, setIsOutputVisible] = useState(true);

    useEffect(() => {
        if (replayedQuery) {
            setPrompt(replayedQuery.prompt);
            setResponse(replayedQuery.json);
            setDslResponse(FlowResponseSchema.parse(JSON.parse(replayedQuery.json)));
        }
    }, [replayedQuery]);

  const handleSendQuery = async () => {
    const dslInstructions = `You are an expert designer. You generate beautiful flowcharts. The client asked for:`;

    // Combine the instructions and query
    const fullPrompt = `${dslInstructions}\n\n${prompt}`;

    try {
        const res = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4o-2024-08-06',
            messages: [{ role: 'user', content: fullPrompt }],
            response_format: zodResponseFormat(FlowResponseSchema, "flow-response"),
          },
          {
            headers: {
              Authorization: `Bearer YOUR_API_TOKEN_HERE`,
            },
          }
        );
  
        const responseString = res.data.choices[0].message.content;
        const parsedData = FlowResponseSchema.parse(JSON.parse(responseString));
        setResponse(responseString);
        addQueryToCache({prompt: prompt, json: responseString});
        setDslResponse(parsedData);
      } catch (error) {
        console.error('Error fetching response:', error);
        setResponse('Error contacting ChatGPT.');
      }
    };

  return (
    <div className="p-2 bg-gray-100 flex flex-col">
        <div className='flex'>
            <textarea
                placeholder="Enter a query to generate a diagram..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="resize-none w-full h-24 p-2 border border-gray-300 rounded mb-2 mr-4"
            />
            <button
                onClick={handleSendQuery}
                className="w-16 mb-2 py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
                ✨
            </button>            
        </div>
        
        <div className='flex'>
            <div className="w-full mr-4 p-2 bg-white border border-gray-300 rounded overflow-y-auto text-xs">
                {isOutputVisible ? (response || 'Response will appear here') : "..."}
            </div>
            <div className='items-end'>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOutputVisible(!isOutputVisible)}
                    className="p-1 w-16 text-xs bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                >
                    {isOutputVisible ? 'Hide' : 'Expand'}
                </Button>
            </div>
        </div>
    </div>
  );
}

export default GPTWrapper;
