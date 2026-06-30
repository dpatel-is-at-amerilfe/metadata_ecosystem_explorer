import type { Node, Edge } from '@xyflow/react';

// ── Public types ──────────────────────────────────────────────────────────────

export type NodeData = {
  label: string;
  subtitle: string;
  icon: string;
  color: 'purple' | 'teal' | 'blue' | 'orange' | 'slate';
  properties?: Record<string, string>;
  relationshipCounts?: { label: string; count: number }[];
};

// Kept for MiniGraphNode.tsx import compatibility — no mini nodes are rendered.
export type MiniNodeData = {
  label: string;
  color: 'purple' | 'teal' | 'blue' | 'orange' | 'slate';
  parentId: string;
};

export type MiniAnimParams = {
  phase: number;
  speed: number;
  amplitudeX: number;
  amplitudeY: number;
};

// ── nodeColors — same shape as before ────────────────────────────────────────

export const nodeColors: Record<string, { border: string; glow: string; icon: string; badge: string }> = {
  purple: {
    border: '#a78bfa',
    glow: 'rgba(167, 139, 250, 0.32)',
    icon: '#a78bfa',
    badge: 'bg-purple-900/60 text-purple-300 border-purple-700/50',
  },
  teal: {
    border: '#2dd4bf',
    glow: 'rgba(45, 212, 191, 0.28)',
    icon: '#2dd4bf',
    badge: 'bg-teal-900/60 text-teal-300 border-teal-700/50',
  },
  blue: {
    border: '#60a5fa',
    glow: 'rgba(96, 165, 250, 0.28)',
    icon: '#60a5fa',
    badge: 'bg-blue-900/60 text-blue-300 border-blue-700/50',
  },
  orange: {
    border: '#fb923c',
    glow: 'rgba(251, 146, 60, 0.28)',
    icon: '#fb923c',
    badge: 'bg-amber-900/60 text-amber-300 border-amber-700/50',
  },
  slate: {
    border: '#94a3b8',
    glow: 'rgba(148, 163, 184, 0.22)',
    icon: '#94a3b8',
    badge: 'bg-slate-800/60 text-slate-400 border-slate-600/50',
  },
};

// ── Raw data types ────────────────────────────────────────────────────────────

type GrpRec = { id: string; label: string; memberCount: number };
type SysRec = {
  id: string;
  label: string;
  type: 'system' | 'subsystem';
  systemCode: string;
  systemGroup: string;
  systemType: string;
  dataZone: string;
};
type EntRec = { id: string; label: string; isBridge: boolean; feedCount: number };
type LinkRec = {
  source: string;
  target: string;
  relationship: 'belongs_to' | 'part_of' | 'feeds';
};

// ── Raw data ──────────────────────────────────────────────────────────────────

const GROUPS: GrpRec[] = [
  { id: 'grp::marketing_lead_systems',        label: 'Marketing / Lead Systems',        memberCount: 2 },
  { id: 'grp::files_sftp_email',              label: 'Files (SFTP, Email)',              memberCount: 6 },
  { id: 'grp::external_source_policy_systems',label: 'External Source Policy Systems',  memberCount: 3 },
  { id: 'grp::contracting_systems',           label: 'Contracting Systems',             memberCount: 3 },
  { id: 'grp::financial_systems',             label: 'Financial Systems',               memberCount: 1 },
  { id: 'grp::sql_server_source',             label: 'SQL Server Source',               memberCount: 2 },
  { id: 'grp::api_applications',              label: 'API Applications',                memberCount: 2 },
  { id: 'grp::financial_systems_hr',          label: 'Financial Systems / HR',          memberCount: 2 },
  { id: 'grp::commission_systems',            label: 'Commission Systems',              memberCount: 2 },
  { id: 'grp::crm_ams_systems',               label: 'CRM / AMS Systems',              memberCount: 3 },
  { id: 'grp::calls',                         label: 'Calls',                           memberCount: 2 },
  { id: 'grp::mastered_entities_mds',         label: 'Mastered Entities (MDS)',         memberCount: 3 },
];

const SYSTEMS: SysRec[] = [
  // ── Marketing / Lead Systems ────────────────────────────────────────────────
  { id: 'sys::HUBSPOT',  label: 'HubSpot Marketing',   type: 'system', systemCode: 'HUBSPOT',  systemGroup: 'Marketing / Lead Systems',       systemType: 'Marketing Automation',     dataZone: 'Enterprise Applications (Internal)' },
  { id: 'sys::LEADSTAR', label: 'Lead Star',            type: 'system', systemCode: 'LEADSTAR', systemGroup: 'Marketing / Lead Systems',       systemType: 'Lead Management',          dataZone: 'Enterprise Applications (Internal)' },
  // ── Files (SFTP, Email) ─────────────────────────────────────────────────────
  { id: 'sys::FILE_COMM',  label: 'Commission Files',          type: 'system', systemCode: 'FILE_COMM',  systemGroup: 'Files (SFTP, Email)', systemType: 'File / SFTP', dataZone: 'Source Data (External)' },
  { id: 'sys::FILE_CONTR', label: 'Contract Files',            type: 'system', systemCode: 'FILE_CONTR', systemGroup: 'Files (SFTP, Email)', systemType: 'File / SFTP', dataZone: 'Source Data (External)' },
  { id: 'sys::FILE_PROD',  label: 'Production Files',          type: 'system', systemCode: 'FILE_PROD',  systemGroup: 'Files (SFTP, Email)', systemType: 'File / SFTP', dataZone: 'Source Data (External)' },
  { id: 'sys::FILE_RTS',   label: 'RTS Certs License Appt',   type: 'system', systemCode: 'FILE_RTS',   systemGroup: 'Files (SFTP, Email)', systemType: 'File / SFTP', dataZone: 'Source Data (External)' },
  { id: 'sys::FILE_HIER',  label: 'Hierarchy Files',           type: 'system', systemCode: 'FILE_HIER',  systemGroup: 'Files (SFTP, Email)', systemType: 'File / SFTP', dataZone: 'Source Data (External)' },
  { id: 'sys::FILE_AGENT', label: 'Agent Files',               type: 'system', systemCode: 'FILE_AGENT', systemGroup: 'Files (SFTP, Email)', systemType: 'File / SFTP', dataZone: 'Source Data (External)' },
  // ── External Source Policy Systems ──────────────────────────────────────────
  { id: 'sys::SUNFIRE',   label: 'SunFire Policy System',   type: 'system', systemCode: 'SUNFIRE',   systemGroup: 'External Source Policy Systems', systemType: 'External Policy System', dataZone: 'Source Data (External)' },
  { id: 'sys::AGILITY',   label: 'Agility Policy System',   type: 'system', systemCode: 'AGILITY',   systemGroup: 'External Source Policy Systems', systemType: 'External Policy System', dataZone: 'Source Data (External)' },
  { id: 'sys::PROFORMEX', label: 'Proformex Policy System', type: 'system', systemCode: 'PROFORMEX', systemGroup: 'External Source Policy Systems', systemType: 'External Policy System', dataZone: 'Source Data (External)' },
  // ── Contracting Systems ─────────────────────────────────────────────────────
  { id: 'sys::AGENTSYNC', label: 'AgentSync Contracting',      type: 'system', systemCode: 'AGENTSYNC', systemGroup: 'Contracting Systems', systemType: 'Contracting Platform',      dataZone: 'Enterprise Applications (Internal)' },
  { id: 'sys::SAT',       label: 'SAT Contracting Platform',   type: 'system', systemCode: 'SAT',       systemGroup: 'Contracting Systems', systemType: 'Contracting Platform (DB)', dataZone: 'Enterprise Applications (Internal)' },
  { id: 'sys::VUE_CONTR', label: 'VUE Contracting Platform',  type: 'system', systemCode: 'VUE_CONTR', systemGroup: 'Contracting Systems', systemType: 'Contracting Platform (DB)', dataZone: 'Enterprise Applications (Internal)' },
  // ── Financial Systems ───────────────────────────────────────────────────────
  { id: 'sys::FDM', label: 'Finance Commission Platform', type: 'system', systemCode: 'FDM', systemGroup: 'Financial Systems', systemType: 'Finance Platform', dataZone: 'Banking / Cash management' },
  // ── SQL Server Source ───────────────────────────────────────────────────────
  { id: 'sys::AMLSTATING', label: 'AML Stating Database',       type: 'system', systemCode: 'AMLSTATING', systemGroup: 'SQL Server Source', systemType: 'SQL Server DB', dataZone: 'Source Data (Internal)' },
  { id: 'sys::EDM_CONSOL', label: 'EDM Consolidation Database', type: 'system', systemCode: 'EDM_CONSOL', systemGroup: 'SQL Server Source', systemType: 'SQL Server DB', dataZone: 'Source Data (Internal)' },
  // ── API Applications ────────────────────────────────────────────────────────
  { id: 'sys::COMULATE', label: 'Comulate API',        type: 'system', systemCode: 'COMULATE', systemGroup: 'API Applications', systemType: 'API / Integration', dataZone: 'Source Data (External)' },
  { id: 'sys::TROVATA',  label: 'Trovata Banking API', type: 'system', systemCode: 'TROVATA',  systemGroup: 'API Applications', systemType: 'API / Integration', dataZone: 'Source Data (External)' },
  // ── Financial Systems / HR ──────────────────────────────────────────────────
  { id: 'sys::ORACLE_FUS', label: 'Oracle Fusion ERP',   type: 'system', systemCode: 'ORACLE_FUS', systemGroup: 'Financial Systems / HR', systemType: 'ERP / Finance', dataZone: 'Enterprise Applications (Internal)' },
  { id: 'sys::ONESTREAM',  label: 'OneStream Financial', type: 'system', systemCode: 'ONESTREAM',  systemGroup: 'Financial Systems / HR', systemType: 'ERP / Finance', dataZone: 'Enterprise Applications (Internal)' },
  // ── Commission Systems ──────────────────────────────────────────────────────
  { id: 'sys::VUE_COMM', label: 'VUE Commission Platform', type: 'system', systemCode: 'VUE_COMM', systemGroup: 'Commission Systems', systemType: 'Commission Platform (DB)', dataZone: 'Enterprise Applications (Internal)' },
  { id: 'sys::VARICENT', label: 'Varicent Commission',     type: 'system', systemCode: 'VARICENT', systemGroup: 'Commission Systems', systemType: 'Commission Platform',      dataZone: 'Enterprise Applications (Internal)' },
  // ── CRM / AMS Systems ──────────────────────────────────────────────────────
  { id: 'sys::KIZEN',    label: 'Kizen CRM',              type: 'system', systemCode: 'KIZEN',    systemGroup: 'CRM / AMS Systems', systemType: 'CRM / AMS', dataZone: 'Enterprise Applications (Internal)' },
  { id: 'sys::LEADPERF', label: 'LeadPerfection CRM',     type: 'system', systemCode: 'LEADPERF', systemGroup: 'CRM / AMS Systems', systemType: 'CRM / AMS', dataZone: 'Enterprise Applications (Internal)' },
  { id: 'sys::ONEHQ',    label: 'OneHQ Agent Management', type: 'system', systemCode: 'ONEHQ',    systemGroup: 'CRM / AMS Systems', systemType: 'CRM / AMS', dataZone: 'Enterprise Applications (Internal)' },
  // ── Calls ───────────────────────────────────────────────────────────────────
  { id: 'sys::AVAYA',       label: 'AVAYA Telephony',    type: 'system', systemCode: 'AVAYA',       systemGroup: 'Calls', systemType: 'Telephony / Call Center', dataZone: 'Enterprise Applications (Internal)' },
  { id: 'sys::RINGCENTRAL', label: 'RingCentral UCaaS',  type: 'system', systemCode: 'RINGCENTRAL', systemGroup: 'Calls', systemType: 'Telephony / Call Center', dataZone: 'Enterprise Applications (Internal)' },
  // ── Mastered Entities (MDS) ─────────────────────────────────────────────────
  { id: 'sys::MDS_WORKDAY', label: 'Workday MDS', type: 'system', systemCode: 'MDS_WORKDAY', systemGroup: 'Mastered Entities (MDS)', systemType: 'Master Data Source', dataZone: 'Enterprise Applications (Internal)' },
  { id: 'sys::MDS_ORACLE',  label: 'Oracle MDS',  type: 'system', systemCode: 'MDS_ORACLE',  systemGroup: 'Mastered Entities (MDS)', systemType: 'Master Data Source', dataZone: 'Enterprise Applications (Internal)' },
  { id: 'sys::MDS_OTHER',   label: 'Other MDS',   type: 'system', systemCode: 'MDS_OTHER',   systemGroup: 'Mastered Entities (MDS)', systemType: 'Master Data Source', dataZone: 'Enterprise Applications (Internal)' },
  // ── Subsystems of FILE_RTS ─────────────────────────────────────────────────
  { id: 'sys::FILE_RTS_CERTS',        label: 'Certs',        type: 'subsystem', systemCode: 'FILE_RTS_CERTS',        systemGroup: 'FILE_RTS', systemType: 'File', dataZone: 'Bronze' },
  { id: 'sys::FILE_RTS_LICENSE',      label: 'License',      type: 'subsystem', systemCode: 'FILE_RTS_LICENSE',      systemGroup: 'FILE_RTS', systemType: 'File', dataZone: 'Bronze' },
  { id: 'sys::FILE_RTS_APPOINTMENTS', label: 'Appointments', type: 'subsystem', systemCode: 'FILE_RTS_APPOINTMENTS', systemGroup: 'FILE_RTS', systemType: 'File', dataZone: 'Bronze' },
];

const ENTITIES: EntRec[] = [
  { id: 'ent::marketing',                             label: 'Marketing',                             isBridge: false, feedCount: 1 },
  { id: 'ent::lead_nurturing',                        label: 'Lead nurturing',                        isBridge: false, feedCount: 1 },
  { id: 'ent::commission_data',                       label: 'Commission data',                       isBridge: false, feedCount: 1 },
  { id: 'ent::policy_data',                           label: 'Policy data',                           isBridge: true,  feedCount: 3 },
  { id: 'ent::agent_licensing_contracting',           label: 'Agent licensing & contracting',         isBridge: false, feedCount: 1 },
  { id: 'ent::contract_data',                         label: 'Contract data',                         isBridge: true,  feedCount: 3 },
  { id: 'ent::commission_calculations_and_statements',label: 'Commission calculations and statements', isBridge: false, feedCount: 1 },
  { id: 'ent::staging_source_data',                   label: 'Staging source data',                   isBridge: false, feedCount: 1 },
  { id: 'ent::consolidation_source_data',             label: 'Consolidation source data',             isBridge: false, feedCount: 1 },
  { id: 'ent::production_data',                       label: 'Production data',                       isBridge: false, feedCount: 1 },
  { id: 'ent::certs',                                 label: 'Certs',                                 isBridge: false, feedCount: 1 },
  { id: 'ent::license',                               label: 'License',                               isBridge: false, feedCount: 1 },
  { id: 'ent::appointments',                          label: 'Appointments',                          isBridge: true,  feedCount: 2 },
  { id: 'ent::hierarchy_data',                        label: 'Hierarchy data',                        isBridge: false, feedCount: 1 },
  { id: 'ent::agent_data',                            label: 'Agent data',                            isBridge: false, feedCount: 1 },
  { id: 'ent::commission_data_via_api',               label: 'Commission data via API',               isBridge: false, feedCount: 1 },
  { id: 'ent::banking_cash_management_via_api',       label: 'Banking / Cash management via API',     isBridge: false, feedCount: 1 },
  { id: 'ent::gl',                                    label: 'GL',                                    isBridge: false, feedCount: 1 },
  { id: 'ent::finance',                               label: 'Finance',                               isBridge: false, feedCount: 1 },
  { id: 'ent::hr',                                    label: 'HR',                                    isBridge: false, feedCount: 1 },
  { id: 'ent::financial_consolidation_reporting',     label: 'Financial consolidation/reporting',     isBridge: false, feedCount: 1 },
  { id: 'ent::commission_processing',                 label: 'Commission processing',                 isBridge: false, feedCount: 1 },
  { id: 'ent::commission_calculations_statements',    label: 'Commission calculations/statements',    isBridge: false, feedCount: 1 },
  { id: 'ent::agent_contact',                         label: 'Agent Contact',                         isBridge: false, feedCount: 1 },
  { id: 'ent::campaign',                              label: 'Campaign',                              isBridge: false, feedCount: 1 },
  { id: 'ent::leads',                                 label: 'Leads',                                 isBridge: true,  feedCount: 2 },
  { id: 'ent::lead_management',                       label: 'Lead management',                       isBridge: false, feedCount: 1 },
  { id: 'ent::agent_management',                      label: 'Agent management',                      isBridge: false, feedCount: 1 },
  { id: 'ent::one_portal',                            label: 'One Portal',                            isBridge: false, feedCount: 1 },
  { id: 'ent::call_data',                             label: 'Call data',                             isBridge: false, feedCount: 1 },
  { id: 'ent::call_data_ucaas',                       label: 'Call data / UCaaS',                     isBridge: false, feedCount: 1 },
  { id: 'ent::employees',                             label: 'Employees',                             isBridge: false, feedCount: 1 },
  { id: 'ent::marketers',                             label: 'Marketers',                             isBridge: false, feedCount: 1 },
  { id: 'ent::principals',                            label: 'Principals',                            isBridge: false, feedCount: 1 },
  { id: 'ent::carriers',                              label: 'Carriers',                              isBridge: false, feedCount: 1 },
  { id: 'ent::affiliates',                            label: 'Affiliates',                            isBridge: false, feedCount: 1 },
  { id: 'ent::products',                              label: 'Products',                              isBridge: false, feedCount: 1 },
  { id: 'ent::agents',                                label: 'Agents',                                isBridge: false, feedCount: 1 },
  { id: 'ent::customers',                             label: 'Customers',                             isBridge: false, feedCount: 1 },
  { id: 'ent::jes',                                   label: 'JEs',                                   isBridge: false, feedCount: 1 },
  { id: 'ent::certifications',                        label: 'Certifications',                        isBridge: false, feedCount: 1 },
  { id: 'ent::licensing',                             label: 'Licensing',                             isBridge: false, feedCount: 1 },
];

const LINKS: LinkRec[] = [
  // belongs_to (31)
  { source: 'sys::HUBSPOT',     target: 'grp::marketing_lead_systems',         relationship: 'belongs_to' },
  { source: 'sys::LEADSTAR',    target: 'grp::marketing_lead_systems',         relationship: 'belongs_to' },
  { source: 'sys::FILE_COMM',   target: 'grp::files_sftp_email',               relationship: 'belongs_to' },
  { source: 'sys::FILE_CONTR',  target: 'grp::files_sftp_email',               relationship: 'belongs_to' },
  { source: 'sys::FILE_PROD',   target: 'grp::files_sftp_email',               relationship: 'belongs_to' },
  { source: 'sys::FILE_RTS',    target: 'grp::files_sftp_email',               relationship: 'belongs_to' },
  { source: 'sys::FILE_HIER',   target: 'grp::files_sftp_email',               relationship: 'belongs_to' },
  { source: 'sys::FILE_AGENT',  target: 'grp::files_sftp_email',               relationship: 'belongs_to' },
  { source: 'sys::SUNFIRE',     target: 'grp::external_source_policy_systems', relationship: 'belongs_to' },
  { source: 'sys::AGILITY',     target: 'grp::external_source_policy_systems', relationship: 'belongs_to' },
  { source: 'sys::PROFORMEX',   target: 'grp::external_source_policy_systems', relationship: 'belongs_to' },
  { source: 'sys::AGENTSYNC',   target: 'grp::contracting_systems',            relationship: 'belongs_to' },
  { source: 'sys::SAT',         target: 'grp::contracting_systems',            relationship: 'belongs_to' },
  { source: 'sys::VUE_CONTR',   target: 'grp::contracting_systems',            relationship: 'belongs_to' },
  { source: 'sys::FDM',         target: 'grp::financial_systems',              relationship: 'belongs_to' },
  { source: 'sys::AMLSTATING',  target: 'grp::sql_server_source',              relationship: 'belongs_to' },
  { source: 'sys::EDM_CONSOL',  target: 'grp::sql_server_source',              relationship: 'belongs_to' },
  { source: 'sys::COMULATE',    target: 'grp::api_applications',               relationship: 'belongs_to' },
  { source: 'sys::TROVATA',     target: 'grp::api_applications',               relationship: 'belongs_to' },
  { source: 'sys::ORACLE_FUS',  target: 'grp::financial_systems_hr',           relationship: 'belongs_to' },
  { source: 'sys::ONESTREAM',   target: 'grp::financial_systems_hr',           relationship: 'belongs_to' },
  { source: 'sys::VUE_COMM',    target: 'grp::commission_systems',             relationship: 'belongs_to' },
  { source: 'sys::VARICENT',    target: 'grp::commission_systems',             relationship: 'belongs_to' },
  { source: 'sys::KIZEN',       target: 'grp::crm_ams_systems',               relationship: 'belongs_to' },
  { source: 'sys::LEADPERF',    target: 'grp::crm_ams_systems',               relationship: 'belongs_to' },
  { source: 'sys::ONEHQ',       target: 'grp::crm_ams_systems',               relationship: 'belongs_to' },
  { source: 'sys::AVAYA',       target: 'grp::calls',                          relationship: 'belongs_to' },
  { source: 'sys::RINGCENTRAL', target: 'grp::calls',                          relationship: 'belongs_to' },
  { source: 'sys::MDS_WORKDAY', target: 'grp::mastered_entities_mds',         relationship: 'belongs_to' },
  { source: 'sys::MDS_ORACLE',  target: 'grp::mastered_entities_mds',         relationship: 'belongs_to' },
  { source: 'sys::MDS_OTHER',   target: 'grp::mastered_entities_mds',         relationship: 'belongs_to' },
  // part_of (3)
  { source: 'sys::FILE_RTS_CERTS',        target: 'sys::FILE_RTS', relationship: 'part_of' },
  { source: 'sys::FILE_RTS_LICENSE',      target: 'sys::FILE_RTS', relationship: 'part_of' },
  { source: 'sys::FILE_RTS_APPOINTMENTS', target: 'sys::FILE_RTS', relationship: 'part_of' },
  // feeds (48)
  { source: 'sys::HUBSPOT',               target: 'ent::marketing',                              relationship: 'feeds' },
  { source: 'sys::HUBSPOT',               target: 'ent::lead_nurturing',                         relationship: 'feeds' },
  { source: 'sys::FILE_COMM',             target: 'ent::commission_data',                        relationship: 'feeds' },
  { source: 'sys::SUNFIRE',               target: 'ent::policy_data',                            relationship: 'feeds' },
  { source: 'sys::AGILITY',               target: 'ent::policy_data',                            relationship: 'feeds' },
  { source: 'sys::AGENTSYNC',             target: 'ent::agent_licensing_contracting',            relationship: 'feeds' },
  { source: 'sys::FILE_CONTR',            target: 'ent::contract_data',                          relationship: 'feeds' },
  { source: 'sys::FDM',                   target: 'ent::commission_calculations_and_statements', relationship: 'feeds' },
  { source: 'sys::AMLSTATING',            target: 'ent::staging_source_data',                    relationship: 'feeds' },
  { source: 'sys::EDM_CONSOL',            target: 'ent::consolidation_source_data',              relationship: 'feeds' },
  { source: 'sys::FILE_PROD',             target: 'ent::production_data',                        relationship: 'feeds' },
  { source: 'sys::FILE_RTS',              target: 'ent::certs',                                  relationship: 'feeds' },
  { source: 'sys::FILE_RTS',              target: 'ent::license',                                relationship: 'feeds' },
  { source: 'sys::FILE_RTS',              target: 'ent::appointments',                           relationship: 'feeds' },
  { source: 'sys::FILE_HIER',             target: 'ent::hierarchy_data',                         relationship: 'feeds' },
  { source: 'sys::FILE_AGENT',            target: 'ent::agent_data',                             relationship: 'feeds' },
  { source: 'sys::PROFORMEX',             target: 'ent::policy_data',                            relationship: 'feeds' },
  { source: 'sys::COMULATE',              target: 'ent::commission_data_via_api',                relationship: 'feeds' },
  { source: 'sys::TROVATA',               target: 'ent::banking_cash_management_via_api',        relationship: 'feeds' },
  { source: 'sys::ORACLE_FUS',            target: 'ent::gl',                                     relationship: 'feeds' },
  { source: 'sys::ORACLE_FUS',            target: 'ent::finance',                                relationship: 'feeds' },
  { source: 'sys::ORACLE_FUS',            target: 'ent::hr',                                     relationship: 'feeds' },
  { source: 'sys::ONESTREAM',             target: 'ent::financial_consolidation_reporting',       relationship: 'feeds' },
  { source: 'sys::VUE_COMM',              target: 'ent::commission_processing',                  relationship: 'feeds' },
  { source: 'sys::VARICENT',              target: 'ent::commission_calculations_statements',     relationship: 'feeds' },
  { source: 'sys::SAT',                   target: 'ent::contract_data',                          relationship: 'feeds' },
  { source: 'sys::VUE_CONTR',             target: 'ent::contract_data',                          relationship: 'feeds' },
  { source: 'sys::KIZEN',                 target: 'ent::agent_contact',                          relationship: 'feeds' },
  { source: 'sys::KIZEN',                 target: 'ent::campaign',                               relationship: 'feeds' },
  { source: 'sys::KIZEN',                 target: 'ent::leads',                                  relationship: 'feeds' },
  { source: 'sys::LEADPERF',              target: 'ent::lead_management',                        relationship: 'feeds' },
  { source: 'sys::ONEHQ',                 target: 'ent::agent_management',                       relationship: 'feeds' },
  { source: 'sys::ONEHQ',                 target: 'ent::one_portal',                             relationship: 'feeds' },
  { source: 'sys::LEADSTAR',              target: 'ent::leads',                                  relationship: 'feeds' },
  { source: 'sys::AVAYA',                 target: 'ent::call_data',                              relationship: 'feeds' },
  { source: 'sys::RINGCENTRAL',           target: 'ent::call_data_ucaas',                        relationship: 'feeds' },
  { source: 'sys::MDS_WORKDAY',           target: 'ent::employees',                              relationship: 'feeds' },
  { source: 'sys::MDS_WORKDAY',           target: 'ent::marketers',                              relationship: 'feeds' },
  { source: 'sys::MDS_WORKDAY',           target: 'ent::principals',                             relationship: 'feeds' },
  { source: 'sys::MDS_ORACLE',            target: 'ent::carriers',                               relationship: 'feeds' },
  { source: 'sys::MDS_ORACLE',            target: 'ent::affiliates',                             relationship: 'feeds' },
  { source: 'sys::MDS_ORACLE',            target: 'ent::products',                               relationship: 'feeds' },
  { source: 'sys::MDS_OTHER',             target: 'ent::agents',                                 relationship: 'feeds' },
  { source: 'sys::MDS_OTHER',             target: 'ent::customers',                              relationship: 'feeds' },
  { source: 'sys::MDS_OTHER',             target: 'ent::jes',                                    relationship: 'feeds' },
  { source: 'sys::FILE_RTS_CERTS',        target: 'ent::certifications',                         relationship: 'feeds' },
  { source: 'sys::FILE_RTS_LICENSE',      target: 'ent::licensing',                              relationship: 'feeds' },
  { source: 'sys::FILE_RTS_APPOINTMENTS', target: 'ent::appointments',                           relationship: 'feeds' },
];

// ── Mapping helpers ────────────────────────────────────────────────────────────

function sysIcon(s: SysRec): string {
  if (s.type === 'subsystem') return '📂';
  const t = s.systemType;
  if (t.includes('Marketing')) return '📧';
  if (t.includes('File') || t.includes('SFTP')) return '📁';
  if (t.includes('Policy')) return '📋';
  if (t.includes('Contracting')) return '✍️';
  if (t.includes('Finance') || t.includes('ERP')) return '💰';
  if (t.includes('SQL')) return '🗄️';
  if (t.includes('API') || t.includes('Integration')) return '🔌';
  if (t.includes('Commission')) return '💲';
  if (t.includes('CRM') || t.includes('AMS')) return '👥';
  if (t.includes('Telephony') || t.includes('Call')) return '📞';
  if (t.includes('Master')) return '⭐';
  if (t.includes('Lead')) return '🎯';
  return '⚙️';
}

// ── Orbital layout ─────────────────────────────────────────────────────────────

interface XY { x: number; y: number }

function computeOrbitalPositions(): Record<string, XY> {
  const pos: Record<string, XY> = {};

  // Build lookup tables from LINKS
  const groupOf: Record<string, string> = {};
  const groupMembers: Record<string, string[]> = {};
  const parentOf: Record<string, string> = {};
  const entityFeeders: Record<string, string[]> = {};

  LINKS.forEach(l => {
    if (l.relationship === 'belongs_to') {
      groupOf[l.source] = l.target;
      if (!groupMembers[l.target]) groupMembers[l.target] = [];
      groupMembers[l.target].push(l.source);
    } else if (l.relationship === 'part_of') {
      parentOf[l.source] = l.target;
    } else {
      if (!entityFeeders[l.target]) entityFeeders[l.target] = [];
      entityFeeders[l.target].push(l.source);
    }
  });

  // 1. Groups — evenly spaced outer ring, radius 1400, starting at top (−π/2)
  const R_G = 1400;
  const groupAngle: Record<string, number> = {};
  GROUPS.forEach((g, i) => {
    const a = (i / GROUPS.length) * 2 * Math.PI - Math.PI / 2;
    groupAngle[g.id] = a;
    pos[g.id] = { x: Math.round(Math.cos(a) * R_G), y: Math.round(Math.sin(a) * R_G) };
  });

  // 2. Systems — middle ring (R=780), fanned ±fanWidth around parent group's angle
  const R_S = 780;
  const sysXY: Record<string, XY> = {};

  SYSTEMS.filter(s => s.type === 'system').forEach(sys => {
    const gid = groupOf[sys.id];
    const baseAngle = gid ? (groupAngle[gid] ?? 0) : 0;
    const sibs = gid ? (groupMembers[gid] ?? [sys.id]) : [sys.id];
    const idx = sibs.indexOf(sys.id);
    const n = sibs.length;
    const fanWidth = Math.min((n - 1) * 0.22, 0.8);
    const angle = n > 1 ? baseAngle + (idx / (n - 1) - 0.5) * fanWidth : baseAngle;
    const p: XY = { x: Math.round(Math.cos(angle) * R_S), y: Math.round(Math.sin(angle) * R_S) };
    pos[sys.id] = p;
    sysXY[sys.id] = p;
  });

  // 3. Subsystems — pulled 200px inward from parent system, spread ±0.22 rad
  SYSTEMS.filter(s => s.type === 'subsystem').forEach(sub => {
    const pid = parentOf[sub.id];
    const ppos = pid ? sysXY[pid] : null;
    if (ppos) {
      const pAngle = Math.atan2(ppos.y, ppos.x);
      const pRadius = Math.hypot(ppos.x, ppos.y);
      const sibSubs = SYSTEMS.filter(s => s.type === 'subsystem' && parentOf[s.id] === pid);
      const sidx = sibSubs.indexOf(sub);
      const sn = sibSubs.length;
      const fan = sn > 1 ? (sidx / (sn - 1) - 0.5) * 0.44 : 0;
      const r = Math.max(pRadius - 200, 300);
      const p: XY = { x: Math.round(Math.cos(pAngle + fan) * r), y: Math.round(Math.sin(pAngle + fan) * r) };
      pos[sub.id] = p;
      sysXY[sub.id] = p;
    } else {
      const fallback: XY = { x: 0, y: -1200 };
      pos[sub.id] = fallback;
      sysXY[sub.id] = fallback;
    }
  });

  // 4. Entities — pushed ~290px radially outward from feeder centroid
  ENTITIES.forEach((ent, fi) => {
    const feeders = entityFeeders[ent.id] ?? [];
    let cx = 0, cy = 0, count = 0;
    feeders.forEach(fid => {
      const fp = sysXY[fid];
      if (fp) { cx += fp.x; cy += fp.y; count++; }
    });
    if (count > 0) {
      cx /= count; cy /= count;
      const angle = Math.atan2(cy, cx);
      const r = Math.hypot(cx, cy) + 290;
      pos[ent.id] = { x: Math.round(Math.cos(angle) * r), y: Math.round(Math.sin(angle) * r) };
    } else {
      pos[ent.id] = { x: (fi % 5 - 2) * 240, y: Math.floor(fi / 5) * 240 };
    }
  });

  return pos;
}

const positions = computeOrbitalPositions();

// ── React Flow node/edge arrays ────────────────────────────────────────────────

const groupNodes: Node<NodeData>[] = GROUPS.map(g => ({
  id: g.id,
  type: 'graphNode',
  position: positions[g.id] ?? { x: 0, y: 0 },
  data: {
    label: g.label,
    subtitle: `${g.memberCount} Systems`,
    icon: '🗂️',
    color: 'purple',
    properties: {
      'Category': 'System Group',
      'Member Systems': String(g.memberCount),
    },
    relationshipCounts: LINKS
      .filter(l => l.target === g.id && l.relationship === 'belongs_to')
      .map(l => ({ label: SYSTEMS.find(s => s.id === l.source)?.label ?? l.source, count: 1 })),
  },
}));

const systemNodes: Node<NodeData>[] = SYSTEMS.map(s => {
  const isSubsystem = s.type === 'subsystem';
  const fedEntities = LINKS.filter(l => l.source === s.id && l.relationship === 'feeds');
  const subCount = LINKS.filter(l => l.target === s.id && l.relationship === 'part_of').length;

  const relCounts: { label: string; count: number }[] = [];
  if (fedEntities.length) relCounts.push({ label: 'Fed Entities', count: fedEntities.length });
  if (subCount) relCounts.push({ label: 'Sub-Systems', count: subCount });

  return {
    id: s.id,
    type: 'graphNode',
    position: positions[s.id] ?? { x: 0, y: 0 },
    data: {
      label: s.label,
      subtitle: isSubsystem ? 'Sub-System' : s.systemType,
      icon: sysIcon(s),
      color: 'teal',
      properties: {
        'Code': s.systemCode,
        'Group': s.systemGroup,
        'Type': s.systemType,
        'Data Zone': s.dataZone,
      },
      relationshipCounts: relCounts,
    },
  };
});

const entityNodes: Node<NodeData>[] = ENTITIES.map(e => {
  const feederCount = LINKS.filter(l => l.target === e.id && l.relationship === 'feeds').length;
  return {
    id: e.id,
    type: 'graphNode',
    position: positions[e.id] ?? { x: 0, y: 0 },
    data: {
      label: e.label,
      subtitle: e.isBridge ? 'Bridge Entity' : 'Data Entity',
      icon: e.isBridge ? '🔗' : '📊',
      color: e.isBridge ? 'orange' : 'blue',
      properties: {
        'Feed Count': String(e.feedCount),
        'Bridge': e.isBridge ? 'Yes' : 'No',
      },
      relationshipCounts: [
        { label: 'Source Systems', count: feederCount },
      ],
    },
  };
});

export const mockNodes: Node<NodeData>[] = [...groupNodes, ...systemNodes, ...entityNodes];

export const mockEdges: Edge[] = LINKS.map((l, i) => ({
  id: `e${i}-${l.source.replace(/::/g, '-')}-${l.target.replace(/::/g, '-')}`,
  source: l.source,
  target: l.target,
  type: 'graphEdge',
  data: { label: l.relationship, isParent: false },
}));

// ── Legacy mini-node exports — emptied (no satellite nodes in new data) ────────

export const miniNodes: Node<NodeData>[] = [];
export const miniBasePositions: Record<string, { x: number; y: number }> = {};
export const miniAnimParams: Record<string, MiniAnimParams> = {};
