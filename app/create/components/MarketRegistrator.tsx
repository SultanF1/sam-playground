"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

interface RegistrationResponse {
  success: boolean;
  message: string;
}

export default function MarketRegistrator() {
  const [files, setFiles] = useState<File[]>([]);
  const [registrationStatus, setRegistrationStatus] = useState<
    "idle" | "registering" | "success" | "error"
  >("idle");
  const { toast } = useToast();
  const [marketData, setMarketData] = useState({
    name: "",
    prompt: "",
    temperature: 0.5,
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const validFiles = acceptedFiles.filter((file) => {
        if (file.size > MAX_FILE_SIZE) {
          toast({
            title: "File too large",
            description: `${file.name} exceeds the 5MB limit.`,
            variant: "destructive",
          });
          return false;
        }
        if (file.type !== "application/pdf" && file.type !== "text/plain") {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not a PDF or text file.`,
            variant: "destructive",
          });
          return false;
        }
        return true;
      });

      setFiles((prevFiles) => [...prevFiles, ...validFiles]);
    },
    [toast],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"], "text/plain": [".txt", ".text"] },
    multiple: true,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setMarketData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleTemperatureChange = (value: number[]) => {
    setMarketData((prevData) => ({
      ...prevData,
      temperature: value[0],
    }));
  };

  const registerMarket = async () => {
    if (
      !marketData.name.trim() ||
      !marketData.prompt.trim() ||
      files.length === 0
    )
      return;

    setRegistrationStatus("registering");

    try {
      const formData = new FormData();
      formData.append("market", marketData.name);
      formData.append("prompt", marketData.prompt);
      formData.append("temperature", marketData.temperature.toString());
      files.forEach((file) => formData.append("files", file));

      const response = await fetch(`${process.env.beUrl}/markets/register`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      const result: RegistrationResponse = await response.json();

      if (result.success) {
        setRegistrationStatus("success");
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      setRegistrationStatus("error");
      toast({
        title: "Registration failed",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const resetRegistration = () => {
    setMarketData({
      name: "",
      prompt: "",
      temperature: 0.5,
    });
    setFiles([]);
    setRegistrationStatus("idle");
  };

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (registrationStatus === "success") {
      const timer = setTimeout(() => {
        resetRegistration();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [registrationStatus]);

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      {registrationStatus === "success" ? (
        <div className="text-center">
          <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-16 h-16 text-green-500 animate-bounce" />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-green-700">
            Market Successfully Registered!
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Congratulations! Your market {marketData.name} has been successfully
            registered.
          </p>
          <Button
            onClick={resetRegistration}
            className="flex items-center mx-auto"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Register Another Market
          </Button>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-6 text-center">
            Register a Market
          </h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Market Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter the name of the market"
                value={marketData.name}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="prompt">Prompt</Label>
              <Textarea
                id="prompt"
                name="prompt"
                placeholder="Enter the prompt string"
                value={marketData.prompt}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="temperature">
                Temperature: {marketData.temperature.toFixed(2)}
              </Label>
              <Slider
                id="temperature"
                min={0}
                max={1}
                step={0.01}
                value={[marketData.temperature]}
                onValueChange={handleTemperatureChange}
              />
            </div>
            <div>
              <Label>Files</Label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-primary bg-primary/10"
                    : "border-gray-300 hover:border-primary"
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center">
                  <Upload className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="text-gray-600">
                    Drag & drop PDF or text files here, or click to select
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum file size: 5MB each
                  </p>
                </div>
              </div>
            </div>
            {files.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Uploaded Files:</h3>
                <ul className="space-y-2">
                  {files.map((file, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between bg-gray-100 p-2 rounded"
                    >
                      <span className="flex items-center">
                        <File className="w-4 h-4 mr-2 text-primary" />
                        {file.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="flex justify-center mt-6">
            <Button
              onClick={registerMarket}
              disabled={
                registrationStatus === "registering" ||
                !marketData.name.trim() ||
                !marketData.prompt.trim() ||
                files.length === 0
              }
              className="flex items-center"
            >
              {registrationStatus === "registering" ? (
                <>
                  <AlertCircle className="w-4 h-4 mr-2 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Register Market
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
