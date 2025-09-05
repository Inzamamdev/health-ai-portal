import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
const commonTopics = [
  "Headaches & Migraines",
  "Cold & Flu Symptoms",
  "Allergies",
  "Stomach Issues",
  "Sleep Problems",
  "Skin Rashes",
  "Joint Pain",
  "Breathing Difficulties",
];
function PatientInfoSidebar({ setInputValue }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{
    full_name: string;
    age?: number;
    gender?: string;
  } | null>(null);
  const handleTopicClick = (topic: string) => {
    setInputValue(`I have questions about ${topic}`);
  };
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, age, gender")
          .eq("id", user.id)
          .single();
        if (error) {
          console.error("Error fetching profile:", error);
          toast.error("Failed to load profile data");
        } else {
          setProfile(data);
        }
      }
    };
    fetchProfile();
  }, [user]);
  return (
    <Card className="md:col-span-1">
      <CardContent className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Patient Info</h2>
          <div className="space-y-2 text-sm">
            <div>
              <p className="font-medium">
                Name: {profile?.full_name || "Guest User"}
              </p>
            </div>
            <div>
              <p className="font-medium">
                Age: {profile?.age || "Not specified"}
              </p>
            </div>
            <div>
              <p className="font-medium">
                Gender:{" "}
                {profile?.gender?.charAt(0).toUpperCase() +
                  (profile?.gender?.slice(1) || "Not specified")}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Common Topics</h2>
          <div className="space-y-2">
            {commonTopics.map((topic, index) => (
              <button
                key={index}
                className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-md text-sm font-medium transition-colors"
                onClick={() => handleTopicClick(topic)}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default PatientInfoSidebar;
