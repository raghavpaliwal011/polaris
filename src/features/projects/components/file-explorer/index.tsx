import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronRightIcon, CopyMinusIcon, FilePlus2, FolderPlus, PlusIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Id } from "../../../../../convex/_generated/dataModel"
import { Tree } from "./tree"
import { LoadingRow } from "./loading-row"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { CreateInput } from "./create-input"
import React from "react"
import { useProject } from "../../hooks/use-projects"
import { useCreateFolder,useCreateFile, useFolderContents } from "../../hooks/use-files"
export const FileExplorer = ({ projectId }: { projectId: Id<"projects"> }) => {
    const [isOpen, setIsOpen] = useState(true)
    const project = useProject(projectId)
    const [collapseKey,setCollapseKey] = useState(0)
    const [creating,setCreating] = useState<"file"|"folder"|null>(
        null
    )
    const rootFiles = useFolderContents({
        projectId,
        enabled:isOpen
    })
    const createFile = useCreateFile()
    const createFolder = useCreateFolder()
    const handleCreate = (name:string)=>{
        setCreating(null);
        if(creating==="file"){
            createFile({
                projectId,
                name,
                content:"",
                parentId:undefined
            })
        }else{
            createFolder({
                projectId,
                name,
                parentId: undefined
            })
        }
    }
    return (
        <div className="w-full h-full bg-sidebar">
            <ScrollArea className="h-full">
                <div role="button" onClick={() => { setIsOpen((value) => !value) }} className="group uppercase cursor-pointer w-full text-left flex items-center gap-0.5 h-6 bg-accent font-bold">
                    <ChevronRightIcon className={cn("size-4 shrink-0 text-muted-foreground", isOpen && "rotate-90")} />
                    <p className="text-xs line-clamp-1 font-bold uppercase">
                        {project?.name ?? "Loading..."}
                    </p>
                    <div className="opacity-0 group-hover:opacity-100 transition-none duration-0 flex items-center gap-0.5 ml-auto">
                        <Button onClick={(e)=>{
                            e.stopPropagation();
                            e.preventDefault()
                            setIsOpen(true)
                            setCreating("file")
                        }}
                        variant="highlight"
                        size ="icon-xs">
                            <FilePlus2 className="size-4"/>
                        </Button>
                        <Button onClick={(e)=>{
                            e.stopPropagation();
                            e.preventDefault()
                            setIsOpen(true)
                            setCreating("folder")
                        }}
                        variant="highlight"
                        size ="icon-xs">
                            <FolderPlus className="size-4"/>
                        </Button>
                        <Button onClick={(e)=>{
                            e.stopPropagation();
                            e.preventDefault()
                            setCollapseKey((prev)=>prev+1)
                            setIsOpen(false)
                        }}
                        variant="highlight"
                        size ="icon-xs">
                            <CopyMinusIcon className="size-4"/>
                        </Button>
                    </div>
                </div>
                {isOpen &&(
                    <>
                    {rootFiles === undefined && <LoadingRow level={0}/>}
                        {creating &&(
                            <CreateInput
                            type={creating}
                            level={0}
                            onSubmit={handleCreate}
                            onCancel={()=>setCreating(null)}/>
                        )}
                        {rootFiles?.map((item)=>(
                            <Tree key={`${item._id}-${collapseKey}`} item = {item} level={0} projectId={projectId}/>
                        ))}
                    </>
                )}
            </ScrollArea>
        </div>
    )
}
