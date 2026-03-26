```mermaid

flowchart LR

%% ═══════════════════════════════════════════
%%  ATORES
%% ═══════════════════════════════════════════
ATD(["👤 Atendente"])
GER(["👤 Gerente"])
GG(["👤 Gerente Geral"])
ADM(["👤 Administrador"])
SIS(["⚙️ Sistema"])

%% Generalização
ATD -->|herda| GER
GER -->|herda| ADM

%% ═══════════════════════════════════════════
%%  SISTEMA AGRUPADO
%% ═══════════════════════════════════════════
subgraph SGL["Sistema de Gestão de Leads"]

  direction TB

  %% Linha 1 - Autenticação
  subgraph PKG_AUTH["Autenticação e Perfil"]
    direction TB
    UC_LOGIN["Autenticar-se no Sistema"]
    UC_UPD_CRED["Atualizar Credenciais"]
    UC_JWT[/"《include》Validar Token JWT"/]
    UC_LOGIN -.->|include| UC_JWT
  end

  %% Linha 2 - Leads
  subgraph PKG_LEAD["Gestão de Leads"]
    direction TB
    UC_CREATE_LEAD["Registrar Lead"]
    UC_CANAL_ORIGEM[/"《include》Registrar Canal de Origem"/]
    UC_VINCULAR_LEAD[/"《include》Vincular Lead a Loja/Atendente"/]
    UC_CREATE_LEAD -.-> UC_CANAL_ORIGEM
    UC_CREATE_LEAD -.-> UC_VINCULAR_LEAD
    UC_LIST_LEAD_OWN["Listar Leads Próprios"]
    UC_EDIT_LEAD_OWN["Editar Lead Próprio"]
    UC_LIST_LEAD_TEAM["Listar Leads da Equipe"]
    UC_EDIT_LEAD_TEAM["Editar Lead da Equipe"]
    UC_REATRIBUIR_LEAD["Reatribuir Lead"]
    UC_LEAD_ADMIN["Gerenciar Leads (CRUD Completo)"]
  end

  %% Linha 3 - Clientes
  subgraph PKG_CLI["Gestão de Clientes"]
    direction TB
    UC_CREATE_CLI["Registrar Cliente"]
    UC_ASSOC_CLI_LEAD[/"《include》Associar Cliente a Lead"/]
    UC_CREATE_CLI -.-> UC_ASSOC_CLI_LEAD
    UC_UPD_CLI["Atualizar Cliente"]
    UC_CLI_ADMIN["Gerenciar Clientes (CRUD Completo)"]
  end

  %% Linha 4 - Negociações
  subgraph PKG_NEG["Gestão de Negociações"]
    direction TB
    UC_CREATE_NEG["Criar Negociação"]
    UC_STAGE_NEG["Atualizar Estágio"]
    UC_STATUS_NEG["Alterar Status"]
    UC_CLOSE_NEG["Encerrar Negociação"]

    %% 🔧 ADIÇÕES RF03
    UC_SET_IMPORTANCIA["Definir Importância (Frio/Morno/Quente)"]
    UC_SET_OPEN["Definir como Aberta"]
    UC_VALIDATE_UNIQUE_NEG[/"《include》Validar 1 Negociação Ativa por Lead"/]

    UC_CREATE_NEG -.-> UC_VALIDATE_UNIQUE_NEG

    UC_MOTIVO_FIN[/"《include》Motivo de Finalização"/]
    UC_HIST_NEG[/"《include》Histórico de Mudanças"/]

    UC_CLOSE_NEG -.-> UC_MOTIVO_FIN
    UC_STAGE_NEG -.-> UC_HIST_NEG
    UC_STATUS_NEG -.-> UC_HIST_NEG
    UC_CLOSE_NEG -.-> UC_HIST_NEG
  end

  %% Linha 5 - Dashboards
  subgraph PKG_DASH["Dashboards e Análises"]
    direction TB
    UC_DASH_OP["Consultar Dashboard Operacional"]
    UC_DASH_TEAM["Consultar Dashboard da Equipe"]
    UC_DASH_GLOBAL["Consultar Dashboard Global"]

    %% 🔧 ADIÇÕES RF04/RF05
    UC_METRIC_CONV[/"《include》Taxa de Conversão"/]
    UC_METRIC_TIME[/"《include》Tempo Médio de Atendimento"/]
    UC_METRIC_IMPORT[/"《include》Leads por Importância"/]
    UC_METRIC_STORE[/"《include》Leads por Loja"/]

    UC_DASH_OP -.-> UC_METRIC_IMPORT
    UC_DASH_GLOBAL -.-> UC_METRIC_STORE
    UC_DASH_OP -.-> UC_METRIC_STORE
    UC_DASH_TEAM -.-> UC_METRIC_STORE
    UC_DASH_TEAM -.-> UC_METRIC_CONV
    UC_DASH_GLOBAL -.-> UC_METRIC_CONV
    UC_DASH_GLOBAL -.-> UC_METRIC_TIME

    UC_FILTER[/"《include》Aplicar Filtro Temporal"/]

    %% 🔧 ADIÇÕES RF06
    UC_VALIDATE_FILTER[/"《include》Validar Período (Regra 1 Ano)"/]
    UC_FILTER -.-> UC_VALIDATE_FILTER

    UC_DASH_OP -.-> UC_FILTER
    UC_DASH_TEAM -.-> UC_FILTER
    UC_DASH_GLOBAL -.-> UC_FILTER
  end

  %% Linha 6 - Equipes e Usuários
  subgraph PKG_TEAM["Gestão de Equipes e Usuários"]
    direction TB
    UC_VINCULAR_ATD["Vincular Atendente"]
    UC_USER_ADMIN["Gerenciar Usuários (CRUD Completo)"]
    UC_TEAM_ADMIN["Gerenciar Equipes (CRUD Completo)"]
  end

  %% Linha 7 - Auditoria
  subgraph PKG_AUDIT["Auditoria"]
    direction TB
    UC_LOGS["Visualizar Logs"]
    UC_AUDIT[/"《include》Registrar Evento de Auditoria"/]
  end

  %% 🔧 ADIÇÃO GLOBAL (RBAC explícito leve)
  UC_VALIDATE_RBAC[/"《include》Validar Permissão (RBAC)"/]

end

%% ═══════════════════════════════════════════
%%  ASSOCIAÇÕES — ATORES
%% ═══════════════════════════════════════════

ATD --> UC_LOGIN
ATD --> UC_UPD_CRED
ATD --> UC_CREATE_LEAD
ATD --> UC_LIST_LEAD_OWN
ATD --> UC_EDIT_LEAD_OWN
ATD --> UC_CREATE_CLI
ATD --> UC_UPD_CLI
ATD --> UC_CREATE_NEG
ATD --> UC_STAGE_NEG
ATD --> UC_STATUS_NEG
ATD --> UC_CLOSE_NEG
ATD --> UC_SET_IMPORTANCIA
ATD --> UC_DASH_OP

GER --> UC_LIST_LEAD_TEAM
GER --> UC_EDIT_LEAD_TEAM
GER --> UC_REATRIBUIR_LEAD
GER --> UC_DASH_TEAM
GER --> UC_VINCULAR_ATD

GG --> UC_DASH_GLOBAL
GG --> UC_LIST_LEAD_TEAM
GG --> UC_LOGIN
GG --> UC_UPD_CRED

ADM --> UC_USER_ADMIN
ADM --> UC_TEAM_ADMIN
ADM --> UC_LEAD_ADMIN
ADM --> UC_CLI_ADMIN
ADM --> UC_LOGS
ADM --> UC_DASH_GLOBAL

%% Sistema
SIS --> UC_AUDIT

%% Auditoria
UC_AUDIT -.-> UC_CREATE_LEAD
UC_AUDIT -.-> UC_CREATE_NEG
UC_AUDIT -.-> UC_CREATE_CLI
UC_AUDIT -.-> UC_USER_ADMIN
UC_AUDIT -.-> UC_TEAM_ADMIN
UC_AUDIT -.-> UC_LOGIN
UC_AUDIT -.-> UC_EDIT_LEAD_OWN
UC_AUDIT -.-> UC_EDIT_LEAD_TEAM
UC_AUDIT -.-> UC_LEAD_ADMIN
UC_AUDIT -.-> UC_STAGE_NEG
UC_AUDIT -.-> UC_STATUS_NEG
UC_AUDIT -.-> UC_CLOSE_NEG
UC_AUDIT -.-> UC_UPD_CLI
UC_AUDIT -.-> UC_CLI_ADMIN

%% 🔧 RBAC aplicado em operações críticas
UC_CREATE_LEAD -.-> UC_VALIDATE_RBAC
UC_EDIT_LEAD_OWN -.-> UC_VALIDATE_RBAC
UC_EDIT_LEAD_TEAM -.-> UC_VALIDATE_RBAC
UC_CREATE_NEG -.-> UC_VALIDATE_RBAC
UC_USER_ADMIN -.-> UC_VALIDATE_RBAC
UC_TEAM_ADMIN -.-> UC_VALIDATE_RBAC
UC_CLI_ADMIN -.-> UC_VALIDATE_RBAC
