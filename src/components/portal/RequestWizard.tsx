import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, FileText, Upload, AlertTriangle } from 'lucide-react';
import { ServiceItem, UserAccount } from '../../types/app';
import { apiRequest } from '../../lib/api';
import { usePortalCopy } from '../../lib/i18n';

interface RequestWizardProps {
  service: ServiceItem;
  user: UserAccount;
  onCancel: () => void;
  onBuyCredits: () => void;
  onSubmitted: (newBalance: number, requestCode: string) => void;
}

export const RequestWizard: React.FC<RequestWizardProps> = ({
  service,
  user,
  onCancel,
  onBuyCredits,
  onSubmitted,
}) => {
  const { copy } = usePortalCopy();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, File>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const hasEnoughCredits = user.credit_balance >= service.credit_cost;

  const handleFieldChange = (name: string, value: string) => {
    setFields((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (name: string, file: File | undefined) => {
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!['pdf', 'jpg', 'jpeg', 'png'].includes(ext)) {
      setError('Only PDF, JPG, JPEG, and PNG files are supported.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Maximum file size is 10 MB per document.');
      return;
    }
    setError('');
    setFiles((prev) => ({ ...prev, [name]: file }));
  };

  const validateStep2 = (): boolean => {
    setError('');
    for (const req of service.requirements) {
      if (req.is_required) {
        if (req.field_type === 'file') {
          if (!files[req.field_name]) {
            setError(`Please upload required document: ${req.field_label}`);
            return false;
          }
        } else if (!String(fields[req.field_name] || '').trim()) {
          setError(`Please complete required field: ${req.field_label}`);
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!hasEnoughCredits) {
      setError(`Insufficient credits. You need ${service.credit_cost} credits to submit this request.`);
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('serviceId', String(service.id));
      formData.append('fields', JSON.stringify(fields));
      for (const [fieldName, file] of Object.entries(files)) {
        formData.append(fieldName, file);
      }

      const res = await apiRequest<{
        success: boolean;
        requestCode: string;
        creditBalance: number;
      }>('/api/requests', {
        method: 'POST',
        body: formData,
      });

      onSubmitted(res.creditBalance, res.requestCode);
    } catch (err: any) {
      setError(err.message || 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  const textReqs = service.requirements.filter((r) => r.field_type !== 'file');
  const fileReqs = service.requirements.filter((r) => r.field_type === 'file');

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-[#0B162C] text-white px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{copy.backToServices}</span>
          </button>
          <h2 className="text-xl font-bold text-white">{service.name}</h2>
          <p className="text-xs text-slate-300 mt-0.5">
            {service.category} · <span className="font-mono font-semibold text-[#D4AF37] tabular-nums">{service.credit_cost} Credits</span>
          </p>
        </div>

        {/* Stepper Indicator */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {[
            { num: 1, label: copy.stepReq },
            { num: 2, label: copy.stepDetails },
            { num: 3, label: copy.stepReview },
          ].map((item) => (
            <div
              key={item.num}
              className={`px-3 py-1.5 rounded-md font-semibold whitespace-nowrap ${
                step === item.num
                  ? 'bg-[#D4AF37] text-[#0B162C]'
                  : step > item.num
                  ? 'bg-emerald-900/60 text-emerald-200 border border-emerald-700'
                  : 'bg-[#132547] text-slate-400'
              }`}
            >
              {item.num}. {item.label}
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {!hasEnoughCredits && (
          <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5 text-amber-900">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold">{copy.insufficientCreditsTitle}</p>
                <p className="text-xs text-amber-800 mt-0.5">
                  <span className="font-mono font-bold">{service.credit_cost}</span> Credits · {copy.currentBalanceLabel}:{' '}
                  <span className="font-mono font-bold">{user.credit_balance}</span> Credits.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onBuyCredits}
              className="px-4 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#E5C158] text-[#0B162C] text-xs font-bold whitespace-nowrap cursor-pointer"
            >
              {copy.buyCreditsNow}
            </button>
          </div>
        )}

        {error && (
          <div className="mb-5 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm font-medium">
            {error}
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-2">{copy.step1Title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{service.description}</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">{copy.reqInfoAndDocs}</p>
              <p className="text-sm text-slate-700 mb-4">{service.requirements_summary}</p>
              <ul className="space-y-2">
                {service.requirements.map((r, idx) => (
                  <li key={idx} className="flex items-center justify-between text-sm py-1.5 border-b border-slate-200/70 last:border-0">
                    <span className="text-slate-800 font-medium">{r.field_label}</span>
                    <span className="text-xs text-slate-500 font-mono">
                      {r.field_type === 'file' ? 'PDF/JPG/PNG' : 'Input'} · {r.is_required ? '*' : 'Opt'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
              {copy.officialNoticeWizard}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                {copy.cancelBtn}
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-lg bg-[#0B162C] hover:bg-[#132547] text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
              >
                <span>{copy.continueToFields}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">{copy.step2Title}</h3>
              <p className="text-xs text-slate-500 mt-1">{copy.supportedFormatsNote}</p>
            </div>

            {textReqs.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {textReqs.map((req) => (
                  <div key={req.field_name} className={req.field_type === 'textarea' ? 'md:col-span-2' : ''}>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {req.field_label} {req.is_required ? <span className="text-red-600">*</span> : null}
                    </label>
                    {req.field_type === 'textarea' ? (
                      <textarea
                        rows={3}
                        value={fields[req.field_name] || ''}
                        onChange={(e) => handleFieldChange(req.field_name, e.target.value)}
                        placeholder={req.placeholder || ''}
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B162C]"
                      />
                    ) : (
                      <input
                        type={req.field_type === 'phone' ? 'tel' : req.field_type === 'number' ? 'number' : 'text'}
                        value={fields[req.field_name] || ''}
                        onChange={(e) => handleFieldChange(req.field_name, e.target.value)}
                        placeholder={req.placeholder || ''}
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B162C]"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {fileReqs.length > 0 && (
              <div className="space-y-4 pt-2 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">{copy.reqUploadsTitle}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fileReqs.map((req) => {
                    const selected = files[req.field_name];
                    return (
                      <div key={req.field_name} className="p-4 rounded-lg border border-slate-200 bg-slate-50">
                        <label className="block text-xs font-semibold text-slate-800 mb-2">
                          {req.field_label} {req.is_required ? <span className="text-red-600">*</span> : null}
                        </label>
                        <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-dashed border-slate-400 bg-white hover:border-[#0B162C] text-xs font-medium text-slate-700 cursor-pointer transition-colors">
                          <Upload className="w-4 h-4 text-[#0B162C] shrink-0" />
                          <span className="truncate">
                            {selected ? selected.name : copy.chooseFileLabel}
                          </span>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                            onChange={(e) => handleFileChange(req.field_name, e.target.files?.[0])}
                            className="hidden"
                          />
                        </label>
                        {selected && (
                          <p className="text-[11px] text-emerald-700 font-medium mt-1.5 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{(selected.size / 1024).toFixed(1)} KB</span>
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                {copy.backBtn}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (validateStep2()) setStep(3);
                }}
                className="px-5 py-2.5 rounded-lg bg-[#0B162C] hover:bg-[#132547] text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
              >
                <span>{copy.reviewInfoBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">{copy.step3Title}</h3>
              <p className="text-xs text-slate-500 mt-1">{copy.step3Desc}</p>
            </div>

            <div className="p-5 rounded-lg border border-slate-200 bg-slate-50 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <p className="text-xs text-slate-500">{copy.selectedService}</p>
                  <p className="text-sm font-bold text-slate-900">{service.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">{copy.creditFee}</p>
                  <p className="text-sm font-mono font-bold text-[#0B162C] tabular-nums">{service.credit_cost} Credits</p>
                </div>
              </div>

              {textReqs.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {textReqs.map((r) => (
                    <div key={r.field_name}>
                      <p className="text-[11px] font-semibold text-slate-500">{r.field_label}</p>
                      <p className="text-sm text-slate-900 font-medium break-words">
                        {fields[r.field_name] || '—'}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {fileReqs.length > 0 && (
                <div className="pt-3 border-t border-slate-200">
                  <p className="text-[11px] font-semibold text-slate-500 mb-2">{copy.attachedDocs}</p>
                  <div className="space-y-1.5">
                    {fileReqs.map((r) => {
                      const f = files[r.field_name];
                      return (
                        <div key={r.field_name} className="flex items-center justify-between text-xs bg-white px-3 py-2 rounded border border-slate-200">
                          <span className="flex items-center gap-2 font-medium text-slate-700">
                            <FileText className="w-3.5 h-3.5 text-[#0B162C]" />
                            {r.field_label}
                          </span>
                          <span className="font-mono text-slate-600">{f ? f.name : '—'}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                {copy.editDetails}
              </button>
              <button
                type="button"
                disabled={submitting || !hasEnoughCredits}
                onClick={handleSubmit}
                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#D4AF37] hover:bg-[#E5C158] text-[#0B162C] text-xs font-bold tracking-wide uppercase inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <span>{submitting ? copy.submittingRequest : copy.submitRequestBtn}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
