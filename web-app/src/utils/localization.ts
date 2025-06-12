
export type SupportedLanguage = 'en' | 'es' | 'fr' | 'pt' | 'ha' | 'yo' | 'ig';

export interface LocaleStrings {
  // Common
  loading: string;
  error: string;
  success: string;
  cancel: string;
  save: string;
  delete: string;
  edit: string;
  view: string;
  
  // Authentication
  login: string;
  logout: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  signUp: string;
  
  // Dashboard
  dashboard: string;
  patients: string;
  consultations: string;
  communication: string;
  pending: string;
  inProgress: string;
  completed: string;
  
  // Medical
  diagnosis: string;
  treatment: string;
  notes: string;
  symptoms: string;
  vitals: string;
  
  // Time
  today: string;
  yesterday: string;
  thisWeek: string;
  thisMonth: string;
}

const locales: Record<SupportedLanguage, LocaleStrings> = {
  en: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    login: 'Login',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    firstName: 'First Name',
    lastName: 'Last Name',
    signUp: 'Sign Up',
    dashboard: 'Dashboard',
    patients: 'Patients',
    consultations: 'Consultations',
    communication: 'Communication',
    pending: 'Pending',
    inProgress: 'In Progress',
    completed: 'Completed',
    diagnosis: 'Diagnosis',
    treatment: 'Treatment',
    notes: 'Notes',
    symptoms: 'Symptoms',
    vitals: 'Vitals',
    today: 'Today',
    yesterday: 'Yesterday',
    thisWeek: 'This Week',
    thisMonth: 'This Month'
  },
  es: {
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    cancel: 'Cancelar',
    save: 'Guardar',
    delete: 'Eliminar',
    edit: 'Editar',
    view: 'Ver',
    login: 'Iniciar Sesión',
    logout: 'Cerrar Sesión',
    email: 'Correo Electrónico',
    password: 'Contraseña',
    firstName: 'Nombre',
    lastName: 'Apellido',
    signUp: 'Registrarse',
    dashboard: 'Panel',
    patients: 'Pacientes',
    consultations: 'Consultas',
    communication: 'Comunicación',
    pending: 'Pendiente',
    inProgress: 'En Progreso',
    completed: 'Completado',
    diagnosis: 'Diagnóstico',
    treatment: 'Tratamiento',
    notes: 'Notas',
    symptoms: 'Síntomas',
    vitals: 'Signos Vitales',
    today: 'Hoy',
    yesterday: 'Ayer',
    thisWeek: 'Esta Semana',
    thisMonth: 'Este Mes'
  },
  fr: {
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    cancel: 'Annuler',
    save: 'Enregistrer',
    delete: 'Supprimer',
    edit: 'Modifier',
    view: 'Voir',
    login: 'Connexion',
    logout: 'Déconnexion',
    email: 'E-mail',
    password: 'Mot de passe',
    firstName: 'Prénom',
    lastName: 'Nom',
    signUp: 'S\'inscrire',
    dashboard: 'Tableau de bord',
    patients: 'Patients',
    consultations: 'Consultations',
    communication: 'Communication',
    pending: 'En attente',
    inProgress: 'En cours',
    completed: 'Terminé',
    diagnosis: 'Diagnostic',
    treatment: 'Traitement',
    notes: 'Notes',
    symptoms: 'Symptômes',
    vitals: 'Signes vitaux',
    today: 'Aujourd\'hui',
    yesterday: 'Hier',
    thisWeek: 'Cette semaine',
    thisMonth: 'Ce mois'
  },
  pt: {
    loading: 'Carregando...',
    error: 'Erro',
    success: 'Sucesso',
    cancel: 'Cancelar',
    save: 'Salvar',
    delete: 'Excluir',
    edit: 'Editar',
    view: 'Ver',
    login: 'Entrar',
    logout: 'Sair',
    email: 'E-mail',
    password: 'Senha',
    firstName: 'Nome',
    lastName: 'Sobrenome',
    signUp: 'Cadastrar',
    dashboard: 'Painel',
    patients: 'Pacientes',
    consultations: 'Consultas',
    communication: 'Comunicação',
    pending: 'Pendente',
    inProgress: 'Em Andamento',
    completed: 'Concluído',
    diagnosis: 'Diagnóstico',
    treatment: 'Tratamento',
    notes: 'Notas',
    symptoms: 'Sintomas',
    vitals: 'Sinais Vitais',
    today: 'Hoje',
    yesterday: 'Ontem',
    thisWeek: 'Esta Semana',
    thisMonth: 'Este Mês'
  },
  ha: {
    loading: 'Ana lodi...',
    error: 'Kuskure',
    success: 'Nasara',
    cancel: 'Soke',
    save: 'Ajiye',
    delete: 'Share',
    edit: 'Gyara',
    view: 'Duba',
    login: 'Shiga',
    logout: 'Fita',
    email: 'Imel',
    password: 'Kalmar sirri',
    firstName: 'Suna na farko',
    lastName: 'Suna na karshe',
    signUp: 'Yi rajista',
    dashboard: 'Allon bayanai',
    patients: 'Marasa lafiya',
    consultations: 'Shawarwari',
    communication: 'Sadarwa',
    pending: 'Ana jira',
    inProgress: 'Ana aiki',
    completed: 'An gama',
    diagnosis: 'Gano cuta',
    treatment: 'Magani',
    notes: 'Bayanai',
    symptoms: 'Alamomi',
    vitals: 'Alamar rayuwa',
    today: 'Yau',
    yesterday: 'Jiya',
    thisWeek: 'Wannan mako',
    thisMonth: 'Wannan wata'
  },
  yo: {
    loading: 'Ti n gbe jade...',
    error: 'Aṣiṣe',
    success: 'Aṣeyori',
    cancel: 'Fagilee',
    save: 'Fi pamọ',
    delete: 'Pa rẹ',
    edit: 'Ṣatunṣe',
    view: 'Wo',
    login: 'Wọle',
    logout: 'Jade',
    email: 'Imeeli',
    password: 'Ọrọ igbaniwọle',
    firstName: 'Orukọ akọkọ',
    lastName: 'Orukọ idile',
    signUp: 'Forukọsilẹ',
    dashboard: 'Pepe isẹ',
    patients: 'Awọn alaisan',
    consultations: 'Awọn ifimoye',
    communication: 'Ifibaraenisọrọ',
    pending: 'Ti n duro',
    inProgress: 'Ti n lọ',
    completed: 'Ti pari',
    diagnosis: 'Iwadi aisan',
    treatment: 'Itọju',
    notes: 'Awọn akọsilẹ',
    symptoms: 'Awọn ami aisan',
    vitals: 'Awọn ami pataki',
    today: 'Loni',
    yesterday: 'Lana',
    thisWeek: 'Ọsẹ yii',
    thisMonth: 'Oṣu yii'
  },
  ig: {
    loading: 'Na-ebu...',
    error: 'Njehie',
    success: 'Ihe ịga nke ọma',
    cancel: 'Kagbuo',
    save: 'Chekwaa',
    delete: 'Hichapụ',
    edit: 'Dezie',
    view: 'Lee',
    login: 'Banye',
    logout: 'Pụọ',
    email: 'Ozi-e',
    password: 'Okwu nzuzo',
    firstName: 'Aha mbụ',
    lastName: 'Aha nna',
    signUp: 'Debanye aha',
    dashboard: 'Ebe nlekọta',
    patients: 'Ndị ọrịa',
    consultations: 'Ndụmọdụ',
    communication: 'Nkwurịta okwu',
    pending: 'Na-eche',
    inProgress: 'Na-aga',
    completed: 'Emechara',
    diagnosis: 'Nchọpụta ọrịa',
    treatment: 'Ọgwụgwọ',
    notes: 'Ndetu',
    symptoms: 'Ihe ịrịba ama',
    vitals: 'Ihe ndị dị mkpa',
    today: 'Taa',
    yesterday: 'Ụnyaahụ',
    thisWeek: 'Izu a',
    thisMonth: 'Ọnwa a'
  }
};

export class LocalizationService {
  private currentLanguage: SupportedLanguage = 'en';

  constructor() {
    // Try to get language from localStorage or browser
    const savedLanguage = localStorage.getItem('vivamoms_language') as SupportedLanguage;
    if (savedLanguage && locales[savedLanguage]) {
      this.currentLanguage = savedLanguage;
    } else {
      // Detect from browser language
      const browserLang = navigator.language.split('-')[0] as SupportedLanguage;
      if (locales[browserLang]) {
        this.currentLanguage = browserLang;
      }
    }
  }

  setLanguage(language: SupportedLanguage) {
    if (locales[language]) {
      this.currentLanguage = language;
      localStorage.setItem('vivamoms_language', language);
    }
  }

  getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  t(key: keyof LocaleStrings): string {
    return locales[this.currentLanguage][key] || locales.en[key] || key;
  }

  getSupportedLanguages(): SupportedLanguage[] {
    return Object.keys(locales) as SupportedLanguage[];
  }
}

export const localizationService = new LocalizationService();

// React hook for localization
import { useState, useEffect } from 'react';

export function useLocalization() {
  const [language, setLanguage] = useState(localizationService.getCurrentLanguage());

  const changeLanguage = (newLanguage: SupportedLanguage) => {
    localizationService.setLanguage(newLanguage);
    setLanguage(newLanguage);
  };

  const t = (key: keyof LocaleStrings) => localizationService.t(key);

  return { language, changeLanguage, t, supportedLanguages: localizationService.getSupportedLanguages() };
}
