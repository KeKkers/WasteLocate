import React, { useState } from 'react';
import { Home, CreditCard, Shield, Mail, Phone } from 'lucide-react';

export default function PricingView({ onBack, user, userProfile, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const handlePurchase = async (priceId, productType) => {
    if (!user) {
      alert('Please log in to purchase');
      return;
    }

    console.log('User object:', user);
    console.log('User email:', user.email);

    if (!user.email) {
      alert('No email found for user. Please log out and log in again.');
      return;
    }

    setLoading(true);

    try {
      const requestData = { priceId, userId: user.id, email: user.email, productType };

      console.log('Sending checkout request with data:', requestData);

      const response = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Function error:', errorText);
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();

      if (!url) throw new Error('No checkout URL received');

      console.log('Redirecting to Stripe checkout:', url);
      window.location.href = url;
    } catch (err) {
      console.error('Purchase error:', err);
      alert('Failed to initiate purchase. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800">
          <Home className="w-5 h-5" />
          Back
        </button>

        <h1 className="text-4xl font-bold text-gray-800 text-center mb-4">Choose Your Plan</h1>
        <p className="text-gray-600 text-center mb-12">Find permitted waste facilities across the UK</p>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Free Plan */}
          <div className="bg-white rounded-lg shadow-xl p-8 border-2 border-gray-200">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Free Trial</h3>
            <p className="text-4xl font-bold text-gray-900 mb-4">£0</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-gray-600"><span className="text-green-600">✓</span> 1 free search</li>
              <li className="flex items-center gap-2 text-gray-600"><span className="text-green-600">✓</span> Basic facility information</li>
              <li className="flex items-center gap-2 text-gray-600"><span className="text-green-600">✓</span> EWC code lookup</li>
            </ul>
            {!user ? (
              <button onClick={onBack} className="w-full py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold">
                Sign Up Free
              </button>
            ) : (
              <button disabled className="w-full py-3 bg-gray-300 text-gray-600 rounded-lg font-semibold cursor-not-allowed">
                Current Plan
              </button>
            )}
          </div>

          {/* Pay As You Go */}
          <div className="bg-white rounded-lg shadow-xl p-8 border-2 border-blue-500 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
              FLEXIBLE
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Pay As You Go</h3>
            <p className="text-4xl font-bold text-gray-900 mb-1">£10</p>
            <p className="text-sm text-gray-600 mb-4">for 5 searches</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-gray-600"><span className="text-green-600">✓</span> 5 facility searches</li>
              <li className="flex items-center gap-2 text-gray-600"><span className="text-green-600">✓</span> Full contact details</li>
              <li className="flex items-center gap-2 text-gray-600"><span className="text-green-600">✓</span> Disposal Costs (if available)</li>
              <li className="flex items-center gap-2 text-gray-600"><span className="text-green-600">✓</span> Distance sorting</li>
              <li className="flex items-center gap-2 text-gray-600"><span className="text-green-600">✓</span> Email invoice</li>
            </ul>
            <button
              onClick={() => handlePurchase('price_1STgeYRy6wJc4RiFxIERqEbK', 'payg')}
              disabled={loading || !user}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              <CreditCard className="w-5 h-5" />
              {loading ? 'Processing...' : 'Buy Now'}
            </button>
            {!user && <p className="text-xs text-center text-gray-500 mt-2">Login required</p>}
          </div>

          {/* Pro Unlimited */}
          <div className="bg-white rounded-lg shadow-xl p-8 border-4 border-green-500 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
              BEST VALUE
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Pro Unlimited</h3>
            <div className="mb-4">
              <p className="text-4xl font-bold text-gray-900">£10<span className="text-lg font-normal text-gray-600">/month</span></p>
              <p className="text-sm text-gray-600 mt-1">or £100/year (save 17%)</p>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-gray-600"><span className="text-green-600">✓</span> Unlimited searches</li>
              <li className="flex items-center gap-2 text-gray-600"><span className="text-green-600">✓</span> Full facility details</li>
              <li className="flex items-center gap-2 text-gray-600"><span className="text-green-600">✓</span> Priority support</li>
              <li className="flex items-center gap-2 text-gray-600"><span className="text-green-600">✓</span> Advanced filtering</li>
              <li className="flex items-center gap-2 text-gray-600"><span className="text-green-600">✓</span> Export facility lists</li>
              <li className="flex items-center gap-2 text-gray-600"><span className="text-green-600">✓</span> Monthly invoices</li>
            </ul>
            <div className="space-y-2">
              <button
                onClick={() => handlePurchase('price_1STgf8Ry6wJc4RiFatY8R1u5', 'pro_monthly')}
                disabled={loading || !user}
                className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                {loading ? 'Processing...' : 'Subscribe Monthly'}
              </button>
              <button
                onClick={() => handlePurchase('price_1STgg1Ry6wJc4RiF27FLeNlO', 'pro_annual')}
                disabled={loading || !user}
                className="w-full py-3 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                {loading ? 'Processing...' : 'Subscribe Annually'}
              </button>
            </div>
            {!user && <p className="text-xs text-center text-gray-500 mt-2">Login required</p>}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Why Choose WasteLocate?</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <Shield className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-800 mb-2">Secure Payments</h4>
              <p className="text-sm text-gray-600">Powered by Stripe. Your data is encrypted and secure.</p>
            </div>
            <div className="text-center">
              <Mail className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-800 mb-2">Email Invoices</h4>
              <p className="text-sm text-gray-600">Receive detailed invoices for every transaction.</p>
            </div>
            <div className="text-center">
              <Phone className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-800 mb-2">UK Support</h4>
              <p className="text-sm text-gray-600">Contact us at info@wastelocate.co.uk</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
