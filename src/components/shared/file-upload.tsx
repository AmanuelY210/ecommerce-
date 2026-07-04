'use client'
import { useRef, useState } from 'react'
import { Upload, FileText, X, Loader2, CheckCircle2, ImageIcon, FileWarning } from 'lucide-react'
import { toast } from 'sonner'

interface FileUploadProps {
  label: string
  description?: string
  value: string // current URL
  onChange: (url: string, fileInfo?: { name: string; size: number; type: string }) => void
  accept?: string // e.g., 'image/*,.pdf'
  maxSize?: number // in bytes, default 5MB
  required?: boolean
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
const ACCEPTED_EXT = ['.jpg', '.jpeg', '.png', '.pdf']

export function FileUpload({ 
  label, 
  description, 
  value, 
  onChange, 
  accept = '.jpg,.jpeg,.png,.pdf',
  maxSize = 5 * 1024 * 1024,
  required = false 
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState(0)
  const [fileType, setFileType] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (file: File) => {
    setError('')
    
    // Validate file type
    const ext = '.' + (file.name.split('.').pop() || '').toLowerCase()
    if (!ACCEPTED_TYPES.includes(file.type) || !ACCEPTED_EXT.includes(ext)) {
      const msg = 'Invalid file type. Only JPG, PNG, and PDF files are allowed.'
      setError(msg)
      toast.error(msg)
      return
    }

    // Validate file size
    if (file.size > maxSize) {
      const msg = `File too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`
      setError(msg)
      toast.error(msg)
      return
    }

    if (file.size === 0) {
      const msg = 'File is empty. Please select a valid file.'
      setError(msg)
      toast.error(msg)
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        const msg = data.error || 'Upload failed'
        setError(msg)
        toast.error(msg)
        return
      }

      setFileName(data.fileName || file.name)
      setFileSize(data.size || file.size)
      setFileType(data.type || file.type)
      onChange(data.url, { name: data.fileName || file.name, size: data.size || file.size, type: data.type || file.type })
      toast.success(`${file.name} uploaded successfully`)
    } catch (e: any) {
      const msg = 'Upload failed: ' + (e.message || 'Network error')
      setError(msg)
      toast.error(msg)
    } finally {
      setUploading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    // Reset input so same file can be re-selected
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleRemove = () => {
    onChange('')
    setFileName('')
    setFileSize(0)
    setFileType('')
    setError('')
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`
  }

  const isPdf = fileType === 'application/pdf' || (value && value.toLowerCase().endsWith('.pdf'))
  const isImage = fileType.startsWith('image/') || (value && /\.(jpg|jpeg|png)$/i.test(value))

  return (
    <div>
      <Label2 label={label} required={required} />
      {description && <p className="text-xs text-slate-500 mb-1">{description}</p>}
      
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />

      {value ? (
        <div className="border-2 border-emerald-200 bg-emerald-50 rounded-lg p-3">
          <div className="flex items-start gap-3">
            {/* Preview */}
            <div className="w-16 h-16 rounded border overflow-hidden bg-white shrink-0 flex items-center justify-center">
              {isPdf ? (
                <FileText className="w-8 h-8 text-red-500" />
              ) : isImage ? (
                <img src={value} alt={fileName || 'preview'} className="w-full h-full object-cover" />
              ) : (
                <FileText className="w-8 h-8 text-slate-400" />
              )}
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 mb-0.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-sm font-medium truncate">{fileName || 'Uploaded file'}</span>
              </div>
              <div className="text-xs text-slate-500">
                {formatSize(fileSize)} · {isPdf ? 'PDF' : 'Image'}
              </div>
              <button
                className="text-xs text-red-500 hover:text-red-700 hover:underline mt-1 flex items-center gap-1"
                onClick={handleRemove}
                type="button"
              >
                <X className="w-3 h-3" /> Remove
              </button>
            </div>
          </div>
        </div>
      ) : error ? (
        <div
          className="border-2 border-dashed border-red-300 bg-red-50 rounded-lg p-4 text-center cursor-pointer"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <FileWarning className="w-6 h-6 mx-auto text-red-400 mb-1" />
          <p className="text-xs text-red-600 mb-1">{error}</p>
          <p className="text-xs text-slate-500">Click to try again or drag & drop a file here</p>
        </div>
      ) : uploading ? (
        <div className="border-2 border-dashed border-amz-orange bg-orange-50 rounded-lg p-4 text-center">
          <Loader2 className="w-6 h-6 mx-auto text-amz-orange mb-1 animate-spin" />
          <p className="text-xs text-slate-600">Uploading...</p>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${dragOver ? 'border-amz-orange bg-orange-50' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <Upload className="w-6 h-6 mx-auto text-slate-400 mb-1" />
          <p className="text-xs text-slate-600 mb-0.5">
            <span className="amz-link font-medium">Click to upload</span> or drag & drop
          </p>
          <p className="text-[10px] text-slate-400">JPG, PNG, or PDF · max 5MB</p>
        </div>
      )}
    </div>
  )
}

function Label2({ label, required }: { label: string; required?: boolean }) {
  return (
    <label className="text-sm font-medium mb-1 block">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
  )
}
