// ─── Artisan ─────────────────────────────────────────────────────────────────

export interface Artisan {
    id: number;
    Prenom: string;
    Nom: string;
    ville?: string;
    Code_postal?: string;
    Domaine_activite?: string;
    categorie?: string;
    tags?: ArtisanCategory[];
    note_moyenne: number;
    nombre_avis: number;
    statut_disponibilite?: string;
    description?: string;
}

export interface ArtisanProfile extends Artisan {
    Email?: string;
    Adresse?: string;
    adresse_professionnelle?: string;
    poste?: string;
    date_inscription?: string;
    nombre_mises_en_relation?: number;
}

export interface ArtisanCategory {
    mainCategory: string;
    subcategory: string;
    items: string[];
}

// ─── Avis ────────────────────────────────────────────────────────────────────

export interface AvisReponse {
    id: number;
    parent_id: number;
    commentaire: string;
    date_creation: string;
    Prenom: string;
    Nom: string;
}

export interface Avis {
    id: number;
    note: number;
    commentaire: string;
    categorie?: string;
    date_creation: string;
    Prenom: string;
    Nom: string;
    auteur_id: number;
    reponses?: AvisReponse[];
}

export interface AvisStats {
    note_moyenne: number;
    nombre_total: number;
    distribution: Record<number, number>; // { 1: n, 2: n, 3: n, 4: n, 5: n }
    categories: string[];
}

// ─── Demandes ────────────────────────────────────────────────────────────────

export type DemandeStatus = 'en_attente' | 'acceptee' | 'refusee' | 'terminee' | 'annulee';

export interface Demande {
    id: number;
    id_user: number;
    id_artisan?: number | null; // NULL if public
    titre: string;
    description: string;
    type_reparation: string;
    adresse: string;
    status: DemandeStatus;
    date_creation: string;
    // Returned in specific queries
    Prenom?: string;
    Nom?: string;
    artisan_Prenom?: string;
    artisan_Nom?: string;
    photos?: number[]; // Array of photo IDs
    first_photo_id?: number | null;
}

// ─── User Profile ────────────────────────────────────────────────────────────

export interface UserProfile {
    Id_user: number;
    Prenom: string;
    Nom: string;
    Email: string;
    Adresse: string;
    Code_postal: string;
    Role: string;
    description?: string;
    tags?: ArtisanCategory[];
    categorie?: string;
    Domaine_activite?: string;
    statut_disponibilite?: string;
    adresse_professionnelle?: string;
    poste?: string;
    date_inscription?: string;
    Attestation?: string;
}

// ─── Conversations & Messages ────────────────────────────────────────────────

export interface Conversation {
    conversation_id: number;
    dernier_message_date: string;
    dernier_message: string;
    dernier_type_message: string;
    non_lus: number;
    interlocuteur_id: number;
    interlocuteur: {
        Id_user: number;
        Prenom: string;
        Nom: string;
    };
}

export interface Message {
    id: number;
    conversation_id: number;
    expediteur_id: number;
    direction: string;
    type_message: string;
    contenu: string;
    statut: string;
    date_creation: string;
    Prenom?: string;
    Nom?: string;
}

// ─── Photos ──────────────────────────────────────────────────────────────────

export interface ArtisanPhoto {
    id: number;
    name: string;
}
