import React, { useState, useEffect } from 'react';
import axios from 'axios';

export const DataView = () => {
  const [modulos, setModulos] = useState([]);
  const [inversores, setInversores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModulo, setSelectedModulo] = useState(null);
  const [selectedInversor, setSelectedInversor] = useState(null);
  const [compatibilityResult, setCompatibilityResult] = useState(null);
  const [desiredModulosParalelo, setDesiredModulosParalelo] = useState('2');
  const [expandedSteps, setExpandedSteps] = useState({});
  const port = import.meta.env.REACT_APP_PORT || 1000; 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [modulosResponse, inversoresResponse] = await Promise.all([
          axios.get('http://localhost:5002/modulos'),
          axios.get('http://localhost:5002/inversores'),
        ]);
        setModulos(modulosResponse.data);
        setInversores(inversoresResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const verificarCompatibilidade = async () => {
    if (!selectedModulo || !selectedInversor) {
      alert('Por favor, selecione um módulo e um inversor.');
      return;
    }

    if (!desiredModulosParalelo || parseInt(desiredModulosParalelo) < 1) {
      alert('Por favor, insira um número válido de módulos em paralelo (mínimo 1).');
      return;
    }

    // Definir overloadPercentage automaticamente para o máximo permitido pelo inversor
    const overloadPercentage = parseFloat(selectedInversor.overload);
    console.log(`Overload definido automaticamente para: ${overloadPercentage}%`);

    try {
      const response = await axios.get('http://localhost:5002/verificar_combinacao', {
        params: {
          moduloId: selectedModulo.idTry,
          inversorId: selectedInversor.idTry,
          overloadPercentage: overloadPercentage,
          desiredModulosParalelo: parseInt(desiredModulosParalelo)
        }
      });

      setCompatibilityResult(response.data);
    } catch (error) {
      console.error('Erro ao verificar compatibilidade:', error);
      setCompatibilityResult({ erro: 'Erro ao verificar compatibilidade.' });
    }
  };

  const toggleStep = (index) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Função para extrair dados específicos dos steps
  const getStepData = (descriptionStart) => {
    if (!compatibilityResult || !compatibilityResult.steps) return null;
    const step = compatibilityResult.steps.find(step => step.description.startsWith(descriptionStart));
    return step ? step.data : null;
  };

  if (loading) return <div className="text-center text-xl">Carregando dados...</div>;

  return (
    <main className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
      <section className="container mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Verificação de Compatibilidade de Módulos e Inversores
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Dropdown para selecionar Módulo */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Escolha o Módulo:</label>
              <select
                onChange={(e) => {
                  const selected = modulos.find(mod => mod.idTry === parseInt(e.target.value));
                  setSelectedModulo(selected);
                }}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione um módulo</option>
                {modulos.map((modulo) => (
                  <option key={modulo.idTry} value={modulo.idTry}>
                    {modulo.produto} - {modulo.potencia}W
                  </option>
                ))}
              </select>
            </div>

            {/* Dropdown para selecionar Inversor */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Escolha o Inversor:</label>
              <select
                onChange={(e) => {
                  const selected = inversores.find(inv => inv.idTry === parseInt(e.target.value));
                  setSelectedInversor(selected);
                }}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione um inversor</option>
                {inversores.map((inversor) => (
                  <option key={inversor.idTry} value={inversor.idTry}>
                    {inversor.produto} - {inversor.potenciaNominal}W
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Escolha do número de módulos em paralelo */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Número de Módulos em Paralelo:</label>
            <input
              type="number"
              value={desiredModulosParalelo}
              onChange={(e) => setDesiredModulosParalelo(e.target.value)}
              placeholder="Ex: 1"
              className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              max="2"
            />
          </div>

          {/* Botão para verificar compatibilidade */}
          <div className="text-center mb-8">
            <button
              onClick={verificarCompatibilidade}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto"
            >
              Verificar Compatibilidade
            </button>
          </div>

          {/* Resultado da Compatibilidade */}
          {compatibilityResult && (
            <div className="mt-8">
              {compatibilityResult.compatibilidade ? (
                <div className="bg-green-100 border border-green-400 text-green-700 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold mb-4">Compatível!</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <p><span className="font-semibold">Total de Módulos:</span> {compatibilityResult.maximoModulos}</p>
                    <p><span className="font-semibold">Máximo de Módulos Permitido:</span> {compatibilityResult.totalModulosPorPotencia}</p>
                    <p><span className="font-semibold">MPPTs Utilizados:</span> {compatibilityResult.mpptsUtilizados}</p>
                    <p><span className="font-semibold">Potência Total dos Módulos:</span> {compatibilityResult.potenciaTotalModulos} W</p>
                    <p><span className="font-semibold">Potência Máxima do Inversor:</span> {compatibilityResult.potenciaMaximaInversor} W</p>
                    <p className="font-bold"><span className="font-semibold">Preço Total do Kit:</span> R$ {compatibilityResult.totalKitPreco ? compatibilityResult.totalKitPreco.toFixed(2) : '0.00'}</p>
                  </div>

                  {/* Configurações por MPPT */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Configurações por MPPT</h3>
                    <table className="min-w-full bg-white">
                      <thead>
                        <tr>
                          <th className="py-2 px-4 border-b">MPPT</th>
                          <th className="py-2 px-4 border-b">Módulos em Série</th>
                          <th className="py-2 px-4 border-b">Módulos em Paralelo</th>
                          <th className="py-2 px-4 border-b">Total de Módulos</th>
                        </tr>
                      </thead>
                      <tbody>
                      {compatibilityResult.combinacoesMPPT && compatibilityResult.combinacoesMPPT.map((combo, index) => (
                          <tr key={index} className="text-center">
                            <td className="py-2 px-4 border-b">{index + 1}</td>
                            <td className="py-2 px-4 border-b">{combo.modulosEmSerie}</td>
                            <td className="py-2 px-4 border-b">{combo.modulosEmParalelo}</td>
                            <td className="py-2 px-4 border-b">{combo.modulosEmSerie * combo.modulosEmParalelo}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Erros de Distribuição, se houver */}
                  {compatibilityResult.erros.distribuicao && (
                    <div className="mt-4 bg-yellow-100 border border-yellow-400 text-yellow-700 p-4 rounded">
                      <p>{compatibilityResult.erros.distribuicao}</p>
                    </div>
                  )}

                  {/* Passos do Processo */}
                  {compatibilityResult.steps && compatibilityResult.steps.length > 0 && (
                        <div className="mt-6">
                          <h3 className="text-lg font-semibold mb-4">Detalhes do Processo</h3>
                          <div className="space-y-4">
                            {compatibilityResult.steps.map((step, index) => (
                              <div key={index} className="border border-gray-200 rounded p-4">
                                <button
                                  onClick={() => toggleStep(index)}
                                  className="w-full text-left focus:outline-none flex justify-between items-center"
                                >
                                  <span>{step.description}</span>
                                  <span>{expandedSteps[index] ? '-' : '+'}</span>
                                </button>
                                {expandedSteps[index] && step.data && (
                                  <pre className="mt-2 bg-gray-100 p-2 rounded overflow-x-auto">
                                    {JSON.stringify(step.data, null, 2)}
                                  </pre>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                <div className="bg-red-100 border border-red-400 text-red-700 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Não Compatível!</h2>
                <ul className="list-disc list-inside mb-4">
                  {compatibilityResult.erros && compatibilityResult.erros.corrente && <li>{compatibilityResult.erros.corrente}</li>}
                  {compatibilityResult.erros.potencia && <li>{compatibilityResult.erros.potencia}</li>}
                  {compatibilityResult.erros.distribuicao && <li>{compatibilityResult.erros.distribuicao}</li>}
                </ul>

                  {/* Passos do Processo */}
                  {compatibilityResult.steps && compatibilityResult.steps.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Detalhes do Processo</h3>
                          <div className="space-y-4">
                            {compatibilityResult.steps.map((step, index) => (
                              <div key={index} className="border border-gray-200 rounded p-4">
                                <button
                                  onClick={() => toggleStep(index)}
                                  className="w-full text-left focus:outline-none flex justify-between items-center"
                                >
                                  <span>{step.description}</span>
                                  <span>{expandedSteps[index] ? '-' : '+'}</span>
                                </button>
                                {expandedSteps[index] && step.data && (
                                  <pre className="mt-2 bg-gray-100 p-2 rounded overflow-x-auto">
                                    {JSON.stringify(step.data, null, 2)}
                                  </pre>
                                )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};
