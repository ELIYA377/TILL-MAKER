import React, { useState } from 'react';
import { 
  UserPlus, 
  CreditCard, 
  Calendar, 
  Phone, 
  MapPin, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Camera, 
  Check, 
  User as UserIcon,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { SmartIdStore } from '../../services/smartIdStore';
import { NidaRecord } from '../../types';
import samplePhoto1 from '../../assets/images/avatar_citizen_verified_1790750468089.jpg';
import { TelecomLogo, detectCarrierFromPhone, TELECOM_CARRIERS } from './TelecomLogos';

interface UserRegistrationProps {
  onRegistrationSuccess: (citizen: NidaRecord) => void;
  onNavigateToCard: (citizen: NidaRecord) => void;
}

export const UserRegistration: React.FC<UserRegistrationProps> = ({
  onRegistrationSuccess,
  onNavigateToCard,
}) => {
  const { t } = useLanguage();

  const [fullName, setFullName] = useState('');
  const [nin, setNin] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('1996-05-18');
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string>(samplePhoto1);

  // Address
  const [region, setRegion] = useState('DAR ES SALAAM');
  const [district, setDistrict] = useState('ILALA');
  const [ward, setWard] = useState('KARIARKOO');
  const [street, setStreet] = useState('LUMUMBA ST. 45');
  const [citizenshipType, setCitizenshipType] = useState<'CITIZEN BY BIRTH' | 'CITIZEN BY REGISTRATION'>('CITIZEN BY BIRTH');

  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string; record?: NidaRecord } | null>(null);

  // Handle Photo File Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!fullName.trim() || fullName.trim().split(' ').length < 2) {
      setFeedback({
        type: 'error',
        message: 'Tafadhali weka jina kamili lenye angalau majina mawili (Full name required).',
      });
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10 || (!cleanPhone.startsWith('06') && !cleanPhone.startsWith('07'))) {
      setFeedback({
        type: 'error',
        message: 'Namba ya simu lazima ianze na 07 au 06 na iwe na tarakimu 10 (e.g. 0754112233).',
      });
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const result = SmartIdStore.registerCitizen({
        fullName: fullName.trim(),
        nin: nin.trim() || undefined,
        dateOfBirth,
        gender,
        phone: cleanPhone,
        avatarUrl,
        region: region.trim(),
        district: district.trim(),
        ward: ward.trim(),
        street: street.trim(),
        citizenshipType,
      });

      setIsLoading(false);

      if (result.success && result.record) {
        setFeedback({
          type: 'success',
          message: `${t.reg_success_title} NIN: ${result.record.nin}`,
          record: result.record,
        });
        onRegistrationSuccess(result.record);
      } else {
        setFeedback({
          type: 'error',
          message: result.message || 'Hitilafu wakati wa usajili.',
        });
      }
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {t.reg_title}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {t.reg_subtitle}
            </p>
          </div>
        </div>

        {/* Success Confirmation Card if registered */}
        {feedback?.type === 'success' && feedback.record && (
          <div className="mt-6 p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-500/40 text-emerald-950 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{feedback.message}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => onNavigateToCard(feedback.record!)}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>{t.reg_view_card_btn} &rarr;</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFullName('');
                  setNin('');
                  setPhone('');
                  setFeedback(null);
                }}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-emerald-300 transition-colors cursor-pointer"
              >
                + Sajili Raia Mwingine
              </button>
            </div>
          </div>
        )}

        {/* Error message */}
        {feedback?.type === 'error' && (
          <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          
          {/* SECTION 1: CITIZEN DEMOGRAPHICS */}
          <div className="space-y-4">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block border-b border-slate-100 pb-2">
              01. Taarifa Binafsi za Raia (Personal Details)
            </span>

            {/* Photo Upload & Preview Row */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-5">
              <div className="relative w-24 h-28 rounded-xl overflow-hidden border-2 border-slate-300 bg-slate-200 shadow-sm shrink-0">
                <img 
                  src={avatarUrl} 
                  alt="Citizen Passport" 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-white text-[9px] text-center font-mono py-0.5">
                  PASSPORT
                </div>
              </div>

              <div className="space-y-2 text-center sm:text-left flex-1">
                <label className="block text-xs font-bold text-slate-800">
                  {t.reg_photo_label}
                </label>
                <p className="text-[11px] text-slate-500">
                  Pakia picha ya pasipoti (JPEG/PNG) yenye mandharinyuma safi au chagua sampuli rasmi.
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <label className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{t.reg_photo_upload_btn}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handlePhotoUpload} 
                      className="hidden" 
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setAvatarUrl(samplePhoto1)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    {t.reg_photo_sample_1}
                  </button>
                </div>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="regFullName" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {t.reg_fullname_label} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  id="regFullName"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t.reg_fullname_placeholder}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold text-sm focus:outline-none focus:border-emerald-600 transition-colors"
                />
              </div>
            </div>

            {/* National ID (NIN) */}
            <div>
              <label htmlFor="regNin" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {t.reg_nin_label}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <CreditCard className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  id="regNin"
                  value={nin}
                  onChange={(e) => setNin(e.target.value)}
                  placeholder={t.reg_nin_placeholder}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono text-xs focus:outline-none focus:border-emerald-600 transition-colors"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {t.reg_nin_help}
              </p>
            </div>

            {/* Date of Birth & Gender & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="regDob" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  {t.reg_dob_label} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    type="date"
                    id="regDob"
                    required
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="regGender" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  {t.reg_gender_label} <span className="text-red-500">*</span>
                </label>
                <select
                  id="regGender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'MALE' | 'FEMALE')}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold text-xs focus:outline-none focus:border-emerald-600 cursor-pointer"
                >
                  <option value="MALE">{t.reg_gender_male}</option>
                  <option value="FEMALE">{t.reg_gender_female}</option>
                </select>
              </div>

              <div>
                <label htmlFor="regPhone" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  {t.reg_phone_label} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    id="regPhone"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t.reg_phone_placeholder}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>
                {phone.replace(/\D/g, '').length >= 3 && (
                  <div className="mt-1.5 flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                    <TelecomLogo carrier={detectCarrierFromPhone(phone)} size="sm" variant="icon" />
                    <span className="text-[10px] font-bold text-slate-800">
                      Mtandao: {detectCarrierFromPhone(phone)} ({TELECOM_CARRIERS[detectCarrierFromPhone(phone)].moneyBrand})
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 2: RESIDENCE & CITIZENSHIP */}
          <div className="space-y-4 pt-2">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block border-b border-slate-100 pb-2">
              02. {t.reg_address_title} & Uraia
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="regRegion" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  {t.reg_region_label}
                </label>
                <input
                  type="text"
                  id="regRegion"
                  required
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="e.g. DAR ES SALAAM"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-bold focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label htmlFor="regDistrict" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  {t.reg_district_label}
                </label>
                <input
                  type="text"
                  id="regDistrict"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. ILALA"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-bold focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label htmlFor="regWard" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  {t.reg_ward_label}
                </label>
                <input
                  type="text"
                  id="regWard"
                  required
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  placeholder="e.g. KARIARKOO"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-bold focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label htmlFor="regStreet" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  {t.reg_street_label}
                </label>
                <input
                  type="text"
                  id="regStreet"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="e.g. LUMUMBA ST. 45"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-bold focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label htmlFor="regCitizenship" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {t.reg_citizenship_label}
              </label>
              <select
                id="regCitizenship"
                value={citizenshipType}
                onChange={(e) => setCitizenshipType(e.target.value as any)}
                className="w-full sm:w-80 px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold text-xs focus:outline-none focus:border-emerald-600 cursor-pointer"
              >
                <option value="CITIZEN BY BIRTH">{t.reg_citizen_birth}</option>
                <option value="CITIZEN BY REGISTRATION">{t.reg_citizen_registration}</option>
              </select>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              * NIDA Smart ID PKI v3.2 · Digital Civil Registry
            </span>

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-md shadow-emerald-900/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>{t.reg_submitting}</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{t.reg_submit_btn}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
