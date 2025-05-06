"use client";
import Link from "next/link";
import {
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Users,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RecentImages } from "@/components/recent-images";
import { useSelector } from "react-redux";
import { RootState } from "@/state/store";

export default function ProjectOverview() {
  const {
    currentProject: projectData,
    status,
    error,
  } = useSelector((state: RootState) => {
    return state.project;
  });

  console.log(projectData);
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate days remaining
  const calculateDaysRemaining = () => {
    const today = new Date();
    const completionDate = new Date(projectData?.endDate);
    const diffTime = completionDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="container py-10">
      <div className="space-y-8">
        {/* Project Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {projectData?.projectName || "Project Name Unavailable"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {projectData?.clientName}
            </p>
          </div>
        </div>
        {/* Project Info Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget</CardTitle>
              <span>ETB</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(projectData?.budget?.spent || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                of {formatCurrency(projectData?.budget?.total || 0)} (
                {Math.round(
                  ((projectData?.budget?.spent || 0) /
                    (projectData?.budget?.total || 1)) *
                    100
                )}
                % %)
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Timeline</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatDate(projectData?.startDate as Date)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                to {formatDate(projectData?.dueDate as Date)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Size</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projectData?.team?.totalWorkers || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                workers on site
              </p>
            </CardContent>
          </Card>
        </div>
        {/* Project Details and Recent Images */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{projectData?.location}</span>
              </div>
              <div>
                <h3 className="font-medium mb-2">Key Team Members</h3>
                <ul className="space-y-1 text-sm">
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">
                      Project Manager:
                    </span>
                    <span>
                      {projectData?.team
                        ? projectData.team.projectManager
                        : "None"}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">
                      Site Engineer:
                    </span>
                    <span>
                      {projectData?.team
                        ? projectData.team.siteManager
                        : "None"}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">
                      Civil Engineer:
                    </span>
                    <span>
                      {projectData?.team
                        ? projectData.team.civilManager
                        : "None"}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">
                      Architectural Lead:
                    </span>
                    <span>
                      {projectData?.team
                        ? projectData.team.architecturalLead
                        : "None"}
                    </span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
        Upcoming Milestones
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Milestones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.isArray(projectData?.milestones) &&
                projectData?.milestones.map((milestone, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">{milestone?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(milestone.date)}
                        </p>
                      </div>
                    </div>
                    <Badge status={milestone.status} />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Status badge component
function Badge({ status }: { status: string }) {
  console.log("Status:", status);
  const getStatusStyles = () => {
    switch (status) {
      case "ontrack":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "atrisk":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "ontrack":
        return "On Track";
      case "atrisk":
        return "At Risk";
      default:
        return "Unknown";
    }
  };

  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyles()}`}
    >
      {getStatusText()}
    </span>
  );
}
