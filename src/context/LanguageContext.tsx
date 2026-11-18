import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'sw' | 'en';

export interface SmartIdTranslations {
  // Brand & Header
  app_title: string;
  app_subtitle: string;
  lang_toggle_label: string;
  current_lang_label: string;
  gov_badge: string;
  national_motto: string;

  // Sidebar Navigation
  nav_dashboard: string;
  nav_register: string;
  nav_directory: string;
  nav_verify: string;
  nav_generator: string;
  nav_settings: string;
  nav_logout: string;

  // Dashboard Overview
  dash_hero_title: string;
  dash_hero_desc: string;
  dash_quick_register: string;
  dash_quick_verify: string;
  metric_total_users: string;
  metric_active_ids: string;
  metric_pending: string;
  metric_system_status: string;
  metric_uptime: string;
  metric_tcra: string;
  metric_security: string;
  metric_last_audit: string;
  dash_recent_registrations: string;
  dash_recent_sub: string;
  dash_view_all: string;
  dash_distribution_title: string;
  dash_system_health: string;

  // Registration Page
  reg_title: string;
  reg_subtitle: string;
  reg_fullname_label: string;
  reg_fullname_placeholder: string;
  reg_nin_label: string;
  reg_nin_placeholder: string;
  reg_nin_help: string;
  reg_dob_label: string;
  reg_gender_label: string;
  reg_gender_male: string;
  reg_gender_female: string;
  reg_phone_label: string;
  reg_phone_placeholder: string;
  reg_photo_label: string;
  reg_photo_upload_btn: string;
  reg_photo_change_btn: string;
  reg_photo_sample_1: string;
  reg_photo_sample_2: string;
  reg_address_title: string;
  reg_region_label: string;
  reg_district_label: string;
  reg_ward_label: string;
  reg_street_label: string;
  reg_citizenship_label: string;
  reg_citizen_birth: string;
  reg_citizen_registration: string;
  reg_submit_btn: string;
  reg_submitting: string;
  reg_success_title: string;
  reg_success_desc: string;
  reg_view_card_btn: string;

  // Search & Directory Page
  search_title: string;
  search_subtitle: string;
  search_input_placeholder: string;
  search_filter_all: string;
  search_filter_verified: string;
  search_filter_pending: string;
  search_filter_restricted: string;
  search_count_label: string;
  col_citizen: string;
  col_nin: string;
  col_phone: string;
  col_residence: string;
  col_status: string;
  col_actions: string;
  action_view_card: string;
  action_verify: string;
  action_print: string;
  no_citizens_found: string;

  // Digital ID Card Generator
  generator_title: string;
  generator_subtitle: string;
  select_citizen_label: string;
  card_front_title: string;
  card_back_title: string;
  btn_flip_card: string;
  btn_print_card: string;
  btn_download_card: string;
  qr_code_label: string;
  mrz_label: string;
  issuing_authority: string;
  card_valid_thru: string;
  card_dob: string;
  card_gender: string;
  card_nin: string;
  card_name: string;
  card_doc_num: string;

  // Verification Portal
  verify_title: string;
  verify_subtitle: string;
  tab_scanner: string;
  tab_manual: string;
  scanner_prompt: string;
  scanner_active: string;
  scanner_simulate_btn: string;
  scanner_laser_hint: string;
  manual_input_label: string;
  manual_input_placeholder: string;
  manual_verify_btn: string;
  verify_status_authentic: string;
  verify_status_invalid: string;
  verify_status_restricted: string;
  verify_biometric_matched: string;
  verify_print_slip: string;
  sample_verify_badges: string;

  // Telecom Carriers & ID Cards
  nav_telecom_ids: string;
  telecom_portal_title: string;
  telecom_portal_subtitle: string;
  telecom_card_wakala: string;
  telecom_card_registrar: string;
  telecom_card_staff: string;
  telecom_card_subscriber: string;
  telecom_select_carrier: string;
  telecom_select_type: string;
  telecom_till_number: string;
  telecom_agent_code: string;
  telecom_tcra_license: string;
  telecom_branch_name: string;
  telecom_operating_region: string;
  telecom_all_carriers: string;
  telecom_stats_title: string;
  telecom_verified_badge: string;
  telecom_register_btn: string;
  telecom_print_btn: string;
  telecom_manual_logo_btn: string;
  telecom_manual_logo_title: string;
  telecom_manual_logo_desc: string;
  telecom_upload_logo: string;
  telecom_logo_drag_drop: string;
  telecom_logo_url_input: string;
  telecom_reset_default_logo: string;
  telecom_logo_applied_success: string;
  telecom_card_custom_logo: string;
  telecom_carrier_custom_logo: string;
  telecom_custom_logo_badge: string;

  // Settings
  settings_title: string;
  settings_subtitle: string;
  settings_lang_title: string;
  settings_lang_desc: string;
  settings_reset_data: string;
  settings_reset_confirm: string;
  settings_export_data: string;
  settings_audit_title: string;
  settings_audit_desc: string;

  // Legacy compatibility keys
  nav_request_nida: string;
  nav_new_badge: string;
  nav_lookup: string;
  nav_admin: string;
  nav_tokens: string;
  nav_tokens_plural: string;
  nav_topup: string;
  nav_online_badge: string;
  lang_toggle: string;
  marquee_online: string;
  marquee_phone_active: string;
  marquee_registry_v2: string;
  marquee_ssl: string;
  marquee_tcra_sync: string;
  marquee_zero_incident: string;
  req_badge: string;
  req_hero_title_1: string;
  req_hero_title_2: string;
  req_hero_desc: string;
  req_wallet_title: string;
  req_wallet_enough: string;
  req_wallet_topup_btn: string;
  req_wallet_test_zero: string;
  req_phone_label: string;
  req_phone_placeholder: string;
  req_carrier: string;
  req_examples: string;
  req_name_label: string;
  req_name_placeholder: string;
  req_cost_note: string;
  req_cost_note_desc: string;
  req_submit_btn: string;
  req_submitting_btn: string;
  req_cost_tag: string;
  req_my_requests_title: string;
  req_my_requests_desc: string;
  req_total_requests: string;
  req_open_admin: string;
  req_no_requests_title: string;
  req_no_requests_desc: string;
  req_status_pending: string;
  req_status_completed: string;
  req_received_nin: string;
  req_copy_nin: string;
  req_copied: string;
  req_verify_info: string;
  req_admin_note: string;
  req_success_submit: string;
  req_insufficient_tokens: string;
  req_invalid_phone: string;
  topup_title: string;
  topup_rate: string;
  topup_subtitle: string;
  topup_notice_title: string;
  topup_notice_desc: string;
  topup_package_label: string;
  topup_popular: string;
  topup_free_bonus: string;
  topup_mobile_money_label: string;
  topup_payment_phone_label: string;
  topup_payment_phone_placeholder: string;
  topup_payment_phone_note: string;
  topup_summary_tokens: string;
  topup_summary_amount: string;
  topup_pay_button: string;
  topup_processing_title: string;
  topup_processing_desc: string;
  topup_gateway_secure: string;
  topup_success_title: string;
  topup_success_desc: string;
  topup_success_toast: string;
  admin_badge: string;
  admin_title: string;
  admin_subtitle: string;
  admin_to_user_form: string;
  admin_reset_seed: string;
  admin_metric_total: string;
  admin_metric_pending: string;
  admin_metric_completed: string;
  admin_metric_tokens: string;
  admin_filter_all: string;
  admin_filter_pending: string;
  admin_filter_completed: string;
  admin_search_placeholder: string;
  admin_col_user: string;
  admin_col_requested_phone: string;
  admin_col_timestamp: string;
  admin_col_status: string;
  admin_col_action: string;
  admin_no_records: string;
  admin_input_nin_placeholder: string;
  admin_suggest_btn: string;
  admin_complete_btn: string;
  admin_completed_time: string;
  admin_complete_success: string;
  admin_complete_validation_error: string;
  lookup_hero_badge: string;
  lookup_hero_title_1: string;
  lookup_hero_title_2: string;
  lookup_hero_desc: string;
  lookup_catalog_title: string;
  lookup_catalog_desc: string;
  lookup_catalog_count: string;
  lookup_search_by_phone: string;
  lookup_search_by_nin: string;
  lookup_empty_title: string;
  lookup_empty_desc: string;
  footer_disclaimer: string;
  footer_dev_credit: string;
}

const translations: Record<Language, SmartIdTranslations> = {
  sw: {
    app_title: 'NIDA Smart ID Portal',
    app_subtitle: 'Mfumo Mahiri wa Usimamizi na Uhakiki wa Vitambulisho vya Kidijitali',
    lang_toggle_label: 'Switch to English',
    current_lang_label: 'Kiswahili',
    gov_badge: 'JAMHURI YA MUUNGANO WA TANZANIA · MAMLAKA YA VITAMBULISHO VYA TAIFA',
    national_motto: 'Uhuru na Umoja · Hati Rasmi ya Utambulisho wa Kidijitali',

    nav_dashboard: 'Dashibodi Kuu',
    nav_register: 'Sajili Kitambulisho',
    nav_directory: 'Orodha & Utafutaji',
    nav_verify: 'Hakiki Kitambulisho',
    nav_generator: 'Kadi ya Kidijitali',
    nav_settings: 'Mipangilio',
    nav_logout: 'Ondoka Kwenye Mfumo',

    dash_hero_title: 'Mfumo Mahiri wa Vitambulisho vya Kidijitali',
    dash_hero_desc: 'Usimamizi kamili wa usajili wa raia, utengenezaji wa kadi za kidijitali zenye QR Code, na uthibitishaji salama wa papo hapo kote nchini.',
    dash_quick_register: 'Sajili Raia Mpya',
    dash_quick_verify: 'Hakiki Kitambulisho Sasa',
    metric_total_users: 'Jumla ya Raia Waliosajiliwa',
    metric_active_ids: 'Vitambulisho Vilivyo Hai (Active)',
    metric_pending: 'Vinavyosubiri Uhakiki (Pending)',
    metric_system_status: 'Hali ya Mfumo (Status)',
    metric_uptime: 'Upatikanaji wa Mfumo (Uptime)',
    metric_tcra: 'Muunganisho wa Kanzidata (TCRA/NIDA)',
    metric_security: 'Usalama wa Data',
    metric_last_audit: 'Ukaguzi wa Mwisho',
    dash_recent_registrations: 'Usajili wa Hivi Karibuni',
    dash_recent_sub: 'Orodha ya wananchi waliopatiwa namba za NIDA na kadi za kidijitali hivi karibuni.',
    dash_view_all: 'Tazama Orodha Kamili',
    dash_distribution_title: 'Mgawanyo wa Hali ya Vitambulisho',
    dash_system_health: 'Utendaji na Usalama wa Mfumo',

    reg_title: 'Fomu ya Usajili wa Kitambulisho cha Smart ID',
    reg_subtitle: 'Ingiza taarifa sahihi za raia ili kuzalisha namba rasmi ya NIDA (NIN) na Kitambulisho cha Kidijitali.',
    reg_fullname_label: 'Jina Kamili la Raia (Majina Matatu)',
    reg_fullname_placeholder: 'mf. Juma Hamisi Bakari',
    reg_nin_label: 'Namba ya NIDA / NIN (Hiari / Tupu)',
    reg_nin_placeholder: 'mf. 19900315-11103-00001-21 (Ukiacha wazi itatengenezwa)',
    reg_nin_help: 'Acha wazi ili mfumo uzalishe NIN halali kiotomatiki kulingana na tarehe ya kuzaliwa.',
    reg_dob_label: 'Tarehe ya Kuzaliwa',
    reg_gender_label: 'Jinsia',
    reg_gender_male: 'Mwanaume (Male)',
    reg_gender_female: 'Mwanamke (Female)',
    reg_phone_label: 'Namba ya Simu ya Msingi (07xx au 06xx)',
    reg_phone_placeholder: 'mf. 0754112233',
    reg_photo_label: 'Picha ya Pasipoti ya Raia (Passport Photo)',
    reg_photo_upload_btn: 'Pakia Picha Mpya',
    reg_photo_change_btn: 'Badilisha Picha',
    reg_photo_sample_1: 'Picha ya Sampuli 1',
    reg_photo_sample_2: 'Picha ya Sampuli 2',
    reg_address_title: 'Anwani ya Makazi ya Raia',
    reg_region_label: 'Mkoa (Region)',
    reg_district_label: 'Wilaya (District)',
    reg_ward_label: 'Kata (Ward)',
    reg_street_label: 'Mtaa / Kijiji (Street/Village)',
    reg_citizenship_label: 'Aina ya Uraia',
    reg_citizen_birth: 'Raia wa Kuzaliwa (Citizen by Birth)',
    reg_citizen_registration: 'Raia wa Kuandikishwa (Registration)',
    reg_submit_btn: 'Sajili na Tengeneza Kadi ya Kidijitali',
    reg_submitting: 'Inasajili na Kuzalisha Kadi...',
    reg_success_title: 'Usajili Umekamilika Kikamilifu!',
    reg_success_desc: 'Raia amesajiliwa kwenye kanzidata na kadi yake ya Smart ID ipo tayari kuchapishwa.',
    reg_view_card_btn: 'Tazama na Chapisha Kadi',

    search_title: 'Orodha ya Vitambulisho na Utafutaji wa Haraka',
    search_subtitle: 'Tafuta raia papo hapo kwa Namba ya NIDA (NIN), Jina Kamili, au Namba ya Simu.',
    search_input_placeholder: 'Andika Namba ya NIDA, Jina, au Namba ya Simu...',
    search_filter_all: 'Vitambulisho Vyote',
    search_filter_verified: 'Vilivyohakikiwa (Active)',
    search_filter_pending: 'Vinavyosubiri (Pending)',
    search_filter_restricted: 'Vilivyositishwa (Restricted)',
    search_count_label: 'Jumla ya Raia Wanaopatikana:',
    col_citizen: 'Mwananchi (Jina & Picha)',
    col_nin: 'Namba ya NIDA (NIN)',
    col_phone: 'Simu ya Msingi',
    col_residence: 'Makazi (Mkoa / Wilaya)',
    col_status: 'Hali ya Kitambulisho',
    col_actions: 'Vitendo (Actions)',
    action_view_card: 'Kadi ya Smart ID',
    action_verify: 'Hakiki',
    action_print: 'Chapisha Slip',
    no_citizens_found: 'Hakuna raia anayelingana na utafutaji wako. Jaribu neno jingine au sajili raia mpya.',

    generator_title: 'Kitengeneza Kadi ya Smart ID (Digital ID Card Generator)',
    generator_subtitle: 'Tengeneza kadi rasmi ya kidijitali yenye nembo ya taifa, microchip, na QR Code ya kisasa inayosomeka.',
    select_citizen_label: 'Chagua Raia wa Kumtengenezea Kadi:',
    card_front_title: 'Upande wa Mbele (Front Side)',
    card_back_title: 'Upande wa Nyuma (Back Side)',
    btn_flip_card: 'Geuza Upande wa Kadi (Flip Card)',
    btn_print_card: 'Chapisha Kadi (Print Smart Card)',
    btn_download_card: 'Pakua Kadi (Download JSON/Pass)',
    qr_code_label: 'QR Code Rasmi ya Uhakiki',
    mrz_label: 'Machine Readable Zone (MRZ)',
    issuing_authority: 'MAMLAKA YA VITAMBULISHO VYA TAIFA (NIDA) · DODOMA',
    card_valid_thru: 'Muda wa Kazi: Miaka 10 (2020 - 2030)',
    card_dob: 'Tarehe ya Kuzaliwa:',
    card_gender: 'Jinsia:',
    card_nin: 'Namba ya NIDA (NIN):',
    card_name: 'Jina Kamili:',
    card_doc_num: 'Namba ya Hati:',

    verify_title: 'Mlango wa Uhakiki wa Vitambulisho (Verification Portal)',
    verify_subtitle: 'Kikaguzi cha papo hapo cha kubaini kama kitambulisho cha NIDA ni halali, kipo hai, au kimesitishwa.',
    tab_scanner: 'Kikaguzi cha Kamera / Scanner',
    tab_manual: 'Kuingiza Namba kwa Mkono (Manual)',
    scanner_prompt: 'Weka QR Code ya Kitambulisho mbele ya kamera ya kikaguzi',
    scanner_active: 'Kikaguzi cha Kamera Kimewashwa · Scanline Active',
    scanner_simulate_btn: 'Bonyeza Hapa Kujaribu Kuchanganua QR Code',
    scanner_laser_hint: 'Mfumo unasoma namba ya NIN na checksum ya SHA-256 kutoka kwenye QR code.',
    manual_input_label: 'Ingiza Namba ya NIDA (NIN) au Simu ya Raia:',
    manual_input_placeholder: 'mf. 19900315-11103-00001-21 au 0754112233',
    manual_verify_btn: 'Kagua Kwenye Kanzidata ya NIDA',
    verify_status_authentic: 'KITAMBULISHO NI HALISI NA KIPO HAI (AUTHENTIC & ACTIVE)',
    verify_status_invalid: 'KITAMBULISHO HAKIJAONEKANA KWENYE KANZIDATA (NOT FOUND)',
    verify_status_restricted: 'KITAMBULISHO KIMESITISHWA NA MAMLAKA (RESTRICTED)',
    verify_biometric_matched: 'Alama za vidole na picha ya uso zimelingana kikamilifu (Biometrics Matched)',
    verify_print_slip: 'Chapisha Cheti cha Uhakiki (Official Verification Slip)',
    sample_verify_badges: 'Mifano ya Haraka ya Kukagua:',

    // Telecom Carriers & ID Cards
    nav_telecom_ids: 'Vitambulisho vya Makampuni ya Simu',
    telecom_portal_title: 'Mfumo wa Vitambulisho vya Makampuni ya Simu Tanzania',
    telecom_portal_subtitle: 'Vitambulisho rasmi vyenye nembo na rangi za Vodacom, Airtel, Tigo/Yas, Halotel, TTCL, na Zantel kwa Mawakala, Wasajili na Wafanyakazi.',
    telecom_card_wakala: 'Kitambulisho cha Wakala (Agent / Mobile Money)',
    telecom_card_registrar: 'Afisa Usajili wa Laini za Simu (SIM Registrar)',
    telecom_card_staff: 'Mfanyakazi / Mhandisi wa Mawasiliano (Staff ID)',
    telecom_card_subscriber: 'Kitambulisho cha Usajili wa Laini (Subscriber SIM)',
    telecom_select_carrier: 'Chagua Kampuni ya Simu',
    telecom_select_type: 'Aina ya Kitambulisho',
    telecom_till_number: 'Namba ya Till / Wakala',
    telecom_agent_code: 'Namba ya Utambulisho wa Wakala (Agent Code)',
    telecom_tcra_license: 'Namba ya Leseni ya TCRA',
    telecom_branch_name: 'Tawi / Kituo cha Uendeshaji',
    telecom_operating_region: 'Mkoa wa Uendeshaji',
    telecom_all_carriers: 'Mitandao Yote ya Simu',
    telecom_stats_title: 'Takwimu za Vitambulisho vya Mitandao ya Simu',
    telecom_verified_badge: 'KADI RASMI YA MAWASILIANO IMETHIBITISHWA NA TCRA',
    telecom_register_btn: 'Sajili Kitambulisho cha Mtandao',
    telecom_print_btn: 'Chapisha Kitambulisho cha Kampuni',
    telecom_manual_logo_btn: 'Weka Nembo kwa Mkono (Manual Logo)',
    telecom_manual_logo_title: 'Kidhibiti cha Nembo kwa Mkono (Manual Logo Manager)',
    telecom_manual_logo_desc: 'Weka au badilisha nembo ya kampuni ya simu au kitambulisho hiki moja kwa moja kwa kupakia picha kutoka kwenye kifaa chako.',
    telecom_upload_logo: 'Pakia Nembo ya Kampuni (PNG / JPG / SVG)',
    telecom_logo_drag_drop: 'Bofya au vuta faili la nembo hapa ili kuipakia',
    telecom_logo_url_input: 'Au bandika kiungo cha picha ya nembo (Image URL)',
    telecom_reset_default_logo: 'Rejesha Nembo Asilia ya Mtandao',
    telecom_logo_applied_success: 'Nembo imesasishwa kikamilifu kwenye kitambulisho!',
    telecom_card_custom_logo: 'Nembo ya Kitambulisho Hiki (Specific Card Logo)',
    telecom_carrier_custom_logo: 'Nembo ya Mtandao Wote (Global Carrier Logo)',
    telecom_custom_logo_badge: 'NEMBO IMESETIWA KWA MKONO',

    settings_title: 'Mipangilio ya Mfumo (System Settings)',
    settings_subtitle: 'Sanidi lugha ya mfumo, vigezo vya usalama, na usimamizi wa data ya vitambulisho.',
    settings_lang_title: 'Lugha ya Mfumo (Interface Language)',
    settings_lang_desc: 'Chagua Kiswahili au Kiingereza kwa muonekano wote wa dashibodi.',
    settings_reset_data: 'Rejesha Data za Sampuli (Reset Demo Seed Data)',
    settings_reset_confirm: 'Data za majaribio zimerejeshwa kikamilifu!',
    settings_export_data: 'Pakua Hifadhi ya Kanzidata (Export Database JSON)',
    settings_audit_title: 'Kumbukumbu za Usalama (Audit Logs)',
    settings_audit_desc: 'Orodha ya matukio ya usajili, uhakiki, na uchapishaji wa vitambulisho.',

    // Legacy keys
    nav_request_nida: 'OMBA NIDA HAPA',
    nav_new_badge: 'HUDUMA MPYA',
    nav_lookup: 'Kikaguzi cha NIDA',
    nav_admin: 'Admin Nida Requests',
    nav_tokens: 'Token',
    nav_tokens_plural: 'Tokens',
    nav_topup: 'Weka Salio / Ongeza Token',
    nav_online_badge: 'NODE: DAR-TZ-01 (TCRA-SYNC)',
    lang_toggle: 'English',
    marquee_online: 'PORTAL YA KUKAGUA NIDA - MFUMO UKO HEWANI',
    marquee_phone_active: 'HUDUMA MPYA: OMBA NIDA KWA NAMBA YA SIMU IMEWASHWA',
    marquee_registry_v2: 'NIDA IDENTITY REGISTRY V2.4 - OPERATIONAL',
    marquee_ssl: 'MUUNGANISHO WA SSL 256-BIT UKO SALAMA',
    marquee_tcra_sync: 'TCRA & MITANDAO YA SIMU: BIOMETRIC SYNC ACTIVE',
    marquee_zero_incident: 'HAKUNA HITILAFU - SECURE GOV GATEWAY',
    req_badge: 'HUDUMA YA MOJA KWA MOJA YA NIDA KWA SIMU',
    req_hero_title_1: 'OMBA',
    req_hero_title_2: 'NIDA HAPA',
    req_hero_desc: 'Tuma namba yako ya simu iliyosajiliwa kibiometria kupitia TCRA na upate namba yako ya NIDA (NIN) papo hapo kwa njia salama.',
    req_wallet_title: 'Mkoba Wako / Salio la Token (Wallet Balance)',
    req_wallet_enough: 'Inatosha maombi',
    req_wallet_topup_btn: 'Weka Salio / Ongeza Token',
    req_wallet_test_zero: 'Jaribu Salio: 0',
    req_phone_label: 'Namba ya Simu Inayohitaji NIDA (Mobile Phone Number)',
    req_phone_placeholder: '0784615052 au 0655112233',
    req_carrier: 'Mtandao',
    req_examples: 'Mifano ya haraka:',
    req_name_label: 'Jina la Mwombaji (Hiari / Optional)',
    req_name_placeholder: 'mf. Eliya Amos Mwakyusa',
    req_cost_note: 'Kila ombi linagharimu token 1 (Tshs 200).',
    req_cost_note_desc: 'Mara tu unapotuma ombi, mfumo utakatwa token 1 na ombi lako litatumwa kwenye dawati la usajili wa NIDA.',
    req_submit_btn: 'Tuma Ombi / Request NIDA',
    req_submitting_btn: 'Inatuma Ombi...',
    req_cost_tag: 'Gharama: 1 Token',
    req_my_requests_title: 'Maombi Yangu ya NIDA & Majibu Yaliyopokelewa',
    req_my_requests_desc: 'Orodha ya namba za simu ulizoombea NIDA na majibu kutoka kwa wasimamizi.',
    req_total_requests: 'Jumla ya Maombi',
    req_open_admin: 'Fungua Admin Dashboard',
    req_no_requests_title: 'Bado Hujatuma Ombi',
    req_no_requests_desc: 'Weka namba ya simu kwenye fomu hapo juu kisha bofya "Tuma Ombi" kupokea namba yako ya NIDA.',
    req_status_pending: 'Inashughulikiwa (Pending)',
    req_status_completed: 'Imekamilika (Completed)',
    req_received_nin: 'Namba Yako ya NIDA (NIN):',
    req_copy_nin: 'Nakili NIN',
    req_copied: 'Imenakiliwa!',
    req_verify_info: 'Hakiki Taarifa',
    req_admin_note: 'Ujumbe wa Afisa:',
    req_success_submit: 'Ombi lako limetumwa kikamilifu! Token 1 imekatwa. Afisa wa NIDA atalishughulikia na utapata NIN yako hapa chini.',
    req_insufficient_tokens: 'Salio la token halitoshi! Unahitaji angalau token 1 (Tshs 200). Tafadhali weka salio hapa.',
    req_invalid_phone: 'Tafadhali weka namba sahihi ya simu ya Tanzania (mf. 0784615052).',
    topup_title: 'Weka Salio la Token za NIDA',
    topup_rate: 'Tshs 200 = Token 1',
    topup_subtitle: 'Kila ombi linahitaji angalau token 1 iliyoidhinishwa.',
    topup_notice_title: 'Taarifa ya Malipo:',
    topup_notice_desc: 'Ili kutuma ombi la kupatiwa namba yako ya NIDA, unahitaji angalau token 1 (Tshs 200). Chagua kifurushi hapa chini:',
    topup_package_label: 'Chagua Kifurushi cha Token',
    topup_popular: 'Maarufu',
    topup_free_bonus: 'Bure',
    topup_mobile_money_label: 'Chagua Mtandao wa Malipo (Mobile Money)',
    topup_payment_phone_label: 'Namba ya Simu ya Kulipia (M-Pesa / Airtel / Tigo / HaloPesa)',
    topup_payment_phone_placeholder: 'mf. 0784615052',
    topup_payment_phone_note: 'Utapokea ujumbe wa USSD (PIN prompt) kwenye simu yako ili kukamilisha malipo haya.',
    topup_summary_tokens: 'Jumla ya Token zitakazoongezwa:',
    topup_summary_amount: 'Kiasi cha Kulipia:',
    topup_pay_button: 'Lipa & Pokea Token',
    topup_processing_title: 'Inatuma Ombi la Malipo kwenye Simu...',
    topup_processing_desc: 'Tafadhali ingiza PIN yako kwenye simu yako ili kuidhinisha malipo.',
    topup_gateway_secure: 'Salama: Muunganisho wa Benki / TCRA Gateway',
    topup_success_title: 'Malipo Yamekamilika Kikamilifu!',
    topup_success_desc: 'Token zimeongezwa kwenye mkoba wako papo hapo.',
    topup_success_toast: 'Umefanikiwa kuongeza salio! Salio jipya:',
    admin_badge: 'NIDA REGISTRATION DESK · AFISA USIMAMIZI',
    admin_title: 'Admin Nida Requests (Usimamizi wa Maombi)',
    admin_subtitle: 'Hakiki maombi ya wananchi yaliyowasilishwa, weka namba za NIDA (NIN), na kamilisha maombi papo hapo.',
    admin_to_user_form: '+ Fomu ya Mtumiaji (OMBA NIDA)',
    admin_reset_seed: 'Rudisha takwimu za awali',
    admin_metric_total: 'Jumla ya Maombi',
    admin_metric_pending: 'Yanayosubiri (Pending)',
    admin_metric_completed: 'Yaliyokamilika (Completed)',
    admin_metric_tokens: 'Mapato ya Token',
    admin_filter_all: 'Yote',
    admin_filter_pending: 'Inasubiri',
    admin_filter_completed: 'Zimekamilika',
    admin_search_placeholder: 'Tafuta namba ya simu au NIN...',
    admin_col_user: 'Mtumiaji / Namba ya Simu',
    admin_col_requested_phone: 'Namba ya Simu Iliyoomba NIDA',
    admin_col_timestamp: 'Tarehe & Saa',
    admin_col_status: 'Hali (Status)',
    admin_col_action: 'Kitendo (Weka NIN & Kamilisha)',
    admin_no_records: 'Hakuna maombi yanayolingana na vigezo vilivyochaguliwa.',
    admin_input_nin_placeholder: 'Weka NIN (mf. 19941208-14205-00129-22)',
    admin_suggest_btn: 'Pendekeza',
    admin_complete_btn: 'Kamilisha / Patia NIDA',
    admin_completed_time: 'Imekamilika:',
    admin_complete_success: 'Ombi limekamilishwa! Mtumiaji sasa anaweza kuona NIN yake.',
    admin_complete_validation_error: 'Tafadhali ingiza namba kamili ya NIDA (NIN) kabla ya kukamilisha.',
    lookup_hero_badge: 'KIKAGUZI CHA NIDA KWA NAMBA YA SIMU & NIN',
    lookup_hero_title_1: 'Citizen Identity',
    lookup_hero_title_2: '& SIM Verification Portal',
    lookup_hero_desc: 'Angalia namba ya NIDA (NIN), alama za vidole, na taarifa za uraia papo hapo kupitia Namba ya Simu (TCRA Biometric Link) au Namba ya NIDA.',
    lookup_catalog_title: 'Katalogi ya Mifano ya Majaribio (Sample Citizens)',
    lookup_catalog_desc: 'Bofya mwananchi yeyote hapa chini ili kupata taarifa zake kwa namba ya simu au NIN mara moja:',
    lookup_catalog_count: 'Rekodi za Simu na NIDA Zipo Tayari',
    lookup_search_by_phone: 'Tafuta kwa Simu',
    lookup_search_by_nin: 'NIN',
    lookup_empty_title: 'Hakuna Swali Lililowekwa',
    lookup_empty_desc: 'Tafadhali weka namba ya simu (mf. 0784615052), namba ya NIDA (NIN), au jina kamili katika kisanduku cha utafutaji hapo juu.',
    footer_disclaimer: 'Mfumo rasmi wa uthibitishaji wa vitambulisho vya taifa (NIDA) na namba za simu (TCRA). Haki zote zimehifadhiwa.',
    footer_dev_credit: 'Imeundwa na Kusimamiwa na Kitengo cha Teknolojia ya NIDA',
  },
  en: {
    app_title: 'NIDA Smart ID Portal',
    app_subtitle: 'Smart Digital Identification Management & Verification Gateway',
    lang_toggle_label: 'Badilisha kwenda Kiswahili',
    current_lang_label: 'English',
    gov_badge: 'UNITED REPUBLIC OF TANZANIA · NATIONAL IDENTIFICATION AUTHORITY',
    national_motto: 'Freedom and Unity · Official Digital Identity Credential',

    nav_dashboard: 'Dashboard',
    nav_register: 'Register ID',
    nav_directory: 'ID Directory & Search',
    nav_verify: 'Verification Portal',
    nav_generator: 'Digital ID Generator',
    nav_settings: 'Settings',
    nav_logout: 'Sign Out',

    dash_hero_title: 'Smart Digital ID Management System',
    dash_hero_desc: 'Unified citizen registration, cryptographic digital smart pass generation with scannable QR codes, and instant nationwide identity verification.',
    dash_quick_register: 'Register New Citizen',
    dash_quick_verify: 'Verify ID Now',
    metric_total_users: 'Total Registered Users',
    metric_active_ids: 'Active IDs',
    metric_pending: 'Pending Verification',
    metric_system_status: 'System Status',
    metric_uptime: 'Service Uptime',
    metric_tcra: 'Registry Sync (TCRA/NIDA)',
    metric_security: 'Data Security Standard',
    metric_last_audit: 'Last Health Check',
    dash_recent_registrations: 'Recent Registrations',
    dash_recent_sub: 'Citizens recently enrolled with generated national ID numbers and digital smart cards.',
    dash_view_all: 'View Full Directory',
    dash_distribution_title: 'ID Status Distribution',
    dash_system_health: 'System Infrastructure & PKI Health',

    reg_title: 'Smart ID Registration Form',
    reg_subtitle: 'Enter official citizen demographic records to issue an authoritative National ID (NIN) and Digital Smart ID Card.',
    reg_fullname_label: 'Full Legal Name (Three Names)',
    reg_fullname_placeholder: 'e.g. Juma Hamisi Bakari',
    reg_nin_label: 'National ID / NIN (Optional / Leave blank for auto-generate)',
    reg_nin_placeholder: 'e.g. 19900315-11103-00001-21',
    reg_nin_help: 'Leave blank to automatically generate a validated 20-digit NIN based on birthdate and civil registry sequence.',
    reg_dob_label: 'Date of Birth',
    reg_gender_label: 'Gender',
    reg_gender_male: 'Male',
    reg_gender_female: 'Female',
    reg_phone_label: 'Primary Phone Number (07xx or 06xx)',
    reg_phone_placeholder: 'e.g. 0754112233',
    reg_photo_label: 'Citizen Passport Portrait Photo',
    reg_photo_upload_btn: 'Upload Photo',
    reg_photo_change_btn: 'Change Photo',
    reg_photo_sample_1: 'Preset Sample 1',
    reg_photo_sample_2: 'Preset Sample 2',
    reg_address_title: 'Residential Address',
    reg_region_label: 'Region',
    reg_district_label: 'District',
    reg_ward_label: 'Ward',
    reg_street_label: 'Street / Village',
    reg_citizenship_label: 'Citizenship Category',
    reg_citizen_birth: 'Citizen by Birth',
    reg_citizen_registration: 'Citizen by Registration',
    reg_submit_btn: 'Register & Generate Digital ID Card',
    reg_submitting: 'Registering Citizen & Issuing Pass...',
    reg_success_title: 'Registration Completed Successfully!',
    reg_success_desc: 'Citizen enrolled in the national registry and Digital Smart ID card is ready for print and download.',
    reg_view_card_btn: 'View & Print Digital ID Card',

    search_title: 'User Directory & Instant Search',
    search_subtitle: 'Search and filter registered citizens instantly by NIDA Number (NIN), Full Name, or Phone Number.',
    search_input_placeholder: 'Search by NIDA number, citizen name, or phone number...',
    search_filter_all: 'All Statuses',
    search_filter_verified: 'Verified & Active',
    search_filter_pending: 'Pending Verification',
    search_filter_restricted: 'Restricted / Suspended',
    search_count_label: 'Total Registered Citizens Found:',
    col_citizen: 'Citizen (Name & Photo)',
    col_nin: 'National ID (NIN)',
    col_phone: 'Primary Phone',
    col_residence: 'Residence (Region / District)',
    col_status: 'ID Status',
    col_actions: 'Actions',
    action_view_card: 'Smart ID Card',
    action_verify: 'Verify',
    action_print: 'Print Slip',
    no_citizens_found: 'No citizens matched your search criteria. Try a different keyword or register a new user.',

    generator_title: 'Digital ID Card Generator',
    generator_subtitle: 'Automatically generates an official printable and downloadable Digital Smart ID Card with scannable QR verification code.',
    select_citizen_label: 'Select Citizen to Generate Smart ID Card:',
    card_front_title: 'Card Front Side',
    card_back_title: 'Card Back Side',
    btn_flip_card: 'Flip Card (Front / Back)',
    btn_print_card: 'Print Smart ID Card',
    btn_download_card: 'Download Pass (JSON)',
    qr_code_label: 'Official Verification QR Code',
    mrz_label: 'Machine Readable Zone (MRZ)',
    issuing_authority: 'NATIONAL IDENTIFICATION AUTHORITY (NIDA) · DODOMA, TANZANIA',
    card_valid_thru: 'Validity Period: 10 Years (2020 - 2030)',
    card_dob: 'Date of Birth:',
    card_gender: 'Gender:',
    card_nin: 'National ID (NIN):',
    card_name: 'Full Name:',
    card_doc_num: 'Document No:',

    verify_title: 'ID Verification Portal',
    verify_subtitle: 'Instant verification gateway to check whether a citizen ID is authentic, active, or suspended in the civil registry.',
    tab_scanner: 'Camera Scanner Mode',
    tab_manual: 'Manual Input Mode',
    scanner_prompt: 'Position Digital ID QR Code in front of the optical scanner',
    scanner_active: 'Optical Scanner Active · Scanline Tracking',
    scanner_simulate_btn: 'Simulate Scanning Citizen QR Code',
    scanner_laser_hint: 'The system decodes the cryptographic NIN payload and validates the SHA-256 integrity checksum.',
    manual_input_label: 'Enter National ID Number (NIN) or Phone Number:',
    manual_input_placeholder: 'e.g. 19900315-11103-00001-21 or 0754112233',
    manual_verify_btn: 'Verify Against National Registry',
    verify_status_authentic: 'AUTHENTIC & ACTIVE IN NATIONAL REGISTRY',
    verify_status_invalid: 'RECORD NOT FOUND OR UNVERIFIED IN REGISTRY',
    verify_status_restricted: 'IDENTITY RECORD RESTRICTED BY CIVIL AUTHORITY',
    verify_biometric_matched: 'Biometric fingerprint and facial recognition matched (Level-3 Assured)',
    verify_print_slip: 'Print Official Verification Slip (PDF)',
    sample_verify_badges: 'Quick Samples to Test Verify:',

    // Telecom Carriers & ID Cards
    nav_telecom_ids: 'Telecom Company IDs',
    telecom_portal_title: 'Tanzania Telecom Carriers Identification System',
    telecom_portal_subtitle: 'Official ID credentials with logos & brand colors for Vodacom, Airtel, Tigo/Yas, Halotel, TTCL, and Zantel agents, registrars, and staff.',
    telecom_card_wakala: 'Authorized Agent ID (Wakala / Mobile Money)',
    telecom_card_registrar: 'SIM Registration Officer ID (Field Registrar)',
    telecom_card_staff: 'Telecom Staff / Field Engineer ID',
    telecom_card_subscriber: 'Verified Subscriber SIM Pass',
    telecom_select_carrier: 'Select Telecom Operator',
    telecom_select_type: 'Credential Category',
    telecom_till_number: 'Till / Agency Number',
    telecom_agent_code: 'Official Agent / Staff Code',
    telecom_tcra_license: 'TCRA License Number',
    telecom_branch_name: 'Branch / Station Office',
    telecom_operating_region: 'Operating Region',
    telecom_all_carriers: 'All Telecom Operators',
    telecom_stats_title: 'Telecom Credential Statistics by Carrier',
    telecom_verified_badge: 'OFFICIAL TCRA COMPLIANT TELECOM CREDENTIAL',
    telecom_register_btn: 'Enroll Telecom ID Credential',
    telecom_print_btn: 'Print Operator ID Card',
    telecom_manual_logo_btn: 'Manual Logo Upload (Weka Nembo)',
    telecom_manual_logo_title: 'Manual Logo Manager & Customizer',
    telecom_manual_logo_desc: 'Upload or replace telecom carrier or specific ID badge logos directly from your device storage.',
    telecom_upload_logo: 'Upload Company Logo (PNG / JPG / SVG)',
    telecom_logo_drag_drop: 'Click or drop logo image here to upload',
    telecom_logo_url_input: 'Or paste image URL',
    telecom_reset_default_logo: 'Restore Default Carrier Vector Logo',
    telecom_logo_applied_success: 'Logo updated successfully on credential badge!',
    telecom_card_custom_logo: 'Card-Specific Logo',
    telecom_carrier_custom_logo: 'All Operator Cards Logo (Global)',
    telecom_custom_logo_badge: 'MANUAL LOGO APPLIED',

    settings_title: 'System Settings & Infrastructure',
    settings_subtitle: 'Configure bilingual interface options, security audit controls, and database backups.',
    settings_lang_title: 'Interface Language (Lugha)',
    settings_lang_desc: 'Select Swahili or English for the entire portal dashboard and generated cards.',
    settings_reset_data: 'Reset Demo Seed Data',
    settings_reset_confirm: 'Seed data restored to initial demo registry state!',
    settings_export_data: 'Export Database Records (JSON)',
    settings_audit_title: 'Security & Audit Logs',
    settings_audit_desc: 'Immutable trail of registration, verification, and ID generation actions.',

    // Legacy keys
    nav_request_nida: 'REQUEST NIDA HERE',
    nav_new_badge: 'NEW SERVICE',
    nav_lookup: 'NIDA Lookup Portal',
    nav_admin: 'Admin Nida Requests',
    nav_tokens: 'Token',
    nav_tokens_plural: 'Tokens',
    nav_topup: 'Top Up / Add Tokens',
    nav_online_badge: 'NODE: DAR-TZ-01 (TCRA-SYNC)',
    lang_toggle: 'Kiswahili',
    marquee_online: 'NIDA SECURE LOOKUP PORTAL - SYSTEM ONLINE',
    marquee_phone_active: 'NEW SERVICE: REQUEST NIDA BY PHONE NUMBER IS ACTIVE',
    marquee_registry_v2: 'NIDA IDENTITY REGISTRY V2.4 - OPERATIONAL',
    marquee_ssl: 'SSL 256-BIT ENCRYPTED SECURE SESSION ACTIVE',
    marquee_tcra_sync: 'TCRA & MOBILE CARRIERS: BIOMETRIC SYNC ACTIVE',
    marquee_zero_incident: 'ZERO SYSTEM INCIDENTS - SECURE GOV GATEWAY',
    req_badge: 'DIRECT NIDA SERVICE VIA PHONE NUMBER',
    req_hero_title_1: 'REQUEST',
    req_hero_title_2: 'NIDA HERE',
    req_hero_desc: 'Submit your biometric TCRA-registered phone number to request and retrieve your official National ID Number (NIN) securely.',
    req_wallet_title: 'Your Wallet / Token Balance',
    req_wallet_enough: 'Sufficient for',
    req_wallet_topup_btn: 'Top Up / Add Tokens',
    req_wallet_test_zero: 'Test 0 Tokens',
    req_phone_label: 'Mobile Phone Number Needing NIDA Service',
    req_phone_placeholder: '0784615052 or 0655112233',
    req_carrier: 'Carrier',
    req_examples: 'Quick samples:',
    req_name_label: 'Applicant Name (Optional)',
    req_name_placeholder: 'e.g. Eliya Amos Mwakyusa',
    req_cost_note: 'Each request costs 1 token (Tshs 200).',
    req_cost_note_desc: 'Upon submission, 1 token is deducted and your request is forwarded immediately to the NIDA verification registry desk.',
    req_submit_btn: 'Submit Request / Request NIDA',
    req_submitting_btn: 'Submitting Request...',
    req_cost_tag: 'Cost: 1 Token',
    req_my_requests_title: 'My NIDA Requests & Received Results',
    req_my_requests_desc: 'List of phone numbers submitted for NIDA retrieval and responses from NIDA officers.',
    req_total_requests: 'Total Requests',
    req_open_admin: 'Open Admin Dashboard',
    req_no_requests_title: 'No Requests Submitted Yet',
    req_no_requests_desc: 'Enter a mobile phone number in the form above and click "Submit Request" to get your NIDA number.',
    req_status_pending: 'Processing (Pending)',
    req_status_completed: 'Completed',
    req_received_nin: 'Your National ID Number (NIN):',
    req_copy_nin: 'Copy NIN',
    req_copied: 'Copied!',
    req_verify_info: 'Verify Details',
    req_admin_note: 'Officer Note:',
    req_success_submit: 'Your request has been submitted successfully! 1 token deducted. The NIDA officer will fulfill it and provide your NIN below.',
    req_insufficient_tokens: 'Insufficient token balance! You need at least 1 token (Tshs 200). Please top up your wallet.',
    req_invalid_phone: 'Please enter a valid Tanzanian phone number (e.g., 0784615052).',
    topup_title: 'Top Up NIDA Service Tokens',
    topup_rate: 'Tshs 200 = 1 Token',
    topup_subtitle: 'Each NIDA lookup request requires at least 1 verified token.',
    topup_notice_title: 'Payment Notice:',
    topup_notice_desc: 'To submit a request to retrieve your NIDA number, you need at least 1 token (Tshs 200). Select a package below:',
    topup_package_label: 'Select Token Package',
    topup_popular: 'Popular',
    topup_free_bonus: 'Free Bonus',
    topup_mobile_money_label: 'Select Mobile Money Provider',
    topup_payment_phone_label: 'Mobile Money Number (M-Pesa / Airtel / Tigo / HaloPesa)',
    topup_payment_phone_placeholder: 'e.g. 0784615052',
    topup_payment_phone_note: 'You will receive an instant USSD PIN push notification on your mobile handset to authorize this payment.',
    topup_summary_tokens: 'Total Tokens to be Credited:',
    topup_summary_amount: 'Amount Payable:',
    topup_pay_button: 'Pay & Credit Tokens',
    topup_processing_title: 'Sending Payment Request to Handset...',
    topup_processing_desc: 'Please enter your mobile money PIN on your phone to authorize this payment.',
    topup_gateway_secure: 'Secure: Bank & TCRA Payment Gateway',
    topup_success_title: 'Payment Completed Successfully!',
    topup_success_desc: 'Tokens have been credited to your wallet instantly.',
    topup_success_toast: 'Wallet topped up successfully! New Balance:',
    admin_badge: 'NIDA REGISTRATION DESK · OFFICER CONSOLE',
    admin_title: 'Admin Nida Requests (Request Management)',
    admin_subtitle: 'Review submitted citizen mobile requests, attach verified NIDA numbers (NIN), and fulfill requests in real-time.',
    admin_to_user_form: '+ Citizen Request Form (REQUEST NIDA)',
    admin_reset_seed: 'Reset Demo Seed Data',
    admin_metric_total: 'Total Requests',
    admin_metric_pending: 'Pending',
    admin_metric_completed: 'Completed',
    admin_metric_tokens: 'Token Revenue',
    admin_filter_all: 'All',
    admin_filter_pending: 'Pending',
    admin_filter_completed: 'Completed',
    admin_search_placeholder: 'Search phone number or NIN...',
    admin_col_user: 'User / Phone Number',
    admin_col_requested_phone: 'Requested Mobile Number',
    admin_col_timestamp: 'Timestamp',
    admin_col_status: 'Status',
    admin_col_action: 'Action (Enter NIN & Fulfill)',
    admin_no_records: 'No requests found matching your filter criteria.',
    admin_input_nin_placeholder: 'Enter NIN (e.g. 19941208-14205-00129-22)',
    admin_suggest_btn: 'Suggest',
    admin_complete_btn: 'Fulfill / Assign NIDA',
    admin_completed_time: 'Completed:',
    admin_complete_success: 'Request fulfilled successfully! Citizen can now view their NIN immediately.',
    admin_complete_validation_error: 'Please enter a valid NIDA number (NIN) before fulfilling.',
    lookup_hero_badge: 'CITIZEN NIDA LOOKUP BY PHONE & NIN',
    lookup_hero_title_1: 'Citizen Identity',
    lookup_hero_title_2: '& SIM Verification Portal',
    lookup_hero_desc: 'Lookup National ID Numbers (NIN), biometric registry details, and citizenship records instantly via Mobile Phone Number (TCRA Biometric Link) or NIN.',
    lookup_catalog_title: 'Preloaded Registry Samples (Citizen Catalog)',
    lookup_catalog_desc: 'Click any citizen below to retrieve their official identity profile by phone number or NIN instantly:',
    lookup_catalog_count: 'Sim & NIDA Records Ready',
    lookup_search_by_phone: 'Search by Phone',
    lookup_search_by_nin: 'NIN',
    lookup_empty_title: 'No Search Query Entered',
    lookup_empty_desc: 'Please enter a mobile phone number (e.g. 0784615052), NIDA number (NIN), or full name in the search box above.',
    footer_disclaimer: 'Official National Identification Authority (NIDA) and TCRA SIM biometric verification portal. All rights reserved.',
    footer_dev_credit: 'Designed and Maintained by NIDA Digital Services Unit',
  },
};

const LANGUAGE_STORAGE_KEY = 'smart_id_language_v2';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: SmartIdTranslations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved === 'sw' || saved === 'en') {
        return saved;
      }
    } catch {}
    return 'sw'; // Default Swahili as requested (Swahili and English bilingual)
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {}
  };

  const toggleLanguage = () => {
    const next = language === 'sw' ? 'en' : 'sw';
    setLanguage(next);
  };

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
