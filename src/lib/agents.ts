export const DEFAULT_AGENT_ID = "mojo-trader";

export interface CustomAgent {
  id: string;
  name: string;
  description?: string;
  avatar?: string | null;
  systemPrompt: string;
  createdAt: number;
}

export type Agent = {
  id: string;
  name: string;
  description?: string;
  avatar?: string | null;
  systemPrompt?: string;
};

const CUSTOM_AGENTS_KEY = "mojo_trader_custom_agents";
const SELECTED_AGENT_KEY = "mojo_trader_selected_agent";

function loadCustomAgents(): CustomAgent[] {
  try {
    const raw = localStorage.getItem(CUSTOM_AGENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCustomAgents(agents: CustomAgent[]) {
  localStorage.setItem(CUSTOM_AGENTS_KEY, JSON.stringify(agents));
}

export function getCustomAgents(): CustomAgent[] {
  return loadCustomAgents();
}

export function getDefaultAgent(): Agent {
  return {
    id: DEFAULT_AGENT_ID,
    name: "Mojo Trader",
    description: "Autonomous Pump.fun trading monkey running on a Mac Mini M3",
    avatar: undefined,
    systemPrompt: undefined,
  };
}

export function getAllAgents(): Agent[] {
  const defaultAgent = getDefaultAgent();
  const custom = loadCustomAgents().map((a) => ({
    id: a.id,
    name: a.name,
    description: a.description,
    avatar: a.avatar ?? null,
    systemPrompt: a.systemPrompt,
  }));
  return [defaultAgent, ...custom];
}

export function getAgentById(id: string): Agent | null {
  if (id === DEFAULT_AGENT_ID) return getDefaultAgent();
  const custom = loadCustomAgents().find((a) => a.id === id);
  if (!custom) return null;
  return {
    id: custom.id,
    name: custom.name,
    description: custom.description,
    avatar: custom.avatar ?? null,
    systemPrompt: custom.systemPrompt,
  };
}

export function getSelectedAgentId(): string {
  const id = localStorage.getItem(SELECTED_AGENT_KEY);
  if (id && (id === DEFAULT_AGENT_ID || getAgentById(id))) return id;
  return DEFAULT_AGENT_ID;
}

export function setSelectedAgentId(id: string) {
  if (id === DEFAULT_AGENT_ID || getAgentById(id)) {
    localStorage.setItem(SELECTED_AGENT_KEY, id);
  }
}

/** Returns the system prompt to send to the API, or null to use backend default (Mojo Trader). */
export function getEffectiveSystemPrompt(): string | null {
  const id = getSelectedAgentId();
  if (id === DEFAULT_AGENT_ID) return null;
  const agent = getAgentById(id);
  return agent?.systemPrompt ?? null;
}

export function saveCustomAgent(agent: Omit<CustomAgent, "id" | "createdAt">): CustomAgent {
  const list = loadCustomAgents();
  const id =
    agent.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "") +
    "-" +
    Date.now();
  const created: CustomAgent = {
    id,
    name: agent.name,
    description: agent.description,
    avatar: agent.avatar ?? null,
    systemPrompt: agent.systemPrompt,
    createdAt: Date.now(),
  };
  list.push(created);
  saveCustomAgents(list);
  return created;
}

export function updateCustomAgent(
  id: string,
  patch: Partial<Omit<CustomAgent, "id" | "createdAt">>
): CustomAgent | null {
  const list = loadCustomAgents();
  const idx = list.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...patch };
  saveCustomAgents(list);
  return list[idx];
}

export function deleteCustomAgent(id: string): boolean {
  if (id === DEFAULT_AGENT_ID) return false;
  const list = loadCustomAgents().filter((a) => a.id !== id);
  if (list.length === loadCustomAgents().length) return false;
  saveCustomAgents(list);
  if (getSelectedAgentId() === id) {
    setSelectedAgentId(DEFAULT_AGENT_ID);
  }
  return true;
}
