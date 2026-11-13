import { sql } from 'drizzle-orm';
import {
  bigint,
  boolean,
  check,
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

export const batchStatus = pgEnum('batch_status', [
  'planned',
  'retired',
  'published',
]);

export const attestationStatus = pgEnum('attestation_status', [
  'pending_batch',
  'attributed',
  'published',
]);

export const retirementBatches = pgTable('retirement_batches', {
  id: uuid('id').primaryKey().defaultRandom(),
  cycle: text('cycle').notNull(),
  registry: text('registry').notNull().default('verra'),
  registryTransactionId: text('registry_transaction_id'),
  serialStart: bigint('serial_start', { mode: 'bigint' }),
  serialEnd: bigint('serial_end', { mode: 'bigint' }),
  totalTonnes: numeric('total_tonnes', { precision: 14, scale: 3 }).notNull(),
  projectName: text('project_name').notNull(),
  projectId: text('project_id').notNull(),
  methodologyId: text('methodology_id').notNull(),
  vintageRange: text('vintage_range').notNull(),
  retirementDate: date('retirement_date'),
  beneficiaryField: text('beneficiary_field'),
  registryUrl: text('registry_url'),
  status: batchStatus('status').notNull().default('planned'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .notNull()
    .defaultNow(),
}, (table) => [
  unique('retirement_batches_cycle_registry_key').on(table.cycle, table.registry),
  check('retirement_batches_total_tonnes_check', sql`${table.totalTonnes} > 0`),
  check(
    'serial_range_ordered',
    sql`${table.serialStart} is null or ${table.serialEnd} is null or ${table.serialStart} <= ${table.serialEnd}`,
  ),
  check(
    'published_requires_registry_data',
    sql`${table.status} <> 'published' or (
      ${table.registryTransactionId} is not null
      and ${table.retirementDate} is not null
      and ${table.serialStart} is not null
      and ${table.serialEnd} is not null
      and ${table.beneficiaryField} is not null
    )`,
  ),
]);

export const attestations = pgTable('attestations', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull(),
  userId: uuid('user_id'),
  batchId: uuid('batch_id').references(() => retirementBatches.id, {
    onDelete: 'restrict',
  }),
  tonnesAttributed: numeric('tonnes_attributed', { precision: 14, scale: 3 })
    .notNull(),
  issuedAt: timestamp('issued_at', { withTimezone: true, mode: 'date' })
    .notNull()
    .defaultNow(),
  status: attestationStatus('status').notNull().default('pending_batch'),
  publicDisplayName: text('public_display_name'),
  consentToPublish: boolean('consent_to_publish').notNull().default(false),
  paymentReference: text('payment_reference'),
  amountCents: integer('amount_cents'),
  currency: text('currency'),
  kg: integer('kg'),
}, (table) => [
  unique('attestations_code_key').on(table.code),
  check(
    'attestations_code_check',
    sql`${table.code} ~ '^CP-[0-9]{4}-[A-HJ-NP-Z2-9]{8}$'`,
  ),
  check('attestations_tonnes_attributed_check', sql`${table.tonnesAttributed} > 0`),
  check(
    'attributed_requires_batch',
    sql`${table.status} = 'pending_batch' or ${table.batchId} is not null`,
  ),
  index('attestations_batch_idx').on(table.batchId),
  index('attestations_user_idx').on(table.userId),
  uniqueIndex('attestations_payment_reference_key')
    .on(table.paymentReference)
    .where(sql`${table.paymentReference} is not null`),
]);

// Triggers, a extensão btree_gist e a constraint de exclusão da faixa de séries
// são gerenciados diretamente no PostgreSQL e não são declarados aqui.
