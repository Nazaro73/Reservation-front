import { useState } from 'react';
import { organizationApi } from '../api';
import { errorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import { Button } from './ui';

export default function ApiKeyBox({ apiKey, onRegenerated, allowRegenerate = false }) {
  const toast = useToast();
  const [key, setKey] = useState(apiKey);
  const [busy, setBusy] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(key);
      toast.success('Clé copiée');
    } catch {
      toast.error('Copie impossible');
    }
  };

  const regenerate = async () => {
    if (!window.confirm('Régénérer la clé ? Les sites utilisant l’ancienne clé cesseront de fonctionner.')) return;
    setBusy(true);
    try {
      const data = await organizationApi.regenerateApiKey();
      setKey(data.publicApiKey);
      onRegenerated?.(data.publicApiKey);
      toast.success('Clé régénérée');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex items-stretch gap-2">
        <code className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 break-all">
          {key || '—'}
        </code>
        <Button variant="secondary" size="sm" onClick={copy}>
          Copier
        </Button>
      </div>
      {allowRegenerate && (
        <div className="mt-2">
          <Button variant="ghost" size="sm" onClick={regenerate} disabled={busy} className="text-rose-600">
            {busy ? 'Régénération…' : 'Régénérer la clé'}
          </Button>
        </div>
      )}
    </div>
  );
}
