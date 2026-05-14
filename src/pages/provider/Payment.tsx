import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Upload, Send, Copy, CheckCircle, AlertTriangle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function ProviderPayment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<'account' | 'number' | null>(null);

  // Nicoin conversion: 1 Nicoin = ₦100
  const nicoinValue = amount ? Math.floor(parseInt(amount) / 100) : 0;

  const bankDetails = {
    bank: 'Opay',
    accountName: 'Edidiong Godwin Edem',
    accountNumber: '8038887589',
  };

  const handleCopy = (text: string, type: 'account' | 'number') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setProofFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error('You must be logged in');
    if (!proofFile) return toast.error('Please upload proof of payment');
    if (!amount || parseInt(amount) < 100) return toast.error('Amount must be at least ₦100');

    setUploading(true);
    try {
      // Upload proof image to avatars bucket (or create a 'payments' bucket)
      const fileExt = proofFile.name.split('.').pop();
      const fileName = `${user.id}/payment-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars') // reuse existing bucket
        .upload(fileName, proofFile);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);

      // Insert payment submission
      const { error } = await supabase.from('payment_submissions').insert({
        provider_id: user.id,
        amount_naira: parseInt(amount),
        proof_url: urlData.publicUrl,
        status: 'pending',
      });
      if (error) throw error;

      toast.success('Payment proof submitted! We will review within 24 hours.');
      navigate('/provider/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Submission failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Buy Nicoin</h1>
          <p className="text-gray-600 mt-2">Get featured, boost your business, and attract more clients</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Bank Details Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
              <h2 className="text-white font-semibold text-lg">Bank Transfer Details</h2>
              <p className="text-primary-100 text-sm">Send exact amount to this account</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <p className="text-xs text-gray-500">Bank</p>
                  <p className="font-medium text-gray-900">{bankDetails.bank}</p>
                </div>
                <button
                  onClick={() => handleCopy(bankDetails.bank, 'account')}
                  className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1"
                >
                  {copied === 'account' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  Copy
                </button>
              </div>
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <p className="text-xs text-gray-500">Account Name</p>
                  <p className="font-medium text-gray-900">{bankDetails.accountName}</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500">Account Number</p>
                  <p className="font-mono text-xl font-bold text-gray-900">{bankDetails.accountNumber}</p>
                </div>
                <button
                  onClick={() => handleCopy(bankDetails.accountNumber, 'number')}
                  className="bg-primary-50 text-primary-700 px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 hover:bg-primary-100 transition"
                >
                  {copied === 'number' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  Copy
                </button>
              </div>
            </div>
            <div className="bg-amber-50 border-t border-amber-100 p-4">
              <p className="text-xs text-amber-800 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>Fake or altered payment receipts will lead to <strong>permanent account ban</strong>. Please upload a genuine screenshot from your banking app.</span>
              </p>
            </div>
          </div>

          {/* Payment Form Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-900">Submit Payment Proof</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Amount input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₦)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min={100}
                  step={100}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                  placeholder="e.g., 1000, 2500, 5000"
                />
                {amount && parseInt(amount) >= 100 && (
                  <p className="text-sm text-primary-600 mt-1">You'll receive <strong>{nicoinValue} Nicoins</strong> (₦100 = 1 Nicoin)</p>
                )}
              </div>

              {/* Quick amount suggestions */}
              <div>
                <p className="text-xs text-gray-500 mb-2">Quick suggestions</p>
                <div className="flex flex-wrap gap-2">
                  {[1000, 2500, 5000, 10000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAmount(amt.toString())}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition"
                    >
                      ₦{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* File upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Proof of Transfer (screenshot)</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-primary-400 transition cursor-pointer" onClick={() => document.getElementById('file-input')?.click()}>
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-10 w-10 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="file-input" className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500">
                        <span>Upload a file</span>
                        <input id="file-input" name="file" type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                  </div>
                </div>
                {previewUrl && (
                  <div className="mt-3 relative">
                    <img src={previewUrl} alt="Preview" className="w-full h-32 object-cover rounded-lg border" />
                    <button
                      type="button"
                      onClick={() => {
                        setProofFile(null);
                        if (previewUrl) URL.revokeObjectURL(previewUrl);
                        setPreviewUrl(null);
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Warning note */}
              <div className="bg-red-50 rounded-xl p-3 flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-700">Fake or edited receipts will result in immediate account ban and forfeiture of funds.</p>
              </div>

              <button
                type="submit"
                disabled={uploading || !proofFile || !amount}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-xl font-medium hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-md"
              >
                {uploading ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Submit Payment Proof
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Extra info */}
        <div className="text-center text-xs text-gray-400 mt-8">
          Your submission will be reviewed within 24 hours. Once confirmed, Nicoins will be added to your account.
        </div>
      </div>
    </div>
  );
}