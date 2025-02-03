"use client";

import React, { JSX, useMemo } from "react"; // Import React
import { SidebarFooterContent } from "@/components/sidebar/sidebar-footer-content";
import { CustomSidebarHeader } from "@/components/sidebar/sidebar-header";
import { SidebarMainContent } from "@/components/sidebar/sidebar-main-content";
import type { Project } from "@shared/types";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@shared/ui/components/ui/sidebar";
import { Bot, EditIcon, Trash2Icon } from "lucide-react";
import { SidebarOptions } from "@/config/sidebar-config";
import { useModalsStateStore } from "@/store/modals-store";
import { useShallow } from "zustand/react/shallow";
import { getErrorMessage } from "@/lib/get-error-message";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useConfirmationModalStore } from "@/store/confirmation-modal-store";
import {
  deleteProjectFunction,
  getUserProjects,
} from "@/actions/projects/server-actions";
import { toast } from "sonner";

/**
 * Props for the AppSidebar component
 * @interface AppSidebarProps
 * @extends {React.ComponentProps<typeof Sidebar>}
 * @property {Project[]} userProjects - Array of user projects
 */
interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userProjects: Project[];
}

/**
 * AppSidebar component renders the main sidebar of the application
 * @param {userProjects} userProjects - Array of user projects
 * @param {AppSidebarProps} props - Component props
 * @returns {JSX.Element} Rendered app sidebar
 */
export function AppSidebar({
  userProjects,
  ...props
}: Readonly<AppSidebarProps>): JSX.Element {
  const queryClient = useQueryClient();
  const { projectModal } = useModalsStateStore(useShallow((state) => state));
  const {
    setIsModalOpen,
    setIsPending,
    setSaveButtonDisabled,
    setConfirmationModalBasicState,
  } = useConfirmationModalStore();

  const { data } = useQuery({
    queryKey: ["user-projects"],
    queryFn: getUserProjects,
    initialData: userProjects,
  });

  const { mutate } = useMutation({
    mutationFn: deleteProjectFunction,
    onSuccess: () => {
      toast.success("Deleted project successfully", {
        id: "delete-project",
      });
      queryClient.invalidateQueries({ queryKey: ["user-projects"] });
    },
    onError: () => {
      toast.error("Failed to delete project", {
        id: "delete-project",
      });
    },
  });

  const mainContentData = useMemo(() => {
    const filteredNavMain = SidebarOptions.navMain.filter(
      (item) => item.title !== "Projects",
    );
    const projectsItem = {
      title: "Projects",
      url: "#",
      icon: Bot,
      action: () => {
        projectModal.setMode("create");
        projectModal.setIsOpen(true);
      },
      items: data.map((project) => ({
        title: project.title,
        url: `/projects/${project.id}`,
        color: project.color,
        actions: [
          {
            icon: EditIcon,
            tooltipInfo: `Edit ${project.title}`,
            action: () => {
              projectModal.setMode("edit");
              projectModal.setData(project);
              projectModal.setIsOpen(true);
            },
          },
          {
            icon: Trash2Icon,
            tooltipInfo: `Delete ${project.title}`,
            action: () => {
              setConfirmationModalBasicState({
                isModalOpen: true,
                modalTitle: `Delete ${project.title}`,
                modalSubtitle: `Are you sure you want to delete ${project.title}?`,
                saveButtonText: "Yes, delete",
                cancelButtonText: "I've changed my mind",
                saveButtonFunction: () => {
                  try {
                    toast.loading("Deleting project...", {
                      id: "delete-project",
                    });
                    setIsPending(true);
                    setSaveButtonDisabled(true);
                    mutate(project.id);
                  } catch (e) {
                    throw new Error(getErrorMessage(e));
                  } finally {
                    setIsPending(false);
                    setSaveButtonDisabled(false);
                    setIsModalOpen(false);
                  }
                },
              });
            },
          },
        ],
      })),
    };
    filteredNavMain.splice(3, 0, projectsItem);
    return filteredNavMain;
  }, [data]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <CustomSidebarHeader />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMainContent items={mainContentData} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarFooterContent />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
