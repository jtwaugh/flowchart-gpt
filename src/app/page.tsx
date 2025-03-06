'use client'

import { useState } from 'react';
import Canvas from '../components/canvas';
import GPTWrapper, {type CachedQuery} from '../components/gpt-wrapper';
import { Sidebar, SidebarHeader, SidebarProvider } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { type Edge, type Node } from '@xyflow/react';

function AppLayout() {
  const [cachedQueries, setCachedQueries] = useState<CachedQuery[]>([]);
  const [dslResponse, setDslResponse] = useState<{nodes: Node[], edges: Edge[]}>({nodes: [], edges: []});
  const [replayedQuery, setReplayedQuery] = useState<CachedQuery | null>(null); // Track replayed query

  const addQueryToCache = (query: CachedQuery) => {
    setCachedQueries([...cachedQueries, query]);
  };

  const replayQuery = (query: CachedQuery) => {
    setReplayedQuery(query);
  };

  return (
       <div className="flex h-screen">
        <div className="flex bg-gray-50 p-2 shadow-lg overflow-y-auto">
          <SidebarProvider>
            <Sidebar className="w-64 bg-gray-50 overflow-y-auto shadow-lg" variant='sidebar'>
              <SidebarHeader className="text-lg font-semibold mb-2">
                Cached Queries
              </SidebarHeader>
              <Separator className="my-2" />
              {cachedQueries.map((query, index) => (
                <div key={index}>
                  <div className="flex flex-col hover:bg-gray-300 rounded p-2 cursor-pointer" onClick={() => replayQuery(query)}>
                    <div className="flex justify-between items-center w-full">
                      <span className="text-xs flex-shrink-0 text-left text-gray-700 mr-4">{index + 1}. {query.prompt}</span>
                    </div>
                  </div>
                </div>
              ))}
            </Sidebar>
          </SidebarProvider>
      </div>
      <div className="flex-1 flex-col flex">
        <GPTWrapper addQueryToCache={addQueryToCache} setDslResponse={setDslResponse} replayedQuery={replayedQuery} />
        <Canvas elements={dslResponse} />
      </div>
    </div>
  );
}

export default AppLayout;
