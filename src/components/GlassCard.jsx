import React from 'react';
export default function GlassCard({ children, className='' }) {
  return <div className={`card ${className}`}>{children}</div>;
}