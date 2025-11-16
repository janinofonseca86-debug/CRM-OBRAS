
export enum ProjectStatus {
  Planejado = 'Planejado',
  EmAndamento = 'Em Andamento',
  Concluido = 'Concluído',
  Atrasado = 'Atrasado',
}

export enum TaskStatus {
  AFazer = 'A Fazer',
  EmProgresso = 'Em Progresso',
  Feito = 'Feito',
}

export interface Client {
  id: string;
  name: string;
  contact: string;
  email: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  startDate?: string;
  dueDate?: string;
}

export interface Project {
  id: string;
  name: string;
  client: Client;
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  status: ProjectStatus;
  tasks: Task[];
}

export interface Schedule {
  phases: {
    name: string;
    duration: string;
    tasks: string[];
  }[];
}

export interface Risk {
    risk: string;
    probability: string;
    mitigation: string;
}