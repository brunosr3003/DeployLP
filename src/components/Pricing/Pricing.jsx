import React, { useState } from 'react';
import axios from 'axios';

export const Pricing = () => {
  const [overloadPercentage, setOverloadPercentage] = useState(100);
  const [combinationsResult, setCombinationsResult] = useState([]);
  const [loading, setLoading] = useState(false);

  // Função para verificar todas as combinações
  const verificarTodasCombinacoes = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5002/verificar-todas-combinacoes?overloadPercentage=${overloadPercentage}`);
      setCombinationsResult(response.data);
    } catch (error) {
      console.error('Erro ao verificar todas as combinações:', error);
      setCombinationsResult([{ erro: 'Erro ao verificar todas as combinações.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-gray-100 min-h-screen flex items-center justify-center">
      <section className="container mx-auto px-4 md:px-0">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Verificação de Compatibilidade de Módulos e Inversores
          </h1>

          {/* Escolha do Overload */}
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2">Escolha o Overload (%):</label>
            <input
              type="range"
              min="0"
              max="100"
              value={overloadPercentage}
              onChange={(e) => setOverloadPercentage(e.target.value)}
              className="w-full"
            />
            <p className="text-center text-gray-700 mt-2">{overloadPercentage}%</p>
          </div>

          {/* Botão para verificar todas as combinações */}
          <div className="text-center mb-8 text-black">
            <button
              onClick={verificarTodasCombinacoes}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-green-500 w-full md:w-auto"
            >
              {loading ? 'Carregando...' : 'Verificar Todas as Combinações'}
            </button>
          </div>

          {/* Exibir todas as combinações */}
          {combinationsResult.length > 0 && (
            <div className="mt-8 text-black">
              <h2 className="text-xl font-bold mb-4 text-center text-gray-800">Todas as Combinações</h2>
              {combinationsResult.map((combo, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded mb-4">
                  <p><strong>Módulo:</strong> {combo.modulo}</p>
                  <p><strong>Inversor:</strong> {combo.inversor}</p>
                  <p><strong>Compatível:</strong> {combo.compatibilidade ? 'Sim' : 'Não'}</p>
                  <p><strong>Módulos em Série:</strong> {combo.modulosSerie}</p>
                  <p><strong>Módulos em Paralelo:</strong> {combo.modulosParalelo}</p>
                  <p><strong>MPPTs Utilizados:</strong> {combo.mpptsUtilizados}</p>
                  <p><strong>Total de Módulos:</strong> {combo.totalModulos}</p>
                  <p><strong>Potência Total dos Módulos:</strong> {combo.potenciaTotalModulos} W</p>
                  <p><strong>Potência Máxima do Inversor:</strong> {Math.round(combo.potenciaInversorComOverloadSelecionado)} W</p>
                  <p><strong>Overload Utilizado:</strong> {Math.round(combo.overloadAplicavel)} %</p>
                  <p><strong>Overload Máximo Permitido:</strong> {combo.overloadMax}%</p>
                  {combo.erro && <p className="text-red-500"><strong>Erro:</strong> {combo.erro}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};
