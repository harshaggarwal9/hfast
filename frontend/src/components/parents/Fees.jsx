import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useAuthStore from '../../stores/useAuthStore'; // assuming this provides token

export default function FeePayment() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuthStore();

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    axios
      .get('/api/parent/fetchFees')
      .then((res) => setFees(res.data))
      .catch(console.error);
  }, [token]);

  const handlePay = async (fee) => {
    setLoading(true);
    try {
      const { data } = await axios.post(`/api/fees/pay/${fee._id}`);
      const ok = await loadRazorpayScript();
      if (!ok) {
        alert('Failed to load Razorpay SDK');
        setLoading(false);
        return;
      }

      const options = {
        key: data.razorpayKey,
        amount: data.amount,
        currency: data.currency,
        name: 'Your School Name',
        description: `Fee for Roll No ${fee.student.RollNumber}`,
        order_id: data.orderId,
        handler: async (response) => {
          await axios.post('/api/fees/verify-payment', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            feeId: fee._id,
          });
          const res = await axios.get('/api/parent/fetchFees');
          setFees(res.data);
        },
        prefill: {
          name: fee.student.userId?.name || '',
          email: fee.student.userId?.email || '',
          contact: fee.student.phoneNumber || '',
        },
        theme: { color: '#47B881' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert('Unable to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-6 max-w-5xl mx-auto">
      <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-center sm:text-left">
        Pending Fee Challans
      </h2>

      {fees.length === 0 ? (
        <div className="alert alert-success text-center">No pending fees!</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {fees.map((fee) => (
            <div key={fee._id} className="card bg-base-100 shadow-md sm:shadow-lg rounded-md">
              <div className="card-body p-4 sm:p-6">
                <h3 className="card-title text-base sm:text-lg font-medium mb-2">
                  Roll No: {fee.student.RollNumber}
                </h3>
                <p className="text-sm sm:text-base">Amount: ₹{fee.amount}</p>
                <p className="text-sm sm:text-base">
                  Due Date: {new Date(fee.dueDate).toLocaleDateString()}
                </p>
                <div className="card-actions mt-4">
                  <button
                    className="btn btn-primary btn-sm sm:btn-md w-full"
                    onClick={() => handlePay(fee)}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Pay Now'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
