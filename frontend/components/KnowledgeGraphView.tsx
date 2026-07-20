import api from "../lib/api";
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  Simulation,
  SimulationNodeDatum,
} from 'd3-force';

interface NodeItem {
  id: string;
  label: string;
  type: string;
}

interface EdgeItem {
  source: string;
  target: string;
}

// Internal simulation node/link shapes (d3-force mutates these in place)
interface SimNode extends SimulationNodeDatum, NodeItem {
  id: string;
}

interface SimLink {
  source: SimNode | string;
  target: SimNode | string;
}

// --- Visual encoding helpers (colors/sizes per node.type) ---------------

const TYPE_STYLE: Record<string, { fill: string; stroke: string; text: string; dot: string }> = {
  document: { fill: 'fill-orange-500/15', stroke: 'stroke-orange-500', text: 'fill-orange-400', dot: 'bg-orange-500' },
  technology: { fill: 'fill-blue-500/15', stroke: 'stroke-blue-500', text: 'fill-blue-400', dot: 'bg-blue-500' },
  skill: { fill: 'fill-emerald-500/15', stroke: 'stroke-emerald-500', text: 'fill-emerald-400', dot: 'bg-emerald-500' },
  project: { fill: 'fill-purple-500/15', stroke: 'stroke-purple-500', text: 'fill-purple-400', dot: 'bg-purple-500' },
  organization: { fill: 'fill-cyan-500/15', stroke: 'stroke-cyan-500', text: 'fill-cyan-400', dot: 'bg-cyan-500' },
  location: { fill: 'fill-red-500/15', stroke: 'stroke-red-500', text: 'fill-red-400', dot: 'bg-red-500' },
  concept: { fill: 'fill-yellow-500/15', stroke: 'stroke-yellow-500', text: 'fill-yellow-400', dot: 'bg-yellow-500' },
};
const UNKNOWN_STYLE = { fill: 'fill-slate-500/15', stroke: 'stroke-slate-500', text: 'fill-slate-400', dot: 'bg-slate-500' };

const getNodeStyle = (type: string) => TYPE_STYLE[type] || UNKNOWN_STYLE;

// Radius mapping derived from node.type (documents = largest hub, entities = smallest)
const getNodeRadius = (type: string): number => {
  switch (type) {
    case 'document':
      return 16;
    case 'technology':
    case 'skill':
    case 'organization':
    case 'project':
      return 10;
    case 'concept':
    case 'location':
      return 8;
    default:
      return 7; // person / other / unknown entities render slightly smaller
  }
};

// Deterministic small offset so newly-added nodes don't all spawn on the exact
// same pixel (avoids relying on Math.random on every render).
const hashOffset = (id: string, spread: number) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return ((h % 1000) / 1000 - 0.5) * spread;
};

export default function KnowledgeGraphView() {
  const [nodes, setNodes] = useState<NodeItem[]>([]);
  const [edges, setEdges] = useState<EdgeItem[]>([]);

  const [selectedNodeId, setSelectedNodeId] = useState<string>('1');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [density, setDensity] = useState<'low' | 'medium' | 'high'>('medium');
  const [searchQuery, setSearchQuery] = useState('');

  // Adding new node state
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [newNodeType, setNewNodeType] = useState('concept');
  const [newNodeConnection, setNewNodeConnection] = useState('1');

  useEffect(() => {
    loadGraph();
  }, []);

  const loadGraph = async () => {
    try {
      const res = await api.get("/graph");

      if (res.data.success) {
        setNodes(res.data.nodes);
        setEdges(res.data.edges);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  const handleAddNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeLabel.trim()) return;

    const newId = (nodes.length + 1).toString();
    const nodeToAdd: NodeItem = {
      id: newId,
      label: newNodeLabel.trim(),
      type: newNodeType,
    };
    const edgeToAdd: EdgeItem = {
      source: newNodeConnection,
      target: newId,
    };

    setNodes(prev => [...prev, nodeToAdd]);
    setEdges(prev => [...prev, edgeToAdd]);

    setSelectedNodeId(newId);
    setNewNodeLabel('');
  };

  const handleRemoveNode = (id: string) => {
    if (id === '1') return; // protect tenant core node
    setNodes(prev => prev.filter(n => n.id !== id));
    setEdges(prev => prev.filter(e => e.source !== id && e.target !== id));
    setSelectedNodeId('1');
  };

  // Connected edges/nodes for the currently selected node, derived from edges
  const selectedNodeEdges = selectedNode
    ? edges.filter(edge => edge.source === selectedNode.id || edge.target === selectedNode.id)
    : [];
  const selectedNodeConnections = selectedNode
    ? selectedNodeEdges
        .map(edge => (edge.source === selectedNode.id ? edge.target : edge.source))
        .map(id => nodes.find(n => n.id === id))
        .filter((n): n is NodeItem => Boolean(n))
    : [];

  const filteredNodes = nodes.filter(n =>
    n.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Density filter applied to the simulation node set (index-based, no numeric ID assumption)
  const visibleNodes = useMemo(() => {
    if (density === 'low') return nodes.filter((_, idx) => idx < Math.max(6, Math.ceil(nodes.length * 0.35)));
    if (density === 'high') return nodes;
    return nodes.filter((_, idx) => idx < Math.max(12, Math.ceil(nodes.length * 0.7)));
  }, [nodes, density]);

  const visibleIds = useMemo(() => new Set(visibleNodes.map(n => n.id)), [visibleNodes]);
  const visibleEdges = useMemo(
    () => edges.filter(e => visibleIds.has(e.source) && visibleIds.has(e.target)),
    [edges, visibleIds]
  );

  // ---------------------------------------------------------------------
  // Force-directed simulation (d3-force). Nodes/edges are the ONLY data
  // source — no mock data, no hardcoded coordinates, no per-render randomness.
  // ---------------------------------------------------------------------

  const width = 500;
  const height = 300;
  const centerX = width / 2;
  const centerY = height / 2;

  const svgRef = useRef<SVGSVGElement | null>(null);
  const viewportRef = useRef<SVGGElement | null>(null); // pan/zoom transform target

  const simNodesRef = useRef<SimNode[]>([]);
  const simLinksRef = useRef<SimLink[]>([]);
  const simulationRef = useRef<Simulation<SimNode, SimLink> | null>(null);
  // Bumped only when the SET of nodes/links changes (add/remove/density filter),
  // so React re-mounts the right DOM elements. Per-tick position updates below
  // bypass React entirely and write straight to those elements' attributes.
  const [zoomPercent, setZoomPercent] = useState(100);
  const [graphVersion, setGraphVersion] = useState(0);

  const nodeElRefs = useRef<Map<string, SVGGElement>>(new Map());
  const lineElRefs = useRef<Map<number, SVGLineElement>>(new Map());
  const textElRefs = useRef<Map<string, SVGTextElement>>(new Map());

  const transformRef = useRef({ x: 0, y: 0, k: 1 });
  const panState = useRef<{ dragging: boolean; startX: number; startY: number }>({ dragging: false, startX: 0, startY: 0 });
  const dragNodeRef = useRef<SimNode | null>(null);

  const applyTransform = useCallback(() => {
    const { x, y, k } = transformRef.current;
    if (viewportRef.current) {
      viewportRef.current.setAttribute('transform', `translate(${x},${y}) scale(${k})`);
    }
    // Hide labels when zoomed far out so text doesn't clutter the canvas
    const showLabels = k >= 0.65;
    textElRefs.current.forEach((el) => {
      el.style.opacity = showLabels ? '1' : '0';
    });
  }, []);

  const getSvgPoint = useCallback((clientX: number, clientY: number, ctmEl: SVGGraphicsElement | null) => {
    const svg = svgRef.current;
    if (!svg || !ctmEl) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = ctmEl.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const local = pt.matrixTransform(ctm.inverse());
    return { x: local.x, y: local.y };
  }, []);

  // Rebuild / update the simulation whenever the visible graph changes.
  useEffect(() => {
    const existingById = new Map(simNodesRef.current.map(n => [n.id, n]));

    const nextSimNodes: SimNode[] = visibleNodes.map((n) => {
      const prev = existingById.get(n.id);
      if (prev) {
        return { ...prev, label: n.label, type: n.type };
      }
      return {
        id: n.id,
        label: n.label,
        type: n.type,
        x: centerX + hashOffset(n.id, 40),
        y: centerY + hashOffset(n.id + 'y', 40),
      };
    });

    const nodeById = new Map(nextSimNodes.map(n => [n.id, n]));
    const nextSimLinks: SimLink[] = visibleEdges
      .map(e => {
        const source = nodeById.get(e.source);
        const target = nodeById.get(e.target);
        if (!source || !target) return null;
        return { source, target } as SimLink;
      })
      .filter((l): l is SimLink => Boolean(l));

    simNodesRef.current = nextSimNodes;
    simLinksRef.current = nextSimLinks;
    // One React render to (re)mount the correct <g>/<line> elements for this
    // node/link set. After this, the 'tick' handler below writes positions
    // straight to those DOM nodes and does NOT touch React state.
    setGraphVersion(v => v + 1);

    if (simulationRef.current) {
      simulationRef.current.stop();
    }

    const sim = forceSimulation<SimNode>(nextSimNodes)
      .force(
        'link',
        forceLink<SimNode, SimLink>(nextSimLinks)
          .id(d => d.id)
          // Documents pull their entities in tight, forming visible hubs/clusters
          .distance(l => {
            const s = l.source as SimNode;
            const t = l.target as SimNode;
            const involvesDoc = s.type === 'document' || t.type === 'document';
            return involvesDoc ? 55 : 85;
          })
          .strength(0.75)
      )
      .force('charge', forceManyBody().strength(-170))
      .force('center', forceCenter(centerX, centerY))
      .force('collide', forceCollide<SimNode>().radius(d => getNodeRadius(d.type) + 16).strength(0.9))
      .alpha(1)
      .on('tick', () => {
        for (const n of simNodesRef.current) {
          const el = nodeElRefs.current.get(n.id);
          if (el) el.setAttribute('transform', `translate(${n.x ?? 0},${n.y ?? 0})`);
        }
        simLinksRef.current.forEach((l, i) => {
          const line = lineElRefs.current.get(i);
          if (!line) return;
          const s = l.source as SimNode;
          const t = l.target as SimNode;
          line.setAttribute('x1', String(s.x ?? 0));
          line.setAttribute('y1', String(s.y ?? 0));
          line.setAttribute('x2', String(t.x ?? 0));
          line.setAttribute('y2', String(t.y ?? 0));
        });
      });

    simulationRef.current = sim;

    return () => {
      sim.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleNodes, visibleEdges, centerX, centerY]);

  // --- Drag interaction: node follows cursor, sim reheats, then relaxes ---

  const handleNodePointerDown = useCallback((e: React.PointerEvent, node: SimNode) => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragNodeRef.current = node;
    const sim = simulationRef.current;
    if (sim) sim.alphaTarget(0.3).restart();
    node.fx = node.x;
    node.fy = node.y;

    const handleMove = (ev: PointerEvent) => {
      const dragged = dragNodeRef.current;
      if (!dragged || !viewportRef.current) return;
      const p = getSvgPoint(ev.clientX, ev.clientY, viewportRef.current);
      dragged.fx = p.x;
      dragged.fy = p.y;
    };
    const handleUp = () => {
      const dragged = dragNodeRef.current;
      if (dragged) {
        dragged.fx = null;
        dragged.fy = null;
      }
      dragNodeRef.current = null;
      if (sim) sim.alphaTarget(0);
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  }, [getSvgPoint]);

  // --- Pan (drag empty background) ---

  const handleBackgroundPointerDown = useCallback((e: React.PointerEvent) => {
    if (dragNodeRef.current) return;
    panState.current = { dragging: true, startX: e.clientX, startY: e.clientY };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }, []);

  const handleBackgroundPointerMove = useCallback((e: React.PointerEvent) => {
    if (!panState.current.dragging || !svgRef.current) return;
    const svg = svgRef.current;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const scaleX = ctm.a; // screen px -> viewBox units
    const dx = (e.clientX - panState.current.startX) / scaleX;
    const dy = (e.clientY - panState.current.startY) / scaleX;
    transformRef.current = {
      ...transformRef.current,
      x: transformRef.current.x + dx,
      y: transformRef.current.y + dy,
    };
    panState.current.startX = e.clientX;
    panState.current.startY = e.clientY;
    applyTransform();
  }, [applyTransform]);

  const handleBackgroundPointerUp = useCallback(() => {
    panState.current.dragging = false;
  }, []);

  // --- Zoom (mouse wheel), zooms toward the cursor position ---

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const svg = svgRef.current;
    if (!svg) return;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const scaleX = ctm.a;
    const pointerX = (e.clientX - ctm.e) / scaleX;
    const pointerY = (e.clientY - ctm.f) / scaleX;

    const { x, y, k } = transformRef.current;
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    const nextK = Math.min(4, Math.max(0.3, k * factor));

    // Keep the point under the cursor stationary while zooming
    const graphX = (pointerX - x) / k;
    const graphY = (pointerY - y) / k;
    const nextX = pointerX - graphX * nextK;
    const nextY = pointerY - graphY * nextK;

    transformRef.current = { x: nextX, y: nextY, k: nextK };
    applyTransform();
    setZoomPercent(Math.round(nextK * 100));
  }, [applyTransform]);

  useEffect(() => {
    applyTransform();
  }, [applyTransform, graphVersion]);

  const setNodeRef = useCallback((id: string, el: SVGGElement | null) => {
    if (el) nodeElRefs.current.set(id, el);
    else nodeElRefs.current.delete(id);
  }, []);

  const setLineRef = useCallback((idx: number, el: SVGLineElement | null) => {
    if (el) lineElRefs.current.set(idx, el);
    else lineElRefs.current.delete(idx);
  }, []);

  const setTextRef = useCallback((id: string, el: SVGTextElement | null) => {
    if (el) textElRefs.current.set(id, el);
    else textElRefs.current.delete(id);
  }, []);

  // Which nodes are "related" to the current selection/hover, for fade/highlight
  const highlightId = hoveredNodeId ?? selectedNodeId;
  const relatedIds = useMemo(() => {
    if (!highlightId) return null;
    const s = new Set<string>([highlightId]);
    visibleEdges.forEach(e => {
      if (e.source === highlightId) s.add(e.target);
      if (e.target === highlightId) s.add(e.source);
    });
    return s;
  }, [highlightId, visibleEdges]);

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

            {/* Custom SVG interactive workspace: force-directed, draggable, zoom/pan */}
            <div className="relative h-72 w-full bg-[#0B0E14] border border-[#1E293B] rounded-lg overflow-hidden flex items-center justify-center">
              <svg
                ref={svgRef}
                className="absolute inset-0 w-full h-full select-none cursor-grab active:cursor-grabbing"
                viewBox={`0 0 ${width} ${height}`}
                onWheel={handleWheel}
                onPointerDown={handleBackgroundPointerDown}
                onPointerMove={handleBackgroundPointerMove}
                onPointerUp={handleBackgroundPointerUp}
                onPointerLeave={handleBackgroundPointerUp}
              >
                <g ref={viewportRef}>
                  {/* Node link connections, drawn directly from edges (re-rendered on graphVersion change) */}
                  <g className="stroke-[#1E293B] stroke-1.5" data-graph-version={graphVersion}>
                    {simLinksRef.current.map((l, index) => {
                      const s = l.source as SimNode;
                      const t = l.target as SimNode;
                      const isRelated = relatedIds ? relatedIds.has(s.id) && relatedIds.has(t.id) : false;
                      return (
                        <line
                          key={index}
                          ref={(el) => setLineRef(index, el)}
                          x1={s.x ?? 0}
                          y1={s.y ?? 0}
                          x2={t.x ?? 0}
                          y2={t.y ?? 0}
                          className={`transition-[stroke,opacity] duration-300 ${
                            isRelated ? 'stroke-blue-500 stroke-[2px]' : 'stroke-[#1E293B]'
                          } ${relatedIds && !isRelated ? 'opacity-30' : 'opacity-100'}`}
                        />
                      );
                    })}
                  </g>

                  {/* Nodes rendering, drawn directly from nodes */}
                  <g>
                    {simNodesRef.current.map((node) => {
                      const isSelected = selectedNodeId === node.id;
                      const isHovered = hoveredNodeId === node.id;
                      const isRelated = relatedIds ? relatedIds.has(node.id) : true;
                      const style = getNodeStyle(node.type);
                      const r = getNodeRadius(node.type);

                      return (
                        <g
                          key={node.id}
                          ref={(el) => setNodeRef(node.id, el)}
                          transform={`translate(${node.x ?? 0},${node.y ?? 0})`}
                          className={`cursor-pointer transition-opacity duration-300 ${
                            relatedIds && !isRelated ? 'opacity-30' : 'opacity-100'
                          }`}
                          onPointerDown={(e) => handleNodePointerDown(e, node)}
                          onClick={() => setSelectedNodeId(node.id)}
                          onMouseEnter={() => setHoveredNodeId(node.id)}
                          onMouseLeave={() => setHoveredNodeId(null)}
                        >
                          {/* Selected/hover halo */}
                          {(isSelected || isHovered) && (
                            <circle
                              cx={0}
                              cy={0}
                              r={r + 6}
                              className={`fill-blue-500/10 stroke-blue-500/30 stroke-2 ${isHovered ? 'animate-pulse' : ''}`}
                            />
                          )}

                          <circle
                            cx={0}
                            cy={0}
                            r={r}
                            className={`transition-all duration-200 stroke-2 ${style.fill} ${style.stroke} ${
                              isSelected ? 'scale-125' : ''
                            } ${isHovered ? 'drop-shadow-[0_0_6px_rgba(59,130,246,0.6)]' : ''}`}
                          />
                          <text
                            ref={(el) => setTextRef(node.id, el)}
                            x={0}
                            y={-r - 6}
                            textAnchor="middle"
                            className={`text-[9px] font-mono select-none font-bold transition-opacity duration-200 ${
                              isSelected ? 'fill-blue-400' : style.text
                            }`}
                          >
                            {node.label}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                </g>
              </svg>

              {/* HUD Overlay controls */}
              <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 bg-[#0B0E14]/90 border border-[#1E293B] rounded-md p-1 shadow-lg">
                <button
                  className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded outline-none"
                  title="Recenter force simulation"
                  onClick={() => {
                    transformRef.current = { x: 0, y: 0, k: 1 };
                    applyTransform();
                    setZoomPercent(100);
                    simulationRef.current?.alpha(0.6).restart();
                  }}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <div className="w-px h-3 bg-[#1E293B]" />
                <span className="text-[9px] font-mono text-slate-500 px-1 select-none font-bold">
                  ZOOM {zoomPercent}%
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1E293B] flex justify-between items-center text-[10px] text-slate-500 font-mono">
            <div className="flex gap-3 flex-wrap">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Document
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Technology
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Skill
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Project
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" /> Organization
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Location
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> Concept
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" /> Unknown
              </span>
            </div>
            <span className="font-bold">{nodes.length} Active Vertices</span>
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
                      <span className="text-slate-300 font-semibold">{getNodeRadius(selectedNode.type)} px rad</span>
                    </div>
                    <div className="p-2 bg-[#0B0E14]/40 border border-[#1E293B] rounded">
                      <span className="text-[10px] text-slate-500 block font-bold">VERTICES</span>
                      <span className="text-slate-300 font-semibold">{selectedNodeEdges.length} edges</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block uppercase mb-1.5">Direct Proximities</span>
                    <div className="space-y-1">
                      {selectedNodeConnections.map((target) => {
                        return (
                          <div
                            key={target.id}
                            onClick={() => setSelectedNodeId(target.id)}
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
                    onChange={(e) => setNewNodeType(e.target.value)}
                    className="w-full h-9 bg-[#0B0E14] border border-[#1E293B] rounded px-1.5 text-xs text-slate-300 outline-none"
                  >
                    <option value="document">Document</option>
                    <option value="person">Person</option>
                    <option value="organization">Organization</option>
                    <option value="technology">Technology</option>
                    <option value="project">Project</option>
                    <option value="skill">Skill</option>
                    <option value="location">Location</option>
                    <option value="concept">Concept</option>
                    <option value="other">Other</option>
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
