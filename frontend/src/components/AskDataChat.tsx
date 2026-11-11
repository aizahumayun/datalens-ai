import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Lightbulb,
  RefreshCw,
  BarChart2,
} from 'lucide-react';
import { ChatMessage, DatasetAnalysis } from '../types';
import { answerDataQuery } from '../utils/askDataEngine';
import { askData } from '../services/aiApi';

interface AskDataChatProps {
  dataset: DatasetAnalysis;
}

const cleanAiAnswer = (answer: string) =>
  answer
    .replace(/\*{1,3}([^*\n]+?)\*{1,3}/g, '$1')
    .replace(/^\s*\*+\s?/gm, '');

export const AskDataChat: React.FC<AskDataChatProps> = ({ dataset }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'ai',
      text: `Hello! I am **DataLens AI**. I have analyzed **${dataset.fileName}** (${dataset.totalRows} records, ${dataset.totalCols} fields).\n\nAsk me anything about your dataset (e.g., averages, sums, peak periods, lowest performing categories, or anomalies)!`,
      timestamp: new Date(),
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Dynamic suggestion chips based on actual column names in the current dataset!
  const getDynamicSuggestions = () => {
    const numericCols = dataset.columns.filter((c) => !c.isIdentifier && c.type === 'number');
    const categoryCols = dataset.columns.filter((c) => !c.isIdentifier && c.type === 'category');

    const topNum = numericCols[0]?.name || 'Revenue';
    const topCat = categoryCols[0]?.name || 'Category';

    return [
      `What is the average ${topNum}?`,
      `Which ${topCat} has the highest ${topNum}?`,
      `Are there any statistical anomalies or outliers?`,
      `What is the total sum of ${topNum}?`,
    ];
  };

  const suggestionChips = getDynamicSuggestions();

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendQuery = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    // 1. Calculate deterministic, grounded answer directly from raw dataset
    const deterministicResult = answerDataQuery(dataset, textToSend);

    try {
      const data = await askData({
        userQuery: textToSend,
        deterministicResult,
        datasetInfo: {
          fileName: dataset.fileName,
          totalRows: dataset.totalRows,
          totalCols: dataset.totalCols,
          columns: dataset.columns,
          summaryStats: dataset.summaryStats,
        },
      });

      const finalAnswer =
        data.result?.answer || deterministicResult.answerMarkdown;

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: finalAnswer,
        timestamp: new Date(),
        structuredData: {
          statHighlight:
            data.result?.statHighlight || deterministicResult.statHighlight,
          chartType: deterministicResult.suggestedChart?.chartType,
          chartData: deterministicResult.suggestedChart?.data,
        },
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      // Fallback to pure deterministic answer if server has error
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: deterministicResult.answerMarkdown,
        timestamp: new Date(),
        structuredData: {
          statHighlight: deterministicResult.statHighlight,
          chartType: deterministicResult.suggestedChart?.chartType,
          chartData: deterministicResult.suggestedChart?.data,
        },
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl flex flex-col h-150 my-6 overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-indigo-500 to-purple-600 p-0.5">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-indigo-400">
              <Bot className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-white text-sm flex items-center space-x-2">
              <span>Ask Your Data</span>
              <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded">
                Grounded Calculations
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Deterministic CSV statistics + Gemini 3.6 explanation
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: 'welcome-reset',
                sender: 'ai',
                text: `Conversation reset. Ready to answer questions about **${dataset.fileName}**!`,
                timestamp: new Date(),
              },
            ])
          }
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          title="Reset conversation"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-1">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[88%] sm:max-w-[78%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
              }`}
            >
              <div className="whitespace-pre-line font-normal">
                {msg.sender === 'ai' ? cleanAiAnswer(msg.text) : msg.text}
              </div>

              {/* Highlighted Stat Box */}
              {msg.structuredData?.statHighlight && (
                <div className="mt-3 p-3 bg-indigo-950/60 rounded-xl border border-indigo-800/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-indigo-300 font-semibold uppercase tracking-wider block">
                      {msg.structuredData.statHighlight.label}
                    </span>
                    <span className="text-lg font-black text-white">
                      {msg.structuredData.statHighlight.value}
                    </span>
                  </div>
                  {msg.structuredData.statHighlight.detail && (
                    <span className="text-[10px] text-slate-400 max-w-37.5 text-right">
                      {msg.structuredData.statHighlight.detail}
                    </span>
                  )}
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center space-x-2 text-indigo-400 text-xs bg-slate-950/80 p-3 rounded-2xl w-fit border border-slate-800">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>Calculating exact metric from dataset...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Dynamic Suggestion Chips */}
      <div className="px-4 py-2.5 bg-slate-950/60 border-t border-slate-800/80 flex items-center space-x-2 overflow-x-auto scrollbar-none">
        <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        {suggestionChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendQuery(chip)}
            className="text-[11px] font-medium whitespace-nowrap px-3 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-full transition-all shrink-0 cursor-pointer"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendQuery();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            placeholder="Ask anything about your loaded dataset..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={isTyping}
            className="flex-1 bg-slate-900 border border-slate-800 text-slate-100 text-xs sm:text-sm rounded-xl px-4 py-3 focus:border-indigo-500 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isTyping}
            className="px-4 py-3 bg-[#415E5B] border border-[#D3A11F] hover:opacity-95 disabled:opacity-40 text-[#FFFFFF] rounded-xl font-semibold text-xs transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
