export interface NiveauEtude {
    id_niveau_etude: string,
    Libelle_niveau_etude: string,
    Libelle_niveau_etude_ar: string,
    annees: AnneeEtude[]
}

export interface AnneeEtude {
    id_annee_etude: string,
    libelle_annee_etude: string,
    libelle_annee_etude_ar: string,
    filieres: Filiere[]
}

export interface Filiere {
    id_filiere: string,
    libelle_filiere: string
}