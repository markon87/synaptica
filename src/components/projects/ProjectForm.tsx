"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface ProjectFormProps {
  onSubmit: (data: { name: string; description: string }) => Promise<void>
  isLoading?: boolean
  initialData?: {
    name?: string
    description?: string
  }
  submitLabel?: string
}

export function ProjectForm({ 
  onSubmit, 
  isLoading = false, 
  initialData = {}, 
  submitLabel = "Create Project" 
}: ProjectFormProps) {
  const [name, setName] = useState(initialData.name || "")
  const [description, setDescription] = useState(initialData.description || "")
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({})

  const validateForm = () => {
    const newErrors: { name?: string; description?: string } = {}
    
    if (!name.trim()) {
      newErrors.name = "Project name is required"
    } else if (name.trim().length < 3) {
      newErrors.name = "Project name must be at least 3 characters"
    } else if (name.trim().length > 100) {
      newErrors.name = "Project name must be less than 100 characters"
    }
    
    if (description && description.length > 500) {
      newErrors.description = "Description must be less than 500 characters"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || "",
      })
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Project Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your research project (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              rows={3}
              className={errors.description ? "border-destructive" : ""}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {description.length}/500 characters
            </p>
          </div>
          
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Creating..." : submitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}