
import { useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Upload, Brain, CircleX } from "lucide-react";

const XrayMriPage = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">X-Ray & MRI Analysis</h1>
          <p className="text-gray-600 mb-8">
            Upload your medical scans for AI-powered analysis and interpretation
          </p>

          <Tabs defaultValue="xray" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="xray">X-Ray Analysis</TabsTrigger>
              <TabsTrigger value="mri">MRI Analysis</TabsTrigger>
              <TabsTrigger value="ct">CT Scan Analysis</TabsTrigger>
            </TabsList>
            
            <TabsContent value="xray">
              <XrayAnalysisTab />
            </TabsContent>
            
            <TabsContent value="mri">
              <MriAnalysisTab />
            </TabsContent>
            
            <TabsContent value="ct">
              <CtAnalysisTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

const XrayAnalysisTab = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("");
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
    if (!selectedFile || !selectedType) return;
    
    setAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      setResults("The X-ray appears normal with no signs of fractures, dislocations, or other abnormalities. Bone density appears normal for age. Joint spaces are well-maintained. No evidence of arthritis or other degenerative changes.");
      setAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-6">Upload an X-ray Image</h2>
          
          <div className="space-y-4 mb-6">
            <div>
              <Label htmlFor="xray-type">X-ray Type</Label>
              <Select onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select X-ray type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chest">Chest X-ray</SelectItem>
                  <SelectItem value="bone">Bone X-ray</SelectItem>
                  <SelectItem value="joint">Joint X-ray</SelectItem>
                  <SelectItem value="dental">Dental X-ray</SelectItem>
                  <SelectItem value="abdominal">Abdominal X-ray</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6">
            {previewUrl ? (
              <div className="mb-4">
                <img 
                  src={previewUrl} 
                  alt="X-ray Preview" 
                  className="max-h-64 mx-auto" 
                />
              </div>
            ) : (
              <div className="py-8 text-center">
                <CircleX className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <p className="text-gray-500">
                  Click to upload or drag and drop
                </p>
                <p className="text-gray-400 text-sm">
                  JPEG, PNG, JPG (max. 5MB)
                </p>
              </div>
            )}
            
            <div className="text-center mt-4">
              <input
                type="file"
                id="xray-upload"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              <label htmlFor="xray-upload">
                <Button 
                  variant="outline" 
                  className="mr-2"
                  onClick={() => document.getElementById("xray-upload")?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Image
                </Button>
              </label>
              
              <Button 
                onClick={handleAnalyze}
                disabled={!selectedFile || !selectedType || analyzing}
                className="bg-primary hover:bg-primary/90"
              >
                {analyzing ? "Analyzing..." : "Analyze Image"}
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            <p><strong>For best results:</strong> Ensure the X-ray is clearly visible and properly oriented. Upload the highest quality image available.</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-6">X-ray Analysis Results</h2>
          
          {results ? (
            <div>
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg mb-6">
                <h3 className="font-medium text-gray-900 mb-2">AI Assessment</h3>
                <p className="text-gray-700">{results}</p>
              </div>
              
              <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Important Note</h3>
                <p className="text-gray-700">
                  This AI analysis is intended as a preliminary assessment only. It should not replace professional medical evaluation.
                </p>
              </div>
              
              <Button className="w-full bg-primary hover:bg-primary/90">
                Consult with a Specialist
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-gray-100 p-6 mb-4">
                <CircleX className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-gray-500">
                Upload and analyze an X-ray to see the assessment results
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const MriAnalysisTab = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("");
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
    if (!selectedFile || !selectedType) return;
    
    setAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      setResults("The MRI scan shows normal brain morphology with no evidence of structural abnormalities. Ventricles are of normal size and configuration. Gray-white matter differentiation is preserved. No evidence of masses, hemorrhage, or acute infarction. Midline structures are in normal alignment.");
      setAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-6">Upload an MRI Scan</h2>
          
          <div className="space-y-4 mb-6">
            <div>
              <Label htmlFor="mri-type">MRI Type</Label>
              <Select onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select MRI type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brain">Brain MRI</SelectItem>
                  <SelectItem value="spine">Spine MRI</SelectItem>
                  <SelectItem value="knee">Knee MRI</SelectItem>
                  <SelectItem value="shoulder">Shoulder MRI</SelectItem>
                  <SelectItem value="abdomen">Abdominal MRI</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6">
            {previewUrl ? (
              <div className="mb-4">
                <img 
                  src={previewUrl} 
                  alt="MRI Preview" 
                  className="max-h-64 mx-auto" 
                />
              </div>
            ) : (
              <div className="py-8 text-center">
                <Brain className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <p className="text-gray-500">
                  Click to upload or drag and drop
                </p>
                <p className="text-gray-400 text-sm">
                  JPEG, PNG, JPG (max. 5MB)
                </p>
              </div>
            )}
            
            <div className="text-center mt-4">
              <input
                type="file"
                id="mri-upload"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              <label htmlFor="mri-upload">
                <Button 
                  variant="outline" 
                  className="mr-2"
                  onClick={() => document.getElementById("mri-upload")?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Image
                </Button>
              </label>
              
              <Button 
                onClick={handleAnalyze}
                disabled={!selectedFile || !selectedType || analyzing}
                className="bg-primary hover:bg-primary/90"
              >
                {analyzing ? "Analyzing..." : "Analyze Image"}
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            <p><strong>For best results:</strong> Upload a clear MRI image in DICOM format if possible, or a high-quality JPEG/PNG of the scan.</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-6">MRI Analysis Results</h2>
          
          {results ? (
            <div>
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg mb-6">
                <h3 className="font-medium text-gray-900 mb-2">AI Assessment</h3>
                <p className="text-gray-700">{results}</p>
              </div>
              
              <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Important Note</h3>
                <p className="text-gray-700">
                  This AI analysis is intended as a preliminary assessment only. It should not replace professional medical evaluation.
                </p>
              </div>
              
              <Button className="w-full bg-primary hover:bg-primary/90">
                Consult with a Specialist
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-gray-100 p-6 mb-4">
                <Brain className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-gray-500">
                Upload and analyze an MRI to see the assessment results
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const CtAnalysisTab = () => {
  // Similar implementation as MRI tab with CT-specific content
  return (
    <div className="text-center py-12">
      <h2 className="text-xl font-semibold">CT Scan Analysis Coming Soon</h2>
      <p className="text-gray-600 mt-2">
        We're currently enhancing our CT scan analysis capabilities.
        Please check back soon for this feature.
      </p>
    </div>
  );
};

export default XrayMriPage;
