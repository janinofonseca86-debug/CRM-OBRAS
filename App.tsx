
import React, { useState, useMemo, useEffect } from 'react';
import type { Project, Client, Task } from './types';
import { ProjectStatus, TaskStatus } from './types';
import { DashboardIcon, ProjectIcon, AIToolsIcon, ChevronDownIcon, PlusIcon } from './components/icons';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import AIToolModal from './components/AIModal';

// MOCK DATA
const mockClients: Client[] = [
  { id: 'cli1', name: 'Construtora Alfa', contact: 'João Silva', email: 'joao@alfa.com' },
  { id: 'cli2', name: 'Família Martins', contact: 'Maria Martins', email: 'maria@martins.com' },
];

const mockProjects: Project[] = [
  {
    id: 'proj1',
    name: 'Residencial Viver Bem',
    client: mockClients[0],
    description: 'Construção de um edifício residencial de 10 andares com área de lazer completa. Foco em sustentabilidade e design moderno.',
    startDate: '2023-01-15',
    endDate: '2024-12-20',
    budget: 5000000,
    spent: 2350000,
    status: ProjectStatus.EmAndamento,
    tasks: [
      { id: 't1', title: 'Terraplanagem do terreno', description: '', status: TaskStatus.Feito, startDate: '2023-01-15', dueDate: '2023-02-10' },
      { id: 't2', title: 'Execução da fundação', description: '', status: TaskStatus.EmProgresso, startDate: '2023-02-11', dueDate: '2023-04-30' },
      { id: 't3', title: 'Levantamento da estrutura', description: '', status: TaskStatus.AFazer, startDate: '2023-05-01', dueDate: '2023-08-15' },
    ],
  },
  {
    id: 'proj2',
    name: 'Casa de Campo Martins',
    client: mockClients[1],
    description: 'Projeto de residência de alto padrão em condomínio fechado, com 4 suítes e piscina de borda infinita.',
    startDate: '2023-03-01',
    endDate: '2024-03-01',
    budget: 1200000,
    spent: 950000,
    status: ProjectStatus.Atrasado,
    tasks: [
      { id: 't4', title: 'Aprovação do projeto na prefeitura', description: '', status: TaskStatus.Feito, startDate: '2023-03-01', dueDate: '2023-03-30' },
      { id: 't5', title: 'Instalação hidráulica', description: 'Aguardando fornecedor de material', status: TaskStatus.AFazer, startDate: '2023-10-20', dueDate: '2023-11-20' },
    ],
  },
    {
    id: 'proj3',
    name: 'Reforma Comercial CenterShop',
    client: mockClients[0],
    description: 'Modernização da fachada e áreas comuns de um centro comercial. Obra noturna para não impactar o funcionamento.',
    startDate: '2024-06-01',
    endDate: '2024-09-30',
    budget: 800000,
    spent: 120000,
    status: ProjectStatus.Planejado,
    tasks: [],
  },
];


// HELPER COMPONENTS (defined outside to prevent re-renders)

const getStatusChipClass = (status: ProjectStatus | TaskStatus) => {
    switch (status) {
        case ProjectStatus.Concluido:
        case TaskStatus.Feito:
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        case ProjectStatus.EmAndamento:
        case TaskStatus.EmProgresso:
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        case ProjectStatus.Atrasado:
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        case ProjectStatus.Planejado:
        case TaskStatus.AFazer:
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
};

const getStatusDotClass = (status: ProjectStatus) => {
    switch (status) {
        case ProjectStatus.Concluido: return 'bg-green-500';
        case ProjectStatus.EmAndamento: return 'bg-blue-500';
        case ProjectStatus.Atrasado: return 'bg-red-500';
        case ProjectStatus.Planejado: return 'bg-yellow-500';
        default: return 'bg-gray-500';
    }
};

const StatusChip: React.FC<{ status: ProjectStatus | TaskStatus }> = ({ status }) => (
    <span className={`text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full ${getStatusChipClass(status)}`}>
        {status}
    </span>
);

const ProjectCard: React.FC<{ project: Project; onClick: () => void }> = ({ project, onClick }) => (
    <div onClick={onClick} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{project.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{project.client.name}</p>
            </div>
            <StatusChip status={project.status} />
        </div>
        <p className="mt-4 text-gray-600 dark:text-gray-300 text-sm truncate">{project.description}</p>
        <div className="mt-4">
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Orçamento</span>
                <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                    {((project.spent / project.budget) * 100).toFixed(0)}%
                </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${(project.spent / project.budget) * 100}%` }}></div>
            </div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
            <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.spent)}</span>
            <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.budget)}</span>
        </div>
    </div>
);

const GanttChart: React.FC<{ project: Project }> = ({ project }) => {
    const ganttData = useMemo(() => {
        const projectStart = new Date(project.startDate).getTime();
        return project.tasks
            .filter(task => task.startDate && task.dueDate)
            .map(task => {
                const taskStart = new Date(task.startDate as string).getTime();
                const taskEnd = new Date(task.dueDate as string).getTime();
                return {
                    title: task.title,
                    offset: taskStart - projectStart,
                    duration: taskEnd - taskStart,
                    status: task.status,
                    startDate: new Date(task.startDate as string).toLocaleDateString('pt-BR'),
                    endDate: new Date(task.dueDate as string).toLocaleDateString('pt-BR')
                };
            }).sort((a, b) => a.offset - b.offset); // Sort tasks by start date
    }, [project]);

    if (ganttData.length === 0) {
        return (
            <div className="flex items-center justify-center h-full min-h-[200px] bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">Não há tarefas com datas para exibir no cronograma.</p>
            </div>
        );
    }
    
    const projectStart = new Date(project.startDate).getTime();
    const projectEnd = new Date(project.endDate).getTime();
    const oneDay = 1000 * 60 * 60 * 24;

    const getBarColor = (status: TaskStatus) => {
        switch (status) {
            case TaskStatus.Feito: return '#10b981'; // green-500
            case TaskStatus.EmProgresso: return '#3b82f6'; // blue-500
            case TaskStatus.AFazer: return '#f59e0b'; // amber-500
            default: return '#6b7280'; // gray-500
        }
    };

    const dateFormatter = (tick: number) => {
        return new Date(tick).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    };

    const CustomTooltip: React.FC<any> = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg border border-gray-700">
                    <p className="font-bold">{data.title}</p>
                    <p className="text-sm">Início: {data.startDate}</p>
                    <p className="text-sm">Fim: {data.endDate}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{ width: '100%', height: 80 + ganttData.length * 50 }}>
            <ResponsiveContainer>
                <BarChart
                    data={ganttData}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
                    barCategoryGap="35%"
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                    <XAxis 
                        type="number" 
                        domain={[projectStart - oneDay, projectEnd + oneDay]} 
                        tickFormatter={dateFormatter}
                        stroke="#9ca3af"
                    />
                    <YAxis 
                        type="category" 
                        dataKey="title"
                        width={150} 
                        tick={{ fill: '#d1d5db', fontSize: 12 }} 
                        stroke="#9ca3af"
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(230, 230, 230, 0.1)'}} />
                    <Bar dataKey="offset" stackId="a" fill="transparent" />
                    <Bar dataKey="duration" stackId="a">
                        {ganttData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};


const ProjectDetailView: React.FC<{ project: Project; onBack: () => void }> = ({ project, onBack }) => {
    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <button onClick={onBack} className="text-indigo-600 dark:text-indigo-400 hover:underline mb-4">&larr; Voltar para todos os projetos</button>
            
            <header className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <div className="flex flex-col md:flex-row justify-between md:items-center">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">{project.name}</h1>
                        <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">{project.client.name}</p>
                    </div>
                    <div className="mt-4 md:mt-0">
                        <StatusChip status={project.status} />
                    </div>
                </div>
                <p className="mt-4 text-gray-600 dark:text-gray-300 max-w-3xl">{project.description}</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Tasks Section */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Tarefas</h2>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                {project.tasks.length > 0 ? project.tasks.map(task => (
                                    <li key={task.id} className="p-4 flex justify-between items-center">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{task.title}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{task.description}</p>
                                        </div>
                                        <StatusChip status={task.status} />
                                    </li>
                                )) : <p className="p-4 text-gray-500 dark:text-gray-400">Nenhuma tarefa cadastrada.</p>}
                            </ul>
                        </div>
                    </section>
                </div>

                <aside className="space-y-8">
                    {/* Gantt Chart Section */}
                    <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Cronograma do Projeto</h2>
                        <GanttChart project={project} />
                    </section>
                    
                    {/* Details Section */}
                    <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Detalhes</h2>
                         <dl className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-gray-500 dark:text-gray-400">Data de Início:</dt>
                                <dd className="font-medium text-gray-900 dark:text-white">{new Date(project.startDate).toLocaleDateString('pt-BR')}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-500 dark:text-gray-400">Data de Término:</dt>
                                <dd className="font-medium text-gray-900 dark:text-white">{new Date(project.endDate).toLocaleDateString('pt-BR')}</dd>
                            </div>
                             <div className="flex justify-between">
                                <dt className="text-gray-500 dark:text-gray-400">Contato Cliente:</dt>
                                <dd className="font-medium text-gray-900 dark:text-white">{project.client.contact}</dd>
                            </div>
                             <div className="flex justify-between">
                                <dt className="text-gray-500 dark:text-gray-400">Email Cliente:</dt>
                                <dd className="font-medium text-gray-900 dark:text-white">{project.client.email}</dd>
                            </div>

                            <hr className="border-gray-200 dark:border-gray-700 !my-4" />

                            <div className="flex justify-between">
                                <dt className="text-gray-500 dark:text-gray-400">Orçamento Total:</dt>
                                <dd className="font-medium text-gray-900 dark:text-white">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.budget)}
                                </dd>
                            </div>
                             <div className="flex justify-between">
                                <dt className="text-gray-500 dark:text-gray-400">Valor Gasto:</dt>
                                <dd className="font-medium text-red-600 dark:text-red-400">
                                     {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.spent)}
                                </dd>
                            </div>
                             <div className="flex justify-between">
                                <dt className="text-gray-500 dark:text-gray-400">Saldo Restante:</dt>
                                <dd className="font-medium text-green-600 dark:text-green-400">
                                     {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.budget - project.spent)}
                                </dd>
                            </div>
                        </dl>
                    </section>
                </aside>
            </div>
        </div>
    );
};

// MAIN APP COMPONENT

const App: React.FC = () => {
    const [projects] = useState<Project[]>(mockProjects);
    const [clients] = useState<Client[]>(mockClients);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [activeAiTool, setActiveAiTool] = useState<'schedule' | 'risk'>('schedule');
    const [isProjectsMenuOpen, setIsProjectsMenuOpen] = useState(false);
    const [filters, setFilters] = useState({
        status: 'All',
        clientId: 'All',
        startDate: '',
        endDate: '',
    });

    useEffect(() => {
        if (selectedProject) {
            setIsProjectsMenuOpen(true);
        }
    }, [selectedProject]);

    const projectStats = useMemo(() => {
        return projects.reduce((acc, project) => {
            acc[project.status] = (acc[project.status] || 0) + 1;
            return acc;
        }, {} as Record<ProjectStatus, number>);
    }, [projects]);

    const filteredProjects = useMemo(() => {
        return projects.filter(project => {
            if (filters.status !== 'All' && project.status !== filters.status) {
                return false;
            }
            if (filters.clientId !== 'All' && project.client.id !== filters.clientId) {
                return false;
            }
            // Add a day to dates to include the selected day in the range
            if (filters.startDate) {
                const filterStartDate = new Date(filters.startDate);
                filterStartDate.setUTCHours(0,0,0,0);
                const projectStartDate = new Date(project.startDate);
                 projectStartDate.setUTCHours(0,0,0,0);
                if (projectStartDate < filterStartDate) return false;
            }
            if (filters.endDate) {
                const filterEndDate = new Date(filters.endDate);
                filterEndDate.setUTCHours(0,0,0,0);
                const projectStartDate = new Date(project.startDate);
                projectStartDate.setUTCHours(0,0,0,0);
                if (projectStartDate > filterEndDate) return false;
            }
            return true;
        });
    }, [projects, filters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters({
            status: 'All',
            clientId: 'All',
            startDate: '',
            endDate: '',
        });
    };

    const openAiTool = (tool: 'schedule' | 'risk') => {
        setActiveAiTool(tool);
        setIsAiModalOpen(true);
    };

    const mainContent = selectedProject ? (
        <ProjectDetailView project={selectedProject} onBack={() => setSelectedProject(null)} />
    ) : (
        <div className="p-4 sm:p-6 lg:p-8">
            <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard de Projetos</h1>
                <button className="mt-4 sm:mt-0 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Novo Projeto
                </button>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {Object.values(ProjectStatus).map(status => (
                    <div key={status} className={`p-4 rounded-lg shadow bg-white dark:bg-gray-800`}>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{status}</h4>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{projectStats[status] || 0}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                        <select id="status" name="status" value={filters.status} onChange={handleFilterChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white">
                            <option value="All">Todos</option>
                            {Object.values(ProjectStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cliente</label>
                        <select id="clientId" name="clientId" value={filters.clientId} onChange={handleFilterChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white">
                            <option value="All">Todos</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Início Após</label>
                        <input type="date" id="startDate" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Início Antes de</label>
                        <input type="date" id="endDate" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" />
                    </div>
                    <button onClick={clearFilters} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 font-medium rounded-lg text-sm px-5 py-2.5 transition-colors">Limpar Filtros</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.length > 0 ? (
                    filteredProjects.map(p => (
                        <ProjectCard key={p.id} project={p} onClick={() => setSelectedProject(p)} />
                    ))
                ) : (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-10">
                        <p className="text-gray-500 dark:text-gray-400 text-lg">Nenhum projeto encontrado com os filtros aplicados.</p>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            <AIToolModal 
                isOpen={isAiModalOpen} 
                onClose={() => setIsAiModalOpen(false)} 
                tool={activeAiTool}
                project={selectedProject || undefined}
            />
            <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 shadow-lg flex flex-col">
                <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
                    <ProjectIcon className="h-8 w-8 text-indigo-500" />
                    <h1 className="ml-3 text-xl font-bold text-gray-900 dark:text-white">ObraCRM</h1>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2">
                    <a href="#"
                       onClick={(e) => {
                           e.preventDefault();
                           setSelectedProject(null);
                       }}
                       className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                           !selectedProject
                               ? 'text-gray-700 bg-gray-200 dark:bg-gray-700 dark:text-white'
                               : 'text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'
                       }`}
                    >
                        <DashboardIcon className="h-5 w-5" />
                        <span className="ml-3">Dashboard</span>
                    </a>
                    
                    <div>
                        <button onClick={() => setIsProjectsMenuOpen(!isProjectsMenuOpen)} className="w-full flex items-center justify-between px-4 py-2 text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg text-left transition-colors">
                            <span className="flex items-center">
                                <ProjectIcon className="h-5 w-5" />
                                <span className="ml-3">Projetos</span>
                            </span>
                            <ChevronDownIcon className={`w-5 h-5 transition-transform duration-200 ${isProjectsMenuOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isProjectsMenuOpen && (
                            <div className="mt-2 space-y-1 ml-4 pl-4 border-l border-gray-200 dark:border-gray-600">
                                {projects.map(p => (
                                    <a
                                        key={p.id}
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setSelectedProject(p);
                                        }}
                                        className={`flex items-center w-full px-2 py-1.5 text-sm rounded-lg transition-colors ${
                                            selectedProject?.id === p.id
                                                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 font-medium'
                                                : 'text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        <span className={`w-2 h-2 mr-3 rounded-full flex-shrink-0 ${getStatusDotClass(p.status)}`}></span>
                                        <span className="truncate">{p.name}</span>
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                     <div className="pt-4">
                        <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ferramentas IA</h3>
                        <div className="mt-2 space-y-1">
                            <button onClick={() => openAiTool('schedule')} className="w-full flex items-center px-4 py-2 text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg text-left">
                                <AIToolsIcon className="h-5 w-5" />
                                <span className="ml-3">Gerar Cronograma</span>
                            </button>
                            <button onClick={() => openAiTool('risk')} className="w-full flex items-center px-4 py-2 text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg text-left">
                                <AIToolsIcon className="h-5 w-5" />
                                <span className="ml-3">Análise de Risco</span>
                            </button>
                        </div>
                    </div>
                </nav>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                     <a href="#" className="flex items-center justify-between w-full p-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">
                        <div className="flex items-center">
                            <img className="h-8 w-8 rounded-full object-cover" src="https://picsum.photos/100/100" alt="User" />
                            <span className="ml-3">Admin</span>
                        </div>
                        <ChevronDownIcon className="w-5 h-5"/>
                    </a>
                </div>
            </aside>
            <main className="flex-1 overflow-y-auto">
                {mainContent}
            </main>
        </div>
    );
};

export default App;
