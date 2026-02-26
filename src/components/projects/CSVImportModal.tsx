"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from "@/components/ui/dialog"
import { useAuth } from "@/components/providers/AuthProvider"
import { savePaperToProject } from "@/lib/supabase/papers"
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react"

interface CSVImportModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  onImportComplete: () => void
}

interface PubMedCSVRow {
  Title: string
  Authors: string
  Citation: string
  "First Author": string
  Journal: string
  "Publication Year": string
  "Create Date": string
  PMID: string
  PMCID?: string
  DOI?: string
  Abstract?: string
}

interface ImportResult {
  success: number
  failed: number
  errors: string[]
  duplicates: number
}

export function CSVImportModal({ isOpen, onClose, projectId, onImportComplete }: CSVImportModalProps) {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [progress, setProgress] = useState({ current: 0, total: 0 })

  const parseCSV = (csvText: string): PubMedCSVRow[] => {
    const lines = csvText.split('\n').filter(line => line.trim())
    if (lines.length < 2) return []

    // Parse CSV with proper quote handling
    const parseCSVLine = (line: string): string[] => {
      const result = []
      let current = ''
      let inQuotes = false
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        const nextChar = line[i + 1]
        
        if (char === '"') {
          if (inQuotes && nextChar === '"') {
            // Escaped quote
            current += '"'
            i++ // Skip next quote
          } else {
            // Toggle quote state
            inQuotes = !inQuotes
          }
        } else if (char === ',' && !inQuotes) {
          // End of field
          result.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      
      // Add the last field
      result.push(current.trim())
      return result
    }

    const headers = parseCSVLine(lines[0]).map(h => h.replace(/"/g, '').trim())
    const rows: PubMedCSVRow[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i])
      const row: any = {}
      
      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })
      
      // Only add rows with required fields (Title and PMID)
      if (row.Title && (row.PMID || row['PMID'])) {
        // Normalize PMID field name variations
        if (!row.PMID && row['PMID']) {
          row.PMID = row['PMID']
        }
        rows.push(row as PubMedCSVRow)
      }
    }

    return rows
  }

  const processCSVImport = async (csvData: PubMedCSVRow[]): Promise<ImportResult> => {
    const result: ImportResult = {
      success: 0,
      failed: 0,
      errors: [],
      duplicates: 0
    }

    if (!user) {
      result.errors.push("User not authenticated")
      return result
    }

    // Initialize progress
    setProgress({ current: 0, total: csvData.length })

    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i]
      
      // Update progress
      setProgress({ current: i + 1, total: csvData.length })
      
      try {
        // Parse authors - handle multiple formats from PubMed
        let authors: string[] = []
        if (row.Authors) {
          // PubMed formats: "LastName FM, LastName FM" or "LastName, FirstName; LastName, FirstName"
          authors = row.Authors
            .split(/[;,]/)
            .map(a => a.trim())
            .filter(a => a.length > 0)
            .slice(0, 10) // Limit to first 10 authors
        }
        
        // If no authors in Authors field, try First Author field
        if (authors.length === 0 && row["First Author"]) {
          authors = [row["First Author"].trim()]
        }

        // Extract journal from citation if not in separate field
        let journal = row.Journal || ''
        if (!journal && row.Citation) {
          // Multiple citation formats from PubMed
          const journalPatterns = [
            /^([^.]+)\./,  // "Journal. Year;Volume(Issue):Pages"
            /^(.+?)\s+\d{4}/,  // "Journal Year;Volume"
            /^([^;]+);/,   // "Journal;Year"
          ]
          
          for (const pattern of journalPatterns) {
            const match = row.Citation.match(pattern)
            if (match) {
              journal = match[1].trim()
              break
            }
          }
        }

        // Format publication date - handle multiple date formats
        let pubDate = row["Publication Year"] || row["Create Date"] || ''
        if (pubDate) {
          // Extract just the year if it's a full date
          const yearMatch = pubDate.match(/(\d{4})/)
          if (yearMatch) {
            pubDate = yearMatch[1]
          }
        }

        // Clean and validate PMID
        const pmid = row.PMID.replace(/\D/g, '') // Remove non-digits
        if (!pmid) {
          result.failed++
          result.errors.push(`Invalid PMID for paper: ${row.Title.slice(0, 50)}...`)
          continue
        }

        const paperData = {
          pmid: pmid,
          title: row.Title.trim(),
          authors: authors,
          journal: journal.trim(),
          pubDate: pubDate,  // Changed from pub_date to pubDate to match PaperData interface
          abstract: (row.Abstract || '').trim()
        }

        await savePaperToProject(projectId, paperData, user.id)  // Fixed parameter order
        result.success++
      } catch (error: any) {
        result.failed++
        if (error.message?.includes('duplicate') || error.message?.includes('already exists')) {
          result.duplicates++
          result.errors.push(`Duplicate paper (PMID: ${row.PMID}): ${row.Title.slice(0, 50)}...`)
        } else {
          result.errors.push(`Failed to import ${row.PMID}: ${error.message}`)
        }
      }
    }

    return result
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'text/csv') {
      setSelectedFile(file)
      setImportResult(null)
    } else {
      alert('Please select a valid CSV file')
    }
  }

  const handleImport = async () => {
    if (!selectedFile || !user) return

    setIsProcessing(true)
    setImportResult(null)

    try {
      const csvText = await selectedFile.text()
      const csvData = parseCSV(csvText)
      
      if (csvData.length === 0) {
        setImportResult({
          success: 0,
          failed: 1,
          errors: ['No valid data found in CSV file'],
          duplicates: 0
        })
        return
      }

      const result = await processCSVImport(csvData)
      setImportResult(result)
      
      if (result.success > 0) {
        onImportComplete()
      }
    } catch (error: any) {
      setImportResult({
        success: 0,
        failed: 1,
        errors: [`Error processing file: ${error.message}`],
        duplicates: 0
      })
    } finally {
      setIsProcessing(false)
      setProgress({ current: 0, total: 0 }) // Reset progress
    }
  }

  const handleClose = () => {
    setSelectedFile(null)
    setImportResult(null)
    setProgress({ current: 0, total: 0 })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Papers from CSV
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file exported from PubMed to bulk import papers into this project.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Instructions */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              How to export from PubMed:
            </h4>
            <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
              <li>Perform your search on <strong>PubMed.ncbi.nlm.nih.gov</strong></li>
              <li>Use filters and advanced search for precise results</li>
              <li>Click <strong>"Save"</strong> and select <strong>"CSV Format"</strong></li>
              <li>Include fields: <em>Title, Authors, Citation, PMID, Abstract</em></li>
              <li>Download and upload the CSV file here</li>
            </ol>
            <p className="text-xs text-blue-700 mt-2 italic">
              ✨ This allows you to use PubMed's advanced search features and import hundreds of papers at once!
            </p>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="csv-file">Select CSV File</Label>
            <div className="flex items-center gap-2">
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleFileSelect}
                disabled={isProcessing}
              />
            </div>
            {selectedFile && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          {/* Processing State */}
          {isProcessing && (
            <div className="space-y-3 bg-blue-50 p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">
                    Importing papers...
                  </p>
                  <p className="text-xs text-blue-700">
                    Processing {progress.current} of {progress.total} papers
                  </p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
                />
              </div>
              
              <p className="text-xs text-blue-600 italic">
                Please keep this dialog open while importing...
              </p>
            </div>
          )}

          {/* Import Results */}
          {importResult && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                {importResult.success > 0 && (
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    {importResult.success} imported
                  </span>
                )}
                {importResult.duplicates > 0 && (
                  <span className="flex items-center gap-1 text-yellow-600">
                    <AlertCircle className="h-4 w-4" />
                    {importResult.duplicates} duplicates
                  </span>
                )}
                {importResult.failed > 0 && (
                  <span className="flex items-center gap-1 text-red-600">
                    <XCircle className="h-4 w-4" />
                    {importResult.failed} failed
                  </span>
                )}
              </div>
              
              {importResult.errors.length > 0 && (
                <div className="bg-red-50 p-2 rounded text-xs">
                  <p className="font-medium text-red-900 mb-1">Errors:</p>
                  <ul className="text-red-800 space-y-1">
                    {importResult.errors.slice(0, 5).map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                    {importResult.errors.length > 5 && (
                      <li>• ... and {importResult.errors.length - 5} more</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
            {isProcessing ? "Processing..." : "Close"}
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={!selectedFile || isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Import Papers"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}