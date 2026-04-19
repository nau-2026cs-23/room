import { useState, useEffect, useRef } from 'react';
import { aiApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { AIChatSession, AIChatMessage } from '@shared/types/api';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Bot, Send, Plus, MessageSquare, Loader2, Sparkles } from 'lucide-react';

export default function AIAssistantPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<AIChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>();
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [remainingFree, setRemainingFree] = useState(5);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    aiApi.sessions().then(res => {
      if (res.success) setSessions(res.data);
    }).finally(() => setLoadingSessions(false));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadSession = (session: AIChatSession) => {
    setActiveSessionId(session.id);
    setMessages(session.messages);
  };

  const startNewSession = () => {
    setActiveSessionId(undefined);
    setMessages([]);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput('');
    const userMsg: AIChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: msg,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const res = await aiApi.chat({ message: msg, sessionId: activeSessionId });
      if (res.success) {
        const assistantMsg: AIChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: res.data.reply,
          createdAt: new Date().toISOString(),
        };
        setMessages(prev => [...prev, assistantMsg]);
        setActiveSessionId(res.data.sessionId);
        setRemainingFree(res.data.remainingFreeQueries);
        // Refresh sessions list
        const sessionsRes = await aiApi.sessions();
        if (sessionsRes.success) setSessions(sessionsRes.data);
      } else {
        toast.error('AI回复失败', { description: res.message });
        setMessages(prev => prev.filter(m => m.id !== userMsg.id));
      }
    } finally {
      setLoading(false);
    }
  };

  const SUGGESTIONS = [
    '高等数学极限怎么学？',
    '考研408备考路线是什么？',
    '行测言语理解有哪些解题技巧？',
    '如何制定学习计划？',
  ];

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
        {/* Sidebar: Session History */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-[#E2E8F0] flex flex-col overflow-hidden">
          <div className="p-4 border-b border-[#E2E8F0]">
            <Button
              onClick={startNewSession}
              className="w-full bg-[#0F172A] text-white rounded-xl h-9 text-sm"
            >
              <Plus className="w-4 h-4 mr-1" />新对话
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {loadingSessions ? (
              <div className="text-center py-8"><Loader2 className="w-5 h-5 animate-spin mx-auto text-[#64748B]" /></div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8 text-[#64748B] text-sm">暂无对话记录</div>
            ) : (
              sessions.map(s => (
                <button
                  key={s.id}
                  onClick={() => loadSession(s)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors mb-1 ${
                    activeSessionId === s.id ? 'bg-[#0F172A] text-white' : 'text-[#64748B] hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{s.title}</span>
                  </div>
                  <p className="text-[10px] mt-0.5 opacity-60 pl-5">{new Date(s.updatedAt).toLocaleDateString('zh-CN')}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-[#E2E8F0] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#0F172A] rounded-xl flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-[#1E293B] text-sm">智能学习助手</h2>
                <p className="text-xs text-[#64748B]">基于 Cohere Rerank-4-Fast</p>
              </div>
            </div>
            <div className="text-xs text-[#64748B] bg-slate-50 px-3 py-1.5 rounded-full">
              今日剩余免费：<span className="font-bold text-[#1E293B]">{remainingFree}</span> 次
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-[#0F172A] rounded-2xl flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-[#1E293B] mb-2">有什么可以帮助你？</h3>
                <p className="text-[#64748B] text-sm mb-6">可以回答学科问题、推荐学习资料、制定学习计划</p>
                <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => setInput(s)}
                      className="text-left p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-sm text-[#64748B] transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={`flex gap-3 ${
                  msg.role === 'user' ? 'flex-row-reverse' : ''
                }`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-[#6366F1]' : 'bg-[#0F172A]'
                  }`}>
                    {msg.role === 'user'
                      ? <span className="text-white text-xs font-bold">{user?.username[0].toUpperCase()}</span>
                      : <Bot className="w-4 h-4 text-white" />}
                  </div>
                  <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#6366F1] text-white rounded-tr-sm'
                      : 'bg-slate-50 text-[#1E293B] rounded-tl-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-[#0F172A] rounded-xl flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-slate-50 px-4 py-3 rounded-2xl rounded-tl-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-[#64748B]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-6 py-4 border-t border-[#E2E8F0]">
            <form onSubmit={handleSend} className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="输入你的问题..."
                disabled={loading}
                className="flex-1 border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent disabled:opacity-50"
              />
              <Button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-[#0F172A] text-white rounded-xl px-4 h-10"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </form>
            <p className="text-xs text-[#64748B] mt-2 text-center">前5次免费，后续 2 积分/次。AI回答仅供参考，请结合实际情况判断。</p>
          </div>
        </div>
      </div>
    </div>
  );
}
