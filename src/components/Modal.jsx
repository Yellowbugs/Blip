// src/components/Modal.jsx
import React from "react";

export default function Modal({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose} // Close when clicking the overlay
    >
      <div
        className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md text-white"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white hover:text-purple-300 font-bold text-lg"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
