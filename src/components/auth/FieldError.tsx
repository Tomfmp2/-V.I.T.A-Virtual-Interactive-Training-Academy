import React from 'react';

type Props = {
  id?: string;
  children: React.ReactNode;
};

export const FieldError = ({ id, children }: Props) => {
  if (!children) return null;
  return (
    <p className="field-error" id={id} role="alert">
      {children}
    </p>
  );
};

export default FieldError;
