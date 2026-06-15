// src/components/common/ChatWidget.tsx
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { X, Send } from 'lucide-react';

/* ---------- OpenAI function definitions ---------- */
const functions = [
  {
    name: 'get_coin_balance',
    description: 'Get the current Nicoin balance of the logged‑in provider.',
    parameters: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'get_profile',
    description: 'Get the provider’s profile information including business name, description, category, and location.',
    parameters: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'update_description',
    description: 'Update the provider’s business description. Only call after the user has confirmed the new description.',
    parameters: {
      type: 'object',
      properties: {
        new_description: { type: 'string', description: 'The new description text' },
      },
      required: ['new_description'],
    },
  },
  {
    name: 'get_location_change_status',
    description: 'Check whether the provider can change their location for free or needs to pay.',
    parameters: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'switch_to_provider',
    description: 'Switch the current customer account to a provider account. The user must confirm they want to do this.',
    parameters: {
      type: 'object',
      properties: {
        confirmed: { type: 'boolean', description: 'Whether the user explicitly confirmed the switch.' },
      },
      required: ['confirmed'],
    },
  },
];

/* ---------- System instructions (the rulebook) ---------- */
const INSTRUCTIONS = `
You are a helpful assistant built into Nimart, a Nigerian service marketplace.
You help providers and customers manage their accounts, answer questions, and perform actions on their behalf.

Security Rules (NEVER break these):
- Before any action that changes data, ask for the user's password or send a one‑time code to their email.
- Never reveal one user's data to another.
- Never delete an account, change an email, or process a withdrawal.
- If you're unsure about any request, refuse politely and suggest contacting human support.

Location Change:
- Every provider gets one free location change after signup.
- After the free change is used, changes within 30 days cost 5000 Nicoin.
- After 30 days, the next change is free again.
- Always confirm the new location with the user before proceeding.

Profile Updates:
- Editable fields: business_name, description, phone, avatar, gender, age, education, languages, street_address, landmark.
- Update only the fields the user mentions.
- Before updating description, suggest a better version based on their category.

Suggesting Descriptions:
- Ask what category they belong to, then generate a professional 2‑3 sentence description including their LGA and State if available.
- Use proper grammar and correct typos.

Coin Balance & Transactions:
- Tell users their current coin balance when asked.

Switching to Provider:
- A customer can switch to a provider account. Ask them to confirm, then call the switch_to_provider function with confirmed: true.
- After switching, remind them to complete their business profile.

Bookings:
- Help a customer find a provider and initiate a booking. Always confirm details before creating.

Password Reset:
- If a user forgets their password, trigger the Supabase password reset flow (the frontend will handle it).

Always be friendly, professional, and concise. If you can't do something, explain why and offer an alternative.
`;

/* ---------- Function implementations (call Supabase) ---------- */
async function executeFunction(
  name: string,
  args: Record<string, any>,
  userId: string
): Promise<string> {
  try {
    switch (name) {
      case 'get_coin_balance': {
        const { data, error } = await supabase
          .from('providers')
          .select('coin_balance')
          .eq('id', userId)
          .single();
        if (error) return 'Error fetching coin balance.';
        return `Your current Nicoin balance is ${data.coin_balance ?? 0}.`;
      }
      case 'get_profile': {
        const { data: provider, error: providerError } = await supabase
          .from('providers')
          .select('business_name, description, selected_category_slug')
          .eq('id', userId)
          .single();
        if (providerError) return 'Error fetching profile.';
        const { data: profile } = await supabase
          .from('profiles')
          .select('lga_name, state_name')
          .eq('id', userId)
          .single();
        const loc = profile ? `${profile.lga_name}, ${profile.state_name}` : 'Location not set';
        return JSON.stringify({
          business_name: provider.business_name,
          description: provider.description,
          category: provider.selected_category_slug,
          location: loc,
        });
      }
      case 'update_description': {
        const newDesc = args.new_description as string;
        if (!newDesc) return 'Missing description.';
        const { error } = await supabase
          .from('providers')
          .update({ description: newDesc })
          .eq('id', userId);
        if (error) return 'Failed to update description.';
        return 'Description updated successfully.';
      }
      case 'get_location_change_status': {
        const { data, error } = await supabase.rpc('get_location_change_status', {
          p_provider_id: userId,
        });
        if (error) return 'Error checking location change status.';
        return JSON.stringify(data);
      }
      case 'switch_to_provider': {
        if (!args.confirmed) {
          return 'Please confirm you want to switch to a provider account. You will need to complete your business profile afterwards.';
        }
        const { error } = await supabase
          .from('profiles')
          .update({ role: 'provider', is_complete: false })
          .eq('id', userId);
        if (error) return 'Failed to switch account.';
        return 'You have been switched to a provider account. Please complete your business profile on the Setup page to appear in search results.';
      }
      default:
        return `Unknown function: ${name}`;
    }
  } catch (err: any) {
    return `Error: ${err.message}`;
  }
}

/* ---------- Component ---------- */
export function ChatWidget() {
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [responseId, setResponseId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // If not logged in, don't show the widget
  if (!user) return null;

  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  async function callOpenAI(inputItems: any[]) {
    const body: any = {
      model: 'gpt-4o-mini',
      instructions: INSTRUCTIONS,
      tools: functions.map((fn) => ({
        type: 'function',
        name: fn.name,
        description: fn.description,
        parameters: fn.parameters,
      })),
      input: inputItems,
    };
    if (responseId) {
      body.previous_response_id = responseId;
    }

    const res = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json();
      // Insufficient credits or other payment error
      if (res.status === 402 || err?.error?.type === 'insufficient_quota') {
        throw new Error(
          'AI assistant is currently offline. Please try again later.'
        );
      }
      throw new Error(err?.error?.message || 'AI request failed.');
    }

    return res.json();
  }

  async function handleSend() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      // 1. Send user message
      let resp = await callOpenAI([{ role: 'user', content: userMsg }]);
      setResponseId(resp.id);

      // 2. Process output items
      while (resp.output) {
        for (const item of resp.output) {
          if (item.type === 'message' && item.role === 'assistant') {
            const text = item.content
              .filter((c: any) => c.type === 'output_text')
              .map((c: any) => c.text)
              .join('\n');
            if (text) {
              setMessages((prev) => [...prev, { role: 'assistant', text }]);
            }
          } else if (item.type === 'function_call') {
            // Execute the function
            const result = await executeFunction(
              item.name,
              JSON.parse(item.arguments || '{}'),
              user.id
            );
            // Continue the conversation with the function result
            resp = await callOpenAI([
              {
                type: 'function_call_output',
                call_id: item.call_id,
                output: result,
              },
            ]);
            setResponseId(resp.id);
            break; // reprocess the new response output
          }
        }
        // If no function calls left, break
        if (!resp.output.some((i: any) => i.type === 'function_call')) break;
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: err.message || 'Something went wrong.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating button – only the PNG, no background circle */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-20 right-4 z-40"
          aria-label="Open AI Assistant"
        >
          <img src="/ai.png" alt="AI Assistant" className="h-12 w-12" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-0 right-0 z-50 w-full sm:w-96 h-[70vh] sm:h-[500px] bg-white shadow-xl border border-gray-200 rounded-t-2xl sm:rounded-2xl sm:bottom-20 sm:right-4 flex flex-col overflow-hidden">
          {/* Header – with AI icon */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#008751] text-white">
            <div className="flex items-center gap-2">
              <img src="/ai.png" alt="AI" className="h-6 w-6" />
              <h3 className="font-semibold">Nimart Assistant</h3>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.length === 0 && (
              <p className="text-center text-gray-400 text-sm mt-10">
                👋 Hi! I can help you with your profile, location, coins, and more.
              </p>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                  msg.role === 'user'
                    ? 'bg-[#008751] text-white ml-auto'
                    : 'bg-white border border-gray-200 text-gray-800 mr-auto'
                }`}
              >
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className="text-center text-gray-400 text-sm">Thinking…</div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 p-3 border-t border-gray-200 bg-white">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#008751] text-sm"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-[#008751] text-white p-2 rounded-full hover:bg-green-700 disabled:opacity-50"
              aria-label="Send"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}