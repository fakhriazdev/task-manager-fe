"use client"

import * as React from "react"
import { useNavStore } from "@/lib/stores/useNavStore"
import { AddOrEditProjectDialog } from "./AddOrEditProjectDialog"

export function NavDialog() {
    const { open,currentProject } = useNavStore()
    if (!open) return null

    return (
        <>
            {currentProject && (<AddOrEditProjectDialog open={true} title={`Edit Project ${currentProject.name}`} />)}
            {open === "project" && (<AddOrEditProjectDialog open={true} title={"Add Project"} />)}
        </>
    )
}
