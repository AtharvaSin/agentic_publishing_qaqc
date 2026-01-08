/**
 * Synthetic submission data
 */

import { Submission, ValidationFinding, StageDuration } from '@/types/entities';
import { createSubmissionId, createValidationFindingId } from '@/types/branded';
import { SubmissionStage, FailureCategory, FAILURE_CATEGORIES } from '@/lib/constants';
import { random, toDateString, addDays, subtractDays } from './generator';
import { agents } from './agents';

// Remediation hints by category
const REMEDIATION_HINTS: Record<FailureCategory, string[]> = {
  manifest_mismatch: [
    'Update manifest to accurately reflect agent capabilities',
    'Ensure declared permissions match actual usage',
    'Verify all capability declarations are current',
  ],
  metadata_issues: [
    'Update app description to meet minimum length requirements',
    'Add missing localization strings',
    'Verify icon dimensions and format compliance',
  ],
  policy_violation: [
    'Review Teams Store policy guidelines',
    'Remove prohibited content or functionality',
    'Update privacy policy URL to valid endpoint',
  ],
  security_concerns: [
    'Implement proper authentication flows',
    'Add input validation for user data',
    'Review API endpoint security',
  ],
  functional_test: [
    'Fix failing test scenarios',
    'Ensure all declared features work correctly',
    'Update test instructions for reviewers',
  ],
  rai_violation: [
    'Add guardrails to prevent harmful content generation',
    'Implement content filtering for outputs',
    'Review prompts for bias and safety issues',
  ],
  icons_screenshots: [
    'Provide screenshots in required dimensions',
    'Update app icons to meet contrast requirements',
    'Add missing promotional imagery',
  ],
  test_instructions: [
    'Provide detailed step-by-step testing guide',
    'Include test credentials or sandbox setup',
    'Document expected outcomes for each flow',
  ],
  scope_permissions: [
    'Reduce requested permissions to minimum required',
    'Justify each permission in documentation',
    'Remove unused permission scopes',
  ],
};

// Generate validation findings
function generateFindings(count: number, raiFlag: boolean = false): ValidationFinding[] {
  const findings: ValidationFinding[] = [];
  const categories = random.pickMultiple(FAILURE_CATEGORIES, count);

  for (let i = 0; i < count; i++) {
    const category = categories[i] ?? 'manifest_mismatch';
    const hints = REMEDIATION_HINTS[category];
    const isRai = category === 'rai_violation' || (raiFlag && i === 0);

    findings.push({
      id: createValidationFindingId(`VF${String(random.int(10000, 99999))}`),
      ruleId: `RULE-${category.toUpperCase().slice(0, 3)}-${random.int(100, 999)}`,
      category,
      severity: i === 0 ? 'must_fix' : random.pick(['must_fix', 'should_fix', 'good_to_fix'] as const),
      message: `Validation failed: ${category.replace(/_/g, ' ')} detected`,
      remediationHint: hints ? random.pick(hints) : 'Review and fix the issue',
      raiFlag: isRai,
    });
  }

  return findings;
}

// Generate stage durations
function generateStageDurations(
  stage: SubmissionStage,
  createdAt: string,
  isSlowPath: boolean
): StageDuration[] {
  const stages: SubmissionStage[] = ['submitted', 'automated_checks', 'human_review'];
  const durations: StageDuration[] = [];

  let currentDate = new Date(createdAt);

  for (const s of stages) {
    const baseDuration = isSlowPath ? random.float(1, 3) : random.float(0.2, 1);
    const duration = s === 'human_review' && isSlowPath ? random.float(3, 8) : baseDuration;

    durations.push({
      stage: s,
      enteredAt: toDateString(currentDate),
      exitedAt:
        s === stage ? undefined : toDateString(addDays(currentDate, duration)),
      durationDays: s === stage ? 0 : Math.round(duration * 10) / 10,
    });

    if (s === stage) break;
    currentDate = addDays(currentDate, duration);
  }

  return durations;
}

// Generate submissions for the past 60 days
function generateSubmissions(): Submission[] {
  const submissions: Submission[] = [];
  const today = new Date();
  const startDate = subtractDays(today, 60);

  // Distribution: 70% completed, 20% in progress, 10% rejected
  for (let i = 0; i < 300; i++) {
    const agent = random.pick(agents);
    const createdAt = random.date(startDate, subtractDays(today, 1));
    const isCompleted = random.boolean(0.7);
    const isRejected = !isCompleted && random.boolean(0.3);
    const isSlowPath = random.boolean(0.3);

    let stage: SubmissionStage;
    let outcome: 'approved' | 'rejected' | undefined;
    let completedAt: string | undefined;

    if (isCompleted) {
      stage = random.boolean(0.85) ? 'published' : 'approved';
      outcome = 'approved';
      completedAt = toDateString(addDays(createdAt, random.int(2, 10)));
    } else if (isRejected) {
      stage = 'rejected';
      outcome = 'rejected';
      completedAt = toDateString(addDays(createdAt, random.int(1, 5)));
    } else {
      stage = random.pick(['automated_checks', 'human_review', 'action_required'] as const);
    }

    const findingsCount = stage === 'action_required' ? random.int(1, 4) : isRejected ? random.int(2, 5) : 0;
    const slaTarget = random.pick([5, 7, 10]);
    const daysSinceCreated = Math.floor((today.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

    submissions.push({
      id: createSubmissionId(`SUB${String(i + 1).padStart(5, '0')}`),
      agentId: agent.id,
      publisherId: agent.ownerId,
      version: `${random.int(1, 5)}.${random.int(0, 9)}.${random.int(0, 9)}`,
      stage,
      stageDurations: generateStageDurations(stage, toDateString(createdAt), isSlowPath),
      validationFindings: generateFindings(findingsCount, random.boolean(0.2)),
      slaTargetDays: slaTarget,
      slaBreached: !isCompleted && daysSinceCreated > slaTarget,
      resubmissionCount: random.int(0, 3),
      createdAt: toDateString(createdAt),
      updatedAt: toDateString(isCompleted ? new Date(completedAt ?? '') : today),
      completedAt,
      outcome,
    });
  }

  return submissions;
}

export const submissions = generateSubmissions();

// Helper to get submissions by agent
export function getSubmissionsByAgent(agentId: string): Submission[] {
  return submissions.filter((s) => s.agentId === agentId);
}

// Helper to get submissions by publisher
export function getSubmissionsByPublisher(publisherId: string): Submission[] {
  return submissions.filter((s) => s.publisherId === publisherId);
}

// Helper to get submissions by stage
export function getSubmissionsByStage(stage: SubmissionStage): Submission[] {
  return submissions.filter((s) => s.stage === stage);
}

// Helper to get submissions in date range
export function getSubmissionsInRange(startDate: string, endDate: string): Submission[] {
  return submissions.filter((s) => s.createdAt >= startDate && s.createdAt <= endDate);
}

// Helper to get SLA breached submissions
export function getSlaBreachedSubmissions(): Submission[] {
  return submissions.filter((s) => s.slaBreached);
}
