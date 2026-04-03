import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ApprovalSection } from '@/components/dashboard/ApprovalSection';
import { useAuth } from '@/context/AuthContext';
import { adminService } from '@/services/api';
import { PendingUser } from '@/types';

interface ToastMessage {
  id: number;
  type: 'success' | 'error';
  message: string;
}

export const StaffApprovalsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (type: ToastMessage['type'], message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((current) => [...current, { id, type, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3000);
  };

  const fetchPendingUsers = async () => {
    try {
      setLoadingPending(true);
      const response = await adminService.getPendingUsers();
      setPendingUsers(response.data.users || []);
    } catch (error: any) {
      showToast('error', error.response?.data?.message || 'Failed to fetch pending users');
    } finally {
      setLoadingPending(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      setProcessingId(id);
      const response = await adminService.approveUser(id);
      showToast('success', response.data?.message || 'Staff member approved');
      await fetchPendingUsers();
    } catch (error: any) {
      showToast('error', error.response?.data?.message || 'Failed to approve user');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setProcessingId(id);
      const response = await adminService.rejectUser(id);
      showToast('success', response.data?.message || 'Staff member rejected');
      await fetchPendingUsers();
    } catch (error: any) {
      showToast('error', error.response?.data?.message || 'Failed to reject user');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-slate-100" style={{ fontFamily: 'BebasNeue, sans-serif' }}>
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-6 rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5 shadow-xl shadow-slate-950/40 backdrop-blur-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xl text-slate-300">Admin Workspace</p>
              <h1 className="text-3xl font-bold tracking-[0.07em] text-white">Staff Approval Management</h1>
              <p className="mt-2 text-sm tracking-[0.05em] text-slate-300">
                Welcome, {user?.name || 'Admin'}. Review and action pending staff registrations.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="rounded-xl border border-slate-600 bg-slate-800 px-4 py-2 text-base font-semibold tracking-[0.05em] text-slate-100 transition hover:bg-slate-700"
            >
              Back to Dashboard
            </button>
          </div>
        </section>

        <ApprovalSection
          users={pendingUsers}
          isLoading={loadingPending}
          processingId={processingId}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </div>

      <div className="fixed right-4 top-4 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              className={`rounded-xl border px-4 py-3 text-base font-medium shadow-xl ${
                toast.type === 'success'
                  ? 'border-emerald-400/35 bg-emerald-500/20 text-emerald-100'
                  : 'border-rose-400/35 bg-rose-500/20 text-rose-100'
              }`}
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StaffApprovalsPage;
