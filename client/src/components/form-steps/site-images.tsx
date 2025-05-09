"use client";

import type React from "react";

import { useRef, useState, useEffect } from "react";
import type { FormData } from "../project-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Camera,
  Plus,
  Trash2,
  Upload,
  ExternalLink,
  Check,
  X,
} from "lucide-react";
import useImageUploader from "@/app/action/useImageuploader";
import { toast } from "sonner";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

// Types
type ImageCategory =
  | "foundation"
  | "structural"
  | "electrical"
  | "plumbing"
  | "exterior"
  | "aerial";

interface SiteImageInProgress {
  title: string;
  location: string;
  category: ImageCategory;
  files: File[];
  isUploading: boolean;
}

interface SiteImagesProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
}

export default function SiteImages({
  formData,
  updateFormData,
}: SiteImagesProps) {
  const [newImages, setNewImages] = useState<SiteImageInProgress[]>([
    {
      title: "",
      location: "",
      category: "foundation",
      files: [],
      isUploading: false,
    },
  ]);

  // State to track which existing images to keep
  const [imagesToKeep, setImagesToKeep] = useState<string[]>(
    formData.siteImages.map((img) => img.id)
  );

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { uploadFiles } = useImageUploader();

  // Update imagesToKeep when formData.siteImages changes (e.g., on initial load)
  useEffect(() => {
    setImagesToKeep(formData.siteImages.map((img) => img.id));
  }, [formData.siteImages]);

  const handleGroupUpload = async (index: number) => {
    const current = newImages[index];

    if (!current.files.length) {
      toast.error("Please add images before uploading.");
      return;
    }

    const uploadData = new FormData();
    current.files.forEach((file) => {
      uploadData.append("images", file);
    });

    try {
      setNewImages((prev) =>
        prev.map((img, i) =>
          i === index ? { ...img, isUploading: true } : img
        )
      );

      const res = await uploadFiles(uploadData);

      if (!res.fileURL) {
        throw new Error("Failed to generate PDF");
      }

      const uploadedImage = {
        id: `img-${Date.now()}`,
        title: current.title,
        location: current.location,
        category: current.category,
        imageUrl: res.fileURL, // Assuming the fileURL is the image URL
        fileName: current.files[0]?.name || "unknown", // Use the first file's name or a default
      };

      // Get existing images that should be kept
      const keptImages = formData.siteImages.filter((img) =>
        imagesToKeep.includes(img.id)
      );

      // Update with both kept images and new uploads
      updateFormData({
        siteImages: [...keptImages, uploadedImage],
      });

      toast.success("Images uploaded successfully");

      setNewImages([
        {
          title: "",
          location: "",
          category: "foundation",
          files: [],
          isUploading: false,
        },
      ]);
    } catch (error) {
      console.error("Upload error", error);
      toast.error("Upload failed");
    } finally {
      setNewImages((prev) =>
        prev.map((img, i) =>
          i === index ? { ...img, isUploading: false } : img
        )
      );
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.target.files?.length) {
      const files = Array.from(e.target.files);
      setNewImages((prev) =>
        prev.map((img, i) =>
          i === index
            ? {
                ...img,
                files: [...img.files, ...files],
                title: img.title || files[0].name.split(".")[0],
              }
            : img
        )
      );
      toast.success(`${files.length} image(s) added`);
    }
  };

  const handleDeleteImage = (index: number, fileIndex: number) => {
    setNewImages((prev) =>
      prev.map((img, i) =>
        i === index
          ? {
              ...img,
              files: img.files.filter((_, idx) => idx !== fileIndex),
            }
          : img
      )
    );
    toast.success("Image deleted");
  };

  const toggleKeepImage = (id: string) => {
    setImagesToKeep((prev) =>
      prev.includes(id) ? prev.filter((imgId) => imgId !== id) : [...prev, id]
    );
  };

  const removeExistingImage = (id: string) => {
    // Remove from imagesToKeep
    setImagesToKeep((prev) => prev.filter((imgId) => imgId !== id));

    // Remove from formData
    const updated = formData.siteImages.filter((img) => img.id !== id);
    updateFormData({ siteImages: updated });
  };

  const startCamera = async () => {
    try {
      if (navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCameraError(null);
      }
    } catch (error) {
      console.error("Camera access error:", error);
      setCameraError("Failed to access camera. Please check permissions.");
      setIsCameraActive(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current && activeImageIndex !== null) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const newFile = new File([blob], `capture-${Date.now()}.jpg`, {
                type: "image/jpeg",
              });

              setNewImages((prev) =>
                prev.map((img, i) =>
                  i === activeImageIndex
                    ? {
                        ...img,
                        files: [...img.files, newFile],
                        title:
                          img.title ||
                          `Photo ${new Date().toLocaleTimeString()}`,
                      }
                    : img
                )
              );
              toast.success("Image captured successfully");
            }
          },
          "image/jpeg",
          0.9
        );
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setActiveImageIndex(null);
    setCameraError(null);
  };

  const isUploadComplete =
    newImages.length === 1 && newImages[0].files.length === 0;

  // Function to get category label with proper capitalization
  const getCategoryLabel = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      // Clean up any object URLs to prevent memory leaks
      newImages.forEach((img) => {
        img.files.forEach((file) => {
          URL.revokeObjectURL(URL.createObjectURL(file));
        });
      });
    };
  }, [newImages]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-semibold bg-clip-text text-transparent bg-blue-green-gradient">
          Site Images
        </h3>
        <p className="text-gray-600">
          Upload and manage images from your construction site.
        </p>
      </div>

      {/* Existing Images Section */}
      {formData.siteImages.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium text-gray-800">
              Existing Images
            </h4>
            <Badge variant="outline">{formData.siteImages.length} images</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {formData.siteImages.map((image) => (
              <Card
                key={image.id}
                className={`overflow-hidden transition-colors ${
                  imagesToKeep.includes(image.id)
                    ? "border-green-200"
                    : "border-red-200 bg-red-50"
                }`}
              >
                <div className="relative aspect-video w-full">
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className={`bg-white/80 backdrop-blur-sm ${
                        imagesToKeep.includes(image.id)
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                      onClick={() => toggleKeepImage(image.id)}
                    >
                      {imagesToKeep.includes(image.id) ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-white/80 backdrop-blur-sm text-red-600"
                      onClick={() => removeExistingImage(image.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Badge
                    className="absolute bottom-2 left-2 bg-black/70 text-white border-none"
                    variant="outline"
                  >
                    {getCategoryLabel(image.category)}
                  </Badge>
                </div>
                <CardContent className="p-3">
                  <div className="space-y-1">
                    <h5 className="font-medium truncate">{image.title}</h5>
                    {image.location && (
                      <p className="text-sm text-gray-500 truncate">
                        {image.location}
                      </p>
                    )}
                    <div className="flex justify-between items-center mt-2">
                      <a
                        href={image.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" /> View full size
                      </a>
                      <Badge
                        variant="outline"
                        className={
                          imagesToKeep.includes(image.id)
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {imagesToKeep.includes(image.id) ? "Keep" : "Remove"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upload New Images Section */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-800">Upload New Images</h4>

        {newImages.map((img, index) => (
          <Card key={index} className="p-4">
            <CardContent className="space-y-4 p-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="Title"
                  value={img.title}
                  onChange={(e) =>
                    setNewImages((prev) =>
                      prev.map((item, i) =>
                        i === index ? { ...item, title: e.target.value } : item
                      )
                    )
                  }
                />
                <Input
                  placeholder="Location"
                  value={img.location}
                  onChange={(e) =>
                    setNewImages((prev) =>
                      prev.map((item, i) =>
                        i === index
                          ? { ...item, location: e.target.value }
                          : item
                      )
                    )
                  }
                />
                <Select
                  value={img.category}
                  onValueChange={(value: ImageCategory) =>
                    setNewImages((prev) =>
                      prev.map((item, i) =>
                        i === index ? { ...item, category: value } : item
                      )
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "foundation",
                      "structural",
                      "electrical",
                      "plumbing",
                      "exterior",
                      "aerial",
                    ].map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full sm:flex-1">
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, index)}
                    className="w-full"
                  />
                </div>
                <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setIsCameraActive(true);
                      startCamera();
                      setActiveImageIndex(index);
                    }}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleGroupUpload(index)}
                    disabled={img.isUploading || img.files.length === 0}
                    className="w-full sm:w-auto"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {img.isUploading ? "Uploading..." : "Upload Group"}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {img.files.map((file, i) => (
                  <div key={i} className="relative w-full h-32">
                    <Image
                      src={URL.createObjectURL(file) || "/placeholder.svg"}
                      alt={`Preview ${i}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                      className="rounded object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteImage(index, i)}
                      className="absolute top-0 right-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          type="button"
          onClick={() => {
            setNewImages((prev) => [
              ...prev,
              {
                title: "",
                location: "",
                category: "foundation",
                files: [],
                isUploading: false,
              },
            ]);
          }}
          disabled={!isUploadComplete}
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Image Group
        </Button>
      </div>

      {/* Summary of changes */}
      {formData.siteImages.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-medium text-gray-700 mb-2">Image Summary</h4>
          <ul className="space-y-1 text-sm">
            <li className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50">
                {imagesToKeep.length}
              </Badge>
              <span>Images to keep</span>
            </li>
            <li className="flex items-center gap-2">
              <Badge variant="outline" className="bg-red-50">
                {formData.siteImages.length - imagesToKeep.length}
              </Badge>
              <span>Images to remove</span>
            </li>
            <li className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50">
                {newImages.reduce(
                  (total, group) => total + group.files.length,
                  0
                )}
              </Badge>
              <span>New images to upload</span>
            </li>
          </ul>
        </div>
      )}

      {isCameraActive && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-4 w-full max-w-md space-y-4">
            <h3 className="text-lg font-medium">Camera Capture</h3>

            {cameraError ? (
              <div className="text-red-500 p-4 text-center">{cameraError}</div>
            ) : (
              <div className="space-y-2">
                <div className="relative w-full h-64 bg-gray-100 rounded overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    className="w-full h-full object-cover"
                  />
                </div>
                <canvas ref={canvasRef} className="hidden" />
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                onClick={captureImage}
                className="w-full sm:w-auto"
                disabled={!!cameraError}
              >
                Capture
              </Button>
              <Button
                variant="outline"
                onClick={stopCamera}
                className="w-full sm:w-auto"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
