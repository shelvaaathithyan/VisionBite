import React from 'react';
import { motion } from 'framer-motion';
import { PendingUser } from '../../types';

interface ApprovalSectionProps {
  users: PendingUser[];
  isLoading: boolean;
  processingId: string | null;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const Spinner: React.FC = () => (
  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-transparent" />
);

export const ApprovalSection: React.FC<ApprovalSectionProps> = ({
  users,
  isLoading,
  processingId,
  onApprove,
  onReject,
}) => {
  return (
    <section className="relative h-full overflow-hidden rounded-2xl border border-slate-500/30 bg-transparent shadow-xl shadow-slate-950/10 backdrop-blur-sm">
      {/* Content Layer */}
      <div className="relative z-10 flex h-full flex-col p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">Staff Approval Management</h2>
          <span className="rounded-lg border border-slate-500/30 bg-transparent px-3 py-1.5 text-base text-slate-200">
            Pending: {users.length}
          </span>
        </div>

        {isLoading ? (
          <div className="flex min-h-40 flex-1 items-center justify-center gap-3 text-slate-300">
            <Spinner />
            <span>Loading pending staff...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="flex min-h-[20rem] flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-500/30 bg-transparent p-8 text-center text-slate-300">
            <p className="text-4xl">No pending staff approvals!!</p>
          </div>
        ) : (
        <div className="space-y-3">
          {users.map((pendingUser, index) => {
            const isProcessing = processingId === pendingUser._id;

            return (
              <motion.div
                key={pendingUser._id}
                className="rounded-xl border border-slate-500/30 bg-transparent p-4 transition hover:border-slate-400/50 backdrop-blur-sm"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.03 }}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xl font-semibold text-slate-100">{pendingUser.name}</p>
                    <p className="text-lg text-slate-300">{pendingUser.email}</p>
                    <p className="mt-1 text-base text-slate-300">
                      Registered: {new Date(pendingUser.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onApprove(pendingUser._id)}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-lg font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isProcessing ? <Spinner /> : null}
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => onReject(pendingUser._id)}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-lg font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isProcessing ? <Spinner /> : null}
                      Reject
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
};
