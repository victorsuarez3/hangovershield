/**
 * Hangover Shield Internationalization
 * Default: English
 * Spanish: Only if device language is Spanish
 */

import * as Localization from 'expo-localization';

export type Lang = 'en' | 'es';

const getInitialLang = (): Lang => {
  const locale = Localization.getLocales()[0];
  const code = locale?.languageCode ?? 'en';
  // Default to English, only use Spanish if device is explicitly Spanish
  return code.startsWith('es') ? 'es' : 'en';
};

const translations: Record<Lang, Record<string, string>> = {
  en: {
    // Home Header
    home_location_label: 'CASA LATINA · MIAMI',
    home_greeting: 'Good evening, {{name}}',
    home_subtitle: 'Home of Latin Culture & Creators',
    member_founder: 'Founding member',
    
    // Filters
    filter_all: 'All',
    filter_going: 'Going',
    filter_went: 'Went',
    
    // Search
    search_placeholder: 'Search events in your city…',
    
    // Sections
    section_upcoming_events: 'Upcoming events in {{city}}',
    footer_message: 'We will soon open new circles in your city.',
    
    // Event Card
    event_members_only: 'Members only',
    event_spots_remaining: '{{count}} spots remaining',
    event_full: 'Full',
    event_members_count: '{{count}} Casa Latina members',
    rsvp_reserve: 'Reserve spot',
    rsvp_going: "You're going",
    rsvp_went: 'You went to this event',
    rsvp_waitlist: 'Waitlist',
    
    // Tab Bar
    tab_home: 'Home',
    tab_smart_plan: 'Plan',
    tab_tools: 'Tools',
    tab_history: 'History',
    tab_settings: 'Settings',
    
    // Invite Screen
    invite_title: 'Invite someone to Casa Latina',
    invite_subtitle: 'Only a small circle gets access. Share your private code.',
    invite_code_label: 'Your invite code',
    invite_code_helper: 'Each invite is personal and limited.',
    invite_copy_button: 'Copy invite code',
    invite_share_whatsapp: 'WhatsApp',
    invite_share_messages: 'Messages',
    invite_share_link: 'Copy link',
    invite_share_title: 'Share invite',
    invite_copied: 'Code copied to clipboard',
    
    // Profile Screen
    profile_upcoming: 'Upcoming',
    profile_past: 'Past',
    profile_no_events: 'No events yet',
    
    // Event Details
    event_details_member: 'Member',
    event_details_enroll: 'Enroll Now',
  },
  es: {
    // Home Header
    home_location_label: 'CASA LATINA · MIAMI',
    home_greeting: 'Buenas noches, {{name}}',
    home_subtitle: 'Hogar de la Cultura y Creadores Latinos',
    member_founder: 'Miembro fundador',
    
    // Filters
    filter_all: 'Todos',
    filter_going: 'Voy a ir',
    filter_went: 'Fui',
    
    // Search
    search_placeholder: 'Buscar eventos en tu ciudad…',
    
    // Sections
    section_upcoming_events: 'Próximos eventos en {{city}}',
    footer_message: 'Pronto abriremos nuevos círculos en tu ciudad.',
    
    // Event Card
    event_members_only: 'Solo miembros',
    event_spots_remaining: 'Quedan {{count}} cupos',
    event_full: 'Completo',
    event_members_count: '{{count}} miembros Casa Latina',
    rsvp_reserve: 'Reservar cupo',
    rsvp_going: 'Vas a ir',
    rsvp_went: 'Fuiste a este evento',
    rsvp_waitlist: 'Lista de espera',
    
    // Tab Bar
    tab_home: 'Inicio',
    tab_smart_plan: 'Plan',
    tab_tools: 'Herramientas',
    tab_history: 'Historial',
    tab_settings: 'Configuración',
    
    // Invite Screen
    invite_title: 'Invita a alguien a Casa Latina',
    invite_subtitle: 'Solo un círculo pequeño tiene acceso. Comparte tu código privado.',
    invite_code_label: 'Tu código de invitación',
    invite_code_helper: 'Cada invitación es personal y limitada.',
    invite_copy_button: 'Copiar código',
    invite_share_whatsapp: 'WhatsApp',
    invite_share_messages: 'Mensajes',
    invite_share_link: 'Copiar enlace',
    invite_share_title: 'Compartir invitación',
    invite_copied: 'Código copiado al portapapeles',
    
    // Profile Screen
    profile_upcoming: 'Próximos',
    profile_past: 'Pasados',
    profile_no_events: 'Aún no hay eventos',
    
    // Event Details
    event_details_member: 'Miembro',
    event_details_enroll: 'Inscribirse ahora',
  },
};

let currentLang: Lang = getInitialLang();

export const setLanguage = (lang: Lang): void => {
  currentLang = lang;
};

export const getLanguage = (): Lang => {
  return currentLang;
};

export const t = (key: string, vars?: Record<string, string>): string => {
  let text = translations[currentLang][key] ?? translations['en'][key] ?? key;
  
  if (vars) {
    Object.entries(vars).forEach(([k, v]) => {
      text = text.replace(`{{${k}}}`, v);
    });
  }
  
  return text;
};
