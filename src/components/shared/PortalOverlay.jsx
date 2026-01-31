import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

export const PortalOverlay = ({ children, onClose }) => {
  // Kunci scroll body saat modal terbuka
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const portalElement = document.getElementById('portal-root');
  if (!portalElement) return null;

  const overlayContent = (
    /* Z-Index Super Tinggi & Layout Centering */
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
      style={{ margin: 0 }} // Reset margin
    >
      {/* Backdrop Hitam */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>
      
      {/* Container Modal (Mencegah modal tumbuh lebih dari layar) */}
      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );

  return ReactDOM.createPortal(overlayContent, portalElement);
};