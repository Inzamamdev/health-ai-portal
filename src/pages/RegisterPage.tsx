
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Logo from "@/components/shared/Logo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const RegisterPage = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [allergies, setAllergies] = useState("");
  const [currentMedication, setCurrentMedication] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Register the user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      // Check if this is the admin account
      const isAdmin = email === "admin@gmail.com";

      // Create a profile entry with additional patient data
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          is_admin: isAdmin,
          age: parseInt(age),
          gender,
          contact,
          address,
          medical_history: medicalHistory,
          allergies,
          current_medication: currentMedication,
        })
        .eq("id", data.user?.id);

      if (profileError) throw profileError;

      toast.success("Registration successful! Please check your email to confirm your account.");
      navigate("/login");
    } catch (error) {
      console.error("Error during registration:", error);
      toast.error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async () => {
    setLoading(true);
    try {
      // Set email and password fields to admin credentials
      setEmail("admin@gmail.com");
      setPassword("admin");
      setFullName("Administrator");
      
      // Create admin account if it doesn't exist
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("*")
        .eq("full_name", "Administrator")
        .single();
      
      if (!existingUser) {
        const { data, error } = await supabase.auth.signUp({
          email: "admin@gmail.com",
          password: "admin",
          options: {
            data: {
              full_name: "Administrator",
            },
          },
        });

        if (error) throw error;

        // Set admin role in profiles table
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            full_name: "Administrator",
            is_admin: true,
          })
          .eq("id", data.user?.id);

        if (profileError) throw profileError;

        toast.success("Admin account created successfully. You can now log in.");
      } else {
        toast.info("Admin account already exists. Use admin@gmail.com and password 'admin' to log in.");
      }
      
      navigate("/login");
    } catch (error) {
      console.error("Error creating admin account:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create admin account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="mb-4">
            <Logo />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Patient Registration</CardTitle>
          <CardDescription className="text-center">
            Enter patient details to create a new record
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <form onSubmit={handleRegister}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName" 
                    placeholder="Enter full name" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input 
                    id="age" 
                    placeholder="Enter age" 
                    type="number" 
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <select 
                    id="gender" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="" disabled>Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact">Contact Number</Label>
                  <Input 
                    id="contact" 
                    placeholder="Enter contact number" 
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2 mt-4">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  placeholder="name@example.com" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2 mt-4">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  placeholder="Enter password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2 mt-4">
                <Label htmlFor="address">Address</Label>
                <Input 
                  id="address" 
                  placeholder="Enter address" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              
              <div className="space-y-2 mt-4">
                <Label htmlFor="medicalHistory">Medical History</Label>
                <textarea 
                  id="medicalHistory" 
                  placeholder="Enter past medical conditions, surgeries, etc."
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={medicalHistory}
                  onChange={(e) => setMedicalHistory(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="allergies">Allergies</Label>
                  <textarea 
                    id="allergies" 
                    placeholder="List any allergies"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentMedication">Current Medication</Label>
                  <textarea 
                    id="currentMedication" 
                    placeholder="List any current medications"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={currentMedication}
                    onChange={(e) => setCurrentMedication(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex justify-between mt-6">
                <Button 
                  variant="outline" 
                  type="button"
                  onClick={() => navigate("/login")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Registering..." : "Register Patient"}
                </Button>
              </div>
            </form>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>
            
            <Button 
              variant="secondary" 
              className="w-full" 
              onClick={handleAdminLogin}
              disabled={loading}
            >
              {loading ? "Creating Admin..." : "Create Admin Account"}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RegisterPage;
