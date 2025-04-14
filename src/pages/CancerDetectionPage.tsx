
import { useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Upload } from "lucide-react";

type CancerType = "oral" | "skin" | "breast";

const CancerDetectionPage = () => {
  const [selectedTab, setSelectedTab] = useState<CancerType>("oral");
  
  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Cancer Detection</h1>
          <p className="text-gray-600 mb-8">
            Upload images for AI-powered screening and early detection
          </p>

          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              This tool is for preliminary screening only and does not replace professional medical diagnosis. 
              Always consult with a healthcare provider for proper evaluation.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="oral" className="w-full" onValueChange={(value) => setSelectedTab(value as CancerType)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="oral">Oral Cancer</TabsTrigger>
              <TabsTrigger value="skin">Skin Cancer</TabsTrigger>
              <TabsTrigger value="breast">Breast Cancer</TabsTrigger>
            </TabsList>
            
            <TabsContent value="oral">
              <CancerDetectionTab 
                type="oral" 
                title="Oral Cancer Detection"
                description="Upload a clear image of your oral cavity for AI-powered assessment"
                uploadInstructions="Ensure good lighting, open your mouth wide, and center the camera on the area of concern."
                riskFactors={[
                  "Tobacco use of any kind",
                  "Heavy alcohol consumption",
                  "Excessive sun exposure to lips",
                  "HPV infection",
                  "Family history of cancer"
                ]}
                preventions={[
                  "Regular dental check-ups",
                  "Avoid tobacco products",
                  "Limit alcohol consumption",
                  "Use lip balm with SPF protection",
                  "Practice good oral hygiene"
                ]}
              />
            </TabsContent>
            
            <TabsContent value="skin">
              <CancerDetectionTab 
                type="skin" 
                title="Skin Cancer Detection"
                description="Upload a clear image of the skin lesion or mole for AI-powered assessment"
                uploadInstructions="Take a well-lit, close-up photo of the skin lesion or mole without applying filters."
                riskFactors={[
                  "Excessive UV exposure",
                  "History of sunburns",
                  "Fair skin, light hair",
                  "Family history of skin cancer",
                  "Multiple or unusual moles"
                ]}
                preventions={[
                  "Apply sunscreen regularly",
                  "Wear protective clothing",
                  "Avoid tanning beds",
                  "Regular skin self-exams",
                  "Annual dermatology check-ups"
                ]}
              />
            </TabsContent>
            
            <TabsContent value="breast">
              <CancerDetectionTab 
                type="breast" 
                title="Breast Cancer Detection"
                description="Upload a mammogram image for AI-powered preliminary assessment"
                uploadInstructions="Only upload mammogram images. This tool cannot analyze regular photos."
                riskFactors={[
                  "Family history of breast cancer",
                  "Age (risk increases with age)",
                  "Genetics (BRCA1 and BRCA2 mutations)",
                  "Dense breast tissue",
                  "Early menstruation or late menopause"
                ]}
                preventions={[
                  "Regular mammograms",
                  "Monthly self-exams",
                  "Maintain healthy weight",
                  "Limit alcohol consumption",
                  "Regular physical activity"
                ]}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

interface CancerDetectionTabProps {
  type: CancerType;
  title: string;
  description: string;
  uploadInstructions: string;
  riskFactors: string[];
  preventions: string[];
}

const CancerDetectionTab = ({ 
  type, 
  title, 
  description, 
  uploadInstructions,
  riskFactors,
  preventions 
}: CancerDetectionTabProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = () => {
    if (!selectedFile) return;
    
    setAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      setResults("No concerning indicators detected. However, regular medical check-ups are recommended for proper evaluation.");
      setAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="py-4">
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="text-gray-600 mb-6">{description}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Upload an Image</h3>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4 text-center">
              {previewUrl ? (
                <div className="mb-4">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="max-h-64 mx-auto rounded-lg" 
                  />
                </div>
              ) : (
                <div className="py-8">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-gray-500 mb-2">
                    Drag and drop your photo here or click to browse
                  </p>
                </div>
              )}
              
              <div className="mt-2">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <label htmlFor="file-upload">
                  <Button 
                    variant="outline" 
                    className="mr-2"
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Image
                  </Button>
                </label>
                
                {selectedFile && (
                  <Button 
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {analyzing ? "Analyzing..." : "Analyze Image"}
                  </Button>
                )}
              </div>
            </div>
            
            <p className="text-sm text-gray-500">
              <strong>For accurate results:</strong> {uploadInstructions}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Analysis Results</h3>
            
            {results ? (
              <div className="mb-6">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                  <p className="text-green-800">{results}</p>
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90">
                  Get Professional Consultation
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-gray-100 p-6 mb-4">
                  <AlertCircle className="h-10 w-10 text-gray-400" />
                </div>
                <p className="text-gray-500">
                  Upload and analyze a photo to see your assessment results
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card className="bg-blue-50">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-3">Risk Factors</h3>
            <ul className="space-y-2">
              {riskFactors.map((factor, index) => (
                <li key={index} className="flex items-center">
                  <span className="mr-2 text-xs">•</span>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-3">Prevention</h3>
            <ul className="space-y-2">
              {preventions.map((prevention, index) => (
                <li key={index} className="flex items-center">
                  <span className="mr-2 text-xs">•</span>
                  <span>{prevention}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CancerDetectionPage;
