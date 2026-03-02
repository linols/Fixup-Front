import { useEffect, useRef, useCallback } from 'react';
import { getMessageStreamUrl } from '../services/api';

export interface SSEMessageEvent {
    evenement: string;
    conversation_id: number;
    message_id?: number;
    expediteur_id?: number;
    contenu?: string;
    type_message?: string;
    date_creation?: string;
}

interface UseMessageStreamOptions {
    userId: string | number | null;
    onNewMessage?: (data: SSEMessageEvent) => void;
    onMessageRead?: (data: SSEMessageEvent) => void;
    onConnected?: () => void;
}

export function useMessageStream({
    userId,
    onNewMessage,
    onMessageRead,
    onConnected,
}: UseMessageStreamOptions) {
    const eventSourceRef = useRef<EventSource | null>(null);

    const cleanup = useCallback(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (!userId) return;

        cleanup();

        const url = getMessageStreamUrl(userId);
        const es = new EventSource(url);
        eventSourceRef.current = es;

        es.addEventListener('connected', () => {
            onConnected?.();
        });

        es.addEventListener('nouveau_message', (event) => {
            try {
                const data: SSEMessageEvent = JSON.parse(event.data);
                onNewMessage?.(data);
            } catch (err) {
                console.error('SSE parse error (nouveau_message):', err);
            }
        });

        es.addEventListener('message_lu', (event) => {
            try {
                const data: SSEMessageEvent = JSON.parse(event.data);
                onMessageRead?.(data);
            } catch (err) {
                console.error('SSE parse error (message_lu):', err);
            }
        });

        es.onerror = () => {
            console.warn('SSE connection error, will auto-reconnect');
        };

        return cleanup;
    }, [userId, onNewMessage, onMessageRead, onConnected, cleanup]);

    return { close: cleanup };
}
