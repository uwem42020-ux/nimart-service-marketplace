import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  Upload, Send, Copy, CheckCircle, AlertTriangle, X,
  ArrowUpRight, ArrowDownLeft, Search, Coins, Info, ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { NimartSpinner } from '../../components/common/NimartSpinner';

export default function ProviderPayment() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ---- Wallet state ----
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [walletLoading, setWalletLoading] = useState(true);

  // ---- Buy coins state ----
  const [amount, setAmount] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<'account' | 'number' | null>(null);

  // ---- Share coins state ----
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<any>(null);
  const [shareAmount, setShareAmount] = useState('');
  const [shareLoading, setShareLoading] = useState(false);

  // ---- Password verification state ----
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // ---- Coin explanation expand ----
  const [coinInfoExpanded, setCoinInfoExpanded] = useState(false);

  const bankDetails = {
    bank: 'Opay',
    accountName: 'Edidiong Godwin Edem',
    accountNumber: '8038887589',
  };

  // Exchange rate: ₦100 = 1 Nicoin
  const nairaPerNicoin = 100;

  // ---- Wallet data fetch ----
  useEffect(() => {
    if (!user) return;
    fetchWalletData();
  }, [user]);

  async function fetchWalletData() {
    setWalletLoading(true);
    try {
      const [providerRes, txnsRes] = await Promise.all([
        supabase.from('providers').select('coin_balance').eq('id', user!.id).single(),
        supabase
          .from('coin_transactions')
          .select('*')
          .eq('provider_id', user!.id)
          .order('created_at', { ascending: false })
          .limit(50),
      ]);
      if (providerRes.data) setBalance(providerRes.data.coin_balance || 0);
      setTransactions(txnsRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setWalletLoading(false);
    }
  }

  // ---- Password verification ----
  const verifyPassword = async () => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: user!.email!,
        password,
      });
      if (error) {
        setPasswordError('Incorrect password');
        return false;
      }
      setPasswordError('');
      return true;
    } catch {
      setPasswordError('Verification failed');
      return false;
    }
  };

  const initiateSendCoins = () => {
    if (!selectedRecipient || !shareAmount) return;
    setPassword('');
    setPasswordError('');
    setShowPasswordModal(true);
  };

  const handleSendAfterPassword = async () => {
    const verified = await verifyPassword();
    if (!verified) return;
    setShowPasswordModal(false);
    await executeSendCoins();
  };

  const executeSendCoins = async () => {
    setShareLoading(true);
    try {
      const amount = parseInt(shareAmount);
      // Deduct from sender
      await supabase.rpc('adjust_coin_balance', { p_provider_id: user!.id, p_amount: -amount });
      // Add to recipient
      await supabase.rpc('adjust_coin_balance', {
        p_provider_id: selectedRecipient.id,
        p_amount: amount,
      });
      // Log transactions
      await supabase.from('coin_transactions').insert([
        { provider_id: user!.id, amount: -amount, type: 'transfer_out', reference_id: selectedRecipient.id },
        { provider_id: selectedRecipient.id, amount: amount, type: 'transfer_in', reference_id: user!.id },
      ]);
      toast.success(`${amount} Nicoin sent to ${selectedRecipient.full_name}`);
      setShareAmount('');
      setSelectedRecipient(null);
      setSearchResults([]);
      setSearchTerm('');
      fetchWalletData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setShareLoading(false);
    }
  };

  // ---- Buy coins functions ----
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

  const handleBuySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error('You must be logged in');
    if (!proofFile) return toast.error('Please upload proof of payment');
    if (!amount || parseInt(amount) < 100) return toast.error('Amount must be at least ₦100');

    setUploading(true);
    try {
      const fileExt = proofFile.name.split('.').pop();
      const fileName = `${user.id}/payment-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, proofFile);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);

      const { error } = await supabase.from('payment_submissions').insert({
        provider_id: user.id,
        amount_naira: parseInt(amount),
        proof_url: urlData.publicUrl,
        status: 'pending',
      });
      if (error) throw error;

      toast.success('Payment proof submitted! We will review within 24 hours.');
      setAmount('');
      setProofFile(null);
      setPreviewUrl(null);
    } catch (error: any) {
      toast.error(error.message || 'Submission failed');
    } finally {
      setUploading(false);
    }
  };

  // ---- Search for providers to share coins ----
  const handleSearchProvider = async () => {
    if (!searchTerm.trim()) return;
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      .limit(10);
    if (!profiles) return;
    const profileIds = profiles.map((p: any) => p.id);
    const { data: providers } = await supabase
      .from('providers')
      .select('id')
      .in('id', profileIds);
    const providerIds = new Set(providers?.map((p: any) => p.id));
    const filtered = profiles.filter((p: any) => p.id !== user!.id && providerIds.has(p.id));
    setSearchResults(filtered);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Nicoin Wallet</h1>

      {/* Coin Explanation (expandable) */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <button
          onClick={() => setCoinInfoExpanded(!coinInfoExpanded)}
          className="w-full flex items-center justify-between p-4 text-left"
        >
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary-600" />
            <span className="font-semibold text-gray-900">How Nicoin works</span>
          </div>
          <ChevronDown
            className={`h-5 w-5 text-gray-500 transition-transform ${
              coinInfoExpanded ? 'rotate-180' : ''
            }`}
          />
        </button>
        {coinInfoExpanded && (
          <div className="px-4 pb-4 text-sm text-gray-700 space-y-2">
            <p>
              <strong>Nicoin</strong> is Nimart’s virtual currency. You use it to
              boost your profile, get top placement, and unlock extra features.
            </p>
            <p>
              <strong>Exchange rate:</strong> <span className="text-primary-600 font-semibold">₦100 = 1 Nicoin</span>
            </p>
            <p className="font-medium">Quick conversion:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>₦1,000 → 10 Nicoin</li>
              <li>₦2,500 → 25 Nicoin</li>
              <li>₦5,000 → 50 Nicoin</li>
              <li>₦10,000 → 100 Nicoin</li>
            </ul>
            <p>
              Buy Nicoin by transferring to the bank account below and uploading
              proof. Once approved, coins are added to your balance. You can also
              send Nicoin to other providers.
            </p>
          </div>
        )}
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl shadow-lg p-6 sm:p-8 text-white">
        <p className="text-sm font-medium opacity-90 mb-1">Current Balance</p>
        <p className="text-4xl font-bold">
          <img src="/coin.svg" alt="Nicoin" className="h-6 w-6 inline-block mr-1" />
          {balance.toLocaleString()}
          <span className="text-lg ml-1">Nicoin</span>
        </p>
      </div>

      {/* Buy Nicoin Section */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Buy Nicoin</h2>
        <p className="text-gray-600 text-sm mb-6">
          Transfer the exact amount to the bank account below and upload your payment proof.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Bank Details */}
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <p className="text-xs text-gray-500">Bank</p>
                <p className="font-medium">{bankDetails.bank}</p>
              </div>
              <button
                onClick={() => handleCopy(bankDetails.bank, 'account')}
                className="text-primary-600 text-sm flex items-center gap-1"
              >
                {copied === 'account' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{' '}
                Copy
              </button>
            </div>
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <p className="text-xs text-gray-500">Account Name</p>
                <p className="font-medium">{bankDetails.accountName}</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500">Account Number</p>
                <p className="font-mono text-xl font-bold">{bankDetails.accountNumber}</p>
              </div>
              <button
                onClick={() => handleCopy(bankDetails.accountNumber, 'number')}
                className="bg-primary-50 text-primary-700 px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 hover:bg-primary-100"
              >
                {copied === 'number' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{' '}
                Copy
              </button>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>
                Fake receipts lead to <strong>permanent ban</strong>. Only genuine screenshots are accepted.
              </span>
            </div>
          </div>

          {/* Upload Form */}
          <form onSubmit={handleBuySubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (₦)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min={100}
                step={100}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., 1000"
              />
              {amount && parseInt(amount) >= 100 && (
                <p className="text-sm text-primary-600 mt-1">
                  You'll receive <strong>{Math.floor(parseInt(amount) / nairaPerNicoin)} Nicoins</strong>
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {[1000, 2500, 5000, 10000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(amt.toString())}
                  className="px-3 py-1.5 bg-gray-100 rounded-full text-sm hover:bg-gray-200"
                >
                  ₦{amt.toLocaleString()}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proof of Transfer
              </label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-primary-400"
                onClick={() => document.getElementById('proof-input')?.click()}
              >
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-600 mt-1">Upload screenshot</p>
                <input
                  id="proof-input"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleFileChange}
                />
              </div>
              {previewUrl && (
                <div className="mt-3 relative">
                  <img src={previewUrl} alt="Preview" className="w-full h-32 object-cover rounded-lg border" />
                  <button
                    type="button"
                    onClick={() => {
                      setProofFile(null);
                      setPreviewUrl(null);
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={uploading || !proofFile || !amount}
              className="w-full bg-primary-600 text-white py-3 rounded-xl font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {uploading ? (
                'Submitting...'
              ) : (
                <>
                  <Send className="h-5 w-5" /> Submit Payment Proof
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Send Coins Section */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Send className="h-5 w-5" /> Send Coins to Another Provider
        </h2>
        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search provider by name or email..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
              onKeyDown={(e) => e.key === 'Enter' && handleSearchProvider()}
            />
          </div>
          <button
            onClick={handleSearchProvider}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 text-sm"
          >
            Search
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="border rounded-lg mb-3 max-h-40 overflow-y-auto">
            {searchResults.map((p: any) => (
              <button
                key={p.id}
                onClick={() => setSelectedRecipient(p)}
                className={`w-full text-left p-3 hover:bg-gray-50 border-b last:border-0 ${
                  selectedRecipient?.id === p.id ? 'bg-primary-50' : ''
                }`}
              >
                <p className="font-medium text-sm">{p.full_name}</p>
                <p className="text-xs text-gray-500">{p.email}</p>
              </button>
            ))}
          </div>
        )}

        {selectedRecipient && (
          <div className="flex items-center gap-3 mt-2">
            <p className="text-sm font-medium">To: {selectedRecipient.full_name}</p>
            <input
              type="number"
              value={shareAmount}
              onChange={(e) => setShareAmount(e.target.value)}
              placeholder="Amount"
              className="w-24 px-3 py-2 border rounded-lg text-sm"
              min={1}
            />
            <button
              onClick={initiateSendCoins}
              disabled={shareLoading || !shareAmount}
              className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 disabled:opacity-50 text-sm"
            >
              {shareLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        )}
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Transaction History</h2>
        {walletLoading ? (
          <div className="flex justify-center py-8">
            <NimartSpinner size="md" />
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No transactions yet.</p>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx: any) => (
              <div key={tx.id} className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${tx.amount > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                    {tx.amount > 0 ? (
                      <ArrowDownLeft className="h-5 w-5 text-green-600" />
                    ) : (
                      <ArrowUpRight className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm capitalize">{tx.type.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(tx.created_at), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
                <p className={`font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.amount > 0 ? '+' : ''}
                  {tx.amount} Nicoin
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Password Verification Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold mb-2">Verify Your Identity</h3>
            <p className="text-sm text-gray-600 mb-4">
              For security, please enter your account password to send Nicoin.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError('');
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter your password"
                />
                {passwordError && (
                  <p className="text-xs text-red-600 mt-1">{passwordError}</p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendAfterPassword}
                  disabled={shareLoading}
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  Verify & Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}