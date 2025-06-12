
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/card";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";
import { Badge } from "@/components/shared/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shared/avatar";
import { Textarea } from "@/components/shared/textarea";
import { 
  MessageSquare, 
  Video, 
  Phone, 
  Send, 
  Paperclip, 
  Search,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CHWCommunication = () => {
  const [selectedCHW, setSelectedCHW] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const chws = [
    {
      id: "1",
      name: "Sarah Adamu",
      location: "Kano Rural Health Center",
      status: "online",
      specialization: "Maternal Care",
      activeCases: 8,
      lastSeen: "Active now",
      unreadMessages: 3,
      recentActivity: "Submitted critical patient data"
    },
    {
      id: "2",
      name: "John Okello",
      location: "Cross River CHC",
      status: "online",
      specialization: "Postpartum Care",
      activeCases: 5,
      lastSeen: "5 minutes ago",
      unreadMessages: 1,
      recentActivity: "Completed patient assessment"
    },
    {
      id: "3",
      name: "Mary Ogbu",
      location: "Kaduna Health Post",
      status: "busy",
      specialization: "Emergency Response",
      activeCases: 12,
      lastSeen: "2 hours ago",
      unreadMessages: 0,
      recentActivity: "Attending emergency delivery"
    },
    {
      id: "4",
      name: "David Usman",
      location: "Enugu Primary Care",
      status: "offline",
      specialization: "Routine ANC",
      activeCases: 6,
      lastSeen: "1 day ago",
      unreadMessages: 0,
      recentActivity: "Scheduled routine checkups"
    }
  ];

  const messages = [
    {
      id: "1",
      sender: "chw",
      content: "Dr. Ifeoma, I have a patient with severe preeclampsia. BP is 160/110 and she's experiencing visual disturbances.",
      timestamp: "10:30 AM",
      urgent: true
    },
    {
      id: "2",
      sender: "doctor",
      content: "Thank you for the urgent update. Please start her on antihypertensive medication immediately and prepare for emergency referral.",
      timestamp: "10:32 AM",
      urgent: false
    },
    {
      id: "3",
      sender: "chw",
      content: "Medication administered. Ambulance has been called. Patient is stable but still complaining of headache.",
      timestamp: "10:45 AM",
      urgent: false
    },
    {
      id: "4",
      sender: "doctor",
      content: "Excellent work. Please monitor her closely and update me on the ambulance ETA. I'll coordinate with the receiving hospital.",
      timestamp: "10:47 AM",
      urgent: false
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-green-500";
      case "busy": return "bg-yellow-500";
      case "offline": return "bg-gray-400";
      default: return "bg-gray-400";
    }
  };

  const handleSendMessage = () => {
    if (message.trim() && selectedCHW) {
      toast({
        title: "Message sent",
        description: `Message sent to ${selectedCHW.name}`,
      });
      setMessage("");
    }
  };

  const handleVideoCall = () => {
    if (selectedCHW) {
      toast({
        title: "Video call initiated",
        description: `Calling ${selectedCHW.name}...`,
      });
    }
  };

  const handleVoiceCall = () => {
    if (selectedCHW) {
      toast({
        title: "Voice call initiated",
        description: `Calling ${selectedCHW.name}...`,
      });
    }
  };

  const filteredCHWs = chws.filter(chw =>
    chw.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chw.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">CHW Communication</h2>
        <p className="text-gray-600">Connect and collaborate with Community Health Workers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* CHW List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Active CHWs</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search CHWs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {filteredCHWs.map((chw) => (
                <div
                  key={chw.id}
                  onClick={() => setSelectedCHW(chw)}
                  className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 border-l-4 ${
                    selectedCHW?.id === chw.id ? 'bg-blue-50 border-l-blue-500' : 'border-l-transparent'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={`/placeholder-chw-${chw.id}.jpg`} />
                        <AvatarFallback>{chw.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(chw.status)}`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">{chw.name}</p>
                        {chw.unreadMessages > 0 && (
                          <Badge className="bg-red-500 text-white h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                            {chw.unreadMessages}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span className="truncate">{chw.location}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{chw.specialization}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">{chw.activeCases} active cases</span>
                        <span className="text-xs text-gray-400">{chw.lastSeen}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="lg:col-span-2 flex flex-col">
          {selectedCHW ? (
            <>
              {/* Chat Header */}
              <CardHeader className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={`/placeholder-chw-${selectedCHW.id}.jpg`} />
                        <AvatarFallback>{selectedCHW.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(selectedCHW.status)}`}></div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedCHW.name}</h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-3 w-3 mr-1" />
                        {selectedCHW.location}
                      </div>
                      <p className="text-xs text-gray-600">{selectedCHW.recentActivity}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="icon" onClick={handleVoiceCall}>
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleVideoCall}>
                      <Video className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'doctor' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.sender === 'doctor' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      } ${msg.urgent ? 'border-l-4 border-red-500' : ''}`}>
                        {msg.urgent && (
                          <div className="flex items-center mb-1">
                            <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                            <span className="text-xs font-medium text-red-600">URGENT</span>
                          </div>
                        )}
                        <p className="text-sm">{msg.content}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className={`text-xs ${msg.sender === 'doctor' ? 'text-blue-100' : 'text-gray-500'}`}>
                            {msg.timestamp}
                          </span>
                          {msg.sender === 'doctor' && (
                            <CheckCircle className="h-3 w-3 text-blue-200" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex items-end space-x-2">
                  <div className="flex-1">
                    <Textarea
                      placeholder="Type your message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="resize-none"
                      rows={2}
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <Button variant="outline" size="icon">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button onClick={handleSendMessage} className="bg-blue-600 hover:bg-blue-700">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Select a CHW to start communicating</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CHWCommunication;
