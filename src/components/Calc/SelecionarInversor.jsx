import React from 'react';

const SelecionarInversor = ({ inversores, onSelect, onClose, minMPPTs = 0 }) => {
  // Filtrar inversores com mppts >= minMPPTs
  const inversoresFiltrados = inversores.filter(inversor => inversor.mppts >= minMPPTs);

  if (!inversoresFiltrados || inversoresFiltrados.length === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-6 rounded shadow-lg w-1/3">
          <h2 className="text-xl font-bold mb-4">Selecionar Inversor</h2>
          <p>Nenhum inversor disponível encontrado que atenda aos requisitos.</p>
          <button
            onClick={onClose}
            className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded shadow-lg w-1/3 max-h-[70vh] overflow-hidden">
        <h2 className="text-xl font-bold mb-4">Selecionar Inversor</h2>
        <div className="overflow-y-auto max-h-[50vh]">
          <ul>
            {inversoresFiltrados.map((inversor) => (
              <li
                key={inversor.idTry}
                className="mb-4 p-3 border border-gray-300 rounded shadow-sm bg-gray-50"
              >
                <p>
                  <strong>Nome:</strong> {inversor.nomeInversor}
                </p>
                <p>
                  <strong>Potência Nominal:</strong> {inversor.potenciaNominal} W
                </p>
                <p>
                  <strong>Potência Com Sobrecarga:</strong> {inversor.potenciaMaxima} W
                </p>
                <p>
                  <strong>MPPTs:</strong> {inversor.mppts}
                </p>
                <button
                  onClick={() => onSelect(inversor)}
                  className="mt-2 bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition duration-200"
                >
                  Selecionar
                </button>
              </li>
            ))}
          </ul>
        </div>
        <button
          onClick={onClose}
          className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};

export default SelecionarInversor;
