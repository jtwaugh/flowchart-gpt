import { ReactFlow, Background, Controls, MiniMap, type Node, type Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

function Canvas({ elements }: {elements: {nodes: Node[], edges: Edge[]}}) {
  return (
    <div className="flex-1 bg-gray-200 relative overflow-hidden" >
        <ReactFlow 
            nodes={elements.nodes}
            edges={elements.edges}
            nodesDraggable={true}
            fitView
        >
            <Controls />
            <MiniMap />
            <Background gap={12} size={1} />
        </ReactFlow>
    </div>
  );
}

export default Canvas;
