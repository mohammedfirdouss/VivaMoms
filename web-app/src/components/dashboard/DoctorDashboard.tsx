
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogOut, Users, Calendar, MessageSquare, Activity, FileText } from "lucide-react";
import PatientList from "./PatientList";
import ConsultationHistory from "./ConsultationHistory";
import CHWCommunication from "./CHWCommunication";
import PerformanceMonitor from "./PerformanceMonitor";
import DoctorProfile from "./DoctorProfile";
import NotificationCenter from "./NotificationCenter";
import OfflineSync from "./OfflineSync";
import { useConsultations } from "@/hooks/useConsultations";
import { usePatients } from "@/hooks/usePatients";
import ConsultationStatusBadge from "./ConsultationStatusBadge";
import LoadingSpinner from "./LoadingSpinner";
import EmptyState from "./EmptyState";

interface DoctorDashboardProps {
  user: any;
  onLogout: () => void;
}

const DoctorDashboard = ({ user, onLogout }: DoctorDashboardProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  const { consultations, loading: consultationsLoading } = useConsultations(user?.id);
  const { patients, loading: patientsLoading } = usePatients(user?.id);

  const getConsultationStats = () => {
    const pending = consultations.filter(c => c.status === 'pending').length;
    const inProgress = consultations.filter(c => c.status === 'in_progress').length;
    const completed = consultations.filter(c => c.status === 'completed').length;
    const cancelled = consultations.filter(c => c.status === 'cancelled').length;
    
    return { pending, inProgress, completed, cancelled, total: consultations.length };
  };

  const stats = getConsultationStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">VivaMoms Portal</h1>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Doctor Dashboard
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <OfflineSync />
              <NotificationCenter userId={user?.id} />
              <DoctorProfile user={user} />
              <Button 
                onClick={onLogout} 
                variant="outline" 
                size="sm"
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-fit lg:grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="patients" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Patients</span>
            </TabsTrigger>
            <TabsTrigger value="consultations" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Consultations</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Messages</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    Total Patients
                    <Users className="h-4 w-4" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {patientsLoading ? <LoadingSpinner size="sm" /> : patients.length}
                  </div>
                  <p className="text-blue-100 text-xs">Active patients in your care</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    Completed Today
                    <Calendar className="h-4 w-4" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {consultationsLoading ? <LoadingSpinner size="sm" /> : stats.completed}
                  </div>
                  <p className="text-green-100 text-xs">Consultations completed</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    Pending
                    <Activity className="h-4 w-4" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {consultationsLoading ? <LoadingSpinner size="sm" /> : stats.pending}
                  </div>
                  <p className="text-yellow-100 text-xs">Awaiting your attention</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    In Progress
                    <MessageSquare className="h-4 w-4" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {consultationsLoading ? <LoadingSpinner size="sm" /> : stats.inProgress}
                  </div>
                  <p className="text-purple-100 text-xs">Active consultations</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Consultations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Recent Consultations
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setActiveTab("consultations")}
                  >
                    View All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {consultationsLoading ? (
                  <LoadingSpinner text="Loading consultations..." />
                ) : consultations.length === 0 ? (
                  <EmptyState
                    icon={<Calendar className="h-12 w-12" />}
                    title="No consultations yet"
                    description="New consultation requests will appear here"
                  />
                ) : (
                  <div className="space-y-4">
                    {consultations.slice(0, 5).map((consultation) => (
                      <div key={consultation.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {consultation.patients ? 
                                  `${consultation.patients.first_name} ${consultation.patients.last_name}` : 
                                  'Unknown Patient'
                                }
                              </h4>
                              <p className="text-sm text-gray-600">{consultation.chief_complaint}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <ConsultationStatusBadge status={consultation.status} />
                          <span className="text-xs text-gray-500">
                            {new Date(consultation.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Patients Tab */}
          <TabsContent value="patients">
            <PatientList />
          </TabsContent>

          {/* Consultations Tab */}
          <TabsContent value="consultations">
            <ConsultationHistory />
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <CHWCommunication />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <PerformanceMonitor />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DoctorDashboard;
