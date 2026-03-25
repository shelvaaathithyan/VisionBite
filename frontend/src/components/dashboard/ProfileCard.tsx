import React from 'react';

interface ProfileCardProps {
  name?: string;
  email?: string;
  role: 'admin' | 'staff';
  isApproved?: boolean;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ name, email, role, isApproved }) => {
  return (
    <section className="relative rounded-2xl border border-slate-700/60 bg-slate-900/70 backdrop-blur-md p-5 shadow-xl shadow-slate-950/35">
      {/* Content Layer */}
      <div className="relative z-10">
        <h2 className="text-lg font-semibold text-white">Profile</h2>
        <div className="mt-4 space-y-3 text-sm">
          <div>
            <p className="text-slate-400">Name</p>
            <p className="font-medium text-slate-100">{name || 'Not available'}</p>
          </div>
          <div>
            <p className="text-slate-400">Email</p>
            <p className="break-all font-medium text-slate-100">{email || 'Not available'}</p>
          </div>
          <div>
            <p className="text-slate-400">Role</p>
            <p className="font-medium capitalize text-slate-100">{role}</p>
          </div>
          <div>
            <p className="text-slate-400">Approval</p>
            <p className={`font-medium ${isApproved ? 'text-emerald-300' : 'text-amber-300'}`}>
              {isApproved ? 'Approved' : 'Pending Approval'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
