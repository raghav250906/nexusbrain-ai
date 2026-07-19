import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Network,
  Search,
  Sliders,
  Plus,
  Compass,
  Info,
  Layers,
  Sparkles,
  Database,
  Trash2,
  RefreshCw,
  HelpCircle,
  Maximize2
} from 'lucide-react';
import PageHeader from './PageHeader';
import { NodeItem, LinkItem } from '../types';

export default function KnowledgeGraphView() {
  const [nodes, setNodes] = useState<NodeItem[]>([
    { id: '1', label: 'Tenant corp-nexus-01', type: 'entity', val: 12, connections: ['2', '3', '4'] },
    { id: '2', label: 'Q3 Financials Asset', type: 'document', val: 8, connections: ['1', '5'] },
    { id: '3', label: 'GDPR Compliance Check', type: 'concept', val: 15, connections: ['1', '6', '7'] },
    { id: '4', label: 'AI Reasoning Agent v4', type: 'agent', val: 10, connections: ['1', '8'] },
    { id: '5', label: 'Revenue Forecasting Matrix', type: 'concept', val: 6, connections: ['2'] },
    { id: '6', label: 'Data Residency Regulations', type: 'concept', val: 7, connections: ['3'] },
    { id: '7', label: 'EU Privacy Sandbox', type: 'concept', val: 5, connections: ['3', '8'] },
    { id: '8', label: 'Automated Compliance Auditor', type: 'agent', val: 9, connections: ['4', '7'] },
  ]);

  const [selectedNodeId, setSelectedNodeId] = useState<string>('1');
  const [density, setDensity] = useState<'low' | 'medium' | 'high'>('medium');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Adding new mock node state
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [newNodeType, setNewNodeType] = useState<'concept' | 'entity' | 'document' | 'agent'>('concept');
  const [newNodeConnection, setNewNodeConnection] = useState('1');

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  const handleAddNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeLabel.trim()) return;

    const newId = (nodes.length + 1).toString();
    const nodeToAdd: NodeItem = {
      id: newId,
      label: newNodeLabel.trim(),
      type: newNodeType,
      val: Math.floor(Math.random() * 8) + 4,
      connections: [newNodeConnection],
    };

    // Update both the new node and target node connection lists
    setNodes(prev => {
      const updated = prev.map(n => {
        if (n.id === newNodeConnection) {
          return { ...n, connections: [...n.connections, newId] };
        }
        return n;
      });
      return [...updated, nodeToAdd];
    });

    setSelectedNodeId(newId);
    setNewNodeLabel('');
  };

  const handleRemoveNode = (id: string) => {
    if (id === '1') return; // protect tenant core node
    setNodes(prev => prev.filter(n => n.id !== id).map(n => ({
      ...n,
      connections: n.connections.filter(c => c !== id)
    })));
    setSelectedNodeId('1');
  };

  const filteredNodes = nodes.filter(n => 
    n.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // SVG dimensions for render
  const width = 500;
  const height = 300;

  // Simple hardcoded coordinates for beautiful network nodes rendering
  const coordinates: Record<string, { x: number; y: number }> = {
    '1': { x: 250, y: 150 }, // Central Tenant
    '2': { x: 120, y: 80 },  // Financials Doc
    '3': { x: 380, y: 90 },  // GDPR Compliance Check
    '4': { x: 130, y: 220 }, // AI Reasoning Agent
    '5': { x: 50, y: 50 },   // Revenue Forecasting
    '6': { x: 450, y: 50 },  // Data Residency
    '7': { x: 430, y: 200 }, // EU Privacy Sandbox
    '8': { x: 280, y: 250 }, // Compliance Agent
  };

  // Safe fallback coordinates for dynamically added nodes
  const getCoordinates = (nodeId: string, idx: number) => {
    if (coordinates[nodeId]) return coordinates[nodeId];
    
    // Distribute custom nodes evenly in a circle around center
    const totalCount = nodes.length;
    const angle = (Number(nodeId) * (360 / totalCount) * Math.PI) / 180;
    const radius = 110;
    return {
      x: Math.round(250 + radius * Math.cos(angle)),
      y: Math.round(150 + radius * Math.sin(angle)),
    };
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Knowledge Synapse Matrix"
        description="Navigate and index multi-dimensional connections extracted from corporate documents. Uncover relationships, graph densities, and knowledge clusters."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Visual Graph Canvas Container */}
        <div className="lg:col-span-2 p-5 rounded-xl border border-[#1E293B] bg-[#0F1219] flex flex-col justify-between min-h-[420px] shadow-lg shadow-black/20">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-[#1E293B] mb-4">
              <div className="flex items-center gap-2">
                <Network className="w-4.5 h-4.5 text-blue-500" />
                <h3 className="text-sm font-semibold text-slate-200">Interactive Connectivity Space</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 font-mono font-bold">DENSITY PROFILE:</span>
                <div className="flex bg-[#0B0E14] border border-[#1E293B] p-0.5 rounded text-[9px] font-bold uppercase">
                  {['low', 'medium', 'high'].map(d => (
                    <button
                      key={d}
                      onClick={() => setDensity(d as any)}
                      className={`px-2 py-0.5 rounded cursor-pointer transition-colors outline-none ${density === d ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom SVG interactive workspace */}
            <div className="relative h-72 w-full bg-[#0B0E14] border border-[#1E293B] rounded-lg overflow-hidden flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full select-none" viewBox={`0 0 ${width} ${height}`}>
                {/* Node link connections */}
                <g className="stroke-[#1E293B] stroke-1.5">
                  {nodes.map((sourceNode, sIdx) => {
                    const sourceCoord = getCoordinates(sourceNode.id, sIdx);
                    return sourceNode.connections.map((targetId) => {
                      const tIdx = nodes.findIndex(n => n.id === targetId);
                      if (tIdx === -1) return null;
                      const targetNode = nodes[tIdx];
                      const targetCoord = getCoordinates(targetId, tIdx);

                      // density filters (high shows all connections, medium shows standard, low filters some)
                      if (density === 'low' && (Number(sourceNode.id) > 5 || Number(targetNode.id) > 5)) return null;

                      const isSelectedLink = selectedNodeId === sourceNode.id || selectedNodeId === targetId;

                      return (
                        <line
                          key={`${sourceNode.id}-${targetId}`}
                          x1={sourceCoord.x}
                          y1={sourceCoord.y}
                          x2={targetCoord.x}
                          y2={targetCoord.y}
                          className={`transition-all duration-300 ${
                            isSelectedLink 
                              ? 'stroke-blue-500/80 stroke-[2px] animate-pulse' 
                              : 'stroke-[#1E293B]/60'
                          }`}
                        />
                      );
                    });
                  })}
                </g>

                {/* Nodes rendering */}
                <g>
                  {nodes.map((node, idx) => {
                    const coord = getCoordinates(node.id, idx);
                    const isSelected = selectedNodeId === node.id;
                    
                    // density checks
                    if (density === 'low' && Number(node.id) > 6) return null;

                    let nodeColor = 'fill-slate-850 stroke-slate-700';
                    if (node.type === 'concept') nodeColor = 'fill-blue-500/10 stroke-blue-500';
                    if (node.type === 'entity') nodeColor = 'fill-emerald-500/10 stroke-emerald-500';
                    if (node.type === 'document') nodeColor = 'fill-amber-500/10 stroke-amber-500';
                    if (node.type === 'agent') nodeColor = 'fill-purple-500/10 stroke-purple-500';

                    return (
                      <g
                        key={node.id}
                        className="cursor-pointer"
                        onClick={() => setSelectedNodeId(node.id)}
                      >
                        {/* Selected halo */}
                        {isSelected && (
                          <circle
                            cx={coord.x}
                            cy={coord.y}
                            r={node.val + 8}
                            className="fill-blue-500/10 stroke-blue-500/30 stroke-dashed animate-spin stroke-2"
                            style={{ transformOrigin: `${coord.x}px ${coord.y}px`, animationDuration: '8s' }}
                          />
                        )}

                        <circle
                          cx={coord.x}
                          cy={coord.y}
                          r={node.val}
                          className={`transition-all duration-200 stroke-2 ${nodeColor} ${
                            isSelected ? 'scale-125' : ''
                          }`}
                        />
                        <text
                          x={coord.x}
                          y={coord.y - node.val - 6}
                          textAnchor="middle"
                          className={`text-[9px] font-mono select-none font-bold ${
                            isSelected ? 'fill-blue-400' : 'fill-slate-500'
                          }`}
                        >
                          {node.label}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>

              {/* HUD Overlay controls */}
              <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 bg-[#0B0E14]/90 border border-[#1E293B] rounded-md p-1 shadow-lg">
                <button className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded outline-none" title="Recenter force simulation">
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <div className="w-px h-3 bg-[#1E293B]" />
                <span className="text-[9px] font-mono text-slate-500 px-1 select-none font-bold">ZOOM 100%</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1E293B] flex justify-between items-center text-[10px] text-slate-500 font-mono">
            <div className="flex gap-4">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Concept
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Entity
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Doc Link
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Agent
              </span>
            </div>
            <span className="font-bold">8 Active Vertices</span>
          </div>
        </div>

        {/* Right columns: Node Inspector & Creator Panel */}
        <div className="space-y-6">
          
          {/* Node Inspector */}
          <div className="p-5 rounded-xl border border-[#1E293B] bg-[#0F1219] shadow-lg shadow-black/20">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-3">
              Synaptic Inspector
            </span>

            <AnimatePresence mode="wait">
              {selectedNode ? (
                <motion.div
                  key={selectedNode.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-white">{selectedNode.label}</h4>
                      <span className="text-[10px] font-bold uppercase text-blue-500 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded mt-1.5 inline-block">
                        {selectedNode.type}
                      </span>
                    </div>
                    {selectedNode.id !== '1' && (
                      <button
                        onClick={() => handleRemoveNode(selectedNode.id)}
                        className="p-1 rounded bg-[#0B0E14] hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 border border-[#1E293B] transition-all cursor-pointer outline-none"
                        title="Delete connection node"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2 bg-[#0B0E14]/40 border border-[#1E293B] rounded">
                      <span className="text-[10px] text-slate-500 block font-bold">NODE WEIGHT</span>
                      <span className="text-slate-300 font-semibold">{selectedNode.val} px rad</span>
                    </div>
                    <div className="p-2 bg-[#0B0E14]/40 border border-[#1E293B] rounded">
                      <span className="text-[10px] text-slate-500 block font-bold">VERTICES</span>
                      <span className="text-slate-300 font-semibold">{selectedNode.connections.length} edges</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block uppercase mb-1.5">Direct Proximities</span>
                    <div className="space-y-1">
                      {selectedNode.connections.map(id => {
                        const target = nodes.find(n => n.id === id);
                        if (!target) return null;
                        return (
                          <div
                            key={id}
                            onClick={() => setSelectedNodeId(id)}
                            className="flex items-center justify-between p-2 rounded bg-[#0B0E14]/40 border border-[#1E293B] hover:border-slate-600 hover:bg-slate-850 cursor-pointer text-xs text-slate-300 transition-all outline-none"
                          >
                            <span className="truncate font-semibold">{target.label}</span>
                            <span className="text-[10px] text-blue-500 font-bold uppercase bg-blue-500/10 px-1.5 rounded">
                              {target.type}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs font-mono">
                  Select any synapse node to inspect details.
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Node Integrator */}
          <div className="p-5 rounded-xl border border-[#1E293B] bg-[#0F1219] shadow-lg shadow-black/20">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-3">
              Inject Synaptic Connection
            </span>
            <form onSubmit={handleAddNode} className="space-y-3.5">
              <div>
                <label className="text-[10px] text-slate-400 font-mono block mb-1 font-bold uppercase">NODE LABEL</label>
                <input
                  type="text"
                  value={newNodeLabel}
                  onChange={(e) => setNewNodeLabel(e.target.value)}
                  placeholder="e.g., Compliance Sandbox v2"
                  className="w-full h-9 bg-[#0B0E14] border border-[#1E293B] focus:border-blue-500 rounded px-2.5 text-xs text-slate-200 placeholder-slate-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 font-mono block mb-1 font-bold uppercase">NODE TYPE</label>
                  <select
                    value={newNodeType}
                    onChange={(e) => setNewNodeType(e.target.value as any)}
                    className="w-full h-9 bg-[#0B0E14] border border-[#1E293B] rounded px-1.5 text-xs text-slate-300 outline-none"
                  >
                    <option value="concept">Concept</option>
                    <option value="entity">Entity</option>
                    <option value="document">Doc Link</option>
                    <option value="agent">Agent</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-mono block mb-1 font-bold uppercase">CONNECT TO</label>
                  <select
                    value={newNodeConnection}
                    onChange={(e) => setNewNodeConnection(e.target.value)}
                    className="w-full h-9 bg-[#0B0E14] border border-[#1E293B] rounded px-1.5 text-xs text-slate-300 outline-none"
                  >
                    {nodes.map(n => (
                      <option key={n.id} value={n.id}>{n.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-9 rounded-md bg-blue-600 hover:bg-blue-700 text-xs font-bold uppercase tracking-wider text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer outline-none shadow-lg shadow-blue-500/10"
              >
                <Plus className="w-3.5 h-3.5" />
                Integrate Node
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
