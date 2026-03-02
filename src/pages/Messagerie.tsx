import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, MessageCircle } from 'lucide-react';
import {
    fetchConversations,
    fetchMessages,
    sendMessage as sendMessageApi,
    markAllRead,
} from '../services/api';
import { useMessageStream } from '../hooks/useMessageStream';
import type { Conversation, Message } from '../types/types';
import { LoadingSpinner } from '../components/LoadingSpinner';

// Avatar helper (pp-anonyme)
import ppAvatar1 from '../assets/pp-anonymes_Fixaly-01.png';
import ppAvatar2 from '../assets/pp-anonymes_Fixaly-02.png';
import ppAvatar3 from '../assets/pp-anonymes_Fixaly-03.png';
import ppAvatar4 from '../assets/pp-anonymes_Fixaly-04.png';

const AVATARS = [ppAvatar1, ppAvatar2, ppAvatar3, ppAvatar4];
const getAvatar = (id: number) => AVATARS[id % AVATARS.length];

export function Messagerie() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const contactId = searchParams.get('contact');
    const userId = localStorage.getItem('userId');

    // State
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConvId, setSelectedConvId] = useState<number | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingConvs, setLoadingConvs] = useState(true);
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // ── Redirect if not logged in ────────────────────────────────────────────

    useEffect(() => {
        if (!userId) navigate('/login');
    }, [userId, navigate]);

    // ── Load conversations ───────────────────────────────────────────────────

    useEffect(() => {
        if (!userId) return;
        const load = async () => {
            try {
                const data = await fetchConversations(userId);
                setConversations(data);

                // If ?contact= param exists and no conv exists for that contact, auto-select or leave null
                if (contactId) {
                    const existing = data.find(
                        (c) => c.interlocuteur_id === parseInt(contactId)
                    );
                    if (existing) {
                        setSelectedConvId(existing.conversation_id);
                    }
                }
            } catch (err) {
                console.error('Erreur chargement conversations:', err);
            } finally {
                setLoadingConvs(false);
            }
        };
        load();
    }, [userId, contactId]);

    // ── Load messages when conversation is selected ──────────────────────────

    useEffect(() => {
        if (!selectedConvId || !userId) return;
        const load = async () => {
            setLoadingMsgs(true);
            try {
                const data = await fetchMessages(selectedConvId);
                setMessages(data);
                // Mark all as read
                await markAllRead(selectedConvId, parseInt(userId));
                // Update unread count locally
                setConversations((prev) =>
                    prev.map((c) =>
                        c.conversation_id === selectedConvId ? { ...c, non_lus: 0 } : c
                    )
                );
            } catch (err) {
                console.error('Erreur chargement messages:', err);
            } finally {
                setLoadingMsgs(false);
            }
        };
        load();
    }, [selectedConvId, userId]);

    // ── Auto-scroll to bottom ────────────────────────────────────────────────

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // ── SSE — Real-time updates ──────────────────────────────────────────────

    useMessageStream({
        userId,
        onNewMessage: (data) => {
            // If the new message is in the currently open conversation, add it
            if (data.conversation_id === selectedConvId) {
                setMessages((prev) => [
                    ...prev,
                    {
                        id: data.message_id!,
                        conversation_id: data.conversation_id,
                        expediteur_id: data.expediteur_id!,
                        direction: 'entrant',
                        type_message: data.type_message || 'texte',
                        contenu: data.contenu || '',
                        statut: 'reçu',
                        date_creation: data.date_creation || new Date().toISOString(),
                    },
                ]);
            }

            // Update conversations list
            setConversations((prev) => {
                const updated = prev.map((c) =>
                    c.conversation_id === data.conversation_id
                        ? {
                            ...c,
                            dernier_message: data.contenu || '',
                            dernier_message_date: data.date_creation || new Date().toISOString(),
                            non_lus:
                                c.conversation_id === selectedConvId
                                    ? 0
                                    : c.non_lus + 1,
                        }
                        : c
                );
                // If it's a new conversation not in list, refresh
                if (!prev.find((c) => c.conversation_id === data.conversation_id)) {
                    fetchConversations(userId!).then(setConversations);
                }
                return updated;
            });
        },
    });

    // ── Send message ─────────────────────────────────────────────────────────

    const handleSend = async () => {
        if (!newMessage.trim() || !userId) return;

        setSending(true);
        try {
            const selectedConv = conversations.find(
                (c) => c.conversation_id === selectedConvId
            );
            const destId = selectedConv
                ? selectedConv.interlocuteur_id
                : contactId
                    ? parseInt(contactId)
                    : null;

            if (!destId) return;

            const sent = await sendMessageApi({
                conversation_id: selectedConvId,
                destinataire_id: destId,
                expediteur_id: parseInt(userId),
                contenu: newMessage.trim(),
                type_message: 'texte',
            });

            // Add sent message to list
            setMessages((prev) => [...prev, sent]);
            setNewMessage('');

            // If no conversation was selected (new conversation), set it
            if (!selectedConvId && sent.conversation_id) {
                setSelectedConvId(sent.conversation_id);
                // Reload conversations
                const convs = await fetchConversations(userId);
                setConversations(convs);
            }
        } catch (err) {
            console.error('Erreur envoi message:', err);
        } finally {
            setSending(false);
        }
    };

    // ── Helper: format date ──────────────────────────────────────────────────

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        }
        if (days === 1) return 'Hier';
        if (days < 7) return d.toLocaleDateString('fr-FR', { weekday: 'long' });
        return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    };

    const formatMessageTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // ── Render: Conversations list ───────────────────────────────────────────

    const renderConversationList = () => (
        <div className={`border-r border-fixup-blue/20 bg-white flex flex-col ${selectedConvId ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96`}>
            {/* Header */}
            <div className="p-4 border-b border-fixup-blue/20">
                <h2 className="text-lg font-bold text-fixup-black">Messages</h2>
                <p className="text-xs text-fixup-black/50 mt-1">
                    {conversations.reduce((sum, c) => sum + c.non_lus, 0)} non lu(s)
                </p>
            </div>

            {/* Conversation items */}
            <div className="flex-1 overflow-y-auto">
                {loadingConvs ? (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner message="" />
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="text-center py-12 px-4">
                        <MessageCircle className="w-12 h-12 text-fixup-black/20 mx-auto mb-4" />
                        <p className="text-fixup-black/50 text-sm">Aucune conversation</p>
                    </div>
                ) : (
                    conversations.map((conv) => (
                        <button
                            key={conv.conversation_id}
                            onClick={() => setSelectedConvId(conv.conversation_id)}
                            className={`w-full text-left p-4 flex items-center gap-3 border-b border-gray-100 transition-colors ${selectedConvId === conv.conversation_id
                                ? 'bg-fixup-blue/10'
                                : 'hover:bg-gray-50'
                                }`}
                        >
                            <img
                                src={getAvatar(conv.interlocuteur_id)}
                                alt=""
                                className="w-12 h-12 rounded-full flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <p className="font-semibold text-sm text-fixup-black truncate">
                                        {conv.interlocuteur?.Prenom} {conv.interlocuteur?.Nom?.charAt(0)}.
                                    </p>
                                    <span className="text-xs text-fixup-black/40 flex-shrink-0 ml-2">
                                        {formatDate(conv.dernier_message_date)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-fixup-black/50 truncate">
                                        {conv.dernier_message}
                                    </p>
                                    {conv.non_lus > 0 && (
                                        <span className="ml-2 bg-fixup-orange text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                                            {conv.non_lus}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))
                )}

                {/* New conversation with contact */}
                {contactId && !conversations.find((c) => c.interlocuteur_id === parseInt(contactId)) && (
                    <button
                        onClick={() => setSelectedConvId(null)}
                        className="w-full text-left p-4 flex items-center gap-3 border-b border-gray-100 bg-fixup-green/10"
                    >
                        <img
                            src={getAvatar(parseInt(contactId))}
                            alt=""
                            className="w-12 h-12 rounded-full"
                        />
                        <div>
                            <p className="font-semibold text-sm text-fixup-black">Nouvelle conversation</p>
                            <p className="text-xs text-fixup-green">Commencer à discuter</p>
                        </div>
                    </button>
                )}
            </div>
        </div>
    );

    // ── Render: Chat panel ───────────────────────────────────────────────────

    const renderChatPanel = () => {
        const selectedConv = conversations.find((c) => c.conversation_id === selectedConvId);
        const interlocuteur = selectedConv?.interlocuteur;

        // Show empty state if no conversation selected (and no contact param)
        if (!selectedConvId && !contactId) {
            return (
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <MessageCircle className="w-16 h-16 text-fixup-black/10 mx-auto mb-4" />
                        <p className="text-fixup-black/40">
                            Sélectionnez une conversation
                        </p>
                    </div>
                </div>
            );
        }

        return (
            <div className={`flex-1 flex flex-col bg-gray-50 ${!selectedConvId && !contactId ? 'hidden md:flex' : ''}`}>
                {/* Chat header */}
                <div className="bg-white border-b border-fixup-blue/20 p-4 flex items-center gap-3">
                    <button
                        onClick={() => setSelectedConvId(null)}
                        className="md:hidden p-1 rounded-lg hover:bg-gray-100"
                    >
                        <ArrowLeft className="w-5 h-5 text-fixup-black" />
                    </button>
                    <img
                        src={getAvatar(interlocuteur?.Id_user || parseInt(contactId || '0'))}
                        alt=""
                        className="w-10 h-10 rounded-full"
                    />
                    <div>
                        <p className="font-semibold text-sm text-fixup-black">
                            {interlocuteur
                                ? `${interlocuteur.Prenom} ${interlocuteur.Nom?.charAt(0)}.`
                                : 'Nouvelle conversation'}
                        </p>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {loadingMsgs ? (
                        <div className="flex justify-center py-12">
                            <LoadingSpinner message="" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-fixup-black/40 text-sm">
                                Pas encore de messages. Commencez la conversation !
                            </p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isMine = msg.expediteur_id === parseInt(userId || '0');
                            return (
                                <div
                                    key={msg.id}
                                    className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[70%] rounded-2xl px-4 py-3 ${isMine
                                            ? 'bg-fixup-orange text-white rounded-br-md'
                                            : 'bg-white text-fixup-black shadow-sm border border-gray-100 rounded-bl-md'
                                            }`}
                                    >
                                        <p className="text-sm whitespace-pre-line">{msg.contenu}</p>
                                        <p
                                            className={`text-[10px] mt-1 ${isMine ? 'text-white/60' : 'text-fixup-black/40'
                                                }`}
                                        >
                                            {formatMessageTime(msg.date_creation)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="bg-white border-t border-fixup-blue/20 p-4">
                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                            placeholder="Tapez votre message..."
                            className="flex-1 border border-fixup-blue/20 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-fixup-orange"
                        />
                        <button
                            onClick={handleSend}
                            disabled={sending || !newMessage.trim()}
                            className="w-12 h-12 bg-fixup-orange text-white rounded-full flex items-center justify-center hover:bg-fixup-orange/90 transition-colors disabled:opacity-50"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ── Main render ──────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-fixup-white pt-20">
            <div className="h-[calc(100vh-5rem)] flex">
                {renderConversationList()}
                {renderChatPanel()}
            </div>
        </div>
    );
}
