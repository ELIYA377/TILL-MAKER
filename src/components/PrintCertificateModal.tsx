import React from 'react';
import { NidaRecord } from '../types';
import { X, Printer, ShieldCheck, CheckCircle2 } from 'lucide-react';
import badgeImage from '../assets/images/nida_metallic_badge_1790171872604.jpg';

interface PrintCertificateModalProps {
  record: NidaRecord;
  onClose: () => void;
}

export const PrintCertificateModal: React.FC<PrintCertificateModalProps> = ({
  record,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Modal Toolbar - Hidden during print */}
        <div className="no-print flex items-center justify-between px-6 py-3.5 bg-neutral-950 border-b border-neutral-800">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>OFFICIAL NIDA CITIZEN VERIFICATION SLIP</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Verification Certificate Slip */}
        <div className="print-area p-8 md:p-10 bg-white text-neutral-900 space-y-6">
          {/* Header */}
          <div className="text-center border-b-2 border-neutral-900 pb-5 space-y-1">
            <div className="w-16 h-16 mx-auto mb-2 overflow-hidden rounded-full border border-neutral-400">
              <img src={badgeImage} alt="NIDA Seal" className="w-full h-full object-cover" />
            </div>
            <h4 className="text-xs font-bold tracking-widest uppercase text-neutral-800">
              JAMHURI YA MUUNGANO WA TANZANIA
            </h4>
            <h2 className="text-lg md:text-xl font-extrabold uppercase tracking-tight text-neutral-900">
              NATIONAL IDENTIFICATION AUTHORITY (NIDA)
            </h2>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
              OFFICIAL CITIZEN VERIFICATION SLIP
            </h3>
            <p className="text-[10px] text-neutral-500 font-mono">
              Printed on {currentDate} · Registry Verification Code: {record.securityChecksum.slice(0, 16)}
            </p>
          </div>

          {/* Verification Status Banner */}
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              <div>
                <span className="font-bold text-emerald-900">RECORD STATUS: VERIFIED & ACTIVE</span>
                <p className="text-[11px] text-emerald-800">Matched with National Identity Central Database</p>
              </div>
            </div>
            <span className="font-mono text-[10px] font-bold text-emerald-800 border border-emerald-400 px-2 py-0.5 rounded">
              ISO-27001 SECURE
            </span>
          </div>

          {/* Citizen Particulars Table */}
          <table className="w-full text-left text-xs border border-neutral-300 divide-y divide-neutral-200">
            <tbody>
              <tr className="divide-x divide-neutral-200">
                <td className="p-2.5 font-bold bg-neutral-100 text-neutral-600 w-1/3">Full Name</td>
                <td className="p-2.5 font-extrabold text-neutral-900 text-sm">{record.fullName}</td>
              </tr>
              <tr className="divide-x divide-neutral-200">
                <td className="p-2.5 font-bold bg-neutral-100 text-neutral-600">National ID (NIN)</td>
                <td className="p-2.5 font-mono font-bold text-neutral-900 text-sm">{record.nin}</td>
              </tr>
              <tr className="divide-x divide-neutral-200">
                <td className="p-2.5 font-bold bg-neutral-100 text-neutral-600">Namba ya Simu (TCRA Link)</td>
                <td className="p-2.5 font-mono font-bold text-neutral-900 text-sm">
                  {record.primaryPhone} ({record.registeredSims?.map(s => s.carrier).join(', ') || 'Airtel'} - Biometric Verified)
                </td>
              </tr>
              <tr className="divide-x divide-neutral-200">
                <td className="p-2.5 font-bold bg-neutral-100 text-neutral-600">Gender</td>
                <td className="p-2.5 font-semibold text-neutral-800">{record.gender}</td>
              </tr>
              <tr className="divide-x divide-neutral-200">
                <td className="p-2.5 font-bold bg-neutral-100 text-neutral-600">Date of Birth</td>
                <td className="p-2.5 font-mono text-neutral-800">{record.dateOfBirth} ({record.age} years)</td>
              </tr>
              <tr className="divide-x divide-neutral-200">
                <td className="p-2.5 font-bold bg-neutral-100 text-neutral-600">Place of Birth</td>
                <td className="p-2.5 text-neutral-800">{record.placeOfBirth.region}, {record.placeOfBirth.district}, {record.placeOfBirth.ward}</td>
              </tr>
              <tr className="divide-x divide-neutral-200">
                <td className="p-2.5 font-bold bg-neutral-100 text-neutral-600">Nationality & Type</td>
                <td className="p-2.5 text-neutral-800">{record.nationality} ({record.citizenshipType})</td>
              </tr>
              <tr className="divide-x divide-neutral-200">
                <td className="p-2.5 font-bold bg-neutral-100 text-neutral-600">Current Residence</td>
                <td className="p-2.5 text-neutral-800">{record.residence.region}, {record.residence.district}, {record.residence.ward}, {record.residence.street}</td>
              </tr>
              <tr className="divide-x divide-neutral-200">
                <td className="p-2.5 font-bold bg-neutral-100 text-neutral-600">Document No. / Expiry</td>
                <td className="p-2.5 font-mono text-neutral-800">{record.documentNumber} (Expires: {record.expiryDate})</td>
              </tr>
            </tbody>
          </table>

          {/* Barcode & Signature area */}
          <div className="pt-4 flex items-end justify-between border-t border-neutral-300 text-xs">
            <div>
              <div className="h-6 flex items-center gap-[2px]">
                {[2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 1, 2, 3, 2, 1, 3, 1, 2, 4, 2, 1, 3, 2, 1, 2].map((w, i) => (
                  <div key={i} className="bg-neutral-900 h-full" style={{ width: `${w}px` }} />
                ))}
              </div>
              <span className="text-[9px] font-mono text-neutral-600 block mt-1">
                {record.nin}
              </span>
            </div>

            <div className="text-right">
              <div className="w-36 border-b border-neutral-900 mb-1" />
              <span className="text-[10px] font-bold text-neutral-700 uppercase block">
                Authorized Verification Registrar
              </span>
              <span className="text-[9px] font-mono text-neutral-500">
                NIDA Automated Gateway
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
