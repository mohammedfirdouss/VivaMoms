
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { performanceMonitor } from "@/utils/performance";
import { loadTestRunner, VIVAMOMS_LOAD_TESTS } from "@/utils/loadTesting";
import { Activity, Zap, Clock, AlertTriangle } from "lucide-react";

const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loadTestRunning, setLoadTestRunning] = useState(false);
  const [loadTestResults, setLoadTestResults] = useState<any>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(performanceMonitor.getMetrics());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const runLoadTest = async (testType: keyof typeof VIVAMOMS_LOAD_TESTS) => {
    setLoadTestRunning(true);
    setLoadTestResults(null);
    
    try {
      const results = await loadTestRunner.runLoadTest(VIVAMOMS_LOAD_TESTS[testType]);
      setLoadTestResults(results);
    } catch (error) {
      console.error('Load test failed:', error);
    } finally {
      setLoadTestRunning(false);
    }
  };

  const getRecentMetrics = (metricName: string) => {
    return metrics.filter(m => m.name === metricName).slice(-10);
  };

  const getAverageResponseTime = () => {
    const apiMetrics = metrics.filter(m => m.name.startsWith('api_'));
    if (apiMetrics.length === 0) return 0;
    return apiMetrics.reduce((sum, m) => sum + m.value, 0) / apiMetrics.length;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          Performance Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Real-time Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">{getAverageResponseTime().toFixed(0)}ms</div>
            <div className="text-sm text-gray-500">Avg Response</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Zap className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold">{performanceMonitor.getMetrics('page_load_time').slice(-1)[0]?.value.toFixed(0) || 0}ms</div>
            <div className="text-sm text-gray-500">Page Load</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Activity className="h-4 w-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold">{metrics.length}</div>
            <div className="text-sm text-gray-500">Total Metrics</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </div>
            <div className="text-2xl font-bold">0</div>
            <div className="text-sm text-gray-500">Errors</div>
          </div>
        </div>

        {/* Load Testing */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Load Testing</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.keys(VIVAMOMS_LOAD_TESTS).map((testType) => (
              <Button
                key={testType}
                variant="outline"
                size="sm"
                onClick={() => runLoadTest(testType as keyof typeof VIVAMOMS_LOAD_TESTS)}
                disabled={loadTestRunning}
              >
                {loadTestRunning ? 'Running...' : `${testType} Test`}
              </Button>
            ))}
          </div>
          
          {loadTestResults && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Last Test Results</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="font-medium">Total Requests</div>
                  <div>{loadTestResults.totalRequests}</div>
                </div>
                <div>
                  <div className="font-medium">Success Rate</div>
                  <div>{((loadTestResults.successfulRequests / loadTestResults.totalRequests) * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <div className="font-medium">Avg Response</div>
                  <div>{loadTestResults.averageResponseTime.toFixed(0)}ms</div>
                </div>
                <div>
                  <div className="font-medium">Requests/sec</div>
                  <div>{loadTestResults.requestsPerSecond.toFixed(1)}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Export Data */}
        <div className="border-t pt-4">
          <Button
            variant="outline"
            onClick={() => {
              const data = performanceMonitor.exportMetrics();
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `vivamoms-performance-${Date.now()}.json`;
              a.click();
            }}
          >
            Export Metrics
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceMonitor;
