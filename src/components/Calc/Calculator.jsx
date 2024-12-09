// frontend/src/components/Calc/Calculator.jsx

import React, { useState } from 'react';
import axios from 'axios';

const Calculator = () => {
  const [maxModulesParalelo, setMaxModulesParalelo] = useState('');
  const [maxOverload, setMaxOverload] = useState('');
  const [combinacoes, setCombinacoes] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState(null); // Estado para a combinação selecionada

  // URL do backend (ajuste conforme necessário)
  const backendUrl = 'http://localhost:5003';
s
  const buscarTodasCombinacoes = async () => {
    // Validação dos campos
    if (maxModulesParalelo === '' || isNaN(maxModulesParalelo) || maxModulesParalelo <= 0) {
      alert('Por favor, insira um valor válido para "Máximo de Módulos em Paralelo".');
      return;
    }

    if (maxOverload === '' || isNaN(maxOverload) || maxOverload < 0) {
      alert('Por favor, insira um valor válido para "Overload Máximo".');
      return;
    }

    setLoading(true);
    setError(null);
    setCombinacoes([]);
    setSelectedCombo(null); // Resetar combinação selecionada

    try {
      const response = await axios.get(`${backendUrl}/todas-combinacoes`, {
        params: {
          maxModulesParalelo: parseInt(maxModulesParalelo, 10),
          maxOverload: parseFloat(maxOverload),
        },
      });

      if (response.data.length > 0) {
        setCombinacoes(response.data);
      } else {
        setError('Nenhuma combinação encontrada para os parâmetros fornecidos.');
      }
    } catch (err) {
      console.error('Erro ao buscar combinações:', err);
      if (err.response && err.response.data && err.response.data.erro) {
        setError(err.response.data.erro);
      } else {
        setError('Erro ao buscar combinações. Por favor, tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
      <section className="container mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Calculadora de Todas as Combinações de Módulos e Inversores
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Campo para Máximo de Módulos em Paralelo */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Máximo de Módulos em Paralelo:</label>
              <input
                type="number"
                min="1"
                value={maxModulesParalelo}
                onChange={(e) => setMaxModulesParalelo(e.target.value)}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Insira o máximo de módulos em paralelo"
              />
            </div>

            {/* Campo para Overload Máximo */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Overload Máximo (%):</label>
              <input
                type="number"
                min="0"
                value={maxOverload}
                onChange={(e) => setMaxOverload(e.target.value)}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Insira o Overload Máximo"
              />
            </div>
          </div>

          {/* Botão para buscar todas as combinações */}
          <div className="text-center mb-8">
            <button
              onClick={buscarTodasCombinacoes}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:ring-2 focus:ring-green-500 w-full md:w-auto"
              disabled={loading}
            >
              {loading ? 'Buscando...' : 'Buscar Todas as Combinações'}
            </button>
          </div>

          {/* Exibir Erro, se houver */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded mb-6">
              {error}
            </div>
          )}

          {/* Resultado das Combinações */}
          {combinacoes && combinacoes.length > 0 && (
            <div className="mt-8 text-black">
              <h2 className="text-xl font-semibold mb-4">Combinações Encontradas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {combinacoes.map((combo, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-xl transition-shadow"
                    onClick={() => setSelectedCombo(combo)}
                  >
                    <h3 className="text-lg font-semibold mb-2">{`Combinação ${idx + 1}`}</h3>
                    <p><span className="font-semibold">Módulo:</span> {combo.nomeModulo}</p>
                    <p><span className="font-semibold">Inversor:</span> {combo.nomeInversor}</p>
                 {/*     <p><span className="font-semibold">Total de Módulos:</span> {combo.totalModulos}</p>
                    <p><span className="font-semibold">Potência Total:</span> { (combo.potenciaTotalModulos / 1000).toFixed(2) } kW</p>
                    <p><span className="font-semibold">Preço Total:</span> R$ {combo.precoTotalKit.toFixed(2)}</p>     */} 
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modal para Detalhes da Combinação */}
          {selectedCombo && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-1/2 p-6 relative">
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                  onClick={() => setSelectedCombo(null)}
                >
                  &#10005;
                </button>
                <h2 className="text-black text-2xl font-bold mb-4">Detalhes da Combinação</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-black">
                  <div>
                    <p><span className="font-semibold">Módulo:</span> {selectedCombo.nomeModulo} (ID: {selectedCombo.idTryModulo})</p>
                    <p><span className="font-semibold">Inversor:</span> {selectedCombo.nomeInversor} (ID: {selectedCombo.idTryInversor})</p>
                    <p><span className="font-semibold">Total de Módulos:</span> {selectedCombo.totalModulos}</p>
                    <p><span className="font-semibold">Potência Total dos Módulos:</span> {selectedCombo.potenciaTotalModulos} W</p>
                    <p><span className="font-semibold">Preço Total do Kit:</span> R$ {selectedCombo.precoTotalKit.toFixed(2)}</p>
                  </div>
                  <div>
                    <p><span className="font-semibold">Potência Máxima do Inversor:</span> {selectedCombo.potenciaMaximaInversor} W</p>
                    <p><span className="font-semibold">MPPTs Utilizados:</span> {selectedCombo.mpptsUtilizados}</p>
                    <p><span className="font-semibold">Overload Utilizado:</span> {selectedCombo.overloadUtilizado}%</p>
                    <p><span className="font-semibold">Módulos em Série:</span> {selectedCombo.minimoModulosSerie} - {selectedCombo.maximoModulosSerie}</p>
                    
                  </div>
                </div>

                {/* Tabela de Configurações por MPPT */}
                <div className="mt-6 text-black">
                  <h3 className="text-xl font-semibold mb-2">Configurações por MPPT</h3>
                  <div className="overflow-auto">
                    <table className="min-w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-gray-200 text-black">
                          <th className="py-1 px-2 border-b border-gray-300 text-left">MPPT Número</th>
                          <th className="py-1 px-2 border-b border-gray-300 text-left">Módulos em Série</th>
                          <th className="py-1 px-2 border-b border-gray-300 text-left">Módulos em Paralelo</th>
                          <th className="py-1 px-2 border-b border-gray-300 text-left">Total de Módulos</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedCombo.configuracoesMPPT.map((config, index) => (
                          <tr key={index} className="hover:bg-gray-100 text-black">
                            <td className="py-1 px-2 border-b border-gray-300">{config.mpptNumero}</td>
                            <td className="py-1 px-2 border-b border-gray-300">{config.modulosEmSerie}</td>
                            <td className="py-1 px-2 border-b border-gray-300">{config.modulosEmParalelo}</td>
                            <td className="py-1 px-2 border-b border-gray-300">{config.totalDeModulos}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};
export default Calculator;
