const handlePurchase = async (priceId, productType) => {
    if (!user) {
      alert('Please log in to purchase');
      return;
    }

    setLoading(true);
    
    try {
      console.log('Starting checkout for:', { priceId, productType, userId: user.id });
      
      const response = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId: user.id,
          email: user.email,
          productType,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Checkout response:', data);
      
      if (!data.url && !data.sessionId) {
        throw new Error('No checkout URL or session ID received');
      }
      
      // If we have the URL, redirect directly
      if (data.url) {
        window.location.href = data.url;
      } else if (data.sessionId) {
        // Fallback: use Stripe.js to redirect
        const stripe = await stripePromise;
        const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
        if (error) {
          throw new Error(error.message);
        }
      }
    } catch (err) {
      console.error('Purchase error:', err);
      alert('Failed to initiate purchase: ' + err.message + '\n\nPlease contact support at info@wastelocate.co.uk');
    } finally {
      setLoading(false);
    }
  };
