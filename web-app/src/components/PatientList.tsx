
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Filter, Eye, MessageSquare, Video, Phone, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PatientList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const patients = [
    {
      id: "1",
      name: "Amina Hassan",
      age: 28,
      gestationalWeek: 32,
      condition: "Preeclampsia",
      priority: "critical",
      chw: "CHW Sarah Adamu",
      lastUpdate: "5 min ago",
      vitals: { bp: "160/110", hr: 95, temp: 37.2 },
      location: "Kano Rural Health Center"
    },
    {
      id: "2",
      name: "Grace Okon",
      age: 24,
      gestationalWeek: 0,
      condition: "Postpartum Day 3",
      priority: "high",
      chw: "CHW John Okello",
      lastUpdate: "12 min ago",
      vitals: { bp: "130/85", hr: 88, temp: 36.8 },
      location: "Cross River CHC"
    },
    {
      id: "3",
      name: "Fatima Ibrahim",
      age: 30,
      gestationalWeek: 38,
      condition: "Active Labor",
      priority: "critical",
      chw: "CHW Mary Ogbu",
      lastUpdate: "25 min ago",
      vitals: { bp: "140/90", hr: 102, temp: 37.0 },
      location: "Kaduna Health Post"
    },
    {
      id: "4",
      name: "Blessing Okoro",
      age: 26,
      gestationalWeek: 24,
      condition: "Routine ANC",
      priority: "normal",
      chw: "CHW David Usman",
      lastUpdate: "1 hour ago",
      vitals: { bp: "120/80", hr: 76, temp: 36.5 },
      location: "Enugu Primary Care"
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-100 text-red-800 border-red-200";
      case "high": return "bg-orange-100 text-orange-800 border-orange-200";
      case "normal": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleAction = (action: string, patientName: string) => {
    toast({
      title: `${action} initiated`,
      description: `Connecting with patient ${patientName}...`,
    });
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.condition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Patient Management</h2>
          <p className="text-gray-600">Monitor and manage patient consultations</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {filteredPatients.map((patient) => (
          <Card key={patient.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={`/placeholder-patient-${patient.id}.jpg`} />
                    <AvatarFallback>{patient.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{patient.name}</h3>
                      <Badge className={getPriorityColor(patient.priority)}>
                        {patient.priority}
                      </Badge>
                      {patient.gestationalWeek > 0 && (
                        <Badge variant="outline">
                          {patient.gestationalWeek} weeks
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Age & Condition</p>
                        <p className="font-medium">{patient.age} years old</p>
                        <p className="text-blue-600">{patient.condition}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Vital Signs</p>
                        <p className="font-medium">BP: {patient.vitals.bp}</p>
                        <p className="font-medium">HR: {patient.vitals.hr} | T: {patient.vitals.temp}°C</p>
                      </div>
                      <div>
                        <p className="text-gray-500">CHW & Location</p>
                        <p className="font-medium">{patient.chw}</p>
                        <p className="text-gray-600">{patient.location}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Last Update</p>
                        <p className="font-medium">{patient.lastUpdate}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <Button
                    size="sm"
                    onClick={() => handleAction("Video consultation", patient.name)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Video Call
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAction("Voice call", patient.name)}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAction("Chat", patient.name)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAction("View profile", patient.name)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PatientList;
