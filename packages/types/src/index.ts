// =============================================================================
// POSTADOR — Tipos Compartilhados (independentes do Prisma)
// =============================================================================

// Enums próprios (não dependem do Prisma gerado)
export type UserRole = "OWNER" | "EDITOR" | "VIEWER";
export type SocialPlatform = "INSTAGRAM" | "YOUTUBE" | "TIKTOK" | "LINKEDIN" | "TWITTER_X" | "FACEBOOK";
export type ContentFormat = "REEL" | "CAROUSEL" | "SINGLE_IMAGE" | "STORY" | "VIDEO" | "SHORT_VIDEO" | "TEXT_POST";
export type ContentObjective = "REACH" | "AUTHORITY" | "RELATIONSHIP" | "CONVERSION" | "AWARENESS" | "EDUCATION" | "ENTERTAINMENT";
export type ContentStatus = "IDEA" | "BRIEFING" | "IN_PRODUCTION" | "IN_REVIEW" | "APPROVED" | "SCHEDULED" | "PUBLISHED" | "FAILED" | "ARCHIVED" | "PAUSED";
export type PublicationStatus = "PENDING" | "SCHEDULED" | "PUBLISHING" | "PUBLISHED" | "FAILED" | "CANCELLED" | "REQUIRES_MANUAL";
export type RenderStatus = "QUEUED" | "RENDERING" | "COMPLETED" | "FAILED" | "CANCELLED";
export type CommentIntent = "PRAISE" | "QUESTION" | "OBJECTION" | "TOOL_REQUEST" | "HATE" | "SPAM" | "HOT_LEAD" | "FEEDBACK" | "OTHER";
export type CommentResponseStatus = "PENDING_SUGGESTION" | "SUGGESTION_READY" | "AWAITING_APPROVAL" | "APPROVED" | "PUBLISHED" | "REJECTED" | "AUTO_PUBLISHED";
export type JobStatus = "WAITING" | "ACTIVE" | "COMPLETED" | "FAILED" | "DELAYED" | "PAUSED";
export type SignalType = "TOPIC" | "HOOK" | "FORMAT" | "CTA" | "TREND" | "SERIES" | "VISUAL_PATTERN" | "FREQUENCY" | "NARRATIVE";
export type OpportunityStatus = "NEW" | "REVIEWED" | "CONVERTED_BRIEF" | "CONVERTED_CAROUSEL" | "CONVERTED_VIDEO" | "ADDED_CALENDAR" | "DISMISSED" | "ARCHIVED";
export type AgentStatus = "IDLE" | "RUNNING" | "WAITING_APPROVAL" | "PAUSED" | "ERROR" | "DISABLED";
export type WorkflowStatus = "PENDING" | "RUNNING" | "WAITING_HUMAN" | "COMPLETED" | "FAILED" | "CANCELLED";
export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED" | "NEEDS_REVISION" | "AUTO_APPROVED";
export type AutomationMode = "MANUAL" | "ASSISTED" | "SEMI_AUTONOMOUS" | "AUTONOMOUS_WITH_APPROVAL";

// =============================================================================
// TIPOS DE API
// =============================================================================
export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// =============================================================================
// AI GATEWAY
// =============================================================================
export type AIProvider = "openai" | "anthropic" | "groq" | "together" | "google";

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AICompletionOptions {
  provider?: AIProvider;
  model?: string;
  messages: AIMessage[];
  maxTokens?: number;
  temperature?: number;
  responseFormat?: "text" | "json";
  stream?: boolean;
}

export interface AICompletionResult {
  content: string;
  parsed?: unknown;
  provider: AIProvider;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  latencyMs: number;
}

// =============================================================================
// SOCIALFLOW ADAPTER
// =============================================================================
export interface SocialFlowAccount {
  id: string;
  platform: string;
  handle: string;
  isActive: boolean;
}

export interface SocialFlowPublishPayload {
  accountId: string;
  platform: string;
  caption: string;
  mediaUrls: string[];
  hashtags: string[];
  scheduledAt?: string;
}

export interface SocialFlowPublishResult {
  jobId: string;
  status: "queued" | "publishing" | "published" | "failed";
  externalPostId?: string;
  externalUrl?: string;
  error?: string;
}

// =============================================================================
// RESEARCH ENGINE (last30days)
// =============================================================================
export interface ResearchRequest {
  topic: string;
  mode?: "quick" | "deep";
  sources?: string[];
}

export interface ResearchResult {
  topic: string;
  summary: string;
  signals: ResearchSignal[];
  trendScore: number;
  capturedAt: string;
}

export interface ResearchSignal {
  source: string;
  content: string;
  url?: string;
  relevanceScore: number;
  engagementScore: number;
  publishedAt?: string;
}

// =============================================================================
// REMOTION
// =============================================================================
export interface RemotionRenderRequest {
  compositionId: string;
  inputProps: Record<string, unknown>;
  outputFormat?: "mp4" | "webm" | "gif";
  resolution?: string;
  fps?: number;
  quality?: number;
}

export interface RemotionRenderStatus {
  jobId: string;
  status: "queued" | "rendering" | "completed" | "failed";
  progress: number;
  outputUrl?: string;
  thumbnailUrl?: string;
  error?: string;
}

// =============================================================================
// DASHBOARD
// =============================================================================
export interface DashboardStats {
  postsPublished: number;
  postsScheduled: number;
  postsDraft: number;
  postsInReview: number;
  pendingApprovals: number;
  trendSignals: number;
  activeAgents: number;
  runningJobs: number;
}

export interface ContentScore {
  viral: number;
  authority: number;
  clarity: number;
  repurpose: number;
  effort: number;
  urgency: number;
  overall: number;
}
