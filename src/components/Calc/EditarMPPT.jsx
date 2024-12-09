// frontend/src/components/EditarMPPT.jsx

import React, { useState, useEffect } from 'react';

const EditarMPPT = ({ kit, onClose, onSave }) => {
  const [mppts, setMppts] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSaveDisabled, setIsSaveDisabled] = useState(false);
  const [initialTotalModules, setInitialTotalModules] = useState(0);
  const [newTotalModules, setNewTotalModules] = useState(0);
  const [isCompatible, setIsCompatible] = useState(true);

  useEffect(() => {
    console.log('Inicializando EditarMPPT com o kit:', kit);
    // Inicializa os MPPTs com as configurações atuais ou valores padrão
    const initializedMPPTs = kit.configuracoesMPPT.map((mppt) => ({
      ...mppt,
      minModulosSerie: kit.minimoModulosSerie,
      maxModulosSerie: kit.maximoModulosSerie,
      minModulosParalelo: 1,
      maxModulosParalelo: 2,
    }));
    setMppts(initializedMPPTs);

    // Calcula o total de módulos inicial
    const total = initializedMPPTs.reduce((sum, mppt) => sum + mppt.totalDeModulos, 0);
    setInitialTotalModules(total);
    setNewTotalModules(total);

    // Verifica a compatibilidade inicial
    const totalPower = kit.potencia * total;
    const maxPower = kit.potenciaMaximaInversor;
    setIsCompatible(totalPower <= maxPower);
  }, [kit]);

  useEffect(() => {
    // Recalcula o total de módulos
    const total = mppts.reduce((sum, mppt) => sum + mppt.totalDeModulos, 0);
    setNewTotalModules(total);

    // Verifica a compatibilidade de potência
    const totalPower = kit.potencia * total;
    const maxPower = kit.potenciaMaximaInversor;
    setIsCompatible(totalPower <= maxPower);

    // Verifica erros para habilitar/desabilitar o botão de salvar
    setIsSaveDisabled(Object.keys(errors).length > 0);
  }, [mppts, errors, kit.potencia, kit.potenciaMaximaInversor]);

  const handleChange = (index, field, value) => {
    const valorNum = parseInt(value, 10) || 0;

    setMppts((prevMppts) => {
      const updatedMppts = [...prevMppts];
      updatedMppts[index][field] = valorNum;

      // Atualiza totalDeModulos após alteração
      updatedMppts[index].totalDeModulos = updatedMppts[index].modulosEmSerie * updatedMppts[index].modulosEmParalelo;

      return updatedMppts;
    });

    // Validar campos e atualizar erros
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };

      if (field === 'modulosEmSerie') {
        if (valorNum < kit.minimoModulosSerie) {
          newErrors[`kit${kit.id}_mppt${mppts[index].mpptNumero}_serie`] = `Mínimo de módulos em série: ${kit.minimoModulosSerie}`;
        } else if (valorNum > kit.maxModulosSerie) {
          newErrors[`kit${kit.id}_mppt${mppts[index].mpptNumero}_serie`] = `Máximo de módulos em série: ${kit.maxModulosSerie}`;
        } else {
          delete newErrors[`kit${kit.id}_mppt${mppts[index].mpptNumero}_serie`];
        }
      }

      if (field === 'modulosEmParalelo') {
        if (valorNum < mppts[index].minModulosParalelo) {
          newErrors[`kit${kit.id}_mppt${mppts[index].mpptNumero}_paralelo`] = `Mínimo de módulos em paralelo: ${mppts[index].minModulosParalelo}`;
        } else if (valorNum > mppts[index].maxModulosParalelo) {
          newErrors[`kit${kit.id}_mppt${mppts[index].mpptNumero}_paralelo`] = `Máximo de módulos em paralelo: ${mppts[index].maxModulosParalelo}`;
        } else {
          delete newErrors[`kit${kit.id}_mppt${mppts[index].mpptNumero}_paralelo`];
        }
      }

      return newErrors;
    });
  };

  const handleSave = () => {
    if (Object.keys(errors).length > 0 || !isCompatible) {
      alert('Corrija os erros ou ajuste a configuração antes de salvar.');
      return;
    }
  
    const updatedMPPTs = mppts.map((mppt) => ({
      mpptNumero: mppt.mpptNumero,
      modulosEmSerie: mppt.modulosEmSerie,
      modulosEmParalelo: mppt.modulosEmParalelo,
      totalDeModulos: mppt.totalDeModulos,
    }));
  
    const totalDeModulos = updatedMPPTs.reduce((sum, mppt) => sum + mppt.totalDeModulos, 0);
    const potenciaTotalModulos = totalDeModulos * kit.potencia;
    const precoTotalKit = (totalDeModulos * kit.precoModulo) + kit.precoInversor;
  
    onSave({
      ...kit,
      configuracoesMPPT: updatedMPPTs,
      totalModulos: totalDeModulos,
      potenciaTotalModulos,
      precoTotalKit,
    });
  
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Editar Configuração dos MPPTs - {kit.nomeInversor}</h2>

        {/* Exibição do Total de Módulos e Compatibilidade */}
        <div className="mb-4 p-4 border border-gray-300 rounded bg-gray-100">
          <p><strong>Total de Módulos Anterior:</strong> {initialTotalModules}</p>
          <p><strong>Total de Módulos Atual:</strong> {newTotalModules}</p>
          <p>
            <strong>Compatibilidade:</strong>
            {isCompatible ? (
              <span className="text-green-600 ml-2">Compatível</span>
            ) : (
              <span className="text-red-600 ml-2">Não Compatível</span>
            )}
          </p>
          <p><strong>Potência Total dos Módulos:</strong> {isNaN(kit.potencia) ? 'N/A' : (kit.potencia * newTotalModules)} W</p>
          <p><strong>Potência Máxima do Inversor com Sobrecarga:</strong> {kit.potenciaMaximaInversor} W</p>
        </div>

        {/* Tabela de Configurações dos MPPTs */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Configurações dos MPPTs</h3>
          <div className="max-h-64 overflow-y-auto border border-gray-300 rounded">
            <table className="w-full table-auto">
              <thead className="sticky top-0 bg-gray-200">
                <tr>
                  <th className="px-4 py-2 border">MPPT Número</th>
                  <th className="px-4 py-2 border">Módulos em Série</th>
                  <th className="px-4 py-2 border">Módulos em Paralelo</th>
                  <th className="px-4 py-2 border">Total de Modulos</th>
                </tr>
              </thead>
              <tbody>
                {mppts.map((mppt, index) => (
                  <tr key={index} className="text-center">
                    <td className="px-4 py-2 border">{mppt.mpptNumero}</td>
                    <td className="px-4 py-2 border">
                      <div className="flex flex-col items-center">
                        <input
                          type="number"
                          value={mppt.modulosEmSerie}
                          onChange={(e) => handleChange(index, 'modulosEmSerie', e.target.value)}
                          className={`w-20 p-1 border ${errors[`kit${kit.id}_mppt${mppt.mpptNumero}_serie`] ? 'border-red-500' : 'border-gray-300'} rounded`}
                          min={mppt.minModulosSerie}
                          max={mppt.maxModulosSerie}
                          title={`Módulos em Série devem estar entre ${mppt.minModulosSerie} e ${mppt.maxModulosSerie}`}
                        />
                        <span className="text-sm text-gray-600">
                          {`Min: ${mppt.minModulosSerie !== undefined ? mppt.minModulosSerie : 'N/A'}, Max: ${mppt.maxModulosSerie !== undefined ? mppt.maxModulosSerie : 'N/A'}`}
                        </span>
                        {errors[`kit${kit.id}_mppt${mppt.mpptNumero}_serie`] && (
                          <p className="text-red-500 text-sm">{errors[`kit${kit.id}_mppt${mppt.mpptNumero}_serie`]}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 border">
                      <div className="flex flex-col items-center">
                        <input
                          type="number"
                          value={mppt.modulosEmParalelo}
                          onChange={(e) => handleChange(index, 'modulosEmParalelo', e.target.value)}
                          className={`w-20 p-1 border ${errors[`kit${kit.id}_mppt${mppt.mpptNumero}_paralelo`] ? 'border-red-500' : 'border-gray-300'} rounded`}
                          min={mppt.minModulosParalelo}
                          max={mppt.maxModulosParalelo}
                          title={`Módulos em Paralelo devem estar entre ${mppt.minModulosParalelo} e ${mppt.maxModulosParalelo}`}
                        />
                        <span className="text-sm text-gray-600">
                          {`Min: ${mppt.minModulosParalelo}, Max: ${mppt.maxModulosParalelo}`}
                        </span>
                        {errors[`kit${kit.id}_mppt${mppt.mpptNumero}_paralelo`] && (
                          <p className="text-red-500 text-sm">{errors[`kit${kit.id}_mppt${mppt.mpptNumero}_paralelo`]}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 border">{mppt.totalDeModulos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resumo de Compatibilidade */}
        {!isCompatible && (
          <div className="mb-4 p-4 border border-red-500 rounded bg-red-100">
            <p className="text-red-700">
              A potência total dos módulos ({kit.potencia} W x {newTotalModules} módulos = {isNaN(kit.potencia * newTotalModules) ? 'N/A' : kit.potencia * newTotalModules} W) excede a potência máxima do inversor com sobrecarga utilizada ({kit.potenciaMaximaInversor} W).
            </p>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaveDisabled || !isCompatible}
            className={`text-white px-4 py-2 rounded transition duration-200 ${
              isSaveDisabled || !isCompatible
                ? 'bg-green-300 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditarMPPT;
