/**
 * Performance monitoring utilities for RSA AI Framework
 * Tracks calculation performance and provides insights
 */

interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private readonly maxMetrics = 100; // Keep last 100 metrics

  /**
   * Times an operation and records the performance metric
   */
  async timeOperation<T>(
    operation: string,
    fn: () => T | Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const start = performance.now();
    
    try {
      const result = await fn();
      const duration = performance.now() - start;
      
      this.recordMetric({
        operation,
        duration,
        timestamp: new Date(),
        metadata,
      });
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric({
        operation: `${operation}_error`,
        duration,
        timestamp: new Date(),
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
      throw error;
    }
  }

  private recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Keep only the last maxMetrics entries
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  /**
   * Get performance statistics for an operation
   */
  getStats(operation: string): {
    count: number;
    avgDuration: number;
    minDuration: number;
    maxDuration: number;
    recentDuration?: number;
  } | null {
    const operationMetrics = this.metrics.filter(m => m.operation === operation);
    
    if (operationMetrics.length === 0) {
      return null;
    }

    const durations = operationMetrics.map(m => m.duration);
    const recent = operationMetrics[operationMetrics.length - 1];

    return {
      count: operationMetrics.length,
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      recentDuration: recent?.duration,
    };
  }

  /**
   * Get all recorded metrics (for debugging)
   */
  getAllMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Decorator for timing class methods
 */
export function timed(operation?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const operationName = operation || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      return performanceMonitor.timeOperation(
        operationName,
        () => originalMethod.apply(this, args)
      );
    };

    return descriptor;
  };
}