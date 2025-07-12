
import React from "react";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PickupTimeSelectorProps {
  pickupTime: string;
  onTimeChange: (time: string) => void;
}

const PickupTimeSelector: React.FC<PickupTimeSelectorProps> = ({
  pickupTime,
  onTimeChange
}) => {
  const { toast } = useToast();

  // Get current day and determine opening hours
  const getCurrentDayHours = () => {
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    if (today >= 1 && today <= 5) { // Monday to Friday
      return { open: "08:00", close: "20:00", dayType: "weekday" };
    } else { // Saturday and Sunday
      return { open: "09:00", close: "17:00", dayType: "weekend" };
    }
  };

  // Convert 24-hour format to 12-hour format with AM/PM
  const formatTime12Hour = (time24: string) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const validatePickupTime = (time: string) => {
    if (!time) return true; // Empty time is handled elsewhere
    
    const { open, close } = getCurrentDayHours();
    const [hours, minutes] = time.split(':').map(Number);
    const [openHours, openMinutes] = open.split(':').map(Number);
    const [closeHours, closeMinutes] = close.split(':').map(Number);
    
    const timeInMinutes = hours * 60 + minutes;
    const openInMinutes = openHours * 60 + openMinutes;
    const closeInMinutes = closeHours * 60 + closeMinutes;
    
    return timeInMinutes >= openInMinutes && timeInMinutes <= closeInMinutes;
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value;
    onTimeChange(time);
    
    if (time && !validatePickupTime(time)) {
      const { open, close, dayType } = getCurrentDayHours();
      toast({
        title: "Invalid pickup time",
        description: `Pickup time must be between ${formatTime12Hour(open)} and ${formatTime12Hour(close)} for ${dayType === 'weekday' ? 'weekdays' : 'weekends'}`,
        variant: "destructive",
      });
    }
  };

  const { open, close, dayType } = getCurrentDayHours();

  return (
    <div className="mt-6 mb-4">
      <h3 className="font-medium mb-2">Pick-Up Time *</h3>
      <div className="relative">
        <Clock size={16} className="absolute left-3 top-3 text-gray-500" />
        <Input 
          type="time"
          id="pickupTime" 
          className="pl-9"
          value={pickupTime}
          onChange={handleTimeChange}
          min={open}
          max={close}
          required
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Today's hours: {formatTime12Hour(open)} - {formatTime12Hour(close)} ({dayType === 'weekday' ? 'Mon-Fri' : 'Sat-Sun'})
      </p>

      {pickupTime && !validatePickupTime(pickupTime) && (
        <Alert className="mt-4 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Pickup time must be between {formatTime12Hour(open)} and {formatTime12Hour(close)} for {dayType === 'weekday' ? 'weekdays' : 'weekends'}.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default PickupTimeSelector;
