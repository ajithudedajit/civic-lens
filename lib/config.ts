import {
  AlertTriangle,
  Wrench,
  Palette,
  Leaf,
  Shield,
  Heart,
  Users,
  Building,
  Briefcase,
  Zap,
} from "lucide-react";
import { ReportCategory } from "@/types/report";

export const categoryConfig: Record<
  ReportCategory,
  { color: string; icon: any; label: string }
> = {
  Infrastructure: {
    color: "#3b82f6",
    icon: Wrench,
    label: "Infrastructure",
  },
  "Safety & Security": {
    color: "#ef4444",
    icon: Shield,
    label: "Safety & Security",
  },
  Environment: {
    color: "#22c55e",
    icon: Leaf,
    label: "Environment",
  },
  "Public Health & Sanitation": {
    color: "#f59e0b",
    icon: Heart,
    label: "Public Health & Sanitation",
  },
  "Public Services & Utilities": {
    color: "#8b5cf6",
    icon: Zap,
    label: "Public Services & Utilities",
  },
  "Community & Social Issues": {
    color: "#06b6d4",
    icon: Users,
    label: "Community & Social Issues",
  },
  "Governance & Administration": {
    color: "#84cc16",
    icon: Building,
    label: "Governance & Administration",
  },
  "Business & Regulatory Compliance": {
    color: "#f97316",
    icon: Briefcase,
    label: "Business & Regulatory Compliance",
  },
  "Aesthetic / Urban Design": {
    color: "#a855f7",
    icon: Palette,
    label: "Aesthetic / Urban Design",
  },
  "Emergency Incidents": {
    color: "#dc2626",
    icon: AlertTriangle,
    label: "Emergency Incidents",
  },
};
