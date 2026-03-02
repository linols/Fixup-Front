import { API_BASE_URL } from '../config/api';
import type {
    Artisan,
    ArtisanProfile,
    ArtisanCategory,
    Avis,
    AvisStats,
    ArtisanPhoto,
    UserProfile,
    Conversation,
    Message,
} from '../types/types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
    const res = await fetch(url, options);
    if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error((errBody as any)?.message || `HTTP ${res.status}`);
    }
    return res.json();
}

// ─── Artisans ────────────────────────────────────────────────────────────────

export interface ArtisanFilters {
    categorie?: string;
    code_postal?: string;
    domaine?: string;
    search?: string;
    page?: number;
    limit?: number;
}

export async function fetchArtisans(filters: ArtisanFilters = {}): Promise<Artisan[]> {
    const params = new URLSearchParams();
    if (filters.categorie) params.set('categorie', filters.categorie);
    if (filters.code_postal) params.set('code_postal', filters.code_postal);
    if (filters.domaine) params.set('domaine', filters.domaine);
    if (filters.search) params.set('search', filters.search);
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));

    const qs = params.toString();
    return fetchJSON<Artisan[]>(`${API_BASE_URL}/api/artisans${qs ? `?${qs}` : ''}`);
}

export async function fetchArtisan(id: number | string): Promise<ArtisanProfile> {
    return fetchJSON<ArtisanProfile>(`${API_BASE_URL}/api/artisans/${id}`);
}

export async function fetchArtisanCategories(id: number | string): Promise<ArtisanCategory[]> {
    return fetchJSON<ArtisanCategory[]>(`${API_BASE_URL}/api/artisans/${id}/categories`);
}

// ─── Avis ────────────────────────────────────────────────────────────────────

export interface AvisFilters {
    categorie?: string;
    note?: number;
    page?: number;
    limit?: number;
}

export async function fetchArtisanAvis(
    artisanId: number | string,
    filters: AvisFilters = {}
): Promise<Avis[]> {
    const params = new URLSearchParams();
    if (filters.categorie) params.set('categorie', filters.categorie);
    if (filters.note) params.set('note', String(filters.note));
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));

    const qs = params.toString();
    return fetchJSON<Avis[]>(
        `${API_BASE_URL}/api/artisans/${artisanId}/avis${qs ? `?${qs}` : ''}`
    );
}

export async function fetchArtisanAvisStats(
    artisanId: number | string
): Promise<AvisStats> {
    return fetchJSON<AvisStats>(
        `${API_BASE_URL}/api/artisans/${artisanId}/avis/stats`
    );
}

export async function postAvis(data: {
    utilisateur_id: number;
    professionnel_id: number;
    note: number;
    commentaire: string;
    categorie?: string;
}): Promise<{ id: number; message: string }> {
    return fetchJSON(`${API_BASE_URL}/api/avis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
}

export async function postAvisReponse(
    avisId: number,
    data: { utilisateur_id: number; commentaire: string }
): Promise<{ success: boolean; id: number; message: string }> {
    return fetchJSON(`${API_BASE_URL}/api/avis/${avisId}/reponse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
}

// ─── Photos portfolio (artisans) ─────────────────────────────────────────────

export async function fetchArtisanPhotos(
    artisanId: number | string
): Promise<ArtisanPhoto[]> {
    return fetchJSON<ArtisanPhoto[]>(
        `${API_BASE_URL}/api/artisans/${artisanId}/photos`
    );
}

export function getPhotoUrl(photoId: number): string {
    return `${API_BASE_URL}/api/photos/${photoId}/content`;
}

export async function uploadArtisanPhoto(
    artisanId: number | string,
    file: File
): Promise<{ id: number; url: string; message: string }> {
    const formData = new FormData();
    formData.append('photo', file);
    return fetchJSON(`${API_BASE_URL}/api/artisans/${artisanId}/photos`, {
        method: 'POST',
        body: formData,
    });
}

export async function deleteArtisanPhoto(
    photoId: number,
    userId: number
): Promise<void> {
    await fetch(`${API_BASE_URL}/api/photos/${photoId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
    });
}

// ─── Photo de profil (tous les utilisateurs) ─────────────────────────────────

export function getProfilePhotoUrl(userId: number | string): string {
    return `${API_BASE_URL}/api/users/${userId}/photo`;
}

export async function uploadProfilePhoto(
    userId: number | string,
    file: File
): Promise<{ message: string; url: string }> {
    const formData = new FormData();
    formData.append('photo', file);
    return fetchJSON(`${API_BASE_URL}/api/users/${userId}/photo`, {
        method: 'POST',
        body: formData,
    });
}

export async function deleteProfilePhoto(
    userId: number | string
): Promise<{ success: boolean; message: string }> {
    return fetchJSON(`${API_BASE_URL}/api/users/${userId}/photo`, {
        method: 'DELETE',
    });
}

export async function fetchProfilePhotoMetadata(
    userId: number | string
): Promise<{ has_photo: boolean; taille?: number; url?: string | null }> {
    return fetchJSON(`${API_BASE_URL}/api/users/${userId}/photo/metadata`);
}

// ─── Photo de couverture Artisan (Bannière) ───────────────────────────────────

export function getArtisanCoverPhotoUrl(userId: number | string): string {
    return `${API_BASE_URL}/api/users/${userId}/photo-profil-artisan`;
}

export async function uploadArtisanCoverPhoto(
    userId: number | string,
    file: File
): Promise<{ message: string; hasPhotoProfilArtisan: boolean }> {
    const formData = new FormData();
    formData.append('file', file);
    return fetchJSON(`${API_BASE_URL}/api/users/${userId}/photo-profil-artisan`, {
        method: 'PUT',
        body: formData,
    });
}

export async function deleteArtisanCoverPhoto(
    userId: number | string
): Promise<{ message: string; hasPhotoProfilArtisan: boolean }> {
    return fetchJSON(`${API_BASE_URL}/api/users/${userId}/photo-profil-artisan`, {
        method: 'DELETE',
    });
}

export async function fetchArtisanCoverPhotoMetadata(
    userId: number | string
): Promise<{ hasPhotoProfilArtisan: boolean }> {
    // Note: Since there's no metadata endpoint specified by the backend yet,
    // we can either try to HEAD the image URL or add a dedicated endpoint.
    // Assuming backend returns 404 if no image, a simple fetch can check existence.
    try {
        const response = await fetch(getArtisanCoverPhotoUrl(userId), { method: 'HEAD' });
        return { hasPhotoProfilArtisan: response.ok };
    } catch {
        return { hasPhotoProfilArtisan: false };
    }
}

// ─── User Profile ────────────────────────────────────────────────────────────

export async function fetchUserProfile(
    userId: number | string
): Promise<UserProfile> {
    return fetchJSON<UserProfile>(`${API_BASE_URL}/api/users/${userId}`);
}

export async function updateUserProfile(
    userId: number | string,
    data: Partial<UserProfile>
): Promise<{ message: string; affectedRows: number }> {
    return fetchJSON(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
}

export async function changePassword(
    userId: number | string,
    ancien_motdepasse: string,
    nouveau_motdepasse: string
): Promise<{ message: string }> {
    return fetchJSON(`${API_BASE_URL}/api/users/${userId}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ancien_motdepasse, nouveau_motdepasse }),
    });
}

export async function fetchUserOffers(userId: number | string) {
    return fetchJSON<any[]>(`${API_BASE_URL}/api/users/${userId}/offers`);
}

// ─── Conversations & Messages ────────────────────────────────────────────────

export async function fetchConversations(
    userId: number | string
): Promise<Conversation[]> {
    return fetchJSON<Conversation[]>(
        `${API_BASE_URL}/api/conversations?user_id=${userId}`
    );
}

export async function fetchMessages(
    conversationId: number | string,
    page = 1,
    limit = 50
): Promise<Message[]> {
    return fetchJSON<Message[]>(
        `${API_BASE_URL}/api/conversations/${conversationId}/messages?page=${page}&limit=${limit}`
    );
}

// ─── Demandes ────────────────────────────────────────────────────────────────

import type { Demande, DemandeStatus } from '../types/types';

export async function postDemande(formData: FormData): Promise<{ message: string; id: number }> {
    return fetchJSON(`${API_BASE_URL}/api/demandes`, {
        method: 'POST',
        // Omitting Content-Type header so the browser sets it correctly for multipart/form-data with the boundary
        body: formData,
    });
}

export async function fetchDemandes(params?: { type_reparation?: string; page?: number; limit?: number }): Promise<Demande[]> {
    const query = new URLSearchParams();
    if (params?.type_reparation) query.append('type_reparation', params.type_reparation);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    const queryString = query.toString();
    const url = `${API_BASE_URL}/api/demandes${queryString ? `?${queryString}` : ''}`;

    return fetchJSON<Demande[]>(url);
}

export async function fetchUserDemandes(userId: number | string): Promise<Demande[]> {
    return fetchJSON<Demande[]>(`${API_BASE_URL}/api/users/${userId}/demandes`);
}

export async function fetchArtisanDemandes(artisanId: number | string): Promise<Demande[]> {
    return fetchJSON<Demande[]>(`${API_BASE_URL}/api/demandes/artisan/${artisanId}`);
}

export async function fetchDemandeById(demandeId: number | string): Promise<Demande> {
    return fetchJSON<Demande>(`${API_BASE_URL}/api/demandes/${demandeId}`);
}

export function getDemandePhotoUrl(demandeId: number | string, photoId: number | string): string {
    return `${API_BASE_URL}/api/demandes/${demandeId}/photos/${photoId}`;
}

export async function updateDemandeStatus(
    demandeId: number | string,
    data: { status: DemandeStatus; id_artisan_assigne?: number }
): Promise<{ message: string }> {
    return fetchJSON(`${API_BASE_URL}/api/demandes/${demandeId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
}

export async function sendMessage(data: {
    conversation_id?: number | null;
    destinataire_id: number;
    expediteur_id: number;
    contenu: string;
    type_message?: string;
}): Promise<Message> {
    return fetchJSON<Message>(`${API_BASE_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...data,
            type_message: data.type_message || 'texte',
        }),
    });
}

export async function markMessageRead(
    messageId: number
): Promise<{ message: string }> {
    return fetchJSON(`${API_BASE_URL}/api/messages/${messageId}/read`, {
        method: 'PUT',
    });
}

export async function markAllRead(
    conversationId: number | string,
    userId: number
): Promise<{ message: string; affectedRows: number }> {
    return fetchJSON(
        `${API_BASE_URL}/api/conversations/${conversationId}/read-all`,
        {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId }),
        }
    );
}

// ─── SSE Stream URL builder ──────────────────────────────────────────────────

export function getMessageStreamUrl(userId: number | string): string {
    return `${API_BASE_URL}/api/messages/stream?user_id=${userId}`;
}
