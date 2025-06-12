
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, MapPin, Calendar, Award, BookOpen } from "lucide-react";

interface DoctorProfileProps {
  user: any;
}

const DoctorProfile = ({ user }: DoctorProfileProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const getInitials = () => {
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl px-4 py-2 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 transition-all duration-200"
        >
          <Avatar className="ring-2 ring-blue-200 h-8 w-8">
            <AvatarImage src={user.avatar_url} alt={`Dr. ${user.first_name} ${user.last_name}`} />
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-gray-900">
              Dr. {user.first_name} {user.last_name}
            </p>
            <p className="text-xs text-gray-600">{user.specialization}</p>
          </div>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <Avatar className="ring-2 ring-blue-200 h-12 w-12">
              <AvatarImage src={user.avatar_url} alt={`Dr. ${user.first_name} ${user.last_name}`} />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-bold">Dr. {user.first_name} {user.last_name}</h3>
              <Badge variant="secondary" className="mt-1">
                {user.specialization || 'General Practice'}
              </Badge>
            </div>
          </DialogTitle>
          <DialogDescription>
            View detailed information about this doctor's profile and credentials.
          </DialogDescription>
        </DialogHeader>
        
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-800">Professional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">{user.email}</p>
                <p className="text-xs text-gray-500">Email Address</p>
              </div>
            </div>
            
            {user.phone && (
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.phone}</p>
                  <p className="text-xs text-gray-500">Phone Number</p>
                </div>
              </div>
            )}
            
            {user.license_number && (
              <div className="flex items-center space-x-3">
                <Award className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.license_number}</p>
                  <p className="text-xs text-gray-500">Medical License</p>
                </div>
              </div>
            )}
            
            {user.location && (
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.location}</p>
                  <p className="text-xs text-gray-500">Location</p>
                </div>
              </div>
            )}
            
            {user.years_experience && (
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.years_experience} years</p>
                  <p className="text-xs text-gray-500">Experience</p>
                </div>
              </div>
            )}
            
            {user.bio && (
              <div className="flex items-start space-x-3">
                <BookOpen className="h-4 w-4 text-indigo-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-900">{user.bio}</p>
                  <p className="text-xs text-gray-500 mt-1">Biography</p>
                </div>
              </div>
            )}
            
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`h-2 w-2 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-gray-600">
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {user.created_at && (
                  <span className="text-xs text-gray-500">
                    Joined {new Date(user.created_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default DoctorProfile;
