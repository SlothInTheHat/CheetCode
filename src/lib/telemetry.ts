/**
 * Telemetry Service
 * Tracks all Keywords AI API calls, costs, latency, and prompts
 */

export interface TelemetryEntry {
  id: string;
  timestamp: Date;
  type: 'hint' | 'feedback';
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;
  latency: number; // milliseconds
  prompt: string;
  response: string;
  mode?: 'v1' | 'v2';
  success: boolean;
  error?: string;
}

class TelemetryService {
  private entries: TelemetryEntry[] = [];

  /**
   * Calculate estimated cost for API call
   * gpt-3.5-turbo: $0.50/$1.50 per 1M tokens (in/out)
   * gpt-4: $3.00/$6.00 per 1M tokens (in/out)
   */
  private calculateCost(model: string, promptTokens: number, completionTokens: number): number {
    const rates: { [key: string]: { in: number; out: number } } = {
      'gpt-3.5-turbo': { in: 0.5 / 1_000_000, out: 1.5 / 1_000_000 },
      'gpt-4': { in: 3.0 / 1_000_000, out: 6.0 / 1_000_000 },
    };

    const rate = rates[model] || rates['gpt-3.5-turbo'];
    return promptTokens * rate.in + completionTokens * rate.out;
  }

  /**
   * Log a Keywords AI API call
   */
  logCall(entry: Omit<TelemetryEntry, 'id' | 'estimatedCost'>): TelemetryEntry {
    const estimatedCost = this.calculateCost(entry.model, entry.promptTokens, entry.completionTokens);

    const telemetryEntry: TelemetryEntry = {
      ...entry,
      id: `tel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      estimatedCost,
    };

    this.entries.push(telemetryEntry);

    // Log to console for debugging
    console.log(
      `[Telemetry] ${entry.type.toUpperCase()} | Model: ${entry.model} | Tokens: ${entry.totalTokens} | Cost: $${estimatedCost.toFixed(4)}`,
      telemetryEntry
    );

    return telemetryEntry;
  }

  /**
   * Get all telemetry entries
   */
  getEntries(): TelemetryEntry[] {
    return [...this.entries];
  }

  /**
   * Get entries for current session
   */
  getSessionEntries(): TelemetryEntry[] {
    // Return all entries (in a real app, filter by session ID)
    return this.getEntries();
  }

  /**
   * Calculate total session cost
   */
  getTotalSessionCost(): number {
    return this.entries.reduce((sum, entry) => sum + entry.estimatedCost, 0);
  }

  /**
   * Get summary stats
   */
  getSessionStats() {
    const entries = this.getSessionEntries();
    const totalCost = this.getTotalSessionCost();
    const avgLatency = entries.length > 0 ? entries.reduce((sum, e) => sum + e.latency, 0) / entries.length : 0;
    const successCount = entries.filter((e) => e.success).length;

    return {
      totalCalls: entries.length,
      successCount,
      failureCount: entries.length - successCount,
      totalTokens: entries.reduce((sum, e) => sum + e.totalTokens, 0),
      totalCost,
      avgLatency,
      entries,
    };
  }

  /**
   * Clear telemetry (for new session)
   */
  clear(): void {
    this.entries = [];
  }
}

// Export singleton instance
export const telemetry = new TelemetryService();
