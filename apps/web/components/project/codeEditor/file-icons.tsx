import React from 'react'
import {
    FileJson,
    FileText,
    FileType,
    FileCode,
    FileImage,
    FileVideo,
    FileAudio,
    FileCog,
    FileArchive,
    FileSpreadsheet,
    FileTerminal,
} from 'lucide-react'

const fileIcons = {
    // Config files
    'package.json': { icon: FileJson, color: 'text-orange-400' },
    'tsconfig.json': { icon: FileJson, color: 'text-blue-400' },
    '.env': { icon: FileCog, color: 'text-green-400' },

    // Source files
    '.ts': { icon: FileCode, color: 'text-blue-400' },
    '.tsx': { icon: FileCode, color: 'text-blue-400' },
    '.js': { icon: FileCode, color: 'text-yellow-400' },
    '.jsx': { icon: FileCode, color: 'text-yellow-400' },
    '.css': { icon: FileCode, color: 'text-blue-400' },
    '.scss': { icon: FileCode, color: 'text-pink-400' },
    '.html': { icon: FileCode, color: 'text-orange-400' },

    // Document files
    '.md': { icon: FileText, color: 'text-neutral-400' },
    '.txt': { icon: FileText, color: 'text-neutral-400' },
    '.doc': { icon: FileText, color: 'text-blue-400' },
    '.pdf': { icon: FileText, color: 'text-red-400' },

    // Media files
    '.jpg': { icon: FileImage, color: 'text-purple-400' },
    '.jpeg': { icon: FileImage, color: 'text-purple-400' },
    '.png': { icon: FileImage, color: 'text-purple-400' },
    '.gif': { icon: FileImage, color: 'text-purple-400' },
    '.svg': { icon: FileImage, color: 'text-orange-400' },
    '.mp4': { icon: FileVideo, color: 'text-pink-400' },
    '.mp3': { icon: FileAudio, color: 'text-green-400' },

    // Archive files
    '.zip': { icon: FileArchive, color: 'text-yellow-400' },
    '.rar': { icon: FileArchive, color: 'text-yellow-400' },
    '.7z': { icon: FileArchive, color: 'text-yellow-400' },

    // Other files
    '.csv': { icon: FileSpreadsheet, color: 'text-green-400' },
    '.sh': { icon: FileTerminal, color: 'text-neutral-400' },
}

export function getFileIcon(filename: string) {
    if (fileIcons[filename as keyof typeof fileIcons]) {
        const { icon: Icon, color } = fileIcons[filename as keyof typeof fileIcons]
        return <Icon className={`h-4 w-4 shrink-0 ${color}`} />
    }
    const extension = `.${filename.split('.').pop()?.toLowerCase() || ''}`

    if (fileIcons[extension as keyof typeof fileIcons]) {
        const { icon: Icon, color } = fileIcons[extension as keyof typeof fileIcons]
        return <Icon className={`h-4 w-4 shrink-0 ${color}`} />
    }
    return <FileType className="h-4 w-4 shrink-0 text-neutral-400" />

} 