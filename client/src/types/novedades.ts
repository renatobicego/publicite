// EditorJS block types
export interface EditorJSBlock {
  id: string
  type: "header" | "paragraph" | "image" | "list" | "quote" | "linkTool"
  data: string // Stringify JSON data from backend
}

export interface EditorJSData {
  time?: number
  blocks: EditorJSBlock[]
  version?: string
}

// Parsed data interfaces
export interface HeaderData {
  text: string
  level: number
}

export interface ParagraphData {
  text: string
}

export interface ImageData {
  file: {
    url: string
  }
  caption?: string
  withBorder?: boolean
  stretched?: boolean
  withBackground?: boolean
}

// Novedad (announcement) interface
export interface Novedad {
  id: string
  createdAt: string
  updatedAt: string
  content: {
    blocks: EditorJSBlock[]
  }
}

// Mock user interface for role checking
export interface LoggedUser {
  id: string
  email: string
  sessionClaims?: {
    metadata?: {
      role?: "admin" | "user"
    }
  }
}
