import React, { useState } from 'react';
import { 
  Layers, 
  Play, 
  Download, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  FileSpreadsheet, 
  Copy, 
  Check, 
  Trash2, 
  Sparkles,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { SystemUser, BulkLookupItem, NidaRecord } from '../../types';
import { SystemStore, REQUEST_COST_TSH } from '../../services/systemStore';
import { executeSinsoftLookup } from '../../services/apiService';

interface BulkLookupPortalProps {
  currentUser: SystemUser;
  onOpenCertificateModal: (nin: string) => void;
  onBalanceUpdated?: () => void;
}

export const BulkLookupPortal: React.FC<BulkLookupPortalProps> = ({
  currentUser,
  onOpenCertificateModal,
  onBalanceUpdated,
}) => {
  const [inputText, setInputText] = useState(
    `19900315-11103-00001-21\n0754112233\n19850720-31201-00045-18\n0685994422\n19951110-41203-00089-25`
  );
  const [items, setItems] = useState<BulkLookupItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Compute lines
  const parsedLines = inputText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const totalCost = parsedLines.length * REQUEST_COST_TSH;
  const user = SystemStore.getUser(currentUser.phone) || currentUser;

  const handleStartBulk = async () => {
    setFeedback(null);
    if (parsedLines.length === 0) {
      setFeedback({ type: 'error', message: 'Tafadhali ingiza angalau NIN au namba ya simu moja.' });
      return;
    }

    if (parsedLines.length > 50) {
      setFeedback({ type: 'error', message: 'Kiwango cha juu cha batch ni vitambulisho 50 kwa wakati mmoja.' });
      return;
    }

    if (user.credit < totalCost) {
      setFeedback({
        type: 'error',
        message: `Salio halitoshi! Batch hii inahitaji TSh ${totalCost.toFixed(2)}, lakini una TSh ${user.credit.toFixed(2)}. Tafadhali weka salio.`,
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    const initialItems: BulkLookupItem[] = parsedLines.map((q) => ({
      query: q,
      status: 'pending',
    }));
    setItems(initialItems);

    for (let i = 0; i < parsedLines.length; i++) {
      const q = parsedLines[i];
      // mark processing
      setItems((prev) =>
        prev.map((item, idx) => (idx === i ? { ...item, status: 'processing' } : item))
      );

      // simulate network request latency
      await new Promise((resolve) => setTimeout(resolve, 280));

      const res = executeSinsoftLookup({
        query: q,
        userPhone: user.phone,
        deductCredit: true,
      });

      if (res.success && res.data) {
        // rebuild record
        const rec: NidaRecord = {
          id: `bulk-${i}`,
          nin: res.data.nin,
          fullName: res.data.full_name,
          firstName: res.data.first_name,
          middleName: res.data.middle_name,
          lastName: res.data.last_name,
          gender: res.data.gender,
          dateOfBirth: res.data.date_of_birth,
          age: res.data.age,
          primaryPhone: res.data.phone,
          registeredSims: res.data.registered_sims.map((s) => ({
            msisdn: s.msisdn,
            carrier: s.carrier as any,
            biometricStatus: s.biometric_status as any,
            registrationDate: s.registration_date,
            simSerial: '892550109923847192',
            isPrimary: true,
          })),
          placeOfBirth: res.data.place_of_birth,
          nationality: res.data.nationality,
          citizenshipType: res.data.citizenship_type as any,
          verificationStatus: res.data.verification_status as any,
          issueDate: res.data.issue_date,
          expiryDate: res.data.expiry_date,
          documentNumber: res.data.document_number,
          fingerprintEnrolled: res.data.biometrics.fingerprint_enrolled,
          facialRecognitionMatched: res.data.biometrics.facial_matched,
          securityChecksum: res.data.security_checksum,
          residence: res.data.residence,
          avatarUrl: res.data.photo_url,
        };

        setItems((prev) =>
          prev.map((item, idx) =>
            idx === i ? { ...item, status: 'success', record: rec } : item
          )
        );
      } else {
        setItems((prev) =>
          prev.map((item, idx) =>
            idx === i ? { ...item, status: 'failed', error: res.message } : item
          )
        );
      }

      setProgress(Math.round(((i + 1) / parsedLines.length) * 100));
    }

    setIsProcessing(false);
    onBalanceUpdated?.();
    setFeedback({
      type: 'success',
      message: `Uhakiki wa batch umekamilika! Vitambulisho ${parsedLines.length} vimehakikiwa.`,
    });
  };

  const handleExportCSV = () => {
    if (items.length === 0) return;
    const headers = [
      'Query',
      'Status',
      'NIN',
      'Full Name',
      'Gender',
      'Date of Birth',
      'Phone',
      'Region',
      'District',
      'Verification Status',
    ];

    const rows = items.map((item) => {
      const rec = item.record;
      return [
        `"${item.query}"`,
        `"${item.status}"`,
        `"${rec?.nin || ''}"`,
        `"${rec?.fullName || ''}"`,
        `"${rec?.gender || ''}"`,
        `"${rec?.dateOfBirth || ''}"`,
        `"${rec?.primaryPhone || ''}"`,
        `"${rec?.placeOfBirth?.region || ''}"`,
        `"${rec?.placeOfBirth?.district || ''}"`,
        `"${rec?.verificationStatus || ''}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sinsoft_nida_batch_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Batch & Bulk NIDA Lookup
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hakiki vitambulisho au namba za simu nyingi kwa mkupuo mmoja (hadi 50 kwa batch moja).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <span className="text-slate-500 dark:text-slate-400">Jumla ya Gharama: </span>
              <strong className="text-blue-600 dark:text-blue-400 font-mono font-bold">
                TSh {totalCost.toFixed(2)}
              </strong>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Bandika Orodha ya NIN au Namba za Simu (Mstari mmoja kwa kila rekodi)
          </label>
          <textarea
            rows={5}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isProcessing}
            placeholder="19900315-11103-00001-21&#10;0754112233&#10;19850720-31201-00045-18"
            className="w-full p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-950 dark:text-white font-mono text-xs font-bold focus:outline-none focus:border-blue-600 leading-relaxed"
          />
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Idadi ya rekodi: <strong className="text-slate-900 dark:text-white">{parsedLines.length}</strong></span>
            <span>Salio lako: <strong className="text-blue-600 dark:text-blue-400">TSh {(user?.credit ?? 0).toFixed(2)}</strong></span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleStartBulk}
            disabled={isProcessing || parsedLines.length === 0}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-blue-500/20 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Inachakata ({progress}%)...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Anza Uhakiki wa Pamoja ({parsedLines.length})</span>
              </>
            )}
          </button>

          {items.length > 0 && (
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Pakua Excel / CSV ({items.filter((i) => i.status === 'success').length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setInputText('');
              setItems([]);
              setFeedback(null);
            }}
            disabled={isProcessing}
            className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Futa Orodha</span>
          </button>
        </div>

        {/* Progress Bar */}
        {isProcessing && (
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs font-mono text-slate-500">
              <span>Maendeleo ya Uhakiki</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Feedback Banner */}
        {feedback && (
          <div
            className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}
      </div>

      {/* Results Table */}
      {items.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>Matokeo ya Uhakiki ({items.length})</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-bold">
                {items.filter((i) => i.status === 'success').length} Zimepatikana
              </span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Query</th>
                  <th className="py-3 px-4">Picha & Jina Kamili</th>
                  <th className="py-3 px-4">Namba ya NIDA</th>
                  <th className="py-3 px-4">Simu / Mtandao</th>
                  <th className="py-3 px-4">Hali ya NIDA</th>
                  <th className="py-3 px-4 text-right">Kitendo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {items.map((item, idx) => {
                  const rec = item.record;
                  return (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {item.query}
                      </td>
                      <td className="py-3 px-4">
                        {item.status === 'processing' ? (
                          <span className="text-blue-500 font-bold flex items-center gap-1.5">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Inatafuta...
                          </span>
                        ) : rec ? (
                          <div className="flex items-center gap-2.5">
                            <img
                              src={rec.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                            />
                            <div>
                              <p className="font-extrabold text-slate-900 dark:text-white">
                                {rec.fullName}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {rec.gender} · {rec.dateOfBirth}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-red-500 font-medium">Haikupatikana</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {rec?.nin || '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {rec ? `${rec.primaryPhone} (${rec.registeredSims[0]?.carrier || 'Vodacom'})` : '-'}
                      </td>
                      <td className="py-3 px-4">
                        {rec ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
                            <CheckCircle2 className="w-3 h-3" />
                            {rec.verificationStatus}
                          </span>
                        ) : item.status === 'failed' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300">
                            <AlertCircle className="w-3 h-3" />
                            Haikupatikana
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Inasubiri</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {rec && (
                          <button
                            type="button"
                            onClick={() => onOpenCertificateModal(rec.nin)}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Slip</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
