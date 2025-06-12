
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, FileText, Download, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const ConsultationHistory = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const consultations = [
    {
      id: "C001",
      patientName: "Amina Hassan",
      date: "2024-06-03",
      time: "14:30",
      type: "Emergency Consultation",
      duration: "25 minutes",
      diagnosis: "Severe Preeclampsia",
      treatment: "Immediate referral to specialist center",
      chw: "CHW Sarah Adamu",
      status: "completed",
      notes: "Patient presented with severe headache, visual disturbances, and BP 160/110. Immediate intervention required.",
      followUp: "2024-06-04"
    },
    {
      id: "C002",
      patientName: "Grace Okon",
      date: "2024-06-03",
      time: "12:15",
      type: "Postpartum Follow-up",
      duration: "15 minutes",
      diagnosis: "Normal postpartum recovery",
      treatment: "Continue current care plan",
      chw: "CHW John Okello",
      status: "completed",
      notes: "Patient recovering well post-delivery. No complications noted. Breastfeeding established.",
      followUp: "2024-06-10"
    },
    {
      id: "C003",
      patientName: "Blessing Okoro",
      date: "2024-06-02",
      time: "09:45",
      type: "Routine ANC",
      duration: "20 minutes",
      diagnosis: "Normal pregnancy progression",
      treatment: "Continue prenatal vitamins",
      chw: "CHW David Usman",
      status: "completed",
      notes: "24-week checkup. Fetal movement normal. Patient reports no concerns.",
      followUp: "2024-06-16"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredConsultations = consultations.filter(consultation =>
    consultation.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consultation.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consultation.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Consultation History</h2>
          <p className="text-gray-600">Review past consultations and patient outcomes</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search consultations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="month">This Month</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          {filteredConsultations.map((consultation) => (
            <Card key={consultation.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CardTitle className="text-lg">{consultation.patientName}</CardTitle>
                    <Badge className={getStatusColor(consultation.status)}>
                      {consultation.status}
                    </Badge>
                    <Badge variant="outline">{consultation.type}</Badge>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {consultation.date}
                    <Clock className="h-4 w-4 ml-3 mr-1" />
                    {consultation.time}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Diagnosis</p>
                    <p className="text-sm text-gray-900">{consultation.diagnosis}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Treatment</p>
                    <p className="text-sm text-gray-900">{consultation.treatment}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Duration</p>
                    <p className="text-sm text-gray-900">{consultation.duration}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Clinical Notes</p>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{consultation.notes}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>CHW: {consultation.chw}</span>
                    {consultation.followUp && (
                      <span>Follow-up: {consultation.followUp}</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="today">
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No consultations scheduled for today</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="week">
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Showing consultations from this week</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="month">
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Showing consultations from this month</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConsultationHistory;
