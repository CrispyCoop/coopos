import { useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import toast from 'react-hot-toast'

export function BrandingSettings() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'].includes(file.type)) {
      toast.error('Only PNG, JPG, SVG, or WebP allowed')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File must be under 2 MB')
      return
    }

    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `brand/logo.${ext}`
      const { error } = await supabase.storage.from('assets').upload(path, file, { upsert: true })
      if (error) throw error

      const { data } = supabase.storage.from('assets').getPublicUrl(path)
      setLogoUrl(data.publicUrl + '?t=' + Date.now())
      toast.success('Logo uploaded')
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card title="Branding">
      <Alert
        type="info"
        message="Logo is stored in Supabase Storage (assets bucket). The public URL can be used in printed reports and the dashboard header."
        className="mb-6"
      />
      <div className="flex items-start gap-6">
        <div className="w-32 h-32 bg-surface border border-border rounded-xl flex items-center justify-center overflow-hidden shrink-0">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="object-contain w-full h-full" />
          ) : (
            <span className="font-display text-2xl text-muted">LOGO</span>
          )}
        </div>
        <div className="space-y-3">
          <p className="font-body text-sm text-dark font-medium">Restaurant Logo</p>
          <p className="font-body text-xs text-muted">PNG, JPG, SVG, or WebP — max 2 MB. Recommended: 512×512 px.</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            size="sm"
            loading={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {logoUrl ? 'Replace Logo' : 'Upload Logo'}
          </Button>
        </div>
      </div>
    </Card>
  )
}
