export type RawNucleiNode = {
  id: string;
  label: string;
  role: 'nucleus' | 'satellite';
  clusterId: string;
  color: string;
  val: number;
  satelliteCount?: number;
  kind?: string;
  systemCode?: string;
  originalGroup?: string;
  systemType?: string;
  dataZone?: string;
  feeds?: string;
};

export type RawNucleiLink = {
  source: string;
  target: string;
  type: 'intra' | 'inter';
  style: 'solid' | 'faded';
  relationship: string;
  opacity: number;
};

export const rawNucleiNodes: RawNucleiNode[] = [
  { id: 'nuc::intake', label: 'Policy & File Intake', role: 'nucleus', clusterId: 'nuc::intake', color: '#a855f7', val: 18, satelliteCount: 6 },
  { id: 'sys::SUNFIRE', label: 'SunFire Policy System', role: 'satellite', clusterId: 'nuc::intake', kind: 'system', color: '#5eead4', val: 6, systemCode: 'SUNFIRE', originalGroup: 'External Source Policy Systems', systemType: 'External Policy System', dataZone: 'Source Data (External)', feeds: 'Policy data' },
  { id: 'sys::AGILITY', label: 'Agility Policy System', role: 'satellite', clusterId: 'nuc::intake', kind: 'system', color: '#5eead4', val: 6, systemCode: 'AGILITY', originalGroup: 'External Source Policy Systems', systemType: 'External Policy System', dataZone: 'Source Data (External)', feeds: 'Policy data' },
  { id: 'sys::PROFORMEX', label: 'Proformex Policy System', role: 'satellite', clusterId: 'nuc::intake', kind: 'system', color: '#5eead4', val: 6, systemCode: 'PROFORMEX', originalGroup: 'External Source Policy Systems', systemType: 'External Policy System', dataZone: 'Source Data (External)', feeds: 'Policy data' },
  { id: 'sys::FILE_PROD', label: 'Production Files', role: 'satellite', clusterId: 'nuc::intake', kind: 'system', color: '#5eead4', val: 6, systemCode: 'FILE_PROD', originalGroup: 'Files (SFTP, Email)', systemType: 'File / SFTP', dataZone: 'Source Data (External)', feeds: 'Production data' },
  { id: 'sys::FILE_HIER', label: 'Hierarchy Files', role: 'satellite', clusterId: 'nuc::intake', kind: 'system', color: '#5eead4', val: 6, systemCode: 'FILE_HIER', originalGroup: 'Files (SFTP, Email)', systemType: 'File / SFTP', dataZone: 'Source Data (External)', feeds: 'Hierarchy data' },
  { id: 'sys::FILE_AGENT', label: 'Agent Files', role: 'satellite', clusterId: 'nuc::intake', kind: 'system', color: '#5eead4', val: 6, systemCode: 'FILE_AGENT', originalGroup: 'Files (SFTP, Email)', systemType: 'File / SFTP', dataZone: 'Source Data (External)', feeds: 'Agent data' },

  { id: 'nuc::comm_fin', label: 'Commission & Finance', role: 'nucleus', clusterId: 'nuc::comm_fin', color: '#a855f7', val: 18, satelliteCount: 8 },
  { id: 'sys::FILE_COMM', label: 'Commission Files', role: 'satellite', clusterId: 'nuc::comm_fin', kind: 'system', color: '#5eead4', val: 6, systemCode: 'FILE_COMM', originalGroup: 'Files (SFTP, Email)', systemType: 'File / SFTP', dataZone: 'Source Data (External)', feeds: 'Commission data' },
  { id: 'sys::COMULATE', label: 'Comulate API', role: 'satellite', clusterId: 'nuc::comm_fin', kind: 'system', color: '#5eead4', val: 6, systemCode: 'COMULATE', originalGroup: 'API Applications', systemType: 'API / Integration', dataZone: 'Source Data (External)', feeds: 'Commission data via API' },
  { id: 'sys::VUE_COMM', label: 'VUE Commission Platform', role: 'satellite', clusterId: 'nuc::comm_fin', kind: 'system', color: '#5eead4', val: 6, systemCode: 'VUE_COMM', originalGroup: 'Commission Systems', systemType: 'Commission Platform (DB)', dataZone: 'Enterprise Applications (Internal)', feeds: 'Commission processing' },
  { id: 'sys::VARICENT', label: 'Varicent Commission', role: 'satellite', clusterId: 'nuc::comm_fin', kind: 'system', color: '#5eead4', val: 6, systemCode: 'VARICENT', originalGroup: 'Commission Systems', systemType: 'Commission Platform', dataZone: 'Enterprise Applications (Internal)', feeds: 'Commission calculations/statements' },
  { id: 'sys::FDM', label: 'Finance Commission Platform', role: 'satellite', clusterId: 'nuc::comm_fin', kind: 'system', color: '#5eead4', val: 6, systemCode: 'FDM', originalGroup: 'Financial Systems', systemType: 'Finance Platform', dataZone: 'Banking / Cash mgmt / Commission Recon via API', feeds: 'Commission calculations and statements' },
  { id: 'sys::ORACLE_FUS', label: 'Oracle Fusion ERP', role: 'satellite', clusterId: 'nuc::comm_fin', kind: 'system', color: '#5eead4', val: 6, systemCode: 'ORACLE_FUS', originalGroup: 'Financial Systems / HR', systemType: 'ERP / Finance', dataZone: 'Enterprise Applications (Internal)', feeds: 'GL, Finance, HR' },
  { id: 'sys::ONESTREAM', label: 'OneStream Financial', role: 'satellite', clusterId: 'nuc::comm_fin', kind: 'system', color: '#5eead4', val: 6, systemCode: 'ONESTREAM', originalGroup: 'Financial Systems / HR', systemType: 'ERP / Finance', dataZone: 'Enterprise Applications (Internal)', feeds: 'Financial consolidation/reporting' },
  { id: 'sys::TROVATA', label: 'Trovata Banking API', role: 'satellite', clusterId: 'nuc::comm_fin', kind: 'system', color: '#5eead4', val: 6, systemCode: 'TROVATA', originalGroup: 'API Applications', systemType: 'API / Integration', dataZone: 'Source Data (External)', feeds: 'Banking / Cash management via API' },

  { id: 'nuc::contract', label: 'Contracting & Licensing', role: 'nucleus', clusterId: 'nuc::contract', color: '#a855f7', val: 18, satelliteCount: 5 },
  { id: 'sys::FILE_CONTR', label: 'Contract Files', role: 'satellite', clusterId: 'nuc::contract', kind: 'system', color: '#5eead4', val: 6, systemCode: 'FILE_CONTR', originalGroup: 'Files (SFTP, Email)', systemType: 'File / SFTP', dataZone: 'Source Data (External)', feeds: 'Contract data' },
  { id: 'sys::SAT', label: 'SAT Contracting Platform', role: 'satellite', clusterId: 'nuc::contract', kind: 'system', color: '#5eead4', val: 6, systemCode: 'SAT', originalGroup: 'Contracting Systems', systemType: 'Contracting Platform (DB)', dataZone: 'Enterprise Applications (Internal)', feeds: 'Contract data' },
  { id: 'sys::VUE_CONTR', label: 'VUE Contracting Platform', role: 'satellite', clusterId: 'nuc::contract', kind: 'system', color: '#5eead4', val: 6, systemCode: 'VUE_CONTR', originalGroup: 'Contracting Systems', systemType: 'Contracting Platform (DB)', dataZone: 'Enterprise Applications (Internal)', feeds: 'Contract data' },
  { id: 'sys::AGENTSYNC', label: 'AgentSync Contracting', role: 'satellite', clusterId: 'nuc::contract', kind: 'system', color: '#5eead4', val: 6, systemCode: 'AGENTSYNC', originalGroup: 'Contracting Systems', systemType: 'Contracting Platform', dataZone: 'Enterprise Applications (Internal)', feeds: 'Agent licensing & contracting' },
  { id: 'sys::FILE_RTS', label: 'RTS Certs License Appt Files', role: 'satellite', clusterId: 'nuc::contract', kind: 'system', color: '#5eead4', val: 6, systemCode: 'FILE_RTS', originalGroup: 'Files (SFTP, Email)', systemType: 'File / SFTP', dataZone: 'Source Data (External)', feeds: 'Certs, License, Appointments' },

  { id: 'nuc::crm', label: 'CRM, Lead & Engagement', role: 'nucleus', clusterId: 'nuc::crm', color: '#a855f7', val: 18, satelliteCount: 7 },
  { id: 'sys::KIZEN', label: 'Kizen CRM', role: 'satellite', clusterId: 'nuc::crm', kind: 'system', color: '#5eead4', val: 6, systemCode: 'KIZEN', originalGroup: 'CRM / AMS Systems', systemType: 'CRM / AMS', dataZone: 'Enterprise Applications (Internal)', feeds: 'Agent Contact, Campaign, Leads' },
  { id: 'sys::LEADPERF', label: 'LeadPerfection CRM', role: 'satellite', clusterId: 'nuc::crm', kind: 'system', color: '#5eead4', val: 6, systemCode: 'LEADPERF', originalGroup: 'CRM / AMS Systems', systemType: 'CRM / AMS', dataZone: 'Enterprise Applications (Internal)', feeds: 'Lead management' },
  { id: 'sys::ONEHQ', label: 'OneHQ Agent Management', role: 'satellite', clusterId: 'nuc::crm', kind: 'system', color: '#5eead4', val: 6, systemCode: 'ONEHQ', originalGroup: 'CRM / AMS Systems', systemType: 'CRM / AMS', dataZone: 'Enterprise Applications (Internal)', feeds: 'Agent management, One Portal' },
  { id: 'sys::HUBSPOT', label: 'HubSpot Marketing', role: 'satellite', clusterId: 'nuc::crm', kind: 'system', color: '#5eead4', val: 6, systemCode: 'HUBSPOT', originalGroup: 'Marketing / Lead Systems', systemType: 'Marketing Automation', dataZone: 'Enterprise Applications (Internal)', feeds: 'Marketing, Lead nurturing' },
  { id: 'sys::LEADSTAR', label: 'Lead Star', role: 'satellite', clusterId: 'nuc::crm', kind: 'system', color: '#5eead4', val: 6, systemCode: 'LEADSTAR', originalGroup: 'Marketing / Lead Systems', systemType: 'Lead Management', dataZone: 'Enterprise Applications (Internal)', feeds: 'Leads' },
  { id: 'sys::AVAYA', label: 'AVAYA Telephony', role: 'satellite', clusterId: 'nuc::crm', kind: 'system', color: '#5eead4', val: 6, systemCode: 'AVAYA', originalGroup: 'Calls', systemType: 'Telephony / Call Center', dataZone: 'Enterprise Applications (Internal)', feeds: 'Call data' },
  { id: 'sys::RINGCENTRAL', label: 'RingCentral UCaaS', role: 'satellite', clusterId: 'nuc::crm', kind: 'system', color: '#5eead4', val: 6, systemCode: 'RINGCENTRAL', originalGroup: 'Calls', systemType: 'Telephony / Call Center', dataZone: 'Enterprise Applications (Internal)', feeds: 'Call data / UCaaS' },

  { id: 'nuc::master', label: 'Master & Staging Data', role: 'nucleus', clusterId: 'nuc::master', color: '#a855f7', val: 18, satelliteCount: 5 },
  { id: 'sys::MDS_WORKDAY', label: 'Workday MDS', role: 'satellite', clusterId: 'nuc::master', kind: 'system', color: '#5eead4', val: 6, systemCode: 'MDS_WORKDAY', originalGroup: 'Mastered Entities (MDS)', systemType: 'Master Data Source', dataZone: 'Enterprise Applications (Internal)', feeds: 'Employees, Marketers, Principals' },
  { id: 'sys::MDS_ORACLE', label: 'Oracle MDS', role: 'satellite', clusterId: 'nuc::master', kind: 'system', color: '#5eead4', val: 6, systemCode: 'MDS_ORACLE', originalGroup: 'Mastered Entities (MDS)', systemType: 'Master Data Source', dataZone: 'Enterprise Applications (Internal)', feeds: 'Carriers, Affiliates, Products' },
  { id: 'sys::MDS_OTHER', label: 'Other MDS', role: 'satellite', clusterId: 'nuc::master', kind: 'system', color: '#5eead4', val: 6, systemCode: 'MDS_OTHER', originalGroup: 'Mastered Entities (MDS)', systemType: 'Master Data Source', dataZone: 'Enterprise Applications (Internal)', feeds: 'Agents, Customers, JEs' },
  { id: 'sys::AMLSTATING', label: 'AML Stating Database', role: 'satellite', clusterId: 'nuc::master', kind: 'system', color: '#5eead4', val: 6, systemCode: 'AMLSTATING', originalGroup: 'SQL Server Source', systemType: 'SQL Server DB', dataZone: 'Source Data (Internal)', feeds: 'Staging source data' },
  { id: 'sys::EDM_CONSOL', label: 'EDM Consolidation Database', role: 'satellite', clusterId: 'nuc::master', kind: 'system', color: '#5eead4', val: 6, systemCode: 'EDM_CONSOL', originalGroup: 'SQL Server Source', systemType: 'SQL Server DB', dataZone: 'Source Data (Internal)', feeds: 'Consolidation source data' },
];

export const rawNucleiLinks: RawNucleiLink[] = [
  { source: 'sys::SUNFIRE', target: 'nuc::intake', type: 'intra', style: 'solid', relationship: 'belongs_to', opacity: 0.9 },
  { source: 'sys::AGILITY', target: 'nuc::intake', type: 'intra', style: 'solid', relationship: 'belongs_to', opacity: 0.9 },
  { source: 'sys::PROFORMEX', target: 'nuc::intake', type: 'intra', style: 'solid', relationship: 'belongs_to', opacity: 0.9 },
  { source: 'sys::FILE_PROD', target: 'nuc::intake', type: 'intra', style: 'solid', relationship: 'belongs_to', opacity: 0.9 },
  { source: 'sys::FILE_HIER', target: 'nuc::intake', type: 'intra', style: 'solid', relationship: 'belongs_to', opacity: 0.9 },
  { source: 'sys::FILE_AGENT', target: 'nuc::intake', type: 'intra', style: 'solid', relationship: 'belongs_to', opacity: 0.9 },
  { source: 'sys::FILE_COMM', target: 'nuc::comm_fin', type: 'intra', style: 'solid', relationship: 'belongs_to', opacity: 0.9 },
  { source: 'sys::COMULATE', target: 'nuc::comm_fin', type: 'intra', style: 'solid', relationship: 'belongs_to', opacity: 0.9 },
  { source: 'sys::VUE_COMM', target: 'nuc::comm_fin', type: 'intra', style: 'solid', relationship: 'belongs_to', opacity: 0.9 },
  { source: 'sys::VARICENT', target: 'nuc::comm_fin', type: 'intra', style: 'solid', relationship: 'belongs_to', opacity: 0.9 },
  { source: 'sys::FDM', target: 'nuc::comm_fin', type: 'intra', style: 'solid', relationship: 'belongs_to', opacity: 0.9 },
  { source: 'sys::ORACLE_FUS', target: 'nuc::comm_fin', type: 'intra', style: 'solid', relationship: 'belongs_to', opacity: 0.9 },
  { source: 'sys::ONESTREAM', target: 'nuc::comm_fin', type: 'intra', style: 'solid', relationship: 'belongs_to', opacity: 0.9 },
  { source: 'sys::TROVATA', target: 'nuc::comm_fin', type: 'intra', style: 'solid', relationship: 'belongs_to', opacity: 0.9 },
  { source: 'sys::FILE_CONTR', target: 'nuc::contract', type: 'intra', style: 'solid', relationship: 'belongs_to', opacity: 0.9 },
  { source: 'sys::SAT', target: 'nuc::contract', type: 'intra', style: 'solid', relationship: 'belongs_to', opacity: 0.9 },
  { source: 'sys::VUE_CONTR', target: 'nuc::contract', type: 'intra', style: 'solid', relationship: 'belongs_to', opacity: 0.9 },
  { source: 'sys::AGENTSYNC', target: 'nuc::contract', type: 'intra', style: 'solid', relationship: 'belongs_to', opacity: 0.9 },
  { source: 'sys::FILE_RTS', target: 'nuc::contract', type: 'intra', style: 'solid', relationship: 'belongs_to', opacity: 0.9 },
  { source: 'sys::KIZEN', target: 'nuc::crm', type: 'intra', style: 'solid', relationship: 'belongs_to', opacity: 0.9 },
  { source: 'sys::LEADPERF', target: 'nuc::crm', type: 'intra', style: 'solid', relationship: 'belongs_to', opacity: 0.9 },
  { source: 'sys::ONEHQ', target: 'nuc::crm', type: 'intra', style: 'solid', relationship: 'belongs_to', opacity: 0.9 },
  { source: 'sys::HUBSPOT', target: 'nuc::crm', type: 'intra', style: 'solid', relationship: 'belongs_to', opacity: 0.9 },
  { source: 'sys::LEADSTAR', target: 'nuc::crm', type: 'intra', style: 'solid', relationship: 'belongs_to', opacity: 0.9 },
  { source: 'sys::AVAYA', target: 'nuc::crm', type: 'intra', style: 'solid', relationship: 'belongs_to', opacity: 0.9 },
  { source: 'sys::RINGCENTRAL', target: 'nuc::crm', type: 'intra', style: 'solid', relationship: 'belongs_to', opacity: 0.9 },
  { source: 'sys::MDS_WORKDAY', target: 'nuc::master', type: 'intra', style: 'solid', relationship: 'belongs_to', opacity: 0.9 },
  { source: 'sys::MDS_ORACLE', target: 'nuc::master', type: 'intra', style: 'solid', relationship: 'belongs_to', opacity: 0.9 },
  { source: 'sys::MDS_OTHER', target: 'nuc::master', type: 'intra', style: 'solid', relationship: 'belongs_to', opacity: 0.9 },
  { source: 'sys::AMLSTATING', target: 'nuc::master', type: 'intra', style: 'solid', relationship: 'belongs_to', opacity: 0.9 },
  { source: 'sys::EDM_CONSOL', target: 'nuc::master', type: 'intra', style: 'solid', relationship: 'belongs_to', opacity: 0.9 },

  { source: 'nuc::intake', target: 'nuc::crm', type: 'inter', style: 'faded', relationship: 'leads → policies / shared: Agent', opacity: 0.18 },
  { source: 'nuc::intake', target: 'nuc::comm_fin', type: 'inter', style: 'faded', relationship: 'policies → commissions', opacity: 0.18 },
  { source: 'nuc::comm_fin', target: 'nuc::contract', type: 'inter', style: 'faded', relationship: 'contracts → commissions', opacity: 0.18 },
  { source: 'nuc::intake', target: 'nuc::master', type: 'inter', style: 'faded', relationship: 'master data / shared: Agent', opacity: 0.18 },
  { source: 'nuc::master', target: 'nuc::comm_fin', type: 'inter', style: 'faded', relationship: 'master data', opacity: 0.18 },
  { source: 'nuc::master', target: 'nuc::contract', type: 'inter', style: 'faded', relationship: 'master data / shared: Agent', opacity: 0.18 },
  { source: 'nuc::master', target: 'nuc::crm', type: 'inter', style: 'faded', relationship: 'master data / shared: Agent', opacity: 0.18 },
  { source: 'nuc::intake', target: 'nuc::contract', type: 'inter', style: 'faded', relationship: 'shared: Agent', opacity: 0.18 },
  { source: 'nuc::crm', target: 'nuc::contract', type: 'inter', style: 'faded', relationship: 'shared: Agent', opacity: 0.18 },
];
