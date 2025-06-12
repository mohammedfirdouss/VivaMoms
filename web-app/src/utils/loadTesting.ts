
export interface LoadTestConfig {
  concurrentUsers: number;
  testDurationMs: number;
  rampUpTimeMs: number;
  endpoints: string[];
  requestInterval: number;
}

export interface LoadTestResult {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  requestsPerSecond: number;
  errors: Array<{ endpoint: string; error: string; timestamp: number }>;
}

export class LoadTestRunner {
  private isRunning = false;
  private results: LoadTestResult = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    minResponseTime: Infinity,
    maxResponseTime: 0,
    requestsPerSecond: 0,
    errors: []
  };

  async runLoadTest(config: LoadTestConfig): Promise<LoadTestResult> {
    if (this.isRunning) {
      throw new Error('Load test is already running');
    }

    this.isRunning = true;
    this.resetResults();

    console.log('Starting load test with config:', config);

    const startTime = Date.now();
    const workers: Promise<void>[] = [];

    // Create concurrent workers
    for (let i = 0; i < config.concurrentUsers; i++) {
      const worker = this.createWorker(config, i, startTime);
      workers.push(worker);
      
      // Ramp up gradually
      if (config.rampUpTimeMs > 0) {
        await new Promise(resolve => 
          setTimeout(resolve, config.rampUpTimeMs / config.concurrentUsers)
        );
      }
    }

    // Wait for all workers to complete
    await Promise.all(workers);

    this.isRunning = false;
    this.calculateFinalResults(startTime);

    console.log('Load test completed:', this.results);
    return { ...this.results };
  }

  private async createWorker(
    config: LoadTestConfig,
    workerId: number,
    startTime: number
  ): Promise<void> {
    const endTime = startTime + config.testDurationMs;

    while (Date.now() < endTime && this.isRunning) {
      for (const endpoint of config.endpoints) {
        if (Date.now() >= endTime) break;

        await this.makeRequest(endpoint);
        
        if (config.requestInterval > 0) {
          await new Promise(resolve => setTimeout(resolve, config.requestInterval));
        }
      }
    }
  }

  private async makeRequest(endpoint: string): Promise<void> {
    const requestStart = performance.now();
    this.results.totalRequests++;

    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const responseTime = performance.now() - requestStart;
      this.updateResponseTime(responseTime);

      if (response.ok) {
        this.results.successfulRequests++;
      } else {
        this.results.failedRequests++;
        this.results.errors.push({
          endpoint,
          error: `HTTP ${response.status}: ${response.statusText}`,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      const responseTime = performance.now() - requestStart;
      this.updateResponseTime(responseTime);
      
      this.results.failedRequests++;
      this.results.errors.push({
        endpoint,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    }
  }

  private updateResponseTime(responseTime: number): void {
    this.results.minResponseTime = Math.min(this.results.minResponseTime, responseTime);
    this.results.maxResponseTime = Math.max(this.results.maxResponseTime, responseTime);
  }

  private calculateFinalResults(startTime: number): void {
    const duration = Date.now() - startTime;
    this.results.requestsPerSecond = (this.results.totalRequests / duration) * 1000;
    
    // Calculate average response time (simplified)
    this.results.averageResponseTime = 
      (this.results.minResponseTime + this.results.maxResponseTime) / 2;
  }

  private resetResults(): void {
    this.results = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      minResponseTime: Infinity,
      maxResponseTime: 0,
      requestsPerSecond: 0,
      errors: []
    };
  }

  stopTest(): void {
    this.isRunning = false;
  }

  getResults(): LoadTestResult {
    return { ...this.results };
  }
}

// Pre-configured load tests for VivaMoms
export const VIVAMOMS_LOAD_TESTS = {
  basic: {
    concurrentUsers: 10,
    testDurationMs: 30000, // 30 seconds
    rampUpTimeMs: 5000, // 5 seconds
    endpoints: ['/api/health'],
    requestInterval: 1000 // 1 second between requests
  },
  
  moderate: {
    concurrentUsers: 25,
    testDurationMs: 60000, // 1 minute
    rampUpTimeMs: 10000, // 10 seconds
    endpoints: ['/api/health', '/api/consultations'],
    requestInterval: 500 // 0.5 seconds between requests
  },
  
  heavy: {
    concurrentUsers: 50,
    testDurationMs: 120000, // 2 minutes
    rampUpTimeMs: 20000, // 20 seconds
    endpoints: ['/api/health', '/api/consultations', '/api/patients'],
    requestInterval: 200 // 0.2 seconds between requests
  }
};

export const loadTestRunner = new LoadTestRunner();
