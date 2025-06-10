export type RepairType = 'exterieur' | 'informatique' | 'electronique' | 'bois';

export interface Offer {
  id?: number;
  description: string;
  idUtilisateur: string;
  Code_postal: string;
  adresse_facturation: string;
  Signature?: string;
  Date: string;
  prix: string;
  mode_paiement: string;
  type_reparation: RepairType;
  photos?: File[];
}

export interface OfferFormData {
  description: string;
  type_reparation: RepairType;
  photos: File[];
  adresse_facturation: string;
  Code_postal: string;
  prix: string;
  mode_paiement: string;
} 