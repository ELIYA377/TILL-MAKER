import React from 'react';

interface BrandFooterProps {
  dark?: boolean;
}

export const BrandFooter: React.FC<BrandFooterProps> = ({ dark = false }) => {
  return (
    <footer
      className={`w-full py-4 px-6 border-t text-center text-xs font-medium ${
        dark
          ? 'bg-[#0B162C] border-slate-800 text-slate-300'
          : 'bg-white border-slate-200 text-slate-600'
      }`}
    >
      Developed by Digital Sales
    </footer>
  );
};
