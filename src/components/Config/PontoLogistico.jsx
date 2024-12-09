// src/components/Config/PontoLogistico.jsx

import React from 'react';
import { useFormContext } from 'react-hook-form';

const PontoLogistico = ({ index, remove }) => {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="border p-4 mb-4 rounded relative">
      <button
        type="button"
        onClick={() => remove(index)}
        className="absolute top-2 right-2 text-red-500"
      >
        &times;
      </button>
      {/* Campos do Ponto Logístico */}
      {/* ... similar aos campos já existentes */}
    </div>
  );
};

export default PontoLogistico;
