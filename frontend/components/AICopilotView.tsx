import { aiApi } from "../lib/api";
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bot,
  Send,
  Zap,
  Sparkles,
  RefreshCw,
  Cpu,
  Brain,
  Sliders,
  CheckCircle,
  Clock,
  Code,
  ShieldAlert,
  Play
} from 'lucide-react';
import PageHeader from './PageHeader';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  agentName?: string;
  tokensUsed?: number;
}

export default function AICopilotView() {
  const [activeAgent, setActiveAgent] = useState<'auditor' | 'architect' | 'synthesizer'>('auditor');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'agent',
      text: "NexusBrain Reasoning Engine Online. I am currently synched with the local corporate document corpus. Ask me to cross-reference policies, audit compliance schemas, or trace graph vertices.",
      timestamp: '11:04 AM',
      agentName: 'Compliance Auditor',
      tokensUsed: 142
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [temperature, setTemperature] = useState(0.2);
  const [maxTokens, setMaxTokens] = useState(2048);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const agents = [
    {
      id: 'auditor',
      name: 'Compliance Auditor',
      role: 'Safety & Regulations Safeguard',
      desc: 'Specialized in searching GDPR, HIPAA, EU sandbox rules and verifying document compliance benchmarks.',
      badge: 'v4.0-Secure',
      icon: <Brain className="w-4.5 h-4.5 text-emerald-400" />,
      color: 'emerald',
      presets: [
        'Audit "Q3 Financials" for GDPR compliance leaks',
        'Verify if there are any data residency constraints on tenant storage',
        'Analyze audit log security logs for potential anomalies'
      ],
      answers: {
        'Audit "Q3 Financials" for GDPR compliance leaks': "Starting compliance analysis of `Q3 Financials & Earnings Report.pdf`...\n\n**Analysis Metrics:**\n- Checked for PII (Personally Identifiable Information) markers: Nominal (0 leaks found).\n- Financial numbers cross-referenced with Section 4.1.2 EU sandbox regulations.\n- Storage node checks: Validated residency as inside EU cluster coordinates.\n\n**Conclusion:** Passed with no caveats. The document complies with active administrative guidelines.",
        'Verify if there are any data residency constraints on tenant storage': "Querying tenancy matrix constraints on `tenant-corp-nexus-01`...\n\n- Data Sovereignty rules detected: **EU-93 (Schengen Area Zone)**.\n- Current primary cluster location: US-East-H4.\n- Compliance warning: Cross-border traffic routing is active.\n\n**Recommendation:** Set up primary database replication to the Ireland cloud SQL cluster node immediately to prevent administrative non-compliance. See compliance tab.",
        'Analyze audit log security logs for potential anomalies': "Initiating audit log scan for tenant coordinates...\n\n- Analysed 42,002 transactions within the last 24 hours.\n- Found 0 unauthorized index manipulation requests.\n- LATENCY SPIKE detected at 08:32 UTC (resolved by cluster autoscaler).\n\n**Status:** Clean. Zero hostile operations logged."
      }
    },
    {
      id: 'architect',
      name: 'Knowledge Architect',
      role: 'Synapse Graph Synthesizer',
      desc: 'Expert at semantic chunking heuristics, index tree rebalancing, and discovering connection weights.',
      badge: 'v5.1-Linker',
      icon: <Bot className="w-4.5 h-4.5 text-indigo-400" />,
      color: 'indigo',
      presets: [
        'How many vertices exist in our Synapse Matrix?',
        'Show connection strength between tenant core and financial docs',
        'Optimize indexing parameters for faster model queries'
      ],
      answers: {
        'How many vertices exist in our Synapse Matrix?': "Calculating total Graph density...\n\n- Total active Vertices: **5,820** nodes.\n- Total directed Edges: **42,390** connections.\n- Graph Sparsity Coefficient: `0.041`.\n- Cluster Coefficient index: `0.78`.\n\nMost connected node is currently: `Tenant corp-nexus-01` (42 connections).",
        'Show connection strength between tenant core and financial docs': "Resolving shortest paths from `Tenant corp-nexus-01` to `Q3 Financials Asset`...\n\n- Path Distance: 1 step.\n- Vector proximity distance (cosine similarity): **0.892**.\n- Connected parameters: Tenant-ID, Revenue Projection, Cluster Coordinates.\n- Weight Level: High.",
        'Optimize indexing parameters for faster model queries': "Analyzing database indexing performance...\n\n- Ingestion format: Hierarchical vector forest.\n- Recommended tree-split weight: `12`.\n- Suggested threshold temperature: `0.15` (to limit hallucinations on complex financials).\n\nConfiguration has been dispatched to settings. Click apply."
      }
    },
    {
      id: 'synthesizer',
      name: 'Agent Synthesizer',
      role: 'Heuristics Prompt Optimizer',
      desc: 'Assists in prompt refactoring, agent pipeline routing, and context length calculation.',
      badge: 'v2.0-Alpha',
      icon: <Cpu className="w-4.5 h-4.5 text-purple-400" />,
      color: 'purple',
      presets: [
        'Refactor compliance instruction system prompt',
        'Explain token allocation model across agents',
        'Test automated routing thresholds'
      ],
      answers: {
        'Refactor compliance instruction system prompt': "Generated system prompt override template:\n\n```markdown\n# System Guidelines for Compliance Auditor\n- Restrict all outputs to literal, evidence-backed findings.\n- Do NOT mock database responses without logging a validation key.\n- Check data-residency codes on every connection node.\n```\nApply this inside settings.",
        'Explain token allocation model across agents': "Current token allotment:\n\n- **Compliance Auditor:** Max 4,096 tokens (high strictness).\n- **Knowledge Architect:** Max 8,192 tokens (for reading raw vector graphs).\n- **Agent Synthesizer:** Max 2,048 tokens.\n\nResource limit safeguards are actively monitored.",
        'Test automated routing thresholds': "Running simulation on router...\n\n- Ingress query: \"Find safety leaks on storage cluster\"\n- Router score: auditor (94.2%), architect (5.8%)\n- Dispatch target: Success. Correctly routed."
      }
    }
  ];

  const currentAgent = agents.find(a => a.id === activeAgent) || agents[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
  if (!text.trim()) return;

  const userMsg: Message = {
    id: `u-${Date.now()}`,
    sender: "user",
    text,
    timestamp: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  setMessages((prev) => [...prev, userMsg]);
  setInput("");
  setIsTyping(true);

  try {
    const response = await aiApi.askQuestion(text);

    let reply = response.answer ?? "No relevant information found.";

if (response.sources && response.sources.length > 0) {
  reply += "\n\n────────────────────────\n";
  reply += "📄 Sources\n\n";

  response.sources.forEach((fileName: string, index: number) => {
    reply += `${index + 1}. ${fileName}\n`;
  });
}

    const agentMsg: Message = {
      id: `a-${Date.now()}`,
      sender: "agent",
      text: reply,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      agentName: currentAgent.name,
      tokensUsed: 0,
    };

    setMessages((prev) => [...prev, agentMsg]);
  } catch (error) {
    console.error(error);

    const errorMsg: Message = {
      id: `e-${Date.now()}`,
      sender: "agent",
      text: "Unable to query the AI backend. Please ensure the FastAPI server is running.",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      agentName: currentAgent.name,
      tokensUsed: 0,
    };

    setMessages((prev) => [...prev, errorMsg]);
  } finally {
    setIsTyping(false);
  }
};

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Reasoning Copilot"
        description="Interact directly with advanced reasoning sub-agents connected directly to indexed document spaces. Execute audits, policy tracing, or graph node extraction."
      />

      {/* Main workspace divider */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[550px] items-stretch">
        
        {/* Left Side: Agent Selection */}
        <div className="lg:col-span-1 border border-[#1E293B] bg-[#0F1219] rounded-xl p-4 flex flex-col justify-between shadow-lg shadow-black/20">
          <div className="space-y-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Active Reasoning Sub-agents
            </span>
            <div className="space-y-2">
              {agents.map((agent) => {
                const isSelected = activeAgent === agent.id;
                return (
                  <button
                    key={agent.id}
                    onClick={() => {
                      setActiveAgent(agent.id as any);
                      // Clear chat to keep it clean or add a welcoming note
                      setMessages([
                        {
                          id: `m-${Date.now()}`,
                          sender: 'agent',
                          text: `Reasoning context switched to ${agent.name}. ${agent.desc}`,
                          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                          agentName: agent.name,
                          tokensUsed: 64
                        }
                      ]);
                    }}
                    className={`w-full p-3 rounded-xl border text-left transition-all relative overflow-hidden flex gap-2.5 cursor-pointer outline-none ${
                      isSelected
                        ? 'bg-blue-600/10 border-blue-500/40'
                        : 'bg-[#0B0E14] border-transparent hover:bg-[#13171F] hover:border-[#1E293B]'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {agent.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-200 block truncate">{agent.name}</span>
                        <span className="text-[8px] font-mono font-bold uppercase tracking-wide bg-[#0B0E14] px-1 py-0.5 rounded border border-[#1E293B] text-slate-400">
                          {agent.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate leading-tight">{agent.role}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Model settings panel */}
          <div className="pt-4 border-t border-[#1E293B] space-y-3 shrink-0">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Hyperparameter Guards
            </span>
            <div className="space-y-2.5 text-xs font-mono">
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-bold">
                  <span>TEMPERATURE</span>
                  <span>{temperature}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-bold">
                  <span>MAX COMPLETION</span>
                  <span>{maxTokens}</span>
                </div>
                <input
                  type="range"
                  min="256"
                  max="4096"
                  step="256"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Chat Area */}
        <div className="lg:col-span-3 border border-[#1E293B] bg-[#0F1219] rounded-xl flex flex-col h-full overflow-hidden shadow-lg shadow-black/20">
          {/* Chat Header */}
          <div className="p-3.5 bg-[#13171F] border-b border-[#1E293B] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-200">{currentAgent.name}</span>
                <span className="text-[9px] text-slate-500 font-mono font-bold uppercase">ROLE: {currentAgent.role}</span>
              </div>
            </div>
            <button
              onClick={() => {
                setMessages([
                  {
                    id: `m-${Date.now()}`,
                    sender: 'agent',
                    text: `Context logs successfully cleared. Ready for operations under ${currentAgent.name}.`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    agentName: currentAgent.name,
                    tokensUsed: 22
                  }
                ]);
              }}
              className="text-[10px] text-slate-400 hover:text-white font-mono border border-[#1E293B] bg-[#0B0E14] hover:bg-slate-850/60 px-2.5 py-1 rounded uppercase font-bold tracking-wider cursor-pointer outline-none"
            >
              Clear Buffer
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl p-3.5 border text-xs leading-relaxed ${
                      isUser
                        ? 'bg-blue-600 text-white border-blue-500 font-medium'
                        : 'bg-[#0B0E14] text-slate-300 border-[#1E293B]'
                    }`}
                  >
                    {!isUser && (
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mb-2 pb-1.5 border-b border-[#1E293B]">
                        <span className="text-blue-500 font-bold uppercase tracking-wider">{msg.agentName}</span>
                        <span className="font-bold">{msg.tokensUsed ? `Tokens: ${msg.tokensUsed}` : ''}</span>
                      </div>
                    )}
                    {msg.text.includes("📄 Sources") ? (
  <>
    <div className="whitespace-pre-line">
      {msg.text.split("📄 Sources")[0]}
    </div>

    <div className="mt-4 border-t border-[#1E293B] pt-3">
      <div className="text-xs font-semibold text-slate-300 mb-2">
        📄 Sources
      </div>

      <div className="space-y-2">
        {msg.text
          .split("📄 Sources")[1]
          .trim()
          .split("\n")
          .filter((line) => line.trim())
          .map((line, idx) => {
            const file = line.replace(/^\d+\.\s*/, "");

            return (
              <div
                key={idx}
                className="flex items-center gap-2 rounded-lg border border-[#1E293B] bg-[#13171F] px-3 py-2"
              >
                <span>📄</span>

                <span className="text-xs text-slate-300">
                  {file}
                </span>
              </div>
            );
          })}
      </div>
    </div>
  </>
) : (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
        p: ({ children }) => (
            <p className="mb-2 leading-7">{children}</p>
        ),
        h1: ({ children }) => (
            <h1 className="text-xl font-bold mt-4 mb-2">{children}</h1>
        ),
        h2: ({ children }) => (
            <h2 className="text-lg font-semibold mt-4 mb-2">{children}</h2>
        ),
        h3: ({ children }) => (
            <h3 className="text-base font-semibold mt-3 mb-2">{children}</h3>
        ),
        ul: ({ children }) => (
            <ul className="list-disc ml-6 space-y-1">
                {children}
            </ul>
        ),
        ol: ({ children }) => (
            <ol className="list-decimal ml-6 space-y-1">
                {children}
            </ol>
        ),
        code: ({ children }) => (
            <code className="bg-[#1E293B] px-1 py-0.5 rounded text-blue-300">
                {children}
            </code>
        ),
        pre: ({ children }) => (
            <pre className="bg-[#111827] p-3 rounded-lg overflow-x-auto my-3">
                {children}
            </pre>
        ),
    }}
>
    {msg.text}
</ReactMarkdown>
)}
                    <span className="text-[9px] text-slate-500 block text-right mt-1.5 font-mono font-bold">{msg.timestamp}</span>
                  </div>
                </div>
              );
            })}

            {isTyping && (
  <div className="flex justify-start">
    <div className="max-w-[85%] rounded-xl p-4 border border-[#1E293B] bg-[#0B0E14]">
      <div className="flex items-center gap-2 mb-2">
        <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
        <span className="text-sm font-semibold text-blue-400">
          Compliance Auditor
        </span>
      </div>

      <div className="space-y-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-3 h-3 text-emerald-400" />
          Searching relevant document chunks...
        </div>

        <div className="flex items-center gap-2">
          <Brain className="w-3 h-3 text-purple-400 animate-pulse" />
          Reading retrieved context...
        </div>

        <div className="flex items-center gap-2">
          <Sparkles className="w-3 h-3 text-yellow-400 animate-pulse" />
          Generating final response...
        </div>
      </div>
    </div>
  </div>
)}
            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Presets panel */}
          <div className="px-4 py-2.5 border-t border-[#1E293B] bg-[#13171F]">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Available Task Presets
            </span>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {currentAgent.presets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(preset)}
                  className="px-3 py-1.5 rounded-lg bg-[#0B0E14] hover:bg-slate-850/60 border border-[#1E293B] hover:border-slate-500 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-all whitespace-nowrap shrink-0 cursor-pointer outline-none"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Message Input bar */}
          <div className="p-3 bg-[#13171F] border-t border-[#1E293B]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="flex gap-2.5 items-center"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask ${currentAgent.name} anything...`}
                className="flex-1 h-9 bg-[#0B0E14] border border-[#1E293B] focus:border-blue-500 rounded-full pl-4 pr-4 text-xs text-slate-200 placeholder-slate-500 outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="w-9 h-9 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center rounded-full transition-colors cursor-pointer outline-none disabled:opacity-50 disabled:pointer-events-none"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
