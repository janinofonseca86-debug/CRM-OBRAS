
import React, { useState } from 'react';
import Modal from './Modal';
import { generateSchedule, analyzeRisks } from '../services/geminiService';
import type { Project, Schedule, Risk } from '../types';

type AITool = 'schedule' | 'risk';

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  tool: AITool;
  project?: Project;
}

const AIToolModal: React.FC<AIModalProps> = ({ isOpen, onClose, tool, project }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Schedule | Risk[] | null>(null);
  const [formData, setFormData] = useState({
    description: project?.description || '',
    duration: '90',
    startDate: project?.startDate || new Date().toISOString().split('T')[0],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      if (tool === 'schedule') {
        const schedule = await generateSchedule(formData.description, formData.duration, formData.startDate);
        setResult(schedule);
      } else if (tool === 'risk') {
        const risks = await analyzeRisks(formData.description);
        setResult(risks);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderResult = () => {
    if(!result) return null;

    if (tool === 'schedule' && 'phases' in result) {
      const schedule = result as Schedule;
      return (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Cronograma Sugerido</h4>
          {schedule.phases.map((phase, index) => (
            <div key={index} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
              <h5 className="font-bold text-indigo-600 dark:text-indigo-400">{phase.name} ({phase.duration})</h5>
              <ul className="list-disc list-inside mt-2 text-gray-600 dark:text-gray-300">
                {phase.tasks.map((task, taskIndex) => (
                  <li key={taskIndex}>{task}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );
    }

    if (tool === 'risk') {
      const risks = result as Risk[];
      return (
        <div className="space-y-3">
           <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Análise de Riscos</h4>
           <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" className="px-6 py-3">Risco</th>
                        <th scope="col" className="px-6 py-3">Probabilidade</th>
                        <th scope="col" className="px-6 py-3">Mitigação</th>
                    </tr>
                </thead>
                <tbody>
                    {risks.map((riskItem, index) => (
                        <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{riskItem.risk}</td>
                            <td className="px-6 py-4">{riskItem.probability}</td>
                            <td className="px-6 py-4">{riskItem.mitigation}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
           </div>
        </div>
      );
    }

    return null;
  };

  const title = tool === 'schedule' ? 'Gerador de Cronograma com IA' : 'Análise de Riscos com IA';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Descrição do Projeto</label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              placeholder="Ex: Construção de residência unifamiliar de 200m²..."
              required
            />
          </div>
          {tool === 'schedule' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="duration" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Duração (dias)</label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  required
                />
              </div>
              <div>
                <label htmlFor="startDate" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Data de Início</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  required
                />
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:focus:ring-indigo-800 disabled:opacity-50"
            >
              {isLoading ? 'Gerando...' : 'Gerar Análise'}
            </button>
          </div>
        </form>
        
        {isLoading && (
            <div className="flex items-center justify-center p-4">
                <div className="w-8 h-8 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin"></div>
                <p className="ml-3 text-gray-600 dark:text-gray-300">A IA está trabalhando... Isso pode levar alguns segundos.</p>
            </div>
        )}
        
        {error && <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">{error}</div>}
        
        {result && <div className="mt-6">{renderResult()}</div>}
      </div>
    </Modal>
  );
};

export default AIToolModal;
