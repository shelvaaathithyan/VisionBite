import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { adminService, orderService } from '@/services/api';
import { DashboardOrder, OrderStatus, PendingUser } from '@/types';
import { Header } from '@/components/dashboard/Header';
import { KPICards, KPIItem } from '@/components/dashboard/KPICards';
import { ProfileCard } from '@/components/dashboard/ProfileCard';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

interface ToastMessage {
  id: number;
  type: 'success' | 'error';
  message: string;
}

const iconClassName = 'h-5 w-5';

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClassName}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClassName}>
    <circle cx="12" cy="12" r="9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClassName}>
    <circle cx="12" cy="12" r="9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="m8 12 2.5 2.5L16 9" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClassName}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 4 7v6c0 5 3.5 7.8 8 9 4.5-1.2 8-4 8-9V7l-8-4z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4" />
  </svg>
);

const PulseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClassName}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2 12h4l2-5 4 10 2-5h8" />
  </svg>
);

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [loadingApproved, setLoadingApproved] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [approvedStaffCount, setApprovedStaffCount] = useState<number>(0);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const inrFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const showToast = (type: ToastMessage['type'], message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((current) => [...current, { id, type, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3000);
  };

  useEffect(() => {
    fetchDashboardData();
  }, [isAdmin]);

  const fetchDashboardData = async () => {
    if (!isAdmin) {
      return;
    }

    await Promise.all([fetchPendingUsers(), fetchApprovedStaffCount(), fetchOrders()]);
  };

  const fetchPendingUsers = async () => {
    try {
      setLoadingPending(true);
      const response = await adminService.getPendingUsers();
      setPendingUsers(response.data.users);
    } catch (error: any) {
      showToast('error', error.response?.data?.message || 'Failed to fetch pending users');
    } finally {
      setLoadingPending(false);
    }
  };

  const fetchApprovedStaffCount = async () => {
    try {
      setLoadingApproved(true);
      const response = await adminService.getApprovedStaff();
      setApprovedStaffCount(response.data?.count ?? 0);
    } catch (error: any) {
      showToast('error', error.response?.data?.message || 'Failed to fetch approved staff');
    } finally {
      setLoadingApproved(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await orderService.getAllOrders();
      setOrders(response.data?.orders || []);
    } catch (error: any) {
      showToast('error', error.response?.data?.message || 'Failed to fetch customer orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleOrderStatusUpdate = async (id: string, status: OrderStatus, rejectionReason?: string) => {
    try {
      setUpdatingOrderId(id);
      const response = await orderService.updateOrderStatus(id, status, rejectionReason);
      showToast('success', response.data?.message || 'Order status updated');
      await fetchOrders();
    } catch (error: any) {
      showToast('error', error.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleRejectOrder = async (id: string) => {
    const reason = String(rejectionReasons[id] || '').trim();
    if (!reason) {
      showToast('error', 'Please enter a rejection reason');
      return;
    }

    await handleOrderStatusUpdate(id, 'rejected', reason);
    setRejectionReasons((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  };

  const handleDeleteAllOrders = async () => {
    const shouldDelete = window.confirm('Delete all customer orders? This action cannot be undone.');
    if (!shouldDelete) {
      return;
    }

    try {
      setLoadingOrders(true);
      let response;
      try {
        response = await orderService.deleteAllOrders();
      } catch {
        response = await orderService.clearAllOrders();
      }
      showToast('success', response.data?.message || 'All orders deleted');
      setOrders([]);
    } catch (error: any) {
      showToast('error', error.response?.data?.message || 'Failed to delete all orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    const shouldDelete = window.confirm('Delete this order? This action cannot be undone.');
    if (!shouldDelete) {
      return;
    }

    try {
      setUpdatingOrderId(id);
      const response = await orderService.deleteOrderById(id);
      showToast('success', response.data?.message || 'Order deleted');
      setOrders((current) => current.filter((order) => order._id !== id));
    } catch (error: any) {
      showToast('error', error.response?.data?.message || 'Failed to delete order');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const totalStaff = isAdmin ? pendingUsers.length + approvedStaffCount : 'Restricted';
  const approvedStaff = isAdmin ? approvedStaffCount : user?.isApproved ? 1 : 0;
  const activeUsers = isAdmin ? approvedStaffCount + 1 : user?.isApproved ? 1 : 0;
  const isLoadingStats = loadingPending || loadingApproved;
  const activeOrders = orders.filter((order) =>
    ['awaiting_approval', 'pending', 'preparing', 'ready'].includes(order.status)
  );

  const kpis: KPIItem[] = [
    {
      id: 'total-staff',
      label: 'Total Staff',
      value: isLoadingStats && isAdmin ? '...' : totalStaff,
      subtitle: isAdmin ? 'Approved + pending' : 'Admin visibility only',
      icon: <UsersIcon />,
    },
    ...(isAdmin
      ? [
          {
            id: 'pending-approvals',
            label: 'Pending Approvals',
            value: loadingPending ? '...' : pendingUsers.length,
            subtitle: 'Requires action (click card)',
            icon: <ClockIcon />,
            onClick: () => navigate('/staff-approvals'),
          } as KPIItem,
        ]
      : []),
    {
      id: 'approved-staff',
      label: 'Approved Staff',
      value: isLoadingStats && isAdmin ? '...' : approvedStaff,
      subtitle: isAdmin ? 'Active staff accounts' : 'Your approval state',
      icon: <CheckIcon />,
    },
    {
      id: 'system-status',
      label: 'System Status',
      value: 'Online',
      subtitle: 'All services operational',
      icon: <ShieldIcon />,
    },
    {
      id: 'active-users',
      label: 'Active Users',
      value: isLoadingStats && isAdmin ? '...' : activeUsers,
      subtitle: isAdmin ? 'Estimated active sessions' : 'Current session',
      icon: <PulseIcon />,
    },
  ];

  const staffMainContent = (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl shadow-slate-950/35 backdrop-blur-sm sm:p-6">
      <h2 className="text-lg font-semibold tracking-[0.05em] text-white">Account Overview</h2>
      <p className="mt-2 text-sm tracking-[0.04em] text-slate-300">
        {user?.isApproved
          ? 'Your staff account is approved and fully active.'
          : 'Your registration is pending admin approval. You will receive access after verification.'}
      </p>
      <div className="mt-4 rounded-xl border border-slate-700 bg-slate-950/40 p-4 text-sm tracking-[0.04em] text-slate-300">
        Keep your profile information up to date and contact an administrator if approval takes longer than expected.
      </div>
    </section>
  );

  const statusBadgeClass: Record<OrderStatus, string> = {
    awaiting_approval: 'border-fuchsia-400/35 bg-fuchsia-500/20 text-fuchsia-100',
    pending: 'border-amber-400/35 bg-amber-500/20 text-amber-100',
    preparing: 'border-blue-400/35 bg-blue-500/20 text-blue-100',
    ready: 'border-emerald-400/35 bg-emerald-500/20 text-emerald-100',
    served: 'border-slate-400/35 bg-slate-500/20 text-slate-100',
    completed: 'border-slate-400/35 bg-slate-500/20 text-slate-100',
    cancelled: 'border-rose-400/35 bg-rose-500/20 text-rose-100',
    rejected: 'border-rose-400/35 bg-rose-500/20 text-rose-100',
  };

  const adminMainContent = (
    <section className="relative h-full overflow-hidden rounded-2xl border border-slate-500/30 bg-transparent shadow-xl shadow-slate-950/10 backdrop-blur-sm">
      <div className="relative z-10 flex h-full flex-col p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">Customer Orders Queue</h2>
          <span className="rounded-lg border border-slate-500/30 bg-transparent px-3 py-1.5 text-base text-slate-200">
            Active Orders: {activeOrders.length}
          </span>
        </div>

        {loadingOrders ? (
          <div className="flex min-h-40 flex-1 items-center justify-center gap-3 text-slate-300">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-transparent" />
            <span>Loading customer orders...</span>
          </div>
        ) : activeOrders.length === 0 ? (
          <div className="flex min-h-[20rem] flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-500/30 bg-transparent p-8 text-center text-slate-300">
            <p className="text-4xl">No active customer orders</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeOrders.map((order, index) => {
              const isProcessing = updatingOrderId === order._id;
              const customerName =
                order.customer?.name || order.userAccount?.name || 'Guest Customer';

              return (
                <motion.div
                  key={order._id}
                  className="rounded-xl border border-slate-500/30 bg-transparent p-4 transition hover:border-slate-400/50 backdrop-blur-sm"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.03 }}
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xl font-semibold text-slate-100">{customerName}</p>
                        <p className="text-sm text-slate-300">
                          {order.queueToken ? `Token #${order.queueToken}` : 'Token pending admin approval'} • {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                        <p className="text-sm text-slate-300">
                          Items: {order.items.reduce((sum, item) => sum + item.quantity, 0)} • Total: {inrFormatter.format(order.totalAmount)}
                        </p>
                      </div>

                      <span className={`rounded-lg border px-3 py-1 text-sm font-semibold uppercase tracking-[0.05em] ${statusBadgeClass[order.status]}`}>
                        {order.status}
                      </span>
                    </div>

                    <p className="rounded-lg border border-slate-600/40 bg-slate-950/40 px-3 py-2 text-sm tracking-[0.04em] text-slate-200">
                      Customer Notification: {order.customerNotification || 'Order Received'}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {order.status === 'awaiting_approval' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOrderStatusUpdate(order._id, 'pending')}
                            disabled={isProcessing}
                            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Approve & Assign Token
                          </button>

                          <input
                            type="text"
                            value={rejectionReasons[order._id] || ''}
                            onChange={(event) =>
                              setRejectionReasons((current) => ({
                                ...current,
                                [order._id]: event.target.value,
                              }))
                            }
                            placeholder="Enter rejection reason"
                            className="min-w-[16rem] flex-1 rounded-lg border border-rose-400/35 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400"
                          />

                          <button
                            type="button"
                            onClick={() => handleRejectOrder(order._id)}
                            disabled={isProcessing}
                            className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Reject Order
                          </button>
                        </>
                      )}

                      {order.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => handleOrderStatusUpdate(order._id, 'preparing')}
                          disabled={isProcessing}
                          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Mark Preparing
                        </button>
                      )}

                      {order.status === 'preparing' && (
                        <button
                          type="button"
                          onClick={() => handleOrderStatusUpdate(order._id, 'ready')}
                          disabled={isProcessing}
                          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Mark Ready
                        </button>
                      )}

                      {order.status === 'ready' && (
                        <button
                          type="button"
                          onClick={() => handleOrderStatusUpdate(order._id, 'completed')}
                          disabled={isProcessing}
                          className="inline-flex items-center gap-2 rounded-lg bg-slate-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Mark Completed
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteOrder(order._id)}
                        disabled={isProcessing}
                        className="inline-flex items-center gap-2 rounded-lg border border-rose-400/35 bg-rose-600/20 px-4 py-2.5 text-sm font-semibold text-rose-100 transition hover:bg-rose-600/35 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Delete Order
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );

  const sidePanel = (
    <>
      <ProfileCard
        name={user?.name}
        email={user?.email}
        role={isAdmin ? 'admin' : 'staff'}
        isApproved={user?.isApproved}
      />

      <section className="rounded-2xl border border-slate-500/30 bg-transparent p-5 shadow-xl shadow-slate-950/10">
        <h2 className="text-2xl font-semibold tracking-[0.05em] text-white">Quick Actions</h2>
        <div className="mt-4 space-y-2">
          <button
            type="button"
            onClick={fetchDashboardData}
            disabled={!isAdmin || isLoadingStats}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-xl font-semibold tracking-[0.045em] text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoadingStats && isAdmin ? 'Refreshing...' : 'Refresh Dashboard'}
          </button>
          {isAdmin && (
            <button
              type="button"
              onClick={handleDeleteAllOrders}
              disabled={loadingOrders}
              className="w-full rounded-xl border border-rose-500/50 bg-rose-600/80 px-4 py-3 text-xl font-semibold tracking-[0.045em] text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingOrders ? 'Deleting Orders...' : 'Delete All Orders'}
            </button>
          )}
          {isAdmin && (
            <button
              type="button"
              onClick={() => navigate('/staff-approvals')}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-xl font-semibold tracking-[0.045em] text-slate-200 transition hover:bg-slate-700"
            >
              Open Staff Approvals
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-xl font-semibold tracking-[0.045em] text-slate-200 transition hover:bg-slate-700"
          >
            Go to Login
          </button>
        </div>
      </section>
    </>
  );

  return (
    <>
      <DashboardLayout
        header={<Header username={user?.name} role={isAdmin ? 'admin' : 'staff'} />}
        kpis={<KPICards items={kpis} />}
        mainContent={isAdmin ? adminMainContent : staffMainContent}
        sidePanel={sidePanel}
      />

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
    </>
  );
};
