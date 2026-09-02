'use client';
import { useCallback, useState } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  addEdge, 
  applyNodeChanges, 
  applyEdgeChanges,
  Node,
  Edge,
  Connection,
  NodeChange,
  EdgeChange,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useSemanticDispatcher } from '../../lib/api/useSemanticDispatcher';

// Custom Node Component
const PremiumNode = ({ data }: { data: any }) => (
  <div className="px-6 py-4 bg-gray-900/90 backdrop-blur-md border border-blue-500/50 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.2)] text-white font-medium text-sm min-w-[120px] text-center">
    <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-400 border-none" />
    {data.label}
    <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-purple-400 border-none" />
  </div>
);

const nodeTypes = {
  premium: PremiumNode,
};

const initialNodes: Node[] = [
  { id: 'A', type: 'premium', position: { x: 250, y: 100 }, data: { label: 'Glycolysis' } },
  { id: 'B', type: 'premium', position: { x: 100, y: 300 }, data: { label: 'Krebs Cycle' } },
  { id: 'C', type: 'premium', position: { x: 400, y: 300 }, data: { label: 'Electron Transport' } },
];

const initialEdges: Edge[] = [];

export default function NodeCanvasRepresentation() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const dispatchAction = useSemanticDispatcher((state) => state.dispatchAction);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } }, eds));
      if (params.source && params.target) {
        dispatchAction({
          type: 'NODE_CONNECTED',
          source: params.source,
          target: params.target
        });
      }
    },
    [dispatchAction]
  );

  return (
    <div className="w-full h-full bg-black relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gray-950"
      >
        <Background color="#333" gap={20} size={1} />
        <Controls className="!bg-gray-800 !border-gray-700 !fill-white" />
      </ReactFlow>
    </div>
  );
}
