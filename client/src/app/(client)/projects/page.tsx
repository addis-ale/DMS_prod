"use client";

import ProjectCard from "@/components/project-card";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import type { AppDispatch } from "@/state/store";
import { useDispatch } from "react-redux";
import type { RootState } from "@/state/store";
import {
  fetchProjects,
  setTotalPages,
  setCurrentPage,
} from "@/state/project/projectSlice";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useRouter } from "next/navigation";
import ErrorState from "@/components/error-state";

export default function ProjectsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { currentPage, projects, status, error, totalPages } = useSelector(
    (state: RootState) => {
      return state.project;
    }
  );

  const router = useRouter();
  useEffect(() => {
    dispatch(fetchProjects(currentPage));
  }, [currentPage, dispatch]);

  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
    console.log(currentPage, totalPages);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };
  const handleNext = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  if (status === "loading") {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Projects</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-200 rounded-lg p-4 animate-pulse h-64"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return <ErrorState />;
  }

  // Use the actual pagination data from the API

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
      </div>
      {!projects || projects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No projects found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                name={project.projectName}
                client={project.clientName}
                location={project.location}
                startDate={new Date(project.startDate).toLocaleDateString()}
                endDate={new Date(project.endDate).toLocaleDateString()}
                imageUrl={project.coverImage}
              />
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={handlePrevious}
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => {
                    // Show first page, current page, last page, and pages adjacent to current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => handlePageChange(page)}
                            isActive={page === currentPage}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }

                    // Show ellipsis for gaps
                    if (
                      (page === 2 && currentPage > 3) ||
                      (page === totalPages - 1 && currentPage < totalPages - 2)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }

                    return null;
                  }
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={handleNext}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </>
      )}
    </div>
  );
}
