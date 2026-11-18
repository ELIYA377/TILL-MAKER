import React, { useState } from 'react';
import { 
  Key, 
  Copy, 
  Check, 
  RotateCw, 
  Terminal, 
  Code2, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Webhook, 
  Globe, 
  Layers, 
  ExternalLink,
  Clock,
  ShieldCheck,
  Zap,
  HelpCircle
} from 'lucide-react';
import { SystemUser, ApiLogEntry } from '../../types';
import { SystemStore } from '../../services/systemStore';
import { executeSinsoftLookup } from '../../services/apiService';

interface ApiDeveloperPortalProps {
  currentUser: SystemUser;
  onBalanceUpdated?: () => void;
}

export const ApiDeveloperPortal: React.FC<ApiDeveloperPortalProps> = ({
  currentUser,
  onBalanceUpdated,
}) => {
  const [apiKey, setApiKey] = useState(() => SystemStore.getUserApiKey(currentUser.phone));
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Webhook
  const [webhookUrl, setWebhookUrl] = useState(currentUser.webhookUrl || '');
  const [webhookSaved, setWebhookSaved] = useState(false);

  // Interactive Sandbox
  const [testMethod, setTestMethod] = useState<'GET' | 'POST'>('GET');
  const [testQuery, setTestQuery] = useState('19900315-11103-00001-21');
  const [isTesting, setIsTesting] = useState(false);
  const [testResponse, setTestResponse] = useState<any>(null);
  const [testLatency, setTestLatency] = useState<number | null>(null);
  const [testStatusCode, setTestStatusCode] = useState<number | null>(null);

  // Code snippet tab
  const [codeTab, setCodeTab] = useState<'curl' | 'php' | 'python' | 'js'>('php');

  // Logs
  const [apiLogs, setApiLogs] = useState<ApiLogEntry[]>(() => 
    SystemStore.getApiLogs(currentUser.phone)
  );

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRegenerateKey = () => {
    if (!window.confirm('Je, una uhakika unataka kubadilisha API Key yako? Mifumo ya zamani inayotumia key hii itahitaji kuboreshwa.')) {
      return;
    }
    setIsRegenerating(true);
    setTimeout(() => {
      const newKey = SystemStore.regenerateApiKey(currentUser.phone);
      setApiKey(newKey);
      setIsRegenerating(false);
    }, 400);
  };

  const handleSaveWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    SystemStore.saveWebhookUrl(currentUser.phone, webhookUrl);
    setWebhookSaved(true);
    setTimeout(() => setWebhookSaved(false), 2500);
  };

  const handleRunTest = () => {
    setIsTesting(true);
    setTestResponse(null);

    const start = performance.now();
    setTimeout(() => {
      const result = executeSinsoftLookup({
        query: testQuery,
        apiKey: apiKey,
        userPhone: currentUser.phone,
        deductCredit: true,
      });

      const elapsed = Math.round(performance.now() - start + 25);
      setTestLatency(elapsed);
      setTestStatusCode(result.status);
      setTestResponse(result);
      setIsTesting(false);
      setApiLogs(SystemStore.getApiLogs(currentUser.phone));
      onBalanceUpdated?.();
    }, 450);
  };

  const handleCopySnippet = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Code snippets
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://sinsoft.online';

  const curlSnippet = `curl -X ${testMethod} "${baseUrl}/id/lookup.php?nin=${encodeURIComponent(testQuery)}&key=${apiKey}" \\
  -H "Accept: application/json"`;

  const phpSnippet = `<?php
// Sinsoft Online ID Lookup - PHP Integration
$apiKey = "${apiKey}";
$nin = "${testQuery}";
$url = "${baseUrl}/id/lookup.php?nin=" . urlencode($nin) . "&key=" . $apiKey;

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$data = json_decode($response, true);

if ($httpCode === 200 && $data['success']) {
    echo "Full Name: " . $data['data']['full_name'] . "\\n";
    echo "NIN: " . $data['data']['nin'] . "\\n";
    echo "DOB: " . $data['data']['date_of_birth'] . "\\n";
    echo "Status: " . $data['data']['verification_status'] . "\\n";
} else {
    echo "Lookup error: " . ($data['message'] ?? 'Unknown error');
}
?>`;

  const pythonSnippet = `import requests

API_KEY = "${apiKey}"
NIN = "${testQuery}"
ENDPOINT = "${baseUrl}/id/lookup.php"

response = requests.get(
    ENDPOINT,
    params={"nin": NIN, "key": API_KEY},
    headers={"Accept": "application/json"}
)

if response.status_code == 200:
    res_data = response.json()
    if res_data.get("success"):
        citizen = res_data["data"]
        print(f"Name: {citizen['full_name']}")
        print(f"NIN: {citizen['nin']}")
        print(f"Carrier: {citizen['carrier']}")
    else:
        print(f"Error: {res_data.get('message')}")
else:
    print(f"HTTP Error: {response.status_code}")`;

  const jsSnippet = `// Node.js or Browser Fetch
const apiKey = "${apiKey}";
const nin = "${testQuery}";

async function lookupNida() {
  const response = await fetch(\`${baseUrl}/id/lookup.php?nin=\${encodeURIComponent(nin)}&key=\${apiKey}\`, {
    headers: { 'Accept': 'application/json' }
  });
  
  const result = await response.json();
  if (result.success) {
    console.log("Found Citizen:", result.data.full_name);
    console.log("NIN Number:", result.data.nin);
    console.log("Remaining Balance TSh:", result.remaining_balance);
  } else {
    console.error("Lookup failed:", result.message);
  }
}

lookupNida();`;

  return (
    <div className="space-y-6">
      {/* Top Banner: API Status & Key */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-blue-800/40 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                <Code2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    Sinsoft REST API v2.4
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                    PRODUCTION ACTIVE
                  </span>
                </div>
                <p className="text-xs text-blue-200/80 font-medium mt-0.5">
                  Unganisha mfumo wako wa PHP, Python, Node.js au Simu moja kwa moja na Kanzidata ya NIDA Tanzania.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs font-mono">
                <span className="text-slate-400">Gharama: </span>
                <strong className="text-amber-300">TSh 40.00 / call</strong>
              </div>
            </div>
          </div>

          {/* API Key Box */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-blue-400" />
                Live Production API Key
              </span>
              <p className="text-sm font-mono font-bold text-amber-300 tracking-wider select-all break-all">
                {apiKey}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyKey}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedKey ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Imenakiliwa!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Nakili Key</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleRegenerateKey}
                disabled={isRegenerating}
                className="p-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                title="Tengeneza Key Mpya"
              >
                <RotateCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Sandbox (Left) & Code Snippets (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive API Console & Sandbox (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Live API Console & Sandbox
              </h3>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold">
              /id/lookup.php
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Jaribu kutuma ombi la moja kwa moja kwa API ya Sinsoft na uhakiki majibu ya JSON kabla ya kuiunganisha katika tovuti au mfumo wako.
          </p>

          {/* Sandbox Controls */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Method Selector */}
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
                <button
                  type="button"
                  onClick={() => setTestMethod('GET')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold font-mono transition-colors cursor-pointer ${
                    testMethod === 'GET'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  GET
                </button>
                <button
                  type="button"
                  onClick={() => setTestMethod('POST')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold font-mono transition-colors cursor-pointer ${
                    testMethod === 'POST'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  POST
                </button>
              </div>

              {/* Endpoint path input */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={testQuery}
                  onChange={(e) => setTestQuery(e.target.value)}
                  placeholder="Ingiza NIN (20 digits) au namba ya simu (07...)"
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-950 dark:text-white font-mono text-xs font-bold focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* Send Button */}
              <button
                type="button"
                onClick={handleRunTest}
                disabled={isTesting || !testQuery.trim()}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-600/20 cursor-pointer"
              >
                {isTesting ? (
                  <RotateCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 fill-white" />
                )}
                <span>Tuma Ombi</span>
              </button>
            </div>

            {/* Quick Test Values */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Mifano:</span>
              {[
                { label: 'NIN 1', val: '19900315-11103-00001-21' },
                { label: 'NIN 2', val: '19850720-31201-00045-18' },
                { label: 'SIM Vodacom', val: '0754112233' },
                { label: 'SIM Airtel', val: '0685994422' },
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setTestQuery(item.val)}
                  className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-600 dark:text-slate-400 text-[10px] font-mono transition-colors cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Response Inspector */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-950 text-slate-100">
            <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-400">Response:</span>
                {testStatusCode ? (
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    testStatusCode === 200 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {testStatusCode} {testStatusCode === 200 ? 'OK' : 'ERROR'}
                  </span>
                ) : (
                  <span className="text-slate-500">Subiri ombi...</span>
                )}
                {testLatency && (
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {testLatency}ms
                  </span>
                )}
              </div>

              {testResponse && (
                <button
                  type="button"
                  onClick={() => handleCopySnippet(JSON.stringify(testResponse, null, 2), 'response')}
                  className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                >
                  {copiedCode === 'response' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="p-4 max-h-80 overflow-y-auto font-mono text-xs text-emerald-400 leading-relaxed select-text">
              {testResponse ? (
                <pre className="whitespace-pre-wrap font-mono text-[11px]">
                  {JSON.stringify(testResponse, null, 2)}
                </pre>
              ) : (
                <div className="text-slate-500 py-10 text-center font-sans space-y-1">
                  <Terminal className="w-8 h-8 mx-auto opacity-30 text-slate-400 mb-2" />
                  <p className="text-xs">Bonyeza "Tuma Ombi" hapo juu ili kuona majibu ya API kwa wakati halisi.</p>
                  <p className="text-[10px] text-slate-600">Gharama ni TSh 40.00 kutoka kwenye salio lako.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Code Integration Snippets (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Integration Code Snippets
              </h3>
            </div>
          </div>

          {/* Language Selector Tabs */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {(['php', 'python', 'js', 'curl'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setCodeTab(tab)}
                className={`flex-1 py-1.5 text-xs font-bold font-mono rounded-lg transition-colors cursor-pointer uppercase ${
                  codeTab === tab
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab === 'js' ? 'Node.js' : tab}
              </button>
            ))}
          </div>

          {/* Snippet Viewer */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 text-slate-100 border border-slate-800">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-xs font-mono text-slate-400">
              <span>{codeTab === 'php' ? 'lookup.php' : codeTab === 'python' ? 'nida_lookup.py' : codeTab === 'js' ? 'index.js' : 'terminal'}</span>
              <button
                type="button"
                onClick={() => {
                  const code = codeTab === 'php' ? phpSnippet : codeTab === 'python' ? pythonSnippet : codeTab === 'js' ? jsSnippet : curlSnippet;
                  handleCopySnippet(code, codeTab);
                }}
                className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                {copiedCode === codeTab ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 text-[11px] font-mono leading-relaxed overflow-x-auto text-blue-300 max-h-80">
              <code>
                {codeTab === 'php' && phpSnippet}
                {codeTab === 'python' && pythonSnippet}
                {codeTab === 'js' && jsSnippet}
                {codeTab === 'curl' && curlSnippet}
              </code>
            </pre>
          </div>

          {/* Webhook Configuration */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold flex items-center gap-1.5 text-slate-900 dark:text-white">
                <Webhook className="w-4 h-4 text-amber-500" />
                Webhook Callback URL (Hiari)
              </span>
            </div>

            <form onSubmit={handleSaveWebhook} className="flex gap-2">
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://yoursite.com/api/nida-webhook.php"
                className="flex-1 px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-950 dark:text-white font-mono focus:outline-none focus:border-blue-600"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                {webhookSaved ? 'Saved!' : 'Save'}
              </button>
            </form>
            <p className="text-[10px] text-slate-400">
              Mfumo utatuma arifa (POST payload) mara tu maombi ya mikono au feeder yakikamilika.
            </p>
          </div>
        </div>
      </div>

      {/* Endpoints Documentation Reference Table */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-600" />
          <span>Sinsoft API Endpoints Reference</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                <th className="py-3 px-3">Method</th>
                <th className="py-3 px-3">Endpoint Path</th>
                <th className="py-3 px-3">Parameta Kuu</th>
                <th className="py-3 px-3">Gharama</th>
                <th className="py-3 px-3">Maelezo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              <tr>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold text-[10px]">
                    GET
                  </span>
                </td>
                <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                  /id/lookup.php
                </td>
                <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                  nin, phone, key
                </td>
                <td className="py-3 px-3 text-amber-600 dark:text-amber-400 font-bold">
                  TSh 40.00
                </td>
                <td className="py-3 px-3 font-sans text-slate-600 dark:text-slate-300">
                  Uhakiki kamili wa NIDA, picha, alama za vidole, na SIM za TCRA.
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                    POST
                  </span>
                </td>
                <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                  /id/lookup.php
                </td>
                <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                  JSON payload: &#123; nin, key &#124; phone &#125;
                </td>
                <td className="py-3 px-3 text-amber-600 dark:text-amber-400 font-bold">
                  TSh 40.00
                </td>
                <td className="py-3 px-3 font-sans text-slate-600 dark:text-slate-300">
                  Ombi la JSON kupitia HTTP POST.
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold text-[10px]">
                    GET
                  </span>
                </td>
                <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                  /api/balance.php
                </td>
                <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                  key
                </td>
                <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400 font-bold">
                  Bure (TSh 0)
                </td>
                <td className="py-3 px-3 font-sans text-slate-600 dark:text-slate-300">
                  Hukagua kiasi cha salio la pochi (wallet float balance) kilichobaki.
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold text-[10px]">
                    GET
                  </span>
                </td>
                <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                  /api/verify.php
                </td>
                <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                  nin, hash, key
                </td>
                <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400 font-bold">
                  Bure (TSh 0)
                </td>
                <td className="py-3 px-3 font-sans text-slate-600 dark:text-slate-300">
                  Uhakiki wa uhalisi wa cheti/slip cha NIDA kupitia QR code scanner.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Live API Call History Logs */}
      {apiLogs.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span>Recent API Call Logs ({apiLogs.length})</span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-2.5 px-3">Muda</th>
                  <th className="py-2.5 px-3">Query</th>
                  <th className="py-2.5 px-3">Aina</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Latency</th>
                  <th className="py-2.5 px-3">Gharama</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]">
                {apiLogs.slice(0, 10).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2 px-3 text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">
                      {log.query}
                    </td>
                    <td className="py-2 px-3 uppercase text-slate-500">
                      {log.queryType}
                    </td>
                    <td className="py-2 px-3">
                      <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                        log.statusCode === 200 
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                          : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                      }`}>
                        {log.statusCode}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-500">
                      {log.latencyMs}ms
                    </td>
                    <td className="py-2 px-3 text-amber-600 dark:text-amber-400 font-bold">
                      TSh {log.cost.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
