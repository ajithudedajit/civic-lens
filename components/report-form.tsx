"use client";

import { useState, useRef } from "react";
import { X, MapPin, Camera, Video, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { CreateReportData, ReportCategory } from "@/types/report";
import { cn } from "@/lib/utils";
import { LocationPicker } from "./LocationPicker";

interface ReportFormProps {
  onSubmit: (
    data: CreateReportData & {
      coordinates?: [number, number];
      mediaFiles?: File[];
    }
  ) => void;
  onClose: () => void;
}

interface MediaFile {
  file: File;
  preview: string;
  type: "image" | "video";
}

const categories: ReportCategory[] = [
  "Infrastructure",
  "Safety & Security",
  "Environment",
  "Public Health & Sanitation",
  "Public Services & Utilities",
  "Community & Social Issues",
  "Governance & Administration",
  "Business & Regulatory Compliance",
  "Aesthetic / Urban Design",
  "Emergency Incidents",
];

export function ReportForm({ onSubmit, onClose }: ReportFormProps) {
  const [formData, setFormData] = useState<CreateReportData>({
    title: "",
    description: "",
    category: "Infrastructure",
    location: "",
    imageUrl: "",
  });
  const [errors, setErrors] = useState<Partial<CreateReportData>>({});
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    coordinates: [number, number];
    address: string;
  } | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const validateForm = () => {
    const newErrors: Partial<CreateReportData> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!selectedLocation) newErrors.location = "Location is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = mediaFiles.filter((f) => f.type === "image");

    if (imageFiles.length + files.length > 3) {
      alert("Maximum 3 images allowed");
      return;
    }

    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`Image ${file.name} is too large. Maximum size is 5MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        setMediaFiles((prev) => [
          ...prev,
          { file, preview, type: "image" },
        ]);
      };
      reader.readAsDataURL(file);
    });

    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const videoFiles = mediaFiles.filter((f) => f.type === "video");
    if (videoFiles.length >= 1) {
      alert("Maximum 1 video allowed");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      alert("Video is too large. Maximum size is 50MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      setMediaFiles((prev) => [...prev, { file, preview, type: "video" }]);
    };
    reader.readAsDataURL(file);

    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const handleRemoveMedia = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLocationSelect = (location: {
    coordinates: [number, number];
    address: string;
  }) => {
    setSelectedLocation(location);
    setFormData((prev) => ({ ...prev, location: location.address }));
    setShowLocationPicker(false);
    if (errors.location) setErrors((prev) => ({ ...prev, location: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitData: CreateReportData & { coordinates?: [number, number]; mediaFiles?: File[] } = {
      ...formData,
      coordinates: selectedLocation?.coordinates,
      mediaFiles: mediaFiles.map((m) => m.file),
    };

    onSubmit(submitData);

    // Reset form
    setFormData({
      title: "",
      description: "",
      category: "Infrastructure",
      location: "",
      imageUrl: "",
    });
    setMediaFiles([]);
    setSelectedLocation(null);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg border border-border w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Report an Issue</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Brief description of the issue"
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Provide more details about the issue..."
              className={cn("min-h-[100px]", errors.description ? "border-destructive" : "")}
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select
              value={formData.category}
              onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value as ReportCategory }))}
            >
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </Select>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            {selectedLocation ? (
              <div className="space-y-2">
                <div className="p-3 bg-muted/50 rounded-lg border border-border">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground break-words">{selectedLocation.address}</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedLocation.coordinates[1].toFixed(6)}, {selectedLocation.coordinates[0].toFixed(6)}
                      </p>
                    </div>
                  </div>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowLocationPicker(true)} className="w-full">
                  <MapPin className="h-4 w-4 mr-2" /> Change Location
                </Button>
              </div>
            ) : (
              <Button type="button" variant="outline" onClick={() => setShowLocationPicker(true)} className={cn("w-full justify-start text-muted-foreground", errors.location ? "border-destructive" : "")}>
                <MapPin className="h-4 w-4 mr-2" /> Select location on map
              </Button>
            )}
            {errors.location && <p className="text-xs text-destructive">{errors.location}</p>}
          </div>

          {/* Media Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Media (Optional)</label>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => imageInputRef.current?.click()} disabled={mediaFiles.filter(f => f.type === "image").length >= 3} className="flex-1">
                <Camera className="h-4 w-4 mr-2" /> Add Photos ({mediaFiles.filter(f => f.type === "image").length}/3)
              </Button>
              <Button type="button" variant="outline" onClick={() => videoInputRef.current?.click()} disabled={mediaFiles.filter(f => f.type === "video").length >= 1} className="flex-1">
                <Video className="h-4 w-4 mr-2" /> Add Video ({mediaFiles.filter(f => f.type === "video").length}/1)
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              Images: Max 3 files, 5MB each • Video: Max 1 file, 50MB
            </div>

            <input ref={imageInputRef} type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
            <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoSelect} className="hidden" />

            {mediaFiles.length > 0 && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {mediaFiles.map((media, index) => (
                    <div key={index} className="relative group">
                      <div className="relative rounded-lg overflow-hidden border border-border bg-muted">
                        {media.type === "image" ? (
                          <img src={media.preview} alt={`Preview ${index + 1}`} className="w-full h-24 object-cover" />
                        ) : (
                          <div className="w-full h-24 flex items-center justify-center">
                            <div className="text-center">
                              <Video className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground truncate px-2">{media.file.name}</p>
                            </div>
                          </div>
                        )}
                        <Button type="button" onClick={() => handleRemoveMedia(index)} variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">{media.file.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1">Submit Report</Button>
          </div>
        </form>
      </div>

      {showLocationPicker && (
        <LocationPicker
          onLocationSelect={handleLocationSelect}
          onClose={() => setShowLocationPicker(false)}
          initialLocation={selectedLocation || undefined}
        />
      )}
    </div>
  );
}
